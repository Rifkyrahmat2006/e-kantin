import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import api from '../lib/api';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'customer';
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => Promise<void>;
    register: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Initialize auth state from local storage
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('user_data');

        if (storedToken && storedUser && storedUser !== 'undefined') {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Failed to parse user data:', e);
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_data');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('auth_token', newToken);
        localStorage.setItem('user_data', JSON.stringify(newUser));
    };

    const logout = async () => {
        try {
            // Use axios directly to hit the web route (not /api/logout)
            await axios.post('/logout', {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}` // Still send token for API logout
                },
                withCredentials: true
            });
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            setToken(null);
            setUser(null);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
        }
    };

    const register = async (data: any) => {
        const response = await api.post('/register', data);
        const { token, user } = response.data;
        login(token, user);
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated: !!token,
            isLoading,
            login,
            logout,
            register
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
