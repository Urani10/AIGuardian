import React, { useRef, useState } from 'react';
import { Upload, FileImage, ShieldAlert, Sparkles, Image as ImageIcon } from 'lucide-react';

export interface ScreenshotUploaderProps {
  onFileSelected: (file: File) => void;
  onError: (msg: string) => void;
  lang: 'sq' | 'en';
  isScanning?: boolean;
}

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const ScreenshotUploader: React.FC<ScreenshotUploaderProps> = ({
  onFileSelected,
  onError,
  lang,
  isScanning = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const validateAndProcessFile = (file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      const err =
        lang === 'sq'
          ? 'Ky format nuk mbështetet. Ju lutemi ngarkoni PNG, JPG ose WEBP.'
          : 'Format not supported. Please upload a PNG, JPG, or WEBP image.';
      onError(err);
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      const err =
        lang === 'sq'
          ? 'Screenshot-i është shumë i madh. Maksimumi i lejuar është 10MB.'
          : 'Screenshot file is too large. Maximum size is 10MB.';
      onError(err);
      return;
    }

    onFileSelected(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleClickBrowse = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
      e.target.value = '';
    }
  };

  return (
    <div className="screenshot-uploader-card">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <div
        className={`screenshot-dropzone ${isDragOver ? 'drag-over' : ''} ${isScanning ? 'scanning' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClickBrowse}
        role="button"
        tabIndex={0}
        aria-label="Upload Screenshot"
      >
        <div className="uploader-icon-glow">
          <ImageIcon size={38} className="uploader-icon" />
        </div>

        <div className="uploader-text-block">
          <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)', display: 'block', marginBottom: 4 }}>
            {lang === 'sq' ? 'Ngarko një Screenshot për Analizë me AI' : 'Upload a Screenshot for AI Analysis'}
          </strong>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12 }}>
            {lang === 'sq'
              ? 'Tërhiqni & lëshoni imazhin këtu ose klikoni për të kërkuar skadarin'
              : 'Drag & drop your image here or click to browse files'}
          </p>
          <div className="uploader-specs-pill">
            <span>PNG, JPG, WEBP</span> • <span>Deri në 10MB</span>
          </div>
        </div>

        <button type="button" className="btn-accent" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
          <Upload size={15} /> {lang === 'sq' ? 'Zgjidh Screenshot' : 'Select Screenshot'}
        </button>
      </div>
    </div>
  );
};
