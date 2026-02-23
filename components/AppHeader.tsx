"use client";

interface AppHeaderProps {
  /** If provided, renders a back chevron button */
  onBack?: () => void;
}

/**
 * Fixed top header, consistent across all app pages.
 * Pass `onBack` to show a back chevron; omit it for pages without back navigation.
 */
export default function AppHeader({ onBack }: AppHeaderProps) {
  return (
    <header
      className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40"
      style={{ backgroundColor: "#003D99" }}
    >
      <div className="flex items-center px-3 py-3 gap-2">
        {/* Back button or spacer */}
        {onBack ? (
          <button
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
            aria-label="Kembali"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        ) : (
          <div className="w-9 h-9 flex-shrink-0" />
        )}

        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://www.vcgamers.com/image/vcg-logo.svg"
          alt="WhuzPay"
          className="h-7 w-auto object-contain flex-shrink-0"
        />

        <div className="flex-1" />

        {/* Right icons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Chat / CS */}
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            aria-label="Customer Service"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
          {/* Bell */}
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            aria-label="Notifikasi"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
