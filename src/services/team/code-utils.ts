export const generateVerificationCode = (): string => {
  const array = new Uint8Array(6);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('').slice(0, 12);
}
