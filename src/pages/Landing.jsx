import React from "react";
import { Link } from "react-router-dom";
import Logo from '../components/Logo';
import { APP_NAME } from '../config/config';

export default function Landing() {
	return (
		<main className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800">
			{/* Header */}
			<header className="border-b border-slate-200/60 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-10">
				<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
					<div className="flex items-center gap-3">
						<Logo size={8} showText={true} className="items-center" />
					</div>
					<nav className="hidden sm:flex items-center gap-4 text-sm">
						<Link to="/login" className="text-slate-600 hover:text-blue-700 rounded-xl bg-secondary w-[100px] text-center h-[30px] font-semibold py-1 ">
							Login
						</Link>
					</nav>
				</div>
			</header>

			{/* Hero */}
			<section className="relative">
				<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 grid lg:grid-cols-2 gap-10 items-center">
					<div>
						<h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
							Manage your library with ease
						</h1>
						<p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
							A simple, fast, and reliable Library Management System for
							librarians to track books, members, and borrow records—all in one
							place.
						</p>
						<div className="mt-6 flex flex-wrap gap-3">
							<Link
								to="/login"
								className="inline-flex items-center justify-center rounded-md bg-primary-gradient px-5 py-2.5 text-white font-medium shadow-sm hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
							>
								Get Started
							</Link>
							<a
								href="#features"
								className="inline-flex items-center justify-center rounded-md border border-slate-300 px-5 py-2.5 text-slate-700 font-medium hover:bg-slate-50"
							>
								Learn more
							</a>
						</div>
						<div className="mt-6 flex items-center gap-6 text-sm text-slate-500">
							<div>
								<span className="font-semibold text-slate-900">Secure</span> auth
							</div>
							<div>
								<span className="font-semibold text-slate-900">Fast</span> search
							</div>
							<div>
								<span className="font-semibold text-slate-900">Mobile</span> friendly
							</div>
						</div>
					</div>
					<div className="relative">
						<div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 sm:p-6">
							<div className="grid grid-cols-2 gap-3 text-center">
								<div className="rounded-lg bg-blue-50 p-6">
									<div className="text-3xl">📚</div>
									<div className="mt-2 text-sm font-medium text-slate-700">
										Manage Books
									</div>
								</div>
								<div className="rounded-lg bg-emerald-50 p-6">
									<div className="text-3xl">🧑‍🤝‍🧑</div>
									<div className="mt-2 text-sm font-medium text-slate-700">
										Track Members
									</div>
								</div>
								<div className="rounded-lg bg-amber-50 p-6">
									<div className="text-3xl">🔄</div>
									<div className="mt-2 text-sm font-medium text-slate-700">
										Borrow Records
									</div>
								</div>
								<div className="rounded-lg bg-fuchsia-50 p-6">
									<div className="text-3xl">📈</div>
									<div className="mt-2 text-sm font-medium text-slate-700">
										Insights & Stats
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features */}
			<section id="features" className="bg-white border-t border-slate-200/60">
				<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
					<h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center">
						Everything you need to run a modern library
					</h2>
					<div className="mt-10 grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
						<FeatureCard title="Catalog Management" desc="Add, edit, and categorize books with ISBN, authors, and availability." emoji="🗂️" />
						<FeatureCard title="Smart Search" desc="Find books and members instantly with fast, fuzzy search." emoji="🔎" />
						<FeatureCard title="Borrow Tracking" desc="Issue and return books with due date reminders and status." emoji="⏱️" />
						<FeatureCard title="Member Profiles" desc="Manage members, contact details, and borrowing history." emoji="👤" />
						<FeatureCard title="Notifications" desc="Stay on top with toast alerts for key actions and errors." emoji="🔔" />
						<FeatureCard title="Secure Access" desc="Role-based access with token authentication." emoji="🛡️" />
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
				<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex flex-col md:flex-row items-center justify-between gap-6">
					<div>
						<h3 className="text-2xl sm:text-3xl font-bold">Ready to simplify your library?</h3>
						<p className="mt-2 text-blue-100">Login to your dashboard and start managing today.</p>
					</div>
					<Link
						to="/login"
						className="inline-flex items-center justify-center rounded-md bg-white px-5 py-2.5 text-blue-700 font-semibold shadow-sm hover:bg-blue-50"
					>
						Go to Login
					</Link>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-slate-200/60 bg-white">
				<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-slate-500">
						© {new Date().getFullYear()} {APP_NAME}. All rights reserved.
				</div>
			</footer>
		</main>
	);
}

function FeatureCard({ title, desc, emoji }) {
	return (
		<div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
			<div className="text-2xl">{emoji}</div>
			<h3 className="mt-3 text-lg font-semibold text-slate-900">{title}</h3>
			<p className="mt-1 text-sm text-slate-600 leading-relaxed">{desc}</p>
		</div>
	);
}
