export const PASSWORD_HINT = "At least 8 characters, including an uppercase letter, a number, and a special character.";
export function getPasswordError(value) {
  if (value.length > 72 || new TextEncoder().encode(value).length > 72) {
    return "Password must not exceed 72 UTF-8 bytes";
  }
  if ([...value].length < 8 || !/[A-Z]/.test(value) || !/[0-9]/.test(value)
      || ![...'!@#$%^&*(),.?":{}|<>'].some((character) => value.includes(character))
      || /[\r\n\u0085\u2028\u2029]/u.test(value)) return PASSWORD_HINT;
  return "";
}
export function meetsPasswordPolicy(value) { return getPasswordError(value) === ""; }
