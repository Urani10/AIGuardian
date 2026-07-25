export type ScanInputType = 'url' | 'website' | 'email' | 'email_text' | 'screenshot' | 'image' | 'pdf' | 'qr' | 'phone' | 'sms' | 'whatsapp' | 'social' | 'file' | 'text';
export type ThreatLevel = 'Safe' | 'Low Risk' | 'Medium Risk' | 'High Risk' | 'Critical';
export interface ScanInput { type: ScanInputType; content?: string; url?: string; fileName?: string; }
export interface ScanResult { id: string; score: number; threatLevel: ThreatLevel; confidence: number; explanation: string; indicators: string[]; reasons: string[]; recommendations: string[]; nextSteps: string[]; timeTakenMs: number; createdAt: string; type: ScanInputType; favorite: boolean; }
