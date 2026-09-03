import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders without crashing', () => {
    render(<LoadingSpinner />);
  });

  it('renders a spinner container', () => {
    render(<LoadingSpinner />);
    const container = screen.getByRole('status');
    expect(container).toBeInTheDocument();
  });

  it('has spinner-container class', () => {
    render(<LoadingSpinner />);
    const container = screen.getByRole('status').closest('.spinner-container');
    expect(container).toBeInTheDocument();
  });

  it('renders the spinner element inside', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status').querySelector('.spinner');
    expect(spinner).toBeInTheDocument();
  });
});
