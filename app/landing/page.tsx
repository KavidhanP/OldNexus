"use client";

import React, { useState, useEffect } from "react";
import Cap3DCanvas from "@/components/landing/Cap3DCanvas";
import LeadCaptureForm, { LeadData } from "@/components/landing/LeadCaptureForm";
import {
  Sparkles,
  GraduationCap,
  Users,
  Download,
  Trash2,
  X,
  ShieldCheck,
  Award,
} from "lucide-react";

export default function LandingPage() {
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [showLeadsModal, setShowLeadsModal] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("nexus_leads");
      if (stored) setLeads(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleLeadSubmitted = (newLead: LeadData) => {
    setLeads((prev) => [newLead, ...prev]);
  };

  const handleClearLeads = () => {
    if (confirm("Are you sure you want to clear all recorded leads?")) {
      localStorage.removeItem("nexus_leads");
      setLeads([]);
    }
  };

  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const headers = "ID,First Name,Surname,Email,Phone,Age,Gender,Created At\n";
    const rows = leads
      .map(
        (l) =>
          `"${l.id}","${l.firstName}","${l.surname}","${l.email}","${l.phone}","${l.age}","${l.gender}","${l.createdAt}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_export_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="relative min-h-screen bg-[#050507] text-white font-sans overflow-x-hidden selection:bg-red-600 selection:text-white">
      {/* ── Subtle Background & Grid ───────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }}
        />

        {/* Ambient Red Radial Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px]" />

        {/* Corner Target Markings (+) */}
        <div className="absolute top-6 left-6 text-neutral-700 font-mono text-xs select-none">+</div>
        <div className="absolute top-6 right-6 text-neutral-700 font-mono text-xs select-none">+</div>
        <div className="absolute bottom-6 left-6 text-neutral-700 font-mono text-xs select-none">+</div>
        <div className="absolute bottom-6 right-6 text-neutral-700 font-mono text-xs select-none">+</div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-6 pb-16 flex flex-col justify-between min-h-screen">
        {/* ── Clean Minimalist Header ───────────────────────────────────────── */}
        <header className="flex items-center justify-between py-4 border-b border-white/10 mb-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 p-0.5 shadow-[0_0_20px_rgba(225,29,72,0.4)]">
              <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <span className="font-bold text-xl tracking-tight text-white flex items-center gap-1 font-cinzel">
              uniqueyou<span className="text-red-500">.</span>
            </span>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-neutral-400">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#admissions" className="hover:text-white transition-colors">Admissions</a>
            <a href="#programs" className="hover:text-white transition-colors">Programs</a>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-4">
            {leads.length > 0 && (
              <button
                onClick={() => setShowLeadsModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-semibold hover:bg-red-600/30 transition-all"
              >
                <Users className="w-3.5 h-3.5" />
                Leads: {leads.length}
              </button>
            )}

            <button className="px-5 py-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white font-medium text-xs backdrop-blur-md transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              Get Involved
            </button>
          </div>
        </header>

        {/* ── Decluttered Hero Section ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center my-auto py-4">
          {/* Left Column: Focused Headline & Lead Form */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-[11px] font-cinzel tracking-widest uppercase">
                <Sparkles className="w-3.5 h-3.5 text-red-500" />
                UNLEASHING ACADEMIC POTENTIAL
              </div>

              <h1 className="font-serif-academic text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
                Shaping The <br />
                <span className="text-red-500 font-serif-academic font-bold">
                  Future of Graduation
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-neutral-400 max-w-lg leading-relaxed font-sans">
                Discover a new era of education where technology and human potential converge. Join the elite cohort of future leaders.
              </p>
            </div>

            {/* Lead Form */}
            <div id="admissions">
              <LeadCaptureForm onLeadSubmitted={handleLeadSubmitted} />
            </div>
          </div>

          {/* Right Column: Centered 3D Graduation Cap (Reference Alignment) */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <Cap3DCanvas />
          </div>
        </div>

        {/* ── Minimalist Clean Footer Stats Bar ─────────────────────────────── */}
        <footer className="pt-8 border-t border-white/10 mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs text-neutral-400">
          <div className="flex items-center justify-center gap-2">
            <Award className="w-4 h-4 text-red-500" />
            <span>Priority Academic Admission</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-red-500" />
            <span>Enterprise Privacy Protection</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Users className="w-4 h-4 text-red-500" />
            <span>Global Alumni Community</span>
          </div>
        </footer>
      </div>

      {/* ── Captured Leads Modal ───────────────────────────────────────────── */}
      {showLeadsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-4xl rounded-2xl border border-white/15 bg-[#0a0a0e] p-6 lg:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-cinzel">Captured Leads Manager</h3>
                  <p className="text-xs text-neutral-400">Total Records: {leads.length}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  disabled={leads.length === 0}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
                >
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
                <button
                  onClick={handleClearLeads}
                  disabled={leads.length === 0}
                  className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All
                </button>
                <button
                  onClick={() => setShowLeadsModal(false)}
                  className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto border border-white/10 rounded-xl">
              {leads.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 text-sm">
                  No leads captured yet. Submit a form to view lead entries here.
                </div>
              ) : (
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-white/5 border-b border-white/10 text-neutral-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Lead ID</th>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4 text-white">Email (Primary)</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Age / Gender</th>
                      <th className="py-3 px-4">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {leads.map((l) => (
                      <tr key={l.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 font-mono text-red-400 font-bold">{l.id}</td>
                        <td className="py-3 px-4 font-medium text-white">{l.firstName} {l.surname}</td>
                        <td className="py-3 px-4 font-semibold text-red-400">{l.email}</td>
                        <td className="py-3 px-4">{l.phone}</td>
                        <td className="py-3 px-4">{l.age} yrs · {l.gender}</td>
                        <td className="py-3 px-4 text-neutral-500">{new Date(l.createdAt).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
