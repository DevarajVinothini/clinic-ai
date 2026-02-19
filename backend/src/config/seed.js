require('dotenv').config();
const pool = require('./database');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function seed() {
  const client = await pool.connect();
  try {
    // Run schema
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schema);
    console.log('✅ Schema created');

    // Create admin/staff user
    const staffHash = await bcrypt.hash('staff123', 12);
    await client.query(`
      INSERT INTO users (email, password_hash, role, first_name, last_name, phone)
      VALUES ($1, $2, 'staff', 'Dr. Sarah', 'Chen', '555-0101')
      ON CONFLICT (email) DO NOTHING
    `, ['staff@clinic.com', staffHash]);

    // Create demo patients
    const patientHash = await bcrypt.hash('patient123', 12);
    const patients = [
      ['john.doe@email.com', patientHash, 'patient', 'John', 'Doe', '555-0201', '1985-03-15'],
      ['jane.smith@email.com', patientHash, 'patient', 'Jane', 'Smith', '555-0202', '1992-07-22'],
      ['bob.johnson@email.com', patientHash, 'patient', 'Bob', 'Johnson', '555-0203', '1978-11-08'],
    ];

    for (const p of patients) {
      await client.query(`
        INSERT INTO users (email, password_hash, role, first_name, last_name, phone, date_of_birth)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (email) DO NOTHING
      `, p);
    }
    console.log('✅ Demo users created');

    // Get IDs
    const staffRes = await client.query(`SELECT id FROM users WHERE email='staff@clinic.com'`);
    const staffId = staffRes.rows[0].id;
    const patientRes = await client.query(`SELECT id FROM users WHERE role='patient'`);
    const patientIds = patientRes.rows.map(r => r.id);

    // Create appointments
    const now = new Date();
    const apptData = [
      [patientIds[0], staffId, new Date(now.getTime() + 2 * 24 * 3600000), 'Annual Checkup', 'scheduled', 0.15],
      [patientIds[0], staffId, new Date(now.getTime() + 7 * 24 * 3600000), 'Blood Test Follow-up', 'scheduled', 0.62],
      [patientIds[1], staffId, new Date(now.getTime() + 1 * 24 * 3600000), 'Cardiology Review', 'confirmed', 0.08],
      [patientIds[1], staffId, new Date(now.getTime() - 3 * 24 * 3600000), 'Prescription Renewal', 'completed', 0.22],
      [patientIds[2], staffId, new Date(now.getTime() + 3 * 24 * 3600000), 'Diabetes Management', 'scheduled', 0.78],
      [patientIds[2], staffId, new Date(now.getTime() - 7 * 24 * 3600000), 'Initial Consultation', 'no_show', 0.81],
    ];

    for (const a of apptData) {
      await client.query(`
        INSERT INTO appointments (patient_id, staff_id, appointment_date, type, status, no_show_risk_score)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, a);
    }
    console.log('✅ Demo appointments created');

    // Create medications for patient 1
    const meds = [
      [patientIds[0], 'Metformin', '500mg', 'Twice daily', '2024-01-01', 'Take with meals'],
      [patientIds[0], 'Lisinopril', '10mg', 'Once daily', '2024-03-15', 'Take in the morning'],
      [patientIds[1], 'Atorvastatin', '20mg', 'Once daily at bedtime', '2024-02-01', 'Avoid grapefruit'],
    ];

    for (const m of meds) {
      await client.query(`
        INSERT INTO medications (patient_id, name, dosage, frequency, start_date, instructions)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, m);
    }
    console.log('✅ Demo medications created');

    // Create reminders
    const apptRes = await client.query(`SELECT id, patient_id, appointment_date FROM appointments WHERE status='scheduled' OR status='confirmed'`);
    for (const appt of apptRes.rows) {
      const reminderTime = new Date(new Date(appt.appointment_date).getTime() - 24 * 3600000);
      await client.query(`
        INSERT INTO reminders (patient_id, appointment_id, type, message, scheduled_at)
        VALUES ($1, $2, 'appointment', $3, $4)
      `, [
        appt.patient_id,
        appt.id,
        `Reminder: You have an upcoming appointment tomorrow. Please confirm your attendance.`,
        reminderTime
      ]);
    }
    console.log('✅ Demo reminders created');

    console.log('\n🎉 Seed complete!');
    console.log('Staff login: staff@clinic.com / staff123');
    console.log('Patient login: john.doe@email.com / patient123');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
