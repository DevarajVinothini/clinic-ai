import React, { useEffect, useState } from 'react';
import { patientsAPI, appointmentsAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';

function RiskScore({ score }) {
  const color = score >= 0.7 ? '#ef4444' : score >= 0.4 ? '#f59e0b' : '#10b981';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: 'var(--gray-100)', borderRadius: 99 }}>
        <div style={{ height: '100%', width: `${Math.round(score * 100)}%`, background: color, borderRadius: 99 }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 36 }}>{Math.round(score * 100)}%</span>
    </div>
  );
}

function StaffDashboardSkeleton() {
  return (
    <div className="content-area fade-in">
      <div className="topbar" style={{ margin: '-28px -32px 28px' }}>
        <div>
          <div className="skeleton skeleton-title" style={{ width: 220 }}>&nbsp;</div>
          <div className="skeleton skeleton-text" style={{ width: 240, height: 12 }}>&nbsp;</div>
        </div>
      </div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton skeleton-stat">&nbsp;</div>)}
      </div>
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="skeleton-card"><div className="skeleton skeleton-chart">&nbsp;</div></div>
        <div className="skeleton-card"><div className="skeleton skeleton-chart">&nbsp;</div></div>
      </div>
      <div className="grid-2">
        <div className="skeleton-card">
          {[1, 2, 3].map(i => <div key={i} className="skeleton-row"><div className="skeleton skeleton-avatar">&nbsp;</div><div className="skeleton skeleton-bar">&nbsp;</div></div>)}
        </div>
        <div className="skeleton-card">
          {[1, 2, 3].map(i => <div key={i} className="skeleton-row"><div className="skeleton skeleton-bar">&nbsp;</div><div className="skeleton skeleton-badge">&nbsp;</div></div>)}
        </div>
      </div>
    </div>
  );
}

export default function StaffDashboard() {
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      patientsAPI.stats(),
      patientsAPI.list(),
      appointmentsAPI.list(),
    ]).then(([s, p, a]) => {
      setStats(s.data);
      setPatients(p.data);
      setAppointments(a.data);
    }).catch(err => {
      setError('Failed to load dashboard data. Please refresh.');
      console.error(err);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <StaffDashboardSkeleton />;

  // Chart data
  const statusData = [
    { name: 'Scheduled', value: appointments.filter(a => a.status === 'scheduled').length, color: '#3b82f6' },
    { name: 'Confirmed', value: appointments.filter(a => a.status === 'confirmed').length, color: '#14b8a6' },
    { name: 'Completed', value: appointments.filter(a => a.status === 'completed').length, color: '#10b981' },
    { name: 'No-Show', value: appointments.filter(a => a.status === 'no_show').length, color: '#ef4444' },
    { name: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length, color: '#94a3b8' },
  ].filter(d => d.value > 0);

  const riskData = [
    { name: 'Low Risk', value: patients.filter(p => (p.avg_risk_score || 0) < 0.4).length, color: '#10b981' },
    { name: 'Med Risk', value: patients.filter(p => (p.avg_risk_score || 0) >= 0.4 && (p.avg_risk_score || 0) < 0.7).length, color: '#f59e0b' },
    { name: 'High Risk', value: patients.filter(p => (p.avg_risk_score || 0) >= 0.7).length, color: '#ef4444' },
  ];

  const highRiskPatients = patients.filter(p => (p.avg_risk_score || 0) >= 0.5).slice(0, 5);
  const recentAppts = appointments.slice(0, 5);

  return (
    <div className="content-area fade-in">
      <div className="topbar" style={{ margin: '-28px -32px 28px' }}>
        <div>
          <div className="page-title">Staff Dashboard</div>
          <div className="page-subtitle">Clinic overview & patient risk analytics</div>
        </div>
        <div style={{ fontSize: 13, color: 'var(--slate)' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {[
          { icon: '👥', label: 'Total Patients', value: stats?.total_patients || 0, sub: 'registered' },
          { icon: '📅', label: 'This Week', value: stats?.appointments_this_week || 0, sub: 'appointments' },
          { icon: '⏳', label: 'Upcoming', value: stats?.upcoming_appointments || 0, sub: 'to be seen' },
          { icon: '🔴', label: 'High Risk', value: stats?.high_risk_appointments || 0, sub: 'need attention' },
          { icon: '❌', label: 'No-Shows', value: stats?.total_no_shows || 0, sub: 'historical' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-change">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Appointment status chart */}
        <div className="card">
          <div className="card-header"><span className="card-title">📊 Appointment Status</span></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk distribution */}
        <div className="card">
          <div className="card-header"><span className="card-title">⚠️ Patient Risk Distribution</span></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={riskData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {riskData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* High risk patients */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🔴 High-Risk Patients</span>
            <span className="badge badge-red">{highRiskPatients.length} patients</span>
          </div>
          <div>
            {highRiskPatients.length === 0 ? (
              <div className="empty-state"><p>No high-risk patients 🎉</p></div>
            ) : highRiskPatients.map(p => (
              <div key={p.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--gray-100)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 4 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{p.first_name} {p.last_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--slate)' }}>{p.no_shows} no-shows / {p.total_appointments} total</div>
                  </div>
                </div>
                <RiskScore score={parseFloat(p.avg_risk_score) || 0} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent appointments */}
        <div className="card">
          <div className="card-header"><span className="card-title">🕐 Recent Activity</span></div>
          <div>
            {recentAppts.map(appt => (
              <div key={appt.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{appt.patient_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--slate)' }}>{appt.type} · {format(new Date(appt.appointment_date), 'MMM d')}</div>
                </div>
                <span className={`badge badge-${appt.status === 'completed' ? 'green' :
                    appt.status === 'no_show' ? 'red' :
                      appt.status === 'confirmed' ? 'teal' : 'blue'
                  }`}>{appt.status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
