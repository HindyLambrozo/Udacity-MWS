//https://developers.google.com/web/tools/workbox/modules/workbox-sw

importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.4.1/workbox-sw.js');
/**
 * Workbox 3.2.0
 * Workbox - https://developers.google.com/web/tools/workbox/
 * Codelab - https://codelabs.developers.google.com/codelabs/workbox-lab/
 */

if (workbox) {
  console.log(`Workbox is loaded.`);
  workbox.setConfig({ debug: false });

  workbox.core.setCacheNameDetails({
    prefix: 'pwa',
    suffix: 'v1'
  });
  
//workbox.precaching.precacheAndRoute(self.__precacheManifest || []);

 workbox.precaching.precacheAndRoute([
  {
    "url": "css/styles.css",
    "revision": "58edaaff537b9dc945022a2fb58881d1"
  },
  {
    "url": "index.html",
    "revision": "0497febcff1ce78eab9eaa9253f1430f"
  },
  {
    "url": "js/idb-bundle.min.js",
    "revision": "8bb586d989093dc901e8718cc534f8c5"
  },
  {
    "url": "js/main-bundle.min.js",
    "revision": "2562f9baea60750daffcdc07d53e68e9"
  },
  {
    "url": "js/resto-bundle.min.js",
    "revision": "ecf9bc7e13f919de2df4de9df3f30e15"
  },
  {
    "url": "restaurant.html",
    "revision": "a71ef303adf3b46f1e66751802c10505"
  },
  {
    "url": "img/touch/homescreen-192.png",
    "revision": "3c51341ad47db2f4f1fcae9ed396e95b"
  },
  {
    "url": "img/touch/homescreen-512.png",
    "revision": "192c0f01d43243007c75dfecea42fc98"
  },
  {
    "url": "manifest.json",
    "revision": "70734e689aa308ac55dbc2638265dd5e"
  }
]);

  workbox.routing.registerRoute(
    new RegExp('https://fonts.(?:googleapis|gstatic).com/(.*)'),
    workbox.strategies.cacheFirst({
      cacheName: 'pwa-cache-google-fonts',
      plugins: [
        new workbox.expiration.Plugin({
          maxEntries: 30,
        }),
      ],
    }),
  );

  // Images
  // https://developers.google.com/web/tools/workbox/modules/workbox-strategies#cache_first_cache_falling_back_to_network
  // https://developers.google.com/web/tools/workbox/modules/workbox-cache-expiration
  workbox.routing.registerRoute(
    /\.(?:jpeg|webp|png|gif|jpg|svg)$/,
    // Whenever the app requests images, the service worker checks the
    // cache first for the resource before going to the network.
    workbox.strategies.cacheFirst({
      cacheName: 'pwa-images-cache',
      // A maximum of 60 entries will be kept (automatically removing older
      // images) and these files will expire in 30 days.
      plugins: [
        new workbox.expiration.Plugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        })
      ]
    })
  );

  // Restaurants
  // https://developers.google.com/web/tools/workbox/modules/workbox-strategies#network_first_network_falling_back_to_cache
  // http://localhost:8887/restaurant.html?id=1
  workbox.routing.registerRoute(
    new RegExp('restaurant.html(.*)'),
    workbox.strategies.networkFirst({
      cacheName: 'pwa-restaurants-cache',
      // Status 0 is the response you would get if you request a cross-origin
      // resource and the server that you're requesting it from is not
      // configured to serve cross-origin resources.
      cacheableResponse: {statuses: [0, 200]}
    })
  );

} else {
  console.log(`[DEBUG] Workbox didn't load.`);
}