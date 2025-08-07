import React, { useState } from 'react';
import { Box, Paper, Tabs, Tab, Typography, TextField, Button, Alert, Link } from '@mui/material';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import '@fontsource/inter'; // default
import '@fontsource/epilogue'; // untuk judul

export default function Register() {
  const [tab, setTab] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak sama');
      return;
    }

    if (formData.password.length < 4) {
      setError('Password minimal 4 karakter');
      return;
    }

    setLoading(true);
    try {
      const role = tab === 0 ? 'user' : 'admin';
      await register(formData.username, formData.email, formData.password, role);
    } catch (err) {
      setError(err.message || 'Registrasi gagal karena: ', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      bgcolor: 'grey.100'
    }}>
      <Paper elevation={3} sx={{ p: 4, width: 400 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontFamily: 'Inter, sans-serif', color: '#06344E', fontWeight: 'bold', fontSize: '28px' }}>
          Register
        </Typography>

        {/* <Tabs value={tab} onChange={handleTabChange} centered sx={{ mb: 3 }}>
          <Tab label="User" />
          <Tab label="Admin" />
        </Tabs> */}

        {error && (
          <Alert severity="error" sx={{ marginBottom: '16px', fontFamily: 'Inter, sans-serif' }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            margin="normal"
            InputProps={{
                sx: { fontFamily: 'Inter, sans-serif' }
              }}
              InputLabelProps={{
                sx: { fontFamily: 'Inter, sans-serif' }
              }}
            required
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            InputProps={{
                sx: { fontFamily: 'Inter, sans-serif' }
              }}
              InputLabelProps={{
                sx: { fontFamily: 'Inter, sans-serif' }
              }}
            required
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            InputProps={{
                sx: { fontFamily: 'Inter, sans-serif' }
              }}
              InputLabelProps={{
                sx: { fontFamily: 'Inter, sans-serif' }
              }}
            required
          />
          <TextField
            fullWidth
            label="Konfirmasi Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            margin="normal"
            InputProps={{
                sx: { fontFamily: 'Inter, sans-serif' }
              }}
              InputLabelProps={{
                sx: { fontFamily: 'Inter, sans-serif' }
              }}
            required
          />
          <Button
            fullWidth
            variant="contained"
            type="submit"
            sx={{ mt: 3, fontFamily: 'Inter, sans-serif', backgroundColor: '#06344E', '&:hover': {backgroundColor: '#347AB6',} }}
            disabled={loading}
          >
            {tab === 0 ? 'Register sebagai User' : 'Register sebagai Admin'}
          </Button>
        </form>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ fontFamily: 'Epilogue, sans-serif'}}>
            Sudah punya akun?{' '}
            <Link href="/" underline="hover" sx={{ color: '#06344E', fontWeight: 'bold' }}>
              Login disini
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
} 
