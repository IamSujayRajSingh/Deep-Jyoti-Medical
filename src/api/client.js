// Browser client for the site's own backend (see /server).
//
// It keeps the same shape the pages were written against (`db.entities.X.list()`,
// `db.auth.me()`, `db.integrations.Core.SendEmail()` …) so the pages did not
// have to change when the site moved off Base44.
const TOKEN_KEY = "dj_access_token";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

const setToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
};

async function request(method, path, body = undefined) {
  const headers = new Headers();
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  if (body !== undefined && !isForm) headers.set("Content-Type", "application/json");

  let response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Could not reach the server. Check your connection and try again.", 0);
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    // A rejected token means the session ended: forget it.
    if (response.status === 401 && token) setToken(null);
    throw new ApiError(data?.error || "Something went wrong. Please try again.", response.status);
  }
  return data;
}

function entityHandler(name) {
  const base = `/entities/${encodeURIComponent(name)}`;
  const qs = (sort, limit) => {
    const params = new URLSearchParams();
    if (sort) params.set("sort", sort);
    if (limit) params.set("limit", String(limit));
    const s = params.toString();
    return s ? `?${s}` : "";
  };
  return {
    list: (sort = undefined, limit = undefined) => request("GET", `${base}${qs(sort, limit)}`),
    // Filters go in the request body, never the URL, because they can contain personal data.
    filter: (query, sort = undefined, limit = undefined) => request("POST", `${base}/query`, { query: query || {}, sort, limit }),
    get: (id) => request("GET", `${base}/${encodeURIComponent(id)}`),
    create: (data) => request("POST", base, data || {}),
    update: (id, data) => request("PATCH", `${base}/${encodeURIComponent(id)}`, data || {}),
    delete: (id) => request("DELETE", `${base}/${encodeURIComponent(id)}`),
  };
}

/** @type {Record<string, ReturnType<typeof entityHandler>>} */
const handlers = {};

const fileForm = (file) => {
  const form = new FormData();
  form.append("file", file);
  return form;
};

export const db = {
  entities: new Proxy(handlers, {
    get: (_, name) => {
      if (typeof name !== "string") return undefined;
      handlers[name] ||= entityHandler(name);
      return handlers[name];
    },
  }),

  auth: {
    async me() {
      if (!getToken()) throw new ApiError("Not signed in", 401);
      return request("GET", "/auth/me");
    },
    async isAuthenticated() {
      try {
        await db.auth.me();
        return true;
      } catch {
        return false;
      }
    },
    register: ({ email, password }) => request("POST", "/auth/register", { email, password }),
    async verifyOtp({ email, otpCode }) {
      const result = await request("POST", "/auth/verify-otp", { email, otpCode });
      setToken(result.access_token);
      return result;
    },
    resendOtp: (email) => request("POST", "/auth/resend-otp", { email }),
    async loginViaEmailPassword(email, password) {
      const result = await request("POST", "/auth/login", { email, password });
      setToken(result.access_token);
      return result;
    },
    setToken,
    logout(redirectUrl = undefined) {
      const done = () => {
        setToken(null);
        if (redirectUrl) window.location.assign(redirectUrl);
        else window.location.reload();
      };
      request("POST", "/auth/logout").then(done, done);
    },
    redirectToLogin(nextUrl) {
      window.location.assign(nextUrl ? `/login?returnTo=${encodeURIComponent(nextUrl)}` : "/login");
    },
    resetPasswordRequest: (email) => request("POST", "/auth/forgot-password", { email }),
    resetPassword: ({ resetToken, newPassword }) => request("POST", "/auth/reset-password", { resetToken, newPassword }),
  },

  integrations: {
    Core: {
      SendEmail: (message) => request("POST", "/email/send", message),
      UploadFile: ({ file }) => request("POST", "/files/public", fileForm(file)),
      UploadPrivateFile: ({ file }) => request("POST", "/files/private", fileForm(file)),
      CreateFileSignedUrl: ({ file_uri }) => request("POST", "/files/signed-url", { file_uri }),
    },
  },

  orders: {
    place: (payload) => request("POST", "/orders", payload),
    track: (orderId, phone) => request("POST", "/orders/track", { orderId, phone }),
    resendEmails: (orderId) => request("POST", `/orders/${encodeURIComponent(orderId)}/resend-email`),
  },
};

export default db;
