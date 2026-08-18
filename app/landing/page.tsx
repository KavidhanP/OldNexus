"use client";

import React, { useState, useEffect } from "react";
import Cap3DCanvas from "@/components/landing/Cap3DCanvas";
import LeadCaptureForm, { LeadData } from "@/components/landing/LeadCaptureForm";
import {
  Sparkles,
  ArrowRight,
  Compass,
  Briefcase,
  Trophy,
  Send,
  Users,
  Download,
  Trash2,
  X,
  GraduationCap,
} from "lucide-react";

export default function LandingPage() {
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [showLeadsModal, setShowLeadsModal] = useState(false);

  // Load saved leads from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("nexus_leads");
      if (stored) {
        setLeads(JSON.parse(stored));
      }
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
    <div className="relative min-h-screen bg-[#050507] text-white selection:bg-red-600 selection:text-white font-sans overflow-x-hidden">
      {/* ── Background Grid & Technical Markings ───────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Fine Technical Grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Ambient Red Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-red-600/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-rose-700/10 rounded-full blur-[100px]" />

        {/* Corner Crosshairs (+) Reference Image Style */}
        <div className="absolute top-6 left-6 text-neutral-600 font-mono text-xs select-none">+</div>
        <div className="absolute top-6 right-6 text-neutral-600 font-mono text-xs select-none">+</div>
        <div className="absolute bottom-6 left-6 text-neutral-600 font-mono text-xs select-none">+</div>
        <div className="absolute bottom-6 right-6 text-neutral-600 font-mono text-xs select-none">+</div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-6 pb-20">
        {/* ── Header Navigation (Reference Image Style) ─────────────────────── */}
        <header className="flex items-center justify-between py-4 border-b border-white/10 mb-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 p-0.5 shadow-[0_0_20px_rgba(225,29,72,0.5)]">
              <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <span className="font-bold text-xl tracking-tight text-white flex items-center gap-1">
              uniqueyou<span className="text-red-500">.</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-neutral-400">
            <a href="#vision" className="hover:text-white transition-colors">Our Vision</a>
            <a href="#solutions" className="hover:text-white transition-colors">Solutions</a>
            <a href="#community" className="hover:text-white transition-colors">Community</a>
            <a href="#blog" className="hover:text-white transition-colors">Blog</a>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-4">
            {/* View Leads Count Button */}
            {leads.length > 0 && (
              <button
                onClick={() => setShowLeadsModal(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-semibold hover:bg-red-600/30 transition-all"
              >
                <Users className="w-3.5 h-3.5" />
                Leads: {leads.length}
              </button>
            )}

            <a href="#contact" className="hidden sm:inline-block text-xs font-medium text-neutral-300 hover:text-white transition-colors">
              Contact us
            </a>
            <button className="px-5 py-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white font-medium text-xs backdrop-blur-md transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              Get Involved
            </button>
          </div>
        </header>

        {/* ── Main Hero Section ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          {/* Left Column: Headline, Description & Lead Capture Form */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-400 text-[11px] font-mono uppercase tracking-widest">
                <Sparkles className="w-3 h-3 text-red-500" />
                UNLEASHING ACADEMIC POTENTIAL IN THE AGE OF AI
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                Shaping The <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-200 to-red-500">
                  Future of Work
                </span>
              </h1>

              <p className="text-sm sm:text-base text-neutral-400 max-w-lg leading-relaxed">
                Discover a new era of education and career mastery where technology and humanity converge. At UniqueYou, we’re shaping the next generation of academic pioneers.
              </p>
            </div>

            {/* Lead Form Component */}
            <div id="contact" className="pt-2">
              <LeadCaptureForm onLeadSubmitted={handleLeadSubmitted} />
            </div>
          </div>

          {/* Right Column: 3D Rotating Graduation Cap Visual (Reference Image Style) */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            {/* Background Radar Rings Graphic (Matching Reference Image) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[500px] h-[500px] rounded-full border border-white/10 opacity-40 animate-spin-slow" />
              <div className="absolute w-[360px] h-[360px] rounded-full border border-red-500/20 opacity-60" />
            </div>

            {/* 3D Graduation Cap Canvas */}
            <Cap3DCanvas />
          </div>
        </div>

        {/* ── 4 Chamfered Feature Cards (Reference Image Bottom Grid) ───────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {/* Card 1 */}
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md transition-all duration-300 hover:border-red-500/40 hover:bg-white/[0.05] group">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-4 group-hover:text-red-500 group-hover:border-red-500/40 transition-colors">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Harmonious Future</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Years exploring human-AI synergy proud to unveil groundbreaking harmonizing products.
            </p>
          </div>

          {/* Card 2 */}
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md transition-all duration-300 hover:border-red-500/40 hover:bg-white/[0.05] group">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-4 group-hover:text-red-500 group-hover:border-red-500/40 transition-colors">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Workplace Evolution</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Evolving workplace: new roles, AI’s influence. Our platform navigates opportunities and pitfalls.
            </p>
          </div>

          {/* Card 3 */}
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md transition-all duration-300 hover:border-red-500/40 hover:bg-white/[0.05] group">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-4 group-hover:text-red-500 group-hover:border-red-500/40 transition-colors">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Success Redefined</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Crafting roadmaps to unlock potential, maximize academic opportunities, and thrive in change.
            </p>
          </div>

          {/* Card 4 */}
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md transition-all duration-300 hover:border-red-500/40 hover:bg-white/[0.05] group">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-4 group-hover:text-red-500 group-hover:border-red-500/40 transition-colors">
              <Send className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Elevate Your Journey</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Explore our future-focused approach: shape, unleash, and streamline academic potential.
            </p>
          </div>
        </div>

        {/* Carousel Slider Indicator (Matching Reference Image `o . .`) */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <span className="w-3 h-3 rounded-full border border-red-500 bg-red-500/20 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          </span>
          <span className="w-2 h-2 rounded-full bg-white/20" />
          <span className="w-2 h-2 rounded-full bg-white/20" />
        </div>
      </div>

      {/* ── Captured Leads Inspection Modal ─────────────────────────────────── */}
      {showLeadsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-4xl rounded-2xl border border-white/15 bg-[#0a0a0e] p-6 lg:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Captured Leads Manager</h3>
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
