// URL Backend
const API_URL = "https://garlic-gules.vercel.app/api";

// ==========================================
// SISTEM ROUTING & MENU SPA (BIAR NGGAK RELOAD KE EVENT)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("admin_token")) {
        showDashboard();
    }
});

function switchMenu(targetPage) {
    document.getElementById('view-upload').classList.add('hidden');
    document.getElementById('view-archive').classList.add('hidden');
    document.getElementById('view-traffic').classList.add('hidden');
    
    document.getElementById('nav-upload').classList.remove('active');
    document.getElementById('nav-archive').classList.remove('active');
    document.getElementById('nav-traffic').classList.remove('active');

    document.getElementById(`view-${targetPage}`).classList.remove('hidden');
    document.getElementById(`nav-${targetPage}`).classList.add('active');

    toggleMenu();
}

function showDashboard() {
    document.getElementById("login-section").classList.add("hidden");
    document.getElementById("dashboard-section").classList.remove("hidden");
    document.getElementById("body-main").classList.remove("login-mode");
}

function logout() {
    if(confirm('Yakin ingin keluar?')) {
        localStorage.removeItem("admin_token");
        location.reload();
    }
}

function showAlert(elementId, message, type) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerText = message;
    el.className = `alert alert-${type}`;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add("hidden"), 3000);
}

const hamburger = document.getElementById('hamburger-icon');
const sidebar = document.getElementById('sidebar-menu');
const overlay = document.getElementById('overlay');

function toggleMenu() {
    if(hamburger) hamburger.classList.toggle('active');
    if(sidebar) sidebar.classList.toggle('active');
    if(overlay) overlay.classList.toggle('active');
}
if(hamburger) hamburger.addEventListener('click', toggleMenu);
if(overlay) overlay.addEventListener('click', toggleMenu);

// ==========================================
// API FETCH (KONEKSI KE VERCEL & MONGODB)
// ==========================================

// 1. PROSES LOGIN
const formLogin = document.getElementById("form-login");
if (formLogin) {
    formLogin.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const turnstileResponse = document.querySelector('[name="cf-turnstile-response"]');
        if (!turnstileResponse || !turnstileResponse.value) {
            showAlert("login-alert", "Harap selesaikan sistem keamanan (CAPTCHA)!", "error");
            return;
        }

        // FIX 1: Pake 'username' dan 'password' (Sesuai admin.html lu)
        const payload = {
            username: document.getElementById("username").value,
            password: document.getElementById("password").value,
            captcha: turnstileResponse.value
        };

        const btn = document.getElementById("btn-login");
        btn.innerText = "Mengecek Database...";
        
        try {
            const res = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem("admin_token", data.token);
                showDashboard();
            } else {
                showAlert("login-alert", data.message || "Akses Ditolak!", "error");
                if (typeof turnstile !== 'undefined') turnstile.reset(); 
            }
        } catch (err) {
            showAlert("login-alert", "Gagal terhubung ke Server!", "error");
        } finally {
            btn.innerText = "Log Masuk";
        }
    });
}

// 2. UPLOAD EVENT
const formUploadEvent = document.getElementById("form-upload-event");
if (formUploadEvent) {
    formUploadEvent.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        // FIX 2: Pake 'event-dokumen' (Sesuai admin.html lu)
        const payload = {
            judul: document.getElementById("event-judul").value,
            tanggal: document.getElementById("event-tanggal").value,
            gambar: document.getElementById("event-gambar").value,
            link_dokumen: document.getElementById("event-dokumen").value,
            deskripsi: document.getElementById("event-deskripsi").value
        };

        try {
            const res = await fetch(`${API_URL}/upload-event`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("admin_token")}` 
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                showAlert("upload-alert", "Berhasil dipublikasikan!", "success");
                e.target.reset();
            } else {
                showAlert("upload-alert", "Gagal Upload Event! Cek koneksi.", "error");
            }
        } catch (err) {
            showAlert("upload-alert", "Error koneksi ke Server!", "error");
        }
    });
}

// 3. UPLOAD ARCHIVE
const formUploadArchive = document.getElementById("form-upload-archive");
if (formUploadArchive) {
    formUploadArchive.addEventListener("submit", async (e) => {
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
                showAlert("archive-alert", "Foto Archive Berhasil Dipublikasikan!", "success");
                e.target.reset();
            } else {
                showAlert("archive-alert", "Gagal Upload Archive!", "error");
            }
        } catch (err) {
            showAlert("archive-alert", "Error koneksi ke Server!", "error");
        }
    });
}if (formArchive) {
    formArchive.addEventListener("submit", async (e) => {
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
                showAlert("archive-alert", "Foto Archive berhasil disimpen!", "success");
                formArchive.reset();
            } else { showAlert("archive-alert", "Gagal Upload Archive! Cek login lu.", "error"); }
        } catch (err) { showAlert("archive-alert", "Error koneksi ke Server!", "error"); }
    });
}
