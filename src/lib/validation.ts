// import { useTranslation } from '@/hooks/useTranslation';

/**
 * Validation helper utility
 * Uses common validation messages with field substitution
 */

export interface ValidationHelpers {
  required: (field: string) => string;
  invalid: (field: string) => string;
  minLength: (field: string, length: number) => string;
  maxLength: (field: string, length: number) => string;
  min: (field: string, value: number) => string;
  max: (field: string, value: number) => string;
  pattern: (field: string) => string;
  email: (field: string) => string;
  phone: (field: string) => string;
  passwordMatch: () => string;
  passwordUppercase: () => string;
  passwordLowercase: () => string;
  passwordNumber: () => string;
}

/**
 * Creates validation helpers with translation support
 * @param t - Translation function from useTranslation hook
 * @returns Object with validation helper methods
 */
export const createValidationHelpers = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
): ValidationHelpers => ({
  /**
   * Required field validation
   * Uses: common.validation.required
   */
  required: (field: string) => {
    const message = t("common.validation.required", "{field} is required.");
    return message.replace("{field}", field);
  },

  /**
   * Invalid field validation
   * Uses: common.validation.invalid
   */
  invalid: (field: string) => {
    const message = t("common.validation.invalid", "{field} is invalid.");
    return message.replace("{field}", field);
  },

  /**
   * Minimum length validation
   * Uses: common.validation.minLength
   */
  minLength: (field: string, length: number) => {
    const message = t(
      "common.validation.minLength",
      "{field} must be at least {length} characters long.",
    );
    return message
      .replace("{field}", field)
      .replace("{length}", length.toString());
  },

  /**
   * Maximum length validation
   * Uses: common.validation.maxLength
   */
  maxLength: (field: string, length: number) => {
    const message = t(
      "common.validation.maxLength",
      "{field} cannot exceed {length} characters.",
    );
    return message
      .replace("{field}", field)
      .replace("{length}", length.toString());
  },

  /**
   * Minimum value validation
   * Uses: common.validation.min
   */
  min: (field: string, value: number) => {
    const message = t(
      "common.validation.min",
      "{field} must be at least {value}.",
    );
    return message
      .replace("{field}", field)
      .replace("{value}", value.toString());
  },

  /**
   * Maximum value validation
   * Uses: common.validation.max
   */
  max: (field: string, value: number) => {
    const message = t(
      "common.validation.max",
      "{field} cannot exceed {value}.",
    );
    return message
      .replace("{field}", field)
      .replace("{value}", value.toString());
  },

  /**
   * Pattern validation
   * Uses: common.validation.pattern
   */
  pattern: (field: string) => {
    const message = t(
      "common.validation.pattern",
      "{field} format is invalid.",
    );
    return message.replace("{field}", field);
  },

  /**
   * Email specific validation
   */
  email: () => {
    return t(
      "auth.signup.validation.emailInvalid",
      "Please enter a valid email address",
    );
  },

  /**
   * Phone specific validation
   */
  phone: () => {
    return t(
      "auth.signup.validation.phoneInvalid",
      "Please enter a valid phone number",
    );
  },

  /**
   * Password match validation
   */
  passwordMatch: () => {
    return t(
      "auth.signup.validation.passwordMismatch",
      "Passwords do not match",
    );
  },

  /**
   * Password uppercase validation
   */
  passwordUppercase: () => {
    return t(
      "auth.signup.validation.passwordUppercase",
      "Password must contain at least one uppercase letter",
    );
  },

  /**
   * Password lowercase validation
   */
  passwordLowercase: () => {
    return t(
      "auth.signup.validation.passwordLowercase",
      "Password must contain at least one lowercase letter",
    );
  },

  /**
   * Password number validation
   */
  passwordNumber: () => {
    return t(
      "auth.signup.validation.passwordNumber",
      "Password must contain at least one number",
    );
  },
});

import { isValidPhoneNumber } from "react-phone-number-input";
/**
 * Example usage:
 *
 * const { t } = useTranslation(locale);
 * const v = createValidationHelpers(t);
 *
 * const schema = z.object({
 *   firstName: z.string()
 *     .min(1, v.required('First name'))
 *     .min(2, v.minLength('First name', 2))
 *     .max(50, v.maxLength('First name', 50)),
 *   email: z.string()
 *     .min(1, v.required('Email'))
 *     .email(v.email('Email')),
 *   password: z.string()
 *     .min(8, v.minLength('Password', 8))
 *     .regex(/[A-Z]/, v.passwordUppercase())
 *     .regex(/[a-z]/, v.passwordLowercase())
 *     .regex(/[0-9]/, v.passwordNumber())
 * });
 */

import * as z from "zod";


export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 50;

// Auth Schemas
export const loginSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
) =>
  z.object({
    email: z
      .string()
      .min(1, t("auth.login.validation.emailRequired", "Email is required."))
      .email(t("auth.login.validation.emailInvalid", "Email is invalid.")),
    password: z
      .string()
      .min(
        1,
        t("auth.login.validation.passwordRequired", "Password is required."),
      ),
    rememberMe: z.boolean(),
  });

export type LoginFormData = z.infer<ReturnType<typeof loginSchema>>;

// Forgot Password Schema
export const forgotPasswordSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
) =>
  z.object({
    email: z
      .string()
      .min(1, t("auth.login.validation.emailRequired", "Email is required."))
      .email(t("auth.login.validation.emailInvalid", "Invalid email address.")),
  });

export type ForgotPasswordFormData = z.infer<
  ReturnType<typeof forgotPasswordSchema>
>;

// Reset Password Schema
export const resetPasswordSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
) =>
  z
    .object({
      newPassword: z
        .string()
        .min(
          1,
          t("auth.login.validation.passwordRequired", "Password is required."),
        )
        .min(
          PASSWORD_MIN,
          t(
            "auth.signup.validation.passwordMin",
            "Password must be at least {min} characters.",
            { min: PASSWORD_MIN },
          ),
        )
        .max(
          PASSWORD_MAX,
          t(
            "auth.signup.validation.passwordMax",
            "Password cannot exceed {max} characters.",
            { max: PASSWORD_MAX },
          ),
        )
        .regex(
          /(?=.*[a-z])(?=.*[A-Z])/,
          t(
            "auth.signup.validation.passwordUpperLower",
            "Password must contain at least one uppercase and one lowercase letter.",
          ),
        )
        .regex(
          /[^A-Za-z0-9]/,
          t(
            "auth.signup.validation.passwordSpecialChar",
            "Password must contain at least one special character.",
          ),
        )
        .regex(
          /[0-9]/,
          t(
            "auth.signup.validation.passwordNumber",
            "Password must contain at least one number.",
          ),
        ),
      confirmPassword: z
        .string()
        .min(
          1,
          t(
            "auth.signup.validation.confirmPasswordRequired",
            "Confirm password is required.",
          ),
        ),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t(
        "auth.signup.validation.passwordMismatch",
        "Passwords do not match.",
      ),
      path: ["confirmPassword"],
    });

export type ResetPasswordFormData = z.infer<
  ReturnType<typeof resetPasswordSchema>
>;

export const createApprovalSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
  action: "approve" | "reject" | "activate" | "deactivate",
) => {
  return z.object({
    remark:
      action === "reject" || action === "deactivate"
        ? z
            .string()
            .min(
              10,
              t(
                "organizer.management.validation.rejectReasonRequired",
                "Reason for rejection is required (min 10 characters)",
              ),
            )
            .max(
              500,
              t(
                "organizer.management.validation.remarkTooLong",
                "Remark cannot exceed 500 characters",
              ),
            )
        : z
            .string()
            .max(
              500,
              t(
                "organizer.management.validation.remarkTooLong",
                "Remark cannot exceed 500 characters",
              ),
            )
            .optional(),
  });
};

export type ApprovalFormValues = z.infer<
  ReturnType<typeof createApprovalSchema>
>;

/**
 * Organizer Creation Schema (Admin)
 */
export const createOrganizerSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
) => {
  const v = createValidationHelpers(t);
  return z.object({
    first_name: z
      .string()
      .min(1, v.required(t("auth.signup.firstName", "First Name")))
      .min(2, v.minLength(t("auth.signup.firstName", "First Name"), 2))
      .max(50, v.maxLength(t("auth.signup.firstName", "First Name"), 50)),
    last_name: z
      .string()
      .min(1, v.required(t("auth.signup.lastName", "Last Name")))
      .min(2, v.minLength(t("auth.signup.lastName", "Last Name"), 2))
      .max(50, v.maxLength(t("auth.signup.lastName", "Last Name"), 50)),
    email: z
      .string()
      .min(1, v.required(t("auth.signup.email", "Email")))
      .email(v.email(t("auth.signup.email", "Email"))),
    password: z
      .string()
      .min(8, v.minLength(t("auth.signup.password", "Password"), 8))
      .regex(/[A-Z]/, v.passwordUppercase())
      .regex(/[a-z]/, v.passwordLowercase())
      .regex(/[0-9]/, v.passwordNumber()),
    phone: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine(
        (val) =>
          !val ||
          val.length === 0 ||
          (typeof val === "string" && isValidPhoneNumber(val)),
        v.phone("Phone"),
      ),
    country_code: z.string().optional().or(z.literal("")),
  });
};

export type CreateOrganizerFormData = z.infer<
  ReturnType<typeof createOrganizerSchema>
>;

/**
 * Dashboard Event Approval Schema
 * Used for approving events with commission rate
 *
 * Schema Factory Pattern:
 * - Pass `t` function to schema for translated error messages
 * - Use with `useMemo(() => createEventApprovalSchema(t), [t])`
 */
export const createEventApprovalSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
) => {
  return z.object({
    commissionRate: z
      .string()
      .min(
        1,
        t(
          "dashboard.validation.commissionRequired",
          "Commission rate is required.",
        ),
      )
      .regex(
        /^(100(\.00?)?|[0-9]?\d(\.\d{1,2})?)$/,
        t(
          "dashboard.validation.commissionInvalid",
          "Enter a valid percentage (0-100) with up to 2 decimal places.",
        ),
      ),
    // Required string with max length (not optional to match form interface)
    adminRemark: z
      .string()
      .max(
        500,
        t(
          "dashboard.validation.remarkTooLong",
          "Remark cannot exceed 500 characters.",
        ),
      ),
  });
};

export type EventApprovalFormValues = z.infer<
  ReturnType<typeof createEventApprovalSchema>
>;

/**
 * Dashboard Rejection Schema
 * Used for rejecting events and organizers with required reason
 *
 * Schema Factory Pattern:
 * - Pass `t` function to schema for translated error messages
 * - Use with `useMemo(() => createRejectionSchema(t), [t])`
 */
export const createRejectionSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
) => {
  return z.object({
    adminRemark: z
      .string()
      .min(
        10,
        t(
          "dashboard.validation.rejectionReasonRequired",
          "Reason for rejection is required (min 10 characters).",
        ),
      )
      .max(
        500,
        t(
          "dashboard.validation.remarkTooLong",
          "Remark cannot exceed 500 characters.",
        ),
      ),
  });
};

export type RejectionFormValues = z.infer<
  ReturnType<typeof createRejectionSchema>
>;

// =======================================
// Event Form Validation (Admin)
// =======================================

// Field Validation Limits
export const EVENT_TITLE_MAX = 200;
export const EVENT_DESC_MAX = 5000;
export const VENUE_NAME_MAX = 200;
export const VENUE_ADDRESS_MAX = 500;
export const TIER_NAME_MAX = 100;
export const MAX_CAPACITY = 100000;
export const MAX_PRICE = 100000;
export const MAX_QUANTITY = 100000;

export const MAX_COMMISSION = 100;
export const PROMO_CODE_NAME_MAX = 50;
export const PROMO_CODE_AMOUNT_MAX = 100000;
export const PROMO_CODE_QUANTITY_MAX = 100000;

// Helper for required date string validation
const createRequiredDateSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
  fieldName: string,
) =>
  z
    .string()
    .min(1, t("event.validation.dateRequired", `${fieldName} is required.`))
    .superRefine((val, ctx) => {
      const date = new Date(val);
      if (isNaN(date.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t(
            "event.validation.invalidDate",
            "Enter a valid date and time.",
          ),
        });
        return;
      }
      if (date.getFullYear() > 9999) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t(
            "event.validation.yearLimit",
            "Year cannot exceed 4 digits.",
          ),
        });
        return;
      }
      // Check for past date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t(
            "event.validation.pastDate",
            "Date cannot be in the past.",
          ),
        });
      }
    });

// Helper for required number schema
const createRequiredNumberSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
  fieldName: string,
  minValue: number = 1,
  maxValue: number = Number.MAX_SAFE_INTEGER,
) => {
  return z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    },
    z
      .number({
        message: t(
          "event.validation.numberRequired",
          `${fieldName} is required.`,
        ),
      })
      .min(
        minValue,
        t(
          "event.validation.minValue",
          `${fieldName} must be at least ${minValue}.`,
        ),
      )
      .max(
        maxValue,
        t(
          "event.validation.maxValue",
          `${fieldName} cannot exceed ${maxValue}.`,
        ),
      ),
  );
};

/**
 * Ticket/Tier Schema
 * Used for validating individual ticket tiers
 */
export const createTicketSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
) =>
  z
    .object({
      id: z.string().optional(),
      name: z
        .string()
        .min(
          1,
          t("event.validation.tierNameRequired", "Tier Name is required."),
        )
        .max(
          TIER_NAME_MAX,
          t(
            "event.validation.tierNameMax",
            `Tier Name must be under ${TIER_NAME_MAX} characters.`,
          ),
        ),
      price: createRequiredNumberSchema(t, "Price", 1, MAX_PRICE),
      quantity: createRequiredNumberSchema(t, "Quantity", 1, MAX_QUANTITY),
      gst: z.preprocess(
        (val) => {
          if (val === "" || val === null || val === undefined) return undefined;
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        },
        z
          .number()
          .min(0, t("event.validation.gstPositive", "GST must be positive."))
          .max(100, t("event.validation.gstMax", "GST cannot exceed 100%.")),
      ),
      salesStart: createRequiredDateSchema(
        t,
        "event.field.salesStart:Sales Start Date",
      )
        .optional()
        .or(z.literal("")),
      salesEnd: createRequiredDateSchema(
        t,
        "event.field.salesEnd:Sales End Date",
      )
        .optional()
        .or(z.literal("")),
    })
    .refine(
      (data) => {
        if (!data.salesEnd || !data.salesStart) return true;
        return new Date(data.salesEnd) > new Date(data.salesStart);
      },
      {
        message: t(
          "event.validation.salesEndAfterStart",
          "Sales End Date must be after Sales Start Date.",
        ),
        path: ["salesEnd"],
      },
    );

export const createPromoCodeSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
) =>
  z
    .object({
      code: z
        .string()
        .min(
          1,
          t("event.validation.promoCodeRequired", "Promo Code is required."),
        )
        .max(
          PROMO_CODE_NAME_MAX,
          t(
            "event.validation.promoCodeMaxLength",
            `Promo Code must be under ${PROMO_CODE_NAME_MAX} characters.`,
          ),
        )
        .regex(
          /^[A-Z0-9_-]+$/,
          t(
            "event.validation.promoCodeFormat",
            "Promo Code may only contain A-Z , 0-9, _ or -",
          ),
        ),
      discountType: z
        .string()
        .min(
          1,
          t(
            "event.validation.discountTypeRequired",
            "Discount Type is required.",
          ),
        ),
      amount: z.preprocess((val) => {
        if (val === "" || val === null || val === undefined) return undefined;
        const num = Number(val);
        return isNaN(num) ? undefined : num;
      }, z.number().optional()),
      quantity: createRequiredNumberSchema(
        t,
        "event.field.discountQuantity:Quantity",
        1,
        PROMO_CODE_QUANTITY_MAX,
      ),
    })
    .superRefine((data, ctx) => {
      const { discountType, amount } = data;

      // Handle empty amount based on discount type
      if (amount === undefined || amount === null) {
        const message =
          discountType === "percentage"
            ? t(
                "event.validation.discountPercentageRequired",
                "Discount Percentage is required.",
              )
            : t(
                "event.validation.discountAmountRequired",
                "Discount Amount is required.",
              );
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message,
          path: ["amount"],
        });
        return;
      }

      if (discountType === "percentage") {
        if (!amount) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t(
              "event.validation.discountPercentageRequired",
              "Discount Percentage is required.",
            ),
            path: ["amount"],
          });
        }
        // Percentage validation: 0.01 - 100, max 2 decimal places
        if (amount < 0.01) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t(
              "event.validation.percentageMin",
              "Percentage must be at least 0.01%.",
            ),
            path: ["amount"],
          });
        }
        if (amount > 100) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t(
              "event.validation.percentageMax",
              "Percentage cannot exceed 100%.",
            ),
            path: ["amount"],
          });
        }
        // Check for max 2 decimal places
        const decimalStr = amount.toString();
        const decimalPart = decimalStr.split(".")[1];
        if (decimalPart && decimalPart.length > 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t(
              "event.validation.percentageDecimals",
              "Percentage can have at most 2 decimal places.",
            ),
            path: ["amount"],
          });
        }
      } else {
        // Amount (fixed) validation: 1 - PROMO_CODE_AMOUNT_MAX
        if (amount < 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t(
              "event.validation.amountRequired",
              "Amount must be at least 1.",
            ),
            path: ["amount"],
          });
        }
        if (amount > PROMO_CODE_AMOUNT_MAX) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t(
              "event.validation.amountMax",
              `Amount cannot exceed ${PROMO_CODE_AMOUNT_MAX}.`,
            ),
            path: ["amount"],
          });
        }
      }
    });

export type TicketFormData = z.infer<ReturnType<typeof createTicketSchema>>;

/**
 * Event Schema
 * Full validation for create/edit event form
 */
export const createEventSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
) =>
  z
    .object({
      name: z
        .string()
        .min(1, t("event.validation.titleRequired", "Event Title is required."))
        .max(
          EVENT_TITLE_MAX,
          t(
            "event.validation.titleMax",
            `Event Title must be under ${EVENT_TITLE_MAX} characters.`,
          ),
        ),
      description: z
        .string()
        .min(
          1,
          t(
            "event.validation.descriptionRequired",
            "Event Description is required.",
          ),
        )
        .superRefine((val, ctx) => {
          const textLength = val.replace(/<[^>]*>/g, "").length;
          if (textLength > EVENT_DESC_MAX) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `event.validation.descriptionMaxLength|max:${EVENT_DESC_MAX}`,
            });
          }
        }),
      tags: z
        .array(z.string())
        .min(
          1,
          t(
            "event.validation.tagsRequired",
            "At least one Category is required.",
          ),
        ),
      image: z
        .string()
        .min(
          1,
          t("event.validation.imageRequired", "Banner Image is required."),
        ),
      venue: z
        .string()
        .min(1, t("event.validation.venueRequired", "Venue Name is required."))
        .max(
          VENUE_NAME_MAX,
          t(
            "event.validation.venueMax",
            `Venue Name must be under ${VENUE_NAME_MAX} characters.`,
          ),
        ),
      venueAddress: z
        .string()
        .min(
          1,
          t("event.validation.addressRequired", "Venue Address is required."),
        )
        .max(
          VENUE_ADDRESS_MAX,
          t(
            "event.validation.addressMax",
            `Venue Address must be under ${VENUE_ADDRESS_MAX} characters.`,
          ),
        ),
      capacity: createRequiredNumberSchema(t, "Capacity", 1, MAX_CAPACITY),
      timezone: z
        .string()
        .min(
          1,
          t("event.validation.timezoneRequired", "Timezone is required."),
        ),
      startDate: createRequiredDateSchema(t, "Event Start Date"),
      endDate: createRequiredDateSchema(t, "Event End Date"),
      tickets: z
        .array(createTicketSchema(t))
        .min(
          1,
          t(
            "event.validation.ticketsRequired",
            "At least one Ticket Tier is required.",
          ),
        ),
      promoCodes: z.array(createPromoCodeSchema(t)).optional(),
      commissionRate: z.preprocess(
        (val) => {
          if (val === "" || val === null || val === undefined) return 0;
          const num = Number(val);
          return isNaN(num) ? 0 : num;
        },
        z
          .number()
          .min(
            0,
            t(
              "event.validation.commissionMin",
              "Commission rate must be 0 or greater.",
            ),
          )
          .max(
            MAX_COMMISSION,
            t(
              "event.validation.commissionMax",
              `Commission rate cannot exceed ${MAX_COMMISSION}%.`,
            ),
          ),
      ),
    })
    .refine(
      (data) => {
        if (!data.endDate || !data.startDate) return true;
        return new Date(data.endDate) > new Date(data.startDate);
      },
      {
        message: t(
          "event.validation.endDateAfterStart",
          "Event End Date must be after Event Start Date.",
        ),
        path: ["endDate"],
      },
    )
    .superRefine((data, ctx) => {
      // Validate ticket sales dates against event start date
      if (!data.startDate) return;
      const eventStartDate = new Date(data.startDate);

      data.tickets.forEach((ticket, index) => {
        if (ticket.salesStart) {
          const salesStartDate = new Date(ticket.salesStart);
          if (salesStartDate > eventStartDate) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t(
                "event.validation.salesStartBeforeEvent",
                "Sales Start Date cannot be after Event Start Date.",
              ),
              path: ["tickets", index, "salesStart"],
            });
          }
        }
        if (ticket.salesEnd) {
          const salesEndDate = new Date(ticket.salesEnd);
          if (salesEndDate > eventStartDate) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t(
                "event.validation.salesEndBeforeEvent",
                "Sales End Date cannot be after Event Start Date.",
              ),
              path: ["tickets", index, "salesEnd"],
            });
          }
        }
      });

      // Check for duplicate tier names
      if (data.tickets && data.tickets.length > 0) {
        const seenNames = new Set<string>();
        data.tickets.forEach((ticket, index) => {
          if (!ticket.name) return;
          const normalizedName = ticket.name.trim().toLowerCase();
          if (seenNames.has(normalizedName)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t(
                "event.validation.duplicateTierName",
                "Tier Name must be unique.",
              ),
              path: ["tickets", index, "name"],
            });
          }
          seenNames.add(normalizedName);
        });
      }
    });

export type EventFormData = z.infer<ReturnType<typeof createEventSchema>>;

/**
 * Bills Schema
 */

export const createBillSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
) => {
  const v = createValidationHelpers(t);
  return z.object({
    event_id: z.string().min(1, v.required(t("", "Event"))),
    organizer_id: z.string().min(1, v.required(t("", "Organizer"))),
  });
};

export type BillsFormValues = z.infer<ReturnType<typeof createBillSchema>>;

/**`
 * Add Payment to Bill Schema
 */

export const addPaymentToBillSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
  maxAmount:number
) => {
  const v = createValidationHelpers(t);
  return z.object({
    event_id: z
      .string()
      .min(1, v.required(t("billings.addPaymentToBill.event", "Event ID"))),
    bill_id: z.string().optional(),
    organizer_id: z
      .string()
      .min(
        1,
        v.required(t("billings.addPaymentToBill.organizer", "Organizer ID")),
      ),
    payment_ref: z
      .string()
      .max(
        200,
        v.maxLength(
          t("billings.addPaymentToBill.paymentReference", "Payment Reference"),
          200,
        ),
      ),
    notes: z
      .string()
      .max(
        200,
        v.maxLength(t("billings.addPaymentToBill.notes", "Notes"), 200),
      ),
    payment_date: z.date({
      message: v.required(
        t("billings.addPaymentToBill.paymentDate", "Payment Date"),
      ),
    }),
    amount: z
      .number({
        message: v.required(t("billings.addPaymentToBill.amount", "Amount")),
      })
      .min(1, v.min(t("billings.addPaymentToBill.amount", "Amount"), 1))
      .max(
        maxAmount,
        v.max(t("billings.addPaymentToBill.amount", "Amount"), maxAmount ? maxAmount : 1000000),
      ),
    payment_method: z
      .string()
      .min(
        1,
        v.required(
          t("billings.addPaymentToBill.paymentMethod", "Payment Method"),
        ),
      )
      .min(
        2,
        v.minLength(
          t("billings.addPaymentToBill.paymentMethod", "Payment Method"),
          2,
        ),
      )
      .max(
        50,
        v.maxLength(
          t("billings.addPaymentToBill.paymentMethod", "Payment Method"),
          50,
        ),
      ),
    screenshot: z.instanceof(File, {
      message: v.required(t("billings.billHistory.screenshot", "")),
    }),
  });
};

export type AddPaymentToBillFormValues = z.infer<
  ReturnType<typeof addPaymentToBillSchema>
>;

/**`
 * Update Bill Schema
 */

export const updateBillSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
) => {
  const v = createValidationHelpers(t);
  return z.object({
    event_id: z.string().min(1, v.required(t("", "Event ID"))),
    bill_id: z.string().optional(),
    organizer_id: z.string().min(1, v.required(t("", "Organizer ID"))),
    payment_ref: z
      .string()
      .max(200, v.maxLength(t("", "Payment Reference"), 200)),
    notes: z.string().max(200, v.maxLength(t("", "Notes"), 200)),
    amount: z.number().optional(),
    status: z
      .string()
      .min(1, v.required(t("", "Status")))
      .min(2, v.minLength(t("", "Status"), 2))
      .max(50, v.maxLength(t("", "Status"), 50)),
  });
};

export type UpdateBillFormValues = z.infer<ReturnType<typeof updateBillSchema>>;

/**
 * Reject Payout Schema
 */

export const rejectPayoutSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
) => {
  const v = createValidationHelpers(t);
  return z.object({
    admin_notes: z.string().min(1, v.required(t("", "Admin Notes"))),
  });
};

export type RejectPayoutFormValues = z.infer<
  ReturnType<typeof rejectPayoutSchema>
>;

/**
 * Reject Refund Schema
 */

export const rejectRefundSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
) => {
  const v = createValidationHelpers(t);
  return z.object({
    admin_notes: z.string().min(1, v.required(t("", "Admin Notes"))),
  });
};

export type RejectRefundFormValues = z.infer<
  ReturnType<typeof rejectRefundSchema>
>;

/**
 * Cancel Ticket Schema
 */

export const cancelTicketSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
) => {
  const v = createValidationHelpers(t);
  return z.object({
    reason: z.string().min(1, v.required(t("", "Reason"))),
  });
};

export type CancelTicketFormValues = z.infer<
  ReturnType<typeof cancelTicketSchema>
>;

/**
 * Approve Payout Schema
 */

// Only what the form collects
export const approvePayoutSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
) => {
  const v = createValidationHelpers(t);
  return z.object({
    admin_notes: z
      .string()
      .min(1, v.required(t("", "Admin Notes")))
      .min(2, v.minLength(t("", "Admin Notes"), 2))
      .max(100, v.maxLength(t("", "Admin Notes"), 100)),
  });
};

export type ApprovePayoutFormValues = z.infer<
  ReturnType<typeof approvePayoutSchema>
>;

// Separate type for the full API payload
export type ApprovePayoutPayload = {
  payoutId: string;
  status: string;
  admin_notes: string;
};

// Separate type for the full API payload
export type RejectRefundPayload = {
  refundId: string;
  reason: string;
};

/**
 * Password Field Schema
 */

export const passwordFieldSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
) => {
  const v = createValidationHelpers(t);
  return z.object({
    password: z.string().min(1, v.required(t("", "Password"))),
  });
};

export type PasswordFieldFormValues = z.infer<
  ReturnType<typeof passwordFieldSchema>
>;

export const createPaymentSchema = (
  t: (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string,
) => {
  const v = createValidationHelpers(t);

  return z.object({
    api_key: z.string().max(100, v.maxLength("API Key", 100)).optional(),
    api_secret: z.string().max(100, v.maxLength("API Secret", 100)).optional(),
    webhook_secret: z
      .string()
      .max(100, v.maxLength("Webhook Secret", 100))
      .optional(),
    display_name: z
      .string()
      .min(1, v.required("Display Name"))
      .min(3, v.minLength("Display Name", 3))
      .max(100, v.maxLength("Display Name", 100)),
    gateway_name: z
      .string()
      .min(1, v.required("Gateway Name"))
      .min(3, v.minLength("Gateway Name", 3))
      .max(100, v.maxLength("Gateway Name", 100)),
  });
};

export type CreatePaymentFormValues = z.infer<
  ReturnType<typeof createPaymentSchema>
>;

export const nameValidationRegex = /^[A-Za-z\s'-]+$/;

// Zod validation schema
export const createCompanyInfoFormSchema = (
  t: (key: string, fallback?: string) => string,
) =>
  z.object({
    name: z
      .string()
      .min(1, "settings.general.validation.nameRequired")
      .min(2, "settings.general.validation.nameAtLeast2Chars")
      .max(100, "settings.general.validation.nameAtMost100Chars")
      .regex(nameValidationRegex, "settings.general.validation.nameCanContain"),
    email: z
      .string()
      .min(1, "settings.general.validation.emailRequired")
      .email("settings.general.validation.validEmailAddress"),
    description: z.string().optional(),
    phone: z
      .string()
      .refine(
        (val) => !val || isValidPhoneNumber(val, { defaultCountry: "DK" }),
        {
          message: "settings.general.validation.validPhoneNumber",
        },
      )
      .optional(),
    address: z.string().optional(),
    logo_url: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine((val) => !val || z.string().url().safeParse(val).success, {
        message: "settings.general.validation.enterValidURL",
      }),
    facebook_url: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine((val) => !val || z.string().url().safeParse(val).success, {
        message: "settings.general.validation.enterValidURL",
      }),
    instagram_url: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine((val) => !val || z.string().url().safeParse(val).success, {
        message: "settings.general.validation.enterValidURL",
      }),
    linkedin_url: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine((val) => !val || z.string().url().safeParse(val).success, {
        message: "settings.general.validation.enterValidURL",
      }),
    twitter_url: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine((val) => !val || z.string().url().safeParse(val).success, {
        message: "settings.general.validation.enterValidURL",
      }),
    website_url: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine((val) => !val || z.string().url().safeParse(val).success, {
        message: "settings.general.validation.enterValidURL",
      }),
    youtube_url: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine((val) => !val || z.string().url().safeParse(val).success, {
        message: "settings.general.validation.enterValidURL",
      }),
  });
