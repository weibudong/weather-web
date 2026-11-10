import type { Location } from '../domain/types';

/**
 * 默认与热门城市。
 * 这些是「可直接选取」的领域对象，不需要额外打一次 geocoding API，
 * 让首次进入的用户立刻看到完整画面，也让空查询时有东西可点。
 */
export const DEFAULT_LOCATION: Location = {
  id: 'preset-tokyo',
  name: '东京',
  admin1: '',
  country: '日本',
  countryCode: 'JP',
  latitude: 35.6895,
  longitude: 139.6917,
  timezone: 'Asia/Tokyo',
};

export const POPULAR_LOCATIONS: Location[] = [
  DEFAULT_LOCATION,
  {
    id: 'preset-osaka',
    name: '大阪',
    admin1: '',
    country: '日本',
    countryCode: 'JP',
    latitude: 34.6937,
    longitude: 135.5023,
    timezone: 'Asia/Osaka',
  },
  {
    id: 'preset-seoul',
    name: '首尔',
    admin1: '',
    country: '南韩',
    countryCode: 'KR',
    latitude: 37.566,
    longitude: 126.9784,
    timezone: 'Asia/Seoul',
  },
  {
    id: 'preset-singapore',
    name: '新加坡',
    admin1: '',
    country: '新加坡',
    countryCode: 'SG',
    latitude: 1.2897,
    longitude: 103.8501,
    timezone: 'Asia/Singapore',
  },
  {
    id: 'preset-london',
    name: '伦敦',
    admin1: '',
    country: '英国',
    countryCode: 'GB',
    latitude: 51.5085,
    longitude: -0.1257,
    timezone: 'Europe/London',
  },
  {
    id: 'preset-newyork',
    name: '纽约',
    admin1: '纽约州',
    country: '美国',
    countryCode: 'US',
    latitude: 40.7143,
    longitude: -74.006,
    timezone: 'America/New_York',
  },
];

export const STORAGE_KEYS = {
  units: 'weather-station:units',
  recents: 'weather-station:recents',
} as const;
