const STORAGE_KEYS = {
    habits: 'neuronest.habits',
    history: 'neuronest.history', // { 'YYYY-MM-DD': completedCount }
    reflection: 'neuronest.reflection',
};

const DEFAULT_HABITS = [
    { id: 1, name: 'Morning Meditation', category: 'Mindfulness', icon: '🧘', completed: true },
    { id: 2, name: 'Read 20 Pages', category: 'Learning', icon: '📖', completed: false },
    { id: 3, name: '30-Minute Walk', category: 'Movement', icon: '🚶', completed: false },
];

let habits = loadHabits();

const habitList = document.getElementById('habitList');
const habitEmptyState = document.getElementById('habitEmptyState');
const progressBarFill = document.getElementById('progressBarFill');
const progressBar = document.querySelector('.progress-bar');
const progressPercent = document.getElementById('progressPercent');
const progressRing = document.getElementById('progressRing');
const streakValue = document.getElementById('streakValue');
const completedValue = document.getElementById('completedValue');
const todayDate = document.getElementById('todayDate');
const coachBtn = document.getElementById('coachBtn');
const coachMessage = document.getElementById('coachMessage');
const addHabitBtn = document.getElementById('addHabitBtn');
const reflectionInput = document.getElementById('reflectionInput');
const reflectionStatus = document.getElementById('reflectionStatus');
const chartPlaceholder = document.getElementById('chartPlaceholder');
const chartSrText = document.getElementById('chartSrText');

const habitModalOverlay = document.getElementById('habitModalOverlay');
const habitForm = document.getElementById('habitForm');
const habitNameInput = document.getElementById('habitNameInput');
const habitCategoryInput = document.getElementById('habitCategoryInput');
const habitIconInput = document.getElementById('habitIconInput');
const habitFormError = document.getElementById('habitFormError');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalCancelBtn = document.getElementById('modalCancelBtn');

let lastFocusedElement = null;
let reflectionSaveTimer = null;

// ---------- Storage helpers ----------

function safeParse(json, fallback) {
    try {
        const parsed = JSON.parse(json);
        return parsed ?? fallback;
    } catch {
        return fallback;
    }
}

function loadHabits() {
    const raw = localStorage.getItem(STORAGE_KEYS.habits);
    if (!raw) return DEFAULT_HABITS.map((h) => ({ ...h }));
    return safeParse(raw, DEFAULT_HABITS.map((h) => ({ ...h })));
}

function saveHabits() {
    localStorage.setItem(STORAGE_KEYS.habits, JSON.stringify(habits));
}

function loadHistory() {
    const raw = localStorage.getItem(STORAGE_KEYS.history);
    return safeParse(raw, {});
}

function saveHistory(history) {
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
}

function dateKey(date) {
    return date.toISOString().slice(0, 10);
}

// Record today's completed count into history, keyed by date.
function recordTodayHistory() {
    const history = loadHistory();
    const key = dateKey(new Date());
    const completedCount = habits.filter((h) => h.completed).length;
    history[key] = completedCount > 0 ? completedCount : 0;
    if (completedCount === 0) {
        // still record a zero entry so streak breaks are visible, but avoid
        // clobbering a day with no habits at all
        if (habits.length === 0) delete history[key];
    }
    saveHistory(history);
    return history;
}

// Real streak: count consecutive days (ending today or yesterday) where
// at least one habit was completed.
function calculateStreak(history) {
    let streak = 0;
    const cursor = new Date();

    // If today has no completions yet, streak counts from yesterday backward,
    // but doesn't break just because today isn't done yet.
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

// ---------- Rendering ----------

function formatDate() {
    const now = new Date();
    todayDate.textContent = now.toLocaleDateString('en', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

function updateProgress() {
    const completedCount = habits.filter((habit) => habit.completed).length;
    const totalCount = habits.length;
    const percentage = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;
    const degrees = (percentage / 100) * 360;

    progressRing.style.background = `
    conic-gradient(
      var(--accent) 0deg,
      var(--accent-2) ${degrees}deg,
      #e7ecff ${degrees}deg
    )
  `;
    progressRing.setAttribute('aria-label', `${percentage} percent of today's habits complete`);

    progressBarFill.style.width = `${percentage}%`;
    progressBar.setAttribute('aria-valuenow', String(percentage));
    progressPercent.textContent = `${percentage}%`;
    completedValue.textContent = `${completedCount}`;

    const history = recordTodayHistory();
    streakValue.textContent = String(calculateStreak(history));

    renderChart(history);
}

function renderHabits() {
    if (!habitList) return;

    habitList.innerHTML = '';

    const hasHabits = habits.length > 0;
    habitEmptyState.hidden = hasHabits;

    habits.forEach((habit) => {
        const card = document.createElement('article');
        card.className = `habit-card ${habit.completed ? 'is-complete' : ''}`;

        const completeLabel = habit.completed
            ? `Mark ${habit.name} as not complete`
            : `Mark ${habit.name} as complete`;

        card.innerHTML = `
      <div class="habit-main">
        <div class="habit-icon" aria-hidden="true">${escapeHtml(habit.icon)}</div>
        <div class="habit-meta">
          <strong>${escapeHtml(habit.name)}</strong>
          <span>${escapeHtml(habit.category)}</span>
        </div>
      </div>
      <div class="habit-actions">
        <button class="primary-btn complete-btn" data-id="${habit.id}" aria-pressed="${habit.completed}" aria-label="${escapeHtml(completeLabel)}">
          ${habit.completed ? 'Completed' : 'Mark Complete'}
        </button>
        <button class="secondary-btn delete-btn" data-id="${habit.id}" aria-label="Delete ${escapeHtml(habit.name)}">Delete</button>
      </div>
    `;

        habitList.appendChild(card);
    });

    updateProgress();
}

function renderChart(history) {
    if (!chartPlaceholder) return;

    const days = [];
    const cursor = new Date();
    for (let i = 6; i >= 0; i -= 1) {
        const d = new Date(cursor);
        d.setDate(cursor.getDate() - i);
        days.push(d);
    }

    const totalHabitsToday = habits.length || 1;
    const maxCount = Math.max(totalHabitsToday, ...days.map((d) => history[dateKey(d)] || 0), 1);

    chartPlaceholder.innerHTML = '';
    const srParts = [];

    days.forEach((d) => {
        const key = dateKey(d);
        const count = history[key] || 0;
        const heightPct = Math.max(Math.round((count / maxCount) * 100), count > 0 ? 8 : 3);
        const isToday = key === dateKey(new Date());
        const label = d.toLocaleDateString('en', { weekday: 'short' }).slice(0, 2);

        const col = document.createElement('div');
        col.className = `bar-col${isToday ? ' is-today' : ''}`;
        col.innerHTML = `
      <div class="bar" style="height: ${heightPct}%"></div>
      <span class="bar-label" aria-hidden="true">${label}</span>
    `;
        chartPlaceholder.appendChild(col);

        srParts.push(`${d.toLocaleDateString('en', { weekday: 'long' })}: ${count} completed`);
    });

    chartSrText.textContent = srParts.join('. ');
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
}

// ---------- Habit actions ----------

function toggleHabit(id) {
    const habit = habits.find((item) => item.id === id);
    if (habit) {
        habit.completed = !habit.completed;
        saveHabits();
        renderHabits();
    }
}

function deleteHabit(id) {
    const index = habits.findIndex((habit) => habit.id === id);
    if (index !== -1) {
        habits.splice(index, 1);
        saveHabits();
        renderHabits();
    }
}

function addHabit({ name, category, icon }) {
    habits.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        name,
        category: category || 'Wellbeing',
        icon: icon || '✨',
        completed: false,
    });
    saveHabits();
    renderHabits();
}

// ---------- Modal ----------

function openHabitModal() {
    lastFocusedElement = document.activeElement;
    habitForm.reset();
    habitFormError.hidden = true;
    habitModalOverlay.hidden = false;
    document.addEventListener('keydown', handleModalKeydown);
    habitNameInput.focus();
}

function closeHabitModal() {
    habitModalOverlay.hidden = true;
    document.removeEventListener('keydown', handleModalKeydown);
    if (lastFocusedElement) lastFocusedElement.focus();
}

function handleModalKeydown(event) {
    if (event.key === 'Escape') {
        closeHabitModal();
        return;
    }
    if (event.key === 'Tab') {
        const focusable = habitModalOverlay.querySelectorAll(
            'button, input, [href], select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }
}

function handleHabitFormSubmit(event) {
    event.preventDefault();

    const name = habitNameInput.value.trim();
    const category = habitCategoryInput.value.trim();
    const icon = habitIconInput.value.trim();

    if (!name) {
        habitFormError.textContent = 'Give your habit a name to continue.';
        habitFormError.hidden = false;
        habitNameInput.focus();
        return;
    }

    if (habits.some((h) => h.name.toLowerCase() === name.toLowerCase())) {
        habitFormError.textContent = 'You already have a habit with that name.';
        habitFormError.hidden = false;
        habitNameInput.focus();
        return;
    }

    addHabit({ name, category, icon });
    closeHabitModal();
}

// ---------- AI coach ----------

function generateAdvice() {
    const completedCount = habits.filter((habit) => habit.completed).length;
    const pendingCount = habits.length - completedCount;

    if (habits.length === 0) {
        coachMessage.textContent = 'Add a habit to get personalized guidance for your day.';
        return;
    }

    if (pendingCount === 0) {
        coachMessage.textContent = 'You are in a strong rhythm. Keep your focus on gratitude and recovery today.';
        return;
    }

    coachMessage.textContent = `You have ${pendingCount} habit${pendingCount > 1 ? 's' : ''} left today. A calm, 10-minute reset could help you finish them with ease.`;
}

// ---------- Reflection autosave ----------

function loadReflection() {
    return localStorage.getItem(STORAGE_KEYS.reflection);
}

function saveReflection(value) {
    localStorage.setItem(STORAGE_KEYS.reflection, value);
    reflectionStatus.textContent = 'Saved';
    clearTimeout(reflectionSaveTimer);
    reflectionSaveTimer = setTimeout(() => {
        reflectionStatus.textContent = '';
    }, 1500);
}

function handleReflectionInput() {
    clearTimeout(reflectionSaveTimer);
    reflectionStatus.textContent = 'Saving…';
    reflectionSaveTimer = setTimeout(() => {
        saveReflection(reflectionInput.value);
    }, 600);
}

// ---------- Event wiring ----------

habitList.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    const id = Number(button.dataset.id);
    if (button.classList.contains('complete-btn')) {
        toggleHabit(id);
    }

    if (button.classList.contains('delete-btn')) {
        deleteHabit(id);
    }
});

addHabitBtn.addEventListener('click', openHabitModal);
modalCloseBtn.addEventListener('click', closeHabitModal);
modalCancelBtn.addEventListener('click', closeHabitModal);
habitModalOverlay.addEventListener('click', (event) => {
    if (event.target === habitModalOverlay) closeHabitModal();
});
habitForm.addEventListener('submit', handleHabitFormSubmit);

coachBtn.addEventListener('click', generateAdvice);
reflectionInput.addEventListener('input', handleReflectionInput);

// ---------- Init ----------

formatDate();
renderHabits();

const savedReflection = loadReflection();
reflectionInput.value = savedReflection !== null ? savedReflection : 'I stayed present and focused today.';
