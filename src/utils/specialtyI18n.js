import { SPECIALTY_ALL_AR } from './specialtyFilter';

/** Arabic specialty string (from catalog) → i18n slug under `specialties.*` */
const AR_SPECIALTY_SLUG = {
  'الكل': 'all',
  'قلب وأوعية دموية': 'cardiology',
  'قلب وأوعية دموية (وباطنة)': 'cardiologyInternal',
  'أمراض القلب والباطنة': 'cardiologyInternal',
  'طب الأسنان': 'dentistry',
  'أخصائي اسنان عام': 'dentistry',
  'مخ وأعصاب': 'neurology',
  'طب الأطفال': 'pediatrics',
  'أطفال وحديثي الولادة': 'pediatrics',
  'طب وجراحة العيون': 'ophthalmology',
  'طب عيون': 'ophthalmology',
  'عظام': 'orthopedics',
  'عظام طبي': 'orthopedics',
  'علاج طبيعي': 'physiotherapy',
  'أخصائي علاج طبيعي': 'physiotherapy',
  'أنف وأذن وحنجرة': 'ent',
  'باطنة': 'internal',
  'أمراض باطنة': 'internal',
  'جلدية وتجميل': 'dermatology',
  'نساء وتوليد': 'obgyn',
};

/** Arabic center name → i18n slug under `centers.*` */
const AR_CENTER_SLUG = {
  'مركز الواسطى': 'wasta',
  'الفشن': 'feshn',
  'إهناسيا': 'ehnasya',
  'ناصر': 'nasr',
  'بني سويف': 'beniSuefCity',
  'مركز ببا': 'beba',
  'مركز سمسطا': 'samasta',
};

export function isSpecialtyAllValue(value) {
  const s = String(value || '').trim();
  return !s || s === SPECIALTY_ALL_AR;
}

/**
 * @param {import('i18next').TFunction} t
 */
export function specialtyDisplayLabel(raw, t) {
  const s = String(raw || '').trim();
  if (isSpecialtyAllValue(s)) {
    return t('filters.all');
  }
  const slug = AR_SPECIALTY_SLUG[s];
  if (slug) {
    return t(`specialties.${slug}`);
  }
  return s;
}

/**
 * @param {import('i18next').TFunction} t
 */
export function centerDisplayLabel(raw, t) {
  const s = String(raw || '').trim();
  if (!s) return '';
  const slug = AR_CENTER_SLUG[s];
  if (slug) {
    return t(`centers.${slug}`);
  }
  return s;
}

/**
 * Build { value, label } options for selects/chips (value stays Arabic for filtering).
 * @param {string[]} rawValues from getSpecialtyOptionsFromDoctors
 * @param {import('i18next').TFunction} t
 */
export function mapSpecialtyOptions(rawValues, t) {
  return (rawValues || []).map((value) => ({
    value,
    label: specialtyDisplayLabel(value, t),
  }));
}
