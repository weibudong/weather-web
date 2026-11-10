import { describeWeatherCode } from './api/weatherCodes';
import { useWeatherController } from './app/useWeatherController';
import { AsyncOrErrorStates } from './components/AppContent';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Icon } from './components/Icons';
import { LocationSearch } from './components/LocationSearch';
import { UnitToggle } from './components/UnitToggle';
import { WeatherIcon } from './components/WeatherIcon';

/**
 * 最上层容器：只负责「编排」。
 * 所有状态与副作用都在 useWeatherController，所有画面都在 components/。
 */
export default function App() {
  const {
    state,
    geoError,
    setQuery,
    selectLocation,
    clearRecents,
    setUnits,
    retryWeather,
    retrySearch,
    locate,
    dismissGeoError,
  } = useWeatherController();

  const snapshot = state.weather.kind === 'success' ? state.weather.data : null;
  const tone = snapshot
    ? describeWeatherCode(snapshot.current.code, snapshot.current.isDay).tone
    : 'clear';

  return (
    <div className="app" data-tone={tone}>
      <div className="ambient" aria-hidden="true">
        <span className="ambient__blob ambient__blob--one" />
        <span className="ambient__blob ambient__blob--two" />
        <span className="ambient__blob ambient__blob--three" />
      </div>

      <div className="shell">
        <header className="topbar">
          <div className="brand">
            <span className="brand__mark"><WeatherIcon kind="sun" size={30} /></span>
            <div>
              <h1>气象观测</h1>
              <p>Weather Station · 实时天气与 7 日预报</p>
            </div>
          </div>
          <div className="topbar__actions">
            <button type="button" className="ghost-btn" onClick={locate}>
              <Icon name="locate" size={16} /> 我的位置
            </button>
            <UnitToggle units={state.units} onChange={setUnits} />
          </div>
        </header>

        <LocationSearch
          query={state.query}
          search={state.search}
          recents={state.recents}
          onQueryChange={setQuery}
          onSelect={selectLocation}
          onRetry={retrySearch}
          onClearRecents={clearRecents}
        />

        {geoError && (
          <div className="toast" role="alert">
            <Icon name="alert" size={18} />
            <span>{geoError.message}</span>
            <button type="button" className="icon-btn" aria-label="关闭提示" onClick={dismissGeoError}>
              <Icon name="close" size={15} />
            </button>
          </div>
        )}

        <ErrorBoundary>
          <AsyncOrErrorStates
            weather={state.weather}
            units={state.units}
            onRetry={retryWeather}
          />
        </ErrorBoundary>

        <footer className="footer">
          <span>
            数据源：
            <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
              Open-Meteo
            </a>
            {' '}· WMO 天气代码
          </span>
          <span>搜索纪录与单位偏好仅保存在本机浏览器</span>
        </footer>
      </div>
    </div>
  );
}
