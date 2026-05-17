#!/usr/bin/env node
/**
 * HomeNest — PostgreSQL Migration Runner
 * Applies all .sql files in /database/migrations/ in order.
 *
 * Usage:
 *   node database/migrate.js            # run all pending migrations
 *   node database/migrate.js --seed     # also run seed file
 */

const { Pool } = require('pg');
const fs   = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  host:     process.env.PG_HOST     || 'localhost',
  port:     parseInt(process.env.PG_PORT || '5432', 10),
  database: process.env.PG_DATABASE || 'homenest',
  user:     process.env.PG_USER     || 'postgres',
  password: process.env.PG_PASSWORD || '',
});

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
const INCLUDE_SEED   = process.argv.includes('--seed');

async function run() {
  const client = await pool.connect();

  try {
    // Create tracking table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename    TEXT PRIMARY KEY,
        applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Get list of already-applied migrations
    const { rows: applied } = await client.query(
      'SELECT filename FROM schema_migrations'
    );
    const appliedSet = new Set(applied.map((r) => r.filename));

    // Read all .sql files except seeed unless --seed flag
    let files = fs.readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    if (!INCLUDE_SEED) {
      files = files.filter((f) => !f.includes('seed'));
    }

    let count = 0;
    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`  ⏭  Skipping (already applied): ${file}`);
        continue;
      }

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      console.log(`  ▶  Applying: ${file}`);

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (filename) VALUES ($1)',
          [file]
        );
        await client.query('COMMIT');
        console.log(`  ✅ Applied:  ${file}`);
        count++;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`  ❌ Failed:   ${file}`);
        console.error(`     ${err.message}`);
        process.exit(1);
      }
    }

    if (count === 0) {
      console.log('\n✅ Database is already up to date.\n');
    } else {
      console.log(`\n✅ Applied ${count} migration(s) successfully.\n`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error('Migration runner error:', err.message);
  process.exit(1);
});
