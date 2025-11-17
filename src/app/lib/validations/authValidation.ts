import * as z from "zod";

export const createLoginSchema = (
  t: (key: string, fallback?: string) => string
) =>
  z.object({
    email: z
      .string()
      .min(1, t("Email is required."))
      .email(t("Invalid email address.")),
    password: z
      .string()
      .min(1, t("Password is required."))
      .max(100, t("Password is too long.")),
    rememberMe: z.boolean(),
  });

export type LoginSchema = z.infer<ReturnType<typeof createLoginSchema>>;

export const createRegisterSchema = (
  t: (key: string, fallback?: string) => string
) =>
  z
    .object({
      firstName: z.string().min(1, t("First name is required.")),
      lastName: z.string().min(1, t("Last name is required.")),
      email: z
        .string()
        .min(1, t("Email is required."))
        .email(t("Invalid email address.")),
      phone: z
        .string()
        .min(7, t("Phone number is too short."))
        .max(15, t("Phone number is too long.")),
      password: z
        .string()
        .min(1, t("Password is too short."))
        .max(100, t("Password is too long.")),
      confirmPassword: z
        .string()
        .min(1, t("Password is too short."))
        .max(100, t("Password is too long.")),
      countryCode: z.string().min(1),
      rememberMe: z.boolean().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("Passwords must match."),
      path: ["confirmPassword"],
    });

export type RegisterSchema = z.infer<ReturnType<typeof createRegisterSchema>>;

export const createChangePasswordSchema = () =>
  z
    .object({
      password: z
        .string()
        .min(6, "Password must be at least 6 characters.")
        .max(100, "Password is too long."),
      confirmPassword: z
        .string()
        .min(6, "Password must be at least 6 characters.")
        .max(100, "Password is too long."),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords must match.",
      path: ["confirmPassword"],
    });

export type ChangePasswordSchema = z.infer<ReturnType<typeof createChangePasswordSchema>>;

export const createForgotPasswordSchema = (
    t: (key: string, fallback?: string) => string
) =>
  z
    .object({
    email: z
      .string()
      .min(1, t("Email is required."))
      .email(t("Invalid email address.")),
    })

export type ForgotPasswordSchema = z.infer<ReturnType<typeof createForgotPasswordSchema>>;