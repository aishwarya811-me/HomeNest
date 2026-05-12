const db = require('../config/database');
const path = require('path');
const fs = require('fs');

// ── Helpers ───────────────────────────────────────────────
const paginate = (page, limit) => {
    const p = Math.max(1, parseInt(page) || 1);
    const l = Math.min(50, Math.max(1, parseInt(limit) || 12));
    return { page: p, limit: l, offset: (p - 1) * l };
};

const makePaginationMeta = (total, page, limit) => ({
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
});

const buildPropertyDetails = async (property) => {
    const [images, rules, amenities] = await Promise.all([
        db.allAsync('SELECT * FROM property_images WHERE property_id=?', [property.id]),
        db.allAsync('SELECT * FROM property_rules WHERE property_id=?', [property.id]),
        db.allAsync('SELECT name FROM amenities WHERE property_id=?', [property.id]),
    ]);
    return {
        ...property,
        images,
        rules,
        amenities: amenities.map(a => a.name),
    };
};

// ── GET /api/properties ───────────────────────────────────
const getProperties = async (req, res) => {
    try {
        const {
            city, state, min_rent, max_rent,
            bedrooms, property_type, furnished,
            bachelor_friendly, pet_friendly, near_metro,
            page, limit
        } = req.query;

        const { page: p, limit: l, offset } = paginate(page, limit);

        let where = ['p.available = 1'];
        let params = [];

        if (city) { where.push('LOWER(p.city) LIKE LOWER(?)'); params.push(`%${city}%`); }
        if (state) { where.push('LOWER(p.state) LIKE LOWER(?)'); params.push(`%${state}%`); }
        if (min_rent) { where.push('p.rent >= ?'); params.push(+min_rent); }
        if (max_rent) { where.push('p.rent <= ?'); params.push(+max_rent); }
        if (bedrooms) { where.push('p.bedrooms = ?'); params.push(+bedrooms); }
        if (property_type) { where.push('p.property_type = ?'); params.push(property_type); }
        if (furnished) { where.push('p.furnished = ?'); params.push(furnished); }
        if (bachelor_friendly) { where.push('p.bachelor_friendly = 1'); }
        if (pet_friendly) { where.push('p.pet_friendly = 1'); }
        if (near_metro) { where.push('p.near_metro = 1'); }

        const whereClause = where.join(' AND ');

        const baseSelect = `
      FROM properties p
      JOIN users u ON p.owner_id = u.id
      WHERE ${whereClause}
    `;

        // Run count + data queries in parallel
        const [countRow, rows] = await Promise.all([
            db.getAsync(`SELECT COUNT(*) as total ${baseSelect}`, params),
            db.allAsync(`
        SELECT p.*, u.name as owner_name,
          (SELECT filename FROM property_images WHERE property_id=p.id AND is_primary=1 LIMIT 1) as primary_image
        ${baseSelect}
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
      `, [...params, l, offset]),
        ]);

        // Attach images array to each property
        const properties = await Promise.all(rows.map(async row => {
            const images = await db.allAsync(
                'SELECT * FROM property_images WHERE property_id=? ORDER BY is_primary DESC',
                [row.id]
            );
            return { ...row, images };
        }));

        res.json({
            properties,
            pagination: makePaginationMeta(countRow.total, p, l),
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── GET /api/properties/:id ───────────────────────────────
const getProperty = async (req, res) => {
    try {
        const row = await db.getAsync(`
      SELECT p.*, u.name as owner_name, u.email as owner_email, u.phone as owner_phone
      FROM properties p JOIN users u ON p.owner_id=u.id
      WHERE p.id=?
    `, [req.params.id]);
        if (!row) return res.status(404).json({ error: 'Property not found' });
        res.json(await buildPropertyDetails(row));
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── GET /api/properties/owner/mine ───────────────────────
const getOwnerProperties = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const { page: p, limit: l, offset } = paginate(page, limit);

        const [countRow, rows] = await Promise.all([
            db.getAsync('SELECT COUNT(*) as total FROM properties WHERE owner_id=?', [req.user.id]),
            db.allAsync(`
        SELECT p.*,
          (SELECT COUNT(*) FROM contact_requests WHERE property_id=p.id AND is_read=0) as unread_contacts,
          (SELECT COUNT(*) FROM contact_requests WHERE property_id=p.id) as total_contacts,
          (SELECT ROUND(AVG(rating),1) FROM reviews WHERE property_id=p.id) as avg_rating,
          (SELECT COUNT(*) FROM reviews WHERE property_id=p.id) as review_count
        FROM properties p
        WHERE p.owner_id=?
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
      `, [req.user.id, l, offset]),
        ]);

        const properties = await Promise.all(rows.map(async row => {
            const images = await db.allAsync(
                'SELECT * FROM property_images WHERE property_id=? ORDER BY is_primary DESC',
                [row.id]
            );
            return { ...row, images };
        }));

        res.json({
            properties,
            pagination: makePaginationMeta(countRow.total, p, l),
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── POST /api/properties ──────────────────────────────────
const createProperty = async (req, res) => {
    try {
        const {
            title, description, city, state, address, rent, security_deposit,
            bedrooms, bathrooms, area_sqft, property_type, furnished,
            floor, total_floors, parking, available_from,
            bachelor_friendly, pet_friendly, near_metro,
            rules = [], amenities = []
        } = req.body;

        if (!title || !city || !state || !rent || !bedrooms || !bathrooms)
            return res.status(400).json({ error: 'Missing required fields' });

        const result = await db.runAsync(`
      INSERT INTO properties (
        owner_id, title, description, city, state, address, rent, security_deposit,
        bedrooms, bathrooms, area_sqft, property_type, furnished,
        floor, total_floors, parking, available_from,
        bachelor_friendly, pet_friendly, near_metro
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `, [
            req.user.id, title, description, city, state, address,
            +rent, +(security_deposit || 0), +bedrooms, +bathrooms,
            area_sqft ? +area_sqft : null, property_type || 'apartment',
            furnished || 'unfurnished', floor ? +floor : null,
            total_floors ? +total_floors : null, +(parking || 0),
            available_from || null,
            bachelor_friendly ? 1 : 0, pet_friendly ? 1 : 0, near_metro ? 1 : 0
        ]);

        const propertyId = result.lastInsertRowid;

        if (rules.length) {
            await Promise.all(rules.map(r =>
                db.runAsync('INSERT INTO property_rules (property_id,rule_text,rule_type) VALUES (?,?,?)',
                    [propertyId, r.text, r.type || 'general'])
            ));
        }
        if (amenities.length) {
            await Promise.all(amenities.map(a =>
                db.runAsync('INSERT INTO amenities (property_id,name) VALUES (?,?)', [propertyId, a])
            ));
        }

        res.status(201).json({ id: propertyId, message: 'Property created!' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── PUT /api/properties/:id ───────────────────────────────
const updateProperty = async (req, res) => {
    try {
        const prop = await db.getAsync('SELECT * FROM properties WHERE id=?', [req.params.id]);
        if (!prop) return res.status(404).json({ error: 'Not found' });
        if (prop.owner_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

        const {
            title, description, city, state, address, rent, security_deposit,
            bedrooms, bathrooms, area_sqft, property_type, furnished,
            floor, total_floors, parking, available_from, available,
            bachelor_friendly, pet_friendly, near_metro,
            rules = [], amenities = []
        } = req.body;

        await db.runAsync(`
      UPDATE properties SET
        title=?, description=?, city=?, state=?, address=?, rent=?,
        security_deposit=?, bedrooms=?, bathrooms=?, area_sqft=?,
        property_type=?, furnished=?, floor=?, total_floors=?,
        parking=?, available_from=?, available=?,
        bachelor_friendly=?, pet_friendly=?, near_metro=?
      WHERE id=?
    `, [
            title, description, city, state, address, +rent,
            +(security_deposit || 0), +bedrooms, +bathrooms,
            area_sqft ? +area_sqft : null, property_type, furnished,
            floor ? +floor : null, total_floors ? +total_floors : null,
            +(parking || 0), available_from || null,
            available !== undefined ? (available ? 1 : 0) : prop.available,
            bachelor_friendly ? 1 : 0, pet_friendly ? 1 : 0, near_metro ? 1 : 0,
            req.params.id
        ]);

        await db.runAsync('DELETE FROM property_rules WHERE property_id=?', [req.params.id]);
        await db.runAsync('DELETE FROM amenities WHERE property_id=?', [req.params.id]);

        if (rules.length) {
            await Promise.all(rules.map(r =>
                db.runAsync('INSERT INTO property_rules (property_id,rule_text,rule_type) VALUES (?,?,?)',
                    [req.params.id, r.text, r.type || 'general'])
            ));
        }
        if (amenities.length) {
            await Promise.all(amenities.map(a =>
                db.runAsync('INSERT INTO amenities (property_id,name) VALUES (?,?)', [req.params.id, a])
            ));
        }

        res.json({ message: 'Property updated!' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── DELETE /api/properties/:id ────────────────────────────
const deleteProperty = async (req, res) => {
    try {
        const prop = await db.getAsync('SELECT * FROM properties WHERE id=?', [req.params.id]);
        if (!prop) return res.status(404).json({ error: 'Not found' });
        if (prop.owner_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

        // Delete uploaded images from disk
        const images = await db.allAsync('SELECT filename FROM property_images WHERE property_id=?', [req.params.id]);
        images.forEach(img => {
            const filePath = path.resolve('./uploads', img.filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });

        await db.runAsync('DELETE FROM properties WHERE id=?', [req.params.id]);
        res.json({ message: 'Property deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Image upload ──────────────────────────────────────────
const uploadImages = async (req, res) => {
    try {
        if (!req.files?.length) return res.status(400).json({ error: 'No files uploaded' });
        const prop = await db.getAsync('SELECT * FROM properties WHERE id=?', [req.params.id]);
        if (!prop) return res.status(404).json({ error: 'Property not found' });
        if (prop.owner_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

        const existing = await db.getAsync('SELECT COUNT(*) as count FROM property_images WHERE property_id=?', [req.params.id]);
        if (existing.count + req.files.length > 10)
            return res.status(400).json({ error: 'Maximum 10 images allowed per property' });

        const hasPrimary = await db.getAsync('SELECT id FROM property_images WHERE property_id=? AND is_primary=1', [req.params.id]);
        const inserted = await Promise.all(req.files.map((file, i) =>
            db.runAsync('INSERT INTO property_images (property_id,filename,is_primary) VALUES (?,?,?)',
                [req.params.id, file.filename, !hasPrimary && i === 0 ? 1 : 0])
                .then(r => ({ id: r.lastInsertRowid, filename: file.filename, is_primary: !hasPrimary && i === 0 ? 1 : 0 }))
        ));

        res.json(inserted);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Delete image ──────────────────────────────────────────
const deleteImage = async (req, res) => {
    try {
        const img = await db.getAsync('SELECT * FROM property_images WHERE id=?', [req.params.imageId]);
        if (!img) return res.status(404).json({ error: 'Image not found' });
        const prop = await db.getAsync('SELECT owner_id FROM properties WHERE id=?', [req.params.id]);
        if (prop.owner_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

        const filePath = path.resolve('./uploads', img.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        await db.runAsync('DELETE FROM property_images WHERE id=?', [img.id]);

        // If deleted image was primary, assign next image as primary
        if (img.is_primary) {
            const next = await db.getAsync('SELECT id FROM property_images WHERE property_id=?', [req.params.id]);
            if (next) await db.runAsync('UPDATE property_images SET is_primary=1 WHERE id=?', [next.id]);
        }
        res.json({ message: 'Image deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Bookmarks ─────────────────────────────────────────────
const toggleBookmark = async (req, res) => {
    try {
        const existing = await db.getAsync(
            'SELECT id FROM bookmarks WHERE renter_id=? AND property_id=?',
            [req.user.id, req.params.id]
        );
        if (existing) {
            await db.runAsync('DELETE FROM bookmarks WHERE id=?', [existing.id]);
            return res.json({ bookmarked: false });
        }
        await db.runAsync('INSERT INTO bookmarks (renter_id,property_id) VALUES (?,?)', [req.user.id, req.params.id]);
        res.json({ bookmarked: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const getBookmarks = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const { page: p, limit: l, offset } = paginate(page, limit);

        const [countRow, rows] = await Promise.all([
            db.getAsync('SELECT COUNT(*) as total FROM bookmarks WHERE renter_id=?', [req.user.id]),
            db.allAsync(`
        SELECT p.*, u.name as owner_name,
          b.created_at as bookmarked_at
        FROM bookmarks b
        JOIN properties p ON b.property_id=p.id
        JOIN users u ON p.owner_id=u.id
        WHERE b.renter_id=?
        ORDER BY b.created_at DESC
        LIMIT ? OFFSET ?
      `, [req.user.id, l, offset]),
        ]);

        const properties = await Promise.all(rows.map(async row => {
            const images = await db.allAsync(
                'SELECT * FROM property_images WHERE property_id=? ORDER BY is_primary DESC',
                [row.id]
            );
            return { ...row, images };
        }));

        res.json({
            properties,
            pagination: makePaginationMeta(countRow.total, p, l),
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Contact requests ──────────────────────────────────────
const contactOwner = async (req, res) => {
    try {
        const prop = await db.getAsync('SELECT owner_id, title FROM properties WHERE id=?', [req.params.id]);
        if (!prop) return res.status(404).json({ error: 'Property not found' });

        await db.runAsync(
            'INSERT INTO contact_requests (renter_id,property_id,message) VALUES (?,?,?)',
            [req.user.id, req.params.id, req.body.message || '']
        );
        await db.runAsync(
            'INSERT INTO notifications (user_id,title,message,type) VALUES (?,?,?,?)',
            [prop.owner_id, 'New Contact Request',
            `${req.user.name} is interested in "${prop.title}"`, 'contact']
        );
        res.json({ message: 'Message sent to owner!' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const getContactRequests = async (req, res) => {
    try {
        const { page, limit, status } = req.query;
        const { page: p, limit: l, offset } = paginate(page, limit);

        const statusFilter = status ? 'AND cr.status=?' : '';
        const statusParams = status ? [status] : [];

        const [countRow, rows] = await Promise.all([
            db.getAsync(`
        SELECT COUNT(*) as total
        FROM contact_requests cr
        JOIN properties prop ON cr.property_id=prop.id
        WHERE prop.owner_id=? ${statusFilter}
      `, [req.user.id, ...statusParams]),
            db.allAsync(`
        SELECT cr.*, u.name as renter_name, u.email as renter_email,
          u.phone as renter_phone, prop.title as property_title
        FROM contact_requests cr
        JOIN users u ON cr.renter_id=u.id
        JOIN properties prop ON cr.property_id=prop.id
        WHERE prop.owner_id=? ${statusFilter}
        ORDER BY cr.created_at DESC
        LIMIT ? OFFSET ?
      `, [req.user.id, ...statusParams, l, offset]),
        ]);

        // Mark all as read
        await db.runAsync(`
      UPDATE contact_requests SET is_read=1
      WHERE property_id IN (SELECT id FROM properties WHERE owner_id=?)
    `, [req.user.id]);

        res.json({
            requests: rows,
            pagination: makePaginationMeta(countRow.total, p, l),
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = {
    getProperties, getProperty, getOwnerProperties,
    createProperty, updateProperty, deleteProperty,
    uploadImages, deleteImage,
    toggleBookmark, getBookmarks,
    contactOwner, getContactRequests,
};