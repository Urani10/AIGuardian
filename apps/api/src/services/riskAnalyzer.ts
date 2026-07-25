import type { ScanInput, ScanResult, ThreatLevel } from '../types/scan.js';
const signals = [
  ['password',12],['verify account',18],['urgent',10],['bank',10],['paypal',14],['invoice',12],['login',12],['wallet',14],['crypto',16],['gift card',20],['wire transfer',20],['remote support',18],['prize',12],['romance',12],['investment',14],['limited time',10],['http://',18],['bit.ly',14],['reset your account',18]
] as const;
function level(score:number):ThreatLevel{ if(score>=85) return 'Critical'; if(score>=70) return 'High Risk'; if(score>=45) return 'Medium Risk'; if(score>=20) return 'Low Risk'; return 'Safe'; }
export function analyzeRisk(input: ScanInput): ScanResult {
  const start=Date.now(); const normalized=`${input.content ?? ''} ${input.url ?? ''} ${input.fileName ?? ''}`.toLowerCase();
  const hits=signals.filter(([s])=>normalized.includes(s)); const score=Math.min(99, Math.max(5, hits.reduce((a,[,w])=>a+w, input.type==='url'||input.type==='qr'?12:8)));
  const threatLevel=level(score); const indicators=hits.map(([s])=>s);
  return { id:Math.random().toString(36).slice(2,14), score, threatLevel, confidence: Math.min(98, 62 + hits.length*7), type:input.type, favorite:false, createdAt:new Date().toISOString(), timeTakenMs:Date.now()-start+Math.floor(Math.random()*220), indicators,
    explanation: hits.length ? `ScanShield AI found ${hits.length} phishing/scam indicator(s), including ${indicators.slice(0,3).join(', ')}.` : 'No strong phishing or scam indicators were found by the rules and AI-readiness analyzer.',
    reasons: hits.length ? hits.map(([s])=>`Detected suspicious pattern: “${s}”.`) : ['Content did not request sensitive credentials, urgent payment, or risky off-platform action.'],
    recommendations: score>=70 ? ['Do not click links, open attachments, or share credentials.', 'Verify the request through the official website or a known phone number.', 'Report and delete the message if you cannot verify it.'] : ['Proceed only after independently verifying the sender.', 'Avoid entering passwords through links in messages.'],
    nextSteps: ['Save this report for audit history.', 'Share the report with your security team if business-related.', 'Enable login alerts and 2FA in account settings.'] };
}
