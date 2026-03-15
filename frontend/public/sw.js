const SW_VERSION = "v1";
const APP_SHELL_CACHE = `khatabook-app-shell-${SW_VERSION}`;
const STATIC_CACHE = `khatabook-static-${SW_VERSION}`;
const API_CACHE = `khatabook-api-${SW_VERSION}`;
const RUNTIME_CACHE = `khatabook-runtime-${SW_VERSION}`;

const APP_SHELL_URLS = [
  "/",
  "/offline",
  "/offline.html",
  "/manifest.json",
  "/favicon.svg",
  "/icon-192.svg",
  "/icon-512.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL_URLS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keepCaches = new Set([APP_SHELL_CACHE, STATIC_CACHE, API_CACHE, RUNTIME_CACHE]);
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (!keepCaches.has(key)) {
            return caches.delete(key);
          }
          return Promise.resolve();
        }),
      );
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

function isApiRequest(url) {
  return url.pathname.startsWith("/api/v1/");
}

function isStaticAsset(request, url) {
  const destination = request.destination;
  if (url.pathname.startsWith("/_next/static/")) return true;
  if (url.pathname.startsWith("/_next/image")) return true;
  return ["style", "script", "image", "font", "audio", "video"].includes(destination);
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, cacheName, options = {}) {
  const { fallbackRequest, preloadResponsePromise } = options;
  const cache = await caches.open(cacheName);
  try {
    const preloaded = preloadResponsePromise ? await preloadResponsePromise : null;
    if (preloaded) {
      if (preloaded.ok) {
        cache.put(request, preloaded.clone());
      }
      return preloaded;
    }

    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (fallbackRequest) {
      const fallback = await caches.match(fallbackRequest);
      if (fallback) return fallback;
    }
    throw new Error("Network and cache unavailable");
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(
      networkFirst(request, RUNTIME_CACHE, {
        fallbackRequest: "/offline.html",
        preloadResponsePromise: event.preloadResponse,
      }).catch(async () => {
        const fallback = await caches.match("/offline.html");
        return (
          fallback ||
          new Response("Offline", {
            status: 503,
            statusText: "Offline",
            headers: { "Content-Type": "text/plain" },
          })
        );
      }),
    );
    return;
  }

  if (isApiRequest(url)) {
    event.respondWith(
      networkFirst(request, API_CACHE).catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        return new Response(
          JSON.stringify({
            success: false,
            error: { code: "OFFLINE", message: "No network and no cached API response available." },
          }),
          {
            status: 503,
            headers: { "Content-Type": "application/json" },
          },
        );
      }),
    );
    return;
  }

  if (url.origin === self.location.origin && isStaticAsset(request, url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      networkFirst(request, RUNTIME_CACHE).catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        throw new Error("Network and cache unavailable");
      }),
    );
  }
});
