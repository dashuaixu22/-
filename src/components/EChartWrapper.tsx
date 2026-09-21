import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface EChartWrapperProps {
  option: echarts.EChartsOption | Record<string, any>;
  height?: string | number;
  className?: string;
}

export const EChartWrapper: React.FC<EChartWrapperProps> = ({
  option,
  height = '100%',
  className = '',
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // Initialize and clean up chart lifecycle once per container
  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;

    let instance = echarts.getInstanceByDom(el);
    if (!instance) {
      try {
        instance = echarts.init(el, undefined, {
          renderer: 'canvas',
        });
      } catch (err) {
        console.warn('[EChartWrapper] Failed to initialize echarts instance:', err);
      }
    }
    chartInstance.current = instance || null;

    let rafId: number | null = null;
    const handleResize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (chartInstance.current && !chartInstance.current.isDisposed()) {
          try {
            chartInstance.current.resize();
          } catch {
            // Silently absorb resize errors if DOM is hidden or detached
          }
        }
      });
    };

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver((entries) => {
        if (!entries || entries.length === 0) return;
        const entry = entries[0];
        if (entry.contentRect.width <= 0 && entry.contentRect.height <= 0) return;
        handleResize();
      });
      try {
        resizeObserver.observe(el);
      } catch {
        // Fallback to window resize
      }
    }

    window.addEventListener('resize', handleResize);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        try {
          resizeObserver.disconnect();
        } catch {
          // ignore
        }
      }
      if (chartInstance.current && !chartInstance.current.isDisposed()) {
        try {
          chartInstance.current.dispose();
        } catch {
          // ignore
        }
      }
      chartInstance.current = null;
    };
  }, []);

  // Update options safely without disposing the entire chart instance
  useEffect(() => {
    if (!option) return;

    if (!chartInstance.current || chartInstance.current.isDisposed()) {
      if (chartRef.current) {
        try {
          let instance = echarts.getInstanceByDom(chartRef.current);
          if (!instance) {
            instance = echarts.init(chartRef.current, undefined, { renderer: 'canvas' });
          }
          chartInstance.current = instance;
        } catch {
          return;
        }
      } else {
        return;
      }
    }

    if (chartInstance.current && !chartInstance.current.isDisposed()) {
      try {
        chartInstance.current.setOption(option, { notMerge: true, lazyUpdate: true });
      } catch (err) {
        console.warn('[EChartWrapper] Failed to setOption:', err);
      }
    }
  }, [option]);

  return (
    <div
      ref={chartRef}
      className={`w-full min-h-0 ${className}`}
      style={{ width: '100%', height }}
    />
  );
};

