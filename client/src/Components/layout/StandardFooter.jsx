import { Link } from 'react-router-dom'

import logo from '../../images/logo-removebg-preview.png'

import facebookIcon from '../../images/facebook.png'
import twitterIcon from '../../images/twitter.png'
import instagramIcon from '../../images/instagram.png'
import linkedinIcon from '../../images/linkedin.png'

export default function StandardFooter() {
  return (
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
                <a className="hover:text-white" href="mailto:binetjachew18@gmail.com">
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
  )
}
