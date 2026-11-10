import type { Location } from '../domain/types';

/**
 * localStorage 的访问永远视为「不可靠」：
 * 隐私模式、容量上限、被用户清掉、旧版数据格式都可能造成异常，
 * 因此全部包在 try/catch 里，且读取时做基本的形别验证。
 */
export function readJson<T>(key: string, validate: (value: unknown) => value is T): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return validate(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 保存失败不应影响主要功能，静默略过
  }
}

export const isUnits = (value: unknown): value is 'metric' | 'imperial' =>
  value === 'metric' || value === 'imperial';

export const isLocationArray = (value: unknown): value is Location[] =>
  Array.isArray(value) &&
  value.every(
    (item) =>
      item !== null &&
      typeof item === 'object' &&
      typeof (item as Location).id === 'string' &&
      typeof (item as Location).name === 'string' &&
      Number.isFinite((item as Location).latitude) &&
      Number.isFinite((item as Location).longitude),
  );
