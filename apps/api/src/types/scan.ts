export type ScanInputType = 'url' | 'website' | 'email' | 'email_text' | 'screenshot' | 'image' | 'pdf' | 'qr' | 'phone' | 'sms' | 'whatsapp' | 'social' | 'file' | 'text';
export type ThreatLevel = 'Safe' | 'Low Risk' | 'Medium Risk' | 'High Risk' | 'Critical';
export type ThreatStatus = 'I Sigurt' | 'Suspekt' | 'Mashtrim i Konfirmuar';

export interface ScanInput { type: ScanInputType; content?: string; url?: string; fileName?: string; lang?: 'sq' | 'en'; }
export interface ScanResult {
  id: string;
  score: number;
  threatLevel: ThreatLevel;
  status: ThreatStatus;
  statusEn: string;
  confidence: number;
  explanation: string;
  explanationSq: string;
  indicators: string[];
  reasons: string[];
  reasonsSq: string[];
  recommendations: string[];
  recommendationSq: string;
  education: string;
  educationEn: string;
  nextSteps: string[];
  timeTakenMs: number;
  createdAt: string;
  type: ScanInputType;
  favorite: boolean;
}

