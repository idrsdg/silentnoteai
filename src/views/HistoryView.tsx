import React, { useState, useEffect, useCallback } from 'react';
import { SessionData, ActionItem } from '../types/api';

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatDuration(sec: number): string {
  if (sec < 60) return `${sec} sn`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s > 0 ? `${m} dk ${s} sn` : `${m} dk`;
}

export default function HistoryView() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (q = '') => {
    setLoading(true);
    try {
      const data = q.trim()
        ? await window.api.searchSessions(q)
        : await window.api.getSessions();
      setSessions(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const timer = setTimeout(() => load(search), 300);
    return () => clearTimeout(timer);
  }, [search, load]);

  const handleDelete = async (id: string) => {
    await window.api.deleteSession(id);
    setSessions(prev => prev.filter(s => s.id !== id));
    if (selected === id) setSelected(null);
  };

  const selectedSession = sessions.find(s => s.id === selected);

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* List */}
      <div style={{
        width: selectedSession ? '320px' : '100%',
        borderRight: selectedSession ? '1px solid #222' : 'none',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
      }}>
        {/* Header */}
        <div style={{ padding: '28px 24px 16px', borderBottom: '1px solid #1a1a1a' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>Geçmiş</h1>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Ara..."
            style={{
              width: '100%', padding: '8px 12px', borderRadius: '8px',
              background: '#1a1a1a', border: '1px solid #2a2a2a',
              color: '#f0f0f0', fontSize: '13px', outline: 'none',
            }}
          />
        </div>

        {/* Sessions */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: '#444', fontSize: '14px' }}>
              Yükleniyor...
            </div>
          ) : sessions.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: '#444', fontSize: '14px' }}>
              {search ? 'Sonuç bulunamadı' : 'Henüz kayıt yok'}
            </div>
          ) : sessions.map(s => {
            const summaryArr: string[] = JSON.parse(s.summary || '[]');
            return (
              <div
                key={s.id}
                onClick={() => setSelected(s.id === selected ? null : s.id)}
                style={{
                  padding: '16px 24px',
                  borderBottom: '1px solid #1a1a1a',
                  cursor: 'pointer',
                  background: selected === s.id ? '#1a1a2e' : 'transparent',
                  borderLeft: selected === s.id ? '3px solid #6366f1' : '3px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px', color: selected === s.id ? '#a5b4fc' : '#e5e5e5' }}>
                  {s.title || 'Başlıksız'}
                </div>
                <div style={{ fontSize: '12px', color: '#444', display: 'flex', gap: '8px' }}>
                  <span>{formatDate(s.created_at)}</span>
                  <span>·</span>
                  <span>{formatDuration(s.duration_sec)}</span>
                </div>
                {summaryArr[0] && (
                  <div style={{ fontSize: '12px', color: '#555', marginTop: '6px', lineHeight: '1.5' }}>
                    {summaryArr[0]}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail */}
      {selectedSession && (() => {
        const summaryArr: string[] = JSON.parse(selectedSession.summary || '[]');
        const actionsArr: ActionItem[] = JSON.parse(selectedSession.action_items || '[]');
        return (
          <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>{selectedSession.title || 'Başlıksız'}</h2>
                <div style={{ fontSize: '12px', color: '#555' }}>
                  {formatDate(selectedSession.created_at)} · {formatDuration(selectedSession.duration_sec)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleDelete(selectedSession.id)}
                  style={{ background: 'none', border: '1px solid #2a1a1a', borderRadius: '7px', color: '#ef4444', cursor: 'pointer', fontSize: '12px', padding: '4px 10px' }}
                >
                  Sil
                </button>
                <button
                  onClick={() => setSelected(null)}
                  style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '18px' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {summaryArr.length > 0 && (
              <Section title="Özet">
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {summaryArr.map((item, i) => (
                    <li key={i} style={{ fontSize: '13px', color: '#ccc', display: 'flex', gap: '8px', lineHeight: '1.5' }}>
                      <span style={{ color: '#6366f1', flexShrink: 0 }}>•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {actionsArr.length > 0 && (
              <Section title="Aksiyonlar">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {actionsArr.map((a, i) => (
                    <div key={i} style={{
                      background: '#0f0f0f', borderRadius: '8px', padding: '10px 12px',
                      border: '1px solid #1e1e1e', fontSize: '12px',
                    }}>
                      <div style={{ color: '#e5e5e5', fontWeight: 500, marginBottom: '3px' }}>{a.task}</div>
                      <span style={{ color: '#8b5cf6' }}>{a.owner}</span>
                      <span style={{ color: '#444' }}> · </span>
                      <span style={{ color: '#555' }}>{a.deadline}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            <Section title="Transkript">
              <div style={{ fontSize: '13px', lineHeight: '1.75', color: '#888', whiteSpace: 'pre-wrap' }}>
                {selectedSession.transcript}
              </div>
            </Section>
          </div>
        );
      })()}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ fontSize: '11px', fontWeight: 600, color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
        {title}
      </div>
      <div style={{ background: '#141414', borderRadius: '10px', padding: '16px', border: '1px solid #222' }}>
        {children}
      </div>
    </div>
  );
}
