import { buildWeeklyChartData } from '../utils/habitUtils.js';

function WeeklyChart({ history, totalHabitsToday }) {
  const days = buildWeeklyChartData(history, totalHabitsToday);
  const srText = days.map((d) => d.srText).join('. ');

  return (
    <section className="card weekly-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">This week</p>
          <h2>Weekly Progress</h2>
        </div>
      </div>

      <div className="chart-placeholder" role="img" aria-label="Weekly progress chart">
        {days.map((day) => (
          <div key={day.key} className={`bar-col${day.isToday ? ' is-today' : ''}`}>
            <div className="bar" style={{ height: `${day.heightPct}%` }} />
            <span className="bar-label" aria-hidden="true">{day.label}</span>
          </div>
        ))}
      </div>
      <p className="sr-only">{srText}</p>
    </section>
  );
}

export default WeeklyChart;
