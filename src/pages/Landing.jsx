import React from "react";
import { Link } from "react-router-dom";
import Logo from '../components/Logo';
import { APP_NAME } from '../config/config';

export default function Landing() {
	return (
		<main className="min-h-screen bg-gradient-to-b from-primary/10 to-transparent text-[--text] dark:text-white">
			{/* Header */}
			<header className="header-hero sticky top-0 z-10">
				<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
					<div className="flex items-center gap-3">
						<Logo size={8} showText={true} className="items-center" />
					</div>
					<nav className="hidden sm:flex items-center gap-4 text-sm">
						<Link to="/login" className="rounded-md px-4 py-2 text-sm font-semibold text-white bg-white/10 hover:bg-white/20">Login</Link>
					</nav>
				</div>
			</header>

			{/* New Body - clean, modern marketing layout */}
			<section className="relative overflow-hidden">
				{/* Background image (library) */}
				<div
					className="absolute inset-0 bg-cover bg-center"
					style={{
						backgroundImage: `url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=2000&q=60')`,
						filter: 'brightness(0.6)'
					}}
					aria-hidden="true"
				/>
				{/* Overlay to keep text readable */}
				<div className="absolute inset-0 bg-gradient-to-b from-[rgba(2,6,20,0.7)] to-[rgba(2,6,20,0.4)]" aria-hidden="true" />
				<div className="relative py-28">
					<div className="mx-auto max-w-5xl px-6 text-center">
						<h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white" style={{ textShadow: '0 6px 18px rgba(0,0,0,0.6)' }}>Welcome to {APP_NAME}</h1>
						<p className="mt-4 text-lg sm:text-xl text-white/95 max-w-3xl mx-auto" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.45)' }}>A lightweight, secure library management experience built for librarians and borrowers. Fast searches, clear workflows, and an interface that respects your time.</p>
						<div className="mt-8 flex items-center justify-center gap-4">
							<Link to="/login" className="primary-btn">Sign in</Link>
						</div>
					</div>
				</div>
			</section>

			<section id="about" className="py-12 bg-[var(--surface)]">
				<div className="mx-auto max-w-6xl px-6 grid md:grid-cols-3 gap-6">
					<div className="card">
						<h3 className="font-semibold text-[--text]">Purpose</h3>
						<p className="mt-2 text-[--muted] text-sm">Help libraries manage collections and patrons with minimal setup and clear, role-based access.</p>
					</div>
					<div className="card">
						<h3 className="font-semibold text-[--text]">Design</h3>
						<p className="mt-2 text-[--muted] text-sm">Responsive UI, dark mode support, and accessible controls so staff and patrons can use it on any device.</p>
					</div>
					<div className="card">
						<h3 className="font-semibold text-[--text]">Security</h3>
						<p className="mt-2 text-[--muted] text-sm">Token-based auth, role authorization, and clear separation of librarian vs borrower workflows.</p>
					</div>
				</div>
			</section>


			{/* About us (bottom) */}
			<section id="about-us" className="py-12 bg-[var(--surface)]">
				<div className="mx-auto max-w-6xl px-6">
					<h2 className="text-2xl font-bold text-[--text] text-center">About {APP_NAME}</h2>
					<p className="mt-3 text-[--muted] text-center max-w-2xl mx-auto">{APP_NAME} was created to give small and medium libraries an easy-to-use, secure, and fast system for managing books, members, and borrowing. We focus on clarity, accessibility, and minimizing administrative overhead so libraries can focus on readers.</p>
					<div className="mt-8 grid gap-6 md:grid-cols-3">
						<div className="card">
							<h3 className="font-semibold text-[--text]">Our mission</h3>
							<p className="mt-2 text-[--muted] text-sm">Empower libraries with software that is simple, reliable, and respectful of privacy.</p>
						</div>
						<div className="card">
							<h3 className="font-semibold text-[--text]">Community</h3>
							<p className="mt-2 text-[--muted] text-sm">We design for librarians and patrons — accessibility and discoverability are core principles.</p>
						</div>
						<div className="card">
							<h3 className="font-semibold text-[--text]">Support</h3>
							<p className="mt-2 text-[--muted] text-sm">If you need help, reach out to your system administrator or open an issue in the project repository for assistance.</p>
						</div>
					</div>
				</div>
			</section>

			<footer className="border-t border-slate-200/60 bg-[var(--surface)]">
				<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-[--muted]">
					© {new Date().getFullYear()} {APP_NAME}. All rights reserved.
				</div>
			</footer>
		</main>
	);
}

function FeatureCard({ title, desc, emoji }) {
	return (
						<div className="rounded-xl border border-slate-200 bg-[var(--surface)] p-5 shadow-sm hover:shadow-md transition-shadow">
			<div className="text-2xl">{emoji}</div>
			<h3 className="mt-3 text-lg font-semibold text-slate-900">{title}</h3>
			<p className="mt-1 text-sm text-slate-600 leading-relaxed">{desc}</p>
		</div>
	);
}
