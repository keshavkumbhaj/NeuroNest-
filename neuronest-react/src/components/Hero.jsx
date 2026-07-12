import { useEffect, useState } from 'react';
import { formatLongDate } from '../utils/habitUtils.js';

function Hero() {
  const [todayLabel, setTodayLabel] = useState('');

  useEffect(() => {
    setTodayLabel(formatLongDate(new Date()));
  }, []);

  return (
    <section className="hero card">
      <div>
        <p className="eyebrow">Your calm, intelligent productivity space</p>
        <h1>Welcome back, Keshav.</h1>
        <p className="hero-copy">
          Small steps compound beautifully. Keep building the habits that
          shape your future.
        </p>
      </div>

      <div className="hero-meta">
        <p className="quote">"Consistency beats intensity."</p>
        <p className="date-pill">{todayLabel}</p>
      </div>
    </section>
  );
}

export default Hero;
