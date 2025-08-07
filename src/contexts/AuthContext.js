import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      }); 

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Email atau password tidak terdaftar');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Email atau password tidak terdaftar');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setToken(data.token);
      setUser(data.user);
      
      // Redirect berdasarkan role
      if (data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/chat');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password, role = 'user') => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registrasi gagal karena: ', error.error);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Registrasi gagal');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setToken(data.token);
      setUser(data.user);
      
      // Redirect berdasarkan role
      if (data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/chat');
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/');
  };

  const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      router.push('/login');
      throw new Error('Token tidak ditemukan');
    }

    console.log('Making authenticated request to:', url);
    console.log('Request method:', options.method || 'GET');
    console.log('Request body:', options.body ? 'Present' : 'Not present');

    // Buat headers baru dengan tetap mempertahankan Content-Type dari options.headers jika ada
    const existingContentType = options.headers && options.headers['Content-Type'];
    
    const headers = {
      ...(options.headers || {}),
      'Content-Type': existingContentType || 'application/json',
      'Authorization': `Bearer ${token}`,
    };
    
    // Jangan tumpuk header Content-Type
    if (existingContentType) {
      delete options.headers?.['Content-Type'];
    }

    try {
      console.log('Sending request with headers:', JSON.stringify(headers));
      
      // Log request body jika ada
      if (options.body) {
        try {
          console.log('Request body:', typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
        } catch (e) {
          console.log('Request body (not stringifiable):', options.body);
        }
      }
      
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
        mode: 'cors'
      });

      console.log('Response status:', response.status);
      console.log('Response status text:', response.text);
      
      // Try to peek at response body for debugging without consuming it
      const responseClone = response.clone();
      try {
        const responseBody = await responseClone.text();
        console.log('Response body preview:', responseBody.substring(0, 150) + (responseBody.length > 150 ? '...' : ''));
      } catch (bodyError) {
        console.log('Could not preview response body:', bodyError.message);
      }

      if (response.status === 401) {
        console.error('Authentication failed: 401 Unauthorized');
        logout();
        throw new Error('Sesi berakhir. Silakan login kembali.');
      }

      return response;
    } catch (error) {
      console.error('Network error in fetchWithAuth:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user,
      token,
      login,
      register,
      logout,
      fetchWithAuth,
      loading,
      isAuthenticated: !!token,
      isAdmin: user?.is_admin || user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
