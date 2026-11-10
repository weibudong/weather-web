import type { RemoteData, Units, WeatherSnapshot } from '../domain/types';
import { EmptyState, ErrorPanel, WeatherSkeleton } from './AsyncStates';
import { CurrentWeatherCard } from './CurrentWeatherCard';
import { DailyForecast } from './DailyForecast';
import { HourlyForecast } from './HourlyForecast';

interface Props {
  weather: RemoteData<WeatherSnapshot>;
  units: Units;
  onRetry: () => void;
}

/**
 * 把「远程数据的 4 种状态」集中对应到画面。
 * 添加任何异步区块时，只要沿用同一个 RemoteData 类型，就不会漏掉 loading / error。
 */
export function AsyncOrErrorStates({ weather, units, onRetry }: Props) {
  switch (weather.kind) {
    case 'idle':
    case 'loading':
      return (
        <main className="content" aria-busy="true">
          <WeatherSkeleton />
        </main>
      );

    case 'error':
      return (
        <main className="content">
          <ErrorPanel error={weather.error} onRetry={onRetry} />
        </main>
      );

    case 'success': {
      const snapshot = weather.data;
      if (!snapshot) return <main className="content"><EmptyState /></main>;
      return (
        <main className="content">
          <CurrentWeatherCard snapshot={snapshot} units={units} />
          <HourlyForecast points={snapshot.hourly} units={units} />
          <DailyForecast days={snapshot.daily} units={units} />
        </main>
      );
    }
  }
}
