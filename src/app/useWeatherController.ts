import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { fetchWeather } from '../api/forecast';
import { requestCurrentPosition } from '../api/geolocation';
import { searchLocations } from '../api/geocoding';
import {
  isAppError,
  isCancellation,
  toAppError,
} from '../api/http';
import type { AppError, Location, Units } from '../domain/types';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { config } from './config';
import { DEFAULT_LOCATION, STORAGE_KEYS } from './constants';
import { createInitialState, weatherReducer } from './weatherReducer';
import { writeJson } from '../utils/storage';

const normalizeError = (error: unknown): AppError =>
  isAppError(error) ? error : toAppError(error);

export interface WeatherController {
  state: ReturnType<typeof createInitialState>;
  geoError: AppError | null;
  setQuery: (query: string) => void;
  selectLocation: (location: Location) => void;
  clearRecents: () => void;
  setUnits: (units: Units) => void;
  retryWeather: () => void;
  retrySearch: () => void;
  locate: () => void;
  dismissGeoError: () => void;
}

/**
 * 唯一的「容器层」状态协调者。
 * 组件只拿到 state 与 callback，完全不知道 API、AbortController 或 debounce 的存在。
 */
export function useWeatherController(): WeatherController {
  const [state, dispatch] = useReducer(weatherReducer, undefined, createInitialState);
  const [searchNonce, setSearchNonce] = useState(0);
  const [geoError, setGeoError] = useState<AppError | null>(null);

  const searchAbortRef = useRef<AbortController | null>(null);
  const weatherAbortRef = useRef<AbortController | null>(null);
  const nextRequestIdRef = useRef(0);
  const latestSearchIdRef = useRef(0);
  const latestWeatherIdRef = useRef(0);
  const initialLocationRef = useRef(state.activeLocation ?? DEFAULT_LOCATION);

  const debouncedQuery = useDebouncedValue(state.query, config.searchDebounceMs);

  // ---- 搜索：debounce + 取消旧请求 + 忽略过期响应 ----
  useEffect(() => {
    const query = debouncedQuery.trim();
    if (query.length < config.minQueryLength) {
      searchAbortRef.current?.abort();
      dispatch({ type: 'SEARCH_RESET' });
      return;
    }

    searchAbortRef.current?.abort();
    const controller = new AbortController();
    searchAbortRef.current = controller;

    const requestId = ++nextRequestIdRef.current;
    latestSearchIdRef.current = requestId;
    dispatch({ type: 'SEARCH_START', requestId });

    void (async () => {
      try {
        const locations = await searchLocations(query, controller.signal);
        if (latestSearchIdRef.current !== requestId) return;
        dispatch({ type: 'SEARCH_SUCCESS', requestId, locations });
      } catch (error) {
        if (isCancellation(error) || latestSearchIdRef.current !== requestId) return;
        dispatch({ type: 'SEARCH_FAILURE', requestId, error: toAppError(error) });
      }
    })();

    return () => controller.abort();
  }, [debouncedQuery, searchNonce]);

  // ---- 天气：单一入口，任何选地点 / 重试 / 定位都走这里 ----
  const loadWeather = useCallback(async (location: Location) => {
    weatherAbortRef.current?.abort();
    const controller = new AbortController();
    weatherAbortRef.current = controller;

    const requestId = ++nextRequestIdRef.current;
    latestWeatherIdRef.current = requestId;
    dispatch({ type: 'WEATHER_START', requestId, location });
    setGeoError(null);

    try {
      const snapshot = await fetchWeather(location, controller.signal);
      if (latestWeatherIdRef.current !== requestId) return;
      dispatch({ type: 'WEATHER_SUCCESS', requestId, data: snapshot });
    } catch (error) {
      if (isCancellation(error) || latestWeatherIdRef.current !== requestId) return;
      dispatch({ type: 'WEATHER_FAILURE', requestId, error: toAppError(error) });
    }
  }, []);

  // 首次进入自动加载（上次看过的城市或默认城市）
  useEffect(() => {
    void loadWeather(initialLocationRef.current);
    return () => {
      searchAbortRef.current?.abort();
      weatherAbortRef.current?.abort();
    };
  }, [loadWeather]);

  // ---- 偏好设置持久化 ----
  useEffect(() => writeJson(STORAGE_KEYS.units, state.units), [state.units]);
  useEffect(() => writeJson(STORAGE_KEYS.recents, state.recents), [state.recents]);

  const setQuery = useCallback((query: string) => {
    dispatch({ type: 'QUERY_CHANGE', query });
  }, []);

  const selectLocation = useCallback(
    (location: Location) => {
      dispatch({ type: 'SELECT_LOCATION', location });
      void loadWeather(location);
    },
    [loadWeather],
  );

  const retryWeather = useCallback(() => {
    void loadWeather(state.activeLocation ?? DEFAULT_LOCATION);
  }, [loadWeather, state.activeLocation]);

  const retrySearch = useCallback(() => setSearchNonce((value) => value + 1), []);

  const locate = useCallback(() => {
    void requestCurrentPosition()
      .then(selectLocation)
      .catch((error: unknown) => setGeoError(normalizeError(error)));
  }, [selectLocation]);

  return {
    state,
    geoError,
    setQuery,
    selectLocation,
    clearRecents: () => dispatch({ type: 'CLEAR_RECENTS' }),
    setUnits: (units: Units) => dispatch({ type: 'SET_UNITS', units }),
    retryWeather,
    retrySearch,
    locate,
    dismissGeoError: () => setGeoError(null),
  };
}
