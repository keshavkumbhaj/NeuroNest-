// api.js
// ------
// A small, centralized place for every fetch() call to the Flask backend.
// Every function here returns the parsed `data` from a successful response,
// and throws an Error (with the backend's message) on failure — so
// components can just `try { ... } catch (err) { ... }` without needing
// to know anything about response shapes or status codes.

// Change this if your Flask server runs somewhere other than localhost:5000.
const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

// Every route in routes.py returns { success, data } or { success, error }.
// This helper reads that shape once, so every function below stays short.
async function handleResponse(response) {
  const body = await response.json().catch(() => null);

  if (!response.ok || !body || body.success === false) {
    const message = body?.error || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return body.data;
}

// ---------------------------------------------------------------------
// Habits
// ---------------------------------------------------------------------

export async function fetchHabits() {
  const response = await fetch(`${API_BASE_URL}/habits`);
  return handleResponse(response);
}

export async function createHabit({ name, category, icon }) {
  const response = await fetch(`${API_BASE_URL}/habits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, category, icon }),
  });
  return handleResponse(response);
}

export async function deleteHabit(habitId) {
  const response = await fetch(`${API_BASE_URL}/habits/${habitId}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}

export async function toggleHabitCompletion(habitId) {
  const response = await fetch(`${API_BASE_URL}/habits/${habitId}/complete`, {
    method: 'POST',
  });
  return handleResponse(response);
}

// ---------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------

export async function fetchProgress() {
  const response = await fetch(`${API_BASE_URL}/progress`);
  return handleResponse(response);
}

// ---------------------------------------------------------------------
// Reflection
// ---------------------------------------------------------------------

export async function fetchReflection() {
  const response = await fetch(`${API_BASE_URL}/reflection`);
  return handleResponse(response);
}

export async function saveReflection(content) {
  const response = await fetch(`${API_BASE_URL}/reflection`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  return handleResponse(response);
}

// ---------------------------------------------------------------------
// AI Coach
// ---------------------------------------------------------------------

export async function generateCoachAdvice({ reflection, habits }) {
  const response = await fetch(`${API_BASE_URL}/coach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reflection, habits }),
  });
  return handleResponse(response);
}
