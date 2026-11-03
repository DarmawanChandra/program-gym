/* ================================================================
   gambar.js — gambar gerak (animasi orang lidi) untuk tiap gerakan

   Cara kerja:
   - Orang lidi dilihat dari samping, menghadap ke kanan.
   - Satu pose = posisi pinggul + sudut tiap bagian badan (derajat):
       0 = kanan, 90 = bawah, 180 = kiri, -90 = atas.
       p  : [x, y] pinggul
       t  : sudut badan (pinggul ke bahu)
       k1 : kaki depan  [paha, betis, (telapak)]   k2 : kaki belakang
       t1 : tangan depan [lengan atas, lengan bawah] t2 : tangan belakang
   - Tiap gerakan punya pose awal (a) dan pose akhir (b).
     Gambar bergerak bolak-balik a -> b -> a.
   ================================================================ */
'use strict';

const PANJANG = { badan: 30, leher: 10, paha: 22, betis: 22, lenganAtas: 16, lenganBawah: 15, telapak: 7 };
const LANTAI = 92;

function arah(sudut, panjang, dari) {
  const r = sudut * Math.PI / 180;
  return [dari[0] + Math.cos(r) * panjang, dari[1] + Math.sin(r) * panjang];
}

// Hitung titik sendi dari satu pose
function titikPose(o) {
  const p = o.p;
  const s = arah(o.t, PANJANG.badan, p);
  const kaki = k => {
    const lutut = arah(k[0], PANJANG.paha, p);
    const mata = arah(k[1], PANJANG.betis, lutut);
    const jari = arah(k[2] == null ? k[1] - 90 : k[2], PANJANG.telapak, mata);
    return [p, lutut, mata, jari];
  };
  const tangan = a => {
    const siku = arah(a[0], PANJANG.lenganAtas, s);
    return [s, siku, arah(a[1], PANJANG.lenganBawah, siku)];
  };
  const t1 = tangan(o.t1);
  const t2 = tangan(o.t2 || o.t1);
  const k1 = kaki(o.k1);
  const k2 = kaki(o.k2 || o.k1);
  return {
    kepala: arah(o.t, PANJANG.leher, s), badan: [p, s], k1, k2, t1, t2,
    // titik untuk alat yang ikut bergerak
    w1: t1[2], w2: t2[2], a1: k1[2], a2: k2[2], p
  };
}

// Pose di antara a dan b (f = 0 sampai 1)
function campurPose(a, b, f) {
  const l = (x, y) => (y == null ? x : x + (y - x) * f);
  const pas = (x, y) => (x ? x.map((v, i) => l(v, y && y[i])) : x);
  return {
    p: pas(a.p, b.p), t: l(a.t, b.t),
    k1: pas(a.k1, b.k1), k2: pas(a.k2 || a.k1, b.k2 || b.k1),
    t1: pas(a.t1, b.t1), t2: pas(a.t2 || a.t1, b.t2 || b.t1)
  };
}

const angka1 = v => v.toFixed(1);
const teksTitik = arr => arr.map(q => angka1(q[0]) + ',' + angka1(q[1])).join(' ');

// Daftar frame: a -> b -> a, dengan gerak halus di awal dan akhir
function daftarFrame(g) {
  const langkah = [0, 0.2, 0.4, 0.6, 0.8, 1, 0.8, 0.6, 0.4, 0.2, 0];
  return langkah.map(f => titikPose(campurPose(g.a, g.b, (1 - Math.cos(Math.PI * f)) / 2)));
}

function kurangiGerak() {
  return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

// Buat SVG gambar gerak. Hasil '' kalau gerakan tidak punya gambar.
function gambarGerak(nama) {
  const g = GAMBAR[kunciNama(nama)];
  if (!g) return '';
  const diam = !!g.diam || kurangiGerak();
  const frame = diam ? [titikPose(g.a)] : daftarFrame(g);
  const belakang = g.depan ? 'gg-badan' : 'gg-belakang'; // tampak depan: kedua sisi sama jelas
  const DUR = '3s';
  const anim = (atribut, nilai) => (diam ? '' :
    `<animate attributeName="${atribut}" values="${nilai.join(';')}" dur="${DUR}" repeatCount="indefinite"/>`);
  const geser = nilai => (diam ? '' :
    `<animateTransform attributeName="transform" type="translate" values="${nilai.join(';')}" dur="${DUR}" repeatCount="indefinite"/>`);
  const garis = (ambil, kelas) => {
    const nilai = frame.map(fr => teksTitik(ambil(fr)));
    return `<polyline class="${kelas}" points="${nilai[0]}">${anim('points', nilai)}</polyline>`;
  };
  const ikut = (titik, isi, kelas) => {
    const nilai = frame.map(fr => angka1(fr[titik][0]) + ' ' + angka1(fr[titik][1]));
    return `<g class="${kelas || 'gg-alat'}" transform="translate(${nilai[0]})">${geser(nilai)}${isi}</g>`;
  };
  const kabel = (dari, titik) => {
    const x = frame.map(fr => angka1(fr[titik][0]));
    const y = frame.map(fr => angka1(fr[titik][1]));
    return `<line class="gg-kabel" x1="${dari[0]}" y1="${dari[1]}" x2="${x[0]}" y2="${y[0]}">${anim('x2', x)}${anim('y2', y)}</line>`;
  };
  const kepalaX = frame.map(fr => angka1(fr.kepala[0]));
  const kepalaY = frame.map(fr => angka1(fr.kepala[1]));

  return `
    <figure class="gambar-gerak">
      <svg class="gg" viewBox="0 -8 120 108" role="img" aria-label="Gambar gerak ${esc(nama)}">
        ${g.lantai === false ? '' : `<line class="gg-lantai" x1="2" y1="${LANTAI}" x2="118" y2="${LANTAI}"/>`}
        ${g.alat || ''}
        ${(g.kabel || []).map(k => kabel(k[0], k[1])).join('')}
        ${garis(fr => fr.k2, belakang)}
        ${garis(fr => fr.t2, belakang)}
        ${garis(fr => fr.badan, 'gg-badan')}
        <circle class="gg-kepala" r="6" cx="${kepalaX[0]}" cy="${kepalaY[0]}">${anim('cx', kepalaX)}${anim('cy', kepalaY)}</circle>
        ${garis(fr => fr.k1, 'gg-badan')}
        ${garis(fr => fr.t1, 'gg-badan')}
        ${(g.ikut || []).map(i => ikut(i[0], i[1], i[2])).join('')}
      </svg>
      ${diam ? '' : '<figcaption>Tap gambar untuk jeda</figcaption>'}
    </figure>`;
}

// Tap gambar: jeda / lanjut animasi
document.addEventListener('click', e => {
  const svg = e.target.closest && e.target.closest('svg.gg');
  if (!svg || typeof svg.pauseAnimations !== 'function') return;
  if (svg.animationsPaused()) svg.unpauseAnimations(); else svg.pauseAnimations();
  svg.classList.toggle('jeda');
});

/* ---------- Alat (digambar sederhana) ---------- */
const DB = '<rect x="-6" y="-1.2" width="12" height="2.4" rx="1"/><rect x="-8" y="-4" width="3.5" height="8" rx="1"/><rect x="4.5" y="-4" width="3.5" height="8" rx="1"/>';
const DB_TEGAK = '<g transform="rotate(90)">' + DB + '</g>';
const PIRINGAN = '<circle cy="-4" r="5.5"/>';
const PALANG = '<rect x="-12" y="-1.5" width="24" height="3" rx="1.5"/>';
const GAGANG = '<rect x="-3" y="-3" width="6" height="6" rx="2"/>';
const BANTAL = '<circle r="3.8"/>';
const PAPAN = '<line class="gg-papan" x1="-5.2" y1="-10" x2="4.5" y2="1.5"/>';

const bangku = (x, y, w) => `<rect class="gg-benda" x="${x}" y="${y}" width="${w}" height="6" rx="2"/>` +
  `<line class="gg-tiang" x1="${x + 5}" y1="${y + 6}" x2="${x + 5}" y2="${LANTAI}"/>` +
  `<line class="gg-tiang" x1="${x + w - 5}" y1="${y + 6}" x2="${x + w - 5}" y2="${LANTAI}"/>`;
const tiang = (x, y1, y2) => `<line class="gg-tiang" x1="${x}" y1="${y1}" x2="${x}" y2="${y2}"/>`;
const sandaran = (x1, y1, x2, y2) => `<line class="gg-sandaran" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;

const BERDIRI = { p: [55, 48], t: -90, k1: [90, 90, 0], t1: [90, 90] };
const jalanA = t => ({ p: [55, 50], t, k1: [70, 85, 0], k2: [110, 110, 20], t1: [110, 100], t2: [70, 60] });
const jalanB = t => ({ p: [55, 50], t, k1: [110, 110, 20], k2: [70, 85, 0], t1: [70, 60], t2: [110, 100] });

/* ---------- Pose tiap gerakan: a = awal, b = akhir ---------- */
const GAMBAR = {
  'goblet squat': {
    a: { p: [55, 48], t: -90, k1: [90, 90, 0], t1: [80, -60] },
    b: { p: [39, 65], t: -60, k1: [15, 105, 0], t1: [70, -50] },
    ikut: [['w1', DB_TEGAK]]
  },
  'leg press': {
    a: { p: [45, 70], t: -150, k1: [-83, 4, -130], t1: [40, 20] },
    b: { p: [45, 70], t: -150, k1: [-40, -40, -130], t1: [40, 20] },
    alat: sandaran(54, 76, 10, 51) + tiang(40, 72, 92),
    ikut: [['a1', PAPAN]]
  },
  'hip thrust': {
    a: { p: [52, 80], t: -150, k1: [-26, 81, 0], t1: [10, 40] },
    b: { p: [52, 64], t: -175, k1: [16, 85, 0], t1: [0, 10] },
    alat: bangku(2, 64, 24),
    ikut: [['p', PIRINGAN]]
  },
  'lunges': {
    a: { p: [50, 48], t: -90, k1: [90, 90, 0], k2: [90, 90, 0], t1: [90, 90] },
    b: { p: [50, 70], t: -90, k1: [0, 90, 0], k2: [115, 175, 80], t1: [90, 90] },
    ikut: [['w1', DB]]
  },
  'lat pulldown': {
    a: { p: [50, 70], t: -95, k1: [0, 90, 0], t1: [-80, -80] },
    b: { p: [50, 70], t: -95, k1: [0, 90, 0], t1: [100, -60] },
    alat: `<rect class="gg-benda" x="34" y="72" width="26" height="4" rx="2"/>` + tiang(47, 76, 92) +
      `<rect class="gg-benda" x="62" y="61" width="14" height="5" rx="2"/>`,
    kabel: [[[52, 0], 'w1']],
    ikut: [['w1', PALANG]]
  },
  'seated row': {
    a: { p: [40, 70], t: -90, k1: [5, 30, -60], t1: [0, 0] },
    b: { p: [40, 70], t: -95, k1: [5, 30, -60], t1: [120, 10] },
    alat: `<rect class="gg-benda" x="26" y="72" width="28" height="5" rx="2"/>` + tiang(40, 77, 92) + tiang(87, 70, 92),
    kabel: [[[106, 54], 'w1']],
    ikut: [['w1', GAGANG]]
  },
  'dumbbell press': {
    a: { p: [70, 62], t: 180, k1: [20, 100, 0], t1: [60, -90] },
    b: { p: [70, 62], t: 180, k1: [20, 100, 0], t1: [-90, -90] },
    alat: bangku(22, 64, 58),
    ikut: [['w1', DB]]
  },
  'shoulder press': {
    a: { p: [50, 70], t: -90, k1: [0, 90, 0], t1: [60, -90] },
    b: { p: [50, 70], t: -90, k1: [0, 90, 0], t1: [-85, -90] },
    alat: `<rect class="gg-benda" x="36" y="72" width="26" height="5" rx="2"/>` + tiang(49, 77, 92) + sandaran(44, 74, 44, 36),
    ikut: [['w1', DB]]
  },
  'romanian deadlift': {
    a: { p: [50, 48], t: -90, k1: [90, 90, 0], t1: [90, 90] },
    b: { p: [48, 50], t: -25, k1: [75, 100, 0], t1: [90, 90] },
    ikut: [['w1', DB]]
  },
  'leg curl': {
    a: { p: [62, 58], t: 0, k1: [180, 180, 90], t1: [30, 80] },
    b: { p: [62, 58], t: 0, k1: [180, -80, 10], t1: [30, 80] },
    alat: bangku(20, 61, 82),
    ikut: [['a1', BANTAL]]
  },
  'glute kickback': {
    a: { p: [50, 48], t: -60, k1: [95, 90, 0], k2: [90, 90, 0], t1: [30, 30] },
    b: { p: [50, 48], t: -60, k1: [140, 150], k2: [90, 90, 0], t1: [30, 30] },
    alat: tiang(96, 18, 92),
    kabel: [[[96, 88], 'a1']]
  },
  'calf raise': {
    a: BERDIRI,
    b: { p: [55, 42], t: -90, k1: [90, 90, 45], t1: [90, 90] }
  },
  'push-up lutut': {
    a: { p: [48.7, 81.5], t: -42, k1: [160, 175], t1: [80, 80] },
    b: { p: [48.7, 83.3], t: -12, k1: [165, 175], t1: [154, 31] }
  },
  'dumbbell row': {
    a: { p: [40, 50], t: -10, k1: [115, 95, 0], k2: [100, 180, 90], t1: [90, 90], t2: [92, 88] },
    b: { p: [40, 50], t: -10, k1: [115, 95, 0], k2: [100, 180, 90], t1: [-130, 90], t2: [92, 88] },
    alat: bangku(16, 74, 58),
    ikut: [['w1', DB]]
  },
  'biceps curl': {
    a: BERDIRI,
    b: { p: [55, 48], t: -90, k1: [90, 90, 0], t1: [95, -70] },
    ikut: [['w1', DB]]
  },
  'plank': {
    a: { p: [50.7, 82.5], t: -12.5, k1: [167.5, 167.5, 90], t1: [90, 0] },
    b: { p: [50.7, 82.5], t: -12.5, k1: [167.5, 167.5, 90], t1: [90, 0] },
    diam: true
  },
  'jalan santai': { a: jalanA(-88), b: jalanB(-88) },
  'kardio treadmill / sepeda': {
    a: jalanA(-85), b: jalanB(-85),
    lantai: false,
    alat: `<line class="gg-papan" x1="10" y1="95" x2="106" y2="90"/>` + `<line class="gg-tiang" x1="100" y1="90" x2="92" y2="40"/>` +
      `<line class="gg-tiang" x1="92" y1="40" x2="80" y2="44"/>`
  },
  'stretching': {
    // Peregangan paha depan: tumit ditarik ke bokong
    a: { p: [55, 48], t: -90, k1: [90, 90, 0], k2: [90, 90, 0], t1: [90, 90], t2: [90, 90] },
    b: { p: [55, 48], t: -90, k1: [90, 90, 0], k2: [100, -110, 170], t1: [90, 90], t2: [110, 110] }
  },
  'leg extension': {
    a: { p: [45, 66], t: -95, k1: [0, 95], t1: [100, 30] },
    b: { p: [45, 66], t: -95, k1: [0, -5], t1: [100, 30] },
    alat: `<rect class="gg-benda" x="28" y="68" width="40" height="5" rx="2"/>` + tiang(46, 73, 92) + sandaran(36, 70, 36, 34),
    ikut: [['a1', BANTAL]]
  },
  'chest press mesin': {
    a: { p: [45, 70], t: -95, k1: [0, 90, 0], t1: [135, 5] },
    b: { p: [45, 70], t: -95, k1: [0, 90, 0], t1: [5, 0] },
    alat: `<rect class="gg-benda" x="30" y="72" width="28" height="5" rx="2"/>` + tiang(44, 77, 92) + sandaran(36, 74, 36, 32),
    ikut: [['w1', GAGANG]]
  },
  'lateral raise': {
    // Tampak depan: kedua tangan naik ke samping
    a: { p: [60, 48], t: -90, k1: [86, 90, 60], k2: [94, 90, 120], t1: [72, 78], t2: [108, 102] },
    b: { p: [60, 48], t: -90, k1: [86, 90, 60], k2: [94, 90, 120], t1: [0, -5], t2: [180, 185] },
    depan: true,
    ikut: [['w1', DB_TEGAK], ['w2', DB_TEGAK]]
  },
  'triceps pushdown': {
    a: { p: [50, 48], t: -85, k1: [90, 90, 0], t1: [90, -30] },
    b: { p: [50, 48], t: -85, k1: [90, 90, 0], t1: [90, 80] },
    alat: tiang(94, 2, 92),
    kabel: [[[94, 4], 'w1']],
    ikut: [['w1', GAGANG]]
  },
  'crunch': {
    a: { p: [60, 86], t: 180, k1: [-45, 70, 0], t1: [10, -170] },
    b: { p: [60, 86], t: -160, k1: [-45, 70, 0], t1: [30, -160] }
  }
};
