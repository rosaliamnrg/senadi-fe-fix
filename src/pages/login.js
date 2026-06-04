import { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { Box, Container, TextField, Button, Typography, Alert, Link, Divider, CircularProgress, IconButton, InputAdornment } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import '@fontsource/poppins'; // default
import '@fontsource/poppins'; // untuk judul

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { login } = useAuth();
  
  const handleGoogleSuccess = async (credentialResponse) => {
    setIsGoogleLoading(true);
    setError('');
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
        setIsGoogleLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed');
    setIsGoogleLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "GANTI_DENGAN_GOOGLE_CLIENT_ID_ANDA"}>
      {/* Latar belakang */}
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <Container maxWidth="md">
          {/* Kotak utama: flex row */}
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            backgroundColor: 'white',
            borderRadius: 4,
            boxShadow: '0 15px 50px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          }}>

            {/* ── KIRI: Logo & Branding ── */}
            <Box sx={{
              flex: 1,
              background: 'linear-gradient(145deg, #f0f9f9 0%, #e6f4f4 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 6,
              borderRight: { xs: 'none', md: '1px solid #eaeaea' },
              borderBottom: { xs: '1px solid #eaeaea', md: 'none' },
              position: 'relative',
            }}>
              {/* Dekorasi */}
              <Box sx={{ position: 'absolute', top: -30, left: -30, width: 120, height: 120, borderRadius: '50%', backgroundColor: '#febd27', opacity: 0.15 }} />

              <img
                src="/images/bung-itung.png"
                alt="Bung Itung"
                style={{ maxWidth: '85%', objectFit: 'contain', zIndex: 1 }}
              />

              <Typography variant="h5" sx={{ mt: 4, fontFamily: 'Poppins, sans-serif', fontWeight: 800, color: '#28536b', zIndex: 1, textAlign: 'center' }}>
                Tanya Bung Itung
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, fontFamily: 'Poppins, sans-serif', color: '#297373', textAlign: 'center', fontWeight: 500, zIndex: 1 }}>
                Teman interaktif yang siap menjawab pertanyaan dan kesulitan kamu seputar Sensus Ekonomi.
              </Typography>
            </Box>

            {/* ── KANAN: Form Login ── */}
            <Box sx={{
              flex: 1.2,
              p: { xs: 4, md: 6 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
              backgroundColor: '#ffffff',
            }}>
              <Box sx={{ position: 'absolute', bottom: -40, right: -20, width: 150, height: 150, borderRadius: '50%', backgroundColor: '#297373', opacity: 0.05 }} />

              <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Poppins, sans-serif', color: '#000000', fontWeight: 800, fontSize: '28px', zIndex: 1 }}>
                Selamat Datang!
              </Typography>
              <Typography variant="body1" sx={{ color: '#666', mb: 4, fontFamily: 'Poppins, sans-serif', zIndex: 1 }}>
                Silakan masuk ke akun Anda
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3, fontFamily: 'Poppins, sans-serif', borderRadius: '8px' }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ zIndex: 1 }}>
                <TextField
                  fullWidth
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  variant="outlined"
                  required
                  type="email"
                  InputProps={{ sx: { fontFamily: 'Poppins, sans-serif', borderRadius: '8px' } }}
                  InputLabelProps={{ sx: { fontFamily: 'Poppins, sans-serif' } }}
                  sx={{ '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#f68839', borderWidth: '2px' } } }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  variant="outlined"
                  required
                  InputProps={{
                    sx: { fontFamily: 'Poppins, sans-serif', borderRadius: '8px' },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  InputLabelProps={{ sx: { fontFamily: 'Poppins, sans-serif' } }}
                  sx={{ mt: 2, '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#f68839', borderWidth: '2px' } } }}
                />

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={isLoading || isGoogleLoading}
                  sx={{
                    mt: 4,
                    py: 1.5,
                    fontFamily: 'Poppins, sans-serif',
                    backgroundColor: '#f68839',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    borderRadius: '8px',
                    textTransform: 'none',
                    boxShadow: '0 4px 14px 0 rgba(246, 136, 57, 0.39)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#e07629',
                      boxShadow: '0 6px 20px rgba(246, 136, 57, 0.6)',
                      transform: 'translateY(-2px)',
                    },
                    '&.Mui-disabled': { backgroundColor: '#f68839', opacity: 0.7, color: 'white' },
                  }}
                >
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
                </Button>

                <Box sx={{ mt: 4 }}>
                  <Divider sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ color: '#999', fontFamily: 'Poppins, sans-serif' }}>
                      Atau masuk dengan
                    </Typography>
                  </Divider>
                  <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
                    {isGoogleLoading || isLoading && (
                      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 2, borderRadius: '24px' }}>
                        <CircularProgress size={24} sx={{ color: '#297373' }} />
                      </Box>
                    )}
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      useOneTap
                      shape="pill"
                      theme="outline"
                    />
                  </Box>
                </Box>
              </Box>

            </Box>

          </Box>
        </Container>
      </Box>
    </GoogleOAuthProvider>
  );
}
