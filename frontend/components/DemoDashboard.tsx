/**
 * DemoDashboardStandalone.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Fully self-contained demo dashboard — no local file imports.
 * External deps required (npm): framer-motion, lucide-react
 * ─────────────────────────────────────────────────────────────────────────────
 */
"use client";

import { motion } from "framer-motion";
import {
    BarChart3,
    ShieldCheck,
    Rocket,
    ArrowUpRight,
    Target,
    Briefcase,
    Lightbulb,
    Users,
    Activity,
    LineChart,
} from "lucide-react";

export default function DemoDashboard() {
    return (
        <div
            className="w-full h-full bg-[#f8fafc] rounded-none border border-slate-200 overflow-hidden font-sans relative flex shadow-2xl"
            style={{ fontSize: "clamp(7px, 1.6vw, 13px)" }}
        >
            {/* Sidebar */}
            <div className="w-16 md:w-20 bg-slate-900 flex flex-col items-center py-8 gap-8 border-r border-slate-800">
                <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center font-black text-slate-900 mb-4 shadow-xl">
                    P
                </div>
                <div className="flex flex-col gap-6">
                    <div className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer">
                        <Activity size={20} />
                    </div>
                    <div className="p-2 text-white bg-slate-800 rounded-lg cursor-pointer">
                        <LineChart size={20} />
                    </div>
                    <div className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer">
                        <Users size={20} />
                    </div>
                    <div className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer">
                        <ShieldCheck size={20} />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar */}
                <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Feasibility Protocol
                        </span>
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-sm font-bold text-slate-900 tracking-tight">
                            Project EcoSwap Alpha
                        </span>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                Current Phase
                            </span>
                            <span className="text-[11px] font-black text-slate-900">
                                Architecture v1.0
                            </span>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                            <Users size={16} className="text-slate-500" />
                        </div>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="p-8 space-y-6 overflow-y-auto bg-slate-50/50 flex-1">
                    {/* KPI Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* KPI 1 — Feasibility */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1 }}
                            className="bg-white p-6 border border-slate-200 shadow-sm"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Feasibility Score
                                </span>
                                <Target className="h-4 w-4 text-emerald-500" />
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-slate-900 tracking-tight">92.4%</span>
                                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded italic hover:scale-105 transition-all">
                                    +4.2%
                                </span>
                            </div>
                            <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "92.4%" }}
                                    transition={{ duration: 3, delay: 0.8 }}
                                    className="h-full bg-slate-900 rounded-full"
                                />
                            </div>
                            <div className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <div className="h-1 w-1 rounded-full bg-slate-300" /> Verified by AI Agent
                            </div>
                        </motion.div>

                        {/* KPI 2 — Risk Distribution */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="bg-white p-6 border border-slate-200 shadow-sm relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Risk Distribution
                                </span>
                                <ShieldCheck className="h-4 w-4 text-slate-400" />
                            </div>
                            <div className="flex items-center gap-6 mt-2">
                                <div className="relative h-24 w-24">
                                    <svg viewBox="0 0 100 100" className="h-full w-full rotate-[-90deg]">
                                        <motion.circle
                                            initial={{ strokeDasharray: "0 100" }}
                                            animate={{ strokeDasharray: "65 100" }}
                                            transition={{ duration: 2.5, delay: 1 }}
                                            cx="50" cy="50" r="40"
                                            fill="transparent" stroke="#10b981" strokeWidth="20"
                                        />
                                        <motion.circle
                                            initial={{ strokeDasharray: "0 100", strokeDashoffset: 0 }}
                                            animate={{ strokeDasharray: "25 100", strokeDashoffset: -65 }}
                                            transition={{ duration: 2, delay: 1.5 }}
                                            cx="50" cy="50" r="40"
                                            fill="transparent" stroke="#f59e0b" strokeWidth="20"
                                        />
                                        <motion.circle
                                            initial={{ strokeDasharray: "0 100", strokeDashoffset: 0 }}
                                            animate={{ strokeDasharray: "10 100", strokeDashoffset: -90 }}
                                            transition={{ duration: 1.5, delay: 2 }}
                                            cx="50" cy="50" r="40"
                                            fill="transparent" stroke="#ef4444" strokeWidth="20"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center flex-col scale-75">
                                        <span className="text-sm font-black text-slate-900 leading-none">LOW</span>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase">Overall</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">65% Low</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">25% Med</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-rose-500" />
                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">10% High</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* KPI 3 — MVP Timeline */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.4 }}
                            className="bg-white p-6 border border-slate-200 shadow-sm"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    MVP Timeline
                                </span>
                                <Rocket className="h-4 w-4 text-slate-900" />
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-slate-900 tracking-tight">14 Days</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 px-1.5 py-0.5 rounded">
                                    Optimized
                                </span>
                            </div>
                            <div className="mt-4 flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                                    Ready for Deployment
                                </span>
                            </div>
                            <div className="mt-4 flex gap-1 h-1">
                                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                                    <div key={i} className={`h-full flex-1 ${i <= 5 ? "bg-slate-900" : "bg-slate-100"}`} />
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Analysis Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Client Intelligence */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.2, delay: 0.6 }}
                            className="bg-white border border-slate-200 shadow-sm overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/20">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                    <Briefcase size={14} className="text-slate-900" /> Client Intelligence
                                </h3>
                                <ArrowUpRight size={14} className="text-slate-300" />
                            </div>
                            <div className="p-8 space-y-4">
                                <div className="space-y-3">
                                    <div className="h-2 w-full bg-slate-100 rounded-full" />
                                    <div className="h-2 w-5/6 bg-slate-100 rounded-full" />
                                    <div className="h-2 w-4/6 bg-slate-50 rounded-full" />
                                </div>
                                <div className="pt-6 grid grid-cols-2 gap-4">
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        className="p-4 bg-slate-50 rounded border border-slate-100 transition-all cursor-default"
                                    >
                                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                            Market Fit Score
                                        </div>
                                        <div className="text-xs font-black text-slate-900 tracking-tight italic select-none font-serif">
                                            High Integrity
                                        </div>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        className="p-4 bg-slate-50 rounded border border-slate-100 transition-all cursor-default"
                                    >
                                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                            Expansion Index
                                        </div>
                                        <div className="text-xs font-black text-slate-900 tracking-tight italic select-none font-serif">
                                            Accelerated
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>

                        {/* MVP Insights */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.2, delay: 0.8 }}
                            className="bg-slate-900 border border-slate-800 shadow-xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                                <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    <Lightbulb size={14} className="text-amber-400" /> MVP Insights
                                </h3>
                                <div className="px-2 py-1 bg-emerald-500 text-black text-[9px] font-black uppercase tracking-tighter rounded">
                                    Phase 1.0 READY
                                </div>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="flex gap-4 items-center group transition-all">
                                    <div className="h-10 w-10 flex-shrink-0 bg-white/5 border border-white/10 flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-transform">
                                        01
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-white uppercase tracking-widest mb-1">
                                            Circular Protocol
                                        </div>
                                        <div className="text-[10px] text-slate-500 font-medium">
                                            Auto-executing circular economy blueprints...
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-center group transition-all">
                                    <div className="h-10 w-10 flex-shrink-0 bg-white/5 border border-white/10 flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-transform">
                                        02
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-white uppercase tracking-widest mb-1">
                                            Asset Validation
                                        </div>
                                        <div className="text-[10px] text-slate-500 font-medium">
                                            Real-time valuation and condition clusters...
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <motion.div
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full h-11 bg-white flex items-center justify-center text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] cursor-pointer hover:bg-slate-100 transition-all shadow-lg"
                                    >
                                        Execute Deployment
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Subtle Grid Overlay */}
            <div
                className="absolute inset-0 z-[0] opacity-[0.02] pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />
        </div>
    );
}
