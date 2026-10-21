export function isValidPersonName(name) {
  const namePattern = /^[\p{L}]+(?:[ '\u2019-][\p{L}]+)*$/u;
  return namePattern.test(name.trim());
}

export function isValidSenegalPhone(phone) {
  const compactPhone = phone.trim().replace(/[\s.-]/g, "");
  const localPhone = compactPhone.startsWith("+221")
    ? compactPhone.slice(4)
    : compactPhone;

  return /^(?:76|77|78)\d{7}$/.test(localPhone);
}
