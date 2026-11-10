import type { ReactNode } from 'react';
import type { WeatherIconKind } from '../domain/types';

interface Props {
  kind: WeatherIconKind;
  size?: number;
  className?: string;
}

const SUN = '#FFC95C';
const MOON = '#DCE8FF';
const CLOUD = '#CFDCF5';
const CLOUD_DARK = '#9BB2D8';
const RAIN = '#70B4FF';
const SNOW = '#B9E8FF';
const BOLT = '#FFD76E';

const CLOUD_PATH = 'M20 47h24a10 10 0 0 0 1-19.9A15 15 0 0 0 17 24a11 11 0 0 0 3 23Z';

function Sun({ x = 32, y = 32, r = 11 }: { x?: number; y?: number; r?: number }) {
  return (
    <g>
      {Array.from({ length: 8 }, (_, index) => {
        const angle = (index * Math.PI) / 4;
        const inner = r + 4;
        const outer = r + 9;
        return (
          <line
            key={index}
            x1={x + Math.cos(angle) * inner}
            y1={y + Math.sin(angle) * inner}
            x2={x + Math.cos(angle) * outer}
            y2={y + Math.sin(angle) * outer}
            stroke={SUN}
            strokeWidth="3"
            strokeLinecap="round"
          />
        );
      })}
      <circle cx={x} cy={y} r={r} fill={SUN} />
    </g>
  );
}

function Moon() {
  return (
    <g>
      <path d="M42 11a21 21 0 1 0 11 35A23 23 0 0 1 42 11Z" fill={MOON} />
      <circle cx="47" cy="16" r="2" fill={MOON} opacity=".7" />
      <circle cx="52" cy="25" r="1.4" fill={MOON} opacity=".6" />
    </g>
  );
}

type RainKind = 'drizzle' | 'rain' | 'snow' | 'thunder';

function Cloud({ rain }: { rain?: RainKind } = {}) {
  return (
    <g>
      <path d={CLOUD_PATH} fill={CLOUD} />
      <path d="M20 47h24a10 10 0 0 0 1-19.9A15 15 0 0 0 17 24a11 11 0 0 0 3 23Z" fill="none" stroke={CLOUD_DARK} strokeWidth="1.5" opacity=".45" />
      {rain === 'drizzle' &&
        [24, 34, 44].map((x, index) => (
          <line key={x} x1={x} y1={52 + index} x2={x - 2} y2={56 + index} stroke={RAIN} strokeWidth="2.6" strokeLinecap="round" />
        ))}
      {rain === 'rain' &&
        [24, 34, 44].map((x) => (
          <line key={x} x1={x} y1={51} x2={x - 4} y2={60} stroke={RAIN} strokeWidth="3" strokeLinecap="round" />
        ))}
      {rain === 'snow' &&
        [24, 34, 44].map((x, index) => (
          <g key={x} stroke={SNOW} strokeWidth="2" strokeLinecap="round">
            <path d={`M${x} ${51 + (index % 2) * 3}h6M${x + 3} ${48 + (index % 2) * 3}v6`} />
          </g>
        ))}
      {rain === 'thunder' && (
        <path d="M33 49h7l-4 7h6l-9 11 2-8h-5l3-10Z" fill={BOLT} />
      )}
    </g>
  );
}

const SHAPES: Record<WeatherIconKind, ReactNode> = {
  sun: <Sun />,
  moon: <Moon />,
  'partly-cloudy-day': (
    <g>
      <Sun x={24} y={23} r={9} />
      <g transform="translate(2 8)"><Cloud /></g>
    </g>
  ),
  'partly-cloudy-night': (
    <g>
      <Moon />
      <g transform="translate(2 8)"><Cloud /></g>
    </g>
  ),
  cloud: <Cloud />,
  fog: (
    <g>
      <g transform="translate(0 -4)"><Cloud /></g>
      {[50, 56, 62].map((y, index) => (
        <line key={y} x1={14 + index * 3} y1={y} x2={50 - index * 2} y2={y} stroke={CLOUD_DARK} strokeWidth="3" strokeLinecap="round" opacity=".9" />
      ))}
    </g>
  ),
  drizzle: <Cloud rain="drizzle" />,
  rain: <Cloud rain="rain" />,
  showers: (
    <g>
      <Sun x={22} y={20} r={8} />
      <g transform="translate(2 8)"><Cloud rain="rain" /></g>
    </g>
  ),
  snow: <Cloud rain="snow" />,
  thunder: <Cloud rain="thunder" />,
  unknown: (
    <g>
      <Cloud />
      <text x="32" y="43" textAnchor="middle" fontSize="14" fontWeight="700" fill="#6C7FA6">?</text>
    </g>
  ),
};

/** 以 inline SVG 绘制天气图标，不依赖字体或外部图片资源 */
export function WeatherIcon({ kind, size = 48, className }: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      {SHAPES[kind]}
    </svg>
  );
}
