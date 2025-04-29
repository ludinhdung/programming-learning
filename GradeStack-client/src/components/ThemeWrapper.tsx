import React, { ReactNode } from 'react';
import { MantineProvider, createTheme } from '@mantine/core';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Props cho ThemeWrapper component
 */
interface ThemeWrapperProps {
  children: ReactNode;
}

/**
 * Component bọc MantineProvider với colorScheme từ ThemeContext
 */
const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ children }) => {
  // Lấy colorScheme từ ThemeContext
  const { colorScheme } = useTheme();

  // Tạo theme cho Mantine
  const theme = createTheme({
    // Cấu hình theme mặc định
    primaryColor: 'blue',
    defaultRadius: 'sm',
  });

  return (
    <MantineProvider theme={theme} forceColorScheme={colorScheme}>
      {children}
    </MantineProvider>
  );
};

export default ThemeWrapper;
