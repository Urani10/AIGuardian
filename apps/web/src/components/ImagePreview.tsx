import React from 'react';
import { Trash2, RefreshCw, Eye, Sparkles, FileImage } from 'lucide-react';

export interface ImagePreviewProps {
  imageSrc: string;
  fileName: string;
  fileSizeFormatted?: string;
  dimensions?: string;
  isScanning: boolean;
  onRemove: () => void;
  onReplace: () => void;
  lang: 'sq' | 'en';
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageSrc,
  fileName,
  fileSizeFormatted,
  dimensions,
  isScanning,
  onRemove,
  onReplace,
  lang,
}) => {
  return (
    <div className="image-preview-container">
      <div className="image-preview-wrapper">
        <img src={imageSrc} alt="Screenshot Preview" className="image-preview-img" />

        {/* AI Visual Scanning Laser Beam Effect */}
        {isScanning && (
          <div className="scanner-laser-overlay">
            <div className="laser-beam" />
            <div className="scanner-grid-overlay" />
            <div className="scanner-status-text">
              <Sparkles size={16} className="spin" />
              <span>
                {lang === 'sq'
                  ? 'AI po kontrollon elementet vizuale dhe OCR...'
                  : 'AI is analyzing visual elements and OCR...'}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="image-preview-meta">
        <div className="image-preview-info">
          <FileImage size={18} style={{ color: 'var(--primary-blue)', flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div className="text-ellipsis font-bold" style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>
              {fileName || 'screenshot.png'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {fileSizeFormatted || '1.2 MB'} {dimensions ? `• ${dimensions}` : ''}
            </div>
          </div>
        </div>

        <div className="image-preview-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={onReplace}
            title={lang === 'sq' ? 'Ndërro Screenshot' : 'Replace Screenshot'}
          >
            <RefreshCw size={15} />
          </button>
          <button
            type="button"
            className="icon-btn danger"
            onClick={onRemove}
            title={lang === 'sq' ? 'Fshi Screenshot' : 'Remove Screenshot'}
          >
            <Trash2 size={15} style={{ color: 'var(--threat-red)' }} />
          </button>
        </div>
      </div>
    </div>
  );
};
