/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MetricChart from '../../src/components/charts/MetricChart';

const metrics = [
  { id: 'm1', name: 'Metric 1', value: 1000, unit: 'users', trend: 'up', changePercent: 10.5, timestamp: new Date() },
  { id: 'm2', name: 'Metric 2', value: 500, unit: 'users', trend: 'down', changePercent: -5.2, timestamp: new Date() },
];

describe('MetricChart', () => {
  it('renders title and metric values', () => {
    render(<MetricChart metrics={metrics as any} title="My Metrics" height={200} />);
    expect(screen.getByText('My Metrics')).toBeInTheDocument();
  expect(screen.getAllByText('Metric 1').length).toBeGreaterThanOrEqual(1);
  expect(screen.getByText(/1,000/)).toBeInTheDocument();
  });

  it('renders trend icons and bar titles', () => {
    render(<MetricChart metrics={metrics as any} title="My Metrics" />);
    expect(screen.getByText('↗️')).toBeInTheDocument();
    expect(screen.getByText('↘️')).toBeInTheDocument();
    // bars have title attribute
    const bar1 = screen.getByTitle('Metric 1: 1000 users');
    expect(bar1).toBeInTheDocument();
    // assert bar style height is present (100% for max)
    expect(bar1).toHaveStyle({ height: '100%' });
  });
});
