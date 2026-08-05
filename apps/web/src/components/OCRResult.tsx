import React, { useState } from 'react';
import { FileText, Copy, Check, Sparkles, Search } from 'lucide-react';

export interface OCRResultProps {
  extractedText: string;
  lang: 'sq' | 'en';
  aiDetectionNoteSq?: string;
  aiDetectionNoteEn?: string;
}

export const OCRResult: React.FC<OCRResultProps> = ({
  extractedText,
  lang,
  aiDetectionNoteSq,
  aiDetectionNoteEn,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = extractedText.trim() ? extractedText.trim().split(/\s+/).length : 0;
  const charCount = extractedText.length;

  return (
    <div className="glass-card ocr-result-card">
      <div className="ocr-header">
        <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
          <FileText size={18} style={{ color: 'var(--accent-cyan)' }} />
          {lang === 'sq' ? 'Teksti i Detektuar nga Screenshot (OCR Engine)' : 'Detected Text from Screenshot (OCR Engine)'}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {wordCount} {lang === 'sq' ? 'fjalë' : 'words'} • {charCount} {lang === 'sq' ? 'karaktere' : 'chars'}
          </span>
          <button
            type="button"
            className="icon-btn"
            onClick={handleCopy}
            title={lang === 'sq' ? 'Kopjo Tekstin' : 'Copy Text'}
            style={{ padding: 6, minWidth: 32, minHeight: 32 }}
          >
            {copied ? <Check size={14} style={{ color: 'var(--shield-green)' }} /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      <div className="ocr-text-box">
        <pre className="ocr-raw-text">{extractedText || (lang === 'sq' ? 'Nuk u detektua asnjë tekst.' : 'No text detected.')}</pre>
      </div>

      {(aiDetectionNoteSq || aiDetectionNoteEn) && (
        <div className="ocr-ai-badge">
          <Sparkles size={14} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.83rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>
            <strong>AI Detection: </strong>
            {lang === 'sq' ? aiDetectionNoteSq : aiDetectionNoteEn}
          </span>
        </div>
      )}
    </div>
  );
};
