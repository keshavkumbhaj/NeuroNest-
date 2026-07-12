import { useState } from 'react';
import { generateCoachAdvice } from '../api.js';

function AICoachCard({ habits, reflection }) {
  const [message, setMessage] = useState(
    'Click "Generate Advice" to receive personalized AI feedback.'
  );
  const [isLoading, setIsLoading] = useState(false);

  async function handleGenerateAdvice() {
    setIsLoading(true);
    setMessage('Thinking about your day…');

    try {
      // POST /api/coach expects { reflection, habits: [{ name, completed }] }
      const data = await generateCoachAdvice({
        reflection,
        habits: habits.map((h) => ({ name: h.name, completed: h.completed })),
      });
      setMessage(data.advice);
    } catch (error) {
      console.error('Failed to generate coach advice:', error);
      setMessage('Could not generate advice right now. Please try again in a moment.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section id="coach" className="card ai-card">
      <div className="ai-card__content">
        <div className="ai-icon" aria-hidden="true">🤖</div>
        <div>
          <p className="eyebrow">Personalized guidance</p>
          <h2>AI Coach</h2>
          <p>{message}</p>
        </div>
      </div>
      <button className="primary-btn" onClick={handleGenerateAdvice} disabled={isLoading}>
        {isLoading ? 'Generating…' : 'Generate Advice'}
      </button>
    </section>
  );
}

export default AICoachCard;
