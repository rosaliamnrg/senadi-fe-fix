import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Divider,
  Alert,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ReactMarkdown from "react-markdown";
import '@fontsource/poppins'; // default
import '@fontsource/poppins'; // untuk judul
import TypingDots from "../components/TypingDots";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const {
    user,
    isAuthenticated,
    isAdmin,
    loading: authLoading,
    logout,
    fetchWithAuth,
  } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }

    if (!authLoading && isAdmin) {
      router.push("/admin/chat");
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const createNewChat = async () => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        setError("");

        // Try the regular endpoint first
        try {
          console.log("Attempting to create chat with regular endpoint");
          const response = await fetchWithAuth(
            `${process.env.NEXT_PUBLIC_API_URL}/chat/new`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title: "New Chat" }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              console.log("Chat created successfully with regular endpoint");
              setChatId(data.chat_id);

              localStorage.setItem("chat_id", data.chat_id);

              setVerified(false);
              setMessages([]);
              return; // Exit if successful
            }
          } else {
            const errorText = await response.text();
            console.log("Gagal buat chat: ", response.status, errorText);
          }
          console.log("Regular endpoint failed, trying alternative");
        } catch (error) {
          console.error("Error with regular endpoint:", error);
        }

        // Try the quicknew endpoint as fallback
        // try {
        //   console.log('Attempting to create chat with quicknew endpoint');
        //   const altResponse = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/chat/quicknew`, {
        //     method: 'GET'
        //   });

        //   if (altResponse.ok) {
        //     const altData = await altResponse.json();
        //     if (altData.success) {
        //       console.log('Chat created successfully with quicknew endpoint');
        //       setChatId(altData.chat_id);
        //       setVerified(false);
        //       setMessages([]);
        //       return; // Exit if successful
        //     }
        //   }
        //   console.log('Alternative endpoint failed');
        // } catch (altError) {
        //   console.error('Error with alternative endpoint:', altError);
        // }

        // Try the simpleNew endpoint as a last resort
        try {
          console.log("Attempting to create chat with simpleNew endpoint");
          const tokenFromStorage = localStorage.getItem("token");

          if (!tokenFromStorage) {
            console.log("No token available for simpleNew endpoint");
            throw new Error("No token available for simpleNew endpoint");
          }

          const simpleResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL
            }/chat/simpleNew?token=${encodeURIComponent(tokenFromStorage)}`,
            { method: "GET" }
          );

          if (simpleResponse.ok) {
            const simpleData = await simpleResponse.json();
            if (simpleData.success) {
              console.log("Chat created successfully with simpleNew endpoint");
              setChatId(simpleData.chat_id);
              setVerified(false);
              setMessages([]);
              return; // Exit if successful
            }
          }
          console.log("Simple endpoint failed");
        } catch (simpleError) {
          console.error("Error with simple endpoint:", simpleError);
          throw simpleError; // Throw this error if all methods fail
        }

        throw new Error("All chat creation methods failed");
      } catch (error) {
        console.error("Error creating chat:", error);
        setError("Gagal membuat chat baru. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    if (!chatId && isAuthenticated && !authLoading) {
      createNewChat();
    }
  }, [chatId, isAuthenticated, authLoading, fetchWithAuth]);

  // handled and solved (6 juni)

  // cek status verifikasi (3 juni)
  useEffect(() => {
    if (!chatId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/chat/${chatId}/status`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.verified) {
            setVerified(true);
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [chatId]);
  // last chat cek status verifikasi (3 juni)

  // Ambil chatId dari localStorage sekali saat komponen mount
  useEffect(() => {
    const savedChatId = localStorage.getItem("chatId");
    if (savedChatId) setChatId(savedChatId);
  }, []);

  // Simpan chatId ke localStorage setiap kali chatId berubah
  useEffect(() => {
    if (chatId) {
      localStorage.setItem("chatId", chatId);
    }
  }, [chatId]);

  // Pas sudah punya nomor kotak, kita buka kotak itu dan ambil boneka-bonekanya (pesan chat)
  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = async () => {
      try {
        const response = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/chat/${chatId}/messages`
        );
        if (response.ok) {
          const data = await response.json();
          console.log("Pesan chat yang diterima dari backend:", data.messages);
          setMessages(
            data.messages.map((msg) => ({
              text: msg.message,
              sender: msg.sender,
            }))
          );
        } else {
          console.log("Gagal fetch pesan chat, status:", response.status);
        }
      } catch (err) {
        console.error("Error fetch pesan chat:", err);
      }
    };

    fetchMessages();
  }, [chatId]);

  // last code handled and solved (2 juni)

  useEffect(() => {
    if (!chatId) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/chat/${chatId}/status`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.verified) {
            setVerified(true);
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [chatId]);

  const handleNewChat = () => {
    setChatId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !chatId || verified || loading) return;

    const userMessage = input;
    setInput("");
    setLoading(true);
    setError("");

    // Add user message to chat immediately
    setMessages((prev) => [...prev, { text: userMessage, sender: "user" }]);

    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/${chatId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessage }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log("Response failed: ", response.status, errorData);
        throw new Error(errorData.error || "Gagal mengirim pesan");
      }

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            text: data.message || data.response,
            sender: "bot",
            verified: data.verified,
            corrected: data.corrected,
          },
        ]);

        if (data.verified) {
          setVerified(true);
        }
      } else {
        throw new Error(data.error || "Gagal mendapatkan respons");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Gagal mengirim pesan. Silakan coba lagi.");

      // Remove user message if error occurs
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <AppBar position="static" sx={{ backgroundColor: "#28536b", boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <Toolbar>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <img src="/images/logo-bps.webp" style={{ height: 30 }} alt="Logo BPS" />
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography className="logo-serif"
                sx={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontWeight: 'bold',
                  fontStyle: 'italic',
                  color: 'white',
                  lineHeight: 1.15,
                  letterSpacing: 0.5,
                  fontSize: '1rem',
                }}
              >
                BADAN PUSAT STATISTIK
              </Typography>
              <Typography className="logo-serif"
                sx={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontWeight: 'bold',
                  fontStyle: 'italic',
                  color: 'white',
                  lineHeight: 1.15,
                  letterSpacing: 0.5,
                  fontSize: '1rem',
                }}
              >
                KOTA KUPANG
              </Typography>
            </Box>
          </Box>
          {verified && (
            <Button
              color="inherit"
              startIcon={<AddCircleIcon />}
              onClick={handleNewChat}
              sx={{ mr: 2 }}
            >
              Chat Baru
            </Button>
          )}
          <IconButton
            color="inherit"
            edge="end"
            onClick={logout}
            aria-label="logout"
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          overflowY: "auto",
          bgcolor: "#f5f5f5",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.length === 0 && !loading && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              opacity: 0.7,
            }}
          >
            <Typography variant="h5" align="center" sx={{ mb: 2, fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', color: '#28536b' }}>
              Selamat datang, {user?.username || "User"}!
            </Typography>
            <Typography variant="body1" align="center" sx={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>
              Silakan ketik pesan untuk memulai percakapan dengan bot
            </Typography>
          </Box>
        )}

        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              justifyContent:
                message.sender === "user" ? "flex-end" : "flex-start",
              alignItems: "flex-end",
              mb: 2,
              gap: 1.5,
            }}
          >
            {message.sender === "bot" && (
              <Box sx={{ flexShrink: 0, width: 48, height: 48, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img src="/images/bung-itung.png" alt="Bung Itung" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </Box>
            )}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                maxWidth: "75%",
                bgcolor: message.sender === "user" ? "#297373" : "#ffffff", // Hijau muda / White
                color: message.sender === "user" ? "#ffffff" : "#000000",
                position: "relative",
                borderRadius: message.sender === "user" ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                border: message.sender === "bot" ? '1px solid #eee' : 'none'
              }}
            >
              {message.sender === "bot" ? (
                <ReactMarkdown>{message.text}</ReactMarkdown>
              ) : (
                <Typography variant="body1" sx={{ fontFamily: 'Poppins, sans-serif' }}>{message.text}</Typography>
              )}

              {message.verified && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mt: 1,
                    fontSize: "0.75rem",
                    color: "success.main",
                  }}
                >
                  <CheckCircleIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                  <Typography variant="caption">Terverifikasi</Typography>
                </Box>
              )}

              {message.corrected && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mt: 1,
                    fontSize: "0.75rem",
                    color: "warning.main",
                  }}
                >
                  <WarningIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                  <Typography variant="caption">Telah dikoreksi</Typography>
                </Box>
              )}
            </Paper>
          </Box>
        ))}

        {loading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "flex-end",
              mb: 2,
              gap: 1.5,
            }}
          >
            <Box sx={{ flexShrink: 0, width: 48, height: 48, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img src="/images/bung-itung.png" alt="Bung Itung" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </Box>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: '20px 20px 20px 4px',
                border: '1px solid #eee',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              }}
            >
              <TypingDots />
            </Paper>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ p: 2, bgcolor: "background.paper" }}
      >
        <Box sx={{ display: "flex", gap: 1, bgcolor: "background.paper" }}>
          <TextField
            fullWidth
            placeholder={
              verified
                ? "Chat telah diverifikasi. Klik tombol Chat Baru untuk memulai percakapan baru"
                : "Tanyakan apa saja terkait konsep definisi Sensus Ekonomi"
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!chatId || verified || loading}
            variant="outlined"
            size="medium"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: '30px',
                backgroundColor: '#ffffff',
                "& fieldset": {
                  borderColor: "#e0e0e0",
                },
                "&:hover fieldset": {
                  borderColor: "#297373", // Hijau muda
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#f68839", // Orange
                  borderWidth: '2px'
                },
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={!input.trim() || !chatId || verified || loading}
            endIcon={
              loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SendIcon />
              )
            }
            sx={{
              backgroundColor: "#f68839", // Orange
              borderRadius: '30px',
              padding: '0 24px',
              fontWeight: 'bold',
              textTransform: 'none',
              boxShadow: '0 4px 14px 0 rgba(246, 136, 57, 0.39)',
              transition: 'all 0.3s ease',
              "&:hover": { 
                backgroundColor: "#e07629",
                boxShadow: '0 6px 20px rgba(246, 136, 57, 0.6)'
              },
              "&.Mui-disabled": {
                backgroundColor: "#e0e0e0"
              }
            }}
          >
            Kirim
          </Button>
        </Box>

        {verified && (
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Chat ini telah diverifikasi oleh admin. Silakan memulai chat baru.
            </Typography>
            <Button
              variant="contained"
              color="success"
              startIcon={<AddCircleIcon />}
              onClick={handleNewChat}
              sx={{ mt: 1 }}
            >
              Mulai Chat Baru
            </Button>
          </Box>
        )}
      </Box>
      <style jsx global>{`
        * {
          font-family: 'Poppins', sans-serif !important;
        }
        .logo-serif {
          font-family: Georgia, 'Times New Roman', serif !important;
        }
      `}</style>
    </Box>
  );
}
