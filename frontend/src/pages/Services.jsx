import { useState, useEffect } from 'react';
import Header from '../components/Header';
import './Services.css';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (category) params.set('category', category);
      if (search) params.set('search', search);
      const res = await fetch(`api/services?${params}`);
      const data = await res.json();
      setServices(data.services || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, [page, category, search]);

  const categories = ['tutoring', 'consulting', 'design', 'writing', 'development', 'marketing', 'music', 'other'];

  return (
    <div className="services-page">
      <Header />
      <div className="services-header">
        <h1>Browse Services</h1>
        <div className="filters">
          <input type="text" placeholder="Search services..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="search-input" />
          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
          </select>
        </div>
      </div>
      {loading ? <div className="spinner-container"><div className="spinner" /></div> : (
        <>
          <div className="services-grid">
            {services.map(s => (
              <div key={s._id} className="service-card">
                {s.provider?.avatar && <img src={s.provider.avatar} alt="" className="service-avatar" />}
                <h3>{s.title}</h3>
                <p className="service-category">{s.category}</p>
                <p className="service-desc">{s.description.substring(0, 100)}...</p>
                <div className="service-meta">
                  <span className="service-price">${s.price}</span>
                  <span className="service-duration">{s.durationMinutes} min</span>
                </div>
                <a href={`/services/${s._id}`} className="btn-view">View Details</a>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Services;
