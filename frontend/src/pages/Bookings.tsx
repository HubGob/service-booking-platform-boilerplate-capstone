import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { Booking } from '../types';
import './Bookings.css';

const Bookings = (): JSX.Element => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        const params = new URLSearchParams();
        if (filter !== 'all') params.set('status', filter);
        const res = await fetch(`api/bookings?${params}`);
        const data = await res.json();
        setBookings(data.bookings || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [filter]);

  const cancelBooking = async (id: string): Promise<void> => {
    if (!confirm('Cancel this booking?')) return;
    try {
      const res = await fetch(`api/bookings/${id}/cancel`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      if (!res.ok) throw new Error('Failed to cancel');
      setBookings(bookings.map(b => b._id === id ? { ...b, status: 'cancelled' as const } : b));
    } catch (err: any) { alert(err.message); }
  };

  if (loading) return <><Header /><div className="spinner-container"><div className="spinner" /></div></>;

  return (
    <div className="bookings-page">
      <Header />
      <h1>My Bookings</h1>
      <div className="bookings-filters">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
          <button key={s} className={`filter-btn ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      {bookings.length === 0 ? <p className="empty-state">No bookings found.</p> :
        <div className="bookings-list">
          {bookings.map(b => (
            <div key={b._id} className={`booking-card status-${b.status}`}>
              <div>
                <h3>{b.service?.title || 'Service'}</h3>
                <p>with {b.provider?.name || 'Provider'}</p>
                <p className="booking-date">{new Date(b.startTime).toLocaleDateString()} at {new Date(b.startTime).toLocaleTimeString()}</p>
                <p className="booking-price">${b.totalPrice}</p>
              </div>
              <div className="booking-actions">
                <Link to={`/bookings/${b._id}`} className="btn-view">Details</Link>
                {b.status === 'pending' && <button className="btn-cancel" onClick={() => cancelBooking(b._id)}>Cancel</button>}
              </div>
            </div>
          ))}
        </div>}
    </div>
  );
};

export default Bookings;