export const PASSWORD_HINT = "At least 8 characters, including an uppercase letter, a number, and a special character (!@#$%^&*(),.?\":{}|<>).";
export function meetsPasswordPolicy(value) {
  return value.length >= 8 && /[A-Z]/.test(value) && /[0-9]/.test(value)
    && [...'!@#$%^&*(),.?":{}|<>'].some((character) => value.includes(character));
}
