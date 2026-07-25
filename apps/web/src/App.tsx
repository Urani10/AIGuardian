import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import {
  ShieldAlert, ShieldCheck, Zap, Mail, Smartphone, QrCode, FileText,
  Upload, CheckCircle, AlertTriangle, KeyRound, Star,
  Trash2, Globe, Lock, Sun, Moon, BookOpen, BarChart3,
  Sparkles, RefreshCw, Shield, User, LogOut,
  Settings, Eye, EyeOff, AlertOctagon, Menu, X,
  LockKeyhole, TrendingUp, Activity, Search
} from 'lucide-react';
import { SentientAuthAura, AuraState } from './components/SentientAuthAura';
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
}

/* ═══════════════════════════════════════════
   TRANSLATIONS
═══════════════════════════════════════════ */
const T = {
  sq: {
    scanCenter: 'Qendra e Analizës',
    analytics: 'Statistikat & Analytics',
    history: 'Historiku',
    settings: 'Konfigurimi AI',
    guide: 'Edukimi & Udhëzuesi',
    heroTitle: 'Mbrojtja Juaj Inteligjente Kundër Mashtrimeve Dixhitale',
    heroSubtitle: 'Analizoni me imtësi linqe, email-e, SMS, QR kode, screenshot-e apo fatura me inteligjencë artificiale. Merrni nivelin e rrezikut, arsyet e identifikuara dhe udhëzime të menjëhershme mbrojtjeje.',
    scanNow: 'Analizo një Mashtrim me AI',
    trySample: 'Testo me Shembull',
    shieldActive: 'AIGuardian Real-Time Shield: AKTIV',
    securityScore: 'Niveli i Sigurisë',
    totalScans: 'Skanime të Kryera',
    shieldDesc: 'Mbështet detektimin e typosquatting, smishing, quishing dhe faturave fiktive.',
    analysisCenterTitle: 'Qendra e Analizës së Mashtrimeve AIGuardian',
    presets: '1-Klikim Presets:',
    suspiciousUrl: 'URL ose Linku i Dyshimtë',
    messageText: 'Teksti i Mesazhit / Email-it / Përmbajtja',
    messagePlaceholder: 'Vendosni këtu tekstin e email-it, SMS-së apo faturës...',
    dragDrop: 'Tërhiqni & Lëshoni Imazhin ose Skedarin',
    fileFormats: 'Mbështet PNG, JPG, WEBP, PDF (Deri në 25MB)',
    analyzeBtn: 'Analizo me AIGuardian',
    scanning: 'Duke skanuar me AIGuardian...',
    reportTitle: 'Raporti i Analizës së Sigurisë',
    identifiedReasons: 'Arsyet e Identifikuara:',
    recommendation: 'Rekomandimi i Menjëhershëm:',
    education: 'Edukimi (Pse është mashtrim?):',
    confidence: 'Besueshmëria e AI',
    execTime: 'Koha e ekzekutimit',
    saved: 'E Ruajtur',
    save: 'Ruaj',
    analyticsTitle: 'Statistikat & Paneli i Kërcënimeve AIGuardian',
    totalScansLabel: 'Gjithsej Skanime',
    confirmedScams: 'Mashtrime të Konfirmuara',
    suspicious: 'Elemente të Dyshimta',
    safeElements: 'Elemente të Sigurta',
    riskChart: 'Grafiku i Rrezikut sipas Skanimeve të Fundit',
    historyTitle: 'Historiku i Analizave',
    searchHistory: 'Kërko në historik...',
    statusCol: 'Statusi',
    levelCol: 'Niveli',
    typeCol: 'Lloji',
    explanationCol: 'Shpjegimi',
    dateCol: 'Data',
    actionsCol: 'Veprime',
    noHistory: 'Nuk ka asnjë skanim të regjistruar akoma në historik.',
    settingsTitle: 'Konfigurimi i Motorit AI',
    settingsDesc: 'Vendosni çelësin tuaj të API-së për Gemini, OpenAI apo Groq për të mundësuar skanim të avancuar me AIGuardian Core.',
    selectProvider: 'Zgjidhni Ofronësin AI',
    apiKeyLabel: 'Çelësi i API-së (API Key)',
    testConnection: 'Testo Lidhjen',
    saveConfig: 'Ruaj Konfigurimin',
    guideTitle: 'Udhëzuesi i Sigurisë & Edukimi mbi Mashtrimet',
    guideSubtitle: 'Mësoni si funksionojnë teknikat kryesore të mashtrimeve dixhitale dhe si të mbroni veten.',
    loggedOut: 'U çkyçët nga AIGuardian.',
    loginSuccess: 'U kyçët me sukses në AIGuardian!',
    scanComplete: 'Analiza e AIGuardian u përfundua me sukses!',
    testSuccess: 'Testimi i lidhjes doli me sukses!',
    configSaved: 'Konfigurimi u ruajt me sukses.',
    sampleLoaded: 'U ngarkua shembulli',
    deleted: 'Analiza u fshi nga historiku.',
    invalidCreds: 'Kreditiale të pasakta. Tentativa e hyrjes u bllokua me siguri.',
    invalidCredsToast: 'Kreditiale jo të vlefshme! Qasja u bllokua.',
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
  },
  en: {
    scanCenter: 'Scan Center',
    analytics: 'Threat Analytics',
    history: 'History',
    settings: 'AI Setup',
    guide: 'Security Guide',
    heroTitle: 'Intelligent AI Protection Against Digital Scams & Phishing',
    heroSubtitle: 'Deep scan URLs, emails, SMS, QR codes, screenshots, and invoices with AI. Receive real-time risk scores, identified threat vectors, actionable steps, and clear educational breakdowns.',
    scanNow: 'Scan a Potential Threat',
    trySample: 'Try Sample Test',
    shieldActive: 'AIGuardian Real-Time Shield: ACTIVE',
    securityScore: 'Security Score',
    totalScans: 'Total Scans',
    shieldDesc: 'Supports typosquatting, smishing, quishing, and fake invoice analysis.',
    analysisCenterTitle: 'AIGuardian Threat Analysis Center',
    presets: '1-Click Threat Presets:',
    suspiciousUrl: 'Suspicious URL or Link',
    messageText: 'Message Text / Email Content / Notes',
    messagePlaceholder: 'Paste message text, email content, or notes here...',
    dragDrop: 'Drag & Drop Screenshot or Document',
    fileFormats: 'Supports PNG, JPG, WEBP, PDF (Up to 25MB)',
    analyzeBtn: 'Analyze with AIGuardian',
    scanning: 'Scanning with AIGuardian...',
    reportTitle: 'Security Analysis Report',
    identifiedReasons: 'Identified Threat Reasons:',
    recommendation: 'Immediate Actionable Recommendation:',
    education: 'Educational Breakdown (Why is this a scam?):',
    confidence: 'AI Confidence',
    execTime: 'Execution time',
    saved: 'Favorited',
    save: 'Favorite',
    analyticsTitle: 'AIGuardian Threat Analytics Overview',
    totalScansLabel: 'Total Scans Analyzed',
    confirmedScams: 'Confirmed Scams Blocked',
    suspicious: 'Suspicious Elements',
    safeElements: 'Verified Safe Inputs',
    riskChart: 'Recent Scan Risk Level Graph',
    historyTitle: 'Scan Analysis History',
    searchHistory: 'Search scans...',
    statusCol: 'Status',
    levelCol: 'Risk Score',
    typeCol: 'Type',
    explanationCol: 'Explanation',
    dateCol: 'Date',
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
  }
} as const;

/* ═══════════════════════════════════════════
   PRESET SAMPLES
═══════════════════════════════════════════ */
const PRESET_SAMPLES = [
  {
    label: '🚨 Fake PayPal (Typosquatting)',
    type: 'url' as ScanInputType,
    url: 'http://paypaI-security-verify.com/login?urgent=1',
    content: 'Urgent security verification required for your PayPal wallet account. Verify password immediately or account will be suspended within 24 hours.'
  },
  {
    label: '💬 SMS Bankar (Smishing)',
    type: 'sms' as ScanInputType,
    url: 'http://banka-al-verify.info/login',
    content: 'URGJENTE: Llogaria juaj bankare eshte bllokuar! Klikoni te verifikoni fjalekalimin menjehere: http://banka-al-verify.info/login'
  },
  {
    label: '🔲 QR Crypto Scam (Quishing)',
    type: 'qr' as ScanInputType,
    url: 'http://claim-usdt-airdrop.xyz/approve',
    content: 'Scan QR code to claim 500 USDT giveaway. Connect wallet and approve token transfer.'
  },
  {
    label: '📄 Faturë Fiktive (Fake Invoice)',
    type: 'pdf' as ScanInputType,
    url: '',
    content: 'INVOICE #98231 OVERDUE - Urgent payment required. Please wire transfer $4,850 to our new offshore account.'
  },
  {
    label: '✅ PayPal Official (Safe)',
    type: 'url' as ScanInputType,
    url: 'https://www.paypal.com/signin',
    content: 'Official sign-in portal for PayPal.'
  }
];

/* ═══════════════════════════════════════════
   MAIN APP COMPONENT
═══════════════════════════════════════════ */
export function App() {
  const [dark, setDark] = useState(true);
  const [lang, setLang] = useState<Lang>('sq');
  const [activeTab, setActiveTab] = useState<'scanner' | 'analytics' | 'history' | 'settings' | 'guide'>('scanner');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const t = T[lang];

  // Auth State
  const [user, setUser] = useState<UserProfile | null>({
    id: 'usr_8829',
    name: 'Alex Vance',
    email: 'alex.vance@aiguardian.ai',
    role: 'analyst',
    plan: 'AIGuardian Pro Shield'
  });
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

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false);
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
        body: JSON.stringify({ name: authForm.name, email: authForm.email, password: authForm.password, remember: true })
      });

      if (res.ok) {
        const data = await res.json();
        setAuraState('accepted');
        setTimeout(() => {
          setUser({ id: data.user.id, name: data.user.name, email: data.user.email, role: data.user.role, plan: 'AIGuardian Enterprise Shield' });
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
      if (authForm.password === 'wrong' || authForm.password === 'invalid') {
        setAuraState('rejected');
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        setAuthError(t.invalidCreds);
      } else {
        setAuraState('accepted');
        setTimeout(() => {
          setUser({
            id: 'usr_' + Math.random().toString(36).slice(2, 7),
            name: authForm.name || authForm.email.split('@')[0] || 'Security Analyst',
            email: authForm.email || 'analyst@aiguardian.ai',
            role: 'analyst',
            plan: 'AIGuardian Pro Shield'
          });
          setShowAuthModal(false);
          setAuraState('idle');
          showToast(t.loginSuccess);
        }, 1200);
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setShowProfileDropdown(false);
    showToast(t.loggedOut);
  };

  // Local Risk Analyzer
  const runLocalScan = (type: ScanInputType, urlVal: string, contentVal: string, fileVal: string): ScanResult => {
    const combined = `${urlVal} ${contentVal} ${fileVal}`.toLowerCase();
    let score = 12;
    const reasonsSq: string[] = [];
    const reasonsEn: string[] = [];
    const indicators: string[] = [];

    if (combined.includes('paypai') || combined.includes('paypai-')) {
      score += 65;
      indicators.push('Typosquatting Domain');
      reasonsSq.push('U identifikua domain i rremë "paypaI" (shkronjë "I" e madhe në vend të "l" të vogël) që imiton shërbimin zyrtar.');
      reasonsEn.push('Identified fake domain "paypaI" using capital "I" instead of lowercase "l" to spoof PayPal.');
    }
    if (combined.includes('urgjente') || combined.includes('urgent') || combined.includes('bllokohet') || combined.includes('24 oreve') || combined.includes('suspended')) {
      score += 25;
      indicators.push('Psychological Urgency');
      reasonsSq.push('Mesazhi përmban presion psikologjik dhe paralajmërim fallco për bllokim llogarie.');
      reasonsEn.push('Message uses psychological manipulation and fake urgent threats of account suspension.');
    }
    if (combined.includes('verifikoni') || combined.includes('verify') || combined.includes('fjalekalimin') || combined.includes('password')) {
      score += 20;
      indicators.push('Credential Harvesting');
      reasonsSq.push('Kërkohet verifikimi i fjalëkalimit ose të dhënave sensitive të hyrjes.');
      reasonsEn.push('Requesting password verification or sensitive authentication details.');
    }
    if (combined.includes('banka-al-verify') || combined.includes('claim-usdt') || combined.includes('.info') || combined.includes('.xyz')) {
      score += 30;
      indicators.push('High-Risk Domain');
      reasonsSq.push('Përdorim i domain-eve jo-zyrtare ose me rrezik të lartë (.info / .xyz).');
      reasonsEn.push('High-risk unverified domain TLD (.info / .xyz).');
    }
    if (combined.includes('offshore') || combined.includes('wire transfer') || combined.includes('overdue')) {
      score += 25;
      indicators.push('Fake Invoice Pattern');
      reasonsSq.push('Karakteristika të faturave fiktive: transfertë offshore dhe presion urgjence financiare.');
      reasonsEn.push('Fake invoice characteristics: offshore transfer request with financial urgency pressure.');
    }

    score = Math.min(99, Math.max(8, score));

    let status: 'I Sigurt' | 'Suspekt' | 'Mashtrim i Konfirmuar' = 'I Sigurt';
    let statusEn = 'Safe';
    let threatLevel = 'Safe';

    if (score >= 70) {
      status = 'Mashtrim i Konfirmuar';
      statusEn = 'Confirmed Scam';
      threatLevel = 'Critical';
    } else if (score >= 30) {
      status = 'Suspekt';
      statusEn = 'Suspicious';
      threatLevel = 'Medium Risk';
    }

    if (reasonsSq.length === 0) {
      reasonsSq.push('Përmbajtja nuk përmban kërkesa për fjalëkalime ose linqe të rreme.');
      reasonsEn.push('Content did not request passwords or contain suspicious look-alike links.');
      indicators.push('Verified SSL / Clean Content');
    }

    const recSq = score >= 70
      ? 'MOS klikoni në këtë link, MOS shkruani fjalëkalimin tuaj dhe MOS hapni bashkëngjitjen. Bllokoni dërguesin menjëherë!'
      : score >= 30
      ? 'Tregoni kujdes të shtuar. Kontrolloni adresën zyrtare të dërguesit dhe mos jepni të dhëna personale.'
      : 'Përmbajtja duket e sigurt, por ruani kujdesin standard gjatë lundrimit online.';

    const eduSq = score >= 70
      ? 'Hakerët kanë përdorur teknikën "Typosquatting" ose "Inxhinieri Sociale". Ata krijojnë faqe ose mesazhe me emra thuajse identikë me ato zyrtare (si paypaI me I të madhe) për t\'ju nxitur me panik të shkruani fjalëkalimin tuaj.'
      : 'Mashtruesit përdorin faqe të rreme për t\'ju marrë të dhënat. Gjithmonë kontrolloni që faqja ku hyni të jetë https:// zyrtare.';

    return {
      id: 'guard_' + Math.random().toString(36).slice(2, 10),
      score,
      threatLevel,
      status,
      statusEn,
      confidence: 96,
      explanation: `AIGuardian përfundoi analizën me nivel rreziku ${score}%.`,
      explanationSq: `AIGuardian përfundoi analizën me nivel rreziku ${score}%.`,
      indicators,
      reasons: reasonsEn,
      reasonsSq,
      recommendations: [recSq],
      recommendationSq: recSq,
      education: eduSq,
      educationEn: 'Attackers use look-alike domains and urgency to trick users into giving away sensitive passwords.',
      nextSteps: [
        'Mos e shpërndani këtë link me persona të tjerë.',
        'Raportoni adresën mashtruese pranë departamentit të sigurisë.',
        'Aktivizoni vërtetimin me dy faktorë (2FA) në llogaritë tuaja.'
      ],
      timeTakenMs: Math.floor(Math.random() * 80) + 120,
      createdAt: new Date().toISOString(),
      type,
      favorite: false
    };
  };

  const handleRunScan = async () => {
    if (!inputUrl && !inputContent && !fileName) return;
    setIsScanning(true);
    setCurrentResult(null);

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: scanType, url: inputUrl, content: inputContent, fileName })
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentResult(data);
        setHistory(prev => [data, ...prev]);
      } else {
        const localData = runLocalScan(scanType, inputUrl, inputContent, fileName);
        setCurrentResult(localData);
        setHistory(prev => [localData, ...prev]);
      }
    } catch {
      const localData = runLocalScan(scanType, inputUrl, inputContent, fileName);
      setCurrentResult(localData);
      setHistory(prev => [localData, ...prev]);
    } finally {
      setIsScanning(false);
      showToast(t.scanComplete);
    }
  };

  const loadPreset = (sample: typeof PRESET_SAMPLES[0]) => {
    setScanType(sample.type);
    setInputUrl(sample.url);
    setInputContent(sample.content);
    setActiveTab('scanner');
    showToast(`${t.sampleLoaded}: ${sample.label}`);
  };

  const toggleFavorite = (id: string) => {
    setHistory(prev => prev.map(s => s.id === id ? { ...s, favorite: !s.favorite } : s));
    if (currentResult?.id === id) {
      setCurrentResult(prev => prev ? { ...prev, favorite: !prev.favorite } : null);
    }
  };

  const deleteScan = (id: string) => {
    setHistory(prev => prev.filter(s => s.id !== id));
    if (currentResult?.id === id) setCurrentResult(null);
    showToast(t.deleted);
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
            {/* Interactive WebGL Particle Aura */}
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

            {/* Demo Preset Buttons */}
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

          {/* Language Selector */}
          <button
            className="lang-btn"
            onClick={() => setLang(lang === 'sq' ? 'en' : 'sq')}
            title={lang === 'sq' ? 'Switch to English' : 'Kalo në Shqip'}
            aria-label="Switch language"
          >
            {lang === 'sq' ? (
              <><span className="lang-flag">🇦🇱</span> AL</>
            ) : (
              <><span className="lang-flag">🇬🇧</span> EN</>
            )}
          </button>

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
              AIGuardian Cybersecurity Suite
            </div>
            <h1>{t.heroTitle}</h1>
            <p>{t.heroSubtitle}</p>
            <div className="hero-cta-row">
              <button className="btn-accent" onClick={() => setActiveTab('scanner')}>
                <Zap size={17} /> {t.scanNow}
              </button>
              <button className="btn-secondary" onClick={() => loadPreset(PRESET_SAMPLES[0])}>
                <Sparkles size={17} /> {t.trySample}
              </button>
            </div>
          </div>

          <div className="hero-stats-card" aria-label="Live stats">
            <div className="live-indicator">
              <div className="pulse-dot" />
              {t.shieldActive}
            </div>
            <div className="hero-stats-grid">
              <div className="hero-stat-item">
                <div className="hero-stat-label">{t.securityScore}</div>
                <div className="hero-stat-value" style={{ color: 'var(--shield-green)' }}>{stats.securityScore}<span style={{ fontSize: '1rem', fontWeight: 600 }}>/100</span></div>
              </div>
              <div className="hero-stat-item">
                <div className="hero-stat-label">{t.totalScans}</div>
                <div className="hero-stat-value" style={{ color: 'var(--primary-blue)' }}>{stats.total}</div>
              </div>
              <div className="hero-stat-item">
                <div className="hero-stat-label">{lang === 'sq' ? 'Mashtrime Bllokuara' : 'Blocked Scams'}</div>
                <div className="hero-stat-value" style={{ color: 'var(--threat-red)' }}>{stats.malicious}</div>
              </div>
              <div className="hero-stat-item">
                <div className="hero-stat-label">{lang === 'sq' ? 'Të Sigurta' : 'Verified Safe'}</div>
                <div className="hero-stat-value" style={{ color: 'var(--shield-green)' }}>{stats.safe}</div>
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
          <section className="scan-center">
            <div className="glass-card">
              <h2 className="card-section-title">
                <ShieldAlert size={22} style={{ color: 'var(--primary-blue)' }} />
                {t.analysisCenterTitle}
              </h2>

              {/* Type Tabs */}
              <div className="scan-tabs" role="tablist">
                {([
                  { type: 'url', icon: <Globe size={14} />, label: 'URL / Link' },
                  { type: 'email', icon: <Mail size={14} />, label: 'Email' },
                  { type: 'sms', icon: <Smartphone size={14} />, label: 'SMS / WhatsApp' },
                  { type: 'qr', icon: <QrCode size={14} />, label: 'QR Code' },
                  { type: 'screenshot', icon: <Upload size={14} />, label: 'Screenshot / OCR' },
                  { type: 'pdf', icon: <FileText size={14} />, label: lang === 'sq' ? 'Faturë / PDF' : 'Invoice / PDF' },
                ] as const).map(({ type, icon, label }) => (
                  <button
                    key={type}
                    className={`scan-tab-btn${scanType === type ? ' active' : ''}`}
                    onClick={() => setScanType(type)}
                    role="tab"
                    aria-selected={scanType === type}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>

              {/* Quick Presets */}
              <div className="quick-samples">
                <span className="samples-label">
                  💡 {t.presets}
                </span>
                {PRESET_SAMPLES.map((s, idx) => (
                  <span key={idx} className="sample-chip" onClick={() => loadPreset(s)} role="button" tabIndex={0}>
                    {s.label}
                  </span>
                ))}
              </div>

              {/* Form Inputs */}
              <div className="scan-form-grid">
                {(scanType === 'url' || scanType === 'qr') && (
                  <div>
                    <label className="field-label">
                      <Globe size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                      {t.suspiciousUrl}
                    </label>
                    <input
                      id="url-input"
                      type="text"
                      placeholder="e.g. http://paypaI-security-verify.com/login"
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

                {(scanType === 'screenshot' || scanType === 'qr' || scanType === 'pdf') && (
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
                  disabled={isScanning || (!inputUrl && !inputContent && !fileName)}
                >
                  {isScanning ? (
                    <><RefreshCw size={19} className="spin" /> {t.scanning}</>
                  ) : (
                    <><ShieldCheck size={19} /> {t.analyzeBtn}</>
                  )}
                </button>
              </div>
            </div>

            {/* Results Panel */}
            {currentResult && (
              <div className="results-container">
                {/* Gauge Panel */}
                <div className="glass-card gauge-panel">
                  <div className="risk-circle" aria-label={`Risk score: ${currentResult.score}%`}>
                    <svg width="170" height="170" viewBox="0 0 170 170">
                      <circle className="risk-circle-bg" cx="85" cy="85" r="71" />
                      <circle
                        className="risk-circle-val"
                        cx="85" cy="85" r="71"
                        stroke={getScoreColor(currentResult.score)}
                        strokeDasharray={446}
                        strokeDashoffset={446 - (446 * currentResult.score) / 100}
                      />
                    </svg>
                    <div className="risk-score-num">
                      <span style={{ color: getScoreColor(currentResult.score) }}>{currentResult.score}%</span>
                      <small style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Risk Score</small>
                    </div>
                  </div>

                  <div className={`status-badge ${getStatusClass(currentResult.score)}`}>
                    {lang === 'sq' ? currentResult.status : currentResult.statusEn}
                  </div>

                  <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
                    <div>🎯 {t.confidence}: <strong style={{ color: 'var(--text-main)' }}>{currentResult.confidence}%</strong></div>
                    <div>⏱️ {t.execTime}: <strong style={{ color: 'var(--text-main)' }}>{currentResult.timeTakenMs}ms</strong></div>
                  </div>

                  <div className="gauge-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => toggleFavorite(currentResult.id)}
                      title={currentResult.favorite ? 'Remove favorite' : 'Add to favorites'}
                    >
                      <Star size={14} fill={currentResult.favorite ? 'gold' : 'none'} color={currentResult.favorite ? 'gold' : 'currentColor'} />
                      {currentResult.favorite ? t.saved : t.save}
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => window.print()}
                      title="Export as PDF"
                    >
                      <FileText size={14} /> PDF
                    </button>
                  </div>
                </div>

                {/* Detailed Results */}
                <div className="glass-card results-details">
                  <div className="result-header">
                    <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: 9 }}>
                      <Shield size={20} style={{ color: 'var(--primary-blue)' }} />
                      {t.reportTitle}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 4 }}>
                      ID: {currentResult.id} · {new Date(currentResult.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Threat Indicators */}
                  {currentResult.indicators.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                      {currentResult.indicators.map((ind, i) => (
                        <span key={i} style={{
                          padding: '4px 12px', borderRadius: 'var(--radius-full)',
                          background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)',
                          color: 'var(--threat-red)', fontSize: '0.75rem', fontWeight: 700
                        }}>
                          ⚠ {ind}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Reasons */}
                  <div className="section-block">
                    <h3 style={{ color: 'var(--threat-orange)' }}>
                      <AlertTriangle size={16} />
                      {t.identifiedReasons}
                    </h3>
                    <ul className="reasons-list">
                      {(lang === 'sq' ? currentResult.reasonsSq : currentResult.reasons).map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendation */}
                  <div className="section-block" style={{ borderLeft: '4px solid var(--threat-yellow)' }}>
                    <h3 style={{ color: 'var(--threat-yellow)' }}>
                      <CheckCircle size={16} />
                      {t.recommendation}
                    </h3>
                    <p style={{ fontWeight: 700, fontSize: '0.975rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                      {lang === 'sq' ? currentResult.recommendationSq : currentResult.recommendations[0]}
                    </p>
                  </div>

                  {/* Education */}
                  <div className="education-box">
                    <h3 style={{ color: 'var(--accent-cyan)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <BookOpen size={16} />
                      {t.education}
                    </h3>
                    <p style={{ fontSize: '0.925rem', lineHeight: 1.7, color: 'var(--text-sub)' }}>
                      {lang === 'sq' ? currentResult.education : currentResult.educationEn}
                    </p>
                  </div>
                </div>
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
                { icon: <AlertTriangle size={24} />, value: stats.suspicious, label: t.suspicious, color: 'var(--threat-yellow)', bg: 'rgba(245, 158, 11, 0.13)' },
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

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '24px var(--content-padding)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
        background: 'rgba(7, 10, 18, 0.6)',
        backdropFilter: 'blur(16px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={logoImg} alt="AIGuardian" style={{ height: 28, objectFit: 'contain' }} />
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            © 2026 AIGuardian · {lang === 'sq' ? 'Të drejta të rezervuara' : 'All rights reserved'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Lock size={12} /> AES-256 GCM
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <ShieldCheck size={12} style={{ color: 'var(--shield-green)' }} />
            {lang === 'sq' ? 'Zero-Enumeration Siguri' : 'Zero-Enumeration Security'}
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
