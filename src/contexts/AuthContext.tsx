
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Define user type
interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (emailOrUsername: string, password: string, rememberMe: boolean) => Promise<boolean>;
  signup: (email: string, username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Check if user is authenticated on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('bookwise_user');
    const storedToken = localStorage.getItem('bookwise_token');
    
    if (storedUser && storedToken) {
      setCurrentUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);
  
  // Mock user database - in a real app, this would be in your backend
  const users: Record<string, { id: string; email: string; username: string; password: string }> = {};
  
  const signup = async (email: string, username: string, password: string): Promise<boolean> => {
    // Check if email or username already exists
    const emailExists = Object.values(users).some(user => user.email === email);
    const usernameExists = Object.values(users).some(user => user.username === username);
    
    if (emailExists) {
      alert("Email already in use");
      return false;
    }
    
    if (usernameExists) {
      alert("Username already taken");
      return false;
    }
    
    // Create new user
    const newUser = {
      id: `user_${Date.now()}`,
      email,
      username,
      password // In a real app, this would be hashed
    };
    
    users[newUser.id] = newUser;
    
    // Save to localStorage
    const userToStore = { id: newUser.id, email: newUser.email, username: newUser.username };
    localStorage.setItem('bookwise_user', JSON.stringify(userToStore));
    localStorage.setItem('bookwise_token', `token_${Date.now()}`);
    
    setCurrentUser(userToStore);
    return true;
  };
  
  const login = async (emailOrUsername: string, password: string, rememberMe: boolean): Promise<boolean> => {
    // Find user by email or username
    const user = Object.values(users).find(
      u => u.email === emailOrUsername || u.username === emailOrUsername
    );
    
    if (!user || user.password !== password) {
      alert("Invalid credentials");
      return false;
    }
    
    // Set current user
    const userToStore = { id: user.id, email: user.email, username: user.username };
    setCurrentUser(userToStore);
    
    // If remember me is checked, save to localStorage
    if (rememberMe) {
      localStorage.setItem('bookwise_user', JSON.stringify(userToStore));
      localStorage.setItem('bookwise_token', `token_${Date.now()}`);
    } else {
      // Use sessionStorage instead for non-persistent sessions
      sessionStorage.setItem('bookwise_user', JSON.stringify(userToStore));
      sessionStorage.setItem('bookwise_token', `token_${Date.now()}`);
    }
    
    return true;
  };
  
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('bookwise_user');
    localStorage.removeItem('bookwise_token');
    sessionStorage.removeItem('bookwise_user');
    sessionStorage.removeItem('bookwise_token');
  };
  
  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    login,
    signup,
    logout,
    loading
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
