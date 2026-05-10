import type { Metadata } from "next";
import { Shield, Key, Database, Cpu } from "lucide-react";

export const metadata: Metadata = { title: "Settings" };

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
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="page-header">Settings</h1>
        <p className="page-sub">Platform configuration and API key management</p>
      </div>

      <Section icon={Cpu} title="AI Engine">
        <Field label="Model" value="Gemini 1.5 Pro" />
        <Field label="Enterprise Privacy" value="Enabled — data not used for training" />
        <Field label="API Key" value="" masked />
        <div className="mt-3">
          <label className="block text-xs text-frost-600 mb-1">Gemini API Key</label>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="AIza..."
              className="flex-1 px-3 py-2 rounded-xl border border-frost-200 bg-white text-sm font-mono
                         focus:outline-none focus:border-burgundy-900 focus:ring-1 focus:ring-burgundy-900/20"
            />
            <button className="btn-primary text-sm">Save</button>
          </div>
        </div>
      </Section>

      <Section icon={Database} title="Database">
        <Field label="Provider" value="Supabase (PostgreSQL)" />
        <Field label="Supabase URL" value="" masked />
        <Field label="Anon Key" value="" masked />
        <div className="mt-3 space-y-2">
          {["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"].map((key) => (
            <div key={key}>
              <label className="block text-xs text-frost-600 mb-1">{key}</label>
              <input
                type="password"
                placeholder={key.includes("URL") ? "https://xxx.supabase.co" : "eyJ..."}
                className="w-full px-3 py-2 rounded-xl border border-frost-200 bg-white text-sm font-mono
                           focus:outline-none focus:border-burgundy-900 focus:ring-1 focus:ring-burgundy-900/20"
              />
            </div>
          ))}
          <button className="btn-primary text-sm">Save Database Config</button>
        </div>
      </Section>

      <Section icon={Key} title="Backend API">
        <Field label="FastAPI URL" value="http://localhost:8000" />
        <Field label="Health Check" value="/health" />
        <p className="text-xs text-frost-600 mt-2">
          Start the Python backend with:{" "}
          <code className="font-mono bg-frost-100 px-1.5 py-0.5 rounded text-burgundy-900">
            uvicorn backend.main:app --reload --port 8000
          </code>
        </p>
      </Section>

      <Section icon={Shield} title="Security">
        <Field label="Data Residency" value="On-premise / Private Cloud" />
        <Field label="Gemini Privacy Mode" value="Enterprise — no training" />
        <Field label="Auth Provider" value="Supabase Auth (not yet configured)" />
        <p className="text-xs text-frost-600 mt-3">
          Authentication is scaffolded but not enforced in the MVP. Enable Supabase Auth to add SSO and role-based access control.
        </p>
      </Section>
    </div>
  );
}
