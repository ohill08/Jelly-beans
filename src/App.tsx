import { useMemo, useState } from 'react';
import CheckInForm from './components/CheckInForm';
import RewardReveal from './components/RewardReveal';
import JellyBeanJar from './components/JellyBeanJar';
import StatsPanel from './components/StatsPanel';
import { loadEntries, upsertEntry } from './lib/storage';
import { getPendingDates } from './lib/queue';
import { scoreDay } from './lib/scoring';
import type { BeanColor, DayAnswers, DayEntry } from './lib/types';
import './App.css';

type ViewState =
  | { mode: 'checkin'; date: string; position: number; total: number }
  | { mode: 'reveal'; date: string; bean: BeanColor; nextIsQueue: boolean }
  | { mode: 'jar' }
  | { mode: 'edit'; date: string; entry: DayEntry };

function App() {
  const [entries, setEntries] = useState<DayEntry[]>(() => loadEntries());
  const [editing, setEditing] = useState(false);
  const [justRevealed, setJustRevealed] = useState<string | null>(null);

  const pendingDates = useMemo(() => getPendingDates(entries), [entries]);

  const view: ViewState = useMemo(() => {
    if (editing) {
      const last = entries[entries.length - 1];
      if (last) return { mode: 'edit', date: last.date, entry: last };
    }
    if (pendingDates.length > 0) {
      return { mode: 'checkin', date: pendingDates[0], position: 1, total: pendingDates.length };
    }
    return { mode: 'jar' };
  }, [editing, entries, pendingDates]);

  const [reveal, setReveal] = useState<{ date: string; bean: BeanColor } | null>(null);

  const commitAnswers = (date: string, answers: DayAnswers) => {
    const bean = scoreDay(answers);
    const entry: DayEntry = { date, answers, bean, recordedAt: new Date().toISOString() };
    const next = upsertEntry(entries, entry);
    setEntries(next);
    setReveal({ date, bean });
    setEditing(false);
  };

  const handleContinueFromReveal = () => {
    setJustRevealed(reveal?.date ?? null);
    setReveal(null);
  };

  if (reveal) {
    const morePending = pendingDates.length > 0;
    return (
      <div className="app-shell">
        <RewardReveal
          bean={reveal.bean}
          continueLabel={morePending ? 'Next day' : 'See my jar'}
          onContinue={handleContinueFromReveal}
        />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>🫙 Habit Jar</h1>
        <p>Answer a few quick questions each morning and watch the jar fill up.</p>
      </header>

      {view.mode === 'checkin' && (
        <CheckInForm
          date={view.date}
          queuePosition={view.position}
          queueTotal={view.total}
          onSubmit={(answers) => commitAnswers(view.date, answers)}
        />
      )}

      {view.mode === 'edit' && (
        <CheckInForm
          date={view.date}
          queuePosition={1}
          queueTotal={1}
          isEdit
          initialAnswers={view.entry.answers}
          onSubmit={(answers) => commitAnswers(view.date, answers)}
        />
      )}

      {view.mode === 'jar' && (
        <>
          <JellyBeanJar entries={entries} justAddedDate={justRevealed} />
          <StatsPanel entries={entries} />
          {entries.length > 0 && (
            <button className="edit-link" onClick={() => setEditing(true)}>
              Fix my last entry ({entries[entries.length - 1].date})
            </button>
          )}
          <p className="scoring-note">
            Gold = every healthy box ticked · Green = at least half · Red = fewer than half.
            Come back tomorrow for your next jelly bean.
          </p>
        </>
      )}
    </div>
  );
}

export default App;
