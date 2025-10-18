import React from 'react';
import type { MetricChartProps } from '../../types';

export function MetricChart({ metrics, title, height = 300 }: MetricChartProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      case 'stable':
        return '→';
      default:
        return '→';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'stable':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div key={metric.id} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metric.value.toLocaleString()} {metric.unit}
                </p>
              </div>
              <div className={`text-right ${getTrendColor(metric.trend)}`}>
                <div className="flex items-center">
                  <span className="text-lg mr-1">{getTrendIcon(metric.trend)}</span>
                  <span className="text-sm font-medium">
                    {metric.changePercent > 0 ? '+' : ''}{metric.changePercent.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Simple chart visualization */}
      <div className="bg-white p-4 rounded-lg border border-gray-200" style={{ height: `${height}px` }}>
        <div className="h-full flex items-end justify-between space-x-2">
          {metrics.map((metric) => {
            const maxValue = Math.max(...metrics.map(m => m.value));
            const heightPercent = (metric.value / maxValue) * 100;
            
            return (
              <div key={metric.id} className="flex flex-col items-center flex-1">
                <div 
                  className="bg-blue-500 rounded-t w-full transition-all duration-500 ease-out"
                  style={{ height: `${heightPercent}%` }}
                  title={`${metric.name}: ${metric.value} ${metric.unit}`}
                />
                <div className="mt-2 text-xs text-gray-600 text-center">
                  <div className="font-medium">{metric.name}</div>
                  <div className="text-gray-500">{metric.value}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MetricChart;
