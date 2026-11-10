import { describeWeatherCode } from '../api/weatherCodes';
import type { Units, WeatherSnapshot } from '../domain/types';
import {
  countryFlag,
  formatLocalTime,
  formatTemperature,
  formatUpdatedAt,
} from '../utils/format';
import { Icon } from './Icons';
import { WeatherIcon } from './WeatherIcon';

interface Props {
  snapshot: WeatherSnapshot;
  units: Units;
}

export function CurrentWeatherCard({ snapshot, units }: Props) {
  const { current, location, daily } = snapshot;
  const descriptor = describeWeatherCode(current.code, current.isDay);
  const today = daily[0];

  return (
    <section className="card hero-card" data-tone={descriptor.tone} aria-label="目前天气">
      <div className="hero-card__glow" aria-hidden="true" />

      <header className="hero-card__head">
        <div>
          <div className="hero-card__place">
            <span aria-hidden="true">{countryFlag(location.countryCode)}</span>
            <h1>{location.name}</h1>
            {location.admin1 && <span className="hero-card__region">{location.admin1}</span>}
          </div>
          <p className="hero-card__meta">
            {[location.country, snapshot.timezone].filter(Boolean).join(' · ')} · 当地时间{' '}
            {formatLocalTime(current.observedAt)}
          </p>
        </div>
        <span className={`weather-badge${current.isDay ? '' : ' weather-badge--night'}`}>
          {current.isDay ? '日间观测' : '夜间观测'}
        </span>
      </header>

      <div className="hero-card__main">
        <div className="hero-card__reading">
          <div className="hero-card__temperature">
            {formatTemperature(current.temperature, units)}
          </div>
          <div className="hero-card__condition">
            <strong>{descriptor.label}</strong>
            <span>
              体感 {formatTemperature(current.apparentTemperature, units, true)} · 最高{' '}
              {formatTemperature(today?.tempMax ?? current.temperature, units, true)} / 最低{' '}
              {formatTemperature(today?.tempMin ?? current.temperature, units, true)}
            </span>
          </div>
        </div>
        <div className="hero-card__art" aria-hidden="true">
          <WeatherIcon kind={descriptor.icon} size={168} />
        </div>
      </div>

      <footer className="hero-card__foot">
        <span><Icon name="sunrise" size={16} /> 日出 {today?.sunrise ? formatLocalTime(today.sunrise) : '--:--'}</span>
        <span><Icon name="calendar" size={16} /> 日落 {today?.sunset ? formatLocalTime(today.sunset) : '--:--'}</span>
        <span className="hero-card__updated">
          <Icon name="clock" size={16} /> 更新于 {formatUpdatedAt(snapshot.fetchedAt)}
        </span>
      </footer>
    </section>
  );
}
