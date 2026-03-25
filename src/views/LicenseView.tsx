import React, { useState } from 'react';
import { useT, localizeError } from '../LanguageContext';

export default function LicenseView({ onActivated }: { onActivated: () => void }) {
  const { t } = useT();
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const activate = async () => {
    if (!key.trim()) return;
    setLoading(true);
    setError('');
    const result = await window.api.activateLicense(key.trim());
    setLoading(false);
    if (result.success) {
      onActivated();
    } else {
      setError(localizeError(result.error ?? '', t) || result.error ?? t.license.activate.btn);
    }
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100%', padding: '40px',
    }}>
      <div style={{ maxWidth: '440px', width: '100%' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '14px' }}>🔒</div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '10px' }}>
            {t.license.expired}
          </h1>
          <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
            {t.license.desc}
          </p>
        </div>

        {/* Pricing pill */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            padding: '20px', borderRadius: '12px',
            background: 'rgba(99,102,241,.08)', border: '1px solid #6366f1', textAlign: 'center',
          }}>
            <div style={{ fontSize: '11px', color: '#6366f1', marginBottom: '6px', fontWeight: 700 }}>{t.license.plan.label}</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#f0f0f0' }}>$29</div>
            <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>{t.license.plan.note}</div>
          </div>
        </div>

        {/* Buy button */}
        <button
          onClick={() => window.api.openExternal('https://silentnoteai.lemonsqueezy.com/checkout/buy/3c35056c-2075-4429-8193-e4cab81cd49a')}
          style={{
            display: 'block', width: '100%', padding: '12px', borderRadius: '10px',
            background: '#6366f1', color: '#fff', fontSize: '14px', fontWeight: 700,
            border: 'none', cursor: 'pointer', marginBottom: '24px',
          }}
        >
          {t.license.buy}
        </button>

        {/* Activation */}
        <div style={{
          background: '#141414', borderRadius: '14px', padding: '24px', border: '1px solid #222',
        }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#888', marginBottom: '12px' }}>
            {t.license.activate.hint}
          </div>
          <input
            type="text"
            value={key}
            onChange={e => setKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && activate()}
            placeholder={t.license.activate.placeholder}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: '8px',
              background: '#0f0f0f', border: '1px solid #2a2a2a',
              color: '#f0f0f0', fontSize: '13px', outline: 'none',
              marginBottom: '10px', boxSizing: 'border-box',
            }}
          />
          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: '8px', marginBottom: '10px',
              background: '#1a0a0a', border: '1px solid #3a1a1a', color: '#f87171', fontSize: '13px',
            }}>
              {error}
            </div>
          )}
          <button
            onClick={activate}
            disabled={loading || !key.trim()}
            style={{
              width: '100%', padding: '10px', borderRadius: '8px', border: 'none',
              background: '#374151', color: '#fff', fontSize: '13px', fontWeight: 600,
              cursor: loading || !key.trim() ? 'not-allowed' : 'pointer',
              opacity: loading || !key.trim() ? 0.5 : 1,
            }}
          >
            {loading ? t.license.activate.activating : t.license.activate.btn}
          </button>
        </div>

      </div>
    </div>
  );
}
