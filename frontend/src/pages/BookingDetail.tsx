import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Booking } from '../types';
import './BookingDetail.css';

const BookingDetail = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        const res = await fetch(`api/bookings/${id}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setBooking(data);
      } catch (err) {
        alert('Booking not found');
        navigate('/bookings');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  if (loading) return <><Header /><div className="spinner-container"><div className="spinner" /></div></>;
  if (!booking) return null as unknown as JSX.Element;

  return (
    <div className="booking-detail">
      <Header />
      <h1>Booking Details</h1>
      <div className="detail-card">
        <div className="detail-row"><label>Service</label><span>{booking.service?.title || 'N/A'}</span></div>
        <div className="detail-row"><label>Provider</label><span>{booking.provider?.name || 'N/A'}</span></div>
        <div className="detail-row"><label>Client</label><span>{booking.client?.name || 'N/A'}</span></div>
        <div className="detail-row"><label>Date & Time</label><span>{new Date(booking.startTime).toLocaleString()}</span></div>
        <div className="detail-row"><label>Total</label><span className="total">${booking.totalPrice}</span></div>
        <div className="detail-row"><label>Status</label><span className={`status-badge status-${booking.status}`}>{booking.status}</span></div>
        {booking.notes && <div className="detail-row"><label>Notes</label><span>{booking.notes}</span></div>}
      </div>
      <Link to="/bookings" className="btn-back">Back to Bookings</Link>
    </div>
  );
};

export default BookingDetail;