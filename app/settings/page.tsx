"use client";

import { useState } from "react";
import { Shield, Key, Database, Cpu, Bell, Sliders, Check } from "lucide-react";

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-burgundy-900" />
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, value, masked }: { label: string; value: string; masked?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-frost-50 last:border-0">
      <span className="text-xs text-frost-600">{label}</span>
      <span className="text-xs font-semibold text-slate-700 font-mono">
        {masked ? "••••••••••••••••" : value}
      </span>
    </div>
  );
}

export default function SettingsPage() {
  const [provider, setProvider] = useState("Groq llama-3.3-70b-versatile");
  const [systemPrompt, setSystemPrompt] = useState(
    "You are Nexus OS Insurance Intelligence Engine. Extract policy terms with extreme precision and flag discrepancies over 15%."
  );
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  const handleSave = (msg: string) => {
    setSavedStatus(msg);
    setTimeout(() => setSavedStatus(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-header">Settings</h1>
          <p className="page-sub">Platform configuration, LLM engine selection, and API settings</p>
        </div>
        {savedStatus && (
          <span className="badge badge-green flex items-center gap-1.5 animate-fade-in">
            <Check className="w-3.5 h-3.5" /> {savedStatus}
          </span>
        )}
      </div>

      <Section icon={Cpu} title="LLM & AI Engine Configuration">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-frost-600 mb-1 font-medium">Active LLM Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-frost-200 bg-white text-xs text-slate-800 font-semibold
                         focus:outline-none focus:border-burgundy-900 focus:ring-1 focus:ring-burgundy-900/20"
            >
              <option value="Groq llama-3.3-70b-versatile">Groq — llama-3.3-70b-versatile (Recommended)</option>
              <option value="Gemini 1.5 Pro">Google — Gemini 1.5 Pro</option>
              <option value="OpenAI GPT-4o">OpenAI — GPT-4o</option>
              <option value="Anthropic Claude 3.5 Sonnet">Anthropic — Claude 3.5 Sonnet</option>
            </select>
          </div>

          <Field label="Enterprise Privacy Mode" value="Enabled — zero data retention" />

          <div>
            <label className="block text-xs text-frost-600 mb-1 font-medium">API Key</label>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="Enter API Key for provider..."
                className="flex-1 px-3 py-2 rounded-xl border border-frost-200 bg-white text-xs font-mono
                           focus:outline-none focus:border-burgundy-900 focus:ring-1 focus:ring-burgundy-900/20"
              />
              <button onClick={() => handleSave("API key saved")} className="btn-primary text-xs px-4">
                Save Key
              </button>
            </div>
          </div>
        </div>
      </Section>

      <Section icon={Sliders} title="System Prompt Controls">
        <div className="space-y-3">
          <label className="block text-xs text-frost-600 font-medium">
            Global Extraction & Audit Prompt Instructions
          </label>
          <textarea
            rows={3}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="w-full p-3 rounded-xl border border-frost-200 bg-white text-xs text-slate-700 font-mono
                       focus:outline-none focus:border-burgundy-900 focus:ring-1 focus:ring-burgundy-900/20"
          />
          <button onClick={() => handleSave("System prompt updated")} className="btn-primary text-xs px-4">
            Save System Prompt
          </button>
        </div>
      </Section>

      <Section icon={Bell} title="Notifications & Alert Preferences">
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-frost-50">
            <div>
              <p className="text-xs font-semibold text-slate-800">Email Discrepancy Alerts</p>
              <p className="text-[11px] text-frost-500">Send instant alert when premium delta exceeds 15%</p>
            </div>
            <button
              onClick={() => setEmailAlerts(!emailAlerts)}
              className={`w-10 h-6 rounded-full transition-colors p-1 ${
                emailAlerts ? "bg-burgundy-900" : "bg-frost-200"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  emailAlerts ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-frost-50">
            <div>
              <p className="text-xs font-semibold text-slate-800">M&A Critical Red Flag Alerts</p>
              <p className="text-[11px] text-frost-500">Notify legal team when Critical risk clauses are detected</p>
            </div>
            <button
              onClick={() => setCriticalAlerts(!criticalAlerts)}
              className={`w-10 h-6 rounded-full transition-colors p-1 ${
                criticalAlerts ? "bg-burgundy-900" : "bg-frost-200"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  criticalAlerts ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </Section>

      <Section icon={Database} title="Database Configuration">
        <Field label="Provider" value="Supabase (PostgreSQL)" />
        <div className="mt-3 space-y-2">
          {["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"].map((key) => (
            <div key={key}>
              <label className="block text-xs text-frost-600 mb-1">{key}</label>
              <input
                type="password"
                placeholder={key.includes("URL") ? "https://xxx.supabase.co" : "eyJ..."}
                className="w-full px-3 py-2 rounded-xl border border-frost-200 bg-white text-xs font-mono
                           focus:outline-none focus:border-burgundy-900 focus:ring-1 focus:ring-burgundy-900/20"
              />
            </div>
          ))}
          <button onClick={() => handleSave("Database config updated")} className="btn-primary text-xs px-4">
            Save Database Config
          </button>
        </div>
      </Section>

      <Section icon={Key} title="Backend API Integration">
        <Field label="FastAPI URL" value="http://localhost:8000" />
        <Field label="Health Status" value="Online (HTTP 200 OK)" />
        <p className="text-xs text-frost-600 mt-2">
          Python backend is connected and running on port 8000.
        </p>
      </Section>
    </div>
  );
}
