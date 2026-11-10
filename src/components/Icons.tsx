import type { ReactNode } from 'react';

export type IconName =
  | 'search'
  | 'pin'
  | 'locate'
  | 'close'
  | 'refresh'
  | 'chevron'
  | 'thermometer'
  | 'droplet'
  | 'wind'
  | 'cloud'
  | 'gauge'
  | 'sunrise'
  | 'umbrella'
  | 'clock'
  | 'alert'
  | 'trash'
  | 'compass'
  | 'calendar'
  | 'sparkles';

const PATHS: Record<IconName, ReactNode> = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  pin: <><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></>,
  locate: <><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="2" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></>,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  refresh: <><path d="M20 11a8 8 0 1 0-2.3 5.7" /><path d="M20 4v7h-7" /></>,
  chevron: <path d="m9 6 6 6-6 6" />,
  thermometer: <><path d="M14 14.8V5a2 2 0 1 0-4 0v9.8a4 4 0 1 0 4 0Z" /><path d="M12 11v6" /></>,
  droplet: <path d="M12 3s6 6.6 6 10.5A6 6 0 0 1 6 13.5C6 9.6 12 3 12 3Z" />,
  wind: <><path d="M3 8h11a3 3 0 1 0-3-3" /><path d="M3 12h15a3 3 0 1 1-3 3" /><path d="M3 16h7" /></>,
  cloud: <path d="M7 18h10a4 4 0 0 0 .4-8 6 6 0 0 0-11.5 1.3A3.4 3.4 0 0 0 7 18Z" />,
  gauge: <><path d="M4 17a8 8 0 1 1 16 0" /><path d="m12 17 4-5" /><circle cx="12" cy="17" r="1" /></>,
  sunrise: <><path d="M2 18h20M6 14a6 6 0 0 1 12 0" /><path d="M12 3v3M5 6l2 2M19 6l-2 2" /></>,
  umbrella: <><path d="M3 13a9 9 0 0 1 18 0H3Z" /><path d="M12 13v6a2 2 0 0 0 4 0" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  alert: <><path d="M12 3 2 20h20L12 3Z" /><path d="M12 9v5M12 17h.01" /></>,
  trash: <><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></>,
  compass: <><circle cx="12" cy="12" r="9" /><path d="m15 9-2 4-4 2 2-4 4-2Z" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  sparkles: <><path d="m12 3 1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3Z" /><path d="m19 16 .8 2 .2.8-2-.8-2 .8.8-2.8" /></>,
};

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

/** 轻量、零依赖的界面图标集 */
export function Icon({ name, size = 18, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
