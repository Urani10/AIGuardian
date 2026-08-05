import React from 'react';
import { Shield, AlertTriangle, CheckCircle, BookOpen } from 'lucide-react';
import type { ScanResult } from '../App';

export interface ThreatAnalysisCardProps {
  result: ScanResult;
  lang: 'sq' | 'en';
}

export const ThreatAnalysisCard: React.FC<ThreatAnalysisCardProps> = ({ result, lang }) => {
  return (
    <div className="glass-card results-details">
      <div className="result-header">
        <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: 9 }}>
          <Shield size={20} style={{ color: 'var(--primary-blue)' }} />
          {lang === 'sq' ? 'Raporti i Analizës së Sigurisë' : 'Security Analysis Report'}
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 4 }}>
          ID: {result.id} · {new Date(result.createdAt).toLocaleString()}
        </p>
      </div>

      {/* Threat Indicators */}
      {result.indicators && result.indicators.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 12 }}>
          {result.indicators.map((ind, i) => (
            <span
              key={i}
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: 'var(--threat-red)',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              ⚠ {ind}
            </span>
          ))}
        </div>
      )}

      {/* Identified Reasons */}
      <div className="section-block" style={{ marginTop: 16 }}>
        <h3 style={{ color: 'var(--threat-orange)' }}>
          <AlertTriangle size={16} />
          {lang === 'sq' ? 'Arsyet e Detektuara të Rrezikut:' : 'Identified Threat Reasons:'}
        </h3>
        <ul className="reasons-list">
          {(lang === 'sq' ? result.reasonsSq : result.reasons).map((reason, idx) => (
            <li key={idx}>{reason}</li>
          ))}
        </ul>
      </div>

      {/* Recommendation */}
      <div className="section-block" style={{ borderLeft: '4px solid var(--threat-yellow)', marginTop: 16 }}>
        <h3 style={{ color: 'var(--threat-yellow)' }}>
          <CheckCircle size={16} />
          {lang === 'sq' ? 'Rekomandimi i Menjëhershëm i Sigurisë:' : 'Immediate Actionable Recommendation:'}
        </h3>
        <p style={{ fontWeight: 700, fontSize: '0.975rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
          {lang === 'sq' ? result.recommendationSq : result.recommendations[0]}
        </p>
      </div>

      {/* Educational Breakdown */}
      <div className="education-box" style={{ marginTop: 16 }}>
        <h3 style={{ color: 'var(--accent-cyan)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOpen size={16} />
          {lang === 'sq' ? 'Edukimi Teknologjik (Pse është mashtrim?):' : 'Educational Breakdown (Why is this a scam?):'}
        </h3>
        <p style={{ fontSize: '0.925rem', lineHeight: 1.7, color: 'var(--text-sub)' }}>
          {lang === 'sq' ? result.education : result.educationEn}
        </p>
      </div>
    </div>
  );
};
