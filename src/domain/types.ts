/**
 * 领域模型（Domain models）
 * ------------------------------------------------------------------
 * 这一层完全不认识 Open-Meteo，也不认识 React。
 * API 响应会在 api/ 层被转换（anti-corruption layer）成这里的类型，
 * 因此更换天气供应商时，UI 与状态层不需要跟着改。
 */

/** 显示单位。领域数据一律保存公制，转换只在格式化时发生。 */
export type Units = 'metric' | 'imperial';

export interface Location {
  id: string;
  name: string;
  admin1: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export type WeatherIconKind =
  | 'sun'
  | 'moon'
  | 'partly-cloudy-day'
  | 'partly-cloudy-night'
  | 'cloud'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'showers'
  | 'thunder'
  | 'unknown';

export type WeatherTone = 'clear' | 'cloudy' | 'rain' | 'snow' | 'storm' | 'fog';

export interface WeatherDescriptor {
  label: string;
  icon: WeatherIconKind;
  tone: WeatherTone;
}

export interface CurrentWeather {
  /** 当地时间，ISO 8601 无时区后缀（由 API 的 timezone=auto 保证） */
  observedAt: string;
  isDay: boolean;
  code: number;
  temperature: number; // °C
  apparentTemperature: number; // °C
  humidity: number; // %
  precipitation: number; // mm
  cloudCover: number; // %
  pressure: number; // hPa
  windSpeed: number; // km/h
  windDirection: number; // 度
}

export interface HourlyPoint {
  time: string;
  isDay: boolean;
  code: number;
  temperature: number; // °C
  precipitationProbability: number; // %
}

export interface DailyPoint {
  date: string; // YYYY-MM-DD
  code: number;
  tempMax: number; // °C
  tempMin: number; // °C
  precipitationProbability: number; // %
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
}

export interface WeatherSnapshot {
  location: Location;
  timezone: string;
  utcOffsetSeconds: number;
  current: CurrentWeather;
  /** 从「目前小时」开始的逐时数据 */
  hourly: HourlyPoint[];
  daily: DailyPoint[];
  fetchedAt: number;
}

/** 统一的错误模型：所有底层错误都会被规范化为此格式，UI 只需要处理一种形状。 */
export type AppErrorKind =
  | 'network'
  | 'timeout'
  | 'http'
  | 'parse'
  | 'cancelled'
  | 'geolocation'
  | 'unknown';

export interface AppError {
  kind: AppErrorKind;
  title: string;
  message: string;
  /** 开发用信息，可折叠显示，不直接暴露给用户 */
  detail?: string;
  retryable: boolean;
}

/**
 * 异步数据的有限状态机。
 * 使用 discriminated union 让「同时加载中又有数据又有错误」这类
 * 不可能存在的状态在编译期就无法被表达。
 */
export type RemoteData<T> =
  | { kind: 'idle' }
  | { kind: 'loading'; requestId: number }
  | { kind: 'success'; requestId: number; data: T }
  | { kind: 'error'; requestId: number; error: AppError };
