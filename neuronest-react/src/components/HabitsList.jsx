import { useState } from "react";
import HabitCard from "./HabitCard.jsx";

function HabitsList({ habits, onToggle, onDelete, onAddClick }) {
  const hasHabits = habits.length > 0;
  const [selectedCategory, setSelectedCategory] = useState("All");
  const categories = [
    "All",
    ...new Set(habits.map((habit) => habit.category)),
  ];
  const filteredHabits =
    selectedCategory === "All"
      ? habits
      : habits.filter(
        (habit) => habit.category === selectedCategory
      );

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
      <div className="filter-bar">
        {categories.map((category) => (
          <button
            key={category}
            className={
              selectedCategory === category
                ? "filter-btn active"
                : "filter-btn"
            }
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="habit-list" aria-live="polite">
        {filteredHabits.map((habit) => (
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
