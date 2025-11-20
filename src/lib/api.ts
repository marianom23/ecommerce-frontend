// lib/api.ts
import axios, { AxiosRequestConfig } from "axios";

type Options = {
  timeout?: number;
  headers?: Record<string, string>;
  params?: Record<string, any>;
};

export type ServiceResult<T> = {
  message: string | null;
  data: T;
  status: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  sort: string | null;
  query: string | null;
};

function isServiceResult<T>(x: any): x is ServiceResult<T> {
  return !!x && typeof x === "object" && "data" in x && "status" in x;
}

// 👇 Base del backend (dev: 8080, prod: lo que definas)
const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? "http://localhost:8080";

export const instance = axios.create({
  baseURL: `${BACKEND_BASE_URL}/api`, // 👉 ahora pega directo al backend Spring
  timeout: 10000,
  withCredentials: true,              // importante para mandar auth_token
});

// ✅ Dejar pasar el error original (con response/status/data)
instance.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
);

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

async function request<T = any>(
  method: HttpMethod,
  url: string,
  data?: any,
  opts: Options = {}
): Promise<T> {
  const { timeout = 10000, headers = {}, params } = opts;

  const config: AxiosRequestConfig = { method, url, data, timeout, params, headers };
  const response = await instance.request<any>(config);
  const body = response.data;
  return (isServiceResult<T>(body) ? body.data : body) as T;
}

export const api = {
  get:   <T>(url: string, opts?: Options) => request<T>("GET", url, undefined, opts),
  post:  <T>(url: string, body?: any, opts?: Options) => request<T>("POST", url, body, opts),
  put:   <T>(url: string, body?: any, opts?: Options) => request<T>("PUT", url, body, opts),
  patch: <T>(url: string, body?: any, opts?: Options) => request<T>("PATCH", url, body, opts),
  del:   <T>(url: string, opts?: Options) => request<T>("DELETE", url, undefined, opts),
};
