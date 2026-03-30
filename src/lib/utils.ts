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

/**
 * Format a date to "MM/DD/YYYY h:mm AM/PM" format
 * @param date - Date object, ISO string, or timestamp
 * @param options - Optional formatting options
 * @returns Formatted date string or empty string if invalid
 */
export function formatDateTime(
  date: Date | string | number | null | undefined,
  options?: {
    includeSeconds?: boolean;
    timezone?: string;
  }
): string {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;

    if (isNaN(dateObj.getTime())) return "";

    const formatOptions: Intl.DateTimeFormatOptions = {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      ...(options?.includeSeconds && { second: "2-digit" }),
      ...(options?.timezone && { timeZone: options.timezone }),
    };

    return dateObj.toLocaleString("en-US", formatOptions);
  } catch {
    return "";
  }
}

/**
 * Format a date to "MM/DD/YYYY" format (date only)
 * @param date - Date object, ISO string, or timestamp
 * @returns Formatted date string or empty string if invalid
 */
export function formatDate(date: Date | string | number | null | undefined): string {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;

    if (isNaN(dateObj.getTime())) return "";

    return dateObj.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

/**
 * Format a date to "h:mm AM/PM" format (time only)
 * @param date - Date object, ISO string, or timestamp
 * @returns Formatted time string or empty string if invalid
 */
export function formatTime(date: Date | string | number | null | undefined): string {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;

    if (isNaN(dateObj.getTime())) return "";

    return dateObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}

/**
 * Format a UTC date to local long format (e.g., "January 11, 2026, 8:30 PM")
 * @param date - Date object, ISO string (UTC), or timestamp
 * @param locale - Optional locale string (defaults to "en-US")
 * @returns Formatted date string in local timezone or empty string if invalid
 */
export function formatDateTimeLong(
  date: Date | string | number | null | undefined,
  locale: string = "en-US"
): string {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;

    if (isNaN(dateObj.getTime())) return "";

    return dateObj.toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

/**
 * Format a date relative to now (e.g., "2 days ago", "in 3 hours")
 * @param date - Date object, ISO string, or timestamp
 * @returns Relative time string or empty string if invalid
 */
export function formatRelativeTime(date: Date | string | number | null | undefined): string {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;

    if (isNaN(dateObj.getTime())) return "";

    const now = new Date();
    const diffMs = dateObj.getTime() - now.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

    if (Math.abs(diffDay) >= 1) {
      return rtf.format(diffDay, "day");
    } else if (Math.abs(diffHour) >= 1) {
      return rtf.format(diffHour, "hour");
    } else if (Math.abs(diffMin) >= 1) {
      return rtf.format(diffMin, "minute");
    } else {
      return rtf.format(diffSec, "second");
    }
  } catch {
    return "";
  }
}

/**
 * Get initials from a name
 * @param name - Name to get initials from
 * @returns Initials of the name
 */
export function getInitials(name: string | { first_name: string, last_name?: string } | null | undefined) {
  if (!name) return "";

  if (typeof name === "string") {
    const names = name.split(" ");
    const first = names[0]?.[0] || "";
    const last = names[names.length - 1]?.[0] || "";
    return (first + last).toUpperCase();
  } else if (typeof name === "object" && name.first_name) {
    const first = name.first_name[0] || "";
    const last = name.last_name?.[0] || "";
    return (first + last).toUpperCase();
  }
  return "";
}

/**
 * Format a currency amount using the user's locale
 * @param amount - The amount to format
 * @param currency - The currency code (e.g. "USD", "EUR")
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency?: string, locale: string = "ja") => {
  const currencyMap: Record<string, string> = {
    ja: "JPY",
    en: "USD",
    it: "EUR",
  };
  const resolvedCurrency = currency || currencyMap[locale];

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: resolvedCurrency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};