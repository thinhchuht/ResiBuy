export function validateVietnamesePhoneNumber(phone: string): boolean {
  // Remove spaces, dashes, and dots
  const cleaned = phone.replace(/[\s.-]/g, "");

  // Vietnamese phone number pattern
  const regex = /^(?:\+84|0)(3[2-9]|5[2689]|7[06-9]|8[1-689]|9[0-46-9])[0-9]{7}$/;

  return regex.test(cleaned);
}
