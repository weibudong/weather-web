import { describeWeatherCode } from '../api/weatherCodes';
import type { DailyPoint, Units } from '../domain/types';
import {
  formatDateShort,
  formatPercent,
  formatTemperature,
  formatWeekday,
  temperatureUnit,
  toTemperature,
} from '../utils/format';
import { Icon } from './Icons';
import { WeatherIcon } from './WeatherIcon';

interface Props {
  days: DailyPoint[];
  units: Units;
}

export function DailyForecast({ days, units }: Props) {
  if (days.length === 0) return null;

  const globalMin = Math.min(...days.map((day) => toTemperature(day.tempMin, units)));
  const globalMax = Math.max(...days.map((day) => toTemperature(day.tempMax, units)));
  const span = Math.max(globalMax - globalMin, 1);

  return (
    <section className="card forecast-card" aria-label="未来 7 天预报">
      <header className="section-head">
        <div>
          <h2><Icon name="calendar" size={18} /> 7 日天气预报</h2>
          <p>每日最高 / 最低气温与降雨几率</p>
        </div>
        <div className="section-head__range">单位 {temperatureUnit(units)}</div>
      </header>

      <div className="day-list">
        {days.map((day, index) => {
          const descriptor = describeWeatherCode(day.code, true);
          const low = toTemperature(day.tempMin, units);
          const high = toTemperature(day.tempMax, units);
          const left = ((low - globalMin) / span) * 100;
          const width = Math.max(((high - low) / span) * 100, 8);

          return (
            <div className="day-row" key={day.date}>
              <div className="day-row__day">
                <strong>{index === 0 ? '今天' : index === 1 ? '明天' : formatWeekday(day.date)}</strong>
                <small>{formatDateShort(day.date)}</small>
              </div>

              <div className="day-row__condition">
                <WeatherIcon kind={descriptor.icon} size={38} />
                <span>{descriptor.label}</span>
              </div>

              <div className="day-row__rain">
                <Icon name="droplet" size={13} /> {formatPercent(day.precipitationProbability)}
                <small>紫外线 {Math.round(day.uvIndexMax)}</small>
              </div>

              <span className="day-row__temp day-row__temp--low">
                {formatTemperature(day.tempMin, units)}
              </span>
              <div className="day-row__bar" aria-hidden="true">
                <span style={{ left: `${left}%`, width: `${width}%` }} />
              </div>
              <span className="day-row__temp day-row__temp--high">
                {formatTemperature(day.tempMax, units)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
