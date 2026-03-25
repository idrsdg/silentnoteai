import React, { useState, useEffect, useCallback } from 'react';
import { useT } from '../LanguageContext';
import { SessionData, ActionItem } from '../types/api';

function formatDate(ts: number, lang: string): string {
  const locale = lang === 'zh' ? 'zh-CN' : lang === 'ar' ? 'ar-SA' : lang === 'hi' ? 'hi-IN' : lang === 'es' ? 'es-ES' : lang === 'tr' ? 'tr-TR' : lang === 'fr' ? 'fr-FR' : lang === 'pt' ? 'pt-PT' : lang === 'de' ? 'de-DE' : 'en-US';
  return new Date(ts).toLocaleString(locale, {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatDuration(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export default function HistoryView() {
  const { t, lang } = useT();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit state
  const [editTitle, setEditTitle] = useState('');
  const [editTranscript, setEditTranscript] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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

  const selectedSession = sessions.find(s => s.id === selected);

  // Sync edit fields when selection changes
  useEffect(() => {
    if (selectedSession) {
      setEditTitle(selectedSession.title || '');
      setEditTranscript(selectedSession.transcript || '');
      setSaved(false);
    }
  }, [selected, selectedSession?.id]);

  const handleDelete = async (id: string) => {
    await window.api.deleteSession(id);
    setSessions(prev => prev.filter(s => s.id !== id));
    if (selected === id) setSelected(null);
  };

  const handleSave = async () => {
    if (!selectedSession) return;
    setSaving(true);
    try {
      const updated: SessionData = {
        ...selectedSession,
        title: editTitle,
        transcript: editTranscript,
      };
      await window.api.updateSession(updated);
      setSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* List */}
      <div style={{
        width: selectedSession ? '300px' : '100%',
        borderRight: selectedSession ? '1px solid #222' : 'none',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
      }}>
        <div style={{ padding: '28px 24px 16px', borderBottom: '1px solid #1a1a1a' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>{t.history.title}</h1>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.history.search}
            style={{
              width: '100%', padding: '8px 12px', borderRadius: '8px',
              background: '#1a1a1a', border: '1px solid #2a2a2a',
              color: '#f0f0f0', fontSize: '13px', outline: 'none',
            }}
          />
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: '#444', fontSize: '14px' }}>
              {t.history.loading}
            </div>
          ) : sessions.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: '#444', fontSize: '14px' }}>
              {search ? t.history.noResults : t.history.empty}
            </div>
          ) : sessions.map(s => {
            const summaryArr: string[] = JSON.parse(s.summary || '[]');
            return (
              <div
                key={s.id}
                onClick={() => setSelected(s.id === selected ? null : s.id)}
                style={{
                  padding: '16px 24px', borderBottom: '1px solid #1a1a1a',
                  cursor: 'pointer',
                  background: selected === s.id ? '#1a1a2e' : 'transparent',
                  borderLeft: selected === s.id ? '3px solid #6366f1' : '3px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px', color: selected === s.id ? '#a5b4fc' : '#e5e5e5' }}>
                  {s.title || t.history.untitled}
                </div>
                <div style={{ fontSize: '12px', color: '#444', display: 'flex', gap: '8px' }}>
                  <span>{formatDate(s.created_at, lang)}</span>
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
          <div style={{ flex: 1, overflowY: 'auto', padding: '28px', display: 'flex', flexDirection: 'column' }}>
            {/* Editable title */}
            <div style={{ marginBottom: '6px' }}>
              <input
                value={editTitle}
                onChange={e => { setEditTitle(e.target.value); setSaved(false); }}
                style={{
                  width: '100%', fontSize: '18px', fontWeight: 700,
                  background: 'transparent', border: 'none', borderBottom: '1px solid #2a2a2a',
                  color: '#f0f0f0', outline: 'none', padding: '4px 0',
                }}
              />
            </div>
            <div style={{ fontSize: '12px', color: '#555', marginBottom: '24px' }}>
              {formatDate(selectedSession.created_at, lang)} · {formatDuration(selectedSession.duration_sec)}
            </div>

            {summaryArr.length > 0 && (
              <Section title={t.history.summary}>
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
              <Section title={t.history.actions}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {actionsArr.map((a, i) => (
                    <div key={i} style={{ background: '#0f0f0f', borderRadius: '8px', padding: '10px 12px', border: '1px solid #1e1e1e', fontSize: '12px' }}>
                      <div style={{ color: '#e5e5e5', fontWeight: 500, marginBottom: '3px' }}>{a.task}</div>
                      <span style={{ color: '#8b5cf6' }}>{a.owner}</span>
                      <span style={{ color: '#444' }}> · </span>
                      <span style={{ color: '#555' }}>{a.deadline}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Editable transcript */}
            <Section title={t.history.transcript}>
              <textarea
                value={editTranscript}
                onChange={e => { setEditTranscript(e.target.value); setSaved(false); }}
                style={{
                  width: '100%', minHeight: '200px', fontSize: '13px', lineHeight: '1.75',
                  color: '#aaa', background: 'transparent', border: 'none',
                  outline: 'none', resize: 'vertical', fontFamily: 'inherit',
                }}
              />
            </Section>

            {/* Action buttons — bottom */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #1a1a1a' }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '8px 20px', borderRadius: '8px', border: 'none',
                  background: saved ? '#059669' : '#6366f1', color: '#fff',
                  fontSize: '13px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.6 : 1, transition: 'background 0.3s',
                }}
              >
                {saving ? '...' : saved ? '✅ Saved' : t.history.save}
              </button>

              <button
                onClick={() => setSelected(null)}
                style={{
                  padding: '8px 16px', borderRadius: '8px',
                  background: 'none', border: '1px solid #2a2a2a', color: '#888',
                  cursor: 'pointer', fontSize: '13px',
                }}
              >
                ✕
              </button>

              <button
                onClick={() => handleDelete(selectedSession.id)}
                style={{
                  padding: '8px 16px', borderRadius: '8px',
                  background: 'none', border: '1px solid #2a1a1a', color: '#ef4444',
                  cursor: 'pointer', fontSize: '13px',
                }}
              >
                {t.history.delete}
              </button>
            </div>
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
