/* ================================================================
   app.js — otak aplikasi Program Gym

   Gambaran besar:
   1. Semua data disimpan di localStorage HP dengan kunci "programGym.v1":
      - program    : gerakan untuk tiap hari (Senin sampai Minggu)
      - log        : catatan latihan per tanggal (beban, repetisi, centang)
      - berat      : catatan berat badan
      - profil     : tinggi badan
      - pengaturan : lama istirahat
   2. Tiap menu (Latihan, Program, Grafik, Kalender, Gerakan, Badan)
      punya fungsi "tampil..." yang menggambar ulang isinya dari data.
   3. Setiap ada perubahan: ubah data -> simpan() -> gambar ulang.
   ================================================================ */
'use strict';

/* ---------- Data tetap ---------- */
const KUNCI = 'programGym.v1';

// Urutan hari di aplikasi (Senin dulu)
const HARI = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'];
const NAMA_HARI = {
  senin: 'Senin', selasa: 'Selasa', rabu: 'Rabu', kamis: 'Kamis',
  jumat: 'Jumat', sabtu: 'Sabtu', minggu: 'Minggu'
};
const NAMA_BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli',
  'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const SATUAN = ['rep', 'rep/kaki', 'rep/tangan', 'detik', 'menit'];
const JUDUL = {
  latihan: 'Latihan', program: 'Atur Program', grafik: 'Grafik Kemajuan',
  kalender: 'Kalender Latihan', gerakan: 'Daftar Gerakan', badan: 'Berat Badan'
};
const IKON_CENTANG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

/* ---------- Pustaka gerakan (menu Gerakan) ----------
   saran = [set, target, satuan] yang otomatis terisi saat menambah gerakan */
const PUSTAKA = [
  {
    nama: 'Goblet squat', otot: 'Paha depan, bokong', saran: [3, 12, 'rep'],
    langkah: [
      'Pegang satu dumbbell tegak di depan dada dengan dua tangan.',
      'Buka kaki selebar bahu, ujung kaki sedikit menghadap keluar.',
      'Dorong pinggul ke belakang dan tekuk lutut seperti mau duduk. Dada tetap tegak.',
      'Turun sampai paha kira-kira sejajar lantai, atau sedalam yang masih nyaman.',
      'Dorong lantai lewat tumit untuk berdiri lagi.'
    ],
    tips: 'Lutut searah ujung kaki, jangan masuk ke dalam. Tumit jangan terangkat.'
  },
  {
    nama: 'Leg press', otot: 'Paha depan, bokong', saran: [3, 12, 'rep'],
    langkah: [
      'Duduk di mesin. Punggung dan pinggul menempel ke sandaran.',
      'Taruh kaki di tengah papan, selebar bahu.',
      'Lepas pengaman, lalu turunkan papan pelan sampai lutut menekuk sekitar 90 derajat.',
      'Dorong papan lewat tumit sampai kaki hampir lurus.'
    ],
    tips: 'Jangan luruskan lutut sampai terkunci. Pinggul jangan terangkat dari kursi.'
  },
  {
    nama: 'Hip thrust', otot: 'Bokong, paha belakang', saran: [3, 12, 'rep'],
    langkah: [
      'Duduk di lantai, punggung atas bersandar di pinggir bangku.',
      'Taruh beban di lipatan pinggul. Pakai bantalan kalau memakai barbel.',
      'Telapak kaki menapak di lantai, selebar bahu.',
      'Dorong pinggul ke atas sampai badan lurus dari bahu ke lutut.',
      'Kencangkan bokong 1 detik di atas, lalu turun pelan.'
    ],
    tips: 'Dagu sedikit menunduk. Jangan melengkungkan punggung bawah di posisi atas.'
  },
  {
    nama: 'Lunges', otot: 'Paha depan, bokong', saran: [3, 10, 'rep/kaki'],
    langkah: [
      'Berdiri tegak. Boleh pegang dumbbell di kedua sisi badan.',
      'Langkahkan satu kaki ke depan dengan langkah lebar.',
      'Turunkan badan sampai kedua lutut menekuk sekitar 90 derajat.',
      'Dorong kaki depan untuk kembali berdiri.',
      'Selesaikan repetisinya, lalu ganti kaki.'
    ],
    tips: 'Badan tetap tegak. Lutut belakang turun pelan, jangan dibenturkan ke lantai.'
  },
  {
    nama: 'Lat pulldown', otot: 'Punggung, lengan depan', saran: [3, 12, 'rep'],
    langkah: [
      'Duduk dan kunci paha di bawah bantalan.',
      'Pegang palang sedikit lebih lebar dari bahu.',
      'Tarik palang ke dada atas sambil membusungkan dada.',
      'Arahkan siku ke bawah, seperti mau memasukkannya ke saku celana.',
      'Naikkan palang pelan sampai lengan lurus lagi.'
    ],
    tips: 'Jangan tarik palang ke belakang kepala. Jangan mengayun badan ke belakang.'
  },
  {
    nama: 'Seated row', otot: 'Punggung tengah, lengan depan', saran: [3, 12, 'rep'],
    langkah: [
      'Duduk di mesin, kaki di pijakan, lutut sedikit ditekuk.',
      'Pegang gagang dengan punggung tegak.',
      'Tarik gagang ke arah perut sambil merapatkan kedua tulang belikat.',
      'Kembalikan pelan sampai lengan lurus.'
    ],
    tips: 'Jangan mengayun badan maju mundur. Bahu tetap turun, jauh dari telinga.'
  },
  {
    nama: 'Dumbbell press', alias: ['Dumbbell bench press'], otot: 'Dada, bahu depan, lengan belakang', saran: [3, 10, 'rep'],
    langkah: [
      'Berbaring di bangku. Pegang dumbbell di samping dada.',
      'Telapak kaki menapak di lantai.',
      'Dorong dumbbell ke atas sampai lengan hampir lurus.',
      'Turunkan pelan sampai dumbbell kembali di samping dada.'
    ],
    tips: 'Siku agak mengarah ke bawah, jangan melebar lurus ke samping. Punggung atas tetap menempel bangku.'
  },
  {
    nama: 'Shoulder press', otot: 'Bahu, lengan belakang', saran: [3, 10, 'rep'],
    langkah: [
      'Duduk tegak di bangku yang punya sandaran.',
      'Pegang dumbbell setinggi bahu, telapak tangan menghadap depan.',
      'Dorong dumbbell ke atas sampai lengan hampir lurus.',
      'Turunkan pelan sampai setinggi bahu lagi.'
    ],
    tips: 'Kencangkan perut. Jangan melengkungkan punggung bawah.'
  },
  {
    nama: 'Romanian deadlift', otot: 'Paha belakang, bokong', saran: [3, 10, 'rep'],
    langkah: [
      'Berdiri, pegang dumbbell atau barbel di depan paha.',
      'Tekuk lutut sedikit, dan jaga tekukannya tetap sama.',
      'Dorong pinggul ke belakang. Turunkan beban dekat dengan kaki.',
      'Turun sampai paha belakang terasa tertarik, biasanya sekitar bawah lutut.',
      'Dorong pinggul ke depan untuk berdiri lagi.'
    ],
    tips: 'Punggung tetap lurus, jangan membungkuk. Beban selalu dekat dengan kaki.'
  },
  {
    nama: 'Leg curl', otot: 'Paha belakang', saran: [3, 12, 'rep'],
    langkah: [
      'Atur mesin supaya bantalan menempel di belakang pergelangan kaki.',
      'Tekuk lutut dan tarik bantalan sejauh yang nyaman.',
      'Tahan sebentar.',
      'Kembalikan pelan.'
    ],
    tips: 'Gerak pelan, jangan dihentak. Pinggul jangan terangkat.'
  },
  {
    nama: 'Glute kickback', otot: 'Bokong', saran: [3, 12, 'rep/kaki'],
    langkah: [
      'Pasang tali di pergelangan kaki pada kabel bagian bawah, atau pakai mesin kickback.',
      'Pegang mesin, badan sedikit condong ke depan.',
      'Dorong kaki ke belakang memakai tenaga bokong.',
      'Tahan sebentar, lalu kembalikan pelan.',
      'Selesaikan satu kaki, lalu ganti kaki.'
    ],
    tips: 'Jangan melengkungkan punggung bawah. Gerakan kecil yang terkontrol lebih baik.'
  },
  {
    nama: 'Calf raise', otot: 'Betis', saran: [3, 15, 'rep'],
    langkah: [
      'Berdiri di pinggir pijakan dengan tumit menggantung. Boleh juga di lantai.',
      'Pegang sesuatu supaya seimbang.',
      'Jinjit setinggi mungkin, tahan 1 detik.',
      'Turunkan tumit pelan sampai sedikit di bawah pijakan.'
    ],
    tips: 'Jangan memantul. Gerak pelan saat naik dan turun.'
  },
  {
    nama: 'Push-up lutut', otot: 'Dada, bahu, lengan belakang', saran: [3, 10, 'rep'],
    langkah: [
      'Taruh tangan di lantai, sedikit lebih lebar dari bahu.',
      'Lutut menempel di lantai. Badan lurus dari kepala sampai lutut.',
      'Tekuk siku, turunkan dada mendekati lantai.',
      'Dorong lantai untuk naik lagi.'
    ],
    tips: 'Pinggul jangan turun atau menungging. Siku agak mengarah ke belakang, jangan melebar.'
  },
  {
    nama: 'Dumbbell row', otot: 'Punggung, lengan depan', saran: [3, 12, 'rep/tangan'],
    langkah: [
      'Taruh satu lutut dan satu tangan di bangku. Punggung datar.',
      'Tangan satunya memegang dumbbell, lengan lurus ke bawah.',
      'Tarik dumbbell ke arah pinggul, siku dekat badan.',
      'Turunkan pelan. Selesai satu sisi, ganti tangan.'
    ],
    tips: 'Jangan memutar badan saat menarik. Punggung tetap datar.'
  },
  {
    nama: 'Biceps curl', otot: 'Lengan depan (biseps)', saran: [3, 12, 'rep'],
    langkah: [
      'Berdiri, pegang dumbbell di kedua sisi, telapak menghadap depan.',
      'Siku menempel di samping badan.',
      'Tekuk siku, angkat dumbbell ke arah bahu.',
      'Turunkan pelan sampai lengan lurus.'
    ],
    tips: 'Jangan mengayun badan. Siku jangan ikut maju.'
  },
  {
    nama: 'Plank', otot: 'Perut, punggung bawah', saran: [3, 30, 'detik'],
    langkah: [
      'Tumpu badan di lengan bawah dan ujung kaki.',
      'Siku tepat di bawah bahu.',
      'Badan lurus dari kepala sampai tumit.',
      'Kencangkan perut dan bokong, lalu tahan sesuai waktu.'
    ],
    tips: 'Pinggul jangan turun atau terlalu naik. Tetap bernapas, jangan ditahan.'
  },
  {
    nama: 'Jalan santai', otot: 'Jantung, bakar lemak', saran: [1, 30, 'menit'],
    langkah: [
      'Jalan dengan kecepatan yang nyaman.',
      'Kecepatannya pas kalau kamu masih bisa mengobrol.',
      'Ayunkan tangan dengan santai.'
    ],
    tips: 'Pakai sepatu yang nyaman.'
  },
  {
    nama: 'Kardio treadmill / sepeda', alias: ['Treadmill', 'Treadmill miring', 'Sepeda', 'Sepeda statis'],
    otot: 'Jantung, kaki, bakar lemak', saran: [1, 30, 'menit'],
    langkah: [
      'Mulai 5 menit dengan pelan untuk pemanasan.',
      'Treadmill: naikkan kemiringan (incline) ke 5-10, lalu jalan 4-5 km/jam.',
      'Sepeda statis: kayuh dengan beban sedang.',
      'Jaga napas: agak terengah, tapi masih bisa bicara pendek.',
      'Akhiri 3-5 menit dengan pelan.'
    ],
    tips: 'Di treadmill, jangan terus berpegangan erat ke pegangan.'
  },
  {
    nama: 'Stretching', otot: 'Kelenturan seluruh badan', saran: [1, 10, 'menit'],
    langkah: [
      'Regangkan paha depan, paha belakang, bokong, dada, dan bahu.',
      'Tahan tiap gerakan 20-30 detik.',
      'Bernapas pelan dan dalam.'
    ],
    tips: 'Jangan memantul. Regangkan sampai terasa tertarik, bukan sakit.'
  },
  {
    nama: 'Leg extension', otot: 'Paha depan', saran: [3, 12, 'rep'],
    langkah: [
      'Duduk di mesin, punggung menempel sandaran.',
      'Bantalan ada di depan pergelangan kaki.',
      'Luruskan kaki sampai hampir lurus, tahan sebentar.',
      'Turunkan pelan.'
    ],
    tips: 'Jangan dihentak. Mulai dengan beban ringan.'
  },
  {
    nama: 'Chest press mesin', alias: ['Chest press'], otot: 'Dada, lengan belakang', saran: [3, 12, 'rep'],
    langkah: [
      'Atur kursi supaya gagang sejajar dada bagian tengah.',
      'Duduk tegak, punggung menempel sandaran.',
      'Dorong gagang ke depan sampai lengan hampir lurus.',
      'Kembalikan pelan.'
    ],
    tips: 'Bahu tetap turun, jangan diangkat ke arah telinga.'
  },
  {
    nama: 'Lateral raise', otot: 'Bahu samping', saran: [3, 12, 'rep'],
    langkah: [
      'Berdiri, pegang dumbbell ringan di samping badan.',
      'Tekuk siku sedikit.',
      'Angkat kedua tangan ke samping sampai setinggi bahu.',
      'Turunkan pelan.'
    ],
    tips: 'Jangan mengayun badan. Pakai beban ringan.'
  },
  {
    nama: 'Triceps pushdown', otot: 'Lengan belakang (triseps)', saran: [3, 12, 'rep'],
    langkah: [
      'Berdiri menghadap mesin kabel, pegang tali atau palang.',
      'Siku menempel di samping badan.',
      'Dorong ke bawah sampai lengan lurus.',
      'Kembalikan pelan sampai siku menekuk sekitar 90 derajat.'
    ],
    tips: 'Siku jangan ikut bergerak. Badan jangan terlalu membungkuk.'
  },
  {
    nama: 'Crunch', otot: 'Perut', saran: [3, 15, 'rep'],
    langkah: [
      'Berbaring telentang, lutut ditekuk, telapak kaki di lantai.',
      'Tangan di dada atau menyentuh samping kepala.',
      'Angkat kepala dan bahu dari lantai dengan mengencangkan perut.',
      'Turunkan pelan.'
    ],
    tips: 'Jangan menarik leher dengan tangan.'
  }
];

/* ---------- Program awal (dari program 1 minggu) ---------- */
function buatId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function programAwal() {
  const g = (nama, set, target, satuan) => ({ id: buatId(), nama, set, target, satuan: satuan || 'rep' });
  return {
    senin: { fokus: 'Kaki & bokong', latihan: [
      g('Goblet squat', 3, 12), g('Leg press', 3, 12), g('Hip thrust', 3, 12), g('Lunges', 3, 10, 'rep/kaki')] },
    selasa: { fokus: 'Badan atas', latihan: [
      g('Lat pulldown', 3, 12), g('Seated row', 3, 12), g('Dumbbell press', 3, 10), g('Shoulder press', 3, 10)] },
    rabu: { fokus: 'Istirahat', latihan: [g('Jalan santai', 1, 30, 'menit')] },
    kamis: { fokus: 'Kaki & bokong', latihan: [
      g('Romanian deadlift', 3, 10), g('Leg curl', 3, 12), g('Glute kickback', 3, 12, 'rep/kaki'), g('Calf raise', 3, 15)] },
    jumat: { fokus: 'Badan atas + perut', latihan: [
      g('Push-up lutut', 3, 10), g('Dumbbell row', 3, 12, 'rep/tangan'), g('Biceps curl', 3, 12), g('Plank', 3, 30, 'detik')] },
    sabtu: { fokus: 'Kardio', latihan: [g('Kardio treadmill / sepeda', 1, 30, 'menit')] },
    minggu: { fokus: 'Istirahat', latihan: [g('Stretching', 1, 10, 'menit')] }
  };
}

/* ---------- Simpan dan muat data ---------- */
function dataBaru() {
  return { program: programAwal(), log: {}, berat: [], profil: { tinggi: null }, pengaturan: { istirahat: 90 } };
}

function muatData() {
  const awal = dataBaru();
  let d = null;
  try { d = JSON.parse(localStorage.getItem(KUNCI)); } catch (e) { d = null; }
  if (!d || typeof d !== 'object') return awal;
  const hasil = {
    program: d.program && typeof d.program === 'object' ? d.program : awal.program,
    log: d.log && typeof d.log === 'object' ? d.log : {},
    berat: Array.isArray(d.berat) ? d.berat : [],
    profil: Object.assign(awal.profil, d.profil),
    pengaturan: Object.assign(awal.pengaturan, d.pengaturan)
  };
  // Lengkapi hari yang hilang supaya aplikasi tidak error
  HARI.forEach(h => {
    if (!hasil.program[h]) hasil.program[h] = { fokus: '', latihan: [] };
    if (!Array.isArray(hasil.program[h].latihan)) hasil.program[h].latihan = [];
  });
  return hasil;
}

let data = muatData();

function simpan() {
  try {
    localStorage.setItem(KUNCI, JSON.stringify(data));
  } catch (e) {
    alert('Data gagal disimpan di HP ini. Coba tutup mode penyamaran (incognito) browser.');
  }
}

/* ---------- Bantuan kecil ---------- */
// Supaya teks ketikan tidak dibaca sebagai kode HTML
function esc(teks) {
  return String(teks == null ? '' : teks).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
// "  Goblet  Squat " -> "goblet squat" (untuk mencocokkan nama gerakan)
function kunciNama(nama) {
  return String(nama || '').trim().toLowerCase().replace(/\s+/g, ' ');
}
// "22,5" atau "22.5" -> 22.5
function bacaAngka(teks) {
  const n = parseFloat(String(teks == null ? '' : teks).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}
// 72.25 -> "72,3"; 80 -> "80"
function tulisAngka(n, digit) {
  return String(parseFloat(Number(n).toFixed(digit == null ? 1 : digit))).replace('.', ',');
}
function formatWaktu(detik) {
  return Math.floor(detik / 60) + ':' + String(detik % 60).padStart(2, '0');
}

/* ---------- Tanggal (pakai jam HP, bukan jam UTC) ---------- */
function keTeksTanggal(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function dariTeksTanggal(teks) {
  const [t, b, h] = teks.split('-').map(Number);
  return new Date(t, b - 1, h);
}
function hariIni() { return keTeksTanggal(new Date()); }
function hariDariTanggal(teks) { return HARI[(dariTeksTanggal(teks).getDay() + 6) % 7]; }
function tanggalPanjang(teks) {
  const d = dariTeksTanggal(teks);
  return NAMA_HARI[hariDariTanggal(teks)] + ', ' + d.getDate() + ' ' + NAMA_BULAN[d.getMonth()] + ' ' + d.getFullYear();
}
function tanggalPendek(teks) {
  const d = dariTeksTanggal(teks);
  return d.getDate() + ' ' + BULAN_PENDEK[d.getMonth()];
}
function tanggalSedang(teks) {
  return tanggalPendek(teks) + ' ' + dariTeksTanggal(teks).getFullYear();
}

function teksTarget(g) {
  return g.set + ' x ' + (g.target == null ? '-' : g.target) + ' ' + g.satuan;
}
function pakaiKg(satuan) {
  return satuan !== 'detik' && satuan !== 'menit';
}
function cariPustaka(nama) {
  const k = kunciNama(nama);
  return PUSTAKA.find(p => kunciNama(p.nama) === k || (p.alias || []).some(a => kunciNama(a) === k)) || null;
}
// Buka / tutup jendela (dialog), dengan cadangan untuk browser lama
function bukaJendela(dlg) {
  if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
}
function tutupJendela(dlg) {
  if (typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open');
}

/* ================================================================
   MENU BAWAH
   ================================================================ */
let tabAktif = 'latihan';

function bukaTab(nama) {
  tabAktif = nama;
  document.querySelectorAll('.menu-bawah button').forEach(b => {
    const aktif = b.dataset.tab === nama;
    b.classList.toggle('aktif', aktif);
    if (aktif) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  document.querySelectorAll('.halaman').forEach(h => h.classList.toggle('aktif', h.id === 'tab-' + nama));
  document.getElementById('judul-halaman').textContent = JUDUL[nama];
  tampilkan(nama);
  window.scrollTo(0, 0);
}

function tampilkan(nama) {
  if (nama === 'latihan') tampilLatihan();
  else if (nama === 'program') tampilProgram();
  else if (nama === 'grafik') tampilGrafik();
  else if (nama === 'kalender') tampilKalender();
  else if (nama === 'gerakan') tampilGerakan();
  else if (nama === 'badan') tampilBadan();
}

/* ================================================================
   LATIHAN: centang set, catat beban, timer istirahat
   ================================================================ */
let tanggalLatihan = hariIni();
let pilihTanggalSendiri = false; // true kalau tanggal dipilih manual

// Program hari apa yang dipakai di tanggal ini (bisa diganti manual)
function hariProgramUntuk(tgl) {
  const c = data.log[tgl];
  return c && HARI.includes(c.hari) ? c.hari : hariDariTanggal(tgl);
}

// Gabungkan program hari itu dengan catatan yang sudah ada di tanggal itu
function susunDaftarLatihan(tgl) {
  const hari = hariProgramUntuk(tgl);
  const c = data.log[tgl];
  const isiLog = (c && c.item) || {};
  const hasil = data.program[hari].latihan.map(g => {
    const log = isiLog[g.id];
    const banyak = Math.max(g.set, log && log.set ? log.set.length : 0);
    const baris = [];
    for (let i = 0; i < banyak; i++) baris.push(log && log.set && log.set[i] ? log.set[i] : null);
    return { id: g.id, nama: g.nama, satuan: g.satuan, target: g.target, set: g.set, baris };
  });
  // Gerakan yang sudah dicentang di tanggal ini tapi sudah tidak ada di program
  Object.keys(isiLog).forEach(id => {
    if (hasil.some(h => h.id === id)) return;
    const log = isiLog[id];
    if (!log.set || !log.set.some(s => s && s.selesai)) return;
    hasil.push({ id, nama: log.nama, satuan: log.satuan, target: log.target, set: log.set.length, baris: log.set.slice() });
  });
  return hasil;
}

// Catatan terakhir sebuah gerakan sebelum tanggal tertentu (hanya set yang dicentang)
function catatanTerakhir(nama, sebelumTgl) {
  const k = kunciNama(nama);
  const daftarTgl = Object.keys(data.log).filter(t => t < sebelumTgl).sort().reverse();
  for (const t of daftarTgl) {
    const item = data.log[t].item || {};
    for (const id of Object.keys(item)) {
      const g = item[id];
      if (kunciNama(g.nama) !== k || !g.set) continue;
      const selesai = g.set.filter(s => s && s.selesai);
      if (selesai.length) return { tanggal: t, set: selesai };
    }
  }
  return null;
}

function teksTerakhir(t) {
  const pakaiBeban = t.set.filter(s => s.kg != null && s.kg > 0);
  if (!pakaiBeban.length) return tanggalPendek(t.tanggal) + ': ' + t.set.length + ' set';
  const berat = pakaiBeban.reduce((a, b) => (b.kg > a.kg ? b : a));
  return tanggalPendek(t.tanggal) + ': ' + tulisAngka(berat.kg, 2) + ' kg x ' + (berat.jumlah == null ? '-' : berat.jumlah);
}

// Isi kotak kg dan rep tiap set. Set yang belum dicatat diisi otomatis
// dari set sebelumnya hari ini, atau dari latihan terakhir.
function nilaiBaris(item, terakhir) {
  let kgSebelum = null;
  return item.baris.map((b, i) => {
    let kg, jumlah, selesai;
    if (b) {
      kg = b.kg; jumlah = b.jumlah; selesai = !!b.selesai;
    } else {
      kg = kgSebelum;
      if (kg == null && terakhir) {
        const s = terakhir.set[i] || terakhir.set[terakhir.set.length - 1];
        kg = s.kg;
      }
      jumlah = item.target;
      selesai = false;
    }
    if (kg != null) kgSebelum = kg;
    return { kg: kg == null ? null : kg, jumlah: jumlah == null ? null : jumlah, selesai };
  });
}

function htmlBaris(item, i, n) {
  const denganKg = pakaiKg(item.satuan);
  const satuanJumlah = denganKg ? 'rep' : item.satuan;
  const kg = n.kg == null ? '' : tulisAngka(n.kg, 2);
  const jumlah = n.jumlah == null ? '' : n.jumlah;
  const id = esc(item.id);
  return `
        <div class="baris-set${denganKg ? '' : ' tanpa-kg'}${n.selesai ? ' selesai' : ''}">
          <span class="no-set">${i + 1}</span>
          ${denganKg ? `<label class="mini"><input type="text" inputmode="decimal" data-id="${id}" data-set="${i}" data-kolom="kg" value="${kg}" placeholder="0" aria-label="Beban set ${i + 1} (kg)"><span>kg</span></label>` : ''}
          <label class="mini"><input type="text" inputmode="numeric" data-id="${id}" data-set="${i}" data-kolom="jumlah" value="${jumlah}" aria-label="Jumlah ${satuanJumlah} set ${i + 1}"><span>${satuanJumlah}</span></label>
          <button type="button" class="centang" data-aksi="centang" data-id="${id}" data-set="${i}" aria-pressed="${n.selesai}" aria-label="Set ${i + 1} selesai">${IKON_CENTANG}</button>
        </div>`;
}

function tandaiPilihanIstirahat() {
  document.querySelectorAll('#pilih-istirahat button').forEach(b => {
    b.classList.toggle('aktif', Number(b.dataset.detik) === data.pengaturan.istirahat);
  });
}

function tampilLatihan() {
  const tgl = tanggalLatihan;
  document.getElementById('l-tanggal').value = tgl;
  document.getElementById('btn-hari-ini').hidden = tgl === hariIni();
  const hari = hariProgramUntuk(tgl);
  const pilih = document.getElementById('l-hari');
  pilih.innerHTML = HARI.map(h => {
    const fokus = data.program[h].fokus;
    return `<option value="${h}">${NAMA_HARI[h]}${fokus ? ' - ' + esc(fokus) : ''}</option>`;
  }).join('');
  pilih.value = hari;
  tandaiPilihanIstirahat();

  const daftar = susunDaftarLatihan(tgl);
  const ringkas = document.getElementById('ringkasan-latihan');
  const kotak = document.getElementById('daftar-latihan');
  if (!daftar.length) {
    ringkas.innerHTML = '';
    kotak.innerHTML = `
      <div class="kotak kosong">
        <p>Belum ada gerakan di program ${NAMA_HARI[hari]}.</p>
        <button type="button" class="btn utama" data-aksi="ke-program">Atur di menu Program</button>
      </div>`;
    return;
  }

  let total = 0;
  let beres = 0;
  kotak.innerHTML = daftar.map(item => {
    const terakhir = catatanTerakhir(item.nama, tgl);
    const nilai = nilaiBaris(item, terakhir);
    const jumlahBeres = nilai.filter(n => n.selesai).length;
    total += nilai.length;
    beres += jumlahBeres;
    const semua = nilai.length > 0 && jumlahBeres === nilai.length;
    const adaCara = cariPustaka(item.nama);
    return `
      <article class="kartu-latihan${semua ? ' selesai' : ''}">
        <div class="kepala-latihan">
          <div class="nama">
            <b>${esc(item.nama)}${semua ? ' <span class="lencana hijau">Selesai</span>' : ''}</b>
            <small>${esc(teksTarget(item))}${terakhir ? ' · Terakhir ' + esc(teksTerakhir(terakhir)) : ''}</small>
          </div>
          ${adaCara ? `<button type="button" class="btn kecil" data-aksi="cara" data-nama="${esc(item.nama)}">Cara</button>` : ''}
        </div>
        ${nilai.map((n, i) => htmlBaris(item, i, n)).join('')}
      </article>`;
  }).join('');

  const persen = total ? Math.round(beres / total * 100) : 0;
  const semuaBeres = total > 0 && beres === total;
  ringkas.innerHTML = `
    <div class="ringkasan${semuaBeres ? ' beres' : ''}">
      <p>${semuaBeres ? 'Semua set selesai. Mantap!' : beres + ' dari ' + total + ' set selesai'}</p>
      <div class="batang"><div class="isi" style="width:${persen}%"></div></div>
    </div>`;
}

function cariInput(id, i, kolom) {
  const semua = document.querySelectorAll('#daftar-latihan input[data-kolom]');
  for (const el of semua) {
    if (el.dataset.id === id && Number(el.dataset.set) === i && el.dataset.kolom === kolom) return el;
  }
  return null;
}

// Simpan semua set satu gerakan dari kotak isian. iCentang = set yang dicentang / dibatalkan.
function simpanKartu(id, iCentang) {
  const tgl = tanggalLatihan;
  const item = susunDaftarLatihan(tgl).find(x => x.id === id);
  if (!item) return null;
  if (!data.log[tgl]) data.log[tgl] = { hari: hariProgramUntuk(tgl), item: {} };
  const c = data.log[tgl];
  if (!c.item) c.item = {};
  const lama = c.item[id];
  const set = item.baris.map((b, i) => {
    const kgEl = cariInput(id, i, 'kg');
    const jmlEl = cariInput(id, i, 'jumlah');
    const selesaiLama = !!(lama && lama.set && lama.set[i] && lama.set[i].selesai);
    let kg = kgEl ? bacaAngka(kgEl.value) : null;
    if (kg != null) kg = kg < 0 ? null : Math.round(kg * 100) / 100;
    let jumlah = jmlEl ? bacaAngka(jmlEl.value) : null;
    if (jumlah != null) jumlah = jumlah < 0 ? null : Math.round(jumlah);
    return { kg, jumlah, selesai: i === iCentang ? !selesaiLama : selesaiLama };
  });
  c.item[id] = { nama: item.nama, satuan: item.satuan, target: item.target, set };
  simpan();
  return iCentang == null ? null : set[iCentang].selesai;
}

function sisaSet(tgl) {
  let sisa = 0;
  susunDaftarLatihan(tgl).forEach(item => {
    item.baris.forEach(b => { if (!b || !b.selesai) sisa++; });
  });
  return sisa;
}

/* ---------- Timer istirahat ---------- */
const timer = { akhir: 0, total: 0, jalan: null, tutup: null };
let suara = null;

// Suara harus "dinyalakan" saat jari menekan tombol (aturan browser HP)
function siapkanSuara() {
  try {
    if (!suara) {
      const KelasSuara = window.AudioContext || window.webkitAudioContext;
      if (KelasSuara) suara = new KelasSuara();
    }
    if (suara && suara.state === 'suspended') suara.resume();
  } catch (e) {
    suara = null;
  }
}

function bunyi() {
  if (!suara) return;
  try {
    const mulai = suara.currentTime;
    [0, 0.3, 0.6].forEach(jeda => {
      const osc = suara.createOscillator();
      const vol = suara.createGain();
      osc.frequency.value = 880;
      vol.gain.setValueAtTime(0.25, mulai + jeda);
      vol.gain.exponentialRampToValueAtTime(0.001, mulai + jeda + 0.2);
      osc.connect(vol);
      vol.connect(suara.destination);
      osc.start(mulai + jeda);
      osc.stop(mulai + jeda + 0.2);
    });
  } catch (e) { /* HP tanpa suara: tidak apa-apa */ }
}

function getar() {
  if (navigator.vibrate) navigator.vibrate([300, 150, 300]);
}

function mulaiIstirahat(detik) {
  clearInterval(timer.jalan);
  clearTimeout(timer.tutup);
  timer.total = detik;
  timer.akhir = Date.now() + detik * 1000;
  const el = document.getElementById('timer');
  el.classList.remove('beres');
  document.getElementById('timer-label').textContent = 'Istirahat';
  el.hidden = false;
  timer.jalan = setInterval(detakTimer, 250);
  detakTimer();
}

function detakTimer() {
  if (!timer.jalan) return;
  const sisaMs = timer.akhir - Date.now();
  const sisa = Math.max(0, Math.ceil(sisaMs / 1000));
  document.getElementById('timer-angka').textContent = formatWaktu(sisa);
  const persen = timer.total ? Math.max(0, Math.min(100, sisaMs / (timer.total * 1000) * 100)) : 0;
  document.getElementById('timer-isi').style.width = persen + '%';
  if (sisaMs <= 0) selesaiIstirahat();
}

function selesaiIstirahat() {
  clearInterval(timer.jalan);
  timer.jalan = null;
  const el = document.getElementById('timer');
  el.classList.add('beres');
  document.getElementById('timer-label').textContent = 'Waktunya set berikutnya';
  document.getElementById('timer-angka').textContent = '0:00';
  document.getElementById('timer-isi').style.width = '0%';
  bunyi();
  getar();
  timer.tutup = setTimeout(() => { el.hidden = true; }, 6000);
}

function hentikanTimer() {
  clearInterval(timer.jalan);
  clearTimeout(timer.tutup);
  timer.jalan = null;
  document.getElementById('timer').hidden = true;
}

function ubahTimer(detik) {
  if (!timer.jalan) return;
  timer.akhir += detik * 1000;
  const sisa = (timer.akhir - Date.now()) / 1000;
  if (sisa > timer.total) timer.total = Math.ceil(sisa);
  detakTimer();
}

/* ================================================================
   PROGRAM: atur gerakan tiap hari
   ================================================================ */
function tampilProgram() {
  const hariSekarang = hariDariTanggal(hariIni());
  document.getElementById('daftar-program').innerHTML = HARI.map(h => {
    const p = data.program[h];
    const isi = p.latihan.length
      ? p.latihan.map((g, i) => `
          <li class="item-program">
            <div class="item-teks"><b>${esc(g.nama)}</b><small>${esc(teksTarget(g))}</small></div>
            <div class="item-tombol">
              <button type="button" class="btn ikon" data-aksi="naik" data-hari="${h}" data-i="${i}" aria-label="Pindah ke atas"${i === 0 ? ' disabled' : ''}>&uarr;</button>
              <button type="button" class="btn ikon" data-aksi="turun" data-hari="${h}" data-i="${i}" aria-label="Pindah ke bawah"${i === p.latihan.length - 1 ? ' disabled' : ''}>&darr;</button>
              <button type="button" class="btn kecil" data-aksi="ubah" data-hari="${h}" data-i="${i}">Ubah</button>
              <button type="button" class="btn kecil bahaya" data-aksi="hapus" data-hari="${h}" data-i="${i}">Hapus</button>
            </div>
          </li>`).join('')
      : '<li class="kosong">Belum ada gerakan.</li>';
    return `
      <section class="kartu-hari${h === hariSekarang ? ' hari-ini' : ''}">
        <h2>${NAMA_HARI[h]}${h === hariSekarang ? ' <span class="lencana">Hari ini</span>' : ''}</h2>
        <label>Fokus
          <input type="text" data-aksi="fokus" data-hari="${h}" value="${esc(p.fokus)}" placeholder="Contoh: Kaki & bokong">
        </label>
        <ul class="list-program">${isi}</ul>
        <button type="button" class="btn penuh" data-aksi="tambah" data-hari="${h}">+ Tambah gerakan</button>
      </section>`;
  }).join('');
}

let editGerakan = null; // { hari, i } ; i = null berarti tambah baru

function bukaFormGerakan(hari, i) {
  editGerakan = { hari, i };
  const g = i == null ? null : data.program[hari].latihan[i];
  document.getElementById('dlg-judul').textContent = (g ? 'Ubah gerakan' : 'Tambah gerakan') + ' - ' + NAMA_HARI[hari];
  document.getElementById('f-nama').value = g ? g.nama : '';
  document.getElementById('f-set').value = g ? g.set : 3;
  document.getElementById('f-target').value = g ? g.target : 12;
  document.getElementById('f-satuan').value = g ? g.satuan : 'rep';
  document.getElementById('f-pesan').textContent = '';
  bukaJendela(document.getElementById('dlg-gerakan'));
}

function simpanFormGerakan() {
  const nama = document.getElementById('f-nama').value.trim().replace(/\s+/g, ' ');
  const set = Math.round(bacaAngka(document.getElementById('f-set').value));
  const target = Math.round(bacaAngka(document.getElementById('f-target').value));
  let satuan = document.getElementById('f-satuan').value;
  if (!SATUAN.includes(satuan)) satuan = 'rep';
  const pesan = document.getElementById('f-pesan');
  if (!nama) { pesan.textContent = 'Nama gerakan belum diisi.'; return; }
  if (!(set >= 1 && set <= 10)) { pesan.textContent = 'Jumlah set harus 1 sampai 10.'; return; }
  if (!(target >= 1 && target <= 999)) { pesan.textContent = 'Target harus angka 1 sampai 999.'; return; }
  const list = data.program[editGerakan.hari].latihan;
  if (editGerakan.i == null) list.push({ id: buatId(), nama, set, target, satuan });
  else Object.assign(list[editGerakan.i], { nama, set, target, satuan });
  simpan();
  tutupJendela(document.getElementById('dlg-gerakan'));
  tampilProgram();
}

/* ================================================================
   GRAFIK KEMAJUAN
   ================================================================ */
let gerakanGrafik = null;

// Beban terberat tiap tanggal untuk tiap gerakan
function dataKemajuan() {
  const hasil = {};
  Object.keys(data.log).sort().forEach(t => {
    const item = data.log[t].item || {};
    Object.keys(item).forEach(id => {
      const g = item[id];
      const selesai = (g.set || []).filter(s => s && s.selesai && s.kg != null && s.kg > 0);
      if (!selesai.length) return;
      const terberat = selesai.reduce((a, b) => (b.kg > a.kg ? b : a));
      const k = kunciNama(g.nama);
      if (!hasil[k]) hasil[k] = { nama: g.nama, titik: [] };
      hasil[k].nama = g.nama;
      const ada = hasil[k].titik.find(x => x.tanggal === t);
      if (!ada) hasil[k].titik.push({ tanggal: t, kg: terberat.kg, jumlah: terberat.jumlah });
      else if (terberat.kg > ada.kg) { ada.kg = terberat.kg; ada.jumlah = terberat.jumlah; }
    });
  });
  return hasil;
}

// Jarak garis bantu yang enak dibaca: 1, 2, 2.5, 5, 10, ...
function langkahRapi(jarak, jumlah) {
  const kasar = jarak / jumlah;
  const pangkat = Math.pow(10, Math.floor(Math.log10(kasar)));
  const n = kasar / pangkat;
  const rapi = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return rapi * pangkat;
}

// Gambar grafik garis. titik = [{ label, nilai, tanggal }]
// Kalau ada tanggal, jarak antar titik mengikuti jarak hari.
function grafikGaris(titik, satuan) {
  const L = 340, T = 210, kiri = 44, kanan = 18, atas = 16, bawah = 34;
  const nilai = titik.map(t => t.nilai);
  const lo = Math.min(...nilai);
  const hi = Math.max(...nilai);
  // Rentang minimal 2 kg supaya perubahan kecil tidak terlihat terlalu curam
  const step = langkahRapi(Math.max(hi - lo, 2), 4);
  let min = Math.floor(lo / step) * step;
  let max = Math.ceil(hi / step) * step;
  if (max - min < step / 2) { min -= step; max += step; }
  const lebar = L - kiri - kanan;
  const tinggi = T - atas - bawah;
  const pakaiTanggal = titik.every(t => t.tanggal);
  const hariKe = i => (pakaiTanggal ? Math.round(dariTeksTanggal(titik[i].tanggal).getTime() / 86400000) : i);
  const rentang = hariKe(titik.length - 1) - hariKe(0);
  const x = i => (rentang <= 0 ? kiri + lebar / 2 : kiri + (hariKe(i) - hariKe(0)) * lebar / rentang);
  const y = v => atas + (max - v) * tinggi / (max - min);

  let bantu = '';
  const banyak = Math.round((max - min) / step);
  for (let k = 0; k <= banyak; k++) {
    const v = min + k * step;
    const yy = y(v).toFixed(1);
    bantu += `<line class="g-bantu" x1="${kiri}" x2="${L - kanan}" y1="${yy}" y2="${yy}"/>` +
      `<text class="g-angka" x="${kiri - 6}" y="${(Number(yy) + 4).toFixed(1)}" text-anchor="end">${tulisAngka(v, 2)}</text>`;
  }
  const poin = titik.map((t, i) => x(i).toFixed(1) + ',' + y(t.nilai).toFixed(1)).join(' ');
  const bulatan = titik.map((t, i) =>
    `<circle class="g-titik" cx="${x(i).toFixed(1)}" cy="${y(t.nilai).toFixed(1)}" r="4"><title>${esc(t.label)}: ${tulisAngka(t.nilai, 2)} ${satuan}</title></circle>`).join('');
  // Label tanggal: awal, akhir, dan satu di tengah kalau tidak bertabrakan
  const terakhir = titik.length - 1;
  const urutLabel = [0];
  if (terakhir > 0) {
    let iTengah = -1;
    let jarakTerdekat = Infinity;
    for (let i = 1; i < terakhir; i++) {
      const d = Math.abs(x(i) - (kiri + lebar / 2));
      if (d < jarakTerdekat) { jarakTerdekat = d; iTengah = i; }
    }
    if (iTengah > 0 && x(iTengah) - x(0) >= 70 && x(terakhir) - x(iTengah) >= 70) urutLabel.push(iTengah);
    urutLabel.push(terakhir);
  }
  const label = urutLabel.map(i => {
    const posisi = titik.length === 1 ? 'middle' : i === 0 ? 'start' : i === terakhir ? 'end' : 'middle';
    return `<text class="g-angka" x="${x(i).toFixed(1)}" y="${T - 10}" text-anchor="${posisi}">${esc(titik[i].label)}</text>`;
  }).join('');
  return `<svg class="grafik" viewBox="0 0 ${L} ${T}" role="img" aria-label="Grafik ${esc(satuan)}">${bantu}<polyline class="g-garis" points="${poin}"/>${bulatan}${label}</svg>`;
}

function tampilGrafik() {
  const semua = dataKemajuan();
  const kunci = Object.keys(semua).sort((a, b) => semua[a].nama.localeCompare(semua[b].nama));
  const label = document.getElementById('g-label');
  const isi = document.getElementById('isi-grafik');
  if (!kunci.length) {
    label.hidden = true;
    isi.innerHTML = '<div class="info">Belum ada data. Di menu Latihan, isi beban (kg) lalu centang set. Grafiknya muncul di sini.</div>';
    return;
  }
  label.hidden = false;
  if (!gerakanGrafik || !semua[gerakanGrafik]) gerakanGrafik = kunci[0];
  const pilih = document.getElementById('g-gerakan');
  pilih.innerHTML = kunci.map(k => `<option value="${esc(k)}">${esc(semua[k].nama)}</option>`).join('');
  pilih.value = gerakanGrafik;

  const titik = semua[gerakanGrafik].titik;
  const awal = titik[0];
  const akhir = titik[titik.length - 1];
  const rekor = titik.reduce((a, b) => (b.kg > a.kg ? b : a));
  const selisih = akhir.kg - awal.kg;
  const teksSelisih = titik.length < 2 ? 'Catatan pertama'
    : selisih > 0 ? 'Naik ' + tulisAngka(selisih, 2) + ' kg'
      : selisih < 0 ? 'Turun ' + tulisAngka(-selisih, 2) + ' kg' : 'Sama dengan awal';
  isi.innerHTML = `
    <div class="kartu-angka tiga">
      <div class="angka"><span>Awal</span><b>${tulisAngka(awal.kg, 2)} kg</b><small>${tanggalPendek(awal.tanggal)}</small></div>
      <div class="angka"><span>Terakhir</span><b>${tulisAngka(akhir.kg, 2)} kg</b><small>${teksSelisih}</small></div>
      <div class="angka"><span>Rekor</span><b>${tulisAngka(rekor.kg, 2)} kg</b><small>${tanggalPendek(rekor.tanggal)}</small></div>
    </div>
    ${titik.length > 1
      ? grafikGaris(titik.map(t => ({ label: tanggalPendek(t.tanggal), nilai: t.kg, tanggal: t.tanggal })), 'kg')
      : '<p class="info-kecil">Garis grafik muncul setelah ada catatan di 2 hari berbeda.</p>'}
    <h3>Riwayat beban terberat</h3>
    <table class="tabel-riwayat">
      <thead><tr><th>Tanggal</th><th>Beban x rep</th></tr></thead>
      <tbody>${titik.slice().reverse().map(t =>
        `<tr><td>${tanggalSedang(t.tanggal)}</td><td>${tulisAngka(t.kg, 2)} kg x ${t.jumlah == null ? '-' : t.jumlah}</td></tr>`).join('')}</tbody>
    </table>`;
}

/* ================================================================
   KALENDER LATIHAN
   ================================================================ */
const sekarang = new Date();
const bulanKalender = { tahun: sekarang.getFullYear(), bulan: sekarang.getMonth() };
let tanggalDipilih = null;

// Tanggal yang punya minimal 1 set dicentang
function tanggalLatihanSemua() {
  const hasil = new Set();
  Object.keys(data.log).forEach(t => {
    const item = data.log[t].item || {};
    if (Object.keys(item).some(id => (item[id].set || []).some(s => s && s.selesai))) hasil.add(t);
  });
  return hasil;
}

function tampilKalender() {
  const { tahun, bulan } = bulanKalender;
  document.getElementById('k-judul').textContent = NAMA_BULAN[bulan] + ' ' + tahun;
  const ada = tanggalLatihanSemua();
  const geser = (new Date(tahun, bulan, 1).getDay() + 6) % 7;
  const banyakHari = new Date(tahun, bulan + 1, 0).getDate();
  const hariIniTeks = hariIni();
  let html = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(h => `<div class="k-nama">${h}</div>`).join('');
  for (let i = 0; i < geser; i++) html += '<div></div>';
  let hitung = 0;
  for (let d = 1; d <= banyakHari; d++) {
    const t = keTeksTanggal(new Date(tahun, bulan, d));
    const latihan = ada.has(t);
    if (latihan) hitung++;
    const kelas = 'k-hari' + (latihan ? ' latihan' : '') + (t === hariIniTeks ? ' hari-ini' : '') + (t === tanggalDipilih ? ' dipilih' : '');
    html += `<button type="button" class="${kelas}" data-tanggal="${t}" aria-label="${tanggalPanjang(t)}${latihan ? ', ada latihan' : ''}">${d}</button>`;
  }
  document.getElementById('k-grid').innerHTML = html;
  document.getElementById('k-jumlah').textContent = NAMA_BULAN[bulan] + ': ' + hitung + ' hari latihan';
  tampilDetailTanggal();
}

function ringkasSet(g, set) {
  return set.map(s => (pakaiKg(g.satuan)
    ? (s.kg != null ? tulisAngka(s.kg, 2) + ' kg' : 'tanpa beban') + ' x ' + (s.jumlah == null ? '-' : s.jumlah)
    : (s.jumlah == null ? '-' : s.jumlah) + ' ' + g.satuan)).join(', ');
}

function tampilDetailTanggal() {
  const el = document.getElementById('k-detail');
  if (!tanggalDipilih) {
    el.innerHTML = '<p class="info-kecil">Tap tanggal untuk melihat isi latihannya.</p>';
    return;
  }
  const c = data.log[tanggalDipilih];
  const item = c && c.item ? c.item : {};
  const selesai = Object.keys(item)
    .map(id => ({ g: item[id], set: (item[id].set || []).filter(s => s && s.selesai) }))
    .filter(x => x.set.length);
  const isi = selesai.length
    ? `<ul class="list-detail">${selesai.map(x => `<li><b>${esc(x.g.nama)}</b><span>${esc(ringkasSet(x.g, x.set))}</span></li>`).join('')}</ul>`
    : '<p class="info-kecil">Belum ada set yang dicentang di tanggal ini.</p>';
  el.innerHTML = `
    <div class="kotak">
      <h3>${tanggalPanjang(tanggalDipilih)}</h3>
      ${isi}
      <button type="button" class="btn utama penuh" data-aksi="buka-latihan">Buka di menu Latihan</button>
    </div>`;
}

/* ================================================================
   DAFTAR GERAKAN
   ================================================================ */
function htmlCara(p) {
  return `<ol>${p.langkah.map(l => `<li>${esc(l)}</li>`).join('')}</ol>` +
    (p.tips ? `<p class="tips"><b>Tips:</b> ${esc(p.tips)}</p>` : '');
}

function tampilGerakan() {
  const cari = kunciNama(document.getElementById('c-gerakan').value);
  const daftar = PUSTAKA.filter(p => !cari || kunciNama(p.nama).includes(cari) || kunciNama(p.otot).includes(cari));
  document.getElementById('daftar-gerakan').innerHTML = daftar.length
    ? daftar.map(p => `
        <details class="kartu-gerakan">
          <summary><span class="judul"><b>${esc(p.nama)}</b><small>${esc(p.otot)}</small></span></summary>
          <div class="isi-cara">${htmlCara(p)}</div>
        </details>`).join('')
    : '<p class="info-kecil">Gerakan tidak ditemukan.</p>';
}

function bukaCara(nama) {
  const p = cariPustaka(nama);
  if (!p) return;
  document.getElementById('cara-judul').textContent = p.nama;
  document.getElementById('cara-isi').innerHTML = `<p class="info-kecil">Otot: ${esc(p.otot)}</p>` + htmlCara(p);
  bukaJendela(document.getElementById('dlg-cara'));
}

/* ================================================================
   BERAT BADAN DAN BERAT IDEAL
   ================================================================ */
function beratUrut() {
  return data.berat.slice().sort((a, b) => a.tanggal.localeCompare(b.tanggal));
}

function tampilBadan() {
  const tglEl = document.getElementById('b-tanggal');
  if (!tglEl.value) tglEl.value = hariIni();
  const daftar = beratUrut();
  const el = document.getElementById('isi-berat');
  if (!daftar.length) {
    el.innerHTML = '<p class="info-kecil">Belum ada catatan. Timbang badan, lalu simpan di atas.</p>';
  } else {
    const awal = daftar[0];
    const akhir = daftar[daftar.length - 1];
    const selisih = akhir.kg - awal.kg;
    const teksSelisih = selisih < 0 ? 'Turun ' + tulisAngka(-selisih) + ' kg'
      : selisih > 0 ? 'Naik ' + tulisAngka(selisih) + ' kg' : 'Tetap';
    el.innerHTML = `
      <div class="kartu-angka">
        <div class="angka"><span>Berat terakhir</span><b>${tulisAngka(akhir.kg)} kg</b><small>${tanggalPendek(akhir.tanggal)}</small></div>
        ${daftar.length > 1 ? `<div class="angka"><span>Perubahan</span><b>${teksSelisih}</b><small>sejak ${tanggalPendek(awal.tanggal)}</small></div>` : ''}
      </div>
      ${daftar.length > 1
        ? grafikGaris(daftar.map(b => ({ label: tanggalPendek(b.tanggal), nilai: b.kg, tanggal: b.tanggal })), 'kg')
        : '<p class="info-kecil">Grafik muncul setelah ada 2 catatan.</p>'}
      <details class="riwayat">
        <summary>Riwayat berat badan (${daftar.length} catatan)</summary>
        <ul class="list-berat">${daftar.slice().reverse().map(b => `
          <li><span>${tanggalPanjang(b.tanggal)}</span><b>${tulisAngka(b.kg)} kg</b>
            <button type="button" class="btn kecil bahaya" data-aksi="hapus-berat" data-tanggal="${esc(b.tanggal)}">Hapus</button></li>`).join('')}
        </ul>
      </details>`;
  }
  tampilIdeal();
}

// Patokan IMT Kemenkes RI
function kategoriImt(imt) {
  if (imt < 17) return { nama: 'Kurus (berat)', kelas: 'kat-kurus' };
  if (imt < 18.5) return { nama: 'Kurus (ringan)', kelas: 'kat-kurus' };
  if (imt <= 25) return { nama: 'Normal', kelas: 'kat-normal' };
  if (imt <= 27) return { nama: 'Gemuk (ringan)', kelas: 'kat-gemuk' };
  return { nama: 'Gemuk (berat)', kelas: 'kat-sangat' };
}

function skalaImt(imt) {
  const MIN = 15, MAX = 32;
  const posisi = v => ((Math.min(MAX, Math.max(MIN, v)) - MIN) / (MAX - MIN) * 100).toFixed(1) + '%';
  const bagian = [[15, 17, '#8fb3ea'], [17, 18.5, '#bcd3f3'], [18.5, 25, '#3aa76d'], [25, 27, '#f2c14e'], [27, 32, '#e8893a']];
  return `
    <div class="skala" aria-hidden="true">
      <div class="skala-warna">${bagian.map(([a, b, w]) => `<i style="width:${((b - a) / (MAX - MIN) * 100).toFixed(2)}%;background:${w}"></i>`).join('')}</div>
      ${[17, 18.5, 25, 27].map(v => `<span class="skala-angka" style="left:${posisi(v)}">${tulisAngka(v)}</span>`).join('')}
      <div class="skala-penanda" style="left:${posisi(imt)}"></div>
    </div>`;
}

function tampilIdeal() {
  const tinggiEl = document.getElementById('i-tinggi');
  if (document.activeElement !== tinggiEl) tinggiEl.value = data.profil.tinggi ? tulisAngka(data.profil.tinggi) : '';
  const el = document.getElementById('isi-ideal');
  const tinggi = data.profil.tinggi;
  if (!tinggi) {
    el.innerHTML = '<p class="info-kecil">Isi tinggi badan untuk melihat berat idealmu.</p>';
    return;
  }
  const m = tinggi / 100;
  const bawah = 18.5 * m * m;
  const atas = 25 * m * m;
  const daftar = beratUrut();
  const terakhir = daftar[daftar.length - 1];
  let html = `<div class="angka"><span>Berat normal untuk tinggi ${tulisAngka(tinggi)} cm</span><b>${tulisAngka(bawah)} - ${tulisAngka(atas)} kg</b></div>`;
  if (!terakhir) {
    html += '<p class="info-kecil">Catat berat badan di atas untuk melihat IMT (indeks massa tubuh) kamu.</p>';
  } else {
    const imt = Math.round(terakhir.kg / (m * m) * 10) / 10;
    const kat = kategoriImt(imt);
    let saran;
    if (terakhir.kg > atas) saran = 'Turun ' + tulisAngka(terakhir.kg - atas) + ' kg lagi untuk masuk berat normal.';
    else if (terakhir.kg < bawah) saran = 'Naik ' + tulisAngka(bawah - terakhir.kg) + ' kg lagi untuk masuk berat normal.';
    else saran = 'Beratmu sudah di rentang normal.';
    html += `
      <div class="hasil-imt">
        <div><span>IMT kamu</span><b>${tulisAngka(imt)}</b></div>
        <span class="kategori ${kat.kelas}">${kat.nama}</span>
      </div>
      ${skalaImt(imt)}
      <p class="saran-berat">${saran}</p>
      <p class="info-kecil">Dihitung dari berat terakhir ${tulisAngka(terakhir.kg)} kg (${tanggalPendek(terakhir.tanggal)}).</p>`;
  }
  html += '<p class="info-kecil">Patokan IMT dari Kemenkes RI. IMT tidak membedakan otot dan lemak.</p>';
  el.innerHTML = html;
}

/* ================================================================
   PASANG SEMUA TOMBOL
   ================================================================ */
function pasangTombol() {
  // Menu bawah
  document.querySelector('.menu-bawah').addEventListener('click', e => {
    const b = e.target.closest('button[data-tab]');
    if (b) bukaTab(b.dataset.tab);
  });

  // --- Latihan ---
  document.getElementById('l-tanggal').addEventListener('change', e => {
    tanggalLatihan = e.target.value || hariIni();
    pilihTanggalSendiri = tanggalLatihan !== hariIni();
    tampilLatihan();
  });
  document.getElementById('btn-hari-ini').addEventListener('click', () => {
    tanggalLatihan = hariIni();
    pilihTanggalSendiri = false;
    tampilLatihan();
  });
  document.getElementById('l-hari').addEventListener('change', e => {
    const tgl = tanggalLatihan;
    if (!data.log[tgl]) data.log[tgl] = { hari: e.target.value, item: {} };
    else data.log[tgl].hari = e.target.value;
    simpan();
    tampilLatihan();
  });
  document.getElementById('pilih-istirahat').addEventListener('click', e => {
    const b = e.target.closest('button[data-detik]');
    if (!b) return;
    data.pengaturan.istirahat = Number(b.dataset.detik);
    simpan();
    tandaiPilihanIstirahat();
  });
  document.getElementById('btn-mulai-istirahat').addEventListener('click', () => {
    siapkanSuara();
    mulaiIstirahat(data.pengaturan.istirahat);
  });

  const kotakLatihan = document.getElementById('daftar-latihan');
  kotakLatihan.addEventListener('click', e => {
    const b = e.target.closest('button[data-aksi]');
    if (!b) return;
    if (b.dataset.aksi === 'centang') {
      siapkanSuara();
      const selesai = simpanKartu(b.dataset.id, Number(b.dataset.set));
      tampilLatihan();
      if (selesai) {
        if (sisaSet(tanggalLatihan) > 0) mulaiIstirahat(data.pengaturan.istirahat);
        else { hentikanTimer(); getar(); }
      }
    } else if (b.dataset.aksi === 'cara') {
      bukaCara(b.dataset.nama);
    } else if (b.dataset.aksi === 'ke-program') {
      bukaTab('program');
    }
  });
  kotakLatihan.addEventListener('change', e => {
    const input = e.target;
    if (!input.dataset || !input.dataset.kolom) return;
    const id = input.dataset.id;
    const i = Number(input.dataset.set);
    if (input.dataset.kolom === 'kg') {
      // Beban baru ikut diisikan ke set berikutnya yang belum dicentang
      document.querySelectorAll('#daftar-latihan input[data-kolom="kg"]').forEach(el => {
        if (el.dataset.id !== id || Number(el.dataset.set) <= i) return;
        if (!el.closest('.baris-set').classList.contains('selesai')) el.value = input.value;
      });
    }
    simpanKartu(id, null);
  });

  // --- Timer ---
  document.querySelector('.timer-tombol').addEventListener('click', e => {
    const b = e.target.closest('button[data-timer]');
    if (!b) return;
    if (b.dataset.timer === 'lewati') hentikanTimer();
    else ubahTimer(Number(b.dataset.timer));
  });

  // --- Program ---
  const kotakProgram = document.getElementById('daftar-program');
  kotakProgram.addEventListener('click', e => {
    const b = e.target.closest('button[data-aksi]');
    if (!b) return;
    const hari = b.dataset.hari;
    const i = b.dataset.i == null ? null : Number(b.dataset.i);
    const list = data.program[hari].latihan;
    const aksi = b.dataset.aksi;
    if (aksi === 'tambah') bukaFormGerakan(hari, null);
    else if (aksi === 'ubah') bukaFormGerakan(hari, i);
    else if (aksi === 'hapus') {
      if (!confirm('Hapus ' + list[i].nama + ' dari ' + NAMA_HARI[hari] + '? Catatan latihannya tetap tersimpan.')) return;
      list.splice(i, 1);
      simpan();
      tampilProgram();
    } else if (aksi === 'naik' && i > 0) {
      [list[i - 1], list[i]] = [list[i], list[i - 1]];
      simpan();
      tampilProgram();
    } else if (aksi === 'turun' && i < list.length - 1) {
      [list[i + 1], list[i]] = [list[i], list[i + 1]];
      simpan();
      tampilProgram();
    }
  });
  kotakProgram.addEventListener('change', e => {
    const el = e.target;
    if (el.dataset.aksi !== 'fokus') return;
    data.program[el.dataset.hari].fokus = el.value.trim();
    simpan();
  });
  document.getElementById('btn-reset-program').addEventListener('click', () => {
    if (!confirm('Kembalikan program ke program awal? Catatan latihan dan berat badan tidak ikut terhapus.')) return;
    data.program = programAwal();
    simpan();
    tampilProgram();
  });

  // --- Jendela tambah / ubah gerakan ---
  const dlgGerakan = document.getElementById('dlg-gerakan');
  document.getElementById('saran-gerakan').innerHTML = PUSTAKA.map(p => `<option value="${esc(p.nama)}"></option>`).join('');
  document.getElementById('f-nama').addEventListener('input', e => {
    if (!editGerakan || editGerakan.i != null) return; // isi otomatis hanya saat tambah baru
    const p = cariPustaka(e.target.value);
    if (!p) return;
    document.getElementById('f-set').value = p.saran[0];
    document.getElementById('f-target').value = p.saran[1];
    document.getElementById('f-satuan').value = p.saran[2];
  });
  document.getElementById('form-gerakan').addEventListener('submit', e => {
    e.preventDefault();
    simpanFormGerakan();
  });
  document.getElementById('f-batal').addEventListener('click', () => tutupJendela(dlgGerakan));
  dlgGerakan.addEventListener('click', e => { if (e.target === dlgGerakan) tutupJendela(dlgGerakan); });

  // --- Jendela cara gerakan ---
  const dlgCara = document.getElementById('dlg-cara');
  document.getElementById('cara-tutup').addEventListener('click', () => tutupJendela(dlgCara));
  dlgCara.addEventListener('click', e => { if (e.target === dlgCara) tutupJendela(dlgCara); });

  // --- Grafik ---
  document.getElementById('g-gerakan').addEventListener('change', e => {
    gerakanGrafik = e.target.value;
    tampilGrafik();
  });

  // --- Kalender ---
  document.getElementById('k-sebelum').addEventListener('click', () => geserBulan(-1));
  document.getElementById('k-sesudah').addEventListener('click', () => geserBulan(1));
  document.getElementById('k-grid').addEventListener('click', e => {
    const b = e.target.closest('button[data-tanggal]');
    if (!b) return;
    tanggalDipilih = b.dataset.tanggal;
    tampilKalender();
  });
  document.getElementById('k-detail').addEventListener('click', e => {
    const b = e.target.closest('button[data-aksi="buka-latihan"]');
    if (!b || !tanggalDipilih) return;
    tanggalLatihan = tanggalDipilih;
    pilihTanggalSendiri = tanggalLatihan !== hariIni();
    bukaTab('latihan');
  });

  // --- Gerakan ---
  document.getElementById('c-gerakan').addEventListener('input', tampilGerakan);

  // --- Berat badan ---
  document.getElementById('form-berat').addEventListener('submit', e => {
    e.preventDefault();
    const tanggal = document.getElementById('b-tanggal').value || hariIni();
    const kg = bacaAngka(document.getElementById('b-kg').value);
    const pesan = document.getElementById('b-pesan');
    if (kg == null || kg < 20 || kg > 400) {
      pesan.textContent = 'Isi berat badan dalam kg, contoh 85 atau 84,5.';
      return;
    }
    pesan.textContent = '';
    const bulat = Math.round(kg * 10) / 10;
    const ada = data.berat.find(b => b.tanggal === tanggal);
    if (ada) ada.kg = bulat; else data.berat.push({ tanggal, kg: bulat });
    simpan();
    document.getElementById('b-kg').value = '';
    tampilBadan();
  });
  document.getElementById('isi-berat').addEventListener('click', e => {
    const b = e.target.closest('button[data-aksi="hapus-berat"]');
    if (!b) return;
    const t = b.dataset.tanggal;
    if (!confirm('Hapus catatan berat tanggal ' + tanggalPanjang(t) + '?')) return;
    data.berat = data.berat.filter(x => x.tanggal !== t);
    simpan();
    tampilBadan();
  });
  const tinggiEl = document.getElementById('i-tinggi');
  tinggiEl.addEventListener('input', () => {
    const t = bacaAngka(tinggiEl.value);
    if (t != null && t >= 100 && t <= 250) {
      data.profil.tinggi = Math.round(t * 10) / 10;
      simpan();
      tampilIdeal();
    } else if (tinggiEl.value.trim() === '') {
      data.profil.tinggi = null;
      simpan();
      tampilIdeal();
    }
  });
  tinggiEl.addEventListener('change', () => {
    const t = bacaAngka(tinggiEl.value);
    if (tinggiEl.value.trim() !== '' && !(t != null && t >= 100 && t <= 250)) {
      document.getElementById('isi-ideal').innerHTML = '<p class="pesan">Isi tinggi badan dalam cm, contoh 170.</p>';
    }
  });

  // Saat aplikasi dibuka lagi: perbarui timer dan tanggal hari ini
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    if (timer.jalan) detakTimer();
    if (!pilihTanggalSendiri && tanggalLatihan !== hariIni()) {
      tanggalLatihan = hariIni();
      if (tabAktif === 'latihan') tampilLatihan();
    }
  });
}

function geserBulan(arah) {
  const d = new Date(bulanKalender.tahun, bulanKalender.bulan + arah, 1);
  bulanKalender.tahun = d.getFullYear();
  bulanKalender.bulan = d.getMonth();
  tampilKalender();
}

/* ---------- Mulai ---------- */
pasangTombol();
bukaTab('latihan');
