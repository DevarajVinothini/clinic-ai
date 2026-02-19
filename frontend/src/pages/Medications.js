import React, { useEffect, useState } from 'react';
import { medsAPI } from '../services/api';
import { format } from 'date-fns';
import { useToast } from '../components/Toast';

function MedsSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton-card" style={{ padding: 20 }}>
          <div className="skeleton skeleton-title" style={{ width: '60%' }}>&nbsp;</div>
          <div className="skeleton skeleton-text" style={{ width: '40%' }}>&nbsp;</div>
          <div className="skeleton skeleton-text" style={{ width: '80%', marginTop: 12 }}>&nbsp;</div>
          <div className="skeleton skeleton-bar" style={{ height: 36, marginTop: 16 }}>&nbsp;</div>
        </div>
      ))}
    </div>
  );
}

export default function Medications() {
  const toast = useToast();
  const [meds, setMeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', dosage: '', frequency: '', instructions: '', startDate: '' });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loggedIds, setLoggedIds] = useState(new Set());

  useEffect(() => {
    medsAPI.list().then(r => setMeds(r.data)).catch(() => toast.error('Failed to load medications')).finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const validateForm = () => {
    const errors = {};
    if (!form.name?.trim()) errors.name = 'Medication name is required';
    else if (form.name.length > 255) errors.name = 'Name too long';
    if (!form.frequency?.trim()) errors.frequency = 'Frequency is required';
    if (form.instructions && form.instructions.length > 500) errors.instructions = 'Instructions too long (max 500)';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    try {
      const res = await medsAPI.create(form);
      setMeds(prev => [res.data, ...prev]);
      setShowModal(false);
      setForm({ name: '', dosage: '', frequency: '', instructions: '', startDate: '' });
      setFormErrors({});
      toast.success('Medication added successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add medication');
    } finally {
      setSaving(false);
    }
  };

  const handleLog = async (id) => {
    try {
      await medsAPI.log(id, 'taken');
      setLoggedIds(prev => new Set([...prev, id]));
      toast.success('Medication marked as taken');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to log medication');
    }
  };

  if (loading) return <div className="content-area fade-in"><div className="topbar" style={{ margin: '-28px -32px 28px' }}><div><div className="skeleton skeleton-title" style={{ width: 160 }}>&nbsp;</div></div></div><MedsSkeleton /></div>;

  return (
    <div className="content-area fade-in">
      <div className="topbar" style={{ margin: '-28px -32px 28px' }}>
        <div>
          <div className="page-title">Medications</div>
          <div className="page-subtitle">{meds.length} active prescriptions</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Medication</button>
      </div>

      {meds.length === 0 ? (
        <div className="card">
          <div className="empty-state"><div className="empty-icon">💊</div><p>No active medications</p></div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {meds.map(med => (
            <div key={med.id} className="card fade-in" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ background: 'var(--teal)', height: 4 }} />
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{med.name}</div>
                    <div style={{ color: 'var(--teal)', fontWeight: 600, fontSize: 14 }}>{med.dosage}</div>
                  </div>
                  <span className="badge badge-teal">Active</span>
                </div>

                <div style={{ display: 'flex', gap: 12, fontSize: 13, color: 'var(--slate)', marginBottom: 12 }}>
                  <div><strong>Schedule:</strong> {med.frequency}</div>
                </div>

                {med.instructions && (
                  <div style={{ background: 'var(--gray-50)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--slate)', marginBottom: 12 }}>
                    📋 {med.instructions}
                  </div>
                )}

                {med.start_date && (
                  <div style={{ fontSize: 12, color: 'var(--slate-light)' }}>
                    Started: {format(new Date(med.start_date), 'MMM d, yyyy')}
                  </div>
                )}

                <div style={{ marginTop: 16 }}>
                  <button
                    className="btn btn-sm"
                    style={{ background: loggedIds.has(med.id) ? '#dcfce7' : 'var(--teal-50)', color: loggedIds.has(med.id) ? '#166534' : 'var(--teal-dark)', width: '100%', justifyContent: 'center', border: '1px solid' + (loggedIds.has(med.id) ? '#bbf7d0' : 'var(--teal-100)') }}
                    onClick={() => handleLog(med.id)}
                    disabled={loggedIds.has(med.id)}
                  >
                    {loggedIds.has(med.id) ? '✅ Taken today' : '💊 Mark as taken'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">Add Medication</div>
            <form onSubmit={handleCreate} noValidate>
              <div className="form-group">
                <label className="form-label">Medication Name</label>
                <input className={`form-input${formErrors.name ? ' input-error' : ''}`} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g., Metformin" required />
                {formErrors.name && <div className="form-error">{formErrors.name}</div>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Dosage</label>
                  <input className="form-input" value={form.dosage} onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))} placeholder="e.g., 500mg" />
                </div>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input type="date" className="form-input" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Frequency</label>
                <input className={`form-input${formErrors.frequency ? ' input-error' : ''}`} value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))} placeholder="e.g., Twice daily" required />
                {formErrors.frequency && <div className="form-error">{formErrors.frequency}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Instructions</label>
                <textarea className={`form-input${formErrors.instructions ? ' input-error' : ''}`} value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} placeholder="e.g., Take with food" rows={2} maxLength={500} />
                {formErrors.instructions && <div className="form-error">{formErrors.instructions}</div>}
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => { setShowModal(false); setFormErrors({}); }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner" style={{ width: 14, height: 14 }}></span> Adding...</> : 'Add Medication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
