import { createContext, useContext, ReactNode } from 'react';

interface User {
    id: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
    children: ReactNode;
    value: AuthContextType;
}

export const AuthProvider = ({ children, value }: AuthProviderProps) => {
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 