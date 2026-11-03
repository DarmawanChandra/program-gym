/* ================================================================
   sw.js — supaya aplikasi tetap bisa dibuka tanpa internet

   Cara kerja:
   - Saat pertama dibuka (masih ada internet), file aplikasi disimpan
     ke cache di HP.
   - Setiap membuka halaman: coba ambil versi terbaru dari internet.
     Kalau gagal (tidak ada sinyal), pakai salinan di cache.
   Naikkan VERSI setiap ada perubahan file aplikasi.
   ================================================================ */
const VERSI = 'program-gym-v2';
const FILE = ['./', 'index.html', 'style.css', 'app.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSI).then(c => c.addAll(FILE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  // Hapus cache versi lama
  e.waitUntil(
    caches.keys()
      .then(kunci => Promise.all(kunci.filter(k => k !== VERSI).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  // Hanya file aplikasi ini sendiri (bukan YouTube atau situs lain)
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) {
          const salinan = res.clone();
          caches.open(VERSI).then(c => c.put(req, salinan));
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true })
        .then(simpan => simpan || caches.match('index.html')))
  );
});
