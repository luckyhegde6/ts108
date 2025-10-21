import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from 'components/ui/Card';

describe('Card Component', () => {
  it('renders with title', () => {
    render(<Card title="Test Card">Content</Card>);
    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders with subtitle', () => {
    render(<Card title="Test Card" subtitle="Test Subtitle">Content</Card>);
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = render(
      <Card title="Test Card" className="custom-class">Content</Card>
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
