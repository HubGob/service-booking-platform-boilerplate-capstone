import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = (): JSX.Element => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (): void => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <Link to="/" className="logo">BookService</Link>
      <nav className="nav">
        <Link to="/services">Browse Services</Link>
        {isAuthenticated && (
          <>
            <Link to="/bookings">My Bookings</Link>
            {user?.role === 'provider' && <Link to="/dashboard">Dashboard</Link>}
            <Link to="/profile" className="nav-profile">{user?.name}</Link>
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;