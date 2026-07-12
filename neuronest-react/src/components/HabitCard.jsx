function HabitCard({ habit, onToggle, onDelete }) {
  const completeLabel = habit.completed
    ? `Mark ${habit.name} as not complete`
    : `Mark ${habit.name} as complete`;

  return (
    <article className={`habit-card ${habit.completed ? 'is-complete' : ''}`}>
      <div className="habit-main">
        <div className="habit-icon" aria-hidden="true">{habit.icon}</div>
        <div className="habit-meta">
          <strong>{habit.name}</strong>
          <span>{habit.category}</span>
        </div>
      </div>

      <div className="habit-actions">
        <button
          className="primary-btn complete-btn"
          aria-pressed={habit.completed}
          aria-label={completeLabel}
          onClick={() => onToggle(habit.id)}
        >
          {habit.completed ? 'Completed' : 'Mark Complete'}
        </button>
        <button
          className="secondary-btn delete-btn"
          aria-label={`Delete ${habit.name}`}
          onClick={() => onDelete(habit.id)}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export default HabitCard;
