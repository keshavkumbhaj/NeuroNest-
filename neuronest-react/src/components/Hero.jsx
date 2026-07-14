import quotes from "../data/quotes";
import { useEffect, useState } from 'react';
import { formatLongDate } from '../utils/habitUtils.js';

function Hero() {
  const [todayLabel, setTodayLabel] = useState('');

  useEffect(() => {
    setTodayLabel(formatLongDate(new Date()));
  }, []);
  const day = new Date().getDate();
  const todaysQuote = quotes[day % quotes.length];

  return (
    <section className="hero card">
      <div>
        <p className="eyebrow">Your calm, intelligent productivity space</p>
        <h1>Welcome back! 👋</h1>
        <p className="hero-copy">
          Small steps compound beautifully. Keep building the habits that
          shape your future.
        </p>
      </div>

      <div className="hero-meta">
        <p className="quote">"{todaysQuote}"</p>
        <p className="date-pill">{todayLabel}</p>
      </div>
    </section>
  );
}

export default Hero;
