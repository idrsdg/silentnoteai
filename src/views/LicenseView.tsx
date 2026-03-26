import React, { useState } from 'react';
import { useT, localizeError } from '../LanguageContext';

const CHECKOUT_URLS = {
  starter:   'PLACEHOLDER_STARTER_URL',   // $4.99/mo · 300 min
  pro:       'PLACEHOLDER_PRO_URL',       // $9.99/mo · 1000 min
  unlimited: 'PLACEHOLDER_UNLIMITED_URL', // $19.99/mo · unlimited
  topup300:  'PLACEHOLDER_TOPUP300_URL',  // $2.99 · 300 min credit
  topup1000: 'PLACEHOLDER_TOPUP1000_URL', // $7.99 · 1000 min credit
};

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
      setError(localizeError(result.error ?? '', t) || (result.error ?? t.license.activate.btn));
    }
  };

  const plans = [
    {
      id: 'starter' as const,
      popular: false,
      url: CHECKOUT_URLS.starter,
      ...t.license.plans.starter,
    },
    {
      id: 'pro' as const,
      popular: true,
      url: CHECKOUT_URLS.pro,
      ...t.license.plans.pro,
    },
    {
      id: 'unlimited' as const,
      popular: false,
      url: CHECKOUT_URLS.unlimited,
      ...t.license.plans.unlimited,
    },
  ];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100%', padding: '40px',
    }}>
      <div style={{ maxWidth: '720px', width: '100%' }}>

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

        {/* Pricing cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          {plans.map(plan => (
            <div
              key={plan.id}
              style={{
                padding: '22px 16px 18px', borderRadius: '14px', textAlign: 'center',
                background: plan.popular ? 'rgba(249,115,22,.12)' : '#111',
                border: plan.popular ? '1.5px solid #f97316' : '1px solid #222',
                position: 'relative',
              }}
            >
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)',
                  background: '#f97316', color: '#fff', fontSize: '10px', fontWeight: 700,
                  padding: '3px 10px', borderRadius: '20px', whiteSpace: 'nowrap',
                }}>
                  {t.license.popular}
                </div>
              )}
              <div style={{
                fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '10px',
                color: plan.popular ? '#fdba74' : '#555',
              }}>
                {plan.label}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '2px', marginBottom: '4px' }}>
                <span style={{ fontSize: '28px', fontWeight: 800, color: '#f0f0f0' }}>{plan.price}</span>
                {plan.period && <span style={{ fontSize: '12px', color: '#555' }}>{plan.period}</span>}
              </div>
              <div style={{ fontSize: '11px', color: '#f97316', fontWeight: 600, marginBottom: '4px' }}>
                {plan.minutes}
              </div>
              <div style={{ fontSize: '11px', color: '#444', marginBottom: '14px', minHeight: '16px', lineHeight: '1.5' }}>
                {plan.note}
              </div>
              <button
                onClick={() => window.api.openExternal(plan.url)}
                style={{
                  width: '100%', padding: '8px', borderRadius: '8px',
                  background: plan.popular ? '#f97316' : '#1e1e1e',
                  color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                  border: plan.popular ? 'none' : '1px solid #2a2a2a',
                }}
              >
                {t.license.buy}
              </button>
            </div>
          ))}
        </div>

        {/* Credit top-up */}
        <div style={{
          background: '#0e0e0e', borderRadius: '12px', padding: '16px 20px',
          border: '1px solid #1e1e1e', marginBottom: '20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px',
        }}>
          <div style={{ fontSize: '13px', color: '#666' }}>{t.license.topup?.label ?? 'Ekstra dakika satın al:'}</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => window.api.openExternal(CHECKOUT_URLS.topup300)}
              style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #2a2a2a', background: '#1a1a1a', color: '#ccc', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
            >
              {t.license.topup?.btn300 ?? '300 dk — $2.99'}
            </button>
            <button
              onClick={() => window.api.openExternal(CHECKOUT_URLS.topup1000)}
              style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #2a2a2a', background: '#1a1a1a', color: '#ccc', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
            >
              {t.license.topup?.btn1000 ?? '1000 dk — $7.99'}
            </button>
          </div>
        </div>

        {/* Activation */}
        <div style={{
          background: '#150f09', borderRadius: '14px', padding: '24px', border: '1px solid #222',
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
              background: '#0e0a07', border: '1px solid #2a1e14',
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
