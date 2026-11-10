import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Icon } from './Icons';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** 拦截 render 阶段的异常，避免整页白屏（API 错误另有 ErrorPanel 处理） */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[WeatherStation] render error:', error, info.componentStack);
  }

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="state-card" role="alert">
        <div className="state-card__icon state-card__icon--error">
          <Icon name="alert" size={28} />
        </div>
        <h2>画面发生错误</h2>
        <p>应用程序遇到未预期的问题，重新加载通常可以解决。</p>
        <details className="error-detail">
          <summary>技术信息</summary>
          <code>{error.message}</code>
        </details>
        <button
          type="button"
          className="primary-btn"
          onClick={() => window.location.reload()}
        >
          <Icon name="refresh" size={16} /> 重新加载
        </button>
      </div>
    );
  }
}
