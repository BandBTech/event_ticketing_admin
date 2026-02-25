"use client";

import { useState, useCallback } from "react";
import {
  EyeIcon,
  EyeSlashIcon,
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

type SecretFieldProps = {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
};

function SecretField({ label, value = "", onChange }: SecretFieldProps) {
  const [revealed, setRevealed] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-50 transition-colors">
      <span className="min-w-[120px] shrink-0 text-[13px] font-medium text-slate-500">
        {label}
      </span>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        <input
          type={revealed ? "text" : "password"}
          value={inputValue}
          onChange={handleChange}
          placeholder="Enter value..."
          className="w-full max-w-xs truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[12px] text-slate-700 focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300"
        />

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            title={revealed ? "Hide" : "Reveal"}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-400 transition-all hover:border-slate-300 hover:text-slate-600 cursor-pointer"
          >
            {revealed ? <EyeSlashIcon /> : <EyeIcon />}
          </button>

          <CopyButton value={inputValue} />
        </div>
      </div>
    </div>
  );
}

// ─── TextField ────────────────────────────────────────────────────────────────
function TextField({ label, value = "", onChange }: SecretFieldProps) {
  const [inputValue, setInputValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-50 transition-colors">
      <span className="min-w-[120px] shrink-0 text-[13px] font-medium text-slate-500">
        {label}
        <span className="text-red-500 ml-2">*</span>
      </span>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          placeholder="Enter value..."
          className="w-full max-w-xs truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[12px] text-slate-700 focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300"
        />
        <CopyButton value={value} />
      </div>
    </div>
  );
}

type ToggleProps = {
  label: string;
  value: boolean;
  onChange?: (value: boolean) => void;
  variant?: "green" | "amber" | "blue";
  description?: string;
};

function Toggle({ label, value, onChange, description }: ToggleProps) {
  const handleToggle = useCallback(() => {
    onChange?.(!value);
  }, [value, onChange]);

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

      {/* Toggle Switch */}
      <button
        type="button"
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-300 focus:outline-none ${
          value ? "bg-green-500" : "bg-slate-300"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
            value ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
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
}

// ─── Modal Content ────────────────────────────────────────────────────────────
function GatewayConfigModal({ onClose }: GatewayConfigModal) {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3.5 border-b border-slate-100 px-6 py-5">
        <div className="flex-1">
          <h2 className="text-[20px] font-semibold tracking-tight text-slate-900">
            Edit Payment Method
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
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
          <SecretField label="API Key" value={apiKey} onChange={setApiKey} />
          <SecretField label="API Secret" value={apiKey} onChange={setApiKey} />
          <SecretField
            label="Webhook Secret"
            value={apiKey}
            onChange={setApiKey}
          />
        </Section>

        <div className="mx-6 h-px bg-slate-100" />

        {/* Gateway Identity */}
        <Section title="Gateway Identity" icon={<IdentificationBadgeIcon />}>
          <TextField
            label="Display Name"
            value={displayName}
            onChange={setDisplayName}
          />
          <TextField
            label="Gateway Name"
            value={displayName}
            onChange={setDisplayName}
          />
        </Section>

        <div className="mx-6 h-px bg-slate-100" />

        {/* Configuration */}
        <Section title="Configuration" icon={<GearIcon className="w-3 h-3" />}>
          <Toggle
            label="Gateway Enabled"
            description="Controls whether this payment method is active at checkout."
            value={isActive}
            onChange={setIsActive}
          />
          <Toggle
            label="Test Mode"
            description="No real transactions are processed when test mode is on."
            value={isActive}
            onChange={setIsActive}
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
        <button className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-[13px] font-medium text-white transition-all hover:bg-blue-700 cursor-pointer">
          Save
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EditPaymentModal({
  open,
  closeModal,
  visible,
}: {
  open: boolean;
  closeModal: () => void;
  visible: boolean;
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
            <GatewayConfigModal onClose={closeModal} />
          </div>
        </div>
      )}
    </>
  );
}
