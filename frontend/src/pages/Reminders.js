import React, { useEffect, useState } from 'react';
import { remindersAPI } from '../services/api';
import { format } from 'date-fns';
import { useToast } from '../components/Toast';

export default function Reminders() {
  const toast = useToast();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    remindersAPI.list()
      .then(r => setReminders(r.data))
      .catch(() => toast.error('Failed to load reminders'))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const markRead = async (id) => {
    try {
      await remindersAPI.markRead(id);
      setReminders(prev => prev.map(r => r.id === id ? { ...r, is_read: true } : r));
      toast.success('Reminder marked as read');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update reminder');
    }
  };

  const unread = reminders.filter(r => !r.is_read);
  const read = reminders.filter(r => r.is_read);

  if (loading) {
    return (
      <div className="content-area fade-in">
        <div className="topbar" style={{ margin: '-28px -32px 28px' }}>
          <div><div className="skeleton skeleton-title" style={{ width: 160 }}>&nbsp;</div></div>
        </div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton-card" style={{ marginBottom: 10, padding: 16 }}>
            <div className="skeleton skeleton-text" style={{ width: '70%' }}>&nbsp;</div>
            <div className="skeleton skeleton-text" style={{ width: '40%' }}>&nbsp;</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="content-area fade-in">
      <div className="topbar" style={{ margin: '-28px -32px 28px' }}>
        <div>
          <div className="page-title">Reminders</div>
          <div className="page-subtitle">{unread.length} unread notification{unread.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* Unread */}
      {unread.length > 0 && (
        <div className="section">
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>🔔 Unread</h3>
          <div className="card">
            {unread.map(r => (
              <div key={r.id} style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{r.message}</div>
                  <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 4 }}>
                    {r.appointment_type && <span className="badge badge-teal" style={{ marginRight: 8 }}>{r.appointment_type}</span>}
                    {format(new Date(r.scheduled_at), 'MMM d, yyyy · h:mm a')}
                  </div>
                </div>
                <button className="btn btn-sm btn-ghost" onClick={() => markRead(r.id)}>Mark read</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Read */}
      {read.length > 0 && (
        <div className="section">
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--slate)' }}>✅ Read</h3>
          <div className="card" style={{ opacity: 0.7 }}>
            {read.map(r => (
              <div key={r.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--gray-100)' }}>
                <div style={{ fontSize: 14 }}>{r.message}</div>
                <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 4 }}>
                  {r.appointment_type && <span className="badge badge-gray" style={{ marginRight: 8 }}>{r.appointment_type}</span>}
                  {format(new Date(r.scheduled_at), 'MMM d, yyyy · h:mm a')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {reminders.length === 0 && (
        <div className="card"><div className="empty-state"><div className="empty-icon">🔔</div><p>No reminders yet</p></div></div>
      )}
    </div>
  );
}
