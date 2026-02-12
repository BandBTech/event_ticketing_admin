"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  Envelope as EnvelopeIcon,
  Key as KeyIcon,
  User as UserIcon,
  ArrowsClockwise as ArrowsClockwiseIcon,
} from "@phosphor-icons/react";
import type { Country } from "react-phone-number-input";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TranslatedFormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";
import { cn } from "@/lib/utils";

import { OrganizerService } from "@/services/organizerService";
import { createOrganizerSchema, CreateOrganizerFormData } from "@/lib/validation";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";

interface OrganizerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Generate a random password that meets all requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one special character
 * - At least one number
 */
function generateStrongPassword(): string {
  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lowercase = "abcdefghjkmnpqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%&*?";

  const password = [
    uppercase[Math.floor(Math.random() * uppercase.length)],
    lowercase[Math.floor(Math.random() * lowercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    special[Math.floor(Math.random() * special.length)],
  ];

  const allChars = uppercase + lowercase + numbers + special;
  for (let i = password.length; i < 12; i++) {
    password.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  for (let i = password.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join("");
}

export default function OrganizerFormDialog({
  open,
  onOpenChange,
}: OrganizerFormDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [defaultCountry, setDefaultCountry] = useState<Country>("NP");

  const schema = createOrganizerSchema(t);

  const form = useForm<CreateOrganizerFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      phone: "",
      country_code: "",
    },
    mode: 'onChange'
  });

  useEffect(() => {
    const detectCountry = async () => {
      try {
        const cached = sessionStorage.getItem("user_country_code");
        if (cached) {
          setDefaultCountry(cached as Country);
          return;
        }

        const response = await fetch("https://ipapi.co/json/");
        if (response.ok) {
          const data = await response.json();
          if (data.country_code) {
            setDefaultCountry(data.country_code as Country);
            sessionStorage.setItem("user_country_code", data.country_code);
          }
        }
      } catch (error) {
        console.log("Could not detect country, using default (NP)", error);
      }
    };

    if (open) {
      detectCountry();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      form.reset({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        phone: "",
        country_code: "",
      });
    }
  }, [open, form]);

  const handleGeneratePassword = () => {
    const newPassword = generateStrongPassword();
    form.setValue("password", newPassword, { shouldValidate: true });
    navigator.clipboard.writeText(newPassword).then(() => {
      toast.success(t('users.generatePassword.successCopy', "Password generated and copied to clipboard!"));
    }).catch(() => {
      toast.success(t('users.generatePassword.success', "Password generated successfully"));
    });
  };

  const createMutation = useMutation({
    mutationFn: (data: CreateOrganizerFormData) =>
      OrganizerService.createOrganizer({
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        password: data.password,
        phone: data.phone || undefined,
        country_code: data.country_code || undefined,
      }),
    onSuccess: () => {
      toast.success(t('organizer.create.success', "Organizer created successfully"));
      queryClient.invalidateQueries({ queryKey: queryKeys.organizers.all() });
      onOpenChange(false);
    }
  });

  const onSubmit = (data: CreateOrganizerFormData) => {
    createMutation.mutate(data);
  };

  const isPending = createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] shadow-2xl border-none bg-white/90 backdrop-blur-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-2 duration-300">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t('organizer.create.title', "Add New Organizer")}
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-base">
            {t('organizer.create.description', "Create a new organizer account with pre-approved status.")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700">
                      {t('auth.signup.firstName', "First Name")}
                    </FormLabel>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none transition-colors group-focus-within:text-blue-600">
                        <UserIcon weight="duotone" size={22} className="text-gray-400" />
                      </div>
                      <FormControl>
                        <Input
                          placeholder={t('auth.signup.firstNamePlaceholder', "Enter first name")}
                          {...field}
                          className={cn(
                            "h-12 pl-12 pr-4 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all duration-200",
                            fieldState.error && "border-destructive focus:ring-destructive/20"
                          )}
                        />
                      </FormControl>
                    </div>
                    <TranslatedFormMessage t={t} />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700">
                      {t('auth.signup.lastName', "Last Name")}
                    </FormLabel>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none transition-colors group-focus-within:text-blue-600">
                        <UserIcon weight="duotone" size={22} className="text-gray-400" />
                      </div>
                      <FormControl>
                        <Input
                          placeholder={t('auth.signup.lastNamePlaceholder', "Enter last name")}
                          {...field}
                          className={cn(
                            "h-12 pl-12 pr-4 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all duration-200",
                            fieldState.error && "border-destructive focus:ring-destructive/20"
                          )}
                        />
                      </FormControl>
                    </div>
                    <TranslatedFormMessage t={t} />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700">
                      {t('auth.signup.email', "Email Address")}
                    </FormLabel>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none transition-colors group-focus-within:text-blue-600">
                        <EnvelopeIcon weight="duotone" size={22} className="text-gray-400" />
                      </div>
                      <FormControl>
                        <Input
                          placeholder={t('auth.signup.emailPlaceholder', "Enter email address")}
                          type="email"
                          {...field}
                          className={cn(
                            "h-12 pl-12 pr-4 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all duration-200",
                            fieldState.error && "border-destructive focus:ring-destructive/20"
                          )}
                        />
                      </FormControl>
                    </div>
                    <TranslatedFormMessage t={t} />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700">
                      {t('auth.signup.password', "Password")}
                    </FormLabel>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none transition-colors group-focus-within:text-blue-600">
                        <KeyIcon weight="duotone" size={22} className="text-gray-400" />
                      </div>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="••••••••"
                          {...field}
                          className={cn(
                            "h-12 pl-12 pr-14 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all duration-200",
                            fieldState.error && "border-destructive focus:ring-destructive/20"
                          )}
                        />
                      </FormControl>
                      <button
                        type="button"
                        onClick={handleGeneratePassword}
                        title="Generate secure password"
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 hover:bg-blue-50 text-blue-600 rounded-lg transition-all duration-200 z-20 active:scale-90"
                      >
                        <ArrowsClockwiseIcon weight="duotone" size={20} />
                      </button>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-blue-500" />
                      {t('users.create.passwordHint', "Click the icon to generate a secure password")}
                    </p>
                    <TranslatedFormMessage t={t} />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="phone"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700">
                      {t('auth.signup.phone', "Contact Number")}
                      <span className="text-muted-foreground text-xs font-normal ml-1.5 opacity-70">{t('common.optional', "(optional)")}</span>
                    </FormLabel>
                    <FormControl>
                      <PhoneInput
                        value={field.value || ""}
                        onChange={(value) => field.onChange(value)}
                        defaultCountry={defaultCountry}
                        placeholder={t('auth.signup.phonePlaceholder', "981-234-5678")}
                        className={cn(
                          "transition-all duration-200",
                          fieldState.error && "border-destructive"
                        )}
                      />
                    </FormControl>
                    <TranslatedFormMessage t={t} />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-3 pt-6">
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                className="h-11 px-6 border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {t('common.cancel', "Cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('common.create', "Create Organizer")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
