const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const MONGO_URL = process.env.MONGO_URL;
const JWT_SECRET = process.env.JWT_SECRET;
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET;
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'rahasia123';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

mongoose.connect(MONGO_URL)
    .then(() => console.log('✅ Terhubung ke MongoDB Atlas'))
    .catch(err => console.error('❌ Gagal konek MongoDB:', err));

const eventSchema = new mongoose.Schema({
    judul: String, 
    tanggal: String, 
    gambar: String, 
    link_dokumen: String, 
    deskripsi: String, 
    dibuat_pada: { type: Date, default: Date.now }
});
const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

const archiveSchema = new mongoose.Schema({
    judul: String, 
    gambar: String, 
    dibuat_pada: { type: Date, default: Date.now }
});
const Archive = mongoose.models.Archive || mongoose.model('Archive', archiveSchema);

const satpamJWT = (req, res, next) => {
    const headerAuth = req.headers['authorization'];
    const token = headerAuth && headerAuth.split(' ')[1];
    if (!token) return res.status(403).json({ message: "Akses Ditolak! Tiket tidak ada." });
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Sesi habis atau tiket palsu." });
        req.user = user;
        next();
    });
};

app.post('/api/login', async (req, res) => {
    const { username, password, captcha } = req.body;
    try {
        const cfResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `secret=${TURNSTILE_SECRET}&response=${captcha}`
        });
        const cfData = await cfResponse.json();
        if (!cfData.success) return res.status(400).json({ message: "Robot terdeteksi!" });
    } catch (err) { 
        return res.status(500).json({ message: "Gagal memverifikasi keamanan." }); 
    }

    if (username === ADMIN_USER && password === ADMIN_PASS) {
        const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: "Login Berhasil", token: token });
    } else { 
        res.status(401).json({ message: "Username atau Password salah!" }); 
    }
});

app.post('/api/upload-event', satpamJWT, async (req, res) => {
    try {
        const eventBaru = new Event({
            judul: req.body.judul,
            tanggal: req.body.tanggal,
            gambar: req.body.gambar,
            link_dokumen: req.body.link_dokumen,
            deskripsi: req.body.deskripsi
        });
        await eventBaru.save();
        res.status(201).json({ message: "Event berhasil disimpan!" });
    } catch (err) { 
        console.error(err);
        res.status(500).json({ message: "Gagal menyimpan event." }); 
    }
});

app.post('/api/upload-archive', satpamJWT, async (req, res) => {
    try {
        const archiveBaru = new Archive({
            judul: req.body.judul,
            gambar: req.body.gambar
        });
        await archiveBaru.save();
        res.status(201).json({ message: "Archive berhasil disimpan!" });
    } catch (err) { 
        console.error(err);
        res.status(500).json({ message: "Gagal menyimpan archive." }); 
    }
});

// ==========================================
// FITUR PELAYAN (GET) BUAT TAMPIL DI WEB DEPAN
// ==========================================
app.get('/api/events', async (req, res) => {
    try {
        const events = await Event.find().sort({ dibuat_pada: -1 });
        res.json(events);
    } catch (err) { 
        res.status(500).json({ message: "Gagal mengambil data event." }); 
    }
});

app.get('/api/archives', async (req, res) => {
    try {
        const archives = await Archive.find().sort({ dibuat_pada: -1 });
        res.json(archives);
    } catch (err) { 
        res.status(500).json({ message: "Gagal mengambil data archive." }); 
    }
});

// EXPORT BUAT VERCEL (Pengganti app.listen)
module.exports = app;
