import { ShieldCheck, Upload, Link, QrCode, Mail } from 'lucide-react';

const scanInputs = [
  { icon: Upload, title: 'Screenshot upload', text: 'Analyze screenshots of suspicious messages or fake login pages.' },
  { icon: Mail, title: 'Email or SMS paste', text: 'Paste message content and sender details for social-engineering checks.' },
  { icon: Link, title: 'URL scan', text: 'Inspect domains, redirects, impersonation, and malware indicators.' },
  { icon: QrCode, title: 'QR scan', text: 'Decode QR destinations before users open risky links.' }
];

export function App() {
  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">ScanShield AI · AIGuardian</p>
        <h1>Detect phishing, scam messages, malicious links, and fake invoices before they hurt users.</h1>
        <p className="heroText">
          Start with this scaffold, then connect real AI, URL intelligence, QR decoding, and user accounts as the
          platform grows.
        </p>
        <div className="actions">
          <a href="#scan" className="primary">Plan first scan flow</a>
          <a href="/api/health" className="secondary">Check API health</a>
        </div>
      </section>

      <section id="scan" className="cards">
        {scanInputs.map(({ icon: Icon, title, text }) => (
          <article className="card" key={title}>
            <Icon aria-hidden="true" />
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section className="resultPreview">
        <ShieldCheck aria-hidden="true" />
        <div>
          <p className="risk">Risk Score: 92%</p>
          <h2>Fake login page detected</h2>
          <p>
            The domain appears recently registered, the sender imitates PayPal, and the page asks for sensitive login
            data. Recommendation: do not open or share the link.
          </p>
        </div>
      </section>
    </main>
  );
}
