'use client';

import React, { useState } from 'react';
import { useCafe } from '@/context/CafeContext';
import { X, MapPin, Wifi, Clock, Phone, Copy, Check, Navigation } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  const { config } = useCafe();
  const [copiedWifi, setCopiedWifi] = useState(false);

  if (!isOpen) return null;

  const copyWifiPassword = () => {
    if (config.contact.wifiPassword) {
      navigator.clipboard.writeText(config.contact.wifiPassword);
      setCopiedWifi(true);
      setTimeout(() => setCopiedWifi(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-stone-950/75 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-stone-200 dark:border-stone-800 z-10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <span className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg">
              <MapPin className="w-4 h-4" />
            </span>
            Location & Cafe Info
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Address & Navigation */}
        <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700/60 space-y-2.5 text-xs">
          <div className="font-semibold text-stone-900 dark:text-stone-200 flex items-start gap-2">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{config.contact.address}</span>
          </div>
          <a
            href={config.contact.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Open in Google Maps</span>
          </a>
        </div>

        {/* Operating Timings */}
        <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700/60 space-y-1 text-xs">
          <div className="font-bold text-stone-900 dark:text-stone-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Operating Hours</span>
          </div>
          <div className="pl-6 text-stone-600 dark:text-stone-400">
            <div>{config.hours.daysDescription}</div>
            <div className="font-semibold text-stone-800 dark:text-stone-200">
              {config.hours.openingTime} to {config.hours.closingTime}
            </div>
          </div>
        </div>

        {/* Free Guest Wi-Fi */}
        {config.contact.wifiName && (
          <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                <Wifi className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-stone-900 dark:text-white">Guest Wi-Fi</div>
                <div className="text-stone-500 dark:text-stone-400 text-[11px]">
                  SSID: <span className="font-medium text-stone-800 dark:text-stone-200">{config.contact.wifiName}</span>
                </div>
              </div>
            </div>
            <button
              onClick={copyWifiPassword}
              className="px-2.5 py-1.5 bg-white dark:bg-stone-700 hover:bg-stone-100 text-stone-800 dark:text-stone-100 border border-stone-300 dark:border-stone-600 rounded-lg font-medium flex items-center gap-1 shadow-2xs"
            >
              {copiedWifi ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[11px] text-emerald-600 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-500" />
                  <span className="text-[11px]">Copy Key</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Action Row */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <a
            href={`tel:${config.contact.phone}`}
            className="py-2.5 px-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-900 dark:text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-stone-200 dark:border-stone-700"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-500" />
            <span>Call Staff</span>
          </a>

          {config.contact.instagramUrl && (
            <a
              href={config.contact.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-amber-500/10 hover:from-purple-500/20 text-stone-900 dark:text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-pink-500/20"
            >
              <svg className="w-3.5 h-3.5 fill-pink-500" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>Instagram</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
