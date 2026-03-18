// src/constants/statisticsMockData.js
// File mock data riêng cho trang Thống kê — không liên quan đến mockData.js của Cart

export const summaryStats = {
  totalRevenue: 485000000,
  revenueGrowth: 12.5,
  totalOrders: 342,
  orderGrowth: 8.3,
  totalCustomers: 198,
  customerGrowth: 5.1,
  lowStockItems: 7,
};

export const revenueByMonth = [
  { month: 'T1',  revenue: 28 },
  { month: 'T2',  revenue: 35 },
  { month: 'T3',  revenue: 31 },
  { month: 'T4',  revenue: 42 },
  { month: 'T5',  revenue: 39 },
  { month: 'T6',  revenue: 51 },
  { month: 'T7',  revenue: 47 },
  { month: 'T8',  revenue: 55 },
  { month: 'T9',  revenue: 49 },
  { month: 'T10', revenue: 62 },
  { month: 'T11', revenue: 58 },
  { month: 'T12', revenue: 75 },
];

export const orderStatusData = [
  { name: 'Hoàn thành',    value: 210, color: '#3fb950', percent: 61 },
  { name: 'Đang xử lý',   value: 45,  color: '#58a6ff', percent: 13 },
  { name: 'Đang giao',    value: 37,  color: '#e3b341', percent: 11 },
  { name: 'Chờ xác nhận', value: 28,  color: '#bc8cff', percent: 8  },
  { name: 'Đã hủy',       value: 22,  color: '#f85149', percent: 7  },
];

export const topProducts = [
  { name: 'RAM Kingston Fury 16GB DDR5', sold: 87, category: 'Phụ kiện' },
  { name: 'Laptop ASUS ROG Strix G16',   sold: 48, category: 'Laptop'   },
  { name: 'SSD Samsung 1TB NVMe',        sold: 72, category: 'Phụ kiện' },
  { name: 'Màn hình LG 27" 144Hz',       sold: 41, category: 'Phụ kiện' },
  { name: 'Laptop Dell XPS 15',          sold: 35, category: 'Laptop'   },
];

export const warehouseReport = [
  { id: 1, name: 'Laptop ASUS ROG Strix G16',   stock: 12, minStock: 5,  status: 'ok'     },
  { id: 2, name: 'Laptop Dell XPS 15',          stock: 4,  minStock: 5,  status: 'warn'   },
  { id: 3, name: 'RAM Kingston Fury 16GB DDR5', stock: 2,  minStock: 10, status: 'warn'   },
  { id: 4, name: 'SSD Samsung 1TB NVMe',        stock: 0,  minStock: 10, status: 'danger' },
  { id: 5, name: 'PC Gaming RTX 4060',          stock: 8,  minStock: 3,  status: 'ok'     },
  { id: 6, name: 'Chuột Logitech G502 X',       stock: 3,  minStock: 10, status: 'warn'   },
];

export const formatVND = (val) => {
  if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)} tỷ`;
  if (val >= 1_000_000)     return `${(val / 1_000_000).toFixed(0)} tr ₫`;
  return val.toLocaleString('vi-VN') + ' ₫';
};
