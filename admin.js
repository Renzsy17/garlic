// URL Backend (Nanti diganti sama URL Vercel/Node.js kita)
const API_URL = "https://garlic-gules.vercel.app/api";
// ==========================================
// SISTEM ROUTING & MENU (SPA LOGIC)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Cek status login saat halaman dimuat
    if (localStorage.getItem("admin_token")) {
        showDashboard();
    }
});

function switchMenu(targetPage) {
    // Sembunyikan semua konten
    document.getElementById('view-upload').classList.add('hidden');
    document.getElementById('view-archive').classList.add('hidden');
    document.getElementById('view-traffic').classList.add('hidden');
    
    // Matikan warna aktif di semua menu
    document.getElementById('nav-upload').classList.remove('active');
    document.getElementById('nav-archive').classList.remove('active');
    document.getElementById('nav-traffic').classList.remove('active');

    // Tampilkan konten dan menu yang dipilih
    document.getElementById(`view-${targetPage}`).classList.remove('hidden');
    document.getElementById(`nav-${targetPage}`).classList.add('active');

    // Tutup sidebar menu (khusus di HP)
    toggleMenu();

    // Kalau buka menu traffic, tarik datanya dari MongoDB
    if(targetPage === 'traffic') { loadTrafficData(); }
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
    el.innerText = message;
    el.className = `alert alert-${type}`;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add("hidden"), 3000);
}

// Interaksi Hamburger Menu
const hamburger = document.getElementById('hamburger-icon');
const sidebar = document.getElementById('sidebar-menu');
const overlay = document.getElementById('overlay');

function toggleMenu() {
    hamburger.classList.toggle('active');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}
hamburger.addEventListener('click', toggleMenu);
overlay.addEventListener('click', toggleMenu);


// ==========================================
// API FETCH (KONEKSI KE MONGODB VIA BACKEND)
// ==========================================

// 1. PROSES LOGIN
document.getElementById("form-login").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // Ambil token Turnstile
    const turnstileResponse = document.querySelector('[name="cf-turnstile-response"]');
    if (!turnstileResponse || !turnstileResponse.value) {
        showAlert("login-alert", "Harap selesaikan sistem keamanan (CAPTCHA)!", "error");
        return;
    }

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
            turnstile.reset(); // Reset muter-muter cloudflare kalau gagal
        }
    } catch (err) {
        showAlert("login-alert", "Gagal terhubung ke Server!", "error");
    } finally {
        btn.innerText = "Log Masuk";
    }
});

// 2. UPLOAD EVENT
document.getElementById("form-upload-event").addEventListener("submit", async (e) => {
    e.preventDefault();
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
            showAlert("upload-alert", "Gagal Upload!", "error");
        }
    } catch (err) {
        showAlert("upload-alert", "Error koneksi ke Server!", "error");
    }
});


// ==========================================
// SECURITY SHIELD (DIGITAL SIGNATURE & ANTI-INSPECT)
// ==========================================
(function() {
    "use strict";
    const signatureArt = `
  ____                              _             _             
 / ___| __ _ _ __ _ __   __ _  __| |   _  __ _| | _____  __ _ 
| |  _ / _' | '__| '_ \\ / _' |/ _' | | | |/ _' | |/ / __|/ _' |
| |_| | (_| | |  | | | | (_| | (_| | |_| | (_| |   <\\__ \\ (_| |
 \\____|\\__,_|_|  |_| |_|\\__,_|\\__,_|\\__, |\\__,_|_|\\_\\___/\\__,_|
                                    |___/                      
`;
    console.log("%c" + signatureArt, "color: #ff0000; font-weight: bold; text-shadow: 2px 2px 0px #000; font-family: monospace;");
    console.log("%c   >> OSIS SMAN 1 BAWANG - DEVELOPED BY AMRIN SYAMZEN <<   ", "background: #ff0000; color: #ffffff; padding: 5px; font-weight: bold; border-radius: 3px; font-family: sans-serif;");
    console.log("%cSystem Status: ACTIVE | Shield: ENABLED", "color: #4CAF50; font-style: italic; font-weight: bold;");

    // A. Deteksi Eruda
    const detectEruda = setInterval(() => {
        if (window.eruda || document.getElementById('eruda')) {
            clearInterval(detectEruda);
            document.body.innerHTML = `
                <div style="background: #000; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; color: red; font-family: monospace; text-align: center; position: fixed; top: 0; left: 0; width: 100%; z-index: 999999;">
                    <h1 style="font-size: 3rem; margin: 0; text-shadow: 0 0 10px red;">⚠️ SECURITY ALERT ⚠️</h1>
                    <p style="font-size: 1.5rem; margin: 20px 0;">Akses Ilegal Terdeteksi.</p>
                    <p style="margin-top: 50px; color: #555;">Garnadyaksa Secure System v2.0</p>
                </div>`;
            console.clear(); 
        }
    }, 1000);

    // B. Debugger Trap
    setInterval(function() {
        const start = new Date();
        debugger; 
        const end = new Date();
        if (end - start > 100) { document.body.innerHTML = "<h1 style='color:red; text-align:center; margin-top:20vh; font-family:sans-serif;'>INSPECTION BLOCKED BY SYSTEM.</h1>"; }
    }, 100);

    // C & D. Disable Right Click & Shortcuts
    document.addEventListener('contextmenu', event => event.preventDefault());
    document.onkeydown = function(e) {
        if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && e.keyCode == 73) || (e.ctrlKey && e.keyCode == 85)) return false;
    };
})();
