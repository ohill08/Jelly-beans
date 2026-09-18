import type { DayEntry } from '../lib/types';
import { computeStats } from '../lib/stats';

interface Props {
  entries: DayEntry[];
}

export default function StatsPanel({ entries }: Props) {
  const stats = computeStats(entries);
  const recent = entries.slice(-14);

  return (
    <div className="stats-panel">
      <div className="stats-grid">
        <div className="stat">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">days logged</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.currentStreak}</span>
          <span className="stat-label">current streak</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.bestStreak}</span>
          <span className="stat-label">best streak</span>
        </div>
      </div>

      <div className="bean-counts">
        <span className="count-pill count-gold">{stats.counts.gold} gold</span>
        <span className="count-pill count-green">{stats.counts.green} green</span>
        <span className="count-pill count-red">{stats.counts.red} red</span>
      </div>

      {recent.length > 0 && (
        <div className="recent-strip">
          <span className="recent-strip-label">Last {recent.length} days</span>
          <div className="recent-dots">
            {recent.map((e) => (
              <span key={e.date} className={`dot dot-${e.bean}`} title={`${e.date}: ${e.bean}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
