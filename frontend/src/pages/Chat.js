import React, { useEffect, useState, useRef } from 'react';
import { chatAPI } from '../services/api';
import { format } from 'date-fns';

const QUICK_QUESTIONS = [
  'What should I know about my medications?',
  'How do I prepare for my appointment?',
  'What are general tips for a healthy lifestyle?',
  'How can I track my medication schedule?',
];

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    chatAPI.history().then(r => {
      setMessages(r.data.map(m => ({
        role: m.role,
        content: m.content,
        time: m.created_at,
      })));
    }).catch(() => {}).finally(() => setHistoryLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: msg, time: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const r = await chatAPI.send(msg);
      setMessages(prev => [...prev, { role: 'assistant', content: r.data.reply, time: new Date().toISOString() }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        time: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Clear chat history?')) return;
    await chatAPI.clear();
    setMessages([]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 0px)' }}>
      {/* Header */}
      <div className="topbar">
        <div>
          <div className="page-title">AI Health Assistant</div>
          <div className="page-subtitle">General health guidance — not a substitute for medical advice</div>
        </div>
        {messages.length > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={handleClear}>Clear history</button>
        )}
      </div>

      {/* Messages */}
      <div className="chat-messages" style={{ flex: 1 }}>
        {historyLoading ? (
          <div style={{ textAlign: 'center', color: 'var(--slate)' }}><div className="spinner"></div></div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
            <h3 style={{ fontFamily: 'DM Serif Display', fontSize: 24, marginBottom: 8 }}>How can I help you today?</h3>
            <p style={{ color: 'var(--slate)', fontSize: 14, marginBottom: 28 }}>
              Ask me about your appointments, medications, or general health information.<br />
              <strong>Note:</strong> I cannot provide diagnoses or medical treatment advice.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              {QUICK_QUESTIONS.map(q => (
                <button
                  key={q}
                  className="btn btn-ghost btn-sm"
                  onClick={() => sendMessage(q)}
                  style={{ fontSize: 13 }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                  {msg.role === 'assistant' && (
                    <div style={{ width: 28, height: 28, background: 'var(--teal)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🤖</div>
                  )}
                  <div className={`chat-bubble ${msg.role}`}>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: 'var(--slate-light)', marginTop: 4, paddingLeft: msg.role === 'assistant' ? 36 : 0 }}>
                  {msg.time ? format(new Date(msg.time), 'h:mm a') : ''}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, background: 'var(--teal)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
                <div className="chat-bubble assistant" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0, 0.2, 0.4].map((d, i) => (
                    <div key={i} style={{
                      width: 7, height: 7, borderRadius: '50%', background: 'var(--slate)',
                      animation: 'pulse 1.2s ease-in-out infinite',
                      animationDelay: `${d}s`
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <textarea
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your health, medications, or appointments... (Enter to send)"
          rows={1}
          style={{ resize: 'none' }}
        />
        <button
          className="chat-send-btn"
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
        >
          ↑
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(0.8); opacity: 0.4; }
          50% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
