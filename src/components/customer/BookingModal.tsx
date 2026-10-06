'use client';

import React, { useState, useEffect } from 'react';
import { useCafe } from '@/context/CafeContext';
import { X, Calendar, Clock, Users, Phone, User, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose }) => {
  const { config, addBooking } = useCafe();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('19:00');
  const [guests, setGuests] = useState('2');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Anti-Spam Protections
  const [honeypot, setHoneypot] = useState(''); // Hidden bot trap
  const [numA, setNumA] = useState(3);
  const [numB, setNumB] = useState(4);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate random math challenge whenever modal opens
  useEffect(() => {
    if (isOpen) {
      const a = Math.floor(Math.random() * 8) + 2;
      const b = Math.floor(Math.random() * 7) + 1;
      setNumA(a);
      setNumB(b);
      setCaptchaAnswer('');
      setCaptchaError(null);
      setRateLimitError(null);
      setIsSubmitting(false);

      // Check client-side rate limit (max 3 bookings in 1 hour)
      try {
        const historyRaw = localStorage.getItem('cafe_booking_timestamps');
        if (historyRaw) {
          const timestamps: number[] = JSON.parse(historyRaw);
          const oneHourAgo = Date.now() - 3600000;
          const recentAttempts = timestamps.filter((t) => t > oneHourAgo);
          if (recentAttempts.length >= 3) {
            setRateLimitError('Reservation limit reached (max 3 requests/hour). Please call the cafe directly.');
          }
        }
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Honeypot check: If bot filled hidden input, silently discard
    if (honeypot.trim()) {
      setIsSuccess(true);
      return;
    }

    // 2. Rate limit check
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    let recentAttempts: number[] = [];
    try {
      const historyRaw = localStorage.getItem('cafe_booking_timestamps');
      if (historyRaw) {
        const timestamps: number[] = JSON.parse(historyRaw);
        recentAttempts = timestamps.filter((t) => t > oneHourAgo);
      }
    } catch {}

    if (recentAttempts.length >= 3) {
      setRateLimitError('Rate limit exceeded: You have submitted 3 requests in the last hour. Please call our team directly.');
      return;
    }

    // 3. Captcha challenge check
    if (parseInt(captchaAnswer.trim(), 10) !== numA + numB) {
      setCaptchaError(`Incorrect security answer. Please solve: ${numA} + ${numB} = ?`);
      return;
    }

    if (!name.trim() || !phone.trim() || !date) return;

    setIsSubmitting(true);

    // Save timestamp for rate-limiting
    try {
      const updatedTimestamps = [...recentAttempts, now];
      localStorage.setItem('cafe_booking_timestamps', JSON.stringify(updatedTimestamps));
    } catch {}

    // Record booking in cafe context
    addBooking({
      customerName: name.trim(),
      customerPhone: phone.trim(),
      date,
      time,
      guestCount: parseInt(guests, 10) || 2,
      specialNotes: notes.trim() || undefined,
    });

    // Send WhatsApp reservation notification
    const cleanNumber = config.contact.whatsappNumber.replace(/[^0-9]/g, '');
    const bookingMsg = `*TABLE RESERVATION REQUEST - ${config.name.toUpperCase()}*\n` +
      `👤 *Name:* ${name.trim()}\n` +
      `📞 *Phone:* ${phone.trim()}\n` +
      `📅 *Date:* ${date}\n` +
      `⏰ *Time:* ${time}\n` +
      `👥 *Guests:* ${guests}\n` +
      (notes.trim() ? `📝 *Notes:* ${notes.trim()}\n` : '') +
      `\n_Please confirm availability._`;

    const encoded = encodeURIComponent(bookingMsg);
    window.open(`https://wa.me/${cleanNumber}?text=${encoded}`, '_blank');

    setIsSuccess(true);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-stone-950/75 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-stone-200 dark:border-stone-800 z-10">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-white">Reserve a Table</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">Enjoy priority seating at {config.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-stone-900 dark:text-white">Reservation Request Sent!</h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
              We have forwarded your table reservation details to the cafe team on WhatsApp for confirmation.
            </p>
            <button
              onClick={() => {
                setIsSuccess(false);
                onClose();
              }}
              className="mt-4 px-6 py-2 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
            {/* Rate limit warning banner */}
            {rateLimitError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{rateLimitError}</span>
              </div>
            )}

            {/* Honeypot field (hidden from genuine users, traps automated bots) */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="hp_website">Leave empty</label>
              <input
                id="hp_website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            {/* Name */}
            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Your Full Name *
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ananya Sharma"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                WhatsApp Phone Number *
              </label>
              <div className="relative flex items-center">
                <Phone className="absolute left-3 w-4 h-4 text-stone-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">Date *</label>
                <div className="relative flex items-center">
                  <Calendar className="absolute left-3 w-4 h-4 text-stone-400 pointer-events-none" />
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-9 pr-2 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">Time</label>
                <div className="relative flex items-center">
                  <Clock className="absolute left-3 w-4 h-4 text-stone-400 pointer-events-none" />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full pl-9 pr-2 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Number of Guests */}
            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">Guests</label>
              <div className="relative flex items-center">
                <Users className="absolute left-3 w-4 h-4 text-stone-400 pointer-events-none" />
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="1">1 Person (Solo)</option>
                  <option value="2">2 People (Pair)</option>
                  <option value="3">3 People</option>
                  <option value="4">4 People</option>
                  <option value="5">5 - 8 People (Group)</option>
                  <option value="9">8+ People (Party / Event)</option>
                </select>
              </div>
            </div>

            {/* Special Request */}
            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Special Requests / Occasion
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Birthday celebration, outdoor seating preference..."
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Bot Defense Security Challenge */}
            <div className="p-3 bg-stone-100 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Security Check: {numA} + {numB} = ?</span>
                </label>
                <span className="text-[10px] text-stone-400 font-mono">Anti-Spam</span>
              </div>
              <input
                type="number"
                required
                value={captchaAnswer}
                onChange={(e) => {
                  setCaptchaAnswer(e.target.value);
                  setCaptchaError(null);
                }}
                placeholder="Enter sum"
                className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
              {captchaError && (
                <p className="text-[10px] text-rose-500 font-medium">{captchaError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !!rateLimitError}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 active:scale-98 text-stone-950 font-bold text-xs rounded-xl shadow-md transition-all mt-2"
            >
              {isSubmitting ? 'Verifying...' : 'Request Table via WhatsApp'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
