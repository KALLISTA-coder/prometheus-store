import { createClient } from '@supabase/supabase-js';
import type { Product, Review, Category, StoreAddress, Promotion, Order, SiteSettings } from './store';
import { initialSettings } from './store';

const SUPABASE_URL = 'https://lrhdvpjddtaujcoriqgw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyaGR2cGpkZHRhdWpjb3JpcWd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNDQ5ODAsImV4cCI6MjA5MTgyMDk4MH0.ZRCTsSkXypPZCFJjOMRAjCyX8eOCJWrncgDqwM7WXfc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ═══ Helpers: DB row <-> App model mapping ═══ */

function dbToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    nameEn: row.name_en || '',
    price: Number(row.price),
    marketAverage: Number(row.market_average),
    marketLowest: Number(row.market_lowest),
    tags: row.tags || [],
    tagsEn: row.tags_en || [],
    status: row.status || 'in-stock',
    category: row.category || '',
    specs: row.specs || [],
    specsEn: row.specs_en || [],
    serial: row.serial || '',
    photos: row.photos || [],
    description: row.description || '',
    descriptionEn: row.description_en || '',
  };
}

function productToDb(p: Product): any {
  return {
    id: p.id,
    name: p.name,
    name_en: p.nameEn,
    price: p.price,
    market_average: p.marketAverage,
    market_lowest: p.marketLowest,
    tags: p.tags,
    tags_en: p.tagsEn,
    status: p.status,
    category: p.category,
    specs: p.specs,
    specs_en: p.specsEn,
    serial: p.serial,
    photos: p.photos,
    description: p.description,
    description_en: p.descriptionEn,
  };
}

function dbToReview(row: any): Review {
  return {
    id: row.id,
    author: row.author,
    rating: row.rating,
    text: row.text,
    textEn: row.text_en || '',
    date: row.date || '',
    approved: row.approved || false,
    productId: row.product_id || '',
    isNew: row.is_new ?? true,
  };
}

function reviewToDb(r: Review): any {
  return {
    id: r.id,
    author: r.author,
    rating: r.rating,
    text: r.text,
    text_en: r.textEn,
    date: r.date,
    approved: r.approved,
    product_id: r.productId,
    is_new: r.isNew ?? true,
  };
}

function dbToCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    nameEn: row.name_en || '',
    count: row.count || 0,
    color: row.color || '#ADFF2F',
  };
}

function categoryToDb(c: Category): any {
  return {
    id: c.id,
    name: c.name,
    name_en: c.nameEn,
    count: c.count,
    color: c.color,
  };
}

function dbToAddress(row: any): StoreAddress {
  return {
    id: row.id,
    name: row.name,
    nameEn: row.name_en || '',
    address: row.address,
    addressEn: row.address_en || '',
    lat: row.lat,
    lng: row.lng,
    workDays: row.work_days || '',
    workDaysEn: row.work_days_en || '',
    workTime: row.work_time || '',
  };
}

function addressToDb(a: StoreAddress): any {
  return {
    id: a.id,
    name: a.name,
    name_en: a.nameEn,
    address: a.address,
    address_en: a.addressEn,
    lat: a.lat,
    lng: a.lng,
    work_days: a.workDays,
    work_days_en: a.workDaysEn,
    work_time: a.workTime,
  };
}

function dbToPromotion(row: any): Promotion {
  return {
    id: row.id,
    title: row.title,
    titleEn: row.title_en || '',
    description: row.description,
    descriptionEn: row.description_en || '',
    coverUrl: row.cover_url || '',
    productRewards: row.product_rewards || [],
    usersCount: row.users_count || 0,
    totalSaved: Number(row.total_saved) || 0,
  };
}

function promotionToDb(p: Promotion): any {
  return {
    id: p.id,
    title: p.title,
    title_en: p.titleEn,
    description: p.description,
    description_en: p.descriptionEn,
    cover_url: p.coverUrl,
    product_rewards: p.productRewards,
    users_count: p.usersCount,
    total_saved: p.totalSaved,
  };
}

function dbToOrder(row: any): Order {
  return {
    id: row.id,
    productId: row.product_id || '',
    productName: row.product_name || '',
    phone: row.phone || '',
    messenger: row.messenger || 'whatsapp',
    date: row.date || '',
    status: row.status || 'new',
    isNew: row.is_new ?? true,
  };
}

function orderToDb(o: Order): any {
  return {
    id: o.id,
    product_id: o.productId,
    product_name: o.productName,
    phone: o.phone,
    messenger: o.messenger,
    date: o.date,
    status: o.status,
    is_new: o.isNew ?? true,
  };
}

/* ═══ FETCH ALL DATA ═══ */

export async function fetchAllData() {
  const [
    { data: products },
    { data: reviews },
    { data: categories },
    { data: addresses },
    { data: promotions },
    { data: orders },
    { data: settingsRows },
  ] = await Promise.all([
    supabase.from('products').select('*'),
    supabase.from('reviews').select('*'),
    supabase.from('categories').select('*'),
    supabase.from('addresses').select('*'),
    supabase.from('promotions').select('*'),
    supabase.from('orders').select('*').order('created_at', { ascending: false }),
    supabase.from('site_settings').select('*'),
  ]);

  const r = settingsRows?.[0];
  const settings: SiteSettings = r
    ? {
        completedOrdersCount: r.completed_orders_count || 0,
        aboutTrustTitle: r.about_trust_title || initialSettings.aboutTrustTitle,
        aboutTrustTitleEn: r.about_trust_title_en || initialSettings.aboutTrustTitleEn,
        aboutTrustDesc: r.about_trust_desc || initialSettings.aboutTrustDesc,
        aboutTrustDescEn: r.about_trust_desc_en || initialSettings.aboutTrustDescEn,
        aboutDeliveryTitle: r.about_delivery_title || initialSettings.aboutDeliveryTitle,
        aboutDeliveryTitleEn: r.about_delivery_title_en || initialSettings.aboutDeliveryTitleEn,
        aboutDeliveryDesc: r.about_delivery_desc || initialSettings.aboutDeliveryDesc,
        aboutDeliveryDescEn: r.about_delivery_desc_en || initialSettings.aboutDeliveryDescEn,
        aboutQualityTitle: r.about_quality_title || initialSettings.aboutQualityTitle,
        aboutQualityTitleEn: r.about_quality_title_en || initialSettings.aboutQualityTitleEn,
        aboutQualityDesc: r.about_quality_desc || initialSettings.aboutQualityDesc,
        aboutQualityDescEn: r.about_quality_desc_en || initialSettings.aboutQualityDescEn,
        aboutSupportTitle: r.about_support_title || initialSettings.aboutSupportTitle,
        aboutSupportTitleEn: r.about_support_title_en || initialSettings.aboutSupportTitleEn,
        aboutSupportDesc: r.about_support_desc || initialSettings.aboutSupportDesc,
        aboutSupportDescEn: r.about_support_desc_en || initialSettings.aboutSupportDescEn,
        whatsappNumber: r.whatsapp_number || '',
        telegramUsername: r.telegram_username || '',
        instagramUrl: r.instagram_url || '',
        phoneNumber: r.phone_number || '',
        aboutExtraText: r.about_extra_text || '',
        aboutExtraTextEn: r.about_extra_text_en || '',
        socialLinks: r.social_links || [],
      }
    : { ...initialSettings };

  return {
    products: (products || []).map(dbToProduct),
    reviews: (reviews || []).map(dbToReview),
    categories: (categories || []).map(dbToCategory),
    addresses: (addresses || []).map(dbToAddress),
    promotions: (promotions || []).map(dbToPromotion),
    orders: (orders || []).map(dbToOrder),
    settings,
  };
}

/* ═══ PRODUCT CRUD ═══ */

export async function dbUpsertProduct(p: Product) {
  const { error } = await supabase.from('products').upsert(productToDb(p), { onConflict: 'id' });
  if (error) console.error('Product upsert error:', error);
}

export async function dbDeleteProduct(id: string) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) console.error('Product delete error:', error);
}

/* ═══ REVIEW CRUD ═══ */

export async function dbInsertReview(r: Review) {
  const { error } = await supabase.from('reviews').insert(reviewToDb(r));
  if (error) console.error('Review insert error:', error);
}

export async function dbUpdateReview(r: Review) {
  const { error } = await supabase.from('reviews').update(reviewToDb(r)).eq('id', r.id);
  if (error) console.error('Review update error:', error);
}

export async function dbDeleteReview(id: string) {
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) console.error('Review delete error:', error);
}

/* ═══ CATEGORY CRUD ═══ */

export async function dbUpsertCategory(c: Category) {
  const { error } = await supabase.from('categories').upsert(categoryToDb(c), { onConflict: 'id' });
  if (error) console.error('Category upsert error:', error);
}

export async function dbDeleteCategory(id: string) {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) console.error('Category delete error:', error);
}

/* ═══ ADDRESS CRUD ═══ */

export async function dbUpsertAddress(a: StoreAddress) {
  const { error } = await supabase.from('addresses').upsert(addressToDb(a), { onConflict: 'id' });
  if (error) console.error('Address upsert error:', error);
}

export async function dbDeleteAddress(id: string) {
  const { error } = await supabase.from('addresses').delete().eq('id', id);
  if (error) console.error('Address delete error:', error);
}

/* ═══ PROMOTION CRUD ═══ */

export async function dbUpsertPromotion(p: Promotion) {
  const { error } = await supabase.from('promotions').upsert(promotionToDb(p), { onConflict: 'id' });
  if (error) console.error('Promotion upsert error:', error);
}

export async function dbDeletePromotion(id: string) {
  const { error } = await supabase.from('promotions').delete().eq('id', id);
  if (error) console.error('Promotion delete error:', error);
}

/* ═══ ORDER CRUD ═══ */

export async function dbInsertOrder(o: Order) {
  const { error } = await supabase.from('orders').insert(orderToDb(o));
  if (error) console.error('Order insert error:', error);
}

export async function dbUpdateOrder(o: Order) {
  const { error } = await supabase.from('orders').update(orderToDb(o)).eq('id', o.id);
  if (error) console.error('Order update error:', error);
}

export async function dbDeleteOrder(id: string) {
  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) console.error('Order delete error:', error);
}

/* ═══ SETTINGS ═══ */

export async function dbUpdateSettings(s: SiteSettings) {
  const { error } = await supabase.from('site_settings').upsert({
    id: 'main',
    completed_orders_count: s.completedOrdersCount,
    about_trust_title: s.aboutTrustTitle,
    about_trust_title_en: s.aboutTrustTitleEn,
    about_trust_desc: s.aboutTrustDesc,
    about_trust_desc_en: s.aboutTrustDescEn,
    about_delivery_title: s.aboutDeliveryTitle,
    about_delivery_title_en: s.aboutDeliveryTitleEn,
    about_delivery_desc: s.aboutDeliveryDesc,
    about_delivery_desc_en: s.aboutDeliveryDescEn,
    about_quality_title: s.aboutQualityTitle,
    about_quality_title_en: s.aboutQualityTitleEn,
    about_quality_desc: s.aboutQualityDesc,
    about_quality_desc_en: s.aboutQualityDescEn,
    about_support_title: s.aboutSupportTitle,
    about_support_title_en: s.aboutSupportTitleEn,
    about_support_desc: s.aboutSupportDesc,
    about_support_desc_en: s.aboutSupportDescEn,
    whatsapp_number: s.whatsappNumber,
    telegram_username: s.telegramUsername,
    instagram_url: s.instagramUrl,
    phone_number: s.phoneNumber,
    about_extra_text: s.aboutExtraText,
    about_extra_text_en: s.aboutExtraTextEn,
    social_links: s.socialLinks,
  }, { onConflict: 'id' });
  if (error) console.error('Settings update error:', error);
}

/* ═══ AUTH ═══ */

export async function signInAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { session: data?.session, user: data?.user, error };
}

export async function signOutAdmin() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Sign out error:', error);
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function changeAdminPassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return { error };
}

export function onAuthStateChange(callback: (session: any) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}

/* ═══ STORAGE (Product Images) ═══ */

const BUCKET = 'product-images';

export async function uploadProductImage(file: File, productId: string): Promise<string | null> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${productId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    console.error('Upload error:', error);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

export async function deleteProductImage(url: string) {
  // Extract path from full URL
  const match = url.match(/product-images\/(.+)$/);
  if (!match) return;
  const path = match[1];

  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) console.error('Delete image error:', error);
}
