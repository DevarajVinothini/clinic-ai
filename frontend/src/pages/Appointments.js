import React, { useEffect, useState } from 'react';
import { appointmentsAPI, patientsAPI } from '../services/api';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const STATUS_COLORS = {
  scheduled: 'blue', confirmed: 'teal', completed: 'green', no_show: 'red', cancelled: 'gray'
};

const APPOINTMENT_TYPES = [
  'Annual Checkup', 'Follow-up Visit', 'Blood Test', 'Vaccination', 'Consultation',
  'Physical Exam', 'Dental Cleaning', 'Eye Exam', 'Mental Health', 'Other'
];

function TableSkeleton({ cols = 5 }) {
  return (
    <div className="card">
      <div style={{ padding: '10px 16px', background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
        <div className="skeleton skeleton-text" style={{ width: '30%', height: 12 }}>&nbsp;</div>
      </div>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="skeleton-row">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="skeleton skeleton-bar" style={{ width: `${15 + Math.random() * 20}%` }}>&nbsp;</div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function Appointments() {
  const { user } = useAuth();
  const toast = useToast();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [saving, setSaving] = useState(false);

  const isStaff = user?.role !== 'patient';

  // Staff form state
  const [staffForm, setStaffForm] = useState({ patientId: '', appointmentDate: '', type: '', notes: '', durationMinutes: 30 });
  // Patient form state
  const [patientForm, setPatientForm] = useState({ staffId: '', appointmentDate: '', type: '', notes: '', durationMinutes: 30 });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const calls = [appointmentsAPI.list()];
    if (isStaff) calls.push(patientsAPI.list());
    else calls.push(appointmentsAPI.listStaff());
    Promise.all(calls).then(([a, extra]) => {
      setAppointments(a.data);
      if (isStaff) setPatients(extra.data);
      else setStaffList(extra.data);
    }).catch(() => toast.error('Failed to load appointments')).finally(() => setLoading(false));
  }, [isStaff]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  const validateStaffForm = () => {
    const errors = {};
    if (!staffForm.patientId) errors.patientId = 'Select a patient';
    if (!staffForm.type?.trim()) errors.type = 'Appointment type is required';
    if (!staffForm.appointmentDate) errors.appointmentDate = 'Date and time required';
    else if (new Date(staffForm.appointmentDate) <= new Date()) errors.appointmentDate = 'Must be a future date';
    if (staffForm.notes && staffForm.notes.length > 500) errors.notes = 'Notes too long (max 500 chars)';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePatientForm = () => {
    const errors = {};
    if (!patientForm.type?.trim()) errors.type = 'Appointment type is required';
    if (!patientForm.appointmentDate) errors.appointmentDate = 'Date and time required';
    else if (new Date(patientForm.appointmentDate) <= new Date()) errors.appointmentDate = 'Must be a future date';
    if (patientForm.notes && patientForm.notes.length > 500) errors.notes = 'Notes too long (max 500 chars)';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStaffCreate = async (e) => {
    e.preventDefault();
    if (!validateStaffForm()) return;
    setSaving(true);
    try {
      const res = await appointmentsAPI.create(staffForm);
      setAppointments(prev => [res.data, ...prev]);
      setShowModal(false);
      setStaffForm({ patientId: '', appointmentDate: '', type: '', notes: '', durationMinutes: 30 });
      setFormErrors({});
      toast.success('Appointment created successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create appointment');
    } finally {
      setSaving(false);
    }
  };

  const handlePatientSchedule = async (e) => {
    e.preventDefault();
    if (!validatePatientForm()) return;
    setSaving(true);
    try {
      const res = await appointmentsAPI.schedule(patientForm);
      setAppointments(prev => [res.data, ...prev]);
      setShowModal(false);
      setPatientForm({ staffId: '', appointmentDate: '', type: '', notes: '', durationMinutes: 30 });
      setFormErrors({});
      toast.success('Appointment scheduled successfully! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to schedule appointment');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await appointmentsAPI.updateStatus(id, status);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      toast.success(`Status updated to ${status.replace('_', ' ')}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    }
  };

  if (loading) return <div className="content-area fade-in"><div className="topbar" style={{ margin: '-28px -32px 28px' }}><div><div className="skeleton skeleton-title" style={{ width: 180 }}>&nbsp;</div></div></div><TableSkeleton /></div>;

  return (
    <div className="content-area fade-in">
      <div className="topbar" style={{ margin: '-28px -32px 28px' }}>
        <div>
          <div className="page-title">Appointments</div>
          <div className="page-subtitle">{appointments.length} total records</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          {isStaff ? '+ New Appointment' : '📅 Schedule Appointment'}
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', 'scheduled', 'confirmed', 'completed', 'no_show', 'cancelled'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="btn btn-ghost btn-sm"
            style={{ background: filter === s ? 'var(--teal)' : '', color: filter === s ? 'white' : '', border: filter === s ? 'none' : '' }}
          >
            {s === 'all' ? 'All' : s.replace('_', ' ')}
            {s !== 'all' && <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.8 }}>({appointments.filter(a => a.status === s).length})</span>}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="table-wrap">
          {filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📅</div><p>No appointments found</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  {isStaff && <th>Patient</th>}
                  {!isStaff && <th>Doctor</th>}
                  <th>Type</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Risk Score</th>
                  {isStaff && <th>Actions</th>}
                  {!isStaff && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(appt => (
                  <tr key={appt.id}>
                    {isStaff && (
                      <td>
                        <div style={{ fontWeight: 500 }}>{appt.patient_name}</div>
                        <div style={{ fontSize: 12, color: 'var(--slate)' }}>{appt.patient_email}</div>
                      </td>
                    )}
                    {!isStaff && (
                      <td>
                        <div style={{ fontWeight: 500 }}>{appt.staff_name || 'Any available'}</div>
                      </td>
                    )}
                    <td style={{ fontWeight: 500 }}>{appt.type}</td>
                    <td style={{ color: 'var(--slate)', fontSize: 13 }}>
                      {format(new Date(appt.appointment_date), 'MMM d, yyyy')}<br />
                      <span style={{ fontSize: 12 }}>{format(new Date(appt.appointment_date), 'h:mm a')}</span>
                    </td>
                    <td><span className={`badge badge-${STATUS_COLORS[appt.status] || 'gray'}`}>{appt.status.replace('_', ' ')}</span></td>
                    <td>
                      {appt.no_show_risk_score !== null ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 100 }}>
                          <div style={{ flex: 1, height: 6, background: 'var(--gray-100)', borderRadius: 99 }}>
                            <div style={{
                              height: '100%',
                              width: `${Math.round(appt.no_show_risk_score * 100)}%`,
                              background: appt.no_show_risk_score >= 0.7 ? 'var(--red)' : appt.no_show_risk_score >= 0.4 ? 'var(--amber)' : 'var(--green)',
                              borderRadius: 99
                            }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, minWidth: 28 }}>{Math.round(appt.no_show_risk_score * 100)}%</span>
                        </div>
                      ) : <span style={{ color: 'var(--slate-light)', fontSize: 12 }}>N/A</span>}
                    </td>
                    {isStaff ? (
                      <td>
                        <select
                          className="form-input"
                          value={appt.status}
                          onChange={e => handleStatusChange(appt.id, e.target.value)}
                          style={{ padding: '4px 8px', fontSize: 12, width: 'auto' }}
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="no_show">No Show</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    ) : (
                      <td>
                        {['scheduled', 'confirmed'].includes(appt.status) && (
                          <div style={{ display: 'flex', gap: 4 }}>
                            {appt.status === 'scheduled' && (
                              <button className="btn btn-sm btn-primary" onClick={() => handleStatusChange(appt.id, 'confirmed')}>Confirm</button>
                            )}
                            <button className="btn btn-sm btn-danger" onClick={() => handleStatusChange(appt.id, 'cancelled')}>Cancel</button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Schedule/Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">{isStaff ? 'New Appointment' : '📅 Schedule Appointment'}</div>

            {isStaff ? (
              /* Staff: Create appointment for a patient */
              <form onSubmit={handleStaffCreate} noValidate>
                <div className="form-group">
                  <label className="form-label">Patient</label>
                  <select className={`form-input${formErrors.patientId ? ' input-error' : ''}`} value={staffForm.patientId} onChange={e => setStaffForm(f => ({ ...f, patientId: e.target.value }))} required>
                    <option value="">Select patient...</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.email})</option>)}
                  </select>
                  {formErrors.patientId && <div className="form-error">{formErrors.patientId}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Appointment Type</label>
                  <select className={`form-input${formErrors.type ? ' input-error' : ''}`} value={staffForm.type} onChange={e => setStaffForm(f => ({ ...f, type: e.target.value }))} required>
                    <option value="">Select type...</option>
                    {APPOINTMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {formErrors.type && <div className="form-error">{formErrors.type}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Date & Time</label>
                  <input type="datetime-local" className={`form-input${formErrors.appointmentDate ? ' input-error' : ''}`} value={staffForm.appointmentDate} onChange={e => setStaffForm(f => ({ ...f, appointmentDate: e.target.value }))} required />
                  {formErrors.appointmentDate && <div className="form-error">{formErrors.appointmentDate}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (minutes)</label>
                  <input type="number" className="form-input" value={staffForm.durationMinutes} onChange={e => setStaffForm(f => ({ ...f, durationMinutes: parseInt(e.target.value) }))} min="15" max="120" step="15" />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes (optional)</label>
                  <textarea className="form-input" value={staffForm.notes} onChange={e => setStaffForm(f => ({ ...f, notes: e.target.value }))} rows={2} maxLength={500} />
                  <div className="form-hint">{staffForm.notes?.length || 0}/500</div>
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => { setShowModal(false); setFormErrors({}); }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <><span className="spinner" style={{ width: 14, height: 14 }}></span> Creating...</> : 'Create Appointment'}
                  </button>
                </div>
              </form>
            ) : (
              /* Patient: Schedule their own appointment */
              <form onSubmit={handlePatientSchedule} noValidate>
                <div style={{ background: 'var(--teal-50)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: 20, fontSize: 13, color: 'var(--teal-dark)', border: '1px solid var(--teal-100)' }}>
                  📋 Choose your appointment type, preferred doctor, and a convenient date/time. We'll send you a reminder before your visit.
                </div>

                <div className="form-group">
                  <label className="form-label">Appointment Type</label>
                  <select className={`form-input${formErrors.type ? ' input-error' : ''}`} value={patientForm.type} onChange={e => setPatientForm(f => ({ ...f, type: e.target.value }))} required>
                    <option value="">What kind of visit?</option>
                    {APPOINTMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {formErrors.type && <div className="form-error">{formErrors.type}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Doctor (optional)</label>
                  <select className="form-input" value={patientForm.staffId} onChange={e => setPatientForm(f => ({ ...f, staffId: e.target.value }))}>
                    <option value="">Any available doctor</option>
                    {staffList.map(s => <option key={s.id} value={s.id}>Dr. {s.first_name} {s.last_name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Date & Time</label>
                  <input type="datetime-local" className={`form-input${formErrors.appointmentDate ? ' input-error' : ''}`} value={patientForm.appointmentDate} onChange={e => setPatientForm(f => ({ ...f, appointmentDate: e.target.value }))} required />
                  {formErrors.appointmentDate && <div className="form-error">{formErrors.appointmentDate}</div>}
                  <div className="form-hint">Clinic hours: Mon–Fri, 8:00 AM – 5:00 PM</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <select className="form-input" value={patientForm.durationMinutes} onChange={e => setPatientForm(f => ({ ...f, durationMinutes: parseInt(e.target.value) }))}>
                    <option value={15}>15 min — Quick check-in</option>
                    <option value={30}>30 min — Standard visit</option>
                    <option value={45}>45 min — Extended visit</option>
                    <option value={60}>60 min — Comprehensive exam</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes for the doctor (optional)</label>
                  <textarea className="form-input" value={patientForm.notes} onChange={e => setPatientForm(f => ({ ...f, notes: e.target.value }))} rows={2} maxLength={500} placeholder="Describe symptoms, concerns, or reason for visit..." />
                  <div className="form-hint">{patientForm.notes?.length || 0}/500</div>
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => { setShowModal(false); setFormErrors({}); }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <><span className="spinner" style={{ width: 14, height: 14 }}></span> Scheduling...</> : '📅 Schedule Appointment'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
