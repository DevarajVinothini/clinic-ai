import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentsAPI, remindersAPI, medsAPI } from '../services/api';
import { format, isAfter } from 'date-fns';

function RiskBadge({ score }) {
  if (score === null || score === undefined) return null;
  const pct = Math.round(score * 100);
  const color = score >= 0.7 ? 'var(--red)' : score >= 0.4 ? 'var(--amber)' : 'var(--green)';
  const label = score >= 0.7 ? 'HIGH' : score >= 0.4 ? 'MED' : 'LOW';
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color, background: `${color}1a`, padding: '2px 8px', borderRadius: 99 }}>
      {label} {pct}%
    </span>
  );
}

function DashboardSkeleton() {
  return (
    <div className="content-area fade-in">
      <div className="topbar" style={{ margin: '-28px -32px 28px', position: 'sticky', top: 0 }}>
        <div>
          <div className="skeleton skeleton-title" style={{ width: 260 }}>&nbsp;</div>
          <div className="skeleton skeleton-text" style={{ width: 180, height: 12 }}>&nbsp;</div>
        </div>
      </div>
      <div className="stats-grid">
        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton skeleton-stat">&nbsp;</div>)}
      </div>
      <div className="grid-2">
        <div className="skeleton-card">
          <div className="skeleton skeleton-text" style={{ width: '50%', marginBottom: 20 }}>&nbsp;</div>
          {[1, 2, 3].map(i => <div key={i} className="skeleton-row"><div className="skeleton skeleton-bar">&nbsp;</div><div className="skeleton skeleton-badge">&nbsp;</div></div>)}
        </div>
        <div className="skeleton-card">
          <div className="skeleton skeleton-text" style={{ width: '40%', marginBottom: 20 }}>&nbsp;</div>
          {[1, 2, 3].map(i => <div key={i} className="skeleton-row"><div className="skeleton skeleton-bar">&nbsp;</div></div>)}
        </div>
      </div>
    </div>
  );
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [meds, setMeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      appointmentsAPI.list(),
      remindersAPI.list(),
      medsAPI.list(),
    ]).then(([a, r, m]) => {
      setAppointments(a.data);
      setReminders(r.data.filter(r => !r.is_read).slice(0, 5));
      setMeds(m.data);
    }).catch(err => {
      setError('Failed to load dashboard data. Please refresh the page.');
      console.error(err);
    }).finally(() => setLoading(false));
  }, []);

  const upcoming = appointments.filter(a =>
    ['scheduled', 'confirmed'].includes(a.status) && isAfter(new Date(a.appointment_date), new Date())
  ).slice(0, 3);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="content-area fade-in">
      <div className="topbar" style={{ margin: '-28px -32px 28px', position: 'sticky', top: 0 }}>
        <div>
          <div className="page-title">Good {getGreeting()}, {user.firstName}!</div>
          <div className="page-subtitle">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-label">Upcoming</div>
          <div className="stat-value">{upcoming.length}</div>
          <div className="stat-change">appointments scheduled</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💊</div>
          <div className="stat-label">Medications</div>
          <div className="stat-value">{meds.length}</div>
          <div className="stat-change">active prescriptions</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔔</div>
          <div className="stat-label">Reminders</div>
          <div className="stat-value">{reminders.length}</div>
          <div className="stat-change">unread notifications</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-label">Completed</div>
          <div className="stat-value">{appointments.filter(a => a.status === 'completed').length}</div>
          <div className="stat-change">past appointments</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Upcoming appointments */}
        <div className="card section">
          <div className="card-header">
            <span className="card-title">📅 Upcoming Appointments</span>
          </div>
          <div>
            {upcoming.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📅</div>
                <p>No upcoming appointments</p>
              </div>
            ) : upcoming.map(appt => (
              <div key={appt.id} style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{appt.type}</div>
                  <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 2 }}>
                    {format(new Date(appt.appointment_date), 'MMM d, yyyy · h:mm a')}
                  </div>
                  {appt.staff_name && <div style={{ fontSize: 12, color: 'var(--slate)' }}>with {appt.staff_name}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <RiskBadge score={appt.no_show_risk_score} />
                  <span className={`badge badge-${appt.status === 'confirmed' ? 'teal' : 'blue'}`}>{appt.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Unread reminders */}
        <div className="card section">
          <div className="card-header">
            <span className="card-title">🔔 Notifications</span>
            {reminders.length > 0 && <span className="badge badge-red">{reminders.length} new</span>}
          </div>
          <div>
            {reminders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✉️</div>
                <p>You're all caught up!</p>
              </div>
            ) : reminders.map(r => (
              <div key={r.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--gray-100)' }}>
                <div style={{ fontSize: 13, color: 'var(--charcoal)', lineHeight: 1.5 }}>{r.message}</div>
                <div style={{ fontSize: 11, color: 'var(--slate-light)', marginTop: 4 }}>
                  {format(new Date(r.scheduled_at), 'MMM d, h:mm a')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Medications */}
      {meds.length > 0 && (
        <div className="card section">
          <div className="card-header">
            <span className="card-title">💊 Current Medications</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 0 }}>
            {meds.map(med => (
              <div key={med.id} style={{ padding: '16px 20px', borderRight: '1px solid var(--gray-100)', borderBottom: '1px solid var(--gray-100)' }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{med.name}</div>
                <div style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 500, marginTop: 2 }}>{med.dosage}</div>
                <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 4 }}>{med.frequency}</div>
                {med.instructions && <div style={{ fontSize: 11, color: 'var(--slate-light)', marginTop: 4 }}>{med.instructions}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
