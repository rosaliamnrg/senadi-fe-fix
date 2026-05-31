import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Head from 'next/head';
import { AuthProvider } from '../contexts/AuthContext';
import '../styles/globals.css';
import '../styles/style-chat.css';
import '../styles/style-fileknowledge.css';

const theme = createTheme();

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/images/favicon.ico" />
        <title>Chatbot Susenas</title>
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ThemeProvider>
    </>
  );
}