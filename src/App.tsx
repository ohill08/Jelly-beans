import { useEffect, useMemo, useState } from 'react';
import CheckInForm from './components/CheckInForm';
import ReadyScreen from './components/ReadyScreen';
import RewardReveal from './components/RewardReveal';
import JellyBeanJar from './components/JellyBeanJar';
import StatsPanel from './components/StatsPanel';
import { loadEntries, upsertEntry } from './lib/storage';
import { getPendingDates } from './lib/queue';
import { scoreDay } from './lib/scoring';
import { computeFitness, hasRecentExercise } from './lib/avatar';
import { computeGarden } from './lib/garden';
import { computeWeeklyBeanColor, rgbString } from './lib/theme';
import type { BeanColor, DayAnswers, DayEntry } from './lib/types';
import './App.css';

type ViewState =
  | { mode: 'ready'; pendingCount: number }
  | { mode: 'checkin'; date: string; position: number; total: number }
  | { mode: 'jar' }
  | { mode: 'edit'; date: string; entry: DayEntry };

function App() {
  const [entries, setEntries] = useState<DayEntry[]>(() => loadEntries());
  const [editing, setEditing] = useState(false);
  const [justRevealed, setJustRevealed] = useState<string | null>(null);
  // Gates the check-in queue behind the avatar's "ready to log?" screen —
  // asked once per batch, not once per catch-up day.
  const [readyToLog, setReadyToLog] = useState(false);

  const pendingDates = useMemo(() => getPendingDates(entries), [entries]);

  const view: ViewState = useMemo(() => {
    if (editing) {
      const last = entries[entries.length - 1];
      if (last) return { mode: 'edit', date: last.date, entry: last };
    }
    if (pendingDates.length > 0) {
      if (!readyToLog) return { mode: 'ready', pendingCount: pendingDates.length };
      return { mode: 'checkin', date: pendingDates[0], position: 1, total: pendingDates.length };
    }
    return { mode: 'jar' };
  }, [editing, entries, pendingDates, readyToLog]);

  const [reveal, setReveal] = useState<{ date: string; bean: BeanColor } | null>(null);

  // While editing the most recent entry, base the coach's look on the run-up to it,
  // not the entry currently being changed.
  const fitness = useMemo(
    () => computeFitness(view.mode === 'edit' ? entries.slice(0, -1) : entries),
    [entries, view.mode],
  );
  const garden = useMemo(
    () => computeGarden(view.mode === 'edit' ? entries.slice(0, -1) : entries),
    [entries, view.mode],
  );
  const exercisedRecently = useMemo(
    () => hasRecentExercise(view.mode === 'edit' ? entries.slice(0, -1) : entries),
    [entries, view.mode],
  );

  // Most recently logged weight, if the user has ever bothered to log one.
  const latestWeightKg = useMemo(() => {
    for (let i = entries.length - 1; i >= 0; i--) {
      if (entries[i].weightKg !== undefined) return entries[i].weightKg;
    }
    return undefined;
  }, [entries]);

  // Tint the page background with a blend of the last 7 days' jelly beans.
  useEffect(() => {
    const color = computeWeeklyBeanColor(entries);
    const root = document.documentElement.style;
    if (color) {
      root.setProperty('--week-tint', rgbString(color));
    } else {
      root.removeProperty('--week-tint');
    }
  }, [entries]);

  const commitAnswers = (date: string, answers: DayAnswers, weightKg?: number) => {
    const bean = scoreDay(answers);
    const entry: DayEntry = { date, answers, bean, recordedAt: new Date().toISOString(), weightKg };
    const next = upsertEntry(entries, entry);
    setEntries(next);
    setReveal({ date, bean });
    setEditing(false);
  };

  const handleContinueFromReveal = () => {
    setJustRevealed(reveal?.date ?? null);
    setReveal(null);
    // Batch fully logged — re-arm the gate so a future pending day asks again.
    if (pendingDates.length === 0) setReadyToLog(false);
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

  // The very first thing the user sees for a pending check-in is the coach
  // avatar alone, asking if they're ready — no header, no jar, nothing else.
  if (view.mode === 'ready') {
    return (
      <div className="app-shell">
        <ReadyScreen
          fitness={fitness}
          exercisedRecently={exercisedRecently}
          garden={garden}
          pendingCount={view.pendingCount}
          latestWeightKg={latestWeightKg}
          onReady={() => setReadyToLog(true)}
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
          fitness={fitness}
          exercisedRecently={exercisedRecently}
          onSubmit={(answers, weightKg) => commitAnswers(view.date, answers, weightKg)}
        />
      )}

      {view.mode === 'edit' && (
        <CheckInForm
          date={view.date}
          queuePosition={1}
          queueTotal={1}
          isEdit
          fitness={fitness}
          exercisedRecently={exercisedRecently}
          initialAnswers={view.entry.answers}
          initialWeightKg={view.entry.weightKg}
          onSubmit={(answers, weightKg) => commitAnswers(view.date, answers, weightKg)}
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
            Green needs ate healthily, no alcohol &amp; 10,000 steps — no exceptions. Gold adds exercise &amp; HRV
            above 65 on top. Anything less is red — unless you were sick, which is always white and doesn't
            affect your coach, streak, or background. Come back tomorrow for your next jelly bean.
          </p>
          <p className="scoring-note">The page background blends your last 7 days of beans.</p>
        </>
      )}
    </div>
  );
}

export default App;
