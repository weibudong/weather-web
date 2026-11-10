import type {
  AppError,
  Location,
  RemoteData,
  Units,
  WeatherSnapshot,
} from '../domain/types';
import { config } from './config';
import { DEFAULT_LOCATION, STORAGE_KEYS } from './constants';
import { isLocationArray, isUnits, readJson } from '../utils/storage';

export interface WeatherAppState {
  query: string;
  search: RemoteData<Location[]>;
  weather: RemoteData<WeatherSnapshot>;
  activeLocation: Location | null;
  units: Units;
  recents: Location[];
}

export type WeatherAction =
  | { type: 'QUERY_CHANGE'; query: string }
  | { type: 'SEARCH_RESET' }
  | { type: 'SEARCH_START'; requestId: number }
  | { type: 'SEARCH_SUCCESS'; requestId: number; locations: Location[] }
  | { type: 'SEARCH_FAILURE'; requestId: number; error: AppError }
  | { type: 'SELECT_LOCATION'; location: Location }
  | { type: 'WEATHER_START'; requestId: number; location: Location }
  | { type: 'WEATHER_SUCCESS'; requestId: number; data: WeatherSnapshot }
  | { type: 'WEATHER_FAILURE'; requestId: number; error: AppError }
  | { type: 'SET_UNITS'; units: Units }
  | { type: 'CLEAR_RECENTS' };

export function createInitialState(): WeatherAppState {
  const units = readJson(STORAGE_KEYS.units, isUnits) ?? 'metric';
  const recents = readJson(STORAGE_KEYS.recents, isLocationArray) ?? [];
  return {
    query: '',
    search: { kind: 'idle' },
    weather: { kind: 'idle' },
    // 有历史纪录就回到上次看的城市，否则用默认城市
    activeLocation: recents[0] ?? DEFAULT_LOCATION,
    units,
    recents,
  };
}

/**
 * 只有携带「目前进行中」requestId 的结果可以改变状态。
 * 这是一道幂等防护：即使 controller 漏了判断，过期的响应也不会覆盖新数据。
 */
function isCurrentRequest<T>(slice: RemoteData<T>, requestId: number): boolean {
  return slice.kind !== 'idle' && slice.requestId === requestId;
}

function withRecent(recents: Location[], location: Location): Location[] {
  return [location, ...recents.filter((item) => item.id !== location.id)].slice(
    0,
    config.maxRecents,
  );
}

export function weatherReducer(
  state: WeatherAppState,
  action: WeatherAction,
): WeatherAppState {
  switch (action.type) {
    case 'QUERY_CHANGE':
      return { ...state, query: action.query };

    case 'SEARCH_RESET':
      return state.search.kind === 'idle' ? state : { ...state, search: { kind: 'idle' } };

    case 'SEARCH_START':
      return { ...state, search: { kind: 'loading', requestId: action.requestId } };

    case 'SEARCH_SUCCESS':
      if (!isCurrentRequest(state.search, action.requestId)) return state;
      return {
        ...state,
        search: {
          kind: 'success',
          requestId: action.requestId,
          data: action.locations,
        },
      };

    case 'SEARCH_FAILURE':
      if (!isCurrentRequest(state.search, action.requestId)) return state;
      return {
        ...state,
        search: { kind: 'error', requestId: action.requestId, error: action.error },
      };

    case 'SELECT_LOCATION':
      return {
        ...state,
        query: '',
        search: { kind: 'idle' },
        activeLocation: action.location,
        recents: withRecent(state.recents, action.location),
      };

    case 'WEATHER_START':
      return {
        ...state,
        activeLocation: action.location,
        weather: { kind: 'loading', requestId: action.requestId },
      };

    case 'WEATHER_SUCCESS':
      if (!isCurrentRequest(state.weather, action.requestId)) return state;
      return {
        ...state,
        weather: { kind: 'success', requestId: action.requestId, data: action.data },
      };

    case 'WEATHER_FAILURE':
      if (!isCurrentRequest(state.weather, action.requestId)) return state;
      return {
        ...state,
        weather: { kind: 'error', requestId: action.requestId, error: action.error },
      };

    case 'SET_UNITS':
      return { ...state, units: action.units };

    case 'CLEAR_RECENTS':
      return { ...state, recents: [] };

    default:
      return state;
  }
}
