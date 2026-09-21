/*
 * These paths are injected into PROXIED pages, so they must be same-origin and
 * absolute -- but "absolute from the app root", which is not the origin root
 * when the build is served from a subdirectory. A leading slash sends proxied
 * documents to the wrong root; on a path-style S3 URL it drops the bucket.
 *
 * The base is derived from wherever this file itself was loaded from, so it is
 * correct at any mount point with no build step. Two contexts load it: the page
 * via <script src>, and worker.js via importScripts.
 */
(function () {
	var base = "";

	if (typeof document !== "undefined" && document.currentScript && document.currentScript.src) {
		// .../<base>/glass/glass.config.js -> .../<base>
		base = new URL("../", document.currentScript.src).pathname.replace(/\/$/, "");
	} else if (typeof self !== "undefined" && self.registration && self.registration.scope) {
		base = new URL(self.registration.scope).pathname.replace(/\/$/, "");
	} else if (typeof self !== "undefined" && self.location) {
		base = new URL("../", self.location.href).pathname.replace(/\/$/, "");
	}

	self.__se$config = {
		prefix: base + "/service/glass/",
		encodeUrl: Selenite.codec.xor.encode,
		decodeUrl: Selenite.codec.xor.decode,
		handler: base + "/glass/glass.handler.js",
		client: base + "/glass/glass.client.js",
		bundle: base + "/glass/glass.bundle.js",
		config: base + "/glass/glass.config.js",
		sw: base + "/glass/glass.sw.js",
	};
})();
