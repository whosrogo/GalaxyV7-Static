/*
 * Resolved against this worker's own URL. An absolute "/glass/..." would hit
 * the ORIGIN root, which is wrong wherever the app is served from a
 * subdirectory -- on a path-style S3 URL it drops the bucket and 404s.
 */
importScripts(
  ...[
    "glass/glass.bundle.js",
    "glass/glass.config.js",
    "glass/glass.sw.js",
    "poly/polygon.all.js",
    "hive/prism.sw.js",
  ].map((p) => new URL(p, self.location.href).href)
);
const glass = new SeleniteServiceWorker();
const { CinnabarServiceWorker } = $cinnabarLoadWorker();
const cinnabar = new CinnabarServiceWorker();

async function handleRequest(event) {
  /*
   * A freshly installed worker has no cinnabar config yet -- the app writes it
   * when the proxy is first set up. Until then loadConfig() rejects, and an
   * unhandled rejection here fails the request outright. Because this worker
   * controls the whole origin, that makes the entire site unloadable the moment
   * it installs: the first visit works, every reload after it is a blank page.
   *
   * Anything that goes wrong below degrades to a plain network request.
   */
  try {
    await cinnabar.loadConfig();
  } catch (err) {
    return fetch(event.request);
  }

  try {
    if (glass.route(event)) {
      return await glass.fetch(event);
    }
    if (cinnabar.route(event)) {
      return await cinnabar.fetch(event);
    }
  } catch (err) {
    return fetch(event.request);
  }

  return fetch(event.request);
}

self.addEventListener("fetch", (event) => {
  if (typeof $cinnabarController !== "undefined" && $cinnabarController.shouldRoute(event)) {
    event.respondWith($cinnabarController.route(event));
    return;
  }
  // Last line of defence: never let a worker error blank the page.
  event.respondWith(handleRequest(event).catch(() => fetch(event.request)));
});
