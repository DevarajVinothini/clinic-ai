import React, { useState } from 'react';
import { appointmentsAPI } from '../services/api';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend } from 'recharts';

export default function RiskAnalytics() {
  const [form, setForm] = useState({
    previousNoShows: 0,
    previousAppointments: 5,
    dayOfWeek: 1,
    hourOfDay: 10,
    age: 40,
    daysUntilAppointment: 7,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await appointmentsAPI.predict({
        ...form,
        previousNoShows: parseInt(form.previousNoShows),
        previousAppointments: parseInt(form.previousAppointments),
        dayOfWeek: parseInt(form.dayOfWeek),
        hourOfDay: parseInt(form.hourOfDay),
        age: parseInt(form.age),
        daysUntilAppointment: parseInt(form.daysUntilAppointment),
      });
      setResult(res.data);
    } catch { alert('Prediction failed'); }
    finally { setLoading(false); }
  };

  const upd = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  const riskColor = result ? (result.riskScore >= 0.7 ? '#ef4444' : result.riskScore >= 0.4 ? '#f59e0b' : '#10b981') : 'var(--teal)';

  const radarData = result ? [
    { subject: 'No-Show History', value: Math.min(form.previousNoShows / Math.max(form.previousAppointments, 1), 1) * 100 },
    { subject: 'Day Risk', value: [0, 1, 5].includes(parseInt(form.dayOfWeek)) ? 70 : 30 },
    { subject: 'Time Risk', value: form.hourOfDay < 8 || form.hourOfDay > 16 ? 80 : 20 },
    { subject: 'Lead Time', value: Math.min(form.daysUntilAppointment / 30, 1) * 100 },
    { subject: 'Age Factor', value: Math.max(0, 60 - form.age) },
  ] : [];

  return (
    <div className="content-area fade-in">
      <div className="topbar" style={{ margin: '-28px -32px 28px' }}>
        <div>
          <div className="page-title">Risk Analytics</div>
          <div className="page-subtitle">Logistic regression no-show prediction model</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Prediction form */}
        <div className="card">
          <div className="card-header"><span className="card-title">⚗️ No-Show Prediction</span></div>
          <div className="card-body">
            <p style={{ fontSize: 13, color: 'var(--slate)', marginBottom: 20, lineHeight: 1.6 }}>
              Input patient and appointment features to predict the probability of a no-show using our logistic regression model.
            </p>
            <form onSubmit={handlePredict}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Previous No-Shows</label>
                  <input type="number" className="form-input" value={form.previousNoShows} onChange={upd('previousNoShows')} min="0" max="20" />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Past Appointments</label>
                  <input type="number" className="form-input" value={form.previousAppointments} onChange={upd('previousAppointments')} min="0" max="100" />
                </div>
                <div className="form-group">
                  <label className="form-label">Day of Week</label>
                  <select className="form-input" value={form.dayOfWeek} onChange={upd('dayOfWeek')}>
                    <option value={0}>Sunday</option>
                    <option value={1}>Monday</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                    <option value={6}>Saturday</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Hour of Day (0-23)</label>
                  <input type="number" className="form-input" value={form.hourOfDay} onChange={upd('hourOfDay')} min="0" max="23" />
                </div>
                <div className="form-group">
                  <label className="form-label">Patient Age</label>
                  <input type="number" className="form-input" value={form.age} onChange={upd('age')} min="1" max="120" />
                </div>
                <div className="form-group">
                  <label className="form-label">Days Until Appointment</label>
                  <input type="number" className="form-input" value={form.daysUntilAppointment} onChange={upd('daysUntilAppointment')} min="0" max="365" />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} disabled={loading}>
                {loading ? 'Predicting...' : '🔮 Predict No-Show Risk'}
              </button>
            </form>

            {result && (
              <div style={{ marginTop: 24, padding: 20, background: `${riskColor}0d`, border: `1px solid ${riskColor}33`, borderRadius: 'var(--radius)', textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>No-Show Risk Score</div>
                <div style={{ fontFamily: 'DM Serif Display', fontSize: 56, color: riskColor, lineHeight: 1 }}>
                  {Math.round(result.riskScore * 100)}%
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: riskColor, marginTop: 8 }}>
                  {result.riskLevel} RISK
                </div>
                <div style={{ fontSize: 13, color: 'var(--slate)', marginTop: 12, lineHeight: 1.5 }}>
                  {result.riskScore >= 0.7
                    ? '⚠️ High probability of no-show. Consider calling patient to confirm.'
                    : result.riskScore >= 0.4
                    ? '📞 Moderate risk. Send an extra reminder closer to the appointment.'
                    : '✅ Low risk. Patient is likely to attend as scheduled.'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Model info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {result && (
            <div className="card">
              <div className="card-header"><span className="card-title">🎯 Feature Importance</span></div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                    <Radar dataKey="value" fill={riskColor} fillOpacity={0.2} stroke={riskColor} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header"><span className="card-title">🧠 Model Information</span></div>
            <div className="card-body">
              <div style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.8 }}>
                <div style={{ marginBottom: 12 }}>
                  <strong style={{ color: 'var(--charcoal)' }}>Algorithm:</strong> Logistic Regression
                </div>
                <div style={{ marginBottom: 8 }}><strong style={{ color: 'var(--charcoal)' }}>Features used:</strong></div>
                {[
                  ['Historical no-show rate', 'Weight: 3.2'],
                  ['Day of week', 'Higher risk Mon/Fri'],
                  ['Time of day', 'Early morning / late high'],
                  ['Patient age', 'Slight negative correlation'],
                  ['Appointment lead time', 'Longer = more uncertainty'],
                  ['New patient flag', 'No history = higher risk'],
                ].map(([f, d]) => (
                  <div key={f} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--gray-100)', fontSize: 12 }}>
                    <span>{f}</span>
                    <span style={{ color: 'var(--slate-light)' }}>{d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
