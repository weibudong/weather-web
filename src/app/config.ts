/**
 * 集中式的环境设置。
 * 所有 magic number / 外部服务地址都放在这里，方便调整与测试。
 */
const env = (import.meta.env ?? {}) as Record<string, string | undefined>;

const positiveNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const config = {
  geocodingApiUrl:
    env.VITE_GEOCODING_API_URL ?? 'https://geocoding-api.open-meteo.com/v1',
  forecastApiUrl: env.VITE_FORECAST_API_URL ?? 'https://api.open-meteo.com/v1',
  requestTimeoutMs: positiveNumber(env.VITE_REQUEST_TIMEOUT_MS, 10_000),
  searchDebounceMs: 350,
  minQueryLength: 2,
  forecastDays: 7,
  hourlyHours: 24,
  maxRecents: 6,
} as const;
