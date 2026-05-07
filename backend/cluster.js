/**
 * cluster.js — HomeNest Load Balancer
 *
 * Uses Node.js built-in `cluster` module to spawn one worker process per CPU
 * core. The OS distributes incoming TCP connections across workers in
 * round-robin, effectively load-balancing requests without external tools.
 *
 * Usage:
 *   node cluster.js        (production)
 *   npm run cluster        (via package.json script)
 */

require('dotenv').config();
const cluster = require('cluster');
const os = require('os');
const path = require('path');

const NUM_WORKERS = parseInt(process.env.NUM_WORKERS, 10) || os.cpus().length;
const PORT = process.env.PORT || 5000;

// ─── Primary / Master Process ──────────────────────────────────────────────
if (cluster.isPrimary) {
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║        🏠  HomeNest Load Balancer — Primary          ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log(`  PID        : ${process.pid}`);
    console.log(`  Port       : ${PORT}`);
    console.log(`  Workers    : ${NUM_WORKERS} (one per CPU core)`);
    console.log('──────────────────────────────────────────────────────');

    // Fork one worker per CPU core
    for (let i = 0; i < NUM_WORKERS; i++) {
        const worker = cluster.fork();
        console.log(`  ✅ Worker ${i + 1} started — PID: ${worker.process.pid}`);
    }

    // Auto-restart crashed workers
    cluster.on('exit', (worker, code, signal) => {
        const reason = signal || `code ${code}`;
        console.warn(`  ⚠️  Worker PID ${worker.process.pid} died (${reason}). Restarting...`);
        const newWorker = cluster.fork();
        console.log(`  ✅ Replacement worker started — PID: ${newWorker.process.pid}`);
    });

    // Graceful shutdown on SIGTERM / SIGINT
    const shutdown = (signal) => {
        console.log(`\n  🛑 ${signal} received — shutting down all workers gracefully...`);
        for (const id in cluster.workers) {
            cluster.workers[id].send('shutdown');
            cluster.workers[id].disconnect();
        }
        setTimeout(() => process.exit(0), 5000);
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

// ─── Worker Processes — each runs the Express app ─────────────────────────
} else {
    // Load the actual Express server
    require(path.join(__dirname, 'server.js'));

    // Handle graceful shutdown message from primary
    process.on('message', (msg) => {
        if (msg === 'shutdown') {
            console.log(`  Worker PID ${process.pid} shutting down...`);
            process.exit(0);
        }
    });
}
