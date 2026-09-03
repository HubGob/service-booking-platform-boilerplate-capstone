import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { Service } from '../types';
import './Home.css';

const Home = (): JSX.Element => {
  const [featured, setFeatured] = useState<Service[]>([]);
  useEffect(() => {
    fetch('api/services?limit=6')
      .then(res => res.json())
      .then(data => setFeatured(data.services || []))
      .catch(() => {});
  }, []);

  return (
    <div className="home">
      <Header />

      {/* Hero Section — converted to Tailwind */}
      <section className="hero bg-muted text-center py-16 px-4">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Find & Book Expert Services
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Browse talented providers, book a time slot, and pay securely.
        </p>
        <a
          href="/services"
          className="inline-block bg-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-accent-hover transition-colors"
        >
          Browse Services
        </a>
      </section>

      {/* Features Grid — converted to Tailwind */}
      <section className="features grid grid-cols-1 md:grid-cols-3 gap-8 py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center p-8 bg-card rounded-xl border border-border">
          <h3 className="text-accent mb-2">Browse by Category</h3>
          <p className="text-muted-foreground">Tutoring, consulting, design, development, and more.</p>
        </div>
        <div className="text-center p-8 bg-card rounded-xl border border-border">
          <h3 className="text-accent mb-2">Book a Slot</h3>
          <p className="text-muted-foreground">See provider availability and pick a time that works.</p>
        </div>
        <div className="text-center p-8 bg-card rounded-xl border border-border">
          <h3 className="text-accent mb-2">Secure Payments</h3>
          <p className="text-muted-foreground">Pay with Stripe — safe and simple.</p>
        </div>
      </section>

      {/* Featured Services — converted to Tailwind */}
      {featured.length > 0 && (
        <section className="featured-section py-16 px-4 max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Featured Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(s => (
              <a
                key={s._id}
                href={`/services/${s._id}`}
                className="block bg-card border border-border rounded-xl p-6 text-decoration-none hover:shadow-md transition-shadow"
              >
                {s.provider?.avatar && (
                  <img
                    src={s.provider.avatar}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover mb-4"
                  />
                )}
                <h3 className="font-semibold text-lg text-foreground mb-1">{s.title}</h3>
                <p className="text-muted-foreground text-sm capitalize mb-2">{s.category}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {s.description.substring(0, 80)}...
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-accent">${s.price}</span>
                  <span className="text-sm text-muted-foreground">{s.durationMinutes} min</span>
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
