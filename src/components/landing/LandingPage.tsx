import React, { useState } from 'react';
import { SecondMedicLogo } from '../common/SecondMedicLogo';
import {
  Activity,
  Check,
  X,
  Home,
  TrendingUp,
  Target,
  RefreshCw,
  ArrowRight,
  Menu,
  ChevronDown,
  ChevronUp,
  Send,
  Sparkles,
  MapPin,
  Building2,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  PhoneCall,
  MessageSquare
} from 'lucide-react';

interface LandingPageProps {
  onClientLogin: () => void;
  onPhlebotomistLogin: () => void;
  onAdminLogin?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onClientLogin,
  onPhlebotomistLogin,
  onAdminLogin
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Lead Form State
  const [formData, setFormData] = useState({
    business: '',
    contact: '',
    mobile: '',
    email: '',
    city: 'Visakhapatnam',
    pincode: '',
    type: '',
    orders: '50–100',
    message: '',
    agreed: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const existingLeads = JSON.parse(localStorage.getItem('secondmedic_leads') || '[]');
      existingLeads.push({
        ...formData,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('secondmedic_leads', JSON.stringify(existingLeads));
      setSubmitSuccess(true);
    } catch {
      setSubmitSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    const msg = encodeURIComponent(
      "Hi SecondMedic, I run a diagnostic lab in Vizag and would like to know about your phlebotomy service."
    );
    window.open(`https://wa.me/918912345678?text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#087ea4] selection:text-white">
      {/* Top Announcement Bar */}
      <div className="bg-[#073b52] text-[#dff7fb] text-xs sm:text-[13px] py-2 px-4 border-b border-[#0b4b66]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <span className="font-semibold tracking-wide flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            SecondMedic B2B Phlebotomy Network
          </span>
          <span className="opacity-90 font-medium">
            Launching in Vizag • Expanding city by city
          </span>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#dceaf0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[76px] flex items-center justify-between gap-4">
          
          {/* Logo Branding */}
          <a href="#home" className="group flex items-center">
            <SecondMedicLogo
              height={44}
              showTagline={true}
              cityBadge={true}
              className="group-hover:opacity-95 transition-opacity"
            />
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-sm font-semibold text-[#3f5b6a]">
            <a href="#how" className="hover:text-[#087ea4] transition-colors">How It Works</a>
            <a href="#services" className="hover:text-[#087ea4] transition-colors">Services</a>
            <a href="#labs" className="hover:text-[#087ea4] transition-colors">For Labs</a>
            <a href="#vizag" className="hover:text-[#087ea4] transition-colors">Vizag</a>
            <a href="#faq" className="hover:text-[#087ea4] transition-colors">FAQ</a>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              id="header-client-login-btn"
              onClick={onClientLogin}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-[#bcd8e2] text-[#087ea4] bg-white hover:bg-[#f0f9fc] font-bold text-xs sm:text-sm transition-all shadow-xs"
            >
              <Building2 className="w-4 h-4 text-[#087ea4]" />
              <span>Client Login</span>
            </button>

            <a
              href="#partner"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#087ea4] hover:bg-[#075f7d] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#087ea4]/20 transition-all hover:-translate-y-0.5"
            >
              <span>Partner With Us</span>
            </a>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-[#087ea4] rounded-lg border border-slate-200"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-[#dceaf0] px-4 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-2">
            <div className="flex flex-col space-y-2 text-sm font-semibold text-[#3f5b6a]">
              <a
                href="#how"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-[#f0f9fc] rounded-lg"
              >
                How It Works
              </a>
              <a
                href="#services"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-[#f0f9fc] rounded-lg"
              >
                Services
              </a>
              <a
                href="#labs"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-[#f0f9fc] rounded-lg"
              >
                For Labs
              </a>
              <a
                href="#vizag"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-[#f0f9fc] rounded-lg"
              >
                Vizag Launch
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-[#f0f9fc] rounded-lg"
              >
                FAQ
              </a>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onClientLogin();
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-[#bcd8e2] text-[#087ea4] font-bold text-sm bg-white hover:bg-[#f0f9fc] flex items-center justify-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                <span>Client Login (Diagnostic Labs)</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onPhlebotomistLogin();
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-teal-200 text-teal-700 font-bold text-sm bg-teal-50 hover:bg-teal-100 flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Phlebotomist Login</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main id="home">
        
        {/* HERO SECTION */}
        <section className="relative bg-[radial-gradient(circle_at_90%_15%,rgba(22,166,160,0.16),transparent_30%),radial-gradient(circle_at_10%_20%,rgba(8,126,164,0.12),transparent_30%),linear-gradient(180deg,#f7fdff_0%,#ffffff_100%)] py-16 sm:py-20 lg:py-24 overflow-hidden border-b border-[#dceaf0]/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-14 items-center">
            
            {/* Left Column: Headline & Action */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8f7fa] text-[#087ea4] font-extrabold text-xs uppercase tracking-wider border border-[#bde6e4]/60">
                <Sparkles className="w-3.5 h-3.5 text-[#087ea4]" />
                <span>B2B PHLEBOTOMY SUPPORT • VIZAG</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#123044] tracking-tight leading-[1.06]">
                Your Home Collection Orders.<br />
                <span className="text-[#087ea4]">Our Phlebotomists.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#607585] leading-relaxed max-w-xl">
                SecondMedic helps diagnostic labs serve more home-collection orders with trained phlebotomy support, simple online booking and operational coordination.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#partner"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#087ea4] hover:bg-[#075f7d] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#087ea4]/25 transition-all hover:-translate-y-0.5"
                >
                  <span>Partner With SecondMedic</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href="#how"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-[#bcd8e2] text-[#087ea4] bg-white hover:bg-[#f0f9fc] font-bold text-sm sm:text-base transition-all shadow-xs"
                >
                  <span>See How It Works</span>
                </a>
              </div>

              {/* Trust Checkmarks */}
              <div className="flex flex-wrap gap-4 sm:gap-6 pt-4 text-xs sm:text-sm font-semibold text-[#55717f]">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Built for diagnostic businesses
                </span>
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Digital client booking
                </span>
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Vizag launch
                </span>
              </div>
            </div>

            {/* Right Column: Hero Interactive Workflow Card */}
            <div className="relative">
              <div className="bg-white border border-[#dceaf0] rounded-3xl p-6 sm:p-7 shadow-[0_18px_50px_rgba(12,61,83,0.10)] relative">
                <div className="flex items-center justify-between mb-5">
                  <div className="font-extrabold text-base sm:text-lg text-[#123044] flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#087ea4]" />
                    <span>Collection workflow</span>
                  </div>
                  <span className="text-xs font-extrabold text-[#16866e] bg-[#e8faf4] px-3 py-1 rounded-full border border-emerald-200">
                    Live workflow
                  </span>
                </div>

                {/* Workflow steps */}
                <div className="space-y-3">
                  
                  {/* Step 1 */}
                  <div className="grid grid-cols-[40px_1fr_auto] gap-3 items-center p-3.5 rounded-2xl border border-[#e3eef2] bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-[#e9f8fb] text-[#087ea4] font-black text-sm grid place-items-center">
                      01
                    </div>
                    <div>
                      <strong className="block text-xs sm:text-sm font-bold text-[#123044]">Client creates booking</strong>
                      <small className="text-[#7b8d98] text-[11px] sm:text-xs">Patient, address & slot</small>
                    </div>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      Created
                    </span>
                  </div>

                  {/* Step 2 */}
                  <div className="grid grid-cols-[40px_1fr_auto] gap-3 items-center p-3.5 rounded-2xl border border-[#e3eef2] bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-[#e9f8fb] text-[#087ea4] font-black text-sm grid place-items-center">
                      02
                    </div>
                    <div>
                      <strong className="block text-xs sm:text-sm font-bold text-[#123044]">Phlebotomist assigned</strong>
                      <small className="text-[#7b8d98] text-[11px] sm:text-xs">Based on availability & serviceability</small>
                    </div>
                    <span className="text-[11px] font-bold text-[#087ea4] bg-[#e8f7fa] px-2.5 py-1 rounded-lg border border-[#bcd8e2]">
                      Assigned
                    </span>
                  </div>

                  {/* Step 3 */}
                  <div className="grid grid-cols-[40px_1fr_auto] gap-3 items-center p-3.5 rounded-2xl border border-[#e3eef2] bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-[#e9f8fb] text-[#087ea4] font-black text-sm grid place-items-center">
                      03
                    </div>
                    <div>
                      <strong className="block text-xs sm:text-sm font-bold text-[#123044]">Sample collected</strong>
                      <small className="text-[#7b8d98] text-[11px] sm:text-xs">Collection completed at home</small>
                    </div>
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                      In progress
                    </span>
                  </div>

                  {/* Step 4 */}
                  <div className="grid grid-cols-[40px_1fr_auto] gap-3 items-center p-3.5 rounded-2xl border border-[#e3eef2] bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-[#e9f8fb] text-[#087ea4] font-black text-sm grid place-items-center">
                      04
                    </div>
                    <div>
                      <strong className="block text-xs sm:text-sm font-bold text-[#123044]">Booking completed</strong>
                      <small className="text-[#7b8d98] text-[11px] sm:text-xs">Status available to the client</small>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      Done
                    </span>
                  </div>
                </div>

                {/* Floating Metric Badge */}
                <div className="mt-5 p-3.5 bg-gradient-to-r from-[#eefbfc] to-[#f8fffe] border border-[#bde6e4] rounded-2xl flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#55717f]">Operational Advantage:</span>
                  <span className="text-xs font-bold text-[#087ea4]">
                    Less hiring. More collection capacity.
                  </span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* TRUST BANNER */}
        <div className="py-5 border-y border-[#dceaf0] bg-[#fcfdfe]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-around gap-4 text-xs sm:text-sm font-bold text-[#55717f]">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              Trained Phlebotomy Network
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              Easy Online Booking
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              Operations Support
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              Serviceability-Based Assignment
            </span>
          </div>
        </div>

        {/* FOR DIAGNOSTIC LABS / PROBLEM SECTION */}
        <section id="labs" className="py-20 bg-[#f6fbfd]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            
            <div className="max-w-2xl mx-auto text-center mb-12">
              <div className="inline-block px-3 py-1 rounded-full bg-[#e8f7fa] text-[#087ea4] font-extrabold text-xs uppercase tracking-wider mb-3">
                FOR DIAGNOSTIC LABS
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#123044] tracking-tight mb-4">
                Home collection is easy to sell. Finding the right phlebotomist is the hard part.
              </h2>
              <p className="text-base text-[#607585]">
                When demand grows, staff shortages, travel time and last-minute gaps can turn a good home-collection opportunity into a missed order.
              </p>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              
              {/* Without Support */}
              <div className="bg-white border border-[#dceaf0] rounded-3xl p-7 shadow-sm space-y-4">
                <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
                  <X className="w-5 h-5 text-rose-500" />
                  <span>Without flexible phlebotomy support</span>
                </h3>
                <ul className="space-y-3 text-sm text-[#536d7b]">
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-black">✕</span>
                    <span>More pressure on your existing team</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-black">✕</span>
                    <span>Difficulty covering additional areas</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-black">✕</span>
                    <span>Last-minute replacement coordination</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-black">✕</span>
                    <span>More fixed staffing requirements</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-black">✕</span>
                    <span>Missed home-collection opportunities</span>
                  </li>
                </ul>
              </div>

              {/* With SecondMedic */}
              <div className="bg-gradient-to-br from-[#eefbfc] to-[#f8fffe] border border-[#bde6e4] rounded-3xl p-7 shadow-sm space-y-4">
                <h3 className="font-extrabold text-lg text-[#087ea4] flex items-center gap-2">
                  <Check className="w-5 h-5 text-[#13a087]" />
                  <span>With SecondMedic</span>
                </h3>
                <ul className="space-y-3 text-sm text-[#536d7b]">
                  <li className="flex items-start gap-2.5 font-medium">
                    <span className="text-[#13a087] font-black">✓</span>
                    <span>Request a phlebotomist when needed</span>
                  </li>
                  <li className="flex items-start gap-2.5 font-medium">
                    <span className="text-[#13a087] font-black">✓</span>
                    <span>Create bookings online</span>
                  </li>
                  <li className="flex items-start gap-2.5 font-medium">
                    <span className="text-[#13a087] font-black">✓</span>
                    <span>Assignment based on serviceability</span>
                  </li>
                  <li className="flex items-start gap-2.5 font-medium">
                    <span className="text-[#13a087] font-black">✓</span>
                    <span>Track booking progress in real time</span>
                  </li>
                  <li className="flex items-start gap-2.5 font-medium">
                    <span className="text-[#13a087] font-black">✓</span>
                    <span>Scale collection capacity as demand grows</span>
                  </li>
                </ul>
              </div>

            </div>

          </div>
        </section>

        {/* OUR SOLUTION / SERVICES SECTION */}
        <section id="services" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            
            <div className="max-w-2xl mx-auto text-center mb-14">
              <div className="inline-block px-3 py-1 rounded-full bg-[#e8f7fa] text-[#087ea4] font-extrabold text-xs uppercase tracking-wider mb-3">
                OUR SOLUTION
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#123044] tracking-tight mb-4">
                Phlebotomy support built around your lab.
              </h2>
              <p className="text-base text-[#607585]">
                Use SecondMedic when you need additional collection capacity without building a larger permanent field team.
              </p>
            </div>

            {/* 4 Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card 1 */}
              <div className="bg-white border border-[#dceaf0] rounded-3xl p-6 shadow-sm hover:shadow-[0_18px_50px_rgba(12,61,83,0.10)] hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-[#eaf8fb] text-[#087ea4] flex items-center justify-center mb-4">
                  <Home className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-[#123044] mb-2">On-Demand Collection</h3>
                <p className="text-sm text-[#607585] leading-relaxed">
                  Request phlebotomy support for home sample collection requirements.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white border border-[#dceaf0] rounded-3xl p-6 shadow-sm hover:shadow-[0_18px_50px_rgba(12,61,83,0.10)] hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-[#eaf8fb] text-[#087ea4] flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-[#123044] mb-2">Peak-Time Support</h3>
                <p className="text-sm text-[#607585] leading-relaxed">
                  Add collection capacity when your regular team is overloaded.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white border border-[#dceaf0] rounded-3xl p-6 shadow-sm hover:shadow-[0_18px_50px_rgba(12,61,83,0.10)] hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-[#eaf8fb] text-[#087ea4] flex items-center justify-center mb-4">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-[#123044] mb-2">Coverage Support</h3>
                <p className="text-sm text-[#607585] leading-relaxed">
                  Extend your operational reach to serviceable areas around your lab.
                </p>
              </div>

              {/* Card 4 */}
              <div className="bg-white border border-[#dceaf0] rounded-3xl p-6 shadow-sm hover:shadow-[0_18px_50px_rgba(12,61,83,0.10)] hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-[#eaf8fb] text-[#087ea4] flex items-center justify-center mb-4">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-[#123044] mb-2">Replacement Support</h3>
                <p className="text-sm text-[#607585] leading-relaxed">
                  Reduce disruption when your regular phlebotomist is unavailable.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how" className="py-20 bg-[#f6fbfd]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            
            <div className="max-w-2xl mx-auto text-center mb-14">
              <div className="inline-block px-3 py-1 rounded-full bg-[#e8f7fa] text-[#087ea4] font-extrabold text-xs uppercase tracking-wider mb-3">
                HOW IT WORKS
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#123044] tracking-tight mb-4">
                From lab request to completed collection.
              </h2>
              <p className="text-base text-[#607585]">
                A simple digital workflow for diagnostic businesses.
              </p>
            </div>

            {/* 4 Steps Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Step 1 */}
              <div className="bg-white border border-[#dceaf0] rounded-3xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-[#087ea4] text-white flex items-center justify-center font-extrabold text-lg mb-5 shadow-md shadow-[#087ea4]/20">
                  01
                </div>
                <h3 className="font-bold text-lg text-[#123044] mb-2">Client Onboards</h3>
                <p className="text-sm text-[#607585] leading-relaxed">
                  Register your diagnostic business and share your service requirements.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white border border-[#dceaf0] rounded-3xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-[#087ea4] text-white flex items-center justify-center font-extrabold text-lg mb-5 shadow-md shadow-[#087ea4]/20">
                  02
                </div>
                <h3 className="font-bold text-lg text-[#123044] mb-2">Create Booking</h3>
                <p className="text-sm text-[#607585] leading-relaxed">
                  Login and enter patient, address, date and collection details.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white border border-[#dceaf0] rounded-3xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-[#087ea4] text-white flex items-center justify-center font-extrabold text-lg mb-5 shadow-md shadow-[#087ea4]/20">
                  03
                </div>
                <h3 className="font-bold text-lg text-[#123044] mb-2">Phlebotomist Assigned</h3>
                <p className="text-sm text-[#607585] leading-relaxed">
                  Our operations workflow assigns an available collector based on serviceability.
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-white border border-[#dceaf0] rounded-3xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-[#087ea4] text-white flex items-center justify-center font-extrabold text-lg mb-5 shadow-md shadow-[#087ea4]/20">
                  04
                </div>
                <h3 className="font-bold text-lg text-[#123044] mb-2">Collection Completed</h3>
                <p className="text-sm text-[#607585] leading-relaxed">
                  The booking status is updated so your team can follow the order.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* VIZAG LAUNCH SECTION */}
        <section id="vizag" className="py-20 bg-gradient-to-br from-[#073b52] to-[#087ea4] text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            
            <div className="max-w-2xl mx-auto text-center mb-14">
              <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 font-extrabold text-xs uppercase tracking-wider mb-3">
                VIZAG LAUNCH
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                Need a phlebotomist for your diagnostic lab in Vizag?
              </h2>
              <p className="text-base text-[#d7eef5]">
                SecondMedic is starting with Visakhapatnam and will expand city by city as the network grows.
              </p>
            </div>

            {/* 3 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-white/10 border border-white/15 rounded-3xl p-6 backdrop-blur-xs">
                <div className="w-10 h-10 rounded-xl bg-white/15 text-white font-extrabold flex items-center justify-center mb-4">
                  01
                </div>
                <h3 className="font-bold text-lg text-white mb-2">Local-first coverage</h3>
                <p className="text-sm text-[#d7eef5] leading-relaxed">
                  Start with serviceable areas in Vizag and expand coverage as demand grows.
                </p>
              </div>

              <div className="bg-white/10 border border-white/15 rounded-3xl p-6 backdrop-blur-xs">
                <div className="w-10 h-10 rounded-xl bg-white/15 text-white font-extrabold flex items-center justify-center mb-4">
                  02
                </div>
                <h3 className="font-bold text-lg text-white mb-2">Lab-focused model</h3>
                <p className="text-sm text-[#d7eef5] leading-relaxed">
                  Our primary customer is the diagnostic business—not random patient traffic.
                </p>
              </div>

              <div className="bg-white/10 border border-white/15 rounded-3xl p-6 backdrop-blur-xs">
                <div className="w-10 h-10 rounded-xl bg-white/15 text-white font-extrabold flex items-center justify-center mb-4">
                  03
                </div>
                <h3 className="font-bold text-lg text-white mb-2">Scale city by city</h3>
                <p className="text-sm text-[#d7eef5] leading-relaxed">
                  Build a strong local network first, then replicate the operating model in new cities.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* PARTNER WITH US SECTION */}
        <section id="partner" className="py-20 bg-[#f6fbfd]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-12 items-start">
            
            {/* Left Column: Partner Information & Direct Login Buttons */}
            <div className="space-y-6">
              <div className="inline-block px-3 py-1 rounded-full bg-[#e8f7fa] text-[#087ea4] font-extrabold text-xs uppercase tracking-wider">
                PARTNER WITH US
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#123044] tracking-tight leading-tight">
                Grow your home collection service without hiring a full field team.
              </h2>

              <p className="text-[#607585] text-base leading-relaxed">
                Tell us about your diagnostic business. Our team can review your requirement, confirm serviceability and help you get started.
              </p>

              <ul className="space-y-3 text-sm text-[#536d7b] font-medium">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Designed for small and growing diagnostic labs</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Client login and digital booking workflow</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Phlebotomist assignment through operations</span>
                </li>
              </ul>

              {/* Login Routing Buttons */}
              <div id="login" className="pt-4 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Already Registered? Access Internal Portals:
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    id="partner-client-login-btn"
                    onClick={onClientLogin}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-[#087ea4] text-[#087ea4] bg-white hover:bg-[#f0f9fc] font-bold text-sm transition-all shadow-xs"
                  >
                    <Building2 className="w-4 h-4 text-[#087ea4]" />
                    <span>Client Login →</span>
                  </button>

                  <button
                    id="partner-phlebo-login-btn"
                    onClick={onPhlebotomistLogin}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-teal-300 text-teal-800 bg-teal-50 hover:bg-teal-100 font-bold text-sm transition-all shadow-xs"
                  >
                    <UserCheck className="w-4 h-4 text-teal-700" />
                    <span>Phlebotomist Login</span>
                  </button>

                  {onAdminLogin && (
                    <button
                      onClick={onAdminLogin}
                      className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 font-bold text-xs transition-all"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                      <span>Ops Login</span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-[#78909c]">
                  Client login directs to your dedicated Lab Dashboard. Phlebotomist login connects to the duty console.
                </p>
              </div>
            </div>

            {/* Right Column: Partnership Request Form */}
            <div className="bg-white border border-[#dceaf0] rounded-3xl p-6 sm:p-8 shadow-[0_18px_50px_rgba(12,61,83,0.10)]">
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#123044] mb-1">
                Request a partnership call
              </h3>
              <p className="text-xs sm:text-sm text-[#607585] mb-6">
                For diagnostic labs, clinics and healthcare businesses.
              </p>

              {submitSuccess ? (
                <div className="p-6 bg-[#ecfbf5] border border-[#bce8d8] rounded-2xl text-[#146b57] space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-base">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Thank you — your partnership request has been received!</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#146b57]">
                    Our onboarding team will review your business details and contact you for sample fulfillment setup.
                  </p>
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    className="mt-3 text-xs font-bold text-[#087ea4] underline hover:text-[#075f7d]"
                  >
                    Submit another request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <div>
                      <label className="block text-xs font-bold text-[#395563] mb-1.5">
                        Business Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.business}
                        onChange={e => setFormData({ ...formData, business: e.target.value })}
                        placeholder="e.g. Vijaya Diagnostics"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#cfe1e8] text-sm text-[#123044] focus:outline-hidden focus:border-[#087ea4] focus:ring-1 focus:ring-[#087ea4]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#395563] mb-1.5">
                        Contact Person *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.contact}
                        onChange={e => setFormData({ ...formData, contact: e.target.value })}
                        placeholder="Your full name"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#cfe1e8] text-sm text-[#123044] focus:outline-hidden focus:border-[#087ea4] focus:ring-1 focus:ring-[#087ea4]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#395563] mb-1.5">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.mobile}
                        onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                        placeholder="10-digit mobile"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#cfe1e8] text-sm text-[#123044] focus:outline-hidden focus:border-[#087ea4] focus:ring-1 focus:ring-[#087ea4]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#395563] mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@lab.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#cfe1e8] text-sm text-[#123044] focus:outline-hidden focus:border-[#087ea4] focus:ring-1 focus:ring-[#087ea4]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#395563] mb-1.5">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Visakhapatnam"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#cfe1e8] text-sm text-[#123044] focus:outline-hidden focus:border-[#087ea4] focus:ring-1 focus:ring-[#087ea4]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#395563] mb-1.5">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.pincode}
                        onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                        placeholder="530002"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#cfe1e8] text-sm text-[#123044] focus:outline-hidden focus:border-[#087ea4] focus:ring-1 focus:ring-[#087ea4]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#395563] mb-1.5">
                        Business Type *
                      </label>
                      <select
                        required
                        value={formData.type}
                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#cfe1e8] text-sm text-[#123044] bg-white focus:outline-hidden focus:border-[#087ea4] focus:ring-1 focus:ring-[#087ea4]"
                      >
                        <option value="">Select Type</option>
                        <option value="Diagnostic Laboratory">Diagnostic Laboratory</option>
                        <option value="Pathology Lab">Pathology Lab</option>
                        <option value="Clinic">Clinic</option>
                        <option value="Hospital">Hospital</option>
                        <option value="Collection Centre">Collection Centre</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#395563] mb-1.5">
                        Monthly Home Collections
                      </label>
                      <select
                        value={formData.orders}
                        onChange={e => setFormData({ ...formData, orders: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#cfe1e8] text-sm text-[#123044] bg-white focus:outline-hidden focus:border-[#087ea4] focus:ring-1 focus:ring-[#087ea4]"
                      >
                        <option value="0–50">0–50</option>
                        <option value="50–100">50–100</option>
                        <option value="100–500">100–500</option>
                        <option value="500+">500+</option>
                      </select>
                    </div>

                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#395563] mb-1.5">
                      Tell us what support you need
                    </label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Service areas (e.g. MVP Colony, Gajuwaka), expected daily volume, urgent phlebotomy slots..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#cfe1e8] text-sm text-[#123044] focus:outline-hidden focus:border-[#087ea4] focus:ring-1 focus:ring-[#087ea4]"
                    ></textarea>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="agreed-check"
                      required
                      checked={formData.agreed}
                      onChange={e => setFormData({ ...formData, agreed: e.target.checked })}
                      className="rounded border-[#cfe1e8] text-[#087ea4] focus:ring-[#087ea4]"
                    />
                    <label htmlFor="agreed-check" className="text-xs text-[#395563] cursor-pointer">
                      I agree to be contacted by SecondMedic regarding phlebotomy partnership.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-6 rounded-xl bg-[#087ea4] hover:bg-[#075f7d] text-white font-bold text-sm shadow-md shadow-[#087ea4]/20 transition-all flex items-center justify-center gap-2"
                  >
                    <span>{isSubmitting ? 'Submitting...' : 'Submit Partnership Request →'}</span>
                  </button>
                </form>
              )}

              <p className="text-[11px] text-[#78909c] mt-3 text-center">
                Your information is held securely and used only for onboarding coordination.
              </p>
            </div>

          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            
            <div className="text-center mb-12">
              <div className="inline-block px-3 py-1 rounded-full bg-[#e8f7fa] text-[#087ea4] font-extrabold text-xs uppercase tracking-wider mb-3">
                FAQ
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#123044] tracking-tight">
                Questions diagnostic labs usually ask.
              </h2>
            </div>

            <div className="space-y-4">
              
              {/* FAQ 1 */}
              <div className="border-b border-[#dceaf0] pb-4">
                <button
                  onClick={() => toggleFaq(1)}
                  className="w-full text-left font-bold text-base text-[#123044] flex items-center justify-between gap-4 py-2 hover:text-[#087ea4]"
                >
                  <span>Who can partner with SecondMedic?</span>
                  {activeFaq === 1 ? <ChevronUp className="w-5 h-5 text-[#087ea4]" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                {activeFaq === 1 && (
                  <p className="text-sm text-[#607585] mt-2 leading-relaxed animate-in fade-in">
                    Diagnostic laboratories, pathology labs, clinics, hospitals, collection centres and other healthcare businesses that need phlebotomy support can enquire.
                  </p>
                )}
              </div>

              {/* FAQ 2 */}
              <div className="border-b border-[#dceaf0] pb-4">
                <button
                  onClick={() => toggleFaq(2)}
                  className="w-full text-left font-bold text-base text-[#123044] flex items-center justify-between gap-4 py-2 hover:text-[#087ea4]"
                >
                  <span>Do I need to hire the phlebotomist?</span>
                  {activeFaq === 2 ? <ChevronUp className="w-5 h-5 text-[#087ea4]" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                {activeFaq === 2 && (
                  <p className="text-sm text-[#607585] mt-2 leading-relaxed animate-in fade-in">
                    The service is designed to give your business access to phlebotomy support without requiring you to build a large permanent field team. Exact commercial and operational terms are confirmed during onboarding.
                  </p>
                )}
              </div>

              {/* FAQ 3 */}
              <div className="border-b border-[#dceaf0] pb-4">
                <button
                  onClick={() => toggleFaq(3)}
                  className="w-full text-left font-bold text-base text-[#123044] flex items-center justify-between gap-4 py-2 hover:text-[#087ea4]"
                >
                  <span>How do I request a phlebotomist?</span>
                  {activeFaq === 3 ? <ChevronUp className="w-5 h-5 text-[#087ea4]" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                {activeFaq === 3 && (
                  <p className="text-sm text-[#607585] mt-2 leading-relaxed animate-in fade-in">
                    After client onboarding and approval, use the client login to create a booking with the required patient, address and collection details.
                  </p>
                )}
              </div>

              {/* FAQ 4 */}
              <div className="border-b border-[#dceaf0] pb-4">
                <button
                  onClick={() => toggleFaq(4)}
                  className="w-full text-left font-bold text-base text-[#123044] flex items-center justify-between gap-4 py-2 hover:text-[#087ea4]"
                >
                  <span>Is SecondMedic available across Vizag?</span>
                  {activeFaq === 4 ? <ChevronUp className="w-5 h-5 text-[#087ea4]" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                {activeFaq === 4 && (
                  <p className="text-sm text-[#607585] mt-2 leading-relaxed animate-in fade-in">
                    Coverage depends on the active serviceable area and phlebotomist availability. Submit your pincode and our team can confirm serviceability.
                  </p>
                )}
              </div>

              {/* FAQ 5 */}
              <div className="border-b border-[#dceaf0] pb-4">
                <button
                  onClick={() => toggleFaq(5)}
                  className="w-full text-left font-bold text-base text-[#123044] flex items-center justify-between gap-4 py-2 hover:text-[#087ea4]"
                >
                  <span>Can a small diagnostic lab use the service?</span>
                  {activeFaq === 5 ? <ChevronUp className="w-5 h-5 text-[#087ea4]" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                {activeFaq === 5 && (
                  <p className="text-sm text-[#607585] mt-2 leading-relaxed animate-in fade-in">
                    Yes. The model is specifically designed to help small and growing diagnostic businesses add flexible collection capacity.
                  </p>
                )}
              </div>

            </div>

          </div>
        </section>

        {/* BOTTOM CTA BANNER */}
        <section className="py-12 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="bg-gradient-to-br from-[#eaf8fb] to-[#f4fffd] border border-[#c8e9ed] rounded-3xl p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123044] mb-2">
                  Have home-collection orders but need phlebotomy support?
                </h2>
                <p className="text-sm sm:text-base text-[#607585]">
                  Start with SecondMedic in Vizag.
                </p>
              </div>

              <a
                href="#partner"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#087ea4] hover:bg-[#075f7d] text-white font-bold text-sm sm:text-base shadow-md shadow-[#087ea4]/20 shrink-0 transition-all hover:-translate-y-0.5"
              >
                <span>Partner With Us →</span>
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-[#073b52] text-[#d4e9ef] pt-16 pb-8 border-t border-[#0b4b66]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <div className="bg-white/95 backdrop-blur-xs p-2.5 rounded-2xl inline-block shadow-sm">
              <SecondMedicLogo
                height={36}
                variant="light"
                showTagline={true}
              />
            </div>
            <p className="text-xs text-[#9fc0cb] leading-relaxed max-w-xs">
              On-demand phlebotomy support for diagnostic businesses. Starting in Vizag and expanding city by city.
            </p>
          </div>

          {/* Col 2: Solutions */}
          <div>
            <div className="font-bold text-white text-sm mb-3.5">Solutions</div>
            <div className="flex flex-col space-y-2 text-xs text-[#d4e9ef]">
              <a href="#services" className="hover:text-white transition-colors">On-Demand Phlebotomy</a>
              <a href="#services" className="hover:text-white transition-colors">Home Collection Support</a>
              <a href="#partner" className="hover:text-white transition-colors">Lab Partnership</a>
              <a href="#how" className="hover:text-white transition-colors">Client Booking</a>
            </div>
          </div>

          {/* Col 3: For Users */}
          <div>
            <div className="font-bold text-white text-sm mb-3.5">For Users</div>
            <div className="flex flex-col space-y-2 text-xs text-[#d4e9ef]">
              <button
                onClick={onClientLogin}
                className="text-left hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>Client Login</span>
              </button>
              <button
                onClick={onPhlebotomistLogin}
                className="text-left hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>Phlebotomist Login</span>
              </button>
              <a href="#partner" className="hover:text-white transition-colors">Partner With Us</a>
            </div>
          </div>

          {/* Col 4: Company */}
          <div>
            <div className="font-bold text-white text-sm mb-3.5">Company</div>
            <div className="flex flex-col space-y-2 text-xs text-[#d4e9ef]">
              <a href="#home" className="hover:text-white transition-colors">About SecondMedic</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
              <a href="#partner" className="hover:text-white transition-colors">Contact / Partnership</a>
            </div>
          </div>

        </div>

        {/* Copyright & Disclaimer */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#9fc0cb]">
          <span>© 2026 SecondMedic. All rights reserved.</span>
          <span>Built for diagnostic businesses in Visakhapatnam.</span>
        </div>
      </footer>

      {/* Floating WhatsApp Action Button */}
      <a
        id="whatsapp"
        href="#whatsapp"
        onClick={handleWhatsApp}
        className="fixed right-5 bottom-5 z-40 bg-[#1fba68] hover:bg-[#199d58] text-white rounded-full px-5 py-3 font-extrabold text-sm shadow-xl shadow-emerald-950/20 flex items-center gap-2 transition-all hover:scale-105"
        title="Chat with SecondMedic on WhatsApp"
      >
        <MessageSquare className="w-4 h-4 fill-white" />
        <span>WhatsApp Us</span>
      </a>

    </div>
  );
};
