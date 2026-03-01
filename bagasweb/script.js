// ===== DATA AWAL =====
let materiData = [
    { judul: "Teks Narasi", deskripsi: "Struktur, ciri, dan contoh.", linkMateri: "https://example.com/narasi", linkFile: "https://example.com/narasi.pdf" },
    { judul: "Teks Deskripsi", deskripsi: "Memahami teks deskripsi.", linkMateri: "https://example.com/deskripsi", linkFile: "" },
    { judul: "Teks Eksposisi", deskripsi: "Informasi dengan gaya ekspositori.", linkMateri: "", linkFile: "https://example.com/eksposisi.docx" }
];

let kuisData = [
    { judul: "Kuis Narasi", deskripsi: "Uji pemahaman narasi.", linkMateri: "https://example.com/kuis-narasi", linkFile: "" },
    { judul: "Kuis Deskripsi", deskripsi: "Latihan soal deskripsi.", linkMateri: "", linkFile: "https://example.com/kuis-deskripsi.pdf" }
];

// Video dengan URL yang pasti valid (embed YouTube)
let videoData = [
    { judul: "Pengantar Teks Narasi", url: "https://youtu.be/dQw4w9WgXcQ?si=BA1jw5wH6jpT1lGZ", deskripsi: "Video pertama di YouTube (contoh)" },
    { judul: "Contoh Teks Deskripsi", url: "https://www.youtube.com/embed/3JZ_D3ELwOQ", deskripsi: "Contoh dan analisis" }
];

let isAdmin = false;

// ===== ELEMEN DOM =====
const materiContainer = document.getElementById('materiContainer');
const kuisContainer = document.getElementById('kuisContainer');
const videoContainer = document.getElementById('videoContainer');
const loginModal = document.getElementById('loginModal');
const adminPanel = document.getElementById('adminPanel');
const loginBtn = document.getElementById('adminLoginBtn');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

// ===== HAMBURGER MENU =====
hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// ===== FUNGSI KONVERSI URL YOUTUBE KE EMBED =====
function convertToEmbedUrl(url) {
    if (!url) return '';
    // Jika sudah embed, kembalikan apa adanya
    if (url.includes('/embed/')) return url;
    
    // Pola untuk youtube.com/watch?v=VIDEO_ID
    let match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
    if (match) {
        return `https://www.youtube.com/embed/${match[1]}`;
    }
    // Jika tidak cocok, kembalikan URL asli (mungkin sudah embed atau domain lain)
    return url;
}

// ===== RENDER FUNCTIONS =====
function renderLinkButtons(item) {
    let html = '<div class="card-links">';
    if (item.linkMateri && item.linkMateri.trim() !== '') {
        html += `<a href="${item.linkMateri}" target="_blank" class="btn-link">📘 Buka Materi</a>`;
    }
    if (item.linkFile && item.linkFile.trim() !== '') {
        html += `<a href="${item.linkFile}" target="_blank" class="btn-link">📎 Download File</a>`;
    }
    html += '</div>';
    return html;
}

function renderMateri() {
    let html = '';
    materiData.forEach((item, index) => {
        html += `
        <div class="materi-card">
            <h3>${item.judul}</h3>
            <p>${item.deskripsi}</p>
            ${renderLinkButtons(item)}
            ${isAdmin ? `<button class="btn hapus-btn" onclick="hapusMateri(${index})">Hapus</button>` : ''}
        </div>`;
    });
    materiContainer.innerHTML = html;
}

function renderKuis() {
    let html = '';
    kuisData.forEach((item, index) => {
        html += `
        <div class="materi-card">
            <h3>${item.judul}</h3>
            <p>${item.deskripsi}</p>
            ${renderLinkButtons(item)}
            ${isAdmin ? `<button class="btn hapus-btn" onclick="hapusKuis(${index})">Hapus</button>` : ''}
        </div>`;
    });
    kuisContainer.innerHTML = html;
}

function renderVideo() {
    let html = '';
    videoData.forEach((item, index) => {
        html += `
        <div class="video-card">
            <h3>${item.judul}</h3>
            <iframe src="${item.url}" frameborder="0" allowfullscreen></iframe>
            <p>${item.deskripsi || ''}</p>
            ${isAdmin ? `<button class="btn hapus-btn" onclick="hapusVideo(${index})">Hapus</button>` : ''}
        </div>`;
    });
    videoContainer.innerHTML = html;
}

// ===== FUNGSI TAMBAH (MATERI, KUIS, VIDEO) =====
function tambahMateri() {
    const judul = document.getElementById('judulMateri').value.trim();
    const deskripsi = document.getElementById('deskripsiMateri').value.trim();
    const linkMateri = document.getElementById('linkMateri').value.trim();
    const linkFile = document.getElementById('fileMateri').value.trim();
    if (!judul || !deskripsi) return alert('Judul dan deskripsi wajib diisi');
    materiData.push({ judul, deskripsi, linkMateri, linkFile });
    renderMateri();
    // reset
    document.getElementById('judulMateri').value = '';
    document.getElementById('deskripsiMateri').value = '';
    document.getElementById('linkMateri').value = '';
    document.getElementById('fileMateri').value = '';
}

function tambahKuis() {
    const judul = document.getElementById('judulKuis').value.trim();
    const deskripsi = document.getElementById('deskripsiKuis').value.trim();
    const linkMateri = document.getElementById('linkKuis').value.trim();
    const linkFile = document.getElementById('fileKuis').value.trim();
    if (!judul || !deskripsi) return alert('Judul dan deskripsi wajib diisi');
    kuisData.push({ judul, deskripsi, linkMateri, linkFile });
    renderKuis();
    document.getElementById('judulKuis').value = '';
    document.getElementById('deskripsiKuis').value = '';
    document.getElementById('linkKuis').value = '';
    document.getElementById('fileKuis').value = '';
}

function tambahVideo() {
    const judul = document.getElementById('judulVideo').value.trim();
    let url = document.getElementById('urlVideo').value.trim();
    const deskripsi = document.getElementById('deskripsiVideo').value.trim();
    if (!judul || !url) return alert('Judul dan URL wajib diisi');
    
    // Konversi URL ke format embed
    url = convertToEmbedUrl(url);
    
    // Validasi sederhana: pastikan hasilnya mengandung embed (opsional)
    if (!url.includes('/embed/')) {
        alert('URL tidak dikenali sebagai YouTube. Pastikan Anda memasukkan link YouTube yang benar.');
        // Tetap tambahkan, tapi beri peringatan
    }
    
    videoData.push({ judul, url, deskripsi });
    renderVideo();
    document.getElementById('judulVideo').value = '';
    document.getElementById('urlVideo').value = '';
    document.getElementById('deskripsiVideo').value = '';
}

// ===== FUNGSI HAPUS =====
function hapusMateri(index) {
    if (confirm('Hapus materi ini?')) {
        materiData.splice(index, 1);
        renderMateri();
    }
}

function hapusKuis(index) {
    if (confirm('Hapus kuis ini?')) {
        kuisData.splice(index, 1);
        renderKuis();
    }
}

function hapusVideo(index) {
    if (confirm('Hapus video ini?')) {
        videoData.splice(index, 1);
        renderVideo();
    }
}

// ===== LOGIN / LOGOUT =====
function openLogin() {
    loginModal.style.display = 'flex';
}

function login() {
    isAdmin = true;
    loginModal.style.display = 'none';
    adminPanel.style.display = 'block';
    renderMateri();
    renderKuis();
    renderVideo();
}

function logout() {
    isAdmin = false;
    adminPanel.style.display = 'none';
    renderMateri();
    renderKuis();
    renderVideo();
}

function toggleAdminPanel() {
    if (adminPanel.style.display === 'none' || adminPanel.style.display === '') {
        if (isAdmin) adminPanel.style.display = 'block';
    } else {
        adminPanel.style.display = 'none';
    }
}

// ===== EVENT LISTENERS =====
loginBtn.addEventListener('click', function() {
    if (isAdmin) {
        toggleAdminPanel();
    } else {
        openLogin();
    }
});

document.getElementById('loginConfirmBtn').addEventListener('click', function(e) {
    e.preventDefault();
    login();
});

window.addEventListener('click', function(e) {
    if (e.target === loginModal) {
        loginModal.style.display = 'none';
    }
});

// Smooth scroll
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId.startsWith('#')) {
            e.preventDefault();
            const targetEl = document.querySelector(targetId);
            if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ===== RENDER AWAL =====
renderMateri();
renderKuis();
renderVideo();
