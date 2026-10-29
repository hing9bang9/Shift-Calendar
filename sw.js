// ===== Service Worker — 교대 캘린더 오프라인 실행용 =====
// 설치: 캘린더 파일(index.html)과 자기 자신(sw.js)을 캐시
// 이후 오프라인에서도 홈 화면 앱 아이콘으로 실행 가능
const CACHE = "shift-calendar-v2";
const ASSETS = ["./", "./index.html"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  // 구버전 캐시 정리
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  // 캐시 우선(cache-first) — 파일이 단순하고 업데이트는 캐시 버전 올려서 갱신
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request))
  );
});
