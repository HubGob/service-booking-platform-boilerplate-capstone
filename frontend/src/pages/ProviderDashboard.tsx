import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { Service, AvailabilitySlot, Booking } from '../types';
import './Dashboard.css';

const ProviderDashboard = (): JSX.Element => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        const [svcRes, availRes, bookRes] = await Promise.all([
          fetch(`api/services?provider=${user?._id}`).then(r => r.json()),
          fetch(`api/availability/provider/${user?._id}`).then(r => r.json()),
          fetch('api/bookings?status=pending').then(r => r.json())
        ]);
        setServices(svcRes.services || []);
        setAvailability(availRes.availability || []);
        setBookings(bookRes.bookings || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [user?._id]);

  const addService = async (data: { title: string; description: string; category: string; durationMinutes: number; price: number }): Promise<void> => {
    try {
      const res = await fetch('api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      setServices([...services, result]);
    } catch (err: any) { alert(err.message || 'Failed to create service'); }
  };

  const addAvailability = async (data: { dayOfWeek: number; startTime: string; endTime: string }): Promise<void> => {
    try {
      const res = await fetch('api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      setAvailability([...availability, result]);
    } catch (err: any) { alert(err.message || 'Failed to add availability'); }
  };

  const confirmBooking = async (bookingId: string): Promise<void> => {
    try {
      const res = await fetch(`api/bookings/${bookingId}/confirm`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to confirm');
      setBookings(bookings.filter(b => b._id !== bookingId));
    } catch (err: any) { alert(err.message); }
  };

  const deleteService = async (serviceId: string): Promise<void> => {
    if (!confirm('Delete this service?')) return;
    try {
      const res = await fetch(`api/services/${serviceId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setServices(services.filter(s => s._id !== serviceId));
    } catch (err: any) { alert(err.message); }
  };

  const deleteAvailability = async (slotId: string): Promise<void> => {
    if (!confirm('Delete this time slot?')) return;
    try {
      const res = await fetch(`api/availability/${slotId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setAvailability(availability.filter(s => s._id !== slotId));
    } catch (err: any) { alert(err.message); }
  };

  if (loading) return <><Header /><div className="spinner-container"><div className="spinner" /></div></>;

  return (
    <div className="dashboard">
      <Header />
      <h1>Provider Dashboard</h1>
      <section className="dash-section">
        <h2>Your Services ({services.length})</h2>
        <button className="btn-add" onClick={() => {
          const title = prompt('Service title:');
          if (!title) return;
          const desc = prompt('Description:');
          const cat = prompt('Category (tutoring, consulting, design, writing, development, marketing, music, other):');
          const duration = prompt('Duration in minutes (e.g. 60):');
          const price = prompt('Price in dollars:');
          if (title && desc && cat && duration && price) {
            addService({ title, description: desc, category: cat, durationMinutes: parseInt(duration), price: parseFloat(price) });
          }
        }}>+ Add Service</button>
        {services.length === 0 ? <p className="empty-state">No services yet. Add your first one!</p> :
          <div className="services-list">
            {services.map(s => (
              <div key={s._id} className="service-item">
                <strong>{s.title}</strong> — ${s.price} / {s.durationMinutes}min [{s.category}]
                <button className="btn-delete" onClick={() => deleteService(s._id)}>Delete</button>
              </div>
            ))}
          </div>}
      </section>
      <section className="dash-section">
        <h2>Your Availability ({availability.length} slots)</h2>
        <button className="btn-add" onClick={() => {
          const day = prompt('Day of week (0=Sunday, 1=Monday, ... 6=Saturday):');
          const start = prompt('Start time (HH:MM, 24h):');
          const end = prompt('End time (HH:MM, 24h):');
          if (day && start && end) {
            addAvailability({ dayOfWeek: parseInt(day), startTime: start, endTime: end });
          }
        }}>+ Add Time Slot</button>
        {availability.length === 0 ? <p className="empty-state">No availability slots yet.</p> :
          <div className="avail-list">
            {availability.map(slot => (
              <div key={slot._id} className="avail-item">
                Day {slot.dayOfWeek} · {slot.startTime} - {slot.endTime}
                <button className="btn-delete" onClick={() => deleteAvailability(slot._id)}>Delete</button>
              </div>
            ))}
          </div>}
      </section>
      <section className="dash-section">
        <h2>Pending Bookings ({bookings.length})</h2>
        {bookings.length === 0 ? <p className="empty-state">No pending bookings.</p> :
          <div className="bookings-list">
            {bookings.map(b => (
              <div key={b._id} className="booking-item">
                <div><strong>{b.service?.title || 'Service'}</strong> with {b.client?.name || 'Client'}</div>
                <div className="booking-time">{new Date(b.startTime).toLocaleString()} — ${b.totalPrice}</div>
                <button className="btn-confirm" onClick={() => confirmBooking(b._id)}>Confirm</button>
              </div>
            ))}
          </div>}
      </section>
    </div>
  );
};

export default ProviderDashboard;