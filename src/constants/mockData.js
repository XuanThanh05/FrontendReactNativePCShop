

// Dữ liệu mẫu giỏ hàng ban đầu (để test)
export const initialCartItems = [
  {
    id: '1',
    name: 'Laptop ASUS ROG Strix G15',
    brand: 'ASUS',
    price: 35990000,
    image: 'https://th.bing.com/th/id/OIP.c10-d4JFKxiv3RNyQNI-DgHaFQ?w=233&h=180&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3',
    specs: 'AMD Ryzen 9 | RTX 3070 | 16GB RAM | 512GB SSD',
    quantity: 1,
    stock: 5,
  },
  {
    id: '4',
    name: 'Màn hình LG UltraGear 27"',
    brand: 'LG',
    price: 8990000,
    image: 'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/f9954448-4748-4318-ba4f-a499f99e6a0d.jpg',
    specs: '27 inch | 2K | 165Hz | IPS | 1ms',
    quantity: 2,
    stock: 10,
  },
  {
    id: '5',
    name: 'Bàn phím cơ Keychron K2',
    brand: 'Keychron',
    price: 2290000,
    image: 'https://th.bing.com/th/id/R.deab379050280737c0326801df9a137a?rik=m7nyVl43eRjpbQ&riu=http%3a%2f%2fwww.keychron.com%2fcdn%2fshop%2fproducts%2fkeychron-k2-uk-iso-layout-wireless-mechanical-keyboard-white-rgb-backlight-gateron-mechanical-switch-red-for-mac-windows_jpg.jpg%3fcrop%3dcenter%26height%3d1200%26v%3d1639731650%26width%3d1200&ehk=oQF7hrkH%2btY3oxV2cyDUfjSA0JNMjzSIriErl5HmXM4%3d&risl=&pid=ImgRaw&r=0',
    specs: 'TKL | Brown Switch | Wireless | Backlit RGB',
    quantity: 1,
    stock: 15,
  },
];


export const formatPrice = (price) => {
  return price.toLocaleString('vi-VN') + ' ₫';
};