import React, { useEffect, useState } from 'react';
import { patientsAPI } from '../services/api';
import { useToast } from '../components/Toast';

function RiskBadge({ score }) {
  const pct = Math.round((score || 0) * 100);
  const color = pct >= 70 ? 'var(--red)' : pct >= 40 ? 'var(--amber)' : 'var(--green)';
  const label = pct >= 70 ? 'High' : pct >= 40 ? 'Medium' : 'Low';
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 80 }}>
      <span style={{ flex: 1, height: 6, background: 'var(--gray-100)', borderRadius: 99 }}>
        <span style={{ display: 'block', height: '100%', width: `${pct}%`, background: color, borderRadius: 99 }} />
      </span>
      <span style={{ fontSize: 11, fontWeight: 700, color, whiteSpace: 'nowrap' }}>{label} {pct}%</span>
    </span>
  );
}

export default function Patients() {
  const toast = useToast();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');

  useEffect(() => {
    patientsAPI.list()
      .then(r => setPatients(r.data))
      .catch(() => toast.error('Failed to load patients'))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  let filtered = patients;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p =>
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phone?.includes(q)
    );
  }
  if (riskFilter !== 'all') {
    const score = (p) => parseFloat(p.avg_risk_score) || 0;
    if (riskFilter === 'high') filtered = filtered.filter(p => score(p) >= 0.7);
    else if (riskFilter === 'medium') filtered = filtered.filter(p => score(p) >= 0.4 && score(p) < 0.7);
    else filtered = filtered.filter(p => score(p) < 0.4);
  }

  if (loading) {
    return (
      <div className="content-area fade-in">
        <div className="topbar" style={{ margin: '-28px -32px 28px' }}><div><div className="skeleton skeleton-title" style={{ width: 180 }}>&nbsp;</div></div></div>
        <div className="card">
          <div style={{ padding: '10px 16px', background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
            <div className="skeleton skeleton-text" style={{ width: '30%' }}>&nbsp;</div>
          </div>
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton-row"><div className="skeleton skeleton-avatar">&nbsp;</div><div className="skeleton skeleton-bar">&nbsp;</div><div className="skeleton skeleton-badge">&nbsp;</div></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="content-area fade-in">
      <div className="topbar" style={{ margin: '-28px -32px 28px' }}>
        <div>
          <div className="page-title">Patients</div>
          <div className="page-subtitle">{patients.length} registered patients</div>
        </div>
      </div>

      {/* Search & filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          className="form-input"
          placeholder="🔍 Search by name, email, or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <select className="form-input" value={riskFilter} onChange={e => setRiskFilter(e.target.value)} style={{ width: 'auto', minWidth: 140 }}>
          <option value="all">All Risk Levels</option>
          <option value="high">High Risk</option>
          <option value="medium">Medium Risk</option>
          <option value="low">Low Risk</option>
        </select>
      </div>

      <div className="card">
        <div className="table-wrap">
          {filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">👥</div><p>{search ? 'No patients match your search' : 'No patients found'}</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Contact</th>
                  <th>Appointments</th>
                  <th>No-Shows</th>
                  <th>Risk Score</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%', background: 'var(--teal-50)', color: 'var(--teal-dark)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13, flexShrink: 0
                        }}>
                          {p.first_name?.[0]}{p.last_name?.[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{p.first_name} {p.last_name}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13 }}>{p.email}</div>
                      {p.phone && <div style={{ fontSize: 12, color: 'var(--slate)' }}>{p.phone}</div>}
                    </td>
                    <td style={{ fontWeight: 500 }}>{p.total_appointments}</td>
                    <td>
                      {parseInt(p.no_shows) > 0 ? (
                        <span className="badge badge-red">{p.no_shows}</span>
                      ) : (
                        <span style={{ fontSize: 13, color: 'var(--green)' }}>0</span>
                      )}
                    </td>
                    <td style={{ minWidth: 130 }}>
                      <RiskBadge score={parseFloat(p.avg_risk_score)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
