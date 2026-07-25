export type ScanInputType = 'email' | 'sms' | 'url' | 'qr' | 'screenshot';

export interface ScanInput {
  type: ScanInputType;
  content?: string;
  url?: string;
}

export interface ScanResult {
  score: number;
  verdict: 'low' | 'medium' | 'high';
  reasons: string[];
  recommendation: string;
}
