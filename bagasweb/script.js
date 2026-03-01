// Data materi & kuis dengan link
let materiData = [
    { judul: "Teks Narasi", deskripsi: "Struktur, ciri, dan contoh.", linkMateri: "https://example.com/narasi", linkFile: "https://example.com/narasi.pdf" },
    { judul: "Teks Deskripsi", deskripsi: "Memahami teks deskripsi.", linkMateri: "https://example.com/deskripsi", linkFile: "" },
    { judul: "Teks Eksposisi", deskripsi: "Informasi dengan gaya ekspositori.", linkMateri: "", linkFile: "https://example.com/eksposisi.docx" }
];

let kuisData = [
    { judul: "Kuis Narasi", deskripsi: "Uji pemahaman narasi.", linkMateri: "https://example.com/kuis-narasi", linkFile: "" },
    { judul: "Kuis Deskripsi", deskripsi: "Latihan soal deskripsi.", linkMateri: "", linkFile: "https://example.com/kuis-deskripsi.pdf" }
];

let isAdmin = false;

// Elemen DOM
const materiContainer = document.getElementById('materiContainer');
const kuisContainer = document.getElementById('kuisContainer');
const loginModal = document.getElementById('loginModal');
const adminPanel = document.getElementById('adminPanel');
const loginBtn = document.getElementById('adminLoginBtn');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

// Toggle hamburger menu
hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Tutup menu ketika link diklik (untuk mobile)
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// Helper: render link buttons
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

// Fungsi tambah dengan link
function tambahMateri() {
    const judul = document.getElementById('judulMateri').value.trim();
    const deskripsi = document.getElementById('deskripsiMateri').value.trim();
    const linkMateri = document.getElementById('linkMateri').value.trim();
    const linkFile = document.getElementById('fileMateri').value.trim();
    if (!judul || !deskripsi) return alert('Judul dan deskripsi wajib diisi');
    materiData.push({ judul, deskripsi, linkMateri, linkFile });
    renderMateri();
    // reset form
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

// Login / logout
function openLogin() {
    loginModal.style.display = 'flex';
}

function login() {
    isAdmin = true;
    loginModal.style.display = 'none';
    adminPanel.style.display = 'block';
    renderMateri();
    renderKuis();
}

function logout() {
    isAdmin = false;
    adminPanel.style.display = 'none';
    renderMateri();
    renderKuis();
}

function toggleAdminPanel() {
    if (adminPanel.style.display === 'none' || adminPanel.style.display === '') {
        if (isAdmin) adminPanel.style.display = 'block';
    } else {
        adminPanel.style.display = 'none';
    }
}

// Event listeners
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

// Render awal
renderMateri();
renderKuis();