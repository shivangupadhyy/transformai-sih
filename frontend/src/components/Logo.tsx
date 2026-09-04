export function Logo() {
  return (
    <a className="brand-logo" href="/" aria-label="TransformAI Home">
      <div className="logo-icon-wrap" aria-hidden="true">
        <svg
          width="28"
          height="28"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="logo-svg"
        >
          {/* Source node */}
          <circle cx="6" cy="16" r="4.5" fill="#6366f1" />
          <circle cx="6" cy="16" r="2" fill="#ffffff" />

          {/* Radiating branches to 4 publication formats */}
          <path
            d="M10.5 16 C 16 16, 17 7, 23 7"
            stroke="url(#gradient-cyan)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M10.5 16 C 16 16, 17 13, 23 13"
            stroke="url(#gradient-indigo)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M10.5 16 C 16 16, 17 19, 23 19"
            stroke="url(#gradient-purple)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M10.5 16 C 16 16, 17 25, 23 25"
            stroke="url(#gradient-emerald)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* 4 destination format pills */}
          <rect x="23" y="5" width="6" height="4" rx="1.5" fill="#38bdf8" />
          <rect x="23" y="11" width="6" height="4" rx="1.5" fill="#818cf8" />
          <rect x="23" y="17" width="6" height="4" rx="1.5" fill="#c084fc" />
          <rect x="23" y="23" width="6" height="4" rx="1.5" fill="#34d399" />

          <defs>
            <linearGradient id="gradient-cyan" x1="10" y1="16" x2="24" y2="7" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366f1" />
              <stop offset="1" stopColor="#38bdf8" />
            </linearGradient>
            <linearGradient id="gradient-indigo" x1="10" y1="16" x2="24" y2="13" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366f1" />
              <stop offset="1" stopColor="#818cf8" />
            </linearGradient>
            <linearGradient id="gradient-purple" x1="10" y1="16" x2="24" y2="19" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366f1" />
              <stop offset="1" stopColor="#c084fc" />
            </linearGradient>
            <linearGradient id="gradient-emerald" x1="10" y1="16" x2="24" y2="25" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366f1" />
              <stop offset="1" stopColor="#34d399" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="logo-text-group">
        <span className="logo-main-text">Transform<span className="logo-accent-text">AI</span></span>
        <span className="logo-tagline">Source → Publication</span>
      </div>
    </a>
  );
}
