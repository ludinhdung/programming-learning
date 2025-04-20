import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
}

interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    setIsAuthenticated: (isAuthenticated: boolean) => void;
    setUser: (user: User | null) => void;
    logout: () => void;
}

const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            user: null,
            setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
            setUser: (user) => set({ user }),
            logout: () => {
                localStorage.removeItem('token');
                set({ isAuthenticated: false, user: null });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ isAuthenticated: state.isAuthenticated, user: state.user }),
        }
    )
);

export default useAuthStore; 