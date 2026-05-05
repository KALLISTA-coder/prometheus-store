import React from 'react';
import { Menu, X, MapPin, Settings } from 'lucide-react';
import { translations, type Lang, type T } from '../i18n';

/* ─── Prometheus Logo SVG ─── */
export const PrometheusLogo: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
    <div className="absolute" style={{
      width: size * 0.6, height: size * 0.6,
      top: '30%', left: '20%',
      background: 'radial-gradient(circle, rgba(255,160,0,0.7) 0%, rgba(255,100,0,0.3) 40%, transparent 70%)',
      filter: `blur(${Math.max(size * 0.15, 4)}px)`,
      borderRadius: '50%',
      animation: 'logo-glow-pulse 3s ease-in-out infinite',
    }} />
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ position: 'relative', zIndex: 1 }}>
      <polygon points="8,25 92,25 50,92" fill="url(#lo-out)" opacity="0.9" />
      <polygon points="22,32 78,32 50,78" fill="#0A0A0A" />
      <polygon points="32,36 68,36 50,68" fill="url(#lo-ctr)" />
      <defs>
        <linearGradient id="lo-out" x1="0" y1="100" x2="100" y2="0">
          <stop offset="0%" stopColor="#C0C0C0" /><stop offset="50%" stopColor="#999" /><stop offset="100%" stopColor="#707070" />
        </linearGradient>
        <linearGradient id="lo-ctr" x1="50" y1="36" x2="50" y2="68">
          <stop offset="0%" stopColor="#FFD000" /><stop offset="40%" stopColor="#FF9500" /><stop offset="100%" stopColor="#FF5500" />
        </linearGradient>
      </defs>
    </svg>
    <div className="absolute" style={{
      width: size * 0.35, height: size * 0.25,
      top: '38%', left: '33%',
      background: 'radial-gradient(ellipse, rgba(255,200,50,0.5) 0%, rgba(255,150,0,0.2) 50%, transparent 80%)',
      filter: `blur(${Math.max(size * 0.08, 2)}px)`,
      borderRadius: '50%',
      pointerEvents: 'none',
      zIndex: 2,
    }} />
  </div>
);

/* ─── Notification Badge ─── */
export const NotifBadge: React.FC<{ count: number }> = ({ count }) => {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 animate-badge-pulse">
      {count}
    </span>
  );
};

/* ─── Header Props ─── */
interface HeaderProps {
  lang: Lang;
  setLang: (l: Lang) => void;
  section: string;
  nav: (s: string) => void;
  isAdmin: boolean;
  newOrdersCount: number;
  newReviewsCount: number;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
  t: T;
}

const Header: React.FC<HeaderProps> = ({
  lang, setLang, section, nav, isAdmin,
  newOrdersCount, newReviewsCount,
  mobileOpen, setMobileOpen, t,
}) => {
  return (
    <header className="relative z-50 bg-dark/95 backdrop-blur-md border-b border-white/5 sticky top-0">
      <div className="h-1 w-full bg-gradient-to-r from-volt via-cyber to-volt" />
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => nav('hero')} className="flex items-center gap-3 group">
            <PrometheusLogo size={36} />
            <div className="hidden sm:block">
              <div className="text-sm font-black tracking-[0.2em] text-white group-hover:text-volt transition-colors">{t.siteName}</div>
              <div className="text-[9px] text-white/30 tracking-[0.3em] -mt-0.5">{t.tagline}</div>
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            {[
              { key: 'catalog', label: t.catalog },
              { key: 'promos', label: t.promos },
              { key: 'about', label: t.about },
              { key: 'reviews', label: t.reviews },
              { key: 'contact', label: t.contact },
            ].map(n => (
              <button key={n.key} onClick={() => nav(n.key)}
                className={`px-4 py-2 text-[11px] font-bold tracking-[0.15em] transition-all relative
                  ${section === n.key ? 'text-volt' : 'text-white/40 hover:text-white/80'}`}>
                {section === n.key && <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-volt" />}
                {n.label}
              </button>
            ))}
            <button onClick={() => nav('admin')}
              className={`px-4 py-2 text-[11px] font-bold tracking-[0.15em] transition-all flex items-center gap-1.5 relative
                ${section === 'admin' ? 'text-cyber' : 'text-white/30 hover:text-cyber/70'}`}>
              <Settings className="w-3 h-3" /> {t.admin}
              {isAdmin && (newOrdersCount + newReviewsCount) > 0 && (
                <span className="w-2 h-2 bg-red-500 rounded-full animate-badge-pulse" />
              )}
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 text-[9px] text-white/30 bg-white/5 px-3 py-1.5 clip-badge-sm">
              <MapPin className="w-3 h-3 text-volt" /> {t.addressShort}
            </div>
            <div className="flex items-center bg-white/5 border border-white/10 clip-badge-sm overflow-hidden">
              <button onClick={() => setLang('ru')}
                className={`px-3 py-1.5 text-[10px] font-bold tracking-wider transition-all ${lang === 'ru' ? 'bg-volt text-dark' : 'text-white/40 hover:text-white/70'}`}>РУС</button>
              <button onClick={() => setLang('en')}
                className={`px-3 py-1.5 text-[10px] font-bold tracking-wider transition-all ${lang === 'en' ? 'bg-volt text-dark' : 'text-white/40 hover:text-white/70'}`}>ENG</button>
            </div>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-white/50 hover:text-volt">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-dark-2 border-t border-white/5 px-4 py-4 animate-slide-up">
          {['hero', 'catalog', 'promos', 'about', 'reviews', 'contact', 'admin'].map(k => (
            <button key={k} onClick={() => nav(k)}
              className={`block w-full text-left py-3 px-4 text-xs font-bold tracking-wider border-l-2 mb-1 transition-all
                ${section === k ? 'border-volt text-volt bg-volt/5' : 'border-transparent text-white/40 hover:text-white/70'}`}>
              {k === 'hero' ? 'ГЛАВНАЯ' : k === 'promos' ? t.promos : k === 'admin' ? t.admin : (translations[lang] as Record<string, string>)[k] || k.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;
