import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';

// Mock the auth context — Header depends on useAuth()
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// We need to import after mock so the mock takes effect
import { useAuth } from '../context/AuthContext';

describe('Header', () => {
  it('renders the logo link', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );

    const logo = screen.getByText('BookService');
    expect(logo).toBeInTheDocument();
    expect(logo.closest('a')).toHaveAttribute('href', '/');
  });

  it('renders Browse Services link', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );

    const browseLink = screen.getByText('Browse Services');
    expect(browseLink).toBeInTheDocument();
    expect(browseLink.closest('a')).toHaveAttribute('href', '/services');
  });

  it('shows user links when authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        _id: '1',
        id: '1',
        name: 'Gabrielle',
        email: 'gab@example.com',
        role: 'client',
      },
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );

    expect(screen.getByText('My Bookings')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.getByText('Gabrielle')).toBeInTheDocument();
  });

  it('shows provider dashboard link for provider role', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        _id: '1',
        id: '1',
        name: 'Gabrielle',
        email: 'gab@example.com',
        role: 'provider',
      },
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('hides user links when not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );

    expect(screen.queryByText('My Bookings')).not.toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });
});
