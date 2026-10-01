/*
 * Backend API ilə əlaqə üçün mərkəzi fetch wrapper.
 *
 * Token-lər və cari istifadəçi localStorage-da saxlanılır. Hər
 * qorunan sorğuya avtomatik Authorization: Bearer ... header-i
 * əlavə olunur. 401 alınsa (access token bitibsə), bir dəfə refresh
 * cəhdi edilir; refresh də uğursuz olsa, tokenlər silinir və xəta
 * geri qaytarılır (çağıran tərəf giriş səhifəsinə yönləndirməlidir).
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

const ACCESS_TOKEN_KEY = "azlink-access-token";
const REFRESH_TOKEN_KEY = "azlink-refresh-token";
const USER_KEY = "azlink-current-user";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "BUSINESS";
  phone: string | null;
}

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const getStoredUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);

    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
};

export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const setStoredUser = (user: AuthUser) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const isLoggedIn = () => Boolean(getAccessToken());

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);

    return data.accessToken as string;
  } catch {
    return null;
  }
};

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  /* false -> Authorization header əlavə olunmur (açıq endpoint-lər üçün) */
  auth?: boolean;
}

export const apiRequest = async <T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { method = "GET", body, auth = true } = options;

  const doFetch = async (token: string | null) => {
    const headers: Record<string, string> = {};

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    if (auth && token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  let response = await doFetch(getAccessToken());

  if (response.status === 401 && auth && getRefreshToken()) {
    const newToken = await refreshAccessToken();

    if (newToken) {
      response = await doFetch(newToken);
    } else {
      clearTokens();
    }
  }

  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");

  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const message =
      (data && typeof data.message === "string" && data.message) ||
      "Xəta baş verdi";

    throw new ApiError(response.status, message);
  }

  return data as T;
};