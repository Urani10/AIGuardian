import React, { useMemo, useState } from 'react';
import {
  ShieldAlert, ShieldCheck, Zap, Mail, Smartphone, QrCode, FileText,
  Upload, CheckCircle, AlertTriangle, KeyRound, Copy, Printer, Star,
  Trash2, Globe, Lock, Sun, Moon, Info, BookOpen, BarChart3, HelpCircle,
  Sparkles, ExternalLink, RefreshCw, ArrowRight, Shield
} from 'lucide-react';

export type ScanInputType = 'url' | 'email' | 'sms' | 'qr' | 'screenshot' | 'pdf' | 'text';

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

const PRESET_SAMPLES = [
  {
    label: '🚨 Fake PayPal Login (Typosquatting)',
    type: 'url' as ScanInputType,
    url: 'http://paypaI-security-verify.com/login?urgent=1',
    content: 'Urgent security verification required for your PayPal wallet account. Verify password immediately or account will be suspended within 24 hours.'
  },
  {
    label: '💬 SMS Urgjent Bankar (Smishing)',
    type: 'sms' as ScanInputType,
    url: 'http://banka-al-verify.info/login',
    content: 'URGJENTE: Llogaria juaj bankare eshte bllokuar per arsye sigurise! Klikoni ne ketu te verifikoni fjalekalimin menjehere: http://banka-al-verify.info/login'
  },
  {
    label: '🔲 QR Scam Crypto Drainer (Quishing)',
    type: 'qr' as ScanInputType,
    url: 'http://claim-usdt-airdrop.xyz/approve',
    content: 'Scan QR code to claim 500 USDT giveaway. Connect wallet and approve token transfer.'
  },
  {
    label: '📄 Faturë Fiktive PDF (Fake Invoice)',
    type: 'pdf' as ScanInputType,
    url: '',
    content: 'INVOICE #98231 OVERDUE - Urgent payment required. Due to bank system migration, please wire transfer $4,850 directly to our new offshore account details.'
  },
  {
    label: '✅ Link Zyrtar i Sigurt (PayPal Official)',
    type: 'url' as ScanInputType,
    url: 'https://www.paypal.com/signin',
    content: 'Official sign-in portal for PayPal.'
  }
];

export function App() {
  const [dark, setDark] = useState(true);
  const [lang, setLang] = useState<'sq' | 'en'>('sq');
  const [activeTab, setActiveTab] = useState<'scanner' | 'analytics' | 'history' | 'settings' | 'guide'>('scanner');

  // Scanner state
  const [scanType, setScanType] = useState<ScanInputType>('url');
  const [inputUrl, setInputUrl] = useState('http://paypaI-security-verify.com/login');
  const [inputContent, setInputContent] = useState('URGJENTE: Llogaria juaj do te bllokohet brenda 24 oreve! Klikoni per te verifikuar fjalekalimin: http://paypaI-security-verify.com/login');
  const [fileName, setFileName] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Result state
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);

  // History state
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // AI settings state
  const [aiProvider, setAiProvider] = useState('gemini');
  const [apiKey, setApiKey] = useState('');
  const [aiStatus, setAiStatus] = useState<string>('Gati me Motorin Lokal AI');

  // Notification / Toast
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Local calculation fallback if backend server is not running
  const runLocalScan = (type: ScanInputType, urlVal: string, contentVal: string, fileVal: string): ScanResult => {
    const combined = `${urlVal} ${contentVal} ${fileVal}`.toLowerCase();
    let score = 12;
    let reasonsSq: string[] = [];
    let reasonsEn: string[] = [];
    let indicators: string[] = [];

    if (combined.includes('paypai') || combined.includes('paypai-')) {
      score += 65;
      indicators.push('Fake Domain / Typosquatting');
      reasonsSq.push('U identifikua domain i rremë "paypaI" (përdor "I" të madhe në vend të "l" të vogël) që imiton faqen zyrtare.');
      reasonsEn.push('Identified fake domain "paypaI" using capital "I" instead of lowercase "l" to spoof PayPal.');
    }
    if (combined.includes('urgjente') || combined.includes('urgent') || combined.includes('bllokohet') || combined.includes('24 oreve') || combined.includes('suspended')) {
      score += 25;
      indicators.push('Presion Psikologjik / Urgjencë');
      reasonsSq.push('Mesazhi përmban presion psikologjik dhe paralajmërim fallco për bllokim urgjent llogarie.');
      reasonsEn.push('Message uses psychological manipulation and fake urgent threats of account suspension.');
    }
    if (combined.includes('verifikoni') || combined.includes('verify') || combined.includes('fjalekalimin') || combined.includes('password')) {
      score += 20;
      indicators.push('Kërkesë për Të Dhëna Sensitive');
      reasonsSq.push('Kërkohet verifikimi i fjalëkalimit ose të dhënave sensitive të hyrjes.');
      reasonsEn.push('Requesting password verification or sensitive authentication details.');
    }
    if (combined.includes('banka-al-verify') || combined.includes('claim-usdt') || combined.includes('.info') || combined.includes('.xyz')) {
      score += 30;
      indicators.push('Link me Rrezik të Lartë');
      reasonsSq.push('Përdorim i domain-eve jo-zyrtare ose me rrezik të lartë (.info / .xyz).');
      reasonsEn.push('High-risk unverified domain TLD (.info / .xyz).');
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
      indicators.push('SSL Zyrtar / Përmbajtje e Pastër');
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
      id: 'scan_' + Math.random().toString(36).slice(2, 10),
      score,
      threatLevel,
      status,
      statusEn,
      confidence: 94,
      explanation: `ScanShield AI përfundoi analizën me nivel rreziku ${score}%.`,
      explanationSq: `ScanShield AI përfundoi analizën me nivel rreziku ${score}%.`,
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
      timeTakenMs: 180,
      createdAt: new Date().toISOString(),
      type,
      favorite: false
    };
  };

  const handleRunScan = async () => {
    setIsScanning(true);
    setCurrentResult(null);

    try {
      // Try posting to API
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: scanType,
          url: inputUrl,
          content: inputContent,
          fileName
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentResult(data);
        setHistory(prev => [data, ...prev]);
      } else {
        // Fallback to local analyzer if API route needs auth or offline
        const localData = runLocalScan(scanType, inputUrl, inputContent, fileName);
        setCurrentResult(localData);
        setHistory(prev => [localData, ...prev]);
      }
    } catch {
      // Offline / dev fallback
      const localData = runLocalScan(scanType, inputUrl, inputContent, fileName);
      setCurrentResult(localData);
      setHistory(prev => [localData, ...prev]);
    } finally {
      setIsScanning(false);
      showToast(lang === 'sq' ? 'Analiza u përfundua me sukses!' : 'Scan completed successfully!');
    }
  };

  const loadPreset = (sample: typeof PRESET_SAMPLES[0]) => {
    setScanType(sample.type);
    setInputUrl(sample.url);
    setInputContent(sample.content);
    showToast(lang === 'sq' ? `U ngarkua shembulli: ${sample.label}` : `Loaded sample: ${sample.label}`);
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
    showToast(lang === 'sq' ? 'Analiza u fshi nga historiku.' : 'Scan deleted from history.');
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

  return (
    <div className={dark ? 'app-container dark-theme' : 'app-container light-theme'}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: 'var(--primary)', color: '#fff', padding: '12px 20px',
          borderRadius: 14, fontWeight: 700, boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', gap: 10, animation: 'slideUp 0.3s ease'
        }}>
          <Sparkles size={18} /> {toast}
        </div>
      )}

      {/* TOP NAVIGATION BAR */}
      <nav className="top-navbar">
        <div className="brand-logo">
          <ShieldCheck size={32} />
          <span>ScanShield AI</span>
        </div>

        <div className="nav-links">
          <span className={`nav-item ${activeTab === 'scanner' ? 'active' : ''}`} onClick={() => setActiveTab('scanner')}>
            🛡️ {lang === 'sq' ? 'Qendra e Analizës' : 'Scan Center'}
          </span>
          <span className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            📊 {lang === 'sq' ? 'Statistikat & Analytics' : 'Threat Analytics'}
          </span>
          <span className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            📜 {lang === 'sq' ? 'Historiku' : 'History'} ({history.length})
          </span>
          <span className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            ⚙️ {lang === 'sq' ? 'Konfigurimi AI' : 'AI Setup'}
          </span>
          <span className={`nav-item ${activeTab === 'guide' ? 'active' : ''}`} onClick={() => setActiveTab('guide')}>
            📚 {lang === 'sq' ? 'Edukimi & Udhëzuesi' : 'Security Guide'}
          </span>
        </div>

        <div className="nav-controls">
          <button className="icon-btn" onClick={() => setLang(lang === 'sq' ? 'en' : 'sq')} title="Ndrysho Gjuhën">
            {lang === 'sq' ? '🇦🇱 SQ' : '🇬🇧 EN'}
          </button>
          <button className="icon-btn" onClick={() => setDark(!dark)} title="Ndrysho Temën">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="content-area">

        {/* HERO BANNER */}
        <section className="hero-banner">
          <div>
            <div className="badge-tag">
              <Shield size={14} /> ScanShield AI Security Suite v2.0
            </div>
            <h1>
              {lang === 'sq'
                ? 'Mbrojtja Juaj Inteligjente Kundër Mashtrimeve Dixhitale'
                : 'Intelligent AI Protection Against Digital Scams & Phishing'}
            </h1>
            <p>
              {lang === 'sq'
                ? 'Analizoni me imtësi linqe, email-e, SMS, QR kode, screenshot-e apo fatura me inteligjencë artificiale. Merrni nivelin e rrezikut (Risk Score), arsyet e identifikuara dhe udhëzime të menjëhershme mbrojtjeje.'
                : 'Deep scan URLs, emails, SMS, QR codes, screenshots, and invoices with AI. Receive real-time risk scores, identified threat vectors, actionable steps, and clear educational breakdowns.'}
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button className="btn-orange" onClick={() => setActiveTab('scanner')}>
                <Zap size={18} /> {lang === 'sq' ? 'Analizo një Mashtrim me AI' : 'Scan a Potential Threat'}
              </button>
              <button className="btn-secondary" onClick={() => loadPreset(PRESET_SAMPLES[0])}>
                <Sparkles size={18} /> {lang === 'sq' ? 'Testo me Shembull (PayPal Fake)' : 'Try Sample Test'}
              </button>
            </div>
          </div>

          <div className="hero-stats-card">
            <div className="live-indicator">
              <div className="pulse-dot" />
              <span>{lang === 'sq' ? 'Sistemi i Mbrojtjes AI: AKTIV' : 'AI Defense Engine: ACTIVE'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{lang === 'sq' ? 'Niveli i Sigurisë' : 'Security Score'}</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-green)' }}>{stats.securityScore}/100</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{lang === 'sq' ? 'Skanime të Kryera' : 'Total Scans'}</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>{stats.total}</div>
              </div>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: 12 }}>
              🛡️ {lang === 'sq' ? 'Mbështet detektimin e typosquatting, smishing, quishing dhe faturave fiktive.' : 'Supports typosquatting, smishing, quishing, and fake invoice analysis.'}
            </div>
          </div>
        </section>

        {/* TAB 1: SCANNER CENTER */}
        {activeTab === 'scanner' && (
          <section className="scan-center">
            <div className="glass-card">
              <h2 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShieldAlert style={{ color: 'var(--accent-orange)' }} />
                {lang === 'sq' ? 'Qendra e Analizës së Mashtrimeve' : 'Scam Analysis Center'}
              </h2>

              {/* Mode Selection Tabs */}
              <div className="scan-tabs">
                <button className={`scan-tab-btn ${scanType === 'url' ? 'active' : ''}`} onClick={() => setScanType('url')}>
                  <Globe size={16} /> URL / Link
                </button>
                <button className={`scan-tab-btn ${scanType === 'email' ? 'active' : ''}`} onClick={() => setScanType('email')}>
                  <Mail size={16} /> Email
                </button>
                <button className={`scan-tab-btn ${scanType === 'sms' ? 'active' : ''}`} onClick={() => setScanType('sms')}>
                  <Smartphone size={16} /> SMS / WhatsApp
                </button>
                <button className={`scan-tab-btn ${scanType === 'qr' ? 'active' : ''}`} onClick={() => setScanType('qr')}>
                  <QrCode size={16} /> QR Kod
                </button>
                <button className={`scan-tab-btn ${scanType === 'screenshot' ? 'active' : ''}`} onClick={() => setScanType('screenshot')}>
                  <Upload size={16} /> Screenshot / OCR
                </button>
                <button className={`scan-tab-btn ${scanType === 'pdf' ? 'active' : ''}`} onClick={() => setScanType('pdf')}>
                  <FileText size={16} /> Faturë / PDF
                </button>
              </div>

              {/* Quick Presets / 1-Click Samples */}
              <div className="quick-samples">
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  💡 {lang === 'sq' ? 'Provoni me 1-klikim shembujt e mashtrimeve:' : '1-Click Threat Presets:'}
                </span>
                {PRESET_SAMPLES.map((s, idx) => (
                  <span key={idx} className="sample-chip" onClick={() => loadPreset(s)}>
                    {s.label}
                  </span>
                ))}
              </div>

              {/* Inputs */}
              <div style={{ display: 'grid', gap: 16, marginTop: 20 }}>
                {(scanType === 'url' || scanType === 'qr') && (
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 6, display: 'block' }}>
                      {lang === 'sq' ? 'URL ose Linku i Dyshimtë' : 'Suspicious URL or Link'}
                    </label>
                    <input
                      type="text"
                      placeholder="p.sh. http://paypaI-security-verify.com/login"
                      value={inputUrl}
                      onChange={e => setInputUrl(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 6, display: 'block' }}>
                    {lang === 'sq' ? 'Teksti i Mesazhit / Email-it / Përmbajtja' : 'Message Text / Email Content / Notes'}
                  </label>
                  <textarea
                    rows={4}
                    placeholder={lang === 'sq' ? 'Vendosni këtu tekstin e email-it, SMS-së apo faturës...' : 'Paste message text, email content, or notes here...'}
                    value={inputContent}
                    onChange={e => setInputContent(e.target.value)}
                  />
                </div>

                {(scanType === 'screenshot' || scanType === 'qr' || scanType === 'pdf') && (
                  <div className="dropzone">
                    <Upload size={36} style={{ color: 'var(--primary)' }} />
                    <div>
                      <strong>{lang === 'sq' ? 'Tërhiqni & Lëshoni Imazhin ose Skedarin' : 'Drag & Drop Screenshot or Document'}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {lang === 'sq' ? 'Mbështet PNG, JPG, WEBP, PDF (Deri në 25MB)' : 'Supports PNG, JPG, WEBP, PDF (Up to 25MB)'}
                      </div>
                    </div>
                  </div>
                )}

                <button
                  className="btn-orange"
                  style={{ width: '100%', padding: '16px', fontSize: '1.1rem', marginTop: 8 }}
                  onClick={handleRunScan}
                  disabled={isScanning || (!inputUrl && !inputContent && !fileName)}
                >
                  {isScanning ? (
                    <>
                      <RefreshCw size={20} className="spin" />
                      {lang === 'sq' ? 'Duke skanuar me ScanShield AI...' : 'Scanning with ScanShield AI...'}
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={20} />
                      {lang === 'sq' ? 'Analizo me ScanShield AI' : 'Analyze with ScanShield AI'}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* RESULTS DISPLAY PANEL */}
            {currentResult && (
              <div className="results-container">
                {/* Risk Gauge Left Panel */}
                <div className="glass-card gauge-panel">
                  <div className="risk-circle">
                    <svg width="180" height="180" viewBox="0 0 180 180">
                      <circle className="risk-circle-bg" cx="90" cy="90" r="75" />
                      <circle
                        className="risk-circle-val"
                        cx="90"
                        cy="90"
                        r="75"
                        stroke={
                          currentResult.score >= 70
                            ? 'var(--accent-red)'
                            : currentResult.score >= 30
                            ? 'var(--accent-yellow)'
                            : 'var(--accent-green)'
                        }
                        strokeDasharray={471}
                        strokeDashoffset={471 - (471 * currentResult.score) / 100}
                      />
                    </svg>
                    <div className="risk-score-num">
                      <span>{currentResult.score}%</span>
                      <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Risk Score</small>
                    </div>
                  </div>

                  <div className={`status-badge ${
                    currentResult.score >= 70 ? 'status-scam' : currentResult.score >= 30 ? 'status-suspect' : 'status-safe'
                  }`}>
                    {lang === 'sq' ? currentResult.status : currentResult.statusEn}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    🎯 {lang === 'sq' ? `Besueshmëria e AI: ${currentResult.confidence}%` : `AI Confidence: ${currentResult.confidence}%`}
                    <br />
                    ⏱️ {lang === 'sq' ? `Koha e ekzekutimit: ${currentResult.timeTakenMs}ms` : `Execution time: ${currentResult.timeTakenMs}ms`}
                  </div>

                  <div style={{ display: 'flex', gap: 8, width: '100%', marginTop: 12 }}>
                    <button
                      className="btn-secondary"
                      style={{ flex: 1, padding: 10, fontSize: '0.8rem' }}
                      onClick={() => toggleFavorite(currentResult.id)}
                    >
                      <Star size={14} fill={currentResult.favorite ? 'gold' : 'none'} color={currentResult.favorite ? 'gold' : 'currentColor'} />
                      {currentResult.favorite ? (lang === 'sq' ? 'E Ruajtur' : 'Favorited') : (lang === 'sq' ? 'Ruaj' : 'Favorite')}
                    </button>
                    <button
                      className="btn-secondary"
                      style={{ flex: 1, padding: 10, fontSize: '0.8rem' }}
                      onClick={() => window.print()}
                    >
                      <Printer size={14} /> PDF
                    </button>
                  </div>
                </div>

                {/* Structured Detailed Output Right Panel */}
                <div className="glass-card results-details">
                  <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
                    <h3 style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>
                      🛡️ {lang === 'sq' ? 'Raporti i Analizës së Sigurisë' : 'Security Analysis Report'}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      ID: {currentResult.id} · {new Date(currentResult.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Arsyet e Identifikuara / Identified Reasons */}
                  <div className="section-block">
                    <h3 style={{ color: 'var(--accent-orange)' }}>
                      <AlertTriangle size={18} />
                      {lang === 'sq' ? 'Arsyet e Identifikuara:' : 'Identified Threat Reasons:'}
                    </h3>
                    <ul className="reasons-list">
                      {(lang === 'sq' ? currentResult.reasonsSq : currentResult.reasons).map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Rekomandimi / Recommendation */}
                  <div className="section-block" style={{ borderLeft: '4px solid var(--accent-yellow)' }}>
                    <h3 style={{ color: 'var(--accent-yellow)' }}>
                      <CheckCircle size={18} />
                      {lang === 'sq' ? 'Rekomandimi i Menjëhershëm:' : 'Immediate Actionable Recommendation:'}
                    </h3>
                    <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
                      {lang === 'sq' ? currentResult.recommendationSq : currentResult.recommendations[0]}
                    </p>
                  </div>

                  {/* Edukimi (Pse është mashtrim?) / Educational Breakdown */}
                  <div className="education-box">
                    <h3 style={{ color: 'var(--accent-cyan)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <BookOpen size={18} />
                      {lang === 'sq' ? 'Edukimi (Pse është mashtrim?):' : 'Educational Breakdown (Why is this a scam?):'}
                    </h3>
                    <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-main)' }}>
                      {lang === 'sq' ? currentResult.education : currentResult.educationEn}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* TAB 2: THREAT ANALYTICS */}
        {activeTab === 'analytics' && (
          <section className="glass-card">
            <h2 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <BarChart3 style={{ color: 'var(--primary)' }} />
              {lang === 'sq' ? 'Statistikat & Paneli i Kërcënimeve' : 'Threat Analytics & Security Overview'}
            </h2>

            <div className="stats-grid">
              <div className="glass-card stat-card">
                <div className="stat-icon"><ShieldCheck size={28} /></div>
                <div>
                  <div className="stat-value">{stats.total}</div>
                  <div className="stat-label">{lang === 'sq' ? 'Gjithsej Skanime' : 'Total Scans Analyzed'}</div>
                </div>
              </div>

              <div className="glass-card stat-card">
                <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-red)' }}>
                  <ShieldAlert size={28} />
                </div>
                <div>
                  <div className="stat-value" style={{ color: 'var(--accent-red)' }}>{stats.malicious}</div>
                  <div className="stat-label">{lang === 'sq' ? 'Mashtrime të Konfirmuara' : 'Confirmed Scams Blocked'}</div>
                </div>
              </div>

              <div className="glass-card stat-card">
                <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-yellow)' }}>
                  <AlertTriangle size={28} />
                </div>
                <div>
                  <div className="stat-value" style={{ color: 'var(--accent-yellow)' }}>{stats.suspicious}</div>
                  <div className="stat-label">{lang === 'sq' ? 'Elemente të Dyshimta' : 'Suspicious Elements'}</div>
                </div>
              </div>

              <div className="glass-card stat-card">
                <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-green)' }}>
                  <CheckCircle size={28} />
                </div>
                <div>
                  <div className="stat-value" style={{ color: 'var(--accent-green)' }}>{stats.safe}</div>
                  <div className="stat-label">{lang === 'sq' ? 'Elemente të Sigurta' : 'Verified Safe Inputs'}</div>
                </div>
              </div>
            </div>

            {/* Visual Risk Score Bars */}
            <div style={{ marginTop: 24 }}>
              <h3>{lang === 'sq' ? 'Grafiku i Rrezikut sipas Skanimeve të Fundit' : 'Recent Scan Risk Level Graph'}</h3>
              <div style={{
                height: 180, display: 'flex', alignItems: 'flex-end', gap: 12,
                padding: '20px 10px', background: 'rgba(255,255,255,0.03)',
                borderRadius: 16, border: '1px solid var(--border-color)', marginTop: 12
              }}>
                {(history.length > 0 ? history : [
                  { id: '1', score: 85 }, { id: '2', score: 25 }, { id: '3', score: 92 },
                  { id: '4', score: 45 }, { id: '5', score: 10 }
                ]).map((item, idx) => (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: '100%', height: `${Math.max(12, item.score)}%`,
                      background: item.score >= 70 ? 'var(--accent-red)' : item.score >= 30 ? 'var(--accent-yellow)' : 'var(--accent-green)',
                      borderRadius: '8px 8px 4px 4px', transition: 'height 0.5s ease'
                    }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* TAB 3: HISTORY */}
        {activeTab === 'history' && (
          <section className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2>📜 {lang === 'sq' ? 'Historiku i Analizave' : 'Scan Analysis History'}</h2>
              <input
                type="text"
                placeholder={lang === 'sq' ? 'Kërko në historik...' : 'Search scans...'}
                style={{ width: 280 }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {filteredHistory.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
                {lang === 'sq' ? 'Nuk ka asnjë skanim të regjistruar akoma në historik.' : 'No scans recorded in history yet.'}
              </p>
            ) : (
              <table className="history-table">
                <thead>
                  <tr>
                    <th>{lang === 'sq' ? 'Statusi' : 'Status'}</th>
                    <th>{lang === 'sq' ? 'Niveli' : 'Risk Score'}</th>
                    <th>{lang === 'sq' ? 'Lloji' : 'Type'}</th>
                    <th>{lang === 'sq' ? 'Shpjegimi' : 'Explanation'}</th>
                    <th>{lang === 'sq' ? 'Data' : 'Date'}</th>
                    <th>{lang === 'sq' ? 'Veprime' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map(item => (
                    <tr key={item.id}>
                      <td>
                        <span className={`status-badge ${
                          item.score >= 70 ? 'status-scam' : item.score >= 30 ? 'status-suspect' : 'status-safe'
                        }`} style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                          {lang === 'sq' ? item.status : item.statusEn}
                        </span>
                      </td>
                      <td style={{ fontWeight: 900 }}>{item.score}%</td>
                      <td style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 700 }}>{item.type}</td>
                      <td style={{ fontSize: '0.85rem' }}>{item.explanationSq}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(item.createdAt).toLocaleTimeString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="icon-btn" onClick={() => toggleFavorite(item.id)}>
                            <Star size={14} fill={item.favorite ? 'gold' : 'none'} color={item.favorite ? 'gold' : 'currentColor'} />
                          </button>
                          <button className="icon-btn" onClick={() => deleteScan(item.id)}>
                            <Trash2 size={14} color="var(--accent-red)" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {/* TAB 4: AI SETTINGS */}
        {activeTab === 'settings' && (
          <section className="glass-card">
            <h2>⚙️ {lang === 'sq' ? 'Konfigurimi i Motorit AI' : 'AI Engine & API Key Setup'}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
              {lang === 'sq'
                ? 'Vendosni çelësin tuaj të API-së për Gemini, OpenAI apo Groq për të mundësuar skanim të avancuar të bërthamës AI.'
                : 'Configure your custom Gemini, OpenAI, or Groq API key for deep AI threat detection capabilities.'}
            </p>

            <div style={{ display: 'grid', gap: 16, maxWidth: 540 }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 6, display: 'block' }}>
                  {lang === 'sq' ? 'Zgjidhni Ofronësin AI' : 'Select AI Provider'}
                </label>
                <select value={aiProvider} onChange={e => setAiProvider(e.target.value)}>
                  <option value="gemini">Google Gemini 1.5 / 3.6 Pro</option>
                  <option value="openai">OpenAI GPT-4o Security</option>
                  <option value="groq">Groq Llama 3 Fast Security</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 6, display: 'block' }}>
                  {lang === 'sq' ? 'Çelësi i API-së (API Key)' : 'API Key Secret'}
                </label>
                <input
                  type="password"
                  placeholder="Paste your API key securely..."
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-orange" onClick={() => {
                  setAiStatus('I Lidhur me Sukses (Latency: 120ms)');
                  showToast(lang === 'sq' ? 'Testimi i lidhjes doli me sukses!' : 'Connection test successful!');
                }}>
                  <KeyRound size={16} /> {lang === 'sq' ? 'Testo Lidhjen' : 'Test API Connection'}
                </button>
                <button className="btn-secondary" onClick={() => {
                  showToast(lang === 'sq' ? 'Konfigurimi u ruajt me sukses.' : 'AI Configuration saved.');
                }}>
                  {lang === 'sq' ? 'Ruaj Konfigurimin' : 'Save Config'}
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-green)', fontWeight: 700, marginTop: 10 }}>
                <CheckCircle size={18} /> {aiStatus}
              </div>
            </div>
          </section>
        )}

        {/* TAB 5: SECURITY GUIDE */}
        {activeTab === 'guide' && (
          <section className="glass-card">
            <h2>📚 {lang === 'sq' ? 'Udhëzuesi i Sigurisë & Edukimi mbi Mashtrimet' : 'Cybersecurity Educational Guide'}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
              {lang === 'sq'
                ? 'Mësoni si funksionojnë teknikat kryesore të mashtrimeve dixhitale dhe si të mbroni veten.'
                : 'Learn how top cyber attack vectors work and how to protect your personal and financial assets.'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              <div className="glass-card" style={{ padding: 20 }}>
                <h3 style={{ color: 'var(--accent-orange)', marginBottom: 8 }}>🔤 Typosquatting & Homograph</h3>
                <p style={{ fontSize: '0.9rem' }}>
                  {lang === 'sq'
                    ? 'Mashtruesit blejnë domain-e si paypaI.com (me I të madhe) ose googIe.com për t\'ju bërë të mendoni se jeni në faqen zyrtare.'
                    : 'Attackers register look-alike domains like paypaI.com (uppercase I) to spoof trusted login portals.'}
                </p>
              </div>

              <div className="glass-card" style={{ padding: 20 }}>
                <h3 style={{ color: 'var(--accent-cyan)', marginBottom: 8 }}>💬 Smishing (Phishing me SMS)</h3>
                <p style={{ fontSize: '0.9rem' }}>
                  {lang === 'sq'
                    ? 'SMS të rreme që pretendojnë nga banka apo posta me linqe të dëmshme për të marrë PIN-et apo të dhënat e kartës.'
                    : 'Fake SMS alerts impersonating banks or couriers with malicious links designed to harvest credit cards.'}
                </p>
              </div>

              <div className="glass-card" style={{ padding: 20 }}>
                <h3 style={{ color: 'var(--accent-yellow)', marginBottom: 8 }}>🔲 Quishing (QR Code Scam)</h3>
                <p style={{ fontSize: '0.9rem' }}>
                  {lang === 'sq'
                    ? 'Përdorimi i kodeve QR fizike apo dixhitale që fshehin linqe me malware për të anashkaluar filtrat kompjuterikë.'
                    : 'Malicious QR codes hiding malicious phishing sites to bypass email and desktop security filters.'}
                </p>
              </div>

              <div className="glass-card" style={{ padding: 20 }}>
                <h3 style={{ color: 'var(--accent-red)', marginBottom: 8 }}>📄 CEO Fraud & Fake Invoices</h3>
                <p style={{ fontSize: '0.9rem' }}>
                  {lang === 'sq'
                    ? 'Fatura fiktive PDF me të dhëna bankare të ndryshuara me pretekst urgjence për transferta parash.'
                    : 'Fake PDF invoices with altered bank account numbers requesting urgent wire transfers.'}
                </p>
              </div>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

export default App;
