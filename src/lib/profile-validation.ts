export function normalizeBangladeshiPhone(value: string) {
  return value.replace(/[\s-]/g, "");
}

export function isValidBangladeshiPhone(value: string) {
  const phone = normalizeBangladeshiPhone(value);
  return /^(?:01[3-9]\d{8}|\+8801[3-9]\d{8}|008801[3-9]\d{8})$/.test(phone);
}
