import type { ScanInput, ScanResult, ThreatLevel, ThreatStatus } from '../types/scan.js';

type Severity = 'low' | 'medium' | 'high' | 'critical';

interface Evidence {
  id: string;
  indicator: string;
  weight: number;
  severity: Severity;
  reasonEn: string;
  reasonSq: string;
}

interface Rule {
  id: string;
  indicator: string;
  weight: number;
  severity: Severity;
  patterns: RegExp[];
  reasonEn: string;
  reasonSq: string;
}

const TRUSTED_DOMAINS = new Set([
  'paypal.com',
  'google.com',
  'apple.com',
  'microsoft.com',
  'binance.com',
  'amazon.com',
  'facebook.com',
  'instagram.com'
]);

const HIGH_RISK_TLDS = new Set(['zip', 'mov', 'xyz', 'top', 'tk', 'ml', 'gq', 'cf', 'info', 'click', 'work', 'rest']);
const SHORTENERS = new Set(['bit.ly', 'tinyurl.com', 't.co', 'cutt.ly', 'is.gd', 'rebrand.ly', 'ow.ly']);

const RULES: Rule[] = [
  {
    id: 'credential_harvesting',
    indicator: 'Credential Harvesting',
    weight: 24,
    severity: 'high',
    patterns: [
      /\b(verify|confirm|update|reset)\s+(your\s+)?(password|pin|credentials|account)\b/i,
      /\b(verifiko|konfirmo|perditeso)\s+(fjalekalimin|pin|llogarine)\b/i,
      /\blogin\s+(now|immediately|to\s+continue)\b/i
    ],
    reasonEn: 'The content asks the user to verify or update credentials, a common phishing objective.',
    reasonSq: 'Permbajtja kerkon verifikim ose perditesim kredencialesh, nje objektiv tipik phishing.'
  },
  {
    id: 'urgency_pressure',
    indicator: 'Artificial Urgency',
    weight: 16,
    severity: 'medium',
    patterns: [
      /\b(urgent|immediately|final notice|within 24 hours|account suspended|limited time)\b/i,
      /\b(urgjente|menjehere|njoftim i fundit|brenda 24 oreve|bllokohet|pezullohet)\b/i
    ],
    reasonEn: 'The message uses time pressure or account-loss threats to reduce careful verification.',
    reasonSq: 'Mesazhi perdor presion kohe ose kercenim bllokimi per te ulur verifikimin e kujdesshem.'
  },
  {
    id: 'payment_redirection',
    indicator: 'Payment Redirection',
    weight: 22,
    severity: 'high',
    patterns: [
      /\b(wire transfer|bank details changed|new bank account|offshore account|overdue invoice)\b/i,
      /\b(iban|swift)\b.*\b(urgent|overdue|changed|new)\b/i
    ],
    reasonEn: 'The content resembles invoice or payment redirection fraud.',
    reasonSq: 'Permbajtja ngjan me mashtrim faturash ose ndryshim te rreme te te dhenave te pageses.'
  },
  {
    id: 'crypto_drainer',
    indicator: 'Crypto Wallet Drainer',
    weight: 30,
    severity: 'critical',
    patterns: [
      /\b(connect wallet|approve token|seed phrase|private key|claim airdrop|crypto giveaway)\b/i,
      /\b(usdt|airdrop|wallet)\b.*\b(claim|approve|connect|gift)\b/i
    ],
    reasonEn: 'The message asks for wallet connection, token approval, or private recovery material.',
    reasonSq: 'Mesazhi kerkon lidhje kuletash, miratim tokeni ose te dhena private rikuperimi.'
  },
  {
    id: 'gift_card_payment',
    indicator: 'Irreversible Payment Request',
    weight: 22,
    severity: 'high',
    patterns: [
      /\b(gift card|steam card|apple card|send code|voucher code)\b/i,
      /\b(karte dhurate|dergo kodin|kod kuponi)\b/i
    ],
    reasonEn: 'The content requests irreversible payment through gift cards or voucher codes.',
    reasonSq: 'Permbajtja kerkon pagese te pakthyeshme me karta dhurate ose kode kuponi.'
  },
  {
    id: 'attachment_lure',
    indicator: 'Risky Attachment Lure',
    weight: 12,
    severity: 'medium',
    patterns: [
      /\b(open|download|enable macros|view document|invoice attached)\b/i,
      /\.(exe|scr|js|vbs|iso|img|zip)\b/i
    ],
    reasonEn: 'The wording or file metadata encourages opening a potentially risky attachment.',
    reasonSq: 'Teksti ose metadata e skedarit nxit hapjen e nje bashkengjitjeje potencialisht te rrezikshme.'
  }
];

function normalizeText(input: ScanInput): string {
  return `${input.url ?? ''} ${input.content ?? ''} ${input.fileName ?? ''}`
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim();
}

function candidateUrls(text: string): URL[] {
  const matches = text.match(/https?:\/\/[^\s<>"')]+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s<>"')]+)?/gi) ?? [];
  return matches.flatMap(value => {
    const normalized = value.startsWith('http') ? value : `https://${value}`;
    try {
      return [new URL(normalized)];
    } catch {
      return [];
    }
  });
}

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j += 1) dp[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[a.length][b.length];
}

function registrableDomain(hostname: string): string {
  const parts = hostname.toLowerCase().split('.').filter(Boolean);
  return parts.length <= 2 ? parts.join('.') : parts.slice(-2).join('.');
}

function domainStem(domain: string): string {
  return domain.split('.')[0].replace(/[^a-z0-9]/g, '');
}

function urlEvidence(urls: URL[]): { evidence: Evidence[]; safetyCredits: number } {
  const evidence: Evidence[] = [];
  let safetyCredits = 0;

  for (const url of urls) {
    const host = url.hostname.toLowerCase();
    const domain = registrableDomain(host);
    const tld = domain.split('.').at(-1) ?? '';
    const stem = domainStem(domain).replace(/1/g, 'l').replace(/0/g, 'o');

    if (url.protocol === 'http:') {
      evidence.push({
        id: `http_${host}`,
        indicator: 'Unencrypted HTTP Link',
        weight: 10,
        severity: 'medium',
        reasonEn: `The link uses unencrypted HTTP: ${host}.`,
        reasonSq: `Linku perdor HTTP te paenkriptuar: ${host}.`
      });
    }

    if (HIGH_RISK_TLDS.has(tld)) {
      evidence.push({
        id: `tld_${domain}`,
        indicator: 'High-Risk Domain TLD',
        weight: 14,
        severity: 'medium',
        reasonEn: `The domain uses a TLD commonly abused in phishing campaigns: .${tld}.`,
        reasonSq: `Domain-i perdor nje TLD qe abuzohet shpesh ne phishing: .${tld}.`
      });
    }

    if (SHORTENERS.has(domain)) {
      evidence.push({
        id: `shortener_${domain}`,
        indicator: 'Shortened Link',
        weight: 16,
        severity: 'medium',
        reasonEn: `The URL is shortened through ${domain}, hiding the final destination.`,
        reasonSq: `URL-ja eshte shkurtuar me ${domain}, duke fshehur destinacionin final.`
      });
    }

    for (const trusted of TRUSTED_DOMAINS) {
      const trustedStem = domainStem(trusted);
      const distance = levenshtein(stem, trustedStem);
      const containsBrand = stem.includes(trustedStem) && domain !== trusted;
      if (domain !== trusted && (distance === 1 || containsBrand)) {
        evidence.push({
          id: `lookalike_${domain}_${trusted}`,
          indicator: 'Look-Alike Brand Domain',
          weight: containsBrand ? 26 : 34,
          severity: 'critical',
          reasonEn: `${domain} closely resembles ${trusted} but is not the official domain.`,
          reasonSq: `${domain} ngjan shume me ${trusted}, por nuk eshte domain zyrtar.`
        });
      }
    }

    if (TRUSTED_DOMAINS.has(domain) && url.protocol === 'https:') {
      safetyCredits += 14;
    }
  }

  return { evidence, safetyCredits: Math.min(20, safetyCredits) };
}

function ruleEvidence(text: string): Evidence[] {
  return RULES.flatMap(rule => {
    if (!rule.patterns.some(pattern => pattern.test(text))) return [];
    return [{
      id: rule.id,
      indicator: rule.indicator,
      weight: rule.weight,
      severity: rule.severity,
      reasonEn: rule.reasonEn,
      reasonSq: rule.reasonSq
    }];
  });
}

function uniqueEvidence(items: Evidence[]): Evidence[] {
  const seen = new Set<string>();
  return items.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function determineStatus(score: number): { status: ThreatStatus; statusEn: string; level: ThreatLevel } {
  if (score >= 85) return { status: 'Mashtrim i Konfirmuar', statusEn: 'Confirmed Scam', level: 'Critical' };
  if (score >= 70) return { status: 'Mashtrim i Konfirmuar', statusEn: 'Confirmed Scam', level: 'High Risk' };
  if (score >= 35) return { status: 'Suspekt', statusEn: 'Suspicious', level: 'Medium Risk' };
  if (score >= 18) return { status: 'I Sigurt', statusEn: 'Low Risk', level: 'Low Risk' };
  return { status: 'I Sigurt', statusEn: 'Safe', level: 'Safe' };
}

function recommendations(score: number): { sq: string; en: string[] } {
  if (score >= 70) {
    return {
      sq: 'Mos klikoni linqe, mos jepni kredenciale dhe mos hapni bashkengjitje. Bllokoni derguesin dhe raportojeni menjehere.',
      en: [
        'Do not click links, enter credentials, or open attachments.',
        'Block the sender and report the message to your security team.',
        'Change passwords immediately if you already submitted credentials.'
      ]
    };
  }
  if (score >= 35) {
    return {
      sq: 'Verifikoni derguesin nga kanal zyrtar dhe hapni sherbimin vetem duke shkruar domain-in zyrtar ne browser.',
      en: [
        'Verify the sender through an official channel.',
        'Open the service by typing the official domain directly.',
        'Do not share passwords, payment details, or one-time codes.'
      ]
    };
  }
  return {
    sq: 'Nuk u gjeten sinjale te forta mashtrimi. Vazhdoni me kujdes standard dhe kontrolloni domain-in para se te jepni te dhena.',
    en: ['No strong fraud signals were detected. Continue with normal caution and verify domains before sharing data.']
  };
}

function education(score: number, evidence: Evidence[]): { sq: string; en: string } {
  const top = evidence[0]?.indicator ?? 'clean content';
  if (score >= 70) {
    return {
      sq: `Rreziku kryesor eshte ${top}. Sulmuesit kombinojne domain-e te ngjashem, urgjence dhe kerkesa kredencialesh per te krijuar vendime te nxituara.`,
      en: `The primary risk is ${top}. Attackers combine look-alike domains, urgency, and credential requests to push rushed decisions.`
    };
  }
  if (score >= 35) {
    return {
      sq: `Analiza gjeti sinjale te dyshimta si ${top}. Keto nuk konfirmojne gjithmone mashtrim, por kerkojne verifikim jashte mesazhit.`,
      en: `The analysis found suspicious signals such as ${top}. These do not always confirm fraud, but they require verification outside the message.`
    };
  }
  return {
    sq: 'Analiza nuk gjeti kombinim te forte sinjalesh phishing. Rezultati i ulet nuk zevendeson kujdesin per domain-e, bashkengjitje dhe kerkesa pagesash.',
    en: 'The analysis did not find a strong combination of phishing signals. A low score does not replace caution around domains, attachments, and payment requests.'
  };
}

export function analyzeRisk(input: ScanInput): ScanResult {
  const start = Date.now();
  const text = normalizeText(input);
  const urls = candidateUrls(text);
  const { evidence: urlSignals, safetyCredits } = urlEvidence(urls);
  const signals = uniqueEvidence([...urlSignals, ...ruleEvidence(text)]);
  const rawScore = signals.reduce((sum, signal) => sum + signal.weight, 0);
  const typeRisk = input.type === 'qr' ? 8 : input.type === 'pdf' || input.type === 'screenshot' ? 5 : 0;
  const emptyPenalty = text.length < 12 ? 8 : 0;
  const score = Math.max(0, Math.min(99, Math.round(rawScore + typeRisk + emptyPenalty - safetyCredits)));
  const { status, statusEn, level: threatLevel } = determineStatus(score);
  const rec = recommendations(score);
  const edu = education(score, signals);
  const confidence = Math.max(52, Math.min(98, 58 + signals.length * 9 + Math.min(16, Math.floor(text.length / 80)) + (urls.length ? 8 : 0)));

  const reasons = signals.length
    ? signals.map(signal => signal.reasonEn)
    : ['No credential harvesting, payment redirection, suspicious URL, or high-pressure language was detected.'];
  const reasonsSq = signals.length
    ? signals.map(signal => signal.reasonSq)
    : ['Nuk u gjet kerkese per kredenciale, ridrejtim pagese, URL e dyshimte ose presion urgjence.'];

  return {
    id: 'sc_' + Math.random().toString(36).slice(2, 11),
    score,
    threatLevel,
    status,
    statusEn,
    confidence,
    explanation: signals.length
      ? `AIGuardian found ${signals.length} risk signal${signals.length === 1 ? '' : 's'} and assigned a ${score}% risk score.`
      : `AIGuardian found no strong fraud indicators and assigned a ${score}% risk score.`,
    explanationSq: signals.length
      ? `AIGuardian gjeti ${signals.length} sinjale rreziku dhe vendosi skor rreziku ${score}%.`
      : `AIGuardian nuk gjeti tregues te forte mashtrimi dhe vendosi skor rreziku ${score}%.`,
    indicators: signals.length ? signals.map(signal => signal.indicator) : ['No Strong Fraud Signal'],
    reasons,
    reasonsSq,
    recommendations: rec.en,
    recommendationSq: rec.sq,
    education: edu.sq,
    educationEn: edu.en,
    nextSteps: [
      'Save this report in the security history.',
      'Verify suspicious senders through an independent trusted channel.',
      'Enable two-factor authentication on sensitive accounts.'
    ],
    timeTakenMs: Date.now() - start,
    createdAt: new Date().toISOString(),
    type: input.type,
    favorite: false
  };
}
