// Small helper functions shared by a few components.
// These are ported directly from the original script.js logic.

export function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

export function formatLongDate(date) {
  return date.toLocaleDateString('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// Real streak: count consecutive days (ending today or yesterday) where
// at least one habit was completed.
export function calculateStreak(history) {
  let streak = 0;
  const cursor = new Date();

  const todayKey = dateKey(cursor);
  const todayHasProgress = (history[todayKey] || 0) > 0;
  if (!todayHasProgress) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (true) {
    const key = dateKey(cursor);
    if ((history[key] || 0) > 0) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// Builds the last 7 days of chart data (bar height %, label, sr text)
// from the history object and current habit count.
export function buildWeeklyChartData(history, totalHabitsToday) {
  const days = [];
  const cursor = new Date();
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(cursor);
    d.setDate(cursor.getDate() - i);
    days.push(d);
  }

  const safeTotal = totalHabitsToday || 1;
  const maxCount = Math.max(safeTotal, ...days.map((d) => history[dateKey(d)] || 0), 1);

  return days.map((d) => {
    const key = dateKey(d);
    const count = history[key] || 0;
    const heightPct = Math.max(Math.round((count / maxCount) * 100), count > 0 ? 8 : 3);
    const isToday = key === dateKey(new Date());
    const label = d.toLocaleDateString('en', { weekday: 'short' }).slice(0, 2);
    const srText = `${d.toLocaleDateString('en', { weekday: 'long' })}: ${count} completed`;

    return { key, count, heightPct, isToday, label, srText };
  });
}
