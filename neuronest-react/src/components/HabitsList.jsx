import HabitCard from './HabitCard.jsx';

function HabitsList({ habits, onToggle, onDelete, onAddClick }) {
  const hasHabits = habits.length > 0;

  return (
    <article className="card habits-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Daily rituals</p>
          <h2>Habits</h2>
        </div>
        <button
          className="ghost-btn"
          aria-haspopup="dialog"
          onClick={onAddClick}
        >
          + Add Habit
        </button>
      </div>

      <div className="habit-list" aria-live="polite">
        {habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        ))}
      </div>

      {!hasHabits && (
        <p className="empty-state">
          No habits yet. Add your first one to start building momentum.
        </p>
      )}
    </article>
  );
}

export default HabitsList;
