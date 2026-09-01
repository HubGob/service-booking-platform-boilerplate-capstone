import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { Service, AvailabilitySlot, Booking } from '../types';
import './ServiceDetail.css';

const ServiceDetail = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        const svcRes = await fetch(`api/services/${id}`).then(r => r.json());
        setService(svcRes);
        if (svcRes.provider) {
          const availRes = await fetch(`api/availability/provider/${svcRes.provider._id}`).then(r => r.json());
          setAvailability(availRes.availability || []);
        }
      } catch (err) {
        setError('Failed to load service');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleBook = async (): Promise<void> => {
    if (!selectedSlot) { setError('Please select an available time slot'); return; }
    try {
      const [dayStr, timeRange] = selectedSlot.split(' ');
      const [startTime, endTime] = timeRange.split('-');
      const today = new Date();
      const dayOfWeek = parseInt(dayStr);
      const slotDate = new Date(today);
      slotDate.setDate(today.getDate() + ((dayOfWeek - today.getDay() + 7) % 7 || 7));
      const [startH, startM] = startTime.split(':').map(Number);
      slotDate.setHours(startH, startM);
      const endSlot = new Date(slotDate);
      const [endH, endM] = endTime.split(':').map(Number);
      endSlot.setHours(endH, endM);

      const res = await fetch('api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId: id, startTime: slotDate.toISOString(), endTime: endSlot.toISOString(), notes })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Booking failed');
      setBooking(data.booking);
    } catch (err: any) {
      setError(err.message || 'Booking failed');
    }
  };

  if (loading) return <><Header /><div className="spinner-container"><div className="spinner" /></div></>;
  if (error && !service) return <><Header /><div className="error-page"><p>{error}</p><Link to="/services" className="btn-back">Back to Services</Link></div></>;

  return (
    <div className="service-detail">
      <Header />
      {service && (
        <>
          <div className="detail-header">
            <div className="provider-info">
              {service.provider?.avatar && <img src={service.provider.avatar} alt="" className="provider-avatar" />}
              <div>
                <h2>{service.provider?.name}</h2>
                <p className="provider-specialty">{service.provider?.specialty || 'Service Provider'}</p>
              </div>
            </div>
            <div className="detail-price">
              <span className="price">${service.price}</span>
              <span className="duration">{service.durationMinutes} min</span>
            </div>
          </div>
          <div className="detail-body">
            <div className="detail-info">
              <h3>About This Service</h3>
              <p>{service.description}</p>
              <p className="category-tag">{service.category}</p>
            </div>
            {isAuthenticated && user?.role === 'client' && availability.length > 0 && (
              <div className="booking-section">
                <h3>Book a Session</h3>
                {!booking ? (
                  <>
                    <div className="slots-list">
                      <h4>Available Times</h4>
                      {availability.map(slot => (
                        <label key={slot._id} className={`slot-option ${selectedSlot?.includes(slot.startTime) ? 'selected' : ''}`}>
                          <input type="radio" name="slot" value={`${slot.dayOfWeek} ${slot.startTime}-${slot.endTime}`} onChange={e => setSelectedSlot(e.target.value)} />
                          <span>Day {slot.dayOfWeek} · {slot.startTime} - {slot.endTime}</span>
                        </label>
                      ))}
                    </div>
                    <textarea placeholder="Notes for the provider..." value={notes} onChange={e => setNotes(e.target.value)} className="notes-input" />
                    {selectedSlot && <button className="btn-book" onClick={handleBook}>Book Now — ${service.price}</button>}
                  </>
                ) : (
                  <div className="booking-confirmed">
                    <p>Booking created! Status: {booking.status}</p>
                    {booking._id && <Link to={`/bookings/${booking._id}`} className="btn-view">View Booking</Link>}
                  </div>
                )}
              </div>
            )}
            {!isAuthenticated && <div className="auth-prompt"><p><Link to="/login">Login</Link> or <Link to="/register">register</Link> to book this service.</p></div>}
            {user?.role !== 'client' && isAuthenticated && <div className="auth-prompt"><p>Switch to client role to book services.</p></div>}
          </div>
        </>
      )}
    </div>
  );
};

export default ServiceDetail;