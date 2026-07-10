
import {Buffer} from "node:buffer";
globalThis.Buffer = Buffer;

import {AsyncLocalStorage} from "node:async_hooks";
globalThis.AsyncLocalStorage = AsyncLocalStorage;


const defaultDefineProperty = Object.defineProperty;
Object.defineProperty = function(o, p, a) {
  if(p=== '__import_unsupported' && Boolean(globalThis.__import_unsupported)) {
    return;
  }
  return defaultDefineProperty(o, p, a);
};

  
  
  globalThis.openNextDebug = false;globalThis.openNextVersion = "3.7.0";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/@opennextjs/aws/dist/utils/error.js
function isOpenNextError(e) {
  try {
    return "__openNextInternal" in e;
  } catch {
    return false;
  }
}
var init_error = __esm({
  "node_modules/@opennextjs/aws/dist/utils/error.js"() {
  }
});

// node_modules/@opennextjs/aws/dist/adapters/logger.js
function debug(...args) {
  if (globalThis.openNextDebug) {
    console.log(...args);
  }
}
function warn(...args) {
  console.warn(...args);
}
function error(...args) {
  if (args.some((arg) => isDownplayedErrorLog(arg))) {
    return debug(...args);
  }
  if (args.some((arg) => isOpenNextError(arg))) {
    const error2 = args.find((arg) => isOpenNextError(arg));
    if (error2.logLevel < getOpenNextErrorLogLevel()) {
      return;
    }
    if (error2.logLevel === 0) {
      return console.log(...args.map((arg) => isOpenNextError(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    if (error2.logLevel === 1) {
      return warn(...args.map((arg) => isOpenNextError(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    return console.error(...args);
  }
  console.error(...args);
}
function getOpenNextErrorLogLevel() {
  const strLevel = process.env.OPEN_NEXT_ERROR_LOG_LEVEL ?? "1";
  switch (strLevel.toLowerCase()) {
    case "debug":
    case "0":
      return 0;
    case "error":
    case "2":
      return 2;
    default:
      return 1;
  }
}
var DOWNPLAYED_ERROR_LOGS, isDownplayedErrorLog;
var init_logger = __esm({
  "node_modules/@opennextjs/aws/dist/adapters/logger.js"() {
    init_error();
    DOWNPLAYED_ERROR_LOGS = [
      {
        clientName: "S3Client",
        commandName: "GetObjectCommand",
        errorName: "NoSuchKey"
      }
    ];
    isDownplayedErrorLog = (errorLog) => DOWNPLAYED_ERROR_LOGS.some((downplayedInput) => downplayedInput.clientName === errorLog?.clientName && downplayedInput.commandName === errorLog?.commandName && (downplayedInput.errorName === errorLog?.error?.name || downplayedInput.errorName === errorLog?.error?.Code));
  }
});

// node_modules/@opennextjs/aws/node_modules/cookie/dist/index.js
var require_dist = __commonJS({
  "node_modules/@opennextjs/aws/node_modules/cookie/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseCookie = parseCookie;
    exports.parse = parseCookie;
    exports.stringifyCookie = stringifyCookie;
    exports.stringifySetCookie = stringifySetCookie;
    exports.serialize = stringifySetCookie;
    exports.parseSetCookie = parseSetCookie;
    exports.stringifySetCookie = stringifySetCookie;
    exports.serialize = stringifySetCookie;
    var cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;
    var cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/;
    var domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
    var pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
    var maxAgeRegExp = /^-?\d+$/;
    var __toString = Object.prototype.toString;
    var NullObject = /* @__PURE__ */ (() => {
      const C = function() {
      };
      C.prototype = /* @__PURE__ */ Object.create(null);
      return C;
    })();
    function parseCookie(str, options) {
      const obj = new NullObject();
      const len = str.length;
      if (len < 2)
        return obj;
      const dec = options?.decode || decode;
      let index = 0;
      do {
        const eqIdx = eqIndex(str, index, len);
        if (eqIdx === -1)
          break;
        const endIdx = endIndex(str, index, len);
        if (eqIdx > endIdx) {
          index = str.lastIndexOf(";", eqIdx - 1) + 1;
          continue;
        }
        const key = valueSlice(str, index, eqIdx);
        if (obj[key] === void 0) {
          obj[key] = dec(valueSlice(str, eqIdx + 1, endIdx));
        }
        index = endIdx + 1;
      } while (index < len);
      return obj;
    }
    function stringifyCookie(cookie, options) {
      const enc = options?.encode || encodeURIComponent;
      const cookieStrings = [];
      for (const name of Object.keys(cookie)) {
        const val = cookie[name];
        if (val === void 0)
          continue;
        if (!cookieNameRegExp.test(name)) {
          throw new TypeError(`cookie name is invalid: ${name}`);
        }
        const value = enc(val);
        if (!cookieValueRegExp.test(value)) {
          throw new TypeError(`cookie val is invalid: ${val}`);
        }
        cookieStrings.push(`${name}=${value}`);
      }
      return cookieStrings.join("; ");
    }
    function stringifySetCookie(_name, _val, _opts) {
      const cookie = typeof _name === "object" ? _name : { ..._opts, name: _name, value: String(_val) };
      const options = typeof _val === "object" ? _val : _opts;
      const enc = options?.encode || encodeURIComponent;
      if (!cookieNameRegExp.test(cookie.name)) {
        throw new TypeError(`argument name is invalid: ${cookie.name}`);
      }
      const value = cookie.value ? enc(cookie.value) : "";
      if (!cookieValueRegExp.test(value)) {
        throw new TypeError(`argument val is invalid: ${cookie.value}`);
      }
      let str = cookie.name + "=" + value;
      if (cookie.maxAge !== void 0) {
        if (!Number.isInteger(cookie.maxAge)) {
          throw new TypeError(`option maxAge is invalid: ${cookie.maxAge}`);
        }
        str += "; Max-Age=" + cookie.maxAge;
      }
      if (cookie.domain) {
        if (!domainValueRegExp.test(cookie.domain)) {
          throw new TypeError(`option domain is invalid: ${cookie.domain}`);
        }
        str += "; Domain=" + cookie.domain;
      }
      if (cookie.path) {
        if (!pathValueRegExp.test(cookie.path)) {
          throw new TypeError(`option path is invalid: ${cookie.path}`);
        }
        str += "; Path=" + cookie.path;
      }
      if (cookie.expires) {
        if (!isDate(cookie.expires) || !Number.isFinite(cookie.expires.valueOf())) {
          throw new TypeError(`option expires is invalid: ${cookie.expires}`);
        }
        str += "; Expires=" + cookie.expires.toUTCString();
      }
      if (cookie.httpOnly) {
        str += "; HttpOnly";
      }
      if (cookie.secure) {
        str += "; Secure";
      }
      if (cookie.partitioned) {
        str += "; Partitioned";
      }
      if (cookie.priority) {
        const priority = typeof cookie.priority === "string" ? cookie.priority.toLowerCase() : void 0;
        switch (priority) {
          case "low":
            str += "; Priority=Low";
            break;
          case "medium":
            str += "; Priority=Medium";
            break;
          case "high":
            str += "; Priority=High";
            break;
          default:
            throw new TypeError(`option priority is invalid: ${cookie.priority}`);
        }
      }
      if (cookie.sameSite) {
        const sameSite = typeof cookie.sameSite === "string" ? cookie.sameSite.toLowerCase() : cookie.sameSite;
        switch (sameSite) {
          case true:
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError(`option sameSite is invalid: ${cookie.sameSite}`);
        }
      }
      return str;
    }
    function parseSetCookie(str, options) {
      const dec = options?.decode || decode;
      const len = str.length;
      const endIdx = endIndex(str, 0, len);
      const eqIdx = eqIndex(str, 0, endIdx);
      const setCookie = eqIdx === -1 ? { name: "", value: dec(valueSlice(str, 0, endIdx)) } : {
        name: valueSlice(str, 0, eqIdx),
        value: dec(valueSlice(str, eqIdx + 1, endIdx))
      };
      let index = endIdx + 1;
      while (index < len) {
        const endIdx2 = endIndex(str, index, len);
        const eqIdx2 = eqIndex(str, index, endIdx2);
        const attr = eqIdx2 === -1 ? valueSlice(str, index, endIdx2) : valueSlice(str, index, eqIdx2);
        const val = eqIdx2 === -1 ? void 0 : valueSlice(str, eqIdx2 + 1, endIdx2);
        switch (attr.toLowerCase()) {
          case "httponly":
            setCookie.httpOnly = true;
            break;
          case "secure":
            setCookie.secure = true;
            break;
          case "partitioned":
            setCookie.partitioned = true;
            break;
          case "domain":
            setCookie.domain = val;
            break;
          case "path":
            setCookie.path = val;
            break;
          case "max-age":
            if (val && maxAgeRegExp.test(val))
              setCookie.maxAge = Number(val);
            break;
          case "expires":
            if (!val)
              break;
            const date = new Date(val);
            if (Number.isFinite(date.valueOf()))
              setCookie.expires = date;
            break;
          case "priority":
            if (!val)
              break;
            const priority = val.toLowerCase();
            if (priority === "low" || priority === "medium" || priority === "high") {
              setCookie.priority = priority;
            }
            break;
          case "samesite":
            if (!val)
              break;
            const sameSite = val.toLowerCase();
            if (sameSite === "lax" || sameSite === "strict" || sameSite === "none") {
              setCookie.sameSite = sameSite;
            }
            break;
        }
        index = endIdx2 + 1;
      }
      return setCookie;
    }
    function endIndex(str, min, len) {
      const index = str.indexOf(";", min);
      return index === -1 ? len : index;
    }
    function eqIndex(str, min, max) {
      const index = str.indexOf("=", min);
      return index < max ? index : -1;
    }
    function valueSlice(str, min, max) {
      let start = min;
      let end = max;
      do {
        const code = str.charCodeAt(start);
        if (code !== 32 && code !== 9)
          break;
      } while (++start < end);
      while (end > start) {
        const code = str.charCodeAt(end - 1);
        if (code !== 32 && code !== 9)
          break;
        end--;
      }
      return str.slice(start, end);
    }
    function decode(str) {
      if (str.indexOf("%") === -1)
        return str;
      try {
        return decodeURIComponent(str);
      } catch (e) {
        return str;
      }
    }
    function isDate(val) {
      return __toString.call(val) === "[object Date]";
    }
  }
});

// node_modules/@opennextjs/aws/dist/http/util.js
function parseSetCookieHeader(cookies) {
  if (!cookies) {
    return [];
  }
  if (typeof cookies === "string") {
    return cookies.split(/(?<!Expires=\w+),/i).map((c) => c.trim());
  }
  return cookies;
}
function getQueryFromIterator(it) {
  const query = {};
  for (const [key, value] of it) {
    if (key in query) {
      if (Array.isArray(query[key])) {
        query[key].push(value);
      } else {
        query[key] = [query[key], value];
      }
    } else {
      query[key] = value;
    }
  }
  return query;
}
var init_util = __esm({
  "node_modules/@opennextjs/aws/dist/http/util.js"() {
  }
});

// node_modules/@opennextjs/aws/dist/overrides/converters/utils.js
function getQueryFromSearchParams(searchParams) {
  return getQueryFromIterator(searchParams.entries());
}
var init_utils = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/converters/utils.js"() {
    init_util();
  }
});

// node_modules/@opennextjs/aws/dist/overrides/converters/edge.js
var edge_exports = {};
__export(edge_exports, {
  default: () => edge_default
});
import { Buffer as Buffer2 } from "node:buffer";
var import_cookie, NULL_BODY_STATUSES, converter, edge_default;
var init_edge = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/converters/edge.js"() {
    import_cookie = __toESM(require_dist(), 1);
    init_util();
    init_utils();
    NULL_BODY_STATUSES = /* @__PURE__ */ new Set([101, 103, 204, 205, 304]);
    converter = {
      convertFrom: async (event) => {
        const url = new URL(event.url);
        const searchParams = url.searchParams;
        const query = getQueryFromSearchParams(searchParams);
        const body = await event.arrayBuffer();
        const headers = {};
        event.headers.forEach((value, key) => {
          headers[key] = value;
        });
        const rawPath = url.pathname;
        const method = event.method;
        const shouldHaveBody = method !== "GET" && method !== "HEAD";
        const cookieHeader = event.headers.get("cookie");
        const cookies = cookieHeader ? import_cookie.default.parse(cookieHeader) : {};
        return {
          type: "core",
          method,
          rawPath,
          url: event.url,
          body: shouldHaveBody ? Buffer2.from(body) : void 0,
          headers,
          remoteAddress: event.headers.get("x-forwarded-for") ?? "::1",
          query,
          cookies
        };
      },
      convertTo: async (result) => {
        if ("internalEvent" in result) {
          const request = new Request(result.internalEvent.url, {
            body: result.internalEvent.body,
            method: result.internalEvent.method,
            headers: {
              ...result.internalEvent.headers,
              "x-forwarded-host": result.internalEvent.headers.host
            }
          });
          if (globalThis.__dangerous_ON_edge_converter_returns_request === true) {
            return request;
          }
          const cfCache = (result.isISR || result.internalEvent.rawPath.startsWith("/_next/image")) && process.env.DISABLE_CACHE !== "true" ? { cacheEverything: true } : {};
          return fetch(request, {
            // This is a hack to make sure that the response is cached by Cloudflare
            // See https://developers.cloudflare.com/workers/examples/cache-using-fetch/#caching-html-resources
            // @ts-expect-error - This is a Cloudflare specific option
            cf: cfCache
          });
        }
        const headers = new Headers();
        for (const [key, value] of Object.entries(result.headers)) {
          if (key === "set-cookie" && typeof value === "string") {
            const cookies = parseSetCookieHeader(value);
            for (const cookie of cookies) {
              headers.append(key, cookie);
            }
            continue;
          }
          if (Array.isArray(value)) {
            for (const v of value) {
              headers.append(key, v);
            }
          } else {
            headers.set(key, value);
          }
        }
        const body = NULL_BODY_STATUSES.has(result.statusCode) ? null : result.body;
        return new Response(body, {
          status: result.statusCode,
          headers
        });
      },
      name: "edge"
    };
    edge_default = converter;
  }
});

// node_modules/@opennextjs/aws/dist/overrides/wrappers/cloudflare-edge.js
var cloudflare_edge_exports = {};
__export(cloudflare_edge_exports, {
  default: () => cloudflare_edge_default
});
var cfPropNameMapping, handler, cloudflare_edge_default;
var init_cloudflare_edge = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/wrappers/cloudflare-edge.js"() {
    cfPropNameMapping = {
      // The city name is percent-encoded.
      // See https://github.com/vercel/vercel/blob/4cb6143/packages/functions/src/headers.ts#L94C19-L94C37
      city: [encodeURIComponent, "x-open-next-city"],
      country: "x-open-next-country",
      regionCode: "x-open-next-region",
      latitude: "x-open-next-latitude",
      longitude: "x-open-next-longitude"
    };
    handler = async (handler3, converter2) => async (request, env, ctx) => {
      globalThis.process = process;
      for (const [key, value] of Object.entries(env)) {
        if (typeof value === "string") {
          process.env[key] = value;
        }
      }
      const internalEvent = await converter2.convertFrom(request);
      const cfProperties = request.cf;
      for (const [propName, mapping] of Object.entries(cfPropNameMapping)) {
        const propValue = cfProperties?.[propName];
        if (propValue != null) {
          const [encode, headerName] = Array.isArray(mapping) ? mapping : [null, mapping];
          internalEvent.headers[headerName] = encode ? encode(propValue) : propValue;
        }
      }
      const response = await handler3(internalEvent, {
        waitUntil: ctx.waitUntil.bind(ctx)
      });
      const result = await converter2.convertTo(response);
      return result;
    };
    cloudflare_edge_default = {
      wrapper: handler,
      name: "cloudflare-edge",
      supportStreaming: true,
      edgeRuntime: true
    };
  }
});

// node_modules/@opennextjs/aws/dist/overrides/originResolver/pattern-env.js
var pattern_env_exports = {};
__export(pattern_env_exports, {
  default: () => pattern_env_default
});
var envLoader, pattern_env_default;
var init_pattern_env = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/originResolver/pattern-env.js"() {
    init_logger();
    envLoader = {
      name: "env",
      resolve: async (_path) => {
        try {
          const origin = JSON.parse(process.env.OPEN_NEXT_ORIGIN ?? "{}");
          for (const [key, value] of Object.entries(globalThis.openNextConfig.functions ?? {}).filter(([key2]) => key2 !== "default")) {
            if (value.patterns.some((pattern) => {
              return new RegExp(
                // transform glob pattern to regex
                `/${pattern.replace(/\*\*/g, "(.*)").replace(/\*/g, "([^/]*)").replace(/\//g, "\\/").replace(/\?/g, ".")}`
              ).test(_path);
            })) {
              debug("Using origin", key, value.patterns);
              return origin[key];
            }
          }
          if (_path.startsWith("/_next/image") && origin.imageOptimizer) {
            debug("Using origin", "imageOptimizer", _path);
            return origin.imageOptimizer;
          }
          if (origin.default) {
            debug("Using default origin", origin.default, _path);
            return origin.default;
          }
          return false;
        } catch (e) {
          error("Error while resolving origin", e);
          return false;
        }
      }
    };
    pattern_env_default = envLoader;
  }
});

// node_modules/@opennextjs/aws/dist/overrides/assetResolver/dummy.js
var dummy_exports = {};
__export(dummy_exports, {
  default: () => dummy_default
});
var resolver, dummy_default;
var init_dummy = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/assetResolver/dummy.js"() {
    resolver = {
      name: "dummy"
    };
    dummy_default = resolver;
  }
});

// node_modules/@opennextjs/aws/dist/utils/stream.js
import { Readable } from "node:stream";
function toReadableStream(value, isBase64) {
  return Readable.toWeb(Readable.from(Buffer.from(value, isBase64 ? "base64" : "utf8")));
}
function emptyReadableStream() {
  if (process.env.OPEN_NEXT_FORCE_NON_EMPTY_RESPONSE === "true") {
    return Readable.toWeb(Readable.from([Buffer.from("SOMETHING")]));
  }
  return Readable.toWeb(Readable.from([]));
}
var init_stream = __esm({
  "node_modules/@opennextjs/aws/dist/utils/stream.js"() {
  }
});

// node_modules/@opennextjs/aws/dist/overrides/proxyExternalRequest/fetch.js
var fetch_exports = {};
__export(fetch_exports, {
  default: () => fetch_default
});
var fetchProxy, fetch_default;
var init_fetch = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/proxyExternalRequest/fetch.js"() {
    init_stream();
    fetchProxy = {
      name: "fetch-proxy",
      // @ts-ignore
      proxy: async (internalEvent) => {
        const { url, headers: eventHeaders, method, body } = internalEvent;
        const headers = Object.fromEntries(Object.entries(eventHeaders).filter(([key]) => key.toLowerCase() !== "cf-connecting-ip"));
        const response = await fetch(url, {
          method,
          headers,
          body
        });
        const responseHeaders = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });
        return {
          type: "core",
          headers: responseHeaders,
          statusCode: response.status,
          isBase64Encoded: true,
          body: response.body ?? emptyReadableStream()
        };
      }
    };
    fetch_default = fetchProxy;
  }
});

// .next/server/edge-runtime-webpack.js
var require_edge_runtime_webpack = __commonJS({
  ".next/server/edge-runtime-webpack.js"() {
    "use strict";
    (() => {
      "use strict";
      var e = {}, r = {};
      function t(o) {
        var n = r[o];
        if (void 0 !== n) return n.exports;
        var i = r[o] = { exports: {} }, l = true;
        try {
          e[o](i, i.exports, t), l = false;
        } finally {
          l && delete r[o];
        }
        return i.exports;
      }
      t.m = e, t.amdO = {}, (() => {
        var e2 = [];
        t.O = (r2, o, n, i) => {
          if (o) {
            i = i || 0;
            for (var l = e2.length; l > 0 && e2[l - 1][2] > i; l--) e2[l] = e2[l - 1];
            e2[l] = [o, n, i];
            return;
          }
          for (var a = 1 / 0, l = 0; l < e2.length; l++) {
            for (var [o, n, i] = e2[l], f = true, u = 0; u < o.length; u++) a >= i && Object.keys(t.O).every((e3) => t.O[e3](o[u])) ? o.splice(u--, 1) : (f = false, i < a && (a = i));
            if (f) {
              e2.splice(l--, 1);
              var s = n();
              void 0 !== s && (r2 = s);
            }
          }
          return r2;
        };
      })(), t.d = (e2, r2) => {
        for (var o in r2) t.o(r2, o) && !t.o(e2, o) && Object.defineProperty(e2, o, { enumerable: true, get: r2[o] });
      }, t.g = function() {
        if ("object" == typeof globalThis) return globalThis;
        try {
          return this || Function("return this")();
        } catch (e2) {
          if ("object" == typeof window) return window;
        }
      }(), t.o = (e2, r2) => Object.prototype.hasOwnProperty.call(e2, r2), t.r = (e2) => {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e2, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(e2, "__esModule", { value: true });
      }, (() => {
        var e2 = { 993: 0 };
        t.O.j = (r3) => 0 === e2[r3];
        var r2 = (r3, o2) => {
          var n, i, [l, a, f] = o2, u = 0;
          if (l.some((r4) => 0 !== e2[r4])) {
            for (n in a) t.o(a, n) && (t.m[n] = a[n]);
            if (f) var s = f(t);
          }
          for (r3 && r3(o2); u < l.length; u++) i = l[u], t.o(e2, i) && e2[i] && e2[i][0](), e2[i] = 0;
          return t.O(s);
        }, o = self.webpackChunk_N_E = self.webpackChunk_N_E || [];
        o.forEach(r2.bind(null, 0)), o.push = r2.bind(null, o.push.bind(o));
      })();
    })();
  }
});

// node-built-in-modules:node:async_hooks
var node_async_hooks_exports = {};
import * as node_async_hooks_star from "node:async_hooks";
var init_node_async_hooks = __esm({
  "node-built-in-modules:node:async_hooks"() {
    __reExport(node_async_hooks_exports, node_async_hooks_star);
  }
});

// node-built-in-modules:node:buffer
var node_buffer_exports = {};
import * as node_buffer_star from "node:buffer";
var init_node_buffer = __esm({
  "node-built-in-modules:node:buffer"() {
    __reExport(node_buffer_exports, node_buffer_star);
  }
});

// .next/server/middleware.js
var require_middleware = __commonJS({
  ".next/server/middleware.js"() {
    "use strict";
    (self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([[826], { 67: (e) => {
      "use strict";
      e.exports = (init_node_async_hooks(), __toCommonJS(node_async_hooks_exports));
    }, 195: (e) => {
      "use strict";
      e.exports = (init_node_buffer(), __toCommonJS(node_buffer_exports));
    }, 194: (e, t, r) => {
      "use strict";
      let n;
      r.r(t), r.d(t, { default: () => ez });
      var i, o, a, s, l, u, d, c, h, p, f, g, m = {};
      async function w() {
        let e2 = "_ENTRIES" in globalThis && _ENTRIES.middleware_instrumentation && (await _ENTRIES.middleware_instrumentation).register;
        if (e2) try {
          await e2();
        } catch (e3) {
          throw e3.message = `An error occurred while loading instrumentation hook: ${e3.message}`, e3;
        }
      }
      r.r(m), r.d(m, { config: () => e$, middleware: () => eU });
      let b = null;
      function v() {
        return b || (b = w()), b;
      }
      function x(e2) {
        return `The edge runtime does not support Node.js '${e2}' module.
Learn More: https://nextjs.org/docs/messages/node-module-in-edge-runtime`;
      }
      process !== r.g.process && (process.env = r.g.process.env, r.g.process = process), Object.defineProperty(globalThis, "__import_unsupported", { value: function(e2) {
        let t2 = new Proxy(function() {
        }, { get(t3, r2) {
          if ("then" === r2) return {};
          throw Error(x(e2));
        }, construct() {
          throw Error(x(e2));
        }, apply(r2, n2, i2) {
          if ("function" == typeof i2[0]) return i2[0](t2);
          throw Error(x(e2));
        } });
        return new Proxy({}, { get: () => t2 });
      }, enumerable: false, configurable: false }), v();
      class y extends Error {
        constructor({ page: e2 }) {
          super(`The middleware "${e2}" accepts an async API directly with the form:
  
  export function middleware(request, event) {
    return NextResponse.redirect('/new-location')
  }
  
  Read more: https://nextjs.org/docs/messages/middleware-new-signature
  `);
        }
      }
      class S extends Error {
        constructor() {
          super(`The request.page has been deprecated in favour of \`URLPattern\`.
  Read more: https://nextjs.org/docs/messages/middleware-request-page
  `);
        }
      }
      class _ extends Error {
        constructor() {
          super(`The request.ua has been removed in favour of \`userAgent\` function.
  Read more: https://nextjs.org/docs/messages/middleware-parse-user-agent
  `);
        }
      }
      let R = { shared: "shared", reactServerComponents: "rsc", serverSideRendering: "ssr", actionBrowser: "action-browser", api: "api", middleware: "middleware", instrument: "instrument", edgeAsset: "edge-asset", appPagesBrowser: "app-pages-browser", appMetadataRoute: "app-metadata-route", appRouteHandler: "app-route-handler" };
      function C(e2) {
        var t2, r2, n2, i2, o2, a2 = [], s2 = 0;
        function l2() {
          for (; s2 < e2.length && /\s/.test(e2.charAt(s2)); ) s2 += 1;
          return s2 < e2.length;
        }
        for (; s2 < e2.length; ) {
          for (t2 = s2, o2 = false; l2(); ) if ("," === (r2 = e2.charAt(s2))) {
            for (n2 = s2, s2 += 1, l2(), i2 = s2; s2 < e2.length && "=" !== (r2 = e2.charAt(s2)) && ";" !== r2 && "," !== r2; ) s2 += 1;
            s2 < e2.length && "=" === e2.charAt(s2) ? (o2 = true, s2 = i2, a2.push(e2.substring(t2, n2)), t2 = s2) : s2 = n2 + 1;
          } else s2 += 1;
          (!o2 || s2 >= e2.length) && a2.push(e2.substring(t2, e2.length));
        }
        return a2;
      }
      function k(e2) {
        let t2 = {}, r2 = [];
        if (e2) for (let [n2, i2] of e2.entries()) "set-cookie" === n2.toLowerCase() ? (r2.push(...C(i2)), t2[n2] = 1 === r2.length ? r2[0] : r2) : t2[n2] = i2;
        return t2;
      }
      function E(e2) {
        try {
          return String(new URL(String(e2)));
        } catch (t2) {
          throw Error(`URL is malformed "${String(e2)}". Please use only absolute URLs - https://nextjs.org/docs/messages/middleware-relative-urls`, { cause: t2 });
        }
      }
      ({ ...R, GROUP: { serverOnly: [R.reactServerComponents, R.actionBrowser, R.appMetadataRoute, R.appRouteHandler, R.instrument], clientOnly: [R.serverSideRendering, R.appPagesBrowser], nonClientServerTarget: [R.middleware, R.api], app: [R.reactServerComponents, R.actionBrowser, R.appMetadataRoute, R.appRouteHandler, R.serverSideRendering, R.appPagesBrowser, R.shared, R.instrument] } });
      let N = Symbol("response"), T = Symbol("passThrough"), P = Symbol("waitUntil");
      class L {
        constructor(e2) {
          this[P] = [], this[T] = false;
        }
        respondWith(e2) {
          this[N] || (this[N] = Promise.resolve(e2));
        }
        passThroughOnException() {
          this[T] = true;
        }
        waitUntil(e2) {
          this[P].push(e2);
        }
      }
      class O extends L {
        constructor(e2) {
          super(e2.request), this.sourcePage = e2.page;
        }
        get request() {
          throw new y({ page: this.sourcePage });
        }
        respondWith() {
          throw new y({ page: this.sourcePage });
        }
      }
      function A(e2) {
        return e2.replace(/\/$/, "") || "/";
      }
      function I(e2) {
        let t2 = e2.indexOf("#"), r2 = e2.indexOf("?"), n2 = r2 > -1 && (t2 < 0 || r2 < t2);
        return n2 || t2 > -1 ? { pathname: e2.substring(0, n2 ? r2 : t2), query: n2 ? e2.substring(r2, t2 > -1 ? t2 : void 0) : "", hash: t2 > -1 ? e2.slice(t2) : "" } : { pathname: e2, query: "", hash: "" };
      }
      function M(e2, t2) {
        if (!e2.startsWith("/") || !t2) return e2;
        let { pathname: r2, query: n2, hash: i2 } = I(e2);
        return "" + t2 + r2 + n2 + i2;
      }
      function q(e2, t2) {
        if (!e2.startsWith("/") || !t2) return e2;
        let { pathname: r2, query: n2, hash: i2 } = I(e2);
        return "" + r2 + t2 + n2 + i2;
      }
      function j(e2, t2) {
        if ("string" != typeof e2) return false;
        let { pathname: r2 } = I(e2);
        return r2 === t2 || r2.startsWith(t2 + "/");
      }
      function D(e2, t2) {
        let r2;
        let n2 = e2.split("/");
        return (t2 || []).some((t3) => !!n2[1] && n2[1].toLowerCase() === t3.toLowerCase() && (r2 = t3, n2.splice(1, 1), e2 = n2.join("/") || "/", true)), { pathname: e2, detectedLocale: r2 };
      }
      let U = /(?!^https?:\/\/)(127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}|\[::1\]|localhost)/;
      function $(e2, t2) {
        return new URL(String(e2).replace(U, "localhost"), t2 && String(t2).replace(U, "localhost"));
      }
      let B = Symbol("NextURLInternal");
      class H {
        constructor(e2, t2, r2) {
          let n2, i2;
          "object" == typeof t2 && "pathname" in t2 || "string" == typeof t2 ? (n2 = t2, i2 = r2 || {}) : i2 = r2 || t2 || {}, this[B] = { url: $(e2, n2 ?? i2.base), options: i2, basePath: "" }, this.analyze();
        }
        analyze() {
          var e2, t2, r2, n2, i2;
          let o2 = function(e3, t3) {
            var r3, n3;
            let { basePath: i3, i18n: o3, trailingSlash: a3 } = null != (r3 = t3.nextConfig) ? r3 : {}, s3 = { pathname: e3, trailingSlash: "/" !== e3 ? e3.endsWith("/") : a3 };
            i3 && j(s3.pathname, i3) && (s3.pathname = function(e4, t4) {
              if (!j(e4, t4)) return e4;
              let r4 = e4.slice(t4.length);
              return r4.startsWith("/") ? r4 : "/" + r4;
            }(s3.pathname, i3), s3.basePath = i3);
            let l2 = s3.pathname;
            if (s3.pathname.startsWith("/_next/data/") && s3.pathname.endsWith(".json")) {
              let e4 = s3.pathname.replace(/^\/_next\/data\//, "").replace(/\.json$/, "").split("/"), r4 = e4[0];
              s3.buildId = r4, l2 = "index" !== e4[1] ? "/" + e4.slice(1).join("/") : "/", true === t3.parseData && (s3.pathname = l2);
            }
            if (o3) {
              let e4 = t3.i18nProvider ? t3.i18nProvider.analyze(s3.pathname) : D(s3.pathname, o3.locales);
              s3.locale = e4.detectedLocale, s3.pathname = null != (n3 = e4.pathname) ? n3 : s3.pathname, !e4.detectedLocale && s3.buildId && (e4 = t3.i18nProvider ? t3.i18nProvider.analyze(l2) : D(l2, o3.locales)).detectedLocale && (s3.locale = e4.detectedLocale);
            }
            return s3;
          }(this[B].url.pathname, { nextConfig: this[B].options.nextConfig, parseData: true, i18nProvider: this[B].options.i18nProvider }), a2 = function(e3, t3) {
            let r3;
            if ((null == t3 ? void 0 : t3.host) && !Array.isArray(t3.host)) r3 = t3.host.toString().split(":", 1)[0];
            else {
              if (!e3.hostname) return;
              r3 = e3.hostname;
            }
            return r3.toLowerCase();
          }(this[B].url, this[B].options.headers);
          this[B].domainLocale = this[B].options.i18nProvider ? this[B].options.i18nProvider.detectDomainLocale(a2) : function(e3, t3, r3) {
            if (e3) for (let o3 of (r3 && (r3 = r3.toLowerCase()), e3)) {
              var n3, i3;
              if (t3 === (null == (n3 = o3.domain) ? void 0 : n3.split(":", 1)[0].toLowerCase()) || r3 === o3.defaultLocale.toLowerCase() || (null == (i3 = o3.locales) ? void 0 : i3.some((e4) => e4.toLowerCase() === r3))) return o3;
            }
          }(null == (t2 = this[B].options.nextConfig) ? void 0 : null == (e2 = t2.i18n) ? void 0 : e2.domains, a2);
          let s2 = (null == (r2 = this[B].domainLocale) ? void 0 : r2.defaultLocale) || (null == (i2 = this[B].options.nextConfig) ? void 0 : null == (n2 = i2.i18n) ? void 0 : n2.defaultLocale);
          this[B].url.pathname = o2.pathname, this[B].defaultLocale = s2, this[B].basePath = o2.basePath ?? "", this[B].buildId = o2.buildId, this[B].locale = o2.locale ?? s2, this[B].trailingSlash = o2.trailingSlash;
        }
        formatPathname() {
          var e2;
          let t2;
          return t2 = function(e3, t3, r2, n2) {
            if (!t3 || t3 === r2) return e3;
            let i2 = e3.toLowerCase();
            return !n2 && (j(i2, "/api") || j(i2, "/" + t3.toLowerCase())) ? e3 : M(e3, "/" + t3);
          }((e2 = { basePath: this[B].basePath, buildId: this[B].buildId, defaultLocale: this[B].options.forceLocale ? void 0 : this[B].defaultLocale, locale: this[B].locale, pathname: this[B].url.pathname, trailingSlash: this[B].trailingSlash }).pathname, e2.locale, e2.buildId ? void 0 : e2.defaultLocale, e2.ignorePrefix), (e2.buildId || !e2.trailingSlash) && (t2 = A(t2)), e2.buildId && (t2 = q(M(t2, "/_next/data/" + e2.buildId), "/" === e2.pathname ? "index.json" : ".json")), t2 = M(t2, e2.basePath), !e2.buildId && e2.trailingSlash ? t2.endsWith("/") ? t2 : q(t2, "/") : A(t2);
        }
        formatSearch() {
          return this[B].url.search;
        }
        get buildId() {
          return this[B].buildId;
        }
        set buildId(e2) {
          this[B].buildId = e2;
        }
        get locale() {
          return this[B].locale ?? "";
        }
        set locale(e2) {
          var t2, r2;
          if (!this[B].locale || !(null == (r2 = this[B].options.nextConfig) ? void 0 : null == (t2 = r2.i18n) ? void 0 : t2.locales.includes(e2))) throw TypeError(`The NextURL configuration includes no locale "${e2}"`);
          this[B].locale = e2;
        }
        get defaultLocale() {
          return this[B].defaultLocale;
        }
        get domainLocale() {
          return this[B].domainLocale;
        }
        get searchParams() {
          return this[B].url.searchParams;
        }
        get host() {
          return this[B].url.host;
        }
        set host(e2) {
          this[B].url.host = e2;
        }
        get hostname() {
          return this[B].url.hostname;
        }
        set hostname(e2) {
          this[B].url.hostname = e2;
        }
        get port() {
          return this[B].url.port;
        }
        set port(e2) {
          this[B].url.port = e2;
        }
        get protocol() {
          return this[B].url.protocol;
        }
        set protocol(e2) {
          this[B].url.protocol = e2;
        }
        get href() {
          let e2 = this.formatPathname(), t2 = this.formatSearch();
          return `${this.protocol}//${this.host}${e2}${t2}${this.hash}`;
        }
        set href(e2) {
          this[B].url = $(e2), this.analyze();
        }
        get origin() {
          return this[B].url.origin;
        }
        get pathname() {
          return this[B].url.pathname;
        }
        set pathname(e2) {
          this[B].url.pathname = e2;
        }
        get hash() {
          return this[B].url.hash;
        }
        set hash(e2) {
          this[B].url.hash = e2;
        }
        get search() {
          return this[B].url.search;
        }
        set search(e2) {
          this[B].url.search = e2;
        }
        get password() {
          return this[B].url.password;
        }
        set password(e2) {
          this[B].url.password = e2;
        }
        get username() {
          return this[B].url.username;
        }
        set username(e2) {
          this[B].url.username = e2;
        }
        get basePath() {
          return this[B].basePath;
        }
        set basePath(e2) {
          this[B].basePath = e2.startsWith("/") ? e2 : `/${e2}`;
        }
        toString() {
          return this.href;
        }
        toJSON() {
          return this.href;
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return { href: this.href, origin: this.origin, protocol: this.protocol, username: this.username, password: this.password, host: this.host, hostname: this.hostname, port: this.port, pathname: this.pathname, search: this.search, searchParams: this.searchParams, hash: this.hash };
        }
        clone() {
          return new H(String(this), this[B].options);
        }
      }
      var V = r(945);
      let z = Symbol("internal request");
      class F extends Request {
        constructor(e2, t2 = {}) {
          let r2 = "string" != typeof e2 && "url" in e2 ? e2.url : String(e2);
          E(r2), e2 instanceof Request ? super(e2, t2) : super(r2, t2);
          let n2 = new H(r2, { headers: k(this.headers), nextConfig: t2.nextConfig });
          this[z] = { cookies: new V.RequestCookies(this.headers), geo: t2.geo || {}, ip: t2.ip, nextUrl: n2, url: n2.toString() };
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return { cookies: this.cookies, geo: this.geo, ip: this.ip, nextUrl: this.nextUrl, url: this.url, bodyUsed: this.bodyUsed, cache: this.cache, credentials: this.credentials, destination: this.destination, headers: Object.fromEntries(this.headers), integrity: this.integrity, keepalive: this.keepalive, method: this.method, mode: this.mode, redirect: this.redirect, referrer: this.referrer, referrerPolicy: this.referrerPolicy, signal: this.signal };
        }
        get cookies() {
          return this[z].cookies;
        }
        get geo() {
          return this[z].geo;
        }
        get ip() {
          return this[z].ip;
        }
        get nextUrl() {
          return this[z].nextUrl;
        }
        get page() {
          throw new S();
        }
        get ua() {
          throw new _();
        }
        get url() {
          return this[z].url;
        }
      }
      class W {
        static get(e2, t2, r2) {
          let n2 = Reflect.get(e2, t2, r2);
          return "function" == typeof n2 ? n2.bind(e2) : n2;
        }
        static set(e2, t2, r2, n2) {
          return Reflect.set(e2, t2, r2, n2);
        }
        static has(e2, t2) {
          return Reflect.has(e2, t2);
        }
        static deleteProperty(e2, t2) {
          return Reflect.deleteProperty(e2, t2);
        }
      }
      let G = Symbol("internal response"), X = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
      function K(e2, t2) {
        var r2;
        if (null == e2 ? void 0 : null == (r2 = e2.request) ? void 0 : r2.headers) {
          if (!(e2.request.headers instanceof Headers)) throw Error("request.headers must be an instance of Headers");
          let r3 = [];
          for (let [n2, i2] of e2.request.headers) t2.set("x-middleware-request-" + n2, i2), r3.push(n2);
          t2.set("x-middleware-override-headers", r3.join(","));
        }
      }
      class Y extends Response {
        constructor(e2, t2 = {}) {
          super(e2, t2);
          let r2 = this.headers, n2 = new Proxy(new V.ResponseCookies(r2), { get(e3, n3, i2) {
            switch (n3) {
              case "delete":
              case "set":
                return (...i3) => {
                  let o2 = Reflect.apply(e3[n3], e3, i3), a2 = new Headers(r2);
                  return o2 instanceof V.ResponseCookies && r2.set("x-middleware-set-cookie", o2.getAll().map((e4) => (0, V.stringifyCookie)(e4)).join(",")), K(t2, a2), o2;
                };
              default:
                return W.get(e3, n3, i2);
            }
          } });
          this[G] = { cookies: n2, url: t2.url ? new H(t2.url, { headers: k(r2), nextConfig: t2.nextConfig }) : void 0 };
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return { cookies: this.cookies, url: this.url, body: this.body, bodyUsed: this.bodyUsed, headers: Object.fromEntries(this.headers), ok: this.ok, redirected: this.redirected, status: this.status, statusText: this.statusText, type: this.type };
        }
        get cookies() {
          return this[G].cookies;
        }
        static json(e2, t2) {
          let r2 = Response.json(e2, t2);
          return new Y(r2.body, r2);
        }
        static redirect(e2, t2) {
          let r2 = "number" == typeof t2 ? t2 : (null == t2 ? void 0 : t2.status) ?? 307;
          if (!X.has(r2)) throw RangeError('Failed to execute "redirect" on "response": Invalid status code');
          let n2 = "object" == typeof t2 ? t2 : {}, i2 = new Headers(null == n2 ? void 0 : n2.headers);
          return i2.set("Location", E(e2)), new Y(null, { ...n2, headers: i2, status: r2 });
        }
        static rewrite(e2, t2) {
          let r2 = new Headers(null == t2 ? void 0 : t2.headers);
          return r2.set("x-middleware-rewrite", E(e2)), K(t2, r2), new Y(null, { ...t2, headers: r2 });
        }
        static next(e2) {
          let t2 = new Headers(null == e2 ? void 0 : e2.headers);
          return t2.set("x-middleware-next", "1"), K(e2, t2), new Y(null, { ...e2, headers: t2 });
        }
      }
      function Z(e2, t2) {
        let r2 = "string" == typeof t2 ? new URL(t2) : t2, n2 = new URL(e2, t2), i2 = r2.protocol + "//" + r2.host;
        return n2.protocol + "//" + n2.host === i2 ? n2.toString().replace(i2, "") : n2.toString();
      }
      let J = [["RSC"], ["Next-Router-State-Tree"], ["Next-Router-Prefetch"]], Q = ["__nextFallback", "__nextLocale", "__nextInferredLocaleFromDefault", "__nextDefaultLocale", "__nextIsNotFound", "_rsc"], ee = ["__nextDataReq"];
      class et extends Error {
        constructor() {
          super("Headers cannot be modified. Read more: https://nextjs.org/docs/app/api-reference/functions/headers");
        }
        static callable() {
          throw new et();
        }
      }
      class er extends Headers {
        constructor(e2) {
          super(), this.headers = new Proxy(e2, { get(t2, r2, n2) {
            if ("symbol" == typeof r2) return W.get(t2, r2, n2);
            let i2 = r2.toLowerCase(), o2 = Object.keys(e2).find((e3) => e3.toLowerCase() === i2);
            if (void 0 !== o2) return W.get(t2, o2, n2);
          }, set(t2, r2, n2, i2) {
            if ("symbol" == typeof r2) return W.set(t2, r2, n2, i2);
            let o2 = r2.toLowerCase(), a2 = Object.keys(e2).find((e3) => e3.toLowerCase() === o2);
            return W.set(t2, a2 ?? r2, n2, i2);
          }, has(t2, r2) {
            if ("symbol" == typeof r2) return W.has(t2, r2);
            let n2 = r2.toLowerCase(), i2 = Object.keys(e2).find((e3) => e3.toLowerCase() === n2);
            return void 0 !== i2 && W.has(t2, i2);
          }, deleteProperty(t2, r2) {
            if ("symbol" == typeof r2) return W.deleteProperty(t2, r2);
            let n2 = r2.toLowerCase(), i2 = Object.keys(e2).find((e3) => e3.toLowerCase() === n2);
            return void 0 === i2 || W.deleteProperty(t2, i2);
          } });
        }
        static seal(e2) {
          return new Proxy(e2, { get(e3, t2, r2) {
            switch (t2) {
              case "append":
              case "delete":
              case "set":
                return et.callable;
              default:
                return W.get(e3, t2, r2);
            }
          } });
        }
        merge(e2) {
          return Array.isArray(e2) ? e2.join(", ") : e2;
        }
        static from(e2) {
          return e2 instanceof Headers ? e2 : new er(e2);
        }
        append(e2, t2) {
          let r2 = this.headers[e2];
          "string" == typeof r2 ? this.headers[e2] = [r2, t2] : Array.isArray(r2) ? r2.push(t2) : this.headers[e2] = t2;
        }
        delete(e2) {
          delete this.headers[e2];
        }
        get(e2) {
          let t2 = this.headers[e2];
          return void 0 !== t2 ? this.merge(t2) : null;
        }
        has(e2) {
          return void 0 !== this.headers[e2];
        }
        set(e2, t2) {
          this.headers[e2] = t2;
        }
        forEach(e2, t2) {
          for (let [r2, n2] of this.entries()) e2.call(t2, n2, r2, this);
        }
        *entries() {
          for (let e2 of Object.keys(this.headers)) {
            let t2 = e2.toLowerCase(), r2 = this.get(t2);
            yield [t2, r2];
          }
        }
        *keys() {
          for (let e2 of Object.keys(this.headers)) {
            let t2 = e2.toLowerCase();
            yield t2;
          }
        }
        *values() {
          for (let e2 of Object.keys(this.headers)) {
            let t2 = this.get(e2);
            yield t2;
          }
        }
        [Symbol.iterator]() {
          return this.entries();
        }
      }
      let en = Error("Invariant: AsyncLocalStorage accessed in runtime where it is not available");
      class ei {
        disable() {
          throw en;
        }
        getStore() {
        }
        run() {
          throw en;
        }
        exit() {
          throw en;
        }
        enterWith() {
          throw en;
        }
      }
      let eo = globalThis.AsyncLocalStorage;
      function ea() {
        return eo ? new eo() : new ei();
      }
      let es = ea();
      class el extends Error {
        constructor() {
          super("Cookies can only be modified in a Server Action or Route Handler. Read more: https://nextjs.org/docs/app/api-reference/functions/cookies#cookiessetname-value-options");
        }
        static callable() {
          throw new el();
        }
      }
      class eu {
        static seal(e2) {
          return new Proxy(e2, { get(e3, t2, r2) {
            switch (t2) {
              case "clear":
              case "delete":
              case "set":
                return el.callable;
              default:
                return W.get(e3, t2, r2);
            }
          } });
        }
      }
      let ed = Symbol.for("next.mutated.cookies");
      class ec {
        static wrap(e2, t2) {
          let r2 = new V.ResponseCookies(new Headers());
          for (let t3 of e2.getAll()) r2.set(t3);
          let n2 = [], i2 = /* @__PURE__ */ new Set(), o2 = () => {
            let e3 = es.getStore();
            if (e3 && (e3.pathWasRevalidated = true), n2 = r2.getAll().filter((e4) => i2.has(e4.name)), t2) {
              let e4 = [];
              for (let t3 of n2) {
                let r3 = new V.ResponseCookies(new Headers());
                r3.set(t3), e4.push(r3.toString());
              }
              t2(e4);
            }
          };
          return new Proxy(r2, { get(e3, t3, r3) {
            switch (t3) {
              case ed:
                return n2;
              case "delete":
                return function(...t4) {
                  i2.add("string" == typeof t4[0] ? t4[0] : t4[0].name);
                  try {
                    e3.delete(...t4);
                  } finally {
                    o2();
                  }
                };
              case "set":
                return function(...t4) {
                  i2.add("string" == typeof t4[0] ? t4[0] : t4[0].name);
                  try {
                    return e3.set(...t4);
                  } finally {
                    o2();
                  }
                };
              default:
                return W.get(e3, t3, r3);
            }
          } });
        }
      }
      !function(e2) {
        e2.handleRequest = "BaseServer.handleRequest", e2.run = "BaseServer.run", e2.pipe = "BaseServer.pipe", e2.getStaticHTML = "BaseServer.getStaticHTML", e2.render = "BaseServer.render", e2.renderToResponseWithComponents = "BaseServer.renderToResponseWithComponents", e2.renderToResponse = "BaseServer.renderToResponse", e2.renderToHTML = "BaseServer.renderToHTML", e2.renderError = "BaseServer.renderError", e2.renderErrorToResponse = "BaseServer.renderErrorToResponse", e2.renderErrorToHTML = "BaseServer.renderErrorToHTML", e2.render404 = "BaseServer.render404";
      }(i || (i = {})), function(e2) {
        e2.loadDefaultErrorComponents = "LoadComponents.loadDefaultErrorComponents", e2.loadComponents = "LoadComponents.loadComponents";
      }(o || (o = {})), function(e2) {
        e2.getRequestHandler = "NextServer.getRequestHandler", e2.getServer = "NextServer.getServer", e2.getServerRequestHandler = "NextServer.getServerRequestHandler", e2.createServer = "createServer.createServer";
      }(a || (a = {})), function(e2) {
        e2.compression = "NextNodeServer.compression", e2.getBuildId = "NextNodeServer.getBuildId", e2.createComponentTree = "NextNodeServer.createComponentTree", e2.clientComponentLoading = "NextNodeServer.clientComponentLoading", e2.getLayoutOrPageModule = "NextNodeServer.getLayoutOrPageModule", e2.generateStaticRoutes = "NextNodeServer.generateStaticRoutes", e2.generateFsStaticRoutes = "NextNodeServer.generateFsStaticRoutes", e2.generatePublicRoutes = "NextNodeServer.generatePublicRoutes", e2.generateImageRoutes = "NextNodeServer.generateImageRoutes.route", e2.sendRenderResult = "NextNodeServer.sendRenderResult", e2.proxyRequest = "NextNodeServer.proxyRequest", e2.runApi = "NextNodeServer.runApi", e2.render = "NextNodeServer.render", e2.renderHTML = "NextNodeServer.renderHTML", e2.imageOptimizer = "NextNodeServer.imageOptimizer", e2.getPagePath = "NextNodeServer.getPagePath", e2.getRoutesManifest = "NextNodeServer.getRoutesManifest", e2.findPageComponents = "NextNodeServer.findPageComponents", e2.getFontManifest = "NextNodeServer.getFontManifest", e2.getServerComponentManifest = "NextNodeServer.getServerComponentManifest", e2.getRequestHandler = "NextNodeServer.getRequestHandler", e2.renderToHTML = "NextNodeServer.renderToHTML", e2.renderError = "NextNodeServer.renderError", e2.renderErrorToHTML = "NextNodeServer.renderErrorToHTML", e2.render404 = "NextNodeServer.render404", e2.startResponse = "NextNodeServer.startResponse", e2.route = "route", e2.onProxyReq = "onProxyReq", e2.apiResolver = "apiResolver", e2.internalFetch = "internalFetch";
      }(s || (s = {})), (l || (l = {})).startServer = "startServer.startServer", function(e2) {
        e2.getServerSideProps = "Render.getServerSideProps", e2.getStaticProps = "Render.getStaticProps", e2.renderToString = "Render.renderToString", e2.renderDocument = "Render.renderDocument", e2.createBodyResult = "Render.createBodyResult";
      }(u || (u = {})), function(e2) {
        e2.renderToString = "AppRender.renderToString", e2.renderToReadableStream = "AppRender.renderToReadableStream", e2.getBodyResult = "AppRender.getBodyResult", e2.fetch = "AppRender.fetch";
      }(d || (d = {})), (c || (c = {})).executeRoute = "Router.executeRoute", (h || (h = {})).runHandler = "Node.runHandler", (p || (p = {})).runHandler = "AppRouteRouteHandlers.runHandler", function(e2) {
        e2.generateMetadata = "ResolveMetadata.generateMetadata", e2.generateViewport = "ResolveMetadata.generateViewport";
      }(f || (f = {})), (g || (g = {})).execute = "Middleware.execute";
      let eh = ["Middleware.execute", "BaseServer.handleRequest", "Render.getServerSideProps", "Render.getStaticProps", "AppRender.fetch", "AppRender.getBodyResult", "Render.renderDocument", "Node.runHandler", "AppRouteRouteHandlers.runHandler", "ResolveMetadata.generateMetadata", "ResolveMetadata.generateViewport", "NextNodeServer.createComponentTree", "NextNodeServer.findPageComponents", "NextNodeServer.getLayoutOrPageModule", "NextNodeServer.startResponse", "NextNodeServer.clientComponentLoading"], ep = ["NextNodeServer.findPageComponents", "NextNodeServer.createComponentTree", "NextNodeServer.clientComponentLoading"], { context: ef, propagation: eg, trace: em, SpanStatusCode: ew, SpanKind: eb, ROOT_CONTEXT: ev } = n = r(794), ex = (e2) => null !== e2 && "object" == typeof e2 && "function" == typeof e2.then, ey = (e2, t2) => {
        (null == t2 ? void 0 : t2.bubble) === true ? e2.setAttribute("next.bubble", true) : (t2 && e2.recordException(t2), e2.setStatus({ code: ew.ERROR, message: null == t2 ? void 0 : t2.message })), e2.end();
      }, eS = /* @__PURE__ */ new Map(), e_ = n.createContextKey("next.rootSpanId"), eR = 0, eC = () => eR++;
      class ek {
        getTracerInstance() {
          return em.getTracer("next.js", "0.0.1");
        }
        getContext() {
          return ef;
        }
        getActiveScopeSpan() {
          return em.getSpan(null == ef ? void 0 : ef.active());
        }
        withPropagatedContext(e2, t2, r2) {
          let n2 = ef.active();
          if (em.getSpanContext(n2)) return t2();
          let i2 = eg.extract(n2, e2, r2);
          return ef.with(i2, t2);
        }
        trace(...e2) {
          var t2;
          let [r2, n2, i2] = e2, { fn: o2, options: a2 } = "function" == typeof n2 ? { fn: n2, options: {} } : { fn: i2, options: { ...n2 } }, s2 = a2.spanName ?? r2;
          if (!eh.includes(r2) && "1" !== process.env.NEXT_OTEL_VERBOSE || a2.hideSpan) return o2();
          let l2 = this.getSpanContext((null == a2 ? void 0 : a2.parentSpan) ?? this.getActiveScopeSpan()), u2 = false;
          l2 ? (null == (t2 = em.getSpanContext(l2)) ? void 0 : t2.isRemote) && (u2 = true) : (l2 = (null == ef ? void 0 : ef.active()) ?? ev, u2 = true);
          let d2 = eC();
          return a2.attributes = { "next.span_name": s2, "next.span_type": r2, ...a2.attributes }, ef.with(l2.setValue(e_, d2), () => this.getTracerInstance().startActiveSpan(s2, a2, (e3) => {
            let t3 = "performance" in globalThis ? globalThis.performance.now() : void 0, n3 = () => {
              eS.delete(d2), t3 && process.env.NEXT_OTEL_PERFORMANCE_PREFIX && ep.includes(r2 || "") && performance.measure(`${process.env.NEXT_OTEL_PERFORMANCE_PREFIX}:next-${(r2.split(".").pop() || "").replace(/[A-Z]/g, (e4) => "-" + e4.toLowerCase())}`, { start: t3, end: performance.now() });
            };
            u2 && eS.set(d2, new Map(Object.entries(a2.attributes ?? {})));
            try {
              if (o2.length > 1) return o2(e3, (t5) => ey(e3, t5));
              let t4 = o2(e3);
              if (ex(t4)) return t4.then((t5) => (e3.end(), t5)).catch((t5) => {
                throw ey(e3, t5), t5;
              }).finally(n3);
              return e3.end(), n3(), t4;
            } catch (t4) {
              throw ey(e3, t4), n3(), t4;
            }
          }));
        }
        wrap(...e2) {
          let t2 = this, [r2, n2, i2] = 3 === e2.length ? e2 : [e2[0], {}, e2[1]];
          return eh.includes(r2) || "1" === process.env.NEXT_OTEL_VERBOSE ? function() {
            let e3 = n2;
            "function" == typeof e3 && "function" == typeof i2 && (e3 = e3.apply(this, arguments));
            let o2 = arguments.length - 1, a2 = arguments[o2];
            if ("function" != typeof a2) return t2.trace(r2, e3, () => i2.apply(this, arguments));
            {
              let n3 = t2.getContext().bind(ef.active(), a2);
              return t2.trace(r2, e3, (e4, t3) => (arguments[o2] = function(e5) {
                return null == t3 || t3(e5), n3.apply(this, arguments);
              }, i2.apply(this, arguments)));
            }
          } : i2;
        }
        startSpan(...e2) {
          let [t2, r2] = e2, n2 = this.getSpanContext((null == r2 ? void 0 : r2.parentSpan) ?? this.getActiveScopeSpan());
          return this.getTracerInstance().startSpan(t2, r2, n2);
        }
        getSpanContext(e2) {
          return e2 ? em.setSpan(ef.active(), e2) : void 0;
        }
        getRootSpanAttributes() {
          let e2 = ef.active().getValue(e_);
          return eS.get(e2);
        }
      }
      let eE = (() => {
        let e2 = new ek();
        return () => e2;
      })(), eN = "__prerender_bypass";
      Symbol("__next_preview_data"), Symbol(eN);
      class eT {
        constructor(e2, t2, r2, n2) {
          var i2;
          let o2 = e2 && function(e3, t3) {
            let r3 = er.from(e3.headers);
            return { isOnDemandRevalidate: r3.get("x-prerender-revalidate") === t3.previewModeId, revalidateOnlyGenerated: r3.has("x-prerender-revalidate-if-generated") };
          }(t2, e2).isOnDemandRevalidate, a2 = null == (i2 = r2.get(eN)) ? void 0 : i2.value;
          this.isEnabled = !!(!o2 && a2 && e2 && a2 === e2.previewModeId), this._previewModeId = null == e2 ? void 0 : e2.previewModeId, this._mutableCookies = n2;
        }
        enable() {
          if (!this._previewModeId) throw Error("Invariant: previewProps missing previewModeId this should never happen");
          this._mutableCookies.set({ name: eN, value: this._previewModeId, httpOnly: true, sameSite: "none", secure: true, path: "/" });
        }
        disable() {
          this._mutableCookies.set({ name: eN, value: "", httpOnly: true, sameSite: "none", secure: true, path: "/", expires: /* @__PURE__ */ new Date(0) });
        }
      }
      function eP(e2, t2) {
        if ("x-middleware-set-cookie" in e2.headers && "string" == typeof e2.headers["x-middleware-set-cookie"]) {
          let r2 = e2.headers["x-middleware-set-cookie"], n2 = new Headers();
          for (let e3 of C(r2)) n2.append("set-cookie", e3);
          for (let e3 of new V.ResponseCookies(n2).getAll()) t2.set(e3);
        }
      }
      let eL = { wrap(e2, { req: t2, res: r2, renderOpts: n2 }, i2) {
        let o2;
        function a2(e3) {
          r2 && r2.setHeader("Set-Cookie", e3);
        }
        n2 && "previewProps" in n2 && (o2 = n2.previewProps);
        let s2 = {}, l2 = { get headers() {
          return s2.headers || (s2.headers = function(e3) {
            let t3 = er.from(e3);
            for (let e4 of J) t3.delete(e4.toString().toLowerCase());
            return er.seal(t3);
          }(t2.headers)), s2.headers;
        }, get cookies() {
          if (!s2.cookies) {
            let e3 = new V.RequestCookies(er.from(t2.headers));
            eP(t2, e3), s2.cookies = eu.seal(e3);
          }
          return s2.cookies;
        }, get mutableCookies() {
          if (!s2.mutableCookies) {
            let e3 = function(e4, t3) {
              let r3 = new V.RequestCookies(er.from(e4));
              return ec.wrap(r3, t3);
            }(t2.headers, (null == n2 ? void 0 : n2.onUpdateCookies) || (r2 ? a2 : void 0));
            eP(t2, e3), s2.mutableCookies = e3;
          }
          return s2.mutableCookies;
        }, get draftMode() {
          return s2.draftMode || (s2.draftMode = new eT(o2, t2, this.cookies, this.mutableCookies)), s2.draftMode;
        }, reactLoadableManifest: (null == n2 ? void 0 : n2.reactLoadableManifest) || {}, assetPrefix: (null == n2 ? void 0 : n2.assetPrefix) || "" };
        return e2.run(l2, i2, l2);
      } }, eO = ea();
      function eA() {
        return { previewModeId: process.env.__NEXT_PREVIEW_MODE_ID, previewModeSigningKey: process.env.__NEXT_PREVIEW_MODE_SIGNING_KEY || "", previewModeEncryptionKey: process.env.__NEXT_PREVIEW_MODE_ENCRYPTION_KEY || "" };
      }
      class eI extends F {
        constructor(e2) {
          super(e2.input, e2.init), this.sourcePage = e2.page;
        }
        get request() {
          throw new y({ page: this.sourcePage });
        }
        respondWith() {
          throw new y({ page: this.sourcePage });
        }
        waitUntil() {
          throw new y({ page: this.sourcePage });
        }
      }
      let eM = { keys: (e2) => Array.from(e2.keys()), get: (e2, t2) => e2.get(t2) ?? void 0 }, eq = (e2, t2) => eE().withPropagatedContext(e2.headers, t2, eM), ej = false;
      async function eD(e2) {
        let t2, n2;
        !function() {
          if (!ej && (ej = true, "true" === process.env.NEXT_PRIVATE_TEST_PROXY)) {
            let { interceptTestApis: e3, wrapRequestHandler: t3 } = r(177);
            e3(), eq = t3(eq);
          }
        }(), await v();
        let i2 = void 0 !== self.__BUILD_MANIFEST;
        e2.request.url = e2.request.url.replace(/\.rsc($|\?)/, "$1");
        let o2 = new H(e2.request.url, { headers: e2.request.headers, nextConfig: e2.request.nextConfig });
        for (let e3 of [...o2.searchParams.keys()]) {
          let t3 = o2.searchParams.getAll(e3);
          !function(e4, t4) {
            for (let r2 of ["nxtP", "nxtI"]) e4 !== r2 && e4.startsWith(r2) && t4(e4.substring(r2.length));
          }(e3, (r2) => {
            for (let e4 of (o2.searchParams.delete(r2), t3)) o2.searchParams.append(r2, e4);
            o2.searchParams.delete(e3);
          });
        }
        let a2 = o2.buildId;
        o2.buildId = "";
        let s2 = e2.request.headers["x-nextjs-data"];
        s2 && "/index" === o2.pathname && (o2.pathname = "/");
        let l2 = function(e3) {
          let t3 = new Headers();
          for (let [r2, n3] of Object.entries(e3)) for (let e4 of Array.isArray(n3) ? n3 : [n3]) void 0 !== e4 && ("number" == typeof e4 && (e4 = e4.toString()), t3.append(r2, e4));
          return t3;
        }(e2.request.headers), u2 = /* @__PURE__ */ new Map();
        if (!i2) for (let e3 of J) {
          let t3 = e3.toString().toLowerCase();
          l2.get(t3) && (u2.set(t3, l2.get(t3)), l2.delete(t3));
        }
        let d2 = new eI({ page: e2.page, input: function(e3, t3) {
          let r2 = "string" == typeof e3, n3 = r2 ? new URL(e3) : e3;
          for (let e4 of Q) n3.searchParams.delete(e4);
          if (t3) for (let e4 of ee) n3.searchParams.delete(e4);
          return r2 ? n3.toString() : n3;
        }(o2, true).toString(), init: { body: e2.request.body, geo: e2.request.geo, headers: l2, ip: e2.request.ip, method: e2.request.method, nextConfig: e2.request.nextConfig, signal: e2.request.signal } });
        s2 && Object.defineProperty(d2, "__isData", { enumerable: false, value: true }), !globalThis.__incrementalCacheShared && e2.IncrementalCache && (globalThis.__incrementalCache = new e2.IncrementalCache({ appDir: true, fetchCache: true, minimalMode: true, fetchCacheKeyPrefix: "", dev: false, requestHeaders: e2.request.headers, requestProtocol: "https", getPrerenderManifest: () => ({ version: -1, routes: {}, dynamicRoutes: {}, notFoundRoutes: [], preview: eA() }) }));
        let c2 = new O({ request: d2, page: e2.page });
        if ((t2 = await eq(d2, () => "/middleware" === e2.page || "/src/middleware" === e2.page ? eE().trace(g.execute, { spanName: `middleware ${d2.method} ${d2.nextUrl.pathname}`, attributes: { "http.target": d2.nextUrl.pathname, "http.method": d2.method } }, () => eL.wrap(eO, { req: d2, renderOpts: { onUpdateCookies: (e3) => {
          n2 = e3;
        }, previewProps: eA() } }, () => e2.handler(d2, c2))) : e2.handler(d2, c2))) && !(t2 instanceof Response)) throw TypeError("Expected an instance of Response to be returned");
        t2 && n2 && t2.headers.set("set-cookie", n2);
        let h2 = null == t2 ? void 0 : t2.headers.get("x-middleware-rewrite");
        if (t2 && h2 && !i2) {
          let r2 = new H(h2, { forceLocale: true, headers: e2.request.headers, nextConfig: e2.request.nextConfig });
          r2.host === d2.nextUrl.host && (r2.buildId = a2 || r2.buildId, t2.headers.set("x-middleware-rewrite", String(r2)));
          let n3 = Z(String(r2), String(o2));
          s2 && t2.headers.set("x-nextjs-rewrite", n3);
        }
        let p2 = null == t2 ? void 0 : t2.headers.get("Location");
        if (t2 && p2 && !i2) {
          let r2 = new H(p2, { forceLocale: false, headers: e2.request.headers, nextConfig: e2.request.nextConfig });
          t2 = new Response(t2.body, t2), r2.host === d2.nextUrl.host && (r2.buildId = a2 || r2.buildId, t2.headers.set("Location", String(r2))), s2 && (t2.headers.delete("Location"), t2.headers.set("x-nextjs-redirect", Z(String(r2), String(o2))));
        }
        let f2 = t2 || Y.next(), m2 = f2.headers.get("x-middleware-override-headers"), w2 = [];
        if (m2) {
          for (let [e3, t3] of u2) f2.headers.set(`x-middleware-request-${e3}`, t3), w2.push(e3);
          w2.length > 0 && f2.headers.set("x-middleware-override-headers", m2 + "," + w2.join(","));
        }
        return { response: f2, waitUntil: Promise.all(c2[P]), fetchMetrics: d2.fetchMetrics };
      }
      function eU(e2) {
        return e2.cookies.get("session") ? Y.next() : Y.redirect(new URL("/admin/login", e2.url));
      }
      r(340), "undefined" == typeof URLPattern || URLPattern;
      let e$ = { matcher: ["/admin/dashboard"] }, eB = { ...m }, eH = eB.middleware || eB.default, eV = "/middleware";
      if ("function" != typeof eH) throw Error(`The Middleware "${eV}" must export a \`middleware\` or a \`default\` function`);
      function ez(e2) {
        return eD({ ...e2, page: eV, handler: eH });
      }
    }, 794: (e, t, r) => {
      "use strict";
      var n, i, o, a, s, l;
      r.r(t), r.d(t, { DiagConsoleLogger: () => L, DiagLogLevel: () => n, INVALID_SPANID: () => en, INVALID_SPAN_CONTEXT: () => eo, INVALID_TRACEID: () => ei, ProxyTracer: () => e_, ProxyTracerProvider: () => ek, ROOT_CONTEXT: () => N, SamplingDecision: () => a, SpanKind: () => s, SpanStatusCode: () => l, TraceFlags: () => o, ValueType: () => i, baggageEntryMetadataFromString: () => C, context: () => eM, createContextKey: () => k, createNoopMeter: () => Y, createTraceState: () => eI, default: () => e1, defaultTextMapGetter: () => Z, defaultTextMapSetter: () => J, diag: () => eq, isSpanContextValid: () => eb, isValidSpanId: () => ew, isValidTraceId: () => em, metrics: () => eB, propagation: () => eZ, trace: () => e0 });
      let u = "1.9.1", d = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/, c = function(e2) {
        let t2 = /* @__PURE__ */ new Set([e2]), r2 = /* @__PURE__ */ new Set(), n2 = e2.match(d);
        if (!n2) return () => false;
        let i2 = { major: +n2[1], minor: +n2[2], patch: +n2[3], prerelease: n2[4] };
        if (null != i2.prerelease) return function(t3) {
          return t3 === e2;
        };
        function o2(e3) {
          return r2.add(e3), false;
        }
        return function(e3) {
          if (t2.has(e3)) return true;
          if (r2.has(e3)) return false;
          let n3 = e3.match(d);
          if (!n3) return o2(e3);
          let a2 = { major: +n3[1], minor: +n3[2], patch: +n3[3], prerelease: n3[4] };
          return null != a2.prerelease || i2.major !== a2.major ? o2(e3) : 0 === i2.major ? i2.minor === a2.minor && i2.patch <= a2.patch ? (t2.add(e3), true) : o2(e3) : i2.minor <= a2.minor ? (t2.add(e3), true) : o2(e3);
        };
      }(u), h = u.split(".")[0], p = Symbol.for(`opentelemetry.js.api.${h}`), f = "object" == typeof globalThis ? globalThis : "object" == typeof self ? self : "object" == typeof window ? window : "object" == typeof r.g ? r.g : {};
      function g(e2, t2, r2, n2 = false) {
        var i2;
        let o2 = f[p] = null !== (i2 = f[p]) && void 0 !== i2 ? i2 : { version: u };
        if (!n2 && o2[e2]) {
          let t3 = Error(`@opentelemetry/api: Attempted duplicate registration of API: ${e2}`);
          return r2.error(t3.stack || t3.message), false;
        }
        if (o2.version !== u) {
          let t3 = Error(`@opentelemetry/api: Registration of version v${o2.version} for ${e2} does not match previously registered API v${u}`);
          return r2.error(t3.stack || t3.message), false;
        }
        return o2[e2] = t2, r2.debug(`@opentelemetry/api: Registered a global for ${e2} v${u}.`), true;
      }
      function m(e2) {
        var t2, r2;
        let n2 = null === (t2 = f[p]) || void 0 === t2 ? void 0 : t2.version;
        if (n2 && c(n2)) return null === (r2 = f[p]) || void 0 === r2 ? void 0 : r2[e2];
      }
      function w(e2, t2) {
        t2.debug(`@opentelemetry/api: Unregistering a global for ${e2} v${u}.`);
        let r2 = f[p];
        r2 && delete r2[e2];
      }
      class b {
        constructor(e2) {
          this._namespace = e2.namespace || "DiagComponentLogger";
        }
        debug(...e2) {
          return v("debug", this._namespace, e2);
        }
        error(...e2) {
          return v("error", this._namespace, e2);
        }
        info(...e2) {
          return v("info", this._namespace, e2);
        }
        warn(...e2) {
          return v("warn", this._namespace, e2);
        }
        verbose(...e2) {
          return v("verbose", this._namespace, e2);
        }
      }
      function v(e2, t2, r2) {
        let n2 = m("diag");
        if (n2) return n2[e2](t2, ...r2);
      }
      !function(e2) {
        e2[e2.NONE = 0] = "NONE", e2[e2.ERROR = 30] = "ERROR", e2[e2.WARN = 50] = "WARN", e2[e2.INFO = 60] = "INFO", e2[e2.DEBUG = 70] = "DEBUG", e2[e2.VERBOSE = 80] = "VERBOSE", e2[e2.ALL = 9999] = "ALL";
      }(n || (n = {}));
      class x {
        static instance() {
          return this._instance || (this._instance = new x()), this._instance;
        }
        constructor() {
          function e2(e3) {
            return function(...t3) {
              let r3 = m("diag");
              if (r3) return r3[e3](...t3);
            };
          }
          let t2 = this, r2 = (e3, r3 = { logLevel: n.INFO }) => {
            var i2, o2, a2;
            if (e3 === t2) {
              let e4 = Error("Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation");
              return t2.error(null !== (i2 = e4.stack) && void 0 !== i2 ? i2 : e4.message), false;
            }
            "number" == typeof r3 && (r3 = { logLevel: r3 });
            let s2 = m("diag"), l2 = function(e4, t3) {
              function r4(r5, n2) {
                let i3 = t3[r5];
                return "function" == typeof i3 && e4 >= n2 ? i3.bind(t3) : function() {
                };
              }
              return e4 < n.NONE ? e4 = n.NONE : e4 > n.ALL && (e4 = n.ALL), t3 = t3 || {}, { error: r4("error", n.ERROR), warn: r4("warn", n.WARN), info: r4("info", n.INFO), debug: r4("debug", n.DEBUG), verbose: r4("verbose", n.VERBOSE) };
            }(null !== (o2 = r3.logLevel) && void 0 !== o2 ? o2 : n.INFO, e3);
            if (s2 && !r3.suppressOverrideMessage) {
              let e4 = null !== (a2 = Error().stack) && void 0 !== a2 ? a2 : "<failed to generate stacktrace>";
              s2.warn(`Current logger will be overwritten from ${e4}`), l2.warn(`Current logger will overwrite one already registered from ${e4}`);
            }
            return g("diag", l2, t2, true);
          };
          t2.setLogger = r2, t2.disable = () => {
            w("diag", t2);
          }, t2.createComponentLogger = (e3) => new b(e3), t2.verbose = e2("verbose"), t2.debug = e2("debug"), t2.info = e2("info"), t2.warn = e2("warn"), t2.error = e2("error");
        }
      }
      class y {
        constructor(e2) {
          this._entries = e2 ? new Map(e2) : /* @__PURE__ */ new Map();
        }
        getEntry(e2) {
          let t2 = this._entries.get(e2);
          if (t2) return Object.assign({}, t2);
        }
        getAllEntries() {
          return Array.from(this._entries.entries());
        }
        setEntry(e2, t2) {
          let r2 = new y(this._entries);
          return r2._entries.set(e2, t2), r2;
        }
        removeEntry(e2) {
          let t2 = new y(this._entries);
          return t2._entries.delete(e2), t2;
        }
        removeEntries(...e2) {
          let t2 = new y(this._entries);
          for (let r2 of e2) t2._entries.delete(r2);
          return t2;
        }
        clear() {
          return new y();
        }
      }
      let S = Symbol("BaggageEntryMetadata"), _ = x.instance();
      function R(e2 = {}) {
        return new y(new Map(Object.entries(e2)));
      }
      function C(e2) {
        return "string" != typeof e2 && (_.error(`Cannot create baggage metadata from unknown type: ${typeof e2}`), e2 = ""), { __TYPE__: S, toString: () => e2 };
      }
      function k(e2) {
        return Symbol.for(e2);
      }
      class E {
        constructor(e2) {
          let t2 = this;
          t2._currentContext = e2 ? new Map(e2) : /* @__PURE__ */ new Map(), t2.getValue = (e3) => t2._currentContext.get(e3), t2.setValue = (e3, r2) => {
            let n2 = new E(t2._currentContext);
            return n2._currentContext.set(e3, r2), n2;
          }, t2.deleteValue = (e3) => {
            let r2 = new E(t2._currentContext);
            return r2._currentContext.delete(e3), r2;
          };
        }
      }
      let N = new E(), T = [{ n: "error", c: "error" }, { n: "warn", c: "warn" }, { n: "info", c: "info" }, { n: "debug", c: "debug" }, { n: "verbose", c: "trace" }], P = {};
      if ("undefined" != typeof console) for (let e2 of ["error", "warn", "info", "debug", "trace", "log"]) "function" == typeof console[e2] && (P[e2] = console[e2]);
      class L {
        constructor() {
          for (let e2 = 0; e2 < T.length; e2++) this[T[e2].n] = /* @__PURE__ */ function(e3) {
            return function(...t2) {
              let r2 = P[e3];
              if ("function" != typeof r2 && (r2 = P.log), "function" != typeof r2 && console && "function" != typeof (r2 = console[e3]) && (r2 = console.log), "function" == typeof r2) return r2.apply(console, t2);
            };
          }(T[e2].c);
        }
      }
      class O {
        constructor() {
        }
        createGauge(e2, t2) {
          return z;
        }
        createHistogram(e2, t2) {
          return F;
        }
        createCounter(e2, t2) {
          return V;
        }
        createUpDownCounter(e2, t2) {
          return W;
        }
        createObservableGauge(e2, t2) {
          return X;
        }
        createObservableCounter(e2, t2) {
          return G;
        }
        createObservableUpDownCounter(e2, t2) {
          return K;
        }
        addBatchObservableCallback(e2, t2) {
        }
        removeBatchObservableCallback(e2) {
        }
      }
      class A {
      }
      class I extends A {
        add(e2, t2) {
        }
      }
      class M extends A {
        add(e2, t2) {
        }
      }
      class q extends A {
        record(e2, t2) {
        }
      }
      class j extends A {
        record(e2, t2) {
        }
      }
      class D {
        addCallback(e2) {
        }
        removeCallback(e2) {
        }
      }
      class U extends D {
      }
      class $ extends D {
      }
      class B extends D {
      }
      let H = new O(), V = new I(), z = new q(), F = new j(), W = new M(), G = new U(), X = new $(), K = new B();
      function Y() {
        return H;
      }
      !function(e2) {
        e2[e2.INT = 0] = "INT", e2[e2.DOUBLE = 1] = "DOUBLE";
      }(i || (i = {}));
      let Z = { get(e2, t2) {
        if (null != e2) return e2[t2];
      }, keys: (e2) => null == e2 ? [] : Object.keys(e2) }, J = { set(e2, t2, r2) {
        null != e2 && (e2[t2] = r2);
      } };
      class Q {
        active() {
          return N;
        }
        with(e2, t2, r2, ...n2) {
          return t2.call(r2, ...n2);
        }
        bind(e2, t2) {
          return t2;
        }
        enable() {
          return this;
        }
        disable() {
          return this;
        }
      }
      let ee = "context", et = new Q();
      class er {
        constructor() {
        }
        static getInstance() {
          return this._instance || (this._instance = new er()), this._instance;
        }
        setGlobalContextManager(e2) {
          return g(ee, e2, x.instance());
        }
        active() {
          return this._getContextManager().active();
        }
        with(e2, t2, r2, ...n2) {
          return this._getContextManager().with(e2, t2, r2, ...n2);
        }
        bind(e2, t2) {
          return this._getContextManager().bind(e2, t2);
        }
        _getContextManager() {
          return m(ee) || et;
        }
        disable() {
          this._getContextManager().disable(), w(ee, x.instance());
        }
      }
      !function(e2) {
        e2[e2.NONE = 0] = "NONE", e2[e2.SAMPLED = 1] = "SAMPLED";
      }(o || (o = {}));
      let en = "0000000000000000", ei = "00000000000000000000000000000000", eo = { traceId: ei, spanId: en, traceFlags: o.NONE };
      class ea {
        constructor(e2 = eo) {
          this._spanContext = e2;
        }
        spanContext() {
          return this._spanContext;
        }
        setAttribute(e2, t2) {
          return this;
        }
        setAttributes(e2) {
          return this;
        }
        addEvent(e2, t2) {
          return this;
        }
        addLink(e2) {
          return this;
        }
        addLinks(e2) {
          return this;
        }
        setStatus(e2) {
          return this;
        }
        updateName(e2) {
          return this;
        }
        end(e2) {
        }
        isRecording() {
          return false;
        }
        recordException(e2, t2) {
        }
      }
      let es = k("OpenTelemetry Context Key SPAN");
      function el(e2) {
        return e2.getValue(es) || void 0;
      }
      function eu() {
        return el(er.getInstance().active());
      }
      function ed(e2, t2) {
        return e2.setValue(es, t2);
      }
      function ec(e2) {
        return e2.deleteValue(es);
      }
      function eh(e2, t2) {
        return ed(e2, new ea(t2));
      }
      function ep(e2) {
        var t2;
        return null === (t2 = el(e2)) || void 0 === t2 ? void 0 : t2.spanContext();
      }
      let ef = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]);
      function eg(e2, t2) {
        if ("string" != typeof e2 || e2.length !== t2) return false;
        let r2 = 0;
        for (let t3 = 0; t3 < e2.length; t3 += 4) r2 += (0 | ef[e2.charCodeAt(t3)]) + (0 | ef[e2.charCodeAt(t3 + 1)]) + (0 | ef[e2.charCodeAt(t3 + 2)]) + (0 | ef[e2.charCodeAt(t3 + 3)]);
        return r2 === t2;
      }
      function em(e2) {
        return eg(e2, 32) && e2 !== ei;
      }
      function ew(e2) {
        return eg(e2, 16) && e2 !== en;
      }
      function eb(e2) {
        return em(e2.traceId) && ew(e2.spanId);
      }
      function ev(e2) {
        return new ea(e2);
      }
      let ex = er.getInstance();
      class ey {
        startSpan(e2, t2, r2 = ex.active()) {
          if (null == t2 ? void 0 : t2.root) return new ea();
          let n2 = r2 && ep(r2);
          return null !== n2 && "object" == typeof n2 && "spanId" in n2 && "string" == typeof n2.spanId && "traceId" in n2 && "string" == typeof n2.traceId && "traceFlags" in n2 && "number" == typeof n2.traceFlags && eb(n2) ? new ea(n2) : new ea();
        }
        startActiveSpan(e2, t2, r2, n2) {
          let i2, o2, a2;
          if (arguments.length < 2) return;
          2 == arguments.length ? a2 = t2 : 3 == arguments.length ? (i2 = t2, a2 = r2) : (i2 = t2, o2 = r2, a2 = n2);
          let s2 = null != o2 ? o2 : ex.active(), l2 = this.startSpan(e2, i2, s2), u2 = ed(s2, l2);
          return ex.with(u2, a2, void 0, l2);
        }
      }
      let eS = new ey();
      class e_ {
        constructor(e2, t2, r2, n2) {
          this._provider = e2, this.name = t2, this.version = r2, this.options = n2;
        }
        startSpan(e2, t2, r2) {
          return this._getTracer().startSpan(e2, t2, r2);
        }
        startActiveSpan(e2, t2, r2, n2) {
          let i2 = this._getTracer();
          return Reflect.apply(i2.startActiveSpan, i2, arguments);
        }
        _getTracer() {
          if (this._delegate) return this._delegate;
          let e2 = this._provider.getDelegateTracer(this.name, this.version, this.options);
          return e2 ? (this._delegate = e2, this._delegate) : eS;
        }
      }
      class eR {
        getTracer(e2, t2, r2) {
          return new ey();
        }
      }
      let eC = new eR();
      class ek {
        getTracer(e2, t2, r2) {
          var n2;
          return null !== (n2 = this.getDelegateTracer(e2, t2, r2)) && void 0 !== n2 ? n2 : new e_(this, e2, t2, r2);
        }
        getDelegate() {
          var e2;
          return null !== (e2 = this._delegate) && void 0 !== e2 ? e2 : eC;
        }
        setDelegate(e2) {
          this._delegate = e2;
        }
        getDelegateTracer(e2, t2, r2) {
          var n2;
          return null === (n2 = this._delegate) || void 0 === n2 ? void 0 : n2.getTracer(e2, t2, r2);
        }
      }
      !function(e2) {
        e2[e2.NOT_RECORD = 0] = "NOT_RECORD", e2[e2.RECORD = 1] = "RECORD", e2[e2.RECORD_AND_SAMPLED = 2] = "RECORD_AND_SAMPLED";
      }(a || (a = {})), function(e2) {
        e2[e2.INTERNAL = 0] = "INTERNAL", e2[e2.SERVER = 1] = "SERVER", e2[e2.CLIENT = 2] = "CLIENT", e2[e2.PRODUCER = 3] = "PRODUCER", e2[e2.CONSUMER = 4] = "CONSUMER";
      }(s || (s = {})), function(e2) {
        e2[e2.UNSET = 0] = "UNSET", e2[e2.OK = 1] = "OK", e2[e2.ERROR = 2] = "ERROR";
      }(l || (l = {}));
      let eE = "[_0-9a-z-*/]", eN = `[a-z]${eE}{0,255}`, eT = `[a-z0-9]${eE}{0,240}@[a-z]${eE}{0,13}`, eP = RegExp(`^(?:${eN}|${eT})$`), eL = /^[ -~]{0,255}[!-~]$/, eO = /,|=/;
      class eA {
        constructor(e2) {
          this._internalState = /* @__PURE__ */ new Map(), e2 && this._parse(e2);
        }
        set(e2, t2) {
          let r2 = this._clone();
          return r2._internalState.has(e2) && r2._internalState.delete(e2), r2._internalState.set(e2, t2), r2;
        }
        unset(e2) {
          let t2 = this._clone();
          return t2._internalState.delete(e2), t2;
        }
        get(e2) {
          return this._internalState.get(e2);
        }
        serialize() {
          return Array.from(this._internalState.keys()).reduceRight((e2, t2) => (e2.push(t2 + "=" + this.get(t2)), e2), []).join(",");
        }
        _parse(e2) {
          !(e2.length > 512) && (this._internalState = e2.split(",").reduceRight((e3, t2) => {
            let r2 = t2.trim(), n2 = r2.indexOf("=");
            if (-1 !== n2) {
              let i2 = r2.slice(0, n2), o2 = r2.slice(n2 + 1, t2.length);
              eP.test(i2) && eL.test(o2) && !eO.test(o2) && e3.set(i2, o2);
            }
            return e3;
          }, /* @__PURE__ */ new Map()), this._internalState.size > 32 && (this._internalState = new Map(Array.from(this._internalState.entries()).reverse().slice(0, 32))));
        }
        _keys() {
          return Array.from(this._internalState.keys()).reverse();
        }
        _clone() {
          let e2 = new eA();
          return e2._internalState = new Map(this._internalState), e2;
        }
      }
      function eI(e2) {
        return new eA(e2);
      }
      let eM = er.getInstance(), eq = x.instance();
      class ej {
        getMeter(e2, t2, r2) {
          return H;
        }
      }
      let eD = new ej(), eU = "metrics";
      class e$ {
        constructor() {
        }
        static getInstance() {
          return this._instance || (this._instance = new e$()), this._instance;
        }
        setGlobalMeterProvider(e2) {
          return g(eU, e2, x.instance());
        }
        getMeterProvider() {
          return m(eU) || eD;
        }
        getMeter(e2, t2, r2) {
          return this.getMeterProvider().getMeter(e2, t2, r2);
        }
        disable() {
          w(eU, x.instance());
        }
      }
      let eB = e$.getInstance();
      class eH {
        inject(e2, t2) {
        }
        extract(e2, t2) {
          return e2;
        }
        fields() {
          return [];
        }
      }
      let eV = k("OpenTelemetry Baggage Key");
      function ez(e2) {
        return e2.getValue(eV) || void 0;
      }
      function eF() {
        return ez(er.getInstance().active());
      }
      function eW(e2, t2) {
        return e2.setValue(eV, t2);
      }
      function eG(e2) {
        return e2.deleteValue(eV);
      }
      let eX = "propagation", eK = new eH();
      class eY {
        constructor() {
          this.createBaggage = R, this.getBaggage = ez, this.getActiveBaggage = eF, this.setBaggage = eW, this.deleteBaggage = eG;
        }
        static getInstance() {
          return this._instance || (this._instance = new eY()), this._instance;
        }
        setGlobalPropagator(e2) {
          return g(eX, e2, x.instance());
        }
        inject(e2, t2, r2 = J) {
          return this._getGlobalPropagator().inject(e2, t2, r2);
        }
        extract(e2, t2, r2 = Z) {
          return this._getGlobalPropagator().extract(e2, t2, r2);
        }
        fields() {
          return this._getGlobalPropagator().fields();
        }
        disable() {
          w(eX, x.instance());
        }
        _getGlobalPropagator() {
          return m(eX) || eK;
        }
      }
      let eZ = eY.getInstance(), eJ = "trace";
      class eQ {
        constructor() {
          this._proxyTracerProvider = new ek(), this.wrapSpanContext = ev, this.isSpanContextValid = eb, this.deleteSpan = ec, this.getSpan = el, this.getActiveSpan = eu, this.getSpanContext = ep, this.setSpan = ed, this.setSpanContext = eh;
        }
        static getInstance() {
          return this._instance || (this._instance = new eQ()), this._instance;
        }
        setGlobalTracerProvider(e2) {
          let t2 = g(eJ, this._proxyTracerProvider, x.instance());
          return t2 && this._proxyTracerProvider.setDelegate(e2), t2;
        }
        getTracerProvider() {
          return m(eJ) || this._proxyTracerProvider;
        }
        getTracer(e2, t2) {
          return this.getTracerProvider().getTracer(e2, t2);
        }
        disable() {
          w(eJ, x.instance()), this._proxyTracerProvider = new ek();
        }
      }
      let e0 = eQ.getInstance(), e1 = { context: eM, diag: eq, metrics: eB, propagation: eZ, trace: e0 };
    }, 945: (e) => {
      "use strict";
      var t = Object.defineProperty, r = Object.getOwnPropertyDescriptor, n = Object.getOwnPropertyNames, i = Object.prototype.hasOwnProperty, o = {};
      function a(e2) {
        var t2;
        let r2 = ["path" in e2 && e2.path && `Path=${e2.path}`, "expires" in e2 && (e2.expires || 0 === e2.expires) && `Expires=${("number" == typeof e2.expires ? new Date(e2.expires) : e2.expires).toUTCString()}`, "maxAge" in e2 && "number" == typeof e2.maxAge && `Max-Age=${e2.maxAge}`, "domain" in e2 && e2.domain && `Domain=${e2.domain}`, "secure" in e2 && e2.secure && "Secure", "httpOnly" in e2 && e2.httpOnly && "HttpOnly", "sameSite" in e2 && e2.sameSite && `SameSite=${e2.sameSite}`, "partitioned" in e2 && e2.partitioned && "Partitioned", "priority" in e2 && e2.priority && `Priority=${e2.priority}`].filter(Boolean), n2 = `${e2.name}=${encodeURIComponent(null != (t2 = e2.value) ? t2 : "")}`;
        return 0 === r2.length ? n2 : `${n2}; ${r2.join("; ")}`;
      }
      function s(e2) {
        let t2 = /* @__PURE__ */ new Map();
        for (let r2 of e2.split(/; */)) {
          if (!r2) continue;
          let e3 = r2.indexOf("=");
          if (-1 === e3) {
            t2.set(r2, "true");
            continue;
          }
          let [n2, i2] = [r2.slice(0, e3), r2.slice(e3 + 1)];
          try {
            t2.set(n2, decodeURIComponent(null != i2 ? i2 : "true"));
          } catch {
          }
        }
        return t2;
      }
      function l(e2) {
        var t2, r2;
        if (!e2) return;
        let [[n2, i2], ...o2] = s(e2), { domain: a2, expires: l2, httponly: c2, maxage: h2, path: p, samesite: f, secure: g, partitioned: m, priority: w } = Object.fromEntries(o2.map(([e3, t3]) => [e3.toLowerCase(), t3]));
        return function(e3) {
          let t3 = {};
          for (let r3 in e3) e3[r3] && (t3[r3] = e3[r3]);
          return t3;
        }({ name: n2, value: decodeURIComponent(i2), domain: a2, ...l2 && { expires: new Date(l2) }, ...c2 && { httpOnly: true }, ..."string" == typeof h2 && { maxAge: Number(h2) }, path: p, ...f && { sameSite: u.includes(t2 = (t2 = f).toLowerCase()) ? t2 : void 0 }, ...g && { secure: true }, ...w && { priority: d.includes(r2 = (r2 = w).toLowerCase()) ? r2 : void 0 }, ...m && { partitioned: true } });
      }
      ((e2, r2) => {
        for (var n2 in r2) t(e2, n2, { get: r2[n2], enumerable: true });
      })(o, { RequestCookies: () => c, ResponseCookies: () => h, parseCookie: () => s, parseSetCookie: () => l, stringifyCookie: () => a }), e.exports = ((e2, o2, a2, s2) => {
        if (o2 && "object" == typeof o2 || "function" == typeof o2) for (let l2 of n(o2)) i.call(e2, l2) || l2 === a2 || t(e2, l2, { get: () => o2[l2], enumerable: !(s2 = r(o2, l2)) || s2.enumerable });
        return e2;
      })(t({}, "__esModule", { value: true }), o);
      var u = ["strict", "lax", "none"], d = ["low", "medium", "high"], c = class {
        constructor(e2) {
          this._parsed = /* @__PURE__ */ new Map(), this._headers = e2;
          let t2 = e2.get("cookie");
          if (t2) for (let [e3, r2] of s(t2)) this._parsed.set(e3, { name: e3, value: r2 });
        }
        [Symbol.iterator]() {
          return this._parsed[Symbol.iterator]();
        }
        get size() {
          return this._parsed.size;
        }
        get(...e2) {
          let t2 = "string" == typeof e2[0] ? e2[0] : e2[0].name;
          return this._parsed.get(t2);
        }
        getAll(...e2) {
          var t2;
          let r2 = Array.from(this._parsed);
          if (!e2.length) return r2.map(([e3, t3]) => t3);
          let n2 = "string" == typeof e2[0] ? e2[0] : null == (t2 = e2[0]) ? void 0 : t2.name;
          return r2.filter(([e3]) => e3 === n2).map(([e3, t3]) => t3);
        }
        has(e2) {
          return this._parsed.has(e2);
        }
        set(...e2) {
          let [t2, r2] = 1 === e2.length ? [e2[0].name, e2[0].value] : e2, n2 = this._parsed;
          return n2.set(t2, { name: t2, value: r2 }), this._headers.set("cookie", Array.from(n2).map(([e3, t3]) => a(t3)).join("; ")), this;
        }
        delete(e2) {
          let t2 = this._parsed, r2 = Array.isArray(e2) ? e2.map((e3) => t2.delete(e3)) : t2.delete(e2);
          return this._headers.set("cookie", Array.from(t2).map(([e3, t3]) => a(t3)).join("; ")), r2;
        }
        clear() {
          return this.delete(Array.from(this._parsed.keys())), this;
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return `RequestCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`;
        }
        toString() {
          return [...this._parsed.values()].map((e2) => `${e2.name}=${encodeURIComponent(e2.value)}`).join("; ");
        }
      }, h = class {
        constructor(e2) {
          var t2, r2, n2;
          this._parsed = /* @__PURE__ */ new Map(), this._headers = e2;
          let i2 = null != (n2 = null != (r2 = null == (t2 = e2.getSetCookie) ? void 0 : t2.call(e2)) ? r2 : e2.get("set-cookie")) ? n2 : [];
          for (let e3 of Array.isArray(i2) ? i2 : function(e4) {
            if (!e4) return [];
            var t3, r3, n3, i3, o2, a2 = [], s2 = 0;
            function l2() {
              for (; s2 < e4.length && /\s/.test(e4.charAt(s2)); ) s2 += 1;
              return s2 < e4.length;
            }
            for (; s2 < e4.length; ) {
              for (t3 = s2, o2 = false; l2(); ) if ("," === (r3 = e4.charAt(s2))) {
                for (n3 = s2, s2 += 1, l2(), i3 = s2; s2 < e4.length && "=" !== (r3 = e4.charAt(s2)) && ";" !== r3 && "," !== r3; ) s2 += 1;
                s2 < e4.length && "=" === e4.charAt(s2) ? (o2 = true, s2 = i3, a2.push(e4.substring(t3, n3)), t3 = s2) : s2 = n3 + 1;
              } else s2 += 1;
              (!o2 || s2 >= e4.length) && a2.push(e4.substring(t3, e4.length));
            }
            return a2;
          }(i2)) {
            let t3 = l(e3);
            t3 && this._parsed.set(t3.name, t3);
          }
        }
        get(...e2) {
          let t2 = "string" == typeof e2[0] ? e2[0] : e2[0].name;
          return this._parsed.get(t2);
        }
        getAll(...e2) {
          var t2;
          let r2 = Array.from(this._parsed.values());
          if (!e2.length) return r2;
          let n2 = "string" == typeof e2[0] ? e2[0] : null == (t2 = e2[0]) ? void 0 : t2.name;
          return r2.filter((e3) => e3.name === n2);
        }
        has(e2) {
          return this._parsed.has(e2);
        }
        set(...e2) {
          let [t2, r2, n2] = 1 === e2.length ? [e2[0].name, e2[0].value, e2[0]] : e2, i2 = this._parsed;
          return i2.set(t2, function(e3 = { name: "", value: "" }) {
            return "number" == typeof e3.expires && (e3.expires = new Date(e3.expires)), e3.maxAge && (e3.expires = new Date(Date.now() + 1e3 * e3.maxAge)), (null === e3.path || void 0 === e3.path) && (e3.path = "/"), e3;
          }({ name: t2, value: r2, ...n2 })), function(e3, t3) {
            for (let [, r3] of (t3.delete("set-cookie"), e3)) {
              let e4 = a(r3);
              t3.append("set-cookie", e4);
            }
          }(i2, this._headers), this;
        }
        delete(...e2) {
          let [t2, r2, n2] = "string" == typeof e2[0] ? [e2[0]] : [e2[0].name, e2[0].path, e2[0].domain];
          return this.set({ name: t2, path: r2, domain: n2, value: "", expires: /* @__PURE__ */ new Date(0) });
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return `ResponseCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`;
        }
        toString() {
          return [...this._parsed.values()].map(a).join("; ");
        }
      };
    }, 133: (e) => {
      (() => {
        "use strict";
        "undefined" != typeof __nccwpck_require__ && (__nccwpck_require__.ab = "//");
        var t = {};
        (() => {
          t.parse = function(t2, r2) {
            if ("string" != typeof t2) throw TypeError("argument str must be a string");
            for (var i2 = {}, o = t2.split(n), a = (r2 || {}).decode || e2, s = 0; s < o.length; s++) {
              var l = o[s], u = l.indexOf("=");
              if (!(u < 0)) {
                var d = l.substr(0, u).trim(), c = l.substr(++u, l.length).trim();
                '"' == c[0] && (c = c.slice(1, -1)), void 0 == i2[d] && (i2[d] = function(e3, t3) {
                  try {
                    return t3(e3);
                  } catch (t4) {
                    return e3;
                  }
                }(c, a));
              }
            }
            return i2;
          }, t.serialize = function(e3, t2, n2) {
            var o = n2 || {}, a = o.encode || r;
            if ("function" != typeof a) throw TypeError("option encode is invalid");
            if (!i.test(e3)) throw TypeError("argument name is invalid");
            var s = a(t2);
            if (s && !i.test(s)) throw TypeError("argument val is invalid");
            var l = e3 + "=" + s;
            if (null != o.maxAge) {
              var u = o.maxAge - 0;
              if (isNaN(u) || !isFinite(u)) throw TypeError("option maxAge is invalid");
              l += "; Max-Age=" + Math.floor(u);
            }
            if (o.domain) {
              if (!i.test(o.domain)) throw TypeError("option domain is invalid");
              l += "; Domain=" + o.domain;
            }
            if (o.path) {
              if (!i.test(o.path)) throw TypeError("option path is invalid");
              l += "; Path=" + o.path;
            }
            if (o.expires) {
              if ("function" != typeof o.expires.toUTCString) throw TypeError("option expires is invalid");
              l += "; Expires=" + o.expires.toUTCString();
            }
            if (o.httpOnly && (l += "; HttpOnly"), o.secure && (l += "; Secure"), o.sameSite) switch ("string" == typeof o.sameSite ? o.sameSite.toLowerCase() : o.sameSite) {
              case true:
              case "strict":
                l += "; SameSite=Strict";
                break;
              case "lax":
                l += "; SameSite=Lax";
                break;
              case "none":
                l += "; SameSite=None";
                break;
              default:
                throw TypeError("option sameSite is invalid");
            }
            return l;
          };
          var e2 = decodeURIComponent, r = encodeURIComponent, n = /; */, i = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
        })(), e.exports = t;
      })();
    }, 340: (e, t, r) => {
      var n;
      (() => {
        var i = { 226: function(i2, o2) {
          !function(a2, s2) {
            "use strict";
            var l = "function", u = "undefined", d = "object", c = "string", h = "major", p = "model", f = "name", g = "type", m = "vendor", w = "version", b = "architecture", v = "console", x = "mobile", y = "tablet", S = "smarttv", _ = "wearable", R = "embedded", C = "Amazon", k = "Apple", E = "ASUS", N = "BlackBerry", T = "Browser", P = "Chrome", L = "Firefox", O = "Google", A = "Huawei", I = "Microsoft", M = "Motorola", q = "Opera", j = "Samsung", D = "Sharp", U = "Sony", $ = "Xiaomi", B = "Zebra", H = "Facebook", V = "Chromium OS", z = "Mac OS", F = function(e2, t2) {
              var r2 = {};
              for (var n2 in e2) t2[n2] && t2[n2].length % 2 == 0 ? r2[n2] = t2[n2].concat(e2[n2]) : r2[n2] = e2[n2];
              return r2;
            }, W = function(e2) {
              for (var t2 = {}, r2 = 0; r2 < e2.length; r2++) t2[e2[r2].toUpperCase()] = e2[r2];
              return t2;
            }, G = function(e2, t2) {
              return typeof e2 === c && -1 !== X(t2).indexOf(X(e2));
            }, X = function(e2) {
              return e2.toLowerCase();
            }, K = function(e2, t2) {
              if (typeof e2 === c) return e2 = e2.replace(/^\s\s*/, ""), typeof t2 === u ? e2 : e2.substring(0, 350);
            }, Y = function(e2, t2) {
              for (var r2, n2, i3, o3, a3, u2, c2 = 0; c2 < t2.length && !a3; ) {
                var h2 = t2[c2], p2 = t2[c2 + 1];
                for (r2 = n2 = 0; r2 < h2.length && !a3 && h2[r2]; ) if (a3 = h2[r2++].exec(e2)) for (i3 = 0; i3 < p2.length; i3++) u2 = a3[++n2], typeof (o3 = p2[i3]) === d && o3.length > 0 ? 2 === o3.length ? typeof o3[1] == l ? this[o3[0]] = o3[1].call(this, u2) : this[o3[0]] = o3[1] : 3 === o3.length ? typeof o3[1] !== l || o3[1].exec && o3[1].test ? this[o3[0]] = u2 ? u2.replace(o3[1], o3[2]) : void 0 : this[o3[0]] = u2 ? o3[1].call(this, u2, o3[2]) : void 0 : 4 === o3.length && (this[o3[0]] = u2 ? o3[3].call(this, u2.replace(o3[1], o3[2])) : void 0) : this[o3] = u2 || s2;
                c2 += 2;
              }
            }, Z = function(e2, t2) {
              for (var r2 in t2) if (typeof t2[r2] === d && t2[r2].length > 0) {
                for (var n2 = 0; n2 < t2[r2].length; n2++) if (G(t2[r2][n2], e2)) return "?" === r2 ? s2 : r2;
              } else if (G(t2[r2], e2)) return "?" === r2 ? s2 : r2;
              return e2;
            }, J = { ME: "4.90", "NT 3.11": "NT3.51", "NT 4.0": "NT4.0", 2e3: "NT 5.0", XP: ["NT 5.1", "NT 5.2"], Vista: "NT 6.0", 7: "NT 6.1", 8: "NT 6.2", 8.1: "NT 6.3", 10: ["NT 6.4", "NT 10.0"], RT: "ARM" }, Q = { browser: [[/\b(?:crmo|crios)\/([\w\.]+)/i], [w, [f, "Chrome"]], [/edg(?:e|ios|a)?\/([\w\.]+)/i], [w, [f, "Edge"]], [/(opera mini)\/([-\w\.]+)/i, /(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i, /(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i], [f, w], [/opios[\/ ]+([\w\.]+)/i], [w, [f, q + " Mini"]], [/\bopr\/([\w\.]+)/i], [w, [f, q]], [/(kindle)\/([\w\.]+)/i, /(lunascape|maxthon|netfront|jasmine|blazer)[\/ ]?([\w\.]*)/i, /(avant |iemobile|slim)(?:browser)?[\/ ]?([\w\.]*)/i, /(ba?idubrowser)[\/ ]?([\w\.]+)/i, /(?:ms|\()(ie) ([\w\.]+)/i, /(flock|rockmelt|midori|epiphany|silk|skyfire|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark|qupzilla|falkon|rekonq|puffin|brave|whale(?!.+naver)|qqbrowserlite|qq|duckduckgo)\/([-\w\.]+)/i, /(heytap|ovi)browser\/([\d\.]+)/i, /(weibo)__([\d\.]+)/i], [f, w], [/(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i], [w, [f, "UC" + T]], [/microm.+\bqbcore\/([\w\.]+)/i, /\bqbcore\/([\w\.]+).+microm/i], [w, [f, "WeChat(Win) Desktop"]], [/micromessenger\/([\w\.]+)/i], [w, [f, "WeChat"]], [/konqueror\/([\w\.]+)/i], [w, [f, "Konqueror"]], [/trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i], [w, [f, "IE"]], [/ya(?:search)?browser\/([\w\.]+)/i], [w, [f, "Yandex"]], [/(avast|avg)\/([\w\.]+)/i], [[f, /(.+)/, "$1 Secure " + T], w], [/\bfocus\/([\w\.]+)/i], [w, [f, L + " Focus"]], [/\bopt\/([\w\.]+)/i], [w, [f, q + " Touch"]], [/coc_coc\w+\/([\w\.]+)/i], [w, [f, "Coc Coc"]], [/dolfin\/([\w\.]+)/i], [w, [f, "Dolphin"]], [/coast\/([\w\.]+)/i], [w, [f, q + " Coast"]], [/miuibrowser\/([\w\.]+)/i], [w, [f, "MIUI " + T]], [/fxios\/([-\w\.]+)/i], [w, [f, L]], [/\bqihu|(qi?ho?o?|360)browser/i], [[f, "360 " + T]], [/(oculus|samsung|sailfish|huawei)browser\/([\w\.]+)/i], [[f, /(.+)/, "$1 " + T], w], [/(comodo_dragon)\/([\w\.]+)/i], [[f, /_/g, " "], w], [/(electron)\/([\w\.]+) safari/i, /(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i, /m?(qqbrowser|baiduboxapp|2345Explorer)[\/ ]?([\w\.]+)/i], [f, w], [/(metasr)[\/ ]?([\w\.]+)/i, /(lbbrowser)/i, /\[(linkedin)app\]/i], [f], [/((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i], [[f, H], w], [/(kakao(?:talk|story))[\/ ]([\w\.]+)/i, /(naver)\(.*?(\d+\.[\w\.]+).*\)/i, /safari (line)\/([\w\.]+)/i, /\b(line)\/([\w\.]+)\/iab/i, /(chromium|instagram)[\/ ]([-\w\.]+)/i], [f, w], [/\bgsa\/([\w\.]+) .*safari\//i], [w, [f, "GSA"]], [/musical_ly(?:.+app_?version\/|_)([\w\.]+)/i], [w, [f, "TikTok"]], [/headlesschrome(?:\/([\w\.]+)| )/i], [w, [f, P + " Headless"]], [/ wv\).+(chrome)\/([\w\.]+)/i], [[f, P + " WebView"], w], [/droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i], [w, [f, "Android " + T]], [/(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i], [f, w], [/version\/([\w\.\,]+) .*mobile\/\w+ (safari)/i], [w, [f, "Mobile Safari"]], [/version\/([\w(\.|\,)]+) .*(mobile ?safari|safari)/i], [w, f], [/webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i], [f, [w, Z, { "1.0": "/8", 1.2: "/1", 1.3: "/3", "2.0": "/412", "2.0.2": "/416", "2.0.3": "/417", "2.0.4": "/419", "?": "/" }]], [/(webkit|khtml)\/([\w\.]+)/i], [f, w], [/(navigator|netscape\d?)\/([-\w\.]+)/i], [[f, "Netscape"], w], [/mobile vr; rv:([\w\.]+)\).+firefox/i], [w, [f, L + " Reality"]], [/ekiohf.+(flow)\/([\w\.]+)/i, /(swiftfox)/i, /(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror|klar)[\/ ]?([\w\.\+]+)/i, /(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i, /(firefox)\/([\w\.]+)/i, /(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i, /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir|obigo|mosaic|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i, /(links) \(([\w\.]+)/i, /panasonic;(viera)/i], [f, w], [/(cobalt)\/([\w\.]+)/i], [f, [w, /master.|lts./, ""]]], cpu: [[/(?:(amd|x(?:(?:86|64)[-_])?|wow|win)64)[;\)]/i], [[b, "amd64"]], [/(ia32(?=;))/i], [[b, X]], [/((?:i[346]|x)86)[;\)]/i], [[b, "ia32"]], [/\b(aarch64|arm(v?8e?l?|_?64))\b/i], [[b, "arm64"]], [/\b(arm(?:v[67])?ht?n?[fl]p?)\b/i], [[b, "armhf"]], [/windows (ce|mobile); ppc;/i], [[b, "arm"]], [/((?:ppc|powerpc)(?:64)?)(?: mac|;|\))/i], [[b, /ower/, "", X]], [/(sun4\w)[;\)]/i], [[b, "sparc"]], [/((?:avr32|ia64(?=;))|68k(?=\))|\barm(?=v(?:[1-7]|[5-7]1)l?|;|eabi)|(?=atmel )avr|(?:irix|mips|sparc)(?:64)?\b|pa-risc)/i], [[b, X]]], device: [[/\b(sch-i[89]0\d|shw-m380s|sm-[ptx]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i], [p, [m, j], [g, y]], [/\b((?:s[cgp]h|gt|sm)-\w+|sc[g-]?[\d]+a?|galaxy nexus)/i, /samsung[- ]([-\w]+)/i, /sec-(sgh\w+)/i], [p, [m, j], [g, x]], [/(?:\/|\()(ip(?:hone|od)[\w, ]*)(?:\/|;)/i], [p, [m, k], [g, x]], [/\((ipad);[-\w\),; ]+apple/i, /applecoremedia\/[\w\.]+ \((ipad)/i, /\b(ipad)\d\d?,\d\d?[;\]].+ios/i], [p, [m, k], [g, y]], [/(macintosh);/i], [p, [m, k]], [/\b(sh-?[altvz]?\d\d[a-ekm]?)/i], [p, [m, D], [g, x]], [/\b((?:ag[rs][23]?|bah2?|sht?|btv)-a?[lw]\d{2})\b(?!.+d\/s)/i], [p, [m, A], [g, y]], [/(?:huawei|honor)([-\w ]+)[;\)]/i, /\b(nexus 6p|\w{2,4}e?-[atu]?[ln][\dx][012359c][adn]?)\b(?!.+d\/s)/i], [p, [m, A], [g, x]], [/\b(poco[\w ]+)(?: bui|\))/i, /\b; (\w+) build\/hm\1/i, /\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i, /\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i, /\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max|cc)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite)?)(?: bui|\))/i], [[p, /_/g, " "], [m, $], [g, x]], [/\b(mi[-_ ]?(?:pad)(?:[\w_ ]+))(?: bui|\))/i], [[p, /_/g, " "], [m, $], [g, y]], [/; (\w+) bui.+ oppo/i, /\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i], [p, [m, "OPPO"], [g, x]], [/vivo (\w+)(?: bui|\))/i, /\b(v[12]\d{3}\w?[at])(?: bui|;)/i], [p, [m, "Vivo"], [g, x]], [/\b(rmx[12]\d{3})(?: bui|;|\))/i], [p, [m, "Realme"], [g, x]], [/\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i, /\bmot(?:orola)?[- ](\w*)/i, /((?:moto[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i], [p, [m, M], [g, x]], [/\b(mz60\d|xoom[2 ]{0,2}) build\//i], [p, [m, M], [g, y]], [/((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i], [p, [m, "LG"], [g, y]], [/(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i, /\blg[-e;\/ ]+((?!browser|netcast|android tv)\w+)/i, /\blg-?([\d\w]+) bui/i], [p, [m, "LG"], [g, x]], [/(ideatab[-\w ]+)/i, /lenovo ?(s[56]000[-\w]+|tab(?:[\w ]+)|yt[-\d\w]{6}|tb[-\d\w]{6})/i], [p, [m, "Lenovo"], [g, y]], [/(?:maemo|nokia).*(n900|lumia \d+)/i, /nokia[-_ ]?([-\w\.]*)/i], [[p, /_/g, " "], [m, "Nokia"], [g, x]], [/(pixel c)\b/i], [p, [m, O], [g, y]], [/droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i], [p, [m, O], [g, x]], [/droid.+ (a?\d[0-2]{2}so|[c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i], [p, [m, U], [g, x]], [/sony tablet [ps]/i, /\b(?:sony)?sgp\w+(?: bui|\))/i], [[p, "Xperia Tablet"], [m, U], [g, y]], [/ (kb2005|in20[12]5|be20[12][59])\b/i, /(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i], [p, [m, "OnePlus"], [g, x]], [/(alexa)webm/i, /(kf[a-z]{2}wi|aeo[c-r]{2})( bui|\))/i, /(kf[a-z]+)( bui|\)).+silk\//i], [p, [m, C], [g, y]], [/((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i], [[p, /(.+)/g, "Fire Phone $1"], [m, C], [g, x]], [/(playbook);[-\w\),; ]+(rim)/i], [p, m, [g, y]], [/\b((?:bb[a-f]|st[hv])100-\d)/i, /\(bb10; (\w+)/i], [p, [m, N], [g, x]], [/(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i], [p, [m, E], [g, y]], [/ (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i], [p, [m, E], [g, x]], [/(nexus 9)/i], [p, [m, "HTC"], [g, y]], [/(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i, /(zte)[- ]([\w ]+?)(?: bui|\/|\))/i, /(alcatel|geeksphone|nexian|panasonic(?!(?:;|\.))|sony(?!-bra))[-_ ]?([-\w]*)/i], [m, [p, /_/g, " "], [g, x]], [/droid.+; ([ab][1-7]-?[0178a]\d\d?)/i], [p, [m, "Acer"], [g, y]], [/droid.+; (m[1-5] note) bui/i, /\bmz-([-\w]{2,})/i], [p, [m, "Meizu"], [g, x]], [/(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron)[-_ ]?([-\w]*)/i, /(hp) ([\w ]+\w)/i, /(asus)-?(\w+)/i, /(microsoft); (lumia[\w ]+)/i, /(lenovo)[-_ ]?([-\w]+)/i, /(jolla)/i, /(oppo) ?([\w ]+) bui/i], [m, p, [g, x]], [/(kobo)\s(ereader|touch)/i, /(archos) (gamepad2?)/i, /(hp).+(touchpad(?!.+tablet)|tablet)/i, /(kindle)\/([\w\.]+)/i, /(nook)[\w ]+build\/(\w+)/i, /(dell) (strea[kpr\d ]*[\dko])/i, /(le[- ]+pan)[- ]+(\w{1,9}) bui/i, /(trinity)[- ]*(t\d{3}) bui/i, /(gigaset)[- ]+(q\w{1,9}) bui/i, /(vodafone) ([\w ]+)(?:\)| bui)/i], [m, p, [g, y]], [/(surface duo)/i], [p, [m, I], [g, y]], [/droid [\d\.]+; (fp\du?)(?: b|\))/i], [p, [m, "Fairphone"], [g, x]], [/(u304aa)/i], [p, [m, "AT&T"], [g, x]], [/\bsie-(\w*)/i], [p, [m, "Siemens"], [g, x]], [/\b(rct\w+) b/i], [p, [m, "RCA"], [g, y]], [/\b(venue[\d ]{2,7}) b/i], [p, [m, "Dell"], [g, y]], [/\b(q(?:mv|ta)\w+) b/i], [p, [m, "Verizon"], [g, y]], [/\b(?:barnes[& ]+noble |bn[rt])([\w\+ ]*) b/i], [p, [m, "Barnes & Noble"], [g, y]], [/\b(tm\d{3}\w+) b/i], [p, [m, "NuVision"], [g, y]], [/\b(k88) b/i], [p, [m, "ZTE"], [g, y]], [/\b(nx\d{3}j) b/i], [p, [m, "ZTE"], [g, x]], [/\b(gen\d{3}) b.+49h/i], [p, [m, "Swiss"], [g, x]], [/\b(zur\d{3}) b/i], [p, [m, "Swiss"], [g, y]], [/\b((zeki)?tb.*\b) b/i], [p, [m, "Zeki"], [g, y]], [/\b([yr]\d{2}) b/i, /\b(dragon[- ]+touch |dt)(\w{5}) b/i], [[m, "Dragon Touch"], p, [g, y]], [/\b(ns-?\w{0,9}) b/i], [p, [m, "Insignia"], [g, y]], [/\b((nxa|next)-?\w{0,9}) b/i], [p, [m, "NextBook"], [g, y]], [/\b(xtreme\_)?(v(1[045]|2[015]|[3469]0|7[05])) b/i], [[m, "Voice"], p, [g, x]], [/\b(lvtel\-)?(v1[12]) b/i], [[m, "LvTel"], p, [g, x]], [/\b(ph-1) /i], [p, [m, "Essential"], [g, x]], [/\b(v(100md|700na|7011|917g).*\b) b/i], [p, [m, "Envizen"], [g, y]], [/\b(trio[-\w\. ]+) b/i], [p, [m, "MachSpeed"], [g, y]], [/\btu_(1491) b/i], [p, [m, "Rotor"], [g, y]], [/(shield[\w ]+) b/i], [p, [m, "Nvidia"], [g, y]], [/(sprint) (\w+)/i], [m, p, [g, x]], [/(kin\.[onetw]{3})/i], [[p, /\./g, " "], [m, I], [g, x]], [/droid.+; (cc6666?|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i], [p, [m, B], [g, y]], [/droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i], [p, [m, B], [g, x]], [/smart-tv.+(samsung)/i], [m, [g, S]], [/hbbtv.+maple;(\d+)/i], [[p, /^/, "SmartTV"], [m, j], [g, S]], [/(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i], [[m, "LG"], [g, S]], [/(apple) ?tv/i], [m, [p, k + " TV"], [g, S]], [/crkey/i], [[p, P + "cast"], [m, O], [g, S]], [/droid.+aft(\w)( bui|\))/i], [p, [m, C], [g, S]], [/\(dtv[\);].+(aquos)/i, /(aquos-tv[\w ]+)\)/i], [p, [m, D], [g, S]], [/(bravia[\w ]+)( bui|\))/i], [p, [m, U], [g, S]], [/(mitv-\w{5}) bui/i], [p, [m, $], [g, S]], [/Hbbtv.*(technisat) (.*);/i], [m, p, [g, S]], [/\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i, /hbbtv\/\d+\.\d+\.\d+ +\([\w\+ ]*; *([\w\d][^;]*);([^;]*)/i], [[m, K], [p, K], [g, S]], [/\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i], [[g, S]], [/(ouya)/i, /(nintendo) ([wids3utch]+)/i], [m, p, [g, v]], [/droid.+; (shield) bui/i], [p, [m, "Nvidia"], [g, v]], [/(playstation [345portablevi]+)/i], [p, [m, U], [g, v]], [/\b(xbox(?: one)?(?!; xbox))[\); ]/i], [p, [m, I], [g, v]], [/((pebble))app/i], [m, p, [g, _]], [/(watch)(?: ?os[,\/]|\d,\d\/)[\d\.]+/i], [p, [m, k], [g, _]], [/droid.+; (glass) \d/i], [p, [m, O], [g, _]], [/droid.+; (wt63?0{2,3})\)/i], [p, [m, B], [g, _]], [/(quest( 2| pro)?)/i], [p, [m, H], [g, _]], [/(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i], [m, [g, R]], [/(aeobc)\b/i], [p, [m, C], [g, R]], [/droid .+?; ([^;]+?)(?: bui|\) applew).+? mobile safari/i], [p, [g, x]], [/droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i], [p, [g, y]], [/\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i], [[g, y]], [/(phone|mobile(?:[;\/]| [ \w\/\.]*safari)|pda(?=.+windows ce))/i], [[g, x]], [/(android[-\w\. ]{0,9});.+buil/i], [p, [m, "Generic"]]], engine: [[/windows.+ edge\/([\w\.]+)/i], [w, [f, "EdgeHTML"]], [/webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i], [w, [f, "Blink"]], [/(presto)\/([\w\.]+)/i, /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i, /ekioh(flow)\/([\w\.]+)/i, /(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i, /(icab)[\/ ]([23]\.[\d\.]+)/i, /\b(libweb)/i], [f, w], [/rv\:([\w\.]{1,9})\b.+(gecko)/i], [w, f]], os: [[/microsoft (windows) (vista|xp)/i], [f, w], [/(windows) nt 6\.2; (arm)/i, /(windows (?:phone(?: os)?|mobile))[\/ ]?([\d\.\w ]*)/i, /(windows)[\/ ]?([ntce\d\. ]+\w)(?!.+xbox)/i], [f, [w, Z, J]], [/(win(?=3|9|n)|win 9x )([nt\d\.]+)/i], [[f, "Windows"], [w, Z, J]], [/ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i, /ios;fbsv\/([\d\.]+)/i, /cfnetwork\/.+darwin/i], [[w, /_/g, "."], [f, "iOS"]], [/(mac os x) ?([\w\. ]*)/i, /(macintosh|mac_powerpc\b)(?!.+haiku)/i], [[f, z], [w, /_/g, "."]], [/droid ([\w\.]+)\b.+(android[- ]x86|harmonyos)/i], [w, f], [/(android|webos|qnx|bada|rim tablet os|maemo|meego|sailfish)[-\/ ]?([\w\.]*)/i, /(blackberry)\w*\/([\w\.]*)/i, /(tizen|kaios)[\/ ]([\w\.]+)/i, /\((series40);/i], [f, w], [/\(bb(10);/i], [w, [f, N]], [/(?:symbian ?os|symbos|s60(?=;)|series60)[-\/ ]?([\w\.]*)/i], [w, [f, "Symbian"]], [/mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i], [w, [f, L + " OS"]], [/web0s;.+rt(tv)/i, /\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i], [w, [f, "webOS"]], [/watch(?: ?os[,\/]|\d,\d\/)([\d\.]+)/i], [w, [f, "watchOS"]], [/crkey\/([\d\.]+)/i], [w, [f, P + "cast"]], [/(cros) [\w]+(?:\)| ([\w\.]+)\b)/i], [[f, V], w], [/panasonic;(viera)/i, /(netrange)mmh/i, /(nettv)\/(\d+\.[\w\.]+)/i, /(nintendo|playstation) ([wids345portablevuch]+)/i, /(xbox); +xbox ([^\);]+)/i, /\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i, /(mint)[\/\(\) ]?(\w*)/i, /(mageia|vectorlinux)[; ]/i, /([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i, /(hurd|linux) ?([\w\.]*)/i, /(gnu) ?([\w\.]*)/i, /\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i, /(haiku) (\w+)/i], [f, w], [/(sunos) ?([\w\.\d]*)/i], [[f, "Solaris"], w], [/((?:open)?solaris)[-\/ ]?([\w\.]*)/i, /(aix) ((\d)(?=\.|\)| )[\w\.])*/i, /\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux|serenityos)/i, /(unix) ?([\w\.]*)/i], [f, w]] }, ee = function(e2, t2) {
              if (typeof e2 === d && (t2 = e2, e2 = s2), !(this instanceof ee)) return new ee(e2, t2).getResult();
              var r2 = typeof a2 !== u && a2.navigator ? a2.navigator : s2, n2 = e2 || (r2 && r2.userAgent ? r2.userAgent : ""), i3 = r2 && r2.userAgentData ? r2.userAgentData : s2, o3 = t2 ? F(Q, t2) : Q, v2 = r2 && r2.userAgent == n2;
              return this.getBrowser = function() {
                var e3, t3 = {};
                return t3[f] = s2, t3[w] = s2, Y.call(t3, n2, o3.browser), t3[h] = typeof (e3 = t3[w]) === c ? e3.replace(/[^\d\.]/g, "").split(".")[0] : s2, v2 && r2 && r2.brave && typeof r2.brave.isBrave == l && (t3[f] = "Brave"), t3;
              }, this.getCPU = function() {
                var e3 = {};
                return e3[b] = s2, Y.call(e3, n2, o3.cpu), e3;
              }, this.getDevice = function() {
                var e3 = {};
                return e3[m] = s2, e3[p] = s2, e3[g] = s2, Y.call(e3, n2, o3.device), v2 && !e3[g] && i3 && i3.mobile && (e3[g] = x), v2 && "Macintosh" == e3[p] && r2 && typeof r2.standalone !== u && r2.maxTouchPoints && r2.maxTouchPoints > 2 && (e3[p] = "iPad", e3[g] = y), e3;
              }, this.getEngine = function() {
                var e3 = {};
                return e3[f] = s2, e3[w] = s2, Y.call(e3, n2, o3.engine), e3;
              }, this.getOS = function() {
                var e3 = {};
                return e3[f] = s2, e3[w] = s2, Y.call(e3, n2, o3.os), v2 && !e3[f] && i3 && "Unknown" != i3.platform && (e3[f] = i3.platform.replace(/chrome os/i, V).replace(/macos/i, z)), e3;
              }, this.getResult = function() {
                return { ua: this.getUA(), browser: this.getBrowser(), engine: this.getEngine(), os: this.getOS(), device: this.getDevice(), cpu: this.getCPU() };
              }, this.getUA = function() {
                return n2;
              }, this.setUA = function(e3) {
                return n2 = typeof e3 === c && e3.length > 350 ? K(e3, 350) : e3, this;
              }, this.setUA(n2), this;
            };
            ee.VERSION = "1.0.35", ee.BROWSER = W([f, w, h]), ee.CPU = W([b]), ee.DEVICE = W([p, m, g, v, x, S, y, _, R]), ee.ENGINE = ee.OS = W([f, w]), typeof o2 !== u ? (i2.exports && (o2 = i2.exports = ee), o2.UAParser = ee) : r.amdO ? void 0 !== (n = function() {
              return ee;
            }.call(t, r, t, e)) && (e.exports = n) : typeof a2 !== u && (a2.UAParser = ee);
            var et = typeof a2 !== u && (a2.jQuery || a2.Zepto);
            if (et && !et.ua) {
              var er = new ee();
              et.ua = er.getResult(), et.ua.get = function() {
                return er.getUA();
              }, et.ua.set = function(e2) {
                er.setUA(e2);
                var t2 = er.getResult();
                for (var r2 in t2) et.ua[r2] = t2[r2];
              };
            }
          }("object" == typeof window ? window : this);
        } }, o = {};
        function a(e2) {
          var t2 = o[e2];
          if (void 0 !== t2) return t2.exports;
          var r2 = o[e2] = { exports: {} }, n2 = true;
          try {
            i[e2].call(r2.exports, r2, r2.exports, a), n2 = false;
          } finally {
            n2 && delete o[e2];
          }
          return r2.exports;
        }
        a.ab = "//";
        var s = a(226);
        e.exports = s;
      })();
    }, 488: (e, t, r) => {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: true }), function(e2, t2) {
        for (var r2 in t2) Object.defineProperty(e2, r2, { enumerable: true, get: t2[r2] });
      }(t, { getTestReqInfo: function() {
        return a;
      }, withRequest: function() {
        return o;
      } });
      let n = new (r(67)).AsyncLocalStorage();
      function i(e2, t2) {
        let r2 = t2.header(e2, "next-test-proxy-port");
        if (r2) return { url: t2.url(e2), proxyPort: Number(r2), testData: t2.header(e2, "next-test-data") || "" };
      }
      function o(e2, t2, r2) {
        let o2 = i(e2, t2);
        return o2 ? n.run(o2, r2) : r2();
      }
      function a(e2, t2) {
        return n.getStore() || (e2 && t2 ? i(e2, t2) : void 0);
      }
    }, 375: (e, t, r) => {
      "use strict";
      var n = r(195).Buffer;
      Object.defineProperty(t, "__esModule", { value: true }), function(e2, t2) {
        for (var r2 in t2) Object.defineProperty(e2, r2, { enumerable: true, get: t2[r2] });
      }(t, { handleFetch: function() {
        return s;
      }, interceptFetch: function() {
        return l;
      }, reader: function() {
        return o;
      } });
      let i = r(488), o = { url: (e2) => e2.url, header: (e2, t2) => e2.headers.get(t2) };
      async function a(e2, t2) {
        let { url: r2, method: i2, headers: o2, body: a2, cache: s2, credentials: l2, integrity: u, mode: d, redirect: c, referrer: h, referrerPolicy: p } = t2;
        return { testData: e2, api: "fetch", request: { url: r2, method: i2, headers: [...Array.from(o2), ["next-test-stack", function() {
          let e3 = (Error().stack ?? "").split("\n");
          for (let t3 = 1; t3 < e3.length; t3++) if (e3[t3].length > 0) {
            e3 = e3.slice(t3);
            break;
          }
          return (e3 = (e3 = (e3 = e3.filter((e4) => !e4.includes("/next/dist/"))).slice(0, 5)).map((e4) => e4.replace("webpack-internal:///(rsc)/", "").trim())).join("    ");
        }()]], body: a2 ? n.from(await t2.arrayBuffer()).toString("base64") : null, cache: s2, credentials: l2, integrity: u, mode: d, redirect: c, referrer: h, referrerPolicy: p } };
      }
      async function s(e2, t2) {
        let r2 = (0, i.getTestReqInfo)(t2, o);
        if (!r2) return e2(t2);
        let { testData: s2, proxyPort: l2 } = r2, u = await a(s2, t2), d = await e2(`http://localhost:${l2}`, { method: "POST", body: JSON.stringify(u), next: { internal: true } });
        if (!d.ok) throw Error(`Proxy request failed: ${d.status}`);
        let c = await d.json(), { api: h } = c;
        switch (h) {
          case "continue":
            return e2(t2);
          case "abort":
          case "unhandled":
            throw Error(`Proxy request aborted [${t2.method} ${t2.url}]`);
        }
        return function(e3) {
          let { status: t3, headers: r3, body: i2 } = e3.response;
          return new Response(i2 ? n.from(i2, "base64") : null, { status: t3, headers: new Headers(r3) });
        }(c);
      }
      function l(e2) {
        return r.g.fetch = function(t2, r2) {
          var n2;
          return (null == r2 ? void 0 : null == (n2 = r2.next) ? void 0 : n2.internal) ? e2(t2, r2) : s(e2, new Request(t2, r2));
        }, () => {
          r.g.fetch = e2;
        };
      }
    }, 177: (e, t, r) => {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: true }), function(e2, t2) {
        for (var r2 in t2) Object.defineProperty(e2, r2, { enumerable: true, get: t2[r2] });
      }(t, { interceptTestApis: function() {
        return o;
      }, wrapRequestHandler: function() {
        return a;
      } });
      let n = r(488), i = r(375);
      function o() {
        return (0, i.interceptFetch)(r.g.fetch);
      }
      function a(e2) {
        return (t2, r2) => (0, n.withRequest)(t2, i.reader, () => e2(t2, r2));
      }
    } }, (e) => {
      var t = e(e.s = 194);
      (_ENTRIES = "undefined" == typeof _ENTRIES ? {} : _ENTRIES).middleware_middleware = t;
    }]);
  }
});

// node_modules/@opennextjs/aws/dist/core/edgeFunctionHandler.js
var edgeFunctionHandler_exports = {};
__export(edgeFunctionHandler_exports, {
  default: () => edgeFunctionHandler
});
async function edgeFunctionHandler(request) {
  const path3 = new URL(request.url).pathname;
  const routes = globalThis._ROUTES;
  const correspondingRoute = routes.find((route) => route.regex.some((r) => new RegExp(r).test(path3)));
  if (!correspondingRoute) {
    throw new Error(`No route found for ${request.url}`);
  }
  const entry = await self._ENTRIES[`middleware_${correspondingRoute.name}`];
  const result = await entry.default({
    page: correspondingRoute.page,
    request: {
      ...request,
      page: {
        name: correspondingRoute.name
      }
    }
  });
  globalThis.__openNextAls.getStore()?.pendingPromiseRunner.add(result.waitUntil);
  const response = result.response;
  return response;
}
var init_edgeFunctionHandler = __esm({
  "node_modules/@opennextjs/aws/dist/core/edgeFunctionHandler.js"() {
    globalThis._ENTRIES = {};
    globalThis.self = globalThis;
    globalThis._ROUTES = [{ "name": "middleware", "page": "/", "regex": ["^(?:\\/(_next\\/data\\/[^/]{1,}))?\\/admin\\/dashboard(.json)?[\\/#\\?]?$"] }];
    require_edge_runtime_webpack();
    require_middleware();
  }
});

// node_modules/@opennextjs/aws/dist/utils/promise.js
init_logger();
var DetachedPromise = class {
  resolve;
  reject;
  promise;
  constructor() {
    let resolve;
    let reject;
    this.promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    this.resolve = resolve;
    this.reject = reject;
  }
};
var DetachedPromiseRunner = class {
  promises = [];
  withResolvers() {
    const detachedPromise = new DetachedPromise();
    this.promises.push(detachedPromise);
    return detachedPromise;
  }
  add(promise) {
    const detachedPromise = new DetachedPromise();
    this.promises.push(detachedPromise);
    promise.then(detachedPromise.resolve, detachedPromise.reject);
  }
  async await() {
    debug(`Awaiting ${this.promises.length} detached promises`);
    const results = await Promise.allSettled(this.promises.map((p) => p.promise));
    const rejectedPromises = results.filter((r) => r.status === "rejected");
    rejectedPromises.forEach((r) => {
      error(r.reason);
    });
  }
};
async function awaitAllDetachedPromise() {
  const store = globalThis.__openNextAls.getStore();
  const promisesToAwait = store?.pendingPromiseRunner.await() ?? Promise.resolve();
  if (store?.waitUntil) {
    store.waitUntil(promisesToAwait);
    return;
  }
  await promisesToAwait;
}
function provideNextAfterProvider() {
  const NEXT_REQUEST_CONTEXT_SYMBOL = Symbol.for("@next/request-context");
  const VERCEL_REQUEST_CONTEXT_SYMBOL = Symbol.for("@vercel/request-context");
  const store = globalThis.__openNextAls.getStore();
  const waitUntil = store?.waitUntil ?? ((promise) => store?.pendingPromiseRunner.add(promise));
  const nextAfterContext = {
    get: () => ({
      waitUntil
    })
  };
  globalThis[NEXT_REQUEST_CONTEXT_SYMBOL] = nextAfterContext;
  if (process.env.EMULATE_VERCEL_REQUEST_CONTEXT) {
    globalThis[VERCEL_REQUEST_CONTEXT_SYMBOL] = nextAfterContext;
  }
}
function runWithOpenNextRequestContext({ isISRRevalidation, waitUntil, requestId = Math.random().toString(36) }, fn) {
  return globalThis.__openNextAls.run({
    requestId,
    pendingPromiseRunner: new DetachedPromiseRunner(),
    isISRRevalidation,
    waitUntil,
    writtenTags: /* @__PURE__ */ new Set()
  }, async () => {
    provideNextAfterProvider();
    let result;
    try {
      result = await fn();
    } finally {
      await awaitAllDetachedPromise();
    }
    return result;
  });
}

// node_modules/@opennextjs/aws/dist/adapters/middleware.js
init_logger();

// node_modules/@opennextjs/aws/dist/core/createGenericHandler.js
init_logger();

// node_modules/@opennextjs/aws/dist/core/resolve.js
async function resolveConverter(converter2) {
  if (typeof converter2 === "function") {
    return converter2();
  }
  const m_1 = await Promise.resolve().then(() => (init_edge(), edge_exports));
  return m_1.default;
}
async function resolveWrapper(wrapper) {
  if (typeof wrapper === "function") {
    return wrapper();
  }
  const m_1 = await Promise.resolve().then(() => (init_cloudflare_edge(), cloudflare_edge_exports));
  return m_1.default;
}
async function resolveOriginResolver(originResolver) {
  if (typeof originResolver === "function") {
    return originResolver();
  }
  const m_1 = await Promise.resolve().then(() => (init_pattern_env(), pattern_env_exports));
  return m_1.default;
}
async function resolveAssetResolver(assetResolver) {
  if (typeof assetResolver === "function") {
    return assetResolver();
  }
  const m_1 = await Promise.resolve().then(() => (init_dummy(), dummy_exports));
  return m_1.default;
}
async function resolveProxyRequest(proxyRequest) {
  if (typeof proxyRequest === "function") {
    return proxyRequest();
  }
  const m_1 = await Promise.resolve().then(() => (init_fetch(), fetch_exports));
  return m_1.default;
}

// node_modules/@opennextjs/aws/dist/core/createGenericHandler.js
async function createGenericHandler(handler3) {
  const config = await import("./open-next.config.mjs").then((m) => m.default);
  globalThis.openNextConfig = config;
  const override = config[handler3.type]?.override;
  const converter2 = await resolveConverter(override?.converter);
  const { name, wrapper } = await resolveWrapper(override?.wrapper);
  debug("Using wrapper", name);
  return wrapper(handler3.handler, converter2);
}

// node_modules/@opennextjs/aws/dist/core/routing/util.js
import crypto from "node:crypto";
import { Readable as Readable2 } from "node:stream";

// node_modules/@opennextjs/aws/dist/adapters/config/index.js
init_logger();
import path from "node:path";
globalThis.__dirname ??= "";
var NEXT_DIR = path.join(__dirname, ".next");
var OPEN_NEXT_DIR = path.join(__dirname, ".open-next");
debug({ NEXT_DIR, OPEN_NEXT_DIR });
var NextConfig = { "env": {}, "webpack": null, "eslint": { "ignoreDuringBuilds": false }, "typescript": { "ignoreBuildErrors": false, "tsconfigPath": "tsconfig.json" }, "distDir": ".next", "cleanDistDir": true, "assetPrefix": "", "cacheMaxMemorySize": 52428800, "configOrigin": "next.config.js", "useFileSystemPublicRoutes": true, "generateEtags": true, "pageExtensions": ["tsx", "ts", "jsx", "js"], "poweredByHeader": true, "compress": true, "analyticsId": "", "images": { "deviceSizes": [640, 750, 828, 1080, 1200, 1920, 2048, 3840], "imageSizes": [16, 32, 48, 64, 96, 128, 256, 384], "path": "/_next/image", "loader": "default", "loaderFile": "", "domains": [], "disableStaticImages": false, "minimumCacheTTL": 60, "formats": ["image/webp"], "dangerouslyAllowSVG": false, "contentSecurityPolicy": "script-src 'none'; frame-src 'none'; sandbox;", "contentDispositionType": "inline", "remotePatterns": [], "unoptimized": false }, "devIndicators": { "buildActivity": true, "buildActivityPosition": "bottom-right" }, "onDemandEntries": { "maxInactiveAge": 6e4, "pagesBufferLength": 5 }, "amp": { "canonicalBase": "" }, "basePath": "", "sassOptions": {}, "trailingSlash": false, "i18n": null, "productionBrowserSourceMaps": false, "optimizeFonts": true, "excludeDefaultMomentLocales": true, "serverRuntimeConfig": {}, "publicRuntimeConfig": {}, "reactProductionProfiling": false, "reactStrictMode": null, "httpAgentOptions": { "keepAlive": true }, "outputFileTracing": true, "staticPageGenerationTimeout": 60, "swcMinify": true, "output": "standalone", "modularizeImports": { "@mui/icons-material": { "transform": "@mui/icons-material/{{member}}" }, "lodash": { "transform": "lodash/{{member}}" } }, "experimental": { "multiZoneDraftMode": false, "prerenderEarlyExit": false, "serverMinification": true, "serverSourceMaps": false, "linkNoTouchStart": false, "caseSensitiveRoutes": false, "clientRouterFilter": true, "clientRouterFilterRedirects": false, "fetchCacheKeyPrefix": "", "middlewarePrefetch": "flexible", "optimisticClientCache": true, "manualClientBasePath": false, "cpus": 11, "memoryBasedWorkersCount": false, "isrFlushToDisk": true, "workerThreads": false, "optimizeCss": false, "nextScriptWorkers": false, "scrollRestoration": false, "externalDir": false, "disableOptimizedLoading": false, "gzipSize": true, "craCompat": false, "esmExternals": true, "fullySpecified": false, "outputFileTracingRoot": "C:\\Users\\HP\\Downloads\\launchpadx-frontend\\launchpadx-frontend", "swcTraceProfiling": false, "forceSwcTransforms": false, "largePageDataBytes": 128e3, "adjustFontFallbacks": false, "adjustFontFallbacksWithSizeAdjust": false, "typedRoutes": false, "instrumentationHook": false, "bundlePagesExternals": false, "parallelServerCompiles": false, "parallelServerBuildTraces": false, "ppr": false, "missingSuspenseWithCSRBailout": true, "optimizeServerReact": true, "useEarlyImport": false, "staleTimes": { "dynamic": 30, "static": 300 }, "optimizePackageImports": ["lucide-react", "date-fns", "lodash-es", "ramda", "antd", "react-bootstrap", "ahooks", "@ant-design/icons", "@headlessui/react", "@headlessui-float/react", "@heroicons/react/20/solid", "@heroicons/react/24/solid", "@heroicons/react/24/outline", "@visx/visx", "@tremor/react", "rxjs", "@mui/material", "@mui/icons-material", "recharts", "react-use", "@material-ui/core", "@material-ui/icons", "@tabler/icons-react", "mui-core", "react-icons/ai", "react-icons/bi", "react-icons/bs", "react-icons/cg", "react-icons/ci", "react-icons/di", "react-icons/fa", "react-icons/fa6", "react-icons/fc", "react-icons/fi", "react-icons/gi", "react-icons/go", "react-icons/gr", "react-icons/hi", "react-icons/hi2", "react-icons/im", "react-icons/io", "react-icons/io5", "react-icons/lia", "react-icons/lib", "react-icons/lu", "react-icons/md", "react-icons/pi", "react-icons/ri", "react-icons/rx", "react-icons/si", "react-icons/sl", "react-icons/tb", "react-icons/tfi", "react-icons/ti", "react-icons/vsc", "react-icons/wi"], "trustHostHeader": false, "isExperimentalCompile": false }, "configFileName": "next.config.js" };
var BuildId = "tKTAV5Fi7TB-3sxbBQ_Fq";
var RoutesManifest = { "basePath": "", "rewrites": { "beforeFiles": [], "afterFiles": [], "fallback": [] }, "redirects": [{ "source": "/:path+/", "destination": "/:path+", "internal": true, "statusCode": 308, "regex": "^(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))/$" }], "routes": { "static": [{ "page": "/", "regex": "^/(?:/)?$", "routeKeys": {}, "namedRegex": "^/(?:/)?$" }, { "page": "/_not-found", "regex": "^/_not\\-found(?:/)?$", "routeKeys": {}, "namedRegex": "^/_not\\-found(?:/)?$" }, { "page": "/admin/dashboard", "regex": "^/admin/dashboard(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/dashboard(?:/)?$" }, { "page": "/admin/login", "regex": "^/admin/login(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/login(?:/)?$" }, { "page": "/admin/logout", "regex": "^/admin/logout(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/logout(?:/)?$" }, { "page": "/apply", "regex": "^/apply(?:/)?$", "routeKeys": {}, "namedRegex": "^/apply(?:/)?$" }, { "page": "/id", "regex": "^/id(?:/)?$", "routeKeys": {}, "namedRegex": "^/id(?:/)?$" }, { "page": "/id/success", "regex": "^/id/success(?:/)?$", "routeKeys": {}, "namedRegex": "^/id/success(?:/)?$" }, { "page": "/privacy", "regex": "^/privacy(?:/)?$", "routeKeys": {}, "namedRegex": "^/privacy(?:/)?$" }, { "page": "/terms", "regex": "^/terms(?:/)?$", "routeKeys": {}, "namedRegex": "^/terms(?:/)?$" }, { "page": "/verification", "regex": "^/verification(?:/)?$", "routeKeys": {}, "namedRegex": "^/verification(?:/)?$" }, { "page": "/video-pitch", "regex": "^/video\\-pitch(?:/)?$", "routeKeys": {}, "namedRegex": "^/video\\-pitch(?:/)?$" }], "dynamic": [{ "page": "/api/public/verification/file/[...key]", "regex": "^/api/public/verification/file/(.+?)(?:/)?$", "routeKeys": { "nxtPkey": "nxtPkey" }, "namedRegex": "^/api/public/verification/file/(?<nxtPkey>.+?)(?:/)?$" }], "data": { "static": [], "dynamic": [] } }, "locales": [] };
var ConfigHeaders = [];
var PrerenderManifest = { "version": 4, "routes": { "/apply": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/apply", "dataRoute": "/apply.rsc" }, "/id/success": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/id/success", "dataRoute": "/id/success.rsc" }, "/": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/", "dataRoute": "/index.rsc" }, "/verification": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/verification", "dataRoute": "/verification.rsc" }, "/video-pitch": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/video-pitch", "dataRoute": "/video-pitch.rsc" }, "/id": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/id", "dataRoute": "/id.rsc" }, "/terms": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/terms", "dataRoute": "/terms.rsc" }, "/admin/login": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/admin/login", "dataRoute": "/admin/login.rsc" }, "/privacy": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/privacy", "dataRoute": "/privacy.rsc" } }, "dynamicRoutes": {}, "notFoundRoutes": [], "preview": { "previewModeId": "699ce0fad666d5121e6d502934e91d6f", "previewModeSigningKey": "dcddde5c635348aad94227e6a7cc0c52908308e01aac769a016332e9930e1f67", "previewModeEncryptionKey": "dc1ec061bf1efa4c14102eb187c65c9583109a935dcbfa82480f4a25882fcf8d" } };
var MiddlewareManifest = { "version": 3, "middleware": { "/": { "files": ["server/edge-runtime-webpack.js", "server/middleware.js"], "name": "middleware", "page": "/", "matchers": [{ "regexp": "^(?:\\/(_next\\/data\\/[^/]{1,}))?\\/admin\\/dashboard(.json)?[\\/#\\?]?$", "originalSource": "/admin/dashboard" }], "wasm": [], "assets": [], "env": { "__NEXT_BUILD_ID": "tKTAV5Fi7TB-3sxbBQ_Fq", "NEXT_SERVER_ACTIONS_ENCRYPTION_KEY": "gNTgWP5ay2ZbnZvo/FhXCh85/3F/iAEguNR7NLR/dKg=", "__NEXT_PREVIEW_MODE_ID": "699ce0fad666d5121e6d502934e91d6f", "__NEXT_PREVIEW_MODE_ENCRYPTION_KEY": "dc1ec061bf1efa4c14102eb187c65c9583109a935dcbfa82480f4a25882fcf8d", "__NEXT_PREVIEW_MODE_SIGNING_KEY": "dcddde5c635348aad94227e6a7cc0c52908308e01aac769a016332e9930e1f67" } } }, "functions": {}, "sortedMiddleware": ["/"] };
var AppPathRoutesManifest = { "/_not-found/page": "/_not-found", "/admin/dashboard/page": "/admin/dashboard", "/api/admin/analytics-data/route": "/api/admin/analytics-data", "/admin/login/page": "/admin/login", "/api/admin/users-upload/route": "/api/admin/users-upload", "/admin/logout/route": "/admin/logout", "/api/admin/users/route": "/api/admin/users", "/api/admin/applicants/route": "/api/admin/applicants", "/api/admin/video-submissions/route": "/api/admin/video-submissions", "/api/admin/verifications/route": "/api/admin/verifications", "/api/cron/video-invite-batch/route": "/api/cron/video-invite-batch", "/api/auth/session/route": "/api/auth/session", "/api/cron/verification-outcome-batch/route": "/api/cron/verification-outcome-batch", "/api/cron/send-responses/route": "/api/cron/send-responses", "/api/cron/video/action-required/route": "/api/cron/video/action-required", "/api/cron/video-outcome-batch/route": "/api/cron/video-outcome-batch", "/api/cron/video/approved/route": "/api/cron/video/approved", "/api/cron/video/rejected/route": "/api/cron/video/rejected", "/api/public/lpx-id/route": "/api/public/lpx-id", "/api/public/apply/route": "/api/public/apply", "/api/public/verification/file/[...key]/route": "/api/public/verification/file/[...key]", "/id/page": "/id", "/api/cron/debug-query/route": "/api/cron/debug-query", "/apply/page": "/apply", "/api/public/verification/upload/route": "/api/public/verification/upload", "/page": "/", "/api/public/video-pitch/route": "/api/public/video-pitch", "/api/public/verification/route": "/api/public/verification", "/id/success/page": "/id/success", "/verification/page": "/verification", "/video-pitch/page": "/video-pitch", "/terms/page": "/terms", "/privacy/page": "/privacy" };
var FunctionsConfigManifest = { "version": 1, "functions": {} };
var PagesManifest = { "/_error": "pages/_error.js", "/_app": "pages/_app.js", "/_document": "pages/_document.js", "/404": "pages/404.html" };
process.env.NEXT_BUILD_ID = BuildId;

// node_modules/@opennextjs/aws/dist/http/openNextResponse.js
init_logger();
init_util();
import { Transform } from "node:stream";

// node_modules/@opennextjs/aws/dist/core/routing/util.js
init_util();
init_logger();

// node_modules/@opennextjs/aws/dist/core/routing/i18n/index.js
init_stream();
init_logger();

// node_modules/@opennextjs/aws/dist/core/routing/i18n/accept-header.js
function parse(raw, preferences, options) {
  const lowers = /* @__PURE__ */ new Map();
  const header = raw.replace(/[ \t]/g, "");
  if (preferences) {
    let pos = 0;
    for (const preference of preferences) {
      const lower = preference.toLowerCase();
      lowers.set(lower, { orig: preference, pos: pos++ });
      if (options.prefixMatch) {
        const parts2 = lower.split("-");
        while (parts2.pop(), parts2.length > 0) {
          const joined = parts2.join("-");
          if (!lowers.has(joined)) {
            lowers.set(joined, { orig: preference, pos: pos++ });
          }
        }
      }
    }
  }
  const parts = header.split(",");
  const selections = [];
  const map = /* @__PURE__ */ new Set();
  for (let i = 0; i < parts.length; ++i) {
    const part = parts[i];
    if (!part) {
      continue;
    }
    const params = part.split(";");
    if (params.length > 2) {
      throw new Error(`Invalid ${options.type} header`);
    }
    const token = params[0].toLowerCase();
    if (!token) {
      throw new Error(`Invalid ${options.type} header`);
    }
    const selection = { token, pos: i, q: 1 };
    if (preferences && lowers.has(token)) {
      selection.pref = lowers.get(token).pos;
    }
    map.add(selection.token);
    if (params.length === 2) {
      const q = params[1];
      const [key, value] = q.split("=");
      if (!value || key !== "q" && key !== "Q") {
        throw new Error(`Invalid ${options.type} header`);
      }
      const score = Number.parseFloat(value);
      if (score === 0) {
        continue;
      }
      if (Number.isFinite(score) && score <= 1 && score >= 1e-3) {
        selection.q = score;
      }
    }
    selections.push(selection);
  }
  selections.sort((a, b) => {
    if (b.q !== a.q) {
      return b.q - a.q;
    }
    if (b.pref !== a.pref) {
      if (a.pref === void 0) {
        return 1;
      }
      if (b.pref === void 0) {
        return -1;
      }
      return a.pref - b.pref;
    }
    return a.pos - b.pos;
  });
  const values = selections.map((selection) => selection.token);
  if (!preferences || !preferences.length) {
    return values;
  }
  const preferred = [];
  for (const selection of values) {
    if (selection === "*") {
      for (const [preference, value] of lowers) {
        if (!map.has(preference)) {
          preferred.push(value.orig);
        }
      }
    } else {
      const lower = selection.toLowerCase();
      if (lowers.has(lower)) {
        preferred.push(lowers.get(lower).orig);
      }
    }
  }
  return preferred;
}
function acceptLanguage(header = "", preferences) {
  return parse(header, preferences, {
    type: "accept-language",
    prefixMatch: true
  })[0] || void 0;
}

// node_modules/@opennextjs/aws/dist/core/routing/i18n/index.js
function isLocalizedPath(path3) {
  return NextConfig.i18n?.locales.includes(path3.split("/")[1].toLowerCase()) ?? false;
}
function getLocaleFromCookie(cookies) {
  const i18n = NextConfig.i18n;
  const nextLocale = cookies.NEXT_LOCALE?.toLowerCase();
  return nextLocale ? i18n?.locales.find((locale) => nextLocale === locale.toLowerCase()) : void 0;
}
function detectDomainLocale({ hostname, detectedLocale }) {
  const i18n = NextConfig.i18n;
  const domains = i18n?.domains;
  if (!domains) {
    return;
  }
  const lowercasedLocale = detectedLocale?.toLowerCase();
  for (const domain of domains) {
    const domainHostname = domain.domain.split(":", 1)[0].toLowerCase();
    if (hostname === domainHostname || lowercasedLocale === domain.defaultLocale.toLowerCase() || domain.locales?.some((locale) => lowercasedLocale === locale.toLowerCase())) {
      return domain;
    }
  }
}
function detectLocale(internalEvent, i18n) {
  const domainLocale = detectDomainLocale({
    hostname: internalEvent.headers.host
  });
  if (i18n.localeDetection === false) {
    return domainLocale?.defaultLocale ?? i18n.defaultLocale;
  }
  const cookiesLocale = getLocaleFromCookie(internalEvent.cookies);
  const preferredLocale = acceptLanguage(internalEvent.headers["accept-language"], i18n?.locales);
  debug({
    cookiesLocale,
    preferredLocale,
    defaultLocale: i18n.defaultLocale,
    domainLocale
  });
  return domainLocale?.defaultLocale ?? cookiesLocale ?? preferredLocale ?? i18n.defaultLocale;
}
function localizePath(internalEvent) {
  const i18n = NextConfig.i18n;
  if (!i18n) {
    return internalEvent.rawPath;
  }
  if (isLocalizedPath(internalEvent.rawPath)) {
    return internalEvent.rawPath;
  }
  const detectedLocale = detectLocale(internalEvent, i18n);
  return `/${detectedLocale}${internalEvent.rawPath}`;
}
function handleLocaleRedirect(internalEvent) {
  const i18n = NextConfig.i18n;
  if (!i18n || i18n.localeDetection === false || internalEvent.rawPath !== "/") {
    return false;
  }
  const preferredLocale = acceptLanguage(internalEvent.headers["accept-language"], i18n?.locales);
  const detectedLocale = detectLocale(internalEvent, i18n);
  const domainLocale = detectDomainLocale({
    hostname: internalEvent.headers.host
  });
  const preferredDomain = detectDomainLocale({
    detectedLocale: preferredLocale
  });
  if (domainLocale && preferredDomain) {
    const isPDomain = preferredDomain.domain === domainLocale.domain;
    const isPLocale = preferredDomain.defaultLocale === preferredLocale;
    if (!isPDomain || !isPLocale) {
      const scheme = `http${preferredDomain.http ? "" : "s"}`;
      const rlocale = isPLocale ? "" : preferredLocale;
      return {
        type: "core",
        statusCode: 307,
        headers: {
          Location: `${scheme}://${preferredDomain.domain}/${rlocale}`
        },
        body: emptyReadableStream(),
        isBase64Encoded: false
      };
    }
  }
  const defaultLocale = domainLocale?.defaultLocale ?? i18n.defaultLocale;
  if (detectedLocale.toLowerCase() !== defaultLocale.toLowerCase()) {
    return {
      type: "core",
      statusCode: 307,
      headers: {
        Location: constructNextUrl(internalEvent.url, `/${detectedLocale}`)
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
  return false;
}

// node_modules/@opennextjs/aws/dist/core/routing/queue.js
function generateShardId(rawPath, maxConcurrency, prefix) {
  let a = cyrb128(rawPath);
  let t = a += 1831565813;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  const randomFloat = ((t ^ t >>> 14) >>> 0) / 4294967296;
  const randomInt = Math.floor(randomFloat * maxConcurrency);
  return `${prefix}-${randomInt}`;
}
function generateMessageGroupId(rawPath) {
  const maxConcurrency = Number.parseInt(process.env.MAX_REVALIDATE_CONCURRENCY ?? "10");
  return generateShardId(rawPath, maxConcurrency, "revalidate");
}
function cyrb128(str) {
  let h1 = 1779033703;
  let h2 = 3144134277;
  let h3 = 1013904242;
  let h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ h1 >>> 18, 597399067);
  h2 = Math.imul(h4 ^ h2 >>> 22, 2869860233);
  h3 = Math.imul(h1 ^ h3 >>> 17, 951274213);
  h4 = Math.imul(h2 ^ h4 >>> 19, 2716044179);
  h1 ^= h2 ^ h3 ^ h4, h2 ^= h1, h3 ^= h1, h4 ^= h1;
  return h1 >>> 0;
}

// node_modules/@opennextjs/aws/dist/core/routing/util.js
function isExternal(url, host) {
  if (!url)
    return false;
  const pattern = /^https?:\/\//;
  if (host) {
    return pattern.test(url) && !url.includes(host);
  }
  return pattern.test(url);
}
function convertFromQueryString(query) {
  if (query === "")
    return {};
  const queryParts = query.split("&");
  return getQueryFromIterator(queryParts.map((p) => {
    const [key, value] = p.split("=");
    return [key, value];
  }));
}
function getUrlParts(url, isExternal2) {
  if (!isExternal2) {
    const regex2 = /\/([^?]*)\??(.*)/;
    const match3 = url.match(regex2);
    return {
      hostname: "",
      pathname: match3?.[1] ? `/${match3[1]}` : url,
      protocol: "",
      queryString: match3?.[2] ?? ""
    };
  }
  const regex = /^(https?:)\/\/?([^\/\s]+)(\/[^?]*)?(\?.*)?/;
  const match2 = url.match(regex);
  if (!match2) {
    throw new Error(`Invalid external URL: ${url}`);
  }
  return {
    protocol: match2[1] ?? "https:",
    hostname: match2[2],
    pathname: match2[3] ?? "",
    queryString: match2[4]?.slice(1) ?? ""
  };
}
function constructNextUrl(baseUrl, path3) {
  const nextBasePath = NextConfig.basePath ?? "";
  const url = new URL(`${nextBasePath}${path3}`, baseUrl);
  return url.href;
}
function convertToQueryString(query) {
  const queryStrings = [];
  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => queryStrings.push(`${key}=${entry}`));
    } else {
      queryStrings.push(`${key}=${value}`);
    }
  });
  return queryStrings.length > 0 ? `?${queryStrings.join("&")}` : "";
}
function getMiddlewareMatch(middlewareManifest2, functionsManifest) {
  if (functionsManifest?.functions?.["/_middleware"]) {
    return functionsManifest.functions["/_middleware"].matchers?.map(({ regexp }) => new RegExp(regexp)) ?? [/.*/];
  }
  const rootMiddleware = middlewareManifest2.middleware["/"];
  if (!rootMiddleware?.matchers)
    return [];
  return rootMiddleware.matchers.map(({ regexp }) => new RegExp(regexp));
}
function escapeRegex(str, { isPath } = {}) {
  const result = str.replaceAll("(.)", "_\xB51_").replaceAll("(..)", "_\xB52_").replaceAll("(...)", "_\xB53_");
  return isPath ? result : result.replaceAll("+", "_\xB54_");
}
function unescapeRegex(str) {
  return str.replaceAll("_\xB51_", "(.)").replaceAll("_\xB52_", "(..)").replaceAll("_\xB53_", "(...)").replaceAll("_\xB54_", "+");
}
function convertBodyToReadableStream(method, body) {
  if (method === "GET" || method === "HEAD")
    return void 0;
  if (!body)
    return void 0;
  const readable = new ReadableStream({
    start(controller) {
      controller.enqueue(body);
      controller.close();
    }
  });
  return readable;
}
var CommonHeaders;
(function(CommonHeaders2) {
  CommonHeaders2["CACHE_CONTROL"] = "cache-control";
  CommonHeaders2["NEXT_CACHE"] = "x-nextjs-cache";
})(CommonHeaders || (CommonHeaders = {}));

// node_modules/@opennextjs/aws/dist/core/routingHandler.js
init_logger();

// node_modules/@opennextjs/aws/dist/core/routing/cacheInterceptor.js
import { createHash } from "node:crypto";
init_stream();

// node_modules/@opennextjs/aws/dist/utils/cache.js
init_logger();
async function hasBeenRevalidated(key, tags, cacheEntry) {
  if (globalThis.openNextConfig.dangerous?.disableTagCache) {
    return false;
  }
  const value = cacheEntry.value;
  if (!value) {
    return true;
  }
  if ("type" in cacheEntry && cacheEntry.type === "page") {
    return false;
  }
  const lastModified = cacheEntry.lastModified ?? Date.now();
  if (globalThis.tagCache.mode === "nextMode") {
    return await globalThis.tagCache.hasBeenRevalidated(tags, lastModified);
  }
  const _lastModified = await globalThis.tagCache.getLastModified(key, lastModified);
  return _lastModified === -1;
}
function getTagsFromValue(value) {
  if (!value) {
    return [];
  }
  try {
    return value.meta?.headers?.["x-next-cache-tags"]?.split(",") ?? [];
  } catch (e) {
    return [];
  }
}

// node_modules/@opennextjs/aws/dist/core/routing/cacheInterceptor.js
init_logger();
var CACHE_ONE_YEAR = 60 * 60 * 24 * 365;
var CACHE_ONE_MONTH = 60 * 60 * 24 * 30;
var VARY_HEADER = "RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch, Next-Url";
async function computeCacheControl(path3, body, host, revalidate, lastModified) {
  let finalRevalidate = CACHE_ONE_YEAR;
  const existingRoute = Object.entries(PrerenderManifest.routes).find((p) => p[0] === path3)?.[1];
  if (revalidate === void 0 && existingRoute) {
    finalRevalidate = existingRoute.initialRevalidateSeconds === false ? CACHE_ONE_YEAR : existingRoute.initialRevalidateSeconds;
  } else if (revalidate !== void 0) {
    finalRevalidate = revalidate === false ? CACHE_ONE_YEAR : revalidate;
  }
  const age = Math.round((Date.now() - (lastModified ?? 0)) / 1e3);
  const hash = (str) => createHash("md5").update(str).digest("hex");
  const etag = hash(body);
  if (revalidate === 0) {
    return {
      "cache-control": "private, no-cache, no-store, max-age=0, must-revalidate",
      "x-opennext-cache": "ERROR",
      etag
    };
  }
  if (finalRevalidate !== CACHE_ONE_YEAR) {
    const sMaxAge = Math.max(finalRevalidate - age, 1);
    debug("sMaxAge", {
      finalRevalidate,
      age,
      lastModified,
      revalidate
    });
    const isStale = sMaxAge === 1;
    if (isStale) {
      let url = NextConfig.trailingSlash ? `${path3}/` : path3;
      if (NextConfig.basePath) {
        url = `${NextConfig.basePath}${url}`;
      }
      await globalThis.queue.send({
        MessageBody: {
          host,
          url,
          eTag: etag,
          lastModified: lastModified ?? Date.now()
        },
        MessageDeduplicationId: hash(`${path3}-${lastModified}-${etag}`),
        MessageGroupId: generateMessageGroupId(path3)
      });
    }
    return {
      "cache-control": `s-maxage=${sMaxAge}, stale-while-revalidate=${CACHE_ONE_MONTH}`,
      "x-opennext-cache": isStale ? "STALE" : "HIT",
      etag
    };
  }
  return {
    "cache-control": `s-maxage=${CACHE_ONE_YEAR}, stale-while-revalidate=${CACHE_ONE_MONTH}`,
    "x-opennext-cache": "HIT",
    etag
  };
}
async function generateResult(event, localizedPath, cachedValue, lastModified) {
  debug("Returning result from experimental cache");
  let body = "";
  let type = "application/octet-stream";
  let isDataRequest = false;
  switch (cachedValue.type) {
    case "app":
      isDataRequest = Boolean(event.headers.rsc);
      body = isDataRequest ? cachedValue.rsc : cachedValue.html;
      type = isDataRequest ? "text/x-component" : "text/html; charset=utf-8";
      break;
    case "page":
      isDataRequest = Boolean(event.query.__nextDataReq);
      body = isDataRequest ? JSON.stringify(cachedValue.json) : cachedValue.html;
      type = isDataRequest ? "application/json" : "text/html; charset=utf-8";
      break;
  }
  const cacheControl = await computeCacheControl(localizedPath, body, event.headers.host, cachedValue.revalidate, lastModified);
  return {
    type: "core",
    // sometimes other status codes can be cached, like 404. For these cases, we should return the correct status code
    statusCode: cachedValue.meta?.status ?? 200,
    body: toReadableStream(body, false),
    isBase64Encoded: false,
    headers: {
      ...cacheControl,
      "content-type": type,
      ...cachedValue.meta?.headers,
      vary: VARY_HEADER
    }
  };
}
function escapePathDelimiters(segment, escapeEncoded) {
  return segment.replace(new RegExp(`([/#?]${escapeEncoded ? "|%(2f|23|3f|5c)" : ""})`, "gi"), (char) => encodeURIComponent(char));
}
function decodePathParams(pathname) {
  return pathname.split("/").map((segment) => {
    try {
      return escapePathDelimiters(decodeURIComponent(segment), true);
    } catch (e) {
      return segment;
    }
  }).join("/");
}
async function cacheInterceptor(event) {
  if (Boolean(event.headers["next-action"]) || Boolean(event.headers["x-prerender-revalidate"]))
    return event;
  let localizedPath = localizePath(event);
  if (NextConfig.basePath) {
    localizedPath = localizedPath.replace(NextConfig.basePath, "");
  }
  localizedPath = localizedPath.replace(/\/$/, "");
  localizedPath = decodePathParams(localizedPath);
  debug("Checking cache for", localizedPath, PrerenderManifest);
  const isISR = Object.keys(PrerenderManifest.routes).includes(localizedPath ?? "/") || Object.values(PrerenderManifest.dynamicRoutes).some((dr) => new RegExp(dr.routeRegex).test(localizedPath));
  debug("isISR", isISR);
  if (isISR) {
    try {
      const cachedData = await globalThis.incrementalCache.get(localizedPath ?? "/index");
      debug("cached data in interceptor", cachedData);
      if (!cachedData?.value) {
        return event;
      }
      if (cachedData.value?.type === "app") {
        const tags = getTagsFromValue(cachedData.value);
        const _hasBeenRevalidated = await hasBeenRevalidated(localizedPath, tags, cachedData);
        if (_hasBeenRevalidated) {
          return event;
        }
      }
      const host = event.headers.host;
      switch (cachedData?.value?.type) {
        case "app":
        case "page":
          return generateResult(event, localizedPath, cachedData.value, cachedData.lastModified);
        case "redirect": {
          const cacheControl = await computeCacheControl(localizedPath, "", host, cachedData.value.revalidate, cachedData.lastModified);
          return {
            type: "core",
            statusCode: cachedData.value.meta?.status ?? 307,
            body: emptyReadableStream(),
            headers: {
              ...cachedData.value.meta?.headers ?? {},
              ...cacheControl
            },
            isBase64Encoded: false
          };
        }
        default:
          return event;
      }
    } catch (e) {
      debug("Error while fetching cache", e);
      return event;
    }
  }
  return event;
}

// node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
function parse2(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path3 = "";
  var tryConsume = function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  };
  var mustConsume = function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  };
  var consumeText = function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  };
  var isSafe = function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  };
  var safePattern = function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  };
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path3 += prefix;
        prefix = "";
      }
      if (path3) {
        result.push(path3);
        path3 = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path3 += value;
      continue;
    }
    if (path3) {
      result.push(path3);
      path3 = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
function compile(str, options) {
  return tokensToFunction(parse2(str, options), options);
}
function tokensToFunction(tokens, options) {
  if (options === void 0) {
    options = {};
  }
  var reFlags = flags(options);
  var _a = options.encode, encode = _a === void 0 ? function(x) {
    return x;
  } : _a, _b = options.validate, validate = _b === void 0 ? true : _b;
  var matches = tokens.map(function(token) {
    if (typeof token === "object") {
      return new RegExp("^(?:".concat(token.pattern, ")$"), reFlags);
    }
  });
  return function(data) {
    var path3 = "";
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      if (typeof token === "string") {
        path3 += token;
        continue;
      }
      var value = data ? data[token.name] : void 0;
      var optional = token.modifier === "?" || token.modifier === "*";
      var repeat = token.modifier === "*" || token.modifier === "+";
      if (Array.isArray(value)) {
        if (!repeat) {
          throw new TypeError('Expected "'.concat(token.name, '" to not repeat, but got an array'));
        }
        if (value.length === 0) {
          if (optional)
            continue;
          throw new TypeError('Expected "'.concat(token.name, '" to not be empty'));
        }
        for (var j = 0; j < value.length; j++) {
          var segment = encode(value[j], token);
          if (validate && !matches[i].test(segment)) {
            throw new TypeError('Expected all "'.concat(token.name, '" to match "').concat(token.pattern, '", but got "').concat(segment, '"'));
          }
          path3 += token.prefix + segment + token.suffix;
        }
        continue;
      }
      if (typeof value === "string" || typeof value === "number") {
        var segment = encode(String(value), token);
        if (validate && !matches[i].test(segment)) {
          throw new TypeError('Expected "'.concat(token.name, '" to match "').concat(token.pattern, '", but got "').concat(segment, '"'));
        }
        path3 += token.prefix + segment + token.suffix;
        continue;
      }
      if (optional)
        continue;
      var typeOfMessage = repeat ? "an array" : "a string";
      throw new TypeError('Expected "'.concat(token.name, '" to be ').concat(typeOfMessage));
    }
    return path3;
  };
}
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path3 = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    };
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path: path3, index, params };
  };
}
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
function regexpToRegexp(path3, keys) {
  if (!keys)
    return path3;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path3.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path3.source);
  }
  return path3;
}
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path3) {
    return pathToRegexp(path3, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
function stringToRegexp(path3, keys, options) {
  return tokensToRegexp(parse2(path3, options), keys, options);
}
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
function pathToRegexp(path3, keys, options) {
  if (path3 instanceof RegExp)
    return regexpToRegexp(path3, keys);
  if (Array.isArray(path3))
    return arrayToRegexp(path3, keys, options);
  return stringToRegexp(path3, keys, options);
}

// node_modules/@opennextjs/aws/dist/utils/normalize-path.js
import path2 from "node:path";
function normalizeRepeatedSlashes(url) {
  const urlNoQuery = url.host + url.pathname;
  return `${url.protocol}//${urlNoQuery.replace(/\\/g, "/").replace(/\/\/+/g, "/")}${url.search}`;
}

// node_modules/@opennextjs/aws/dist/core/routing/matcher.js
init_stream();
init_logger();

// node_modules/@opennextjs/aws/dist/core/routing/routeMatcher.js
var optionalLocalePrefixRegex = `^/(?:${RoutesManifest.locales.map((locale) => `${locale}/?`).join("|")})?`;
var optionalBasepathPrefixRegex = RoutesManifest.basePath ? `^${RoutesManifest.basePath}/?` : "^/";
var optionalPrefix = optionalLocalePrefixRegex.replace("^/", optionalBasepathPrefixRegex);
function routeMatcher(routeDefinitions) {
  const regexp = routeDefinitions.map((route) => ({
    page: route.page,
    regexp: new RegExp(route.regex.replace("^/", optionalPrefix))
  }));
  const appPathsSet = /* @__PURE__ */ new Set();
  const routePathsSet = /* @__PURE__ */ new Set();
  for (const [k, v] of Object.entries(AppPathRoutesManifest)) {
    if (k.endsWith("page")) {
      appPathsSet.add(v);
    } else if (k.endsWith("route")) {
      routePathsSet.add(v);
    }
  }
  return function matchRoute(path3) {
    const foundRoutes = regexp.filter((route) => route.regexp.test(path3));
    return foundRoutes.map((foundRoute) => {
      let routeType = "page";
      if (appPathsSet.has(foundRoute.page)) {
        routeType = "app";
      } else if (routePathsSet.has(foundRoute.page)) {
        routeType = "route";
      }
      return {
        route: foundRoute.page,
        type: routeType
      };
    });
  };
}
var staticRouteMatcher = routeMatcher([
  ...RoutesManifest.routes.static,
  ...getStaticAPIRoutes()
]);
var dynamicRouteMatcher = routeMatcher(RoutesManifest.routes.dynamic);
function getStaticAPIRoutes() {
  const createRouteDefinition = (route) => ({
    page: route,
    regex: `^${route}(?:/)?$`
  });
  const dynamicRoutePages = new Set(RoutesManifest.routes.dynamic.map(({ page }) => page));
  const pagesStaticAPIRoutes = Object.keys(PagesManifest).filter((route) => route.startsWith("/api/") && !dynamicRoutePages.has(route)).map(createRouteDefinition);
  const appPathsStaticAPIRoutes = Object.values(AppPathRoutesManifest).filter((route) => route.startsWith("/api/") || route === "/api" && !dynamicRoutePages.has(route)).map(createRouteDefinition);
  return [...pagesStaticAPIRoutes, ...appPathsStaticAPIRoutes];
}

// node_modules/@opennextjs/aws/dist/core/routing/matcher.js
var routeHasMatcher = (headers, cookies, query) => (redirect) => {
  switch (redirect.type) {
    case "header":
      return !!headers?.[redirect.key.toLowerCase()] && new RegExp(redirect.value ?? "").test(headers[redirect.key.toLowerCase()] ?? "");
    case "cookie":
      return !!cookies?.[redirect.key] && new RegExp(redirect.value ?? "").test(cookies[redirect.key] ?? "");
    case "query":
      return query[redirect.key] && Array.isArray(redirect.value) ? redirect.value.reduce((prev, current) => prev || new RegExp(current).test(query[redirect.key]), false) : new RegExp(redirect.value ?? "").test(query[redirect.key] ?? "");
    case "host":
      return headers?.host !== "" && new RegExp(redirect.value ?? "").test(headers.host);
    default:
      return false;
  }
};
function checkHas(matcher, has, inverted = false) {
  return has ? has.reduce((acc, cur) => {
    if (acc === false)
      return false;
    return inverted ? !matcher(cur) : matcher(cur);
  }, true) : true;
}
var getParamsFromSource = (source) => (value) => {
  debug("value", value);
  const _match = source(value);
  return _match ? _match.params : {};
};
var computeParamHas = (headers, cookies, query) => (has) => {
  if (!has.value)
    return {};
  const matcher = new RegExp(`^${has.value}$`);
  const fromSource = (value) => {
    const matches = value.match(matcher);
    return matches?.groups ?? {};
  };
  switch (has.type) {
    case "header":
      return fromSource(headers[has.key.toLowerCase()] ?? "");
    case "cookie":
      return fromSource(cookies[has.key] ?? "");
    case "query":
      return Array.isArray(query[has.key]) ? fromSource(query[has.key].join(",")) : fromSource(query[has.key] ?? "");
    case "host":
      return fromSource(headers.host ?? "");
  }
};
function convertMatch(match2, toDestination, destination) {
  if (!match2) {
    return destination;
  }
  const { params } = match2;
  const isUsingParams = Object.keys(params).length > 0;
  return isUsingParams ? toDestination(params) : destination;
}
function getNextConfigHeaders(event, configHeaders) {
  if (!configHeaders) {
    return {};
  }
  const matcher = routeHasMatcher(event.headers, event.cookies, event.query);
  const requestHeaders = {};
  const localizedRawPath = localizePath(event);
  for (const { headers, has, missing, regex, source, locale } of configHeaders) {
    const path3 = locale === false ? event.rawPath : localizedRawPath;
    if (new RegExp(regex).test(path3) && checkHas(matcher, has) && checkHas(matcher, missing, true)) {
      const fromSource = match(source);
      const _match = fromSource(path3);
      headers.forEach((h) => {
        try {
          const key = convertMatch(_match, compile(h.key), h.key);
          const value = convertMatch(_match, compile(h.value), h.value);
          requestHeaders[key] = value;
        } catch {
          debug(`Error matching header ${h.key} with value ${h.value}`);
          requestHeaders[h.key] = h.value;
        }
      });
    }
  }
  return requestHeaders;
}
function handleRewrites(event, rewrites) {
  const { rawPath, headers, query, cookies, url } = event;
  const localizedRawPath = localizePath(event);
  const matcher = routeHasMatcher(headers, cookies, query);
  const computeHas = computeParamHas(headers, cookies, query);
  const rewrite = rewrites.find((route) => {
    const path3 = route.locale === false ? rawPath : localizedRawPath;
    return new RegExp(route.regex).test(path3) && checkHas(matcher, route.has) && checkHas(matcher, route.missing, true);
  });
  let finalQuery = query;
  let rewrittenUrl = url;
  const isExternalRewrite = isExternal(rewrite?.destination);
  debug("isExternalRewrite", isExternalRewrite);
  if (rewrite) {
    const { pathname, protocol, hostname, queryString } = getUrlParts(rewrite.destination, isExternalRewrite);
    const pathToUse = rewrite.locale === false ? rawPath : localizedRawPath;
    debug("urlParts", { pathname, protocol, hostname, queryString });
    const toDestinationPath = compile(escapeRegex(pathname, { isPath: true }));
    const toDestinationHost = compile(escapeRegex(hostname));
    const toDestinationQuery = compile(escapeRegex(queryString));
    const params = {
      // params for the source
      ...getParamsFromSource(match(escapeRegex(rewrite.source, { isPath: true })))(pathToUse),
      // params for the has
      ...rewrite.has?.reduce((acc, cur) => {
        return Object.assign(acc, computeHas(cur));
      }, {}),
      // params for the missing
      ...rewrite.missing?.reduce((acc, cur) => {
        return Object.assign(acc, computeHas(cur));
      }, {})
    };
    const isUsingParams = Object.keys(params).length > 0;
    let rewrittenQuery = queryString;
    let rewrittenHost = hostname;
    let rewrittenPath = pathname;
    if (isUsingParams) {
      rewrittenPath = unescapeRegex(toDestinationPath(params));
      rewrittenHost = unescapeRegex(toDestinationHost(params));
      rewrittenQuery = unescapeRegex(toDestinationQuery(params));
    }
    if (NextConfig.i18n && !isExternalRewrite) {
      const strippedPathLocale = rewrittenPath.replace(new RegExp(`^/(${NextConfig.i18n.locales.join("|")})`), "");
      if (strippedPathLocale.startsWith("/api/")) {
        rewrittenPath = strippedPathLocale;
      }
    }
    rewrittenUrl = isExternalRewrite ? `${protocol}//${rewrittenHost}${rewrittenPath}` : new URL(rewrittenPath, event.url).href;
    finalQuery = {
      ...query,
      ...convertFromQueryString(rewrittenQuery)
    };
    rewrittenUrl += convertToQueryString(finalQuery);
    debug("rewrittenUrl", { rewrittenUrl, finalQuery, isUsingParams });
  }
  return {
    internalEvent: {
      ...event,
      query: finalQuery,
      rawPath: new URL(rewrittenUrl).pathname,
      url: rewrittenUrl
    },
    __rewrite: rewrite,
    isExternalRewrite
  };
}
function handleRepeatedSlashRedirect(event) {
  if (event.rawPath.match(/(\\|\/\/)/)) {
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: normalizeRepeatedSlashes(new URL(event.url))
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
  return false;
}
function handleTrailingSlashRedirect(event) {
  const url = new URL(event.rawPath, "http://localhost");
  if (
    // Someone is trying to redirect to a different origin, let's not do that
    url.host !== "localhost" || NextConfig.skipTrailingSlashRedirect || // We should not apply trailing slash redirect to API routes
    event.rawPath.startsWith("/api/")
  ) {
    return false;
  }
  const emptyBody = emptyReadableStream();
  if (NextConfig.trailingSlash && !event.headers["x-nextjs-data"] && !event.rawPath.endsWith("/") && !event.rawPath.match(/[\w-]+\.[\w]+$/g)) {
    const headersLocation = event.url.split("?");
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: `${headersLocation[0]}/${headersLocation[1] ? `?${headersLocation[1]}` : ""}`
      },
      body: emptyBody,
      isBase64Encoded: false
    };
  }
  if (!NextConfig.trailingSlash && event.rawPath.endsWith("/") && event.rawPath !== "/") {
    const headersLocation = event.url.split("?");
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: `${headersLocation[0].replace(/\/$/, "")}${headersLocation[1] ? `?${headersLocation[1]}` : ""}`
      },
      body: emptyBody,
      isBase64Encoded: false
    };
  }
  return false;
}
function handleRedirects(event, redirects) {
  const repeatedSlashRedirect = handleRepeatedSlashRedirect(event);
  if (repeatedSlashRedirect)
    return repeatedSlashRedirect;
  const trailingSlashRedirect = handleTrailingSlashRedirect(event);
  if (trailingSlashRedirect)
    return trailingSlashRedirect;
  const localeRedirect = handleLocaleRedirect(event);
  if (localeRedirect)
    return localeRedirect;
  const { internalEvent, __rewrite } = handleRewrites(event, redirects.filter((r) => !r.internal));
  if (__rewrite && !__rewrite.internal) {
    return {
      type: event.type,
      statusCode: __rewrite.statusCode ?? 308,
      headers: {
        Location: internalEvent.url
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
}
function fixDataPage(internalEvent, buildId) {
  const { rawPath, query } = internalEvent;
  const basePath = NextConfig.basePath ?? "";
  const dataPattern = `${basePath}/_next/data/${buildId}`;
  if (rawPath.startsWith("/_next/data") && !rawPath.startsWith(dataPattern)) {
    return {
      type: internalEvent.type,
      statusCode: 404,
      body: toReadableStream("{}"),
      headers: {
        "Content-Type": "application/json"
      },
      isBase64Encoded: false
    };
  }
  if (rawPath.startsWith(dataPattern) && rawPath.endsWith(".json")) {
    const newPath = `${basePath}${rawPath.slice(dataPattern.length, -".json".length).replace(/^\/index$/, "/")}`;
    query.__nextDataReq = "1";
    return {
      ...internalEvent,
      rawPath: newPath,
      query,
      url: new URL(`${newPath}${convertToQueryString(query)}`, internalEvent.url).href
    };
  }
  return internalEvent;
}
function handleFallbackFalse(internalEvent, prerenderManifest) {
  const { rawPath } = internalEvent;
  const { dynamicRoutes, routes } = prerenderManifest;
  const prerenderedFallbackRoutes = Object.entries(dynamicRoutes).filter(([, { fallback }]) => fallback === false);
  const routeFallback = prerenderedFallbackRoutes.some(([, { routeRegex }]) => {
    const routeRegexExp = new RegExp(routeRegex);
    return routeRegexExp.test(rawPath);
  });
  const locales = NextConfig.i18n?.locales;
  const routesAlreadyHaveLocale = locales?.includes(rawPath.split("/")[1]) || // If we don't use locales, we don't need to add the default locale
  locales === void 0;
  let localizedPath = routesAlreadyHaveLocale ? rawPath : `/${NextConfig.i18n?.defaultLocale}${rawPath}`;
  if (
    // Not if localizedPath is "/" tho, because that would not make it find `isPregenerated` below since it would be try to match an empty string.
    localizedPath !== "/" && NextConfig.trailingSlash && localizedPath.endsWith("/")
  ) {
    localizedPath = localizedPath.slice(0, -1);
  }
  const matchedStaticRoute = staticRouteMatcher(localizedPath);
  const prerenderedFallbackRoutesName = prerenderedFallbackRoutes.map(([name]) => name);
  const matchedDynamicRoute = dynamicRouteMatcher(localizedPath).filter(({ route }) => !prerenderedFallbackRoutesName.includes(route));
  const isPregenerated = Object.keys(routes).includes(localizedPath);
  if (routeFallback && !isPregenerated && matchedStaticRoute.length === 0 && matchedDynamicRoute.length === 0) {
    return {
      event: {
        ...internalEvent,
        rawPath: "/404",
        url: constructNextUrl(internalEvent.url, "/404"),
        headers: {
          ...internalEvent.headers,
          "x-invoke-status": "404"
        }
      },
      isISR: false
    };
  }
  return {
    event: internalEvent,
    isISR: routeFallback || isPregenerated
  };
}

// node_modules/@opennextjs/aws/dist/core/routing/middleware.js
init_stream();
init_utils();
var middlewareManifest = MiddlewareManifest;
var functionsConfigManifest = FunctionsConfigManifest;
var middleMatch = getMiddlewareMatch(middlewareManifest, functionsConfigManifest);
function defaultMiddlewareLoader() {
  return Promise.resolve().then(() => (init_edgeFunctionHandler(), edgeFunctionHandler_exports));
}
async function handleMiddleware(internalEvent, initialSearch, middlewareLoader = defaultMiddlewareLoader) {
  const headers = internalEvent.headers;
  if (headers["x-isr"] && headers["x-prerender-revalidate"] === PrerenderManifest.preview.previewModeId)
    return internalEvent;
  const normalizedPath = localizePath(internalEvent);
  const hasMatch = middleMatch.some((r) => r.test(normalizedPath));
  if (!hasMatch)
    return internalEvent;
  const initialUrl = new URL(normalizedPath, internalEvent.url);
  initialUrl.search = initialSearch;
  const url = initialUrl.href;
  const middleware = await middlewareLoader();
  const result = await middleware.default({
    // `geo` is pre Next 15.
    geo: {
      // The city name is percent-encoded.
      // See https://github.com/vercel/vercel/blob/4cb6143/packages/functions/src/headers.ts#L94C19-L94C37
      city: decodeURIComponent(headers["x-open-next-city"]),
      country: headers["x-open-next-country"],
      region: headers["x-open-next-region"],
      latitude: headers["x-open-next-latitude"],
      longitude: headers["x-open-next-longitude"]
    },
    headers,
    method: internalEvent.method || "GET",
    nextConfig: {
      basePath: NextConfig.basePath,
      i18n: NextConfig.i18n,
      trailingSlash: NextConfig.trailingSlash
    },
    url,
    body: convertBodyToReadableStream(internalEvent.method, internalEvent.body)
  });
  const statusCode = result.status;
  const responseHeaders = result.headers;
  const reqHeaders = {};
  const resHeaders = {};
  const filteredHeaders = [
    "x-middleware-override-headers",
    "x-middleware-next",
    "x-middleware-rewrite",
    // We need to drop `content-encoding` because it will be decoded
    "content-encoding"
  ];
  const xMiddlewareKey = "x-middleware-request-";
  responseHeaders.forEach((value, key) => {
    if (key.startsWith(xMiddlewareKey)) {
      const k = key.substring(xMiddlewareKey.length);
      reqHeaders[k] = value;
    } else {
      if (filteredHeaders.includes(key.toLowerCase()))
        return;
      if (key.toLowerCase() === "set-cookie") {
        resHeaders[key] = resHeaders[key] ? [...resHeaders[key], value] : [value];
      } else {
        resHeaders[key] = value;
      }
    }
  });
  const rewriteUrl = responseHeaders.get("x-middleware-rewrite");
  let isExternalRewrite = false;
  let middlewareQuery = internalEvent.query;
  let newUrl = internalEvent.url;
  if (rewriteUrl) {
    newUrl = rewriteUrl;
    if (isExternal(newUrl, internalEvent.headers.host)) {
      isExternalRewrite = true;
    } else {
      const rewriteUrlObject = new URL(rewriteUrl);
      middlewareQuery = getQueryFromSearchParams(rewriteUrlObject.searchParams);
      if ("__nextDataReq" in internalEvent.query) {
        middlewareQuery.__nextDataReq = internalEvent.query.__nextDataReq;
      }
    }
  }
  if (!rewriteUrl && !responseHeaders.get("x-middleware-next")) {
    const body = result.body ?? emptyReadableStream();
    return {
      type: internalEvent.type,
      statusCode,
      headers: resHeaders,
      body,
      isBase64Encoded: false
    };
  }
  return {
    responseHeaders: resHeaders,
    url: newUrl,
    rawPath: new URL(newUrl).pathname,
    type: internalEvent.type,
    headers: { ...internalEvent.headers, ...reqHeaders },
    body: internalEvent.body,
    method: internalEvent.method,
    query: middlewareQuery,
    cookies: internalEvent.cookies,
    remoteAddress: internalEvent.remoteAddress,
    isExternalRewrite
  };
}

// node_modules/@opennextjs/aws/dist/core/routingHandler.js
var MIDDLEWARE_HEADER_PREFIX = "x-middleware-response-";
var MIDDLEWARE_HEADER_PREFIX_LEN = MIDDLEWARE_HEADER_PREFIX.length;
var INTERNAL_HEADER_PREFIX = "x-opennext-";
var INTERNAL_HEADER_INITIAL_URL = `${INTERNAL_HEADER_PREFIX}initial-url`;
var INTERNAL_HEADER_LOCALE = `${INTERNAL_HEADER_PREFIX}locale`;
var INTERNAL_HEADER_RESOLVED_ROUTES = `${INTERNAL_HEADER_PREFIX}resolved-routes`;
var INTERNAL_EVENT_REQUEST_ID = `${INTERNAL_HEADER_PREFIX}request-id`;
var geoHeaderToNextHeader = {
  "x-open-next-city": "x-vercel-ip-city",
  "x-open-next-country": "x-vercel-ip-country",
  "x-open-next-region": "x-vercel-ip-country-region",
  "x-open-next-latitude": "x-vercel-ip-latitude",
  "x-open-next-longitude": "x-vercel-ip-longitude"
};
function applyMiddlewareHeaders(eventOrResult, middlewareHeaders) {
  const isResult = isInternalResult(eventOrResult);
  const headers = eventOrResult.headers;
  const keyPrefix = isResult ? "" : MIDDLEWARE_HEADER_PREFIX;
  Object.entries(middlewareHeaders).forEach(([key, value]) => {
    if (value) {
      headers[keyPrefix + key] = Array.isArray(value) ? value.join(",") : value;
    }
  });
}
async function routingHandler(event, { assetResolver }) {
  try {
    for (const [openNextGeoName, nextGeoName] of Object.entries(geoHeaderToNextHeader)) {
      const value = event.headers[openNextGeoName];
      if (value) {
        event.headers[nextGeoName] = value;
      }
    }
    for (const key of Object.keys(event.headers)) {
      if (key.startsWith(INTERNAL_HEADER_PREFIX) || key.startsWith(MIDDLEWARE_HEADER_PREFIX)) {
        delete event.headers[key];
      }
    }
    let headers = getNextConfigHeaders(event, ConfigHeaders);
    let eventOrResult = fixDataPage(event, BuildId);
    if (isInternalResult(eventOrResult)) {
      return eventOrResult;
    }
    const redirect = handleRedirects(eventOrResult, RoutesManifest.redirects);
    if (redirect) {
      redirect.headers.Location = new URL(redirect.headers.Location).href;
      debug("redirect", redirect);
      return redirect;
    }
    const middlewareEventOrResult = await handleMiddleware(
      eventOrResult,
      // We need to pass the initial search without any decoding
      // TODO: we'd need to refactor InternalEvent to include the initial querystring directly
      // Should be done in another PR because it is a breaking change
      new URL(event.url).search
    );
    if (isInternalResult(middlewareEventOrResult)) {
      return middlewareEventOrResult;
    }
    headers = {
      ...middlewareEventOrResult.responseHeaders,
      ...headers
    };
    let isExternalRewrite = middlewareEventOrResult.isExternalRewrite ?? false;
    eventOrResult = middlewareEventOrResult;
    if (!isExternalRewrite) {
      const beforeRewrite = handleRewrites(eventOrResult, RoutesManifest.rewrites.beforeFiles);
      eventOrResult = beforeRewrite.internalEvent;
      isExternalRewrite = beforeRewrite.isExternalRewrite;
      if (!isExternalRewrite) {
        const assetResult = await assetResolver?.maybeGetAssetResult?.(eventOrResult);
        if (assetResult) {
          applyMiddlewareHeaders(assetResult, headers);
          return assetResult;
        }
      }
    }
    const foundStaticRoute = staticRouteMatcher(eventOrResult.rawPath);
    const isStaticRoute = !isExternalRewrite && foundStaticRoute.length > 0;
    if (!(isStaticRoute || isExternalRewrite)) {
      const afterRewrite = handleRewrites(eventOrResult, RoutesManifest.rewrites.afterFiles);
      eventOrResult = afterRewrite.internalEvent;
      isExternalRewrite = afterRewrite.isExternalRewrite;
    }
    let isISR = false;
    if (!isExternalRewrite) {
      const fallbackResult = handleFallbackFalse(eventOrResult, PrerenderManifest);
      eventOrResult = fallbackResult.event;
      isISR = fallbackResult.isISR;
    }
    const foundDynamicRoute = dynamicRouteMatcher(eventOrResult.rawPath);
    const isDynamicRoute = !isExternalRewrite && foundDynamicRoute.length > 0;
    if (!(isDynamicRoute || isStaticRoute || isExternalRewrite)) {
      const fallbackRewrites = handleRewrites(eventOrResult, RoutesManifest.rewrites.fallback);
      eventOrResult = fallbackRewrites.internalEvent;
      isExternalRewrite = fallbackRewrites.isExternalRewrite;
    }
    const isNextImageRoute = eventOrResult.rawPath.startsWith("/_next/image");
    const isRouteFoundBeforeAllRewrites = isStaticRoute || isDynamicRoute || isExternalRewrite;
    if (!(isRouteFoundBeforeAllRewrites || isNextImageRoute || // We need to check again once all rewrites have been applied
    staticRouteMatcher(eventOrResult.rawPath).length > 0 || dynamicRouteMatcher(eventOrResult.rawPath).length > 0)) {
      eventOrResult = {
        ...eventOrResult,
        rawPath: "/404",
        url: constructNextUrl(eventOrResult.url, "/404"),
        headers: {
          ...eventOrResult.headers,
          "x-middleware-response-cache-control": "private, no-cache, no-store, max-age=0, must-revalidate"
        }
      };
    }
    if (globalThis.openNextConfig.dangerous?.enableCacheInterception && !isInternalResult(eventOrResult)) {
      debug("Cache interception enabled");
      eventOrResult = await cacheInterceptor(eventOrResult);
      if (isInternalResult(eventOrResult)) {
        applyMiddlewareHeaders(eventOrResult, headers);
        return eventOrResult;
      }
    }
    applyMiddlewareHeaders(eventOrResult, headers);
    const resolvedRoutes = [
      ...foundStaticRoute,
      ...foundDynamicRoute
    ];
    debug("resolvedRoutes", resolvedRoutes);
    return {
      internalEvent: eventOrResult,
      isExternalRewrite,
      origin: false,
      isISR,
      resolvedRoutes,
      initialURL: event.url,
      locale: NextConfig.i18n ? detectLocale(eventOrResult, NextConfig.i18n) : void 0
    };
  } catch (e) {
    error("Error in routingHandler", e);
    return {
      internalEvent: {
        type: "core",
        method: "GET",
        rawPath: "/500",
        url: constructNextUrl(event.url, "/500"),
        headers: {
          ...event.headers
        },
        query: event.query,
        cookies: event.cookies,
        remoteAddress: event.remoteAddress
      },
      isExternalRewrite: false,
      origin: false,
      isISR: false,
      resolvedRoutes: [],
      initialURL: event.url,
      locale: NextConfig.i18n ? detectLocale(event, NextConfig.i18n) : void 0
    };
  }
}
function isInternalResult(eventOrResult) {
  return eventOrResult != null && "statusCode" in eventOrResult;
}

// node_modules/@opennextjs/aws/dist/adapters/middleware.js
globalThis.internalFetch = fetch;
globalThis.__openNextAls = new AsyncLocalStorage();
var defaultHandler = async (internalEvent, options) => {
  const config = globalThis.openNextConfig.middleware;
  const originResolver = await resolveOriginResolver(config?.originResolver);
  const externalRequestProxy = await resolveProxyRequest(config?.override?.proxyExternalRequest);
  const assetResolver = await resolveAssetResolver(config?.assetResolver);
  const requestId = Math.random().toString(36);
  return runWithOpenNextRequestContext({
    isISRRevalidation: internalEvent.headers["x-isr"] === "1",
    waitUntil: options?.waitUntil,
    requestId
  }, async () => {
    const result = await routingHandler(internalEvent, { assetResolver });
    if ("internalEvent" in result) {
      debug("Middleware intercepted event", internalEvent);
      if (!result.isExternalRewrite) {
        const origin = await originResolver.resolve(result.internalEvent.rawPath);
        return {
          type: "middleware",
          internalEvent: {
            ...result.internalEvent,
            headers: {
              ...result.internalEvent.headers,
              [INTERNAL_HEADER_INITIAL_URL]: internalEvent.url,
              [INTERNAL_HEADER_RESOLVED_ROUTES]: JSON.stringify(result.resolvedRoutes),
              [INTERNAL_EVENT_REQUEST_ID]: requestId
            }
          },
          isExternalRewrite: result.isExternalRewrite,
          origin,
          isISR: result.isISR,
          initialURL: result.initialURL,
          resolvedRoutes: result.resolvedRoutes
        };
      }
      try {
        return externalRequestProxy.proxy(result.internalEvent);
      } catch (e) {
        error("External request failed.", e);
        return {
          type: "middleware",
          internalEvent: {
            ...result.internalEvent,
            headers: {
              ...result.internalEvent.headers,
              [INTERNAL_EVENT_REQUEST_ID]: requestId
            },
            rawPath: "/500",
            url: constructNextUrl(result.internalEvent.url, "/500"),
            method: "GET"
          },
          // On error we need to rewrite to the 500 page which is an internal rewrite
          isExternalRewrite: false,
          origin: false,
          isISR: result.isISR,
          initialURL: result.internalEvent.url,
          resolvedRoutes: [{ route: "/500", type: "page" }]
        };
      }
    }
    result.headers[INTERNAL_EVENT_REQUEST_ID] = requestId;
    debug("Middleware response", result);
    return result;
  });
};
var handler2 = await createGenericHandler({
  handler: defaultHandler,
  type: "middleware"
});
var middleware_default = {
  fetch: handler2
};
export {
  middleware_default as default,
  handler2 as handler
};
