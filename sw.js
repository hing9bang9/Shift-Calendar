// ===== Service Worker — 교대 캘린더 오프라인 실행용 =====
// 네트워크 우선(network-first): 온라인이면 항상 최신 페이지를 받고,
// 오프라인이면 캐시로 실행. (캐시 우선은 새 버전이 앱에 반영되지 않는 문제가 있음)
const CACHE = "shift-calendar-v3";
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
  // 같은 출처(GitHub Pages)의 GET 요청만 처리
  if (e.request.method !== "GET" || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // 성공 시 캐시 갱신 (다음 오프라인 대비)
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then((hit) => hit || caches.match("./index.html")))
  );
});
