import { config } from '../app/config';
import type {
  CurrentWeather,
  DailyPoint,
  HourlyPoint,
  Location,
  WeatherSnapshot,
} from '../domain/types';
import { ApiFailure, fetchJson } from './http';

/**
 * Open-Meteo Forecast API 的原始响应（DTO）。
 * 字段声明为 optional / 可为 null，因为第三方数据不保证完整；
 * 读取时统一经过 numberAt()，避免 null 流进 UI 造成 NaN。
 */
interface ForecastResponseDto {
  timezone?: string;
  utc_offset_seconds?: number;
  current?: {
    time?: string;
    is_day?: number;
    weather_code?: number;
    temperature_2m?: number | null;
    apparent_temperature?: number | null;
    relative_humidity_2m?: number | null;
    precipitation?: number | null;
    cloud_cover?: number | null;
    surface_pressure?: number | null;
    wind_speed_10m?: number | null;
    wind_direction_10m?: number | null;
  };
  hourly?: {
    time?: string[];
    temperature_2m?: (number | null)[];
    precipitation_probability?: (number | null)[];
    weather_code?: (number | null)[];
    is_day?: (number | null)[];
  };
  daily?: {
    time?: string[];
    weather_code?: (number | null)[];
    temperature_2m_max?: (number | null)[];
    temperature_2m_min?: (number | null)[];
    precipitation_probability_max?: (number | null)[];
    sunrise?: string[];
    sunset?: string[];
    uv_index_max?: (number | null)[];
  };
  error?: boolean;
  reason?: string;
}

const numberAt = (
  values: (number | null)[] | undefined,
  index: number,
  fallback = 0,
): number => {
  const value = values?.[index];
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
};

const stringAt = (values: string[] | undefined, index: number): string =>
  values?.[index] ?? '';

function invalidPayload(detail: string): never {
  throw new ApiFailure({
    kind: 'parse',
    title: '数据格式异常',
    message: '天气服务返回的数据不完整，请重试一次。',
    detail,
    retryable: true,
  });
}

function mapCurrent(dto: ForecastResponseDto): CurrentWeather {
  const current = dto.current;
  if (!current?.time || typeof current.temperature_2m !== 'number') {
    invalidPayload('current.time / current.temperature_2m 缺失');
  }
  return {
    observedAt: current.time,
    isDay: current.is_day !== 0,
    code: current.weather_code ?? -1,
    temperature: current.temperature_2m,
    apparentTemperature: current.apparent_temperature ?? current.temperature_2m,
    humidity: current.relative_humidity_2m ?? 0,
    precipitation: current.precipitation ?? 0,
    cloudCover: current.cloud_cover ?? 0,
    pressure: current.surface_pressure ?? 0,
    windSpeed: current.wind_speed_10m ?? 0,
    windDirection: current.wind_direction_10m ?? 0,
  };
}

function mapHourly(dto: ForecastResponseDto, observedAt: string): HourlyPoint[] {
  const time = dto.hourly?.time;
  if (!Array.isArray(time) || time.length === 0) {
    invalidPayload('hourly.time 缺失');
  }

  // API 的 current.time 可能是 18:30，而逐时数据是 18:00；
  // 取到「小时」精度再比较，才能从现在这一格开始显示。
  const currentHour = observedAt.slice(0, 13);
  const points: HourlyPoint[] = time
    .map((value, index) => ({
      time: value,
      isDay: numberAt(dto.hourly?.is_day, index, 1) !== 0,
      code: numberAt(dto.hourly?.weather_code, index, -1),
      temperature: numberAt(dto.hourly?.temperature_2m, index),
      precipitationProbability: numberAt(dto.hourly?.precipitation_probability, index),
    }))
    .filter((point) => point.time.slice(0, 13) >= currentHour);

  return points.slice(0, config.hourlyHours);
}

function mapDaily(dto: ForecastResponseDto): DailyPoint[] {
  const time = dto.daily?.time;
  if (!Array.isArray(time) || time.length === 0) {
    invalidPayload('daily.time 缺失');
  }
  return time.map((date, index) => ({
    date,
    code: numberAt(dto.daily?.weather_code, index, -1),
    tempMax: numberAt(dto.daily?.temperature_2m_max, index),
    tempMin: numberAt(dto.daily?.temperature_2m_min, index),
    precipitationProbability: numberAt(dto.daily?.precipitation_probability_max, index),
    sunrise: stringAt(dto.daily?.sunrise, index),
    sunset: stringAt(dto.daily?.sunset, index),
    uvIndexMax: numberAt(dto.daily?.uv_index_max, index),
  }));
}

/** 取得单一地点的实时天气 + 逐时 + 每日预报（一次请求） */
export async function fetchWeather(
  location: Location,
  signal?: AbortSignal,
): Promise<WeatherSnapshot> {
  const url = new URL(`${config.forecastApiUrl}/forecast`);
  url.search = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    timezone: 'auto',
    forecast_days: String(config.forecastDays),
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'weather_code',
      'cloud_cover',
      'surface_pressure',
      'wind_speed_10m',
      'wind_direction_10m',
    ].join(','),
    hourly: ['temperature_2m', 'precipitation_probability', 'weather_code', 'is_day'].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_probability_max',
      'sunrise',
      'sunset',
      'uv_index_max',
    ].join(','),
  }).toString();

  const dto = await fetchJson<ForecastResponseDto>(url.toString(), { signal });
  if (dto?.error) invalidPayload(dto.reason ?? 'API 返回 error=true');

  const current = mapCurrent(dto);
  return {
    location,
    timezone: dto.timezone ?? location.timezone,
    utcOffsetSeconds: dto.utc_offset_seconds ?? 0,
    current,
    hourly: mapHourly(dto, current.observedAt),
    daily: mapDaily(dto),
    fetchedAt: Date.now(),
  };
}
