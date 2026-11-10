import type { WeatherDescriptor, WeatherIconKind } from '../domain/types';

/**
 * WMO Weather interpretation codes（Open-Meteo 使用）
 * 把供应商专属代码集中对应到领域词汇，UI 只识别 label / icon / tone。
 */
type Descriptor = Omit<WeatherDescriptor, 'icon'> & {
  icon: WeatherIconKind | 'clear' | 'partly';
};

const TABLE: Record<number, Descriptor> = {
  0: { label: '晴朗', icon: 'clear', tone: 'clear' },
  1: { label: '大致晴朗', icon: 'clear', tone: 'clear' },
  2: { label: '局部多云', icon: 'partly', tone: 'cloudy' },
  3: { label: '阴天', icon: 'cloud', tone: 'cloudy' },
  45: { label: '有雾', icon: 'fog', tone: 'fog' },
  48: { label: '雾凇', icon: 'fog', tone: 'fog' },
  51: { label: '轻微毛毛雨', icon: 'drizzle', tone: 'rain' },
  53: { label: '毛毛雨', icon: 'drizzle', tone: 'rain' },
  55: { label: '浓密毛毛雨', icon: 'drizzle', tone: 'rain' },
  56: { label: '冻毛毛雨', icon: 'rain', tone: 'rain' },
  57: { label: '浓密冻毛毛雨', icon: 'rain', tone: 'rain' },
  61: { label: '小雨', icon: 'rain', tone: 'rain' },
  63: { label: '中雨', icon: 'rain', tone: 'rain' },
  65: { label: '大雨', icon: 'rain', tone: 'rain' },
  66: { label: '冻雨', icon: 'rain', tone: 'rain' },
  67: { label: '强烈冻雨', icon: 'rain', tone: 'rain' },
  71: { label: '小雪', icon: 'snow', tone: 'snow' },
  73: { label: '中雪', icon: 'snow', tone: 'snow' },
  75: { label: '大雪', icon: 'snow', tone: 'snow' },
  77: { label: '雪粒', icon: 'snow', tone: 'snow' },
  80: { label: '局部阵雨', icon: 'showers', tone: 'rain' },
  81: { label: '阵雨', icon: 'showers', tone: 'rain' },
  82: { label: '强烈阵雨', icon: 'showers', tone: 'rain' },
  85: { label: '阵雪', icon: 'snow', tone: 'snow' },
  86: { label: '强烈阵雪', icon: 'snow', tone: 'snow' },
  95: { label: '雷雨', icon: 'thunder', tone: 'storm' },
  96: { label: '雷雨伴冰雹', icon: 'thunder', tone: 'storm' },
  99: { label: '强烈雷雨伴冰雹', icon: 'thunder', tone: 'storm' },
};

const FALLBACK: WeatherDescriptor = {
  label: '天气状况不明',
  icon: 'unknown',
  tone: 'cloudy',
};

/** 晴天 / 局部多云需要按日夜切换图标 */
export function describeWeatherCode(code: number, isDay = true): WeatherDescriptor {
  const entry = TABLE[code];
  if (!entry) return FALLBACK;

  let icon: WeatherIconKind;
  if (entry.icon === 'clear') icon = isDay ? 'sun' : 'moon';
  else if (entry.icon === 'partly') icon = isDay ? 'partly-cloudy-day' : 'partly-cloudy-night';
  else icon = entry.icon;

  return { label: entry.label, icon, tone: entry.tone };
}
