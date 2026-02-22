/**
 * LandingPageStandalone.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Fully self-contained landing page — no local file imports.
 * External deps required (npm): framer-motion, lucide-react, next
 * ─────────────────────────────────────────────────────────────────────────────
 */
"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    Target,
    ShieldCheck,
    ChevronRight,
    Zap,
    Code2,
    Activity,
    Menu,
    X,
    Component,
} from "lucide-react";
import DemoDashboard from "./DemoDashboard";
import { useRef } from "react";

// ─── Utility ─────────────────────────────────────────────────────────────────
function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}

// ─── Button ───────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost";
    size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        const base =
            "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";
        const variants = {
            default: "bg-white text-black hover:bg-zinc-200 shadow-md",
            outline: "border border-white/10 bg-transparent text-white hover:bg-white hover:text-black",
            ghost: "hover:bg-white/10 text-white",
        };
        const sizes = {
            default: "h-10 px-4 py-2",
            sm: "h-9 px-3",
            lg: "h-11 px-8",
            icon: "h-10 w-10",
        };
        return (
            <button
                ref={ref}
                className={cn(base, variants[variant], sizes[size], className)}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
    const router = useRouter();
    const links = [
        { name: "Features", href: "#features", id: "features" },
        { name: "Infrastructure", href: "#infra", id: "infra" },
        { name: "Network", href: "#network", id: "network" },
    ];

    const [isScrolled, setIsScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            suppressHydrationWarning
            className="fixed top-0 left-0 right-0 z-[100] flex justify-center pt-4 px-4 pointer-events-none"
        >
            <div
                className={cn(
                    "w-full max-w-6xl pointer-events-auto flex items-center justify-between px-6 py-3 rounded-[50px] border border-white/10 transition-all duration-500",
                    isScrolled || isOpen
                        ? "bg-black/90 backdrop-blur-xl"
                        : "bg-black/60 backdrop-blur-md"
                )}
            >
                {/* Brand */}
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => router.push("/")}
                >
                    <div className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center transition-all duration-300">
                        <Component className="h-6 w-6 sm:h-7 sm:w-7 text-white transition-transform duration-500 group-hover:rotate-90 group-hover:scale-110" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="text-white font-black text-xs sm:text-sm tracking-[0.3em] uppercase leading-none">
                            PROTOPILOT
                        </span>
                        <div className="h-[2px] w-0 bg-white group-hover:w-full transition-all duration-500 mt-1" />
                    </div>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden lg:flex items-center gap-8">
                    {links.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
                        >
                            {link.name}
                        </a>
                    ))}
                    <Button
                        onClick={() => router.push("/dashboard")}
                        className="rounded-full bg-white text-black hover:bg-zinc-200 uppercase text-black font-black text-[9px] tracking-widest px-6 h-10 flex items-center gap-2"
                    >
                        Get Started
                        <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                    </Button>
                </nav>

                {/* Hamburger */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="lg:hidden p-2 text-white hover:text-zinc-400 transition-colors"
                >
                    {isOpen ? <X size={32} /> : <Menu size={32} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden overflow-hidden border-t border-white/10 mt-4 rounded-b-[30px]"
                    >
                        <div className="flex flex-col p-8 gap-6">
                            {links.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="text-3xl font-black uppercase text-white hover:text-zinc-500 transition-colors"
                                >
                                    {link.name}
                                </a>
                            ))}
                            <Button
                                onClick={() => {
                                    setIsOpen(false);
                                    router.push("/dashboard");
                                }}
                                className="w-full rounded-lg bg-white text-black hover:bg-zinc-200 h-16 uppercase font-black text-sm tracking-widest mt-4 flex items-center gap-3"
                            >
                                <ChevronRight className="h-4 w-4 flex-shrink-0" />
                                Get Started
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LandingPage() {
    const router = useRouter();
    const demoRef = useRef<HTMLDivElement>(null);
    const [scrollOpacity, setScrollOpacity] = useState(1);
    const [scrollScale, setScrollScale] = useState(1);

    useEffect(() => {
        const handleScroll = () => {
            const y = window.scrollY;
            const rate = Math.min(y / 600, 1);
            setScrollOpacity(1 - rate * 0.4);
            setScrollScale(1 - rate * 0.08);
        };
        window.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const features = [
        {
            title: "Autonomous Architect",
            description:
                "Advanced agents that synthesize system blueprints from high-level logic.",
            icon: Code2,
        },
        {
            title: "Logic Core",
            description:
                "Deep analysis of business protocols and competitive landscape mapping.",
            icon: Target,
        },
        {
            title: "Threat Vectoring",
            description:
                "Proactive identification of architectural vulnerabilities and bottlenecks.",
            icon: ShieldCheck,
        },
        {
            title: "Sprint Automation",
            description:
                "Real-time task synchronization across global development nodes.",
            icon: Activity,
        },
    ];

    const stats = [
        { title: "5-Stage Reasoning Flow", subtitle: "Structured reasoning pipeline" },
        { title: "Schema-Validated", subtitle: "Invalid outputs rejected automatically" },
        { title: "Stateful Memory", subtitle: "Project history preserved across runs" },
    ];

    return (
        <div className="min-h-screen bg-[#000] text-white overflow-x-hidden selection:bg-white selection:text-black font-['Inter']">
            <Navbar />

            {/* Aurora Background */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{ x: [0, 60, -30, 0], y: [0, -40, 50, 0], scale: [1, 1.15, 0.92, 1], opacity: [0.35, 0.55, 0.3, 0.35] }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full blur-[140px]"
                    style={{ background: "radial-gradient(circle, rgba(124,58,237,0.7) 0%, transparent 70%)" }}
                />
                <motion.div
                    animate={{ x: [0, -50, 40, 0], y: [0, 60, -20, 0], scale: [1, 0.88, 1.2, 1], opacity: [0.25, 0.45, 0.2, 0.25] }}
                    transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                    className="absolute top-[-10%] left-[30%] w-[50%] h-[55%] rounded-full blur-[160px]"
                    style={{ background: "radial-gradient(circle, rgba(99,102,241,0.65) 0%, transparent 70%)" }}
                />
                <motion.div
                    animate={{ x: [0, -70, 20, 0], y: [0, 50, -60, 0], scale: [1, 1.2, 0.85, 1], opacity: [0.2, 0.4, 0.15, 0.2] }}
                    transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 5 }}
                    className="absolute top-[5%] right-[-15%] w-[55%] h-[55%] rounded-full blur-[150px]"
                    style={{ background: "radial-gradient(circle, rgba(6,182,212,0.55) 0%, transparent 70%)" }}
                />
                <motion.div
                    animate={{ x: [0, 80, -20, 0], y: [0, -30, 40, 0], scale: [1, 0.9, 1.15, 1], opacity: [0.15, 0.3, 0.12, 0.15] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 8 }}
                    className="absolute bottom-[0%] left-[-5%] w-[45%] h-[50%] rounded-full blur-[170px]"
                    style={{ background: "radial-gradient(circle, rgba(16,185,129,0.5) 0%, transparent 70%)" }}
                />
                <motion.div
                    animate={{ x: [0, -40, 60, 0], y: [0, -50, 20, 0], scale: [1, 1.1, 0.9, 1], opacity: [0.18, 0.32, 0.14, 0.18] }}
                    transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 12 }}
                    className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[55%] rounded-full blur-[160px]"
                    style={{ background: "radial-gradient(circle, rgba(244,63,94,0.45) 0%, transparent 70%)" }}
                />
            </div>

            {/* Hero Section */}
            <section className="relative pt-48 pb-32 px-6 z-10">
                <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{
                            opacity: 1, y: 0,
                            borderColor: ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.6)", "rgba(255,255,255,0.1)"],
                        }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", opacity: { duration: 0.8 }, y: { duration: 0.8 } }}
                        className="inline-flex items-center gap-2 px-6 py-2 rounded-full border bg-white/10 text-[10px] uppercase tracking-[0.4em] font-black mb-12 relative"
                    >
                        <Zap className="h-3 w-3" />
                        <span>Platform Status: Live</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
                        className="text-4xl sm:text-7xl lg:text-[11rem] font-black tracking-tighter leading-none sm:leading-[0.85] lg:leading-[0.8] mb-12"
                    >
                        BLUEPRINT <br />
                        <span className="text-zinc-600">THE FUTURE.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-lg sm:text-xl lg:text-2xl text-zinc-500 max-w-3xl mb-16 leading-relaxed font-light px-4 sm:px-0"
                    >
                        The integrated idea validator and business converter that turns raw concepts into client-ready solutions — faster than ever.
                    </motion.p>
                    
                        <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                className="flex flex-col sm:flex-row gap-3 sm:gap-6 mb-16 sm:mb-20 lg:mb-24 w-full sm:w-auto"
                            >
                                <Button size="lg" className="rounded-none bg-white text-black hover:bg-zinc-200 px-8 sm:px-16 h-16 sm:h-20 text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] transition-all duration-500" onClick={() => router.push("/dashboard")}>
                                    Initialize Workspace <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="lg" className="rounded-none border-white/10 text-white hover:bg-white hover:text-black px-8 sm:px-16 h-16 sm:h-20 text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] transition-all" onClick={() => router.push("/coming-soon")}>
                                    HOW IT WORKS
                                </Button>
                            </motion.div>

                    {/* Floating Dashboard Preview */}
                    <motion.div
                                ref={demoRef}
                                style={{
                                    opacity: scrollOpacity,
                                    scale: scrollScale,
                                    willChange: "opacity, transform"
                                }}
                                initial={{ opacity: 0, y: 60 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1.2, delay: 2.2, ease: [0.16, 1, 0.3, 1] }}
                                className="w-full max-w-6xl mx-4 sm:mx-0 border border-white/10 bg-white aspect-[16/9] min-h-[200px] relative group overflow-hidden shadow-[0_0_100px_rgba(255,255,255,0.05)]"
                            >
                                <DemoDashboard />
                            </motion.div>
                        </div>
                    </section>

            {/* Stats Section */}
            <section id="infra" className="relative py-40 z-10 border-y border-white/5 bg-black">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={stat.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.12 }}
                                className="flex flex-col items-center text-center gap-3 px-4"
                            >
                                <span className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                                    {stat.title}
                                </span>
                                <span className="text-[10px] sm:text-xs font-medium text-zinc-500 uppercase tracking-[0.35em] leading-relaxed">
                                    {stat.subtitle}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-48 px-6 max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-32 gap-12">
                    <div className="max-w-2xl">
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl sm:text-6xl md:text-[6rem] font-black uppercase tracking-tighter leading-none mb-4"
                        >
                            ENGINEERED <br />
                            <span className="text-zinc-700 font-light">PRECISION.</span>
                        </motion.h2>
                    </div>
                    <motion.p
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-zinc-500 text-lg max-w-full md:max-w-xs lg:max-w-sm mb-6 leading-relaxed font-light"
                    >
                        The AI-powered platform for validating ideas and converting them into compelling client proposals — in minutes.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <div className="bg-black p-8 sm:p-12 group hover:bg-zinc-900/40 transition-all duration-700 h-full">
                                <div className="mb-6 sm:mb-10 p-5 inline-block border border-white/5 bg-white/5 grayscale group-hover:grayscale-0 transition-all">
                                    <feature.icon className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-sm font-black mb-4 uppercase tracking-[0.2em] text-white/90">
                                    {feature.title}
                                </h3>
                                <p className="text-zinc-500 leading-relaxed font-light text-sm">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section id="network" className="mb-48 px-4 sm:px-6 max-w-7xl mx-auto relative z-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="bg-white p-2 py-10 sm:p-20 lg:p-32 text-center text-black relative overflow-hidden"
                        >
                            <div className="relative z-10">
                                <h2 className="text-3xl sm:text-6xl md:text-7xl lg:text-[8rem] font-black mb-8 sm:mb-16 tracking-tighter leading-tight sm:leading-[0.85] uppercase break-words px-2">
                                    READY TO <br /> CONVERT?
                                </h2>
                                <p className="text-zinc-500 text-sm sm:text-xl mb-12 sm:mb-20 max-w-2xl mx-auto font-medium uppercase tracking-[0.1em] px-2 sm:px-0 leading-relaxed">
                                    The most powerful idea validation and client conversion platform ever built. Validate faster, convert smarter.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                                    <Button
                                        size="lg"
                                        className="w-full sm:w-auto !bg-black !text-white hover:!bg-zinc-800 rounded-none px-8 sm:px-16 h-14 sm:h-20 text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] transition-all"
                                        onClick={() => router.push("/dashboard")}
                                    >
                                        Start Validating
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="w-full sm:w-auto !border-2 !border-black !text-black !bg-white hover:!bg-black hover:!text-white rounded-none px-8 sm:px-16 h-14 sm:h-20 text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] transition-all"
                                        onClick={() => router.push("/coming-soon")}
                                    >
                                        Contact Us
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </section>

            {/* Footer */}
            <footer id="protocol" className="bg-black relative z-10">
                <div className="max-w-7xl mx-auto px-6 py-16 sm:py-20 md:py-24">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-16 lg:gap-24">
                        {/* Left: Logo + tagline */}
                        <div className="md:col-span-2">
                            <div
                                className="flex items-center gap-3 mb-6 md:mb-8 cursor-pointer group w-fit"
                                onClick={() => router.push("/")}
                            >
                                <div className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center transition-all duration-300">
                                    <Component className="h-8 w-8 sm:h-9 sm:w-9 text-white transition-transform duration-500 group-hover:rotate-90 group-hover:scale-110" strokeWidth={1.25} />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <span className="text-white font-black text-xl sm:text-2xl tracking-[0.2em] uppercase leading-none">
                                        PROTOPILOT
                                    </span>
                                    <div className="h-[2px] w-0 bg-white group-hover:w-full transition-all duration-500 mt-1" />
                                </div>
                            </div>
                            <p className="text-zinc-500 text-xs sm:text-sm font-light uppercase tracking-[0.2em] leading-relaxed max-w-sm">
                                AI-POWERED IDEA VALIDATION AND BUSINESS<br />
                                CONVERSION.<br />
                                VALIDATE FASTER, WIN CLIENTS SMARTER.
                            </p>
                        </div>
                        {/* Product column */}
                        <div>
                            <h4 className="font-black mb-6 uppercase tracking-[0.35em] text-[10px] text-white">PRODUCT</h4>
                            <ul className="space-y-4 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                                <li><a href="#" className="hover:text-white transition-colors">Infrastructure</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                            </ul>
                        </div>
                        {/* Network column */}
                        <div>
                            <h4 className="font-black mb-6 uppercase tracking-[0.35em] text-[10px] text-white">NETWORK</h4>
                            <ul className="space-y-4 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="border-t border-zinc-700/80 max-w-7xl mx-auto" />
            </footer>
        </div>
    );
}
