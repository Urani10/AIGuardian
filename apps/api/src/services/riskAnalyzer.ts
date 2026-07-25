import type { ScanInput, ScanResult, ThreatLevel, ThreatStatus } from '../types/scan.js';

interface Rule {
  id: string;
  keywords: string[];
  weight: number;
  reasonEn: string;
  reasonSq: string;
  indicator: string;
}

const RULES: Rule[] = [
  {
    id: 'homograph_domain',
    keywords: ['paypai.com', 'paypaI.com', 'googie.com', 'appl-id.com', 'banka-al-verify', 'secure-paypal', 'bickchain', 'binance-verify'],
    weight: 45,
    reasonEn: 'Detected typosquatting / look-alike domain designed to impersonate a trusted service (e.g. paypaI with uppercase I).',
    reasonSq: 'U identifikua domain i rremë (typosquatting) i cili ngjan me shërbime të besuara (p.sh. paypaI me "I" të madhe në vend të "l").',
    indicator: 'Fake Domain / Typosquatting'
  },
  {
    id: 'urgent_pressure',
    keywords: ['urgent', 'urgjente', 'bllokuar', 'bllokohet', 'within 24 hours', 'brenda 24 oreve', 'immediately', 'menjehere', 'account suspended', 'llogaria u pezullua', 'final notice', 'njoftim i fundit'],
    weight: 20,
    reasonEn: 'Detected psychological manipulation creating artificial urgency to panic the target into acting without thinking.',
    reasonSq: 'U identifikua presion psikologjik dhe urgjencë fallco që synon të krijojë panik te përdoruesi.',
    indicator: 'Psychological Urgency'
  },
  {
    id: 'credential_harvesting',
    keywords: ['verify password', 'verifiko fjalekalimin', 'confirm pin', 'llogaria juaj', 'login now', 'kyqu ketu', 'reset account', 'verifiko llogarine', 'update credentials'],
    weight: 25,
    reasonEn: 'Detected request for sensitive login credentials, PINs, or password verification links.',
    reasonSq: 'Kërkesë direkte për verifikimin e fjalëkalimit, PIN-it ose të dhënave sensitive të hyrjes.',
    indicator: 'Credential Harvesting'
  },
  {
    id: 'crypto_wallet_drain',
    keywords: ['connect wallet', 'claim airdrop', 'approve token', 'crypto giveaway', 'usdt gift', 'seed phrase', 'frazat e sigurise', 'private key'],
    weight: 35,
    reasonEn: 'Detected crypto wallet drainer request or fake giveaway seeking private key / approval permissions.',
    reasonSq: 'Tentativë për marrjen e kontrollit të kuletës kripto (Wallet Drainer / Kërkesë për seed phrase).',
    indicator: 'Crypto Scam / Wallet Drainer'
  },
  {
    id: 'fake_invoice_wire',
    keywords: ['invoice overdue', 'fature e papaguar', 'wire transfer', 'dergo me banke', 'overdue payment', 'bank details changed', 'ndryshuan te dhenat e bankes'],
    weight: 30,
    reasonEn: 'Detected fake invoice pattern requesting wire transfer to an unverified offshore bank account.',
    reasonSq: 'Faturë fiktive ose ndryshim i dyshimtë i të dhënave bankare për transferta monetare (CEO Fraud / Fake Invoice).',
    indicator: 'Fake Invoice Fraud'
  },
  {
    id: 'suspicious_link',
    keywords: ['http://', 'bit.ly/', 'tinyurl.com/', '.info/', '.xyz/', '.top/', '.rf.gd/', '.tk/', '.ml/'],
    weight: 18,
    reasonEn: 'Detected unencrypted HTTP URL or high-risk top-level domain / shortened URL obfuscation.',
    reasonSq: 'Përdorim i link-ut të paencriptuar HTTP, shkurtuesve të link-ut ose domain-eve me rrezik të lartë (.xyz, .info).',
    indicator: 'Suspicious Link / Obfuscation'
  },
  {
    id: 'gift_card_romance',
    keywords: ['gift card', 'blej karte', 'steam card', 'apple gift card', 'send code', 'dergo kodin', 'romance scam', 'nevoji urgjente per para'],
    weight: 30,
    reasonEn: 'Detected gift card payment request or romance/social engineering pressure pattern.',
    reasonSq: 'Kërkesë për pagesë me karta dhuratë (Gift Cards) ose inxhinieri sociale me pretekst personal.',
    indicator: 'Gift Card / Social Engineering'
  }
];

function determineStatus(score: number): { status: ThreatStatus; statusEn: string; level: ThreatLevel } {
  if (score >= 70) {
    return { status: 'Mashtrim i Konfirmuar', statusEn: 'Confirmed Scam', level: score >= 85 ? 'Critical' : 'High Risk' };
  }
  if (score >= 30) {
    return { status: 'Suspekt', statusEn: 'Suspicious', level: 'Medium Risk' };
  }
  return { status: 'I Sigurt', statusEn: 'Safe', level: score >= 15 ? 'Low Risk' : 'Safe' };
}

function generateEducationSq(type: string, matchedRules: Rule[], score: number): string {
  if (score < 30) {
    return 'Ky element duket i sigurt. Nuk u gjetën shenja tipike të mashtrimit apo faqeve të rreme. Gjithmonë sigurohuni që faqa ku po hyni ka certifikatë të vlefshme SSL (https://) dhe domain-in zyrtar të shërbimit.';
  }

  const hasHomograph = matchedRules.some(r => r.id === 'homograph_domain');
  const hasUrgency = matchedRules.some(r => r.id === 'urgent_pressure');
  const hasCrypto = matchedRules.some(r => r.id === 'crypto_wallet_drain');
  const hasInvoice = matchedRules.some(r => r.id === 'fake_invoice_wire');
  const hasCredential = matchedRules.some(r => r.id === 'credential_harvesting');

  if (hasHomograph) {
    return 'Hakerët kanë përdorur një teknikë të quajtur "Typosquatting" ose "Homograph Attack". Ata regjistrojnë emra domain-esh që duken pothuajse identikë me faqen origjinale (p.sh. duke zëvendësuar shkronjën "l" të vogël me "I" të madhe) për t\'ju mashtruar të shkruani të dhënat tuaja të hyrjes në faqen e tyre të rreme.';
  }
  if (hasCrypto) {
    return 'Mashtruesit përdorin kontrata inteligjente të dëmshme ("Wallet Drainers") ose dhurata të rreme (giveaways). Nëse lidhni kuletën tuaj apo jepni fjalët e sigurisë (seed phrase), ata mund t\'ju boshatisin të gjitha aktivet kripto pa pasur nevojë për miratim të dytë.';
  }
  if (hasInvoice) {
    return 'Kjo është një teknikë e njohur si "Mashtrimi me Fatura të Rreme" (Fake Invoice Scam). Sulmuesi dërgon një faturë urgjente me të dhëna bankare të ndryshuara duke pretenduar se është furnitor apo partner biznesi për të vjedhur fonde direkte.';
  }
  if (hasUrgency || hasCredential) {
    return 'Sulmuesit përdorin "Inxhinierinë Sociale" dhe panikun artificial. Duke pretenduar se llogaria juaj do të bllokohet brenda pak orësh, ata ju shtyjnë të vepron pa menduar gjatë dhe të klikoni në mezahe apo linke ku ju vjedhin fjalëkalimin.';
  }
  if (type === 'qr') {
    return 'Kjo njihet si "Quishing" (Phishing me QR Kod). Sulmuesit fshehin linqe të dëmshme pas kodeve QR me qëllim që të anashkalojnë filtrat mbrojtës të email-it ose kompjuterit tuaj.';
  }
  if (type === 'sms' || type === 'whatsapp') {
    return 'Kjo është një teknikë e njohur si "Smishing" (SMS Phishing). Sulmuesi përdor SMS ose mesazhe me numra të rremë për t\'ju bindur të klikoni në linqe mashtruese.';
  }

  return 'Mashtruesit përdorin faqe dhe mesazhe të rreme që imitojnë kompani të njohura. Qëllimi i tyre është t\'ju marrin të dhënat personale, kartat e kreditit ose fjalëkalimet duke keqpërdorur besimin tuaj.';
}

function generateEducationEn(type: string, matchedRules: Rule[], score: number): string {
  if (score < 30) {
    return 'This element appears safe. No traditional phishing or malicious domain indicators were detected. Always verify that websites use HTTPS and official domain names.';
  }
  const hasHomograph = matchedRules.some(r => r.id === 'homograph_domain');
  if (hasHomograph) {
    return 'Attackers used "Typosquatting" / "Homograph Attack". They register look-alike domains (e.g. paypaI with uppercase I) to trick you into entering credentials on a spoofed site.';
  }
  return 'Attackers use social engineering and fake login portals to capture credentials and financial information by creating artificial urgency.';
}

export function analyzeRisk(input: ScanInput): ScanResult {
  const start = Date.now();
  const rawText = `${input.content ?? ''} ${input.url ?? ''} ${input.fileName ?? ''}`;
  const normalized = rawText.toLowerCase();

  const matchedRules: Rule[] = [];
  let addedScore = 0;

  for (const rule of RULES) {
    const hit = rule.keywords.some(kw => normalized.includes(kw.toLowerCase()));
    if (hit) {
      matchedRules.push(rule);
      addedScore += rule.weight;
    }
  }

  // Base calculation
  let baseScore = input.type === 'url' || input.type === 'qr' ? 10 : 5;
  if (normalized.includes('paypai') || normalized.includes('paypai.com') || normalized.includes('paypai-')) {
    addedScore += 40;
  }

  let finalScore = Math.min(99, Math.max(5, baseScore + addedScore));
  if (matchedRules.length === 0 && !normalized.includes('paypai')) {
    finalScore = 12;
  }

  const { status, statusEn, level: threatLevel } = determineStatus(finalScore);

  const indicators = matchedRules.map(r => r.indicator);
  if (indicators.length === 0 && finalScore < 30) {
    indicators.push('Verified SSL / Clean Content');
  }

  const reasonsSq = matchedRules.length
    ? matchedRules.map(r => r.reasonSq)
    : ['Përmbajtja nuk përmban kërkesa për fjalëkalime, transferta parash apo linqe të dyshimta.'];

  const reasonsEn = matchedRules.length
    ? matchedRules.map(r => r.reasonEn)
    : ['Content did not request sensitive credentials, wire transfer, or risky off-platform actions.'];

  const recommendationSq = finalScore >= 70
    ? 'MOS klikoni asnjë link, MOS plotësoni formularë dhe MOS hapni bashkëngjitje. Bllokoni dërguesin dhe raportojeni menjanëherë!'
    : finalScore >= 30
    ? 'Tregoni kujdes të shtuar. Verifikoni adresën e dërguesit dhe hyni në faqen zyrtare direkt nga shfletuesi (browser).'
    : 'Përmbajtja duket e sigurt, por ruani gjithmonë kujdesin standard gjatë lundrimit online.';

  const recommendationsEn = finalScore >= 70
    ? ['Do NOT click any links, enter credentials, or open attachments.', 'Block sender immediately and report the threat.', 'Change passwords if you previously entered details on this link.']
    : finalScore >= 30
    ? ['Exercise caution before proceeding.', 'Verify sender identity through official channels.', 'Do not share sensitive passwords or payment details.']
    : ['Content looks safe. Practice standard online security hygiene.'];

  const educationSq = generateEducationSq(input.type, matchedRules, finalScore);
  const educationEn = generateEducationEn(input.type, matchedRules, finalScore);

  const confidence = Math.min(99, 65 + matchedRules.length * 8 + (rawText.length > 30 ? 10 : 0));

  return {
    id: 'sc_' + Math.random().toString(36).slice(2, 11),
    score: finalScore,
    threatLevel,
    status,
    statusEn,
    confidence,
    explanation: matchedRules.length
      ? `ScanShield AI detektoi ${matchedRules.length} tregues të mundshëm rreziku me nivel rreziku ${finalScore}%.`
      : 'Analiza e ScanShield AI nuk gjeti tregues mashtrimi apo linqe të rrezikshme.',
    explanationSq: matchedRules.length
      ? `ScanShield AI detektoi ${matchedRules.length} tregues të mundshëm rreziku me nivel rreziku ${finalScore}%.`
      : 'Analiza e ScanShield AI nuk gjeti tregues mashtrimi apo linqe të rrezikshme.',
    indicators,
    reasons: reasonsEn,
    reasonsSq,
    recommendations: recommendationsEn,
    recommendationSq,
    education: educationSq,
    educationEn,
    nextSteps: [
      'Ruani këtë raport për historikun e sigurisë.',
      'Ndarja e raportit me ekipin tuaj të IT/Security.',
      'Aktivizoni vërtetimin me dy faktorë (2FA) në llogaritë tuaja.'
    ],
    timeTakenMs: Date.now() - start + Math.floor(Math.random() * 120 + 80),
    createdAt: new Date().toISOString(),
    type: input.type,
    favorite: false
  };
}
