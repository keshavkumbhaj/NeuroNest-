import { useEffect, useRef, useState } from 'react';

function HabitModal({ isOpen, onClose, onSubmit, existingNames }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [icon, setIcon] = useState('');
  const [error, setError] = useState('');

  const modalRef = useRef(null);
  const nameInputRef = useRef(null);
  const lastFocusedElement = useRef(null);

  // Reset the form and move focus into the dialog every time it opens.
  useEffect(() => {
    if (!isOpen) return;

    lastFocusedElement.current = document.activeElement;
    setName('');
    setCategory('');
    setIcon('');
    setError('');

    // Focus the first field after the dialog has rendered.
    const timer = setTimeout(() => nameInputRef.current?.focus(), 0);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Escape-to-close and Tab focus trap, same as the original vanilla JS.
  useEffect(() => {
    if (!isOpen) return;

    function handleKeydown(event) {
      if (event.key === 'Escape') {
        handleClose();
        return;
      }

      if (event.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
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

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function handleClose() {
    onClose();
    lastFocusedElement.current?.focus();
  }

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Give your habit a name to continue.');
      nameInputRef.current?.focus();
      return;
    }

    if (existingNames.some((n) => n.toLowerCase() === trimmedName.toLowerCase())) {
      setError('You already have a habit with that name.');
      nameInputRef.current?.focus();
      return;
    }

    onSubmit({
      name: trimmedName,
      category: category.trim(),
      icon: icon.trim(),
    });
    handleClose();
  }

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <div
        ref={modalRef}
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="habitModalTitle"
      >
        <div className="modal-header">
          <h2 id="habitModalTitle">New habit</h2>
          <button className="icon-btn" aria-label="Close dialog" onClick={handleClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="habitNameInput">Habit name</label>
            <input
              id="habitNameInput"
              ref={nameInputRef}
              type="text"
              maxLength={40}
              placeholder="e.g. Drink water"
              autoComplete="off"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="habitCategoryInput">Category</label>
            <input
              id="habitCategoryInput"
              type="text"
              maxLength={24}
              placeholder="e.g. Wellbeing"
              autoComplete="off"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="habitIconInput">Icon</label>
            <input
              id="habitIconInput"
              type="text"
              maxLength={2}
              placeholder="✨"
              autoComplete="off"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
            />
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              Add habit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default HabitModal;
