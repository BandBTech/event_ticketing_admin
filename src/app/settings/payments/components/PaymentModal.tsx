"use client";

import { useState, useEffect, useCallback } from "react";
import { PaymentGatewayConfig as GatewayConfig } from "@/types/payment";
import {
  EyeIcon,
  EyeSlashIcon,
  CreditCardIcon,
  XIcon,
  GearIcon,
  KeyIcon,
  IdentificationBadgeIcon,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

function maskSecret(value: string, visibleChars = 6): string {
  if (value.length <= visibleChars) return value;
  return (
    value.slice(0, visibleChars) +
    "•".repeat(Math.min(value.length - visibleChars, 20))
  );
}

// ─── CopyButton ───────────────────────────────────────────────────────────────
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      onClick={handleCopy}
      className={`shrink-0 rounded-md border px-2 py-0.5 font-mono text-[11px] transition-all duration-150 cursor-pointer
        ${
          copied
            ? "border-green-200 bg-green-50 text-green-600"
            : "border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300 hover:text-slate-500"
        }`}
    >
      {copied ? "✓ copied" : "copy"}
    </button>
  );
}

// ─── SecretField ──────────────────────────────────────────────────────────────
function SecretField({ label, value }: { label: string; value: string }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-50 transition-colors">
      <span className="min-w-[120px] shrink-0 text-[13px] font-medium text-slate-500">
        {label}
      </span>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        <code className="truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[12px] text-slate-500">
          {revealed ? value : maskSecret(value)}
        </code>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={() => setRevealed((r) => !r)}
            title={revealed ? "Hide" : "Reveal"}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-400 transition-all hover:border-slate-300 hover:text-slate-600 cursor-pointer"
          >
            {revealed ? <EyeSlashIcon /> : <EyeIcon />}
          </button>
          <CopyButton value={value} />
        </div>
      </div>
    </div>
  );
}

// ─── TextField ────────────────────────────────────────────────────────────────
function TextField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-50 transition-colors">
      <span className="min-w-[120px] shrink-0 text-[13px] font-medium text-slate-500">
        {label}
      </span>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        <code className="truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[12px] text-slate-800">
          {value}
        </code>
        <CopyButton value={value} />
      </div>
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({
  label,
  value,
  variant = "blue",
  description,
}: {
  label: string;
  value: boolean;
  variant?: "green" | "amber" | "blue";
  description?: string;
}) {
  const pillStyles = {
    green: value
      ? "bg-green-50 border-green-200 text-green-700"
      : "bg-slate-100 border-slate-200 text-slate-400",
    amber: value
      ? "bg-amber-50 border-amber-200 text-amber-700"
      : "bg-slate-100 border-slate-200 text-slate-400",
    blue: value
      ? "bg-blue-50 border-blue-200 text-blue-700"
      : "bg-slate-100 border-slate-200 text-slate-400",
  };

  const dotStyles = {
    green: value ? "bg-green-500" : "bg-slate-300",
    amber: value ? "bg-amber-500" : "bg-slate-300",
    blue: value ? "bg-blue-500" : "bg-slate-300",
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-50 transition-colors">
      <div>
        <p className="text-[13px] font-medium text-slate-800">{label}</p>
        {description && (
          <p className="mt-0.5 max-w-xs text-[11.5px] leading-snug text-slate-400">
            {description}
          </p>
        )}
      </div>
      <span
        className={`flex shrink-0 items-center rounded-full border px-3 py-1 font-mono text-[12px] font-medium ${pillStyles[variant]}`}
      >
        <span
          className={`mr-1.5 inline-block h-[7px] w-[7px] shrink-0 rounded-full ${dotStyles[variant]}`}
        />
        {value ? "Enabled" : "Disabled"}
      </span>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────
function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-6 py-4">
      <div className="mb-2.5 flex items-center gap-1.5 text-[14px] font-semibold uppercase tracking-widest text-blue-500">
        {icon}
        {title}
      </div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

interface GatewayConfigModal {
  onClose: () => void;
  gateway: GatewayConfig;
}

// ─── Modal Content ────────────────────────────────────────────────────────────
function GatewayConfigModal({ onClose, gateway }: GatewayConfigModal) {
  const router = useRouter();
  return (
    <div className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3.5 border-b border-slate-100 px-6 py-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50">
          <CreditCardIcon className="text-[#6366f1] w-5 h-5" />
        </div>

        <div className="flex-1">
          <h2 className="text-[16px] font-semibold tracking-tight text-slate-900">
            {gateway.display_name}
          </h2>
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-[11px] tracking-wide text-blue-600">
              {gateway.gateway_name}
            </span>
            {gateway.is_test_mode && (
              <span className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 font-mono text-[11px] text-amber-600">
                ⚠ test mode
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Status pill */}
          <span
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium
            ${gateway.is_enabled ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-600"}`}
          >
            <span
              className={`inline-block h-2 w-2 rounded-full ${gateway.is_enabled ? "bg-green-500" : "bg-red-500"}`}
            />
            {gateway.is_enabled ? "Live" : "Inactive"}
          </span>

          {/* Close */}
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400 transition-all hover:border-slate-300 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
          >
            <XIcon />
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {/* API Credentials */}
          <Section title="API Credentials" icon={<KeyIcon />}>
            {gateway.api_key && (
              <SecretField label="API Key" value={gateway.api_key} />
            )}
            {gateway.api_secret && (
              <SecretField label="API Secret" value={gateway.api_secret} />
            )}
            {gateway.webhook_secret && (
              <SecretField
                label="Webhook Secret"
                value={gateway.webhook_secret}
              />
            )}
          </Section>

        <div className="mx-6 h-px bg-slate-100" />

        {/* Gateway Identity */}
        <Section title="Gateway Identity" icon={<IdentificationBadgeIcon />}>
          <TextField label="Display Name" value={gateway.display_name} />
          <TextField label="Gateway Name" value={gateway.gateway_name} />
        </Section>

        <div className="mx-6 h-px bg-slate-100" />

        {/* Configuration */}
        <Section title="Configuration" icon={<GearIcon className="w-3 h-3" />}>
          <Toggle
            label="Gateway Enabled"
            value={gateway.is_enabled}
            variant="green"
            description="Controls whether this payment method is active at checkout."
          />
          <Toggle
            label="Test Mode"
            value={gateway.is_test_mode}
            variant="amber"
            description="No real transactions are processed when test mode is on."
          />
        </Section>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 bg-white px-6 py-4">
        <button
          onClick={onClose}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-[13px] font-medium text-slate-600 transition-all hover:bg-slate-50 cursor-pointer"
        >
          Close
        </button>
        <button
          onClick={() => router.push("/settings/payments/editpayment")}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-[13px] font-medium text-white transition-all hover:bg-blue-700 cursor-pointer"
        >
          Edit
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GatewayConfigPage({
  open,
  closeModal,
  visible,
  gateway,
}: {
  open: boolean;
  closeModal: () => void;
  visible: boolean;
  gateway: GatewayConfig;
}) {
  return (
    <>
      {/* Modal overlay */}
      {open && (
        <div
          onClick={closeModal}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{
            background: "rgba(15,23,42,0.45)",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.2s ease",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[560px]"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible
                ? "translateY(0) scale(1)"
                : "translateY(12px) scale(0.97)",
              transition: "opacity 0.22s ease, transform 0.22s ease",
            }}
          >
            <GatewayConfigModal onClose={closeModal} gateway={gateway} />
          </div>
        </div>
      )}
    </>
  );
}
