"use client";

import React, { useState } from "react";
import { User, Mail, Phone, Calendar, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

export interface LeadData {
  id: string;
  firstName: string;
  surname: string;
  email: string;
  phone: string;
  age: string;
  gender: string;
  createdAt: string;
}

interface LeadCaptureFormProps {
  onLeadSubmitted?: (lead: LeadData) => void;
}

export default function LeadCaptureForm({ onLeadSubmitted }: LeadCaptureFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    surname: "",
    email: "",
    phone: "",
    age: "",
    gender: "Male",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedLead, setSubmittedLead] = useState<LeadData | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.firstName.trim()) errs.firstName = "First name is required";
    if (!formData.surname.trim()) errs.surname = "Surname is required";
    
    // Email Validation (Crucial field)
    if (!formData.email.trim()) {
      errs.email = "Email address is strictly required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = "Please enter a valid email address (e.g. name@domain.com)";
    }

    if (!formData.phone.trim()) {
      errs.phone = "Phone number is required";
    } else if (!/^[0-9+\-\s()]{7,20}$/.test(formData.phone)) {
      errs.phone = "Enter a valid phone number";
    }

    if (!formData.age) {
      errs.age = "Age is required";
    } else {
      const ageNum = parseInt(formData.age, 10);
      if (isNaN(ageNum) || ageNum < 14 || ageNum > 100) {
        errs.age = "Please enter an age between 14 and 100";
      }
    }

    if (!formData.gender) errs.gender = "Please select a gender";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const newLead: LeadData = {
        id: `LEAD-${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString(),
      };

      // Save to localStorage
      try {
        const existingRaw = localStorage.getItem("nexus_leads");
        const existing: LeadData[] = existingRaw ? JSON.parse(existingRaw) : [];
        localStorage.setItem("nexus_leads", JSON.stringify([newLead, ...existing]));
      } catch (err) {
        console.error("Failed to save lead to localStorage", err);
      }

      setIsSubmitting(false);
      setSubmittedLead(newLead);
      if (onLeadSubmitted) onLeadSubmitted(newLead);
    }, 800);
  };

  const handleReset = () => {
    setFormData({
      firstName: "",
      surname: "",
      email: "",
      phone: "",
      age: "",
      gender: "Male",
    });
    setSubmittedLead(null);
    setErrors({});
  };

  if (submittedLead) {
    return (
      <div className="relative rounded-2xl border border-red-500/40 bg-black/90 p-8 backdrop-blur-xl shadow-2xl animate-fade-in">
        {/* Glow corner */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600/20 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-600/20 border border-red-500/50 flex items-center justify-center mx-auto text-red-500 shadow-[0_0_20px_rgba(225,29,72,0.4)]">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <h3 className="text-2xl font-bold text-white tracking-tight">
            Application Registered!
          </h3>
          <p className="text-sm text-neutral-400 max-w-sm mx-auto">
            Thank you, <span className="text-white font-semibold">{submittedLead.firstName} {submittedLead.surname}</span>. Your priority spot has been reserved.
          </p>

          {/* Submitted Data Summary Box */}
          <div className="my-6 rounded-xl border border-white/10 bg-white/5 p-4 text-left space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-neutral-400">Lead ID</span>
              <span className="font-mono text-red-400 font-bold">{submittedLead.id}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-neutral-400">Primary Email</span>
              <span className="text-white font-medium">{submittedLead.email}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-neutral-400">Phone</span>
              <span className="text-neutral-200">{submittedLead.phone}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-neutral-400">Age / Gender</span>
              <span className="text-neutral-200">{submittedLead.age} yrs · {submittedLead.gender}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={handleReset}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-semibold text-sm transition-all shadow-[0_0_25px_rgba(225,29,72,0.5)] flex items-center justify-center gap-2"
            >
              Submit Another Application <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl border border-white/10 bg-black/85 p-7 lg:p-8 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-red-500/30">
      {/* Chamfer Corner Cut Styling (Reference Image) */}
      <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-red-500/40 rounded-tr-2xl pointer-events-none" />

      {/* Header */}
      <div className="mb-6 space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Priority Admission
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Join the Future Era
        </h2>
        <p className="text-xs text-neutral-400">
          Complete your information below to unlock early access privileges.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Fields (First Name & Surname) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border text-sm text-white placeholder-neutral-600 focus:outline-none transition-all ${
                  errors.firstName
                    ? "border-red-500 focus:border-red-500"
                    : "border-white/10 focus:border-red-500/60 focus:bg-white/10"
                }`}
              />
            </div>
            {errors.firstName && (
              <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.firstName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1">
              Surname <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Doe"
                value={formData.surname}
                onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border text-sm text-white placeholder-neutral-600 focus:outline-none transition-all ${
                  errors.surname
                    ? "border-red-500 focus:border-red-500"
                    : "border-white/10 focus:border-red-500/60 focus:bg-white/10"
                }`}
              />
            </div>
            {errors.surname && (
              <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.surname}
              </p>
            )}
          </div>
        </div>

        {/* EMAIL ADDRESS — CRUCIAL HIGHLIGHTED FIELD */}
        <div className="rounded-xl border border-red-500/40 bg-red-950/20 p-3.5">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-bold text-white uppercase tracking-wider">
              Email Address <span className="text-red-500">*</span>
            </label>
            <span className="text-[9px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
              Primary Contact
            </span>
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-red-400" />
            <input
              type="email"
              placeholder="alex.doe@domain.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/60 border text-sm text-white placeholder-neutral-500 focus:outline-none transition-all ${
                errors.email
                  ? "border-red-500 focus:ring-1 focus:ring-red-500"
                  : "border-red-500/40 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3 h-3" /> {errors.email}
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
            <input
              type="tel"
              placeholder="+1 (555) 000-1234"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border text-sm text-white placeholder-neutral-600 focus:outline-none transition-all ${
                errors.phone
                  ? "border-red-500 focus:border-red-500"
                  : "border-white/10 focus:border-red-500/60 focus:bg-white/10"
              }`}
            />
          </div>
          {errors.phone && (
            <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.phone}
            </p>
          )}
        </div>

        {/* Age & Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Age */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1">
              Age <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
              <input
                type="number"
                placeholder="24"
                min="14"
                max="100"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border text-sm text-white placeholder-neutral-600 focus:outline-none transition-all ${
                  errors.age
                    ? "border-red-500 focus:border-red-500"
                    : "border-white/10 focus:border-red-500/60 focus:bg-white/10"
                }`}
              />
            </div>
            {errors.age && (
              <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.age}
              </p>
            )}
          </div>

          {/* Gender Select */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-1">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-black/80 border border-white/10 text-sm text-white focus:outline-none focus:border-red-500/60 transition-all"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-Binary">Non-Binary</option>
              <option value="Prefer Not To Say">Prefer not to say</option>
            </select>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="flex items-center gap-2 pt-1 text-[11px] text-neutral-400">
          <ShieldCheck className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>Your data is encrypted & strictly protected under enterprise privacy.</span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm tracking-wide transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-2 group mt-2"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Registering Application...
            </span>
          ) : (
            <>
              Submit Application
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
