import type { Units } from '../domain/types';

interface Props {
  units: Units;
  onChange: (units: Units) => void;
}

export function UnitToggle({ units, onChange }: Props) {
  return (
    <div className="unit-toggle" role="group" aria-label="温度单位">
      {(['metric', 'imperial'] as const).map((value) => (
        <button
          key={value}
          type="button"
          className={units === value ? 'is-active' : ''}
          aria-pressed={units === value}
          onClick={() => onChange(value)}
        >
          °{value === 'metric' ? 'C' : 'F'}
        </button>
      ))}
    </div>
  );
}
