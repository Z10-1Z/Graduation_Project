import { StickyNote, Star, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { translateAppointmentStatus } from '../utils/i18nStatus';
import { specialtyDisplayLabel } from '../utils/specialtyI18n';

function DetailRow({ label, value, multiline = false }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 pb-2 last:border-0">
      <dt className="text-xs font-semibold text-gray-500 shrink-0">{label}</dt>
      <dd className={`text-gray-800 font-medium text-end ${multiline ? 'whitespace-pre-wrap max-w-[65%]' : ''}`}>{value}</dd>
    </div>
  );
}

function statusBadgeClass(status) {
  const key = String(status || '').toLowerCase();
  if (key === 'completed' || key === 'مكتمل') return 'bg-green-100 text-green-600';
  if (key === 'cancelled' || key === 'ملغي') return 'bg-red-100 text-red-500';
  if (key === 'pending' || key === 'قيد الانتظار') return 'bg-yellow-100 text-yellow-600';
  if (key === 'confirmed' || key === 'مؤكد') return 'bg-blue-100 text-blue-600';
  return 'bg-gray-100 text-gray-500';
}

/**
 * @param {{ appointment: object | null, variant: 'patient' | 'doctor', onClose: () => void }} props
 */
export default function AppointmentDetailsModal({ appointment, variant = 'patient', onClose }) {
  const { t } = useTranslation();
  if (!appointment) return null;

  const isDoctorView = variant === 'doctor';
  const title = t('appointmentDetails.title');
  const displayName = isDoctorView ? appointment.name : appointment.doctorName;
  const displayImg = appointment.img;
  const subtitle = isDoctorView ? appointment.pid : specialtyDisplayLabel(appointment.specialty, t);
  const location =
    appointment.location && appointment.location !== '—'
      ? appointment.location
      : [appointment.governorate, appointment.area].filter(Boolean).join(' - ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} role="presentation" />
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-6 w-full max-w-md z-10 text-start max-h-[min(90vh,640px)] overflow-y-auto"
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0" aria-label={t('common.close')}>
            <X size={20} />
          </button>
          <h3 className="font-bold text-gray-800 text-lg flex-1">{title}</h3>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <img src={displayImg} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0 ring-2 ring-blue-50" />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-gray-800 truncate">{displayName}</p>
            <p className="text-blue-500 text-xs mt-0.5">{subtitle}</p>
            <span className={`inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full ${statusBadgeClass(appointment.status)}`}>
              {translateAppointmentStatus(appointment.status, t)}
            </span>
          </div>
        </div>

        <dl className="space-y-3 text-sm mb-4">
          <DetailRow label={t('appointmentDetails.appointmentId')} value={`#${appointment.id}`} />
          <DetailRow label={t('appointmentDetails.date')} value={appointment.date} />
          <DetailRow label={t('appointmentDetails.time')} value={appointment.time} />
          {appointment.governorate ? <DetailRow label={t('appointmentDetails.governorate')} value={appointment.governorate} /> : null}
          {appointment.area ? <DetailRow label={t('appointmentDetails.area')} value={appointment.area} /> : null}
          {location ? <DetailRow label={t('appointmentDetails.location')} value={location} /> : null}
          {isDoctorView && appointment.patientEmail ? (
            <DetailRow label={t('appointmentDetails.patientEmail')} value={appointment.patientEmail} />
          ) : null}
          {isDoctorView && appointment.patientPhone ? (
            <DetailRow label={t('appointmentDetails.patientPhone')} value={appointment.patientPhone} />
          ) : null}
          {!isDoctorView && appointment.doctorEmail ? (
            <DetailRow label={t('appointmentDetails.doctorEmail')} value={appointment.doctorEmail} />
          ) : null}
        </dl>

        <div className="rounded-xl bg-gray-50 p-3 text-sm">
          <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
            <StickyNote size={13} className="text-blue-500" />
            {t('appointmentDetails.notes')}
          </p>
          <p className="text-gray-700 whitespace-pre-wrap break-words">
            {appointment.notes?.trim() ? appointment.notes : t('appointmentDetails.noNotes')}
          </p>
        </div>

        {!isDoctorView && appointment.rating?.value ? (
          <div className="mt-4 rounded-xl border border-yellow-100 bg-yellow-50/80 p-3 text-sm">
            <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
              <Star size={13} className="text-yellow-500 fill-yellow-500" />
              {t('appointmentDetails.rating', { value: appointment.rating.value })}
            </p>
            {appointment.rating.comment ? (
              <p className="text-gray-700 whitespace-pre-wrap">{appointment.rating.comment}</p>
            ) : (
              <p className="text-gray-400 text-xs">{t('appointmentDetails.noRatingComment')}</p>
            )}
          </div>
        ) : null}

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-5 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
        >
          {t('common.close')}
        </button>
      </div>
    </div>
  );
}
