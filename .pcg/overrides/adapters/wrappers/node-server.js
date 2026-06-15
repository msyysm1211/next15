"use strict";
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod2) => function __require() {
  return mod2 || (0, cb[__getOwnPropNames(cb)[0]])((mod2 = { exports: {} }).exports, mod2), mod2.exports;
};

// dist/runtime/gateway-auth.js
var require_gateway_auth = __commonJS({
  "dist/runtime/gateway-auth.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.gatewayFetch = exports2.signGatewayHeaders = exports2.loadGatewayAuthConfig = void 0;
    var crypto_1 = require("crypto");
    var DEFAULT_TTL_MS = 5 * 60 * 1e3;
    var DEFAULT_TIMEOUT_MS = 5e3;
    function _fetch(input, init) {
      var _a, _b;
      const gf = globalThis.fetch;
      const fn = gf.__nextPatched ? (_b = (_a = gf._nextOriginalFetch) !== null && _a !== void 0 ? _a : globalThis.__originalFetch) !== null && _b !== void 0 ? _b : gf : gf;
      return fn(input, init);
    }
    function loadGatewayAuthConfig() {
      const gatewayUrl = process.env.ESA_CACHE_GW_GATEWAY_ENDPOINT;
      const secret = process.env.ESA_CACHE_GW_AUTH_KEY;
      const aliuid = process.env.ESA_CACHE_GW_ALIUID;
      const routinename = process.env.ESA_CACHE_GW_ROUTINENAME;
      const version = process.env.ESA_CACHE_GW_VERSION;
      const missing = [];
      if (!gatewayUrl)
        missing.push("ESA_CACHE_GW_GATEWAY_ENDPOINT");
      if (!secret)
        missing.push("ESA_CACHE_GW_AUTH_KEY");
      if (!aliuid)
        missing.push("ESA_CACHE_GW_ALIUID");
      if (!routinename)
        missing.push("ESA_CACHE_GW_ROUTINENAME");
      if (!version)
        missing.push("ESA_CACHE_GW_VERSION");
      if (missing.length > 0) {
        console.error(`[gateway-auth] \u7F3A\u5C11\u5FC5\u9700\u7684\u73AF\u5883\u53D8\u91CF: ${missing.join(", ")}`);
        return null;
      }
      return {
        gatewayUrl: gatewayUrl.replace(/\/+$/, ""),
        secret,
        aliuid,
        routinename,
        version
      };
    }
    exports2.loadGatewayAuthConfig = loadGatewayAuthConfig;
    function signGatewayHeaders(cfg, ttlMs = DEFAULT_TTL_MS) {
      const expires = String(Date.now() + ttlMs);
      const authKey = (0, crypto_1.createHmac)("sha256", cfg.secret).update(`${cfg.aliuid}${cfg.routinename}${cfg.version}`).digest("hex");
      const md5Hash = (0, crypto_1.createHash)("md5").update(`${authKey}${expires}${cfg.aliuid}${cfg.routinename}${cfg.version}`).digest("hex");
      return {
        authorization: `${expires}-${md5Hash}`,
        aliuid: cfg.aliuid,
        routinename: cfg.routinename,
        version: cfg.version
      };
    }
    exports2.signGatewayHeaders = signGatewayHeaders;
    async function gatewayFetch(cfg, pathOrUrl, init) {
      var _a, _b;
      const url = pathOrUrl.startsWith("/") ? `${cfg.gatewayUrl}${pathOrUrl}` : pathOrUrl;
      const signed = signGatewayHeaders(cfg);
      const headers = new Headers(init === null || init === void 0 ? void 0 : init.headers);
      headers.set("Authorization", signed.authorization);
      headers.set("AliUid", signed.aliuid);
      headers.set("RoutineName", signed.routinename);
      headers.set("Version", signed.version);
      const timeoutMs = (_a = init === null || init === void 0 ? void 0 : init.timeoutMs) !== null && _a !== void 0 ? _a : DEFAULT_TIMEOUT_MS;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        return await _fetch(url, {
          ...init,
          headers,
          signal: (_b = init === null || init === void 0 ? void 0 : init.signal) !== null && _b !== void 0 ? _b : controller.signal
        });
      } finally {
        clearTimeout(timer);
      }
    }
    exports2.gatewayFetch = gatewayFetch;
  }
});

// dist/runtime/image-config.js
var require_image_config = __commonJS({
  "dist/runtime/image-config.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports._setMatcherForTests = exports._resetImageConfigCacheForTests = exports.validateImageUrl = void 0;
    var fs = require("fs");
    var path = require("path");
    var cachedConfig;
    var cachedMatcher;
    var warnedMatcherMissing = false;
    function configFilePath() {
      return path.resolve(process.cwd(), ".next", "required-server-files.json");
    }
    function loadImageConfig() {
      var _a, _b, _c;
      if (cachedConfig !== void 0)
        return cachedConfig;
      const filePath = configFilePath();
      let raw;
      try {
        raw = fs.readFileSync(filePath, "utf-8");
      } catch (err) {
        console.warn(`[image-config] required-server-files.json not found at ${filePath} \u2014 allowing all image URLs (${(_a = err.code) !== null && _a !== void 0 ? _a : err.message})`);
        cachedConfig = { mode: "config-missing" };
        return cachedConfig;
      }
      try {
        const parsed = JSON.parse(raw);
        const images = (_c = (_b = parsed === null || parsed === void 0 ? void 0 : parsed.config) === null || _b === void 0 ? void 0 : _b.images) !== null && _c !== void 0 ? _c : {};
        cachedConfig = {
          mode: "loaded",
          images: {
            remotePatterns: Array.isArray(images.remotePatterns) ? images.remotePatterns : [],
            domains: Array.isArray(images.domains) ? images.domains : [],
            unoptimized: images.unoptimized === true
          }
        };
        return cachedConfig;
      } catch (err) {
        console.warn(`[image-config] failed to parse ${filePath}: ${err.message} \u2014 allowing all image URLs`);
        cachedConfig = { mode: "config-missing" };
        return cachedConfig;
      }
    }
    function loadMatcher() {
      if (cachedMatcher !== void 0)
        return cachedMatcher;
      try {
        const dynamicRequire = eval("require");
        const mod = dynamicRequire("next/dist/shared/lib/match-remote-pattern");
        const hasRemoteMatch = mod === null || mod === void 0 ? void 0 : mod.hasRemoteMatch;
        if (typeof hasRemoteMatch !== "function") {
          throw new Error("hasRemoteMatch not exported");
        }
        cachedMatcher = hasRemoteMatch;
        return cachedMatcher;
      } catch (err) {
        if (!warnedMatcherMissing) {
          warnedMatcherMissing = true;
          console.warn(`[image-config] cannot load next/dist/shared/lib/match-remote-pattern (${err.message}) \u2014 falling back to deny-external-only mode`);
        }
        cachedMatcher = null;
        return null;
      }
    }
    function validateImageUrl(absoluteUrl, hostHeader) {
      const cfg = loadImageConfig();
      if (cfg.mode === "config-missing") {
        return { ok: true, reason: "config-missing" };
      }
      const { images } = cfg;
      if (images.unoptimized) {
        return { ok: true, reason: "unoptimized" };
      }
      const reqHost = hostHeader.toLowerCase();
      const urlHost = absoluteUrl.host.toLowerCase();
      if (reqHost && reqHost === urlHost) {
        return { ok: true, reason: "same-origin" };
      }
      const matcher = loadMatcher();
      if (matcher === null) {
        return { ok: false, reason: "matcher-unavailable" };
      }
      if (matcher(images.domains, images.remotePatterns, absoluteUrl)) {
        return { ok: true, reason: "pattern-match" };
      }
      return { ok: false, reason: "remote-pattern-not-matched" };
    }
    exports.validateImageUrl = validateImageUrl;
    function _resetImageConfigCacheForTests() {
      cachedConfig = void 0;
      cachedMatcher = void 0;
      warnedMatcherMissing = false;
    }
    exports._resetImageConfigCacheForTests = _resetImageConfigCacheForTests;
    function _setMatcherForTests(impl) {
      cachedMatcher = impl;
    }
    exports._setMatcherForTests = _setMatcherForTests;
  }
});

// dist/runtime/image-proxy.js
var require_image_proxy = __commonJS({
  "dist/runtime/image-proxy.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.handleImageProxy = void 0;
    var stream_1 = require("stream");
    var gateway_auth_1 = require_gateway_auth();
    var image_config_1 = require_image_config();
    var GATEWAY_TIMEOUT_MS = 1e4;
    var PASSTHROUGH_HEADERS = [
      "content-type",
      "content-length",
      "cache-control",
      "etag",
      "vary",
      "last-modified",
      "content-security-policy"
    ];
    function resolveAbsoluteUrl(rawUrl, req) {
      if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
        return rawUrl;
      }
      const host = req.headers["host"];
      if (!host)
        return null;
      const protoHeader = req.headers["x-forwarded-proto"];
      const proto = (Array.isArray(protoHeader) ? protoHeader[0] : protoHeader) || (Array.isArray(protoHeader) ? protoHeader[0] : protoHeader) || "https";
      const path3 = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;
      return `${proto}://${host}${path3}`;
    }
    function writeJson(res, status, body) {
      res.statusCode = status;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify(body));
    }
    async function handleImageProxy(req, res) {
      const reqUrl = req.url || "";
      const qIdx = reqUrl.indexOf("?");
      if (qIdx === -1) {
        return writeJson(res, 400, { error: "Missing query parameters" });
      }
      const params = new URLSearchParams(reqUrl.slice(qIdx + 1));
      const rawUrl = params.get("url");
      const w = params.get("w");
      const q = params.get("q");
      if (!rawUrl || !w) {
        return writeJson(res, 400, {
          error: "Missing required parameters: url, w"
        });
      }
      const absoluteUrl = resolveAbsoluteUrl(rawUrl, req);
      if (!absoluteUrl) {
        return writeJson(res, 500, {
          error: "Cannot resolve absolute URL: missing Host header"
        });
      }
      let parsedUrl;
      try {
        parsedUrl = new URL(absoluteUrl);
      } catch (_a) {
        return writeJson(res, 400, { error: "Invalid url parameter" });
      }
      const hostHeader = req.headers["host"] || "";
      const verdict = (0, image_config_1.validateImageUrl)(parsedUrl, hostHeader);
      if (!verdict.ok) {
        return writeJson(res, 400, { error: "url not allowed" });
      }
      const cfg = (0, gateway_auth_1.loadGatewayAuthConfig)();
      if (!cfg) {
        return writeJson(res, 500, {
          error: "Gateway auth config missing"
        });
      }
      const upstreamParams = new URLSearchParams({ url: absoluteUrl, w });
      if (q)
        upstreamParams.set("q", q);
      const upstreamPath = `/image/optimize?${upstreamParams}`;
      const ifNoneMatch = req.headers["if-none-match"];
      const upstreamHeaders = {};
      if (typeof ifNoneMatch === "string") {
        upstreamHeaders["if-none-match"] = ifNoneMatch;
      }
      const accept = req.headers["accept"];
      if (typeof accept === "string") {
        upstreamHeaders["accept"] = accept;
      }
      let upstream;
      try {
        upstream = await (0, gateway_auth_1.gatewayFetch)(cfg, upstreamPath, {
          method: "GET",
          headers: upstreamHeaders,
          timeoutMs: GATEWAY_TIMEOUT_MS
        });
      } catch (err) {
        if (err.name === "AbortError") {
          console.warn(`[image-proxy] Gateway timeout after ${GATEWAY_TIMEOUT_MS}ms: ${absoluteUrl}`);
          return writeJson(res, 504, { error: "Upstream timeout" });
        }
        console.warn(`[image-proxy] Gateway fetch error: ${err.message} (url=${absoluteUrl})`);
        return writeJson(res, 502, { error: "Bad gateway" });
      }
      res.statusCode = upstream.status;
      for (const name of PASSTHROUGH_HEADERS) {
        const value = upstream.headers.get(name);
        if (value !== null) {
          res.setHeader(name, value);
        }
      }
      if (upstream.status === 304 || !upstream.body) {
        res.end();
        return;
      }
      try {
        const nodeStream = stream_1.Readable.fromWeb(upstream.body);
        nodeStream.on("error", (err) => {
          console.warn(`[image-proxy] Stream error: ${err.message}`);
          if (!res.writableEnded)
            res.end();
        });
        nodeStream.pipe(res);
      } catch (err) {
        console.warn(`[image-proxy] Pipe setup failed: ${err.message}`);
        if (!res.headersSent) {
          writeJson(res, 502, { error: "Stream setup failed" });
        } else if (!res.writableEnded) {
          res.end();
        }
      }
    }
    exports2.handleImageProxy = handleImageProxy;
  }
});

// dist/runtime/edge-context.js
var require_edge_context = __commonJS({
  "dist/runtime/edge-context.js"(exports2) {
    "use strict";
    var _a;
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.getCacheTags = exports2.setCacheTags = exports2.getEdgeContext = exports2.runWithEdgeContext = exports2.buildEdgeContextFromHeaders = void 0;
    var node_async_hooks_1 = require("node:async_hooks");
    var ALS_KEY = Symbol.for("pcg.edgeContext.als");
    var globalRef = globalThis;
    var storage = (_a = globalRef[ALS_KEY]) !== null && _a !== void 0 ? _a : globalRef[ALS_KEY] = new node_async_hooks_1.AsyncLocalStorage();
    var SITE_ID_HEADER = "x-alicdn-site-id";
    var HOSTNAME_HEADER = "host";
    var FORWARDED_HOSTNAME_HEADER = "x-forwarded-host";
    function pickHeader(headers, name) {
      var _a2;
      return (_a2 = headers[name]) !== null && _a2 !== void 0 ? _a2 : headers[name.toLowerCase()];
    }
    function parseHostname(raw) {
      var _a2;
      if (!raw)
        return void 0;
      const first = (_a2 = raw.split(",")[0]) === null || _a2 === void 0 ? void 0 : _a2.trim();
      return first || void 0;
    }
    function parseSiteId(raw) {
      if (!raw)
        return void 0;
      const trimmed = raw.trim();
      if (!trimmed)
        return void 0;
      const n = Number(trimmed);
      return Number.isFinite(n) && trimmed === String(n) ? n : trimmed;
    }
    function buildEdgeContextFromHeaders(headers) {
      var _a2;
      const ctx = {};
      const siteId = parseSiteId(pickHeader(headers, SITE_ID_HEADER));
      if (siteId !== void 0)
        ctx.siteId = siteId;
      const hostname = (_a2 = parseHostname(pickHeader(headers, HOSTNAME_HEADER))) !== null && _a2 !== void 0 ? _a2 : parseHostname(pickHeader(headers, FORWARDED_HOSTNAME_HEADER));
      if (hostname)
        ctx.hostname = hostname;
      return ctx;
    }
    exports2.buildEdgeContextFromHeaders = buildEdgeContextFromHeaders;
    function runWithEdgeContext(headers, fn) {
      const ctx = buildEdgeContextFromHeaders(headers);
      return storage.run(ctx, fn);
    }
    exports2.runWithEdgeContext = runWithEdgeContext;
    function getEdgeContext() {
      var _a2;
      return (_a2 = storage.getStore()) !== null && _a2 !== void 0 ? _a2 : {};
    }
    exports2.getEdgeContext = getEdgeContext;
    function setCacheTags(tags) {
      const store = storage.getStore();
      if (store)
        store.cacheTags = tags;
    }
    exports2.setCacheTags = setCacheTags;
    function getCacheTags() {
      var _a2;
      return (_a2 = storage.getStore()) === null || _a2 === void 0 ? void 0 : _a2.cacheTags;
    }
    exports2.getCacheTags = getCacheTags;
  }
});

// dist/adapters/wrappers/node-server.js
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
var fs2 = require("fs");
var path2 = require("path");
var image_proxy_1 = require_image_proxy();
var edge_context_1 = require_edge_context();
var MIME_TYPES = {
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".css": "text/css",
  ".html": "text/html",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".map": "application/json",
  ".txt": "text/plain",
  ".webp": "image/webp"
};
function parseQuery(url) {
  const idx = url.indexOf("?");
  if (idx === -1)
    return {};
  const params = {};
  const searchParams = new URLSearchParams(url.slice(idx + 1));
  for (const [key, value] of searchParams) {
    const existing = params[key];
    if (existing === void 0) {
      params[key] = value;
    } else if (Array.isArray(existing)) {
      existing.push(value);
    } else {
      params[key] = [existing, value];
    }
  }
  return params;
}
function parseCookies(cookieHeader) {
  if (!cookieHeader)
    return {};
  const cookies = {};
  for (const pair of cookieHeader.split(";")) {
    const eqIdx = pair.indexOf("=");
    if (eqIdx === -1)
      continue;
    const name = pair.slice(0, eqIdx).trim();
    const value = pair.slice(eqIdx + 1).trim();
    if (name)
      cookies[name] = value;
  }
  return cookies;
}
function flattenHeaders(rawHeaders) {
  const headers = {};
  for (const [key, value] of Object.entries(rawHeaders)) {
    if (value === void 0)
      continue;
    headers[key.toLowerCase()] = Array.isArray(value) ? value.join(", ") : value;
  }
  return headers;
}
async function readBody(req) {
  if (req.method === "GET" || req.method === "HEAD")
    return void 0;
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}
function serveStaticFile(assetsDir, req, res) {
  var _a, _b;
  const urlPath = (_b = (_a = req.url) === null || _a === void 0 ? void 0 : _a.split("?")[0]) !== null && _b !== void 0 ? _b : "/";
  if (urlPath === "/" || !urlPath.startsWith("/"))
    return false;
  const filePath = path2.join(assetsDir, urlPath);
  const normalizedPath = path2.normalize(filePath);
  if (!normalizedPath.startsWith(assetsDir)) {
    res.writeHead(403);
    res.end();
    return true;
  }
  let stat;
  try {
    stat = fs2.statSync(normalizedPath);
  } catch (_c) {
    return false;
  }
  if (!stat.isFile())
    return false;
  const ext = path2.extname(normalizedPath);
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  const isHashedAsset = urlPath.startsWith("/_next/static/");
  res.writeHead(200, {
    "Content-Type": contentType,
    "Content-Length": stat.size,
    "Cache-Control": isHashedAsset ? "public, max-age=31536000, immutable" : "public, max-age=60"
  });
  fs2.createReadStream(normalizedPath).pipe(res);
  return true;
}
function bridgeOpenNextHandler(handler) {
  return async (req, res) => {
    var _a, _b, _c, _d, _e, _f;
    try {
      const rawUrl = req.url || "/";
      const headers = flattenHeaders(req.headers);
      const body = await readBody(req);
      const host = headers["host"] || `localhost:${(_a = process.env.PORT) !== null && _a !== void 0 ? _a : "3000"}`;
      const proto = ((_c = (_b = headers["x-forwarded-proto"]) === null || _b === void 0 ? void 0 : _b.split(",")[0]) === null || _c === void 0 ? void 0 : _c.trim()) || "http";
      const absoluteUrl = new URL(`${proto}://${host}${rawUrl}`);
      const event = {
        type: "core",
        method: req.method || "GET",
        rawPath: absoluteUrl.pathname,
        url: absoluteUrl.href,
        body,
        headers,
        query: parseQuery(rawUrl),
        cookies: parseCookies(headers["cookie"]),
        remoteAddress: ((_e = (_d = headers["x-forwarded-for"]) === null || _d === void 0 ? void 0 : _d.split(",")[0]) === null || _e === void 0 ? void 0 : _e.trim()) || headers["x-real-ip"] || ((_f = req.socket) === null || _f === void 0 ? void 0 : _f.remoteAddress) || "127.0.0.1"
      };
      const abortController = new AbortController();
      res.on("close", () => abortController.abort());
      const streamCreator = {
        writeHeaders(prelude) {
          const cacheTags = (0, edge_context_1.getCacheTags)();
          if (cacheTags) {
            res.setHeader("Cache-Tag", cacheTags);
          }
          delete prelude.headers["x-next-cache-tags"];
          res.setHeader("Set-Cookie", prelude.cookies);
          res.writeHead(prelude.statusCode, prelude.headers);
          res.flushHeaders();
          return res;
        },
        abortSignal: abortController.signal
      };
      await (0, edge_context_1.runWithEdgeContext)(headers, () => handler(event, { streamCreator }));
    } catch (err) {
      if (!res.headersSent) {
        const isDev = process.env.NODE_ENV !== "production";
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          error: "Internal Server Error",
          ...isDev && { message: err.message, stack: err.stack }
        }));
      } else if (!res.writableEnded) {
        res.end();
      }
    }
  };
}
async function wrapper(handler) {
  var _a;
  const port = parseInt((_a = process.env.PORT) !== null && _a !== void 0 ? _a : "3000", 10);
  const assetsDir = path2.resolve(process.cwd(), "..", "..", "assets");
  if (!fs2.existsSync(assetsDir)) {
    console.warn(`[pcg-node] assets directory not found at ${assetsDir} \u2014 static file requests will fall through to Next handler`);
  }
  const dispatchToNext = bridgeOpenNextHandler(handler);
  const server = http.createServer(async (req, res) => {
    var _a2, _b;
    const urlPath = (_b = (_a2 = req.url) === null || _a2 === void 0 ? void 0 : _a2.split("?")[0]) !== null && _b !== void 0 ? _b : "/";
    if (urlPath === "/__health") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("OK");
      return;
    }
    if (urlPath === "/_next/image") {
      try {
        await (0, image_proxy_1.handleImageProxy)(req, res);
      } catch (err) {
        console.error("[pcg-node] image-proxy error:", err);
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Image proxy failed" }));
        } else if (!res.writableEnded) {
          res.end();
        }
      }
      return;
    }
    if (serveStaticFile(assetsDir, req, res))
      return;
    await dispatchToNext(req, res);
  });
  let shuttingDown = false;
  const shutdown = (signal) => {
    if (shuttingDown)
      return;
    shuttingDown = true;
    console.log(`[pcg-node] ${signal} received, shutting down...`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 5e3).unref();
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  await new Promise((resolve) => {
    server.listen(port, () => {
      console.log(`[pcg-node] Listening on port ${port}`);
      console.log(`[pcg-node]   assets:  ${assetsDir}`);
      console.log(`[pcg-node]   routes:  /__health, /_next/image, /_next/static/*, <next>`);
      resolve();
    });
  });
}
var wrapperDef = {
  wrapper,
  name: "pcg-node",
  supportStreaming: true
};
exports.default = wrapperDef;
