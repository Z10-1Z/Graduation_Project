export function formatAttachmentBytes(n) {
  const b = Number(n) || 0;
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export function attachmentCategoryLabel(t, cat, keyPrefix = 'doctor.patients') {
  return t(`${keyPrefix}.cat_${cat}`, { defaultValue: cat });
}
