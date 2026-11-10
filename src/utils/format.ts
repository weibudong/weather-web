import type { Units } from '../domain/types';

/**
 * 单位换算集中在这里。领域层永远保存公制（°C / km/h / mm），
 * 只有在「输出成字符串」时才按用户选择换算，避免数据被重复转换。
 */

export const toTemperature = (celsius: number, units: Units): number =>
  units === 'imperial' ? celsius * (9 / 5) + 32 : celsius;

export const temperatureUnit = (units: Units): string =>
  units === 'imperial' ? '°F' : '°C';

/** 显示用温度，四舍五入到整数 */
export const formatTemperature = (
  celsius: number,
  units: Units,
  withUnit = false,
): string => {
  const rounded = Math.round(toTemperature(celsius, units));
  return withUnit ? `${rounded}${temperatureUnit(units)}` : `${rounded}°`;
};

export const formatWind = (kmh: number, units: Units): string =>
  units === 'imperial'
    ? `${Math.round(kmh * 0.621371)} mph`
    : `${Math.round(kmh)} km/h`;

export const formatPrecipitation = (mm: number, units: Units): string =>
  units === 'imperial'
    ? `${(mm / 25.4).toFixed(2)} in`
    : `${mm.toFixed(1)} mm`;

export const formatPercent = (value: number): string => `${Math.round(value)}%`;

export const formatPressure = (hPa: number): string => `${Math.round(hPa)} hPa`;

const DIRECTIONS = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];

export const formatWindDirection = (degrees: number): string =>
  `${DIRECTIONS[Math.round(((degrees % 360) + 360) % 360 / 45) % 8]}风`;

/** 由 ISO 国码产生旗帜 emoji（无国码时返回定位图标） */
export function countryFlag(countryCode: string): string {
  if (!/^[A-Za-z]{2}$/.test(countryCode)) return '📍';
  const base = 0x1f1e6;
  return String.fromCodePoint(
    ...countryCode
      .toUpperCase()
      .split('')
      .map((char) => base + char.charCodeAt(0) - 65),
  );
}

/** 输入 API 返回的当地 ISO 时间（无时区），取出 HH:mm */
export const formatLocalTime = (localIso: string): string =>
  localIso.slice(11, 16) || '--:--';

export const formatLocalHour = (localIso: string): string =>
  localIso.slice(11, 13) || '--';

export const formatDateShort = (date: string): string => {
  const [, month, day] = date.split('-');
  return month && day ? `${Number(month)}/${Number(day)}` : date;
};

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export const formatWeekday = (date: string): string => {
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? date : WEEKDAYS[parsed.getDay()];
};

export const formatUpdatedAt = (timestamp: number): string =>
  new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(timestamp));
