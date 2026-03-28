import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export type CustomAxiosOptions = AxiosRequestConfig & {
  responseType?: "json" | "text" | "blob" | "auto";
};

export type ErrorType<T = unknown> = AxiosError<T>;
export type BodyType<T> = T;
export type AuthTokenGetter = () => Promise<string | null> | string | null;

let _baseUrl: string | null = null;
let _authTokenGetter: AuthTokenGetter | null = null;

export function setBaseUrl(url: string | null): void {
  _baseUrl = url ? url.replace(/\/+$/, "") : null;
}

export function setAuthTokenGetter(getter: AuthTokenGetter | null): void {
  _authTokenGetter = getter;
}

export class AxiosError<T = unknown> extends Error {
  readonly name = "AxiosError";
  readonly status: number;
  readonly statusText: string;
  readonly data: T | null;
  readonly headers: Record<string, string>;
  readonly method: string;
  readonly url: string;

  constructor(
    status: number,
    statusText: string,
    data: T | null,
    headers: Record<string, string>,
    requestInfo: { method: string; url: string },
  ) {
    super(`HTTP ${status} ${statusText}`);
    Object.setPrototypeOf(this, new.target.prototype);
    this.status = status;
    this.statusText = statusText;
    this.data = data;
    this.headers = headers;
    this.method = requestInfo.method;
    this.url = requestInfo.url;
  }
}

const axiosInstance = axios.create({
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export async function customFetch<T = unknown>(
  url: string,
  options: CustomAxiosOptions = {},
): Promise<T> {
  const resolvedUrl =
    _baseUrl && url.startsWith("/") ? `${_baseUrl}${url}` : url;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (_authTokenGetter && !headers["Authorization"]) {
    const token = await _authTokenGetter();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const method = (options.method || "GET").toUpperCase();

  try {
    const response: AxiosResponse<T> = await axiosInstance({
      url: resolvedUrl,
      method,
      headers,
      data: options.data ?? options.body,
      params: options.params,
      responseType:
        options.responseType === "blob"
          ? "blob"
          : options.responseType === "text"
            ? "text"
            : "json",
    });

    return response.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response) {
      throw new AxiosError(
        err.response.status,
        err.response.statusText || String(err.response.status),
        err.response.data as T,
        err.response.headers as Record<string, string>,
        { method, url: resolvedUrl },
      );
    }
    throw err;
  }
}
