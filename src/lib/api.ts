import { useAuthStore } from "@/store/authStore";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function readErrorMessage(res: Response, fallback: string): Promise<string> {
  const contentType = res.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      const data = await res.json();
      if (typeof data?.error === "string" && data.error.trim()) return data.error;
      if (typeof data?.message === "string" && data.message.trim()) return data.message;
    } else {
      const text = (await res.text()).trim();
      if (text) return text.slice(0, 200);
    }
  } catch {
    // ignore parse errors
  }

  if (res.status === 401) return "Please log in again to continue.";
  if (res.status === 403) return "You do not have permission for this action.";
  return fallback;
}

type ApiFetchOptions = RequestInit & {
  auth?: boolean;
  fallbackError?: string;
};

/**
 * Shared fetch helper for admin/API calls.
 * - Attaches Bearer token when auth is requested
 * - Parses JSON safely
 * - Surfaces server error messages
 * - Logs out on expired/invalid auth
 */
export async function apiFetch<T = unknown>(
  url: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const {
    auth = false,
    fallbackError = "Request failed",
    headers,
    ...rest
  } = options;

  const token = useAuthStore.getState().token;
  const finalHeaders = new Headers(headers || {});

  if (rest.body && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }

  if (auth) {
    if (!token) {
      useAuthStore.getState().logout();
      throw new ApiError("Please log in again to continue.", 401);
    }
    finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...rest,
    headers: finalHeaders,
  });

  if (res.status === 401) {
    const message = await readErrorMessage(res, fallbackError);
    // Invalid/expired session — clear local auth so ProtectedRoute redirects
    useAuthStore.getState().logout();
    throw new ApiError(message, res.status);
  }

  if (res.status === 403) {
    throw new ApiError(await readErrorMessage(res, fallbackError), res.status);
  }

  if (!res.ok) {
    throw new ApiError(await readErrorMessage(res, fallbackError), res.status);
  }

  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export async function apiFetchArray<T = unknown>(
  url: string,
  options: ApiFetchOptions = {},
): Promise<T[]> {
  const data = await apiFetch<unknown>(url, options);
  return Array.isArray(data) ? (data as T[]) : [];
}
