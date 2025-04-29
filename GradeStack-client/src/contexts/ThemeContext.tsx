import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * Định nghĩa kiểu dữ liệu cho context
 */
interface ThemeContextType {
  colorScheme: 'light' | 'dark';
  toggleColorScheme: () => void;
}

/**
 * Định nghĩa kiểu dữ liệu cho props của ThemeProvider
 */
interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Tạo context với giá trị mặc định
 */
const ThemeContext = createContext<ThemeContextType>({
  colorScheme: 'light',
  toggleColorScheme: () => {}
});

/**
 * Provider component để quản lý theme
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Đọc giá trị theme từ localStorage hoặc sử dụng light làm mặc định
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('colorScheme');
    return (savedTheme === 'dark' ? 'dark' : 'light') as 'light' | 'dark';
  });

  // Hàm chuyển đổi giữa light mode và dark mode
  const toggleColorScheme = () => {
    setColorScheme((prev) => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('colorScheme', newTheme);
      return newTheme;
    });
  };

  // Cập nhật thuộc tính data-mantine-color-scheme trên thẻ html khi theme thay đổi
  useEffect(() => {
    document.documentElement.setAttribute('data-mantine-color-scheme', colorScheme);
  }, [colorScheme]);

  return (
    <ThemeContext.Provider value={{ colorScheme, toggleColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook để sử dụng theme context
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  return context;
};
