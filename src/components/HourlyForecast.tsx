import { describeWeatherCode } from '../api/weatherCodes';
import type { HourlyPoint, Units } from '../domain/types';
import {
  formatLocalHour,
  formatPercent,
  formatTemperature,
  toTemperature,
} from '../utils/format';
import { Icon } from './Icons';
import { WeatherIcon } from './WeatherIcon';

interface Props {
  points: HourlyPoint[];
  units: Units;
}

const CHART = { width: 960, height: 170, x0: 28, x1: 932, yTop: 28, yBottom: 112 };

export function HourlyForecast({ points, units }: Props) {
  if (points.length < 2) return null;

  const temps = points.map((point) => toTemperature(point.temperature, units));
  const minCelsius = Math.min(...points.map((point) => point.temperature));
  const maxCelsius = Math.max(...points.map((point) => point.temperature));
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const span = Math.max(max - min, 1);
  const coordinates = temps.map((temp, index) => ({
    x: CHART.x0 + (index * (CHART.x1 - CHART.x0)) / (temps.length - 1),
    y: CHART.yBottom - ((temp - min) / span) * (CHART.yBottom - CHART.yTop),
  }));
  const linePath = coordinates
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(' ');
  const areaPath = `${linePath} L${CHART.x1} ${CHART.height - 32} L${CHART.x0} ${CHART.height - 32} Z`;

  return (
    <section className="card forecast-card" aria-label="未来 24 小时预报">
      <header className="section-head">
        <div>
          <h2><Icon name="clock" size={18} /> 24 小时趋势</h2>
          <p>逐时气温与降雨几率 · 当地时间</p>
        </div>
        <div className="section-head__range">
          最低 <strong>{formatTemperature(minCelsius, units, true)}</strong> / 最高{' '}
          <strong>{formatTemperature(maxCelsius, units, true)}</strong>
        </div>
      </header>

      <div className="chart-scroll">
        <svg
          className="temp-chart"
          viewBox={`0 0 ${CHART.width} ${CHART.height}`}
          role="img"
          aria-label={`未来 24 小时气温由 ${formatTemperature(points[0].temperature, units, true)} 变化到 ${formatTemperature(points[points.length - 1].temperature, units, true)}`}
        >
          <defs>
            <linearGradient id="hourly-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6ea8ff" stopOpacity="0.42" />
              <stop offset="100%" stopColor="#6ea8ff" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.6, 0.95].map((ratio) => (
            <line
              key={ratio}
              x1={CHART.x0}
              x2={CHART.x1}
              y1={CHART.yTop + ratio * (CHART.yBottom - CHART.yTop)}
              y2={CHART.yTop + ratio * (CHART.yBottom - CHART.yTop)}
              className="chart-grid"
            />
          ))}
          <path d={areaPath} fill="url(#hourly-area)" />
          <path d={linePath} className="chart-line" />
          {coordinates.map((point, index) =>
            index % 3 === 0 ? (
              <g key={index}>
                <circle cx={point.x} cy={point.y} r="4.5" className="chart-dot" />
                <text x={point.x} y={point.y - 12} className="chart-value" textAnchor="middle">
                  {formatTemperature(points[index].temperature, units)}
                </text>
                <text x={point.x} y={CHART.height - 10} className="chart-label" textAnchor="middle">
                  {formatLocalHour(points[index].time)}
                </text>
              </g>
            ) : null,
          )}
        </svg>
      </div>

      <div className="hourly-strip" role="list">
        {points.map((point, index) => {
          const descriptor = describeWeatherCode(point.code, point.isDay);
          return (
            <div className="hour-chip" role="listitem" key={point.time}>
              <span className="hour-chip__time">{index === 0 ? '现在' : `${formatLocalHour(point.time)}:00`}</span>
              <WeatherIcon kind={descriptor.icon} size={40} />
              <strong>{formatTemperature(point.temperature, units)}</strong>
              <span className="hour-chip__rain">
                <Icon name="droplet" size={12} /> {formatPercent(point.precipitationProbability)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
