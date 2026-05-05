import React from 'react';
import { Menu, X, MapPin, Settings } from 'lucide-react';
import { translations, type Lang, type T } from '../i18n';

/* ─── Prometheus Logo Image ─── */
export const PrometheusLogo: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <div
    className="relative inline-flex items-center justify-center"
    style={{ width: size, height: size }}
  >
    {/* Внешнее оранжевое свечение — пульсирует */}
    <div
      className="absolute inset-0 rounded-full"
      style={{
        background: 'radial-gradient(circle, rgba(255,150,0,0.55) 0%, rgba(255,80,0,0.2) 45%, transparent 75%)',
        filter: `blur(${Math.max(size * 0.22, 6)}px)`,
        animation: 'logo-glow-pulse 3s ease-in-out infinite',
      }}
    />
    {/* Сам логотип */}
    <img
      src="/logo.png"
      alt="Prometheus"
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        position: 'relative',
        zIndex: 1,
        filter: 'drop-shadow(0 0 6px rgba(255,160,0,0.6))',
        animation: 'logo-inner-glow 3s ease-in-out infinite',
      }}
      draggable={false}
    />
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
