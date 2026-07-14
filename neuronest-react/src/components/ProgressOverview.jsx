function ProgressOverview({ completedCount, percentage, streak }) {
  const degrees = (percentage / 100) * 360;

  const ringStyle = {
    background: `conic-gradient(
      var(--accent) 0deg,
      var(--accent-2) ${degrees}deg,
      #e7ecff ${degrees}deg
    )`,
  };

  const barFillStyle = { width: `${percentage}%` };

  return (
    <article className="card progress-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Today's momentum</p>
          <h2>Progress Overview</h2>
        </div>
      </div>

      <div
        className="progress-ring"
        style={ringStyle}
        role="img"
        aria-label={`${percentage} percent of today's habits complete`}
      >
        <div className="progress-ring__inner">
          <span aria-hidden="true">{percentage}%</span>
        </div>
      </div>

      <div className="progress-bar-wrap">
        <div
          className="progress-bar"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={percentage}
          aria-label="Today's habit completion"
        >
          <div className="progress-bar__fill" style={barFillStyle} />
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-box">
          <strong>1</strong>
          <span>Current streak</span>
        </div>
        <div className="stat-box">
          <strong>{completedCount}</strong>
          <span>Total completed</span>
        </div>
      </div>
    </article>
  );
}

export default ProgressOverview;
