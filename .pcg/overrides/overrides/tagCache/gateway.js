"use strict";
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
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

// dist/runtime/build-id.js
var require_build_id = __commonJS({
  "dist/runtime/build-id.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.__setBuildIdForTest = exports2.__resetBuildIdCache = exports2.loadBuildId = void 0;
    var fs = require("fs");
    var path = require("path");
    var cached;
    function loadBuildId() {
      var _a;
      if (cached !== void 0)
        return cached;
      const p = path.join(__dirname, ".next", "BUILD_ID");
      try {
        const v = fs.readFileSync(p, "utf-8").trim();
        cached = v || null;
      } catch (err) {
        if ((err === null || err === void 0 ? void 0 : err.code) !== "ENOENT") {
          console.warn(`[build-id] BUILD_ID read error ${p}: ${(_a = err === null || err === void 0 ? void 0 : err.message) !== null && _a !== void 0 ? _a : err}`);
        } else {
          console.warn(`[build-id] BUILD_ID not found at ${p}`);
        }
        cached = null;
      }
      return cached;
    }
    exports2.loadBuildId = loadBuildId;
    function __resetBuildIdCache() {
      cached = void 0;
    }
    exports2.__resetBuildIdCache = __resetBuildIdCache;
    function __setBuildIdForTest(v) {
      cached = v;
    }
    exports2.__setBuildIdForTest = __setBuildIdForTest;
  }
});

// dist/overrides/tagCache/gateway.js
Object.defineProperty(exports, "__esModule", { value: true });
var gateway_auth_1 = require_gateway_auth();
var edge_context_1 = require_edge_context();
var build_id_1 = require_build_id();
var QUERY_TIMEOUT = 3e3;
var WRITE_TIMEOUT = 5e3;
var BATCH_SIZE = 200;
var PURGE_TIMEOUT = 15e3;
function stripLeadingSlash(s) {
  return s.replace(/^\/+/, "");
}
var GatewayTagCache = class {
  constructor() {
    this.name = "gateway-tag-cache";
    this.mode = "nextMode";
    this.config = null;
    this.configLoaded = false;
  }
  getConfig() {
    if (!this.configLoaded) {
      this.config = (0, gateway_auth_1.loadGatewayAuthConfig)();
      this.configLoaded = true;
    }
    return this.config;
  }
  /**
   * 拼 TableStore tag 主键:`{buildId}/{tag}`。
   *
   * 使用 BUILD_ID(Next.js 构建产物身份)而非 cfg.version(ESA 平台版本号),
   * 原因:同一个 buildId 内 manifest 与 tag 行身份严格一致,避免
   * 部署侧注入 ESA_CACHE_GW_VERSION 与构建期 BUILD_ID 不一致时 key 全部错位。
   *
   * BUILD_ID 读不到(老 bundle / 错误可靠度) → 降级为不加前缀,与老版本行为兼容。
   */
  buildTagKey(tag) {
    const buildId = (0, build_id_1.loadBuildId)();
    const prefix = buildId ? `${buildId}/` : "";
    return `${prefix}${stripLeadingSlash(tag)}`;
  }
  async getLastRevalidated(tags) {
    const config = this.getConfig();
    if (!config)
      return 0;
    try {
      const rows = await this.batchGetTags(config, tags);
      let maxRevalidatedAt = 0;
      for (const row of rows) {
        if (row.revalidatedAt && row.revalidatedAt > maxRevalidatedAt) {
          maxRevalidatedAt = row.revalidatedAt;
        }
      }
      return maxRevalidatedAt;
    } catch (err) {
      console.warn(`[tagCache] getLastRevalidated error: ${err.message}`);
      return 0;
    }
  }
  async hasBeenRevalidated(tags, lastModified) {
    const config = this.getConfig();
    if (!config)
      return false;
    if (tags.length === 0)
      return false;
    try {
      const rows = await this.batchGetTags(config, tags);
      const now = Date.now();
      const lm = lastModified !== null && lastModified !== void 0 ? lastModified : 0;
      for (const row of rows) {
        if (row.expire !== void 0) {
          if (row.expire <= now && row.expire > lm) {
            return true;
          }
          continue;
        }
        if (row.revalidatedAt !== void 0 && row.revalidatedAt > lm) {
          return true;
        }
      }
      return false;
    } catch (err) {
      console.warn(`[tagCache] hasBeenRevalidated error: ${err.message}`);
      return false;
    }
  }
  async isStale(tags, lastModified) {
    var _a;
    const config = this.getConfig();
    if (!config)
      return false;
    if (tags.length === 0)
      return false;
    try {
      const rows = await this.batchGetTags(config, tags);
      const lm = lastModified !== null && lastModified !== void 0 ? lastModified : 0;
      for (const row of rows) {
        if (row.stale === void 0)
          continue;
        const revalidatedAt = (_a = row.revalidatedAt) !== null && _a !== void 0 ? _a : 0;
        if (revalidatedAt > lm && row.stale >= lm) {
          return true;
        }
      }
      return false;
    } catch (err) {
      console.warn(`[tagCache] isStale error: ${err.message}`);
      return false;
    }
  }
  async writeTags(tags) {
    if (!tags || tags.length === 0)
      return;
    const config = this.getConfig();
    if (!config)
      return;
    const writeTs = Date.now();
    const rows = tags.map((input) => {
      const tagStr = typeof input === "string" ? input : input.tag;
      const stale = typeof input === "string" ? void 0 : input.stale;
      const expire = typeof input === "string" ? void 0 : input.expire;
      const tagKey = this.buildTagKey(tagStr);
      const revalidatedAt = stale !== null && stale !== void 0 ? stale : writeTs;
      const staleStr = stale === void 0 ? "\u2205" : String(stale);
      const expireStr = expire === void 0 ? "\u2205" : String(expire);
      console.log(`[tagCache] writeTags: tag="${tagStr}" key="${tagKey}" revalidatedAt=${revalidatedAt} stale=${staleStr} expire=${expireStr}`);
      const columns = [
        { name: "revalidatedAt", value: revalidatedAt }
      ];
      if (stale !== void 0) {
        columns.push({ name: "stale", value: stale });
      }
      if (expire !== void 0) {
        columns.push({ name: "expire", value: expire });
      }
      return {
        primaryKey: [
          { name: "app_id", value: `${config.aliuid}/${config.routinename}` },
          { name: "tag", value: tagKey }
        ],
        columns
      };
    });
    await this.batchWrite(config, rows);
    const tagStrs = tags.map((t) => typeof t === "string" ? t : t.tag).filter((s) => typeof s === "string" && s.length > 0);
    if (tagStrs.length > 0) {
      this.purgeByCacheTags(config, tagStrs).catch((err) => {
        var _a;
        console.warn(`[tagCache] cacheTags purge failed: ${(_a = err === null || err === void 0 ? void 0 : err.message) !== null && _a !== void 0 ? _a : err}`);
      });
    }
  }
  // ---- private methods ----
  async batchGetTags(config, tags) {
    var _a, _b;
    const tagKeys = tags.map((tag) => this.buildTagKey(tag));
    console.log(`[tagCache] batchGetTags: tags=${JSON.stringify(tags)} keys=${JSON.stringify(tagKeys)}`);
    const primaryKeys = tags.map((tag) => [
      { name: "app_id", value: `${config.aliuid}/${config.routinename}` },
      { name: "tag", value: this.buildTagKey(tag) }
    ]);
    const res = await (0, gateway_auth_1.gatewayFetch)(config, "/table/batch-get-row", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ primaryKeys }),
      timeoutMs: QUERY_TIMEOUT
    });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        console.error(`[tagCache] batch-get-row rejected (${res.status})`);
      } else {
        console.warn(`[tagCache] batch-get-row failed: status=${res.status}`);
      }
      return [];
    }
    const data = await res.json();
    console.log(`[tagCache] batch-get-row ok: tags=${tags.length} rows=${(_b = (_a = data.rows) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0}`);
    if (!data.rows)
      return [];
    return data.rows.map((row) => {
      var _a2;
      const result = {};
      for (const col of (_a2 = row.columns) !== null && _a2 !== void 0 ? _a2 : []) {
        if (col.name === "revalidatedAt" && typeof col.value === "number") {
          result.revalidatedAt = col.value;
        } else if (col.name === "stale" && typeof col.value === "number") {
          result.stale = col.value;
        } else if (col.name === "expire" && typeof col.value === "number") {
          result.expire = col.value;
        }
      }
      return result;
    });
  }
  async batchWrite(config, rows) {
    if (rows.length === 0)
      return;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      try {
        const res = await (0, gateway_auth_1.gatewayFetch)(config, "/table/batch-write", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rows: batch }),
          timeoutMs: WRITE_TIMEOUT
        });
        if (res.status === 401 || res.status === 403) {
          console.error(`[tagCache] batch-write rejected (${res.status})`);
          return;
        }
        if (!res.ok) {
          console.warn(`[tagCache] batch-write failed: status=${res.status}`);
        } else {
          console.log(`[tagCache] batch-write ok: rows=${batch.length}`);
        }
      } catch (err) {
        if (err.name === "AbortError") {
          console.warn(`[tagCache] batch-write timeout (${WRITE_TIMEOUT}ms)`);
        } else {
          console.warn(`[tagCache] batch-write error: ${err.message}`);
        }
      }
    }
  }
  /**
   * 调 Gateway /cache/refresh(cacheTags) 触发 ESA PurgeCaches Type=cachetag。
   * hostname / siteId 从当前请求的 edge context 读取,缺失则 skip。
   */
  async purgeByCacheTags(config, tags) {
    var _a;
    const { hostname, siteId } = (0, edge_context_1.getEdgeContext)();
    if (!hostname || siteId === void 0 || siteId === "") {
      console.warn(`[tagCache] cacheTags purge skip: edge context missing (hostname=${hostname !== null && hostname !== void 0 ? hostname : "\u2205"} siteId=${siteId !== null && siteId !== void 0 ? siteId : "\u2205"})`);
      return;
    }
    const body = { hostname, siteId, cacheTags: tags };
    try {
      const res = await (0, gateway_auth_1.gatewayFetch)(config, "/cache/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        timeoutMs: PURGE_TIMEOUT
      });
      if (!res.ok) {
        let detail = "";
        try {
          detail = (await res.text()).slice(0, 200);
        } catch (_b) {
        }
        console.warn(`[tagCache] cacheTags purge failed: status=${res.status} tags=${tags.length} ${detail}`);
        return;
      }
      console.log(`[tagCache] cacheTags purge ok: tags=${tags.length}`);
    } catch (err) {
      console.warn(`[tagCache] cacheTags purge error: ${(_a = err === null || err === void 0 ? void 0 : err.message) !== null && _a !== void 0 ? _a : err}`);
    }
  }
};
exports.default = GatewayTagCache;
