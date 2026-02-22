"use client";

import * as React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Component, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name.trim() || undefined } },
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      setSuccess(true);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#000] text-white overflow-x-hidden selection:bg-white selection:text-black font-['Inter'] flex items-center justify-center px-6 z-10 relative">
        {/* Aurora Background */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full blur-[140px]"
            style={{
              background:
                "radial-gradient(circle, rgba(124,58,237,0.7) 0%, transparent 70%)",
            }}
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter mb-4">
            Check your email
          </h1>
          <p className="text-zinc-500 text-sm uppercase tracking-[0.2em] mb-8">
            We&apos;ve sent a confirmation link to{" "}
            <span className="text-white">{email}</span>
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-none bg-white text-black hover:bg-zinc-200 py-4 px-8 text-[10px] font-black uppercase tracking-[0.3em]"
          >
            Back to sign in
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000] text-white overflow-x-hidden selection:bg-white selection:text-black font-['Inter']">
      {/* Minimal Nav */}
      <header className="fixed top-0 left-0 right-0 z-[100] flex justify-center pt-4 px-4 pointer-events-none">
        <div className="w-full max-w-6xl pointer-events-auto flex items-center justify-between px-6 py-3 rounded-[50px] border border-white/10 bg-black/90 backdrop-blur-xl">
          <Link
            href="/"
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="h-8 w-8 flex items-center justify-center">
              <Component className="h-6 w-6 text-white transition-transform group-hover:rotate-90 group-hover:scale-110" />
            </div>
            <span className="text-white font-black text-xs tracking-[0.3em] uppercase">
              PROTOPILOT
            </span>
          </Link>
          <Link
            href="/login"
            className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Aurora Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 60, -30, 0],
            y: [0, -40, 50, 0],
            scale: [1, 1.15, 0.92, 1],
            opacity: [0.35, 0.55, 0.3, 0.35],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full blur-[140px]"
          style={{
            background:
              "radial-gradient(circle, rgba(124,58,237,0.7) 0%, transparent 70%)",
          }}
        />
        <motion.div
          animate={{
            x: [0, -50, 40, 0],
            y: [0, 60, -20, 0],
            scale: [1, 0.88, 1.2, 1],
            opacity: [0.25, 0.45, 0.2, 0.25],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
          className="absolute top-[-10%] left-[30%] w-[50%] h-[55%] rounded-full blur-[160px]"
          style={{
            background:
              "radial-gradient(circle, rgba(99,102,241,0.65) 0%, transparent 70%)",
          }}
        />
        <motion.div
          animate={{
            x: [0, -70, 20, 0],
            y: [0, 50, -60, 0],
            scale: [1, 1.2, 0.85, 1],
            opacity: [0.2, 0.4, 0.15, 0.2],
          }}
          transition={{
            duration: 26,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5,
          }}
          className="absolute top-[5%] right-[-15%] w-[55%] h-[55%] rounded-full blur-[150px]"
          style={{
            background:
              "radial-gradient(circle, rgba(6,182,212,0.55) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Form Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-32 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="border border-white/10 bg-black/60 backdrop-blur-xl rounded-2xl p-8 sm:p-10">
            <div className="mb-10">
              <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-2">
                Create account
              </h1>
              <p className="text-zinc-500 text-sm uppercase tracking-[0.2em]">
                Get started with ProtoPilot
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="name"
                  className="block text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-2"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={cn(
                    "w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10",
                    "text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30",
                    "text-sm uppercase tracking-[0.15em] transition-colors"
                  )}
                  placeholder="Your name"
                  autoComplete="name"
                  disabled={loading}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={cn(
                    "w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10",
                    "text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30",
                    "text-sm uppercase tracking-[0.15em] transition-colors"
                  )}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className={cn(
                    "w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10",
                    "text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30",
                    "text-sm uppercase tracking-[0.15em] transition-colors"
                  )}
                  placeholder="6+ characters"
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full inline-flex items-center justify-center gap-2 rounded-none",
                  "bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed",
                  "py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all"
                )}
              >
                {loading ? "Creating account…" : "Create account"}
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </form>

            <p className="mt-8 text-center text-zinc-500 text-sm uppercase tracking-[0.15em]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-white hover:underline font-semibold"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
