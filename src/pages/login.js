import { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { Box, Container, TextField, Button, Typography, Alert, Link } from '@mui/material';
import '@fontsource/inter'; // default
import '@fontsource/epilogue'; // untuk judul

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Send token to backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (res.ok) {
        // You may need to adapt this depending on how your AuthContext handles token storage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/chat'; // redirect to chat or dashboard
      } else {
        setError(data.error || 'Google login failed');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "GANTI_DENGAN_GOOGLE_CLIENT_ID_ANDA"}>
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#f5f5f5'
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ 
          backgroundColor: 'white',
          padding: 4,
          borderRadius: 1,
          boxShadow: 1
        }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontFamily: 'Inter, sans-serif', color: '#06344E', fontWeight: 'bold', fontSize: '26px' }}>
            Selamat Datang !
          </Typography>

          {error && (
            <Alert severity="error" sx={{ marginBottom: '16px', fontFamily: 'Inter, sans-serif' }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              InputProps={{
                sx: { fontFamily: 'Inter, sans-serif' }
              }}
              InputLabelProps={{
                sx: { fontFamily: 'Inter, sans-serif' }
              }}
              required
              type="email"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              type="submit"
              variant="contained"
              sx={{ mt: 3, fontFamily: 'Inter, sans-serif', backgroundColor: '#06344E', '&:hover': {backgroundColor: '#347AB6',} }}
            >
              Login
            </Button>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
              />
            </Box>
          </Box>

        {/* <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ fontFamily: 'Epilogue, sans-serif'}}>
            Belum punya akun?{' '}
            <Link href="/register" underline="hover" sx={{ color: '#06344E', fontWeight: 'bold' }}>
              Register disini
            </Link>
          </Typography>

        </Box> */}
        </Box>
      </Container>
    </Box>
    </GoogleOAuthProvider>
  );
}