import type { ScanInput, ScanResult } from '../types/scan.js';

const highRiskSignals = ['password', 'verify account', 'urgent', 'bank', 'paypal', 'invoice', 'login', 'wallet'];

export function analyzeRisk(input: ScanInput): ScanResult {
  const normalized = `${input.content ?? ''} ${input.url ?? ''}`.toLowerCase();
  const matchedSignals = highRiskSignals.filter((signal) => normalized.includes(signal));
  const score = Math.min(95, 20 + matchedSignals.length * 15 + (input.url?.includes('http://') ? 20 : 0));

  return {
    score,
    verdict: score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low',
    reasons: matchedSignals.length
      ? matchedSignals.map((signal) => `Suspicious ${signal} language or context detected.`)
      : ['No obvious high-risk phishing keywords were detected in the starter rules engine.'],
    recommendation: score >= 70
      ? 'Do not open the link or share personal information. Verify through the official website or app.'
      : 'Proceed carefully and verify the sender before taking action.'
  };
}
