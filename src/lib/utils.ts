import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhoneNumber(countryCode: string | undefined, phone: string | undefined) {
  if (!phone) return "";
  if (!countryCode) return phone;

  // If phone already contains the country code, return phone as is (cleaning up extra plus if needed)
  if (phone.startsWith(countryCode) || phone.startsWith(countryCode.replace('+', ''))) {
    return phone.startsWith('+') ? phone : `+${phone}`;
  }

  // Otherwise combine them
  const cleanCC = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
  return `${cleanCC} ${phone}`;
}
