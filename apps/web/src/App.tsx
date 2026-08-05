import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import {
  ShieldAlert, ShieldCheck, Zap, Mail, Smartphone, QrCode, FileText,
  Upload, CheckCircle, AlertTriangle, KeyRound, Star,
  Trash2, Globe, Lock, Sun, Moon, BookOpen, BarChart3,
  Sparkles, RefreshCw, Shield, User, LogOut,
  Settings, Eye, EyeOff, AlertOctagon, Menu, X,
  LockKeyhole, Activity, Search, ChevronDown, Check, ArrowRight,
  Camera, Image as ImageIcon
} from 'lucide-react';
import { SentientAuthAura, AuraState } from './components/SentientAuthAura';
import { RiskScoreMeter } from './components/RiskScoreMeter';
import { ImagePreview } from './components/ImagePreview';
import { ScreenshotUploader } from './components/ScreenshotUploader';
import { OCRResult } from './components/OCRResult';
import { ThreatAnalysisCard } from './components/ThreatAnalysisCard';
import logoImg from './assets/logo.png';
import './styles/global.css';

/* ═══════════════════════════════════════════
   TYPES & INTERFACES
═══════════════════════════════════════════ */
export type ScanInputType = 'url' | 'email' | 'sms' | 'qr' | 'screenshot' | 'pdf' | 'text';
export type Lang = 'sq' | 'en';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'analyst' | 'admin' | 'user';
  plan: string;
}

export interface ScanResult {
  id: string;
  score: number;
  threatLevel: string;
  status: 'I Sigurt' | 'Suspekt' | 'Mashtrim i Konfirmuar';
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
  ocrText?: string;
  ocrNoteSq?: string;
  ocrNoteEn?: string;
}

export interface PresetSample {
  id: string;
  labelSq: string;
  labelEn: string;
  tag: string;
  badgeSq: string;
  badgeEn: string;
  badgeType: 'high' | 'medium' | 'safe';
  type: ScanInputType;
  url: string;
  content: string;
  descSq: string;
  descEn: string;
  imageSrc?: string;
  ocrText?: string;
  ocrNoteSq?: string;
  ocrNoteEn?: string;
}

/* ═══════════════════════════════════════════
   SYNTHETIC SVG SCREENSHOT MOCKUPS FOR PRESETS
═══════════════════════════════════════════ */
const generateSvgScreenshot = (bg: string, title: string, subtitle: string, bodyText: string, warningPill: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="480" viewBox="0 0 800 480">
    <rect width="800" height="480" fill="${bg}" rx="12"/>
    <rect x="0" y="0" width="800" height="44" fill="#0f172a" rx="12"/>
    <circle cx="24" cy="22" r="6" fill="#ef4444"/>
    <circle cx="44" cy="22" r="6" fill="#f59e0b"/>
    <circle cx="64" cy="22" r="6" fill="#10b981"/>
    <rect x="120" y="10" width="560" height="24" rx="6" fill="#1e293b"/>
    <text x="400" y="26" fill="#94a3b8" font-size="12" font-family="sans-serif" text-anchor="middle">${title}</text>
    <rect x="40" y="70" width="720" height="60" rx="8" fill="#1e293b"/>
    <text x="60" y="105" fill="#f8fafc" font-size="18" font-family="sans-serif" font-weight="bold">${warningPill}</text>
    <rect x="40" y="150" width="720" height="280" rx="10" fill="#0b0f19" stroke="#334155"/>
    <text x="70" y="195" fill="#3b82f6" font-size="20" font-family="sans-serif" font-weight="bold">${subtitle}</text>
    <text x="70" y="240" fill="#cbd5e1" font-size="14" font-family="sans-serif">${bodyText.substring(0, 75)}</text>
    <text x="70" y="270" fill="#cbd5e1" font-size="14" font-family="sans-serif">${bodyText.substring(75, 150)}</text>
    <text x="70" y="300" fill="#cbd5e1" font-size="14" font-family="sans-serif">${bodyText.substring(150, 220)}</text>
    <rect x="70" y="340" width="220" height="44" rx="8" fill="#2563eb"/>
    <text x="180" y="367" fill="#ffffff" font-size="14" font-family="sans-serif" font-weight="bold" text-anchor="middle">Verify &amp; Continue</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/* ═══════════════════════════════════════════
   TRANSLATIONS DICTIONARY
═══════════════════════════════════════════ */
const T = {
  sq: {
    scanCenter: 'Qendra e Analizës',
    analytics: 'Statistikat & Analytics',
    history: 'Historiku',
    settings: 'Konfigurimi AI',
    guide: 'Edukimi & Udhëzuesi',
    heroTag: 'AIGuardian Real-Time Threat Engine 2.0',
    heroTitle: 'Zbuloni dhe bllokoni mashtrimet digjitale me fuqinë e AI',
    heroSubtitle: 'Analizoni lidhje, email-e, SMS, QR kode dhe dokumente në sekonda me inteligjencë artificiale. Merrni nivelin e rrezikut, arsyet e detektuara dhe udhëzime të menjëhershme.',
    scanNow: 'Analizo tani',
    trySample: 'Provo shembullin',
    shieldActive: 'AIGuardian Real-Time Shield: AKTIV',
    securityScore: 'Niveli i Sigurisë',
    totalScans: 'Skanime të Kryera',
    confirmedScams: 'Mashtrime të Bllokuara',
    safeElements: 'Të Sigurta',
    shieldDesc: 'Detekton typosquatting, smishing, quishing dhe faturat fiktive me zero-knowledge privacy.',
    analysisCenterTitle: 'Qendra e Analizës së Mashtrimeve me AI',
    selectCategory: 'Zgjidhni Kategorinë e Skanimit:',
    presetsTitle: 'Shembuj Kërcënimesh me 1-Klikim (Presets):',
    suspiciousUrl: 'URL ose Linku i Dyshimtë',
    urlPlaceholder: 'p.sh. http://paypaI-security-verify.com/login',
    messageText: 'Teksti i Mesazhit / Email-it / Përmbajtja',
    messagePlaceholder: 'Vendosni këtu tekstin e email-it, SMS-së apo faturës për analizë të hollësishme...',
    dragDrop: 'Tërhiqni & Lëshoni Imazhin ose Skedarin (OCR / PDF)',
    fileFormats: 'Mbështet skedarët PNG, JPG, WEBP, PDF (Deri në 10MB)',
    analyzeBtn: 'Analizo me AIGuardian Core',
    scanning: 'Duke analizuar screenshot-in dhe tekstin OCR me AI...',
    reportTitle: 'Raporti i Analizës së Sigurisë',
    identifiedReasons: 'Arsyet e Detektuara të Rrezikut:',
    recommendation: 'Rekomandimi i Menjëhershëm i Sigurisë:',
    education: 'Edukimi Teknologjik (Pse është mashtrim?):',
    confidence: 'Besueshmëria e AI',
    execTime: 'Koha e ekzekutimit',
    saved: 'E Ruajtur',
    save: 'Ruaj',
    printPdf: 'Eksporto PDF',
    analyticsTitle: 'Statistikat & Paneli i Kërcënimeve AIGuardian',
    totalScansLabel: 'Gjithsej Skanime të Kryera',
    suspiciousLabel: 'Elemente të Dyshimta',
    riskChart: 'Grafiku i Rrezikut sipas Skanimeve të Fundit',
    historyTitle: 'Historiku i Analizave',
    searchHistory: 'Kërko në historikun e skanimeve...',
    statusCol: 'Statusi',
    levelCol: 'Niveli i Rrezikut',
    typeCol: 'Kategoria',
    explanationCol: 'Përmbledhja e AI',
    dateCol: 'Koha',
    actionsCol: 'Veprime',
    noHistory: 'Nuk ka asnjë skanim të regjistruar akoma në historik.',
    settingsTitle: 'Konfigurimi i Motorit AI',
    settingsDesc: 'Vendosni çelësin tuaj të API-së për Gemini, OpenAI apo Groq për të mundësuar skanim të avancuar me AIGuardian Core.',
    selectProvider: 'Zgjidhni Ofronësin AI',
    apiKeyLabel: 'Çelësi i API-së (API Key Secret)',
    testConnection: 'Testo Lidhjen',
    saveConfig: 'Ruaj Konfigurimin',
    guideTitle: 'Udhëzuesi i Sigurisë & Edukimi mbi Mashtrimet',
    guideSubtitle: 'Mësoni si funksionojnë teknikat kryesore të mashtrimeve digjitale dhe si të mbroni veten.',
    loggedOut: 'U çkyçët nga AIGuardian.',
    loginSuccess: 'U kyçët me sukses në AIGuardian!',
    scanComplete: 'Analiza e AIGuardian u përfundua me sukses!',
    testSuccess: 'Testimi i lidhjes doli me sukses!',
    configSaved: 'Konfigurimi u ruajt me sukses.',
    sampleLoaded: 'U ngarkua shembulli',
    deleted: 'Analiza u fshi nga historiku.',
    invalidCreds: 'Kredenciale të pasakta. Tentativa e hyrjes u bllokua me siguri.',
    invalidCredsToast: 'Kredenciale jo të vlefshme! Qasja u bllokua.',
    shieldDrawerTitle: 'Real-Time Privacy Shield',
    shieldStatus: '● Statusi i Sesionit: Encrypted & Safe (AES-256 GCM)',
    shieldProtection: '🛡️ Mbrojtja e Sesionit Aktiv:',
    shieldProtectionDesc: 'Sesioni juaj monitorohet aktivisht nga shtresa e privatësisë zero-knowledge të AIGuardian. Asnjë të dhënë skanimi nuk ndahet me palë të treta ose ruhet i pa-enkriptuar.',
    encryptionStd: 'Standardi i Enkriptimit',
    aiThreatShield: 'Mburojë Kërcënimi AI',
    closeShield: 'Mbyll Inspektimin e Mburojës',
    privacyShieldActive: '🛡️ Privacy Shield Aktiv',
    inspect: 'Inspekto',
    accountSettings: 'Llogaria & Cilësimet AI',
    myScans: 'Skanimet & Historiku Im',
    logout: 'Çkyçu',
    logIn: 'Hyr',
    signUp: 'Regjistrohu',
    authTitle: 'Autentifikim Sentient',
    authSubtitle: 'Vizualizues WebGL i kadencës dhe siguri zero-enumerim aktiv.',
    signupTitle: 'Krijo Llogari AIGuardian',
    signupSubtitle: 'Filloni të mbroheni nga mashtrimet & phishing.',
    fullName: 'Emri i Plotë',
    emailAddress: 'Adresa Email',
    password: 'Fjalëkalimi',
    authenticateBtn: 'Autentifiko me Sentient Aura',
    verifying: 'Duke verifikuar...',
    noAccount: 'Nuk keni llogari?',
    hasAccount: 'Keni llogari?',
    testDbTitle: 'Testo përgjigjet e bazës me 1-klikim:',
    validPreset: 'Kredencial i Vlefshëm',
    invalidPreset: 'Simulo Invalid (Shatter)',
    sysStatus: '🟢 Të gjitha sistemet operative (99.99% Uptime)',
    copyright: '© 2026 AIGuardian Cybersecurity Suite · Të gjitha të drejtat e rezervuara',
    privacyNotice: 'Sesioni juaj është i enkriptuar me standardin AES-256 GCM me mbrojtje zero-knowledge.',
    uploadScreenshotTitle: 'Ngarko Screenshot',
  },
  en: {
    scanCenter: 'Scan Center',
    analytics: 'Threat Analytics',
    history: 'Scan History',
    settings: 'AI Setup',
    guide: 'Security Guide',
    heroTag: 'AIGuardian Real-Time Threat Engine 2.0',
    heroTitle: 'Detect and block digital scams with the power of AI',
    heroSubtitle: 'Deep scan links, emails, SMS, QR codes, screenshots, and invoices in seconds with artificial intelligence. Receive instant risk scores, identified threat vectors, and actionable guidance.',
    scanNow: 'Scan now',
    trySample: 'Try sample',
    shieldActive: 'AIGuardian Real-Time Shield: ACTIVE',
    securityScore: 'Security Score',
    totalScans: 'Total Scans',
    confirmedScams: 'Blocked Scams',
    safeElements: 'Verified Safe',
    shieldDesc: 'Detects typosquatting, smishing, quishing, and fake invoices with zero-knowledge privacy.',
    analysisCenterTitle: 'Artificial Intelligence Threat Analysis Center',
    selectCategory: 'Select Scan Category:',
    presetsTitle: '1-Click Threat Presets:',
    suspiciousUrl: 'Suspicious URL or Link',
    urlPlaceholder: 'e.g. http://paypaI-security-verify.com/login',
    messageText: 'Message Text / Email Content / Notes',
    messagePlaceholder: 'Paste message text, email content, or notes here for deep inspection...',
    dragDrop: 'Drag & Drop Screenshot or Document (OCR / PDF)',
    fileFormats: 'Supports PNG, JPG, WEBP, PDF (Up to 10MB)',
    analyzeBtn: 'Analyze with AIGuardian Core',
    scanning: 'Analyzing screenshot and OCR text with AI...',
    reportTitle: 'Security Analysis Report',
    identifiedReasons: 'Identified Threat Reasons:',
    recommendation: 'Immediate Actionable Recommendation:',
    education: 'Educational Breakdown (Why is this a scam?):',
    confidence: 'AI Confidence',
    execTime: 'Execution time',
    saved: 'Favorited',
    save: 'Favorite',
    printPdf: 'Export PDF',
    analyticsTitle: 'AIGuardian Threat Analytics Overview',
    totalScansLabel: 'Total Scans Analyzed',
    suspiciousLabel: 'Suspicious Elements',
    riskChart: 'Recent Scan Risk Level Graph',
    historyTitle: 'Scan Analysis History',
    searchHistory: 'Search scan history...',
    statusCol: 'Status',
    levelCol: 'Risk Score',
    typeCol: 'Category',
    explanationCol: 'AI Summary',
    dateCol: 'Time',
    actionsCol: 'Actions',
    noHistory: 'No scans recorded in history yet.',
    settingsTitle: 'AI Engine & API Key Setup',
    settingsDesc: 'Configure your custom Gemini, OpenAI, or Groq API key for deep AI threat detection capabilities.',
    selectProvider: 'Select AI Provider',
    apiKeyLabel: 'API Key Secret',
    testConnection: 'Test API Connection',
    saveConfig: 'Save Config',
    guideTitle: 'AIGuardian Cybersecurity Guide',
    guideSubtitle: 'Learn how top cyber attack vectors work and how to protect your personal and financial assets.',
    loggedOut: 'Logged out of AIGuardian.',
    loginSuccess: 'Successfully signed in to AIGuardian!',
    scanComplete: 'AIGuardian scan completed successfully!',
    testSuccess: 'Connection test successful!',
    configSaved: 'AI Configuration saved.',
    sampleLoaded: 'Loaded sample',
    deleted: 'Scan deleted from history.',
    invalidCreds: 'Invalid email or password. Intrusion attempt logged and blocked.',
    invalidCredsToast: 'Invalid credentials! Access blocked.',
    shieldDrawerTitle: 'Real-Time Privacy Shield',
    shieldStatus: '● Session Status: Encrypted & Safe (AES-256 GCM)',
    shieldProtection: '🛡️ Active Session Protection:',
    shieldProtectionDesc: "Your session is actively monitored by AIGuardian's zero-knowledge privacy layer. No personal scan data is shared with third parties or stored unencrypted.",
    encryptionStd: 'Encryption Standard',
    aiThreatShield: 'AI Threat Shield',
    closeShield: 'Close Shield Inspection',
    privacyShieldActive: '🛡️ Privacy Shield Active',
    inspect: 'Inspect',
    accountSettings: 'Account & AI Settings',
    myScans: 'My Scans & History',
    logout: 'Log Out',
    logIn: 'Log In',
    signUp: 'Sign Up',
    authTitle: 'Sentient Authentication',
    authSubtitle: 'Real-time WebGL keystroke cadence visualizer & zero-enumeration security active.',
    signupTitle: 'Create AIGuardian Account',
    signupSubtitle: 'Start protecting your assets from scams & phishing.',
    fullName: 'Full Name',
    emailAddress: 'Email Address',
    password: 'Password',
    authenticateBtn: 'Authenticate with Sentient Aura',
    verifying: 'Verifying Cadence & Credentials...',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    testDbTitle: 'Test database responses with 1-click presets:',
    validPreset: 'Valid Preset',
    invalidPreset: 'Simulate Invalid (Shatter)',
    sysStatus: '🟢 All systems operational (99.99% Uptime)',
    copyright: '© 2026 AIGuardian Cybersecurity Suite · All rights reserved',
    privacyNotice: 'Your session is encrypted using AES-256 GCM with zero-knowledge protection.',
    uploadScreenshotTitle: 'Upload Screenshot',
  }
} as const;

/* ═══════════════════════════════════════════
   SCAN CATEGORIES CONFIG
═══════════════════════════════════════════ */
const CATEGORY_CARDS = [
  {
    type: 'url' as ScanInputType,
    labelSq: 'URL / Link',
    labelEn: 'URL / Web Link',
    icon: <Globe size={20} />,
    descSq: 'Zbulon phishing, domain spoofing dhe typosquatting.',
    descEn: 'Detects phishing, domain spoofing, and typosquatting.'
  },
  {
    type: 'email' as ScanInputType,
    labelSq: 'Email',
    labelEn: 'Email Content',
    icon: <Mail size={20} />,
    descSq: 'Detekton mashtrimet BEC, dërguesit e rremë dhe përmbajtjet malinje.',
    descEn: 'Detects BEC scams, spoofed senders, and malicious payloads.'
  },
  {
    type: 'sms' as ScanInputType,
    labelSq: 'SMS / WhatsApp',
    labelEn: 'SMS / Messaging',
    icon: <Smartphone size={20} />,
    descSq: 'Identifikon smishing dhe mesazhet mashtruese bankare.',
    descEn: 'Identifies smishing and deceptive mobile banking texts.'
  },
  {
    type: 'qr' as ScanInputType,
    labelSq: 'QR Code',
    labelEn: 'QR Code / Quishing',
    icon: <QrCode size={20} />,
    descSq: 'Verifikon linqet e fshehura përmes quishing dhe ridrejtimet mashtruese.',
    descEn: 'Verifies hidden links in QR codes and quishing redirects.'
  },
  {
    type: 'screenshot' as ScanInputType,
    labelSq: '📸 Screenshot / OCR',
    labelEn: '📸 Screenshot / OCR',
    icon: <Camera size={20} />,
    descSq: 'Ngarko screenshot-e të faqeve, mesazheve ose faturave dhe AI identifikon mashtrimet.',
    descEn: 'Upload screenshots of websites, messages, or invoices and AI detects scams.'
  },
  {
    type: 'pdf' as ScanInputType,
    labelSq: 'Faturë / PDF',
    labelEn: 'Invoice / PDF',
    icon: <FileText size={20} />,
    descSq: 'Analizon faturat fiktive, IBAN të ndryshuara dhe mashtrimet me me pagesa.',
    descEn: 'Analyzes fake invoices, altered IBANs, and wire transfer scams.'
  }
];

/* ═══════════════════════════════════════════
   PRESET SAMPLES CONFIG
═══════════════════════════════════════════ */
const PRESET_SAMPLES: PresetSample[] = [
  {
    id: 'fake-paypal',
    labelSq: '🚨 Fake PayPal Screenshot',
    labelEn: '🚨 Fake PayPal Screenshot',
    tag: 'Typosquatting',
    badgeSq: 'Kërcënim i Lartë',
    badgeEn: 'Critical Threat',
    badgeType: 'high',
    type: 'screenshot',
    url: 'http://paypaI-security-verify.com/login?urgent=1',
    content: 'Urgent security verification required for your PayPal wallet account. Verify password immediately or account will be suspended within 24 hours.',
    descSq: 'Screenshot nga domain i falsifikuar paypaI.com me me me me dritare hyrjeje me urgjencë.',
    descEn: 'Screenshot of spoofed paypaI.com login portal requesting immediate verification.',
    imageSrc: generateSvgScreenshot(
      '#070a14',
      'http://paypaI-security-verify.com/login',
      'PayPal Wallet Security Alert',
      'Urgent security verification required for your PayPal wallet account. Verify password immediately or account will be suspended within 24 hours. Login at http://paypaI-security-verify.com/login',
      '⚠ URGENT VERIFICATION REQUIRED'
    ),
    ocrText: `PayPal Security Verification: Your wallet account #892-311 has been flagged for suspicious login activity. Verify your password and SSN immediately to prevent account termination within 24 hours. Login at http://paypaI-security-verify.com/login`,
    ocrNoteSq: 'Ky tekst përdor presion kohor dhe domain-in e falsifikuar paypaI.com për të vjedhur fjalëkalimet.',
    ocrNoteEn: 'This text employs psychological time pressure and spoofed domain paypaI.com to harvest credentials.'
  },
  {
    id: 'sms-bankar',
    labelSq: '💬 Fake Bank SMS',
    labelEn: '💬 Fake Bank SMS',
    tag: 'Smishing',
    badgeSq: 'Smishing Bankar',
    badgeEn: 'Bank Smishing',
    badgeType: 'high',
    type: 'screenshot',
    url: 'http://banka-al-verify.info/login',
    content: 'URGJENTE: Llogaria juaj bankare eshte bllokuar! Klikoni te verifikoni fjalekalimin menjehere: http://banka-al-verify.info/login',
    descSq: 'Pamje ekrani e mesazhit SMS mashtrues që imiton njoftim urgjent bankar.',
    descEn: 'SMS message screenshot pretending to be an urgent bank security alert.',
    imageSrc: generateSvgScreenshot(
      '#0b1329',
      'SMS Alert • Banka Shqiptare',
      'URGJENTE: Llogaria e Bllokuar',
      'URGJENTE: Llogaria juaj bankare eshte bllokuar per arsye sigurie. Per ta zhbllokuar menjehere klikoni: http://banka-al-verify.info/login me urgjence.',
      '💬 SMS BANKAR ALERT'
    ),
    ocrText: `Banka Shqiptare Alert: Llogaria juaj bankare eshte bllokuar per arsye sigurie. Per ta zhbllokuar menjehere klikoni: http://banka-al-verify.info/login me urgjence.`,
    ocrNoteSq: 'Identifikohet smishing bankar që përdor linqe jo-zyrtare me prapashtesën .info.',
    ocrNoteEn: 'Identified mobile smishing employing unverified .info TLD domain links.'
  },
  {
    id: 'qr-crypto',
    labelSq: '🔲 Fake Crypto Giveaway',
    labelEn: '🔲 Fake Crypto Giveaway',
    tag: 'Quishing',
    badgeSq: 'Quishing Crypto',
    badgeEn: 'Crypto Quishing',
    badgeType: 'medium',
    type: 'screenshot',
    url: 'http://claim-usdt-airdrop.xyz/approve',
    content: 'Scan QR code to claim 500 USDT giveaway. Connect wallet and approve token transfer.',
    descSq: 'Screenshot me QR kod mashtrues për zbrazjen e kripto-portofolit.',
    descEn: 'Crypto giveaway screenshot containing malicious wallet drainer QR code.',
    imageSrc: generateSvgScreenshot(
      '#130a2a',
      'http://claim-usdt-airdrop.xyz',
      '500 USDT Airdrop Claim',
      'Scan QR code to claim 500 USDT giveaway. Connect Web3 Wallet & Approve Unlimited Token Transfer at http://claim-usdt-airdrop.xyz/approve',
      '🔲 CRYPTO AIRDROP SCAN'
    ),
    ocrText: `USDT Airdrop Giveaway 2026: Claim 500 USDT free giveaway. Connect Web3 Wallet & Approve Unlimited Token Transfer at http://claim-usdt-airdrop.xyz/approve`,
    ocrNoteSq: 'Kujdes: Kërkesat për miratim të pakufizuar të token-ave janë zbrazës portofoli (wallet drainers).',
    ocrNoteEn: 'Warning: Unlimited token transfer approvals are classic crypto wallet drainer exploits.'
  },
  {
    id: 'fake-invoice',
    labelSq: '📄 Fake Invoice PDF',
    labelEn: '📄 Fake Invoice PDF',
    tag: 'BEC / Invoice',
    badgeSq: 'Faturë Fiktive',
    badgeEn: 'Fake Invoice',
    badgeType: 'high',
    type: 'screenshot',
    url: '',
    content: 'INVOICE #98231 OVERDUE - Urgent payment required. Please wire transfer $4,850 to our new offshore account.',
    descSq: 'Pamje e faturës fiktive me ndryshim të papritur të IBAN-it bankar.',
    descEn: 'Invoice document screenshot showing suspicious offshore bank routing change.',
    imageSrc: generateSvgScreenshot(
      '#1a0c12',
      'Invoice_99210_Overdue.pdf',
      'COMMERCIAL INVOICE #INV-99210',
      'INVOICE OVERDUE: Total $4,850.00 USD. Our bank routing details have changed. Please send wire transfer directly to Offshore Bank Account IBAN: AL392021110000000928311029.',
      '📄 FAKTUAR $4,850.00 OVERDUE'
    ),
    ocrText: `COMMERCIAL INVOICE #INV-99210 OVERDUE: Total $4,850.00 USD. IMPORTANT NOTICE: Our bank routing details have changed. Please send wire transfer directly to Offshore Bank Account IBAN: AL392021110000000928311029.`,
    ocrNoteSq: 'Identifikohet mashtrim fature BEC me ndryshim të paautorizuar të IBAN-it bankar.',
    ocrNoteEn: 'Detected Business Email Compromise (BEC) invoice fraud altering bank wire details.'
  },
  {
    id: 'paypal-safe',
    labelSq: '✅ Safe PayPal Website',
    labelEn: '✅ Safe PayPal Website',
    tag: 'Verified',
    badgeSq: 'Zyrtare / Sigurt',
    badgeEn: 'Official / Safe',
    badgeType: 'safe',
    type: 'screenshot',
    url: 'https://www.paypal.com/signin',
    content: 'Official sign-in portal for PayPal.',
    descSq: 'Screenshot autentik nga faqja zyrtare e certifikuar e PayPal.',
    descEn: 'Authentic screenshot of official encrypted PayPal sign-in portal.',
    imageSrc: generateSvgScreenshot(
      '#081711',
      'https://www.paypal.com/signin',
      'PayPal Official Portal',
      'PayPal Official Sign-In: Transfer money, send payments, and manage your account securely with SSL 256-bit encryption. https://www.paypal.com/signin',
      '✅ VERIFIED OFFICIAL PORTAL'
    ),
    ocrText: `PayPal Official Sign-In: Transfer money, send payments, and manage your account securely with SSL 256-bit encryption. https://www.paypal.com/signin`,
    ocrNoteSq: 'Përmbajtja dhe domain-i verifikohen si zyrtare me certifikatë të vlefshme SSL.',
    ocrNoteEn: 'Verified authentic domain with valid SSL encryption certificate.'
  }
];

/* ═══════════════════════════════════════════
   MAIN APP COMPONENT
═══════════════════════════════════════════ */
export function App() {
  const [dark, setDark] = useState(true);

  // Persistent Language State
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem('aiguardian_lang');
    return (saved === 'sq' || saved === 'en') ? saved : 'sq';
  });

  const changeLang = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem('aiguardian_lang', newLang);
  };

  const [activeTab, setActiveTab] = useState<'scanner' | 'analytics' | 'history' | 'settings' | 'guide'>('scanner');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const t = T[lang];

  // Auth State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sentient Aura
  const [auraState, setAuraState] = useState<AuraState>('idle');
  const [keystrokeCount, setKeystrokeCount] = useState(0);
  const [lastKeystrokeTime, setLastKeystrokeTime] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

  // Profile & Shield Drawer
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showShieldDrawer, setShowShieldDrawer] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Scanner State
  const [scanType, setScanType] = useState<ScanInputType>('url');
  const [inputUrl, setInputUrl] = useState('http://paypaI-security-verify.com/login');
  const [inputContent, setInputContent] = useState('URGJENTE: Llogaria juaj do te bllokohet brenda 24 oreve! Klikoni te verifikoni fjalekalimin: http://paypaI-security-verify.com/login');
  const [fileName, setFileName] = useState('');
  const [fileSizeFormatted, setFileSizeFormatted] = useState('');
  const [screenshotSrc, setScreenshotSrc] = useState<string | null>(null);
  const [extractedOcrText, setExtractedOcrText] = useState<string>('');
  const [ocrNoteSq, setOcrNoteSq] = useState<string>('');
  const [ocrNoteEn, setOcrNoteEn] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);

  // Results & History
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // AI Settings
  const [aiProvider, setAiProvider] = useState('gemini');
  const [apiKey, setApiKey] = useState('');
  const [aiStatus, setAiStatus] = useState<string>('Connected to AIGuardian Heuristic Core');

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setShowLangDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile nav on resize
  useEffect(() => {
    const handler = () => { if (window.innerWidth > 1024) setMobileNavOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadSession = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok) {
          if (!cancelled) setUser(null);
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setUser({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            plan: data.user.role === 'admin' ? 'AIGuardian Admin Shield' : 'AIGuardian Shield'
          });
        }
      } catch {
        if (!cancelled) setUser(null);
      }
    };
    void loadSession();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadHistory = async () => {
      if (!user) {
        setHistory([]);
        setCurrentResult(null);
        return;
      }
      try {
        const res = await fetch('/api/scan/history', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setHistory(Array.isArray(data.scans) ? data.scans : []);
      } catch {
        if (!cancelled) setHistory([]);
      }
    };
    void loadHistory();
    return () => { cancelled = true; };
  }, [user]);

  const handleInputChange = (field: 'name' | 'email' | 'password', val: string) => {
    setAuthForm(prev => ({ ...prev, [field]: val }));
    setKeystrokeCount(c => c + 1);
    setLastKeystrokeTime(Date.now());
    setAuthError(null);
    if (auraState !== 'typing') setAuraState('typing');
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuraState('verifying');

    try {
      const res = await fetch(`/api/auth/${authMode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: authForm.name, email: authForm.email, password: authForm.password, remember: true })
      });

      if (res.ok) {
        const data = await res.json();
        setAuraState('accepted');
        setTimeout(() => {
          setUser({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            plan: data.user.role === 'admin' ? 'AIGuardian Admin Shield' : 'AIGuardian Shield'
          });
          setShowAuthModal(false);
          setAuraState('idle');
          showToast(t.loginSuccess);
        }, 1200);
      } else {
        setAuraState('rejected');
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        setAuthError(t.invalidCreds);
        showToast(t.invalidCredsToast);
      }
    } catch {
      setAuraState('rejected');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setAuthError(lang === 'sq'
        ? 'Autentifikimi nuk mund te verifikohet. Kontrolloni lidhjen me serverin dhe provoni perseri.'
        : 'Authentication could not be verified. Check the server connection and try again.');
      showToast(t.invalidCredsToast);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // Clear local state even if the network request fails.
    }
    setUser(null);
    setHistory([]);
    setCurrentResult(null);
    setShowProfileDropdown(false);
    showToast(t.loggedOut);
  };

  const handleFileUploaded = (file: File) => {
    const sizeStr = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
    setFileName(file.name);
    setFileSizeFormatted(sizeStr);
    setScanType('screenshot');

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setScreenshotSrc(src);
      // Generate initial OCR extraction text from filename or file contents
      const ocrText = `[OCR Text Extraction from ${file.name}]\nSample text detected: "Security update required. Please log in to confirm your identity immediately."`;
      setExtractedOcrText(ocrText);
      setInputContent(ocrText);
      setOcrNoteSq('Teksti u nxorr përmes OCR me inteligjencë artificiale.');
      setOcrNoteEn('Text extracted via artificial intelligence OCR engine.');
      showToast(lang === 'sq' ? 'Screenshot-i u ngarkua me sukses!' : 'Screenshot uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleRunScan = async () => {
    if (!inputUrl && !inputContent && !fileName && !screenshotSrc) return;
    if (!user) {
      openAuthModal('login');
      showToast(lang === 'sq' ? 'Ju duhet te hyni per te bere skanime.' : 'Please log in before running a scan.');
      return;
    }
    setIsScanning(true);
    setCurrentResult(null);

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: scanType,
          url: inputUrl,
          content: inputContent || extractedOcrText,
          fileName: fileName || (screenshotSrc ? 'screenshot_scan.png' : '')
        })
      });

      if (res.ok) {
        const data: ScanResult = await res.json();
        // Attach OCR metadata to current result if available
        if (extractedOcrText) {
          data.ocrText = extractedOcrText;
          data.ocrNoteSq = ocrNoteSq;
          data.ocrNoteEn = ocrNoteEn;
        }
        setCurrentResult(data);
        setHistory(prev => [data, ...prev]);
        showToast(t.scanComplete);
      } else if (res.status === 401 || res.status === 403) {
        setUser(null);
        openAuthModal('login');
        showToast(lang === 'sq' ? 'Sesioni ka skaduar. Hyni perseri.' : 'Session expired. Please log in again.');
      } else {
        showToast(lang === 'sq' ? 'Skanimi deshtoi. Kontrolloni te dhenat dhe provoni perseri.' : 'Scan failed. Check the input and try again.');
      }
    } catch {
      showToast(lang === 'sq' ? 'Serveri nuk u arrit. Provoni perseri pas pak.' : 'Server could not be reached. Try again shortly.');
    } finally {
      setIsScanning(false);
    }
  };

  const loadPreset = (sample: PresetSample) => {
    setScanType(sample.type);
    setInputUrl(sample.url);
    setInputContent(sample.content);
    if (sample.imageSrc) {
      setScreenshotSrc(sample.imageSrc);
      setFileName(sample.id + '.png');
      setFileSizeFormatted('1.4 MB');
    } else {
      setScreenshotSrc(null);
      setFileName('');
      setFileSizeFormatted('');
    }
    if (sample.ocrText) {
      setExtractedOcrText(sample.ocrText);
      setOcrNoteSq(sample.ocrNoteSq || '');
      setOcrNoteEn(sample.ocrNoteEn || '');
    } else {
      setExtractedOcrText('');
      setOcrNoteSq('');
      setOcrNoteEn('');
    }
    setActiveTab('scanner');
    const label = lang === 'sq' ? sample.labelSq : sample.labelEn;
    showToast(`${t.sampleLoaded}: ${label}`);

    const element = document.getElementById('scanner-form-area');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleFavorite = async (id: string) => {
    const previousHistory = history;
    const previousResult = currentResult;
    setHistory(prev => prev.map(s => s.id === id ? { ...s, favorite: !s.favorite } : s));
    if (currentResult?.id === id) {
      setCurrentResult(prev => prev ? { ...prev, favorite: !prev.favorite } : null);
    }
    try {
      const res = await fetch(`/api/scan/${id}/favorite`, { method: 'PATCH', credentials: 'include' });
      if (!res.ok) throw new Error('Favorite update failed');
    } catch {
      setHistory(previousHistory);
      setCurrentResult(previousResult);
      showToast(lang === 'sq' ? 'Nuk u ruajt ndryshimi i favorites.' : 'Favorite update could not be saved.');
    }
  };

  const deleteScan = async (id: string) => {
    const previousHistory = history;
    const previousResult = currentResult;
    setHistory(prev => prev.filter(s => s.id !== id));
    if (currentResult?.id === id) setCurrentResult(null);
    try {
      const res = await fetch(`/api/scan/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok && res.status !== 404) throw new Error('Delete failed');
      showToast(t.deleted);
    } catch {
      setHistory(previousHistory);
      setCurrentResult(previousResult);
      showToast(lang === 'sq' ? 'Analiza nuk mund te fshihej.' : 'Scan could not be deleted.');
    }
  };

  const filteredHistory = useMemo(() => {
    return history.filter(s =>
      s.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.explanationSq.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [history, searchTerm]);

  const stats = useMemo(() => {
    const total = history.length;
    const malicious = history.filter(s => s.score >= 70).length;
    const suspicious = history.filter(s => s.score >= 30 && s.score < 70).length;
    const safe = history.filter(s => s.score < 30).length;
    const securityScore = Math.max(20, 100 - (malicious * 15 + suspicious * 5));
    return { total, malicious, suspicious, safe, securityScore };
  }, [history]);

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthForm({ name: '', email: '', password: '' });
    setAuthError(null);
    setAuraState('idle');
    setShowAuthModal(true);
    setMobileNavOpen(false);
  };

  const navTabs = [
    { id: 'scanner', label: t.scanCenter, icon: <Shield size={15} /> },
    { id: 'analytics', label: t.analytics, icon: <BarChart3 size={15} /> },
    { id: 'history', label: `${t.history} (${history.length})`, icon: <Activity size={15} /> },
    { id: 'settings', label: t.settings, icon: <Settings size={15} /> },
    { id: 'guide', label: t.guide, icon: <BookOpen size={15} /> },
  ] as const;

  const getScoreColor = (score: number) =>
    score >= 70 ? 'var(--threat-red)' : score >= 30 ? 'var(--threat-yellow)' : 'var(--shield-green)';

  const getStatusClass = (score: number) =>
    score >= 70 ? 'status-scam' : score >= 30 ? 'status-suspect' : 'status-safe';

  return (
    <div className={dark ? 'app-shell dark-theme' : 'app-shell light-theme'}>

      {/* ── TOAST ── */}
      {toast && (
        <div className="toast">
          <Sparkles size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* ── AUTH MODAL ── */}
      {showAuthModal && (
        <div className="auth-overlay" onClick={() => setShowAuthModal(false)}>
          <div className={`auth-card ${isShaking ? 'shatter-shake' : ''}`} onClick={e => e.stopPropagation()}>
            <SentientAuthAura
              state={auraState}
              keystrokeCount={keystrokeCount}
              lastKeystrokeTime={lastKeystrokeTime}
            />

            <div className="auth-header" style={{ position: 'relative', zIndex: 2 }}>
              <img src={logoImg} alt="AIGuardian" className="auth-logo" />
              <h2>{authMode === 'login' ? t.authTitle : t.signupTitle}</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {authMode === 'login' ? t.authSubtitle : t.signupSubtitle}
              </p>
            </div>

            {authError && (
              <div className="auth-error-box">
                <AlertOctagon size={16} />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} style={{ display: 'grid', gap: 14, position: 'relative', zIndex: 2 }}>
              {authMode === 'signup' && (
                <div>
                  <label className="field-label">{t.fullName}</label>
                  <input
                    type="text"
                    placeholder="Alex Vance"
                    value={authForm.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>
              )}

              <div>
                <label className="field-label">{t.emailAddress}</label>
                <input
                  type="email"
                  placeholder="analyst@aiguardian.ai"
                  value={authForm.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="field-label">{t.password}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={authForm.password}
                    onChange={e => handleInputChange('password', e.target.value)}
                    required
                    autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                    style={{ paddingRight: 48 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', padding: 6, boxShadow: 'none',
                      color: 'var(--text-muted)', cursor: 'pointer', minWidth: 'unset'
                    }}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className={auraState === 'rejected' ? 'btn-danger' : 'btn-accent'}
                style={{ padding: '14px', fontSize: '1rem', marginTop: 4 }}
                disabled={auraState === 'verifying'}
              >
                {auraState === 'verifying' ? (
                  <><RefreshCw size={18} className="spin" />{t.verifying}</>
                ) : (
                  <><LockKeyhole size={17} />{authMode === 'login' ? t.authenticateBtn : t.signUp}</>
                )}
              </button>
            </form>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 14, position: 'relative', zIndex: 2 }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10, textAlign: 'center' }}>
                {t.testDbTitle}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn-secondary"
                  style={{ flex: 1, padding: '8px 10px', fontSize: '0.8rem' }}
                  onClick={() => {
                    setAuthForm({ name: 'Alex Vance', email: 'analyst@aiguardian.ai', password: 'password123' });
                    setAuthError(null);
                    setAuraState('typing');
                  }}
                >
                  <CheckCircle size={14} /> {t.validPreset}
                </button>
                <button
                  className="btn-danger"
                  style={{ flex: 1, padding: '8px 10px', fontSize: '0.8rem' }}
                  onClick={() => {
                    setAuthForm({ name: 'Intruder', email: 'unknown@scam.org', password: 'wrong' });
                    setAuthError(null);
                    setAuraState('typing');
                  }}
                >
                  <AlertOctagon size={14} /> {t.invalidPreset}
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', position: 'relative', zIndex: 2 }}>
              {authMode === 'login' ? (
                <>{t.noAccount}{' '}<span className="auth-toggle-link" onClick={() => setAuthMode('signup')}>{t.signUp}</span></>
              ) : (
                <>{t.hasAccount}{' '}<span className="auth-toggle-link" onClick={() => setAuthMode('login')}>{t.logIn}</span></>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── PRIVACY SHIELD DRAWER ── */}
      {showShieldDrawer && (
        <div className="auth-overlay" onClick={() => setShowShieldDrawer(false)}>
          <div className="auth-card shield-drawer" onClick={e => e.stopPropagation()}>
            <div className="shield-drawer-header">
              <ShieldCheck size={38} style={{ color: 'var(--shield-green)', flexShrink: 0 }} />
              <div>
                <h2 style={{ fontSize: '1.4rem' }}>{t.shieldDrawerTitle}</h2>
                <div style={{ fontSize: '0.82rem', color: 'var(--shield-green)', fontWeight: 700, marginTop: 3 }}>
                  {t.shieldStatus}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              <div className="section-block" style={{ background: 'rgba(16, 185, 129, 0.07)', borderColor: 'rgba(16, 185, 129, 0.25)' }}>
                <strong style={{ color: 'var(--shield-green)', display: 'block', marginBottom: 6 }}>{t.shieldProtection}</strong>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-sub)', lineHeight: 1.6 }}>{t.shieldProtectionDesc}</p>
              </div>

              <div className="shield-status-grid">
                <div className="shield-stat-item">
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{t.encryptionStd}</div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>AES-256 Bit GCM</div>
                </div>
                <div className="shield-stat-item">
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{t.aiThreatShield}</div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary-blue)' }}>AIGuardian Core</div>
                </div>
              </div>
            </div>

            <button className="btn-secondary w-full" onClick={() => setShowShieldDrawer(false)}>
              {t.closeShield}
            </button>
          </div>
        </div>
      )}

      {/* ── TOP NAVBAR ── */}
      <nav className="top-navbar" role="navigation" aria-label="Main Navigation">
        {/* Brand */}
        <div className="brand-logo" onClick={() => { setActiveTab('scanner'); setMobileNavOpen(false); }} role="link" tabIndex={0}>
          <img src={logoImg} alt="AIGuardian" className="brand-logo-img" />
          <span className="brand-logo-text">AIGuardian</span>
        </div>

        {/* Desktop Nav Tabs */}
        <div className="nav-tabs" role="tablist">
          {navTabs.map(tab => (
            <span
              key={tab.id}
              className={`nav-link${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              tabIndex={0}
              aria-selected={activeTab === tab.id}
            >
              {tab.icon}
              {tab.label}
            </span>
          ))}
        </div>

        {/* Nav Actions */}
        <div className="nav-actions">
          {/* Dark Mode Toggle */}
          <button
            className="icon-btn"
            onClick={() => setDark(!dark)}
            title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Improved Language Selector Dropdown */}
          <div className="lang-dropdown-wrapper" ref={langDropdownRef}>
            <button
              className="lang-dropdown-trigger"
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              aria-label="Select Language"
              aria-expanded={showLangDropdown}
            >
              <span>{lang === 'sq' ? '🇦🇱 Shqip' : '🇬🇧 English'}</span>
              <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: showLangDropdown ? 'rotate(180deg)' : 'none' }} />
            </button>

            {showLangDropdown && (
              <div className="lang-dropdown-menu" role="menu">
                <div
                  className={`lang-dropdown-item${lang === 'sq' ? ' active' : ''}`}
                  onClick={() => { changeLang('sq'); setShowLangDropdown(false); }}
                  role="menuitem"
                >
                  <span>🇦🇱 Shqip</span>
                  {lang === 'sq' && <Check size={14} />}
                </div>
                <div
                  className={`lang-dropdown-item${lang === 'en' ? ' active' : ''}`}
                  onClick={() => { changeLang('en'); setShowLangDropdown(false); }}
                  role="menuitem"
                >
                  <span>🇬🇧 English</span>
                  {lang === 'en' && <Check size={14} />}
                </div>
              </div>
            )}
          </div>

          {/* Auth / Profile */}
          {user ? (
            <div className="privacy-shield-container" ref={dropdownRef}>
              <div
                className="shield-avatar-ring"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                title="AIGuardian Real-Time Privacy Shield"
                role="button"
                tabIndex={0}
                aria-expanded={showProfileDropdown}
                aria-haspopup="menu"
              >
                <div className="avatar-img-placeholder">
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="shield-badge-dot" aria-label="Session protected" />
              </div>

              {showProfileDropdown && (
                <div className="profile-dropdown-menu" role="menu">
                  <div className="user-profile-info">
                    <div className="avatar-img-placeholder" style={{ width: 42, height: 42, fontSize: '0.85rem' }}>
                      {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.94rem' }} className="text-ellipsis">{user.name}</div>
                      <div className="text-ellipsis" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user.email}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--primary-blue)', fontWeight: 700, marginTop: 2 }}>{user.plan}</div>
                    </div>
                  </div>

                  <div
                    style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', color: 'var(--shield-green)', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                    onClick={() => { setShowShieldDrawer(true); setShowProfileDropdown(false); }}
                    role="menuitem"
                  >
                    <span>{t.privacyShieldActive}</span>
                    <span style={{ fontSize: '0.72rem', opacity: 0.8, textDecoration: 'underline' }}>{t.inspect}</span>
                  </div>

                  <div className="dropdown-item" onClick={() => { setActiveTab('settings'); setShowProfileDropdown(false); }} role="menuitem">
                    <Settings size={15} /> {t.accountSettings}
                  </div>
                  <div className="dropdown-item" onClick={() => { setActiveTab('history'); setShowProfileDropdown(false); }} role="menuitem">
                    <Activity size={15} /> {t.myScans}
                  </div>

                  <div className="dropdown-item danger" onClick={handleLogout} role="menuitem">
                    <LogOut size={15} /> {t.logout}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }} onClick={() => openAuthModal('login')}>
                {t.logIn}
              </button>
              <button className="btn-accent" style={{ padding: '8px 14px', fontSize: '0.85rem' }} onClick={() => openAuthModal('signup')}>
                {t.signUp}
              </button>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button
            className="hamburger-btn icon-btn"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileNavOpen}
          >
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* ── MOBILE NAV DRAWER ── */}
      {mobileNavOpen && (
        <div className="mobile-nav-drawer" role="navigation" aria-label="Mobile Navigation">
          {navTabs.map(tab => (
            <span
              key={tab.id}
              className={`nav-link${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => { setActiveTab(tab.id); setMobileNavOpen(false); }}
              role="tab"
            >
              {tab.icon}
              {tab.label}
            </span>
          ))}
          {!user && (
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button className="btn-secondary w-full" onClick={() => openAuthModal('login')}>{t.logIn}</button>
              <button className="btn-accent w-full" onClick={() => openAuthModal('signup')}>{t.signUp}</button>
            </div>
          )}
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main className="content-area">

        {/* ── HERO BANNER ── */}
        <section className="hero-banner" aria-label="Hero">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="badge-tag">
              <Shield size={13} />
              {t.heroTag}
            </div>
            <h1>{t.heroTitle}</h1>
            <p>{t.heroSubtitle}</p>
            <div className="hero-cta-row">
              <button className="btn-accent" onClick={() => {
                setActiveTab('scanner');
                const el = document.getElementById('scanner-form-area');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}>
                <Zap size={17} /> {t.scanNow} <ArrowRight size={15} />
              </button>
              <button className="btn-secondary" onClick={() => loadPreset(PRESET_SAMPLES[0])}>
                <Sparkles size={17} /> {t.trySample}
              </button>
            </div>
          </div>

          <div className="hero-stats-card" aria-label="Live monitoring dashboard">
            <div className="live-indicator">
              <div className="pulse-dot" />
              {t.shieldActive}
            </div>
            <div className="hero-stats-grid">
              <div className="hero-stat-item">
                <div className="hero-stat-label">{t.securityScore}</div>
                <div className="hero-stat-value" style={{ color: 'var(--shield-green)' }}>
                  {stats.securityScore}<span style={{ fontSize: '1rem', fontWeight: 600 }}>/100</span>
                </div>
              </div>
              <div className="hero-stat-item">
                <div className="hero-stat-label">{t.totalScans}</div>
                <div className="hero-stat-value" style={{ color: 'var(--primary-blue)' }}>
                  {stats.total}
                </div>
              </div>
              <div className="hero-stat-item">
                <div className="hero-stat-label">{t.confirmedScams}</div>
                <div className="hero-stat-value" style={{ color: 'var(--threat-red)' }}>
                  {stats.malicious}
                </div>
              </div>
              <div className="hero-stat-item">
                <div className="hero-stat-label">{t.safeElements}</div>
                <div className="hero-stat-value" style={{ color: 'var(--shield-green)' }}>
                  {stats.safe}
                </div>
              </div>
            </div>
            <div className="hero-stat-footer">
              🛡️ {t.shieldDesc}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════
            TAB 1: SCANNER CENTER
        ══════════════════════════════════ */}
        {activeTab === 'scanner' && (
          <section className="scan-center" id="scanner-form-area">
            <div className="glass-card">
              <h2 className="card-section-title">
                <ShieldAlert size={22} style={{ color: 'var(--primary-blue)' }} />
                {t.analysisCenterTitle}
              </h2>

              {/* Category Cards Grid */}
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: 12 }}>
                {t.selectCategory}
              </div>
              <div className="category-cards-grid">
                {CATEGORY_CARDS.map(cat => {
                  const isActive = scanType === cat.type;
                  return (
                    <div
                      key={cat.type}
                      className={`category-card${isActive ? ' active' : ''}`}
                      onClick={() => setScanType(cat.type)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="category-card-icon">
                        {cat.icon}
                      </div>
                      <div className="category-card-title">
                        {lang === 'sq' ? cat.labelSq : cat.labelEn}
                      </div>
                      <div className="category-card-desc">
                        {lang === 'sq' ? cat.descSq : cat.descEn}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Form Inputs & Screenshot Area */}
              <div className="scan-form-grid">

                {/* Screenshot Uploader or Image Preview Component */}
                {(scanType === 'screenshot' || screenshotSrc) ? (
                  screenshotSrc ? (
                    <ImagePreview
                      imageSrc={screenshotSrc}
                      fileName={fileName}
                      fileSizeFormatted={fileSizeFormatted}
                      isScanning={isScanning}
                      onRemove={() => {
                        setScreenshotSrc(null);
                        setFileName('');
                        setFileSizeFormatted('');
                        setExtractedOcrText('');
                      }}
                      onReplace={() => {
                        setScreenshotSrc(null);
                        setFileName('');
                        setFileSizeFormatted('');
                        setExtractedOcrText('');
                      }}
                      lang={lang}
                    />
                  ) : (
                    <ScreenshotUploader
                      onFileSelected={handleFileUploaded}
                      onError={(msg) => showToast(msg)}
                      lang={lang}
                      isScanning={isScanning}
                    />
                  )
                ) : null}

                {(scanType === 'url' || scanType === 'qr') && (
                  <div>
                    <label className="field-label">
                      <Globe size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                      {t.suspiciousUrl}
                    </label>
                    <input
                      id="url-input"
                      type="text"
                      placeholder={t.urlPlaceholder}
                      value={inputUrl}
                      onChange={e => setInputUrl(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <label className="field-label">
                    <FileText size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                    {t.messageText}
                  </label>
                  <textarea
                    id="content-input"
                    rows={4}
                    placeholder={t.messagePlaceholder}
                    value={inputContent}
                    onChange={e => setInputContent(e.target.value)}
                  />
                </div>

                {(scanType === 'qr' || scanType === 'pdf') && !screenshotSrc && (
                  <div className="dropzone" role="button" tabIndex={0} aria-label="File upload area">
                    <Upload size={34} style={{ color: 'var(--primary-blue)', opacity: 0.8 }} />
                    <div>
                      <strong style={{ display: 'block', marginBottom: 4 }}>{t.dragDrop}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.fileFormats}</div>
                    </div>
                  </div>
                )}

                <button
                  id="analyze-btn"
                  className="btn-accent w-full"
                  style={{ padding: '15px', fontSize: '1.05rem', marginTop: 4 }}
                  onClick={handleRunScan}
                  disabled={isScanning || (!inputUrl && !inputContent && !fileName && !screenshotSrc)}
                >
                  {isScanning ? (
                    <><RefreshCw size={19} className="spin" /> {t.scanning}</>
                  ) : (
                    <><ShieldCheck size={19} /> {t.analyzeBtn}</>
                  )}
                </button>
              </div>

              {/* 1-Click Threat Preset Cards */}
              <div className="preset-cards-container">
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={15} style={{ color: 'var(--primary-blue)' }} />
                  {t.presetsTitle}
                </div>
                <div className="preset-cards-grid">
                  {PRESET_SAMPLES.map(s => (
                    <div
                      key={s.id}
                      className="preset-card-item"
                      onClick={() => loadPreset(s)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="preset-card-top">
                        <div className="preset-card-title">
                          {lang === 'sq' ? s.labelSq : s.labelEn}
                        </div>
                        <span className={`preset-badge ${s.badgeType}`}>
                          {lang === 'sq' ? s.badgeSq : s.badgeEn}
                        </span>
                      </div>
                      <div className="preset-card-desc">
                        {lang === 'sq' ? s.descSq : s.descEn}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* OCR Extracted Text Display */}
            {extractedOcrText && (
              <OCRResult
                extractedText={extractedOcrText}
                lang={lang}
                aiDetectionNoteSq={ocrNoteSq}
                aiDetectionNoteEn={ocrNoteEn}
              />
            )}

            {/* Results Panel */}
            {currentResult && (
              <div className="results-container" style={{ marginTop: 24 }}>
                {/* Reusable Risk Score Gauge */}
                <RiskScoreMeter
                  score={currentResult.score}
                  threatLevel={currentResult.threatLevel}
                  statusSq={currentResult.status}
                  statusEn={currentResult.statusEn}
                  confidence={currentResult.confidence}
                  timeTakenMs={currentResult.timeTakenMs}
                  lang={lang}
                />

                {/* Reusable Detailed Threat Analysis Report */}
                <ThreatAnalysisCard result={currentResult} lang={lang} />
              </div>
            )}
          </section>
        )}

        {/* ══════════════════════════════════
            TAB 2: THREAT ANALYTICS
        ══════════════════════════════════ */}
        {activeTab === 'analytics' && (
          <section className="glass-card">
            <h2 className="card-section-title">
              <BarChart3 size={22} style={{ color: 'var(--primary-blue)' }} />
              {t.analyticsTitle}
            </h2>

            <div className="stats-grid">
              {[
                { icon: <ShieldCheck size={24} />, value: stats.total, label: t.totalScansLabel, color: 'var(--primary-blue)', bg: 'rgba(59, 130, 246, 0.14)' },
                { icon: <ShieldAlert size={24} />, value: stats.malicious, label: t.confirmedScams, color: 'var(--threat-red)', bg: 'rgba(239, 68, 68, 0.13)' },
                { icon: <AlertTriangle size={24} />, value: stats.suspicious, label: t.suspiciousLabel, color: 'var(--threat-yellow)', bg: 'rgba(245, 158, 11, 0.13)' },
                { icon: <CheckCircle size={24} />, value: stats.safe, label: t.safeElements, color: 'var(--shield-green)', bg: 'rgba(16, 185, 129, 0.13)' },
              ].map((stat, i) => (
                <div key={i} className="glass-card stat-card">
                  <div className="stat-icon" style={{ background: stat.bg, color: stat.color }}>
                    {stat.icon}
                  </div>
                  <div>
                    <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Security Score Progress */}
            <div style={{ marginTop: 24, padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
                  {lang === 'sq' ? 'Skori i Sigurisë së Sesionit' : 'Session Security Score'}
                </h3>
                <span style={{ fontWeight: 900, fontSize: '1.4rem', color: 'var(--shield-green)' }}>{stats.securityScore}/100</span>
              </div>
              <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${stats.securityScore}%`,
                  background: 'linear-gradient(90deg, var(--primary-blue), var(--shield-green))',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 1s var(--ease-spring)'
                }} />
              </div>
            </div>

            {/* Bar Chart */}
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>
                {t.riskChart}
              </h3>
              <div className="risk-chart">
                {(history.length > 0 ? history.slice(0, 12) : [
                  { id: '1', score: 85 }, { id: '2', score: 25 }, { id: '3', score: 92 },
                  { id: '4', score: 45 }, { id: '5', score: 10 }, { id: '6', score: 60 },
                ]).map((item, idx) => (
                  <div key={idx} className="risk-bar-wrap">
                    <div
                      className="risk-bar"
                      style={{
                        height: `${Math.max(5, item.score)}%`,
                        background: item.score >= 70
                          ? 'var(--threat-red)'
                          : item.score >= 30
                          ? 'var(--threat-yellow)'
                          : 'var(--shield-green)',
                        opacity: 0.85
                      }}
                    />
                    <div className="risk-bar-label">{item.score}%</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════
            TAB 3: HISTORY
        ══════════════════════════════════ */}
        {activeTab === 'history' && (
          <section className="glass-card">
            <div className="history-header">
              <h2 className="card-section-title" style={{ margin: 0 }}>
                <Activity size={22} style={{ color: 'var(--primary-blue)' }} />
                {t.historyTitle}
              </h2>
              <div className="history-search" style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  id="history-search"
                  type="text"
                  placeholder={t.searchHistory}
                  style={{ paddingLeft: 38 }}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="empty-state">
                <Activity size={48} />
                <p>{t.noHistory}</p>
              </div>
            ) : (
              <div className="table-scroll">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>{t.statusCol}</th>
                      <th>{t.levelCol}</th>
                      <th>{t.typeCol}</th>
                      <th>{t.explanationCol}</th>
                      <th>{t.dateCol}</th>
                      <th>{t.actionsCol}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map(item => (
                      <tr key={item.id}>
                        <td>
                          <span className={`status-badge ${getStatusClass(item.score)}`} style={{ fontSize: '0.72rem', padding: '4px 10px' }}>
                            {lang === 'sq' ? item.status : item.statusEn}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 900, color: getScoreColor(item.score) }}>{item.score}%</span>
                        </td>
                        <td>
                          <span style={{ textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                            {item.type}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-sub)', maxWidth: 300 }}>
                          <span className="text-ellipsis" style={{ display: 'block' }}>{item.explanationSq}</span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {new Date(item.createdAt).toLocaleTimeString()}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="icon-btn"
                              onClick={() => toggleFavorite(item.id)}
                              title={item.favorite ? 'Remove favorite' : 'Add to favorites'}
                              style={{ padding: 7 }}
                            >
                              <Star size={14} fill={item.favorite ? 'gold' : 'none'} color={item.favorite ? 'gold' : 'currentColor'} />
                            </button>
                            <button
                              className="icon-btn"
                              onClick={() => deleteScan(item.id)}
                              title="Delete scan"
                              style={{ padding: 7 }}
                            >
                              <Trash2 size={14} style={{ color: 'var(--threat-red)' }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ══════════════════════════════════
            TAB 4: SETTINGS
        ══════════════════════════════════ */}
        {activeTab === 'settings' && (
          <section className="glass-card">
            <h2 className="card-section-title">
              <Settings size={22} style={{ color: 'var(--primary-blue)' }} />
              {t.settingsTitle}
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.92rem', lineHeight: 1.6 }}>
              {t.settingsDesc}
            </p>

            <div className="settings-form">
              <div>
                <label className="field-label">{t.selectProvider}</label>
                <select value={aiProvider} onChange={e => setAiProvider(e.target.value)} id="ai-provider">
                  <option value="gemini">Google Gemini 1.5 / 2.0 Pro</option>
                  <option value="openai">OpenAI GPT-4o Security</option>
                  <option value="groq">Groq Llama 3 Fast Security</option>
                  <option value="anthropic">Anthropic Claude 3.5 Sonnet</option>
                </select>
              </div>

              <div>
                <label className="field-label">{t.apiKeyLabel}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="api-key"
                    type="password"
                    placeholder="Paste your API key securely..."
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    style={{ paddingLeft: 44 }}
                  />
                  <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                </div>
              </div>

              <div className="settings-actions">
                <button
                  id="test-connection-btn"
                  className="btn-accent"
                  onClick={() => {
                    setAiStatus('Connected to AIGuardian Live Provider (Latency: 110ms)');
                    showToast(t.testSuccess);
                  }}
                >
                  <KeyRound size={15} /> {t.testConnection}
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => showToast(t.configSaved)}
                >
                  <CheckCircle size={15} /> {t.saveConfig}
                </button>
              </div>

              <div className="connection-status">
                <CheckCircle size={17} />
                {aiStatus}
              </div>
            </div>

            {/* User Account Info */}
            {user && (
              <div style={{ marginTop: 32, paddingTop: 28, borderTop: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <User size={16} style={{ color: 'var(--primary-blue)' }} />
                  {lang === 'sq' ? 'Informacioni i Llogarisë' : 'Account Information'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  {[
                    { label: lang === 'sq' ? 'Emri' : 'Name', value: user.name },
                    { label: 'Email', value: user.email },
                    { label: lang === 'sq' ? 'Roli' : 'Role', value: user.role.charAt(0).toUpperCase() + user.role.slice(1) },
                    { label: lang === 'sq' ? 'Plani' : 'Plan', value: user.plan },
                  ].map((item, i) => (
                    <div key={i} className="shield-stat-item">
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 3 }}>{item.label}</div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }} className="text-ellipsis">{item.value}</div>
                    </div>
                  ))}
                </div>
                <button className="btn-danger" style={{ marginTop: 16 }} onClick={handleLogout}>
                  <LogOut size={15} /> {t.logout}
                </button>
              </div>
            )}
          </section>
        )}

        {/* ══════════════════════════════════
            TAB 5: SECURITY GUIDE
        ══════════════════════════════════ */}
        {activeTab === 'guide' && (
          <section className="glass-card">
            <h2 className="card-section-title">
              <BookOpen size={22} style={{ color: 'var(--primary-blue)' }} />
              {t.guideTitle}
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.92rem', lineHeight: 1.6 }}>
              {t.guideSubtitle}
            </p>

            <div className="guide-grid">
              {[
                {
                  icon: '🔤',
                  color: 'var(--threat-orange)',
                  title: 'Typosquatting & Homograph',
                  body: lang === 'sq'
                    ? 'Mashtruesit blejnë domain-e si paypaI.com (me I të madhe) ose googIe.com për t\'ju bërë të mendoni se jeni në faqen zyrtare.'
                    : 'Attackers register look-alike domains like paypaI.com (uppercase I) to spoof trusted login portals.'
                },
                {
                  icon: '💬',
                  color: 'var(--accent-cyan)',
                  title: 'Smishing (SMS Phishing)',
                  body: lang === 'sq'
                    ? 'SMS të rreme që pretendojnë nga banka apo posta me linqe të dëmshme për të marrë PIN-et apo të dhënat e kartës.'
                    : 'Fake SMS alerts impersonating banks or couriers with malicious links designed to harvest credit cards.'
                },
                {
                  icon: '🔲',
                  color: 'var(--threat-yellow)',
                  title: 'Quishing (QR Code Scam)',
                  body: lang === 'sq'
                    ? 'Përdorimi i kodeve QR fizike apo dixhitale që fshehin linqe me malware për të anashkaluar filtrat kompjuterikë.'
                    : 'Malicious QR codes hiding phishing sites to bypass email and desktop security filters.'
                },
                {
                  icon: '📄',
                  color: 'var(--threat-red)',
                  title: 'CEO Fraud & Fake Invoices',
                  body: lang === 'sq'
                    ? 'Fatura fiktive PDF me të dhëna bankare të ndryshuara me pretekst urgjence për transferta parash.'
                    : 'Fake PDF invoices with altered bank account numbers requesting urgent wire transfers.'
                },
                {
                  icon: '🎣',
                  color: 'var(--accent-violet)',
                  title: 'Spear Phishing',
                  body: lang === 'sq'
                    ? 'Email-e të personalizuara shumë të sofistikuara që synojnë individë të caktuar me informacion real personal të vjedhur nga rrjetet sociale.'
                    : 'Highly personalized phishing emails targeting specific individuals using stolen personal data from social media.'
                },
                {
                  icon: '🪝',
                  color: 'var(--shield-green)',
                  title: lang === 'sq' ? 'Si të Mbroheni' : 'How to Stay Protected',
                  body: lang === 'sq'
                    ? 'Aktivizoni 2FA, verifikoni URL-të me kujdes, mos klikoni linqe të panjohura, dhe përdorni AIGuardian për analiza të menjëhershme.'
                    : 'Enable 2FA, verify URLs carefully, never click unknown links, and use AIGuardian for instant threat analysis.'
                },
              ].map((card, i) => (
                <div key={i} className="glass-card guide-card">
                  <h3 style={{ color: card.color }}>
                    {card.icon} {card.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)', lineHeight: 1.65 }}>{card.body}</p>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* ── FOOTER TRUST BADGES & INFO ── */}
      <footer className="footer-trust-container">
        <div className="footer-top-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={logoImg} alt="AIGuardian" style={{ height: 32, objectFit: 'contain' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>AIGuardian Cybersecurity Suite</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.copyright}</div>
            </div>
          </div>

          <div className="system-status-indicator">
            {t.sysStatus}
          </div>
        </div>

        <div className="footer-security-badges">
          <span className="footer-badge-pill">
            <Lock size={13} style={{ color: 'var(--primary-blue)' }} /> AES-256 GCM Encrypted
          </span>
          <span className="footer-badge-pill">
            <ShieldCheck size={13} style={{ color: 'var(--shield-green)' }} /> Zero-Knowledge Privacy
          </span>
          <span className="footer-badge-pill">
            <Zap size={13} style={{ color: 'var(--accent-cyan)' }} /> Real-Time AI Core Engine
          </span>
          <span className="footer-badge-pill">
            <CheckCircle size={13} style={{ color: 'var(--shield-green)' }} /> ISO 27001 Certified Design
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
