import { getApiOrigin } from './apiOrigin';

const DEFAULT_AVATAR = 'https://randomuser.me/api/portraits/men/55.jpg';

export function resolveStorageUrl(path) {
  if (!path) return null;
  const s = String(path);
  if (/^https?:\/\//i.test(s)) return s;
  return `${getApiOrigin()}/storage/${s.replace(/^\//, '')}`;
}

export function formatAppointmentTime(time) {
  if (!time) return '—';
  const s = String(time);
  return s.length >= 5 ? s.slice(0, 5) : s;
}

export function buildLocation(governorate, area) {
  const parts = [governorate, area].filter(Boolean);
  return parts.length ? parts.join(' - ') : '';
}

export function normalizePatientAppointment(a, fallbackImg = DEFAULT_AVATAR) {
  const doctor = a.doctor || {};
  const gov = doctor.governorate || '';
  const area = doctor.area || '';
  const location = buildLocation(gov, area) || area || a.location || '—';

  return {
    id: a.id,
    status: a.status || 'pending',
    date: a.appointment_date || a.date || '—',
    time: formatAppointmentTime(a.appointment_time || a.time),
    notes: a.notes || '',
    doctorName: doctor.name || a.doctorName || '—',
    doctorEmail: doctor.email || '',
    specialty: doctor.specialty || a.specialty || '—',
    specialty2: doctor.specialty || a.specialty2 || a.specialty || '—',
    governorate: gov,
    area: area || '',
    location,
    img: resolveStorageUrl(doctor.avatar) || doctor.avatar_url || a.img || fallbackImg,
    canRate: Boolean(a.can_rate),
    rating: a.rating
      ? {
          value: Number(a.rating.rating || 0),
          comment: a.rating.comment || '',
        }
      : null,
  };
}

export function normalizeDoctorScheduleItem(item, fallbackImg, defaultTypeLabel = '') {
  const patient = item.patient || {};
  const gov = patient.governorate || '';
  const area = patient.area || '';
  const notes = item.notes || '';

  return {
    id: item.id,
    name: patient.name || '—',
    pid: `#MD-${item.patient_id}`,
    patientId: item.patient_id,
    date: item.appointment_date || '—',
    time: formatAppointmentTime(item.appointment_time),
    endTime: formatAppointmentTime(item.appointment_time),
    type: notes || defaultTypeLabel,
    notes,
    status: item.status || 'pending',
    done: item.status === 'completed',
    img: resolveStorageUrl(patient.avatar) || fallbackImg,
    patientEmail: patient.email || '',
    patientPhone: patient.phone || '',
    governorate: gov,
    area,
    location: buildLocation(gov, area) || '—',
  };
}
