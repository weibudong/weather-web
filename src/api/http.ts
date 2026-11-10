import { config } from '../app/config';
import type { AppError } from '../domain/types';

/** 已经规范化、可以直接交给 UI 的错误 */
export class ApiFailure extends Error {
  readonly appError: AppError;

  constructor(appError: AppError) {
    super(appError.message);
    this.name = 'ApiFailure';
    this.appError = appError;
  }
}

/** 主动取消（含组件卸载、用户改了查询）—不应显示成错误 */
export class RequestCancelled extends Error {
  constructor() {
    super('Request cancelled');
    this.name = 'RequestCancelled';
  }
}

const isAbort = (error: unknown): boolean =>
  error instanceof Error && error.name === 'AbortError';

/** 把任何底层异常转成单一 AppError 形状 */
export function toAppError(error: unknown): AppError {
  if (error instanceof ApiFailure) return error.appError;
  if (error instanceof RequestCancelled || isAbort(error)) {
    return {
      kind: 'cancelled',
      title: '请求已取消',
      message: '请求已取消。',
      retryable: false,
    };
  }
  if (error instanceof Error && error.message) {
    return {
      kind: 'unknown',
      title: '发生未预期的错误',
      message: '处理数据时发生错误，请重试一次。',
      detail: error.message,
      retryable: true,
    };
  }
  return {
    kind: 'unknown',
    title: '发生未预期的错误',
    message: '发生未预期的错误，请重试一次。',
    detail: String(error),
    retryable: true,
  };
}

export const isCancellation = (error: unknown): boolean =>
  error instanceof RequestCancelled || isAbort(error);

/** geolocation 等模块会直接 reject 一个 AppError 对象 */
export const isAppError = (value: unknown): value is AppError =>
  typeof value === 'object' &&
  value !== null &&
  'kind' in value &&
  'message' in value &&
  'retryable' in value;

/**
 * 统一的 JSON 客户端，负责：
 *  - 超时控制（timeout）
 *  - 连接外部 AbortSignal（切换地点时取消旧请求，避免竞态）
 *  - HTTP / 网络 / 解析错误的规范化
 */
export async function fetchJson<T>(
  url: string,
  options: { signal?: AbortSignal; timeoutMs?: number } = {},
): Promise<T> {
  const { signal, timeoutMs = config.requestTimeoutMs } = options;
  const controller = new AbortController();
  let timedOut = false;

  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const onExternalAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', onExternalAbort, { once: true });
  }

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new ApiFailure({
        kind: 'http',
        title: '天气服务暂时无法使用',
        message:
          response.status === 429
            ? '查询太频繁了，请稍等一下再重试。'
            : `服务响应异常（HTTP ${response.status}），请稍后再试。`,
        detail: `${response.status} ${response.statusText} · ${url}`,
        retryable: response.status === 429 || response.status >= 500,
      });
    }

    let payload: T;
    try {
      payload = (await response.json()) as T;
    } catch {
      throw new ApiFailure({
        kind: 'parse',
        title: '数据格式异常',
        message: '无法解析天气服务返回的数据，请重试一次。',
        detail: url,
        retryable: true,
      });
    }
    return payload;
  } catch (error) {
    if (error instanceof ApiFailure) throw error;
    if (controller.signal.aborted || isAbort(error)) {
      // 外部取消优先于超时：只有非外部取消的 abort 才算 timeout
      if (signal?.aborted) throw new RequestCancelled();
      if (timedOut) {
        throw new ApiFailure({
          kind: 'timeout',
          title: '连接超时',
          message: '天气服务响应太久，请检查网络后重试。',
          detail: url,
          retryable: true,
        });
      }
      throw new RequestCancelled();
    }
    throw new ApiFailure({
      kind: 'network',
      title: '无法连接',
      message: '连不上天气服务，请确认网络连接后重试。',
      detail: error instanceof Error ? error.message : String(error),
      retryable: true,
    });
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', onExternalAbort);
  }
}
