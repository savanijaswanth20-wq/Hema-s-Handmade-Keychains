import React, { useState } from "react";
import { MapPin, MessageSquare, Instagram, Mail, Calendar, Sparkles, Send, CheckCircle } from "lucide-react";
import { AdminSettings } from "../types";

interface ContactSectionProps {
  upiSettings: AdminSettings;
}

export default function ContactSection({ upiSettings }: ContactSectionProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) return;

    // Simulate sending sketch/request
    setSuccess(true);
    setName("");
    setPhone("");
    setMessage("");

    setTimeout(() => {
      setSuccess(false);
    }, 4000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-12 transition-colors duration-300">
      
      {/* Banner Area */}
      <section className="glass-panel dark:bg-neutral-900 dark:border-neutral-800 p-8 rounded-3xl border border-pink-100/50 shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-pink-50 dark:bg-rose-950/30 text-brand-rose flex items-center justify-center mx-auto shadow-inner">
          <Mail className="w-5 h-5" />
        </div>

        <div className="space-y-1.5">
          <h3 className="font-serif text-3xl font-bold text-gray-950 dark:text-white">Get in Touch with Hema</h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
            Order custom characters, inquire about bulk rates, or schedule a physical pickup.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* Contact info cards */}
        <div className="space-y-6">
          
          <div className="glass-panel bg-[#FFF0F2]/85 dark:bg-[#2D161B]/40 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-pink-200/40 dark:border-neutral-800 flex flex-col justify-between text-left space-y-6 h-full shadow-sm">
            <div className="space-y-4">
              <h4 className="font-serif text-2xl font-bold text-gray-900 dark:text-white">
                {upiSettings.businessName || "CuteCharm Keychains"}
              </h4>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-semibold">
                I operate an independent studio workshop in Marathahalli outer ring road. I'm active on WhatsApp throughout the day for custom design consultations, baking updates, and bulk wedding/birthday order arrangements.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-brand-mint shrink-0">
                  <MessageSquare className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">WhatsApp support</span>
                  <strong className="text-xs sm:text-sm text-gray-900 dark:text-white">{upiSettings.whatsappNumber || "+91 9640653603"}</strong>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-50 dark:bg-pink-950/30 flex items-center justify-center text-brand-rose shrink-0">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">Instagram Handle</span>
                  <strong className="text-xs sm:text-sm text-gray-900 dark:text-white">@{(upiSettings.instagramId || "hemas_tiny_universe").replace(/^@/, "")}</strong>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">Studio address</span>
                  <strong className="text-xs sm:text-sm text-gray-900 dark:text-white font-serif">Outer Ring Road, Marathahalli, Bengaluru, Karnataka 560037</strong>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center text-purple-600 shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">Studio pickup timing</span>
                  <strong className="text-xs sm:text-sm text-gray-900 dark:text-white">Daily 11:00 AM to 08:30 PM (Prior notice needed!)</strong>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <a
                href={`https://wa.me/${(upiSettings.whatsappNumber || "9640653603").replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 bg-brand-mint text-white font-bold rounded-xl text-xs sm:text-sm text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 fill-current" /> WhatsApp Chat
              </a>
              <a
                href={`https://instagram.com/${(upiSettings.instagramId || "hemas_tiny_universe").replace(/^@/, "")}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 bg-pink-600 text-white font-bold rounded-xl text-xs sm:text-sm text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <Instagram className="w-4 h-4" /> Instagram Feed
              </a>
            </div>

          </div>

        </div>

        {/* Custom sketch / Contact request form */}
        <div className="glass-panel bg-[#FFF0F2]/85 dark:bg-[#2D161B]/40 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-pink-200/40 dark:border-neutral-800 flex flex-col justify-between text-left shadow-sm">
          
          <div className="space-y-4 mb-4">
            <h4 className="font-serif text-2xl font-bold text-gray-900 dark:text-white">Submit Design Request</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Describe your dream keychain. Mention initials, animal shapes, background colors or reference images.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col justify-between bg-white/65 dark:bg-neutral-950/35 p-4 sm:p-5 rounded-2xl border border-pink-200/30">
            {success ? (
              <div className="p-6 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-2xl text-center space-y-3 flex-1 flex flex-col items-center justify-center animate-pulse">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
                <h5 className="font-serif text-lg font-bold text-emerald-800 dark:text-emerald-300">Request Registered!</h5>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold leading-relaxed uppercase">
                  Hema will contact you on WhatsApp with a sketch preview and custom clay quotation within 1 hour!
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Your Full Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Sowmya Reddy"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm bg-white dark:bg-neutral-950 dark:text-white rounded-xl border border-pink-100 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#E04B73] font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">WhatsApp Phone Number *</label>
                      <input
                        type="tel"
                        placeholder="10-digit mobile number"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm bg-white dark:bg-neutral-950 dark:text-white rounded-xl border border-pink-100 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#E04B73] font-medium font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Customization Details & Inscription Names *</label>
                    <textarea
                      placeholder="e.g., I want a cute pink bunny holding a golden 'S' initial tag, glazed gloss."
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-white dark:bg-neutral-950 dark:text-white rounded-xl border border-pink-100 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#E04B73] font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#E04B73] hover:bg-[#C23055] text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Send className="w-4 h-4" /> Send Request to Hema
                </button>
              </>
            )}
          </form>

        </div>

      </div>

    </div>
  );
}
