// Mock data used until the Flask API is wired up.
// Shapes here intentionally mirror what /api/habits and /api/history
// will eventually return, so swapping in real fetch() calls later is
// a small change, not a rewrite.

export const mockHabits = [
  { id: 1, name: 'Morning Meditation', category: 'Mindfulness', icon: '🧘', completed: true },
  { id: 2, name: 'Read 20 Pages', category: 'Learning', icon: '📖', completed: false },
  { id: 3, name: '30-Minute Walk', category: 'Movement', icon: '🚶', completed: false },
];

export const mockReflection = 'I stayed present and focused today.';

// Builds a mock 7-day completion history ending today, so the weekly
// chart has believable data regardless of what day the app is run.
// Real usage: { 'YYYY-MM-DD': completedCount }
export function buildMockHistory() {
  const sampleCounts = [1, 2, 3, 2, 3, 1, 2]; // oldest -> today
  const history = {};
  const today = new Date();

  sampleCounts.forEach((count, index) => {
    const daysAgo = sampleCounts.length - 1 - index;
    const d = new Date(today);
    d.setDate(today.getDate() - daysAgo);
    const key = d.toISOString().slice(0, 10);
    history[key] = count;
  });

  return history;
}
