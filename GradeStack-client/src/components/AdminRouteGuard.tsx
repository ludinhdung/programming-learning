/**
 * Component bảo vệ route admin: chỉ cho phép truy cập nếu đã đăng nhập và có role ADMIN
 * Nếu không, tự động chuyển hướng về trang đăng nhập admin
 */
import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Kiểm tra quyền admin
 * @returns true nếu user là admin
 */
const isAdminAuthenticated = (): boolean => {
  const token: string | null = localStorage.getItem('token');
  const userRaw: string | null = localStorage.getItem('user');
  if (!token || !userRaw) return false;
  try {
    const user = JSON.parse(userRaw);
    return user.role === 'ADMIN';
  } catch {
    return false;
  }
};

/**
 * Component bảo vệ route admin
 * @param children Nội dung cần bảo vệ
 */
const AdminRouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin-login" replace />;
  }
  return <>{children}</>;
};

export default AdminRouteGuard;
