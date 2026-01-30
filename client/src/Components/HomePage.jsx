import { Link } from 'react-router-dom'

import logo from '../images/logo-removebg-preview.png'
import heroBg from '../images/landing-page.jpg'

import iconCompliance from '../images/fast-charge.png'
import iconLawyer from '../images/law.png'
import iconCertified from '../images/certified.png'

import partnerAfcfta from '../images/AfCFTA.jpg'
import partnerUn from '../images/un-logo.jpg'
import partnerAu from '../images/africa-union.jpg'
import partnerAfdb from '../images/africa-development-bank.jpg'

import facebookIcon from '../images/facebook.png'
import twitterIcon from '../images/twitter.png'
import instagramIcon from '../images/instagram.png'
import linkedinIcon from '../images/linkedin.png'

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
    >
      {children}
    </Link>
  )
}

function FeatureCard({ iconSrc, title, description }) {
  return (
    <div className="w-full rounded-xl bg-white shadow-lg ring-1 ring-slate-200/50 px-6 py-5 flex items-center gap-4">
      <div className="h-12 w-12 rounded-lg bg-amber-50 flex items-center justify-center ring-1 ring-amber-100">
        <img src={iconSrc} alt="" className="h-7 w-7 object-contain" />
      </div>
      <div className="min-w-0">
        <div className="text-base font-semibold text-slate-900 leading-tight">
          {title}
        </div>
        {description ? (
          <div className="text-sm text-slate-600 mt-1 leading-snug">
            {description}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-white">
      <header>
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
          <nav className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between">
              <Link to="/" className="flex items-center gap-3">
                <img
                  src={logo}
                  alt="AfriVerify"
                  className="h-10 w-auto object-contain"
                />
                <span className="text-slate-900 font-semibold tracking-wide">
                  AfriVerify
                </span>
              </Link>

              <div className="hidden md:flex items-center gap-8">
                <NavLink to="/">Solutions</NavLink>
                <NavLink to="/">About Us</NavLink>
                <NavLink to="/">Pricing</NavLink>
                <NavLink to="/">FAQ</NavLink>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="hidden sm:inline-flex text-sm font-semibold text-slate-700 hover:text-slate-900"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center rounded-full bg-amber-300 px-5 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  GET STARTED
                </Link>
              </div>
            </div>
          </nav>
        </div>

        <div className="relative isolate overflow-hidden">
          <div
            className="absolute inset-0 bg-center bg-cover"
            style={{ backgroundImage: `url(${heroBg})` }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-slate-950/70" aria-hidden="true" />

          <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-10 pt-10 sm:pt-14">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
              Export Across Africa
              <br />
              Tariff-Free
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-base sm:text-lg text-white/85">
              AI-powered compliance engine to help your SME qualify for the “Made in
              Africa” seal under AfCFTA.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center rounded-lg bg-amber-300 px-6 py-3 text-sm sm:text-base font-semibold text-slate-900 shadow hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                START YOUR FREE CHECK
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-lg bg-white/10 px-6 py-3 text-sm sm:text-base font-semibold text-white ring-1 ring-white/25 hover:bg-white/15"
              >
                I already have an account
              </Link>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            <FeatureCard
              iconSrc={iconCompliance}
              title="Instant Compliance Check"
              description="Answer a few questions and get a clear readiness summary."
            />
            <FeatureCard
              iconSrc={iconLawyer}
              title="AI Trade Lawyer"
              description="Guidance on rules of origin and documentation steps."
            />
            <FeatureCard
              iconSrc={iconCertified}
              title="Certified Document"
              description="Generate export-ready documents aligned to standards."
            />
          </div>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h2 className="text-center text-2xl sm:text-3xl font-semibold text-slate-900">
            Our Partners
          </h2>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-6 items-center">
            <div className="flex items-center justify-center">
              <img
                src={partnerAfcfta}
                alt="AfCFTA"
                className="h-14 w-auto object-contain"
              />
            </div>
            <div className="flex items-center justify-center">
              <img
                src={partnerUn}
                alt="United Nations"
                className="h-14 w-auto object-contain"
              />
            </div>
            <div className="flex items-center justify-center">
              <img
                src={partnerAu}
                alt="African Union"
                className="h-14 w-auto object-contain"
              />
            </div>
            <div className="flex items-center justify-center">
              <img
                src={partnerAfdb}
                alt="African Development Bank"
                className="h-14 w-auto object-contain"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 text-slate-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <div className="flex items-center gap-3">
                <img
                  src={logo}
                  alt="AfriVerify"
                  className="h-9 w-auto object-contain"
                />
                <div className="font-semibold">AfriVerify</div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-200/80">
                AfriVerify leverages advanced AI to simplify AfCFTA compliance,
                helping African SMEs navigate complex trade regulations with
                automated precision.
              </p>
              <div className="mt-5 flex items-center gap-3">
                <a
                  href="#"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/15"
                  aria-label="Facebook"
                >
                  <img src={facebookIcon} alt="" className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/15"
                  aria-label="X"
                >
                  <img src={twitterIcon} alt="" className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/15"
                  aria-label="Instagram"
                >
                  <img src={instagramIcon} alt="" className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/15"
                  aria-label="LinkedIn"
                >
                  <img src={linkedinIcon} alt="" className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-slate-100">Explore</div>
              <div className="mt-4 flex flex-col gap-2 text-sm text-slate-200/80">
                <Link className="hover:text-white" to="/">
                  About Us
                </Link>
                <Link className="hover:text-white" to="/">
                  Solutions
                </Link>
                <Link className="hover:text-white" to="/">
                  Pricing
                </Link>
                <Link className="hover:text-white" to="/">
                  FAQ
                </Link>
              </div>
              <div className="mt-6">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-200"
                >
                  Login/Signup
                </Link>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-slate-100">Contact</div>
              <div className="mt-4 text-sm text-slate-200/80 space-y-2">
                <div>
                  <span className="text-slate-200/70">Call:</span> +2519-463-64625
                </div>
                <div>
                  <span className="text-slate-200/70">Email:</span>{' '}
                  <a
                    className="hover:text-white"
                    href="mailto:binetjachew18@gmail.com"
                  >
                    binetjachew18@gmail.com
                  </a>
                </div>
              </div>
              <form className="mt-5">
                <label className="sr-only" htmlFor="footer-email">
                  Email
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="footer-email"
                    type="email"
                    placeholder="Write an email"
                    className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                  <button
                    type="button"
                    className="rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/15"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-xs text-slate-200/60">
            © {new Date().getFullYear()} AfriVerify. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
