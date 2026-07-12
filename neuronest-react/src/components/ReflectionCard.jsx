import { useEffect, useRef, useState } from 'react';

function ReflectionCard({ value, onSave }) {
  const [draft, setDraft] = useState(value);
  const [status, setStatus] = useState('');

  const debounceTimer = useRef(null);
  const statusTimer = useRef(null);

  // True while the user has typed something that hasn't finished saving
  // yet. This stops the sync effect below from overwriting their in-progress
  // edit if `value` happens to update from the API while they're still typing.
  const isDirtyRef = useRef(false);

  // `value` starts empty and is only filled in once GET /api/reflection
  // resolves in App.jsx. This keeps the textarea's local draft in sync
  // with that — but only when the user isn't actively mid-edit.
  useEffect(() => {
    if (!isDirtyRef.current) {
      setDraft(value);
    }
  }, [value]);

  function handleChange(event) {
    const newValue = event.target.value;
    setDraft(newValue);
    setStatus('Saving…');
    isDirtyRef.current = true;

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      // onSave calls POST /api/reflection (wired up in App.jsx).
      await onSave(newValue);
      isDirtyRef.current = false;
      setStatus('Saved');

      clearTimeout(statusTimer.current);
      statusTimer.current = setTimeout(() => setStatus(''), 1500);
    }, 600);
  }

  // Clean up any pending timers if the component unmounts.
  useEffect(() => {
    return () => {
      clearTimeout(debounceTimer.current);
      clearTimeout(statusTimer.current);
    };
  }, []);

  return (
    <section className="card reflection-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Mindful check-in</p>
          <h2>Reflection</h2>
        </div>
        <span className="save-status" aria-live="polite">{status}</span>
      </div>

      <label className="sr-only" htmlFor="reflectionInput">Reflection input</label>
      <textarea
        id="reflectionInput"
        rows="6"
        maxLength={1000}
        placeholder="How did your day go today?"
        value={draft}
        onChange={handleChange}
      />
    </section>
  );
}

export default ReflectionCard;
