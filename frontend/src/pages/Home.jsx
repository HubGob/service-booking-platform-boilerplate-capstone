import { useEffect, useState } from 'react';
import Header from '../components/Header';
import './Home.css';

const Home = () => {
  const [featured, setFeatured] = useState([]);
  useEffect(() => {
    fetch('api/services?limit=6')
      .then(res => res.json())
      .then(data => setFeatured(data.services || []))
      .catch(() => {});
  }, []);

  return (
    <div className="home">
      <Header />
      <section className="hero">
        <h1>Find & Book Expert Services</h1>
        <p>Browse talented providers, book a time slot, and pay securely.</p>
        <a href="/services" className="btn-hero">Browse Services</a>
      </section>
      <section className="features">
        <div className="feature"><h3>Browse by Category</h3><p>Tutoring, consulting, design, development, and more.</p></div>
        <div className="feature"><h3>Book a Slot</h3><p>See provider availability and pick a time that works.</p></div>
        <div className="feature"><h3>Secure Payments</h3><p>Pay with Stripe — safe and simple.</p></div>
      </section>
      {featured.length > 0 && (
        <section className="featured-section">
          <h2>Featured Services</h2>
          <div className="featured-grid">
            {featured.map(s => (
              <a key={s._id} href={`/services/${s._id}`} className="featured-card">
                {s.provider?.avatar && <img src={s.provider.avatar} alt="" className="featured-avatar" />}
                <h3>{s.title}</h3>
                <p className="featured-category">{s.category}</p>
                <p className="featured-desc">{s.description.substring(0, 80)}...</p>
                <div className="featured-meta">
                  <span className="featured-price">${s.price}</span>
                  <span className="featured-duration">{s.durationMinutes} min</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
