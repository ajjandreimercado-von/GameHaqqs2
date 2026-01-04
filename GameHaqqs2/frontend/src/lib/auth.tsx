import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

/**
 * FRONTEND → BACKEND COMMUNICATION
 * This module handles all authentication API calls to the Laravel backend at http://127.0.0.1:8000
 */

interface User {
  id: string;
  name?: string;
  username?: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  xp?: number;
  level?: number;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, role?: 'user' | 'admin' | 'moderator') => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
  isGuest: boolean;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Backend API Base URL
const API_BASE_URL = 'http://127.0.0.1:8000/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  // Restore token and user from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    const savedGuestMode = localStorage.getItem('guest_mode');
    
    console.log('🔍 Checking for saved auth...');
    console.log('Saved token:', savedToken ? 'Found' : 'Not found');
    console.log('Saved user:', savedUser ? 'Found' : 'Not found');
    console.log('Guest mode:', savedGuestMode === 'true' ? 'Active' : 'Inactive');
    
    if (savedGuestMode === 'true') {
      setIsGuest(true);
      console.log('👤 Guest mode activated');
    } else if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
        console.log('✅ Auth restored from localStorage:', parsedUser.email);
      } catch (error) {
        console.error('❌ Failed to restore auth:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    } else {
      console.log('⚠️ No saved auth found');
    }
    setIsInitialized(true);
  }, []);

  /**
   * LOGIN
   * BACKEND CALL: POST /api/login
   * 
   * Sends email and password to Laravel backend
   * Backend validates credentials and returns access_token
   * Token is stored in localStorage and used for all future protected API calls
   * 
   * Flow:
   * 1. User enters email/password on frontend
   * 2. Frontend sends POST to /api/login
   * 3. Backend checks database for matching email/password
   * 4. Backend returns { access_token, user } if valid
   * 5. Frontend stores token in localStorage
   * 6. Frontend includes token in Authorization header for all future requests
   * 7. User is redirected to /dashboard
   * 
   * Database updated: No direct database change (authentication only)
   * Postman: Test with: POST http://127.0.0.1:8000/api/login + { email, password }
   */
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      // BACKEND CALL: POST /api/login
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      const accessToken = data.access_token;
      const userData = data.user;

      console.log('💾 Storing auth token and user data...');
      console.log('Token:', accessToken ? accessToken.substring(0, 20) + '...' : 'none');
      console.log('User:', userData.email);

      // Store token and user in localStorage for persistence
      localStorage.setItem('auth_token', accessToken);
      localStorage.setItem('auth_user', JSON.stringify(userData));

      // Verify storage
      const verifyToken = localStorage.getItem('auth_token');
      const verifyUser = localStorage.getItem('auth_user');
      console.log('✓ Verification - Token stored:', verifyToken ? 'YES' : 'NO');
      console.log('✓ Verification - User stored:', verifyUser ? 'YES' : 'NO');

      setToken(accessToken);
      setUser({
        id: userData.id,
        name: userData.name,
        username: userData.name?.split(' ')[0] || userData.email?.split('@')[0],
        email: userData.email,
        role: userData.role || 'user',
        xp: userData.xp || 0,
        level: userData.level || 1,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * REGISTER
   * BACKEND CALL: POST /api/register
   * 
   * Sends new user data to Laravel backend
   * Backend creates user in MySQL database with hashed password
   * Backend returns access_token (auto-login after registration)
   * User record is saved to: users table (id, name, email, password, role, created_at, updated_at)
   * 
   * Flow:
   * 1. User enters name/email/password/role on frontend
   * 2. Frontend sends POST to /api/register with role parameter
   * 3. Backend validates input (unique email, password requirements, valid role)
   * 4. Backend creates user in MySQL with hashed password and specified role
   * 5. Backend returns { access_token, user }
   * 6. Frontend stores token and user
   * 7. User is auto-logged in and redirected to /dashboard
   * 8. Login action is recorded in database (login_timestamp updated)
   * 
   * Database updated: 
   * - INSERT INTO users (name, email, password, role, created_at)
   * - Sets role = provided role or defaults to 'user'
   * 
   * Postman: Test with: POST http://127.0.0.1:8000/api/register + { name, email, password, password_confirmation, role: 'admin'|'moderator'|'user' }
   */
  const register = async (username: string, email: string, password: string, role: 'user' | 'admin' | 'moderator' = 'user') => {
    setLoading(true);
    setError(null);

    try {
      // BACKEND CALL: POST /api/register
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: username,
          email,
          password,
          password_confirmation: password,
          role: role, // Send the role to backend
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      const accessToken = data.access_token;
      const userData = data.user;

      // Store token and user in localStorage
      localStorage.setItem('auth_token', accessToken);
      localStorage.setItem('auth_user', JSON.stringify(userData));

      setToken(accessToken);
      setUser({
        id: userData.id,
        name: userData.name,
        username: userData.name?.split(' ')[0] || email.split('@')[0],
        email: userData.email,
        role: userData.role || 'user',
        xp: 0,
        level: 1,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * LOGOUT
   * BACKEND CALL: POST /api/logout (requires token in Authorization header)
   * 
   * Invalidates the user's token on the backend
   * Clears token and user from localStorage on frontend
   * 
   * Flow:
   * 1. User clicks logout button
   * 2. Frontend sends POST to /api/logout with token in Authorization header
   * 3. Backend invalidates token in sanctum_personal_access_tokens table
   * 4. Frontend clears localStorage
   * 5. User is redirected to /login
   * 
   * Database updated: No direct change (token invalidation is in memory)
   * Postman: Test with: POST http://127.0.0.1:8000/api/logout + Header "Authorization: Bearer {token}"
   */
  const logout = async () => {
    setLoading(true);
    setError(null);

    try {
      if (token) {
        // BACKEND CALL: POST /api/logout (protected route)
        await fetch(`${API_BASE_URL}/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`, // Token required for logout
          },
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
      // Clear local state even if logout fails
    } finally {
      // Clear token and user from localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('guest_mode');
      setToken(null);
      setUser(null);
      setIsGuest(false);
      setLoading(false);
      
      // Redirect to home page after logout
      window.location.href = '/';
    }
  };

  /**
   * ENTER GUEST MODE
   * Allows users to browse the app without authentication
   * Guest users can view content but cannot perform any write operations
   */
  const enterGuestMode = () => {
    console.log('👤 Entering guest mode...');
    localStorage.setItem('guest_mode', 'true');
    setIsGuest(true);
  };

  /**
   * EXIT GUEST MODE
   * Exits guest mode and returns to login screen
   */
  const exitGuestMode = () => {
    console.log('👤 Exiting guest mode...');
    localStorage.removeItem('guest_mode');
    setIsGuest(false);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      register, 
      logout, 
      loading, 
      error, 
      isInitialized,
      isGuest,
      enterGuestMode,
      exitGuestMode
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
