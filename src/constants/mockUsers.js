// src/constants/mockUsers.js

export const mockUsers = [
  {
    id: '1',
    fullName: 'Nguyễn Văn An',
    phone: '0901234567',
    email: 'an.nguyen@gmail.com',
    password: '123456',
    birthday: '01/01/1999',
    isStudent: false,
    memberRank: 'Vàng',
    points: 4348000,
    joinDate: '01/01/2025',
  },
  {
    id: '2',
    fullName: 'Trần Thị Bình',
    phone: '0912345678',
    email: 'binh.tran@gmail.com',
    password: 'abcdef',
    birthday: '15/08/2002',
    isStudent: true,
    memberRank: 'Bạc',
    points: 1200000,
    joinDate: '05/03/2024',
  },
    {
    id: 'admin',
    fullName: 'Admin PCShop',
    phone: '0000000000',
    email: 'admin@pcshop.com',
    password: 'admin123',
    birthday: '',
    isStudent: false,
    memberRank: 'Admin',
    points: 0,
    joinDate: '01/01/2024',
    role: 'admin',
  }
];

// Hàm kiểm tra đăng nhập
export const loginUser = (phone, password) => {
  return mockUsers.find(
    u => u.phone === phone.trim() && u.password === password
  ) || null;
};

// Hàm kiểm tra số điện thoại đã tồn tại chưa
export const checkPhoneExists = (phone) => {
  return mockUsers.some(u => u.phone === phone.trim());
};

// Hàm đăng ký (thêm user mới vào mảng tạm)
export const registerUser = (userData) => {
  const newUser = {
    id: String(mockUsers.length + 1),
    fullName: userData.fullName,
    phone: userData.phone,
    email: userData.email || '',
    password: userData.password,
    birthday: userData.birthday || '',
    isStudent: userData.isStudent || false,
    memberRank: 'Thành viên',
    points: 0,
    joinDate: new Date().toLocaleDateString('vi-VN'),
  };
  mockUsers.push(newUser);
  return newUser;
};