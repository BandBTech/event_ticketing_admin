"use client";

import { useState, useEffect, useCallback } from "react";
import {PaymentGatewayConfig as GatewayConfig} from "@/types/payment";

const config: GatewayConfig = {
  api_key: "stripe_test_key_placeholder",
  api_secret: "stripe_test_key_placeholder",
  webhook_secret: "stripe_test_key_placeholder",
  display_name: "Stripe Payments",
  gateway_name: "stripe",
  is_enabled: true,
  is_test_mode: false,
};

function maskSecret(value: string, visibleChars = 6): string {
  if (value.length <= visibleChars) return value;
  return value.slice(0, visibleChars) + "•".repeat(Math.min(value.length - visibleChars, 20));
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
        ${copied
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
      <span className="min-w-[120px] shrink-0 text-[13px] font-medium text-slate-500">{label}</span>
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
            {revealed ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
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
      <span className="min-w-[120px] shrink-0 text-[13px] font-medium text-slate-500">{label}</span>
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
          <p className="mt-0.5 max-w-xs text-[11.5px] leading-snug text-slate-400">{description}</p>
        )}
      </div>
      <span className={`flex shrink-0 items-center rounded-full border px-3 py-1 font-mono text-[12px] font-medium ${pillStyles[variant]}`}>
        <span className={`mr-1.5 inline-block h-[7px] w-[7px] shrink-0 rounded-full ${dotStyles[variant]}`} />
        {value ? "Enabled" : "Disabled"}
      </span>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────
function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="px-6 py-4">
      <div className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-blue-500">
        {icon}
        {title}
      </div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

// ─── Modal Content ────────────────────────────────────────────────────────────
function GatewayConfigModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

      {/* Header */}
      <div className="flex items-center gap-3.5 border-b border-slate-100 px-6 py-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.8">
            <rect x="1" y="4" width="22" height="16" rx="3" ry="3" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
        </div>

        <div className="flex-1">
          <h2 className="text-[16px] font-semibold tracking-tight text-slate-900">{config.display_name}</h2>
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-[11px] tracking-wide text-blue-600">
              {config.gateway_name}
            </span>
            {config.is_test_mode && (
              <span className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 font-mono text-[11px] text-amber-600">
                ⚠ test mode
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Status pill */}
          <span className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium
            ${config.is_enabled ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-600"}`}>
            <span className={`inline-block h-2 w-2 rounded-full ${config.is_enabled ? "bg-green-500" : "bg-red-500"}`} />
            {config.is_enabled ? "Live" : "Inactive"}
          </span>

          {/* Close */}
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400 transition-all hover:border-slate-300 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">

        {/* API Credentials */}
        <Section
          title="API Credentials"
          icon={
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
            </svg>
          }
        >
          <SecretField label="API Key" value={config.api_key} />
          <SecretField label="API Secret" value={config.api_secret} />
          <SecretField label="Webhook Secret" value={config.webhook_secret} />
        </Section>

        <div className="mx-6 h-px bg-slate-100" />

        {/* Gateway Identity */}
        <Section
          title="Gateway Identity"
          icon={
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          }
        >
          <TextField label="Display Name" value={config.display_name} />
          <TextField label="Gateway Name" value={config.gateway_name} />
        </Section>

        <div className="mx-6 h-px bg-slate-100" />

        {/* Configuration */}
        <Section
          title="Configuration"
          icon={
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          }
        >
          <Toggle
            label="Gateway Enabled"
            value={config.is_enabled}
            variant="green"
            description="Controls whether this payment method is active at checkout."
          />
          <Toggle
            label="Test Mode"
            value={config.is_test_mode}
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
        <button className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-[13px] font-medium text-white transition-all hover:bg-blue-700 cursor-pointer">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit Configuration
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GatewayConfigPage({ open, closeModal, visible }: { open: boolean; closeModal: () => void, visible: boolean }) {





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
              transform: visible ? "translateY(0) scale(1)" : "translateY(12px) scale(0.97)",
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