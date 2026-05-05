import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Phone, MessageCircle, MapPin, Clock, Star,
  ShieldCheck, Package, Truck, BarChart3, Eye,
  CheckCircle, AlertTriangle, Globe, Lock, Edit3, Trash2,
  ChevronRight, Plus, Save, XCircle, ChevronLeft, Image,
  Hash, Target, Activity, ArrowUpRight, Cpu, Gift, ExternalLink,
  Users, TrendingUp, Bell, Award, X
} from 'lucide-react';
import { translations, type Lang, type T } from './i18n';
import Header, { PrometheusLogo, NotifBadge } from './components/Header';
import {
  type Product, type Review, type Category, type StoreAddress, type Promotion, type Order, type SiteSettings,
  initialProducts, initialReviews, initialCategories, initialAddresses, initialPromotions, initialOrders, initialSettings
} from './store';
import {
  fetchAllData,
  dbUpsertProduct, dbDeleteProduct,
  dbInsertReview, dbUpdateReview, dbDeleteReview,
  dbUpsertCategory, dbDeleteCategory,
  dbUpsertAddress, dbDeleteAddress,
  dbUpsertPromotion, dbDeletePromotion,
  dbInsertOrder, dbUpdateOrder, dbDeleteOrder,
  dbUpdateSettings,
  signInAdmin, signOutAdmin, getSession, changeAdminPassword, onAuthStateChange,
  uploadProductImage, deleteProductImage
} from './supabase';

const fmt = (n: number) => n.toLocaleString('ru-RU') + ' KGS';
const WA_NUMBER = '996508752775';
const TG_HANDLE = 'KALLISTO_75';
const COOLDOWN_MS = 5 * 60 * 1000; // 5 минут кулдаун при неудачном входе
const MAX_ATTEMPTS = 3;

/* ─── Small UI Components ─── */
const Crosshairs: React.FC<{ color?: string }> = ({ color = 'border-volt' }) => (
  <>
    <div className={`absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 ${color} pointer-events-none`} />
    <div className={`absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2 ${color} pointer-events-none`} />
    <div className={`absolute -bottom-px -left-px w-3 h-3 border-b-2 border-l-2 ${color} pointer-events-none`} />
    <div className={`absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2 ${color} pointer-events-none`} />
  </>
);

const SectionHeader: React.FC<{ title: string; code: string; accent?: string }> = ({ title, code, accent = 'text-volt' }) => (
  <div className="mb-10 animate-fade-in">
    <div className="flex items-center gap-3 mb-2">
      <div className="checkerboard w-6 h-6 opacity-50" />
      <div className="h-px flex-1 bg-gradient-to-r from-volt/40 to-transparent" />
      <span className="text-[10px] text-white/30 tracking-[0.3em]">{code}</span>
    </div>
    <h2 className={`text-3xl md:text-4xl font-black ${accent} tracking-tight leading-none`}>{title}</h2>
    <div className="flex items-center gap-2 mt-3">
      <div className="w-12 h-0.5 bg-volt" />
      <div className="w-2 h-2 border border-volt rotate-45" />
      <div className="h-px flex-1 bg-white/5" />
    </div>
  </div>
);

const DataTag: React.FC<{ children: React.ReactNode; variant?: 'volt' | 'cyber' | 'dim' | 'red' | 'blue'; style?: React.CSSProperties }> = ({ children, variant = 'dim', style }) => {
  const cls = variant === 'volt' ? 'bg-volt/10 text-volt border-volt/30'
    : variant === 'cyber' ? 'bg-cyber/10 text-cyber border-cyber/30'
    : variant === 'red' ? 'bg-red-500/10 text-red-400 border-red-500/30'
    : variant === 'blue' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
    : 'bg-white/5 text-white/50 border-white/10';
  return <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono tracking-wider border ${cls} clip-badge-sm`} style={style}>{children}</span>;
};

/* ─── PrometheusLogo imported from ./components/Header ─── */



/* ─── NotifBadge imported from ./components/Header ─── */

/* ─── Flying Reviews in Hero ─── */
const FlyingReviews: React.FC<{ reviews: Review[] }> = ({ reviews }) => {
  const approved = reviews.filter(r => r.approved);
  if (approved.length === 0) return null;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {approved.map((r, i) => {
        const topPos = 15 + (i * 18) % 70;
        const duration = 18 + (i * 7) % 15;
        const delay = i * 4;
        const isReverse = i % 2 === 1;
        return (
          <div key={r.id} className="absolute whitespace-nowrap" style={{
            top: `${topPos}%`,
            animation: `${isReverse ? 'float-review-reverse' : 'float-review'} ${duration}s linear ${delay}s infinite`,
            opacity: 0,
          }}>
            <div className="bg-dark-2/60 backdrop-blur-sm border border-white/5 px-4 py-2 flex items-center gap-3">
              <div className="w-6 h-6 bg-volt/10 flex items-center justify-center text-volt text-[10px] font-black shrink-0">{r.author[0]}</div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {Array.from({ length: r.rating }).map((_, si) => (
                    <Star key={si} className="w-2 h-2 fill-cyber text-cyber" />
                  ))}
                  <span className="text-[8px] text-white/20 ml-1">{r.author}</span>
                </div>
                <p className="text-[10px] text-white/30 max-w-[300px] truncate">{r.text}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ─── (CardParticles removed — replaced with marble-flow CSS) ─── */

const GeoCatalog: React.FC = () => {
  /* Floating soft orbs — gradient blurs that drift slowly */
  const orbs = [
    { x: 10, y: 15, size: 180, color: '#ADFF2F', dur: 35, dx1: 80, dy1: -40, dx2: -30, dy2: 50, dx3: 60, dy3: -20 },
    { x: 75, y: 25, size: 140, color: '#FF6B2B', dur: 28, dx1: -60, dy1: 30, dx2: 40, dy2: -60, dx3: -20, dy3: 40 },
    { x: 40, y: 60, size: 200, color: '#ADFF2F', dur: 42, dx1: 50, dy1: -70, dx2: -40, dy2: 20, dx3: 30, dy3: -50 },
    { x: 85, y: 70, size: 120, color: '#3b82f6', dur: 32, dx1: -40, dy1: -50, dx2: 60, dy2: 30, dx3: -50, dy3: -40 },
    { x: 20, y: 80, size: 160, color: '#FF6B2B', dur: 38, dx1: 70, dy1: -30, dx2: -20, dy2: -60, dx3: 40, dy3: 20 },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Soft gradient orbs floating */}
      {orbs.map((o, i) => (
        <div key={i} className="absolute rounded-full" style={{
          left: `${o.x}%`, top: `${o.y}%`, width: o.size, height: o.size,
          background: `radial-gradient(circle, ${o.color}12 0%, ${o.color}05 40%, transparent 70%)`,
          filter: 'blur(30px)',
          '--dx1': `${o.dx1}px`, '--dy1': `${o.dy1}px`,
          '--dx2': `${o.dx2}px`, '--dy2': `${o.dy2}px`,
          '--dx3': `${o.dx3}px`, '--dy3': `${o.dy3}px`,
          '--orb-op': '0.08',
          animation: `orb-float ${o.dur}s ease-in-out ${i * 3}s infinite`,
        } as React.CSSProperties} />
      ))}
      {/* Horizontal sweep lines */}
      {[0, 1, 2].map(i => (
        <div key={`ls-${i}`} className="absolute" style={{
          top: `${20 + i * 30}%`, height: '1px', width: '300px',
          background: `linear-gradient(90deg, transparent, ${i % 2 === 0 ? '#ADFF2F' : '#FF6B2B'}30, transparent)`,
          animation: `line-sweep-h ${18 + i * 8}s linear ${i * 5}s infinite`,
        }} />
      ))}
      {/* Slow rising small particles */}
      {Array.from({ length: 12 }, (_, i) => (
        <div key={`p-${i}`} className="absolute" style={{
          left: `${5 + i * 8}%`, bottom: 0,
          '--p-op': `${0.04 + (i % 3) * 0.03}`,
          animation: `particle-rise ${25 + i * 5}s linear ${i * 3}s infinite`,
        } as React.CSSProperties}>
          <div className="rounded-full" style={{
            width: 3 + (i % 4) * 2, height: 3 + (i % 4) * 2,
            background: ['#ADFF2F', '#FF6B2B', '#3b82f6'][i % 3],
          }} />
        </div>
      ))}
      {/* Subtle grid pulse */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'linear-gradient(rgba(173,255,47,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(173,255,47,0.02) 1px, transparent 1px)',
        backgroundSize: '60px 60px', animation: 'grid-pulse 6s ease-in-out infinite',
      }} />
    </div>
  );
};

/* ─── Floating Promo Badges (Promotions BG) ─── */
const FloatingPromoBadges: React.FC<{ promotions: Promotion[]; lang: Lang }> = ({ promotions, lang }) => {
  if (promotions.length === 0) return null;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {promotions.map((promo, i) => {
        const top = 10 + (i * 25) % 70;
        const dur = 22 + (i * 8) % 16;
        const delay = i * 6;
        return (
          <div key={promo.id} className="absolute" style={{
            top: `${top}%`,
            animation: `${i % 2 === 0 ? 'float-left' : 'float-right'} ${dur}s linear ${delay}s infinite`,
            opacity: 0,
          }}>
            <div className="bg-cyber/5 border border-cyber/10 px-4 py-2 flex items-center gap-2">
              <span className="text-[18px]">🎁</span>
              <div>
                <div className="text-[8px] text-cyber/25 font-bold tracking-widest">PROMO</div>
                <div className="text-[9px] text-white/15 font-mono">{(lang === 'ru' ? promo.title : promo.titleEn).slice(0, 20)}</div>
              </div>
            </div>
          </div>
        );
      })}
      {/* Floating discount circles */}
      {[10, 15, 20, 25, 30].map((pct, i) => (
        <div key={`disc-${i}`} className="absolute" style={{
          top: `${5 + i * 18}%`,
          left: `${10 + i * 15}%`,
          animation: `wobble-drift ${6 + i * 2}s ease-in-out ${i * 1.5}s infinite`,
        }}>
          <div className="w-10 h-10 rounded-full border border-cyber/[0.06] flex items-center justify-center">
            <span className="text-[8px] text-cyber/[0.12] font-black">-{pct}%</span>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ─── About BG — constellation + comets ─── */
const GeoAbout: React.FC = () => {
  const nodes = [
    { x: 8, y: 12 }, { x: 25, y: 8 }, { x: 50, y: 15 }, { x: 75, y: 10 }, { x: 92, y: 20 },
    { x: 12, y: 40 }, { x: 35, y: 35 }, { x: 60, y: 45 }, { x: 82, y: 38 },
    { x: 20, y: 65 }, { x: 45, y: 60 }, { x: 70, y: 70 }, { x: 88, y: 55 },
    { x: 10, y: 85 }, { x: 40, y: 80 }, { x: 65, y: 88 }, { x: 90, y: 82 },
  ];
  const conns = [[0,1],[1,2],[2,3],[3,4],[5,6],[6,7],[7,8],[0,5],[2,6],[3,7],[4,8],[5,9],[6,10],[7,11],[8,12],[9,10],[10,11],[11,12],[9,13],[10,14],[11,15],[12,16],[13,14],[14,15],[15,16]];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Constellation lines */}
      <svg className="absolute inset-0 w-full h-full" fill="none">
        {conns.map(([a, b], i) => (
          <line key={`cn-${i}`} x1={`${nodes[a].x}%`} y1={`${nodes[a].y}%`} x2={`${nodes[b].x}%`} y2={`${nodes[b].y}%`}
            stroke="#ADFF2F" strokeWidth="0.4" opacity="0.05" strokeDasharray="4 8" style={{ animation: `dash-march 3s linear ${i * 0.3}s infinite` }} />
        ))}
      </svg>
      {/* Blinking nodes */}
      {nodes.map((n, i) => (
        <div key={i} className="absolute" style={{ left: `${n.x}%`, top: `${n.y}%`, animation: `node-blink ${2.5 + (i % 5)}s ease-in-out ${i * 0.5}s infinite` }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: i % 4 === 0 ? '#FF6B2B' : '#ADFF2F', boxShadow: `0 0 6px ${i % 4 === 0 ? '#FF6B2B' : '#ADFF2F'}40` }} />
        </div>
      ))}
      {/* Straight horizontal light lines */}
      {[0, 1, 2].map(i => (
        <div key={`line-${i}`} className="absolute" style={{
          top: `${15 + i * 30}%`, height: '1px', width: '160px',
          background: `linear-gradient(90deg, transparent, ${['#ADFF2F', '#FF6B2B', '#ADFF2F'][i]}25, transparent)`,
          animation: `${i % 2 === 0 ? 'traverse' : 'traverse-rev'} ${22 + i * 8}s linear ${i * 7}s infinite`,
          '--t-op': '0.4',
        } as React.CSSProperties} />
      ))}
      {/* Breathing rings */}
      {[{ x: 25, y: 30 }, { x: 70, y: 60 }].map((r, i) => (
        <div key={`br-${i}`} className="absolute rounded-full" style={{
          left: `${r.x}%`, top: `${r.y}%`,
          width: 100 + i * 60, height: 100 + i * 60,
          border: `1px solid ${i === 0 ? '#ADFF2F' : '#FF6B2B'}`,
          animation: `ring-breathe ${8 + i * 4}s ease-in-out ${i * 3}s infinite`,
        }} />
      ))}
    </div>
  );
};

/* ─── Reviews BG — warm glowing stars + traversing orbs ─── */
const GeoReviews: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Warm glowing orbs */}
      {[
        { x: 10, y: 20, size: 160, color: '#f59e0b', dur: 30 },
        { x: 70, y: 15, size: 200, color: '#FF6B2B', dur: 38 },
        { x: 30, y: 70, size: 140, color: '#f59e0b', dur: 34 },
        { x: 85, y: 65, size: 180, color: '#FF6B2B', dur: 42 },
      ].map((o, i) => (
        <div key={i} className="absolute rounded-full" style={{
          left: `${o.x}%`, top: `${o.y}%`, width: o.size, height: o.size,
          background: `radial-gradient(circle, ${o.color}10 0%, transparent 65%)`,
          filter: 'blur(25px)',
          '--dx1': `${40 - i * 20}px`, '--dy1': `${-50 + i * 15}px`,
          '--dx2': `${-30 + i * 10}px`, '--dy2': `${30 - i * 20}px`,
          '--dx3': `${50 - i * 15}px`, '--dy3': `${-40 + i * 10}px`,
          '--orb-op': '0.07',
          animation: `orb-float ${o.dur}s ease-in-out ${i * 4}s infinite`,
        } as React.CSSProperties} />
      ))}
      {/* Straight horizontal light beams */}
      {[0, 1, 2].map(i => (
        <div key={`t-${i}`} className="absolute" style={{
          top: `${15 + i * 30}%`, height: '1px', width: '180px',
          background: `linear-gradient(90deg, transparent, ${['#f59e0b', '#FF6B2B', '#ADFF2F'][i]}30, transparent)`,
          '--t-op': '0.4',
          animation: `${i % 2 === 0 ? 'traverse' : 'traverse-rev'} ${20 + i * 8}s linear ${i * 5}s infinite`,
        } as React.CSSProperties} />
      ))}
      {/* Dot matrix */}
      <div className="dot-matrix-bg absolute inset-0" style={{ opacity: 0.4 }} />
    </div>
  );
};

/* ─── Contact BG — radar + sonar ─── */
const GeoContact: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Central radar */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {[80, 160, 240].map((size, i) => (
          <div key={`cr-${i}`} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{
            width: size, height: size,
            border: `1px solid ${i % 2 === 0 ? '#ADFF2F' : '#FF6B2B'}`,
            opacity: 0.05,
          }} />
        ))}
        <div className="absolute top-1/2 left-1/2 origin-[0_0]" style={{ animation: 'radar-beam 6s linear infinite' }}>
          <div className="w-[130px] h-[1px]" style={{ background: 'linear-gradient(90deg, rgba(173,255,47,0.25), transparent)' }} />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full" style={{ background: '#ADFF2F', opacity: 0.25, boxShadow: '0 0 10px #ADFF2F50' }} />
      </div>
      {/* Sonar rings */}
      {[{ x: 20, y: 25, d: 0 }, { x: 75, y: 40, d: 2.5 }, { x: 40, y: 75, d: 5 }].map((p, i) => (
        <div key={`sr-${i}`} className="absolute" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
          <div className="w-6 h-6 border rounded-full" style={{ borderColor: `${i % 2 === 0 ? '#ADFF2F' : '#FF6B2B'}20`, animation: `sonar-ring 4s linear ${p.d}s infinite` }} />
        </div>
      ))}
      {/* Subtle grid */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'linear-gradient(rgba(173,255,47,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(173,255,47,0.02) 1px, transparent 1px)',
        backgroundSize: '50px 50px', animation: 'grid-pulse 5s ease-in-out infinite',
      }} />
    </div>
  );
};

/* ─── Admin BG — matrix rain + spinning hex ─── */
const GeoAdmin: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Matrix columns — falling dots */}
      {Array.from({ length: 10 }, (_, i) => (
        <div key={`mc-${i}`} className="absolute" style={{
          left: `${5 + i * 10}%`,
          animation: `matrix-fall ${20 + i * 4}s linear ${i * 2}s infinite`,
        }}>
          <div className="flex flex-col gap-5">
            {Array.from({ length: 8 }, (_, j) => (
              <div key={j} className="rounded-full" style={{
                width: 3, height: 3,
                background: (i + j) % 3 === 0 ? '#FF6B2B' : '#ADFF2F',
                opacity: 0.15,
              }} />
            ))}
          </div>
        </div>
      ))}
      {/* Spinning hex wireframe */}
      {[{ x: 20, y: 30 }, { x: 75, y: 60 }].map((p, i) => (
        <div key={`sh-${i}`} className="absolute" style={{ left: `${p.x}%`, top: `${p.y}%`, animation: `hex-spin ${20 + i * 10}s linear infinite` }}>
          <svg width="70" height="70" viewBox="0 0 60 60" fill="none" opacity="0.04">
            <polygon points="30,2 56,17 56,43 30,58 4,43 4,17" stroke={i === 0 ? '#FF6B2B' : '#ADFF2F'} strokeWidth="0.8" />
          </svg>
        </div>
      ))}
      {/* Sweep lines */}
      <div className="absolute w-full" style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #FF6B2B20, transparent)', animation: 'line-sweep-v 10s linear infinite' }} />
      {/* Crosshatch */}
      <div className="crosshatch absolute inset-0 opacity-50" />
    </div>
  );
};

/* ─── Product Detail BG — gentle orbs + sweep ─── */
const GeoProductDetail: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Large soft orbs */}
      {[
        { x: 80, y: 10, size: 200, color: '#ADFF2F', dur: 30 },
        { x: 10, y: 50, size: 160, color: '#FF6B2B', dur: 38 },
        { x: 60, y: 75, size: 180, color: '#3b82f6', dur: 34 },
      ].map((o, i) => (
        <div key={i} className="absolute rounded-full" style={{
          left: `${o.x}%`, top: `${o.y}%`, width: o.size, height: o.size,
          background: `radial-gradient(circle, ${o.color}0a 0%, transparent 60%)`,
          filter: 'blur(30px)',
          '--dx1': `${30 - i * 15}px`, '--dy1': `${-40 + i * 20}px`,
          '--dx2': `${-20 + i * 10}px`, '--dy2': `${30}px`,
          '--dx3': `${40}px`, '--dy3': `${-30}px`,
          '--orb-op': '0.06',
          animation: `orb-float ${o.dur}s ease-in-out ${i * 4}s infinite`,
        } as React.CSSProperties} />
      ))}
      {/* Straight horizontal light lines */}
      {[0, 1].map(i => (
        <div key={`c-${i}`} className="absolute" style={{
          top: `${25 + i * 40}%`, height: '1px', width: '140px',
          background: `linear-gradient(90deg, transparent, ${i === 0 ? '#ADFF2F' : '#FF6B2B'}25, transparent)`,
          '--t-op': '0.3',
          animation: `${i === 0 ? 'traverse' : 'traverse-rev'} ${25 + i * 10}s linear ${i * 8}s infinite`,
        } as React.CSSProperties} />
      ))}
      {/* Grid */}
      <div className="grid-bg absolute inset-0" style={{ opacity: 0.4 }} />
    </div>
  );
};

/* ─── Promo Detail Floating Rewards ─── */
const FloatingRewards: React.FC<{ promo: Promotion; products: Product[] }> = ({ promo, products }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {promo.productRewards.slice(0, 6).map((pr, i) => {
        const prod = products.find(p => p.id === pr.productId);
        if (!prod) return null;
        return (
          <div key={`rw-${i}`} className="absolute" style={{
            top: `${8 + i * 15}%`,
            animation: `${i % 2 === 0 ? 'float-left' : 'float-right'} ${20 + i * 4}s linear ${i * 3}s infinite`,
            opacity: 0,
          }}>
            <div className="flex items-center gap-2 opacity-[0.05]">
              <span className="text-lg">💰</span>
              <span className="text-[8px] text-cyber font-mono">+{pr.reward} KGS</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════ */
const App: React.FC = () => {
  const [lang, setLang] = useState<Lang>('ru');
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [section, setSection] = useState('hero');
  const [adminTab, setAdminTab] = useState<'products' | 'categories' | 'reviews' | 'analytics' | 'addresses' | 'promos' | 'orders' | 'settings'>('products');

  // State — initially use defaults, then load from Supabase
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [addresses, setAddresses] = useState<StoreAddress[]>(initialAddresses);
  const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(initialSettings);
  const [_dbLoading, setDbLoading] = useState(true);
  const loadedRef = useRef(false);

  // Load all data from Supabase on mount
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    fetchAllData().then(data => {
      if (data.products.length > 0) setProducts(data.products);
      if (data.reviews.length > 0) setReviews(data.reviews);
      if (data.categories.length > 0) setCategories(data.categories);
      if (data.addresses.length > 0) setAddresses(data.addresses);
      if (data.promotions.length > 0) setPromotions(data.promotions);
      setOrders(data.orders);
      setSiteSettings(data.settings);
      setDbLoading(false);
    }).catch(err => {
      console.error('Failed to load from Supabase:', err);
      setDbLoading(false);
    });
  }, []);

  // Modals & UI
  const [inquiryProduct, setInquiryProduct] = useState<Product | null>(null);
  const [inquiryType, setInquiryType] = useState<'whatsapp' | 'telegram'>('whatsapp');
  const [phone, setPhone] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', phone: '', text: '', rating: 5 });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);

  // Admin
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryForm, setNewCategoryForm] = useState({ name: '', nameEn: '', color: '#ADFF2F' });
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [authLoading, setAuthLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordChangeMsg, setPasswordChangeMsg] = useState('');

  // Address editing
  const [editingAddress, setEditingAddress] = useState<StoreAddress | null>(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState<Omit<StoreAddress, 'id'>>({
    name: '', nameEn: '', address: '', addressEn: '', lat: 42.8141, lng: 73.8486, workDays: '', workDaysEn: '', workTime: ''
  });

  // Promo editing
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [showNewPromo, setShowNewPromo] = useState(false);

  // Filter
  const [filterCat, setFilterCat] = useState('all');

  const t: T = translations[lang];

  // Notification counts
  const newOrdersCount = orders.filter(o => o.isNew).length;
  const newReviewsCount = reviews.filter(r => !r.approved && r.isNew).length;

  // Get category color
  const getCatColor = (catId: string) => categories.find(c => c.id === catId)?.color || '#ADFF2F';
  const activeCatColor = filterCat !== 'all' ? getCatColor(filterCat) : '#ADFF2F';

  const nav = useCallback((s: string) => {
    setSection(s);
    setMobileOpen(false);
    setSelectedProduct(null);
    setSelectedPromo(null);
    window.scrollTo(0, 0);
  }, []);

  /* ── Admin Auth via Supabase ── */
  // Check session on mount
  useEffect(() => {
    getSession().then(session => {
      if (session) setIsAdmin(true);
    });
    const { data: { subscription } } = onAuthStateChange(session => {
      setIsAdmin(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldownUntil <= Date.now()) { setCooldownLeft(0); return; }
    const iv = setInterval(() => {
      const left = Math.max(0, cooldownUntil - Date.now());
      setCooldownLeft(left);
      if (left <= 0) clearInterval(iv);
    }, 1000);
    return () => clearInterval(iv);
  }, [cooldownUntil]);

  const handleAdminLogin = async () => {
    if (cooldownLeft > 0) return;
    if (!adminEmail || !adminPassword) { setPasswordError('Введите email и пароль'); return; }
    setAuthLoading(true);
    setPasswordError('');
    const { error } = await signInAdmin(adminEmail, adminPassword);
    setAuthLoading(false);
    if (error) {
      const attempts = loginAttempts + 1;
      setLoginAttempts(attempts);
      if (attempts >= MAX_ATTEMPTS) {
        const until = Date.now() + COOLDOWN_MS;
        setCooldownUntil(until);
        setCooldownLeft(COOLDOWN_MS);
        setLoginAttempts(0);
        setPasswordError(`Слишком много попыток. Подождите 5 минут.`);
      } else {
        setPasswordError(`Неверный email или пароль (попытка ${attempts}/${MAX_ATTEMPTS})`);
      }
    } else {
      setIsAdmin(true);
      setPasswordError('');
      setLoginAttempts(0);
      setAdminPassword('');
    }
  };

  const handleAdminLogout = async () => {
    await signOutAdmin();
    setIsAdmin(false);
  };

  const handlePasswordChange = async () => {
    if (!newPassword || newPassword.length < 8) {
      setPasswordChangeMsg('Пароль должен быть минимум 8 символов');
      return;
    }
    const { error } = await changeAdminPassword(newPassword);
    if (error) {
      setPasswordChangeMsg('Ошибка: ' + error.message);
    } else {
      setPasswordChangeMsg('✅ Пароль успешно изменён!');
      setNewPassword('');
      setTimeout(() => setPasswordChangeMsg(''), 3000);
    }
  };

  /* ── Handlers — all synced to Supabase ── */
  const handleInquiry = () => {
    if (!phone || phone.length < 9) { alert(t.phoneRequired); return; }
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      productId: inquiryProduct?.id || '',
      productName: inquiryProduct?.name || '',
      phone,
      messenger: inquiryType,
      date: new Date().toISOString().split('T')[0],
      status: 'new',
      isNew: true,
    };
    setOrders(prev => [newOrder, ...prev]);
    dbInsertOrder(newOrder);

    const msg = encodeURIComponent(`Здравствуйте! Интересует: ${inquiryProduct?.name}. Тел: ${phone}`);
    if (inquiryType === 'whatsapp') window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');
    else window.open(`https://t.me/${TG_HANDLE}?start=${msg}`, '_blank');
    setInquiryProduct(null); setPhone('');
  };

  const handleReviewSubmit = () => {
    if (!reviewForm.name || !reviewForm.phone || !reviewForm.text) return;
    const newReview: Review = {
      id: `r${Date.now()}`, author: reviewForm.name, rating: reviewForm.rating,
      text: reviewForm.text, textEn: reviewForm.text,
      date: new Date().toISOString().split('T')[0], approved: false, productId: '', isNew: true,
    };
    setReviews(prev => [...prev, newReview]);
    dbInsertReview(newReview);
    setReviewSubmitted(true);
    setTimeout(() => { setShowReviewModal(false); setReviewSubmitted(false); setReviewForm({ name: '', phone: '', text: '', rating: 5 }); }, 2000);
  };

  const saveProduct = (p: Product) => {
    setProducts(prev => {
      const exists = prev.some(x => x.id === p.id);
      return exists ? prev.map(x => x.id === p.id ? p : x) : [...prev, p];
    });
    dbUpsertProduct(p);
    setEditingProduct(null);
  };
  const deleteProduct = (id: string) => { setProducts(prev => prev.filter(x => x.id !== id)); dbDeleteProduct(id); };
  const toggleStatus = (id: string) => {
    setProducts(prev => prev.map(x => {
      if (x.id === id) { const updated = { ...x, status: (x.status === 'in-stock' ? 'pre-order' : 'in-stock') as Product['status'] }; dbUpsertProduct(updated); return updated; }
      return x;
    }));
  };
  const approveReview = (id: string) => {
    setReviews(prev => prev.map(r => {
      if (r.id === id) { const updated = { ...r, approved: true, isNew: false }; dbUpdateReview(updated); return updated; }
      return r;
    }));
  };
  const deleteReview = (id: string) => { setReviews(prev => prev.filter(r => r.id !== id)); dbDeleteReview(id); };
  const deleteCategory = (id: string) => { setCategories(prev => prev.filter(c => c.id !== id)); dbDeleteCategory(id); };
  const saveCategoryEdit = (c: Category) => { setCategories(prev => prev.map(x => x.id === c.id ? c : x)); dbUpsertCategory(c); setEditingCategory(null); };
  const addCategory = () => {
    if (!newCategoryForm.name) return;
    const newCat: Category = { id: `cat-${Date.now()}`, name: newCategoryForm.name, nameEn: newCategoryForm.nameEn || newCategoryForm.name, count: 0, color: newCategoryForm.color };
    setCategories(prev => [...prev, newCat]);
    dbUpsertCategory(newCat);
    setNewCategoryForm({ name: '', nameEn: '', color: '#ADFF2F' }); setShowNewCategory(false);
  };

  // Address CRUD
  const saveAddressEdit = (a: StoreAddress) => { setAddresses(prev => prev.map(x => x.id === a.id ? a : x)); dbUpsertAddress(a); setEditingAddress(null); };
  const deleteAddress = (id: string) => { setAddresses(prev => prev.filter(a => a.id !== id)); dbDeleteAddress(id); };
  const addAddress = () => {
    if (!newAddressForm.name || !newAddressForm.address) return;
    const newAddr: StoreAddress = { ...newAddressForm, id: `addr-${Date.now()}` };
    setAddresses(prev => [...prev, newAddr]);
    dbUpsertAddress(newAddr);
    setNewAddressForm({ name: '', nameEn: '', address: '', addressEn: '', lat: 42.8141, lng: 73.8486, workDays: '', workDaysEn: '', workTime: '' });
    setShowNewAddress(false);
  };

  // Promo CRUD
  const savePromoEdit = (p: Promotion) => { setPromotions(prev => prev.map(x => x.id === p.id ? p : x)); dbUpsertPromotion(p); setEditingPromo(null); };
  const deletePromo = (id: string) => { setPromotions(prev => prev.filter(p => p.id !== id)); dbDeletePromotion(id); };

  // Order actions
  const completeOrder = (id: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === id) { const updated = { ...o, status: 'completed' as const, isNew: false }; dbUpdateOrder(updated); return updated; }
      return o;
    }));
  };
  const cancelOrder = (id: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === id) { const updated = { ...o, status: 'cancelled' as const, isNew: false }; dbUpdateOrder(updated); return updated; }
      return o;
    }));
  };
  const deleteOrder = (id: string) => { setOrders(prev => prev.filter(o => o.id !== id)); dbDeleteOrder(id); };
  const markOrderSeen = (id: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === id) { const updated = { ...o, isNew: false }; dbUpdateOrder(updated); return updated; }
      return o;
    }));
  };

  const filteredProducts = filterCat === 'all' ? products : products.filter(p => p.category === filterCat);

  const openProductPage = (p: Product) => { setSelectedProduct(p); window.scrollTo(0, 0); };

  /* ═══ RENDER ═══ */
  return (
    <div className="min-h-screen bg-dark text-white font-mono relative overflow-x-hidden">

      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-[60] opacity-[0.03]"
        style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(173,255,47,0.15) 2px,rgba(173,255,47,0.15) 4px)' }} />
      <div className="fixed inset-0 pointer-events-none z-0 grid-bg" />

      {/* ════ HEADER ════ */}
      <Header
        lang={lang} setLang={setLang}
        section={section} nav={nav}
        isAdmin={isAdmin}
        newOrdersCount={newOrdersCount}
        newReviewsCount={newReviewsCount}
        mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}
        t={t}
      />

      {/* ════ MAIN ════ */}
      <main className="relative z-10">

        {/* ════ HERO ════ */}
        {section === 'hero' && !selectedProduct && (
          <section className="relative min-h-[85vh] flex items-center overflow-hidden">
            <FlyingReviews reviews={reviews} />
            {/* Hero BG: Grid + intensive geometric animations */}
            <div className="absolute inset-0 grid-bg">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-dark-3 to-transparent" />
              <div className="absolute bottom-0 left-0 w-2/3 h-1/2 bg-gradient-to-tr from-volt/[0.03] to-transparent" />
              {/* Rotating diamond frames with glow */}
              <div className="absolute top-16 right-16 w-72 h-72 border border-volt/15 rotate-45 hidden lg:block" style={{ animation: 'geo-drift-1 20s ease-in-out infinite', filter: 'drop-shadow(0 0 8px #ADFF2F15)' }} />
              <div className="absolute top-28 right-28 w-52 h-52 border border-cyber/15 rotate-45 hidden lg:block" style={{ animation: 'geo-drift-2 25s ease-in-out infinite' }} />
              <div className="absolute bottom-16 left-16 w-40 h-40 border border-volt/10 rotate-12 hidden lg:block" style={{ animation: 'geo-drift-1 18s ease-in-out infinite reverse' }} />
              <div className="absolute top-1/3 left-1/4 w-24 h-24 border border-cyber/8 rotate-[30deg] hidden lg:block" style={{ animation: 'geo-drift-2 15s ease-in-out infinite' }} />
              {/* Large neon traversing shapes */}
              {[
                { top: 15, dur: 24, delay: 0, shape: 'hex', size: 90, color: '#ADFF2F' },
                { top: 45, dur: 30, delay: 5, shape: 'tri', size: 70, color: '#FF6B2B' },
                { top: 75, dur: 20, delay: 10, shape: 'circle', size: 50, color: '#3b82f6' },
                { top: 60, dur: 28, delay: 3, shape: 'diamond', size: 60, color: '#ADFF2F' },
              ].map((s, i) => (
                <div key={`hero-shape-${i}`} className="absolute" style={{ top: `${s.top}%`, animation: `${i % 2 === 0 ? 'geo-traverse' : 'geo-traverse-rev'} ${s.dur}s linear ${s.delay}s infinite` }}>
                  <svg width={s.size} height={s.size} viewBox="0 0 60 60" fill="none" style={{ opacity: 0.08, filter: `drop-shadow(0 0 6px ${s.color}30)` }}>
                    {s.shape === 'hex' && <polygon points="30,2 56,17 56,43 30,58 4,43 4,17" stroke={s.color} strokeWidth="1" />}
                    {s.shape === 'tri' && <polygon points="30,4 56,52 4,52" stroke={s.color} strokeWidth="1" />}
                    {s.shape === 'circle' && <><circle cx="30" cy="30" r="26" stroke={s.color} strokeWidth="1" /><circle cx="30" cy="30" r="14" stroke={s.color} strokeWidth="0.5" strokeDasharray="3 5" /></>}
                    {s.shape === 'diamond' && <polygon points="30,2 58,30 30,58 2,30" stroke={s.color} strokeWidth="1" />}
                  </svg>
                </div>
              ))}
              {/* Concentric expanding rings */}
              <div className="absolute -bottom-32 -right-32 hidden lg:block">
                {[0, 1.5, 3, 4.5].map(d => (
                  <div key={`ring-${d}`} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border rounded-full" style={{ borderColor: '#ADFF2F20', animation: `ring-expand 6s linear ${d}s infinite` }} />
                ))}
              </div>
              {/* Orbiting glowing dots */}
              {[0, 1, 2].map(i => (
                <div key={`hero-orb-${i}`} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:block" style={{ animation: `${i % 2 === 0 ? 'orbit-wide' : 'orbit-medium'} ${12 + i * 5}s linear ${i * 2}s infinite` }}>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: ['#ADFF2F', '#FF6B2B', '#3b82f6'][i], opacity: 0.25, boxShadow: `0 0 10px ${['#ADFF2F', '#FF6B2B', '#3b82f6'][i]}60` }} />
                </div>
              ))}
              {/* Straight horizontal light beams */}
              {[0, 1, 2].map(i => (
                <div key={`beam-${i}`} className="absolute" style={{
                  top: `${18 + i * 28}%`, height: '1px', width: '200px',
                  background: `linear-gradient(90deg, transparent, ${['#ADFF2F', '#FF6B2B', '#3b82f6'][i]}40, transparent)`,
                  animation: `traverse ${20 + i * 8}s linear ${i * 5}s infinite`,
                  '--t-op': '0.5',
                } as React.CSSProperties} />
              ))}
              {/* Crosshair target — enhanced */}
              <svg className="absolute top-1/4 right-1/4 w-28 h-28 hidden xl:block" viewBox="0 0 80 80" style={{ animation: 'crosshair-pulse 4s ease-in-out infinite' }}>
                <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(173,255,47,0.08)" strokeWidth="0.8" strokeDasharray="6 4" style={{ animation: 'dash-march 2s linear infinite' }} />
                <circle cx="40" cy="40" r="20" fill="none" stroke="rgba(173,255,47,0.1)" strokeWidth="0.5" />
                <circle cx="40" cy="40" r="8" fill="none" stroke="rgba(255,107,43,0.1)" strokeWidth="0.5" strokeDasharray="2 3" />
                <line x1="40" y1="2" x2="40" y2="22" stroke="rgba(173,255,47,0.08)" strokeWidth="0.5" /><line x1="40" y1="58" x2="40" y2="78" stroke="rgba(173,255,47,0.08)" strokeWidth="0.5" />
                <line x1="2" y1="40" x2="22" y2="40" stroke="rgba(173,255,47,0.08)" strokeWidth="0.5" /><line x1="58" y1="40" x2="78" y2="40" stroke="rgba(173,255,47,0.08)" strokeWidth="0.5" />
              </svg>
              {/* Top checkerboard strip */}
              <div className="absolute top-0 left-0 w-full h-2 checkerboard opacity-20" />
              {/* Bottom accent neon line */}
              <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-volt/30 to-transparent" />
              <div className="absolute bottom-1 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyber/15 to-transparent" />
              {/* Data feed column */}
              <div className="absolute top-32 left-8 text-[9px] text-white/10 font-mono space-y-1 hidden xl:block">
                <div>SYS.INIT ████████ OK</div>
                <div>LAT: 42.8141</div>
                <div>LON: 73.8486</div>
                <div>NODE: KG-KB-075</div>
                <div>PROTO: HTTPS/2.0</div>
                <div>────────────</div>
                <div>PROMETHEUS.v2.0</div>
              </div>
              {/* Right edge data column */}
              <div className="absolute top-1/2 right-4 text-[8px] text-white/[0.06] font-mono text-right space-y-0.5 hidden xl:block" style={{ writingMode: 'vertical-rl' }}>
                KARA-BALTA // P.MOROZOVA 75 // 42°49'N 73°50'E // PROMETHEUS_SYSTEMS
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-20 relative z-10">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="animate-slide-up">
                  <div className="flex items-center gap-3 mb-6">
                    <PrometheusLogo size={28} />
                    <div className="w-16 h-0.5 bg-volt" />
                    <span className="text-[10px] text-volt/60 tracking-[0.4em]">{t.subtitle}</span>
                  </div>
                  <h1 className="mb-8">
                    <div className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.85]">
                      <span className="text-white">{t.heroLine1}</span>
                    </div>
                    <div className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.85]">
                      <span className="text-volt">{t.heroLine2}</span>
                    </div>
                    <div className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.85]">
                      <span className="text-white/20">{t.heroLine3}</span>
                    </div>
                  </h1>
                  <p className="text-[10px] text-white/30 tracking-[0.3em] mb-8 max-w-md">{t.heroSubline}</p>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => nav('catalog')}
                      className="group relative bg-volt text-dark px-8 py-4 text-xs font-black tracking-[0.2em] clip-badge hover:bg-white transition-colors">
                      <span className="flex items-center gap-2">{t.viewCatalog} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
                    </button>
                    <button onClick={() => nav('contact')}
                      className="relative border border-white/20 text-white/60 px-8 py-4 text-xs font-bold tracking-[0.2em] clip-badge hover:border-volt/50 hover:text-volt transition-all">
                      {t.contactUs}
                    </button>
                  </div>
                </div>

                <div className="hidden lg:block animate-fade-in">
                  <div className="relative">
                    <div className="bg-dark-2 border border-white/10 p-8 clip-notch-tr relative">
                      <Crosshairs color="border-volt/30" />
                      <div className="grid grid-cols-2 gap-6">
                        <div><div className="text-[9px] text-white/30 tracking-[0.2em] mb-1">PRODUCTS.COUNT</div><div className="text-4xl font-black text-volt">{products.length}</div></div>
                        <div><div className="text-[9px] text-white/30 tracking-[0.2em] mb-1">COMPLETED</div><div className="text-4xl font-black text-cyber">{siteSettings.completedOrdersCount}</div></div>
                        <div><div className="text-[9px] text-white/30 tracking-[0.2em] mb-1">IN.STOCK</div><div className="text-4xl font-black text-volt">{products.filter(p => p.status === 'in-stock').length}</div></div>
                        <div><div className="text-[9px] text-white/30 tracking-[0.2em] mb-1">REVIEWS</div><div className="text-4xl font-black text-white/60">{reviews.filter(r => r.approved).length}</div></div>
                      </div>
                      <div className="flex items-center gap-2 my-6"><div className="h-px flex-1 bg-white/10" /><div className="checkerboard w-8 h-2 opacity-30" /><div className="h-px flex-1 bg-white/10" /></div>
                      <div className="flex items-center gap-2 text-[10px] text-white/30"><Target className="w-3 h-3 text-cyber" /><span className="tracking-wider">{t.address}</span></div>
                      <div className="flex items-center gap-2 text-[10px] text-white/30 mt-1"><Clock className="w-3 h-3 text-volt" /><span className="tracking-wider">{t.workingHours}</span></div>
                    </div>
                    <div className="absolute -bottom-4 -left-4 bg-cyber text-dark px-4 py-2 clip-badge">
                      <div className="text-[9px] font-black tracking-[0.2em]">VERIFIED DEALER</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ════ PRODUCT DETAIL PAGE ════ */}
        {selectedProduct && (section === 'catalog' || section === 'hero') && (
          <div className="relative">
            <GeoProductDetail />
            <ProductDetailPage product={selectedProduct} lang={lang} t={t} categories={categories}
              onBack={() => { setSelectedProduct(null); if (section === 'hero') setSection('catalog'); }}
              onInquiry={(type) => { setInquiryProduct(selectedProduct); setInquiryType(type); }} />
          </div>
        )}

        {/* ════ CATALOG ════ */}
        {section === 'catalog' && !selectedProduct && (
          <section className="relative max-w-7xl mx-auto px-4 py-12" style={filterCat !== 'all' ? { background: `linear-gradient(180deg, ${activeCatColor}08 0%, transparent 300px)` } : undefined}>
            <GeoCatalog />
            {/* Catalog BG: Hex grid + accent geometry */}
            <div className="absolute inset-0 hex-grid-bg pointer-events-none overflow-hidden">
              {/* Vertical dashed guide line */}
              <svg className="absolute right-12 top-0 h-full w-px hidden xl:block" viewBox="0 0 1 1000" preserveAspectRatio="none">
                <line x1="0.5" y1="0" x2="0.5" y2="1000" stroke="rgba(173,255,47,0.05)" strokeWidth="1" strokeDasharray="6 8" style={{ animation: 'dash-march 3s linear infinite' }} />
              </svg>
              {/* Small corner bracket top-left */}
              <svg className="absolute top-8 left-4 w-8 h-8 hidden lg:block" viewBox="0 0 32 32">
                <path d="M0 12 L0 0 L12 0" fill="none" stroke="rgba(173,255,47,0.08)" strokeWidth="1" />
              </svg>
              {/* Small corner bracket bottom-right */}
              <svg className="absolute bottom-8 right-4 w-8 h-8 hidden lg:block" viewBox="0 0 32 32">
                <path d="M32 20 L32 32 L20 32" fill="none" stroke="rgba(173,255,47,0.08)" strokeWidth="1" />
              </svg>
              {/* Floating product count marker */}
              <div className="absolute top-16 right-8 text-[8px] text-white/[0.05] font-mono hidden xl:block">
                <div>ITEMS: {filteredProducts.length}/{products.length}</div>
                <div>INDEX: {filterCat === 'all' ? 'ALL' : filterCat.toUpperCase()}</div>
              </div>
            </div>
            <SectionHeader title={t.catalog} code="SEC.001 // PRODUCTS" />
            <div className="flex flex-wrap items-center gap-2 mb-8 pb-4 border-b border-white/5">
              <button onClick={() => setFilterCat('all')}
                className={`px-4 py-2 text-[10px] font-bold tracking-wider transition-all clip-badge-sm
                  ${filterCat === 'all' ? 'bg-volt text-dark' : 'bg-white/5 text-white/40 hover:text-white/70 border border-white/10'}`}>
                {lang === 'ru' ? 'ВСЕ' : 'ALL'} [{products.length}]
              </button>
              {categories.map(cat => {
                const count = products.filter(p => p.category === cat.id).length;
                return (
                  <button key={cat.id} onClick={() => setFilterCat(cat.id)}
                    className={`px-4 py-2 text-[10px] font-bold tracking-wider transition-all clip-badge-sm border`}
                    style={filterCat === cat.id
                      ? { background: cat.color, color: '#0A0A0A', borderColor: cat.color }
                      : { background: `${cat.color}10`, color: `${cat.color}AA`, borderColor: `${cat.color}30` }
                    }>
                    {(lang === 'ru' ? cat.name : cat.nameEn).toUpperCase()} [{count}]
                  </button>
                );
              })}
            </div>

            {/* 2-3 column grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredProducts.map((product, i) => (
                <div key={product.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <ProductCard product={product} lang={lang} t={t} categories={categories}
                    onClick={() => openProductPage(product)}
                    onInquiry={(type) => { setInquiryProduct(product); setInquiryType(type); }} />
                </div>
              ))}
            </div>
            {filteredProducts.length === 0 && <div className="text-center py-20 text-white/20 text-sm">{t.noData}</div>}
          </section>
        )}

        {/* ════ PROMOTIONS ════ */}
        {section === 'promos' && !selectedPromo && (
          <section className="relative max-w-7xl mx-auto px-4 py-12">
            <FloatingPromoBadges promotions={promotions} lang={lang} />
            {/* Promos BG: Circuit traces + gift icon glow */}
            <div className="absolute inset-0 circuit-bg pointer-events-none overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-cyber/[0.02] to-transparent" />
              {/* Dashed perimeter frame */}
              <svg className="absolute inset-4 w-[calc(100%-32px)] h-[calc(100%-32px)] hidden lg:block" viewBox="0 0 800 600" preserveAspectRatio="none">
                <rect x="1" y="1" width="798" height="598" fill="none" stroke="rgba(255,107,43,0.04)" strokeWidth="0.5" strokeDasharray="12 8" rx="0" style={{ animation: 'dash-march 4s linear infinite' }} />
              </svg>
              {/* Decorative crosshair */}
              <svg className="absolute bottom-12 right-12 w-16 h-16 hidden xl:block" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="20" fill="none" stroke="rgba(255,107,43,0.06)" strokeWidth="0.5" />
                <line x1="32" y1="8" x2="32" y2="24" stroke="rgba(255,107,43,0.05)" strokeWidth="0.5" />
                <line x1="32" y1="40" x2="32" y2="56" stroke="rgba(255,107,43,0.05)" strokeWidth="0.5" />
                <line x1="8" y1="32" x2="24" y2="32" stroke="rgba(255,107,43,0.05)" strokeWidth="0.5" />
                <line x1="40" y1="32" x2="56" y2="32" stroke="rgba(255,107,43,0.05)" strokeWidth="0.5" />
              </svg>
            </div>
            <SectionHeader title={t.promoTitle} code="SEC.005 // PROMOS" accent="text-cyber" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {promotions.map((promo, i) => (
                <button key={promo.id} onClick={() => { setSelectedPromo(promo); window.scrollTo(0, 0); }}
                  className="text-left relative bg-dark-2 border border-white/5 hover:border-cyber/30 transition-all group card-hover animate-slide-up"
                  style={{ animationDelay: `${i * 0.1}s` }}>
                  <Crosshairs color="border-white/10 group-hover:border-cyber/40" />
                  {promo.coverUrl ? (
                    <div className="h-40 overflow-hidden">
                      <img src={promo.coverUrl} alt="" className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" />
                    </div>
                  ) : (
                    <div className="h-40 bg-gradient-to-br from-cyber/10 to-volt/5 flex items-center justify-center">
                      <Gift className="w-12 h-12 text-cyber/30" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="checkerboard w-3 h-3 opacity-30" />
                      <DataTag variant="cyber">PROMO</DataTag>
                    </div>
                    <h3 className="text-sm font-black text-white tracking-wider group-hover:text-cyber transition-colors">
                      {lang === 'ru' ? promo.title : promo.titleEn}
                    </h3>
                    <p className="text-[10px] text-white/30 mt-2 line-clamp-2">
                      {lang === 'ru' ? promo.description : promo.descriptionEn}
                    </p>
                    {/* Promo stats */}
                    <div className="flex items-center gap-4 mt-3 text-[9px]">
                      <span className="flex items-center gap-1 text-cyber/60">
                        <Users className="w-3 h-3" /> {promo.usersCount} {t.people}
                      </span>
                      <span className="flex items-center gap-1 text-volt/60">
                        <TrendingUp className="w-3 h-3" /> {fmt(promo.totalSaved)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-[9px] text-cyber/60">
                      <span>{promo.productRewards.length} {lang === 'ru' ? 'товаров' : 'products'}</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ════ PROMO DETAIL ════ */}
        {section === 'promos' && selectedPromo && (
          <section className="relative max-w-7xl mx-auto px-4 py-12 animate-fade-in">
            <FloatingRewards promo={selectedPromo} products={products} />
            <div className="absolute inset-0 diag-scan-bg pointer-events-none" />
            <button onClick={() => setSelectedPromo(null)}
              className="flex items-center gap-2 text-xs text-white/40 hover:text-volt mb-6 transition-colors">
              <ChevronLeft className="w-4 h-4" /> {t.back}
            </button>
            {selectedPromo.coverUrl && (
              <div className="h-64 mb-6 overflow-hidden border border-white/5">
                <img src={selectedPromo.coverUrl} alt="" className="w-full h-full object-cover opacity-80" />
              </div>
            )}
            <div className="flex items-center gap-3 mb-4">
              <Gift className="w-5 h-5 text-cyber" />
              <DataTag variant="cyber">PROMO</DataTag>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-cyber mb-4">
              {lang === 'ru' ? selectedPromo.title : selectedPromo.titleEn}
            </h1>

            {/* Stats bar */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="bg-cyber/10 border border-cyber/20 px-4 py-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-cyber" />
                <div>
                  <div className="text-[9px] text-white/30">{t.promoUsersCount}</div>
                  <div className="text-sm font-black text-cyber">{selectedPromo.usersCount} {t.people}</div>
                </div>
              </div>
              <div className="bg-volt/10 border border-volt/20 px-4 py-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-volt" />
                <div>
                  <div className="text-[9px] text-white/30">{t.promoTotalSaved}</div>
                  <div className="text-sm font-black text-volt">{fmt(selectedPromo.totalSaved)}</div>
                </div>
              </div>
            </div>

            <div className="bg-dark-2 border border-white/5 p-6 mb-8 relative">
              <Crosshairs color="border-cyber/20" />
              <p className="text-sm text-white/60 leading-relaxed">
                {lang === 'ru' ? selectedPromo.description : selectedPromo.descriptionEn}
              </p>
            </div>

            <h3 className="text-sm font-black tracking-[0.2em] text-volt mb-4">{t.productsInPromo}</h3>
            <div className="space-y-3">
              {selectedPromo.productRewards.map(pr => {
                const prod = products.find(p => p.id === pr.productId);
                if (!prod) return null;
                return (
                  <div key={pr.productId} className="bg-dark-2 border border-white/5 p-4 flex items-center justify-between hover:border-volt/20 transition-all card-hover">
                    <div className="flex items-center gap-4">
                      {prod.photos[0] && <img src={prod.photos[0]} alt="" className="w-16 h-12 object-cover border border-white/10" />}
                      <div>
                        <div className="text-xs font-bold text-white">{lang === 'ru' ? prod.name : prod.nameEn}</div>
                        <div className="text-[10px] text-white/30">{fmt(prod.price)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] text-white/30 tracking-wider">{t.rewardPerSale}</div>
                      <div className="text-lg font-black text-cyber">{fmt(pr.reward)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ════ ABOUT ════ */}
        {section === 'about' && (
          <section className="relative max-w-7xl mx-auto px-4 py-12">
            <GeoAbout />
            {/* About BG: Topographic contour + shield mark */}
            <div className="absolute inset-0 topo-bg pointer-events-none overflow-hidden">
              <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-volt/[0.01] to-transparent" />
              {/* Shield watermark */}
              <svg className="absolute top-1/3 right-8 w-32 h-32 hidden xl:block" viewBox="0 0 128 128" style={{ opacity: 0.03 }}>
                <path d="M64 8 L112 32 V72 C112 96 88 116 64 124 C40 116 16 96 16 72 V32 Z" fill="none" stroke="white" strokeWidth="2" />
                <path d="M64 24 L96 40 V68 C96 84 80 100 64 108 C48 100 32 84 32 68 V40 Z" fill="none" stroke="white" strokeWidth="1" />
                <path d="M52 60 L60 72 L80 48" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {/* Dot matrix cluster */}
              <div className="absolute bottom-20 left-8 hidden xl:block" style={{ opacity: 0.04 }}>
                {Array.from({ length: 5 }).map((_, r) => (
                  <div key={r} className="flex gap-2 mb-2">
                    {Array.from({ length: 8 }).map((_, c) => (
                      <div key={c} className="w-1 h-1 bg-volt rounded-full" />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <SectionHeader title={t.about} code="SEC.002 // INFORMATION" />

            {/* Completed orders banner */}
            <div className="bg-gradient-to-r from-cyber/10 to-volt/5 border border-cyber/20 p-6 mb-8 relative clip-notch-tr">
              <Crosshairs color="border-cyber/30" />
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-cyber/20 clip-badge flex items-center justify-center">
                  <Award className="w-8 h-8 text-cyber" />
                </div>
                <div>
                  <div className="text-[9px] text-white/30 tracking-[0.2em] mb-1">{t.completedOrders}</div>
                  <div className="text-4xl font-black text-cyber">{siteSettings.completedOrdersCount}+</div>
                  <div className="text-[10px] text-white/40 mt-1">{t.completedOrdersDesc}</div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: ShieldCheck, title: t.trustTitle, desc: t.trustDesc, accent: 'volt' as const },
                { icon: Truck, title: t.deliveryTitle, desc: t.deliveryDesc, accent: 'cyber' as const },
                { icon: Package, title: t.qualityTitle, desc: t.qualityDesc, accent: 'volt' as const },
                { icon: Cpu, title: t.supportTitle, desc: t.supportDesc, accent: 'cyber' as const },
              ].map((item, i) => (
                <div key={i} className="relative bg-dark-2/85 backdrop-blur-sm border border-white/5 p-6 group hover:border-volt/20 transition-all card-hover animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  <Crosshairs color="border-white/10" />
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 flex items-center justify-center clip-badge shrink-0 ${item.accent === 'volt' ? 'bg-volt/10' : 'bg-cyber/10'}`}>
                      <item.icon className={`w-5 h-5 ${item.accent === 'volt' ? 'text-volt' : 'text-cyber'}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black tracking-wider text-white mb-2">{item.title}</h3>
                      <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 bg-dark-3/90 backdrop-blur-sm border border-white/10 p-6 relative clip-notch-tr">
              <Crosshairs color="border-cyber/30" />
              <div className="flex items-center gap-3 mb-4">
                <div className="checkerboard w-4 h-4 opacity-30" />
                <h3 className="text-sm font-black tracking-[0.2em] text-cyber">{t.delivery}</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-volt/5 border border-volt/10 p-4 clip-badge-sm">
                  <CheckCircle className="w-5 h-5 text-volt shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white">{lang === 'ru' ? 'Кара-Балта' : 'Kara-Balta'}</div>
                    <div className="text-[10px] text-white/40">{t.shippingKb}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-cyber/5 border border-cyber/10 p-4 clip-badge-sm">
                  <AlertTriangle className="w-5 h-5 text-cyber shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white">{lang === 'ru' ? 'Бишкек' : 'Bishkek'}</div>
                    <div className="text-[10px] text-white/40">{t.shippingBishkek}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ════ REVIEWS ════ */}
        {section === 'reviews' && (
          <section className="relative max-w-7xl mx-auto px-4 py-12">
            <GeoReviews />
            {/* Reviews BG: Dot matrix + star constellation */}
            <div className="absolute inset-0 dot-matrix-bg pointer-events-none overflow-hidden">
              {/* Star decorations */}
              <svg className="absolute top-16 right-16 w-24 h-24 hidden xl:block" viewBox="0 0 96 96" style={{ opacity: 0.05, animation: 'drift-y 14s ease-in-out infinite' }}>
                <polygon points="48,4 54,36 88,36 60,56 68,88 48,68 28,88 36,56 8,36 42,36" fill="none" stroke="rgb(255,107,43)" strokeWidth="0.8" />
              </svg>
              <svg className="absolute bottom-24 left-12 w-16 h-16 hidden lg:block" viewBox="0 0 64 64" style={{ opacity: 0.04, animation: 'drift-x 16s ease-in-out infinite' }}>
                <polygon points="32,4 36,24 56,24 40,36 44,56 32,44 20,56 24,36 8,24 28,24" fill="none" stroke="rgb(255,107,43)" strokeWidth="0.6" />
              </svg>
              {/* Horizontal scan line */}
              <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyber/[0.06] to-transparent" />
              {/* Rating bar watermark */}
              <div className="absolute top-1/4 left-4 flex gap-1 hidden xl:block" style={{ opacity: 0.03 }}>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-3 h-3 border border-white" style={{ opacity: i < 4 ? 1 : 0.3 }} />
                  ))}
                </div>
              </div>
            </div>
            <SectionHeader title={t.reviews} code="SEC.003 // FEEDBACK" />
            <div className="flex justify-end mb-6">
              <button onClick={() => setShowReviewModal(true)}
                className="bg-cyber text-dark px-6 py-3 text-[10px] font-black tracking-[0.2em] clip-badge flex items-center gap-2 hover:bg-cyber/80 transition-colors">
                <Star className="w-4 h-4" /> {t.submitReview}
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {reviews.filter(r => r.approved).map((review, i) => (
                <div key={review.id} className="relative bg-dark-2/85 backdrop-blur-sm border border-white/5 p-5 hover:border-volt/10 transition-all card-hover animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <Crosshairs color="border-white/5" />
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-volt/10 clip-badge flex items-center justify-center">
                        <span className="text-volt font-black text-xs">{review.author[0]}</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{review.author}</div>
                        <div className="text-[9px] text-white/30">{review.date}</div>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: review.rating }).map((_, i2) => (
                        <Star key={i2} className="w-3 h-3 fill-cyber text-cyber" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">{lang === 'ru' ? review.text : review.textEn}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-white/20">
              <Eye className="w-3 h-3" /> {t.moderated}
            </div>
          </section>
        )}

        {/* ════ CONTACT ════ */}
        {section === 'contact' && (
          <section className="relative max-w-7xl mx-auto px-4 py-12">
            <GeoContact />
            {/* Contact BG: Radar sweep + coordinate grid */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {/* Radar circles */}
              <div className="absolute -top-20 -left-20 hidden xl:block">
                <div className="w-80 h-80 relative">
                  <div className="absolute inset-0 border border-volt/[0.04] rounded-full" />
                  <div className="absolute inset-8 border border-volt/[0.05] rounded-full" />
                  <div className="absolute inset-16 border border-volt/[0.06] rounded-full" />
                  <div className="absolute inset-24 border border-volt/[0.07] rounded-full" />
                  {/* Sweep line */}
                  <div className="absolute inset-0 flex items-center justify-center" style={{ animation: 'radar-sweep 8s linear infinite' }}>
                    <div className="w-1/2 h-px bg-gradient-to-r from-volt/20 to-transparent origin-left" />
                  </div>
                  {/* Center dot */}
                  <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-volt/20 rounded-full -translate-x-1 -translate-y-1" />
                </div>
              </div>
              {/* Coordinate cross */}
              <svg className="absolute bottom-8 right-8 w-20 h-20 hidden lg:block" viewBox="0 0 80 80" style={{ opacity: 0.04 }}>
                <line x1="40" y1="0" x2="40" y2="80" stroke="white" strokeWidth="0.5" />
                <line x1="0" y1="40" x2="80" y2="40" stroke="white" strokeWidth="0.5" />
                <circle cx="40" cy="40" r="3" fill="none" stroke="white" strokeWidth="0.5" />
                <text x="44" y="14" fill="white" fontSize="6" fontFamily="monospace">N</text>
                <text x="66" y="44" fill="white" fontSize="6" fontFamily="monospace">E</text>
              </svg>
              {/* Lat/Lng labels */}
              <div className="absolute bottom-4 left-4 text-[7px] text-white/[0.04] font-mono hidden xl:block">
                42.8141°N 73.8486°E // KARA-BALTA_KG
              </div>
            </div>
            <SectionHeader title={t.contact} code="SEC.004 // LOCATION" />
            <div className="grid md:grid-cols-2 gap-4">
              {/* Addresses */}
              <div className="relative bg-dark-2/85 backdrop-blur-sm border border-white/5 p-6 card-hover">
                <Crosshairs color="border-volt/20" />
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-volt" />
                  <span className="text-xs font-black tracking-wider">{lang === 'ru' ? 'АДРЕСА' : 'ADDRESSES'}</span>
                </div>
                <div className="space-y-3">
                  {addresses.map(addr => (
                    <div key={addr.id} className="bg-dark-3 border border-white/5 p-3 hover:border-volt/10 transition-all">
                      <div className="text-xs font-bold text-white">{lang === 'ru' ? addr.name : addr.nameEn}</div>
                      <p className="text-[10px] text-white/50 mt-1">{lang === 'ru' ? addr.address : addr.addressEn}</p>
                      <div className="flex items-center gap-3 mt-2 text-[9px] text-white/30">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {lang === 'ru' ? addr.workDays : addr.workDaysEn} {addr.workTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contacts */}
              <div className="relative bg-dark-2 border border-white/5 p-6 card-hover">
                <Crosshairs color="border-cyber/20" />
                <div className="flex items-center gap-2 mb-4">
                  <Phone className="w-4 h-4 text-volt" />
                  <span className="text-xs font-black tracking-wider">{lang === 'ru' ? 'СВЯЗЬ' : 'CONTACTS'}</span>
                </div>
                <div className="space-y-3">
                  <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 text-xs text-white/60 hover:text-green-400 transition-colors bg-dark-3 border border-white/5 p-3 hover:border-green-500/30">
                    <MessageCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="font-bold">WhatsApp</div>
                      <div className="text-[10px] text-white/30">+996 508 752 775</div>
                    </div>
                    <ExternalLink className="w-3 h-3 ml-auto text-white/20" />
                  </a>
                  <a href={`https://t.me/${TG_HANDLE}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 text-xs text-white/60 hover:text-blue-400 transition-colors bg-dark-3 border border-white/5 p-3 hover:border-blue-500/30">
                    <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295l.213-3.053 5.56-5.023c.242-.217-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.94z"/>
                    </svg>
                    <div>
                      <div className="font-bold">Telegram</div>
                      <div className="text-[10px] text-white/30">@KALLISTO_75</div>
                    </div>
                    <ExternalLink className="w-3 h-3 ml-auto text-white/20" />
                  </a>
                </div>
              </div>

              {/* Delivery */}
              <div className="relative bg-dark-2 border border-white/5 p-6 card-hover">
                <Crosshairs color="border-volt/20" />
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="w-4 h-4 text-cyber" />
                  <span className="text-xs font-black tracking-wider">{t.delivery}</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-volt mt-0.5 shrink-0" /><span className="text-xs text-white/50">{t.shippingKb}</span></div>
                  <div className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-cyber mt-0.5 shrink-0" /><span className="text-xs text-white/50">{t.shippingBishkek}</span></div>
                </div>
              </div>

              {/* Map */}
              <div className="relative bg-dark-2 border border-white/5 p-6 card-hover">
                <Crosshairs color="border-white/10" />
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-4 h-4 text-white/40" />
                  <span className="text-xs font-black tracking-wider">{t.mapTitle}</span>
                </div>
                <div className="bg-dark-3 border border-white/5 overflow-hidden" style={{ height: '200px' }}>
                  <iframe
                    title="Map"
                    width="100%" height="100%"
                    style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(0.9) contrast(1.1)' }}
                    loading="lazy"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${(addresses[0]?.lng || 73.8486) - 0.01}%2C${(addresses[0]?.lat || 42.8141) - 0.005}%2C${(addresses[0]?.lng || 73.8486) + 0.01}%2C${(addresses[0]?.lat || 42.8141) + 0.005}&layer=mapnik&marker=${addresses[0]?.lat || 42.8141}%2C${addresses[0]?.lng || 73.8486}`}
                  />
                </div>
                <div className="mt-2 text-[9px] text-white/20">
                  {addresses.map(a => (
                    <div key={a.id} className="flex items-center gap-1">
                      <Target className="w-2 h-2 text-volt" /> {a.lat.toFixed(4)}°N, {a.lng.toFixed(4)}°E — {lang === 'ru' ? a.name : a.nameEn}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ════ ADMIN ════ */}
        {section === 'admin' && (
          <section className="relative max-w-7xl mx-auto px-4 py-12">
            <GeoAdmin />
            {/* Admin BG: Crosshatch + terminal matrix */}
            <div className="absolute inset-0 crosshatch pointer-events-none overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1/4 bg-gradient-to-b from-cyber/[0.015] to-transparent" />
              {/* Warning stripe */}
              <div className="absolute top-4 right-4 hidden xl:block" style={{ opacity: 0.04 }}>
                <div className="flex gap-1">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="w-3 h-6" style={{ background: i % 2 === 0 ? 'rgb(255,107,43)' : 'transparent' }} />
                  ))}
                </div>
              </div>
              {/* Lock icon watermark */}
              <svg className="absolute bottom-16 right-12 w-20 h-20 hidden xl:block" viewBox="0 0 80 80" style={{ opacity: 0.02 }}>
                <rect x="16" y="36" width="48" height="36" rx="4" fill="none" stroke="white" strokeWidth="2" />
                <path d="M28 36 V24 C28 14 52 14 52 24 V36" fill="none" stroke="white" strokeWidth="2" />
                <circle cx="40" cy="54" r="4" fill="white" />
              </svg>
              {/* Binary data watermark */}
              <div className="absolute top-1/3 left-2 text-[7px] text-white/[0.03] font-mono leading-tight hidden xl:block select-none" style={{ animation: 'data-scroll 20s linear infinite' }}>
                01001011 01000111<br/>
                01010000 01010010<br/>
                01001111 01001101<br/>
                01000101 01010100<br/>
                01001000 01000101<br/>
                01010101 01010011<br/>
                01001011 01000111<br/>
                01010000 01010010<br/>
                01001111 01001101<br/>
                01000101 01010100<br/>
                01001000 01000101<br/>
                01010101 01010011<br/>
              </div>
            </div>
            <SectionHeader title={t.adminPanel} code="SEC.ADM // RESTRICTED" accent="text-cyber" />

            {/* Admin Login Gate */}
            {!isAdmin ? (
              <div className="bg-dark-2 border border-white/10 p-12 max-w-md mx-auto text-center animate-fade-in">
                <Crosshairs color="border-cyber/30" />
                <Lock className="w-12 h-12 text-white/20 mx-auto mb-6" />
                <h3 className="text-sm font-black tracking-[0.2em] text-cyber mb-6">{t.enterPassword}</h3>
                <input type="email" value={adminEmail} onChange={e => { setAdminEmail(e.target.value); setPasswordError(''); }}
                  placeholder="Email"
                  disabled={cooldownLeft > 0 || authLoading}
                  className="w-full bg-dark-3 border border-white/10 focus:border-cyber px-4 py-3 text-white text-xs mb-3 transition-colors text-center tracking-[0.1em]" />
                <input type="password" value={adminPassword} onChange={e => { setAdminPassword(e.target.value); setPasswordError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
                  placeholder={t.passwordPlaceholder}
                  disabled={cooldownLeft > 0 || authLoading}
                  className="w-full bg-dark-3 border border-white/10 focus:border-cyber px-4 py-3 text-white text-xs mb-4 transition-colors text-center tracking-[0.2em]" />
                {passwordError && <p className="text-red-400 text-[10px] mb-4">{passwordError}</p>}
                {cooldownLeft > 0 && (
                  <p className="text-amber-400 text-[10px] mb-4 font-mono">
                    ⛔ Кулдаун: {Math.floor(cooldownLeft / 60000)}:{String(Math.floor((cooldownLeft % 60000) / 1000)).padStart(2, '0')}
                  </p>
                )}
                <button onClick={handleAdminLogin}
                  disabled={cooldownLeft > 0 || authLoading}
                  className={`w-full py-3 text-xs font-black tracking-[0.2em] clip-badge transition-colors
                    ${cooldownLeft > 0 || authLoading ? 'bg-white/10 text-white/30 cursor-not-allowed' : 'bg-cyber text-dark hover:bg-cyber/80'}`}>
                  {authLoading ? 'ВХОД...' : t.login}
                </button>
              </div>
            ) : (
              <>
                {/* Admin bar */}
                <div className="bg-dark-2 border border-white/10 p-4 mb-6 flex items-center justify-between clip-badge">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-cyber" />
                    <span className="text-xs font-bold tracking-wider text-cyber">{t.adminMode}</span>
                    {(newOrdersCount + newReviewsCount) > 0 && (
                      <span className="flex items-center gap-1 text-[9px] text-red-400 bg-red-500/10 px-2 py-1 rounded">
                        <Bell className="w-3 h-3" /> {newOrdersCount + newReviewsCount} new
                      </span>
                    )}
                  </div>
                  <button onClick={handleAdminLogout}
                    className="px-6 py-2 text-[10px] font-black tracking-[0.2em] clip-badge-sm bg-white/10 text-white/60 hover:bg-white/20 transition-all">
                    {t.logout}
                  </button>
                </div>

                {/* Admin tabs */}
                <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
                  {(['orders', 'products', 'categories', 'reviews', 'promos', 'addresses', 'settings', 'analytics'] as const).map(tab => (
                    <button key={tab} onClick={() => {
                      setAdminTab(tab);
                      // Mark orders as seen when visiting orders tab
                      if (tab === 'orders') orders.forEach(o => o.isNew && markOrderSeen(o.id));
                    }}
                      className={`px-5 py-3 text-[10px] font-bold tracking-[0.15em] transition-all whitespace-nowrap clip-badge-sm relative
                        ${adminTab === tab ? 'bg-cyber text-dark' : 'bg-white/5 text-white/30 hover:bg-white/10'}`}>
                      {tab === 'orders' ? t.manageOrders : tab === 'products' ? t.manageProducts : tab === 'categories' ? t.manageCategories
                        : tab === 'reviews' ? t.manageReviews : tab === 'promos' ? t.managePromos
                        : tab === 'addresses' ? t.manageAddresses : tab === 'settings' ? t.settings : t.analytics}
                      {tab === 'orders' && newOrdersCount > 0 && <NotifBadge count={newOrdersCount} />}
                      {tab === 'reviews' && newReviewsCount > 0 && <NotifBadge count={newReviewsCount} />}
                    </button>
                  ))}
                </div>

                {/* ── Orders tab ── */}
                {adminTab === 'orders' && (
                  <div className="bg-dark-2 border border-white/5 overflow-hidden animate-fade-in">
                    {orders.length === 0 ? (
                      <div className="text-center py-12 text-white/20 text-sm">{t.noData}</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead><tr className="bg-white/5">
                            <th className="text-left p-3 text-white/30 font-bold tracking-wider">{t.orderDate}</th>
                            <th className="text-left p-3 text-white/30 font-bold tracking-wider">{t.orderProduct}</th>
                            <th className="text-left p-3 text-white/30 font-bold tracking-wider">{t.orderPhone}</th>
                            <th className="text-left p-3 text-white/30 font-bold tracking-wider">{t.orderMessenger}</th>
                            <th className="text-left p-3 text-white/30 font-bold tracking-wider">{t.status}</th>
                            <th className="text-left p-3 text-white/30 font-bold tracking-wider">{t.actions}</th>
                          </tr></thead>
                          <tbody>
                            {orders.map(o => (
                              <tr key={o.id} className={`border-t border-white/5 hover:bg-white/[0.02] ${o.isNew ? 'bg-cyber/5' : ''}`}>
                                <td className="p-3 text-white/40">{o.date}</td>
                                <td className="p-3 text-white/80 font-bold">{o.productName}</td>
                                <td className="p-3 text-volt font-bold">{o.phone}</td>
                                <td className="p-3"><DataTag variant={o.messenger === 'whatsapp' ? 'volt' : 'blue'}>{o.messenger.toUpperCase()}</DataTag></td>
                                <td className="p-3">
                                  <DataTag variant={o.status === 'new' ? 'cyber' : o.status === 'completed' ? 'volt' : 'red'}>
                                    {o.status === 'new' ? t.orderNew : o.status === 'completed' ? t.orderCompleted : t.orderCancelled}
                                  </DataTag>
                                </td>
                                <td className="p-3">
                                  <div className="flex gap-1">
                                    {o.status === 'new' && (
                                      <>
                                        <button onClick={() => completeOrder(o.id)} className="p-1.5 bg-white/5 hover:bg-volt/20 text-white/40 hover:text-volt transition-all" title={t.markCompleted}>
                                          <CheckCircle className="w-3 h-3" />
                                        </button>
                                        <button onClick={() => cancelOrder(o.id)} className="p-1.5 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all" title={t.markCancelled}>
                                          <XCircle className="w-3 h-3" />
                                        </button>
                                      </>
                                    )}
                                    <button onClick={() => deleteOrder(o.id)} className="p-1.5 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all" title={t.delete}>
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Products tab */}
                {adminTab === 'products' && (
                  <div className="animate-fade-in">
                    {editingProduct && (
                      <ProductEditForm product={editingProduct} t={t} categories={categories}
                        onSave={saveProduct} onCancel={() => setEditingProduct(null)} />
                    )}
                    {!editingProduct && (
                      <div className="flex justify-end mb-4">
                        <button
                          onClick={() => setEditingProduct({
                            id: `p-${Date.now()}`,
                            name: '', nameEn: '',
                            price: 0, marketAverage: 0, marketLowest: 0,
                            tags: [], tagsEn: [],
                            status: 'in-stock',
                            category: categories[0]?.id || '',
                            specs: [], specsEn: [],
                            serial: `SN-NEW-${Date.now()}`,
                            photos: [],
                            description: '', descriptionEn: '',
                          })}
                          className="flex items-center gap-2 bg-volt text-dark px-6 py-3 text-[10px] font-black tracking-[0.2em] clip-badge hover:bg-white transition-colors">
                          <Plus className="w-4 h-4" /> {t.addProduct || 'ДОБАВИТЬ ТОВАР'}
                        </button>
                      </div>
                    )}
                    <div className="bg-dark-2 border border-white/5 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-white/5">
                              <th className="text-left p-3 text-white/30 font-bold tracking-wider">S/N</th>
                              <th className="text-left p-3 text-white/30 font-bold tracking-wider">{lang === 'ru' ? 'НАЗВАНИЕ' : 'NAME'}</th>
                              <th className="text-left p-3 text-white/30 font-bold tracking-wider">{t.price}</th>
                              <th className="text-left p-3 text-white/30 font-bold tracking-wider">{t.status}</th>
                              <th className="text-left p-3 text-white/30 font-bold tracking-wider">{t.actions}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {products.map(p => (
                              <tr key={p.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                                <td className="p-3 text-white/20">{p.serial}</td>
                                <td className="p-3 text-white/80 font-bold">{lang === 'ru' ? p.name : p.nameEn}</td>
                                <td className="p-3 text-volt font-bold">{fmt(p.price)}</td>
                                <td className="p-3"><DataTag variant={p.status === 'in-stock' ? 'volt' : 'cyber'}>{p.status === 'in-stock' ? t.inStock : t.preOrder}</DataTag></td>
                                <td className="p-3">
                                  <div className="flex gap-1">
                                    <button onClick={() => setEditingProduct({ ...p })} className="p-1.5 bg-white/5 hover:bg-volt/20 text-white/40 hover:text-volt transition-all" title={t.edit}><Edit3 className="w-3 h-3" /></button>
                                    <button onClick={() => toggleStatus(p.id)} className="p-1.5 bg-white/5 hover:bg-cyber/20 text-white/40 hover:text-cyber transition-all" title={t.status}><Activity className="w-3 h-3" /></button>
                                    <button onClick={() => deleteProduct(p.id)} className="p-1.5 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all" title={t.delete}><Trash2 className="w-3 h-3" /></button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Categories tab */}
                {adminTab === 'categories' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {categories.map(cat => (
                        <div key={cat.id} className="relative bg-dark-2 border border-white/5 p-4" style={{ borderLeftColor: cat.color, borderLeftWidth: '3px' }}>
                          {editingCategory?.id === cat.id ? (
                            <div className="space-y-2">
                              <input value={editingCategory.name} onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                className="w-full bg-dark-3 border border-white/10 px-3 py-2 text-xs text-white focus:border-volt transition-colors" placeholder={t.categoryName} />
                              <input value={editingCategory.nameEn} onChange={e => setEditingCategory({ ...editingCategory, nameEn: e.target.value })}
                                className="w-full bg-dark-3 border border-white/10 px-3 py-2 text-xs text-white focus:border-volt transition-colors" placeholder={t.categoryNameEn} />
                              <div className="flex items-center gap-2">
                                <label className="text-[10px] text-white/30">{t.categoryColor}</label>
                                <input type="color" value={editingCategory.color} onChange={e => setEditingCategory({ ...editingCategory, color: e.target.value })}
                                  className="w-8 h-8 bg-transparent border border-white/10 rounded" />
                                <span className="text-[9px] text-white/30 font-mono">{editingCategory.color}</span>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => saveCategoryEdit(editingCategory)} className="flex-1 bg-volt text-dark py-2 text-[10px] font-bold tracking-wider flex items-center justify-center gap-1"><Save className="w-3 h-3" /> {t.save}</button>
                                <button onClick={() => setEditingCategory(null)} className="px-3 py-2 bg-white/5 text-white/40 text-[10px] font-bold tracking-wider">{t.cancel}</button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-sm" style={{ background: cat.color }} />
                                <div>
                                  <div className="text-xs font-bold text-white tracking-wider">{cat.name}</div>
                                  <div className="text-[10px] text-white/30">{cat.nameEn}</div>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <button onClick={() => setEditingCategory({ ...cat })} className="p-1.5 bg-white/5 hover:bg-volt/20 text-white/40 hover:text-volt transition-all"><Edit3 className="w-3 h-3" /></button>
                                <button onClick={() => deleteCategory(cat.id)} className="p-1.5 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all"><Trash2 className="w-3 h-3" /></button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {showNewCategory ? (
                        <div className="bg-dark-2 border border-volt/20 p-4 space-y-2">
                          <input value={newCategoryForm.name} onChange={e => setNewCategoryForm({ ...newCategoryForm, name: e.target.value })}
                            className="w-full bg-dark-3 border border-white/10 px-3 py-2 text-xs text-white focus:border-volt transition-colors" placeholder={t.categoryName} />
                          <input value={newCategoryForm.nameEn} onChange={e => setNewCategoryForm({ ...newCategoryForm, nameEn: e.target.value })}
                            className="w-full bg-dark-3 border border-white/10 px-3 py-2 text-xs text-white focus:border-volt transition-colors" placeholder={t.categoryNameEn} />
                          <div className="flex items-center gap-2">
                            <label className="text-[10px] text-white/30">{t.categoryColor}</label>
                            <input type="color" value={newCategoryForm.color} onChange={e => setNewCategoryForm({ ...newCategoryForm, color: e.target.value })}
                              className="w-8 h-8 bg-transparent border border-white/10 rounded" />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={addCategory} className="flex-1 bg-volt text-dark py-2 text-[10px] font-bold tracking-wider flex items-center justify-center gap-1"><Plus className="w-3 h-3" /> {t.save}</button>
                            <button onClick={() => setShowNewCategory(false)} className="px-3 py-2 bg-white/5 text-white/40 text-[10px] font-bold">{t.cancel}</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setShowNewCategory(true)}
                          className="border border-dashed border-white/10 hover:border-volt/30 p-4 flex items-center justify-center gap-2 text-white/30 hover:text-volt transition-all">
                          <Plus className="w-4 h-4" /><span className="text-[10px] font-bold tracking-wider">{t.addCategory}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Reviews tab */}
                {adminTab === 'reviews' && (
                  <div className="bg-dark-2 border border-white/5 overflow-hidden animate-fade-in">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead><tr className="bg-white/5">
                          <th className="text-left p-3 text-white/30 font-bold tracking-wider">{t.author}</th>
                          <th className="text-left p-3 text-white/30 font-bold tracking-wider">{t.rating}</th>
                          <th className="text-left p-3 text-white/30 font-bold tracking-wider">{lang === 'ru' ? 'ТЕКСТ' : 'TEXT'}</th>
                          <th className="text-left p-3 text-white/30 font-bold tracking-wider">{t.status}</th>
                          <th className="text-left p-3 text-white/30 font-bold tracking-wider">{t.actions}</th>
                        </tr></thead>
                        <tbody>
                          {reviews.map(r => (
                            <tr key={r.id} className={`border-t border-white/5 hover:bg-white/[0.02] ${r.isNew ? 'bg-cyber/5' : ''}`}>
                              <td className="p-3 text-white/80 font-bold">{r.author}</td>
                              <td className="p-3"><div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-cyber text-cyber" />)}</div></td>
                              <td className="p-3 text-white/40 max-w-[200px] truncate">{r.text}</td>
                              <td className="p-3"><DataTag variant={r.approved ? 'volt' : 'cyber'}>{r.approved ? t.approved : t.pending}</DataTag></td>
                              <td className="p-3">
                                <div className="flex gap-1">
                                  {!r.approved && <button onClick={() => approveReview(r.id)} className="p-1.5 bg-white/5 hover:bg-volt/20 text-white/40 hover:text-volt transition-all" title={t.approve}><CheckCircle className="w-3 h-3" /></button>}
                                  <button onClick={() => deleteReview(r.id)} className="p-1.5 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all" title={t.delete}><Trash2 className="w-3 h-3" /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Promos tab */}
                {adminTab === 'promos' && (
                  <div className="space-y-4 animate-fade-in">
                    {editingPromo && (
                      <PromoEditForm promo={editingPromo} t={t} products={products} lang={lang}
                        onSave={savePromoEdit} onCancel={() => setEditingPromo(null)} />
                    )}
                    {promotions.map(promo => (
                      <div key={promo.id} className="bg-dark-2 border border-white/5 p-4 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white">{promo.title}</div>
                          <div className="text-[10px] text-white/30">{promo.productRewards.length} {lang === 'ru' ? 'товаров' : 'products'} • {promo.usersCount} {t.people} • {fmt(promo.totalSaved)}</div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => setEditingPromo({ ...promo })} className="p-1.5 bg-white/5 hover:bg-volt/20 text-white/40 hover:text-volt transition-all"><Edit3 className="w-3 h-3" /></button>
                          <button onClick={() => deletePromo(promo.id)} className="p-1.5 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </div>
                    ))}
                    {showNewPromo ? (
                      <PromoEditForm promo={{ id: `promo-${Date.now()}`, title: '', titleEn: '', description: '', descriptionEn: '', coverUrl: '', productRewards: [], usersCount: 0, totalSaved: 0 }}
                        t={t} products={products} lang={lang} isNew
                        onSave={(p) => { setPromotions(prev => [...prev, p]); setShowNewPromo(false); }}
                        onCancel={() => setShowNewPromo(false)} />
                    ) : (
                      <button onClick={() => setShowNewPromo(true)}
                        className="w-full border border-dashed border-white/10 hover:border-cyber/30 p-4 flex items-center justify-center gap-2 text-white/30 hover:text-cyber transition-all">
                        <Plus className="w-4 h-4" /><span className="text-[10px] font-bold tracking-wider">{t.addPromo}</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Addresses tab */}
                {adminTab === 'addresses' && (
                  <div className="space-y-4 animate-fade-in">
                    {addresses.map(addr => (
                      <div key={addr.id} className="bg-dark-2 border border-white/5 p-4">
                        {editingAddress?.id === addr.id ? (
                          <AddressEditInline addr={editingAddress} t={t}
                            onChange={setEditingAddress}
                            onSave={() => saveAddressEdit(editingAddress)}
                            onCancel={() => setEditingAddress(null)} />
                        ) : (
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-white">{addr.name}</div>
                              <div className="text-[10px] text-white/40">{addr.address}</div>
                              <div className="text-[9px] text-white/30 mt-1">{addr.workDays} {addr.workTime} | {addr.lat}, {addr.lng}</div>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => setEditingAddress({ ...addr })} className="p-1.5 bg-white/5 hover:bg-volt/20 text-white/40 hover:text-volt transition-all"><Edit3 className="w-3 h-3" /></button>
                              <button onClick={() => deleteAddress(addr.id)} className="p-1.5 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all"><Trash2 className="w-3 h-3" /></button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {showNewAddress ? (
                      <div className="bg-dark-2 border border-volt/20 p-4">
                        <AddressEditInline addr={newAddressForm as StoreAddress} t={t}
                          onChange={(a) => setNewAddressForm(a)}
                          onSave={addAddress}
                          onCancel={() => setShowNewAddress(false)} />
                      </div>
                    ) : (
                      <button onClick={() => setShowNewAddress(true)}
                        className="w-full border border-dashed border-white/10 hover:border-volt/30 p-4 flex items-center justify-center gap-2 text-white/30 hover:text-volt transition-all">
                        <Plus className="w-4 h-4" /><span className="text-[10px] font-bold tracking-wider">{t.addAddress}</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Settings tab */}
                {adminTab === 'settings' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="bg-dark-2 border border-white/5 p-6">
                      <Crosshairs color="border-cyber/20" />
                      <h3 className="text-xs font-black tracking-[0.2em] text-cyber mb-4">{t.completedOrdersSetting}</h3>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="text-[10px] text-white/30 tracking-wider block mb-1">{t.completedOrders}</label>
                          <input type="number" value={siteSettings.completedOrdersCount}
                            onChange={e => setSiteSettings({ ...siteSettings, completedOrdersCount: Number(e.target.value) })}
                            className="w-full bg-dark-3 border border-white/10 focus:border-cyber px-4 py-3 text-white text-sm font-bold transition-colors" />
                        </div>
                        <div className="text-[10px] text-white/30 max-w-[200px]">{t.completedOrdersDesc}</div>
                      </div>
                      <button onClick={() => dbUpdateSettings(siteSettings)}
                        className="mt-4 bg-cyber text-dark px-6 py-2 text-[10px] font-black tracking-[0.2em] clip-badge-sm hover:bg-cyber/80 transition-colors">
                        {t.save}
                      </button>
                    </div>

                    {/* Password change */}
                    <div className="bg-dark-2 border border-white/5 p-6">
                      <Crosshairs color="border-volt/20" />
                      <h3 className="text-xs font-black tracking-[0.2em] text-volt mb-4">
                        {lang === 'ru' ? 'СМЕНА ПАРОЛЯ' : 'CHANGE PASSWORD'}
                      </h3>
                      <input type="password" value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder={lang === 'ru' ? 'Новый пароль (мин. 8 символов)' : 'New password (min 8 chars)'}
                        className="w-full bg-dark-3 border border-white/10 focus:border-volt px-4 py-3 text-white text-xs mb-3 transition-colors tracking-wider" />
                      {passwordChangeMsg && (
                        <p className={`text-[10px] mb-3 ${passwordChangeMsg.startsWith('✅') ? 'text-volt' : 'text-red-400'}`}>
                          {passwordChangeMsg}
                        </p>
                      )}
                      <button onClick={handlePasswordChange}
                        className="bg-volt text-dark px-6 py-2 text-[10px] font-black tracking-[0.2em] clip-badge-sm hover:bg-volt/80 transition-colors">
                        {lang === 'ru' ? 'ИЗМЕНИТЬ ПАРОЛЬ' : 'CHANGE PASSWORD'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Analytics tab */}
                {adminTab === 'analytics' && (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
                    {[
                      { label: t.totalProducts, val: String(products.length), color: 'text-volt' },
                      { label: t.inStockCount, val: String(products.filter(p => p.status === 'in-stock').length), color: 'text-volt' },
                      { label: t.preOrderCount, val: String(products.filter(p => p.status === 'pre-order').length), color: 'text-cyber' },
                      { label: t.totalReviews, val: String(reviews.length), color: 'text-white/60' },
                      { label: t.approvedCount, val: String(reviews.filter(r => r.approved).length), color: 'text-volt' },
                      { label: t.completedOrders, val: String(siteSettings.completedOrdersCount), color: 'text-cyber' },
                      { label: t.manageOrders, val: String(orders.length), color: 'text-white/60' },
                      { label: t.avgPrice, val: fmt(Math.round(products.reduce((a, p) => a + p.price, 0) / (products.length || 1))), color: 'text-cyber' },
                    ].map((s, i) => (
                      <div key={i} className="relative bg-dark-2 border border-white/5 p-5 card-hover">
                        <Crosshairs color="border-white/5" />
                        <div className="text-[9px] text-white/30 tracking-[0.2em] mb-2">{s.label}</div>
                        <div className={`text-3xl font-black ${s.color}`}>{s.val}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </main>

      {/* ════ FOOTER ════ */}
      <footer className="relative z-10 mt-20 border-t border-white/5 bg-dark-2 overflow-hidden">
        {/* Footer BG: Subtle diagonal lines */}
        <div className="absolute inset-0 diagonal-lines pointer-events-none" style={{ opacity: 0.5 }} />
        <div className="h-1 checkerboard opacity-20" />
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <PrometheusLogo size={28} />
                <span className="text-xs font-black tracking-[0.2em] text-volt">{t.siteName}</span>
              </div>
              <p className="text-[10px] text-white/20 leading-relaxed">{t.tagline}</p>
            </div>
            <div>
              <h4 className="text-[10px] font-bold tracking-[0.2em] text-white/40 mb-3">{t.catalog}</h4>
              <div className="space-y-1">
                {categories.map(c => (
                  <button key={c.id} onClick={() => { setFilterCat(c.id); nav('catalog'); }}
                    className="block text-[10px] text-white/20 hover:text-volt transition-colors">
                    {lang === 'ru' ? c.name : c.nameEn}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-bold tracking-[0.2em] text-white/40 mb-3">{lang === 'ru' ? 'НАВИГАЦИЯ' : 'NAVIGATION'}</h4>
              <div className="space-y-1">
                {['catalog', 'promos', 'about', 'reviews', 'contact'].map(k => (
                  <button key={k} onClick={() => nav(k)} className="block text-[10px] text-white/20 hover:text-volt transition-colors">
                    {(translations[lang] as Record<string, string>)[k] || k.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-bold tracking-[0.2em] text-white/40 mb-3">{t.contact}</h4>
              <div className="space-y-2 text-[10px] text-white/20">
                {addresses.map(a => (
                  <div key={a.id} className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-volt" /> {lang === 'ru' ? a.address : a.addressEn}</div>
                ))}
                <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-volt" /> +996 508 752 775</div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-volt" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295l.213-3.053 5.56-5.023c.242-.217-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.94z"/></svg>
                  @KALLISTO_75
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[9px] text-white/10">© 2024 {t.siteName}. {lang === 'ru' ? 'Все права защищены.' : 'All rights reserved.'}</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setLang('ru')} className={`text-[10px] font-bold ${lang === 'ru' ? 'text-volt' : 'text-white/20'}`}>РУС</button>
              <div className="w-px h-3 bg-white/10" />
              <button onClick={() => setLang('en')} className={`text-[10px] font-bold ${lang === 'en' ? 'text-volt' : 'text-white/20'}`}>ENG</button>
            </div>
          </div>
        </div>
      </footer>

      {/* ════ MODALS ════ */}

      {/* Inquiry Modal */}
      {inquiryProduct && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setInquiryProduct(null)}>
          <div className="bg-dark-2 border border-volt/30 w-full max-w-md relative animate-slide-up" onClick={e => e.stopPropagation()}>
            <Crosshairs color="border-volt" />
            <div className="h-1 bg-gradient-to-r from-volt to-cyber" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-black tracking-[0.2em] text-volt">{t.inquiry}</h3>
                <button onClick={() => setInquiryProduct(null)} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              {/* Explanation */}
              <div className="bg-volt/5 border border-volt/10 p-3 mb-5 text-[10px] text-white/50 leading-relaxed">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-volt shrink-0 mt-0.5" />
                  <p>{t.inquiryExplanation}</p>
                </div>
              </div>

              <div className="bg-dark-3 border border-white/5 p-4 mb-5 clip-badge-sm">
                <div className="text-[9px] text-white/30 mb-1">{lang === 'ru' ? 'ТОВАР' : 'PRODUCT'}</div>
                <div className="text-xs font-bold text-white">{lang === 'ru' ? inquiryProduct.name : inquiryProduct.nameEn}</div>
                <div className="text-sm font-black text-volt mt-1">{fmt(inquiryProduct.price)}</div>
              </div>

              <div className="mb-5">
                <label className="text-[10px] text-white/30 tracking-wider block mb-2">{lang === 'ru' ? 'НОМЕР ТЕЛЕФОНА' : 'PHONE NUMBER'} *</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+996 ___ ___ ___"
                  className="w-full bg-dark-3 border border-white/10 focus:border-volt px-4 py-3 text-white text-xs placeholder-white/20 transition-colors" />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-5">
                <button onClick={() => setInquiryType('whatsapp')}
                  className={`py-3 text-[10px] font-bold tracking-wider flex items-center justify-center gap-2 transition-all clip-badge-sm
                    ${inquiryType === 'whatsapp' ? 'bg-green-600 text-white' : 'bg-white/5 text-white/30'}`}>
                  <MessageCircle className="w-4 h-4" /> WHATSAPP
                </button>
                <button onClick={() => setInquiryType('telegram')}
                  className={`py-3 text-[10px] font-bold tracking-wider flex items-center justify-center gap-2 transition-all clip-badge-sm
                    ${inquiryType === 'telegram' ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/30'}`}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295l.213-3.053 5.56-5.023c.242-.217-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.94z"/>
                  </svg> TELEGRAM
                </button>
              </div>

              <button onClick={handleInquiry}
                className="w-full bg-volt text-dark py-3 text-xs font-black tracking-[0.2em] clip-badge hover:bg-white transition-colors flex items-center justify-center gap-2">
                <ArrowUpRight className="w-4 h-4" /> {t.send}
              </button>

              <p className="text-[9px] text-white/20 text-center mt-3">{t.inquiryExplanationShort}</p>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowReviewModal(false)}>
          <div className="bg-dark-2 border border-cyber/30 w-full max-w-md relative animate-slide-up" onClick={e => e.stopPropagation()}>
            <Crosshairs color="border-cyber" />
            <div className="h-1 bg-gradient-to-r from-cyber to-volt" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-black tracking-[0.2em] text-cyber">{t.submitReview}</h3>
                <button onClick={() => setShowReviewModal(false)} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              {reviewSubmitted ? (
                <div className="text-center py-10">
                  <CheckCircle className="w-12 h-12 text-volt mx-auto mb-3" />
                  <p className="text-xs text-volt font-bold">{t.thankYou}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div><label className="text-[10px] text-white/30 tracking-wider block mb-1">{t.yourName} *</label>
                    <input value={reviewForm.name} onChange={e => setReviewForm({ ...reviewForm, name: e.target.value })}
                      className="w-full bg-dark-3 border border-white/10 focus:border-cyber px-4 py-2.5 text-white text-xs transition-colors" /></div>
                  <div><label className="text-[10px] text-white/30 tracking-wider block mb-1">{t.yourPhone} *</label>
                    <input type="tel" value={reviewForm.phone} onChange={e => setReviewForm({ ...reviewForm, phone: e.target.value })}
                      placeholder="+996" className="w-full bg-dark-3 border border-white/10 focus:border-cyber px-4 py-2.5 text-white text-xs transition-colors" /></div>
                  <div><label className="text-[10px] text-white/30 tracking-wider block mb-1">{t.rating}</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button key={n} onClick={() => setReviewForm({ ...reviewForm, rating: n })} className="p-1 hover:scale-110 transition-transform">
                          <Star className={`w-5 h-5 ${n <= reviewForm.rating ? 'fill-cyber text-cyber' : 'text-white/10'}`} />
                        </button>
                      ))}
                    </div></div>
                  <div><label className="text-[10px] text-white/30 tracking-wider block mb-1">{t.yourReview} *</label>
                    <textarea value={reviewForm.text} onChange={e => setReviewForm({ ...reviewForm, text: e.target.value })}
                      rows={4} className="w-full bg-dark-3 border border-white/10 focus:border-cyber px-4 py-2.5 text-white text-xs transition-colors resize-none" /></div>
                  <button onClick={handleReviewSubmit}
                    className="w-full bg-cyber text-dark py-3 text-xs font-black tracking-[0.2em] clip-badge hover:bg-cyber/80 transition-colors">{t.send}</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


/* ═══════════════════════════════════════════════════════
   PRODUCT CARD (Catalog Grid)
   ═══════════════════════════════════════════════════════ */
const ProductCard: React.FC<{
  product: Product; lang: Lang; t: T; categories: Category[];
  onClick: () => void;
  onInquiry: (type: 'whatsapp' | 'telegram') => void;
}> = ({ product, lang, t, onClick, onInquiry, categories }) => {
  const savings = product.marketAverage - product.price;
  const savingsPercent = Math.round((savings / product.marketAverage) * 100);
  const catColor = categories.find(c => c.id === product.category)?.color || '#ADFF2F';

  return (
    <div className="relative bg-dark-2/90 border border-white/5 hover:border-white/20 transition-all group cursor-pointer card-hover overflow-hidden"
      onClick={onClick}
      style={{ borderTopColor: catColor, borderTopWidth: '2px' }}>
      {/* Shimmer line on hover */}
      <div className="card-shimmer-line absolute inset-0 overflow-hidden pointer-events-none z-10">
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" style={{ transform: 'translateX(-100%)' }} />
      </div>

      {/* Photo */}
      {product.photos[0] ? (
        <div className="h-44 overflow-hidden relative">
          <img src={product.photos[0]} alt={product.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500" />
          <div className="absolute top-2 right-2">
            <DataTag variant={product.status === 'in-stock' ? 'volt' : 'cyber'}>
              {product.status === 'in-stock' ? t.inStock : t.preOrder}
            </DataTag>
          </div>
          <div className="absolute bottom-2 left-2 flex items-center gap-1">
            <div className="checkerboard w-3 h-3 opacity-40" />
            <span className="text-[8px] text-white/40 bg-dark/60 px-1.5 py-0.5">{product.serial}</span>
          </div>
          {product.photos.length > 1 && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-dark/60 px-1.5 py-0.5">
              <Image className="w-3 h-3 text-white/40" />
              <span className="text-[8px] text-white/40">{product.photos.length}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="h-44 bg-dark-3 flex items-center justify-center">
          <Package className="w-10 h-10 text-white/10" />
        </div>
      )}

      <div className="p-4 marble-flow" style={{ '--marble-color': `${catColor}08` } as React.CSSProperties}>
        <h3 className="text-sm font-black text-white tracking-wide mb-1 group-hover:text-volt transition-colors">
          {lang === 'ru' ? product.name : product.nameEn}
        </h3>
        <div className="flex items-center gap-2 mb-3">
          <DataTag style={{ borderColor: `${catColor}50`, color: catColor, background: `${catColor}15` }}>{product.category.toUpperCase()}</DataTag>
        </div>

        {/* Price comparison - intuitive bar */}
        <div className="flex items-end gap-3 mb-2">
          <div>
            <div className="text-[8px] text-white/25 tracking-wider">{t.ourPrice}</div>
            <div className="text-lg font-black text-volt leading-none">{fmt(product.price)}</div>
          </div>
          <div>
            <div className="text-[8px] text-white/25 tracking-wider">{t.marketAvg}</div>
            <div className="text-sm font-bold text-red-400/60 line-through leading-none">{fmt(product.marketAverage)}</div>
          </div>
        </div>

        {/* === PRICE COMPARISON BARS === */}
        <div className="mb-3 space-y-2">
          {/* Bar 1: Our price vs Market Average */}
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[7px] text-white/30 tracking-wider">{t.marketAvg}: {fmt(product.marketAverage)}</span>
              <span className="text-[7px] text-red-400 font-bold">▼ {savingsPercent}% {lang === 'ru' ? 'дешевле' : 'cheaper'}</span>
            </div>
            <div className="relative h-3.5 w-full overflow-hidden border border-white/10" style={{ background: '#111' }}>
              {/* Red = full market average (background) */}
              <div className="absolute inset-0 transition-all duration-700"
                style={{ background: 'linear-gradient(90deg, #dc2626, #ef4444)', opacity: 0.7 }} />
              {/* Green = our price (overlay on left, showing how little we charge) */}
              <div className="absolute inset-y-0 left-0 transition-all duration-700 z-[2]"
                style={{
                  width: `${Math.round((product.price / product.marketAverage) * 100)}%`,
                  background: 'linear-gradient(90deg, #5ddd2f, #adff2f)',
                }} />
              {/* Divider line */}
              <div className="absolute inset-y-0 z-[3]"
                style={{ left: `${Math.round((product.price / product.marketAverage) * 100)}%`, width: '2px', background: '#fff', boxShadow: '0 0 8px rgba(255,255,255,0.7)' }} />
            </div>
            <div className="flex justify-between mt-0.5">
              <span className="text-[7px] text-volt font-bold">● {t.ourPrice}: {fmt(product.price)}</span>
              <span className="text-[7px] text-red-400/70">● {lang === 'ru' ? 'Переплата' : 'Overpay'}: +{fmt(savings)}</span>
            </div>
          </div>

          {/* Bar 2: Our price vs Market Lowest — only show if our price is lower */}
          {product.price < product.marketLowest && (() => {
            const savingsVsLow = product.marketLowest - product.price;
            const savingsVsLowPct = Math.round((savingsVsLow / product.marketLowest) * 100);
            const ourPctOfLow = Math.round((product.price / product.marketLowest) * 100);
            return (
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[7px] text-white/30 tracking-wider">{t.marketLow}: {fmt(product.marketLowest)}</span>
                  <span className="text-[7px] text-blue-400 font-bold">▼ {savingsVsLowPct}% {lang === 'ru' ? 'дешевле мин.' : 'below min.'}</span>
                </div>
                <div className="relative h-2.5 w-full overflow-hidden border border-white/10" style={{ background: '#111' }}>
                  <div className="absolute inset-0 transition-all duration-700"
                    style={{ background: 'linear-gradient(90deg, #1d4ed8, #3b82f6)', opacity: 0.5 }} />
                  <div className="absolute inset-y-0 left-0 transition-all duration-700 z-[2]"
                    style={{
                      width: `${ourPctOfLow}%`,
                      background: 'linear-gradient(90deg, #5ddd2f, #adff2f)',
                    }} />
                  <div className="absolute inset-y-0 z-[3]"
                    style={{ left: `${ourPctOfLow}%`, width: '1px', background: '#fff', boxShadow: '0 0 6px rgba(255,255,255,0.5)' }} />
                </div>
                <div className="flex justify-between mt-0.5">
                  <span className="text-[7px] text-volt font-bold">● {lang === 'ru' ? 'Наша' : 'Ours'}: {ourPctOfLow}%</span>
                  <span className="text-[7px] text-blue-400/60">● {lang === 'ru' ? 'Экономия' : 'Save'}: {fmt(savingsVsLow)}</span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2" onClick={e => e.stopPropagation()}>
          <button onClick={() => onInquiry('whatsapp')}
            className="bg-green-600 hover:bg-green-500 text-white py-2.5 text-[9px] font-bold tracking-wider transition-colors flex items-center justify-center gap-1.5 clip-badge-sm">
            <MessageCircle className="w-3 h-3" /> {t.whatsapp}
          </button>
          <button onClick={() => onInquiry('telegram')}
            className="bg-blue-500 hover:bg-blue-400 text-white py-2.5 text-[9px] font-bold tracking-wider transition-colors flex items-center justify-center gap-1.5 clip-badge-sm">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295l.213-3.053 5.56-5.023c.242-.217-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.94z"/>
            </svg> {t.telegram}
          </button>
        </div>
      </div>
    </div>
  );
};


/* ═══════════════════════════════════════════════════════
   PRODUCT DETAIL PAGE
   ═══════════════════════════════════════════════════════ */
const ProductDetailPage: React.FC<{
  product: Product; lang: Lang; t: T; categories: Category[];
  onBack: () => void;
  onInquiry: (type: 'whatsapp' | 'telegram') => void;
}> = ({ product, lang, t, onBack, onInquiry, categories }) => {
  const [activePhoto, setActivePhoto] = useState(0);
  const savings = product.marketAverage - product.price;
  const savingsPercent = Math.round((savings / product.marketAverage) * 100);
  const catColor = categories.find(c => c.id === product.category)?.color || '#ADFF2F';

  return (
    <section className="relative max-w-7xl mx-auto px-4 py-12 animate-fade-in" style={{ background: `linear-gradient(180deg, ${catColor}08 0%, transparent 400px)` }}>
      {/* Product detail BG: Blueprint grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="grid-bg absolute inset-0" style={{ opacity: 0.5 }} />
        {/* Product ID watermark */}
        <div className="absolute top-8 right-4 text-[100px] font-black text-white/[0.015] leading-none select-none hidden xl:block">
          {product.serial}
        </div>
        {/* Accent corner brackets */}
        <svg className="absolute top-4 left-4 w-12 h-12 hidden lg:block" viewBox="0 0 48 48" style={{ opacity: 0.06 }}>
          <path d="M0 16 L0 0 L16 0" fill="none" stroke={catColor} strokeWidth="1.5" />
        </svg>
        <svg className="absolute bottom-4 right-4 w-12 h-12 hidden lg:block" viewBox="0 0 48 48" style={{ opacity: 0.06 }}>
          <path d="M48 32 L48 48 L32 48" fill="none" stroke={catColor} strokeWidth="1.5" />
        </svg>
      </div>
      <button onClick={onBack} className="relative z-10 flex items-center gap-2 text-xs text-white/40 hover:text-volt mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> {t.back} / {t.allProducts}
      </button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Photos */}
        <div>
          {product.photos.length > 0 ? (
            <>
              <div className="relative bg-dark-2 border border-white/5 overflow-hidden mb-3" style={{ height: '350px' }}>
                <Crosshairs color="border-volt/20" />
                <img src={product.photos[activePhoto]} alt={product.name}
                  className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3">
                  <DataTag variant={product.status === 'in-stock' ? 'volt' : 'cyber'}>
                    {product.status === 'in-stock' ? t.inStock : `${t.preOrder} • 20-30D`}
                  </DataTag>
                </div>
                <div className="absolute bottom-3 right-3 text-[8px] text-white/30 bg-dark/70 px-2 py-1">{product.serial}</div>
              </div>
              {product.photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.photos.map((photo, i) => (
                    <button key={i} onClick={() => setActivePhoto(i)}
                      className={`w-20 h-16 border shrink-0 overflow-hidden transition-all hover:scale-105
                        ${i === activePhoto ? 'border-volt' : 'border-white/10 opacity-50 hover:opacity-80'}`}>
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="bg-dark-2 border border-white/5 h-[350px] flex items-center justify-center">
              <Package className="w-16 h-16 text-white/10" />
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="checkerboard w-4 h-4 opacity-30" />
            <DataTag style={{ borderColor: `${catColor}50`, color: catColor, background: `${catColor}15` }}>{product.category.toUpperCase()}</DataTag>
            <span className="text-[9px] text-white/20">{product.serial}</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-4">
            {lang === 'ru' ? product.name : product.nameEn}
          </h1>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {(lang === 'ru' ? product.tags : product.tagsEn).map((tag, i) => (
              <DataTag key={i} variant={i === 0 ? 'cyber' : 'dim'}>{tag}</DataTag>
            ))}
          </div>

          {/* Market Comparison */}
          <div className="bg-dark-3 border border-white/5 p-5 mb-6 relative clip-notch-tr">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-3 h-3 text-volt" />
              <span className="text-[9px] text-white/30 tracking-[0.2em]">{t.marketComparison}</span>
            </div>
            {/* Price numbers row */}
            <div className={`grid gap-4 mb-5 ${product.price < product.marketLowest ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <div>
                <div className="text-[8px] text-white/25 tracking-wider mb-1">{t.ourPrice}</div>
                <div className="text-xl font-black text-volt leading-none">{fmt(product.price)}</div>
              </div>
              <div>
                <div className="text-[8px] text-white/25 tracking-wider mb-1">{t.marketAvg}</div>
                <div className="text-xl font-black text-red-400 line-through leading-none">{fmt(product.marketAverage)}</div>
              </div>
              {product.price < product.marketLowest && (
              <div>
                <div className="text-[8px] text-white/25 tracking-wider mb-1">{t.marketLow}</div>
                <div className="text-xl font-black text-blue-400 line-through leading-none">{fmt(product.marketLowest)}</div>
              </div>
              )}
            </div>

            {/* === BAR 1: Our Price vs Market Average === */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-volt border border-volt/50" />
                  <span className="text-[9px] text-white/50">{t.ourPrice}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-red-500 border border-red-400/50" />
                  <span className="text-[9px] text-white/50">{t.marketAvg}</span>
                </div>
              </div>
              <div className="relative h-6 w-full overflow-hidden border border-white/10" style={{ background: '#111' }}>
                {/* Red = full market average (background fill) */}
                <div className="absolute inset-0 transition-all duration-700 flex items-center justify-end pr-2"
                  style={{ background: 'linear-gradient(90deg, #dc2626, #ef4444)', opacity: 0.75 }}>
                  <span className="text-[8px] font-black text-white/90 drop-shadow-sm">+{fmt(savings)} {lang === 'ru' ? 'переплата' : 'overpay'}</span>
                </div>
                {/* Green = our price (fills from left showing how little customer pays) */}
                <div className="absolute inset-y-0 left-0 transition-all duration-700 z-[2] flex items-center justify-center"
                  style={{
                    width: `${Math.round((product.price / product.marketAverage) * 100)}%`,
                    background: 'linear-gradient(90deg, #5ddd2f, #adff2f)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)'
                  }}>
                  <span className="text-[9px] font-black text-dark drop-shadow-sm">{fmt(product.price)}</span>
                </div>
                {/* White divider */}
                <div className="absolute inset-y-0 z-[3]"
                  style={{ left: `${Math.round((product.price / product.marketAverage) * 100)}%`, width: '2px', background: '#fff', boxShadow: '0 0 10px rgba(255,255,255,0.8)' }} />
              </div>
              <div className="flex justify-between items-center mt-1.5">
                <span className="text-[10px] text-volt font-bold">{t.ourPrice}: {Math.round((product.price / product.marketAverage) * 100)}% {lang === 'ru' ? 'от средней' : 'of average'}</span>
                <span className="text-[11px] text-red-400 font-black">▼ {savingsPercent}% {lang === 'ru' ? 'дешевле средней' : 'below average'}</span>
              </div>
            </div>

            {/* === BAR 2: Our Price vs Market Lowest — only show if our price is lower === */}
            {product.price < product.marketLowest && (() => {
              const savingsVsLow = product.marketLowest - product.price;
              const savingsVsLowPct = Math.round((savingsVsLow / product.marketLowest) * 100);
              const ourPctOfLow = Math.round((product.price / product.marketLowest) * 100);
              return (
                <div className="pt-3 border-t border-white/5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-volt border border-volt/50" />
                      <span className="text-[9px] text-white/50">{t.ourPrice}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-blue-500 border border-blue-400/50" />
                      <span className="text-[9px] text-white/50">{t.marketLow}</span>
                    </div>
                  </div>
                  <div className="relative h-4 w-full overflow-hidden border border-white/10" style={{ background: '#111' }}>
                    <div className="absolute inset-0 transition-all duration-700"
                      style={{ background: 'linear-gradient(90deg, #1d4ed8, #3b82f6)', opacity: 0.5 }} />
                    <div className="absolute inset-y-0 left-0 transition-all duration-700 z-[2] flex items-center justify-center"
                      style={{
                        width: `${ourPctOfLow}%`,
                        background: 'linear-gradient(90deg, #5ddd2f, #adff2f)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)'
                      }}>
                      <span className="text-[7px] font-black text-dark">{fmt(product.price)}</span>
                    </div>
                    <div className="absolute inset-y-0 z-[3]"
                      style={{ left: `${ourPctOfLow}%`, width: '2px', background: '#fff', boxShadow: '0 0 8px rgba(255,255,255,0.6)' }} />
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[9px] text-volt font-bold">{t.ourPrice}: {ourPctOfLow}% {lang === 'ru' ? 'от мин.' : 'of min.'}</span>
                    <span className="text-[10px] text-blue-400 font-black">▼ {savingsVsLowPct}% {lang === 'ru' ? 'дешевле минимальной' : 'below minimum'}</span>
                  </div>
                  <div className="mt-1 text-[8px] text-white/30">
                    {lang === 'ru' ? 'Экономия vs мин. цена' : 'Savings vs min. price'}: <span className="text-blue-300 font-bold">{fmt(savingsVsLow)} KGS</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Description */}
          {(lang === 'ru' ? product.description : product.descriptionEn) && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] text-white/30 tracking-[0.2em]">{t.description}</span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                {lang === 'ru' ? product.description : product.descriptionEn}
              </p>
            </div>
          )}

          {/* Specs */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Hash className="w-3 h-3 text-white/30" />
              <span className="text-[10px] text-white/30 tracking-[0.2em]">{t.technicalSpecs}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {(lang === 'ru' ? product.specs : product.specsEn).map((s, i) => (
                <div key={i} className="flex items-center justify-between text-[11px] border-b border-white/5 pb-1">
                  <span className="text-white/30">{s.label}</span>
                  <span className="text-white/70 font-bold">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => onInquiry('whatsapp')}
              className="bg-green-600 hover:bg-green-500 text-white py-4 text-[10px] font-bold tracking-wider transition-colors flex items-center justify-center gap-2 clip-badge-sm">
              <MessageCircle className="w-4 h-4" /> {t.whatsapp}
            </button>
            <button onClick={() => onInquiry('telegram')}
              className="bg-blue-500 hover:bg-blue-400 text-white py-4 text-[10px] font-bold tracking-wider transition-colors flex items-center justify-center gap-2 clip-badge-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295l.213-3.053 5.56-5.023c.242-.217-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.94z"/>
              </svg> {t.telegram}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};


/* ═══════════════════════════════════════════════════════
   PRODUCT EDIT FORM (Admin)
   ═══════════════════════════════════════════════════════ */
const ProductEditForm: React.FC<{
  product: Product; t: T; categories: Category[];
  onSave: (p: Product) => void; onCancel: () => void;
}> = ({ product: initial, t, categories, onSave, onCancel }) => {
  const [p, setP] = useState<Product>({ ...initial });
  const [newTagRu, setNewTagRu] = useState('');
  const [newTagEn, setNewTagEn] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const updateSpec = (idx: number, field: 'label' | 'value', val: string, isEn: boolean) => {
    if (isEn) { const specs = [...p.specsEn]; specs[idx] = { ...specs[idx], [field]: val }; setP({ ...p, specsEn: specs }); }
    else { const specs = [...p.specs]; specs[idx] = { ...specs[idx], [field]: val }; setP({ ...p, specs }); }
  };
  const addSpec = () => { setP({ ...p, specs: [...p.specs, { label: '', value: '' }], specsEn: [...p.specsEn, { label: '', value: '' }] }); };
  const removeSpec = (idx: number) => { setP({ ...p, specs: p.specs.filter((_, i) => i !== idx), specsEn: p.specsEn.filter((_, i) => i !== idx) }); };
  const addTag = () => { if (!newTagRu) return; setP({ ...p, tags: [...p.tags, newTagRu], tagsEn: [...p.tagsEn, newTagEn || newTagRu] }); setNewTagRu(''); setNewTagEn(''); };
  const removeTag = (idx: number) => { setP({ ...p, tags: p.tags.filter((_, i) => i !== idx), tagsEn: p.tagsEn.filter((_, i) => i !== idx) }); };
  const addPhoto = () => { if (!newPhotoUrl) return; setP({ ...p, photos: [...p.photos, newPhotoUrl] }); setNewPhotoUrl(''); };
  const removePhoto = (idx: number) => { setP({ ...p, photos: p.photos.filter((_, i) => i !== idx) }); };

  const inputCls = "w-full bg-dark-3 border border-white/10 focus:border-volt px-3 py-2 text-xs text-white transition-colors";
  const labelCls = "text-[10px] text-white/30 tracking-wider block mb-1";

  return (
    <div className="bg-dark-3 border border-volt/20 p-6 mb-6 relative">
      <Crosshairs color="border-volt/40" />
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black tracking-[0.2em] text-volt">{t.editProduct} // {p.serial}</h3>
        <button onClick={onCancel} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div><label className={labelCls}>{t.productName}</label><input value={p.name} onChange={e => setP({ ...p, name: e.target.value })} className={inputCls} /></div>
        <div><label className={labelCls}>{t.productNameEn}</label><input value={p.nameEn} onChange={e => setP({ ...p, nameEn: e.target.value })} className={inputCls} /></div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div><label className={labelCls}>{t.productPrice}</label><input type="number" value={p.price} onChange={e => setP({ ...p, price: Number(e.target.value) })} className={inputCls} /></div>
        <div><label className={labelCls}>{t.marketAvgPrice}</label><input type="number" value={p.marketAverage} onChange={e => setP({ ...p, marketAverage: Number(e.target.value) })} className={inputCls} /></div>
        <div><label className={labelCls}>{t.marketLowPrice}</label><input type="number" value={p.marketLowest} onChange={e => setP({ ...p, marketLowest: Number(e.target.value) })} className={inputCls} /></div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div><label className={labelCls}>{t.category}</label>
          <select value={p.category} onChange={e => setP({ ...p, category: e.target.value })} className={`${inputCls} appearance-none`}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select></div>
        <div><label className={labelCls}>{t.status}</label>
          <select value={p.status} onChange={e => setP({ ...p, status: e.target.value as Product['status'] })} className={`${inputCls} appearance-none`}>
            <option value="in-stock">{t.inStock}</option>
            <option value="pre-order">{t.preOrder}</option>
          </select></div>
      </div>

      {/* Description */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div><label className={labelCls}>{t.productDesc}</label>
          <textarea value={p.description} onChange={e => setP({ ...p, description: e.target.value })} rows={3} className={`${inputCls} resize-none`} /></div>
        <div><label className={labelCls}>{t.productDescEn}</label>
          <textarea value={p.descriptionEn} onChange={e => setP({ ...p, descriptionEn: e.target.value })} rows={3} className={`${inputCls} resize-none`} /></div>
      </div>

      {/* Photos */}
      <div className="mb-4">
        <label className={labelCls}>{t.productPhotos}</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {p.photos.map((photo, i) => (
            <div key={i} className="relative w-24 h-20 border border-white/10 overflow-hidden group">
              <img src={photo} alt="" className="w-full h-full object-cover" />
              <button onClick={async () => {
                if (photo.includes('supabase.co')) await deleteProductImage(photo);
                removePhoto(i);
              }} className="absolute top-0 right-0 bg-red-500/80 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>

        {/* Upload from device */}
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={async (e) => {
            const files = e.target.files;
            if (!files || files.length === 0) return;
            setUploading(true);
            setUploadMsg('');
            const newPhotos = [...p.photos];
            let errorCount = 0;
            for (let i = 0; i < files.length; i++) {
              if (files[i].size > 5 * 1024 * 1024) {
                setUploadMsg(`❗ ${files[i].name}: файл больше 5 МБ`);
                errorCount++;
                continue;
              }
              const url = await uploadProductImage(files[i], p.id);
              if (url) {
                newPhotos.push(url);
              } else {
                errorCount++;
                setUploadMsg(`❗ Ошибка загрузки. Убедитесь что вы вошли в админку через email+пароль`);
              }
            }
            setP({ ...p, photos: newPhotos });
            setUploading(false);
            if (errorCount === 0) setUploadMsg(`✅ Загружено ${files.length} фото`);
            if (fileInputRef.current) fileInputRef.current.value = '';
            setTimeout(() => setUploadMsg(''), 5000);
          }}
        />
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={`flex-1 border border-dashed border-white/20 hover:border-volt/40 py-3 flex items-center justify-center gap-2 transition-all
              ${uploading ? 'opacity-50 cursor-wait' : 'hover:bg-volt/5'}`}
          >
            <Image className="w-4 h-4 text-volt" />
            <span className="text-[10px] font-bold tracking-wider text-white/40">
              {uploading ? 'ЗАГРУЗКА...' : 'ЗАГРУЗИТЬ ФОТО'}
            </span>
          </button>
        </div>
        {uploadMsg && (
          <p className={`text-[10px] mb-2 ${uploadMsg.startsWith('✅') ? 'text-volt' : 'text-red-400'}`}>
            {uploadMsg}
          </p>
        )}
        {/* Or add URL manually */}
        <div className="flex gap-2">
          <input value={newPhotoUrl} onChange={e => setNewPhotoUrl(e.target.value)} className={inputCls} placeholder="или URL: https://..." />
          <button onClick={addPhoto} className="px-3 bg-white/5 text-white/40 hover:text-volt hover:bg-white/10 transition-all shrink-0"><Plus className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Specs */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className={labelCls}>{t.technicalSpecs}</label>
          <button onClick={addSpec} className="text-[10px] text-volt hover:text-white flex items-center gap-1"><Plus className="w-3 h-3" /> {t.addSpec}</button>
        </div>
        <div className="space-y-2">
          {p.specs.map((spec, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-center">
              <input value={spec.label} onChange={e => updateSpec(i, 'label', e.target.value, false)} className={inputCls} placeholder="RU label" />
              <input value={spec.value} onChange={e => updateSpec(i, 'value', e.target.value, false)} className={inputCls} placeholder="RU value" />
              <input value={p.specsEn[i]?.label || ''} onChange={e => updateSpec(i, 'label', e.target.value, true)} className={inputCls} placeholder="EN label" />
              <input value={p.specsEn[i]?.value || ''} onChange={e => updateSpec(i, 'value', e.target.value, true)} className={inputCls} placeholder="EN value" />
              <button onClick={() => removeSpec(i)} className="p-1.5 text-red-400/50 hover:text-red-400"><XCircle className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="mb-6">
        <label className={labelCls}>{t.tags}</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {p.tags.map((tag, i) => (
            <span key={i} className="inline-flex items-center gap-1 bg-white/5 px-2 py-1 text-[10px] text-white/50 border border-white/10">
              {tag} <button onClick={() => removeTag(i)} className="text-red-400/50 hover:text-red-400"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newTagRu} onChange={e => setNewTagRu(e.target.value)} className={inputCls} placeholder="Метка (RU)" />
          <input value={newTagEn} onChange={e => setNewTagEn(e.target.value)} className={inputCls} placeholder="Tag (EN)" />
          <button onClick={addTag} className="px-3 bg-white/5 text-white/40 hover:text-volt hover:bg-white/10 transition-all shrink-0"><Plus className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => onSave(p)} className="flex-1 bg-volt text-dark py-3 text-xs font-black tracking-[0.2em] clip-badge hover:bg-white transition-colors flex items-center justify-center gap-2"><Save className="w-4 h-4" /> {t.save}</button>
        <button onClick={onCancel} className="px-8 py-3 bg-white/5 text-white/40 text-xs font-bold tracking-wider hover:bg-white/10 transition-colors">{t.cancel}</button>
      </div>
    </div>
  );
};


/* ═══════════════════════════════════════════════════════
   ADDRESS EDIT INLINE (Admin)
   ═══════════════════════════════════════════════════════ */
const AddressEditInline: React.FC<{
  addr: StoreAddress; t: T;
  onChange: (a: StoreAddress) => void;
  onSave: () => void; onCancel: () => void;
}> = ({ addr, t, onChange, onSave, onCancel }) => {
  const inputCls = "w-full bg-dark-3 border border-white/10 focus:border-volt px-3 py-2 text-xs text-white transition-colors";
  const labelCls = "text-[10px] text-white/30 tracking-wider block mb-1";
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelCls}>{t.addressLabel} (RU)</label>
          <input value={addr.name} onChange={e => onChange({ ...addr, name: e.target.value })} className={inputCls} /></div>
        <div><label className={labelCls}>{t.addressLabel} (EN)</label>
          <input value={addr.nameEn} onChange={e => onChange({ ...addr, nameEn: e.target.value })} className={inputCls} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelCls}>{t.addressLabel} адрес (RU)</label>
          <input value={addr.address} onChange={e => onChange({ ...addr, address: e.target.value })} className={inputCls} /></div>
        <div><label className={labelCls}>{t.addressLabel} full (EN)</label>
          <input value={addr.addressEn} onChange={e => onChange({ ...addr, addressEn: e.target.value })} className={inputCls} /></div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <div><label className={labelCls}>LAT</label>
          <input type="number" step="0.0001" value={addr.lat} onChange={e => onChange({ ...addr, lat: Number(e.target.value) })} className={inputCls} /></div>
        <div><label className={labelCls}>LNG</label>
          <input type="number" step="0.0001" value={addr.lng} onChange={e => onChange({ ...addr, lng: Number(e.target.value) })} className={inputCls} /></div>
        <div><label className={labelCls}>{t.workDays}</label>
          <input value={addr.workDays} onChange={e => onChange({ ...addr, workDays: e.target.value })} className={inputCls} placeholder="Пн-Сб" /></div>
        <div><label className={labelCls}>{t.workTime}</label>
          <input value={addr.workTime} onChange={e => onChange({ ...addr, workTime: e.target.value })} className={inputCls} placeholder="9:00-18:00" /></div>
      </div>
      <div><label className={labelCls}>{t.workDays} (EN)</label>
        <input value={addr.workDaysEn} onChange={e => onChange({ ...addr, workDaysEn: e.target.value })} className={inputCls} placeholder="Mon-Sat" /></div>
      <div className="flex gap-2">
        <button onClick={onSave} className="flex-1 bg-volt text-dark py-2 text-[10px] font-bold tracking-wider flex items-center justify-center gap-1"><Save className="w-3 h-3" /> {t.save}</button>
        <button onClick={onCancel} className="px-4 py-2 bg-white/5 text-white/40 text-[10px] font-bold">{t.cancel}</button>
      </div>
    </div>
  );
};


/* ═══════════════════════════════════════════════════════
   PROMO EDIT FORM (Admin)
   ═══════════════════════════════════════════════════════ */
const PromoEditForm: React.FC<{
  promo: Promotion; t: T; products: Product[]; lang: Lang; isNew?: boolean;
  onSave: (p: Promotion) => void; onCancel: () => void;
}> = ({ promo: initial, t, products, lang, onSave, onCancel }) => {
  const [p, setP] = useState<Promotion>({ ...initial, productRewards: [...initial.productRewards] });
  const inputCls = "w-full bg-dark-3 border border-white/10 focus:border-volt px-3 py-2 text-xs text-white transition-colors";
  const labelCls = "text-[10px] text-white/30 tracking-wider block mb-1";

  const toggleProduct = (productId: string) => {
    const exists = p.productRewards.find(pr => pr.productId === productId);
    if (exists) {
      setP({ ...p, productRewards: p.productRewards.filter(pr => pr.productId !== productId) });
    } else {
      setP({ ...p, productRewards: [...p.productRewards, { productId, reward: 0 }] });
    }
  };

  const setReward = (productId: string, reward: number) => {
    setP({ ...p, productRewards: p.productRewards.map(pr => pr.productId === productId ? { ...pr, reward } : pr) });
  };

  return (
    <div className="bg-dark-3 border border-cyber/20 p-6 mb-4 relative">
      <Crosshairs color="border-cyber/40" />
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black tracking-[0.2em] text-cyber">{t.addPromo}</h3>
        <button onClick={onCancel} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div><label className={labelCls}>{t.promoName}</label><input value={p.title} onChange={e => setP({ ...p, title: e.target.value })} className={inputCls} /></div>
        <div><label className={labelCls}>{t.promoNameEn}</label><input value={p.titleEn} onChange={e => setP({ ...p, titleEn: e.target.value })} className={inputCls} /></div>
      </div>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div><label className={labelCls}>{t.promoDesc}</label><textarea value={p.description} onChange={e => setP({ ...p, description: e.target.value })} rows={3} className={`${inputCls} resize-none`} /></div>
        <div><label className={labelCls}>{t.promoDescEn}</label><textarea value={p.descriptionEn} onChange={e => setP({ ...p, descriptionEn: e.target.value })} rows={3} className={`${inputCls} resize-none`} /></div>
      </div>
      <div className="mb-4"><label className={labelCls}>{t.promoCover}</label><input value={p.coverUrl} onChange={e => setP({ ...p, coverUrl: e.target.value })} className={inputCls} placeholder="https://..." /></div>

      {/* Promo stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div><label className={labelCls}>{t.promoUsersLabel}</label>
          <input type="number" value={p.usersCount} onChange={e => setP({ ...p, usersCount: Number(e.target.value) })} className={inputCls} /></div>
        <div><label className={labelCls}>{t.promoSavedLabel}</label>
          <input type="number" value={p.totalSaved} onChange={e => setP({ ...p, totalSaved: Number(e.target.value) })} className={inputCls} /></div>
      </div>

      <div className="mb-4">
        <label className={labelCls}>{t.selectProducts}</label>
        <div className="space-y-2">
          {products.map(prod => {
            const isSelected = p.productRewards.some(pr => pr.productId === prod.id);
            const reward = p.productRewards.find(pr => pr.productId === prod.id)?.reward || 0;
            return (
              <div key={prod.id} className={`flex items-center gap-3 p-3 border transition-all ${isSelected ? 'bg-cyber/5 border-cyber/20' : 'bg-dark-2 border-white/5'}`}>
                <button onClick={() => toggleProduct(prod.id)}
                  className={`w-5 h-5 border flex items-center justify-center shrink-0 ${isSelected ? 'bg-cyber border-cyber' : 'border-white/20'}`}>
                  {isSelected && <CheckCircle className="w-3 h-3 text-dark" />}
                </button>
                <div className="flex-1">
                  <div className="text-xs font-bold text-white">{lang === 'ru' ? prod.name : prod.nameEn}</div>
                  <div className="text-[10px] text-white/30">{fmt(prod.price)}</div>
                </div>
                {isSelected && (
                  <div className="flex items-center gap-2">
                    <label className="text-[9px] text-white/30">{t.rewardAmount}</label>
                    <input type="number" value={reward} onChange={e => setReward(prod.id, Number(e.target.value))}
                      className="w-24 bg-dark-3 border border-white/10 px-2 py-1 text-xs text-white text-right" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => onSave(p)} className="flex-1 bg-cyber text-dark py-3 text-xs font-black tracking-[0.2em] clip-badge hover:bg-cyber/80 transition-colors flex items-center justify-center gap-2"><Save className="w-4 h-4" /> {t.save}</button>
        <button onClick={onCancel} className="px-8 py-3 bg-white/5 text-white/40 text-xs font-bold tracking-wider hover:bg-white/10 transition-colors">{t.cancel}</button>
      </div>
    </div>
  );
};

export default App;
