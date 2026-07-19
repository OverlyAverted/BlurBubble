import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Key, Eye, User, Mail, Building, Check, FileText } from 'lucide-react';

interface NDAGatekeeperProps {
  onAccept: (user: { name: string; email: string; organization: string }) => void;
}

export default function NDAGatekeeper({ onAccept }: NDAGatekeeperProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('General Public / Developer');
  const [agreedToLicense, setAgreedToLicense] = useState(false);
  const [agreedToDisclaimer, setAgreedToDisclaimer] = useState(false);
  const [error, setError] = useState('');
  const [isReadingLicense, setIsReadingLicense] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your name or GitHub handle.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!agreedToLicense) {
      setError('You must accept the GPLv3 Open Source License and Terms of Use.');
      return;
    }
    if (!agreedToDisclaimer) {
      setError('You must acknowledge that this is a Beta Sandbox / Work in Progress.');
      return;
    }

    onAccept({ name, email, organization });
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950 flex items-center justify-center p-4 overflow-y-auto font-sans text-slate-200">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-2xl bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative z-10 my-8 overflow-hidden glow-emerald"
      >
        {/* Neon accent top bar - Beta Indicator */}
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500"></div>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-lg shadow-emerald-500/10 mb-4">
            <Shield className="w-7 h-7 text-emerald-400" />
          </div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-2 uppercase tracking-widest">
            <span>Open Beta Sandbox</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-sans">
            BlurBubble Privacy Workspace
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md">
            Welcome to the open-source demonstration portal for <span className="text-emerald-400 font-bold">BlurBubble™</span>. This interactive workspace simulates our spatial opt-out protocol (RFC-9402) designed under the GPLv3 License.
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-mono text-center"
          >
            ⚠️ {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5 font-mono">
                Name or GitHub Handle <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. dev-privacy"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5 font-mono">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. hello@domain.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all font-semibold"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5 font-mono">
              Your Primary Sector / Affiliation <span className="text-slate-500">*</span>
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <select
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all font-semibold appearance-none cursor-pointer"
              >
                <option value="General Public / Developer">General Public / Developer</option>
                <option value="Technology Company / Hardware OEM">Technology Company / Hardware OEM</option>
                <option value="School Board / Educational Facility">School Board / Educational Facility</option>
                <option value="Private Event / Business Venue">Private Event / Business Venue</option>
                <option value="Legal Counsel / Privacy Advocate">Legal Counsel / Privacy Advocate</option>
                <option value="Potential Investor / Partner">Potential Investor / Partner</option>
              </select>
            </div>
          </div>

          {/* Inline License & Open Terms */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider font-sans">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>GPLv3 Open Source License Summary</span>
              </div>
              <button
                type="button"
                onClick={() => setIsReadingLicense(!isReadingLicense)}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 underline font-mono cursor-pointer bg-transparent border-none"
              >
                {isReadingLicense ? 'Hide License Text' : 'View Full License Text'}
              </button>
            </div>

            <div className="max-h-24 overflow-y-auto text-[10px] text-slate-400 leading-relaxed space-y-2 pr-1 font-mono">
              <p>
                <strong>1. GNU GPLv3 Copyleft Model:</strong> This project is distributed under the GNU General Public License v3. Permission is granted to run, study, share, and modify this source code for any educational or developer purpose, provided all downstream derivative works are also open-source.
              </p>
              <p>
                <strong>2. Community Safeguards:</strong> In alignment with collaborative open-source principles, any standard protocol or firmware modifications should remain interoperable with the public BlurBubble Beacon Specification (RFC-9402).
              </p>
            </div>

            {isReadingLicense && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-3 border-t border-slate-900 max-h-48 overflow-y-auto text-[10px] text-slate-400 leading-relaxed space-y-2 font-mono pr-1"
              >
                <p className="font-bold text-white uppercase text-[9px] tracking-wider">GNU GENERAL PUBLIC LICENSE Version 3 Excerpt</p>
                <p>Everyone is permitted to copy and distribute verbatim copies of this license document, but changing it is not allowed.</p>
                <p><strong>Preamble:</strong> The licenses for most software and other practical works are designed to take away your freedom to share and change the works. By contrast, the GNU General Public License is intended to guarantee your freedom to share and change all versions of a program--to make sure it remains free software for all its users.</p>
                <p><strong>Disclaimer of Warranty:</strong> THERE IS NO WARRANTY FOR THE PROGRAM, TO THE EXTENT PERMITTED BY APPLICABLE LAW. EXCEPT WHEN OTHERWISE STATED IN WRITING THE COPYRIGHT HOLDERS AND/OR OTHER PARTIES PROVIDE THE PROGRAM "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.</p>
                <p><strong>Limitation of Liability:</strong> IN NO EVENT UNLESS REQUIRED BY APPLICABLE LAW OR AGREED TO IN WRITING WILL ANY COPYRIGHT HOLDER, OR ANY OTHER PARTY WHO MODIFIES AND/OR CONVEYS THE PROGRAM AS PERMITTED ABOVE, BE LIABLE TO YOU FOR DAMAGES, INCLUDING ANY GENERAL, SPECIAL, INCIDENTAL OR CONSEQUENTIAL DAMAGES ARISING OUT OF THE USE OR INABILITY TO USE THE PROGRAM.</p>
              </motion.div>
            )}
          </div>

          {/* Checklist checkboxes */}
          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreedToLicense}
                onChange={(e) => setAgreedToLicense(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                agreedToLicense 
                  ? 'bg-emerald-500 border-emerald-400 text-slate-950' 
                  : 'bg-slate-950 border-slate-800 group-hover:border-slate-700'
              }`}>
                {agreedToLicense && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
              </div>
              <div className="text-xs">
                <span className="text-white font-bold block group-hover:text-emerald-400 transition-colors">I Accept the GPLv3 License &amp; Terms of Use</span>
                <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">I agree to the open-source copyleft terms, giving me freedom to modify, study, and share this software.</span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreedToDisclaimer}
                onChange={(e) => setAgreedToDisclaimer(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                agreedToDisclaimer 
                  ? 'bg-emerald-500 border-emerald-400 text-slate-950' 
                  : 'bg-slate-950 border-slate-800 group-hover:border-slate-700'
              }`}>
                {agreedToDisclaimer && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
              </div>
              <div className="text-xs">
                <span className="text-white font-bold block group-hover:text-emerald-400 transition-colors">I Acknowledge this is an Interactive Beta Sandbox</span>
                <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">I understand this is a personal learning project and a work-in-progress simulation representing visual privacy standards.</span>
              </div>
            </label>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-450 hover:to-teal-450 text-slate-950 font-black uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition duration-300 cursor-pointer focus:outline-none"
          >
            <Key className="w-4 h-4" />
            <span>Unlock Beta Project Workspace</span>
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>BLURBUBBLE OPEN-SOURCE BETA WORKSPACE</span>
          </div>
          <span>ALIGNED WITH RFC-9402 PROTOCOLS</span>
        </div>
      </motion.div>
    </div>
  );
}
