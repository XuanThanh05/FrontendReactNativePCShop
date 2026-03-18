// src/constants/categoryData.js

export const categoryList = [
  { id: 'laptop',    name: 'Laptop',     emoji: '💻' },
  { id: 'cpu',       name: 'CPU',        emoji: '⚙️' },
  { id: 'ram',       name: 'RAM',        emoji: '🧩' },
  { id: 'storage',   name: 'Ổ cứng',     emoji: '💾' },
  { id: 'gpu',       name: 'Card màn hình', emoji: '🎮' },
  { id: 'mainboard', name: 'Mainboard',  emoji: '🔧' },
  { id: 'psu',       name: 'Nguồn',      emoji: '🔌' },
  { id: 'cooling',   name: 'Tản nhiệt',  emoji: '❄️' },
  { id: 'monitor',   name: 'Màn hình',   emoji: '🖥️' },
  { id: 'keyboard',  name: 'Bàn phím',   emoji: '⌨️' },
  { id: 'mouse',     name: 'Chuột',      emoji: '🖱️' },
  { id: 'headset',   name: 'Tai nghe',   emoji: '🎧' },
];

export const categoryDetail = {
  // ── LAPTOP ──────────────────────────────────────────────────
  laptop: {
    title: 'Laptop',
    brands: ['ASUS', 'Dell', 'HP', 'Lenovo', 'MSI', 'Acer', 'Apple', 'LG', 'Gigabyte', 'Razer'],
    priceRanges: [
      { label: 'Dưới 15 triệu',   min: 0,        max: 15000000 },
      { label: '15 - 20 triệu',   min: 15000000, max: 20000000 },
      { label: '20 - 30 triệu',   min: 20000000, max: 30000000 },
      { label: '30 - 40 triệu',   min: 30000000, max: 40000000 },
      { label: 'Trên 40 triệu',   min: 40000000, max: Infinity },
    ],
    hotItems: [
      { label: 'ASUS ROG Strix',   tag: 'HOT' },
      { label: 'Dell XPS 15',      tag: 'HOT' },
      { label: 'MacBook Pro M3',   tag: 'Mới' },
      { label: 'MSI Thin GF63',    tag: 'HOT' },
      { label: 'Lenovo Legion 5',  tag: 'Mới' },
      { label: 'HP Victus 15',     tag: '' },
      { label: 'Acer Nitro 5',     tag: '' },
      { label: 'ASUS VivoBook 15', tag: '' },
    ],
  },

  // ── CPU ─────────────────────────────────────────────────────
  cpu: {
    title: 'CPU',
    brands: ['Intel', 'AMD'],
    priceRanges: [
      { label: 'Dưới 3 triệu',   min: 0,       max: 3000000 },
      { label: '3 - 6 triệu',    min: 3000000, max: 6000000 },
      { label: '6 - 10 triệu',   min: 6000000, max: 10000000 },
      { label: '10 - 15 triệu',  min: 10000000,max: 15000000 },
      { label: 'Trên 15 triệu',  min: 15000000,max: Infinity },
    ],
    hotItems: [
      { label: 'Intel Core i5-13600K', tag: 'HOT' },
      { label: 'Intel Core i7-13700K', tag: 'HOT' },
      { label: 'Intel Core i9-13900K', tag: '' },
      { label: 'AMD Ryzen 5 7600X',    tag: 'Mới' },
      { label: 'AMD Ryzen 7 7700X',    tag: 'HOT' },
      { label: 'AMD Ryzen 9 7950X',    tag: 'Mới' },
    ],
  },

  // ── RAM ─────────────────────────────────────────────────────
  ram: {
    title: 'RAM',
    brands: ['Kingston', 'Corsair', 'G.Skill', 'Samsung', 'Crucial', 'TeamGroup'],
    priceRanges: [
      { label: 'Dưới 500K',       min: 0,      max: 500000 },
      { label: '500K - 1 triệu',  min: 500000, max: 1000000 },
      { label: '1 - 2 triệu',     min: 1000000,max: 2000000 },
      { label: 'Trên 2 triệu',    min: 2000000,max: Infinity },
    ],
    hotItems: [
      { label: 'Kingston 16GB DDR4',    tag: 'HOT' },
      { label: 'Corsair Vengeance 32GB',tag: 'HOT' },
      { label: 'G.Skill Trident 32GB',  tag: 'Mới' },
      { label: 'Samsung 16GB DDR5',     tag: 'Mới' },
    ],
  },

  // ── Ổ CỨNG ──────────────────────────────────────────────────
  storage: {
    title: 'Ổ cứng',
    brands: ['Samsung', 'WD', 'Seagate', 'Kingston', 'Crucial', 'Lexar'],
    priceRanges: [
      { label: 'Dưới 500K',      min: 0,      max: 500000 },
      { label: '500K - 1 triệu', min: 500000, max: 1000000 },
      { label: '1 - 2 triệu',    min: 1000000,max: 2000000 },
      { label: 'Trên 2 triệu',   min: 2000000,max: Infinity },
    ],
    hotItems: [
      { label: 'Samsung 970 EVO 1TB',  tag: 'HOT' },
      { label: 'WD Black SN850 1TB',   tag: 'HOT' },
      { label: 'Seagate Barracuda 2TB',tag: '' },
      { label: 'Kingston NV2 500GB',   tag: '' },
    ],
  },

  // ── GPU ─────────────────────────────────────────────────────
  gpu: {
    title: 'Card màn hình',
    brands: ['ASUS', 'MSI', 'Gigabyte', 'Zotac', 'Palit', 'Sapphire'],
    priceRanges: [
      { label: 'Dưới 5 triệu',   min: 0,        max: 5000000 },
      { label: '5 - 10 triệu',   min: 5000000,  max: 10000000 },
      { label: '10 - 20 triệu',  min: 10000000, max: 20000000 },
      { label: 'Trên 20 triệu',  min: 20000000, max: Infinity },
    ],
    hotItems: [
      { label: 'RTX 4060 Ti',   tag: 'HOT' },
      { label: 'RTX 4070',      tag: 'HOT' },
      { label: 'RTX 4080 Super',tag: 'Mới' },
      { label: 'RX 7600',       tag: '' },
      { label: 'RX 7700 XT',    tag: 'Mới' },
    ],
  },

  // ── MAINBOARD ───────────────────────────────────────────────
  mainboard: {
    title: 'Mainboard',
    brands: ['ASUS', 'MSI', 'Gigabyte', 'ASRock'],
    priceRanges: [
      { label: 'Dưới 3 triệu',  min: 0,       max: 3000000 },
      { label: '3 - 6 triệu',   min: 3000000, max: 6000000 },
      { label: '6 - 10 triệu',  min: 6000000, max: 10000000 },
      { label: 'Trên 10 triệu', min: 10000000,max: Infinity },
    ],
    hotItems: [
      { label: 'ASUS ROG Strix B660-F',  tag: 'HOT' },
      { label: 'MSI MAG B760 Tomahawk',  tag: 'HOT' },
      { label: 'Gigabyte Z790 Aorus',    tag: 'Mới' },
      { label: 'ASRock B650M Pro RS',    tag: '' },
    ],
  },

  // ── NGUỒN ───────────────────────────────────────────────────
  psu: {
    title: 'Nguồn máy tính',
    brands: ['Corsair', 'Seasonic', 'EVGA', 'Cooler Master', 'Thermaltake', 'be quiet!'],
    priceRanges: [
      { label: 'Dưới 1 triệu',  min: 0,       max: 1000000 },
      { label: '1 - 2 triệu',   min: 1000000, max: 2000000 },
      { label: '2 - 3 triệu',   min: 2000000, max: 3000000 },
      { label: 'Trên 3 triệu',  min: 3000000, max: Infinity },
    ],
    hotItems: [
      { label: 'Corsair RM750x',        tag: 'HOT' },
      { label: 'Seasonic Focus GX-850', tag: 'HOT' },
      { label: 'Cooler Master MWE 650', tag: '' },
      { label: 'be quiet! Straight 650',tag: 'Mới' },
    ],
  },

  // ── TẢN NHIỆT ───────────────────────────────────────────────
  cooling: {
    title: 'Tản nhiệt',
    brands: ['Noctua', 'be quiet!', 'Cooler Master', 'Corsair', 'DeepCool', 'Thermalright'],
    priceRanges: [
      { label: 'Dưới 500K',      min: 0,      max: 500000 },
      { label: '500K - 1 triệu', min: 500000, max: 1000000 },
      { label: '1 - 2 triệu',    min: 1000000,max: 2000000 },
      { label: 'Trên 2 triệu',   min: 2000000,max: Infinity },
    ],
    hotItems: [
      { label: 'Noctua NH-D15',          tag: 'HOT' },
      { label: 'Corsair H100i Elite',    tag: 'HOT' },
      { label: 'DeepCool AK620',         tag: 'Mới' },
      { label: 'Thermalright Peerless',  tag: '' },
    ],
  },

  // ── MÀN HÌNH ────────────────────────────────────────────────
  monitor: {
    title: 'Màn hình',
    brands: ['LG', 'Samsung', 'ASUS', 'Dell', 'AOC', 'BenQ', 'Acer', 'Gigabyte'],
    priceRanges: [
      { label: 'Dưới 3 triệu',  min: 0,       max: 3000000 },
      { label: '3 - 6 triệu',   min: 3000000, max: 6000000 },
      { label: '6 - 10 triệu',  min: 6000000, max: 10000000 },
      { label: 'Trên 10 triệu', min: 10000000,max: Infinity },
    ],
    hotItems: [
      { label: 'LG UltraGear 27" 2K',   tag: 'HOT' },
      { label: 'Samsung Odyssey G5',    tag: 'HOT' },
      { label: 'ASUS ROG Swift 27"',    tag: 'Mới' },
      { label: 'Dell S2722DGM',         tag: '' },
      { label: 'AOC 24G2 144Hz',        tag: '' },
    ],
  },

  // ── BÀN PHÍM ────────────────────────────────────────────────
  keyboard: {
    title: 'Bàn phím',
    brands: ['Keychron', 'Logitech', 'Razer', 'SteelSeries', 'Corsair', 'AKKO', 'Ducky'],
    priceRanges: [
      { label: 'Dưới 500K',      min: 0,      max: 500000 },
      { label: '500K - 1 triệu', min: 500000, max: 1000000 },
      { label: '1 - 2 triệu',    min: 1000000,max: 2000000 },
      { label: 'Trên 2 triệu',   min: 2000000,max: Infinity },
    ],
    hotItems: [
      { label: 'Keychron K2',            tag: 'HOT' },
      { label: 'Logitech G Pro X',       tag: 'HOT' },
      { label: 'Razer BlackWidow V4',    tag: 'Mới' },
      { label: 'AKKO 3087',              tag: '' },
      { label: 'Ducky One 3',            tag: 'Mới' },
    ],
  },

  // ── CHUỘT ───────────────────────────────────────────────────
  mouse: {
    title: 'Chuột',
    brands: ['Logitech', 'Razer', 'SteelSeries', 'Zowie', 'Corsair', 'Glorious'],
    priceRanges: [
      { label: 'Dưới 300K',      min: 0,      max: 300000 },
      { label: '300K - 800K',    min: 300000, max: 800000 },
      { label: '800K - 2 triệu', min: 800000, max: 2000000 },
      { label: 'Trên 2 triệu',   min: 2000000,max: Infinity },
    ],
    hotItems: [
      { label: 'Logitech G Pro X Superlight', tag: 'HOT' },
      { label: 'Razer DeathAdder V3',         tag: 'HOT' },
      { label: 'SteelSeries Rival 3',         tag: '' },
      { label: 'Zowie EC2-C',                 tag: 'Mới' },
    ],
  },

  // ── TAI NGHE ────────────────────────────────────────────────
  headset: {
    title: 'Tai nghe',
    brands: ['SteelSeries', 'Logitech', 'Razer', 'HyperX', 'Corsair', 'Sony', 'JBL'],
    priceRanges: [
      { label: 'Dưới 500K',      min: 0,      max: 500000 },
      { label: '500K - 1 triệu', min: 500000, max: 1000000 },
      { label: '1 - 3 triệu',    min: 1000000,max: 3000000 },
      { label: 'Trên 3 triệu',   min: 3000000,max: Infinity },
    ],
    hotItems: [
      { label: 'SteelSeries Arctis 7',  tag: 'HOT' },
      { label: 'HyperX Cloud II',       tag: 'HOT' },
      { label: 'Logitech G435',         tag: 'Mới' },
      { label: 'Razer BlackShark V2',   tag: '' },
      { label: 'Sony WH-1000XM5',       tag: 'Mới' },
    ],
  },
};