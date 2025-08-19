// lib/api.ts
import axios, { AxiosRequestConfig } from "axios";

type Options = {
  timeout?: number;
  headers?: Record<string, string>;
  params?: Record<string, any>;
};

export type ServiceResult<T> = { message: string | null; data: T; status: string };

export type PaginatedResponse<T> = {
  items: T[]; total: number; page: number; pageSize: number;
  totalPages: number; hasNext: boolean; hasPrevious: boolean;
  sort: string | null; query: string | null;
};

function isServiceResult<T>(x: any): x is ServiceResult<T> {
  return !!x && typeof x === "object" && "data" in x && "status" in x;
}

const instance = axios.create({
  // 👇 ahora pegamos a Next, no directo al backend
  baseURL: "/api",            // o "/api/b" si usás un proxy catch-all
  timeout: 10000,
  withCredentials: false,
});

instance.interceptors.response.use(
  res => res,
  err => {
    const msg = err?.response?.data?.message || err?.response?.statusText || err.message || "Unknown error";
    return Promise.reject(new Error(msg));
  }
);

async function request<T = any>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  url: string,
  data?: any,
  opts: Options = {}
): Promise<T> {
  const { timeout = 10000, headers = {}, params } = opts;

  const config: AxiosRequestConfig = {
    method,
    url,
    data,
    timeout,
    params,
    headers,
  };

  const response = await instance.request<any>(config);
  const body = response.data;
  return (isServiceResult<T>(body) ? body.data : body) as T;
}

export const api = {
  get:  <T>(url: string, opts?: Options) => request<T>("GET", url, undefined, opts),
  post: <T>(url: string, body?: any, opts?: Options) => request<T>("POST", url, body, opts),
  put:  <T>(url: string, body?: any, opts?: Options) => request<T>("PUT", url, body, opts),
  del:  <T>(url: string, opts?: Options) => request<T>("DELETE", url, undefined, opts),
};
