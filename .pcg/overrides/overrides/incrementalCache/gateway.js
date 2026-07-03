"use strict";
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// dist/_protocol/types.js
var require_types = __commonJS({
  "dist/_protocol/types.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
  }
});

// dist/_protocol/keys.js
var require_keys = __commonJS({
  "dist/_protocol/keys.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.buildPageMetadataKey = exports2.buildTagKey = exports2.buildStaticAssetKey = exports2.buildOssKey = void 0;
    function stripLeadingSlash(s) {
      return s.replace(/^\/+/, "");
    }
    function buildOssKey(params) {
      const { appId, buildId, cacheType = "cache" } = params;
      const key = stripLeadingSlash(params.key);
      if (cacheType === "fetch") {
        return `${appId}/__fetch/${buildId}/${key}`;
      }
      return `${appId}/${buildId}/${key}.cache`;
    }
    exports2.buildOssKey = buildOssKey;
    function buildStaticAssetKey(params) {
      const p = stripLeadingSlash(params.path);
      return `${params.appId}/_next/static/${p}`;
    }
    exports2.buildStaticAssetKey = buildStaticAssetKey;
    function buildTagKey(params) {
      return {
        app_id: params.appId,
        tag: `${params.buildId}/${params.tag}`,
        path: `${params.buildId}/${params.path}`
      };
    }
    exports2.buildTagKey = buildTagKey;
    function buildPageMetadataKey(params) {
      return {
        app_id: params.appId,
        url: params.url
      };
    }
    exports2.buildPageMetadataKey = buildPageMetadataKey;
  }
});

// dist/_protocol/endpoints.js
var require_endpoints = __commonJS({
  "dist/_protocol/endpoints.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.buildCentralEndpoints = void 0;
    function stripTrailingSlashes(s) {
      return s.replace(/\/+$/, "");
    }
    function buildCentralEndpoints(base) {
      const b = stripTrailingSlashes(base);
      return {
        base: b,
        cache: `${b}/cache`,
        cacheRefresh: `${b}/cache/refresh`,
        revalidateTag: `${b}/revalidate/tag`,
        revalidatePath: `${b}/revalidate/path`,
        tagByTag: `${b}/tag/by-tag`,
        tagByPath: `${b}/tag/by-path`,
        tagLastModified: `${b}/tag/last-modified`,
        tagWrite: `${b}/tag/write`,
        deploySts: `${b}/deploy/sts-token`,
        deployTags: `${b}/deploy/tags`
      };
    }
    exports2.buildCentralEndpoints = buildCentralEndpoints;
  }
});

// dist/_protocol/index.js
var require_protocol = __commonJS({
  "dist/_protocol/index.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    __exportStar(require_types(), exports2);
    __exportStar(require_keys(), exports2);
    __exportStar(require_endpoints(), exports2);
  }
});

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

// dist/overrides/incrementalCache/gateway.js
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var protocol_1 = require_protocol();
var gateway_auth_1 = require_gateway_auth();
var edge_context_1 = require_edge_context();
var GET_TIMEOUT = 5e3;
var SET_TIMEOUT = 1e4;
var DELETE_TIMEOUT = 5e3;
function buildKey(config, key, isFetchOrType) {
  let cacheType;
  if (typeof isFetchOrType === "string") {
    cacheType = isFetchOrType === "fetch" ? "fetch" : "cache";
  } else {
    cacheType = isFetchOrType ? "fetch" : "cache";
  }
  return (0, protocol_1.buildOssKey)({
    appId: `${config.aliuid}/${config.routinename}`,
    buildId: config.version,
    key,
    cacheType
  });
}
var GatewayIncrementalCache = class {
  constructor() {
    this.name = "gateway-incremental-cache";
    this.config = null;
    this.configLoaded = false;
  }
  /**
   * 延迟加载配置，避免在构造函数中因环境变量缺失而阻塞 Function 启动。
   */
  getConfig() {
    if (!this.configLoaded) {
      this.config = (0, gateway_auth_1.loadGatewayAuthConfig)();
      this.configLoaded = true;
    }
    return this.config;
  }
  /**
   * 从 Gateway 读取缓存。
   * Gateway 不可用时降级读 .open-next/cache/ 下的预构建文件(本地开发)。
   */
  async get(key, isFetch) {
    var _a, _b;
    const config = this.getConfig();
    if (!config)
      return this.getFromLocalCache(key, isFetch);
    const ossKey = buildKey(config, key, isFetch);
    try {
      const res = await (0, gateway_auth_1.gatewayFetch)(config, `/storage/${ossKey}`, {
        method: "GET",
        timeoutMs: GET_TIMEOUT
      });
      if (res.status === 404)
        return null;
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          console.error(`[incrementalCache] GET \u88AB\u62D2\u7EDD: key="${ossKey}" (${res.status})\uFF0C\u8BF7\u68C0\u67E5\u7B7E\u540D secret \u6216 key \u524D\u7F00`);
        } else {
          console.warn(`[incrementalCache] GET \u5931\u8D25: key="${ossKey}", \u72B6\u6001\u7801=${res.status}`);
        }
        return null;
      }
      const body = await res.text();
      let envelope;
      try {
        envelope = JSON.parse(body);
      } catch (_c) {
        console.warn(`[incrementalCache] JSON \u89E3\u6790\u5931\u8D25: key="${ossKey}"`);
        return null;
      }
      if (!envelope || typeof envelope !== "object" || typeof envelope.lastModified !== "number") {
        console.warn(`[incrementalCache] envelope \u683C\u5F0F\u5F02\u5E38\u6216\u7F3A lastModified: key="${ossKey}"`);
        return null;
      }
      const val = envelope.value;
      const tags = (_b = (_a = val === null || val === void 0 ? void 0 : val.meta) === null || _a === void 0 ? void 0 : _a.headers) === null || _b === void 0 ? void 0 : _b["x-next-cache-tags"];
      if (typeof tags === "string") {
        (0, edge_context_1.setCacheTags)(tags);
      }
      return { value: envelope.value, lastModified: envelope.lastModified };
    } catch (err) {
      if (err.name === "AbortError") {
        console.warn(`[incrementalCache] GET \u8D85\u65F6: key="${ossKey}" (${GET_TIMEOUT}ms)`);
      } else {
        console.warn(`[incrementalCache] GET \u5F02\u5E38: key="${ossKey}", ${err.message}`);
      }
      return null;
    }
  }
  /**
   * 向 Gateway 写入缓存。
   */
  async set(key, value, isFetch) {
    var _a, _b;
    const tags = (_b = (_a = value === null || value === void 0 ? void 0 : value.meta) === null || _a === void 0 ? void 0 : _a.headers) === null || _b === void 0 ? void 0 : _b["x-next-cache-tags"];
    if (typeof tags === "string") {
      (0, edge_context_1.setCacheTags)(tags);
    }
    const config = this.getConfig();
    if (!config)
      return;
    const ossKey = buildKey(config, key, isFetch);
    const body = JSON.stringify({ lastModified: Date.now(), value });
    try {
      const res = await (0, gateway_auth_1.gatewayFetch)(config, `/storage/${ossKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body,
        timeoutMs: SET_TIMEOUT
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          console.error(`[incrementalCache] PUT \u88AB\u62D2\u7EDD: key="${ossKey}" (${res.status})\uFF0C\u8BF7\u68C0\u67E5\u7B7E\u540D secret \u6216 key \u524D\u7F00`);
        } else {
          console.warn(`[incrementalCache] PUT \u5931\u8D25: key="${ossKey}", \u72B6\u6001\u7801=${res.status}`);
        }
      }
    } catch (err) {
      if (err.name === "AbortError") {
        console.warn(`[incrementalCache] PUT \u8D85\u65F6: key="${ossKey}" (${SET_TIMEOUT}ms)`);
      } else {
        console.warn(`[incrementalCache] PUT \u5F02\u5E38: key="${ossKey}", ${err.message}`);
      }
    }
  }
  /**
   * 本地开发降级:读 .open-next/cache/{buildId}/{key}.cache。
   * 仅在 Gateway 不可用时启用,让 pcg serve 本地也能走 cache HIT 路径。
   */
  getFromLocalCache(key, _isFetch) {
    var _a, _b;
    try {
      const cacheDir = path.resolve(process.cwd(), "..", "..", "cache");
      const buildIds = fs.readdirSync(cacheDir).filter((d) => {
        try {
          return fs.statSync(path.join(cacheDir, d)).isDirectory();
        } catch (_a2) {
          return false;
        }
      });
      for (const bid of buildIds) {
        const filePath = path.join(cacheDir, bid, `${key}.cache`);
        try {
          const raw = fs.readFileSync(filePath, "utf-8");
          const value = JSON.parse(raw);
          const stat = fs.statSync(filePath);
          const tags = (_b = (_a = value === null || value === void 0 ? void 0 : value.meta) === null || _a === void 0 ? void 0 : _a.headers) === null || _b === void 0 ? void 0 : _b["x-next-cache-tags"];
          if (typeof tags === "string") {
            (0, edge_context_1.setCacheTags)(tags);
          }
          console.log(`[incrementalCache] local cache HIT: key="${key}" tags=${tags !== null && tags !== void 0 ? tags : "\u2205"}`);
          return { value, lastModified: stat.mtimeMs };
        } catch (_c) {
          continue;
        }
      }
    } catch (_d) {
    }
    return null;
  }
  /**
   * 通过 Gateway 删除缓存。
   */
  async delete(key, isFetch) {
    const config = this.getConfig();
    if (!config)
      return;
    const ossKey = buildKey(config, key, isFetch);
    try {
      const res = await (0, gateway_auth_1.gatewayFetch)(config, `/storage/${ossKey}`, {
        method: "DELETE",
        timeoutMs: DELETE_TIMEOUT
      });
      if (res.status === 404)
        return;
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          console.error(`[incrementalCache] DELETE \u88AB\u62D2\u7EDD: key="${ossKey}" (${res.status})\uFF0C\u8BF7\u68C0\u67E5\u7B7E\u540D secret \u6216 key \u524D\u7F00`);
        } else {
          console.warn(`[incrementalCache] DELETE \u5931\u8D25: key="${ossKey}", \u72B6\u6001\u7801=${res.status}`);
        }
      }
    } catch (err) {
      if (err.name === "AbortError") {
        console.warn(`[incrementalCache] DELETE \u8D85\u65F6: key="${ossKey}" (${DELETE_TIMEOUT}ms)`);
      } else {
        console.warn(`[incrementalCache] DELETE \u5F02\u5E38: key="${ossKey}", ${err.message}`);
      }
    }
  }
};
exports.default = GatewayIncrementalCache;
