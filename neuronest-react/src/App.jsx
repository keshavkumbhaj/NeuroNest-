import { useEffect, useState } from 'react';
import Topbar from './components/Topbar.jsx';
import Hero from './components/Hero.jsx';
import ProgressOverview from './components/ProgressOverview.jsx';
import HabitsList from './components/HabitsList.jsx';
import HabitModal from './components/HabitModal.jsx';
import ReflectionCard from './components/ReflectionCard.jsx';
import AICoachCard from './components/AICoachCard.jsx';
import WeeklyChart from './components/WeeklyChart.jsx';
import {
  fetchHabits,
  createHabit,
  deleteHabit,
  toggleHabitCompletion,
  fetchProgress,
  fetchReflection,
  saveReflection,
} from './api.js';
import { buildMockHistory } from './data/mockData.js';
import { calculateStreak } from './utils/habitUtils.js';

function App() {
  const [habits, setHabits] = useState([]);
  const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const [reflection, setReflection] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);

  // The Weekly Chart and streak still run on mock data — there's no
  // /api/history endpoint yet, so this stays static for now rather than
  // being wired to anything real.
  const [history] = useState(buildMockHistory);
  const streak = calculateStreak(history);

  // Load real data from the Flask API once, when the app first mounts.
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [habitsData, progressData, reflectionData] = await Promise.all([
          fetchHabits(),
          fetchProgress(),
          fetchReflection(),
        ]);
        setHabits(habitsData);
        setProgress(progressData);
        setReflection(reflectionData.content);
      } catch (error) {
        console.error('Failed to load initial data from the API:', error);
      }
    }

    loadInitialData();
  }, []);

  // After any change that affects completion state, re-fetch both the
  // habit list and the progress totals so the UI reflects what the
  // server actually has (rather than guessing the new numbers locally).
  async function refreshHabitsAndProgress() {
    try {
      const [habitsData, progressData] = await Promise.all([
        fetchHabits(),
        fetchProgress(),
      ]);
      setHabits(habitsData);
      setProgress(progressData);
    } catch (error) {
      console.error('Failed to refresh habits/progress:', error);
    }
  }

  async function handleToggleHabit(id) {
    try {
      await toggleHabitCompletion(id);
      await refreshHabitsAndProgress();
    } catch (error) {
      console.error('Failed to toggle habit completion:', error);
    }
  }

  async function handleDeleteHabit(id) {
    try {
      await deleteHabit(id);
      await refreshHabitsAndProgress();
    } catch (error) {
      console.error('Failed to delete habit:', error);
    }
  }

  async function handleAddHabit({ name, category, icon }) {
    try {
      await createHabit({ name, category, icon });
      await refreshHabitsAndProgress();
    } catch (error) {
      console.error('Failed to create habit:', error);
    }
  }

  async function handleSaveReflection(content) {
    try {
      const data = await saveReflection(content);
      setReflection(data.content);
    } catch (error) {
      console.error('Failed to save reflection:', error);
    }
  }

  return (
    <div className="app-shell">
      <Topbar />

      <main className="content">
        <Hero />

        <section id="progress" className="dashboard-grid">
          <ProgressOverview
            completedCount={progress.completed}
            percentage={progress.percentage}
            streak={streak}
          />

          <HabitsList
            habits={habits}
            onToggle={handleToggleHabit}
            onDelete={handleDeleteHabit}
            onAddClick={() => setModalOpen(true)}
          />
        </section>

        <ReflectionCard value={reflection} onSave={handleSaveReflection} />

        <AICoachCard habits={habits} reflection={reflection} />

        <WeeklyChart history={history} totalHabitsToday={habits.length} />
      </main>

      <HabitModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddHabit}
        existingNames={habits.map((h) => h.name)}
      />
    </div>
  );
}

export default App;
