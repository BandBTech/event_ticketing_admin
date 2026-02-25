"use client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SpinnerIcon } from "@phosphor-icons/react";
import { EyeIcon, EyeClosedIcon } from "@phosphor-icons/react/dist/ssr";
import {
  Dialog,
  DialogContent,
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
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";
import { useLanguageStore } from "@/store/languageStore";
import { passwordFieldSchema } from "@/lib/validation";
import { usePaymentStore } from "@/store/paymentStore";
import { PaymentGatewayService } from "@/services/paymentService";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

interface PasswordFieldModalProps {
  open: boolean;
  closePasswordModal: () => void;
  onClose: () => void;
  isEditMode: boolean;
}

export default function PasswordFieldModal({
  open,
  closePasswordModal,
  isEditMode,
  onClose,
}: PasswordFieldModalProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const queryClient = useQueryClient();
  const schema = passwordFieldSchema(t);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { password: "" },
    mode: "onChange",
  });

  const paymentData = usePaymentStore((state) => state);
  const id = paymentData?.id;

  const createMutation = useMutation({
    mutationFn: (password: string) =>
      PaymentGatewayService.createPaymentGateway({
        api_key: paymentData.api_key ?? undefined,
        api_secret: paymentData.api_secret ?? undefined,
        webhook_secret: paymentData.webhook_secret ?? undefined,
        display_name: paymentData.display_name,
        gateway_name: paymentData.gateway_name,
        is_enabled: paymentData.is_enabled,
        is_test_mode: paymentData.is_test_mode,
        password,
      }),
    onSuccess: async () => {
      toast.success("Payment gateway created successfully");
      await queryClient.invalidateQueries({
        queryKey: queryKeys.organizers.list,
      });
      onClose;
      router.push("/settings/payments");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (password: string) => {
      if (!id) throw new Error("Payment gateway ID is missing");
      if (!paymentData) throw new Error("Payment data is missing");

      return PaymentGatewayService.updatePaymentGateway(id, {
        api_key: paymentData.api_key ?? undefined,
        api_secret: paymentData.api_secret ?? undefined,
        webhook_secret: paymentData.webhook_secret ?? undefined,
        display_name: paymentData.display_name,
        gateway_name: paymentData.gateway_name,
        is_enabled: paymentData.is_enabled,
        is_test_mode: paymentData.is_test_mode,
        password,
      });
    },

    onSuccess: async () => {
      toast.success("Payment gateway updated successfully");

      await queryClient.invalidateQueries({
        queryKey: queryKeys.organizers.list,
      });

      onClose;
      router.push("/settings/payments");
    },

    onError: (err: Error) => {
      toast.error(err.message || "Something went wrong");
    },
  });

  const handleSubmit = (data: { password: string }) => {
    if (isEditMode) {
      if (!id) {
        toast.error("Gateway ID is missing");
        return;
      }

      updateMutation.mutate(data.password);
      onClose();
    } else {
      createMutation.mutate(data.password);
      onClose();
    }
  };
  return (
    <Dialog open={open} onOpenChange={closePasswordModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("", "Enter Password")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel htmlFor="password">
                    {t("", "Password")}
                    <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        className="pr-10"
                        maxLength={100}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showPassword ? (
                          <EyeClosedIcon size={16} />
                        ) : (
                          <EyeIcon size={16} />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <TranslatedFormMessage t={t} />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-3 pt-6">
              <Button
                variant="outline"
                type="button"
                onClick={closePasswordModal}
                disabled={createMutation.isPending}
                className="h-11 px-6 border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {t("common.cancel", "Cancel")}
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("", "Submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
