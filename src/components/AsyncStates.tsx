import type { AppError } from '../domain/types';
import { Icon } from './Icons';

interface ErrorPanelProps {
  error: AppError;
  onRetry?: () => void;
  compact?: boolean;
}

/** 所有异步失败共用的呈现方式：友善消息 + 可选重试 + 开发信息折叠 */
export function ErrorPanel({ error, onRetry, compact = false }: ErrorPanelProps) {
  return (
    <div className={`state-card${compact ? ' state-card--compact' : ''}`} role="alert">
      <div className="state-card__icon state-card__icon--error">
        <Icon name={error.kind === 'network' || error.kind === 'timeout' ? 'refresh' : 'alert'} size={28} />
      </div>
      <h2>{error.title}</h2>
      <p>{error.message}</p>
      {error.detail && (
        <details className="error-detail">
          <summary>技术信息</summary>
          <code>{error.detail}</code>
        </details>
      )}
      {error.retryable && onRetry && (
        <button type="button" className="primary-btn" onClick={onRetry}>
          <Icon name="refresh" size={16} /> 重新加载
        </button>
      )}
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="state-card">
      <div className="state-card__icon">
        <Icon name="pin" size={28} />
      </div>
      <h2>选择一个地点</h2>
      <p>用上方的搜索框输入城市名称，或从热门城市中挑一个，就能查看实时天气与预报。</p>
    </div>
  );
}

/** 与真实版面同构的骨架，避免加载完成时画面大幅跳动 */
export function WeatherSkeleton() {
  return (
    <div className="skeleton-layout" aria-busy="true" aria-label="天气数据加载中">
      <div className="card hero-card">
        <div className="skeleton skeleton--line" style={{ width: '32%' }} />
        <div className="skeleton skeleton--temp" />
        <div className="skeleton skeleton--line" style={{ width: '48%' }} />
      </div>
      <div className="card">
        <div className="skeleton skeleton--line" style={{ width: '24%' }} />
        <div className="skeleton skeleton--chart" />
      </div>
      <div className="card">
        <div className="skeleton skeleton--line" style={{ width: '20%' }} />
        {Array.from({ length: 5 }, (_, index) => (
          <div className="skeleton skeleton--row" key={index} />
        ))}
      </div>
    </div>
  );
}
