import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          id="error-boundary-container"
          className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-800"
        >
          <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 p-6 shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">页面运行遇到异常</h2>
            <p className="text-sm text-slate-500 mb-4 leading-relaxed">
              系统检测到部分数据或视图异常，已阻止进一步错误。您可以尝试刷新视图或重新载入页面。
            </p>
            {this.state.error && (
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-left mb-5 overflow-auto max-h-32 text-xs font-mono text-slate-600">
                {this.state.error.message || '未知运行错误'}
              </div>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                id="btn-retry-render"
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors cursor-pointer"
              >
                重试加载
              </button>
              <button
                id="btn-reload-page"
                type="button"
                onClick={this.handleReload}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>刷新页面</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
