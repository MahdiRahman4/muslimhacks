var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// node_modules/@clerk/shared/dist/_chunks/runtimeEnvironment-CTVGzENl.mjs
var automatedEnvironmentVariables = [
  "CI",
  "CONTINUOUS_INTEGRATION",
  "GITHUB_ACTIONS",
  "GITLAB_CI",
  "CIRCLECI",
  "TRAVIS",
  "BUILDKITE",
  "BITBUCKET_BUILD_NUMBER",
  "APPVEYOR",
  "CODEBUILD_BUILD_ID",
  "TF_BUILD",
  "TEAMCITY_VERSION",
  "JENKINS_URL",
  "HUDSON_URL",
  "BAMBOO_BUILDKEY",
  "CF_PAGES"
];
var isTestEnvironment = /* @__PURE__ */ __name(() => {
  try {
    return false;
  } catch {
  }
  return false;
}, "isTestEnvironment");
var isProductionEnvironment = /* @__PURE__ */ __name(() => {
  try {
    return false;
  } catch {
  }
  return false;
}, "isProductionEnvironment");

// node_modules/@clerk/shared/dist/deprecated.mjs
var displayedWarnings = /* @__PURE__ */ new Set();
var deprecated = /* @__PURE__ */ __name((fnName, warning, key) => {
  const hideWarning = isTestEnvironment() || isProductionEnvironment();
  const messageId = key ?? fnName;
  if (displayedWarnings.has(messageId) || hideWarning) return;
  displayedWarnings.add(messageId);
  console.warn(`Clerk - DEPRECATION WARNING: "${fnName}" is deprecated and will be removed in the next major release.
${warning}`);
}, "deprecated");

// node_modules/@clerk/shared/dist/constants.mjs
var LEGACY_DEV_INSTANCE_SUFFIXES = [
  ".lcl.dev",
  ".lclstage.dev",
  ".lclclerk.com"
];
var CURRENT_DEV_INSTANCE_SUFFIXES = [
  ".accounts.dev",
  ".accountsstage.dev",
  ".accounts.lclclerk.com"
];
var DEV_OR_STAGING_SUFFIXES = [
  ".lcl.dev",
  ".stg.dev",
  ".lclstage.dev",
  ".stgstage.dev",
  ".dev.lclclerk.com",
  ".stg.lclclerk.com",
  ".accounts.lclclerk.com",
  "accountsstage.dev",
  "accounts.dev"
];

// node_modules/@clerk/shared/dist/isomorphicAtob.mjs
var isomorphicAtob = /* @__PURE__ */ __name((data) => {
  if (typeof atob !== "undefined" && typeof atob === "function") return atob(data);
  else if (typeof globalThis.Buffer !== "undefined") return globalThis.Buffer.from(data, "base64").toString();
  return data;
}, "isomorphicAtob");

// node_modules/@clerk/shared/dist/isomorphicBtoa.mjs
var isomorphicBtoa = /* @__PURE__ */ __name((data) => {
  if (typeof btoa !== "undefined" && typeof btoa === "function") return btoa(data);
  else if (typeof globalThis.Buffer !== "undefined") return globalThis.Buffer.from(data).toString("base64");
  return data;
}, "isomorphicBtoa");

// node_modules/@clerk/shared/dist/keys.mjs
var PUBLISHABLE_KEY_LIVE_PREFIX = "pk_live_";
var PUBLISHABLE_KEY_TEST_PREFIX = "pk_test_";
function isValidDecodedPublishableKey(decoded) {
  if (!decoded.endsWith("$")) return false;
  const withoutTrailing = decoded.slice(0, -1);
  if (withoutTrailing.includes("$")) return false;
  return withoutTrailing.includes(".");
}
__name(isValidDecodedPublishableKey, "isValidDecodedPublishableKey");
function parsePublishableKey(key, options = {}) {
  key = key || "";
  if (!key || !isPublishableKey(key)) {
    if (options.fatal && !key) throw new Error("Publishable key is missing. Ensure that your publishable key is correctly configured. Double-check your environment configuration for your keys, or access them here: https://dashboard.clerk.com/last-active?path=api-keys");
    if (options.fatal && !isPublishableKey(key)) throw new Error("Publishable key not valid.");
    return null;
  }
  const instanceType = key.startsWith(PUBLISHABLE_KEY_LIVE_PREFIX) ? "production" : "development";
  let decodedFrontendApi;
  try {
    decodedFrontendApi = isomorphicAtob(key.split("_")[2]);
  } catch {
    if (options.fatal) throw new Error("Publishable key not valid: Failed to decode key.");
    return null;
  }
  if (!isValidDecodedPublishableKey(decodedFrontendApi)) {
    if (options.fatal) throw new Error("Publishable key not valid: Decoded key has invalid format.");
    return null;
  }
  let frontendApi = decodedFrontendApi.slice(0, -1);
  if (options.proxyUrl) frontendApi = options.proxyUrl;
  else if (instanceType !== "development" && options.domain && options.isSatellite) frontendApi = `clerk.${options.domain}`;
  return {
    instanceType,
    frontendApi
  };
}
__name(parsePublishableKey, "parsePublishableKey");
function isPublishableKey(key = "") {
  try {
    if (!(key.startsWith(PUBLISHABLE_KEY_LIVE_PREFIX) || key.startsWith(PUBLISHABLE_KEY_TEST_PREFIX))) return false;
    const parts = key.split("_");
    if (parts.length !== 3) return false;
    const encodedPart = parts[2];
    if (!encodedPart) return false;
    return isValidDecodedPublishableKey(isomorphicAtob(encodedPart));
  } catch {
    return false;
  }
}
__name(isPublishableKey, "isPublishableKey");
function createDevOrStagingUrlCache() {
  const devOrStagingUrlCache = /* @__PURE__ */ new Map();
  return {
    /**
    * Checks if a URL is a development or staging environment.
    *
    * @param url - The URL to check (string or URL object).
    * @returns `true` if the URL is a development or staging environment, `false` otherwise.
    */
    isDevOrStagingUrl: /* @__PURE__ */ __name((url) => {
      if (!url) return false;
      const hostname = typeof url === "string" ? url : url.hostname;
      let res = devOrStagingUrlCache.get(hostname);
      if (res === void 0) {
        res = DEV_OR_STAGING_SUFFIXES.some((s2) => hostname.endsWith(s2));
        devOrStagingUrlCache.set(hostname, res);
      }
      return res;
    }, "isDevOrStagingUrl")
  };
}
__name(createDevOrStagingUrlCache, "createDevOrStagingUrlCache");
function isProductionFromPublishableKey(apiKey) {
  return apiKey.startsWith("live_") || apiKey.startsWith("pk_live_");
}
__name(isProductionFromPublishableKey, "isProductionFromPublishableKey");
function isDevelopmentFromSecretKey(apiKey) {
  return apiKey.startsWith("test_") || apiKey.startsWith("sk_test_");
}
__name(isDevelopmentFromSecretKey, "isDevelopmentFromSecretKey");
async function getCookieSuffix(publishableKey, subtle = globalThis.crypto.subtle) {
  const data = new TextEncoder().encode(publishableKey);
  const digest = await subtle.digest("sha-1", data);
  return isomorphicBtoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/gi, "-").replace(/\//gi, "_").substring(0, 8);
}
__name(getCookieSuffix, "getCookieSuffix");
var getSuffixedCookieName = /* @__PURE__ */ __name((cookieName, cookieSuffix) => {
  return `${cookieName}_${cookieSuffix}`;
}, "getSuffixedCookieName");

// node_modules/@clerk/shared/dist/retry.mjs
var defaultOptions = {
  initialDelay: 125,
  maxDelayBetweenRetries: 0,
  factor: 2,
  shouldRetry: /* @__PURE__ */ __name((_2, iteration) => iteration < 5, "shouldRetry"),
  retryImmediately: false,
  jitter: true
};
var RETRY_IMMEDIATELY_DELAY = 100;
var sleep = /* @__PURE__ */ __name(async (ms) => new Promise((s2) => setTimeout(s2, ms)), "sleep");
var applyJitter = /* @__PURE__ */ __name((delay, jitter) => {
  return jitter ? delay * (1 + Math.random()) : delay;
}, "applyJitter");
var createExponentialDelayAsyncFn = /* @__PURE__ */ __name((opts) => {
  let timesCalled = 0;
  const calculateDelayInMs = /* @__PURE__ */ __name(() => {
    const constant = opts.initialDelay;
    const base = opts.factor;
    let delay = constant * Math.pow(base, timesCalled);
    delay = applyJitter(delay, opts.jitter);
    return Math.min(opts.maxDelayBetweenRetries || delay, delay);
  }, "calculateDelayInMs");
  return async () => {
    await sleep(calculateDelayInMs());
    timesCalled++;
  };
}, "createExponentialDelayAsyncFn");
var retry = /* @__PURE__ */ __name(async (callback, options = {}) => {
  let iterations = 0;
  const { shouldRetry, initialDelay, maxDelayBetweenRetries, factor, retryImmediately, jitter, onBeforeRetry } = {
    ...defaultOptions,
    ...options
  };
  const delay = createExponentialDelayAsyncFn({
    initialDelay,
    maxDelayBetweenRetries,
    factor,
    jitter
  });
  while (true) try {
    return await callback();
  } catch (e) {
    iterations++;
    if (!shouldRetry(e, iterations)) throw e;
    if (onBeforeRetry) await onBeforeRetry(iterations);
    if (retryImmediately && iterations === 1) await sleep(applyJitter(RETRY_IMMEDIATELY_DELAY, jitter));
    else await delay();
  }
}, "retry");

// node_modules/@clerk/shared/dist/url.mjs
function isLegacyDevAccountPortalOrigin(host) {
  return LEGACY_DEV_INSTANCE_SUFFIXES.some((legacyDevSuffix) => {
    return host.startsWith("accounts.") && host.endsWith(legacyDevSuffix);
  });
}
__name(isLegacyDevAccountPortalOrigin, "isLegacyDevAccountPortalOrigin");
function isCurrentDevAccountPortalOrigin(host) {
  return CURRENT_DEV_INSTANCE_SUFFIXES.some((currentDevSuffix) => {
    return host.endsWith(currentDevSuffix) && !host.endsWith(".clerk" + currentDevSuffix);
  });
}
__name(isCurrentDevAccountPortalOrigin, "isCurrentDevAccountPortalOrigin");

// node_modules/@clerk/shared/dist/_chunks/clerkRuntimeError-DlesLWqO.mjs
function createErrorTypeGuard(ErrorClass) {
  function typeGuard(error) {
    const target = error ?? this;
    if (!target) throw new TypeError(`${ErrorClass.kind || ErrorClass.name} type guard requires an error object`);
    if (ErrorClass.kind && typeof target === "object" && target !== null && "constructor" in target) {
      if (target.constructor?.kind === ErrorClass.kind) return true;
    }
    return target instanceof ErrorClass;
  }
  __name(typeGuard, "typeGuard");
  return typeGuard;
}
__name(createErrorTypeGuard, "createErrorTypeGuard");
var ClerkError = class ClerkError2 extends Error {
  static {
    __name(this, "ClerkError");
  }
  static kind = "ClerkError";
  clerkError = true;
  code;
  longMessage;
  docsUrl;
  cause;
  get name() {
    return this.constructor.name;
  }
  constructor(opts) {
    super(new.target.formatMessage(new.target.kind, opts.message, opts.code, opts.docsUrl), { cause: opts.cause });
    Object.setPrototypeOf(this, ClerkError2.prototype);
    this.code = opts.code;
    this.docsUrl = opts.docsUrl;
    this.longMessage = opts.longMessage;
    this.cause = opts.cause;
  }
  toString() {
    return `[${this.name}]
Message:${this.message}`;
  }
  static formatMessage(name, msg, code, docsUrl) {
    const prefix = "Clerk:";
    const regex = new RegExp(prefix.replace(" ", "\\s*"), "i");
    msg = msg.replace(regex, "");
    msg = `${prefix} ${msg.trim()}

(code="${code}")

`;
    if (docsUrl) msg += `

Docs: ${docsUrl}`;
    return msg;
  }
};
var ClerkRuntimeError = class ClerkRuntimeError2 extends ClerkError {
  static {
    __name(this, "ClerkRuntimeError");
  }
  static kind = "ClerkRuntimeError";
  /**
  * @deprecated Use `clerkError` property instead. This property is maintained for backward compatibility.
  */
  clerkRuntimeError = true;
  constructor(message, options) {
    super({
      ...options,
      message
    });
    Object.setPrototypeOf(this, ClerkRuntimeError2.prototype);
  }
};
var isClerkRuntimeError = createErrorTypeGuard(ClerkRuntimeError);

// node_modules/@clerk/shared/dist/_chunks/error-uYOdvTDm.mjs
var ClerkAPIError = class {
  static {
    __name(this, "ClerkAPIError");
  }
  static kind = "ClerkAPIError";
  code;
  message;
  longMessage;
  meta;
  constructor(json) {
    const parsedError = {
      code: json.code,
      message: json.message,
      longMessage: json.long_message,
      meta: {
        paramName: json.meta?.param_name,
        sessionId: json.meta?.session_id,
        emailAddresses: json.meta?.email_addresses,
        identifiers: json.meta?.identifiers,
        zxcvbn: json.meta?.zxcvbn,
        plan: json.meta?.plan,
        isPlanUpgradePossible: json.meta?.is_plan_upgrade_possible,
        seatsQuantityToAdd: json.meta?.seats_quantity_to_add,
        seatsQuantity: json.meta?.seats_quantity
      }
    };
    this.code = parsedError.code;
    this.message = parsedError.message;
    this.longMessage = parsedError.longMessage;
    this.meta = parsedError.meta;
  }
};
var isClerkAPIError = createErrorTypeGuard(ClerkAPIError);
function parseError(error) {
  return new ClerkAPIError(error);
}
__name(parseError, "parseError");
var ClerkAPIResponseError = class ClerkAPIResponseError2 extends ClerkError {
  static {
    __name(this, "ClerkAPIResponseError");
  }
  static kind = "ClerkAPIResponseError";
  status;
  clerkTraceId;
  retryAfter;
  errors;
  constructor(message, options) {
    const { data: errorsJson, status, clerkTraceId, retryAfter } = options;
    super({
      ...options,
      message,
      code: "api_response_error"
    });
    Object.setPrototypeOf(this, ClerkAPIResponseError2.prototype);
    this.status = status;
    this.clerkTraceId = clerkTraceId;
    this.retryAfter = retryAfter;
    this.errors = (errorsJson || []).map((e) => new ClerkAPIError(e));
  }
  toString() {
    let message = `[${this.name}]
Message:${this.message}
Status:${this.status}
Serialized errors: ${this.errors.map((e) => JSON.stringify(e))}`;
    if (this.clerkTraceId) message += `
Clerk Trace ID: ${this.clerkTraceId}`;
    return message;
  }
  static formatMessage(name, msg, _2, __) {
    return msg;
  }
};
var isClerkAPIResponseError = createErrorTypeGuard(ClerkAPIResponseError);
var DefaultMessages = Object.freeze({
  InvalidProxyUrlErrorMessage: `The proxyUrl passed to Clerk is invalid. The expected value for proxyUrl is an absolute URL or a relative path with a leading '/'. (key={{url}})`,
  InvalidPublishableKeyErrorMessage: `The publishableKey passed to Clerk is invalid. You can get your Publishable key at https://dashboard.clerk.com/last-active?path=api-keys. (key={{key}})`,
  MissingPublishableKeyErrorMessage: `Missing publishableKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.`,
  MissingSecretKeyErrorMessage: `Missing secretKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.`,
  MissingClerkProvider: `{{source}} can only be used within the <ClerkProvider /> component. Learn more: https://clerk.com/docs/components/clerk-provider`
});
function buildErrorThrower({ packageName, customMessages }) {
  let pkg = packageName;
  function buildMessage(rawMessage, replacements) {
    if (!replacements) return `${pkg}: ${rawMessage}`;
    let msg = rawMessage;
    const matches2 = rawMessage.matchAll(/{{([a-zA-Z0-9-_]+)}}/g);
    for (const match2 of matches2) {
      const replacement = (replacements[match2[1]] || "").toString();
      msg = msg.replace(`{{${match2[1]}}}`, replacement);
    }
    return `${pkg}: ${msg}`;
  }
  __name(buildMessage, "buildMessage");
  const messages = {
    ...DefaultMessages,
    ...customMessages
  };
  return {
    setPackageName({ packageName: packageName2 }) {
      if (typeof packageName2 === "string") pkg = packageName2;
      return this;
    },
    setMessages({ customMessages: customMessages2 }) {
      Object.assign(messages, customMessages2 || {});
      return this;
    },
    throwInvalidPublishableKeyError(params) {
      throw new Error(buildMessage(messages.InvalidPublishableKeyErrorMessage, params));
    },
    throwInvalidProxyUrl(params) {
      throw new Error(buildMessage(messages.InvalidProxyUrlErrorMessage, params));
    },
    throwMissingPublishableKeyError() {
      throw new Error(buildMessage(messages.MissingPublishableKeyErrorMessage));
    },
    throwMissingSecretKeyError() {
      throw new Error(buildMessage(messages.MissingSecretKeyErrorMessage));
    },
    throwMissingClerkProviderError(params) {
      throw new Error(buildMessage(messages.MissingClerkProvider, params));
    },
    throw(message) {
      throw new Error(buildMessage(message));
    }
  };
}
__name(buildErrorThrower, "buildErrorThrower");

// node_modules/@clerk/backend/dist/chunk-YBVFDYDR.mjs
var errorThrower = buildErrorThrower({ packageName: "@clerk/backend" });
var { isDevOrStagingUrl } = createDevOrStagingUrlCache();

// node_modules/@clerk/backend/dist/chunk-RZ7A7F6X.mjs
var TokenVerificationErrorCode = {
  InvalidSecretKey: "clerk_key_invalid"
};
var TokenVerificationErrorReason = {
  TokenExpired: "token-expired",
  TokenInvalid: "token-invalid",
  TokenInvalidAlgorithm: "token-invalid-algorithm",
  TokenInvalidAuthorizedParties: "token-invalid-authorized-parties",
  TokenInvalidSignature: "token-invalid-signature",
  TokenNotActiveYet: "token-not-active-yet",
  TokenIatInTheFuture: "token-iat-in-the-future",
  TokenVerificationFailed: "token-verification-failed",
  InvalidSecretKey: "secret-key-invalid",
  LocalJWKMissing: "jwk-local-missing",
  RemoteJWKFailedToLoad: "jwk-remote-failed-to-load",
  RemoteJWKInvalid: "jwk-remote-invalid",
  RemoteJWKMissing: "jwk-remote-missing",
  JWKFailedToResolve: "jwk-failed-to-resolve",
  JWKKidMismatch: "jwk-kid-mismatch"
};
var TokenVerificationErrorAction = {
  ContactSupport: "Contact support@clerk.com",
  EnsureClerkJWT: "Make sure that this is a valid Clerk-generated JWT.",
  SetClerkJWTKey: "Set the CLERK_JWT_KEY environment variable.",
  SetClerkSecretKey: "Set the CLERK_SECRET_KEY environment variable.",
  EnsureClockSync: "Make sure your system clock is in sync (e.g. turn off and on automatic time synchronization)."
};
var TokenVerificationError = class _TokenVerificationError extends Error {
  static {
    __name(this, "_TokenVerificationError");
  }
  constructor({
    action,
    message,
    reason
  }) {
    super(message);
    Object.setPrototypeOf(this, _TokenVerificationError.prototype);
    this.reason = reason;
    this.message = message;
    this.action = action;
  }
  getFullMessage() {
    return `${[this.message, this.action].filter((m) => m).join(" ")} (reason=${this.reason}, token-carrier=${this.tokenCarrier})`;
  }
};
var MachineTokenVerificationErrorCode = {
  TokenInvalid: "token-invalid",
  InvalidSecretKey: "secret-key-invalid",
  UnexpectedError: "unexpected-error",
  TokenVerificationFailed: "token-verification-failed"
};
var _MachineTokenVerificationError = class _MachineTokenVerificationError2 extends ClerkError {
  static {
    __name(this, "_MachineTokenVerificationError");
  }
  constructor({
    message,
    code,
    status,
    action
  }) {
    super({ message, code });
    Object.setPrototypeOf(this, _MachineTokenVerificationError2.prototype);
    this.status = status;
    this.action = action;
  }
  // Keep message unformatted, matching ClerkAPIResponseError's approach
  static formatMessage(_name, msg, _code, _docsUrl) {
    return msg;
  }
  getFullMessage() {
    return `${this.message} (code=${this.code}, status=${this.status || "n/a"})`;
  }
};
_MachineTokenVerificationError.kind = "MachineTokenVerificationError";
var MachineTokenVerificationError = _MachineTokenVerificationError;

// node_modules/@clerk/backend/dist/runtime/browser/crypto.mjs
var webcrypto = crypto;

// node_modules/@clerk/backend/dist/chunk-7MALS3EJ.mjs
var globalFetch = fetch.bind(globalThis);
var runtime = {
  crypto: webcrypto,
  get fetch() {
    return false ? fetch : globalFetch;
  },
  AbortController: globalThis.AbortController,
  Blob: globalThis.Blob,
  FormData: globalThis.FormData,
  Headers: globalThis.Headers,
  Request: globalThis.Request,
  Response: globalThis.Response
};
var base64url = {
  parse(string, opts) {
    return parse(string, base64UrlEncoding, opts);
  },
  stringify(data, opts) {
    return stringify(data, base64UrlEncoding, opts);
  }
};
var base64UrlEncoding = {
  chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
  bits: 6
};
function parse(string, encoding, opts = {}) {
  if (!encoding.codes) {
    encoding.codes = {};
    for (let i = 0; i < encoding.chars.length; ++i) {
      encoding.codes[encoding.chars[i]] = i;
    }
  }
  if (!opts.loose && string.length * encoding.bits & 7) {
    throw new SyntaxError("Invalid padding");
  }
  let end = string.length;
  while (string[end - 1] === "=") {
    --end;
    if (!opts.loose && !((string.length - end) * encoding.bits & 7)) {
      throw new SyntaxError("Invalid padding");
    }
  }
  const out = new (opts.out ?? Uint8Array)(end * encoding.bits / 8 | 0);
  let bits = 0;
  let buffer = 0;
  let written = 0;
  for (let i = 0; i < end; ++i) {
    const value = encoding.codes[string[i]];
    if (value === void 0) {
      throw new SyntaxError("Invalid character " + string[i]);
    }
    buffer = buffer << encoding.bits | value;
    bits += encoding.bits;
    if (bits >= 8) {
      bits -= 8;
      out[written++] = 255 & buffer >> bits;
    }
  }
  if (bits >= encoding.bits || 255 & buffer << 8 - bits) {
    throw new SyntaxError("Unexpected end of data");
  }
  return out;
}
__name(parse, "parse");
function stringify(data, encoding, opts = {}) {
  const { pad = true } = opts;
  const mask = (1 << encoding.bits) - 1;
  let out = "";
  let bits = 0;
  let buffer = 0;
  for (let i = 0; i < data.length; ++i) {
    buffer = buffer << 8 | 255 & data[i];
    bits += 8;
    while (bits > encoding.bits) {
      bits -= encoding.bits;
      out += encoding.chars[mask & buffer >> bits];
    }
  }
  if (bits) {
    out += encoding.chars[mask & buffer << encoding.bits - bits];
  }
  if (pad) {
    while (out.length * encoding.bits & 7) {
      out += "=";
    }
  }
  return out;
}
__name(stringify, "stringify");
var algToHash = {
  RS256: "SHA-256",
  RS384: "SHA-384",
  RS512: "SHA-512"
};
var RSA_ALGORITHM_NAME = "RSASSA-PKCS1-v1_5";
var jwksAlgToCryptoAlg = {
  RS256: RSA_ALGORITHM_NAME,
  RS384: RSA_ALGORITHM_NAME,
  RS512: RSA_ALGORITHM_NAME
};
var algs = Object.keys(algToHash);
function getCryptoAlgorithm(algorithmName) {
  const hash = algToHash[algorithmName];
  const name = jwksAlgToCryptoAlg[algorithmName];
  if (!hash || !name) {
    throw new Error(`Unsupported algorithm ${algorithmName}, expected one of ${algs.join(",")}.`);
  }
  return {
    hash: { name: algToHash[algorithmName] },
    name: jwksAlgToCryptoAlg[algorithmName]
  };
}
__name(getCryptoAlgorithm, "getCryptoAlgorithm");
var isArrayString = /* @__PURE__ */ __name((s2) => {
  return Array.isArray(s2) && s2.length > 0 && s2.every((a) => typeof a === "string");
}, "isArrayString");
var assertAudienceClaim = /* @__PURE__ */ __name((aud, audience) => {
  const audienceList = [audience].flat().filter((a) => !!a);
  const audList = [aud].flat().filter((a) => !!a);
  const shouldVerifyAudience = audienceList.length > 0 && audList.length > 0;
  if (!shouldVerifyAudience) {
    return;
  }
  if (typeof aud === "string") {
    if (!audienceList.includes(aud)) {
      throw new TokenVerificationError({
        action: TokenVerificationErrorAction.EnsureClerkJWT,
        reason: TokenVerificationErrorReason.TokenVerificationFailed,
        message: `Invalid JWT audience claim (aud) ${JSON.stringify(aud)}. Is not included in "${JSON.stringify(
          audienceList
        )}".`
      });
    }
  } else if (isArrayString(aud)) {
    if (!aud.some((a) => audienceList.includes(a))) {
      throw new TokenVerificationError({
        action: TokenVerificationErrorAction.EnsureClerkJWT,
        reason: TokenVerificationErrorReason.TokenVerificationFailed,
        message: `Invalid JWT audience claim array (aud) ${JSON.stringify(aud)}. Is not included in "${JSON.stringify(
          audienceList
        )}".`
      });
    }
  }
}, "assertAudienceClaim");
var assertHeaderType = /* @__PURE__ */ __name((typ, allowedTypes) => {
  if (typeof typ === "undefined" && typeof allowedTypes === "undefined") {
    return;
  }
  const expectedTypes = allowedTypes ?? "JWT";
  const allowed = Array.isArray(expectedTypes) ? expectedTypes : [expectedTypes];
  if (!allowed.includes(typ)) {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.EnsureClerkJWT,
      reason: TokenVerificationErrorReason.TokenInvalid,
      message: `Invalid JWT type ${JSON.stringify(typ)}. Expected "${allowed.join(", ")}".`
    });
  }
}, "assertHeaderType");
var assertHeaderAlgorithm = /* @__PURE__ */ __name((alg) => {
  if (!algs.includes(alg)) {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.EnsureClerkJWT,
      reason: TokenVerificationErrorReason.TokenInvalidAlgorithm,
      message: `Invalid JWT algorithm ${JSON.stringify(alg)}. Supported: ${algs}.`
    });
  }
}, "assertHeaderAlgorithm");
var assertSubClaim = /* @__PURE__ */ __name((sub) => {
  if (typeof sub !== "string") {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.EnsureClerkJWT,
      reason: TokenVerificationErrorReason.TokenVerificationFailed,
      message: `Subject claim (sub) is required and must be a string. Received ${JSON.stringify(sub)}.`
    });
  }
}, "assertSubClaim");
var assertAuthorizedPartiesClaim = /* @__PURE__ */ __name((azp, authorizedParties) => {
  if (!authorizedParties || authorizedParties.length === 0) {
    return;
  }
  if (!azp || !authorizedParties.includes(azp)) {
    throw new TokenVerificationError({
      reason: TokenVerificationErrorReason.TokenInvalidAuthorizedParties,
      message: `Invalid JWT Authorized party claim (azp) ${JSON.stringify(azp)}. Expected "${authorizedParties}".`
    });
  }
}, "assertAuthorizedPartiesClaim");
var assertExpirationClaim = /* @__PURE__ */ __name((exp, clockSkewInMs) => {
  if (typeof exp !== "number") {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.EnsureClerkJWT,
      reason: TokenVerificationErrorReason.TokenVerificationFailed,
      message: `Invalid JWT expiry date claim (exp) ${JSON.stringify(exp)}. Expected number.`
    });
  }
  const currentDate = new Date(Date.now());
  const expiryDate = /* @__PURE__ */ new Date(0);
  expiryDate.setUTCSeconds(exp);
  const expired = expiryDate.getTime() <= currentDate.getTime() - clockSkewInMs;
  if (expired) {
    throw new TokenVerificationError({
      reason: TokenVerificationErrorReason.TokenExpired,
      message: `JWT is expired. Expiry date: ${expiryDate.toUTCString()}, Current date: ${currentDate.toUTCString()}.`
    });
  }
}, "assertExpirationClaim");
var assertActivationClaim = /* @__PURE__ */ __name((nbf, clockSkewInMs) => {
  if (typeof nbf === "undefined") {
    return;
  }
  if (typeof nbf !== "number") {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.EnsureClerkJWT,
      reason: TokenVerificationErrorReason.TokenVerificationFailed,
      message: `Invalid JWT not before date claim (nbf) ${JSON.stringify(nbf)}. Expected number.`
    });
  }
  const currentDate = new Date(Date.now());
  const notBeforeDate = /* @__PURE__ */ new Date(0);
  notBeforeDate.setUTCSeconds(nbf);
  const early = notBeforeDate.getTime() > currentDate.getTime() + clockSkewInMs;
  if (early) {
    throw new TokenVerificationError({
      reason: TokenVerificationErrorReason.TokenNotActiveYet,
      message: `JWT cannot be used prior to not before date claim (nbf). Not before date: ${notBeforeDate.toUTCString()}; Current date: ${currentDate.toUTCString()};`
    });
  }
}, "assertActivationClaim");
var assertIssuedAtClaim = /* @__PURE__ */ __name((iat, clockSkewInMs) => {
  if (typeof iat === "undefined") {
    return;
  }
  if (typeof iat !== "number") {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.EnsureClerkJWT,
      reason: TokenVerificationErrorReason.TokenVerificationFailed,
      message: `Invalid JWT issued at date claim (iat) ${JSON.stringify(iat)}. Expected number.`
    });
  }
  const currentDate = new Date(Date.now());
  const issuedAtDate = /* @__PURE__ */ new Date(0);
  issuedAtDate.setUTCSeconds(iat);
  const postIssued = issuedAtDate.getTime() > currentDate.getTime() + clockSkewInMs;
  if (postIssued) {
    throw new TokenVerificationError({
      reason: TokenVerificationErrorReason.TokenIatInTheFuture,
      message: `JWT issued at date claim (iat) is in the future. Issued at date: ${issuedAtDate.toUTCString()}; Current date: ${currentDate.toUTCString()};`
    });
  }
}, "assertIssuedAtClaim");
function pemToBuffer(secret) {
  const trimmed = secret.replace(/-----BEGIN.*?-----/g, "").replace(/-----END.*?-----/g, "").replace(/\s/g, "");
  const decoded = isomorphicAtob(trimmed);
  const buffer = new ArrayBuffer(decoded.length);
  const bufView = new Uint8Array(buffer);
  for (let i = 0, strLen = decoded.length; i < strLen; i++) {
    bufView[i] = decoded.charCodeAt(i);
  }
  return bufView;
}
__name(pemToBuffer, "pemToBuffer");
function importKey(key, algorithm, keyUsage) {
  if (typeof key === "object") {
    return runtime.crypto.subtle.importKey("jwk", key, algorithm, false, [keyUsage]);
  }
  const keyData = pemToBuffer(key);
  const format = keyUsage === "sign" ? "pkcs8" : "spki";
  return runtime.crypto.subtle.importKey(format, keyData, algorithm, false, [keyUsage]);
}
__name(importKey, "importKey");
var DEFAULT_CLOCK_SKEW_IN_MS = 5 * 1e3;
async function hasValidSignature(jwt, key) {
  const { header, signature, raw } = jwt;
  const encoder = new TextEncoder();
  const data = encoder.encode([raw.header, raw.payload].join("."));
  const algorithm = getCryptoAlgorithm(header.alg);
  try {
    const cryptoKey = await importKey(key, algorithm, "verify");
    const verified = await runtime.crypto.subtle.verify(
      algorithm.name,
      cryptoKey,
      signature,
      data
    );
    return { data: verified };
  } catch (error) {
    return {
      errors: [
        new TokenVerificationError({
          reason: TokenVerificationErrorReason.TokenInvalidSignature,
          message: error?.message
        })
      ]
    };
  }
}
__name(hasValidSignature, "hasValidSignature");
function decodeJwt(token) {
  const tokenParts = (token || "").toString().split(".");
  if (tokenParts.length !== 3) {
    return {
      errors: [
        new TokenVerificationError({
          reason: TokenVerificationErrorReason.TokenInvalid,
          message: `Invalid JWT form. A JWT consists of three parts separated by dots.`
        })
      ]
    };
  }
  const [rawHeader, rawPayload, rawSignature] = tokenParts;
  const decoder = new TextDecoder();
  const header = JSON.parse(decoder.decode(base64url.parse(rawHeader, { loose: true })));
  const payload = JSON.parse(decoder.decode(base64url.parse(rawPayload, { loose: true })));
  const signature = base64url.parse(rawSignature, { loose: true });
  const data = {
    header,
    payload,
    signature,
    raw: {
      header: rawHeader,
      payload: rawPayload,
      signature: rawSignature,
      text: token
    }
  };
  return { data };
}
__name(decodeJwt, "decodeJwt");
async function verifyJwt(token, options) {
  const { audience, authorizedParties, clockSkewInMs, key, headerType } = options;
  const clockSkew = typeof clockSkewInMs === "number" && Number.isFinite(clockSkewInMs) ? clockSkewInMs : DEFAULT_CLOCK_SKEW_IN_MS;
  const { data: decoded, errors } = decodeJwt(token);
  if (errors) {
    return { errors };
  }
  const { header, payload } = decoded;
  try {
    const { typ, alg } = header;
    assertHeaderType(typ, headerType);
    assertHeaderAlgorithm(alg);
  } catch (err) {
    return { errors: [err] };
  }
  const { data: signatureValid, errors: signatureErrors } = await hasValidSignature(decoded, key);
  if (signatureErrors) {
    return {
      errors: [
        new TokenVerificationError({
          action: TokenVerificationErrorAction.EnsureClerkJWT,
          reason: TokenVerificationErrorReason.TokenVerificationFailed,
          message: `Error verifying JWT signature. ${signatureErrors[0]}`
        })
      ]
    };
  }
  if (!signatureValid) {
    return {
      errors: [
        new TokenVerificationError({
          reason: TokenVerificationErrorReason.TokenInvalidSignature,
          message: "JWT signature is invalid."
        })
      ]
    };
  }
  try {
    const { azp, sub, aud, iat, exp, nbf } = payload;
    assertSubClaim(sub);
    assertAudienceClaim(aud, audience);
    assertAuthorizedPartiesClaim(azp, authorizedParties);
    assertExpirationClaim(exp, clockSkew);
    assertActivationClaim(nbf, clockSkew);
    assertIssuedAtClaim(iat, clockSkew);
  } catch (err) {
    return { errors: [err] };
  }
  return { data: payload };
}
__name(verifyJwt, "verifyJwt");

// node_modules/@clerk/backend/dist/chunk-TOROEX6P.mjs
var __create = Object.create;
var __defProp2 = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __typeError = /* @__PURE__ */ __name((msg) => {
  throw TypeError(msg);
}, "__typeError");
var __commonJS = /* @__PURE__ */ __name((cb, mod) => /* @__PURE__ */ __name(function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
}, "__require"), "__commonJS");
var __copyProps = /* @__PURE__ */ __name((to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp2(to, key, { get: /* @__PURE__ */ __name(() => from[key], "get"), enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
}, "__copyProps");
var __toESM = /* @__PURE__ */ __name((mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp2(target, "default", { value: mod, enumerable: true }) : target,
  mod
)), "__toESM");
var __accessCheck = /* @__PURE__ */ __name((obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg), "__accessCheck");
var __privateGet = /* @__PURE__ */ __name((obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj)), "__privateGet");
var __privateAdd = /* @__PURE__ */ __name((obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value), "__privateAdd");
var __privateSet = /* @__PURE__ */ __name((obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value), "__privateSet");
var __privateMethod = /* @__PURE__ */ __name((obj, member, method) => (__accessCheck(obj, member, "access private method"), method), "__privateMethod");

// node_modules/@clerk/shared/dist/buildAccountsBaseUrl.mjs
function buildAccountsBaseUrl(frontendApi) {
  if (!frontendApi) return "";
  return `https://${frontendApi.replace(/clerk\.accountsstage\./, "accountsstage.").replace(/clerk\.accounts\.|clerk\./, "accounts.")}`;
}
__name(buildAccountsBaseUrl, "buildAccountsBaseUrl");

// node_modules/@clerk/shared/dist/logger.mjs
var loggedMessages = /* @__PURE__ */ new Set();
var logger = {
  /**
  * A custom logger that ensures messages are logged only once.
  * Reduces noise and duplicated messages when logs are in a hot codepath.
  */
  warnOnce: /* @__PURE__ */ __name((msg) => {
    if (loggedMessages.has(msg)) return;
    loggedMessages.add(msg);
    console.warn(msg);
  }, "warnOnce"),
  logOnce: /* @__PURE__ */ __name((msg) => {
    if (loggedMessages.has(msg)) return;
    console.log(msg);
    loggedMessages.add(msg);
  }, "logOnce")
};

// node_modules/@clerk/shared/dist/proxy.mjs
var AUTO_PROXY_HOST_SUFFIXES = [".vercel.app"];
var AUTO_PROXY_PATH = "/__clerk";
function shouldAutoProxy(hostname) {
  return AUTO_PROXY_HOST_SUFFIXES.some((hostSuffix) => hostname?.endsWith(hostSuffix)) ?? false;
}
__name(shouldAutoProxy, "shouldAutoProxy");
function getDefaultEnvironment() {
  return typeof process !== "undefined" && process.env ? process.env : {};
}
__name(getDefaultEnvironment, "getDefaultEnvironment");
function normalizeHostname(hostnameOrUrl) {
  if (hostnameOrUrl.startsWith("http://") || hostnameOrUrl.startsWith("https://")) try {
    return new URL(hostnameOrUrl).hostname;
  } catch {
    return "";
  }
  return hostnameOrUrl.split("/")[0] || "";
}
__name(normalizeHostname, "normalizeHostname");
function getAutoProxyUrlFromEnvironment({ publishableKey, hasDomain = false, hasProxyUrl = false, environment = getDefaultEnvironment() }) {
  if (hasProxyUrl || hasDomain || !isProductionFromPublishableKey(publishableKey)) return "";
  if (environment.VERCEL_TARGET_ENV !== "production") return "";
  const vercelProductionHostname = environment.VERCEL_PROJECT_PRODUCTION_URL;
  if (!vercelProductionHostname || !shouldAutoProxy(normalizeHostname(vercelProductionHostname))) return "";
  return AUTO_PROXY_PATH;
}
__name(getAutoProxyUrlFromEnvironment, "getAutoProxyUrlFromEnvironment");

// node_modules/@clerk/shared/dist/authorization.mjs
var TYPES_TO_OBJECTS = {
  strict_mfa: {
    afterMinutes: 10,
    level: "multi_factor"
  },
  strict: {
    afterMinutes: 10,
    level: "second_factor"
  },
  moderate: {
    afterMinutes: 60,
    level: "second_factor"
  },
  lax: {
    afterMinutes: 1440,
    level: "second_factor"
  }
};
var ALLOWED_LEVELS = /* @__PURE__ */ new Set([
  "first_factor",
  "second_factor",
  "multi_factor"
]);
var ALLOWED_TYPES = /* @__PURE__ */ new Set([
  "strict_mfa",
  "strict",
  "moderate",
  "lax"
]);
var ORG_SCOPES = /* @__PURE__ */ new Set([
  "o",
  "org",
  "organization"
]);
var USER_SCOPES = /* @__PURE__ */ new Set(["u", "user"]);
var isValidMaxAge = /* @__PURE__ */ __name((maxAge) => typeof maxAge === "number" && maxAge > 0, "isValidMaxAge");
var isValidLevel = /* @__PURE__ */ __name((level) => ALLOWED_LEVELS.has(level), "isValidLevel");
var isValidVerificationType = /* @__PURE__ */ __name((type) => ALLOWED_TYPES.has(type), "isValidVerificationType");
var isValidFactorAge = /* @__PURE__ */ __name((x) => typeof x === "number" && Number.isFinite(x) && (x === -1 || x >= 0), "isValidFactorAge");
var prefixWithOrg = /* @__PURE__ */ __name((value) => value.replace(/^(org:)*/, "org:"), "prefixWithOrg");
var checkOrgAuthorization = /* @__PURE__ */ __name((params, options) => {
  const { orgId, orgRole, orgPermissions } = options;
  const roleAsked = params.role !== void 0;
  const permissionAsked = params.permission !== void 0;
  if (!roleAsked && !permissionAsked) return "skip";
  if (roleAsked && typeof params.role !== "string") return "fail";
  if (permissionAsked && typeof params.permission !== "string") return "fail";
  if (!orgId) return "fail";
  if (roleAsked) {
    if (typeof orgRole !== "string" || !orgRole) return "fail";
    if (prefixWithOrg(orgRole) !== prefixWithOrg(params.role)) return "fail";
  }
  if (permissionAsked) {
    if (!Array.isArray(orgPermissions)) return "fail";
    if (!orgPermissions.includes(prefixWithOrg(params.permission))) return "fail";
  }
  return "pass";
}, "checkOrgAuthorization");
var checkForFeatureOrPlan = /* @__PURE__ */ __name((claim, featureOrPlan) => {
  const { org: orgFeatures, user: userFeatures } = splitByScope(claim);
  const [rawScope, rawId] = featureOrPlan.split(":");
  const hasExplicitScope = rawId !== void 0;
  const scope = rawScope;
  const id = rawId || rawScope;
  if (hasExplicitScope && !ORG_SCOPES.has(scope) && !USER_SCOPES.has(scope)) throw new Error(`Invalid scope: ${scope}`);
  if (hasExplicitScope) {
    if (ORG_SCOPES.has(scope)) return orgFeatures.includes(id);
    if (USER_SCOPES.has(scope)) return userFeatures.includes(id);
  }
  return [...orgFeatures, ...userFeatures].includes(id);
}, "checkForFeatureOrPlan");
var checkBillingAuthorization = /* @__PURE__ */ __name((params, options) => {
  const { features, plans } = options;
  const featureAsked = params.feature !== void 0;
  const planAsked = params.plan !== void 0;
  if (!featureAsked && !planAsked) return "skip";
  if (featureAsked && typeof params.feature !== "string") return "fail";
  if (planAsked && typeof params.plan !== "string") return "fail";
  if (featureAsked) {
    if (typeof features !== "string" || !features) return "fail";
    try {
      if (!checkForFeatureOrPlan(features, params.feature)) return "fail";
    } catch {
      return "fail";
    }
  }
  if (planAsked) {
    if (typeof plans !== "string" || !plans) return "fail";
    try {
      if (!checkForFeatureOrPlan(plans, params.plan)) return "fail";
    } catch {
      return "fail";
    }
  }
  return "pass";
}, "checkBillingAuthorization");
var splitByScope = /* @__PURE__ */ __name((fea) => {
  const org = [];
  const user = [];
  if (!fea) return {
    org,
    user
  };
  const parts = fea.split(",");
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    const colonIndex = part.indexOf(":");
    if (colonIndex === -1) throw new Error(`Invalid claim element (missing colon): ${part}`);
    const scope = part.slice(0, colonIndex);
    const value = part.slice(colonIndex + 1);
    if (scope === "o") org.push(value);
    else if (scope === "u") user.push(value);
    else if (scope === "ou" || scope === "uo") {
      org.push(value);
      user.push(value);
    }
  }
  return {
    org,
    user
  };
}, "splitByScope");
var validateReverificationConfig = /* @__PURE__ */ __name((config) => {
  if (!config) return false;
  const convertConfigToObject = /* @__PURE__ */ __name((config2) => {
    if (typeof config2 === "string") return TYPES_TO_OBJECTS[config2];
    return config2;
  }, "convertConfigToObject");
  const isValidStringValue = typeof config === "string" && isValidVerificationType(config);
  const isValidObjectValue = typeof config === "object" && isValidLevel(config.level) && isValidMaxAge(config.afterMinutes);
  if (isValidStringValue || isValidObjectValue) return convertConfigToObject.bind(null, config);
  return false;
}, "validateReverificationConfig");
var checkReverificationAuthorization = /* @__PURE__ */ __name((params, { factorVerificationAge }) => {
  if (params.reverification === void 0) return "skip";
  if (!factorVerificationAge) return "fail";
  if (!Array.isArray(factorVerificationAge) || factorVerificationAge.length !== 2 || !isValidFactorAge(factorVerificationAge[0]) || !isValidFactorAge(factorVerificationAge[1])) return "fail";
  const getConfig = validateReverificationConfig(params.reverification);
  if (!getConfig) return "fail";
  const { level, afterMinutes } = getConfig();
  const [factor1Age, factor2Age] = factorVerificationAge;
  if (factor1Age === -1 && factor2Age === -1) return "fail";
  const factor1FreshEnough = factor1Age !== -1 && afterMinutes > factor1Age;
  const factor2FreshEnough = factor2Age !== -1 && afterMinutes > factor2Age;
  switch (level) {
    case "first_factor":
      return factor1FreshEnough ? "pass" : "fail";
    case "second_factor":
      if (factor2Age === -1) return factor1FreshEnough ? "pass" : "fail";
      if (factor1Age === -1) return factor2FreshEnough ? "pass" : "fail";
      return factor2FreshEnough ? "pass" : "fail";
    case "multi_factor":
      if (factor2Age === -1) return factor1FreshEnough ? "pass" : "fail";
      if (factor1Age === -1) return "fail";
      return factor1FreshEnough && factor2FreshEnough ? "pass" : "fail";
  }
}, "checkReverificationAuthorization");
var combine = /* @__PURE__ */ __name((results) => results.some((r) => r === "pass") && results.every((r) => r === "pass" || r === "skip"), "combine");
var createCheckAuthorization = /* @__PURE__ */ __name((options) => {
  return (params) => {
    if (!options.userId) return false;
    return combine([
      checkOrgAuthorization(params, options),
      checkBillingAuthorization(params, options),
      checkReverificationAuthorization(params, options)
    ]);
  };
}, "createCheckAuthorization");

// node_modules/@clerk/shared/dist/jwtPayloadParser.mjs
var parsePermissions = /* @__PURE__ */ __name(({ per, fpm }) => {
  if (!per || !fpm) return {
    permissions: [],
    featurePermissionMap: []
  };
  const permissions = per.split(",").map((p) => p.trim());
  return {
    permissions,
    featurePermissionMap: fpm.split(",").map((permission) => Number.parseInt(permission.trim(), 10)).map((permission) => permission.toString(2).padStart(permissions.length, "0").split("").map((bit) => Number.parseInt(bit, 10)).reverse()).filter(Boolean)
  };
}, "parsePermissions");
function buildOrgPermissions({ features, permissions, featurePermissionMap }) {
  if (!features || !permissions || !featurePermissionMap) return [];
  const orgPermissions = [];
  for (let featureIndex = 0; featureIndex < features.length; featureIndex++) {
    const feature = features[featureIndex];
    if (featureIndex >= featurePermissionMap.length) continue;
    const permissionBits = featurePermissionMap[featureIndex];
    if (!permissionBits) continue;
    for (let permIndex = 0; permIndex < permissionBits.length; permIndex++) if (permissionBits[permIndex] === 1) orgPermissions.push(`org:${feature}:${permissions[permIndex]}`);
  }
  return orgPermissions;
}
__name(buildOrgPermissions, "buildOrgPermissions");
var __experimental_JWTPayloadToAuthObjectProperties = /* @__PURE__ */ __name((claims) => {
  let orgId;
  let orgRole;
  let orgSlug;
  let orgPermissions;
  const factorVerificationAge = claims.fva ?? null;
  const sessionStatus = claims.sts ?? null;
  switch (claims.v) {
    case 2:
      if (claims.o) {
        orgId = claims.o?.id;
        orgSlug = claims.o?.slg;
        if (claims.o?.rol) orgRole = `org:${claims.o?.rol}`;
        const { org } = splitByScope(claims.fea);
        const { permissions, featurePermissionMap } = parsePermissions({
          per: claims.o?.per,
          fpm: claims.o?.fpm
        });
        orgPermissions = buildOrgPermissions({
          features: org,
          featurePermissionMap,
          permissions
        });
      }
      break;
    default:
      orgId = claims.org_id;
      orgRole = claims.org_role;
      orgSlug = claims.org_slug;
      orgPermissions = claims.org_permissions;
      break;
  }
  return {
    sessionClaims: claims,
    sessionId: claims.sid,
    sessionStatus,
    actor: claims.act,
    userId: claims.sub,
    orgId,
    orgRole,
    orgSlug,
    orgPermissions,
    factorVerificationAge
  };
}, "__experimental_JWTPayloadToAuthObjectProperties");

// node_modules/@clerk/shared/dist/_chunks/pathToRegexp-C-7qTA7_.mjs
function _(r) {
  for (var n = [], e = 0; e < r.length; ) {
    var a = r[e];
    if (a === "*" || a === "+" || a === "?") {
      n.push({
        type: "MODIFIER",
        index: e,
        value: r[e++]
      });
      continue;
    }
    if (a === "\\") {
      n.push({
        type: "ESCAPED_CHAR",
        index: e++,
        value: r[e++]
      });
      continue;
    }
    if (a === "{") {
      n.push({
        type: "OPEN",
        index: e,
        value: r[e++]
      });
      continue;
    }
    if (a === "}") {
      n.push({
        type: "CLOSE",
        index: e,
        value: r[e++]
      });
      continue;
    }
    if (a === ":") {
      for (var u = "", t = e + 1; t < r.length; ) {
        var c = r.charCodeAt(t);
        if (c >= 48 && c <= 57 || c >= 65 && c <= 90 || c >= 97 && c <= 122 || c === 95) {
          u += r[t++];
          continue;
        }
        break;
      }
      if (!u) throw new TypeError("Missing parameter name at ".concat(e));
      n.push({
        type: "NAME",
        index: e,
        value: u
      }), e = t;
      continue;
    }
    if (a === "(") {
      var o = 1, m = "", t = e + 1;
      if (r[t] === "?") throw new TypeError('Pattern cannot start with "?" at '.concat(t));
      for (; t < r.length; ) {
        if (r[t] === "\\") {
          m += r[t++] + r[t++];
          continue;
        }
        if (r[t] === ")") {
          if (o--, o === 0) {
            t++;
            break;
          }
        } else if (r[t] === "(" && (o++, r[t + 1] !== "?")) throw new TypeError("Capturing groups are not allowed at ".concat(t));
        m += r[t++];
      }
      if (o) throw new TypeError("Unbalanced pattern at ".concat(e));
      if (!m) throw new TypeError("Missing pattern at ".concat(e));
      n.push({
        type: "PATTERN",
        index: e,
        value: m
      }), e = t;
      continue;
    }
    n.push({
      type: "CHAR",
      index: e,
      value: r[e++]
    });
  }
  return n.push({
    type: "END",
    index: e,
    value: ""
  }), n;
}
__name(_, "_");
function F(r, n) {
  n === void 0 && (n = {});
  for (var e = _(r), a = n.prefixes, u = a === void 0 ? "./" : a, t = n.delimiter, c = t === void 0 ? "/#?" : t, o = [], m = 0, h = 0, p = "", f = function(l) {
    if (h < e.length && e[h].type === l) return e[h++].value;
  }, w = function(l) {
    var v = f(l);
    if (v !== void 0) return v;
    var E = e[h], N = E.type, S = E.index;
    throw new TypeError("Unexpected ".concat(N, " at ").concat(S, ", expected ").concat(l));
  }, d = function() {
    for (var l = "", v; v = f("CHAR") || f("ESCAPED_CHAR"); ) l += v;
    return l;
  }, M = function(l) {
    for (var v = 0, E = c; v < E.length; v++) {
      var N = E[v];
      if (l.indexOf(N) > -1) return true;
    }
    return false;
  }, A = function(l) {
    var v = o[o.length - 1], E = l || (v && typeof v == "string" ? v : "");
    if (v && !E) throw new TypeError('Must have text between two parameters, missing text after "'.concat(v.name, '"'));
    return !E || M(E) ? "[^".concat(s(c), "]+?") : "(?:(?!".concat(s(E), ")[^").concat(s(c), "])+?");
  }; h < e.length; ) {
    var T = f("CHAR"), x = f("NAME"), C = f("PATTERN");
    if (x || C) {
      var g = T || "";
      u.indexOf(g) === -1 && (p += g, g = ""), p && (o.push(p), p = ""), o.push({
        name: x || m++,
        prefix: g,
        suffix: "",
        pattern: C || A(g),
        modifier: f("MODIFIER") || ""
      });
      continue;
    }
    var i = T || f("ESCAPED_CHAR");
    if (i) {
      p += i;
      continue;
    }
    p && (o.push(p), p = "");
    if (f("OPEN")) {
      var g = d(), y = f("NAME") || "", O = f("PATTERN") || "", b = d();
      w("CLOSE"), o.push({
        name: y || (O ? m++ : ""),
        pattern: y && !O ? A(g) : O,
        prefix: g,
        suffix: b,
        modifier: f("MODIFIER") || ""
      });
      continue;
    }
    w("END");
  }
  return o;
}
__name(F, "F");
function H(r, n) {
  var e = [];
  return I(P(r, e, n), e, n);
}
__name(H, "H");
function I(r, n, e) {
  e === void 0 && (e = {});
  var a = e.decode, u = a === void 0 ? function(t) {
    return t;
  } : a;
  return function(t) {
    var c = r.exec(t);
    if (!c) return false;
    for (var o = c[0], m = c.index, h = /* @__PURE__ */ Object.create(null), p = function(w) {
      if (c[w] === void 0) return "continue";
      var d = n[w - 1];
      d.modifier === "*" || d.modifier === "+" ? h[d.name] = c[w].split(d.prefix + d.suffix).map(function(M) {
        return u(M, d);
      }) : h[d.name] = u(c[w], d);
    }, f = 1; f < c.length; f++) p(f);
    return {
      path: o,
      index: m,
      params: h
    };
  };
}
__name(I, "I");
function s(r) {
  return r.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(s, "s");
function D(r) {
  return r && r.sensitive ? "" : "i";
}
__name(D, "D");
function $(r, n) {
  if (!n) return r;
  for (var e = /\((?:\?<(.*?)>)?(?!\?)/g, a = 0, u = e.exec(r.source); u; ) n.push({
    name: u[1] || a++,
    prefix: "",
    suffix: "",
    modifier: "",
    pattern: ""
  }), u = e.exec(r.source);
  return r;
}
__name($, "$");
function W(r, n, e) {
  var a = r.map(function(u) {
    return P(u, n, e).source;
  });
  return new RegExp("(?:".concat(a.join("|"), ")"), D(e));
}
__name(W, "W");
function L(r, n, e) {
  return U(F(r, e), n, e);
}
__name(L, "L");
function U(r, n, e) {
  e === void 0 && (e = {});
  for (var a = e.strict, u = a === void 0 ? false : a, t = e.start, c = t === void 0 ? true : t, o = e.end, m = o === void 0 ? true : o, h = e.encode, p = h === void 0 ? function(v) {
    return v;
  } : h, f = e.delimiter, w = f === void 0 ? "/#?" : f, d = e.endsWith, M = d === void 0 ? "" : d, A = "[".concat(s(M), "]|$"), T = "[".concat(s(w), "]"), x = c ? "^" : "", C = 0, g = r; C < g.length; C++) {
    var i = g[C];
    if (typeof i == "string") x += s(p(i));
    else {
      var R = s(p(i.prefix)), y = s(p(i.suffix));
      if (i.pattern) if (n && n.push(i), R || y) if (i.modifier === "+" || i.modifier === "*") {
        var O = i.modifier === "*" ? "?" : "";
        x += "(?:".concat(R, "((?:").concat(i.pattern, ")(?:").concat(y).concat(R, "(?:").concat(i.pattern, "))*)").concat(y, ")").concat(O);
      } else x += "(?:".concat(R, "(").concat(i.pattern, ")").concat(y, ")").concat(i.modifier);
      else {
        if (i.modifier === "+" || i.modifier === "*") throw new TypeError('Can not repeat "'.concat(i.name, '" without a prefix and suffix'));
        x += "(".concat(i.pattern, ")").concat(i.modifier);
      }
      else x += "(?:".concat(R).concat(y, ")").concat(i.modifier);
    }
  }
  if (m) u || (x += "".concat(T, "?")), x += e.endsWith ? "(?=".concat(A, ")") : "$";
  else {
    var b = r[r.length - 1], l = typeof b == "string" ? T.indexOf(b[b.length - 1]) > -1 : b === void 0;
    u || (x += "(?:".concat(T, "(?=").concat(A, "))?")), l || (x += "(?=".concat(T, "|").concat(A, ")"));
  }
  return new RegExp(x, D(e));
}
__name(U, "U");
function P(r, n, e) {
  return r instanceof RegExp ? $(r, n) : Array.isArray(r) ? W(r, n, e) : L(r, n, e);
}
__name(P, "P");
function match(str, options) {
  try {
    return H(str, options);
  } catch (e) {
    throw new Error(`Invalid path and options: Consult the documentation of path-to-regexp here: https://github.com/pillarjs/path-to-regexp/tree/6.x
${e.message}`);
  }
}
__name(match, "match");

// node_modules/@clerk/backend/dist/chunk-GTRASVNY.mjs
var require_dist = __commonJS({
  "../../node_modules/.pnpm/cookie@1.1.1/node_modules/cookie/dist/index.js"(exports) {
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
      const C = /* @__PURE__ */ __name(function() {
      }, "C");
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
    __name(parseCookie, "parseCookie");
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
    __name(stringifyCookie, "stringifyCookie");
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
    __name(stringifySetCookie, "stringifySetCookie");
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
    __name(parseSetCookie, "parseSetCookie");
    function endIndex(str, min, len) {
      const index = str.indexOf(";", min);
      return index === -1 ? len : index;
    }
    __name(endIndex, "endIndex");
    function eqIndex(str, min, max) {
      const index = str.indexOf("=", min);
      return index < max ? index : -1;
    }
    __name(eqIndex, "eqIndex");
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
    __name(valueSlice, "valueSlice");
    function decode(str) {
      if (str.indexOf("%") === -1)
        return str;
      try {
        return decodeURIComponent(str);
      } catch (e) {
        return str;
      }
    }
    __name(decode, "decode");
    function isDate(val) {
      return __toString.call(val) === "[object Date]";
    }
    __name(isDate, "isDate");
  }
});
var API_URL = "https://api.clerk.com";
var API_VERSION = "v1";
var USER_AGENT = `${"@clerk/backend"}@${"3.11.3"}`;
var MAX_CACHE_LAST_UPDATED_AT_SECONDS = 5 * 60;
var SUPPORTED_BAPI_VERSION = "2026-05-12";
var Attributes = {
  AuthToken: "__clerkAuthToken",
  AuthSignature: "__clerkAuthSignature",
  AuthStatus: "__clerkAuthStatus",
  AuthReason: "__clerkAuthReason",
  AuthMessage: "__clerkAuthMessage",
  ClerkUrl: "__clerkUrl"
};
var Cookies = {
  Session: "__session",
  Refresh: "__refresh",
  ClientUat: "__client_uat",
  Handshake: "__clerk_handshake",
  DevBrowser: "__clerk_db_jwt",
  RedirectCount: "__clerk_redirect_count",
  HandshakeNonce: "__clerk_handshake_nonce"
};
var QueryParameters = {
  ClerkSynced: "__clerk_synced",
  SuffixedCookies: "suffixed_cookies",
  ClerkRedirectUrl: "__clerk_redirect_url",
  // use the reference to Cookies to indicate that it's the same value
  DevBrowser: Cookies.DevBrowser,
  Handshake: Cookies.Handshake,
  HandshakeHelp: "__clerk_help",
  LegacyDevBrowser: "__dev_session",
  HandshakeReason: "__clerk_hs_reason",
  HandshakeNonce: Cookies.HandshakeNonce,
  HandshakeFormat: "format",
  Session: "__session"
};
var Headers2 = {
  Accept: "accept",
  AuthMessage: "x-clerk-auth-message",
  Authorization: "authorization",
  AuthReason: "x-clerk-auth-reason",
  AuthSignature: "x-clerk-auth-signature",
  AuthStatus: "x-clerk-auth-status",
  AuthToken: "x-clerk-auth-token",
  CacheControl: "cache-control",
  ClerkRedirectTo: "x-clerk-redirect-to",
  ClerkRequestData: "x-clerk-request-data",
  ClerkUrl: "x-clerk-clerk-url",
  CloudFrontForwardedProto: "cloudfront-forwarded-proto",
  ContentType: "content-type",
  ContentSecurityPolicy: "content-security-policy",
  ContentSecurityPolicyReportOnly: "content-security-policy-report-only",
  EnableDebug: "x-clerk-debug",
  ForwardedHost: "x-forwarded-host",
  ForwardedPort: "x-forwarded-port",
  ForwardedProto: "x-forwarded-proto",
  Host: "host",
  Location: "location",
  Nonce: "x-nonce",
  Origin: "origin",
  Referrer: "referer",
  SecFetchDest: "sec-fetch-dest",
  SecFetchSite: "sec-fetch-site",
  UserAgent: "user-agent",
  ReportingEndpoints: "reporting-endpoints"
};
var ContentTypes = {
  Json: "application/json"
};
var ClerkSyncStatus = {
  /** Not synced - satellite needs handshake after returning from primary sign-in */
  NeedsSync: "false",
  /** Sync completed - prevents re-sync loop after handshake completes */
  Completed: "true"
};
var constants = {
  Attributes,
  Cookies,
  Headers: Headers2,
  ContentTypes,
  QueryParameters,
  ClerkSyncStatus
};
function mergePreDefinedOptions(preDefinedOptions, options) {
  return Object.keys(preDefinedOptions).reduce(
    (obj, key) => {
      return { ...obj, [key]: options[key] || obj[key] };
    },
    { ...preDefinedOptions }
  );
}
__name(mergePreDefinedOptions, "mergePreDefinedOptions");
function assertValidSecretKey(val) {
  if (!val || typeof val !== "string") {
    throw Error("Missing Clerk Secret Key. Go to https://dashboard.clerk.com and get your key for your instance.");
  }
}
__name(assertValidSecretKey, "assertValidSecretKey");
function assertValidPublishableKey(val) {
  parsePublishableKey(val, { fatal: true });
}
__name(assertValidPublishableKey, "assertValidPublishableKey");
var TokenType = {
  SessionToken: "session_token",
  ApiKey: "api_key",
  M2MToken: "m2m_token",
  OAuthToken: "oauth_token"
};
var AuthenticateContext = class {
  static {
    __name(this, "AuthenticateContext");
  }
  constructor(cookieSuffix, clerkRequest, options) {
    this.cookieSuffix = cookieSuffix;
    this.clerkRequest = clerkRequest;
    this.originalFrontendApi = "";
    const autoProxyPath = getAutoProxyUrlFromEnvironment({
      publishableKey: options.publishableKey ?? "",
      hasProxyUrl: !!options.proxyUrl,
      hasDomain: !!options.domain
    });
    if (autoProxyPath) {
      options = { ...options, proxyUrl: `${clerkRequest.clerkUrl.origin}${autoProxyPath}` };
    }
    if (options.acceptsToken === TokenType.M2MToken || options.acceptsToken === TokenType.ApiKey) {
      this.initHeaderValues();
    } else {
      this.initPublishableKeyValues(options);
      this.initHeaderValues();
      this.initCookieValues();
      this.initHandshakeValues();
    }
    Object.assign(this, options);
    this.clerkUrl = this.clerkRequest.clerkUrl;
    if (this.proxyUrl?.startsWith("/")) {
      this.proxyUrl = `${this.clerkUrl.origin}${this.proxyUrl}`;
    }
  }
  /**
   * Gets the session token from either the cookie or the header.
   *
   * @returns {string | undefined} The session token if available, otherwise undefined.
   */
  get sessionToken() {
    return this.sessionTokenInCookie || this.tokenInHeader;
  }
  usesSuffixedCookies() {
    const suffixedClientUat = this.getSuffixedCookie(constants.Cookies.ClientUat);
    const clientUat = this.getCookie(constants.Cookies.ClientUat);
    const suffixedSession = this.getSuffixedCookie(constants.Cookies.Session) || "";
    const session = this.getCookie(constants.Cookies.Session) || "";
    if (session && !this.tokenHasIssuer(session)) {
      return false;
    }
    if (session && !this.tokenBelongsToInstance(session)) {
      return true;
    }
    if (!suffixedClientUat && !suffixedSession) {
      return false;
    }
    const { data: sessionData } = decodeJwt(session);
    const sessionIat = sessionData?.payload.iat || 0;
    const { data: suffixedSessionData } = decodeJwt(suffixedSession);
    const suffixedSessionIat = suffixedSessionData?.payload.iat || 0;
    if (suffixedClientUat !== "0" && clientUat !== "0" && sessionIat > suffixedSessionIat) {
      return false;
    }
    if (suffixedClientUat === "0" && clientUat !== "0") {
      return false;
    }
    if (this.instanceType !== "production") {
      const isSuffixedSessionExpired = this.sessionExpired(suffixedSessionData);
      if (suffixedClientUat !== "0" && clientUat === "0" && isSuffixedSessionExpired) {
        return false;
      }
    }
    if (!suffixedClientUat && suffixedSession) {
      return false;
    }
    return true;
  }
  /**
   * Determines if the request came from a different origin based on the referrer header.
   * Used for cross-origin detection in multi-domain authentication flows.
   *
   * @returns {boolean} True if referrer exists and is from a different origin, false otherwise.
   */
  isCrossOriginReferrer() {
    if (!this.referrer || !this.clerkUrl.origin) {
      return false;
    }
    try {
      const referrerOrigin = new URL(this.referrer).origin;
      return referrerOrigin !== this.clerkUrl.origin;
    } catch {
      return false;
    }
  }
  /**
   * Determines if the referrer URL is from a Clerk domain (accounts portal or FAPI).
   * This includes both development and production account portal domains, as well as FAPI domains
   * used for redirect-based authentication flows.
   *
   * @returns {boolean} True if the referrer is from a Clerk accounts portal or FAPI domain, false otherwise
   */
  isKnownClerkReferrer() {
    if (!this.referrer) {
      return false;
    }
    try {
      const referrerOrigin = new URL(this.referrer);
      const referrerHost = referrerOrigin.hostname;
      if (this.frontendApi) {
        const fapiHost = this.frontendApi.startsWith("http") ? new URL(this.frontendApi).hostname : this.frontendApi;
        if (referrerHost === fapiHost) {
          return true;
        }
      }
      if (isLegacyDevAccountPortalOrigin(referrerHost) || isCurrentDevAccountPortalOrigin(referrerHost)) {
        return true;
      }
      const expectedAccountsUrl = buildAccountsBaseUrl(this.frontendApi);
      if (expectedAccountsUrl) {
        const expectedAccountsOrigin = new URL(expectedAccountsUrl).origin;
        if (referrerOrigin.origin === expectedAccountsOrigin) {
          return true;
        }
      }
      if (referrerHost.startsWith("accounts.")) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
  initPublishableKeyValues(options) {
    assertValidPublishableKey(options.publishableKey);
    this.publishableKey = options.publishableKey;
    let resolvedProxyUrl = options.proxyUrl;
    if (resolvedProxyUrl?.startsWith("/")) {
      resolvedProxyUrl = `${this.clerkRequest.clerkUrl.origin}${resolvedProxyUrl}`;
    }
    const originalPk = parsePublishableKey(this.publishableKey, {
      fatal: true,
      domain: options.domain,
      isSatellite: options.isSatellite
    });
    this.originalFrontendApi = originalPk.frontendApi;
    const pk = parsePublishableKey(this.publishableKey, {
      fatal: true,
      proxyUrl: resolvedProxyUrl,
      domain: options.domain,
      isSatellite: options.isSatellite
    });
    this.instanceType = pk.instanceType;
    this.frontendApi = pk.frontendApi;
  }
  initHeaderValues() {
    this.method = this.clerkRequest.method;
    this.tokenInHeader = this.parseAuthorizationHeader(this.getHeader(constants.Headers.Authorization));
    this.origin = this.getHeader(constants.Headers.Origin);
    this.host = this.getHeader(constants.Headers.Host);
    this.forwardedHost = this.getHeader(constants.Headers.ForwardedHost);
    this.forwardedProto = this.getHeader(constants.Headers.CloudFrontForwardedProto) || this.getHeader(constants.Headers.ForwardedProto);
    this.referrer = this.getHeader(constants.Headers.Referrer);
    this.userAgent = this.getHeader(constants.Headers.UserAgent);
    this.secFetchDest = this.getHeader(constants.Headers.SecFetchDest);
    this.accept = this.getHeader(constants.Headers.Accept);
  }
  initCookieValues() {
    this.sessionTokenInCookie = this.getSuffixedOrUnSuffixedCookie(constants.Cookies.Session);
    this.refreshTokenInCookie = this.getSuffixedCookie(constants.Cookies.Refresh);
    this.clientUat = Number.parseInt(this.getSuffixedOrUnSuffixedCookie(constants.Cookies.ClientUat) || "") || 0;
  }
  initHandshakeValues() {
    this.devBrowserToken = this.getQueryParam(constants.QueryParameters.DevBrowser) || this.getSuffixedOrUnSuffixedCookie(constants.Cookies.DevBrowser);
    this.handshakeToken = this.getQueryParam(constants.QueryParameters.Handshake) || this.getCookie(constants.Cookies.Handshake);
    this.handshakeRedirectLoopCounter = Number(this.getCookie(constants.Cookies.RedirectCount)) || 0;
    this.handshakeNonce = this.getQueryParam(constants.QueryParameters.HandshakeNonce) || this.getCookie(constants.Cookies.HandshakeNonce);
  }
  getQueryParam(name) {
    return this.clerkRequest.clerkUrl.searchParams.get(name);
  }
  getHeader(name) {
    return this.clerkRequest.headers.get(name) || void 0;
  }
  getCookie(name) {
    return this.clerkRequest.cookies.get(name) || void 0;
  }
  getSuffixedCookie(name) {
    return this.getCookie(getSuffixedCookieName(name, this.cookieSuffix)) || void 0;
  }
  getSuffixedOrUnSuffixedCookie(cookieName) {
    if (this.usesSuffixedCookies()) {
      return this.getSuffixedCookie(cookieName);
    }
    return this.getCookie(cookieName);
  }
  parseAuthorizationHeader(authorizationHeader) {
    if (!authorizationHeader) {
      return void 0;
    }
    const [scheme, token] = authorizationHeader.split(" ", 2);
    if (!token) {
      return scheme;
    }
    if (scheme === "Bearer") {
      return token;
    }
    return void 0;
  }
  tokenHasIssuer(token) {
    const { data, errors } = decodeJwt(token);
    if (errors) {
      return false;
    }
    return !!data.payload.iss;
  }
  tokenBelongsToInstance(token) {
    if (!token) {
      return false;
    }
    const { data, errors } = decodeJwt(token);
    if (errors) {
      return false;
    }
    const tokenIssuer = data.payload.iss.replace(/https?:\/\//gi, "");
    return this.originalFrontendApi === tokenIssuer;
  }
  sessionExpired(jwt) {
    return !!jwt && jwt?.payload.exp <= Date.now() / 1e3 >> 0;
  }
};
var createAuthenticateContext = /* @__PURE__ */ __name(async (clerkRequest, options) => {
  const cookieSuffix = options.publishableKey ? await getCookieSuffix(options.publishableKey, runtime.crypto.subtle) : "";
  return new AuthenticateContext(cookieSuffix, clerkRequest, options);
}, "createAuthenticateContext");
var SEPARATOR = "/";
var MULTIPLE_SEPARATOR_REGEX = new RegExp("(?<!:)" + SEPARATOR + "{1,}", "g");
var MAX_DECODES = 10;
function isDotSegment(segment) {
  let candidate = segment;
  for (let i = 0; i <= MAX_DECODES; i++) {
    if (candidate.split(/[/\\]/).some((p) => p === "." || p === "..")) {
      return true;
    }
    if (i === MAX_DECODES) {
      throw new Error(`joinPaths: too many layers of encoding in ${segment}`);
    }
    try {
      const next = decodeURIComponent(candidate);
      if (next === candidate) {
        break;
      }
      candidate = next;
    } catch {
      break;
    }
  }
  return false;
}
__name(isDotSegment, "isDotSegment");
function joinPaths(...args) {
  const result = args.filter((p) => p).join(SEPARATOR).replace(MULTIPLE_SEPARATOR_REGEX, SEPARATOR);
  for (const segment of result.split(SEPARATOR)) {
    if (isDotSegment(segment)) {
      throw new Error(`joinPaths: "." and ".." path segments are not allowed (received "${result}")`);
    }
  }
  return result;
}
__name(joinPaths, "joinPaths");
var AbstractAPI = class {
  static {
    __name(this, "AbstractAPI");
  }
  constructor(request) {
    this.request = request;
  }
  requireId(id) {
    if (!id) {
      throw new Error("A valid resource ID is required.");
    }
  }
};
var basePath = "/actor_tokens";
var ActorTokenAPI = class extends AbstractAPI {
  static {
    __name(this, "ActorTokenAPI");
  }
  async create(params) {
    return this.request({
      method: "POST",
      path: basePath,
      bodyParams: params
    });
  }
  async revoke(actorTokenId) {
    this.requireId(actorTokenId);
    return this.request({
      method: "POST",
      path: joinPaths(basePath, actorTokenId, "revoke")
    });
  }
};
var basePath2 = "/agents/tasks";
var AgentTaskAPI = class extends AbstractAPI {
  static {
    __name(this, "AgentTaskAPI");
  }
  /**
   * Creates an Agent Task that generates a URL which, when visited, creates a session for the specified user. This is useful for automated testing or agent-driven flows where full authentication isn't practical.
   * @returns The created [`AgentTask`](https://clerk.com/docs/reference/backend/types/backend-agent-task) object.
   */
  async create(params) {
    return this.request({
      method: "POST",
      path: basePath2,
      bodyParams: params,
      options: {
        deepSnakecaseBodyParamKeys: true
      }
    });
  }
  /**
   * Revokes the given Agent Task.
   * @param agentTaskId - The ID of the Agent Task to revoke.
   * @returns The revoked [`AgentTask`](https://clerk.com/docs/reference/backend/types/backend-agent-task) object.
   */
  async revoke(agentTaskId) {
    this.requireId(agentTaskId);
    return this.request({
      method: "POST",
      path: joinPaths(basePath2, agentTaskId, "revoke")
    });
  }
};
var basePath3 = "/accountless_applications";
var AccountlessApplicationAPI = class extends AbstractAPI {
  static {
    __name(this, "AccountlessApplicationAPI");
  }
  async createAccountlessApplication(params) {
    const headerParams = params?.requestHeaders ? Object.fromEntries(params.requestHeaders.entries()) : void 0;
    return this.request({
      method: "POST",
      path: basePath3,
      headerParams,
      queryParams: {
        source: params?.source
      }
    });
  }
  async completeAccountlessApplicationOnboarding(params) {
    const headerParams = params?.requestHeaders ? Object.fromEntries(params.requestHeaders.entries()) : void 0;
    return this.request({
      method: "POST",
      path: joinPaths(basePath3, "complete"),
      headerParams,
      queryParams: {
        source: params?.source
      }
    });
  }
};
var basePath4 = "/allowlist_identifiers";
var AllowlistIdentifierAPI = class extends AbstractAPI {
  static {
    __name(this, "AllowlistIdentifierAPI");
  }
  /**
   * Gets the list of allowlist identifiers for the instance. By default, the list is returned in descending order by creation date (newest first).
   * @returns A [`PaginatedResourceResponse`](https://clerk.com/docs/reference/backend/types/paginated-resource-response) object with a `data` property containing an array of [`AllowlistIdentifier`](https://clerk.com/docs/reference/backend/types/backend-allowlist-identifier) objects and a `totalCount` property containing the total number of allowlist identifiers for the instance.
   */
  async getAllowlistIdentifierList(params = {}) {
    return this.request({
      method: "GET",
      path: basePath4,
      queryParams: { ...params, paginated: true }
    });
  }
  /**
   * Creates a new allowlist identifier.
   * @returns The created [`AllowlistIdentifier`](https://clerk.com/docs/reference/backend/types/backend-allowlist-identifier) object.
   */
  async createAllowlistIdentifier(params) {
    return this.request({
      method: "POST",
      path: basePath4,
      bodyParams: params
    });
  }
  /**
   * Deletes an allowlist identifier.
   * @param allowlistIdentifierId - The ID of the allowlist identifier to delete.
   * @returns The [`DeletedObject`](https://clerk.com/docs/reference/backend/types/deleted-object) object.
   */
  async deleteAllowlistIdentifier(allowlistIdentifierId) {
    this.requireId(allowlistIdentifierId);
    return this.request({
      method: "DELETE",
      path: joinPaths(basePath4, allowlistIdentifierId)
    });
  }
};
var basePath5 = "/api_keys";
var APIKeysAPI = class extends AbstractAPI {
  static {
    __name(this, "APIKeysAPI");
  }
  /**
   * Gets a list of API keys for the given user or Organization. By default, the list is returned in descending order by creation date (newest first).
   * @returns A [`PaginatedResourceResponse`](https://clerk.com/docs/reference/backend/types/paginated-resource-response) object with a `data` property containing an array of [`APIKey`](https://clerk.com/docs/reference/backend/types/backend-api-key) objects and a `totalCount` property containing the total number of API keys for the user or Organization.
   */
  async list(queryParams) {
    return this.request({
      method: "GET",
      path: basePath5,
      queryParams
    });
  }
  /**
   * Creates a new API key for the given user or Organization.
   * @returns The created [`APIKey`](https://clerk.com/docs/reference/backend/types/backend-api-key) object.
   */
  async create(params) {
    return this.request({
      method: "POST",
      path: basePath5,
      bodyParams: params
    });
  }
  /**
   * Gets the given [`APIKey`](https://clerk.com/docs/reference/backend/types/backend-api-key) object.
   * @param apiKeyId - The ID of the API key to get.
   */
  async get(apiKeyId) {
    this.requireId(apiKeyId);
    return this.request({
      method: "GET",
      path: joinPaths(basePath5, apiKeyId)
    });
  }
  /**
   * Updates the given API key.
   * @returns The updated [`APIKey`](https://clerk.com/docs/reference/backend/types/backend-api-key) object.
   */
  async update(params) {
    const { apiKeyId, ...bodyParams } = params;
    this.requireId(apiKeyId);
    return this.request({
      method: "PATCH",
      path: joinPaths(basePath5, apiKeyId),
      bodyParams
    });
  }
  /**
   * Deletes the given API key.
   * @param apiKeyId - The ID of the API key to delete.
   * @returns The [`DeletedObject`](https://clerk.com/docs/reference/backend/types/deleted-object) object.
   */
  async delete(apiKeyId) {
    this.requireId(apiKeyId);
    return this.request({
      method: "DELETE",
      path: joinPaths(basePath5, apiKeyId)
    });
  }
  /**
   * Revokes the given API key. This will immediately invalidate the API key and prevent it from being used to authenticate any future requests.
   * @returns The revoked [`APIKey`](https://clerk.com/docs/reference/backend/types/backend-api-key) object.
   */
  async revoke(params) {
    const { apiKeyId, revocationReason = null } = params;
    this.requireId(apiKeyId);
    return this.request({
      method: "POST",
      path: joinPaths(basePath5, apiKeyId, "revoke"),
      bodyParams: { revocationReason }
    });
  }
  /**
   * Gets the secret of the given API key.
   * @param apiKeyId - The ID of the API key to get the secret of.
   */
  async getSecret(apiKeyId) {
    this.requireId(apiKeyId);
    return this.request({
      method: "GET",
      path: joinPaths(basePath5, apiKeyId, "secret")
    });
  }
  /**
   * Verifies the given API key.
   * - If the API key is valid, the method returns the API key object with its properties.
   * - If the API key is invalid, revoked, or expired, the method will throw an error.
   * @param secret - The secret of the API key to verify.
   * @returns The verified [`APIKey`](https://clerk.com/docs/reference/backend/types/backend-api-key) object.
   */
  async verify(secret) {
    return this.request({
      method: "POST",
      path: joinPaths(basePath5, "verify"),
      bodyParams: { secret }
    });
  }
};
var basePath6 = "/beta_features";
var BetaFeaturesAPI = class extends AbstractAPI {
  static {
    __name(this, "BetaFeaturesAPI");
  }
  /**
   * Change the domain of a production instance.
   *
   * Changing the domain requires updating the DNS records accordingly, deploying new SSL certificates,
   * updating your Social Connection's redirect URLs and setting the new keys in your code.
   *
   * @remarks
   * WARNING: Changing your domain will invalidate all current user sessions (i.e. users will be logged out).
   *          Also, while your application is being deployed, a small downtime is expected to occur.
   */
  async changeDomain(params) {
    return this.request({
      method: "POST",
      path: joinPaths(basePath6, "change_domain"),
      bodyParams: params
    });
  }
};
var basePath7 = "/blocklist_identifiers";
var BlocklistIdentifierAPI = class extends AbstractAPI {
  static {
    __name(this, "BlocklistIdentifierAPI");
  }
  async getBlocklistIdentifierList(params = {}) {
    return this.request({
      method: "GET",
      path: basePath7,
      queryParams: params
    });
  }
  async createBlocklistIdentifier(params) {
    return this.request({
      method: "POST",
      path: basePath7,
      bodyParams: params
    });
  }
  async deleteBlocklistIdentifier(blocklistIdentifierId) {
    this.requireId(blocklistIdentifierId);
    return this.request({
      method: "DELETE",
      path: joinPaths(basePath7, blocklistIdentifierId)
    });
  }
};
var basePath8 = "/clients";
var ClientAPI = class extends AbstractAPI {
  static {
    __name(this, "ClientAPI");
  }
  /**
   * @deprecated This method is deprecated and will be removed in a future version.
   */
  async getClientList(params = {}) {
    return this.request({
      method: "GET",
      path: basePath8,
      queryParams: { ...params, paginated: true }
    });
  }
  /**
   * Gets the given [`Client`](https://clerk.com/docs/reference/backend/types/backend-client).
   * @param clientId - The ID of the client to get.
   */
  async getClient(clientId) {
    this.requireId(clientId);
    return this.request({
      method: "GET",
      path: joinPaths(basePath8, clientId)
    });
  }
  /**
   * Verifies the client in the given token.
   * @param token - The token to verify.
   * @returns The verified [`Client`](https://clerk.com/docs/reference/backend/types/backend-client).
   */
  verifyClient(token) {
    return this.request({
      method: "POST",
      path: joinPaths(basePath8, "verify"),
      bodyParams: { token }
    });
  }
  /**
   * Retrieves the handshake payload for a given nonce. Used internally by Clerk's SDKs to resolve
   * session cookies during the handshake flow.
   *
   * @internal
   */
  async getHandshakePayload(queryParams) {
    return this.request({
      method: "GET",
      path: joinPaths(basePath8, "handshake_payload"),
      queryParams
    });
  }
};
var basePath9 = "/domains";
var DomainAPI = class extends AbstractAPI {
  static {
    __name(this, "DomainAPI");
  }
  /**
   * Gets the list of domains for the instance. By default, the list is returned in descending order by creation date (newest first).
   * @returns A [`PaginatedResourceResponse`](https://clerk.com/docs/reference/backend/types/paginated-resource-response) object with a `data` property containing an array of [`Domain`](https://clerk.com/docs/reference/backend/types/domain) objects and a `totalCount` property containing the total number of domains for the instance.
   */
  async list() {
    return this.request({
      method: "GET",
      path: basePath9
    });
  }
  /**
   * Adds a new domain to the instance. Useful in the case of multi-domain instances, allows adding [satellite domains](https://clerk.com/docs/guides/dashboard/dns-domains/satellite-domains) to an instance.
   * @returns The created [`Domain`](https://clerk.com/docs/reference/backend/types/domain) object.
   */
  async add(params) {
    return this.request({
      method: "POST",
      path: basePath9,
      bodyParams: params
    });
  }
  /**
   * Updates a domain for the instance. Both primary and satellite domains can be updated. If you choose to use Clerk via proxy, use this endpoint to specify the `proxy_url`. Whenever you decide you'd rather switch to DNS setup for Clerk, simply set `proxy_url` to `null` for the domain.
   *
   * When you update a production instance's primary domain name, you have to make sure that you've completed all the necessary setup steps for DNS and emails to work. Expect downtime otherwise. Updating a primary domain's name will also update the instance's home origin, affecting the default application paths.
   * @returns The updated [`Domain`](https://clerk.com/docs/reference/backend/types/domain) object.
   */
  async update(params) {
    const { domainId, ...bodyParams } = params;
    this.requireId(domainId);
    return this.request({
      method: "PATCH",
      path: joinPaths(basePath9, domainId),
      bodyParams
    });
  }
  /**
   * Deletes a satellite domain for the instance. It is currently not possible to delete the instance's primary domain.
   * @param satelliteDomainId - The ID of the satellite domain to delete.
   * @returns The [`DeletedObject`](https://clerk.com/docs/reference/backend/types/deleted-object).
   */
  async delete(satelliteDomainId) {
    return this.deleteDomain(satelliteDomainId);
  }
  /**
   * Deletes a satellite domain for the instance.
   * @param satelliteDomainId - The ID of the satellite domain to delete.
   * @returns The [`DeletedObject`](https://clerk.com/docs/reference/backend/types/deleted-object).
   * @deprecated Use `delete()` instead.
   */
  async deleteDomain(satelliteDomainId) {
    this.requireId(satelliteDomainId);
    return this.request({
      method: "DELETE",
      path: joinPaths(basePath9, satelliteDomainId)
    });
  }
};
var basePath10 = "/email_addresses";
var EmailAddressAPI = class extends AbstractAPI {
  static {
    __name(this, "EmailAddressAPI");
  }
  /**
   * Gets the given [`EmailAddress`](https://clerk.com/docs/reference/backend/types/backend-email-address).
   * @param emailAddressId - The ID of the email address to get.
   */
  async getEmailAddress(emailAddressId) {
    this.requireId(emailAddressId);
    return this.request({
      method: "GET",
      path: joinPaths(basePath10, emailAddressId)
    });
  }
  /**
   * Creates a new email address for the given user.
   * @returns The created [`EmailAddress`](https://clerk.com/docs/reference/backend/types/backend-email-address) object.
   */
  async createEmailAddress(params) {
    return this.request({
      method: "POST",
      path: basePath10,
      bodyParams: params
    });
  }
  /**
   * Updates the given email address.
   * @param emailAddressId - The ID of the email address to update.
   * @param params - The parameters to update the email address.
   * @returns The updated [`EmailAddress`](https://clerk.com/docs/reference/backend/types/backend-email-address) object.
   */
  async updateEmailAddress(emailAddressId, params = {}) {
    this.requireId(emailAddressId);
    return this.request({
      method: "PATCH",
      path: joinPaths(basePath10, emailAddressId),
      bodyParams: params
    });
  }
  /**
   * Deletes the given email address.
   * @param emailAddressId - The ID of the email address to delete.
   * @returns The [`DeletedObject`](https://clerk.com/docs/reference/backend/types/deleted-object) object.
   */
  async deleteEmailAddress(emailAddressId) {
    this.requireId(emailAddressId);
    return this.request({
      method: "DELETE",
      path: joinPaths(basePath10, emailAddressId)
    });
  }
};
var basePath11 = "/email";
var EmailApi = class extends AbstractAPI {
  static {
    __name(this, "EmailApi");
  }
  /**
   * @experimental This method calls an internal, not-yet-public endpoint and is
   * subject to change. It is advised to [pin](https://clerk.com/docs/pinning)
   * the SDK version to avoid breaking changes.
   *
   * Sends a transactional email.
   */
  async create(params) {
    return this.request({
      method: "POST",
      path: basePath11,
      bodyParams: params,
      options: {
        // Snakecase nested keys too, so a `to: { userId }` recipient is sent as
        // `to: { user_id }` on the wire (the default only snakecases top-level
        // keys, which would leave the nested `userId` untouched).
        deepSnakecaseBodyParamKeys: true
      }
    });
  }
};
var basePath12 = "/enterprise_connections";
var EnterpriseConnectionAPI = class extends AbstractAPI {
  static {
    __name(this, "EnterpriseConnectionAPI");
  }
  /**
   * Creates a new enterprise connection.
   * @returns The created [`EnterpriseConnection`](https://clerk.com/docs/reference/backend/types/backend-enterprise-connection) object.
   */
  async createEnterpriseConnection(params) {
    return this.request({
      method: "POST",
      path: basePath12,
      bodyParams: params,
      options: {
        deepSnakecaseBodyParamKeys: true
      }
    });
  }
  /**
   * Updates the given enterprise connection.
   * @param enterpriseConnectionId - The ID of the enterprise connection to update.
   * @param params - The parameters to update the enterprise connection.
   * @returns The updated [`EnterpriseConnection`](https://clerk.com/docs/reference/backend/types/backend-enterprise-connection) object.
   */
  async updateEnterpriseConnection(enterpriseConnectionId, params) {
    this.requireId(enterpriseConnectionId);
    return this.request({
      method: "PATCH",
      path: joinPaths(basePath12, enterpriseConnectionId),
      bodyParams: params,
      options: {
        deepSnakecaseBodyParamKeys: true
      }
    });
  }
  /**
   * Gets the list of enterprise connections for the instance. By default, the list is returned in descending order by creation date (newest first).
   * @returns A [`PaginatedResourceResponse`](https://clerk.com/docs/reference/backend/types/paginated-resource-response) object with a `data` property containing an array of [`EnterpriseConnection`](https://clerk.com/docs/reference/backend/types/backend-enterprise-connection) objects and a `totalCount` property containing the total number of enterprise connections for the instance.
   */
  async getEnterpriseConnectionList(params = {}) {
    return this.request({
      method: "GET",
      path: basePath12,
      queryParams: params
    });
  }
  /**
   * Gets the given enterprise connection.
   * @param enterpriseConnectionId - The ID of the enterprise connection to get.
   * @returns The [`EnterpriseConnection`](https://clerk.com/docs/reference/backend/types/backend-enterprise-connection) object.
   */
  async getEnterpriseConnection(enterpriseConnectionId) {
    this.requireId(enterpriseConnectionId);
    return this.request({
      method: "GET",
      path: joinPaths(basePath12, enterpriseConnectionId)
    });
  }
  /**
   * Deletes the given enterprise connection.
   * @param enterpriseConnectionId - The ID of the enterprise connection to delete.
   * @returns The deleted [`EnterpriseConnection`](https://clerk.com/docs/reference/backend/types/backend-enterprise-connection) object.
   */
  async deleteEnterpriseConnection(enterpriseConnectionId) {
    this.requireId(enterpriseConnectionId);
    return this.request({
      method: "DELETE",
      path: joinPaths(basePath12, enterpriseConnectionId)
    });
  }
};
var basePath13 = "/oauth_applications/access_tokens";
var IdPOAuthAccessTokenApi = class extends AbstractAPI {
  static {
    __name(this, "IdPOAuthAccessTokenApi");
  }
  async verify(accessToken) {
    return this.request({
      method: "POST",
      path: joinPaths(basePath13, "verify"),
      bodyParams: { access_token: accessToken }
    });
  }
};
var basePath14 = "/instance";
var InstanceAPI = class extends AbstractAPI {
  static {
    __name(this, "InstanceAPI");
  }
  /**
   * Gets the current [`Instance`](https://clerk.com/docs/reference/backend/types/backend-instance).
   */
  async get() {
    return this.request({
      method: "GET",
      path: basePath14
    });
  }
  /**
   * Updates the current instance.
   */
  async update(params) {
    return this.request({
      method: "PATCH",
      path: basePath14,
      bodyParams: params
    });
  }
  /**
   * Updates the [restriction](https://clerk.com/docs/guides/secure/restricting-access) settings for the current instance.
   * @returns The updated [`InstanceRestrictions`](https://clerk.com/docs/reference/backend/types/backend-instance-restrictions) object.
   */
  async updateRestrictions(params) {
    return this.request({
      method: "PATCH",
      path: joinPaths(basePath14, "restrictions"),
      bodyParams: params
    });
  }
  /**
   * Gets the [Organization-related settings](https://clerk.com/docs/guides/organizations/configure) for the current instance.
   * @returns The [`OrganizationSettings`](https://clerk.com/docs/reference/backend/types/backend-organization-settings) object.
   */
  async getOrganizationSettings() {
    return this.request({
      method: "GET",
      path: joinPaths(basePath14, "organization_settings")
    });
  }
  /**
   * Updates the [Organization-related settings](https://clerk.com/docs/guides/organizations/configure) for the current instance.
   * @returns The updated [`OrganizationSettings`](https://clerk.com/docs/reference/backend/types/backend-organization-settings) object.
   */
  async updateOrganizationSettings(params) {
    return this.request({
      method: "PATCH",
      path: joinPaths(basePath14, "organization_settings"),
      bodyParams: params
    });
  }
};
var basePath15 = "/invitations";
var InvitationAPI = class extends AbstractAPI {
  static {
    __name(this, "InvitationAPI");
  }
  /**
   * Gets a list of non-revoked invitations for the instance, sorted by descending creation date. By default, the list is returned in descending order by creation date (newest first).
   * @returns A [`PaginatedResourceResponse`](https://clerk.com/docs/reference/backend/types/paginated-resource-response) object with a `data` property containing an array of [`Invitation`](https://clerk.com/docs/reference/backend/types/backend-invitation) objects and a `totalCount` property containing the total number of invitations.
   */
  async getInvitationList(params = {}) {
    return this.request({
      method: "GET",
      path: basePath15,
      queryParams: { ...params, paginated: true }
    });
  }
  /**
   * Creates a new invitation for the given email address, and sends the invitation email.
   *
   * If an email address has already been invited or already exists in your application, trying to create a new invitation will return an error. To bypass this error and create a new invitation anyways, set `ignoreExisting` to `true`.
   * @returns The newly created [`Invitation`](https://clerk.com/docs/reference/backend/types/backend-invitation).
   */
  async createInvitation(params) {
    return this.request({
      method: "POST",
      path: basePath15,
      bodyParams: params
    });
  }
  /**
   * Creates multiple invitations for the given email addresses, and sends the invitation emails.
   *
   * If an email address has already been invited or already exists in your application, trying to create a new invitation will return an error. To bypass this error and create a new invitation anyways, set `ignoreExisting` to `true`.
   * @returns An array of each created [`Invitation`](https://clerk.com/docs/reference/backend/types/backend-invitation) object.
   */
  async createInvitationBulk(params) {
    return this.request({
      method: "POST",
      path: joinPaths(basePath15, "bulk"),
      bodyParams: params
    });
  }
  /**
   * Revokes the given invitation.
   *
   * Revoking an invitation makes the invitation email link unusable. However, it doesn't prevent the user from signing up if they follow the sign up flow.
   *
   * Only active (i.e. non-revoked) invitations can be revoked.
   * @param invitationId - The ID of the invitation to revoke.
   * @returns The revoked [`Invitation`](https://clerk.com/docs/reference/backend/types/backend-invitation).
   */
  async revokeInvitation(invitationId) {
    this.requireId(invitationId);
    return this.request({
      method: "POST",
      path: joinPaths(basePath15, invitationId, "revoke")
    });
  }
};
var basePath16 = "/machines";
var MachineApi = class extends AbstractAPI {
  static {
    __name(this, "MachineApi");
  }
  /**
   * Gets the given machine.
   * @param machineId - The ID of the machine to get.
   * @returns The [`Machine`](https://clerk.com/docs/reference/backend/types/backend-machine) object.
   */
  async get(machineId) {
    this.requireId(machineId);
    return this.request({
      method: "GET",
      path: joinPaths(basePath16, machineId)
    });
  }
  /**
   * Gets a list of machines for the instance. By default, the list is returned in descending order by creation date (newest first).
   * @returns A [`PaginatedResourceResponse`](https://clerk.com/docs/reference/backend/types/paginated-resource-response) object with a `data` property containing an array of [`Machine`](https://clerk.com/docs/reference/backend/types/backend-machine) objects and a `totalCount` property containing the total number of machines for the instance.
   */
  async list(queryParams = {}) {
    return this.request({
      method: "GET",
      path: basePath16,
      queryParams
    });
  }
  /**
   * Creates a new machine.
   * @returns The created [`Machine`](https://clerk.com/docs/reference/backend/types/backend-machine) object.
   */
  async create(bodyParams) {
    return this.request({
      method: "POST",
      path: basePath16,
      bodyParams
    });
  }
  /**
   * Updates the given machine.
   * @returns The updated [`Machine`](https://clerk.com/docs/reference/backend/types/backend-machine) object.
   */
  async update(params) {
    const { machineId, ...bodyParams } = params;
    this.requireId(machineId);
    return this.request({
      method: "PATCH",
      path: joinPaths(basePath16, machineId),
      bodyParams
    });
  }
  /**
   * Deletes the given machine.
   * @param machineId - The ID of the machine to delete.
   * @returns The [`Machine`](https://clerk.com/docs/reference/backend/types/backend-machine) object.
   */
  async delete(machineId) {
    this.requireId(machineId);
    return this.request({
      method: "DELETE",
      path: joinPaths(basePath16, machineId)
    });
  }
  /**
   * Gets the secret key for the given machine.
   * @param machineId - The ID of the machine to get the secret key for.
   * @returns The machine's secret key.
   */
  async getSecretKey(machineId) {
    this.requireId(machineId);
    return this.request({
      method: "GET",
      path: joinPaths(basePath16, machineId, "secret_key")
    });
  }
  /**
   * Rotates the secret key for the given machine.
   * @returns The new secret key.
   */
  async rotateSecretKey(params) {
    const { machineId, previousTokenTtl } = params;
    this.requireId(machineId);
    return this.request({
      method: "POST",
      path: joinPaths(basePath16, machineId, "secret_key", "rotate"),
      bodyParams: {
        previousTokenTtl
      }
    });
  }
  /**
   * Creates a new machine scope, allowing the specified machine to access another machine. Maximum of 150 scopes per machine.
   *
   * @param machineId - The ID of the machine that will have access to the target machine.
   * @param toMachineId - The ID of the machine that will be accessible by the source machine.
   * @returns The created [`MachineScope`](https://clerk.com/docs/reference/backend/types/backend-machine-scope) object.
   */
  async createScope(machineId, toMachineId) {
    this.requireId(machineId);
    return this.request({
      method: "POST",
      path: joinPaths(basePath16, machineId, "scopes"),
      bodyParams: {
        toMachineId
      }
    });
  }
  /**
   * Deletes the given machine scope, removing access from one machine to another.
   *
   * @param machineId - The ID of the machine that has access to the target machine.
   * @param otherMachineId - The ID of the machine that will no longer be accessible by the source machine.
   * @returns The deleted [`MachineScope`](https://clerk.com/docs/reference/backend/types/backend-machine-scope) object.
   */
  async deleteScope(machineId, otherMachineId) {
    this.requireId(machineId);
    return this.request({
      method: "DELETE",
      path: joinPaths(basePath16, machineId, "scopes", otherMachineId)
    });
  }
};
var IdPOAuthAccessToken = class _IdPOAuthAccessToken {
  static {
    __name(this, "_IdPOAuthAccessToken");
  }
  constructor(id, clientId, type, subject, scopes, revoked, revocationReason, expired, expiration, createdAt, updatedAt) {
    this.id = id;
    this.clientId = clientId;
    this.type = type;
    this.subject = subject;
    this.scopes = scopes;
    this.revoked = revoked;
    this.revocationReason = revocationReason;
    this.expired = expired;
    this.expiration = expiration;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
  static fromJSON(data) {
    return new _IdPOAuthAccessToken(
      data.id,
      data.client_id,
      data.type,
      data.subject,
      data.scopes,
      data.revoked,
      data.revocation_reason,
      data.expired,
      data.expiration,
      data.created_at,
      data.updated_at
    );
  }
  /**
   * Creates an IdPOAuthAccessToken from a JWT payload.
   * Maps standard JWT claims and OAuth-specific fields to token properties.
   */
  static fromJwtPayload(payload, clockSkewInMs = 5e3) {
    const oauthPayload = payload;
    return new _IdPOAuthAccessToken(
      oauthPayload.jti ?? "",
      oauthPayload.client_id ?? "",
      "oauth_token",
      payload.sub,
      oauthPayload.scp ?? oauthPayload.scope?.split(" ") ?? [],
      false,
      null,
      payload.exp * 1e3 <= Date.now() - clockSkewInMs,
      payload.exp * 1e3,
      // milliseconds: expiration, converted from JWT exp claim
      payload.iat * 1e3,
      // milliseconds: createdAt, converted from JWT iat claim
      payload.iat * 1e3
      // milliseconds: updatedAt, no JWT equivalent, defaults to iat
    );
  }
};
var M2M_RESERVED_JWT_CLAIMS = /* @__PURE__ */ new Set(["iss", "sub", "exp", "nbf", "iat", "jti"]);
function extractCustomClaims(payload) {
  const claims = {};
  for (const key of Object.keys(payload)) {
    if (!M2M_RESERVED_JWT_CLAIMS.has(key)) {
      claims[key] = payload[key];
    }
  }
  return Object.keys(claims).length > 0 ? claims : null;
}
__name(extractCustomClaims, "extractCustomClaims");
var M2MToken = class _M2MToken {
  static {
    __name(this, "_M2MToken");
  }
  constructor(id, subject, scopes, claims, revoked, revocationReason, expired, expiration, createdAt, updatedAt, token) {
    this.id = id;
    this.subject = subject;
    this.scopes = scopes;
    this.claims = claims;
    this.revoked = revoked;
    this.revocationReason = revocationReason;
    this.expired = expired;
    this.expiration = expiration;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.token = token;
  }
  static fromJSON(data) {
    return new _M2MToken(
      data.id,
      data.subject,
      data.scopes,
      data.claims,
      data.revoked,
      data.revocation_reason,
      data.expired,
      data.expiration,
      data.created_at,
      data.updated_at,
      data.token
    );
  }
  static fromJwtPayload(payload, clockSkewInMs = 5e3) {
    return new _M2MToken(
      payload.jti ?? "",
      // jti should always be present in Clerk-issued M2M JWTs
      payload.sub,
      payload.scopes?.split(" ") ?? payload.aud ?? [],
      extractCustomClaims(payload),
      false,
      null,
      payload.exp * 1e3 <= Date.now() - clockSkewInMs,
      payload.exp * 1e3,
      // milliseconds — expiration, converted from JWT exp claim
      payload.iat * 1e3,
      // milliseconds — createdAt, converted from JWT iat claim
      payload.iat * 1e3
      // milliseconds — updatedAt, no JWT equivalent; defaults to iat
    );
  }
};
var cache = {};
var lastUpdatedAt = 0;
function getFromCache(kid) {
  return cache[kid];
}
__name(getFromCache, "getFromCache");
function getCacheValues() {
  return Object.values(cache);
}
__name(getCacheValues, "getCacheValues");
function setInCache(cacheKey, jwk, shouldExpire = true) {
  cache[cacheKey] = jwk;
  lastUpdatedAt = shouldExpire ? Date.now() : -1;
}
__name(setInCache, "setInCache");
var PEM_HEADER = "-----BEGIN PUBLIC KEY-----";
var PEM_TRAILER = "-----END PUBLIC KEY-----";
var RSA_PREFIX = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA";
var RSA_SUFFIX = "IDAQAB";
function loadClerkJwkFromPem(params) {
  const { kid, pem } = params;
  const prefixedKid = `local-${kid}`;
  const cachedJwk = getFromCache(prefixedKid);
  if (cachedJwk) {
    return cachedJwk;
  }
  if (!pem) {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.SetClerkJWTKey,
      message: "Missing local JWK.",
      reason: TokenVerificationErrorReason.LocalJWKMissing
    });
  }
  const modulus = pem.replace(/\r\n|\n|\r/g, "").replace(PEM_HEADER, "").replace(PEM_TRAILER, "").replace(RSA_PREFIX, "").replace(RSA_SUFFIX, "").replace(/\+/g, "-").replace(/\//g, "_");
  const jwk = { kid: prefixedKid, kty: "RSA", alg: "RS256", n: modulus, e: "AQAB" };
  setInCache(prefixedKid, jwk, false);
  return jwk;
}
__name(loadClerkJwkFromPem, "loadClerkJwkFromPem");
async function loadClerkJWKFromRemote(params) {
  const { secretKey, apiUrl = API_URL, apiVersion = API_VERSION, kid, skipJwksCache } = params;
  if (skipJwksCache || cacheHasExpired() || !getFromCache(kid)) {
    if (!secretKey) {
      throw new TokenVerificationError({
        action: TokenVerificationErrorAction.ContactSupport,
        message: "Failed to load JWKS from Clerk Backend or Frontend API.",
        reason: TokenVerificationErrorReason.RemoteJWKFailedToLoad
      });
    }
    const fetcher = /* @__PURE__ */ __name(() => fetchJWKSFromBAPI(apiUrl, secretKey, apiVersion), "fetcher");
    const { keys } = await retry(fetcher);
    if (!keys || !keys.length) {
      throw new TokenVerificationError({
        action: TokenVerificationErrorAction.ContactSupport,
        message: "The JWKS endpoint did not contain any signing keys. Contact support@clerk.com.",
        reason: TokenVerificationErrorReason.RemoteJWKFailedToLoad
      });
    }
    keys.forEach((key) => setInCache(key.kid, key));
  }
  const jwk = getFromCache(kid);
  if (!jwk) {
    const cacheValues = getCacheValues();
    const jwkKeys = cacheValues.map((jwk2) => jwk2.kid).sort().join(", ");
    throw new TokenVerificationError({
      action: `Go to your Dashboard and validate your secret and public keys are correct. ${TokenVerificationErrorAction.ContactSupport} if the issue persists.`,
      message: `Unable to find a signing key in JWKS that matches the kid='${kid}' of the provided session token. Please make sure that the __session cookie or the HTTP authorization header contain a Clerk-generated session JWT. The following kid is available: ${jwkKeys}`,
      reason: TokenVerificationErrorReason.JWKKidMismatch
    });
  }
  return jwk;
}
__name(loadClerkJWKFromRemote, "loadClerkJWKFromRemote");
async function fetchJWKSFromBAPI(apiUrl, key, apiVersion) {
  if (!key) {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.SetClerkSecretKey,
      message: "Missing Clerk Secret Key or API Key. Go to https://dashboard.clerk.com and get your key for your instance.",
      reason: TokenVerificationErrorReason.RemoteJWKFailedToLoad
    });
  }
  const url = new URL(apiUrl);
  url.pathname = joinPaths(url.pathname, apiVersion, "/jwks");
  const response = await runtime.fetch(url.href, {
    headers: {
      Authorization: `Bearer ${key}`,
      "Clerk-API-Version": SUPPORTED_BAPI_VERSION,
      "Content-Type": "application/json",
      "User-Agent": USER_AGENT
    }
  });
  if (!response.ok) {
    const json = await response.json();
    const invalidSecretKeyError = getErrorObjectByCode(json?.errors, TokenVerificationErrorCode.InvalidSecretKey);
    if (invalidSecretKeyError) {
      const reason = TokenVerificationErrorReason.InvalidSecretKey;
      throw new TokenVerificationError({
        action: TokenVerificationErrorAction.ContactSupport,
        message: invalidSecretKeyError.message,
        reason
      });
    }
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.ContactSupport,
      message: `Error loading Clerk JWKS from ${url.href} with code=${response.status}`,
      reason: TokenVerificationErrorReason.RemoteJWKFailedToLoad
    });
  }
  return response.json();
}
__name(fetchJWKSFromBAPI, "fetchJWKSFromBAPI");
function cacheHasExpired() {
  if (lastUpdatedAt === -1) {
    return false;
  }
  const isExpired = Date.now() - lastUpdatedAt >= MAX_CACHE_LAST_UPDATED_AT_SECONDS * 1e3;
  if (isExpired) {
    cache = {};
  }
  return isExpired;
}
__name(cacheHasExpired, "cacheHasExpired");
var getErrorObjectByCode = /* @__PURE__ */ __name((errors, code) => {
  if (!errors) {
    return null;
  }
  return errors.find((err) => err.code === code);
}, "getErrorObjectByCode");
var M2M_TOKEN_PREFIX = "mt_";
var M2M_SUBJECT_PREFIX = "mch_";
var OAUTH_TOKEN_PREFIX = "oat_";
var API_KEY_PREFIX = "ak_";
var JWT_CATEGORY_M2M_TOKEN = "cl_B7d4PD333AAA";
var MACHINE_TOKEN_PREFIXES = [M2M_TOKEN_PREFIX, OAUTH_TOKEN_PREFIX, API_KEY_PREFIX];
var JwtFormatRegExp = /^[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+$/;
function isJwtFormat(token) {
  return JwtFormatRegExp.test(token);
}
__name(isJwtFormat, "isJwtFormat");
var OAUTH_ACCESS_TOKEN_TYPES = ["at+jwt", "application/at+jwt"];
function isOAuthJwt(token) {
  if (!isJwtFormat(token)) {
    return false;
  }
  try {
    const { data, errors } = decodeJwt(token);
    return !errors && !!data && OAUTH_ACCESS_TOKEN_TYPES.includes(data.header.typ);
  } catch {
    return false;
  }
}
__name(isOAuthJwt, "isOAuthJwt");
function isM2MJwt(token) {
  if (!isJwtFormat(token)) {
    return false;
  }
  try {
    const { data, errors } = decodeJwt(token);
    return !errors && !!data && typeof data.payload.sub === "string" && data.payload.sub.startsWith(M2M_SUBJECT_PREFIX);
  } catch {
    return false;
  }
}
__name(isM2MJwt, "isM2MJwt");
function isMachineJwt(token) {
  return isOAuthJwt(token) || isM2MJwt(token);
}
__name(isMachineJwt, "isMachineJwt");
function isMachineTokenByPrefix(token) {
  return MACHINE_TOKEN_PREFIXES.some((prefix) => token.startsWith(prefix));
}
__name(isMachineTokenByPrefix, "isMachineTokenByPrefix");
function isMachineToken(token) {
  return isMachineTokenByPrefix(token) || isOAuthJwt(token) || isM2MJwt(token);
}
__name(isMachineToken, "isMachineToken");
function getMachineTokenType(token) {
  if (token.startsWith(M2M_TOKEN_PREFIX) || isM2MJwt(token)) {
    return TokenType.M2MToken;
  }
  if (token.startsWith(OAUTH_TOKEN_PREFIX) || isOAuthJwt(token)) {
    return TokenType.OAuthToken;
  }
  if (token.startsWith(API_KEY_PREFIX)) {
    return TokenType.ApiKey;
  }
  throw new Error("Unknown machine token type");
}
__name(getMachineTokenType, "getMachineTokenType");
var isTokenTypeAccepted = /* @__PURE__ */ __name((tokenType, acceptsToken) => {
  if (!tokenType) {
    return false;
  }
  if (acceptsToken === "any") {
    return true;
  }
  const tokenTypes = Array.isArray(acceptsToken) ? acceptsToken : [acceptsToken];
  return tokenTypes.includes(tokenType);
}, "isTokenTypeAccepted");
var MACHINE_TOKEN_TYPES = /* @__PURE__ */ new Set([TokenType.ApiKey, TokenType.M2MToken, TokenType.OAuthToken]);
async function resolveKeyAndVerifyJwt(token, kid, options, headerType) {
  try {
    let key;
    if (options.jwtKey) {
      key = loadClerkJwkFromPem({ kid, pem: options.jwtKey });
    } else if (options.secretKey) {
      key = await loadClerkJWKFromRemote({ ...options, kid });
    } else {
      return {
        error: new MachineTokenVerificationError({
          action: TokenVerificationErrorAction.SetClerkJWTKey,
          message: "Failed to resolve JWK during verification.",
          code: MachineTokenVerificationErrorCode.TokenVerificationFailed
        })
      };
    }
    const { data: payload, errors: verifyErrors } = await verifyJwt(token, {
      ...options,
      key,
      ...headerType ? { headerType } : {}
    });
    if (verifyErrors) {
      return {
        error: new MachineTokenVerificationError({
          code: MachineTokenVerificationErrorCode.TokenVerificationFailed,
          message: verifyErrors[0].message
        })
      };
    }
    return { payload };
  } catch (error) {
    return {
      error: new MachineTokenVerificationError({
        code: MachineTokenVerificationErrorCode.TokenVerificationFailed,
        message: error.message
      })
    };
  }
}
__name(resolveKeyAndVerifyJwt, "resolveKeyAndVerifyJwt");
async function verifyM2MJwt(token, decoded, options) {
  const cat = decoded.header.cat;
  if (cat !== void 0 && cat !== JWT_CATEGORY_M2M_TOKEN) {
    return {
      data: void 0,
      tokenType: TokenType.M2MToken,
      errors: [
        new MachineTokenVerificationError({
          code: MachineTokenVerificationErrorCode.TokenInvalid,
          message: "Invalid M2M JWT category."
        })
      ]
    };
  }
  const result = await resolveKeyAndVerifyJwt(token, decoded.header.kid, options);
  if ("error" in result) {
    return { data: void 0, tokenType: TokenType.M2MToken, errors: [result.error] };
  }
  return {
    data: M2MToken.fromJwtPayload(result.payload, options.clockSkewInMs),
    tokenType: TokenType.M2MToken,
    errors: void 0
  };
}
__name(verifyM2MJwt, "verifyM2MJwt");
async function verifyOAuthJwt(token, decoded, options) {
  const result = await resolveKeyAndVerifyJwt(token, decoded.header.kid, options, OAUTH_ACCESS_TOKEN_TYPES);
  if ("error" in result) {
    return { data: void 0, tokenType: TokenType.OAuthToken, errors: [result.error] };
  }
  return {
    data: IdPOAuthAccessToken.fromJwtPayload(result.payload, options.clockSkewInMs),
    tokenType: TokenType.OAuthToken,
    errors: void 0
  };
}
__name(verifyOAuthJwt, "verifyOAuthJwt");
var basePath17 = "/m2m_tokens";
var _verifyOptions;
var _M2MTokenApi_instances;
var createRequestOptions_fn;
var verifyJwtFormat_fn;
var M2MTokenApi = class extends AbstractAPI {
  static {
    __name(this, "M2MTokenApi");
  }
  /**
   * @param verifyOptions - JWT verification options (secretKey, apiUrl, etc.).
   * Passed explicitly because BuildRequestOptions are captured inside the buildRequest closure
   * and are not accessible from the RequestFunction itself.
   */
  constructor(request, verifyOptions = {}) {
    super(request);
    __privateAdd(this, _M2MTokenApi_instances);
    __privateAdd(this, _verifyOptions);
    __privateSet(this, _verifyOptions, verifyOptions);
  }
  /**
   * Gets a list of M2M tokens for the given machine. By default, the list is returned in descending order by creation date (newest first). This endpoint can be authenticated by either a Machine Secret Key or by a Clerk [Secret Key](!secret-key).
   * - When fetching M2M tokens with a Machine Secret Key, only tokens associated with the authenticated machine can be retrieved.
   * - When fetching M2M tokens with a Clerk Secret Key, tokens for any machine in the instance can be retrieved.
   * @returns A [`PaginatedResourceResponse`](https://clerk.com/docs/reference/backend/types/paginated-resource-response) object with a `data` property containing an array of [`M2MToken`](https://clerk.com/docs/reference/backend/types/backend-m2m-token) objects and a `totalCount` property containing the total number of M2M tokens for the machine.
   */
  async list(queryParams) {
    const { machineSecretKey, ...params } = queryParams;
    const requestOptions = __privateMethod(this, _M2MTokenApi_instances, createRequestOptions_fn).call(this, {
      method: "GET",
      path: basePath17,
      queryParams: params
    }, machineSecretKey);
    return this.request(requestOptions);
  }
  /**
   * Creates a new [M2M token](https://clerk.com/docs/guides/development/machine-auth/m2m-tokens) for the given machine. Must be authenticated by a Machine Secret Key.
   * @returns The created [`M2MToken`](https://clerk.com/docs/reference/backend/types/backend-m2m-token) object.
   */
  async createToken(params) {
    const {
      claims = null,
      machineSecretKey,
      minRemainingTtlSeconds,
      secondsUntilExpiration = null,
      tokenFormat = "opaque"
    } = params || {};
    const requestOptions = __privateMethod(this, _M2MTokenApi_instances, createRequestOptions_fn).call(this, {
      method: "POST",
      path: basePath17,
      bodyParams: {
        secondsUntilExpiration,
        claims,
        minRemainingTtlSeconds,
        tokenFormat
      }
    }, machineSecretKey);
    return this.request(requestOptions);
  }
  /**
   * Revokes an [M2M token](https://clerk.com/docs/guides/development/machine-auth/m2m-tokens). This endpoint can be authenticated by either a Machine Secret Key or by a Clerk [Secret Key](!secret-key).
   * - When revoking M2M tokens with a Machine Secret Key, the token will be revoked using the machine secret key.
   * - When revoking M2M tokens with a Clerk Secret Key, the token will be revoked using the instance secret key.
   * @returns The revoked [`M2MToken`](https://clerk.com/docs/reference/backend/types/backend-m2m-token) object.
   */
  async revokeToken(params) {
    const { m2mTokenId, revocationReason = null, machineSecretKey } = params;
    this.requireId(m2mTokenId);
    const requestOptions = __privateMethod(this, _M2MTokenApi_instances, createRequestOptions_fn).call(this, {
      method: "POST",
      path: joinPaths(basePath17, m2mTokenId, "revoke"),
      bodyParams: {
        revocationReason
      }
    }, machineSecretKey);
    return this.request(requestOptions);
  }
  /**
   * Verifies a [M2M token](https://clerk.com/docs/guides/development/machine-auth/m2m-tokens). Must be authenticated by a Machine Secret Key.
   * @returns The verified [`M2MToken`](https://clerk.com/docs/reference/backend/types/backend-m2m-token) object.
   */
  async verify(params) {
    const { token, machineSecretKey } = params;
    if (isM2MJwt(token)) {
      return __privateMethod(this, _M2MTokenApi_instances, verifyJwtFormat_fn).call(this, token);
    }
    const requestOptions = __privateMethod(this, _M2MTokenApi_instances, createRequestOptions_fn).call(this, {
      method: "POST",
      path: joinPaths(basePath17, "verify"),
      bodyParams: { token }
    }, machineSecretKey);
    return this.request(requestOptions);
  }
};
_verifyOptions = /* @__PURE__ */ new WeakMap();
_M2MTokenApi_instances = /* @__PURE__ */ new WeakSet();
createRequestOptions_fn = /* @__PURE__ */ __name(function(options, machineSecretKey) {
  if (machineSecretKey) {
    return {
      ...options,
      headerParams: {
        ...options.headerParams,
        Authorization: `Bearer ${machineSecretKey}`
      }
    };
  }
  return options;
}, "createRequestOptions_fn");
verifyJwtFormat_fn = /* @__PURE__ */ __name(async function(token) {
  let decoded;
  try {
    const { data, errors } = decodeJwt(token);
    if (errors) {
      throw errors[0];
    }
    decoded = data;
  } catch (e) {
    throw new MachineTokenVerificationError({
      code: MachineTokenVerificationErrorCode.TokenInvalid,
      message: e.message
    });
  }
  const result = await verifyM2MJwt(token, decoded, __privateGet(this, _verifyOptions));
  if (result.errors) {
    throw result.errors[0];
  }
  return result.data;
}, "verifyJwtFormat_fn");
var basePath18 = "/jwks";
var JwksAPI = class extends AbstractAPI {
  static {
    __name(this, "JwksAPI");
  }
  async getJwks() {
    return this.request({
      method: "GET",
      path: basePath18
    });
  }
};
var basePath19 = "/jwt_templates";
var JwtTemplatesApi = class extends AbstractAPI {
  static {
    __name(this, "JwtTemplatesApi");
  }
  async list(params = {}) {
    return this.request({
      method: "GET",
      path: basePath19,
      queryParams: { ...params, paginated: true }
    });
  }
  async get(templateId) {
    this.requireId(templateId);
    return this.request({
      method: "GET",
      path: joinPaths(basePath19, templateId)
    });
  }
  async create(params) {
    return this.request({
      method: "POST",
      path: basePath19,
      bodyParams: params
    });
  }
  async update(params) {
    const { templateId, ...bodyParams } = params;
    this.requireId(templateId);
    return this.request({
      method: "PATCH",
      path: joinPaths(basePath19, templateId),
      bodyParams
    });
  }
  async delete(templateId) {
    this.requireId(templateId);
    return this.request({
      method: "DELETE",
      path: joinPaths(basePath19, templateId)
    });
  }
};
var basePath20 = "/organizations";
var OrganizationAPI = class extends AbstractAPI {
  static {
    __name(this, "OrganizationAPI");
  }
  /**
   * Gets the list of Organizations for the instance. By default, the list is returned in descending order by creation date (newest first).
   * @returns A [`PaginatedResourceResponse`](https://clerk.com/docs/reference/backend/types/paginated-resource-response) object with a `data` property containing an array of [`Organization`](https://clerk.com/docs/reference/backend/types/backend-organization) objects and a `totalCount` property containing the total number of Organizations for the instance.
   */
  async getOrganizationList(params) {
    return this.request({
      method: "GET",
      path: basePath20,
      queryParams: params
    });
  }
  /** Creates an [`Organization`](https://clerk.com/docs/reference/backend/types/backend-organization). */
  async createOrganization(params) {
    return this.request({
      method: "POST",
      path: basePath20,
      bodyParams: params
    });
  }
  /** Gets an [Organization](https://clerk.com/docs/reference/backend/types/backend-organization). */
  async getOrganization(params) {
    const { includeMembersCount } = params;
    const organizationIdOrSlug = "organizationId" in params ? params.organizationId : params.slug;
    this.requireId(organizationIdOrSlug);
    return this.request({
      method: "GET",
      path: joinPaths(basePath20, organizationIdOrSlug),
      queryParams: {
        includeMembersCount
      }
    });
  }
  /**
   * Updates an [Organization](https://clerk.com/docs/reference/backend/types/backend-organization).
   * @param organizationId - The ID of the Organization to update.
   * @param params - The parameters to update the Organization with.
   * @returns The updated [Organization](https://clerk.com/docs/reference/backend/types/backend-organization).
   */
  async updateOrganization(organizationId, params) {
    this.requireId(organizationId);
    const { publicMetadata, privateMetadata, ...rest } = params;
    const hasMetadata = publicMetadata !== void 0 || privateMetadata !== void 0;
    const hasRest = Object.keys(rest).length > 0;
    if (hasMetadata) {
      deprecated(
        "updateOrganization(organizationId, { publicMetadata | privateMetadata })",
        "Use updateOrganizationMetadata for partial updates (merge) or replaceOrganizationMetadata for full replacement."
      );
    }
    if (!hasMetadata) {
      return this.request({
        method: "PATCH",
        path: joinPaths(basePath20, organizationId),
        bodyParams: rest
      });
    }
    if (hasRest) {
      await this.request({
        method: "PATCH",
        path: joinPaths(basePath20, organizationId),
        bodyParams: rest
      });
    }
    return this.request({
      method: "PUT",
      path: joinPaths(basePath20, organizationId, "metadata"),
      bodyParams: { publicMetadata, privateMetadata }
    });
  }
  /**
   * Updates the logo of the given Organization.
   * @param organizationId - The ID of the Organization to update the logo for.
   * @param params - The parameters to update the logo with.
   * @returns The updated [`Organization`](https://clerk.com/docs/reference/backend/types/backend-organization).
   */
  async updateOrganizationLogo(organizationId, params) {
    this.requireId(organizationId);
    const formData = new runtime.FormData();
    formData.append("file", params?.file);
    if (params?.uploaderUserId) {
      formData.append("uploader_user_id", params?.uploaderUserId);
    }
    return this.request({
      method: "PUT",
      path: joinPaths(basePath20, organizationId, "logo"),
      formData
    });
  }
  /**
   * Deletes the logo of the given Organization.
   * @param organizationId - The ID of the Organization to delete the logo for.
   * @returns The deleted [`Organization`](https://clerk.com/docs/reference/backend/types/backend-organization).
   */
  async deleteOrganizationLogo(organizationId) {
    this.requireId(organizationId);
    return this.request({
      method: "DELETE",
      path: joinPaths(basePath20, organizationId, "logo")
    });
  }
  /**
   * Updates the metadata for the given Organization, by merging existing values with the provided parameters.
   *
   * A "deep" merge will be performed - "deep" means that any nested JSON objects will be merged as well. You can remove metadata keys at any level by setting their value to `null`.
   *
   * @param organizationId - The ID of the Organization to update the metadata for.
   * @param params - The parameters to update the metadata with.
   * @returns The updated [`Organization`](https://clerk.com/docs/reference/backend/types/backend-organization).
   *
   * > [!TIP]
   * > If you want to fully replace the existing metadata instead of merging, use [`replaceOrganizationMetadata()`](https://clerk.com/docs/reference/backend/organization/replace-organization-metadata).
   */
  async updateOrganizationMetadata(organizationId, params) {
    this.requireId(organizationId);
    return this.request({
      method: "PATCH",
      path: joinPaths(basePath20, organizationId, "metadata"),
      bodyParams: params
    });
  }
  /**
   * Replaces the metadata associated with the specified Organization. Unlike [`updateOrganizationMetadata()`](/docs/reference/backend/organization/update-organization-metadata), which deep-merges into the existing metadata, this method uses replace semantics: when a metadata field is provided, its previous value is overwritten in full with no merging at any level.
   *
   * The distinction is at two layers:
   * - **Top-level field omission preserves the existing value.** Each top-level field (`publicMetadata`, `privateMetadata`) is handled independently. If you don't include a field in the request, the stored value for that field is left untouched.
   * - **The value inside a provided field is replaced in full.** When you do include a field, its previous content is discarded — any nested keys present before but absent in the new value are dropped. There is no merge.
   *
   * For the provided field, you can also send:
   * - `{}` (empty object) to clear the field.
   * - `null` to overwrite the field with a JSON `null` value. Prefer `{}` unless you specifically need a stored `null`.
   * @param organizationId - The ID of the Organization to replace the metadata for.
   * @param params - The metadata to replace.
   * @returns The updated [`Organization`](https://clerk.com/docs/reference/backend/types/backend-organization).
   */
  async replaceOrganizationMetadata(organizationId, params) {
    this.requireId(organizationId);
    return this.request({
      method: "PUT",
      path: joinPaths(basePath20, organizationId, "metadata"),
      bodyParams: params
    });
  }
  /**
   * Deletes the given Organization.
   * @param organizationId - The ID of the Organization to delete.
   * @returns The deleted [`Organization`](https://clerk.com/docs/reference/backend/types/backend-organization).
   */
  async deleteOrganization(organizationId) {
    this.requireId(organizationId);
    return this.request({
      method: "DELETE",
      path: joinPaths(basePath20, organizationId)
    });
  }
  /**
   * Gets the list of Organization memberships for the specified Organization. By default, the list is returned in descending order by creation date (newest first).
   *
   * @returns A [`PaginatedResourceResponse`](https://clerk.com/docs/reference/backend/types/paginated-resource-response) object with a `data` property containing an array of [`OrganizationMembership`](https://clerk.com/docs/reference/backend/types/backend-organization-membership) objects and a `totalCount` property containing the total number of Organization memberships for the Organization.
   *
   * > [!TIP]
   * > To get the list of Organization memberships **for your instance**, use [`getInstanceOrganizationMembershipList()`](/docs/reference/backend/organization/get-instance-organization-membership-list).
   */
  async getOrganizationMembershipList(params) {
    const { organizationId, ...queryParams } = params;
    this.requireId(organizationId);
    return this.request({
      method: "GET",
      path: joinPaths(basePath20, organizationId, "memberships"),
      queryParams
    });
  }
  /**
   * Gets the list of Organization memberships for the instance. By default, the list is returned in descending order by creation date (newest first).
   *
   * @returns A [`PaginatedResourceResponse`](https://clerk.com/docs/reference/backend/types/paginated-resource-response) object with a `data` property containing an array of [`OrganizationMembership`](https://clerk.com/docs/reference/backend/types/backend-organization-membership) objects and a `totalCount` property containing the total number of Organization memberships for the instance.
   *
   * > [!TIP]
   * > To get the list of Organization memberships **for a specific Organization**, use [`getOrganizationMembershipList()`](/docs/reference/backend/organization/get-organization-membership-list).
   */
  async getInstanceOrganizationMembershipList(params) {
    return this.request({
      method: "GET",
      path: "/organization_memberships",
      queryParams: params
    });
  }
  /**
   * Creates a membership to an Organization for a user directly (circumventing the need for an invitation).
   * @returns The newly created [`OrganizationMembership`](https://clerk.com/docs/reference/backend/types/backend-organization-membership) object.
   */
  async createOrganizationMembership(params) {
    const { organizationId, ...bodyParams } = params;
    this.requireId(organizationId);
    return this.request({
      method: "POST",
      path: joinPaths(basePath20, organizationId, "memberships"),
      bodyParams
    });
  }
  /**
   * Updates a user's [`OrganizationMembership`](https://clerk.com/docs/reference/backend/types/backend-organization-membership).
   * @returns The updated [`OrganizationMembership`](https://clerk.com/docs/reference/backend/types/backend-organization-membership) object.
   */
  async updateOrganizationMembership(params) {
    const { organizationId, userId, ...bodyParams } = params;
    this.requireId(organizationId);
    return this.request({
      method: "PATCH",
      path: joinPaths(basePath20, organizationId, "memberships", userId),
      bodyParams
    });
  }
  /**
   * Updates the metadata for the given Organization membership, by merging existing values with the provided parameters.
   *
   * A "deep" merge will be performed - "deep" means that any nested JSON objects will be merged as well. You can remove metadata keys at any level by setting their value to `null`.
   *
   * @returns The updated [`OrganizationMembership`](https://clerk.com/docs/reference/backend/types/backend-organization-membership).
   */
  async updateOrganizationMembershipMetadata(params) {
    const { organizationId, userId, ...bodyParams } = params;
    return this.request({
      method: "PATCH",
      path: joinPaths(basePath20, organizationId, "memberships", userId, "metadata"),
      bodyParams
    });
  }
  /**
   * Removes a user from the given Organization.
   * @param organizationId - The ID of the Organization to remove the user from.
   * @param userId - The ID of the user to remove from the Organization.
   * @returns The deleted [`OrganizationMembership`](https://clerk.com/docs/reference/backend/types/backend-organization-membership).
   */
  async deleteOrganizationMembership(params) {
    const { organizationId, userId } = params;
    this.requireId(organizationId);
    return this.request({
      method: "DELETE",
      path: joinPaths(basePath20, organizationId, "memberships", userId)
    });
  }
  /**
   * Gets the list of Organization invitations for the specified Organization.
   * @returns A [`PaginatedResourceResponse`](https://clerk.com/docs/reference/backend/types/paginated-resource-response) object with a `data` property containing an array of [`OrganizationInvitation`](https://clerk.com/docs/reference/backend/types/backend-organization-invitation) objects and a `totalCount` property containing the total number of Organization invitations for the Organization.
   */
  async getOrganizationInvitationList(params) {
    const { organizationId, ...queryParams } = params;
    this.requireId(organizationId);
    return this.request({
      method: "GET",
      path: joinPaths(basePath20, organizationId, "invitations"),
      queryParams
    });
  }
  /**
   * Creates an invitation for a user to join an Organization.
   * @returns The newly created [`OrganizationInvitation`](https://clerk.com/docs/reference/backend/types/backend-organization-invitation) object.
   */
  async createOrganizationInvitation(params) {
    const { organizationId, ...bodyParams } = params;
    this.requireId(organizationId);
    return this.request({
      method: "POST",
      path: joinPaths(basePath20, organizationId, "invitations"),
      bodyParams
    });
  }
  /** Creates multiple invitations for users to join an Organization.
   * @param organizationId - The ID of the Organization to create the invitations for.
   * @param params - The parameters to create the invitations with.
   * @returns A [`PaginatedResourceResponse`](https://clerk.com/docs/reference/backend/types/paginated-resource-response) object with a `data` property containing an array of [`OrganizationInvitation`](https://clerk.com/docs/reference/backend/types/backend-organization-invitation) objects and a `totalCount` property containing the total number of Organization invitations.
   */
  async createOrganizationInvitationBulk(organizationId, params) {
    this.requireId(organizationId);
    return this.request({
      method: "POST",
      path: joinPaths(basePath20, organizationId, "invitations", "bulk"),
      bodyParams: params
    });
  }
  /** Gets an [`OrganizationInvitation`](https://clerk.com/docs/reference/backend/types/backend-organization-invitation). */
  async getOrganizationInvitation(params) {
    const { organizationId, invitationId } = params;
    this.requireId(organizationId);
    this.requireId(invitationId);
    return this.request({
      method: "GET",
      path: joinPaths(basePath20, organizationId, "invitations", invitationId)
    });
  }
  /**
   * Revokes an invitation from a user for the given Organization.
   * @returns The revoked [`OrganizationInvitation`](https://clerk.com/docs/reference/backend/types/backend-organization-invitation).
   */
  async revokeOrganizationInvitation(params) {
    const { organizationId, invitationId, ...bodyParams } = params;
    this.requireId(organizationId);
    return this.request({
      method: "POST",
      path: joinPaths(basePath20, organizationId, "invitations", invitationId, "revoke"),
      bodyParams
    });
  }
  /**
   * Gets the list of [Verified Domains](https://clerk.com/docs/guides/organizations/add-members/verified-domains) for the given Organization. By default, the list is returned in descending order by creation date (newest first).
   * @returns A [`PaginatedResourceResponse`](https://clerk.com/docs/reference/backend/types/paginated-resource-response) object with a `data` property containing an array of [`OrganizationDomain`](https://clerk.com/docs/reference/backend/types/backend-organization-domain) objects and a `totalCount` property containing the total number of Verified Domains for the Organization.
   */
  async getOrganizationDomainList(params) {
    const { organizationId, ...queryParams } = params;
    this.requireId(organizationId);
    return this.request({
      method: "GET",
      path: joinPaths(basePath20, organizationId, "domains"),
      queryParams
    });
  }
  /**
   * Creates a new [Verified Domain](https://clerk.com/docs/guides/organizations/add-members/verified-domains) for the given Organization. By default, the domain is verified, but can be optionally set to unverified.
   * @returns The newly created [`OrganizationDomain`](https://clerk.com/docs/reference/backend/types/backend-organization-domain) object.
   */
  async createOrganizationDomain(params) {
    const { organizationId, ...bodyParams } = params;
    this.requireId(organizationId);
    return this.request({
      method: "POST",
      path: joinPaths(basePath20, organizationId, "domains"),
      bodyParams: {
        ...bodyParams,
        verified: bodyParams.verified ?? true
      }
    });
  }
  /**
   * Updates a [Verified Domain](https://clerk.com/docs/guides/organizations/add-members/verified-domains) for the given Organization.
   * @returns The updated [`OrganizationDomain`](https://clerk.com/docs/reference/backend/types/backend-organization-domain) object.
   */
  async updateOrganizationDomain(params) {
    const { organizationId, domainId, ...bodyParams } = params;
    this.requireId(organizationId);
    this.requireId(domainId);
    return this.request({
      method: "PATCH",
      path: joinPaths(basePath20, organizationId, "domains", domainId),
      bodyParams
    });
  }
  /**
   * Deletes a [Verified Domain](https://clerk.com/docs/guides/organizations/add-members/verified-domains) for the given Organization.
   * @returns The deleted [`OrganizationDomain`](https://clerk.com/docs/reference/backend/types/backend-organization-domain) object.
   */
  async deleteOrganizationDomain(params) {
    const { organizationId, domainId } = params;
    this.requireId(organizationId);
    this.requireId(domainId);
    return this.request({
      method: "DELETE",
      path: joinPaths(basePath20, organizationId, "domains", domainId)
    });
  }
};
var basePath21 = "/organization_permissions";
var OrganizationPermissionAPI = class extends AbstractAPI {
  static {
    __name(this, "OrganizationPermissionAPI");
  }
  async getOrganizationPermissionList(params = {}) {
    return this.request({
      method: "GET",
      path: basePath21,
      queryParams: params
    });
  }
  async getOrganizationPermission(permissionId) {
    this.requireId(permissionId);
    return this.request({
      method: "GET",
      path: joinPaths(basePath21, permissionId)
    });
  }
  async createOrganizationPermission(params) {
    return this.request({
      method: "POST",
      path: basePath21,
      bodyParams: params
    });
  }
  async updateOrganizationPermission(params) {
    const { permissionId, ...bodyParams } = params;
    this.requireId(permissionId);
    return this.request({
      method: "PATCH",
      path: joinPaths(basePath21, permissionId),
      bodyParams
    });
  }
  async deleteOrganizationPermission(permissionId) {
    this.requireId(permissionId);
    return this.request({
      method: "DELETE",
      path: joinPaths(basePath21, permissionId)
    });
  }
};
var basePath22 = "/organization_roles";
var OrganizationRoleAPI = class extends AbstractAPI {
  static {
    __name(this, "OrganizationRoleAPI");
  }
  async getOrganizationRoleList(params = {}) {
    return this.request({
      method: "GET",
      path: basePath22,
      queryParams: params
    });
  }
  async getOrganizationRole(organizationRoleId) {
    this.requireId(organizationRoleId);
    return this.request({
      method: "GET",
      path: joinPaths(basePath22, organizationRoleId)
    });
  }
  async createOrganizationRole(params) {
    return this.request({
      method: "POST",
      path: basePath22,
      bodyParams: params
    });
  }
  async updateOrganizationRole(params) {
    const { organizationRoleId, ...bodyParams } = params;
    this.requireId(organizationRoleId);
    return this.request({
      method: "PATCH",
      path: joinPaths(basePath22, organizationRoleId),
      bodyParams
    });
  }
  async deleteOrganizationRole(organizationRoleId) {
    this.requireId(organizationRoleId);
    return this.request({
      method: "DELETE",
      path: joinPaths(basePath22, organizationRoleId)
    });
  }
  async assignPermissionToOrganizationRole(params) {
    const { organizationRoleId, permissionId } = params;
    this.requireId(organizationRoleId);
    this.requireId(permissionId);
    return this.request({
      method: "POST",
      path: joinPaths(basePath22, organizationRoleId, "permissions", permissionId)
    });
  }
  async removePermissionFromOrganizationRole(params) {
    const { organizationRoleId, permissionId } = params;
    this.requireId(organizationRoleId);
    this.requireId(permissionId);
    return this.request({
      method: "DELETE",
      path: joinPaths(basePath22, organizationRoleId, "permissions", permissionId)
    });
  }
};
var basePath23 = "/oauth_applications";
var OAuthApplicationsApi = class extends AbstractAPI {
  static {
    __name(this, "OAuthApplicationsApi");
  }
  /**
   * Gets a list of OAuth applications for the instance. By default, the list is returned in descending order by creation date (newest first).
   * @param params - The parameters to get the OAuth applications with.
   * @returns A [`PaginatedResourceResponse`](https://clerk.com/docs/reference/backend/types/paginated-resource-response) object with a `data` property containing an array of [`OAuthApplication`](https://clerk.com/docs/reference/backend/types/backend-oauth-application) objects and a `totalCount` property containing the total number of OAuth applications.
   */
  async list(params = {}) {
    return this.request({
      method: "GET",
      path: basePath23,
      queryParams: params
    });
  }
  /**
   * Gets the given OAuth application.
   * @param oauthApplicationId - The ID of the OAuth application to get.
   * @returns The [`OAuthApplication`](https://clerk.com/docs/reference/backend/types/backend-oauth-application) object.
   */
  async get(oauthApplicationId) {
    this.requireId(oauthApplicationId);
    return this.request({
      method: "GET",
      path: joinPaths(basePath23, oauthApplicationId)
    });
  }
  /**
   * Creates a new OAuth application.
   * @param params - The parameters to create the OAuth application with.
   * @returns The created [`OAuthApplication`](https://clerk.com/docs/reference/backend/types/backend-oauth-application) object.
   */
  async create(params) {
    return this.request({
      method: "POST",
      path: basePath23,
      bodyParams: params
    });
  }
  /**
   * Updates the given OAuth application.
   * @returns The updated [`OAuthApplication`](https://clerk.com/docs/reference/backend/types/backend-oauth-application) object.
   */
  async update(params) {
    const { oauthApplicationId, ...bodyParams } = params;
    this.requireId(oauthApplicationId);
    return this.request({
      method: "PATCH",
      path: joinPaths(basePath23, oauthApplicationId),
      bodyParams
    });
  }
  /**
   * Deletes the given OAuth application.
   * @param oauthApplicationId - The ID of the OAuth application to delete.
   * @returns The [`DeletedObject`](https://clerk.com/docs/reference/backend/types/deleted-object) object.
   */
  async delete(oauthApplicationId) {
    this.requireId(oauthApplicationId);
    return this.request({
      method: "DELETE",
      path: joinPaths(basePath23, oauthApplicationId)
    });
  }
  /**
   * Rotates the secret of the given OAuth application. When the client secret is rotated, ensure that you update it in your authorized OAuth clients.
   * @param oauthApplicationId - The ID of the OAuth application to rotate the secret of.
   * @returns The [`OAuthApplication`](https://clerk.com/docs/reference/backend/types/backend-oauth-application) object.
   */
  async rotateSecret(oauthApplicationId) {
    this.requireId(oauthApplicationId);
    return this.request({
      method: "POST",
      path: joinPaths(basePath23, oauthApplicationId, "rotate_secret")
    });
  }
  /**
   * Revokes both the [OAuth access token](!oauth-access-token) and refresh token for the associated grant for the given [`OAuthApplication`](/docs/reference/backend/types/backend-oauth-application). The request may specify either token.
   */
  async revokeToken(params) {
    const { oauthApplicationId, ...bodyParams } = params;
    this.requireId(oauthApplicationId);
    return this.request({
      method: "POST",
      path: joinPaths(basePath23, oauthApplicationId, "revoke_token"),
      bodyParams
    });
  }
};
var basePath24 = "/phone_numbers";
var PhoneNumberAPI = class extends AbstractAPI {
  static {
    __name(this, "PhoneNumberAPI");
  }
  /**
   * Gets the given [`PhoneNumber`](https://clerk.com/docs/reference/backend/types/backend-phone-number).
   * @param phoneNumberId - The ID of the phone number to get.
   */
  async getPhoneNumber(phoneNumberId) {
    this.requireId(phoneNumberId);
    return this.request({
      method: "GET",
      path: joinPaths(basePath24, phoneNumberId)
    });
  }
  /**
   * Creates a new phone number for the given user.
   * @returns The created [`PhoneNumber`](https://clerk.com/docs/reference/backend/types/backend-phone-number) object.
   */
  async createPhoneNumber(params) {
    return this.request({
      method: "POST",
      path: basePath24,
      bodyParams: params
    });
  }
  /**
   * Updates the given phone number.
   * @param phoneNumberId - The ID of the phone number to update.
   * @param params - The parameters to update the phone number.
   * @returns The updated [`PhoneNumber`](https://clerk.com/docs/reference/backend/types/backend-phone-number) object.
   */
  async updatePhoneNumber(phoneNumberId, params = {}) {
    this.requireId(phoneNumberId);
    return this.request({
      method: "PATCH",
      path: joinPaths(basePath24, phoneNumberId),
      bodyParams: params
    });
  }
  /**
   * Deletes the given phone number.
   * @param phoneNumberId - The ID of the phone number to delete.
   * @returns The [`DeletedObject`](https://clerk.com/docs/reference/backend/types/deleted-object) object.
   */
  async deletePhoneNumber(phoneNumberId) {
    this.requireId(phoneNumberId);
    return this.request({
      method: "DELETE",
      path: joinPaths(basePath24, phoneNumberId)
    });
  }
};
var basePath25 = "/proxy_checks";
var ProxyCheckAPI = class extends AbstractAPI {
  static {
    __name(this, "ProxyCheckAPI");
  }
  async verify(params) {
    return this.request({
      method: "POST",
      path: basePath25,
      bodyParams: params
    });
  }
};
var basePath26 = "/redirect_urls";
var RedirectUrlAPI = class extends AbstractAPI {
  static {
    __name(this, "RedirectUrlAPI");
  }
  /**
   * Gets a list of whitelisted redirect URLs for the instance. By default, the list is returned in descending order by creation date (newest first).
   * @returns A [`PaginatedResourceResponse`](https://clerk.com/docs/reference/backend/types/paginated-resource-response) object with a `data` property containing an array of [`RedirectUrl`](https://clerk.com/docs/reference/backend/types/backend-redirect-url) objects and a `totalCount` property containing the total number of redirect URLs.
   */
  async getRedirectUrlList() {
    return this.request({
      method: "GET",
      path: basePath26,
      queryParams: { paginated: true }
    });
  }
  /**
   * Gets the given [`RedirectUrl`](https://clerk.com/docs/reference/backend/types/backend-redirect-url).
   * @param redirectUrlId - The ID of the redirect URL to get.
   */
  async getRedirectUrl(redirectUrlId) {
    this.requireId(redirectUrlId);
    return this.request({
      method: "GET",
      path: joinPaths(basePath26, redirectUrlId)
    });
  }
  /**
   * Creates a new redirect URL for the instance.
   * @returns The created [`RedirectUrl`](https://clerk.com/docs/reference/backend/types/backend-redirect-url) object.
   */
  async createRedirectUrl(params) {
    return this.request({
      method: "POST",
      path: basePath26,
      bodyParams: params
    });
  }
  /**
   * Deletes the given redirect URL.
   * @param redirectUrlId - The ID of the redirect URL to delete.
   * @returns The deleted [`RedirectUrl`](https://clerk.com/docs/reference/backend/types/backend-redirect-url) object.
   */
  async deleteRedirectUrl(redirectUrlId) {
    this.requireId(redirectUrlId);
    return this.request({
      method: "DELETE",
      path: joinPaths(basePath26, redirectUrlId)
    });
  }
};
var basePath27 = "/role_sets";
var RoleSetAPI = class extends AbstractAPI {
  static {
    __name(this, "RoleSetAPI");
  }
  async getRoleSetList(params = {}) {
    return this.request({
      method: "GET",
      path: basePath27,
      queryParams: params
    });
  }
  async getRoleSet(roleSetKeyOrId) {
    this.requireId(roleSetKeyOrId);
    return this.request({
      method: "GET",
      path: joinPaths(basePath27, roleSetKeyOrId)
    });
  }
  async createRoleSet(params) {
    return this.request({
      method: "POST",
      path: basePath27,
      bodyParams: params
    });
  }
  async updateRoleSet(params) {
    const { roleSetKeyOrId, ...bodyParams } = params;
    this.requireId(roleSetKeyOrId);
    return this.request({
      method: "PATCH",
      path: joinPaths(basePath27, roleSetKeyOrId),
      bodyParams
    });
  }
  async addRolesToRoleSet(params) {
    const { roleSetKeyOrId, ...bodyParams } = params;
    this.requireId(roleSetKeyOrId);
    return this.request({
      method: "POST",
      path: joinPaths(basePath27, roleSetKeyOrId, "roles"),
      bodyParams
    });
  }
  async replaceRoleInRoleSet(params) {
    const { roleSetKeyOrId, ...bodyParams } = params;
    this.requireId(roleSetKeyOrId);
    return this.request({
      method: "POST",
      path: joinPaths(basePath27, roleSetKeyOrId, "roles", "replace"),
      bodyParams
    });
  }
  async replaceRoleSet(params) {
    const { roleSetKeyOrId, ...bodyParams } = params;
    this.requireId(roleSetKeyOrId);
    return this.request({
      method: "POST",
      path: joinPaths(basePath27, roleSetKeyOrId, "replace"),
      bodyParams
    });
  }
};
var basePath28 = "/saml_connections";
var SamlConnectionAPI = class extends AbstractAPI {
  static {
    __name(this, "SamlConnectionAPI");
  }
  async getSamlConnectionList(params = {}) {
    return this.request({
      method: "GET",
      path: basePath28,
      queryParams: params
    });
  }
  async createSamlConnection(params) {
    return this.request({
      method: "POST",
      path: basePath28,
      bodyParams: params,
      options: {
        deepSnakecaseBodyParamKeys: true
      }
    });
  }
  async getSamlConnection(samlConnectionId) {
    this.requireId(samlConnectionId);
    return this.request({
      method: "GET",
      path: joinPaths(basePath28, samlConnectionId)
    });
  }
  async updateSamlConnection(samlConnectionId, params = {}) {
    this.requireId(samlConnectionId);
    return this.request({
      method: "PATCH",
      path: joinPaths(basePath28, samlConnectionId),
      bodyParams: params,
      options: {
        deepSnakecaseBodyParamKeys: true
      }
    });
  }
  async deleteSamlConnection(samlConnectionId) {
    this.requireId(samlConnectionId);
    return this.request({
      method: "DELETE",
      path: joinPaths(basePath28, samlConnectionId)
    });
  }
};
var basePath29 = "/sessions";
var SessionAPI = class extends AbstractAPI {
  static {
    __name(this, "SessionAPI");
  }
  /**
   * Gets a list of sessions for either the specified client or user. Requires either `clientId` or `userId` to be provided. By default, the list is returned in descending order by creation date (newest first).
   * @returns A [`PaginatedResourceResponse`](https://clerk.com/docs/reference/backend/types/paginated-resource-response) object with a `data` property containing an array of [`Session`](https://clerk.com/docs/reference/backend/types/backend-session) objects and a `totalCount` property containing the total number of sessions.
   */
  async getSessionList(params = {}) {
    return this.request({
      method: "GET",
      path: basePath29,
      queryParams: { ...params, paginated: true }
    });
  }
  /**
   * Gets the given [`Session`](https://clerk.com/docs/reference/backend/types/backend-session).
   * @param sessionId - The ID of the session to get.
   */
  async getSession(sessionId) {
    this.requireId(sessionId);
    return this.request({
      method: "GET",
      path: joinPaths(basePath29, sessionId)
    });
  }
  /**
   * Creates a new session for the given user.
   * @returns The created [`Session`](https://clerk.com/docs/reference/backend/types/backend-session).
   */
  async createSession(params) {
    return this.request({
      method: "POST",
      path: basePath29,
      bodyParams: params
    });
  }
  /**
   * Revokes the given session. The user will be signed out from the client the session is associated with.
   * @param sessionId - The ID of the session to revoke.
   * @returns The revoked [`Session`](https://clerk.com/docs/reference/backend/types/backend-session).
   */
  async revokeSession(sessionId) {
    this.requireId(sessionId);
    return this.request({
      method: "POST",
      path: joinPaths(basePath29, sessionId, "revoke")
    });
  }
  async verifySession(sessionId, token) {
    this.requireId(sessionId);
    return this.request({
      method: "POST",
      path: joinPaths(basePath29, sessionId, "verify"),
      bodyParams: { token }
    });
  }
  /**
   * Gets a session token or generates a JWT using a specified template that is defined in the [**JWT templates**](https://dashboard.clerk.com/~/jwt-templates) page in the Clerk Dashboard.
   *
   * @param sessionId - The ID of the session to get the token for.
   * @param template - The name of the JWT template configured in the Clerk Dashboard to generate a new token from.
   * @param expiresInSeconds - The expiration time for the token in seconds. If not provided, uses the default expiration.
   *
   * @returns The generated token.
   */
  async getToken(sessionId, template, expiresInSeconds) {
    this.requireId(sessionId);
    const path = template ? joinPaths(basePath29, sessionId, "tokens", template) : joinPaths(basePath29, sessionId, "tokens");
    const requestOptions = {
      method: "POST",
      path
    };
    if (expiresInSeconds !== void 0) {
      requestOptions.bodyParams = { expires_in_seconds: expiresInSeconds };
    }
    return this.request(requestOptions);
  }
  async refreshSession(sessionId, params) {
    this.requireId(sessionId);
    const { suffixed_cookies, ...restParams } = params;
    return this.request({
      method: "POST",
      path: joinPaths(basePath29, sessionId, "refresh"),
      bodyParams: restParams,
      queryParams: { suffixed_cookies }
    });
  }
};
var basePath30 = "/sign_in_tokens";
var SignInTokenAPI = class extends AbstractAPI {
  static {
    __name(this, "SignInTokenAPI");
  }
  /**
   * Creates a new sign-in token for the given user. By default, sign-in tokens expire in 30 days. You can optionally specify a custom expiration time in seconds using the `expiresInSeconds` parameter.
   * @returns The created [`SignInToken`](https://clerk.com/docs/reference/backend/types/backend-sign-in-token) object.
   */
  async createSignInToken(params) {
    return this.request({
      method: "POST",
      path: basePath30,
      bodyParams: params
    });
  }
  /**
   * Revokes the given sign-in token.
   * @param signInTokenId - The ID of the sign-in token to revoke.
   * @returns The revoked [`SignInToken`](https://clerk.com/docs/reference/backend/types/backend-sign-in-token) object.
   */
  async revokeSignInToken(signInTokenId) {
    this.requireId(signInTokenId);
    return this.request({
      method: "POST",
      path: joinPaths(basePath30, signInTokenId, "revoke")
    });
  }
};
var basePath31 = "/sign_ups";
var SignUpAPI = class extends AbstractAPI {
  static {
    __name(this, "SignUpAPI");
  }
  async get(signUpAttemptId) {
    this.requireId(signUpAttemptId);
    return this.request({
      method: "GET",
      path: joinPaths(basePath31, signUpAttemptId)
    });
  }
  async update(params) {
    const { signUpAttemptId, ...bodyParams } = params;
    return this.request({
      method: "PATCH",
      path: joinPaths(basePath31, signUpAttemptId),
      bodyParams
    });
  }
};
var basePath32 = "/testing_tokens";
var TestingTokenAPI = class extends AbstractAPI {
  static {
    __name(this, "TestingTokenAPI");
  }
  /**
   * Creates a [Testing Token](https://clerk.com/docs/guides/development/testing/overview#testing-tokens) for the instance.
   * @returns The created [`TestingToken`](https://clerk.com/docs/reference/backend/types/backend-testing-token) object.
   */
  async createTestingToken() {
    return this.request({
      method: "POST",
      path: basePath32
    });
  }
};
var basePath33 = "/users";
var UserAPI = class extends AbstractAPI {
  static {
    __name(this, "UserAPI");
  }
  /**
   * Retrieves the list of users in your instance. By default, the list is returned in descending order by creation date (newest first).
   * @returns A [`PaginatedResourceResponse`](https://clerk.com/docs/reference/backend/types/paginated-resource-response) object with a `data` property that contains an array of [`User`](https://clerk.com/docs/reference/backend/types/backend-user) objects, and a `totalCount` property that indicates the total number of users in your instance.
   */
  async getUserList(params = {}) {
    const { limit, offset, orderBy, ...userCountParams } = params;
    const [data, totalCount] = await Promise.all([
      this.request({
        method: "GET",
        path: basePath33,
        queryParams: params
      }),
      this.getCount(userCountParams)
    ]);
    return { data, totalCount };
  }
  /**
   * Gets a [`User`](https://clerk.com/docs/reference/backend/types/backend-user) for the specified user ID.
   * @param userId - The ID of the user to retrieve.
   */
  async getUser(userId) {
    this.requireId(userId);
    return this.request({
      method: "GET",
      path: joinPaths(basePath33, userId)
    });
  }
  /**
   * Creates a [`User`](https://clerk.com/docs/reference/backend/types/backend-user) in your instance.
   *
   * Your settings in the [Clerk Dashboard](https://dashboard.clerk.com) determine how you should setup your user model. Anything **Required** will need to be provided when creating a user. Trying to add a field that isn't enabled will result in an error.
   *
   * Any email address and phone number created using this method will be automatically verified.
   *
   * > [!CAUTION]
   * >
   * > This endpoint is [rate limited](/docs/guides/how-clerk-works/system-limits). For development instances, a rate limit rule of **100 requests per 10 seconds** is applied.
   * > For production instances, that limit goes up to **1000 requests per 10 seconds**.
   */
  async createUser(params) {
    return this.request({
      method: "POST",
      path: basePath33,
      bodyParams: params
    });
  }
  /** Updates the given [`User`](https://clerk.com/docs/reference/backend/types/backend-user).
   * @param userId - The ID of the user to update.
   * @param params - The user attributes to update.
   */
  async updateUser(userId, params = {}) {
    this.requireId(userId);
    const { publicMetadata, privateMetadata, unsafeMetadata, ...rest } = params;
    const hasMetadata = publicMetadata !== void 0 || privateMetadata !== void 0 || unsafeMetadata !== void 0;
    const hasRest = Object.keys(rest).length > 0;
    if (hasMetadata) {
      deprecated(
        "updateUser(userId, { publicMetadata | privateMetadata | unsafeMetadata })",
        "Use updateUserMetadata for partial updates (merge) or replaceUserMetadata for full replacement."
      );
    }
    if (!hasMetadata) {
      return this.request({
        method: "PATCH",
        path: joinPaths(basePath33, userId),
        bodyParams: rest
      });
    }
    if (hasRest) {
      await this.request({
        method: "PATCH",
        path: joinPaths(basePath33, userId),
        bodyParams: rest
      });
    }
    return this.request({
      method: "PUT",
      path: joinPaths(basePath33, userId, "metadata"),
      bodyParams: { publicMetadata, privateMetadata, unsafeMetadata }
    });
  }
  async replaceUserEmailAddress(userId, params) {
    this.requireId(userId);
    return this.request({
      method: "PUT",
      path: joinPaths(basePath33, userId, "email_address"),
      bodyParams: params
    });
  }
  async replaceUserPhoneNumber(userId, params) {
    this.requireId(userId);
    return this.request({
      method: "PUT",
      path: joinPaths(basePath33, userId, "phone_number"),
      bodyParams: params
    });
  }
  /**
   * Updates the profile image for the given user. To remove the profile image, see [`deleteUserProfileImage()`](https://clerk.com/docs/reference/backend/user/delete-user-profile-image).
   * @param userId - The ID of the user to update the profile image for.
   * @param params - The file to set as the user's profile image.
   * @returns The updated [`User`](https://clerk.com/docs/reference/backend/types/backend-user).
   */
  async updateUserProfileImage(userId, params) {
    this.requireId(userId);
    const formData = new runtime.FormData();
    formData.append("file", params?.file);
    return this.request({
      method: "POST",
      path: joinPaths(basePath33, userId, "profile_image"),
      formData
    });
  }
  /**
   * Updates the metadata for the given user, by merging existing values with the provided parameters.
   *
   * A "deep" merge will be performed - "deep" means that any nested JSON objects will be merged as well. You can remove metadata keys at any level by setting their value to `null`.
   *
   * > [!TIP]
   * > If you want to fully replace the existing metadata instead of merging, use [`replaceUserMetadata()`](/docs/reference/backend/user/replace-user-metadata).
   * @param userId - The ID of the user to update.
   * @param params - The metadata to update.
   * @returns The updated [`User`](https://clerk.com/docs/reference/backend/types/backend-user).
   */
  async updateUserMetadata(userId, params) {
    this.requireId(userId);
    return this.request({
      method: "PATCH",
      path: joinPaths(basePath33, userId, "metadata"),
      bodyParams: params
    });
  }
  /**
   * Replaces the metadata associated with the specified user. Unlike [`updateUserMetadata()`](/docs/reference/backend/user/update-user-metadata), which deep-merges into the existing metadata, this method uses replace semantics: when a metadata field is provided, its previous value is overwritten in full with no merging at any level.
   *
   * The distinction is at two layers:
   * - **Top-level field omission preserves the existing value.** Each top-level field (`publicMetadata`, `privateMetadata`, `unsafeMetadata`) is handled independently. If you don't include a field in the request, the stored value for that field is left untouched.
   * - **The value inside a provided field is replaced in full.** When you do include a field, its previous content is discarded — any nested keys present before but absent in the new value are dropped. There is no merge.
   *
   * For the provided field, you can also send:
   * - `{}` (empty object) to clear the field.
   * - `null` to overwrite the field with a JSON `null` value. Prefer `{}` unless you specifically need a stored `null`.
   * @param userId - The ID of the user to replace the metadata for.
   * @param params - The metadata to replace.
   * @returns The updated [`User`](https://clerk.com/docs/reference/backend/types/backend-user).
   */
  async replaceUserMetadata(userId, params) {
    this.requireId(userId);
    return this.request({
      method: "PUT",
      path: joinPaths(basePath33, userId, "metadata"),
      bodyParams: params
    });
  }
  /**
   * Deletes the given [`User`](https://clerk.com/docs/reference/backend/types/backend-user).
   * @param userId - The ID of the user to delete.
   */
  async deleteUser(userId) {
    this.requireId(userId);
    return this.request({
      method: "DELETE",
      path: joinPaths(basePath33, userId)
    });
  }
  /**
   * Gets the total number of users in your instance.
   */
  async getCount(params = {}) {
    return this.request({
      method: "GET",
      path: joinPaths(basePath33, "count"),
      queryParams: params
    });
  }
  async getUserOauthAccessToken(userId, provider) {
    this.requireId(userId);
    const hasPrefix = provider.startsWith("oauth_");
    const _provider = hasPrefix ? provider : `oauth_${provider}`;
    if (hasPrefix) {
      deprecated(
        "getUserOauthAccessToken(userId, provider)",
        "Remove the `oauth_` prefix from the `provider` argument."
      );
    }
    return this.request({
      method: "GET",
      path: joinPaths(basePath33, userId, "oauth_access_tokens", _provider),
      queryParams: { paginated: true }
    });
  }
  /**
   * Disable all of a user's MFA methods (e.g. [OTP](!otp) sent via SMS, TOTP on their authenticator app) at once.
   * @param userId - The ID of the user to disable MFA for.
   */
  async disableUserMFA(userId) {
    this.requireId(userId);
    return this.request({
      method: "DELETE",
      path: joinPaths(basePath33, userId, "mfa")
    });
  }
  /**
   * Gets a list of the given user's Organization memberships. By default, the list is returned in descending order by creation date (newest first).
   * @returns A [`PaginatedResourceResponse`](https://clerk.com/docs/reference/backend/types/paginated-resource-response) object with a `data` property that contains an array of [`OrganizationMembership`](https://clerk.com/docs/reference/backend/types/backend-organization-membership) objects, and a `totalCount` property that indicates the total number of Organization memberships for the user.
   */
  async getOrganizationMembershipList(params) {
    const { userId, limit, offset } = params;
    this.requireId(userId);
    return this.request({
      method: "GET",
      path: joinPaths(basePath33, userId, "organization_memberships"),
      queryParams: { limit, offset }
    });
  }
  /**
   * Gets a list of the given user's Organization invitations. By default, the list is returned in descending order by creation date (newest first).
   * @returns A [`PaginatedResourceResponse`](https://clerk.com/docs/reference/backend/types/paginated-resource-response) object with a `data` property that contains an array of [`OrganizationInvitation`](https://clerk.com/docs/reference/backend/types/backend-organization-invitation) objects, and a `totalCount` property that indicates the total number of Organization invitations for the user.
   */
  async getOrganizationInvitationList(params) {
    const { userId, ...queryParams } = params;
    this.requireId(userId);
    return this.request({
      method: "GET",
      path: joinPaths(basePath33, userId, "organization_invitations"),
      queryParams
    });
  }
  /** Check that the user's password matches the supplied input. Useful for custom auth flows and re-verification. */
  async verifyPassword(params) {
    const { userId, password } = params;
    this.requireId(userId);
    return this.request({
      method: "POST",
      path: joinPaths(basePath33, userId, "verify_password"),
      bodyParams: { password }
    });
  }
  /** Verify that the provided TOTP or backup code is valid for the user. Verifying a backup code will result it in being consumed (i.e. it will become invalid). Useful for custom auth flows and re-verification. */
  async verifyTOTP(params) {
    const { userId, code } = params;
    this.requireId(userId);
    return this.request({
      method: "POST",
      path: joinPaths(basePath33, userId, "verify_totp"),
      bodyParams: { code }
    });
  }
  /**
   * Marks the given [`User`](https://clerk.com/docs/reference/backend/types/backend-user) as banned, which means that all their sessions are revoked and they are not allowed to sign in again.
   * @param userId - The ID of the user to ban.
   */
  async banUser(userId) {
    this.requireId(userId);
    return this.request({
      method: "POST",
      path: joinPaths(basePath33, userId, "ban")
    });
  }
  /**
   * Removes the ban mark from the given [`User`](https://clerk.com/docs/reference/backend/types/backend-user), allowing them to sign in again.
   * @param userId - The ID of the user to unban.
   */
  async unbanUser(userId) {
    this.requireId(userId);
    return this.request({
      method: "POST",
      path: joinPaths(basePath33, userId, "unban")
    });
  }
  /**
   * Locks the given [`User`](https://clerk.com/docs/reference/backend/types/backend-user), which means that they are not allowed to sign in again until the lock expires or is manually unlocked. By default, lockout duration is 1 hour, but it can be configured in the application's [**Attack protection**](https://dashboard.clerk.com/~/protect/attack-protection) settings. See the [guide on user locks](https://clerk.com/docs/guides/secure/user-lockout).
   * @param userId - The ID of the user to lock.
   */
  async lockUser(userId) {
    this.requireId(userId);
    return this.request({
      method: "POST",
      path: joinPaths(basePath33, userId, "lock")
    });
  }
  /** Removes a sign-in lock from the given [`User`](https://clerk.com/docs/reference/backend/types/backend-user), allowing them to sign in again. See the [guide on user locks](https://clerk.com/docs/guides/secure/user-lockout).
   * @param userId - The ID of the user to unlock.
   */
  async unlockUser(userId) {
    this.requireId(userId);
    return this.request({
      method: "POST",
      path: joinPaths(basePath33, userId, "unlock")
    });
  }
  /**
   * Deletes a user's profile image.
   * @param userId - The ID of the user to delete the profile image for.
   * @returns The updated [`User`](https://clerk.com/docs/reference/backend/types/backend-user).
   */
  async deleteUserProfileImage(userId) {
    this.requireId(userId);
    return this.request({
      method: "DELETE",
      path: joinPaths(basePath33, userId, "profile_image")
    });
  }
  /**
   * Deletes the passkey identification for a given user and notifies them through email.
   * @returns The [`DeletedObject`](https://clerk.com/docs/reference/backend/types/deleted-object) object.
   */
  async deleteUserPasskey(params) {
    this.requireId(params.userId);
    this.requireId(params.passkeyIdentificationId);
    return this.request({
      method: "DELETE",
      path: joinPaths(basePath33, params.userId, "passkeys", params.passkeyIdentificationId)
    });
  }
  /**
   * Deletes a Web3 wallet identification for the given user.
   * @returns The [`DeletedObject`](https://clerk.com/docs/reference/backend/types/deleted-object) object.
   */
  async deleteUserWeb3Wallet(params) {
    this.requireId(params.userId);
    this.requireId(params.web3WalletIdentificationId);
    return this.request({
      method: "DELETE",
      path: joinPaths(basePath33, params.userId, "web3_wallets", params.web3WalletIdentificationId)
    });
  }
  /**
   * Deletes an external account for the given user.
   * @returns The [`DeletedObject`](https://clerk.com/docs/reference/backend/types/deleted-object) object.
   */
  async deleteUserExternalAccount(params) {
    this.requireId(params.userId);
    this.requireId(params.externalAccountId);
    return this.request({
      method: "DELETE",
      path: joinPaths(basePath33, params.userId, "external_accounts", params.externalAccountId)
    });
  }
  /**
   * Deletes all backup codes for the given user.
   * @param userId - The ID of the user to delete backup codes for.
   */
  async deleteUserBackupCodes(userId) {
    this.requireId(userId);
    return this.request({
      method: "DELETE",
      path: joinPaths(basePath33, userId, "backup_code")
    });
  }
  /**
   * Deletes all of the TOTP secrets for the given user.
   * @param userId - The ID of the user to delete the TOTP secrets for.
   */
  async deleteUserTOTP(userId) {
    this.requireId(userId);
    return this.request({
      method: "DELETE",
      path: joinPaths(basePath33, userId, "totp")
    });
  }
  /**
   * Sets the given user's password as compromised. The user will be prompted to reset their password on their next sign-in. See the [guide on password protection and rules](/docs/guides/secure/password-protection-and-rules#reject-compromised-passwords) for more information.
   * @param userId - The ID of the user to set the password as compromised for.
   * @param params - Other parameters for the request.
   * @returns The updated [`User`](https://clerk.com/docs/reference/backend/types/backend-user).
   */
  async setPasswordCompromised(userId, params = {
    revokeAllSessions: false
  }) {
    this.requireId(userId);
    return this.request({
      method: "POST",
      path: joinPaths(basePath33, userId, "password", "set_compromised"),
      bodyParams: params
    });
  }
  /**
   * Unsets the given user's password as compromised. The user will no longer be prompted to reset their password on their next sign-in. See the [guide on password protection and rules](/docs/guides/secure/password-protection-and-rules#reject-compromised-passwords) for more information.
   * @param userId - The ID of the user to unset the password as compromised for.
   * @returns The updated [`User`](https://clerk.com/docs/reference/backend/types/backend-user).
   */
  async unsetPasswordCompromised(userId) {
    this.requireId(userId);
    return this.request({
      method: "POST",
      path: joinPaths(basePath33, userId, "password", "unset_compromised")
    });
  }
};
var basePath34 = "/waitlist_entries";
var WaitlistEntryAPI = class extends AbstractAPI {
  static {
    __name(this, "WaitlistEntryAPI");
  }
  /**
   * Gets a list of waitlist entries for the instance. By default, the list is returned in descending order by creation date (newest first).
   * @returns A [`PaginatedResourceResponse`](https://clerk.com/docs/reference/backend/types/paginated-resource-response) object with a `data` property containing an array of [`WaitlistEntry`](https://clerk.com/docs/reference/backend/types/backend-waitlist-entry) objects and a `totalCount` property containing the total number of waitlist entries for the instance.
   */
  async list(params = {}) {
    return this.request({
      method: "GET",
      path: basePath34,
      queryParams: params
    });
  }
  /**
   * Create a waitlist entry for the given email address. If the email address is already on the waitlist, no new entry will be created and the existing waitlist entry will be returned.
   * @returns The created or existing [`WaitlistEntry`](https://clerk.com/docs/reference/backend/types/backend-waitlist-entry) object.
   */
  async create(params) {
    return this.request({
      method: "POST",
      path: basePath34,
      bodyParams: params
    });
  }
  /**
   * Creates multiple waitlist entries for the given email addresses. If an email address is already on the waitlist, no new entry will be created and the existing waitlist entry will be returned.
   * @returns An array of created or existing [`WaitlistEntry`](https://clerk.com/docs/reference/backend/types/backend-waitlist-entry) objects.
   */
  async createBulk(params) {
    return this.request({
      method: "POST",
      path: joinPaths(basePath34, "bulk"),
      bodyParams: params
    });
  }
  /**
   * Invites the given waitlist entry.
   * @param id - The waitlist entry ID.
   * @param params - Optional parameters for inviting the waitlist entry.
   * @returns The invited [`WaitlistEntry`](https://clerk.com/docs/reference/backend/types/backend-waitlist-entry) object.
   */
  async invite(id, params = {}) {
    this.requireId(id);
    return this.request({
      method: "POST",
      path: joinPaths(basePath34, id, "invite"),
      bodyParams: params
    });
  }
  /**
   * Rejects the given waitlist entry.
   * @param id - The ID of the waitlist entry to reject.
   * @returns The rejected [`WaitlistEntry`](https://clerk.com/docs/reference/backend/types/backend-waitlist-entry) object.
   */
  async reject(id) {
    this.requireId(id);
    return this.request({
      method: "POST",
      path: joinPaths(basePath34, id, "reject")
    });
  }
  /**
   * Deletes the given pending waitlist entry.
   * @param id - The ID of the waitlist entry to delete.
   * @returns The [`DeletedObject`](https://clerk.com/docs/reference/backend/types/deleted-object) object.
   */
  async delete(id) {
    this.requireId(id);
    return this.request({
      method: "DELETE",
      path: joinPaths(basePath34, id)
    });
  }
};
var basePath35 = "/webhooks";
var WebhookAPI = class extends AbstractAPI {
  static {
    __name(this, "WebhookAPI");
  }
  async createSvixApp() {
    return this.request({
      method: "POST",
      path: joinPaths(basePath35, "svix")
    });
  }
  async generateSvixAuthURL() {
    return this.request({
      method: "POST",
      path: joinPaths(basePath35, "svix_url")
    });
  }
  async deleteSvixApp() {
    return this.request({
      method: "DELETE",
      path: joinPaths(basePath35, "svix")
    });
  }
};
var basePath36 = "/billing";
var organizationBasePath = "/organizations";
var userBasePath = "/users";
var BillingAPI = class extends AbstractAPI {
  static {
    __name(this, "BillingAPI");
  }
  /**
   * Gets the list of Billing Plans for the instance. By default, the list is returned in descending order by creation date (newest first).
   * @returns A [`PaginatedResourceResponse`](https://clerk.com/docs/reference/backend/types/paginated-resource-response) object with a `data` property containing an array of [`BillingPlan`](https://clerk.com/docs/reference/backend/types/billing-plan) objects and a `totalCount` property containing the total number of Billing Plans for the instance.
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  async getPlanList(params) {
    return this.request({
      method: "GET",
      path: joinPaths(basePath36, "plans"),
      queryParams: params
    });
  }
  /**
   * Cancels the given Subscription Item.
   * @param subscriptionItemId - The ID of the Subscription Item to cancel.
   * @param params - The parameters for the request.
   * @returns The cancelled [`BillingSubscriptionItem`](https://clerk.com/docs/reference/backend/types/billing-subscription-item) object.
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  async cancelSubscriptionItem(subscriptionItemId, params) {
    this.requireId(subscriptionItemId);
    return this.request({
      method: "DELETE",
      path: joinPaths(basePath36, "subscription_items", subscriptionItemId),
      queryParams: params
    });
  }
  /**
   * Extends the free trial for the given Subscription Item.
   * @param subscriptionItemId - The ID of the Subscription Item to extend the free trial for.
   * @param params - The parameters for the request.
   * @returns The updated [`BillingSubscriptionItem`](https://clerk.com/docs/reference/backend/types/billing-subscription-item) object.
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  async extendSubscriptionItemFreeTrial(subscriptionItemId, params) {
    this.requireId(subscriptionItemId);
    return this.request({
      method: "POST",
      path: joinPaths("/billing", "subscription_items", subscriptionItemId, "extend_free_trial"),
      bodyParams: params
    });
  }
  /**
   * Gets the [`BillingSubscription`](https://clerk.com/docs/reference/backend/types/billing-subscription) for the given Organization.
   * @param organizationId - The ID of the Organization to get the Billing Subscription for.
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  async getOrganizationBillingSubscription(organizationId) {
    this.requireId(organizationId);
    return this.request({
      method: "GET",
      path: joinPaths(organizationBasePath, organizationId, "billing", "subscription")
    });
  }
  /**
   * Gets the [`BillingSubscription`](https://clerk.com/docs/reference/backend/types/billing-subscription) for the given User.
   * @param userId - The ID of the User to get the Billing Subscription for.
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  async getUserBillingSubscription(userId) {
    this.requireId(userId);
    return this.request({
      method: "GET",
      path: joinPaths(userBasePath, userId, "billing", "subscription")
    });
  }
};
var isObject = /* @__PURE__ */ __name((value) => typeof value === "object" && value !== null, "isObject");
var isObjectCustom = /* @__PURE__ */ __name((value) => isObject(value) && !(value instanceof RegExp) && !(value instanceof Error) && !(value instanceof Date) && !(globalThis.Blob && value instanceof globalThis.Blob), "isObjectCustom");
var mapObjectSkip = /* @__PURE__ */ Symbol("mapObjectSkip");
var _mapObject = /* @__PURE__ */ __name((object, mapper, options, isSeen = /* @__PURE__ */ new WeakMap()) => {
  options = {
    deep: false,
    target: {},
    ...options
  };
  if (isSeen.has(object)) {
    return isSeen.get(object);
  }
  isSeen.set(object, options.target);
  const { target } = options;
  delete options.target;
  const mapArray = /* @__PURE__ */ __name((array) => array.map((element) => isObjectCustom(element) ? _mapObject(element, mapper, options, isSeen) : element), "mapArray");
  if (Array.isArray(object)) {
    return mapArray(object);
  }
  for (const [key, value] of Object.entries(object)) {
    const mapResult = mapper(key, value, object);
    if (mapResult === mapObjectSkip) {
      continue;
    }
    let [newKey, newValue, { shouldRecurse = true } = {}] = mapResult;
    if (newKey === "__proto__") {
      continue;
    }
    if (options.deep && shouldRecurse && isObjectCustom(newValue)) {
      newValue = Array.isArray(newValue) ? mapArray(newValue) : _mapObject(newValue, mapper, options, isSeen);
    }
    target[newKey] = newValue;
  }
  return target;
}, "_mapObject");
function mapObject(object, mapper, options) {
  if (!isObject(object)) {
    throw new TypeError(`Expected an object, got \`${object}\` (${typeof object})`);
  }
  if (Array.isArray(object)) {
    throw new TypeError("Expected an object, got an array");
  }
  return _mapObject(object, mapper, options);
}
__name(mapObject, "mapObject");
var SPLIT_LOWER_UPPER_RE = /([\p{Ll}\d])(\p{Lu})/gu;
var SPLIT_UPPER_UPPER_RE = /(\p{Lu})([\p{Lu}][\p{Ll}])/gu;
var SPLIT_SEPARATE_NUMBER_RE = /(\d)\p{Ll}|(\p{L})\d/u;
var DEFAULT_STRIP_REGEXP = /[^\p{L}\d]+/giu;
var SPLIT_REPLACE_VALUE = "$1\0$2";
var DEFAULT_PREFIX_SUFFIX_CHARACTERS = "";
function split(value) {
  let result = value.trim();
  result = result.replace(SPLIT_LOWER_UPPER_RE, SPLIT_REPLACE_VALUE).replace(SPLIT_UPPER_UPPER_RE, SPLIT_REPLACE_VALUE);
  result = result.replace(DEFAULT_STRIP_REGEXP, "\0");
  let start = 0;
  let end = result.length;
  while (result.charAt(start) === "\0")
    start++;
  if (start === end)
    return [];
  while (result.charAt(end - 1) === "\0")
    end--;
  return result.slice(start, end).split(/\0/g);
}
__name(split, "split");
function splitSeparateNumbers(value) {
  const words = split(value);
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const match2 = SPLIT_SEPARATE_NUMBER_RE.exec(word);
    if (match2) {
      const offset = match2.index + (match2[1] ?? match2[2]).length;
      words.splice(i, 1, word.slice(0, offset), word.slice(offset));
    }
  }
  return words;
}
__name(splitSeparateNumbers, "splitSeparateNumbers");
function noCase(input, options) {
  const [prefix, words, suffix] = splitPrefixSuffix(input, options);
  return prefix + words.map(lowerFactory(options?.locale)).join(options?.delimiter ?? " ") + suffix;
}
__name(noCase, "noCase");
function snakeCase(input, options) {
  return noCase(input, { delimiter: "_", ...options });
}
__name(snakeCase, "snakeCase");
function lowerFactory(locale) {
  return locale === false ? (input) => input.toLowerCase() : (input) => input.toLocaleLowerCase(locale);
}
__name(lowerFactory, "lowerFactory");
function splitPrefixSuffix(input, options = {}) {
  const splitFn = options.split ?? (options.separateNumbers ? splitSeparateNumbers : split);
  const prefixCharacters = options.prefixCharacters ?? DEFAULT_PREFIX_SUFFIX_CHARACTERS;
  const suffixCharacters = options.suffixCharacters ?? DEFAULT_PREFIX_SUFFIX_CHARACTERS;
  let prefixIndex = 0;
  let suffixIndex = input.length;
  while (prefixIndex < input.length) {
    const char = input.charAt(prefixIndex);
    if (!prefixCharacters.includes(char))
      break;
    prefixIndex++;
  }
  while (suffixIndex > prefixIndex) {
    const index = suffixIndex - 1;
    const char = input.charAt(index);
    if (!suffixCharacters.includes(char))
      break;
    suffixIndex = index;
  }
  return [
    input.slice(0, prefixIndex),
    splitFn(input.slice(prefixIndex, suffixIndex)),
    input.slice(suffixIndex)
  ];
}
__name(splitPrefixSuffix, "splitPrefixSuffix");
var PlainObjectConstructor = {}.constructor;
function snakecaseKeys(obj, options) {
  if (Array.isArray(obj)) {
    if (obj.some((item) => item.constructor !== PlainObjectConstructor)) {
      throw new Error("obj must be array of plain objects");
    }
    options = { deep: true, exclude: [], parsingOptions: {}, ...options };
    const convertCase2 = options.snakeCase || ((key) => snakeCase(key, options.parsingOptions));
    return obj.map((item) => {
      return mapObject(item, (key, val) => {
        return [
          matches(options.exclude, key) ? key : convertCase2(key),
          val,
          mapperOptions(key, val, options)
        ];
      }, options);
    });
  } else {
    if (obj.constructor !== PlainObjectConstructor) {
      throw new Error("obj must be an plain object");
    }
  }
  options = { deep: true, exclude: [], parsingOptions: {}, ...options };
  const convertCase = options.snakeCase || ((key) => snakeCase(key, options.parsingOptions));
  return mapObject(obj, (key, val) => {
    return [
      matches(options.exclude, key) ? key : convertCase(key),
      val,
      mapperOptions(key, val, options)
    ];
  }, options);
}
__name(snakecaseKeys, "snakecaseKeys");
function matches(patterns, value) {
  return patterns.some((pattern) => {
    return typeof pattern === "string" ? pattern === value : pattern.test(value);
  });
}
__name(matches, "matches");
function mapperOptions(key, val, options) {
  return options.shouldRecurse ? { shouldRecurse: options.shouldRecurse(key, val) } : void 0;
}
__name(mapperOptions, "mapperOptions");
var snakecase_keys_default = snakecaseKeys;
var AccountlessApplication = class _AccountlessApplication {
  static {
    __name(this, "_AccountlessApplication");
  }
  constructor(publishableKey, secretKey, claimUrl, apiKeysUrl) {
    this.publishableKey = publishableKey;
    this.secretKey = secretKey;
    this.claimUrl = claimUrl;
    this.apiKeysUrl = apiKeysUrl;
  }
  static fromJSON(data) {
    return new _AccountlessApplication(data.publishable_key, data.secret_key, data.claim_url, data.api_keys_url);
  }
};
var AgentTask = class _AgentTask {
  static {
    __name(this, "_AgentTask");
  }
  constructor(agentId, taskId, agentTaskId, url) {
    this.agentId = agentId;
    this.taskId = taskId;
    this.agentTaskId = agentTaskId;
    this.url = url;
  }
  /**
   * Creates an AgentTask instance from a JSON object.
   *
   * @param data - The JSON object containing Agent Task data
   * @returns A new AgentTask instance
   */
  static fromJSON(data) {
    const agentTaskId = data.agent_task_id ?? data.task_id ?? "";
    return new _AgentTask(data.agent_id, agentTaskId, agentTaskId, data.url);
  }
};
var ActorToken = class _ActorToken {
  static {
    __name(this, "_ActorToken");
  }
  constructor(id, status, userId, actor, token, url, createdAt, updatedAt) {
    this.id = id;
    this.status = status;
    this.userId = userId;
    this.actor = actor;
    this.token = token;
    this.url = url;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
  static fromJSON(data) {
    return new _ActorToken(
      data.id,
      data.status,
      data.user_id,
      data.actor,
      data.token,
      data.url,
      data.created_at,
      data.updated_at
    );
  }
};
var AllowlistIdentifier = class _AllowlistIdentifier {
  static {
    __name(this, "_AllowlistIdentifier");
  }
  constructor(id, identifier, identifierType, createdAt, updatedAt, instanceId, invitationId) {
    this.id = id;
    this.identifier = identifier;
    this.identifierType = identifierType;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.instanceId = instanceId;
    this.invitationId = invitationId;
  }
  static fromJSON(data) {
    return new _AllowlistIdentifier(
      data.id,
      data.identifier,
      data.identifier_type,
      data.created_at,
      data.updated_at,
      data.instance_id,
      data.invitation_id
    );
  }
};
var APIKey = class _APIKey {
  static {
    __name(this, "_APIKey");
  }
  constructor(id, type, name, subject, scopes, claims, revoked, revocationReason, expired, expiration, createdBy, description, lastUsedAt, createdAt, updatedAt, secret) {
    this.id = id;
    this.type = type;
    this.name = name;
    this.subject = subject;
    this.scopes = scopes;
    this.claims = claims;
    this.revoked = revoked;
    this.revocationReason = revocationReason;
    this.expired = expired;
    this.expiration = expiration;
    this.createdBy = createdBy;
    this.description = description;
    this.lastUsedAt = lastUsedAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.secret = secret;
  }
  static fromJSON(data) {
    return new _APIKey(
      data.id,
      data.type,
      data.name,
      data.subject,
      data.scopes,
      data.claims,
      data.revoked,
      data.revocation_reason,
      data.expired,
      data.expiration,
      data.created_by,
      data.description,
      data.last_used_at,
      data.created_at,
      data.updated_at,
      data.secret
    );
  }
};
var BlocklistIdentifier = class _BlocklistIdentifier {
  static {
    __name(this, "_BlocklistIdentifier");
  }
  constructor(id, identifier, identifierType, createdAt, updatedAt, instanceId) {
    this.id = id;
    this.identifier = identifier;
    this.identifierType = identifierType;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.instanceId = instanceId;
  }
  static fromJSON(data) {
    return new _BlocklistIdentifier(
      data.id,
      data.identifier,
      data.identifier_type,
      data.created_at,
      data.updated_at,
      data.instance_id
    );
  }
};
var SessionActivity = class _SessionActivity {
  static {
    __name(this, "_SessionActivity");
  }
  constructor(id, isMobile, ipAddress, city, country, browserVersion, browserName, deviceType) {
    this.id = id;
    this.isMobile = isMobile;
    this.ipAddress = ipAddress;
    this.city = city;
    this.country = country;
    this.browserVersion = browserVersion;
    this.browserName = browserName;
    this.deviceType = deviceType;
  }
  static fromJSON(data) {
    return new _SessionActivity(
      data.id,
      data.is_mobile,
      data.ip_address,
      data.city,
      data.country,
      data.browser_version,
      data.browser_name,
      data.device_type
    );
  }
};
var Session = class _Session {
  static {
    __name(this, "_Session");
  }
  constructor(id, clientId, userId, status, lastActiveAt, expireAt, abandonAt, createdAt, updatedAt, lastActiveOrganizationId, latestActivity, actor = null) {
    this.id = id;
    this.clientId = clientId;
    this.userId = userId;
    this.status = status;
    this.lastActiveAt = lastActiveAt;
    this.expireAt = expireAt;
    this.abandonAt = abandonAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.lastActiveOrganizationId = lastActiveOrganizationId;
    this.latestActivity = latestActivity;
    this.actor = actor;
  }
  static fromJSON(data) {
    return new _Session(
      data.id,
      data.client_id,
      data.user_id,
      data.status,
      data.last_active_at,
      data.expire_at,
      data.abandon_at,
      data.created_at,
      data.updated_at,
      data.last_active_organization_id,
      data.latest_activity && SessionActivity.fromJSON(data.latest_activity),
      data.actor
    );
  }
};
var Client = class _Client {
  static {
    __name(this, "_Client");
  }
  constructor(id, sessionIds, sessions, signInId, signUpId, lastActiveSessionId, lastAuthenticationStrategy, createdAt, updatedAt) {
    this.id = id;
    this.sessionIds = sessionIds;
    this.sessions = sessions;
    this.signInId = signInId;
    this.signUpId = signUpId;
    this.lastActiveSessionId = lastActiveSessionId;
    this.lastAuthenticationStrategy = lastAuthenticationStrategy;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
  static fromJSON(data) {
    return new _Client(
      data.id,
      data.session_ids,
      data.sessions.map((x) => Session.fromJSON(x)),
      data.sign_in_id,
      data.sign_up_id,
      data.last_active_session_id,
      data.last_authentication_strategy,
      data.created_at,
      data.updated_at
    );
  }
};
var CnameTarget = class _CnameTarget {
  static {
    __name(this, "_CnameTarget");
  }
  constructor(host, value, required) {
    this.host = host;
    this.value = value;
    this.required = required;
  }
  static fromJSON(data) {
    return new _CnameTarget(data.host, data.value, data.required);
  }
};
var Cookies2 = class _Cookies {
  static {
    __name(this, "_Cookies");
  }
  constructor(cookies) {
    this.cookies = cookies;
  }
  static fromJSON(data) {
    return new _Cookies(data.cookies);
  }
};
var DeletedObject = class _DeletedObject {
  static {
    __name(this, "_DeletedObject");
  }
  constructor(object, id, slug, deleted) {
    this.object = object;
    this.id = id;
    this.slug = slug;
    this.deleted = deleted;
  }
  static fromJSON(data) {
    return new _DeletedObject(data.object, data.id || null, data.slug || null, data.deleted);
  }
};
var Domain = class _Domain {
  static {
    __name(this, "_Domain");
  }
  constructor(id, name, isSatellite, frontendApiUrl, developmentOrigin, cnameTargets, accountsPortalUrl, proxyUrl) {
    this.id = id;
    this.name = name;
    this.isSatellite = isSatellite;
    this.frontendApiUrl = frontendApiUrl;
    this.developmentOrigin = developmentOrigin;
    this.cnameTargets = cnameTargets;
    this.accountsPortalUrl = accountsPortalUrl;
    this.proxyUrl = proxyUrl;
  }
  static fromJSON(data) {
    return new _Domain(
      data.id,
      data.name,
      data.is_satellite,
      data.frontend_api_url,
      data.development_origin,
      data.cname_targets && data.cname_targets.map((x) => CnameTarget.fromJSON(x)),
      data.accounts_portal_url,
      data.proxy_url
    );
  }
};
var Email = class _Email {
  static {
    __name(this, "_Email");
  }
  constructor(id, fromEmailName, emailAddressId, toEmailAddress, subject, body, bodyPlain, status, slug, data, deliveredByClerk, userId) {
    this.id = id;
    this.fromEmailName = fromEmailName;
    this.emailAddressId = emailAddressId;
    this.toEmailAddress = toEmailAddress;
    this.subject = subject;
    this.body = body;
    this.bodyPlain = bodyPlain;
    this.status = status;
    this.slug = slug;
    this.data = data;
    this.deliveredByClerk = deliveredByClerk;
    this.userId = userId;
  }
  static fromJSON(data) {
    return new _Email(
      data.id,
      data.from_email_name,
      data.email_address_id,
      data.to_email_address,
      data.subject,
      data.body,
      data.body_plain,
      data.status,
      data.slug,
      data.data,
      data.delivered_by_clerk,
      data.user_id
    );
  }
};
var IdentificationLink = class _IdentificationLink {
  static {
    __name(this, "_IdentificationLink");
  }
  constructor(id, type) {
    this.id = id;
    this.type = type;
  }
  static fromJSON(data) {
    return new _IdentificationLink(data.id, data.type);
  }
};
var Verification = class _Verification {
  static {
    __name(this, "_Verification");
  }
  constructor(status, strategy, externalVerificationRedirectURL = null, attempts = null, expireAt = null, nonce = null, message = null) {
    this.status = status;
    this.strategy = strategy;
    this.externalVerificationRedirectURL = externalVerificationRedirectURL;
    this.attempts = attempts;
    this.expireAt = expireAt;
    this.nonce = nonce;
    this.message = message;
  }
  static fromJSON(data) {
    return new _Verification(
      data.status,
      data.strategy,
      data.external_verification_redirect_url ? new URL(data.external_verification_redirect_url) : null,
      data.attempts,
      data.expire_at,
      data.nonce
    );
  }
};
var EmailAddress = class _EmailAddress {
  static {
    __name(this, "_EmailAddress");
  }
  constructor(id, emailAddress, verification, linkedTo) {
    this.id = id;
    this.emailAddress = emailAddress;
    this.verification = verification;
    this.linkedTo = linkedTo;
  }
  static fromJSON(data) {
    return new _EmailAddress(
      data.id,
      data.email_address,
      data.verification && Verification.fromJSON(data.verification),
      data.linked_to.map((link) => IdentificationLink.fromJSON(link))
    );
  }
};
var Feature = class _Feature {
  static {
    __name(this, "_Feature");
  }
  constructor(id, name, description, slug, avatarUrl) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.slug = slug;
    this.avatarUrl = avatarUrl;
  }
  static fromJSON(data) {
    return new _Feature(data.id, data.name, data.description ?? null, data.slug, data.avatar_url ?? null);
  }
};
var BillingPlan = class _BillingPlan {
  static {
    __name(this, "_BillingPlan");
  }
  constructor(id, name, slug, description, isDefault, isRecurring, hasBaseFee, publiclyVisible, fee, annualFee, annualMonthlyFee, forPayerType, features, avatarUrl, freeTrialDays, freeTrialEnabled) {
    this.id = id;
    this.name = name;
    this.slug = slug;
    this.description = description;
    this.isDefault = isDefault;
    this.isRecurring = isRecurring;
    this.hasBaseFee = hasBaseFee;
    this.publiclyVisible = publiclyVisible;
    this.fee = fee;
    this.annualFee = annualFee;
    this.annualMonthlyFee = annualMonthlyFee;
    this.forPayerType = forPayerType;
    this.features = features;
    this.avatarUrl = avatarUrl;
    this.freeTrialDays = freeTrialDays;
    this.freeTrialEnabled = freeTrialEnabled;
  }
  static fromJSON(data) {
    const formatAmountJSON = /* @__PURE__ */ __name((fee) => {
      return fee ? {
        amount: fee.amount,
        amountFormatted: fee.amount_formatted,
        currency: fee.currency,
        currencySymbol: fee.currency_symbol
      } : null;
    }, "formatAmountJSON");
    return new _BillingPlan(
      data.id,
      data.name,
      data.slug,
      data.description ?? null,
      data.is_default,
      data.is_recurring,
      data.has_base_fee,
      data.publicly_visible,
      formatAmountJSON(data.fee),
      formatAmountJSON(data.annual_fee),
      formatAmountJSON(data.annual_monthly_fee),
      data.for_payer_type,
      (data.features ?? []).map((feature) => Feature.fromJSON(feature)),
      data.avatar_url,
      data.free_trial_days,
      data.free_trial_enabled
    );
  }
};
var BillingSubscriptionItem = class _BillingSubscriptionItem {
  static {
    __name(this, "_BillingSubscriptionItem");
  }
  constructor(id, status, planPeriod, periodStart, nextPayment, amount, plan, planId, createdAt, updatedAt, periodEnd, canceledAt, pastDueAt, endedAt, payerId, isFreeTrial, lifetimePaid) {
    this.id = id;
    this.status = status;
    this.planPeriod = planPeriod;
    this.periodStart = periodStart;
    this.nextPayment = nextPayment;
    this.amount = amount;
    this.plan = plan;
    this.planId = planId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.periodEnd = periodEnd;
    this.canceledAt = canceledAt;
    this.pastDueAt = pastDueAt;
    this.endedAt = endedAt;
    this.payerId = payerId;
    this.isFreeTrial = isFreeTrial;
    this.lifetimePaid = lifetimePaid;
  }
  static fromJSON(data) {
    function formatAmountJSON(amount) {
      if (!amount) {
        return amount;
      }
      return {
        amount: amount.amount,
        amountFormatted: amount.amount_formatted,
        currency: amount.currency,
        currencySymbol: amount.currency_symbol
      };
    }
    __name(formatAmountJSON, "formatAmountJSON");
    return new _BillingSubscriptionItem(
      data.id,
      data.status,
      data.plan_period,
      data.period_start,
      data.next_payment,
      formatAmountJSON(data.amount) ?? void 0,
      data.plan ? BillingPlan.fromJSON(data.plan) : null,
      data.plan_id ?? null,
      data.created_at,
      data.updated_at,
      data.period_end,
      data.canceled_at,
      data.past_due_at,
      data.ended_at,
      data.payer_id,
      data.is_free_trial,
      formatAmountJSON(data.lifetime_paid) ?? void 0
    );
  }
};
var BillingSubscription = class _BillingSubscription {
  static {
    __name(this, "_BillingSubscription");
  }
  constructor(id, status, payerId, createdAt, updatedAt, activeAt, pastDueAt, subscriptionItems, nextPayment, eligibleForFreeTrial) {
    this.id = id;
    this.status = status;
    this.payerId = payerId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.activeAt = activeAt;
    this.pastDueAt = pastDueAt;
    this.subscriptionItems = subscriptionItems;
    this.nextPayment = nextPayment;
    this.eligibleForFreeTrial = eligibleForFreeTrial;
  }
  static fromJSON(data) {
    const nextPayment = data.next_payment ? {
      date: data.next_payment.date,
      amount: {
        amount: data.next_payment.amount.amount,
        amountFormatted: data.next_payment.amount.amount_formatted,
        currency: data.next_payment.amount.currency,
        currencySymbol: data.next_payment.amount.currency_symbol
      }
    } : null;
    return new _BillingSubscription(
      data.id,
      data.status,
      data.payer_id,
      data.created_at,
      data.updated_at,
      data.active_at ?? null,
      data.past_due_at ?? null,
      (data.subscription_items ?? []).map((item) => BillingSubscriptionItem.fromJSON(item)),
      nextPayment,
      data.eligible_for_free_trial ?? false
    );
  }
};
var EnterpriseAccountConnection = class _EnterpriseAccountConnection {
  static {
    __name(this, "_EnterpriseAccountConnection");
  }
  constructor(id, active, allowIdpInitiated, allowSubdomains, disableAdditionalIdentifications, domain, logoPublicUrl, name, protocol, provider, syncUserAttributes, createdAt, updatedAt) {
    this.id = id;
    this.active = active;
    this.allowIdpInitiated = allowIdpInitiated;
    this.allowSubdomains = allowSubdomains;
    this.disableAdditionalIdentifications = disableAdditionalIdentifications;
    this.domain = domain;
    this.logoPublicUrl = logoPublicUrl;
    this.name = name;
    this.protocol = protocol;
    this.provider = provider;
    this.syncUserAttributes = syncUserAttributes;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
  static fromJSON(data) {
    return new _EnterpriseAccountConnection(
      data.id,
      data.active,
      data.allow_idp_initiated,
      data.allow_subdomains,
      data.disable_additional_identifications,
      data.domain,
      data.logo_public_url,
      data.name,
      data.protocol,
      data.provider,
      data.sync_user_attributes,
      data.created_at,
      data.updated_at
    );
  }
};
var EnterpriseAccount = class _EnterpriseAccount {
  static {
    __name(this, "_EnterpriseAccount");
  }
  constructor(id, active, emailAddress, enterpriseConnection, firstName, lastName, protocol, provider, providerUserId, publicMetadata, verification, lastAuthenticatedAt, enterpriseConnectionId) {
    this.id = id;
    this.active = active;
    this.emailAddress = emailAddress;
    this.enterpriseConnection = enterpriseConnection;
    this.firstName = firstName;
    this.lastName = lastName;
    this.protocol = protocol;
    this.provider = provider;
    this.providerUserId = providerUserId;
    this.publicMetadata = publicMetadata;
    this.verification = verification;
    this.lastAuthenticatedAt = lastAuthenticatedAt;
    this.enterpriseConnectionId = enterpriseConnectionId;
  }
  static fromJSON(data) {
    return new _EnterpriseAccount(
      data.id,
      data.active,
      data.email_address,
      data.enterprise_connection && EnterpriseAccountConnection.fromJSON(data.enterprise_connection),
      data.first_name,
      data.last_name,
      data.protocol,
      data.provider,
      data.provider_user_id,
      data.public_metadata,
      data.verification && Verification.fromJSON(data.verification),
      data.last_authenticated_at,
      data.enterprise_connection_id
    );
  }
};
var EnterpriseConnectionSamlConnection = class _EnterpriseConnectionSamlConnection {
  static {
    __name(this, "_EnterpriseConnectionSamlConnection");
  }
  constructor(id, name, idpEntityId, idpSsoUrl, idpCertificate, idpCertificateIssuedAt, idpCertificateExpiresAt, idpMetadataUrl, idpMetadata, acsUrl, spEntityId, spMetadataUrl, syncUserAttributes, allowSubdomains, allowIdpInitiated) {
    this.id = id;
    this.name = name;
    this.idpEntityId = idpEntityId;
    this.idpSsoUrl = idpSsoUrl;
    this.idpCertificate = idpCertificate;
    this.idpCertificateIssuedAt = idpCertificateIssuedAt;
    this.idpCertificateExpiresAt = idpCertificateExpiresAt;
    this.idpMetadataUrl = idpMetadataUrl;
    this.idpMetadata = idpMetadata;
    this.acsUrl = acsUrl;
    this.spEntityId = spEntityId;
    this.spMetadataUrl = spMetadataUrl;
    this.syncUserAttributes = syncUserAttributes;
    this.allowSubdomains = allowSubdomains;
    this.allowIdpInitiated = allowIdpInitiated;
  }
  static fromJSON(data) {
    return new _EnterpriseConnectionSamlConnection(
      data.id,
      data.name,
      data.idp_entity_id,
      data.idp_sso_url,
      data.idp_certificate,
      data.idp_certificate_issued_at,
      data.idp_certificate_expires_at,
      data.idp_metadata_url,
      data.idp_metadata,
      data.acs_url,
      data.sp_entity_id,
      data.sp_metadata_url,
      data.sync_user_attributes,
      data.allow_subdomains,
      data.allow_idp_initiated
    );
  }
};
var EnterpriseConnectionOauthConfig = class _EnterpriseConnectionOauthConfig {
  static {
    __name(this, "_EnterpriseConnectionOauthConfig");
  }
  constructor(id, name, clientId, discoveryUrl, logoPublicUrl, createdAt, updatedAt) {
    this.id = id;
    this.name = name;
    this.clientId = clientId;
    this.discoveryUrl = discoveryUrl;
    this.logoPublicUrl = logoPublicUrl;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
  static fromJSON(data) {
    return new _EnterpriseConnectionOauthConfig(
      data.id,
      data.name,
      data.client_id,
      data.discovery_url,
      data.logo_public_url,
      data.created_at,
      data.updated_at
    );
  }
};
var EnterpriseConnection = class _EnterpriseConnection {
  static {
    __name(this, "_EnterpriseConnection");
  }
  constructor(id, name, domains, organizationId, active, syncUserAttributes, allowSubdomains, disableAdditionalIdentifications, createdAt, updatedAt, samlConnection, oauthConfig) {
    this.id = id;
    this.name = name;
    this.domains = domains;
    this.organizationId = organizationId;
    this.active = active;
    this.syncUserAttributes = syncUserAttributes;
    this.allowSubdomains = allowSubdomains;
    this.disableAdditionalIdentifications = disableAdditionalIdentifications;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.samlConnection = samlConnection;
    this.oauthConfig = oauthConfig;
  }
  static fromJSON(data) {
    return new _EnterpriseConnection(
      data.id,
      data.name,
      data.domains,
      data.organization_id,
      data.active,
      data.sync_user_attributes,
      data.allow_subdomains,
      data.disable_additional_identifications,
      data.created_at,
      data.updated_at,
      data.saml_connection != null ? EnterpriseConnectionSamlConnection.fromJSON(data.saml_connection) : null,
      data.oauth_config != null ? EnterpriseConnectionOauthConfig.fromJSON(data.oauth_config) : null
    );
  }
};
var ExternalAccount = class _ExternalAccount {
  static {
    __name(this, "_ExternalAccount");
  }
  constructor(id, provider, providerUserId, identificationId, externalId, approvedScopes, emailAddress, firstName, lastName, imageUrl, username, phoneNumber, publicMetadata = {}, label, verification, externalAccountId) {
    this.id = id;
    this.provider = provider;
    this.providerUserId = providerUserId;
    this.identificationId = identificationId;
    this.externalId = externalId;
    this.approvedScopes = approvedScopes;
    this.emailAddress = emailAddress;
    this.firstName = firstName;
    this.lastName = lastName;
    this.imageUrl = imageUrl;
    this.username = username;
    this.phoneNumber = phoneNumber;
    this.publicMetadata = publicMetadata;
    this.label = label;
    this.verification = verification;
    this.externalAccountId = externalAccountId;
  }
  static fromJSON(data) {
    return new _ExternalAccount(
      data.id,
      data.provider,
      data.provider_user_id,
      data.identification_id,
      data.provider_user_id,
      data.approved_scopes,
      data.email_address,
      data.first_name,
      data.last_name,
      data.image_url || "",
      data.username,
      data.phone_number,
      data.public_metadata,
      data.label,
      data.verification && Verification.fromJSON(data.verification),
      data.external_account_id
    );
  }
};
var Instance = class _Instance {
  static {
    __name(this, "_Instance");
  }
  constructor(id, environmentType, allowedOrigins) {
    this.id = id;
    this.environmentType = environmentType;
    this.allowedOrigins = allowedOrigins;
  }
  static fromJSON(data) {
    return new _Instance(data.id, data.environment_type, data.allowed_origins);
  }
};
var InstanceRestrictions = class _InstanceRestrictions {
  static {
    __name(this, "_InstanceRestrictions");
  }
  constructor(allowlist, blocklist, blockEmailSubaddresses, blockDisposableEmailDomains, ignoreDotsForGmailAddresses) {
    this.allowlist = allowlist;
    this.blocklist = blocklist;
    this.blockEmailSubaddresses = blockEmailSubaddresses;
    this.blockDisposableEmailDomains = blockDisposableEmailDomains;
    this.ignoreDotsForGmailAddresses = ignoreDotsForGmailAddresses;
  }
  static fromJSON(data) {
    return new _InstanceRestrictions(
      data.allowlist,
      data.blocklist,
      data.block_email_subaddresses,
      data.block_disposable_email_domains,
      data.ignore_dots_for_gmail_addresses
    );
  }
};
var InstanceSettings = class _InstanceSettings {
  static {
    __name(this, "_InstanceSettings");
  }
  constructor(id, restrictedToAllowlist, fromEmailAddress, progressiveSignUp, enhancedEmailDeliverability) {
    this.id = id;
    this.restrictedToAllowlist = restrictedToAllowlist;
    this.fromEmailAddress = fromEmailAddress;
    this.progressiveSignUp = progressiveSignUp;
    this.enhancedEmailDeliverability = enhancedEmailDeliverability;
  }
  static fromJSON(data) {
    return new _InstanceSettings(
      data.id,
      data.restricted_to_allowlist,
      data.from_email_address,
      data.progressive_sign_up,
      data.enhanced_email_deliverability
    );
  }
};
var Invitation = class _Invitation {
  static {
    __name(this, "_Invitation");
  }
  constructor(id, emailAddress, publicMetadata, createdAt, updatedAt, status, url, revoked) {
    this.id = id;
    this.emailAddress = emailAddress;
    this.publicMetadata = publicMetadata;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.status = status;
    this.url = url;
    this.revoked = revoked;
    this._raw = null;
  }
  get raw() {
    return this._raw;
  }
  static fromJSON(data) {
    const res = new _Invitation(
      data.id,
      data.email_address,
      data.public_metadata,
      data.created_at,
      data.updated_at,
      data.status,
      data.url,
      data.revoked
    );
    res._raw = data;
    return res;
  }
};
var ObjectType = {
  AccountlessApplication: "accountless_application",
  ActorToken: "actor_token",
  AgentTask: "agent_task",
  AllowlistIdentifier: "allowlist_identifier",
  ApiKey: "api_key",
  BlocklistIdentifier: "blocklist_identifier",
  Client: "client",
  Cookies: "cookies",
  Domain: "domain",
  Email: "email",
  EnterpriseAccount: "enterprise_account",
  EnterpriseConnection: "enterprise_connection",
  EmailAddress: "email_address",
  ExternalAccount: "external_account",
  FacebookAccount: "facebook_account",
  GoogleAccount: "google_account",
  Instance: "instance",
  InstanceRestrictions: "instance_restrictions",
  InstanceSettings: "instance_settings",
  Invitation: "invitation",
  Machine: "machine",
  MachineScope: "machine_scope",
  MachineSecretKey: "machine_secret_key",
  M2MToken: "machine_to_machine_token",
  JwtTemplate: "jwt_template",
  OauthAccessToken: "oauth_access_token",
  IdpOAuthAccessToken: "clerk_idp_oauth_access_token",
  OAuthApplication: "oauth_application",
  Organization: "organization",
  OrganizationDomain: "organization_domain",
  OrganizationInvitation: "organization_invitation",
  OrganizationMembership: "organization_membership",
  OrganizationSettings: "organization_settings",
  PhoneNumber: "phone_number",
  ProxyCheck: "proxy_check",
  RedirectUrl: "redirect_url",
  SamlConnection: "saml_connection",
  Session: "session",
  SignInAttempt: "sign_in_attempt",
  SignInToken: "sign_in_token",
  SignUpAttempt: "sign_up_attempt",
  SmsMessage: "sms_message",
  User: "user",
  WaitlistEntry: "waitlist_entry",
  Web3Wallet: "web3_wallet",
  Token: "token",
  TotalCount: "total_count",
  TestingToken: "testing_token",
  Role: "role",
  RoleSet: "role_set",
  RoleSetItem: "role_set_item",
  RoleSetMigration: "role_set_migration",
  Permission: "permission",
  BillingPayer: "commerce_payer",
  BillingPaymentAttempt: "commerce_payment_attempt",
  BillingSubscription: "commerce_subscription",
  BillingSubscriptionItem: "commerce_subscription_item",
  BillingPlan: "commerce_plan",
  Feature: "feature"
};
var JwtTemplate = class _JwtTemplate {
  static {
    __name(this, "_JwtTemplate");
  }
  constructor(id, name, claims, lifetime, allowedClockSkew, customSigningKey, signingAlgorithm, createdAt, updatedAt) {
    this.id = id;
    this.name = name;
    this.claims = claims;
    this.lifetime = lifetime;
    this.allowedClockSkew = allowedClockSkew;
    this.customSigningKey = customSigningKey;
    this.signingAlgorithm = signingAlgorithm;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
  static fromJSON(data) {
    return new _JwtTemplate(
      data.id,
      data.name,
      data.claims,
      data.lifetime,
      data.allowed_clock_skew,
      data.custom_signing_key,
      data.signing_algorithm,
      data.created_at,
      data.updated_at
    );
  }
};
var Machine = class _Machine {
  static {
    __name(this, "_Machine");
  }
  constructor(id, name, instanceId, createdAt, updatedAt, scopedMachines, defaultTokenTtl, secretKey) {
    this.id = id;
    this.name = name;
    this.instanceId = instanceId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.scopedMachines = scopedMachines;
    this.defaultTokenTtl = defaultTokenTtl;
    this.secretKey = secretKey;
  }
  static fromJSON(data) {
    return new _Machine(
      data.id,
      data.name,
      data.instance_id,
      data.created_at,
      data.updated_at,
      data.scoped_machines.map(
        (m) => new _Machine(
          m.id,
          m.name,
          m.instance_id,
          m.created_at,
          m.updated_at,
          [],
          // Nested machines don't have scoped_machines
          m.default_token_ttl
        )
      ),
      data.default_token_ttl,
      data.secret_key
    );
  }
};
var MachineScope = class _MachineScope {
  static {
    __name(this, "_MachineScope");
  }
  constructor(fromMachineId, toMachineId, createdAt, deleted) {
    this.fromMachineId = fromMachineId;
    this.toMachineId = toMachineId;
    this.createdAt = createdAt;
    this.deleted = deleted;
  }
  static fromJSON(data) {
    return new _MachineScope(data.from_machine_id, data.to_machine_id, data.created_at, data.deleted);
  }
};
var MachineSecretKey = class _MachineSecretKey {
  static {
    __name(this, "_MachineSecretKey");
  }
  constructor(secret) {
    this.secret = secret;
  }
  static fromJSON(data) {
    return new _MachineSecretKey(data.secret);
  }
};
var OauthAccessToken = class _OauthAccessToken {
  static {
    __name(this, "_OauthAccessToken");
  }
  constructor(externalAccountId, provider, token, publicMetadata = {}, label, scopes, tokenSecret, expiresAt, idToken) {
    this.externalAccountId = externalAccountId;
    this.provider = provider;
    this.token = token;
    this.publicMetadata = publicMetadata;
    this.label = label;
    this.scopes = scopes;
    this.tokenSecret = tokenSecret;
    this.expiresAt = expiresAt;
    this.idToken = idToken;
  }
  static fromJSON(data) {
    return new _OauthAccessToken(
      data.external_account_id,
      data.provider,
      data.token,
      data.public_metadata,
      data.label || "",
      data.scopes,
      data.token_secret,
      data.expires_at,
      data.id_token
    );
  }
};
var OAuthApplication = class _OAuthApplication {
  static {
    __name(this, "_OAuthApplication");
  }
  constructor(id, instanceId, name, clientId, clientUri, clientImageUrl, dynamicallyRegistered, consentScreenEnabled, pkceRequired, isPublic, scopes, redirectUris, authorizeUrl, tokenFetchUrl, userInfoUrl, discoveryUrl, tokenIntrospectionUrl, createdAt, updatedAt, clientSecret) {
    this.id = id;
    this.instanceId = instanceId;
    this.name = name;
    this.clientId = clientId;
    this.clientUri = clientUri;
    this.clientImageUrl = clientImageUrl;
    this.dynamicallyRegistered = dynamicallyRegistered;
    this.consentScreenEnabled = consentScreenEnabled;
    this.pkceRequired = pkceRequired;
    this.isPublic = isPublic;
    this.scopes = scopes;
    this.redirectUris = redirectUris;
    this.authorizeUrl = authorizeUrl;
    this.tokenFetchUrl = tokenFetchUrl;
    this.userInfoUrl = userInfoUrl;
    this.discoveryUrl = discoveryUrl;
    this.tokenIntrospectionUrl = tokenIntrospectionUrl;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.clientSecret = clientSecret;
  }
  static fromJSON(data) {
    return new _OAuthApplication(
      data.id,
      data.instance_id,
      data.name,
      data.client_id,
      data.client_uri,
      data.client_image_url,
      data.dynamically_registered,
      data.consent_screen_enabled,
      data.pkce_required,
      data.public,
      data.scopes,
      data.redirect_uris,
      data.authorize_url,
      data.token_fetch_url,
      data.user_info_url,
      data.discovery_url,
      data.token_introspection_url,
      data.created_at,
      data.updated_at,
      data.client_secret
    );
  }
};
var Organization = class _Organization {
  static {
    __name(this, "_Organization");
  }
  constructor(id, name, slug, imageUrl, hasImage, createdAt, updatedAt, publicMetadata = {}, privateMetadata = {}, maxAllowedMemberships, adminDeleteEnabled, membersCount, createdBy) {
    this.id = id;
    this.name = name;
    this.slug = slug;
    this.imageUrl = imageUrl;
    this.hasImage = hasImage;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.publicMetadata = publicMetadata;
    this.privateMetadata = privateMetadata;
    this.maxAllowedMemberships = maxAllowedMemberships;
    this.adminDeleteEnabled = adminDeleteEnabled;
    this.membersCount = membersCount;
    this.createdBy = createdBy;
    this._raw = null;
  }
  get raw() {
    return this._raw;
  }
  static fromJSON(data) {
    const res = new _Organization(
      data.id,
      data.name,
      data.slug,
      data.image_url || "",
      data.has_image,
      data.created_at,
      data.updated_at,
      data.public_metadata,
      data.private_metadata,
      data.max_allowed_memberships,
      data.admin_delete_enabled,
      data.members_count,
      data.created_by
    );
    res._raw = data;
    return res;
  }
};
var OrganizationInvitation = class _OrganizationInvitation {
  static {
    __name(this, "_OrganizationInvitation");
  }
  constructor(id, emailAddress, role, roleName, organizationId, createdAt, updatedAt, expiresAt, url, status, publicMetadata = {}, privateMetadata = {}, publicOrganizationData) {
    this.id = id;
    this.emailAddress = emailAddress;
    this.role = role;
    this.roleName = roleName;
    this.organizationId = organizationId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.expiresAt = expiresAt;
    this.url = url;
    this.status = status;
    this.publicMetadata = publicMetadata;
    this.privateMetadata = privateMetadata;
    this.publicOrganizationData = publicOrganizationData;
    this._raw = null;
  }
  get raw() {
    return this._raw;
  }
  static fromJSON(data) {
    const res = new _OrganizationInvitation(
      data.id,
      data.email_address,
      data.role,
      data.role_name,
      data.organization_id,
      data.created_at,
      data.updated_at,
      data.expires_at,
      data.url,
      data.status,
      data.public_metadata,
      data.private_metadata,
      data.public_organization_data
    );
    res._raw = data;
    return res;
  }
};
var OrganizationMembership = class _OrganizationMembership {
  static {
    __name(this, "_OrganizationMembership");
  }
  constructor(id, role, permissions, publicMetadata = {}, privateMetadata = {}, createdAt, updatedAt, organization, publicUserData) {
    this.id = id;
    this.role = role;
    this.permissions = permissions;
    this.publicMetadata = publicMetadata;
    this.privateMetadata = privateMetadata;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.organization = organization;
    this.publicUserData = publicUserData;
    this._raw = null;
  }
  get raw() {
    return this._raw;
  }
  static fromJSON(data) {
    const res = new _OrganizationMembership(
      data.id,
      data.role,
      data.permissions,
      data.public_metadata,
      data.private_metadata,
      data.created_at,
      data.updated_at,
      Organization.fromJSON(data.organization),
      OrganizationMembershipPublicUserData.fromJSON(data.public_user_data)
    );
    res._raw = data;
    return res;
  }
};
var OrganizationMembershipPublicUserData = class _OrganizationMembershipPublicUserData {
  static {
    __name(this, "_OrganizationMembershipPublicUserData");
  }
  constructor(identifier, firstName, lastName, imageUrl, hasImage, userId) {
    this.identifier = identifier;
    this.firstName = firstName;
    this.lastName = lastName;
    this.imageUrl = imageUrl;
    this.hasImage = hasImage;
    this.userId = userId;
  }
  static fromJSON(data) {
    return new _OrganizationMembershipPublicUserData(
      data.identifier,
      data.first_name,
      data.last_name,
      data.image_url,
      data.has_image,
      data.user_id
    );
  }
};
var OrganizationSettings = class _OrganizationSettings {
  static {
    __name(this, "_OrganizationSettings");
  }
  constructor(enabled, maxAllowedMemberships, maxAllowedRoles, maxAllowedPermissions, creatorRole, adminDeleteEnabled, domainsEnabled, slugDisabled, domainsEnrollmentModes, domainsDefaultRole) {
    this.enabled = enabled;
    this.maxAllowedMemberships = maxAllowedMemberships;
    this.maxAllowedRoles = maxAllowedRoles;
    this.maxAllowedPermissions = maxAllowedPermissions;
    this.creatorRole = creatorRole;
    this.adminDeleteEnabled = adminDeleteEnabled;
    this.domainsEnabled = domainsEnabled;
    this.slugDisabled = slugDisabled;
    this.domainsEnrollmentModes = domainsEnrollmentModes;
    this.domainsDefaultRole = domainsDefaultRole;
  }
  static fromJSON(data) {
    return new _OrganizationSettings(
      data.enabled,
      data.max_allowed_memberships,
      data.max_allowed_roles,
      data.max_allowed_permissions,
      data.creator_role,
      data.admin_delete_enabled,
      data.domains_enabled,
      data.slug_disabled,
      data.domains_enrollment_modes,
      data.domains_default_role
    );
  }
};
var Permission = class _Permission {
  static {
    __name(this, "_Permission");
  }
  constructor(id, name, key, description, createdAt, updatedAt) {
    this.id = id;
    this.name = name;
    this.key = key;
    this.description = description;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
  static fromJSON(data) {
    return new _Permission(data.id, data.name, data.key, data.description, data.created_at, data.updated_at);
  }
};
var PhoneNumber = class _PhoneNumber {
  static {
    __name(this, "_PhoneNumber");
  }
  constructor(id, phoneNumber, reservedForSecondFactor, defaultSecondFactor, verification, linkedTo) {
    this.id = id;
    this.phoneNumber = phoneNumber;
    this.reservedForSecondFactor = reservedForSecondFactor;
    this.defaultSecondFactor = defaultSecondFactor;
    this.verification = verification;
    this.linkedTo = linkedTo;
  }
  static fromJSON(data) {
    return new _PhoneNumber(
      data.id,
      data.phone_number,
      data.reserved_for_second_factor,
      data.default_second_factor,
      data.verification && Verification.fromJSON(data.verification),
      data.linked_to.map((link) => IdentificationLink.fromJSON(link))
    );
  }
};
var ProxyCheck = class _ProxyCheck {
  static {
    __name(this, "_ProxyCheck");
  }
  constructor(id, domainId, lastRunAt, proxyUrl, successful, createdAt, updatedAt) {
    this.id = id;
    this.domainId = domainId;
    this.lastRunAt = lastRunAt;
    this.proxyUrl = proxyUrl;
    this.successful = successful;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
  static fromJSON(data) {
    return new _ProxyCheck(
      data.id,
      data.domain_id,
      data.last_run_at,
      data.proxy_url,
      data.successful,
      data.created_at,
      data.updated_at
    );
  }
};
var RedirectUrl = class _RedirectUrl {
  static {
    __name(this, "_RedirectUrl");
  }
  constructor(id, url, createdAt, updatedAt) {
    this.id = id;
    this.url = url;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
  static fromJSON(data) {
    return new _RedirectUrl(data.id, data.url, data.created_at, data.updated_at);
  }
};
var Role = class _Role {
  static {
    __name(this, "_Role");
  }
  constructor(id, name, key, description, permissions, isCreatorEligible, createdAt, updatedAt) {
    this.id = id;
    this.name = name;
    this.key = key;
    this.description = description;
    this.permissions = permissions;
    this.isCreatorEligible = isCreatorEligible;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
  static fromJSON(data) {
    return new _Role(
      data.id,
      data.name,
      data.key,
      data.description,
      (data.permissions ?? []).map((permission) => Permission.fromJSON(permission)),
      data.is_creator_eligible,
      data.created_at,
      data.updated_at
    );
  }
};
var RoleSetItem = class _RoleSetItem {
  static {
    __name(this, "_RoleSetItem");
  }
  constructor(id, name, key, description, createdAt, updatedAt, membersCount, hasMembers) {
    this.id = id;
    this.name = name;
    this.key = key;
    this.description = description;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.membersCount = membersCount;
    this.hasMembers = hasMembers;
  }
  static fromJSON(data) {
    return new _RoleSetItem(
      data.id,
      data.name,
      data.key,
      data.description,
      data.created_at,
      data.updated_at,
      data.members_count,
      data.has_members
    );
  }
};
var RoleSetMigration = class _RoleSetMigration {
  static {
    __name(this, "_RoleSetMigration");
  }
  constructor(id, organizationId, instanceId, sourceRoleSetId, destRoleSetId, triggerType, status, migratedMembers, mappings, createdAt, updatedAt, startedAt, completedAt) {
    this.id = id;
    this.organizationId = organizationId;
    this.instanceId = instanceId;
    this.sourceRoleSetId = sourceRoleSetId;
    this.destRoleSetId = destRoleSetId;
    this.triggerType = triggerType;
    this.status = status;
    this.migratedMembers = migratedMembers;
    this.mappings = mappings;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.startedAt = startedAt;
    this.completedAt = completedAt;
  }
  static fromJSON(data) {
    return new _RoleSetMigration(
      data.id,
      data.organization_id,
      data.instance_id,
      data.source_role_set_id,
      data.dest_role_set_id,
      data.trigger_type,
      data.status,
      data.migrated_members,
      data.mappings,
      data.created_at,
      data.updated_at,
      data.started_at,
      data.completed_at
    );
  }
};
var RoleSet = class _RoleSet {
  static {
    __name(this, "_RoleSet");
  }
  constructor(id, name, key, description, roles, defaultRole, creatorRole, type, roleSetMigration, createdAt, updatedAt) {
    this.id = id;
    this.name = name;
    this.key = key;
    this.description = description;
    this.roles = roles;
    this.defaultRole = defaultRole;
    this.creatorRole = creatorRole;
    this.type = type;
    this.roleSetMigration = roleSetMigration;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
  static fromJSON(data) {
    return new _RoleSet(
      data.id,
      data.name,
      data.key,
      data.description,
      (data.roles ?? []).map((role) => RoleSetItem.fromJSON(role)),
      data.default_role ? RoleSetItem.fromJSON(data.default_role) : null,
      data.creator_role ? RoleSetItem.fromJSON(data.creator_role) : null,
      data.type,
      data.role_set_migration ? RoleSetMigration.fromJSON(data.role_set_migration) : null,
      data.created_at,
      data.updated_at
    );
  }
};
var SamlConnection = class _SamlConnection {
  static {
    __name(this, "_SamlConnection");
  }
  constructor(id, name, domain, organizationId, idpEntityId, idpSsoUrl, idpCertificate, idpCertificateIssuedAt, idpCertificateExpiresAt, idpMetadataUrl, idpMetadata, acsUrl, spEntityId, spMetadataUrl, active, provider, userCount, syncUserAttributes, allowSubdomains, allowIdpInitiated, createdAt, updatedAt, attributeMapping) {
    this.id = id;
    this.name = name;
    this.domain = domain;
    this.organizationId = organizationId;
    this.idpEntityId = idpEntityId;
    this.idpSsoUrl = idpSsoUrl;
    this.idpCertificate = idpCertificate;
    this.idpCertificateIssuedAt = idpCertificateIssuedAt;
    this.idpCertificateExpiresAt = idpCertificateExpiresAt;
    this.idpMetadataUrl = idpMetadataUrl;
    this.idpMetadata = idpMetadata;
    this.acsUrl = acsUrl;
    this.spEntityId = spEntityId;
    this.spMetadataUrl = spMetadataUrl;
    this.active = active;
    this.provider = provider;
    this.userCount = userCount;
    this.syncUserAttributes = syncUserAttributes;
    this.allowSubdomains = allowSubdomains;
    this.allowIdpInitiated = allowIdpInitiated;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.attributeMapping = attributeMapping;
  }
  static fromJSON(data) {
    return new _SamlConnection(
      data.id,
      data.name,
      data.domain,
      data.organization_id,
      data.idp_entity_id,
      data.idp_sso_url,
      data.idp_certificate,
      data.idp_certificate_issued_at,
      data.idp_certificate_expires_at,
      data.idp_metadata_url,
      data.idp_metadata,
      data.acs_url,
      data.sp_entity_id,
      data.sp_metadata_url,
      data.active,
      data.provider,
      data.user_count,
      data.sync_user_attributes,
      data.allow_subdomains,
      data.allow_idp_initiated,
      data.created_at,
      data.updated_at,
      data.attribute_mapping && AttributeMapping.fromJSON(data.attribute_mapping)
    );
  }
};
var AttributeMapping = class _AttributeMapping {
  static {
    __name(this, "_AttributeMapping");
  }
  constructor(userId, emailAddress, firstName, lastName) {
    this.userId = userId;
    this.emailAddress = emailAddress;
    this.firstName = firstName;
    this.lastName = lastName;
  }
  static fromJSON(data) {
    return new _AttributeMapping(data.user_id, data.email_address, data.first_name, data.last_name);
  }
};
var SignInToken = class _SignInToken {
  static {
    __name(this, "_SignInToken");
  }
  constructor(id, userId, token, status, url, createdAt, updatedAt) {
    this.id = id;
    this.userId = userId;
    this.token = token;
    this.status = status;
    this.url = url;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
  static fromJSON(data) {
    return new _SignInToken(data.id, data.user_id, data.token, data.status, data.url, data.created_at, data.updated_at);
  }
};
var SignUpAttemptVerification = class _SignUpAttemptVerification {
  static {
    __name(this, "_SignUpAttemptVerification");
  }
  constructor(nextAction, supportedStrategies) {
    this.nextAction = nextAction;
    this.supportedStrategies = supportedStrategies;
  }
  static fromJSON(data) {
    return new _SignUpAttemptVerification(data.next_action, data.supported_strategies);
  }
};
var SignUpAttemptVerifications = class _SignUpAttemptVerifications {
  static {
    __name(this, "_SignUpAttemptVerifications");
  }
  constructor(emailAddress, phoneNumber, web3Wallet, externalAccount) {
    this.emailAddress = emailAddress;
    this.phoneNumber = phoneNumber;
    this.web3Wallet = web3Wallet;
    this.externalAccount = externalAccount;
  }
  static fromJSON(data) {
    return new _SignUpAttemptVerifications(
      data.email_address && SignUpAttemptVerification.fromJSON(data.email_address),
      data.phone_number && SignUpAttemptVerification.fromJSON(data.phone_number),
      data.web3_wallet && SignUpAttemptVerification.fromJSON(data.web3_wallet),
      data.external_account
    );
  }
};
var SignUpAttempt = class _SignUpAttempt {
  static {
    __name(this, "_SignUpAttempt");
  }
  constructor(id, status, requiredFields, optionalFields, missingFields, unverifiedFields, verifications, username, emailAddress, phoneNumber, web3Wallet, passwordEnabled, firstName, lastName, customAction, externalId, createdSessionId, createdUserId, abandonAt, legalAcceptedAt, publicMetadata, unsafeMetadata) {
    this.id = id;
    this.status = status;
    this.requiredFields = requiredFields;
    this.optionalFields = optionalFields;
    this.missingFields = missingFields;
    this.unverifiedFields = unverifiedFields;
    this.verifications = verifications;
    this.username = username;
    this.emailAddress = emailAddress;
    this.phoneNumber = phoneNumber;
    this.web3Wallet = web3Wallet;
    this.passwordEnabled = passwordEnabled;
    this.firstName = firstName;
    this.lastName = lastName;
    this.customAction = customAction;
    this.externalId = externalId;
    this.createdSessionId = createdSessionId;
    this.createdUserId = createdUserId;
    this.abandonAt = abandonAt;
    this.legalAcceptedAt = legalAcceptedAt;
    this.publicMetadata = publicMetadata;
    this.unsafeMetadata = unsafeMetadata;
  }
  static fromJSON(data) {
    return new _SignUpAttempt(
      data.id,
      data.status,
      data.required_fields,
      data.optional_fields,
      data.missing_fields,
      data.unverified_fields,
      data.verifications ? SignUpAttemptVerifications.fromJSON(data.verifications) : null,
      data.username,
      data.email_address,
      data.phone_number,
      data.web3_wallet,
      data.password_enabled,
      data.first_name,
      data.last_name,
      data.custom_action,
      data.external_id,
      data.created_session_id,
      data.created_user_id,
      data.abandon_at,
      data.legal_accepted_at,
      data.public_metadata,
      data.unsafe_metadata
    );
  }
};
var SMSMessage = class _SMSMessage {
  static {
    __name(this, "_SMSMessage");
  }
  constructor(id, fromPhoneNumber, toPhoneNumber, message, status, phoneNumberId, data) {
    this.id = id;
    this.fromPhoneNumber = fromPhoneNumber;
    this.toPhoneNumber = toPhoneNumber;
    this.message = message;
    this.status = status;
    this.phoneNumberId = phoneNumberId;
    this.data = data;
  }
  static fromJSON(data) {
    return new _SMSMessage(
      data.id,
      data.from_phone_number,
      data.to_phone_number,
      data.message,
      data.status,
      data.phone_number_id,
      data.data
    );
  }
};
var Token = class _Token {
  static {
    __name(this, "_Token");
  }
  constructor(jwt) {
    this.jwt = jwt;
  }
  static fromJSON(data) {
    return new _Token(data.jwt);
  }
};
var Web3Wallet = class _Web3Wallet {
  static {
    __name(this, "_Web3Wallet");
  }
  constructor(id, web3Wallet, verification) {
    this.id = id;
    this.web3Wallet = web3Wallet;
    this.verification = verification;
  }
  static fromJSON(data) {
    return new _Web3Wallet(data.id, data.web3_wallet, data.verification && Verification.fromJSON(data.verification));
  }
};
var User = class _User {
  static {
    __name(this, "_User");
  }
  constructor(id, passwordEnabled, totpEnabled, backupCodeEnabled, twoFactorEnabled, banned, locked, createdAt, updatedAt, imageUrl, hasImage, primaryEmailAddressId, primaryPhoneNumberId, primaryWeb3WalletId, lastSignInAt, externalId, username, firstName, lastName, publicMetadata = {}, privateMetadata = {}, unsafeMetadata = {}, emailAddresses = [], phoneNumbers = [], web3Wallets = [], externalAccounts = [], enterpriseAccounts = [], lastActiveAt, createOrganizationEnabled, createOrganizationsLimit = null, deleteSelfEnabled, legalAcceptedAt, locale) {
    this.id = id;
    this.passwordEnabled = passwordEnabled;
    this.totpEnabled = totpEnabled;
    this.backupCodeEnabled = backupCodeEnabled;
    this.twoFactorEnabled = twoFactorEnabled;
    this.banned = banned;
    this.locked = locked;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.imageUrl = imageUrl;
    this.hasImage = hasImage;
    this.primaryEmailAddressId = primaryEmailAddressId;
    this.primaryPhoneNumberId = primaryPhoneNumberId;
    this.primaryWeb3WalletId = primaryWeb3WalletId;
    this.lastSignInAt = lastSignInAt;
    this.externalId = externalId;
    this.username = username;
    this.firstName = firstName;
    this.lastName = lastName;
    this.publicMetadata = publicMetadata;
    this.privateMetadata = privateMetadata;
    this.unsafeMetadata = unsafeMetadata;
    this.emailAddresses = emailAddresses;
    this.phoneNumbers = phoneNumbers;
    this.web3Wallets = web3Wallets;
    this.externalAccounts = externalAccounts;
    this.enterpriseAccounts = enterpriseAccounts;
    this.lastActiveAt = lastActiveAt;
    this.createOrganizationEnabled = createOrganizationEnabled;
    this.createOrganizationsLimit = createOrganizationsLimit;
    this.deleteSelfEnabled = deleteSelfEnabled;
    this.legalAcceptedAt = legalAcceptedAt;
    this.locale = locale;
    this._raw = null;
  }
  get raw() {
    return this._raw;
  }
  static fromJSON(data) {
    const res = new _User(
      data.id,
      data.password_enabled,
      data.totp_enabled,
      data.backup_code_enabled,
      data.two_factor_enabled,
      data.banned,
      data.locked,
      data.created_at,
      data.updated_at,
      data.image_url,
      data.has_image,
      data.primary_email_address_id,
      data.primary_phone_number_id,
      data.primary_web3_wallet_id,
      data.last_sign_in_at,
      data.external_id,
      data.username,
      data.first_name,
      data.last_name,
      data.public_metadata,
      data.private_metadata,
      data.unsafe_metadata,
      (data.email_addresses || []).map((x) => EmailAddress.fromJSON(x)),
      (data.phone_numbers || []).map((x) => PhoneNumber.fromJSON(x)),
      (data.web3_wallets || []).map((x) => Web3Wallet.fromJSON(x)),
      (data.external_accounts || []).map((x) => ExternalAccount.fromJSON(x)),
      (data.enterprise_accounts || []).map((x) => EnterpriseAccount.fromJSON(x)),
      data.last_active_at,
      data.create_organization_enabled,
      data.create_organizations_limit,
      data.delete_self_enabled,
      data.legal_accepted_at,
      data.locale
    );
    res._raw = data;
    return res;
  }
  /**
   * The primary email address of the user.
   */
  get primaryEmailAddress() {
    return this.emailAddresses.find(({ id }) => id === this.primaryEmailAddressId) ?? null;
  }
  /**
   * The primary phone number of the user.
   */
  get primaryPhoneNumber() {
    return this.phoneNumbers.find(({ id }) => id === this.primaryPhoneNumberId) ?? null;
  }
  /**
   * The primary web3 wallet of the user.
   */
  get primaryWeb3Wallet() {
    return this.web3Wallets.find(({ id }) => id === this.primaryWeb3WalletId) ?? null;
  }
  /**
   * The full name of the user.
   */
  get fullName() {
    return [this.firstName, this.lastName].join(" ").trim() || null;
  }
};
var WaitlistEntry = class _WaitlistEntry {
  static {
    __name(this, "_WaitlistEntry");
  }
  constructor(id, emailAddress, status, invitation, createdAt, updatedAt, isLocked) {
    this.id = id;
    this.emailAddress = emailAddress;
    this.status = status;
    this.invitation = invitation;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.isLocked = isLocked;
  }
  static fromJSON(data) {
    return new _WaitlistEntry(
      data.id,
      data.email_address,
      data.status,
      data.invitation && Invitation.fromJSON(data.invitation),
      data.created_at,
      data.updated_at,
      data.is_locked
    );
  }
};
function deserialize(payload) {
  let data, totalCount;
  if (Array.isArray(payload)) {
    const data2 = payload.map((item) => jsonToObject(item));
    return { data: data2 };
  } else if (isM2MTokenResponse(payload)) {
    data = payload.m2m_tokens.map((item) => jsonToObject(item));
    totalCount = payload.total_count;
    return { data, totalCount };
  } else if (isPaginated(payload)) {
    data = payload.data.map((item) => jsonToObject(item));
    totalCount = payload.total_count;
    return { data, totalCount };
  } else {
    return { data: jsonToObject(payload) };
  }
}
__name(deserialize, "deserialize");
function isPaginated(payload) {
  if (!payload || typeof payload !== "object" || !("data" in payload)) {
    return false;
  }
  return Array.isArray(payload.data) && payload.data !== void 0;
}
__name(isPaginated, "isPaginated");
function isM2MTokenResponse(payload) {
  if (!payload || typeof payload !== "object" || !("m2m_tokens" in payload)) {
    return false;
  }
  return Array.isArray(payload.m2m_tokens);
}
__name(isM2MTokenResponse, "isM2MTokenResponse");
function getCount(item) {
  return item.total_count;
}
__name(getCount, "getCount");
function jsonToObject(item) {
  if (typeof item !== "string" && "object" in item && "deleted" in item) {
    return DeletedObject.fromJSON(item);
  }
  switch (item.object) {
    case ObjectType.AccountlessApplication:
      return AccountlessApplication.fromJSON(item);
    case ObjectType.ActorToken:
      return ActorToken.fromJSON(item);
    case ObjectType.AllowlistIdentifier:
      return AllowlistIdentifier.fromJSON(item);
    case ObjectType.ApiKey:
      return APIKey.fromJSON(item);
    case ObjectType.BlocklistIdentifier:
      return BlocklistIdentifier.fromJSON(item);
    case ObjectType.Client:
      return Client.fromJSON(item);
    case ObjectType.Cookies:
      return Cookies2.fromJSON(item);
    case ObjectType.Domain:
      return Domain.fromJSON(item);
    case ObjectType.EmailAddress:
      return EmailAddress.fromJSON(item);
    case ObjectType.EnterpriseAccount:
      return EnterpriseAccount.fromJSON(item);
    case ObjectType.Email:
      return Email.fromJSON(item);
    case ObjectType.IdpOAuthAccessToken:
      return IdPOAuthAccessToken.fromJSON(item);
    case ObjectType.Instance:
      return Instance.fromJSON(item);
    case ObjectType.InstanceRestrictions:
      return InstanceRestrictions.fromJSON(item);
    case ObjectType.InstanceSettings:
      return InstanceSettings.fromJSON(item);
    case ObjectType.Invitation:
      return Invitation.fromJSON(item);
    case ObjectType.JwtTemplate:
      return JwtTemplate.fromJSON(item);
    case ObjectType.Machine:
      return Machine.fromJSON(item);
    case ObjectType.MachineScope:
      return MachineScope.fromJSON(item);
    case ObjectType.MachineSecretKey:
      return MachineSecretKey.fromJSON(item);
    case ObjectType.M2MToken:
      return M2MToken.fromJSON(item);
    case ObjectType.OauthAccessToken:
      return OauthAccessToken.fromJSON(item);
    case ObjectType.OAuthApplication:
      return OAuthApplication.fromJSON(item);
    case ObjectType.Organization:
      return Organization.fromJSON(item);
    case ObjectType.OrganizationInvitation:
      return OrganizationInvitation.fromJSON(item);
    case ObjectType.OrganizationMembership:
      return OrganizationMembership.fromJSON(item);
    case ObjectType.OrganizationSettings:
      return OrganizationSettings.fromJSON(item);
    case ObjectType.Permission:
      return Permission.fromJSON(item);
    case ObjectType.PhoneNumber:
      return PhoneNumber.fromJSON(item);
    case ObjectType.ProxyCheck:
      return ProxyCheck.fromJSON(item);
    case ObjectType.RedirectUrl:
      return RedirectUrl.fromJSON(item);
    case ObjectType.Role:
      return Role.fromJSON(item);
    case ObjectType.RoleSet:
      return RoleSet.fromJSON(item);
    case ObjectType.EnterpriseConnection:
      return EnterpriseConnection.fromJSON(item);
    case ObjectType.SamlConnection:
      return SamlConnection.fromJSON(item);
    case ObjectType.SignInToken:
      return SignInToken.fromJSON(item);
    case ObjectType.AgentTask:
      return AgentTask.fromJSON(item);
    case ObjectType.SignUpAttempt:
      return SignUpAttempt.fromJSON(item);
    case ObjectType.Session:
      return Session.fromJSON(item);
    case ObjectType.SmsMessage:
      return SMSMessage.fromJSON(item);
    case ObjectType.Token:
      return Token.fromJSON(item);
    case ObjectType.TotalCount:
      return getCount(item);
    case ObjectType.User:
      return User.fromJSON(item);
    case ObjectType.WaitlistEntry:
      return WaitlistEntry.fromJSON(item);
    case ObjectType.BillingPlan:
      return BillingPlan.fromJSON(item);
    case ObjectType.BillingSubscription:
      return BillingSubscription.fromJSON(item);
    case ObjectType.BillingSubscriptionItem:
      return BillingSubscriptionItem.fromJSON(item);
    case ObjectType.Feature:
      return Feature.fromJSON(item);
    default:
      return item;
  }
}
__name(jsonToObject, "jsonToObject");
function buildRequest(options) {
  const requestFn = /* @__PURE__ */ __name(async (requestOptions) => {
    const {
      secretKey,
      machineSecretKey,
      useMachineSecretKey = false,
      requireSecretKey = true,
      apiUrl = API_URL,
      apiVersion = API_VERSION,
      userAgent = USER_AGENT,
      skipApiVersionInUrl = false
    } = options;
    const { path, method, queryParams, headerParams, bodyParams, formData, options: opts } = requestOptions;
    const { deepSnakecaseBodyParamKeys = false } = opts || {};
    if (requireSecretKey) {
      assertValidSecretKey(secretKey);
    }
    const url = skipApiVersionInUrl ? joinPaths(apiUrl, path) : joinPaths(apiUrl, apiVersion, path);
    const finalUrl = new URL(url);
    if (queryParams) {
      const snakecasedQueryParams = snakecase_keys_default({ ...queryParams });
      for (const [key, val] of Object.entries(snakecasedQueryParams)) {
        if (val) {
          [val].flat().forEach((v) => finalUrl.searchParams.append(key, v));
        }
      }
    }
    const headers = new Headers({
      "Clerk-API-Version": SUPPORTED_BAPI_VERSION,
      [constants.Headers.UserAgent]: userAgent,
      ...headerParams
    });
    const authorizationHeader = constants.Headers.Authorization;
    if (!headers.has(authorizationHeader)) {
      if (useMachineSecretKey && machineSecretKey) {
        headers.set(authorizationHeader, `Bearer ${machineSecretKey}`);
      } else if (secretKey) {
        headers.set(authorizationHeader, `Bearer ${secretKey}`);
      }
    }
    let res;
    try {
      if (formData) {
        res = await runtime.fetch(finalUrl.href, {
          method,
          headers,
          body: formData
        });
      } else {
        headers.set("Content-Type", "application/json");
        const buildBody = /* @__PURE__ */ __name(() => {
          const hasBody = method !== "GET" && bodyParams && Object.keys(bodyParams).length > 0;
          if (!hasBody) {
            return null;
          }
          const formatKeys = /* @__PURE__ */ __name((object) => snakecase_keys_default(object, { deep: deepSnakecaseBodyParamKeys }), "formatKeys");
          return {
            body: JSON.stringify(Array.isArray(bodyParams) ? bodyParams.map(formatKeys) : formatKeys(bodyParams))
          };
        }, "buildBody");
        res = await runtime.fetch(finalUrl.href, {
          method,
          headers,
          ...buildBody()
        });
      }
      if (res.status === 204) {
        return {
          data: void 0,
          errors: null
        };
      }
      const isJSONResponse = res?.headers && res.headers?.get(constants.Headers.ContentType) === constants.ContentTypes.Json;
      const responseBody = await (isJSONResponse ? res.json() : res.text());
      if (!res.ok) {
        return {
          data: null,
          errors: parseErrors2(responseBody),
          status: res?.status,
          statusText: res?.statusText,
          clerkTraceId: getTraceId(responseBody, res?.headers),
          retryAfter: getRetryAfter(res?.headers)
        };
      }
      return {
        ...deserialize(responseBody),
        errors: null
      };
    } catch (err) {
      if (err instanceof Error) {
        return {
          data: null,
          errors: [
            {
              code: "unexpected_error",
              message: err.message || "Unexpected error"
            }
          ],
          clerkTraceId: getTraceId(err, res?.headers)
        };
      }
      return {
        data: null,
        errors: parseErrors2(err),
        status: res?.status,
        statusText: res?.statusText,
        clerkTraceId: getTraceId(err, res?.headers),
        retryAfter: getRetryAfter(res?.headers)
      };
    }
  }, "requestFn");
  return withLegacyRequestReturn(requestFn);
}
__name(buildRequest, "buildRequest");
function getTraceId(data, headers) {
  if (data && typeof data === "object" && "clerk_trace_id" in data && typeof data.clerk_trace_id === "string") {
    return data.clerk_trace_id;
  }
  const cfRay = headers?.get("cf-ray");
  return cfRay || "";
}
__name(getTraceId, "getTraceId");
function getRetryAfter(headers) {
  const retryAfter = headers?.get("Retry-After");
  if (!retryAfter) {
    return;
  }
  const value = parseInt(retryAfter, 10);
  if (isNaN(value)) {
    return;
  }
  return value;
}
__name(getRetryAfter, "getRetryAfter");
function parseErrors2(data) {
  if (!!data && typeof data === "object" && "errors" in data) {
    const errors = data.errors;
    return errors.length > 0 ? errors.map(parseError) : [];
  }
  return [];
}
__name(parseErrors2, "parseErrors");
function withLegacyRequestReturn(cb) {
  return async (...args) => {
    const { data, errors, totalCount, status, statusText, clerkTraceId, retryAfter } = await cb(...args);
    if (errors) {
      const error = new ClerkAPIResponseError(statusText || "", {
        data: [],
        status,
        clerkTraceId,
        retryAfter
      });
      error.errors = errors;
      throw error;
    }
    if (typeof totalCount !== "undefined") {
      return { data, totalCount };
    }
    return data;
  };
}
__name(withLegacyRequestReturn, "withLegacyRequestReturn");
function createBackendApiClient(options) {
  const request = buildRequest(options);
  return {
    __experimental_accountlessApplications: new AccountlessApplicationAPI(
      buildRequest({ ...options, requireSecretKey: false })
    ),
    actorTokens: new ActorTokenAPI(request),
    /**
     * @experimental This is an experimental API for the Agent Tasks feature that is available under a private beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
     */
    agentTasks: new AgentTaskAPI(request),
    allowlistIdentifiers: new AllowlistIdentifierAPI(request),
    apiKeys: new APIKeysAPI(
      buildRequest({
        ...options,
        skipApiVersionInUrl: true
      })
    ),
    betaFeatures: new BetaFeaturesAPI(request),
    blocklistIdentifiers: new BlocklistIdentifierAPI(request),
    /**
     * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
     */
    billing: new BillingAPI(request),
    clients: new ClientAPI(request),
    domains: new DomainAPI(request),
    emailAddresses: new EmailAddressAPI(request),
    /**
     * @experimental This calls an internal, not-yet-public endpoint for sending
     * transactional emails and is subject to change. It is advised to
     * [pin](https://clerk.com/docs/pinning) the SDK version to avoid breaking changes.
     */
    emails: new EmailApi(request),
    enterpriseConnections: new EnterpriseConnectionAPI(request),
    idPOAuthAccessToken: new IdPOAuthAccessTokenApi(
      buildRequest({
        ...options,
        skipApiVersionInUrl: true
      })
    ),
    instance: new InstanceAPI(request),
    invitations: new InvitationAPI(request),
    jwks: new JwksAPI(request),
    jwtTemplates: new JwtTemplatesApi(request),
    machines: new MachineApi(request),
    m2m: new M2MTokenApi(
      buildRequest({
        ...options,
        skipApiVersionInUrl: true,
        requireSecretKey: false,
        useMachineSecretKey: true
      }),
      {
        secretKey: options.secretKey,
        apiUrl: options.apiUrl,
        jwtKey: options.jwtKey
      }
    ),
    oauthApplications: new OAuthApplicationsApi(request),
    organizations: new OrganizationAPI(request),
    organizationPermissions: new OrganizationPermissionAPI(request),
    organizationRoles: new OrganizationRoleAPI(request),
    phoneNumbers: new PhoneNumberAPI(request),
    proxyChecks: new ProxyCheckAPI(request),
    redirectUrls: new RedirectUrlAPI(request),
    roleSets: new RoleSetAPI(request),
    sessions: new SessionAPI(request),
    signInTokens: new SignInTokenAPI(request),
    signUps: new SignUpAPI(request),
    testingTokens: new TestingTokenAPI(request),
    users: new UserAPI(request),
    waitlistEntries: new WaitlistEntryAPI(request),
    webhooks: new WebhookAPI(request),
    /**
     * @deprecated Use `enterpriseConnections` instead.
     */
    samlConnections: new SamlConnectionAPI(request)
  };
}
__name(createBackendApiClient, "createBackendApiClient");
var createDebug = /* @__PURE__ */ __name((data) => {
  return () => {
    const res = { ...data };
    res.secretKey = (res.secretKey || "").substring(0, 7);
    res.jwtKey = (res.jwtKey || "").substring(0, 7);
    res.sessionToken = (res.sessionToken || "").substring(0, 7);
    res.tokenInHeader = (res.tokenInHeader || "").substring(0, 7);
    res.sessionTokenInCookie = (res.sessionTokenInCookie || "").substring(0, 7);
    res.refreshTokenInCookie = (res.refreshTokenInCookie || "").substring(0, 7);
    res.devBrowserToken = (res.devBrowserToken || "").substring(0, 7);
    res.handshakeToken = (res.handshakeToken || "").substring(0, 7);
    return { ...res };
  };
}, "createDebug");
function signedInAuthObject(authenticateContext, sessionToken, sessionClaims) {
  const { actor, sessionId, sessionStatus, userId, orgId, orgRole, orgSlug, orgPermissions, factorVerificationAge } = __experimental_JWTPayloadToAuthObjectProperties(sessionClaims);
  const apiClient = createBackendApiClient(authenticateContext);
  const getToken = createGetToken({
    sessionId,
    sessionToken,
    fetcher: /* @__PURE__ */ __name(async (sessionId2, template, expiresInSeconds) => (await apiClient.sessions.getToken(sessionId2, template || "", expiresInSeconds)).jwt, "fetcher")
  });
  return {
    tokenType: TokenType.SessionToken,
    actor,
    sessionClaims,
    sessionId,
    sessionStatus,
    userId,
    orgId,
    orgRole,
    orgSlug,
    orgPermissions,
    factorVerificationAge,
    getToken,
    has: createCheckAuthorization({
      orgId,
      orgRole,
      orgPermissions,
      userId,
      factorVerificationAge,
      features: sessionClaims.fea || "",
      plans: sessionClaims.pla || ""
    }),
    debug: createDebug({ ...authenticateContext, sessionToken }),
    isAuthenticated: true
  };
}
__name(signedInAuthObject, "signedInAuthObject");
function signedOutAuthObject(debugData, initialSessionStatus) {
  return {
    tokenType: TokenType.SessionToken,
    sessionClaims: null,
    sessionId: null,
    sessionStatus: initialSessionStatus ?? null,
    userId: null,
    actor: null,
    orgId: null,
    orgRole: null,
    orgSlug: null,
    orgPermissions: null,
    factorVerificationAge: null,
    getToken: /* @__PURE__ */ __name(() => Promise.resolve(null), "getToken"),
    has: /* @__PURE__ */ __name(() => false, "has"),
    debug: createDebug(debugData),
    isAuthenticated: false
  };
}
__name(signedOutAuthObject, "signedOutAuthObject");
function authenticatedMachineObject(tokenType, token, verificationResult, debugData) {
  const baseObject = {
    id: verificationResult.id,
    subject: verificationResult.subject,
    getToken: /* @__PURE__ */ __name(() => Promise.resolve(token), "getToken"),
    has: /* @__PURE__ */ __name(() => false, "has"),
    debug: createDebug(debugData),
    isAuthenticated: true
  };
  switch (tokenType) {
    case TokenType.ApiKey: {
      const result = verificationResult;
      return {
        ...baseObject,
        tokenType,
        name: result.name,
        claims: result.claims,
        scopes: result.scopes,
        userId: result.subject.startsWith("user_") ? result.subject : null,
        orgId: result.subject.startsWith("org_") ? result.subject : null
      };
    }
    case TokenType.M2MToken: {
      const result = verificationResult;
      return {
        ...baseObject,
        tokenType,
        claims: result.claims,
        scopes: result.scopes,
        machineId: result.subject
      };
    }
    case TokenType.OAuthToken: {
      const result = verificationResult;
      return {
        ...baseObject,
        tokenType,
        scopes: result.scopes,
        userId: result.subject,
        clientId: result.clientId
      };
    }
    default:
      throw new Error(`Invalid token type: ${tokenType}`);
  }
}
__name(authenticatedMachineObject, "authenticatedMachineObject");
function unauthenticatedMachineObject(tokenType, debugData) {
  const baseObject = {
    id: null,
    subject: null,
    scopes: null,
    has: /* @__PURE__ */ __name(() => false, "has"),
    getToken: /* @__PURE__ */ __name(() => Promise.resolve(null), "getToken"),
    debug: createDebug(debugData),
    isAuthenticated: false
  };
  switch (tokenType) {
    case TokenType.ApiKey: {
      return {
        ...baseObject,
        tokenType,
        name: null,
        claims: null,
        scopes: null,
        userId: null,
        orgId: null
      };
    }
    case TokenType.M2MToken: {
      return {
        ...baseObject,
        tokenType,
        claims: null,
        scopes: null,
        machineId: null
      };
    }
    case TokenType.OAuthToken: {
      return {
        ...baseObject,
        tokenType,
        scopes: null,
        userId: null,
        clientId: null
      };
    }
    default:
      throw new Error(`Invalid token type: ${tokenType}`);
  }
}
__name(unauthenticatedMachineObject, "unauthenticatedMachineObject");
function invalidTokenAuthObject() {
  return {
    isAuthenticated: false,
    tokenType: null,
    getToken: /* @__PURE__ */ __name(() => Promise.resolve(null), "getToken"),
    has: /* @__PURE__ */ __name(() => false, "has"),
    debug: /* @__PURE__ */ __name(() => ({}), "debug")
  };
}
__name(invalidTokenAuthObject, "invalidTokenAuthObject");
var createGetToken = /* @__PURE__ */ __name((params) => {
  const { fetcher, sessionToken, sessionId } = params || {};
  return async (options = {}) => {
    if (!sessionId) {
      return null;
    }
    if (options.template || options.expiresInSeconds !== void 0) {
      return fetcher(sessionId, options.template, options.expiresInSeconds);
    }
    return sessionToken;
  };
}, "createGetToken");
var AuthStatus = {
  SignedIn: "signed-in",
  SignedOut: "signed-out",
  Handshake: "handshake"
};
var AuthErrorReason = {
  ClientUATWithoutSessionToken: "client-uat-but-no-session-token",
  DevBrowserMissing: "dev-browser-missing",
  DevBrowserSync: "dev-browser-sync",
  PrimaryRespondsToSyncing: "primary-responds-to-syncing",
  PrimaryDomainCrossOriginSync: "primary-domain-cross-origin-sync",
  SatelliteCookieNeedsSyncing: "satellite-needs-syncing",
  SessionTokenAndUATMissing: "session-token-and-uat-missing",
  SessionTokenMissing: "session-token-missing",
  SessionTokenExpired: "session-token-expired",
  SessionTokenIATBeforeClientUAT: "session-token-iat-before-client-uat",
  SessionTokenNBF: "session-token-nbf",
  SessionTokenIatInTheFuture: "session-token-iat-in-the-future",
  SessionTokenWithoutClientUAT: "session-token-but-no-client-uat",
  ActiveOrganizationMismatch: "active-organization-mismatch",
  TokenTypeMismatch: "token-type-mismatch",
  UnexpectedError: "unexpected-error"
};
function signedIn(params) {
  const { authenticateContext, headers = new Headers(), token } = params;
  const toAuth = /* @__PURE__ */ __name((({ treatPendingAsSignedOut = true } = {}) => {
    if (params.tokenType === TokenType.SessionToken) {
      const { sessionClaims } = params;
      const authObject = signedInAuthObject(authenticateContext, token, sessionClaims);
      if (treatPendingAsSignedOut && authObject.sessionStatus === "pending") {
        return signedOutAuthObject(void 0, authObject.sessionStatus);
      }
      return authObject;
    }
    const { machineData } = params;
    return authenticatedMachineObject(params.tokenType, token, machineData, authenticateContext);
  }), "toAuth");
  return {
    status: AuthStatus.SignedIn,
    reason: null,
    message: null,
    proxyUrl: authenticateContext.proxyUrl || "",
    publishableKey: authenticateContext.publishableKey || "",
    isSatellite: authenticateContext.isSatellite || false,
    domain: authenticateContext.domain || "",
    signInUrl: authenticateContext.signInUrl || "",
    signUpUrl: authenticateContext.signUpUrl || "",
    afterSignInUrl: authenticateContext.afterSignInUrl || "",
    afterSignUpUrl: authenticateContext.afterSignUpUrl || "",
    isSignedIn: true,
    isAuthenticated: true,
    tokenType: params.tokenType,
    toAuth,
    headers,
    token
  };
}
__name(signedIn, "signedIn");
function signedOut(params) {
  const { authenticateContext, headers = new Headers(), reason, message = "", tokenType } = params;
  const toAuth = /* @__PURE__ */ __name((() => {
    if (tokenType === TokenType.SessionToken) {
      return signedOutAuthObject({ ...authenticateContext, status: AuthStatus.SignedOut, reason, message });
    }
    return unauthenticatedMachineObject(tokenType, { reason, message, headers });
  }), "toAuth");
  return withDebugHeaders({
    status: AuthStatus.SignedOut,
    reason,
    message,
    proxyUrl: authenticateContext.proxyUrl || "",
    publishableKey: authenticateContext.publishableKey || "",
    isSatellite: authenticateContext.isSatellite || false,
    domain: authenticateContext.domain || "",
    signInUrl: authenticateContext.signInUrl || "",
    signUpUrl: authenticateContext.signUpUrl || "",
    afterSignInUrl: authenticateContext.afterSignInUrl || "",
    afterSignUpUrl: authenticateContext.afterSignUpUrl || "",
    isSignedIn: false,
    isAuthenticated: false,
    tokenType,
    toAuth,
    headers,
    token: null
  });
}
__name(signedOut, "signedOut");
function handshake(authenticateContext, reason, message = "", headers) {
  return withDebugHeaders({
    status: AuthStatus.Handshake,
    reason,
    message,
    publishableKey: authenticateContext.publishableKey || "",
    isSatellite: authenticateContext.isSatellite || false,
    domain: authenticateContext.domain || "",
    proxyUrl: authenticateContext.proxyUrl || "",
    signInUrl: authenticateContext.signInUrl || "",
    signUpUrl: authenticateContext.signUpUrl || "",
    afterSignInUrl: authenticateContext.afterSignInUrl || "",
    afterSignUpUrl: authenticateContext.afterSignUpUrl || "",
    isSignedIn: false,
    isAuthenticated: false,
    tokenType: TokenType.SessionToken,
    toAuth: /* @__PURE__ */ __name(() => null, "toAuth"),
    headers,
    token: null
  });
}
__name(handshake, "handshake");
function signedOutInvalidToken() {
  const authObject = invalidTokenAuthObject();
  return withDebugHeaders({
    status: AuthStatus.SignedOut,
    reason: AuthErrorReason.TokenTypeMismatch,
    message: "",
    proxyUrl: "",
    publishableKey: "",
    isSatellite: false,
    domain: "",
    signInUrl: "",
    signUpUrl: "",
    afterSignInUrl: "",
    afterSignUpUrl: "",
    isSignedIn: false,
    isAuthenticated: false,
    tokenType: null,
    toAuth: /* @__PURE__ */ __name(() => authObject, "toAuth"),
    headers: new Headers(),
    token: null
  });
}
__name(signedOutInvalidToken, "signedOutInvalidToken");
var withDebugHeaders = /* @__PURE__ */ __name((requestState) => {
  const headers = new Headers(requestState.headers || {});
  if (requestState.message) {
    try {
      headers.set(constants.Headers.AuthMessage, requestState.message);
    } catch {
    }
  }
  if (requestState.reason) {
    try {
      headers.set(constants.Headers.AuthReason, requestState.reason);
    } catch {
    }
  }
  if (requestState.status) {
    try {
      headers.set(constants.Headers.AuthStatus, requestState.status);
    } catch {
    }
  }
  requestState.headers = headers;
  return requestState;
}, "withDebugHeaders");
var import_cookie = __toESM(require_dist());
var ClerkUrl = class extends URL {
  static {
    __name(this, "ClerkUrl");
  }
  isCrossOrigin(other) {
    return this.origin !== new URL(other.toString()).origin;
  }
};
var createClerkUrl = /* @__PURE__ */ __name((...args) => {
  return new ClerkUrl(...args);
}, "createClerkUrl");
var ClerkRequest = class extends Request {
  static {
    __name(this, "ClerkRequest");
  }
  constructor(input, init) {
    const url = typeof input !== "string" && "url" in input ? input.url : String(input);
    let cloneInit;
    if (init) {
      cloneInit = init;
    } else if (typeof input !== "string") {
      cloneInit = new Proxy(input, {
        get(target, prop) {
          if (prop === "signal" || prop === "body") {
            return void 0;
          }
          return Reflect.get(target, prop, target);
        }
      });
    }
    super(url, cloneInit);
    this.clerkUrl = this.deriveUrlFromHeaders(this);
    this.cookies = this.parseCookies(this);
  }
  toJSON() {
    return {
      url: this.clerkUrl.href,
      method: this.method,
      headers: JSON.stringify(Object.fromEntries(this.headers)),
      clerkUrl: this.clerkUrl.toString(),
      cookies: JSON.stringify(Object.fromEntries(this.cookies))
    };
  }
  /**
   * Used to fix request.url using the x-forwarded-* headers
   * TODO add detailed description of the issues this solves
   */
  deriveUrlFromHeaders(req) {
    const initialUrl = new URL(req.url);
    const forwardedProto = req.headers.get(constants.Headers.ForwardedProto);
    const forwardedHost = req.headers.get(constants.Headers.ForwardedHost);
    const host = req.headers.get(constants.Headers.Host);
    const protocol = initialUrl.protocol;
    const resolvedHost = this.getFirstValueFromHeader(forwardedHost) ?? host;
    const resolvedProtocol = this.getFirstValueFromHeader(forwardedProto) ?? protocol?.replace(/[:/]/, "");
    const origin = resolvedHost && resolvedProtocol ? `${resolvedProtocol}://${resolvedHost}` : initialUrl.origin;
    if (origin === initialUrl.origin) {
      return createClerkUrl(initialUrl);
    }
    try {
      return createClerkUrl(initialUrl.pathname + initialUrl.search, origin);
    } catch {
      return createClerkUrl(initialUrl);
    }
  }
  getFirstValueFromHeader(value) {
    return value?.split(",")[0];
  }
  parseCookies(req) {
    const cookiesRecord = (0, import_cookie.parse)(this.decodeCookieValue(req.headers.get("cookie") || ""));
    return new Map(Object.entries(cookiesRecord));
  }
  decodeCookieValue(str) {
    return str ? str.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent) : str;
  }
};
var createClerkRequest = /* @__PURE__ */ __name((...args) => {
  const isClerkRequest = args[0] && typeof args[0] === "object" && "clerkUrl" in args[0] && "cookies" in args[0];
  return isClerkRequest ? args[0] : new ClerkRequest(...args);
}, "createClerkRequest");
var getCookieName = /* @__PURE__ */ __name((cookieDirective) => {
  return cookieDirective.split(";")[0]?.split("=")[0];
}, "getCookieName");
var getCookieValue = /* @__PURE__ */ __name((cookieDirective) => {
  return cookieDirective.split(";")[0]?.split("=")[1];
}, "getCookieValue");
async function verifyToken(token, options) {
  const { data: decodedResult, errors } = decodeJwt(token);
  if (errors) {
    return { errors };
  }
  const { header } = decodedResult;
  const { kid } = header;
  try {
    let key;
    if (options.jwtKey) {
      key = loadClerkJwkFromPem({ kid, pem: options.jwtKey });
    } else if (options.secretKey) {
      key = await loadClerkJWKFromRemote({ ...options, kid });
    } else {
      return {
        errors: [
          new TokenVerificationError({
            action: TokenVerificationErrorAction.SetClerkJWTKey,
            message: "Failed to resolve JWK during verification.",
            reason: TokenVerificationErrorReason.JWKFailedToResolve
          })
        ]
      };
    }
    return await verifyJwt(token, { ...options, key });
  } catch (error) {
    return { errors: [error] };
  }
}
__name(verifyToken, "verifyToken");
function handleClerkAPIError(tokenType, err, notFoundMessage) {
  if (isClerkAPIResponseError(err)) {
    let code;
    let message;
    switch (err.status) {
      case 401:
        code = MachineTokenVerificationErrorCode.InvalidSecretKey;
        message = err.errors[0]?.message || "Invalid secret key";
        break;
      case 404:
        code = MachineTokenVerificationErrorCode.TokenInvalid;
        message = notFoundMessage;
        break;
      default:
        code = MachineTokenVerificationErrorCode.UnexpectedError;
        message = "Unexpected error";
    }
    return {
      data: void 0,
      tokenType,
      errors: [
        new MachineTokenVerificationError({
          message,
          code,
          status: err.status
        })
      ]
    };
  }
  return {
    data: void 0,
    tokenType,
    errors: [
      new MachineTokenVerificationError({
        message: "Unexpected error",
        code: MachineTokenVerificationErrorCode.UnexpectedError,
        status: err.status
      })
    ]
  };
}
__name(handleClerkAPIError, "handleClerkAPIError");
async function verifyM2MToken(token, options) {
  try {
    const client = createBackendApiClient(options);
    const verifiedToken = await client.m2m.verify({ token });
    return { data: verifiedToken, tokenType: TokenType.M2MToken, errors: void 0 };
  } catch (err) {
    return handleClerkAPIError(TokenType.M2MToken, err, "Machine token not found");
  }
}
__name(verifyM2MToken, "verifyM2MToken");
async function verifyOAuthToken(accessToken, options) {
  try {
    const client = createBackendApiClient(options);
    const verifiedToken = await client.idPOAuthAccessToken.verify(accessToken);
    return { data: verifiedToken, tokenType: TokenType.OAuthToken, errors: void 0 };
  } catch (err) {
    return handleClerkAPIError(TokenType.OAuthToken, err, "OAuth token not found");
  }
}
__name(verifyOAuthToken, "verifyOAuthToken");
async function verifyAPIKey(secret, options) {
  try {
    const client = createBackendApiClient(options);
    const verifiedToken = await client.apiKeys.verify(secret);
    return { data: verifiedToken, tokenType: TokenType.ApiKey, errors: void 0 };
  } catch (err) {
    return handleClerkAPIError(TokenType.ApiKey, err, "API key not found");
  }
}
__name(verifyAPIKey, "verifyAPIKey");
async function verifyMachineAuthToken(token, options) {
  if (isJwtFormat(token)) {
    let decodedResult;
    try {
      const { data, errors: decodeErrors } = decodeJwt(token);
      if (decodeErrors) {
        throw decodeErrors[0];
      }
      decodedResult = data;
    } catch (e) {
      return {
        data: void 0,
        tokenType: TokenType.M2MToken,
        errors: [
          new MachineTokenVerificationError({
            code: MachineTokenVerificationErrorCode.TokenInvalid,
            message: e.message
          })
        ]
      };
    }
    if (typeof decodedResult.payload.sub === "string" && decodedResult.payload.sub.startsWith(M2M_SUBJECT_PREFIX)) {
      return verifyM2MJwt(token, decodedResult, options);
    }
    if (OAUTH_ACCESS_TOKEN_TYPES.includes(decodedResult.header.typ)) {
      return verifyOAuthJwt(token, decodedResult, options);
    }
    return {
      data: void 0,
      tokenType: TokenType.OAuthToken,
      errors: [
        new MachineTokenVerificationError({
          code: MachineTokenVerificationErrorCode.TokenVerificationFailed,
          message: `Invalid JWT type: ${decodedResult.header.typ ?? "missing"}. Expected one of: ${OAUTH_ACCESS_TOKEN_TYPES.join(", ")} for OAuth, or sub starting with 'mch_' for M2M`
        })
      ]
    };
  }
  if (token.startsWith(M2M_TOKEN_PREFIX)) {
    return verifyM2MToken(token, options);
  }
  if (token.startsWith(OAUTH_TOKEN_PREFIX)) {
    return verifyOAuthToken(token, options);
  }
  if (token.startsWith(API_KEY_PREFIX)) {
    return verifyAPIKey(token, options);
  }
  throw new Error("Unknown machine token type");
}
__name(verifyMachineAuthToken, "verifyMachineAuthToken");
async function verifyHandshakeJwt(token, { key }) {
  const { data: decoded, errors } = decodeJwt(token);
  if (errors) {
    throw errors[0];
  }
  const { header, payload } = decoded;
  const { typ, alg } = header;
  assertHeaderType(typ);
  assertHeaderAlgorithm(alg);
  const { data: signatureValid, errors: signatureErrors } = await hasValidSignature(decoded, key);
  if (signatureErrors) {
    throw new TokenVerificationError({
      reason: TokenVerificationErrorReason.TokenVerificationFailed,
      message: `Error verifying handshake token. ${signatureErrors[0]}`
    });
  }
  if (!signatureValid) {
    throw new TokenVerificationError({
      reason: TokenVerificationErrorReason.TokenInvalidSignature,
      message: "Handshake signature is invalid."
    });
  }
  return payload;
}
__name(verifyHandshakeJwt, "verifyHandshakeJwt");
async function verifyHandshakeToken(token, options) {
  const { secretKey, apiUrl, apiVersion, jwksCacheTtlInMs, jwtKey, skipJwksCache } = options;
  const { data, errors } = decodeJwt(token);
  if (errors) {
    throw errors[0];
  }
  const { kid } = data.header;
  let key;
  if (jwtKey) {
    key = loadClerkJwkFromPem({ kid, pem: jwtKey });
  } else if (secretKey) {
    key = await loadClerkJWKFromRemote({ secretKey, apiUrl, apiVersion, kid, jwksCacheTtlInMs, skipJwksCache });
  } else {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.SetClerkJWTKey,
      message: "Failed to resolve JWK during handshake verification.",
      reason: TokenVerificationErrorReason.JWKFailedToResolve
    });
  }
  return verifyHandshakeJwt(token, { key });
}
__name(verifyHandshakeToken, "verifyHandshakeToken");
var HandshakeService = class {
  static {
    __name(this, "HandshakeService");
  }
  constructor(authenticateContext, options, organizationMatcher) {
    this.authenticateContext = authenticateContext;
    this.options = options;
    this.organizationMatcher = organizationMatcher;
  }
  /**
   * Determines if a request is eligible for handshake based on its headers
   *
   * Currently, a request is only eligible for a handshake if we can say it's *probably* a request for a document, not a fetch or some other exotic request.
   * This heuristic should give us a reliable enough signal for browsers that support `Sec-Fetch-Dest` and for those that don't.
   *
   * @returns boolean indicating if the request is eligible for handshake
   */
  isRequestEligibleForHandshake() {
    const { accept, method, secFetchDest } = this.authenticateContext;
    if (method !== "GET") {
      return false;
    }
    if (secFetchDest === "document" || secFetchDest === "iframe") {
      return true;
    }
    if (!secFetchDest && accept?.startsWith("text/html")) {
      return true;
    }
    return false;
  }
  /**
   * Builds the redirect headers for a handshake request
   * @param reason - The reason for the handshake (e.g. 'session-token-expired')
   * @returns Headers object containing the Location header for redirect
   * @throws Error if clerkUrl is missing in authenticateContext
   */
  buildRedirectToHandshake(reason) {
    if (!this.authenticateContext?.clerkUrl) {
      throw new Error("Missing clerkUrl in authenticateContext");
    }
    const redirectUrl = this.removeDevBrowserFromURL(this.authenticateContext.clerkUrl);
    let baseUrl = this.authenticateContext.frontendApi.startsWith("http") ? this.authenticateContext.frontendApi : `https://${this.authenticateContext.frontendApi}`;
    baseUrl = baseUrl.replace(/\/+$/, "") + "/";
    const url = new URL("v1/client/handshake", baseUrl);
    url.searchParams.append("redirect_url", redirectUrl?.href || "");
    url.searchParams.append("__clerk_api_version", SUPPORTED_BAPI_VERSION);
    url.searchParams.append(
      constants.QueryParameters.SuffixedCookies,
      this.authenticateContext.usesSuffixedCookies().toString()
    );
    url.searchParams.append(constants.QueryParameters.HandshakeReason, reason);
    url.searchParams.append(constants.QueryParameters.HandshakeFormat, "nonce");
    if (this.authenticateContext.sessionToken) {
      url.searchParams.append(constants.QueryParameters.Session, this.authenticateContext.sessionToken);
    }
    if (this.authenticateContext.instanceType === "development" && this.authenticateContext.devBrowserToken) {
      url.searchParams.append(constants.QueryParameters.DevBrowser, this.authenticateContext.devBrowserToken);
    }
    const toActivate = this.getOrganizationSyncTarget(this.authenticateContext.clerkUrl, this.organizationMatcher);
    if (toActivate) {
      const params = this.getOrganizationSyncQueryParams(toActivate);
      params.forEach((value, key) => {
        url.searchParams.append(key, value);
      });
    }
    return new Headers({ [constants.Headers.Location]: url.href });
  }
  /**
   * Gets cookies from either a handshake nonce or a handshake token
   * @returns Promise resolving to string array of cookie directives
   */
  async getCookiesFromHandshake() {
    const cookiesToSet = [];
    if (this.authenticateContext.handshakeNonce) {
      try {
        const handshakePayload = await this.authenticateContext.apiClient?.clients.getHandshakePayload({
          nonce: this.authenticateContext.handshakeNonce
        });
        if (handshakePayload) {
          cookiesToSet.push(...handshakePayload.directives);
        }
      } catch (error) {
        console.error("Clerk: HandshakeService: error getting handshake payload:", error);
      }
    } else if (this.authenticateContext.handshakeToken) {
      const handshakePayload = await verifyHandshakeToken(
        this.authenticateContext.handshakeToken,
        this.authenticateContext
      );
      if (handshakePayload && Array.isArray(handshakePayload.handshake)) {
        cookiesToSet.push(...handshakePayload.handshake);
      }
    }
    return cookiesToSet;
  }
  /**
   * Resolves a handshake request by verifying the handshake token and setting appropriate cookies
   * @returns Promise resolving to either a SignedInState or SignedOutState
   * @throws Error if handshake verification fails or if there are issues with the session token
   */
  async resolveHandshake() {
    const headers = new Headers({
      "Access-Control-Allow-Origin": "null",
      "Access-Control-Allow-Credentials": "true"
    });
    const cookiesToSet = await this.getCookiesFromHandshake();
    let sessionToken = "";
    cookiesToSet.forEach((x) => {
      headers.append("Set-Cookie", x);
      if (getCookieName(x).startsWith(constants.Cookies.Session)) {
        sessionToken = getCookieValue(x);
      }
    });
    if (this.authenticateContext.instanceType === "development") {
      const newUrl = new URL(this.authenticateContext.clerkUrl);
      newUrl.searchParams.delete(constants.QueryParameters.Handshake);
      newUrl.searchParams.delete(constants.QueryParameters.HandshakeHelp);
      newUrl.searchParams.delete(constants.QueryParameters.DevBrowser);
      newUrl.searchParams.delete(constants.QueryParameters.HandshakeNonce);
      headers.append(constants.Headers.Location, newUrl.toString());
      headers.set(constants.Headers.CacheControl, "no-store");
    }
    if (sessionToken === "") {
      return signedOut({
        tokenType: TokenType.SessionToken,
        authenticateContext: this.authenticateContext,
        reason: AuthErrorReason.SessionTokenMissing,
        message: "",
        headers
      });
    }
    const { data, errors: [error] = [] } = await verifyToken(sessionToken, this.authenticateContext);
    if (data) {
      return signedIn({
        tokenType: TokenType.SessionToken,
        authenticateContext: this.authenticateContext,
        sessionClaims: data,
        headers,
        token: sessionToken
      });
    }
    if (this.authenticateContext.instanceType === "development" && (error?.reason === TokenVerificationErrorReason.TokenExpired || error?.reason === TokenVerificationErrorReason.TokenNotActiveYet || error?.reason === TokenVerificationErrorReason.TokenIatInTheFuture)) {
      const developmentError = new TokenVerificationError({
        action: error.action,
        message: error.message,
        reason: error.reason
      });
      developmentError.tokenCarrier = "cookie";
      console.error(
        `Clerk: Clock skew detected. This usually means that your system clock is inaccurate. Clerk will attempt to account for the clock skew in development.

To resolve this issue, make sure your system's clock is set to the correct time (e.g. turn off and on automatic time synchronization).

---

${developmentError.getFullMessage()}`
      );
      const { data: retryResult, errors: [retryError] = [] } = await verifyToken(sessionToken, {
        ...this.authenticateContext,
        clockSkewInMs: 864e5
      });
      if (retryResult) {
        return signedIn({
          tokenType: TokenType.SessionToken,
          authenticateContext: this.authenticateContext,
          sessionClaims: retryResult,
          headers,
          token: sessionToken
        });
      }
      throw new Error(retryError?.message || "Clerk: Handshake retry failed.");
    }
    throw new Error(error?.message || "Clerk: Handshake failed.");
  }
  /**
   * Handles handshake token verification errors in development mode
   * @param error - The TokenVerificationError that occurred
   * @throws Error with a descriptive message about the verification failure
   */
  handleTokenVerificationErrorInDevelopment(error) {
    if (error.reason === TokenVerificationErrorReason.TokenInvalidSignature) {
      const msg = `Clerk: Handshake token verification failed due to an invalid signature. If you have switched Clerk keys locally, clear your cookies and try again.`;
      throw new Error(msg);
    }
    throw new Error(`Clerk: Handshake token verification failed: ${error.getFullMessage()}.`);
  }
  /**
   * Checks if a redirect loop is detected and sets headers to track redirect count
   * @param headers - The Headers object to modify
   * @returns boolean indicating if a redirect loop was detected (true) or if the request can proceed (false)
   */
  checkAndTrackRedirectLoop(headers) {
    if (this.authenticateContext.handshakeRedirectLoopCounter === 3) {
      return true;
    }
    const newCounterValue = this.authenticateContext.handshakeRedirectLoopCounter + 1;
    const cookieName = constants.Cookies.RedirectCount;
    headers.append("Set-Cookie", `${cookieName}=${newCounterValue}; SameSite=Lax; HttpOnly; Max-Age=2`);
    return false;
  }
  removeDevBrowserFromURL(url) {
    const updatedURL = new URL(url);
    updatedURL.searchParams.delete(constants.QueryParameters.DevBrowser);
    updatedURL.searchParams.delete(constants.QueryParameters.LegacyDevBrowser);
    return updatedURL;
  }
  getOrganizationSyncTarget(url, matchers) {
    return matchers.findTarget(url);
  }
  getOrganizationSyncQueryParams(toActivate) {
    const ret = /* @__PURE__ */ new Map();
    if (toActivate.type === "personalAccount") {
      ret.set("organization_id", "");
    }
    if (toActivate.type === "organization") {
      if (toActivate.organizationId) {
        ret.set("organization_id", toActivate.organizationId);
      }
      if (toActivate.organizationSlug) {
        ret.set("organization_id", toActivate.organizationSlug);
      }
    }
    return ret;
  }
};
var OrganizationMatcher = class {
  static {
    __name(this, "OrganizationMatcher");
  }
  constructor(options) {
    this.organizationPattern = this.createMatcher(options?.organizationPatterns);
    this.personalAccountPattern = this.createMatcher(options?.personalAccountPatterns);
  }
  createMatcher(pattern) {
    if (!pattern) {
      return null;
    }
    try {
      return match(pattern);
    } catch (e) {
      throw new Error(`Invalid pattern "${pattern}": ${e}`);
    }
  }
  findTarget(url) {
    const orgTarget = this.findOrganizationTarget(url);
    if (orgTarget) {
      return orgTarget;
    }
    return this.findPersonalAccountTarget(url);
  }
  findOrganizationTarget(url) {
    if (!this.organizationPattern) {
      return null;
    }
    try {
      const result = this.organizationPattern(url.pathname);
      if (!result || !("params" in result)) {
        return null;
      }
      const params = result.params;
      if (params.id) {
        return { type: "organization", organizationId: params.id };
      }
      if (params.slug) {
        return { type: "organization", organizationSlug: params.slug };
      }
      return null;
    } catch (e) {
      console.error("Failed to match organization pattern:", e);
      return null;
    }
  }
  findPersonalAccountTarget(url) {
    if (!this.personalAccountPattern) {
      return null;
    }
    try {
      const result = this.personalAccountPattern(url.pathname);
      return result ? { type: "personalAccount" } : null;
    } catch (e) {
      console.error("Failed to match personal account pattern:", e);
      return null;
    }
  }
};
var RefreshTokenErrorReason = {
  NonEligibleNoCookie: "non-eligible-no-refresh-cookie",
  NonEligibleNonGet: "non-eligible-non-get",
  InvalidSessionToken: "invalid-session-token",
  MissingApiClient: "missing-api-client",
  MissingSessionToken: "missing-session-token",
  MissingRefreshToken: "missing-refresh-token",
  ExpiredSessionTokenDecodeFailed: "expired-session-token-decode-failed",
  ExpiredSessionTokenMissingSidClaim: "expired-session-token-missing-sid-claim",
  FetchError: "fetch-error",
  UnexpectedSDKError: "unexpected-sdk-error",
  UnexpectedBAPIError: "unexpected-bapi-error"
};
function assertSignInUrlExists(signInUrl, key) {
  if (!signInUrl && isDevelopmentFromSecretKey(key)) {
    throw new Error(`Missing signInUrl. Pass a signInUrl for dev instances if an app is satellite`);
  }
}
__name(assertSignInUrlExists, "assertSignInUrlExists");
function assertProxyUrlOrDomain(proxyUrlOrDomain) {
  if (!proxyUrlOrDomain) {
    throw new Error(`Missing domain and proxyUrl. A satellite application needs to specify a domain or a proxyUrl`);
  }
}
__name(assertProxyUrlOrDomain, "assertProxyUrlOrDomain");
function assertSignInUrlFormatAndOrigin(_signInUrl, origin) {
  let signInUrl;
  try {
    signInUrl = new URL(_signInUrl);
  } catch {
    throw new Error(`The signInUrl needs to have a absolute url format.`);
  }
  if (signInUrl.origin === origin) {
    throw new Error(`The signInUrl needs to be on a different origin than your satellite application.`);
  }
}
__name(assertSignInUrlFormatAndOrigin, "assertSignInUrlFormatAndOrigin");
function assertMachineSecretOrSecretKey(authenticateContext) {
  if (!authenticateContext.machineSecretKey && !authenticateContext.secretKey) {
    throw new Error(
      "Machine token authentication requires either a Machine secret key or a Clerk secret key. Ensure a Clerk secret key or Machine secret key is set."
    );
  }
}
__name(assertMachineSecretOrSecretKey, "assertMachineSecretOrSecretKey");
function isRequestEligibleForRefresh(err, authenticateContext, request) {
  return err.reason === TokenVerificationErrorReason.TokenExpired && !!authenticateContext.refreshTokenInCookie && request.method === "GET";
}
__name(isRequestEligibleForRefresh, "isRequestEligibleForRefresh");
function checkTokenTypeMismatch(parsedTokenType, acceptsToken, authenticateContext) {
  const mismatch = !isTokenTypeAccepted(parsedTokenType, acceptsToken);
  if (mismatch) {
    const tokenTypeToReturn = typeof acceptsToken === "string" ? acceptsToken : parsedTokenType;
    return signedOut({
      tokenType: tokenTypeToReturn,
      authenticateContext,
      reason: AuthErrorReason.TokenTypeMismatch
    });
  }
  return null;
}
__name(checkTokenTypeMismatch, "checkTokenTypeMismatch");
function isTokenTypeInAcceptedArray(acceptsToken, authenticateContext) {
  let parsedTokenType = null;
  const { tokenInHeader } = authenticateContext;
  if (tokenInHeader) {
    if (isMachineToken(tokenInHeader)) {
      parsedTokenType = getMachineTokenType(tokenInHeader);
    } else {
      parsedTokenType = TokenType.SessionToken;
    }
  }
  const typeToCheck = parsedTokenType ?? TokenType.SessionToken;
  return isTokenTypeAccepted(typeToCheck, acceptsToken);
}
__name(isTokenTypeInAcceptedArray, "isTokenTypeInAcceptedArray");
var authenticateRequest = /* @__PURE__ */ __name((async (request, options) => {
  const authenticateContext = await createAuthenticateContext(createClerkRequest(request), options);
  const acceptsToken = options.acceptsToken ?? TokenType.SessionToken;
  if (acceptsToken !== TokenType.M2MToken) {
    assertValidSecretKey(authenticateContext.secretKey);
    if (authenticateContext.isSatellite) {
      assertSignInUrlExists(authenticateContext.signInUrl, authenticateContext.secretKey);
      if (authenticateContext.signInUrl && authenticateContext.origin) {
        assertSignInUrlFormatAndOrigin(authenticateContext.signInUrl, authenticateContext.origin);
      }
      assertProxyUrlOrDomain(authenticateContext.proxyUrl || authenticateContext.domain);
    }
  }
  if (acceptsToken === TokenType.M2MToken) {
    assertMachineSecretOrSecretKey(authenticateContext);
  }
  const organizationMatcher = new OrganizationMatcher(options.organizationSyncOptions);
  const handshakeService = new HandshakeService(
    authenticateContext,
    { organizationSyncOptions: options.organizationSyncOptions },
    organizationMatcher
  );
  async function refreshToken(authenticateContext2) {
    if (!options.apiClient) {
      return {
        data: null,
        error: {
          message: "An apiClient is needed to perform token refresh.",
          cause: { reason: RefreshTokenErrorReason.MissingApiClient }
        }
      };
    }
    const { sessionToken: expiredSessionToken, refreshTokenInCookie: refreshToken2 } = authenticateContext2;
    if (!expiredSessionToken) {
      return {
        data: null,
        error: {
          message: "Session token must be provided.",
          cause: { reason: RefreshTokenErrorReason.MissingSessionToken }
        }
      };
    }
    if (!refreshToken2) {
      return {
        data: null,
        error: {
          message: "Refresh token must be provided.",
          cause: { reason: RefreshTokenErrorReason.MissingRefreshToken }
        }
      };
    }
    const { data: decodeResult, errors: decodedErrors } = decodeJwt(expiredSessionToken);
    if (!decodeResult || decodedErrors) {
      return {
        data: null,
        error: {
          message: "Unable to decode the expired session token.",
          cause: { reason: RefreshTokenErrorReason.ExpiredSessionTokenDecodeFailed, errors: decodedErrors }
        }
      };
    }
    if (!decodeResult?.payload?.sid) {
      return {
        data: null,
        error: {
          message: "Expired session token is missing the `sid` claim.",
          cause: { reason: RefreshTokenErrorReason.ExpiredSessionTokenMissingSidClaim }
        }
      };
    }
    try {
      const response = await options.apiClient.sessions.refreshSession(decodeResult.payload.sid, {
        format: "cookie",
        suffixed_cookies: authenticateContext2.usesSuffixedCookies(),
        expired_token: expiredSessionToken || "",
        refresh_token: refreshToken2 || "",
        request_origin: authenticateContext2.clerkUrl.origin,
        // The refresh endpoint expects headers as Record<string, string[]>, so we need to transform it.
        request_headers: Object.fromEntries(Array.from(request.headers.entries()).map(([k, v]) => [k, [v]]))
      });
      return { data: response.cookies, error: null };
    } catch (err) {
      if (err?.errors?.length) {
        if (err.errors[0].code === "unexpected_error") {
          return {
            data: null,
            error: {
              message: `Fetch unexpected error`,
              cause: { reason: RefreshTokenErrorReason.FetchError, errors: err.errors }
            }
          };
        }
        return {
          data: null,
          error: {
            message: err.errors[0].code,
            cause: { reason: err.errors[0].code, errors: err.errors }
          }
        };
      } else {
        return {
          data: null,
          error: {
            message: `Unexpected Server/BAPI error`,
            cause: { reason: RefreshTokenErrorReason.UnexpectedBAPIError, errors: [err] }
          }
        };
      }
    }
  }
  __name(refreshToken, "refreshToken");
  async function attemptRefresh(authenticateContext2) {
    const { data: cookiesToSet, error } = await refreshToken(authenticateContext2);
    if (!cookiesToSet || cookiesToSet.length === 0) {
      return { data: null, error };
    }
    const headers = new Headers();
    let sessionToken = "";
    cookiesToSet.forEach((x) => {
      headers.append("Set-Cookie", x);
      if (getCookieName(x).startsWith(constants.Cookies.Session)) {
        sessionToken = getCookieValue(x);
      }
    });
    const { data: jwtPayload, errors } = await verifyToken(sessionToken, authenticateContext2);
    if (errors) {
      return {
        data: null,
        error: {
          message: `Clerk: unable to verify refreshed session token.`,
          cause: { reason: RefreshTokenErrorReason.InvalidSessionToken, errors }
        }
      };
    }
    return { data: { jwtPayload, sessionToken, headers }, error: null };
  }
  __name(attemptRefresh, "attemptRefresh");
  function handleMaybeHandshakeStatus(authenticateContext2, reason, message, headers) {
    if (!handshakeService.isRequestEligibleForHandshake()) {
      return signedOut({
        tokenType: TokenType.SessionToken,
        authenticateContext: authenticateContext2,
        reason,
        message
      });
    }
    const handshakeHeaders = headers ?? handshakeService.buildRedirectToHandshake(reason);
    if (handshakeHeaders.get(constants.Headers.Location)) {
      handshakeHeaders.set(constants.Headers.CacheControl, "no-store");
    }
    const isRedirectLoop = handshakeService.checkAndTrackRedirectLoop(handshakeHeaders);
    if (isRedirectLoop) {
      const msg = getHandshakeRedirectLoopMessage(reason);
      console.log(msg);
      return signedOut({
        tokenType: TokenType.SessionToken,
        authenticateContext: authenticateContext2,
        reason,
        message
      });
    }
    return handshake(authenticateContext2, reason, message, handshakeHeaders);
  }
  __name(handleMaybeHandshakeStatus, "handleMaybeHandshakeStatus");
  function getHandshakeRedirectLoopMessage(reason) {
    if (reason === AuthErrorReason.SatelliteCookieNeedsSyncing) {
      return `Clerk: Satellite-domain authentication resulted in an infinite redirect loop. Check that this request is using a configured primary or satellite domain for the production instance. For preview deployments, use a development/staging Clerk instance or a supported configured preview-domain setup.`;
    }
    return `Clerk: Refreshing the session token resulted in an infinite redirect loop. This usually means that your Clerk instance keys do not match - make sure to copy the correct publishable and secret keys from the Clerk dashboard.`;
  }
  __name(getHandshakeRedirectLoopMessage, "getHandshakeRedirectLoopMessage");
  function handleMaybeOrganizationSyncHandshake(authenticateContext2, auth) {
    const organizationSyncTarget = organizationMatcher.findTarget(authenticateContext2.clerkUrl);
    if (!organizationSyncTarget) {
      return null;
    }
    let mustActivate = false;
    if (organizationSyncTarget.type === "organization") {
      if (organizationSyncTarget.organizationSlug && organizationSyncTarget.organizationSlug !== auth.orgSlug) {
        mustActivate = true;
      }
      if (organizationSyncTarget.organizationId && organizationSyncTarget.organizationId !== auth.orgId) {
        mustActivate = true;
      }
    }
    if (organizationSyncTarget.type === "personalAccount" && auth.orgId) {
      mustActivate = true;
    }
    if (!mustActivate) {
      return null;
    }
    if (authenticateContext2.handshakeRedirectLoopCounter >= 3) {
      console.warn(
        "Clerk: Organization activation handshake loop detected. This is likely due to an invalid organization ID or slug. Skipping organization activation."
      );
      return null;
    }
    const handshakeState = handleMaybeHandshakeStatus(
      authenticateContext2,
      AuthErrorReason.ActiveOrganizationMismatch,
      ""
    );
    if (handshakeState.status !== "handshake") {
      return null;
    }
    return handshakeState;
  }
  __name(handleMaybeOrganizationSyncHandshake, "handleMaybeOrganizationSyncHandshake");
  async function authenticateRequestWithTokenInHeader() {
    const { tokenInHeader } = authenticateContext;
    if (isMachineJwt(tokenInHeader)) {
      return signedOut({
        tokenType: TokenType.SessionToken,
        authenticateContext,
        reason: AuthErrorReason.TokenTypeMismatch,
        message: ""
      });
    }
    try {
      const { data, errors } = await verifyToken(tokenInHeader, authenticateContext);
      if (errors) {
        throw errors[0];
      }
      return signedIn({
        tokenType: TokenType.SessionToken,
        authenticateContext,
        sessionClaims: data,
        headers: new Headers(),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        token: tokenInHeader
      });
    } catch (err) {
      return handleSessionTokenError(err, "header");
    }
  }
  __name(authenticateRequestWithTokenInHeader, "authenticateRequestWithTokenInHeader");
  async function authenticateRequestWithTokenInCookie() {
    const hasActiveClient = authenticateContext.clientUat;
    const hasSessionToken = !!authenticateContext.sessionTokenInCookie;
    const hasDevBrowserToken = !!authenticateContext.devBrowserToken;
    if (authenticateContext.handshakeNonce || authenticateContext.handshakeToken) {
      try {
        return await handshakeService.resolveHandshake();
      } catch (error) {
        if (error instanceof TokenVerificationError && authenticateContext.instanceType === "development") {
          handshakeService.handleTokenVerificationErrorInDevelopment(error);
        } else {
          console.error("Clerk: unable to resolve handshake:", error);
        }
      }
    }
    const isRequestEligibleForMultiDomainSync = authenticateContext.isSatellite && authenticateContext.secFetchDest === "document" && authenticateContext.method === "GET";
    const syncedParam = authenticateContext.clerkUrl.searchParams.get(constants.QueryParameters.ClerkSynced);
    const needsSync = syncedParam === constants.ClerkSyncStatus.NeedsSync;
    const syncCompleted = syncedParam === constants.ClerkSyncStatus.Completed;
    const hasCookies = hasSessionToken || hasActiveClient;
    const shouldSkipSatelliteHandshake = authenticateContext.satelliteAutoSync !== true && !hasCookies && !needsSync;
    if (authenticateContext.instanceType === "production" && isRequestEligibleForMultiDomainSync && !syncCompleted) {
      if (shouldSkipSatelliteHandshake) {
        return signedOut({
          tokenType: TokenType.SessionToken,
          authenticateContext,
          reason: AuthErrorReason.SessionTokenAndUATMissing
        });
      }
      if (!hasCookies || needsSync) {
        return handleMaybeHandshakeStatus(authenticateContext, AuthErrorReason.SatelliteCookieNeedsSyncing, "");
      }
    }
    if (authenticateContext.instanceType === "development" && isRequestEligibleForMultiDomainSync && !syncCompleted) {
      if (shouldSkipSatelliteHandshake) {
        return signedOut({
          tokenType: TokenType.SessionToken,
          authenticateContext,
          reason: AuthErrorReason.SessionTokenAndUATMissing
        });
      }
      if (!hasCookies || needsSync) {
        const redirectURL = new URL(authenticateContext.signInUrl);
        redirectURL.searchParams.append(
          constants.QueryParameters.ClerkRedirectUrl,
          authenticateContext.clerkUrl.toString()
        );
        const headers = new Headers({ [constants.Headers.Location]: redirectURL.toString() });
        return handleMaybeHandshakeStatus(
          authenticateContext,
          AuthErrorReason.SatelliteCookieNeedsSyncing,
          "",
          headers
        );
      }
    }
    const redirectUrl = new URL(authenticateContext.clerkUrl).searchParams.get(
      constants.QueryParameters.ClerkRedirectUrl
    );
    if (authenticateContext.instanceType === "development" && !authenticateContext.isSatellite && redirectUrl) {
      const redirectBackToSatelliteUrl = new URL(redirectUrl);
      if (authenticateContext.devBrowserToken) {
        redirectBackToSatelliteUrl.searchParams.append(
          constants.QueryParameters.DevBrowser,
          authenticateContext.devBrowserToken
        );
      }
      redirectBackToSatelliteUrl.searchParams.set(
        constants.QueryParameters.ClerkSynced,
        constants.ClerkSyncStatus.Completed
      );
      const headers = new Headers({ [constants.Headers.Location]: redirectBackToSatelliteUrl.toString() });
      return handleMaybeHandshakeStatus(authenticateContext, AuthErrorReason.PrimaryRespondsToSyncing, "", headers);
    }
    if (authenticateContext.instanceType === "development" && authenticateContext.clerkUrl.searchParams.has(constants.QueryParameters.DevBrowser)) {
      return handleMaybeHandshakeStatus(authenticateContext, AuthErrorReason.DevBrowserSync, "");
    }
    if (authenticateContext.instanceType === "development" && !hasDevBrowserToken) {
      return handleMaybeHandshakeStatus(authenticateContext, AuthErrorReason.DevBrowserMissing, "");
    }
    if (!hasActiveClient && !hasSessionToken) {
      return signedOut({
        tokenType: TokenType.SessionToken,
        authenticateContext,
        reason: AuthErrorReason.SessionTokenAndUATMissing
      });
    }
    if (!hasActiveClient && hasSessionToken) {
      return handleMaybeHandshakeStatus(authenticateContext, AuthErrorReason.SessionTokenWithoutClientUAT, "");
    }
    if (hasActiveClient && !hasSessionToken) {
      return handleMaybeHandshakeStatus(authenticateContext, AuthErrorReason.ClientUATWithoutSessionToken, "");
    }
    const { data: decodeResult, errors: decodedErrors } = decodeJwt(authenticateContext.sessionTokenInCookie);
    if (decodedErrors) {
      return handleSessionTokenError(decodedErrors[0], "cookie");
    }
    if (decodeResult.payload.iat < authenticateContext.clientUat) {
      return handleMaybeHandshakeStatus(authenticateContext, AuthErrorReason.SessionTokenIATBeforeClientUAT, "");
    }
    try {
      const { data, errors } = await verifyToken(authenticateContext.sessionTokenInCookie, authenticateContext);
      if (errors) {
        throw errors[0];
      }
      if (!data.azp) {
        logger.warnOnce(
          "Clerk: Session token from cookie is missing the azp claim. In a future version of Clerk, this token will be considered invalid. Please contact Clerk support if you see this warning."
        );
      }
      const signedInRequestState = signedIn({
        tokenType: TokenType.SessionToken,
        authenticateContext,
        sessionClaims: data,
        headers: new Headers(),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        token: authenticateContext.sessionTokenInCookie
      });
      const shouldForceHandshakeForCrossDomain = !authenticateContext.isSatellite && // We're on primary
      authenticateContext.method === "GET" && // Only GET navigations (POST form submissions set sec-fetch-dest: document too)
      authenticateContext.secFetchDest === "document" && // Document navigation
      authenticateContext.isCrossOriginReferrer() && // Came from different domain
      !authenticateContext.isKnownClerkReferrer() && // Not from Clerk accounts portal or FAPI
      authenticateContext.handshakeRedirectLoopCounter === 0;
      if (shouldForceHandshakeForCrossDomain) {
        return handleMaybeHandshakeStatus(
          authenticateContext,
          AuthErrorReason.PrimaryDomainCrossOriginSync,
          "Cross-origin request from satellite domain requires handshake"
        );
      }
      const authObject = signedInRequestState.toAuth();
      if (authObject.userId) {
        const handshakeRequestState = handleMaybeOrganizationSyncHandshake(authenticateContext, authObject);
        if (handshakeRequestState) {
          return handshakeRequestState;
        }
      }
      return signedInRequestState;
    } catch (err) {
      return handleSessionTokenError(err, "cookie");
    }
    return signedOut({
      tokenType: TokenType.SessionToken,
      authenticateContext,
      reason: AuthErrorReason.UnexpectedError
    });
  }
  __name(authenticateRequestWithTokenInCookie, "authenticateRequestWithTokenInCookie");
  async function handleSessionTokenError(err, tokenCarrier) {
    if (!(err instanceof TokenVerificationError)) {
      return signedOut({
        tokenType: TokenType.SessionToken,
        authenticateContext,
        reason: AuthErrorReason.UnexpectedError
      });
    }
    let refreshError;
    if (isRequestEligibleForRefresh(err, authenticateContext, request)) {
      const { data, error } = await attemptRefresh(authenticateContext);
      if (data) {
        return signedIn({
          tokenType: TokenType.SessionToken,
          authenticateContext,
          sessionClaims: data.jwtPayload,
          headers: data.headers,
          token: data.sessionToken
        });
      }
      if (error?.cause?.reason) {
        refreshError = error.cause.reason;
      } else {
        refreshError = RefreshTokenErrorReason.UnexpectedSDKError;
      }
    } else {
      if (request.method !== "GET") {
        refreshError = RefreshTokenErrorReason.NonEligibleNonGet;
      } else if (!authenticateContext.refreshTokenInCookie) {
        refreshError = RefreshTokenErrorReason.NonEligibleNoCookie;
      } else {
        refreshError = null;
      }
    }
    err.tokenCarrier = tokenCarrier;
    const reasonToHandshake = [
      TokenVerificationErrorReason.TokenExpired,
      TokenVerificationErrorReason.TokenNotActiveYet,
      TokenVerificationErrorReason.TokenIatInTheFuture
    ].includes(err.reason);
    if (reasonToHandshake) {
      return handleMaybeHandshakeStatus(
        authenticateContext,
        convertTokenVerificationErrorReasonToAuthErrorReason({ tokenError: err.reason, refreshError }),
        err.getFullMessage()
      );
    }
    return signedOut({
      tokenType: TokenType.SessionToken,
      authenticateContext,
      reason: err.reason,
      message: err.getFullMessage()
    });
  }
  __name(handleSessionTokenError, "handleSessionTokenError");
  function handleMachineError(tokenType, err) {
    if (!(err instanceof MachineTokenVerificationError)) {
      return signedOut({
        tokenType,
        authenticateContext,
        reason: AuthErrorReason.UnexpectedError
      });
    }
    return signedOut({
      tokenType,
      authenticateContext,
      reason: err.code,
      message: err.getFullMessage()
    });
  }
  __name(handleMachineError, "handleMachineError");
  async function authenticateMachineRequestWithTokenInHeader() {
    const { tokenInHeader } = authenticateContext;
    if (!tokenInHeader) {
      return handleSessionTokenError(new Error("Missing token in header"), "header");
    }
    if (!isMachineToken(tokenInHeader)) {
      return signedOut({
        tokenType: acceptsToken,
        authenticateContext,
        reason: AuthErrorReason.TokenTypeMismatch,
        message: ""
      });
    }
    const parsedTokenType = getMachineTokenType(tokenInHeader);
    const mismatchState = checkTokenTypeMismatch(parsedTokenType, acceptsToken, authenticateContext);
    if (mismatchState) {
      return mismatchState;
    }
    const { data, tokenType, errors } = await verifyMachineAuthToken(tokenInHeader, authenticateContext);
    if (errors) {
      return handleMachineError(tokenType, errors[0]);
    }
    return signedIn({
      tokenType,
      authenticateContext,
      machineData: data,
      token: tokenInHeader
    });
  }
  __name(authenticateMachineRequestWithTokenInHeader, "authenticateMachineRequestWithTokenInHeader");
  async function authenticateAnyRequestWithTokenInHeader() {
    const { tokenInHeader } = authenticateContext;
    if (!tokenInHeader) {
      return handleSessionTokenError(new Error("Missing token in header"), "header");
    }
    if (isMachineToken(tokenInHeader)) {
      const parsedTokenType = getMachineTokenType(tokenInHeader);
      const mismatchState = checkTokenTypeMismatch(parsedTokenType, acceptsToken, authenticateContext);
      if (mismatchState) {
        return mismatchState;
      }
      const { data: data2, tokenType, errors: errors2 } = await verifyMachineAuthToken(tokenInHeader, authenticateContext);
      if (errors2) {
        return handleMachineError(tokenType, errors2[0]);
      }
      return signedIn({
        tokenType,
        authenticateContext,
        machineData: data2,
        token: tokenInHeader
      });
    }
    const { data, errors } = await verifyToken(tokenInHeader, authenticateContext);
    if (errors) {
      return handleSessionTokenError(errors[0], "header");
    }
    return signedIn({
      tokenType: TokenType.SessionToken,
      authenticateContext,
      sessionClaims: data,
      token: tokenInHeader
    });
  }
  __name(authenticateAnyRequestWithTokenInHeader, "authenticateAnyRequestWithTokenInHeader");
  if (Array.isArray(acceptsToken)) {
    if (!isTokenTypeInAcceptedArray(acceptsToken, authenticateContext)) {
      return signedOutInvalidToken();
    }
  }
  if (authenticateContext.tokenInHeader) {
    if (acceptsToken === "any" || Array.isArray(acceptsToken)) {
      return authenticateAnyRequestWithTokenInHeader();
    }
    if (acceptsToken === TokenType.SessionToken) {
      return authenticateRequestWithTokenInHeader();
    }
    return authenticateMachineRequestWithTokenInHeader();
  }
  if (acceptsToken === TokenType.OAuthToken || acceptsToken === TokenType.ApiKey || acceptsToken === TokenType.M2MToken) {
    return signedOut({
      tokenType: acceptsToken,
      authenticateContext,
      reason: "No token in header"
    });
  }
  return authenticateRequestWithTokenInCookie();
}), "authenticateRequest");
var debugRequestState = /* @__PURE__ */ __name((params) => {
  const { isSignedIn, isAuthenticated, proxyUrl, reason, message, publishableKey, isSatellite, domain } = params;
  return { isSignedIn, isAuthenticated, proxyUrl, reason, message, publishableKey, isSatellite, domain };
}, "debugRequestState");
var convertTokenVerificationErrorReasonToAuthErrorReason = /* @__PURE__ */ __name(({
  tokenError,
  refreshError
}) => {
  switch (tokenError) {
    case TokenVerificationErrorReason.TokenExpired:
      return `${AuthErrorReason.SessionTokenExpired}-refresh-${refreshError}`;
    case TokenVerificationErrorReason.TokenNotActiveYet:
      return AuthErrorReason.SessionTokenNBF;
    case TokenVerificationErrorReason.TokenIatInTheFuture:
      return AuthErrorReason.SessionTokenIatInTheFuture;
    default:
      return AuthErrorReason.UnexpectedError;
  }
}, "convertTokenVerificationErrorReasonToAuthErrorReason");
var defaultOptions2 = {
  secretKey: "",
  machineSecretKey: "",
  jwtKey: "",
  apiUrl: void 0,
  apiVersion: void 0,
  proxyUrl: "",
  publishableKey: "",
  isSatellite: false,
  domain: "",
  audience: ""
};
function createAuthenticateRequest(params) {
  const buildTimeOptions = mergePreDefinedOptions(defaultOptions2, params.options);
  const apiClient = params.apiClient;
  const authenticateRequest2 = /* @__PURE__ */ __name((request, options = {}) => {
    const { apiUrl, apiVersion } = buildTimeOptions;
    const runTimeOptions = mergePreDefinedOptions(buildTimeOptions, options);
    return authenticateRequest(request, {
      ...options,
      ...runTimeOptions,
      // We should add all the omitted props from options here (eg apiUrl / apiVersion)
      // to avoid runtime options override them.
      apiUrl,
      apiVersion,
      apiClient
    });
  }, "authenticateRequest2");
  return {
    authenticateRequest: authenticateRequest2,
    debugRequestState
  };
}
__name(createAuthenticateRequest, "createAuthenticateRequest");

// node_modules/@clerk/backend/dist/chunk-P263NW7Z.mjs
function withLegacyReturn(cb) {
  return async (...args) => {
    const { data, errors } = await cb(...args);
    if (errors) {
      throw errors[0];
    }
    return data;
  };
}
__name(withLegacyReturn, "withLegacyReturn");

// node_modules/@clerk/shared/dist/underscore.mjs
function snakeToCamel(str) {
  return str ? str.replace(/([-_][a-z])/g, (match2) => match2.toUpperCase().replace(/-|_/, "")) : "";
}
__name(snakeToCamel, "snakeToCamel");
function camelToSnake(str) {
  return str ? str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`) : "";
}
__name(camelToSnake, "camelToSnake");
var createDeepObjectTransformer = /* @__PURE__ */ __name((transform) => {
  const deepTransform = /* @__PURE__ */ __name((obj) => {
    if (!obj) return obj;
    if (Array.isArray(obj)) return obj.map((el) => {
      if (typeof el === "object" || Array.isArray(el)) return deepTransform(el);
      return el;
    });
    const copy = { ...obj };
    const keys = Object.keys(copy);
    for (const oldName of keys) {
      const newName = transform(oldName.toString());
      if (newName !== oldName) {
        copy[newName] = copy[oldName];
        delete copy[oldName];
      }
      if (typeof copy[newName] === "object") copy[newName] = deepTransform(copy[newName]);
    }
    return copy;
  }, "deepTransform");
  return deepTransform;
}, "createDeepObjectTransformer");
var deepCamelToSnake = createDeepObjectTransformer(camelToSnake);
var deepSnakeToCamel = createDeepObjectTransformer(snakeToCamel);
function isTruthy(value) {
  if (typeof value === `boolean`) return value;
  if (value === void 0 || value === null) return false;
  if (typeof value === `string`) {
    if (value.toLowerCase() === `true`) return true;
    if (value.toLowerCase() === `false`) return false;
  }
  const number = parseInt(value, 10);
  if (isNaN(number)) return false;
  if (number > 0) return true;
  return false;
}
__name(isTruthy, "isTruthy");

// node_modules/@clerk/shared/dist/_chunks/telemetry-9C6N5ppw.mjs
var PROCESS_FLAG = /* @__PURE__ */ Symbol.for("@clerk/shared.telemetryNoticeShown");
var NOTICE_LINES = [
  "Attention: Clerk collects telemetry data from its SDKs when connected to development instances.",
  "The data collected is used to inform Clerk's product roadmap.",
  "To learn more, including how to opt-out from the telemetry program, visit: https://clerk.com/docs/telemetry."
];
function isServerRuntime() {
  if (typeof window !== "undefined") return false;
  if (typeof globalThis.EdgeRuntime !== "undefined") return false;
  return true;
}
__name(isServerRuntime, "isServerRuntime");
function isCI() {
  if (typeof process === "undefined" || !process.env) return false;
  return automatedEnvironmentVariables.some((name) => isTruthy(process.env[name]));
}
__name(isCI, "isCI");
function hasSeen() {
  return Boolean(globalThis[PROCESS_FLAG]);
}
__name(hasSeen, "hasSeen");
function markSeen() {
  globalThis[PROCESS_FLAG] = true;
}
__name(markSeen, "markSeen");
function printNotice() {
  if (typeof console === "undefined" || typeof console.log !== "function") return;
  for (const line of NOTICE_LINES) console.log(line);
  console.log("");
}
__name(printNotice, "printNotice");
function maybeShowTelemetryNotice(options = {}) {
  if (options.skip) return;
  try {
    if (!isServerRuntime()) return;
    if (isCI()) return;
    if (hasSeen()) return;
    printNotice();
    markSeen();
  } catch {
  }
}
__name(maybeShowTelemetryNotice, "maybeShowTelemetryNotice");
var DEFAULT_CACHE_TTL_MS = 864e5;
var TelemetryEventThrottler = class {
  static {
    __name(this, "TelemetryEventThrottler");
  }
  #cache;
  #cacheTtl = DEFAULT_CACHE_TTL_MS;
  constructor(cache2) {
    this.#cache = cache2;
  }
  isEventThrottled(payload) {
    const now = Date.now();
    const key = this.#generateKey(payload);
    const entry = this.#cache.getItem(key);
    if (!entry) {
      this.#cache.setItem(key, now);
      return false;
    }
    if (now - entry > this.#cacheTtl) {
      this.#cache.setItem(key, now);
      return false;
    }
    return true;
  }
  /**
  * Generates a consistent unique key for telemetry events by sorting payload properties.
  * This ensures that payloads with identical content in different orders produce the same key.
  */
  #generateKey(event) {
    const { sk: _sk, pk: _pk, payload, ...rest } = event;
    const sanitizedEvent = {
      ...payload,
      ...rest
    };
    return JSON.stringify(Object.keys({
      ...payload,
      ...rest
    }).sort().map((key) => sanitizedEvent[key]));
  }
};
var LocalStorageThrottlerCache = class {
  static {
    __name(this, "LocalStorageThrottlerCache");
  }
  #storageKey = "clerk_telemetry_throttler";
  getItem(key) {
    return this.#getCache()[key];
  }
  setItem(key, value) {
    try {
      const cache2 = this.#getCache();
      cache2[key] = value;
      localStorage.setItem(this.#storageKey, JSON.stringify(cache2));
    } catch (err) {
      if (err instanceof DOMException && (err.name === "QuotaExceededError" || err.name === "NS_ERROR_DOM_QUOTA_REACHED") && localStorage.length > 0) localStorage.removeItem(this.#storageKey);
    }
  }
  removeItem(key) {
    try {
      const cache2 = this.#getCache();
      delete cache2[key];
      localStorage.setItem(this.#storageKey, JSON.stringify(cache2));
    } catch {
    }
  }
  #getCache() {
    try {
      const cacheString = localStorage.getItem(this.#storageKey);
      if (!cacheString) return {};
      return JSON.parse(cacheString);
    } catch {
      return {};
    }
  }
  static isSupported() {
    return typeof window !== "undefined" && !!window.localStorage;
  }
};
var InMemoryThrottlerCache = class {
  static {
    __name(this, "InMemoryThrottlerCache");
  }
  #cache = /* @__PURE__ */ new Map();
  #maxSize = 1e4;
  getItem(key) {
    if (this.#cache.size > this.#maxSize) {
      this.#cache.clear();
      return;
    }
    return this.#cache.get(key);
  }
  setItem(key, value) {
    this.#cache.set(key, value);
  }
  removeItem(key) {
    this.#cache.delete(key);
  }
};
function isWindowClerkWithMetadata(clerk) {
  return typeof clerk === "object" && clerk !== null && "constructor" in clerk && typeof clerk.constructor === "function";
}
__name(isWindowClerkWithMetadata, "isWindowClerkWithMetadata");
var VALID_LOG_LEVELS = /* @__PURE__ */ new Set([
  "error",
  "warn",
  "info",
  "debug",
  "trace"
]);
var DEFAULT_CONFIG = {
  samplingRate: 1,
  maxBufferSize: 5,
  endpoint: "https://clerk-telemetry.com"
};
var TelemetryCollector = class {
  static {
    __name(this, "TelemetryCollector");
  }
  #config;
  #eventThrottler;
  #metadata = {};
  #buffer = [];
  #pendingFlush = null;
  constructor(options) {
    this.#config = {
      maxBufferSize: options.maxBufferSize ?? DEFAULT_CONFIG.maxBufferSize,
      samplingRate: options.samplingRate ?? DEFAULT_CONFIG.samplingRate,
      perEventSampling: options.perEventSampling ?? true,
      disabled: options.disabled ?? false,
      debug: options.debug ?? false,
      endpoint: DEFAULT_CONFIG.endpoint
    };
    if (!options.clerkVersion && typeof window === "undefined") this.#metadata.clerkVersion = "";
    else this.#metadata.clerkVersion = options.clerkVersion ?? "";
    this.#metadata.sdk = options.sdk;
    this.#metadata.sdkVersion = options.sdkVersion;
    this.#metadata.publishableKey = options.publishableKey ?? "";
    const parsedKey = parsePublishableKey(options.publishableKey);
    if (parsedKey) this.#metadata.instanceType = parsedKey.instanceType;
    if (options.secretKey) this.#metadata.secretKey = options.secretKey.substring(0, 16);
    const cache2 = LocalStorageThrottlerCache.isSupported() ? new LocalStorageThrottlerCache() : new InMemoryThrottlerCache();
    this.#eventThrottler = new TelemetryEventThrottler(cache2);
    maybeShowTelemetryNotice({ skip: !this.isEnabled });
  }
  get isEnabled() {
    if (this.#metadata.instanceType !== "development") return false;
    if (this.#config.disabled || typeof process !== "undefined" && process.env && isTruthy(process.env.CLERK_TELEMETRY_DISABLED)) return false;
    if (typeof window !== "undefined" && !!window?.navigator?.webdriver) return false;
    return true;
  }
  get isDebug() {
    return this.#config.debug || typeof process !== "undefined" && process.env && isTruthy(process.env.CLERK_TELEMETRY_DEBUG);
  }
  record(event) {
    try {
      const preparedPayload = this.#preparePayload(event.event, event.payload);
      this.#logEvent(preparedPayload.event, preparedPayload);
      if (!this.#shouldRecord(preparedPayload, event.eventSamplingRate)) return;
      this.#buffer.push({
        kind: "event",
        value: preparedPayload
      });
      this.#scheduleFlush();
    } catch (error) {
      console.error("[clerk/telemetry] Error recording telemetry event", error);
    }
  }
  /**
  * Records a telemetry log entry if logging is enabled and not in debug mode.
  *
  * @param entry - The telemetry log entry to record.
  */
  recordLog(entry) {
    try {
      if (!this.#shouldRecordLog(entry)) return;
      const levelIsValid = typeof entry?.level === "string" && VALID_LOG_LEVELS.has(entry.level);
      const messageIsValid = typeof entry?.message === "string" && entry.message.trim().length > 0;
      let normalizedTimestamp = null;
      const timestampInput = entry?.timestamp;
      if (typeof timestampInput === "number" || typeof timestampInput === "string") {
        const candidate = new Date(timestampInput);
        if (!Number.isNaN(candidate.getTime())) normalizedTimestamp = candidate;
      }
      if (!levelIsValid || !messageIsValid || normalizedTimestamp === null) {
        if (this.isDebug && typeof console !== "undefined") console.warn("[clerk/telemetry] Dropping invalid telemetry log entry", {
          levelIsValid,
          messageIsValid,
          timestampIsValid: normalizedTimestamp !== null
        });
        return;
      }
      const sdkMetadata = this.#getSDKMetadata();
      const logData = {
        sdk: sdkMetadata.name,
        sdkv: sdkMetadata.version,
        cv: this.#metadata.clerkVersion ?? "",
        lvl: entry.level,
        msg: entry.message,
        ts: normalizedTimestamp.toISOString(),
        pk: this.#metadata.publishableKey || null,
        payload: this.#sanitizeContext(entry.context)
      };
      this.#buffer.push({
        kind: "log",
        value: logData
      });
      this.#scheduleFlush();
    } catch (error) {
      console.error("[clerk/telemetry] Error recording telemetry log entry", error);
    }
  }
  #shouldRecord(preparedPayload, eventSamplingRate) {
    return this.isEnabled && !this.isDebug && this.#shouldBeSampled(preparedPayload, eventSamplingRate);
  }
  #shouldRecordLog(_entry) {
    return true;
  }
  #shouldBeSampled(preparedPayload, eventSamplingRate) {
    const randomSeed = Math.random();
    if (!(randomSeed <= this.#config.samplingRate && (this.#config.perEventSampling === false || typeof eventSamplingRate === "undefined" || randomSeed <= eventSamplingRate))) return false;
    return !this.#eventThrottler.isEventThrottled(preparedPayload);
  }
  #scheduleFlush() {
    if (typeof window === "undefined") {
      this.#flush();
      return;
    }
    if (this.#buffer.length >= this.#config.maxBufferSize) {
      if (this.#pendingFlush) if (typeof cancelIdleCallback !== "undefined") cancelIdleCallback(Number(this.#pendingFlush));
      else clearTimeout(Number(this.#pendingFlush));
      this.#flush();
      return;
    }
    if (this.#pendingFlush) return;
    if ("requestIdleCallback" in window) this.#pendingFlush = requestIdleCallback(() => {
      this.#flush();
      this.#pendingFlush = null;
    });
    else this.#pendingFlush = setTimeout(() => {
      this.#flush();
      this.#pendingFlush = null;
    }, 0);
  }
  #flush() {
    const itemsToSend = [...this.#buffer];
    this.#buffer = [];
    this.#pendingFlush = null;
    if (itemsToSend.length === 0) return;
    const eventsToSend = itemsToSend.filter((item) => item.kind === "event").map((item) => item.value);
    const logsToSend = itemsToSend.filter((item) => item.kind === "log").map((item) => item.value);
    if (eventsToSend.length > 0) {
      const eventsUrl = new URL("/v1/event", this.#config.endpoint);
      fetch(eventsUrl, {
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        method: "POST",
        body: JSON.stringify({ events: eventsToSend })
      }).catch(() => void 0);
    }
    if (logsToSend.length > 0) {
      const logsUrl = new URL("/v1/logs", this.#config.endpoint);
      fetch(logsUrl, {
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        method: "POST",
        body: JSON.stringify({ logs: logsToSend })
      }).catch(() => void 0);
    }
  }
  /**
  * If running in debug mode, log the event and its payload to the console.
  */
  #logEvent(event, payload) {
    if (!this.isDebug) return;
    if (typeof console.groupCollapsed !== "undefined") {
      console.groupCollapsed("[clerk/telemetry]", event);
      console.log(payload);
      console.groupEnd();
    } else console.log("[clerk/telemetry]", event, payload);
  }
  /**
  * If in browser, attempt to lazily grab the SDK metadata from the Clerk singleton, otherwise fallback to the initially passed in values.
  *
  * This is necessary because the sdkMetadata can be set by the host SDK after the TelemetryCollector is instantiated.
  */
  #getSDKMetadata() {
    const sdkMetadata = {
      name: this.#metadata.sdk,
      version: this.#metadata.sdkVersion
    };
    if (typeof window !== "undefined") {
      const windowWithClerk = window;
      if (windowWithClerk.Clerk) {
        const windowClerk = windowWithClerk.Clerk;
        if (isWindowClerkWithMetadata(windowClerk) && windowClerk.constructor.sdkMetadata) {
          const { name, version } = windowClerk.constructor.sdkMetadata;
          if (name !== void 0) sdkMetadata.name = name;
          if (version !== void 0) sdkMetadata.version = version;
        }
      }
    }
    return sdkMetadata;
  }
  /**
  * Append relevant metadata from the Clerk singleton to the event payload.
  */
  #preparePayload(event, payload) {
    const sdkMetadata = this.#getSDKMetadata();
    return {
      event,
      cv: this.#metadata.clerkVersion ?? "",
      it: this.#metadata.instanceType ?? "",
      sdk: sdkMetadata.name,
      sdkv: sdkMetadata.version,
      ...this.#metadata.publishableKey ? { pk: this.#metadata.publishableKey } : {},
      ...this.#metadata.secretKey ? { sk: this.#metadata.secretKey } : {},
      payload
    };
  }
  /**
  * Best-effort sanitization of the context payload. Returns a plain object with JSON-serializable
  * values or null when the input is missing or not serializable. Arrays are not accepted.
  */
  #sanitizeContext(context) {
    if (context === null || typeof context === "undefined") return null;
    if (typeof context !== "object") return null;
    try {
      const cleaned = JSON.parse(JSON.stringify(context));
      if (cleaned && typeof cleaned === "object" && !Array.isArray(cleaned)) return cleaned;
      return null;
    } catch {
      return null;
    }
  }
};

// node_modules/@clerk/backend/dist/index.mjs
var verifyToken2 = withLegacyReturn(verifyToken);
function createClerkClient(options) {
  const opts = { ...options };
  const apiClient = createBackendApiClient(opts);
  const requestState = createAuthenticateRequest({ options: opts, apiClient });
  const telemetry = new TelemetryCollector({
    publishableKey: opts.publishableKey,
    secretKey: opts.secretKey,
    samplingRate: 0.1,
    ...opts.sdkMetadata ? { sdk: opts.sdkMetadata.name, sdkVersion: opts.sdkMetadata.version } : {},
    ...opts.telemetry || {}
  });
  return {
    ...apiClient,
    ...requestState,
    telemetry
  };
}
__name(createClerkClient, "createClerkClient");

// src/auth/jwt.ts
var TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;
function base64UrlDecode(value) {
  const padded = value + "=".repeat((4 - value.length % 4) % 4);
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}
__name(base64UrlDecode, "base64UrlDecode");
async function hmacVerify(data, signature, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  return crypto.subtle.verify(
    "HMAC",
    key,
    base64UrlDecode(signature),
    encoder.encode(data)
  );
}
__name(hmacVerify, "hmacVerify");
function isRole(value) {
  return value === "applicant" || value === "volunteer" || value === "admin";
}
__name(isRole, "isRole");
async function verifyToken3(token, secret) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }
  const [header, body, signature] = parts;
  const valid = await hmacVerify(`${header}.${body}`, signature, secret);
  if (!valid) {
    return null;
  }
  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(body)));
    if (typeof payload.sub !== "string" || typeof payload.email !== "string" || !isRole(payload.role) || typeof payload.exp !== "number") {
      return null;
    }
    if (payload.exp < Math.floor(Date.now() / 1e3)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
__name(verifyToken3, "verifyToken");
function bearerToken(request) {
  const header = request.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) {
    return null;
  }
  const token = header.slice(7).trim();
  return token || null;
}
__name(bearerToken, "bearerToken");

// src/auth/clerk.ts
async function resolveClerkIdentity(env, clerkUserId) {
  const clerk = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });
  const clerkUser = await clerk.users.getUser(clerkUserId);
  const primaryId = clerkUser.primaryEmailAddressId;
  const primary = clerkUser.emailAddresses.find((entry) => entry.id === primaryId);
  const email = (primary?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress)?.toLowerCase();
  if (!email) {
    return null;
  }
  return { clerkId: clerkUserId, email };
}
__name(resolveClerkIdentity, "resolveClerkIdentity");
async function ensureUserForClerk(env, identity) {
  const byClerk = await env.DB.prepare(
    "SELECT id, email, role FROM users WHERE clerk_id = ? LIMIT 1"
  ).bind(identity.clerkId).first();
  if (byClerk) {
    return byClerk;
  }
  const byEmail = await env.DB.prepare(
    "SELECT id, email, role FROM users WHERE email = ? LIMIT 1"
  ).bind(identity.email).first();
  if (byEmail) {
    await env.DB.prepare("UPDATE users SET clerk_id = ? WHERE id = ?").bind(identity.clerkId, byEmail.id).run();
    return byEmail;
  }
  const id = crypto.randomUUID();
  const createdAt = Date.now();
  await env.DB.prepare(
    "INSERT INTO users (id, clerk_id, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(id, identity.clerkId, identity.email, "", "applicant", createdAt).run();
  return { id, email: identity.email, role: "applicant" };
}
__name(ensureUserForClerk, "ensureUserForClerk");
async function authenticateClerk(request, env) {
  if (!env.CLERK_SECRET_KEY) {
    return null;
  }
  const token = bearerToken(request);
  if (!token) {
    return null;
  }
  try {
    const payload = await verifyToken2(token, { secretKey: env.CLERK_SECRET_KEY });
    const clerkUserId = payload.sub;
    if (!clerkUserId) {
      return null;
    }
    const identity = await resolveClerkIdentity(env, clerkUserId);
    if (!identity) {
      return null;
    }
    return ensureUserForClerk(env, identity);
  } catch {
    return null;
  }
}
__name(authenticateClerk, "authenticateClerk");

// src/auth/middleware.ts
async function authenticateLegacyJwt(request, env) {
  const token = bearerToken(request);
  if (!token || !env.JWT_SECRET) {
    return null;
  }
  const payload = await verifyToken3(token, env.JWT_SECRET);
  if (!payload) {
    return null;
  }
  const row = await env.DB.prepare(
    "SELECT id, email, role FROM users WHERE id = ? LIMIT 1"
  ).bind(payload.sub).first();
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    email: row.email,
    role: row.role
  };
}
__name(authenticateLegacyJwt, "authenticateLegacyJwt");
async function authenticate(request, env) {
  const clerkUser = await authenticateClerk(request, env);
  if (clerkUser) {
    return clerkUser;
  }
  return authenticateLegacyJwt(request, env);
}
__name(authenticate, "authenticate");
function hasAnyRole(user, roles) {
  return roles.includes(user.role);
}
__name(hasAnyRole, "hasAnyRole");
function requireRole(user, ...roles) {
  return hasAnyRole(user, roles);
}
__name(requireRole, "requireRole");

// src/admin/auth.ts
async function requireAdmin(request, env, respond) {
  const user = await authenticate(request, env);
  if (!user) {
    return respond({ error: "Unauthorized" }, 401);
  }
  if (!requireRole(user, "admin")) {
    return respond({ error: "Forbidden" }, 403);
  }
  return user;
}
__name(requireAdmin, "requireAdmin");
async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
__name(readJson, "readJson");
function escapeLike(value) {
  return value.replace(/[%_\\]/g, (char) => `\\${char}`);
}
__name(escapeLike, "escapeLike");

// src/participants/service.ts
var MEAL_KEYS = [
  "breakfast_day1",
  "lunch_day1",
  "dinner_day1",
  "breakfast_day2",
  "lunch_day2"
];
function isMealKey(value) {
  return MEAL_KEYS.includes(value);
}
__name(isMealKey, "isMealKey");
function generateCheckinCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}
__name(generateCheckinCode, "generateCheckinCode");
async function ensureParticipantForApprovedApplication(env, applicationId) {
  const application = await env.DB.prepare(
    `SELECT a.id, a.user_id, a.full_name, a.gender, u.email
     FROM applications a
     JOIN users u ON u.id = a.user_id
     WHERE a.id = ?
     LIMIT 1`
  ).bind(applicationId).first();
  if (!application) {
    return null;
  }
  const existing = await env.DB.prepare(
    "SELECT * FROM participants WHERE user_id = ? LIMIT 1"
  ).bind(application.user_id).first();
  const now = Date.now();
  if (existing) {
    await env.DB.prepare(
      `UPDATE participants
       SET application_id = ?, full_name = ?, email = ?, gender = ?, updated_at = ?
       WHERE id = ?`
    ).bind(
      application.id,
      application.full_name,
      application.email,
      application.gender,
      now,
      existing.id
    ).run();
    return env.DB.prepare("SELECT * FROM participants WHERE id = ? LIMIT 1").bind(existing.id).first();
  }
  const id = crypto.randomUUID();
  let publicCheckinCode = generateCheckinCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const collision = await env.DB.prepare(
      "SELECT id FROM participants WHERE public_checkin_code = ? LIMIT 1"
    ).bind(publicCheckinCode).first();
    if (!collision) {
      break;
    }
    publicCheckinCode = generateCheckinCode();
  }
  await env.DB.prepare(
    `INSERT INTO participants (
      id, user_id, application_id, full_name, email, gender,
      public_checkin_code, checkin_status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'not_checked_in', ?, ?)`
  ).bind(
    id,
    application.user_id,
    application.id,
    application.full_name,
    application.email,
    application.gender,
    publicCheckinCode,
    now,
    now
  ).run();
  return env.DB.prepare("SELECT * FROM participants WHERE id = ? LIMIT 1").bind(id).first();
}
__name(ensureParticipantForApprovedApplication, "ensureParticipantForApprovedApplication");

// src/admin/applications.ts
var DEFAULT_LIMIT = 20;
var MAX_LIMIT = 100;
var MAX_NOTES = 5e3;
var REVIEW_STATUSES = ["pending", "approved", "rejected"];
function toApplicationSummary(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    email: row.email,
    full_name: row.full_name,
    phone: row.phone,
    school: row.school,
    program: row.program,
    graduation_year: row.graduation_year,
    gender: row.gender,
    status: row.status,
    needs_travel_support: row.needs_travel_support === 1,
    first_hackathon: row.first_hackathon === null ? null : row.first_hackathon === 1,
    cs_career: row.cs_career === null ? null : row.cs_career === 1,
    reviewed_by: row.reviewed_by,
    reviewed_at: row.reviewed_at,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}
__name(toApplicationSummary, "toApplicationSummary");
function toApplicationDetail(row) {
  return {
    ...toApplicationSummary(row),
    github_url: row.github_url,
    linkedin_url: row.linkedin_url,
    portfolio_url: row.portfolio_url,
    resume_url: row.resume_url,
    resume_key: row.resume_key,
    why_join: row.why_join,
    project_idea: row.project_idea,
    dietary_restrictions: row.dietary_restrictions,
    accessibility: row.accessibility,
    motivation: row.motivation,
    past_project: row.past_project,
    interests: row.interests,
    community: row.community
  };
}
__name(toApplicationDetail, "toApplicationDetail");
function toReviewResponse(row, reviewerEmail) {
  return {
    id: row.id,
    application_id: row.application_id,
    reviewed_by: row.reviewed_by,
    reviewer_email: reviewerEmail ?? null,
    score: row.score,
    notes: row.notes,
    status: row.status,
    created_at: row.created_at
  };
}
__name(toReviewResponse, "toReviewResponse");
function parsePagination(url) {
  const limitRaw = url.searchParams.get("limit");
  const offsetRaw = url.searchParams.get("offset");
  const limit = limitRaw === null ? DEFAULT_LIMIT : Number(limitRaw);
  const offset = offsetRaw === null ? 0 : Number(offsetRaw);
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    return { error: `limit must be an integer between 1 and ${MAX_LIMIT}` };
  }
  if (!Number.isInteger(offset) || offset < 0) {
    return { error: "offset must be a non-negative integer" };
  }
  return { limit, offset };
}
__name(parsePagination, "parsePagination");
function parseListFilters(url) {
  const status = url.searchParams.get("status");
  const gender = url.searchParams.get("gender");
  const search = url.searchParams.get("search")?.trim() ?? "";
  if (status && !["draft", "pending", "approved", "rejected"].includes(status)) {
    return { error: "Invalid status filter" };
  }
  if (gender && gender.length > 50) {
    return { error: "Invalid gender filter" };
  }
  if (search.length > 100) {
    return { error: "search must be at most 100 characters" };
  }
  return {
    status,
    gender: gender || null,
    search: search || null
  };
}
__name(parseListFilters, "parseListFilters");
function buildListQuery(filters) {
  const clauses = [];
  const binds = [];
  if (filters.status) {
    clauses.push("a.status = ?");
    binds.push(filters.status);
  }
  if (filters.gender) {
    clauses.push("a.gender = ?");
    binds.push(filters.gender);
  }
  if (filters.search) {
    const pattern = `%${escapeLike(filters.search)}%`;
    clauses.push("(a.full_name LIKE ? ESCAPE '\\' OR u.email LIKE ? ESCAPE '\\')");
    binds.push(pattern, pattern);
  }
  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  return { where, binds };
}
__name(buildListQuery, "buildListQuery");
async function handleListApplications(request, env, respond) {
  const auth = await requireAdmin(request, env, respond);
  if (auth instanceof Response) {
    return auth;
  }
  const url = new URL(request.url);
  const pagination = parsePagination(url);
  if ("error" in pagination) {
    return respond({ error: pagination.error }, 400);
  }
  const filters = parseListFilters(url);
  if ("error" in filters) {
    return respond({ error: filters.error }, 400);
  }
  const { where, binds } = buildListQuery(filters);
  const countRow = await env.DB.prepare(
    `SELECT COUNT(*) AS total
     FROM applications a
     JOIN users u ON u.id = a.user_id
     ${where}`
  ).bind(...binds).first();
  const rows = await env.DB.prepare(
    `SELECT a.*, u.email
     FROM applications a
     JOIN users u ON u.id = a.user_id
     ${where}
     ORDER BY a.updated_at DESC
     LIMIT ? OFFSET ?`
  ).bind(...binds, pagination.limit, pagination.offset).all();
  return respond({
    applications: (rows.results ?? []).map(toApplicationSummary),
    pagination: {
      limit: pagination.limit,
      offset: pagination.offset,
      total: countRow?.total ?? 0
    }
  });
}
__name(handleListApplications, "handleListApplications");
async function getApplicationWithEmail(env, applicationId) {
  return env.DB.prepare(
    `SELECT a.*, u.email
     FROM applications a
     JOIN users u ON u.id = a.user_id
     WHERE a.id = ?
     LIMIT 1`
  ).bind(applicationId).first();
}
__name(getApplicationWithEmail, "getApplicationWithEmail");
async function handleGetApplication(request, env, respond, applicationId) {
  const auth = await requireAdmin(request, env, respond);
  if (auth instanceof Response) {
    return auth;
  }
  const application = await getApplicationWithEmail(env, applicationId);
  if (!application) {
    return respond({ error: "Application not found" }, 404);
  }
  const reviews = await env.DB.prepare(
    `SELECT r.*, u.email AS reviewer_email
     FROM application_reviews r
     JOIN users u ON u.id = r.reviewed_by
     WHERE r.application_id = ?
     ORDER BY r.created_at DESC`
  ).bind(applicationId).all();
  return respond({
    application: toApplicationDetail(application),
    reviews: (reviews.results ?? []).map(
      (row) => toReviewResponse(row, row.reviewer_email)
    )
  });
}
__name(handleGetApplication, "handleGetApplication");
function validateReviewBody(body) {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid JSON body" };
  }
  const input = body;
  if (typeof input.status !== "string" || !REVIEW_STATUSES.includes(input.status)) {
    return { ok: false, error: "status must be one of: pending, approved, rejected" };
  }
  let score = null;
  if (input.score !== void 0 && input.score !== null && input.score !== "") {
    const parsed = typeof input.score === "number" ? input.score : Number(input.score);
    if (!Number.isFinite(parsed)) {
      return { ok: false, error: "score must be a number" };
    }
    score = Math.round(parsed);
  }
  let notes = null;
  if (input.notes !== void 0 && input.notes !== null && input.notes !== "") {
    if (typeof input.notes !== "string") {
      return { ok: false, error: "notes must be a string" };
    }
    const trimmed = input.notes.trim();
    if (trimmed.length > MAX_NOTES) {
      return { ok: false, error: `notes must be at most ${MAX_NOTES} characters` };
    }
    notes = trimmed || null;
  }
  return {
    ok: true,
    data: {
      score,
      notes,
      status: input.status
    }
  };
}
__name(validateReviewBody, "validateReviewBody");
async function handleReviewApplication(request, env, respond, applicationId) {
  const admin = await requireAdmin(request, env, respond);
  if (admin instanceof Response) {
    return admin;
  }
  const application = await env.DB.prepare("SELECT id FROM applications WHERE id = ? LIMIT 1").bind(applicationId).first();
  if (!application) {
    return respond({ error: "Application not found" }, 404);
  }
  const body = await readJson(request);
  if (body === null) {
    return respond({ error: "Invalid JSON body" }, 400);
  }
  const validated = validateReviewBody(body);
  if (!validated.ok) {
    return respond({ error: validated.error }, 400);
  }
  const now = Date.now();
  const reviewId = crypto.randomUUID();
  const { score, notes, status } = validated.data;
  await env.DB.prepare(
    `INSERT INTO application_reviews (
      id, application_id, reviewed_by, score, notes, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(reviewId, applicationId, admin.id, score, notes, status, now).run();
  await env.DB.prepare(
    `UPDATE applications
     SET status = ?, reviewed_by = ?, reviewed_at = ?, updated_at = ?
     WHERE id = ?`
  ).bind(status, admin.id, now, now, applicationId).run();
  let participant = null;
  if (status === "approved") {
    participant = await ensureParticipantForApprovedApplication(env, applicationId);
  }
  const review = await env.DB.prepare(
    "SELECT * FROM application_reviews WHERE id = ? LIMIT 1"
  ).bind(reviewId).first();
  const updated = await getApplicationWithEmail(env, applicationId);
  return respond({
    application: updated ? toApplicationDetail(updated) : null,
    review: review ? toReviewResponse(review, admin.email) : null,
    participant: participant ? {
      id: participant.id,
      public_checkin_code: participant.public_checkin_code,
      checkin_status: participant.checkin_status
    } : null
  }, 201);
}
__name(handleReviewApplication, "handleReviewApplication");
async function handleAdminApplicationRoutes(request, env, respond) {
  const url = new URL(request.url);
  const { pathname } = url;
  const { method } = request;
  if (pathname === "/api/admin/applications" && method === "GET") {
    return handleListApplications(request, env, respond);
  }
  const detailMatch = pathname.match(/^\/api\/admin\/applications\/([^/]+)$/);
  if (detailMatch && method === "GET") {
    return handleGetApplication(request, env, respond, detailMatch[1]);
  }
  const reviewMatch = pathname.match(/^\/api\/admin\/applications\/([^/]+)\/review$/);
  if (reviewMatch && method === "POST") {
    return handleReviewApplication(request, env, respond, reviewMatch[1]);
  }
  return null;
}
__name(handleAdminApplicationRoutes, "handleAdminApplicationRoutes");

// src/admin/event-ops.ts
async function handleEventOpsSummary(request, env, respond) {
  const auth = await requireAdmin(request, env, respond);
  if (auth instanceof Response) {
    return auth;
  }
  const totals = await env.DB.prepare(
    `SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN checkin_status = 'checked_in' THEN 1 ELSE 0 END) AS checked_in,
      SUM(CASE WHEN checkin_status = 'not_checked_in' THEN 1 ELSE 0 END) AS not_checked_in
     FROM participants`
  ).first();
  const mealRows = await env.DB.prepare(
    "SELECT meal_key, COUNT(*) AS total FROM participant_meals GROUP BY meal_key"
  ).all();
  const mealsClaimedByKey = Object.fromEntries(
    MEAL_KEYS.map((mealKey) => [mealKey, 0])
  );
  for (const row of mealRows.results ?? []) {
    mealsClaimedByKey[row.meal_key] = row.total;
  }
  return respond({
    participants: {
      total: totals?.total ?? 0,
      checked_in: totals?.checked_in ?? 0,
      not_checked_in: totals?.not_checked_in ?? 0
    },
    meals_claimed_by_key: mealsClaimedByKey
  });
}
__name(handleEventOpsSummary, "handleEventOpsSummary");
async function handleAdminEventOpsRoutes(request, env, respond) {
  const url = new URL(request.url);
  const { pathname } = url;
  const { method } = request;
  if (pathname === "/api/admin/event-ops/summary" && method === "GET") {
    return handleEventOpsSummary(request, env, respond);
  }
  return null;
}
__name(handleAdminEventOpsRoutes, "handleAdminEventOpsRoutes");

// src/admin/csv.ts
function escapeCsvValue(value) {
  if (value === null || value === void 0) {
    return "";
  }
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
__name(escapeCsvValue, "escapeCsvValue");
function formatCsvTimestamp(ms) {
  if (ms == null) {
    return "";
  }
  return new Date(ms).toISOString();
}
__name(formatCsvTimestamp, "formatCsvTimestamp");
function formatCsvBoolean(value) {
  if (value === true || value === 1) {
    return "yes";
  }
  return "no";
}
__name(formatCsvBoolean, "formatCsvBoolean");
function buildCsv(headers, rows) {
  const lines = [
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) => row.map(escapeCsvValue).join(","))
  ];
  return `${lines.join("\n")}
`;
}
__name(buildCsv, "buildCsv");
function csvDownloadResponse(filename, content, corsOrigin, requestOrigin) {
  const allowOrigin = corsOrigin === "*" || requestOrigin && requestOrigin === corsOrigin ? requestOrigin ?? corsOrigin : corsOrigin;
  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Expose-Headers": "Content-Disposition"
    }
  });
}
__name(csvDownloadResponse, "csvDownloadResponse");
function exportFilename(prefix) {
  const date = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  return `${prefix}-${date}.csv`;
}
__name(exportFilename, "exportFilename");

// src/admin/participant-list-query.ts
function parseListFilters2(url) {
  const gender = url.searchParams.get("gender");
  const search = url.searchParams.get("search")?.trim() ?? "";
  const checkedInRaw = url.searchParams.get("checked_in");
  if (gender && gender.length > 50) {
    return { error: "Invalid gender filter" };
  }
  if (search.length > 100) {
    return { error: "search must be at most 100 characters" };
  }
  let checkedIn = null;
  if (checkedInRaw === "true") {
    checkedIn = true;
  } else if (checkedInRaw === "false") {
    checkedIn = false;
  } else if (checkedInRaw !== null && checkedInRaw !== "") {
    return { error: "checked_in must be true or false" };
  }
  return {
    gender: gender || null,
    search: search || null,
    checkedIn
  };
}
__name(parseListFilters2, "parseListFilters");
function parseSort(url) {
  const sortByRaw = url.searchParams.get("sort_by") ?? "created_at";
  const sortOrderRaw = url.searchParams.get("sort_order") ?? "desc";
  if (sortByRaw !== "created_at" && sortByRaw !== "checked_in_at") {
    return { error: "sort_by must be created_at or checked_in_at" };
  }
  if (sortOrderRaw !== "asc" && sortOrderRaw !== "desc") {
    return { error: "sort_order must be asc or desc" };
  }
  return { sortBy: sortByRaw, sortOrder: sortOrderRaw };
}
__name(parseSort, "parseSort");
function buildOrderBy(sortBy, sortOrder) {
  const direction = sortOrder === "asc" ? "ASC" : "DESC";
  if (sortBy === "checked_in_at") {
    return `p.checked_in_at IS NULL, p.checked_in_at ${direction}, p.created_at DESC`;
  }
  return `p.created_at ${direction}`;
}
__name(buildOrderBy, "buildOrderBy");
function buildListQuery2(filters, tableAlias = "p") {
  const clauses = [];
  const binds = [];
  if (filters.checkedIn === true) {
    clauses.push(`${tableAlias}.checkin_status = 'checked_in'`);
  } else if (filters.checkedIn === false) {
    clauses.push(`${tableAlias}.checkin_status = 'not_checked_in'`);
  }
  if (filters.gender) {
    clauses.push(`${tableAlias}.gender = ?`);
    binds.push(filters.gender);
  }
  if (filters.search) {
    const pattern = `%${escapeLike(filters.search)}%`;
    clauses.push(
      `(${tableAlias}.full_name LIKE ? ESCAPE '\\' OR ${tableAlias}.email LIKE ? ESCAPE '\\')`
    );
    binds.push(pattern, pattern);
  }
  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  return { where, binds };
}
__name(buildListQuery2, "buildListQuery");

// src/admin/reports.ts
var PARTICIPANT_EXPORT_HEADERS = [
  "participant_id",
  "user_id",
  "application_id",
  "full_name",
  "email",
  "gender",
  "public_checkin_code",
  "checkin_status",
  "checked_in_at",
  "checked_in_by",
  "created_at",
  "updated_at",
  "breakfast_day1_claimed",
  "lunch_day1_claimed",
  "dinner_day1_claimed",
  "breakfast_day2_claimed",
  "lunch_day2_claimed"
];
function participantToCsvRow(row) {
  return [
    row.id,
    row.user_id,
    row.application_id,
    row.full_name,
    row.email,
    row.gender,
    row.public_checkin_code,
    row.checkin_status,
    formatCsvTimestamp(row.checked_in_at),
    row.checked_in_by,
    formatCsvTimestamp(row.created_at),
    formatCsvTimestamp(row.updated_at),
    formatCsvBoolean(row.breakfast_day1_claimed),
    formatCsvBoolean(row.lunch_day1_claimed),
    formatCsvBoolean(row.dinner_day1_claimed),
    formatCsvBoolean(row.breakfast_day2_claimed),
    formatCsvBoolean(row.lunch_day2_claimed)
  ];
}
__name(participantToCsvRow, "participantToCsvRow");
async function fetchParticipantsForExport(env, url) {
  const filters = parseListFilters2(url);
  if ("error" in filters) {
    return { error: filters.error, status: 400 };
  }
  const sort = parseSort(url);
  if ("error" in sort) {
    return { error: sort.error, status: 400 };
  }
  const { where, binds } = buildListQuery2(filters);
  const orderBy = buildOrderBy(sort.sortBy, sort.sortOrder);
  const mealSelects = MEAL_KEYS.map(
    (mealKey) => `MAX(CASE WHEN pm.meal_key = '${mealKey}' THEN 1 ELSE 0 END) AS ${mealKey}_claimed`
  ).join(",\n      ");
  const result = await env.DB.prepare(
    `SELECT
      p.id,
      p.user_id,
      p.application_id,
      p.full_name,
      p.email,
      p.gender,
      p.public_checkin_code,
      p.checkin_status,
      p.checked_in_at,
      p.checked_in_by,
      p.created_at,
      p.updated_at,
      ${mealSelects}
     FROM participants p
     LEFT JOIN participant_meals pm ON pm.participant_id = p.id
     ${where}
     GROUP BY p.id
     ORDER BY ${orderBy}`
  ).bind(...binds).all();
  return result.results ?? [];
}
__name(fetchParticipantsForExport, "fetchParticipantsForExport");
async function handleParticipantsExport(request, env, respond) {
  const auth = await requireAdmin(request, env, respond);
  if (auth instanceof Response) {
    return auth;
  }
  const url = new URL(request.url);
  const rows = await fetchParticipantsForExport(env, url);
  if (!Array.isArray(rows)) {
    return respond({ error: rows.error }, rows.status);
  }
  const csv = buildCsv(
    PARTICIPANT_EXPORT_HEADERS,
    rows.map(participantToCsvRow)
  );
  return csvDownloadResponse(
    exportFilename("participants-export"),
    csv,
    env.CORS_ORIGIN || "*",
    request.headers.get("Origin")
  );
}
__name(handleParticipantsExport, "handleParticipantsExport");
async function handleCheckinsExport(request, env, respond) {
  const auth = await requireAdmin(request, env, respond);
  if (auth instanceof Response) {
    return auth;
  }
  const result = await env.DB.prepare(
    `SELECT id, full_name, email, public_checkin_code, checked_in_at, checked_in_by
     FROM participants
     WHERE checkin_status = 'checked_in'
     ORDER BY checked_in_at ASC`
  ).all();
  const headers = [
    "participant_id",
    "full_name",
    "email",
    "public_checkin_code",
    "checked_in_at",
    "checked_in_by"
  ];
  const csv = buildCsv(
    headers,
    (result.results ?? []).map((row) => [
      row.id,
      row.full_name,
      row.email,
      row.public_checkin_code,
      formatCsvTimestamp(row.checked_in_at),
      row.checked_in_by
    ])
  );
  return csvDownloadResponse(
    exportFilename("checkins-export"),
    csv,
    env.CORS_ORIGIN || "*",
    request.headers.get("Origin")
  );
}
__name(handleCheckinsExport, "handleCheckinsExport");
async function handleMealsExport(request, env, respond) {
  const auth = await requireAdmin(request, env, respond);
  if (auth instanceof Response) {
    return auth;
  }
  const result = await env.DB.prepare(
    `SELECT
      pm.id AS meal_claim_id,
      pm.participant_id,
      p.full_name,
      p.email,
      pm.meal_key,
      pm.claimed_at,
      pm.claimed_by
     FROM participant_meals pm
     JOIN participants p ON p.id = pm.participant_id
     ORDER BY pm.claimed_at ASC`
  ).all();
  const headers = [
    "meal_claim_id",
    "participant_id",
    "full_name",
    "email",
    "meal_key",
    "claimed_at",
    "claimed_by"
  ];
  const csv = buildCsv(
    headers,
    (result.results ?? []).map((row) => [
      row.meal_claim_id,
      row.participant_id,
      row.full_name,
      row.email,
      row.meal_key,
      formatCsvTimestamp(row.claimed_at),
      row.claimed_by
    ])
  );
  return csvDownloadResponse(
    exportFilename("meal-claims-export"),
    csv,
    env.CORS_ORIGIN || "*",
    request.headers.get("Origin")
  );
}
__name(handleMealsExport, "handleMealsExport");
async function handleAdminReportRoutes(request, env, respond) {
  const url = new URL(request.url);
  const { pathname } = url;
  const { method } = request;
  if (pathname === "/api/admin/participants/export" && method === "GET") {
    return handleParticipantsExport(request, env, respond);
  }
  if (pathname === "/api/admin/reports/checkins/export" && method === "GET") {
    return handleCheckinsExport(request, env, respond);
  }
  if (pathname === "/api/admin/reports/meals/export" && method === "GET") {
    return handleMealsExport(request, env, respond);
  }
  return null;
}
__name(handleAdminReportRoutes, "handleAdminReportRoutes");

// src/admin/event-ops-errors.ts
var EVENT_OPS_ERROR_CODES = {
  already_checked_in: {
    status: 409,
    error: "Participant is already checked in",
    code: "already_checked_in"
  },
  meal_already_claimed: {
    status: 409,
    error: "Meal already claimed for this participant",
    code: "meal_already_claimed"
  },
  meal_limit_reached: {
    status: 409,
    error: "Participant has already claimed the maximum of 5 meals",
    code: "meal_limit_reached"
  },
  invalid_checkin_code: {
    status: 404,
    error: "Invalid check-in code",
    code: "invalid_checkin_code"
  },
  not_checked_in: {
    status: 403,
    error: "Participant must be checked in before claiming meals",
    code: "not_checked_in"
  },
  invalid_meal_key: {
    status: 400,
    error: "Invalid mealKey",
    code: "invalid_meal_key"
  }
};
function respondEventOpsError(respond, code, extra) {
  const payload = EVENT_OPS_ERROR_CODES[code];
  return respond({ error: payload.error, code: payload.code, ...extra }, payload.status);
}
__name(respondEventOpsError, "respondEventOpsError");

// src/admin/participants.ts
var DEFAULT_LIMIT2 = 20;
var MAX_LIMIT2 = 100;
function toParticipantSummary(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    application_id: row.application_id,
    full_name: row.full_name,
    email: row.email,
    gender: row.gender,
    public_checkin_code: row.public_checkin_code,
    checkin_status: row.checkin_status,
    checked_in_at: row.checked_in_at,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}
__name(toParticipantSummary, "toParticipantSummary");
function toParticipantDetail(row, meals) {
  return {
    ...toParticipantSummary(row),
    checked_in_by: row.checked_in_by,
    meals: meals.map((meal) => ({
      id: meal.id,
      meal_key: meal.meal_key,
      claimed_by: meal.claimed_by,
      claimed_at: meal.claimed_at
    }))
  };
}
__name(toParticipantDetail, "toParticipantDetail");
function parsePagination2(url) {
  const limitRaw = url.searchParams.get("limit");
  const offsetRaw = url.searchParams.get("offset");
  const limit = limitRaw === null ? DEFAULT_LIMIT2 : Number(limitRaw);
  const offset = offsetRaw === null ? 0 : Number(offsetRaw);
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT2) {
    return { error: `limit must be an integer between 1 and ${MAX_LIMIT2}` };
  }
  if (!Number.isInteger(offset) || offset < 0) {
    return { error: "offset must be a non-negative integer" };
  }
  return { limit, offset };
}
__name(parsePagination2, "parsePagination");
async function getParticipantById(env, participantId) {
  return env.DB.prepare("SELECT * FROM participants WHERE id = ? LIMIT 1").bind(participantId).first();
}
__name(getParticipantById, "getParticipantById");
async function getParticipantMeals(env, participantId) {
  const result = await env.DB.prepare(
    "SELECT * FROM participant_meals WHERE participant_id = ? ORDER BY claimed_at ASC"
  ).bind(participantId).all();
  return result.results ?? [];
}
__name(getParticipantMeals, "getParticipantMeals");
async function markParticipantCheckedIn(env, participant, admin) {
  if (participant.checkin_status === "checked_in") {
    return participant;
  }
  const now = Date.now();
  await env.DB.prepare(
    `UPDATE participants
     SET checkin_status = 'checked_in', checked_in_at = ?, checked_in_by = ?, updated_at = ?
     WHERE id = ?`
  ).bind(now, admin.id, now, participant.id).run();
  return getParticipantById(env, participant.id);
}
__name(markParticipantCheckedIn, "markParticipantCheckedIn");
async function handleListParticipants(request, env, respond) {
  const auth = await requireAdmin(request, env, respond);
  if (auth instanceof Response) {
    return auth;
  }
  const url = new URL(request.url);
  const pagination = parsePagination2(url);
  if ("error" in pagination) {
    return respond({ error: pagination.error }, 400);
  }
  const filters = parseListFilters2(url);
  if ("error" in filters) {
    return respond({ error: filters.error }, 400);
  }
  const sort = parseSort(url);
  if ("error" in sort) {
    return respond({ error: sort.error }, 400);
  }
  const { where, binds } = buildListQuery2(filters);
  const orderBy = buildOrderBy(sort.sortBy, sort.sortOrder);
  const countRow = await env.DB.prepare(
    `SELECT COUNT(*) AS total FROM participants p ${where}`
  ).bind(...binds).first();
  const rows = await env.DB.prepare(
    `SELECT p.* FROM participants p ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`
  ).bind(...binds, pagination.limit, pagination.offset).all();
  return respond({
    participants: (rows.results ?? []).map(toParticipantSummary),
    pagination: {
      limit: pagination.limit,
      offset: pagination.offset,
      total: countRow?.total ?? 0
    },
    sort: {
      sort_by: sort.sortBy,
      sort_order: sort.sortOrder
    }
  });
}
__name(handleListParticipants, "handleListParticipants");
async function handleGetParticipant(request, env, respond, participantId) {
  const auth = await requireAdmin(request, env, respond);
  if (auth instanceof Response) {
    return auth;
  }
  const participant = await getParticipantById(env, participantId);
  if (!participant) {
    return respond({ error: "Participant not found" }, 404);
  }
  const meals = await getParticipantMeals(env, participantId);
  return respond({ participant: toParticipantDetail(participant, meals) });
}
__name(handleGetParticipant, "handleGetParticipant");
async function handleCheckinParticipant(request, env, respond, participantId) {
  const admin = await requireAdmin(request, env, respond);
  if (admin instanceof Response) {
    return admin;
  }
  const participant = await getParticipantById(env, participantId);
  if (!participant) {
    return respond({ error: "Participant not found" }, 404);
  }
  if (participant.checkin_status === "checked_in") {
    return respondEventOpsError(respond, "already_checked_in", {
      participant: toParticipantSummary(participant)
    });
  }
  const updated = await markParticipantCheckedIn(env, participant, admin);
  if (!updated) {
    return respond({ error: "Failed to check in participant" }, 500);
  }
  return respond({ participant: toParticipantSummary(updated) });
}
__name(handleCheckinParticipant, "handleCheckinParticipant");
async function handleCheckinByCode(request, env, respond) {
  const admin = await requireAdmin(request, env, respond);
  if (admin instanceof Response) {
    return admin;
  }
  const body = await readJson(request);
  if (!body || typeof body !== "object") {
    return respond({ error: "Invalid JSON body" }, 400);
  }
  const input = body;
  const rawCode = typeof input.public_checkin_code === "string" && input.public_checkin_code || typeof input.qr_code_value === "string" && input.qr_code_value || typeof input.code === "string" && input.code || "";
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return respond({ error: "public_checkin_code or code is required" }, 400);
  }
  const participant = await env.DB.prepare(
    "SELECT * FROM participants WHERE public_checkin_code = ? LIMIT 1"
  ).bind(code).first();
  if (!participant) {
    return respondEventOpsError(respond, "invalid_checkin_code");
  }
  if (participant.checkin_status === "checked_in") {
    return respondEventOpsError(respond, "already_checked_in", {
      participant: toParticipantSummary(participant)
    });
  }
  const updated = await markParticipantCheckedIn(env, participant, admin);
  if (!updated) {
    return respond({ error: "Failed to check in participant" }, 500);
  }
  return respond({ participant: toParticipantSummary(updated) });
}
__name(handleCheckinByCode, "handleCheckinByCode");
async function handleClaimMeal(request, env, respond, participantId, mealKey) {
  const admin = await requireAdmin(request, env, respond);
  if (admin instanceof Response) {
    return admin;
  }
  if (!isMealKey(mealKey)) {
    return respondEventOpsError(respond, "invalid_meal_key", {
      allowed: MEAL_KEYS
    });
  }
  const participant = await getParticipantById(env, participantId);
  if (!participant) {
    return respond({ error: "Participant not found" }, 404);
  }
  if (participant.checkin_status !== "checked_in") {
    return respondEventOpsError(respond, "not_checked_in", {
      participant: toParticipantSummary(participant)
    });
  }
  const existing = await env.DB.prepare(
    "SELECT id FROM participant_meals WHERE participant_id = ? AND meal_key = ? LIMIT 1"
  ).bind(participantId, mealKey).first();
  if (existing) {
    return respondEventOpsError(respond, "meal_already_claimed", {
      meal_key: mealKey,
      participant: toParticipantSummary(participant)
    });
  }
  const mealCount = await env.DB.prepare(
    "SELECT COUNT(*) AS total FROM participant_meals WHERE participant_id = ?"
  ).bind(participantId).first();
  if ((mealCount?.total ?? 0) >= 5) {
    return respondEventOpsError(respond, "meal_limit_reached", {
      participant: toParticipantSummary(participant)
    });
  }
  const now = Date.now();
  const mealId = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO participant_meals (id, participant_id, meal_key, claimed_by, claimed_at)
     VALUES (?, ?, ?, ?, ?)`
  ).bind(mealId, participantId, mealKey, admin.id, now).run();
  const meal = await env.DB.prepare("SELECT * FROM participant_meals WHERE id = ? LIMIT 1").bind(mealId).first();
  return respond(
    {
      meal: meal ? {
        id: meal.id,
        participant_id: meal.participant_id,
        meal_key: meal.meal_key,
        claimed_by: meal.claimed_by,
        claimed_at: meal.claimed_at
      } : null
    },
    201
  );
}
__name(handleClaimMeal, "handleClaimMeal");
async function handleAdminParticipantRoutes(request, env, respond) {
  const url = new URL(request.url);
  const { pathname } = url;
  const { method } = request;
  if (pathname === "/api/admin/participants" && method === "GET") {
    return handleListParticipants(request, env, respond);
  }
  if (pathname === "/api/admin/participants/checkin/by-code" && method === "POST") {
    return handleCheckinByCode(request, env, respond);
  }
  const mealMatch = pathname.match(/^\/api\/admin\/participants\/([^/]+)\/meals\/([^/]+)\/claim$/);
  if (mealMatch && method === "POST") {
    return handleClaimMeal(request, env, respond, mealMatch[1], mealMatch[2]);
  }
  const checkinMatch = pathname.match(/^\/api\/admin\/participants\/([^/]+)\/checkin$/);
  if (checkinMatch && method === "POST") {
    return handleCheckinParticipant(request, env, respond, checkinMatch[1]);
  }
  const detailMatch = pathname.match(/^\/api\/admin\/participants\/([^/]+)$/);
  if (detailMatch && method === "GET") {
    return handleGetParticipant(request, env, respond, detailMatch[1]);
  }
  return null;
}
__name(handleAdminParticipantRoutes, "handleAdminParticipantRoutes");

// src/admin/routes.ts
async function handleAdminRoutes(request, env, respond) {
  const eventOpsRoute = await handleAdminEventOpsRoutes(request, env, respond);
  if (eventOpsRoute) {
    return eventOpsRoute;
  }
  const reportRoute = await handleAdminReportRoutes(request, env, respond);
  if (reportRoute) {
    return reportRoute;
  }
  const participantRoute = await handleAdminParticipantRoutes(request, env, respond);
  if (participantRoute) {
    return participantRoute;
  }
  const applicationRoute = await handleAdminApplicationRoutes(request, env, respond);
  if (applicationRoute) {
    return applicationRoute;
  }
  return respond({ error: "Not found" }, 404);
}
__name(handleAdminRoutes, "handleAdminRoutes");

// src/applications/validation.ts
var MAX_TEXT = 5e3;
var MAX_SHORT = 500;
var MIN_GRAD_YEAR = 1950;
var MAX_GRAD_YEAR = 2040;
var MAX_RESUME_BYTES = 5 * 1024 * 1024;
var ALLOWED_RESUME_TYPES = /* @__PURE__ */ new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);
function trimString(value, maxLen) {
  if (value === null || value === void 0 || value === "") {
    return null;
  }
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLen) {
    return null;
  }
  return trimmed;
}
__name(trimString, "trimString");
function requireString(value, maxLen) {
  const trimmed = trimString(value, maxLen);
  return trimmed || null;
}
__name(requireString, "requireString");
function normalizeProfileUrl(value) {
  const trimmed = trimString(value, 2048);
  if (!trimmed) {
    return null;
  }
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}
__name(normalizeProfileUrl, "normalizeProfileUrl");
function parseUrl(value) {
  return normalizeProfileUrl(value);
}
__name(parseUrl, "parseUrl");
function parseGraduationYear(value) {
  if (value === null || value === void 0 || value === "") {
    return null;
  }
  const year = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(year) || year < MIN_GRAD_YEAR || year > MAX_GRAD_YEAR) {
    return null;
  }
  return year;
}
__name(parseGraduationYear, "parseGraduationYear");
function parseBoolean(value) {
  if (value === true || value === 1 || value === "1" || value === "true") {
    return true;
  }
  return false;
}
__name(parseBoolean, "parseBoolean");
function parseNullableBoolean(value) {
  if (value === null || value === void 0 || value === "") {
    return null;
  }
  if (value === false || value === 0 || value === "0" || value === "false") {
    return false;
  }
  if (value === true || value === 1 || value === "1" || value === "true") {
    return true;
  }
  return null;
}
__name(parseNullableBoolean, "parseNullableBoolean");
function getField(input, ...keys) {
  for (const key of keys) {
    if (key in input) {
      return input[key];
    }
  }
  return void 0;
}
__name(getField, "getField");
function validateApplicationBody(body) {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid JSON body" };
  }
  const input = body;
  const full_name = requireString(getField(input, "full_name", "fullName"), 200);
  if (!full_name) {
    return { ok: false, error: "fullName is required (max 200 characters)" };
  }
  const phone = trimString(getField(input, "phone"), 50);
  const school = trimString(getField(input, "school", "institution"), 200);
  const program = trimString(getField(input, "program"), 200);
  const graduation_year = parseGraduationYear(getField(input, "graduation_year", "graduationYear"));
  const github_url = normalizeProfileUrl(getField(input, "github_url", "github"));
  const linkedin_url = normalizeProfileUrl(getField(input, "linkedin_url", "linkedin"));
  const portfolio_url = parseUrl(getField(input, "portfolio_url", "portfolioUrl"));
  const resume_url = parseUrl(getField(input, "resume_url", "resumeUrl"));
  const dietary_restrictions = trimString(
    getField(input, "dietary_restrictions", "dietary"),
    MAX_SHORT
  );
  const gender = trimString(getField(input, "gender"), 50);
  const accessibility = trimString(getField(input, "accessibility"), MAX_TEXT);
  const motivation = trimString(getField(input, "motivation", "why_join", "whyJoin"), MAX_TEXT);
  const past_project = trimString(
    getField(input, "past_project", "pastProject", "project_idea", "projectIdea"),
    MAX_TEXT
  );
  const interests = trimString(getField(input, "interests"), MAX_TEXT);
  const community = trimString(getField(input, "community"), MAX_TEXT);
  const why_join = trimString(getField(input, "why_join", "whyJoin"), MAX_TEXT) ?? motivation;
  const project_idea = trimString(getField(input, "project_idea", "projectIdea"), MAX_TEXT) ?? past_project;
  const first_hackathon = parseNullableBoolean(getField(input, "first_hackathon", "firstHackathon"));
  const cs_career = parseNullableBoolean(getField(input, "cs_career", "csCareer"));
  return {
    ok: true,
    data: {
      full_name,
      phone,
      school,
      program,
      graduation_year,
      github_url,
      linkedin_url,
      portfolio_url,
      resume_url,
      resume_key: null,
      why_join,
      project_idea,
      dietary_restrictions,
      needs_travel_support: parseBoolean(getField(input, "needs_travel_support", "needsTravelSupport")),
      gender,
      accessibility,
      first_hackathon,
      cs_career,
      motivation,
      past_project,
      interests,
      community
    }
  };
}
__name(validateApplicationBody, "validateApplicationBody");
function validateApplicationFormFields(fields) {
  const validated = validateApplicationBody(fields);
  if (!validated.ok) {
    return validated;
  }
  const data = validated.data;
  if (!data.github_url) {
    return { ok: false, error: "github must be a valid profile URL" };
  }
  if (!data.linkedin_url) {
    return { ok: false, error: "linkedin must be a valid profile URL" };
  }
  if (!data.dietary_restrictions) {
    return { ok: false, error: "dietary is required" };
  }
  if (data.first_hackathon === null) {
    return { ok: false, error: "firstHackathon is required" };
  }
  if (data.cs_career === null) {
    return { ok: false, error: "csCareer is required" };
  }
  if (!data.motivation) {
    return { ok: false, error: "motivation is required" };
  }
  if (!data.past_project) {
    return { ok: false, error: "pastProject is required" };
  }
  if (!data.interests) {
    return { ok: false, error: "interests is required" };
  }
  return { ok: true, data };
}
__name(validateApplicationFormFields, "validateApplicationFormFields");
function validateResumeFile(file) {
  if (!file || !(file instanceof File)) {
    return { ok: false, error: "resumeFile is required" };
  }
  if (file.size <= 0 || file.size > MAX_RESUME_BYTES) {
    return { ok: false, error: "resumeFile must be 5MB or smaller" };
  }
  const type = file.type || "application/octet-stream";
  if (!ALLOWED_RESUME_TYPES.has(type) && !file.name.toLowerCase().endsWith(".pdf")) {
    return { ok: false, error: "resumeFile must be a PDF or Word document" };
  }
  return { ok: true, file };
}
__name(validateResumeFile, "validateResumeFile");
async function formDataToFieldRecord(formData) {
  const fields = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      fields[key] = value;
    }
  }
  return fields;
}
__name(formDataToFieldRecord, "formDataToFieldRecord");

// src/applications/routes.ts
function boolToDb(value) {
  if (value === null) {
    return null;
  }
  return value ? 1 : 0;
}
__name(boolToDb, "boolToDb");
function dbToBool(value) {
  if (value === null) {
    return null;
  }
  return value === 1;
}
__name(dbToBool, "dbToBool");
function toResponse(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    full_name: row.full_name,
    phone: row.phone,
    school: row.school,
    program: row.program,
    graduation_year: row.graduation_year,
    github_url: row.github_url,
    linkedin_url: row.linkedin_url,
    portfolio_url: row.portfolio_url,
    resume_url: row.resume_url,
    resume_key: row.resume_key,
    why_join: row.why_join,
    project_idea: row.project_idea,
    dietary_restrictions: row.dietary_restrictions,
    needs_travel_support: row.needs_travel_support === 1,
    gender: row.gender,
    accessibility: row.accessibility,
    first_hackathon: dbToBool(row.first_hackathon),
    cs_career: dbToBool(row.cs_career),
    motivation: row.motivation,
    past_project: row.past_project,
    interests: row.interests,
    community: row.community,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}
__name(toResponse, "toResponse");
async function readJson2(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
__name(readJson2, "readJson");
async function getApplicationByUserId(env, userId) {
  return env.DB.prepare("SELECT * FROM applications WHERE user_id = ? LIMIT 1").bind(userId).first();
}
__name(getApplicationByUserId, "getApplicationByUserId");
async function uploadResume(env, userId, file) {
  if (!env.RESUMES) {
    return { error: "Resume storage is not configured" };
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120);
  const key = `resumes/${userId}/${Date.now()}-${safeName}`;
  await env.RESUMES.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type || "application/pdf"
    }
  });
  return { key, url: key };
}
__name(uploadResume, "uploadResume");
async function persistApplication(env, userId, data, existing) {
  const now = Date.now();
  if (existing) {
    await env.DB.prepare(
      `UPDATE applications SET
        full_name = ?,
        phone = ?,
        school = ?,
        program = ?,
        graduation_year = ?,
        github_url = ?,
        linkedin_url = ?,
        portfolio_url = ?,
        resume_url = ?,
        resume_key = ?,
        why_join = ?,
        project_idea = ?,
        dietary_restrictions = ?,
        needs_travel_support = ?,
        gender = ?,
        accessibility = ?,
        first_hackathon = ?,
        cs_career = ?,
        motivation = ?,
        past_project = ?,
        interests = ?,
        community = ?,
        status = ?,
        updated_at = ?
      WHERE user_id = ?`
    ).bind(
      data.full_name,
      data.phone,
      data.school,
      data.program,
      data.graduation_year,
      data.github_url,
      data.linkedin_url,
      data.portfolio_url,
      data.resume_url ?? existing.resume_url,
      data.resume_key ?? existing.resume_key,
      data.why_join,
      data.project_idea,
      data.dietary_restrictions,
      data.needs_travel_support ? 1 : 0,
      data.gender,
      data.accessibility,
      boolToDb(data.first_hackathon),
      boolToDb(data.cs_career),
      data.motivation,
      data.past_project,
      data.interests,
      data.community,
      "pending",
      now,
      userId
    ).run();
    return getApplicationByUserId(env, userId);
  }
  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO applications (
      id, user_id, full_name, phone, school, program, graduation_year,
      github_url, linkedin_url, portfolio_url, resume_url, resume_key,
      why_join, project_idea, dietary_restrictions, needs_travel_support,
      gender, accessibility, first_hackathon, cs_career, motivation,
      past_project, interests, community, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    userId,
    data.full_name,
    data.phone,
    data.school,
    data.program,
    data.graduation_year,
    data.github_url,
    data.linkedin_url,
    data.portfolio_url,
    data.resume_url,
    data.resume_key,
    data.why_join,
    data.project_idea,
    data.dietary_restrictions,
    data.needs_travel_support ? 1 : 0,
    data.gender,
    data.accessibility,
    boolToDb(data.first_hackathon),
    boolToDb(data.cs_career),
    data.motivation,
    data.past_project,
    data.interests,
    data.community,
    "pending",
    now,
    now
  ).run();
  return getApplicationByUserId(env, userId);
}
__name(persistApplication, "persistApplication");
async function handleMultipartUpsert(request, env, user, respond) {
  let formData;
  try {
    formData = await request.formData();
  } catch {
    return respond({ error: "Invalid multipart form data" }, 400);
  }
  const fields = await formDataToFieldRecord(formData);
  const validated = validateApplicationFormFields(fields);
  if (!validated.ok) {
    return respond({ error: validated.error }, 400);
  }
  const resumeEntry = formData.get("resumeFile");
  const resumeValidated = validateResumeFile(
    resumeEntry instanceof File ? resumeEntry : null
  );
  if (!resumeValidated.ok) {
    return respond({ error: resumeValidated.error }, 400);
  }
  const existing = await getApplicationByUserId(env, user.id);
  if (existing && (existing.status === "approved" || existing.status === "rejected")) {
    return respond({ error: "Application can no longer be edited" }, 403);
  }
  const upload = await uploadResume(env, user.id, resumeValidated.file);
  if ("error" in upload) {
    return respond({ error: upload.error }, 500);
  }
  const data = {
    ...validated.data,
    resume_key: upload.key,
    resume_url: upload.url
  };
  const saved = await persistApplication(env, user.id, data, existing);
  if (!saved) {
    return respond({ error: "Failed to save application" }, 500);
  }
  return respond({ application: toResponse(saved) }, existing ? 200 : 201);
}
__name(handleMultipartUpsert, "handleMultipartUpsert");
async function handleJsonUpsert(request, env, user, respond) {
  const body = await readJson2(request);
  if (body === null) {
    return respond({ error: "Invalid JSON body" }, 400);
  }
  const validated = validateApplicationBody(body);
  if (!validated.ok) {
    return respond({ error: validated.error }, 400);
  }
  const existing = await getApplicationByUserId(env, user.id);
  if (existing && (existing.status === "approved" || existing.status === "rejected")) {
    return respond({ error: "Application can no longer be edited" }, 403);
  }
  const input = body;
  const parsed = validated.data;
  const data = existing ? {
    ...parsed,
    phone: "phone" in input ? parsed.phone : existing.phone,
    school: "school" in input || "institution" in input ? parsed.school : existing.school,
    program: "program" in input ? parsed.program : existing.program,
    graduation_year: "graduation_year" in input || "graduationYear" in input ? parsed.graduation_year : existing.graduation_year,
    github_url: "github_url" in input || "github" in input ? parsed.github_url : existing.github_url,
    linkedin_url: "linkedin_url" in input || "linkedin" in input ? parsed.linkedin_url : existing.linkedin_url,
    portfolio_url: "portfolio_url" in input || "portfolioUrl" in input ? parsed.portfolio_url : existing.portfolio_url,
    resume_url: "resume_url" in input ? parsed.resume_url : existing.resume_url,
    resume_key: existing.resume_key,
    why_join: "why_join" in input || "motivation" in input ? parsed.why_join : existing.why_join,
    project_idea: "project_idea" in input || "pastProject" in input ? parsed.project_idea : existing.project_idea,
    dietary_restrictions: "dietary_restrictions" in input || "dietary" in input ? parsed.dietary_restrictions : existing.dietary_restrictions,
    needs_travel_support: "needs_travel_support" in input ? parsed.needs_travel_support : existing.needs_travel_support === 1,
    gender: "gender" in input ? parsed.gender : existing.gender,
    accessibility: "accessibility" in input ? parsed.accessibility : existing.accessibility,
    first_hackathon: "first_hackathon" in input || "firstHackathon" in input ? parsed.first_hackathon : dbToBool(existing.first_hackathon),
    cs_career: "cs_career" in input || "csCareer" in input ? parsed.cs_career : dbToBool(existing.cs_career),
    motivation: "motivation" in input ? parsed.motivation : existing.motivation,
    past_project: "pastProject" in input ? parsed.past_project : existing.past_project,
    interests: "interests" in input ? parsed.interests : existing.interests,
    community: "community" in input ? parsed.community : existing.community
  } : parsed;
  const saved = await persistApplication(env, user.id, data, existing);
  if (!saved) {
    return respond({ error: "Failed to save application" }, 500);
  }
  return respond({ application: toResponse(saved) }, existing ? 200 : 201);
}
__name(handleJsonUpsert, "handleJsonUpsert");
async function handleUpsert(request, env, respond, user) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    return handleMultipartUpsert(request, env, user, respond);
  }
  return handleJsonUpsert(request, env, user, respond);
}
__name(handleUpsert, "handleUpsert");
async function handleGetMine(env, respond, user) {
  const application = await getApplicationByUserId(env, user.id);
  if (!application) {
    return respond({ error: "Application not found" }, 404);
  }
  return respond({ application: toResponse(application) });
}
__name(handleGetMine, "handleGetMine");
async function handleApplicationRoutes(request, env, respond, user) {
  const url = new URL(request.url);
  const { pathname } = url;
  const { method } = request;
  if (!user) {
    return respond({ error: "Unauthorized" }, 401);
  }
  if (pathname === "/api/applications" && method === "POST") {
    return handleUpsert(request, env, respond, user);
  }
  if (pathname === "/api/applications/me" && method === "GET") {
    return handleGetMine(env, respond, user);
  }
  return respond({ error: "Not found" }, 404);
}
__name(handleApplicationRoutes, "handleApplicationRoutes");

// src/auth/routes.ts
function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role
  };
}
__name(publicUser, "publicUser");
async function handleMe(request, env, respond) {
  const user = await authenticate(request, env);
  if (!user) {
    return respond({ error: "Unauthorized" }, 401);
  }
  return respond({ user: publicUser(user) });
}
__name(handleMe, "handleMe");
async function handleUserSummary(request, env, respond) {
  const user = await authenticate(request, env);
  if (!user) {
    return respond({ error: "Unauthorized" }, 401);
  }
  const application = await getApplicationByUserId(env, user.id);
  return respond({
    user: publicUser(user),
    summary: {
      full_name: application?.full_name ?? null,
      has_application: Boolean(application),
      application_status: application?.status ?? null,
      submitted_at: application?.updated_at ?? null
    }
  });
}
__name(handleUserSummary, "handleUserSummary");
async function handleAuthRoutes(request, env, respond) {
  const url = new URL(request.url);
  const { pathname } = url;
  const { method } = request;
  if (pathname === "/api/auth/me" && method === "GET") {
    return handleMe(request, env, respond);
  }
  if (pathname === "/api/users/me/summary" && method === "GET") {
    return handleUserSummary(request, env, respond);
  }
  if ((pathname === "/api/auth/register" || pathname === "/api/auth/login") && method === "POST") {
    return respond(
      {
        error: "Email/password auth is disabled. Sign in with Clerk.",
        code: "auth_migrated_to_clerk"
      },
      410
    );
  }
  return respond({ error: "Not found" }, 404);
}
__name(handleAuthRoutes, "handleAuthRoutes");

// src/index.ts
var JSON_HEADERS = { "Content-Type": "application/json" };
function corsHeaders(origin, requestOrigin) {
  const allowOrigin = origin === "*" || requestOrigin && requestOrigin === origin ? requestOrigin ?? origin : origin;
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400"
  };
}
__name(corsHeaders, "corsHeaders");
function jsonResponse(body, status, origin, requestOrigin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...JSON_HEADERS,
      ...corsHeaders(origin, requestOrigin)
    }
  });
}
__name(jsonResponse, "jsonResponse");
function notImplemented(area, pathname, method, origin, requestOrigin) {
  return jsonResponse(
    { error: "Not implemented", area, path: pathname, method },
    501,
    origin,
    requestOrigin
  );
}
__name(notImplemented, "notImplemented");
async function checkDb(env) {
  try {
    await env.DB.prepare("SELECT 1").first();
    return true;
  } catch {
    return false;
  }
}
__name(checkDb, "checkDb");
async function dispatch(request, env, origin, requestOrigin) {
  const url = new URL(request.url);
  const { pathname } = url;
  const { method } = request;
  const respond = /* @__PURE__ */ __name((body, status = 200) => jsonResponse(body, status, origin, requestOrigin), "respond");
  if (pathname.startsWith("/api/auth/") || pathname.startsWith("/api/users/")) {
    return handleAuthRoutes(request, env, respond);
  }
  if (pathname.startsWith("/api/applications/") || pathname === "/api/applications") {
    const user = await authenticate(request, env);
    return handleApplicationRoutes(request, env, respond, user);
  }
  if (pathname.startsWith("/api/admin/")) {
    return handleAdminRoutes(request, env, respond);
  }
  if (pathname.startsWith("/api/ops/")) {
    return notImplemented("ops", pathname, method, origin, requestOrigin);
  }
  return jsonResponse({ error: "Not found" }, 404, origin, requestOrigin);
}
__name(dispatch, "dispatch");
var src_default = {
  async fetch(request, env) {
    const origin = env.CORS_ORIGIN || "*";
    const requestOrigin = request.headers.get("Origin");
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin, requestOrigin)
      });
    }
    const url = new URL(request.url);
    if (url.pathname === "/health" && request.method === "GET") {
      const dbOk = await checkDb(env);
      return jsonResponse({ ok: true, db: dbOk }, 200, origin, requestOrigin);
    }
    return dispatch(request, env, origin, requestOrigin);
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-UXCL1i/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch2, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch: dispatch2,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch2, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch2, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch2, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-UXCL1i/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
