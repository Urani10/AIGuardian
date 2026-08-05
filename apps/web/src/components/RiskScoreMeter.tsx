import React from 'react';

export interface RiskScoreMeterProps {
  score: number;
  threatLevel: string;
  statusSq: string;
  statusEn: string;
  confidence: number;
  timeTakenMs: number;
  lang: 'sq' | 'en';
}

export const RiskScoreMeter: React.FC<RiskScoreMeterProps> = ({
  score,
  statusSq,
  statusEn,
  confidence,
  timeTakenMs,
  lang,
}) => {
  const getScoreColor = (s: number) =>
    s >= 70 ? 'var(--threat-red)' : s >= 30 ? 'var(--threat-yellow)' : 'var(--shield-green)';

  const getStatusClass = (s: number) =>
    s >= 70 ? 'status-scam' : s >= 30 ? 'status-suspect' : 'status-safe';

  return (
    <div className="glass-card gauge-panel">
      <div className="risk-circle" aria-label={`Risk score: ${score}%`}>
        <svg width="170" height="170" viewBox="0 0 170 170">
          <circle className="risk-circle-bg" cx="85" cy="85" r="71" />
          <circle
            className="risk-circle-val"
            cx="85"
            cy="85"
            r="71"
            stroke={getScoreColor(score)}
            strokeDasharray={446}
            strokeDashoffset={446 - (446 * score) / 100}
          />
        </svg>
        <div className="risk-score-num">
          <span style={{ color: getScoreColor(score) }}>{score}%</span>
          <small style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {lang === 'sq' ? 'Niveli i Rrezikut' : 'Risk Score'}
          </small>
        </div>
      </div>

      <div className={`status-badge ${getStatusClass(score)}`}>
        {lang === 'sq' ? statusSq : statusEn}
      </div>

      <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
        <div>
          🎯 {lang === 'sq' ? 'Besueshmëria e AI' : 'AI Confidence'}:{' '}
          <strong style={{ color: 'var(--text-main)' }}>{confidence}%</strong>
        </div>
        <div>
          ⏱️ {lang === 'sq' ? 'Koha e ekzekutimit' : 'Execution time'}:{' '}
          <strong style={{ color: 'var(--text-main)' }}>{timeTakenMs}ms</strong>
        </div>
      </div>
    </div>
  );
};
