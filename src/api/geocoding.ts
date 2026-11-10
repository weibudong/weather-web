import { config } from '../app/config';
import type { Location } from '../domain/types';
import { fetchJson } from './http';

/** Open-Meteo Geocoding API 的原始响应（DTO） */
interface GeocodingResultDto {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
  timezone?: string;
}

interface GeocodingResponseDto {
  results?: GeocodingResultDto[];
}

/** DTO → 领域模型 */
function toLocation(dto: GeocodingResultDto): Location {
  return {
    id: `geo-${dto.id}`,
    name: dto.name,
    admin1: dto.admin1 && dto.admin1 !== dto.name ? dto.admin1 : '',
    country: dto.country ?? '',
    countryCode: dto.country_code ?? '',
    latitude: dto.latitude,
    longitude: dto.longitude,
    timezone: dto.timezone ?? 'auto',
  };
}

export function locationLabel(location: Location): string {
  return [location.name, location.admin1, location.country]
    .filter(Boolean)
    .join(' · ');
}

/** 按关键字搜索地点；返回空数组代表「未找到结果」，不是错误。 */
export async function searchLocations(
  query: string,
  signal?: AbortSignal,
): Promise<Location[]> {
  const trimmed = query.trim();
  if (trimmed.length < config.minQueryLength) return [];

  const url = new URL(`${config.geocodingApiUrl}/search`);
  url.search = new URLSearchParams({
    name: trimmed,
    count: '8',
    language: 'zh',
    format: 'json',
  }).toString();

  const dto = await fetchJson<GeocodingResponseDto>(url.toString(), { signal });
  const results = Array.isArray(dto?.results) ? dto.results : [];

  // 同一城市可能有多条结果，用坐标去重，避免列表出现重复选项
  const seen = new Set<string>();
  return results
    .filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude))
    .map(toLocation)
    .filter((location) => {
      const key = `${location.latitude.toFixed(3)},${location.longitude.toFixed(3)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
