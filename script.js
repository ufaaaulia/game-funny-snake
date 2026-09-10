const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const elSkor = document.getElementById("current-score");
const elHighScore = document.getElementById("high-score");
const btnRestart = document.getElementById("btn-restart");

const UKURAN_KOTAK = 20;
const JUMLAH_GRID = canvas.width / UKURAN_KOTAK;

let ular = [];
let umpan = { x: 0, y: 0 };
let arahX = 0;
let arahY = -1;
let skor = 0;
let skorTertinggi = 0;
let gameLoopInterval = null;
let gameBerjalan = false;
let partikelArray = [];

// Palet partikel pelangi lembut
const WARNA_PARTIKEL = ['#ffb780', '#ffc6d9', '#c4b5fd', '#fff3bf', '#bae6fd'];

class Partikel {
    constructor(x, y, warna) {
        this.x = x;
        this.y = y;
        this.warna = warna;
        this.kecepatanX = (Math.random() - 0.5) * 6;
        this.kecepatanY = (Math.random() - 0.5) * 6;
        this.ukuran = Math.random() * 4 + 3;
        this.opacity = 1;
        this.kecepatanPudar = 0.025;
    }
    update() {
        this.x += this.kecepatanX;
        this.y += this.kecepatanY;
        this.opacity -= this.kecepatanPudar;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.warna;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.ukuran, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function inisialisasiGame() {
    ular = [
        { x: 10, y: 10, dirX: 0, dirY: -1 },
        { x: 10, y: 11, dirX: 0, dirY: -1 },
        { x: 10, y: 12, dirX: 0, dirY: -1 }
    ];
    arahX = 0;
    arahY = -1;
    skor = 0;
    elSkor.innerText = skor;
    partikelArray = [];
    acakPosisiUmpan();
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    gameLoopInterval = setInterval(updateDanRender, 145);
    gameBerjalan = true;
    btnRestart.innerText = "Reset Kontrol 🎮";
}

function acakPosisiUmpan() {
    umpan.x = Math.floor(Math.random() * JUMLAH_GRID);
    umpan.y = Math.floor(Math.random() * JUMLAH_GRID);
    ular.forEach(bagian => {
        if (bagian.x === umpan.x && bagian.y === umpan.y) acakPosisiUmpan();
    });
}

function buatLedakanPartikel(koordinatX, koordinatY) {
    for (let i = 0; i < 20; i++) {
        const warnaAcak = WARNA_PARTIKEL[Math.floor(Math.random() * WARNA_PARTIKEL.length)];
        const px = koordinatX * UKURAN_KOTAK + UKURAN_KOTAK / 2;
        const py = koordinatY * UKURAN_KOTAK + UKURAN_KOTAK / 2;
        partikelArray.push(new Partikel(px, py, warnaAcak));
    }
}

function cekTabrakanTubuh(kepala) {
    for (let i = 1; i < ular.length; i++) {
        if (ular[i].x === kepala.x && ular[i].y === kepala.y) return true;
    }
    return false;
}

function tampilkanLayarSelesai() {
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#7c3aed';
    ctx.font = "bold 32px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER 🐍", canvas.width/2, canvas.height/2 - 10);
    ctx.fillStyle = '#4c1d95';
    ctx.font = "bold 16px Segoe UI";
    ctx.fillText(`Skor Akhir: ${skor} Poin`, canvas.width/2, canvas.height/2 + 25);
}

// === MENGGAMBAR ULAR BENTUK ASLI ===
function gambarUlarAsli() {
    // Gambar badan dari belakang ke depan agar kepala di atas
    for (let idx = ular.length - 1; idx >= 0; idx--) {
        const b = ular[idx];
        const px = b.x * UKURAN_KOTAK;
        const py = b.y * UKURAN_KOTAK;
        const uk = UKURAN_KOTAK;
        const r = uk / 2;
        const cx = px + r;
        const cy = py + r;

        if (idx === 0) {
            // === KEPALA ULAR — lebih besar & bentuk oval ===
            ctx.fillStyle = '#818cf8'; // Kepala lebih gelap/terang
            ctx.strokeStyle = '#4338ca';
            ctx.lineWidth = 2;
            
            // Kepala oval memanjang sesuai arah
            ctx.beginPath();
            if (arahY === -1 || arahY === 1) {
                // Atas / Bawah → oval tinggi
                ctx.ellipse(cx, cy, r - 2, r + 2, 0, 0, Math.PI * 2);
            } else {
                // Kiri / Kanan → oval lebar
                ctx.ellipse(cx, cy, r + 2, r - 2, 0, 0, Math.PI * 2);
            }
            ctx.fill();
            ctx.stroke();

            // === MATA ular ===
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            if (arahY === -1) {
                // Ke atas
                ctx.arc(cx - 5, cy - 3, 3, 0, Math.PI * 2);
                ctx.arc(cx + 5, cy - 3, 3, 0, Math.PI * 2);
            } else if (arahY === 1) {
                // Ke bawah
                ctx.arc(cx - 5, cy + 3, 3, 0, Math.PI * 2);
                ctx.arc(cx + 5, cy + 3, 3, 0, Math.PI * 2);
            } else if (arahX === -1) {
                // Ke kiri
                ctx.arc(cx - 3, cy - 5, 3, 0, Math.PI * 2);
                ctx.arc(cx - 3, cy + 5, 3, 0, Math.PI * 2);
            } else if (arahX === 1) {
                // Ke kanan
                ctx.arc(cx + 3, cy - 5, 3, 0, Math.PI * 2);
                ctx.arc(cx + 3, cy + 5, 3, 0, Math.PI * 2);
            }
            ctx.fill();

            // Pupil hitam
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            if (arahY === -1) {
                ctx.arc(cx - 5, cy - 3, 1.5, 0, Math.PI * 2);
                ctx.arc(cx + 5, cy - 3, 1.5, 0, Math.PI * 2);
            } else if (arahY === 1) {
                ctx.arc(cx - 5, cy + 3, 1.5, 0, Math.PI * 2);
                ctx.arc(cx + 5, cy + 3, 1.5, 0, Math.PI * 2);
            } else if (arahX === -1) {
                ctx.arc(cx - 3, cy - 5, 1.5, 0, Math.PI * 2);
                ctx.arc(cx - 3, cy + 5, 1.5, 0, Math.PI * 2);
            } else if (arahX === 1) {
                ctx.arc(cx + 3, cy - 5, 1.5, 0, Math.PI * 2);
                ctx.arc(cx + 3, cy + 5, 1.5, 0, Math.PI * 2);
            }
            ctx.fill();

            // === LIDAH ular ===
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            if (arahY === -1) {
                ctx.moveTo(cx, cy - r);
                ctx.lineTo(cx - 4, cy - r - 5);
                ctx.moveTo(cx, cy - r);
                ctx.lineTo(cx + 4, cy - r - 5);
            } else if (arahY === 1) {
                ctx.moveTo(cx, cy + r);
                ctx.lineTo(cx - 4, cy + r + 5);
                ctx.moveTo(cx, cy + r);
                ctx.lineTo(cx + 4, cy + r + 5);
            } else if (arahX === -1) {
                ctx.moveTo(cx - r, cy);
                ctx.lineTo(cx - r - 5, cy - 4);
                ctx.moveTo(cx - r, cy);
                ctx.lineTo(cx - r - 5, cy + 4);
            } else if (arahX === 1) {
                ctx.moveTo(cx + r, cy);
                ctx.lineTo(cx + r + 5, cy - 4);
                ctx.moveTo(cx + r, cy);
                ctx.lineTo(cx + r + 5, cy + 4);
            }
            ctx.stroke();

        } else {
            // === BADAN ULAR — bulat & makin pudar ke ekor ===
            const fadeRatio = idx / Math.max(ular.length - 1, 1);
            const rVal = Math.round(129 - 50 * fadeRatio);
            const gVal = Math.round(140 - 40 * fadeRatio);
            const bVal = 248;
            ctx.fillStyle = `rgb(${rVal}, ${gVal}, ${bVal})`;
            ctx.strokeStyle = '#4338ca';
            ctx.lineWidth = 1.5;

            // Badan berbentuk lingkaran mulus
            ctx.beginPath();
            ctx.arc(cx, cy, r - 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
    }
}

function updateDanRender() {
    ctx.fillStyle = "#fdf7ff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(124, 58, 237, 0.08)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= JUMLAH_GRID; i++) {
        ctx.beginPath(); ctx.moveTo(i*UKURAN_KOTAK,0); ctx.lineTo(i*UKURAN_KOTAK,canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0,i*UKURAN_KOTAK); ctx.lineTo(canvas.width,i*UKURAN_KOTAK); ctx.stroke();
    }

    if (!gameBerjalan) { tampilkanLayarSelesai(); return; }

    const kepalaBaru = { 
        x: ular[0].x + arahX, 
        y: ular[0].y + arahY,
        dirX: arahX,
        dirY: arahY
    };

    if (kepalaBaru.x < 0 || kepalaBaru.x >= JUMLAH_GRID || kepalaBaru.y < 0 || kepalaBaru.y >= JUMLAH_GRID || cekTabrakanTubuh(kepalaBaru)) {
        gameBerjalan = false;
        if (skor > skorTertinggi) { skorTertinggi = skor; elHighScore.innerText = skorTertinggi; }
        return;
    }

    ular.unshift(kepalaBaru);

    if (kepalaBaru.x === umpan.x && kepalaBaru.y === umpan.y) {
        skor += 10; elSkor.innerText = skor;
        buatLedakanPartikel(umpan.x, umpan.y);
        acakPosisiUmpan();
    } else {
        ular.pop();
    }

    // Umpan — makanan ular
    ctx.fillStyle = "#f472b6";
    ctx.strokeStyle = "#7c3aed";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(umpan.x*UKURAN_KOTAK+UKURAN_KOTAK/2, umpan.y*UKURAN_KOTAK+UKURAN_KOTAK/2, UKURAN_KOTAK/2-2, 0, Math.PI*2);
    ctx.fill(); ctx.stroke();

    // === GAMBAR ULAR ASLI ===
    gambarUlarAsli();

    partikelArray.forEach((p, i) => {
        if (p.opacity <= 0) partikelArray.splice(i,1);
        else { p.update(); p.draw(); }
    });
}

window.addEventListener("keydown", e => {
    const k = e.key;
    if ((k==="ArrowUp"||k==="w"||k==="W") && arahY!==1) { arahX=0; arahY=-1; }
    else if ((k==="ArrowDown"||k==="s"||k==="S") && arahY!==-1) { arahX=0; arahY=1; }
    else if ((k==="ArrowLeft"||k==="a"||k==="A") && arahX!==1) { arahX=-1; arahY=0; }
    else if ((k==="ArrowRight"||k==="d"||k==="D") && arahX!==-1) { arahX=1; arahY=0; }
});

btnRestart.addEventListener("click", inisialisasiGame);

ctx.fillStyle = "#fdf7ff";
ctx.fillRect(0,0,canvas.width,canvas.height);
