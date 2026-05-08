export interface Product {
  id: string;
  name: string;
  nameEn: string;
  price: number;
  marketAverage: number;
  marketLowest: number;
  tags: string[];
  tagsEn: string[];
  status: 'in-stock' | 'pre-order';
  category: string;
  specs: { label: string; value: string }[];
  specsEn: { label: string; value: string }[];
  serial: string;
  photos: string[];
  description: string;
  descriptionEn: string;
  sortOrder: number;
  profitOptions: { label: string; amount: number }[];
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  textEn: string;
  date: string;
  approved: boolean;
  productId: string;
  isNew?: boolean;
}

export interface Category {
  id: string;
  name: string;
  nameEn: string;
  count: number;
  color: string;
}

export interface StoreAddress {
  id: string;
  name: string;
  nameEn: string;
  address: string;
  addressEn: string;
  lat: number;
  lng: number;
  workDays: string;
  workDaysEn: string;
  workTime: string;
}

export interface Promotion {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  coverUrl: string;
  productRewards: { productId: string; reward: number; rewardType?: 'fixed' | 'percent'; note?: string }[];
  usersCount: number;
  totalSaved: number;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  phone: string;
  messenger: 'whatsapp' | 'telegram';
  date: string;
  status: 'new' | 'completed' | 'cancelled';
  isNew?: boolean;
  profitAmount?: number;
  profitLabel?: string;
  dealCondition?: string;
}

export interface SiteSettings {
  completedOrdersCount: number;
  // About page content
  aboutTrustTitle: string;
  aboutTrustTitleEn: string;
  aboutTrustDesc: string;
  aboutTrustDescEn: string;
  aboutDeliveryTitle: string;
  aboutDeliveryTitleEn: string;
  aboutDeliveryDesc: string;
  aboutDeliveryDescEn: string;
  aboutQualityTitle: string;
  aboutQualityTitleEn: string;
  aboutQualityDesc: string;
  aboutQualityDescEn: string;
  aboutSupportTitle: string;
  aboutSupportTitleEn: string;
  aboutSupportDesc: string;
  aboutSupportDescEn: string;
  // Social & contacts
  whatsappNumber: string;
  telegramUsername: string;
  instagramUrl: string;
  phoneNumber: string;
  // Extra info block
  aboutExtraText: string;
  aboutExtraTextEn: string;
  // Dynamic social links
  socialLinks: { name: string; url: string; iconUrl: string }[];
}

export const initialSettings: SiteSettings = {
  completedOrdersCount: 0,
  aboutTrustTitle: 'НАДЕЖНЫЙ ПОСТАВЩИК',
  aboutTrustTitleEn: 'TRUSTED SUPPLIER',
  aboutTrustDesc: 'Прометей — ваш надежный поставщик продукции без наценок в Кыргызстане. Работаем напрямую с производителями.',
  aboutTrustDescEn: 'Prometheus is your trusted supplier of products without markup in Kyrgyzstan. Direct partnerships with manufacturers.',
  aboutDeliveryTitle: 'БЫСТРАЯ ДОСТАВКА',
  aboutDeliveryTitleEn: 'FAST DELIVERY',
  aboutDeliveryDesc: 'Бесплатная доставка по Кара-Балте. Оперативная доставка в Бишкек. Товары в наличии — 24 часа.',
  aboutDeliveryDescEn: 'Free delivery in Kara-Balta. Express delivery to Bishkek. In-stock items within 24 hours.',
  aboutQualityTitle: 'ГАРАНТИЯ КАЧЕСТВА',
  aboutQualityTitleEn: 'QUALITY GUARANTEE',
  aboutQualityDesc: 'Каждый товар проходит проверку. Официальная гарантия от 3 месяцев до 2 лет.',
  aboutQualityDescEn: 'Every product is inspected. Official warranty from 3 months to 2 years.',
  aboutSupportTitle: 'ПОДДЕРЖКА 24/7',
  aboutSupportTitleEn: '24/7 SUPPORT',
  aboutSupportDesc: 'Консультация, помощь в выборе и послепродажное обслуживание в любое время.',
  aboutSupportDescEn: 'Consultation, selection assistance, and after-sales service at any time.',
  whatsappNumber: '',
  telegramUsername: '',
  instagramUrl: '',
  phoneNumber: '',
  aboutExtraText: '',
  aboutExtraTextEn: '',
  socialLinks: [],
};

export const initialCategories: Category[] = [
  { id: 'chairs', name: 'Кресла', nameEn: 'Chairs', count: 2, color: '#FF6B2B' },
  { id: 'climate', name: 'Климат', nameEn: 'Climate', count: 2, color: '#00BFFF' },
  { id: 'bikes', name: 'Велосипеды', nameEn: 'Bikes', count: 1, color: '#ADFF2F' },
  { id: 'gadgets', name: 'Планшеты', nameEn: 'Tablets', count: 1, color: '#A855F7' },
];

// =================================================================
// ТОВАРЫ
// Чтобы добавить фото: загрузи на https://imgur.com
// → правый клик на фото → "Копировать адрес изображения"
// → вставь ссылку в массив photos: ['https://i.imgur.com/XXXXXX.jpg']
// =================================================================

export const initialProducts: any[] = [
  {
    id: 'w6001-pro',
    name: 'Кресло W6001 Bio-Mechanical Pro',
    nameEn: 'W6001 Bio-Mechanical Pro Chair',
    price: 25999,
    marketAverage: 35000,
    marketLowest: 30000,
    tags: [
      'В наличии',
      'Гарантия 3 месяца',
      'Бесплатная доставка до Бишкека',
      '9D-подлокотники + 6D-подголовник',
    ],
    tagsEn: [
      'In stock',
      '3 months warranty',
      'Free delivery to Bishkek',
      '9D armrests + 6D headrest',
    ],
    status: 'in-stock',
    category: 'chairs',
    serial: 'SN-W6001-PRO',
    photos: [
      'https://placehold.co/600x400/1a1a1a/FF6B2B?text=ФОТО+КРЕСЛА+PRO',
    ],
    description:
      'Максимальная комплектация для дизайнеров, программистов и геймеров. ' +
      '9D-подлокотники с поддержкой рук в любом положении (720°). ' +
      '6D-подголовник с регулировкой вылета вперед-назад. ' +
      'Сетка Dragon Mesh укреплённого пошива, литое алюминиевое основание. ' +
      'Выдвижная подножка для отдыха, газлифт 4 класса (усиленный). ' +
      'Слайдер-сиденье — регулировка глубины посадки под любой рост. ' +
      'Бесплатная доставка до Бишкека!',
    descriptionEn:
      'Maximum configuration for designers, programmers and gamers. ' +
      '9D armrests with 720° support. 6D headrest with forward-backward adjustment. ' +
      'Dragon Mesh reinforced fabric, cast aluminum base. ' +
      'Retractable footrest, Class 4 gas lift. ' +
      'Seat slider for depth adjustment. Free delivery to Bishkek!',
    specs: [
      { label: 'Подлокотники', value: '9D (720°)' },
      { label: 'Подголовник', value: '6D с вылетом' },
      { label: 'Основание', value: 'Литой алюминий' },
      { label: 'Газлифт', value: '4 класс (усиленный)' },
      { label: 'Сетка', value: 'Dragon Mesh' },
      { label: 'Подножка', value: 'Выдвижная' },
      { label: 'Слайдер', value: 'Есть (глубина посадки)' },
      { label: 'Вес', value: '~15 кг' },
    ],
    specsEn: [
      { label: 'Armrests', value: '9D (720°)' },
      { label: 'Headrest', value: '6D with extension' },
      { label: 'Base', value: 'Cast aluminum' },
      { label: 'Gas lift', value: 'Class 4 (reinforced)' },
      { label: 'Mesh', value: 'Dragon Mesh' },
      { label: 'Footrest', value: 'Retractable' },
      { label: 'Seat slider', value: 'Yes (depth adjustment)' },
      { label: 'Weight', value: '~15 kg' },
    ],
  },
  {
    id: 'w6001-standard',
    name: 'Кресло W6001 Office Standard',
    nameEn: 'W6001 Office Standard Chair',
    price: 17001,
    marketAverage: 22000,
    marketLowest: 19500,
    tags: [
      'В наличии',
      'Гарантия 3 месяца',
      'Дом и офис',
      'Правильная осанка',
    ],
    tagsEn: [
      'In stock',
      '3 months warranty',
      'Home and office',
      'Correct posture',
    ],
    status: 'in-stock',
    category: 'chairs',
    serial: 'SN-W6001-STD',
    photos: [
      'https://placehold.co/600x400/1a1a1a/FF6B2B?text=ФОТО+КРЕСЛА+STANDARD',
    ],
    description:
      'Оптимальный выбор для дома и офиса. Базовая эргономика с упором на правильную осанку. ' +
      'Газлифт 3 класса безопасности (стандарт индустрии). ' +
      'Прочное полимерное нейлоновое основание. ' +
      'Классическая регулировка высоты подлокотников. ' +
      'Облегчённая сетка для лучшей вентиляции, фиксированная глубина посадки.',
    descriptionEn:
      'Optimal choice for home and office. Basic ergonomics focused on correct posture. ' +
      'Class 3 safety gas lift (industry standard). ' +
      'Durable polymer nylon base. ' +
      'Classic armrest height adjustment. ' +
      'Lightweight mesh for better ventilation, fixed seat depth.',
    specs: [
      { label: 'Подлокотники', value: 'Классические (высота)' },
      { label: 'Основание', value: 'Полимерный нейлон' },
      { label: 'Газлифт', value: '3 класс' },
      { label: 'Сетка', value: 'Облегчённая' },
      { label: 'Вес', value: '~13.5 кг' },
    ],
    specsEn: [
      { label: 'Armrests', value: 'Classic (height)' },
      { label: 'Base', value: 'Polymer nylon' },
      { label: 'Gas lift', value: 'Class 3' },
      { label: 'Mesh', value: 'Lightweight' },
      { label: 'Weight', value: '~13.5 kg' },
    ],
  },
  {
    id: 'xiaomi4lite',
    name: 'Xiaomi Mijia Air Purifier 4 Lite',
    nameEn: 'Xiaomi Mijia Air Purifier 4 Lite',
    price: 10999,
    marketAverage: 12400,
    marketLowest: 11500,
    tags: [
      'Предзаказ 20–30 дней',
      'Гарантия 1 год',
      'Очистка до 43 м²',
      'HEPA H13 + угольный',
    ],
    tagsEn: [
      'Pre-order 20–30 days',
      '1 year warranty',
      'Coverage up to 43 m²',
      'HEPA H13 + carbon',
    ],
    status: 'pre-order',
    category: 'climate',
    serial: 'SN-XMI4L',
    photos: [
      'https://placehold.co/600x400/1a1a1a/00BFFF?text=ФОТО+XIAOMI+4+LITE',
    ],
    description:
      'Xiaomi Mijia Air Purifier 4 Lite — эффективная очистка для комнат до 43 м². ' +
      '3-слойный фильтр: предфильтр + HEPA H13 + угольный. ' +
      'Удаляет 99,97% частиц PM2.5, пыль, аллергены, запахи, споры плесени. ' +
      'Управление через Mi Home / Xiaomi Home. Wi-Fi 2.4 GHz. ' +
      'Голосовое управление: Google Assistant, Amazon Alexa. ' +
      'Лазерный датчик PM2.5. Шум 33.4–61 дБ.',
    descriptionEn:
      'Xiaomi Mijia Air Purifier 4 Lite — effective purification for rooms up to 43 m². ' +
      '3-in-1 filter: pre-filter + HEPA H13 + carbon. ' +
      'Removes 99.97% of PM2.5 particles, dust, allergens, odors, mold spores. ' +
      'Control via Mi Home / Xiaomi Home. Wi-Fi 2.4 GHz. ' +
      'Voice control: Google Assistant, Amazon Alexa. ' +
      'Laser PM2.5 sensor. Noise 33.4–61 dB.',
    specs: [
      { label: 'CADR (частицы)', value: '360 м³/ч' },
      { label: 'Площадь', value: 'до 43 м²' },
      { label: 'Фильтр', value: '3-в-1 (HEPA H13 + уголь)' },
      { label: 'Эффективность', value: '99,97% частиц ≥0,3 мкм' },
      { label: 'Шум', value: '33.4–61 дБ' },
      { label: 'Мощность', value: 'до 33 Вт' },
      { label: 'Подключение', value: 'Wi-Fi 2.4 GHz' },
      { label: 'Размеры', value: '240×240×533 мм' },
      { label: 'Вес', value: '4.8 кг' },
    ],
    specsEn: [
      { label: 'CADR (particles)', value: '360 m³/h' },
      { label: 'Coverage', value: 'up to 43 m²' },
      { label: 'Filter', value: '3-in-1 (HEPA H13 + carbon)' },
      { label: 'Efficiency', value: '99.97% of particles ≥0.3 μm' },
      { label: 'Noise', value: '33.4–61 dB' },
      { label: 'Power', value: 'up to 33 W' },
      { label: 'Connectivity', value: 'Wi-Fi 2.4 GHz' },
      { label: 'Dimensions', value: '240×240×533 mm' },
      { label: 'Weight', value: '4.8 kg' },
    ],
  },
  {
    id: 'xiaomi5pro',
    name: 'Xiaomi Mijia Air Purifier 5 Pro',
    nameEn: 'Xiaomi Mijia Air Purifier 5 Pro',
    price: 35750,
    marketAverage: 38441,
    marketLowest: 37240,
    tags: [
      'Предзаказ 20–30 дней',
      'Гарантия 1 год',
      'До 96 м² — весь дом',
      'UV-C стерилизация',
    ],
    tagsEn: [
      'Pre-order 20–30 days',
      '1 year warranty',
      'Up to 96 m² — whole house',
      'UV-C sterilization',
    ],
    status: 'pre-order',
    category: 'climate',
    serial: 'SN-XMI5P',
    photos: [
      'https://placehold.co/600x400/1a1a1a/00BFFF?text=ФОТО+XIAOMI+5+PRO',
    ],
    description:
      'Xiaomi Mijia Air Purifier 5 Pro — мощный двойной вентилятор для больших помещений. ' +
      'Площадь: 56–96 м². Воздух во всём доме обновляется за 3 минуты. ' +
      'Шестислойная матрица очистки (HEPA E12 + активированный уголь). ' +
      'Удаляет 99,99% вирусов, PM2.5, PM10, ЛОС, аллергены, формальдегид. ' +
      'UV-C стерилизация. Датчики: PM1, PM2.5, формальдегид, температура, влажность. ' +
      'Большой LCD-экран. Управление через Mi Home.',
    descriptionEn:
      'Xiaomi Mijia Air Purifier 5 Pro — powerful dual-fan for large spaces. ' +
      'Coverage: 56–96 m². Refreshes entire home air in 3 minutes. ' +
      'Six-layer filtration (HEPA E12 + activated carbon). ' +
      'Removes 99.99% of viruses, PM2.5, PM10, VOCs, allergens, formaldehyde. ' +
      'UV-C sterilization. Sensors: PM1, PM2.5, formaldehyde, temp, humidity. ' +
      'Large LCD display. Control via Mi Home.',
    specs: [
      { label: 'CADR (частицы)', value: '1050 м³/ч' },
      { label: 'CADR (формальдегид)', value: '720 м³/ч' },
      { label: 'Площадь', value: '56–96 м²' },
      { label: 'Фильтр', value: '6-слойный (HEPA E12 + уголь)' },
      { label: 'Эффективность', value: '99,99% вирусов' },
      { label: 'Шум', value: '33 дБ(А) ночной режим' },
      { label: 'Мощность', value: '50 Вт' },
      { label: 'Стерилизация', value: 'UV-C' },
      { label: 'Вентиляторы', value: 'Двойной' },
      { label: 'Размеры', value: '320×320×785 мм' },
      { label: 'Вес', value: '11.2 кг' },
    ],
    specsEn: [
      { label: 'CADR (particles)', value: '1050 m³/h' },
      { label: 'CADR (formaldehyde)', value: '720 m³/h' },
      { label: 'Coverage', value: '56–96 m²' },
      { label: 'Filter', value: '6-layer (HEPA E12 + carbon)' },
      { label: 'Efficiency', value: '99.99% of viruses' },
      { label: 'Noise', value: '33 dB(A) night mode' },
      { label: 'Power', value: '50 W' },
      { label: 'Sterilization', value: 'UV-C' },
      { label: 'Fans', value: 'Dual' },
      { label: 'Dimensions', value: '320×320×785 mm' },
      { label: 'Weight', value: '11.2 kg' },
    ],
  },
  {
    id: 'tsunami-snm100',
    name: 'Велосипед Tsunami SNM100 Emerald',
    nameEn: 'Tsunami SNM100 Emerald Fixed Gear',
    price: 1,
    marketAverage: 1,
    marketLowest: 1,
    tags: [
      'Предзаказ 20–30 дней',
      'Алюминий 6061',
      'Deep section 90 мм',
      'Аксессуары в подарок',
    ],
    tagsEn: [
      'Pre-order 20–30 days',
      'Aluminum 6061',
      '90mm deep section',
      'Accessories included',
    ],
    status: 'pre-order',
    category: 'bikes',
    serial: 'SN-TSUNAMI-SNM100',
    photos: [
      'https://placehold.co/600x400/1a1a1a/ADFF2F?text=ФОТО+TSUNAMI+EMERALD',
    ],
    description:
      'Фиксированный велосипед Tsunami SNM100 в цвете Emerald. ' +
      'Рама алюминий 6061, размер L. Колёса 90 мм deep section, алюминий. ' +
      'Шины Kenda. Система XLEGEND XFIX (звёзды 46/16, руль барабанка). ' +
      'В подарок: обмотка руля, стрепы, насос, замок.',
    descriptionEn:
      'Fixed gear bike Tsunami SNM100 in Emerald color. ' +
      'Frame: aluminum 6061, size L. Wheels: 90mm deep section aluminum. ' +
      'Tires: Kenda. Groupset: XLEGEND XFIX (46/16, bullhorn bars). ' +
      'Gift: handlebar tape, foot straps, pump, lock.',
    specs: [
      { label: 'Рама', value: 'Tsunami SNM100, алюминий 6061, L' },
      { label: 'Вилка', value: 'Tsunami' },
      { label: 'Колёса', value: '90 мм deep section' },
      { label: 'Шины', value: 'Kenda' },
      { label: 'Звёзды', value: '46/16' },
      { label: 'Передача', value: 'Фикс' },
      { label: 'Руль', value: 'XLEGEND XFIX барабанка' },
    ],
    specsEn: [
      { label: 'Frame', value: 'Tsunami SNM100, aluminum 6061, L' },
      { label: 'Fork', value: 'Tsunami' },
      { label: 'Wheels', value: '90mm deep section' },
      { label: 'Tires', value: 'Kenda' },
      { label: 'Gearing', value: '46/16' },
      { label: 'Drivetrain', value: 'Fixed gear' },
      { label: 'Bars', value: 'XLEGEND XFIX bullhorn' },
    ],
  },
  {
    id: 'huion-hs610',
    name: 'Графический планшет Huion HS610',
    nameEn: 'Huion HS610 Graphics Drawing Tablet',
    price: 1,
    marketAverage: 1,
    marketLowest: 1,
    tags: [
      'Предзаказ 20–30 дней',
      '8192 уровня давления',
      '12 программируемых кнопок',
      'Windows / macOS / Android',
    ],
    tagsEn: [
      'Pre-order 20–30 days',
      '8192 pressure levels',
      '12 customizable keys',
      'Windows / macOS / Android',
    ],
    status: 'pre-order',
    category: 'gadgets',
    serial: 'SN-HUION-HS610',
    photos: [
      'https://placehold.co/600x400/1a1a1a/A855F7?text=ФОТО+HUION+HS610',
    ],
    description:
      'Huion HS610 — профессиональный графический планшет без батареи. ' +
      'Battery-Free EMR — пере не нужна зарядка. ' +
      'Активная область 254×158.8 мм. 8192 уровня давления. Наклон ±60°. ' +
      '12 программируемых Express Keys + тач-кольцо. ' +
      'Совместим с Windows 7+, macOS 10.12+, Android 6.0+ (OTG). ' +
      'Комплект: планшет, перо PW100, держатель с перьями, кабель, OTG-адаптеры.',
    descriptionEn:
      'Huion HS610 — professional battery-free graphics tablet. ' +
      'Battery-Free EMR — no pen charging needed. ' +
      'Active area 254×158.8 mm. 8192 pressure levels. Tilt ±60°. ' +
      '12 customizable Express Keys + touch ring. ' +
      'Compatible with Windows 7+, macOS 10.12+, Android 6.0+ (OTG). ' +
      'Includes: tablet, PW100 pen, pen holder with nibs, cable, OTG adapters.',
    specs: [
      { label: 'Технология', value: 'Battery-Free EMR' },
      { label: 'Активная область', value: '254×158.8 мм' },
      { label: 'Давление', value: '8192 уровня' },
      { label: 'Наклон', value: '±60°' },
      { label: 'Разрешение', value: '5080 LPI' },
      { label: 'Частота', value: '266 PPS' },
      { label: 'Express Keys', value: '12 штук' },
      { label: 'Тач-кольцо', value: 'Есть' },
      { label: 'Размеры', value: '350×211.8×8 мм' },
      { label: 'Вес', value: '~600 г' },
      { label: 'Подключение', value: 'Micro-USB' },
    ],
    specsEn: [
      { label: 'Technology', value: 'Battery-Free EMR' },
      { label: 'Active area', value: '254×158.8 mm' },
      { label: 'Pressure', value: '8192 levels' },
      { label: 'Tilt', value: '±60°' },
      { label: 'Resolution', value: '5080 LPI' },
      { label: 'Report rate', value: '266 PPS' },
      { label: 'Express keys', value: '12 keys' },
      { label: 'Touch ring', value: 'Yes' },
      { label: 'Dimensions', value: '350×211.8×8 mm' },
      { label: 'Weight', value: '~600 g' },
      { label: 'Connectivity', value: 'Micro-USB' },
    ],
  },
];

export const initialReviews: Review[] = [];

export const initialAddresses: StoreAddress[] = [
  {
    id: 'addr1',
    name: 'Основной склад',
    nameEn: 'Main Warehouse',
    address: 'Кара-Балта, ул. П. Морозова 75',
    addressEn: 'Kara-Balta, P. Morozova st. 75',
    lat: 42.8141,
    lng: 73.8486,
    workDays: 'Пн-Сб',
    workDaysEn: 'Mon-Sat',
    workTime: '9:00-18:00',
  },
];

export const initialPromotions: Promotion[] = [
  {
    id: 'promo1',
    title: 'Реферальная программа',
    titleEn: 'Referral Program',
    description:
      'За каждого клиента, которого вы приведёте и который купит у нас, ' +
      'вы получаете процент от продажи. Расскажите друзьям о ПРОМЕТЕЙ и зарабатывайте!',
    descriptionEn:
      'For every client you bring who makes a purchase, ' +
      'you receive a percentage of the sale. Tell your friends about PROMETHEUS and earn!',
    coverUrl: '',
    productRewards: [
      { productId: 'w6001-pro', reward: 2000 },
      { productId: 'w6001-standard', reward: 1500 },
      { productId: 'xiaomi4lite', reward: 1000 },
      { productId: 'xiaomi5pro', reward: 2500 },
      { productId: 'tsunami-snm100', reward: 1500 },
      { productId: 'huion-hs610', reward: 1000 },
    ],
    usersCount: 0,
    totalSaved: 0,
  },
];

export const initialOrders: Order[] = [];
