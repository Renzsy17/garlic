// 1. KONEKSI KE SERVER VERCEL
const API_URL = "https://garlic-gules.vercel.app/api";

// 2. FUNGSI NOTIFIKASI
function showAlert(elementId, message, type) {
    const alertBox = document.getElementById(elementId);
    if (!alertBox) return;
    alertBox.textContent = message;
    alertBox.style.color = type === "success" ? "#28a745" : "#dc3545";
    alertBox.style.display = "block";
    setTimeout(() => { alertBox.style.display = "none"; }, 3000);
}

// 3. FITUR LOGIN
const formLogin = document.getElementById("form-login");
if (formLogin) {
    formLogin.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;
        const captcha = document.querySelector('[name="cf-turnstile-response"]')?.value || "";

        try {
            const res = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, captcha })
            });
            const data = await res.json();
            if (res.ok) {
                showAlert("login-alert", "Login Berhasil! Mengalihkan...", "success");
                localStorage.setItem("admin_token", data.token);
                setTimeout(() => { window.location.href = "admin.html"; }, 1500); 
            } else {
                showAlert("login-alert", data.message, "error");
            }
        } catch (err) { showAlert("login-alert", "Server down/koneksi putus!", "error"); }
    });
}

// 4. FITUR UPLOAD EVENT
const formEvent = document.getElementById("form-upload-event");
if (formEvent) {
    formEvent.addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
            judul: document.getElementById("event-judul").value,
            tanggal: document.getElementById("event-tanggal").value,
            gambar: document.getElementById("event-gambar").value,
            link_dokumen: document.getElementById("event-link").value,
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
                showAlert("event-alert", "Event berhasil dipublikasikan!", "success");
                formEvent.reset();
            } else { showAlert("event-alert", "Gagal Upload! Tiket login kadaluarsa.", "error"); }
        } catch (err) { showAlert("event-alert", "Error koneksi ke Server!", "error"); }
    });
}

// 5. FITUR UPLOAD ARCHIVE
const formArchive = document.getElementById("form-upload-archive");
if (formArchive) {
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
