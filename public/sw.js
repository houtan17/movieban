/* Movieban v1.1.0: offline support removed.
 *
 * Previously installed clients may still be controlled by the old offline
 * service worker. This update replaces it with a stub that deletes every
 * Cache Storage entry created by earlier versions and then unregisters
 * itself, so the application always loads fresh resources from the network.
 * The web app manifest and icons are intentionally retained: the app stays
 * installable, it just requires a connection from here on.
 */
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.registration.unregister()),
  )
})
