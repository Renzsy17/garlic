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
    judul: String, tanggal: String, gambar: String, link_dokumen: String, deskripsi: String, dibuat_pada: { type: Date, default: Date.now }
});
const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

const archiveSchema = new mongoose.Schema({
    judul: String, gambar: String, dibuat_pada: { type: Date, default: Date.now }
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
            method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `secret=${TURNSTILE_SECRET}&response=${captcha}`
        });
        const cfData = await cfResponse.json();
        if (!cfData.success) return res.status(400).json({ message: "Robot terdeteksi!" });
    } catch (err) { return res.status(500).json({ message: "Gagal memverifikasi keamanan." }); }

    if (username === ADMIN_USER && password === ADMIN_PASS) {
        const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: "Login Berhasil", token: token });
    } else { res.status(401).json({ message: "Username atau Password salah!" }); }
});

app.post('/api/upload-event', satpamJWT, async (req, res) => {
    try {
        const eventBaru = new Event(req.body);
        await eventBaru.save();
        res.status(201).json({ message: "Event berhasil disimpan!" });
    } catch (err) { res.status(500).json({ message: "Gagal menyimpan event." }); }
});

app.post('/api/upload-archive', satpamJWT, async (req, res) => {
    try {
        const archiveBaru = new Archive(req.body);
        await archiveBaru.save();
        res.status(201).json({ message: "Archive berhasil disimpan!" });
    } catch (err) { res.status(500).json({ message: "Gagal menyimpan archive." }); }
});

module.exports = app;// ==========================================
const satpamJWT = (req, res, next) => {
    const headerAuth = req.headers['authorization'];
    const token = headerAuth && headerAuth.split(' ')[1]; // Format: Bearer <token>

    if (!token) return res.status(403).json({ message: "Akses Ditolak! Tiket tidak ada." });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Sesi habis atau tiket palsu. Silakan login lagi." });
        req.user = user;
        next(); // Tiket valid, silakan lewat!
    });
};


// ==========================================
// ROUTE 2: UPLOAD EVENT (DILINDUNGI SATPAM)
// ==========================================
app.post('/upload-event', satpamJWT, async (req, res) => {
    try {
        const eventBaru = new Event({
            judul: req.body.judul,
            tanggal: req.body.tanggal,
            gambar: req.body.gambar,
            link_dokumen: req.body.link_dokumen,
            deskripsi: req.body.deskripsi
        });

        // Simpan ke MongoDB
        await eventBaru.save();
        res.status(201).json({ message: "Data berhasil disimpan ke MongoDB!" });
    } catch (err) {
        res.status(500).json({ message: "Gagal menyimpan data ke database." });
    }
});

// ==========================================
// CETAKAN DATA (SCHEMA) ARCHIVE
// ==========================================
const archiveSchema = new mongoose.Schema({
    judul: String,
    gambar: String,
    dibuat_pada: { type: Date, default: Date.now }
});
const Archive = mongoose.model('Archive', archiveSchema);

// ==========================================
// ROUTE 3: UPLOAD ARCHIVE (DILINDUNGI SATPAM)
// ==========================================
app.post('/upload-archive', satpamJWT, async (req, res) => {
    try {
        const archiveBaru = new Archive({
            judul: req.body.judul,
            gambar: req.body.gambar
        });

        // Simpan ke MongoDB
        await archiveBaru.save();
        res.status(201).json({ message: "Foto Archive berhasil disimpan ke MongoDB!" });
    } catch (err) {
        res.status(500).json({ message: "Gagal menyimpan archive ke database." });
    }
});

// 4. UPLOAD ARCHIVE
document.getElementById("form-upload-archive").addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
        judul: document.getElementById("archive-judul").value,
        gambar: document.getElementById("archive-gambar").value
    };

    try {
        const res = await fetch(`${API_URL}/upload-archive`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("admin_token")}` 
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            showAlert("archive-alert", "Archive berhasil dipublikasikan!", "success");
            e.target.reset();
        } else {
            showAlert("archive-alert", "Gagal Upload Archive!", "error");
        }
    } catch (err) {
        showAlert("archive-alert", "Error koneksi ke Server!", "error");
    }
});

// Jalankan Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server API Garnadyaksa jalan di Port ${PORT}`));
