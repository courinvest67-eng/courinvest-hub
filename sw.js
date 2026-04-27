/* === Courinvest Hub — Service Worker ===
   Estratégia híbrida:
   - HTML + ícones: cache-first (carrega rápido offline)
   - Firebase / API externa: network-only (sempre tempo real)
   
   IMPORTANTE: Mudar CACHE_VERSION sempre que fizer deploy de nova versão do Hub —
   força os usuários a baixar o novo HTML. Pode usar timestamp ou versionamento. */

const CACHE_VERSION = 'courinvest-v1-2026-04-27';
const SHELL_CACHE = 'shell-' + CACHE_VERSION;

/* Recursos do "shell" (UI base do app) — cacheados na primeira visita */
const SHELL_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-96.png',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './icon-maskable-512.png'
];

/* Domínios que NUNCA devem ser cacheados (sempre buscar da rede) */
const NETWORK_ONLY_DOMAINS = [
  'firebaseio.com',
  'googleapis.com',
  'firebaseapp.com',
  'gstatic.com',
  'firestore.googleapis.com',
  'identitytoolkit.googleapis.com',
  'api.allorigins.win',
  'data-api.ecb.europa.eu'
];

/* === INSTALL: salva o shell em cache === */
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(function(cache) {
      console.log('[SW] Caching shell files');
      return cache.addAll(SHELL_FILES).catch(function(err) {
        /* Falha em algum recurso não impede a instalação */
        console.warn('[SW] Some shell files failed to cache:', err);
      });
    }).then(function() {
      /* Ativa o novo SW imediatamente, sem esperar páginas fecharem */
      return self.skipWaiting();
    })
  );
});

/* === ACTIVATE: limpa caches antigos === */
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) {
          /* Remove qualquer cache que não seja a versão atual */
          return key !== SHELL_CACHE;
        }).map(function(key) {
          console.log('[SW] Removing old cache:', key);
          return caches.delete(key);
        })
      );
    }).then(function() {
      /* Toma controle de todas as abas abertas imediatamente */
      return self.clients.claim();
    })
  );
});

/* === FETCH: estratégia por tipo de recurso === */
self.addEventListener('fetch', function(event) {
  const url = new URL(event.request.url);
  
  /* Só intercepta GET — POST/PUT/DELETE passam direto */
  if (event.request.method !== 'GET') return;
  
  /* Domínios excluídos (Firebase, APIs externas) — passa direto pra rede */
  if (NETWORK_ONLY_DOMAINS.some(function(d) { return url.hostname.includes(d); })) {
    return; /* não intercepta — usa fetch padrão */
  }
  
  /* Estratégia stale-while-revalidate pra recursos do shell:
     - Retorna cache rápido
     - Em paralelo, atualiza cache com versão nova
     - Próxima visita pega versão atualizada */
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      const fetchPromise = fetch(event.request).then(function(network) {
        /* Atualiza cache se resposta for OK */
        if (network && network.status === 200 && network.type !== 'opaque') {
          const clone = network.clone();
          caches.open(SHELL_CACHE).then(function(cache) {
            cache.put(event.request, clone);
          });
        }
        return network;
      }).catch(function() {
        /* Sem rede — retorna o cached */
        return cached;
      });
      /* Retorna o cached se existir (instantâneo), ou o fetch (rede) */
      return cached || fetchPromise;
    })
  );
});

/* === MESSAGE: comunicação com a página
   A página pode mandar SKIP_WAITING pra forçar update do SW. */
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
