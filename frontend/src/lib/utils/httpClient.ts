
export interface IHttpClient {
  get<T = any>(url: string, options?: RequestInit): Promise<T>;
  post<T = any>(url: string, body?: any, options?: RequestInit): Promise<T>;
  put<T = any>(url: string, body?: any, options?: RequestInit): Promise<T>;
  patch<T = any>(url: string, body?: any, options?: RequestInit): Promise<T>;
  delete<T = any>(url: string, options?: RequestInit): Promise<T>;
  options<T = any>(url: string, options?: RequestInit): Promise<T>;
}

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'PATCH';