import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../contexts/AuthContext";
import LayoutAdmin from "./layout";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Grid,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import '@fontsource/inter'; // default
import '@fontsource/epilogue'; // untuk judul

export default function AdminChat() {
  const [tab, setTab] = useState(0);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    isAuthenticated,
    isAdmin,
    loading: authLoading,
    fetchWithAuth,
  } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }

    if (!authLoading && !isAdmin) {
      router.push("/chat");
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  useEffect(() => {
    const loadChats = async () => {
      if (!isAuthenticated || !isAdmin) return;

      try {
        setLoading(true);
        setError("");

        const response = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/chats`,
          {
            method: "GET",
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Gagal memuat daftar chat");
        }

        const data = await response.json();
        if (data.success) {
          // Hanya tampilkan chat yang memiliki pesan
          const chatsWithMessages = data.chats.filter(
            (chat) =>
              chat.message_count > 0 &&
              (chat.last_user_message || chat.last_bot_message)
          );
          setChats(chatsWithMessages);
        } else {
          throw new Error(data.error || "Gagal memuat daftar chat");
        }
      } catch (error) {
        console.error("Error loading chats:", error);
        setError("Gagal memuat daftar chat. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && isAdmin && !authLoading) {
      loadChats();
    }
  }, [isAuthenticated, isAdmin, authLoading, fetchWithAuth]);

  const handleSelectChat = async (chatId) => {
    try {
      setSelectedChat(chatId);
      setLoading(true);
      setError("");

      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/chats/${chatId}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal memuat pesan chat");
      }

      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
      } else {
        throw new Error(data.error || "Gagal memuat pesan chat");
      }
    } catch (error) {
      console.error("Error loading chat messages:", error);
      setError("Gagal memuat pesan chat. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!selectedChat) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/verify/${selectedChat}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal memverifikasi chat");
      }

      const data = await response.json();
      if (data.success) {
        // Refresh chat list and selected chat
        const updatedChats = chats.map((chat) =>
          chat.id === selectedChat ? { ...chat, verified: true } : chat
        );
        setChats(updatedChats);

        // Find last bot message and mark as verified
        const updatedMessages = messages.map((msg) =>
          msg.sender === "bot" ? { ...msg, verified: true } : msg
        );
        setMessages(updatedMessages);
      } else {
        throw new Error(data.error || "Gagal memverifikasi chat");
      }
    } catch (error) {
      console.error("Error verifying chat:", error);
      setError("Gagal memverifikasi chat. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleCorrect = async (e) => {
    e.preventDefault();
    if (!selectedChat || !input.trim()) return;

    try {
      setLoading(true);
      setError("");

      // Find the last bot message
      const lastBotMessage = [...messages]
        .reverse()
        .find((msg) => msg.sender === "bot" && !msg.is_correction);

      if (!lastBotMessage) {
        throw new Error("Tidak ada pesan bot yang dapat dikoreksi");
      }

      console.log("Correcting message ID:", lastBotMessage.id);

      // Perbaiki URL - gunakan message_id, bukan chat_id
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/correct/${lastBotMessage.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            correction: input,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal mengoreksi jawaban");
      }

      const data = await response.json();
      if (data.success) {
        // Reload chat details to get the updated messages
        await handleSelectChat(selectedChat);
        setInput("");
      } else {
        throw new Error(data.error || "Gagal mengoreksi jawaban");
      }
    } catch (error) {
      console.error("Error correcting message:", error);
      setError("Gagal mengoreksi jawaban. Silakan coba lagi.");
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

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <Box sx={{ height: "100vh", overflow: "hidden" }}>
      <LayoutAdmin>
        {error && (
          <Alert severity="error" sx={{ mt: 2, mx: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2, mx: 2 }}>
            {success}
          </Alert>
        )}
        {/* <Grid container spacing={2} sx={{ height: 'calc(100vh - 112px)', overflow: 'hidden' }}> */}
        <Grid
          container
          spacing={2}
          sx={{
            height: "calc(100vh - 112px)",
            overflow: "hidden",
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          {/* <Grid item xs={12} md={4} sx={{ height: "100%" }}> */}
          <Grid
            item
            xs={12}
            md={4}
            sx={{
              height: { xs: selectedChat ? 0 : "100%", md: "100%" },
              display: { xs: selectedChat ? "none" : "block", md: "block" },
            }}
          >
            <Paper
              elevation={3}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
                <Typography sx={{ fontSize: '20px' }}>Daftar Chat</Typography>
              </Box>
              <Box sx={{ flexGrow: 1, overflow: "auto" }}>
                {loading && chats.length === 0 ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <CircularProgress />
                  </Box>
                ) : chats.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: "center" }}>
                    <Typography color="text.secondary">
                      Belum ada chat yang perlu diverifikasi
                    </Typography>
                  </Box>
                ) : (
                  <List>
                    {chats.map((chat, index) => (
                      <React.Fragment key={chat.id}>
                        <ListItem
                          button
                          selected={selectedChat === chat.id}
                          onClick={() => handleSelectChat(chat.id)}
                        >
                          <ListItemText
                            primary={
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Typography variant="body1">
                                  {chat.username ||
                                    `User #${chat.user_id.substring(0, 8)}`}
                                </Typography>
                                {chat.verified ? (
                                  <CheckCircleIcon
                                    color="success"
                                    fontSize="small"
                                  />
                                ) : (
                                  ""
                                )}
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Box sx={{ mt: 1 }}>
                                  {chat.last_user_message && (
                                    <Typography
                                      variant="caption"
                                      component="div"
                                      sx={{
                                        color: "text.secondary",
                                        fontStyle: "italic",
                                        mb: 0.5,
                                      }}
                                    >
                                      <strong>Q:</strong>{" "}
                                      {chat.last_user_message}
                                    </Typography>
                                  )}
                                  {chat.last_bot_message && (
                                    <Typography
                                      variant="caption"
                                      component="div"
                                      sx={{
                                        color: chat.verified
                                          ? "success.main"
                                          : "text.primary",
                                        fontStyle: "italic",
                                        border: chat.verified
                                          ? "1px solid #59BA5D"
                                          : "1px dashed #EEA018",
                                        p: 0.5,
                                        borderRadius: "4px",
                                      }}
                                    >
                                      <strong>A:</strong>{" "}
                                      {chat.last_bot_message}
                                    </Typography>
                                  )}
                                </Box>
                                <Typography
                                  variant="caption"
                                  component="div"
                                  sx={{ mt: 1 }}
                                >
                                  {new Date(chat.created_at).toLocaleString(
                                    "id-ID"
                                  )}{" "}
                                  · {chat.message_count} pesan
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < chats.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* <Grid item xs={12} md={8} sx={{ height: "100%" }}> */}
          <Grid
            item
            xs={12}
            md={8}
            sx={{
              height: "100%",
              display: { xs: selectedChat ? "block" : "none", md: "block" },
            }}
          >
            <Paper
              elevation={3}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {selectedChat ? (
                <>
                  <Box
                    sx={{
                      p: 1.6,
                      borderBottom: "1px solid #e0e0e0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontSize: '20px' }}>Detail Chat</Typography>
                      <Button
                        variant="text"
                        onClick={() => setSelectedChat(null)}
                        sx={{
                          display: { xs: "inline-block", md: "none" },
                          mt: 1,
                        }}
                      >
                        ← Kembali
                      </Button>
                    </Box>
                    {messages.some(
                      (msg) => msg.sender === "bot" && !msg.is_corrected
                    ) && (
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={handleVerify}
                        disabled={loading}
                      >
                        Verifikasi Chat
                      </Button>
                    )}
                  </Box>

                  <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
                    {loading ? (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "100%",
                        }}
                      >
                        <CircularProgress />
                      </Box>
                    ) : messages.length === 0 ? (
                      <Box sx={{ p: C, textAlign: "center" }}>
                        <Typography color="text.secondary">
                          Belum ada pesan di chat ini
                        </Typography>
                      </Box>
                    ) : (
                      messages.map((message, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            justifyContent:
                              message.sender === "user"
                                ? "flex-start"
                                : "flex-end",
                            mb: 2,
                          }}
                        >
                          <Paper
                            elevation={1}
                            sx={{
                              p: 2,
                              maxWidth: "80%",
                              bgcolor:
                                message.sender === "user"
                                  ? "#D9EDF6"
                                  : "#F5F5F5",
                              borderLeft: message.is_correction
                                ? "3px solid #59BA5D"
                                : "none",
                              borderRight: message.is_corrected
                                ? "3px solid orange"
                                : "none",
                            }}
                          >
                            <Typography variant="body1">
                              {message.message}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block", mt: 1 }}
                            >
                              {message.sender === "user" ? "Pengguna" : "Bot"} ·{" "}
                              {new Date(message.created_at).toLocaleString(
                                "id-ID"
                              )}
                            </Typography>

                            {message.is_corrected === true && (
                              <Typography
                                variant="caption"
                                color="warning.main"
                                sx={{ display: "block", mt: 1 }}
                              >
                                Jawaban ini telah dikoreksi
                              </Typography>
                            )}
                            {message.is_correction === true && (
                              <Typography
                                variant="caption"
                                color="success.main"
                                sx={{ display: "block", mt: 1 }}
                              >
                                Jawaban terkoreksi
                              </Typography>
                            )}
                          </Paper>
                        </Box>
                      ))
                    )}
                  </Box>

                  <Box sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
                    <form onSubmit={handleCorrect}>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <TextField
                          fullWidth
                          placeholder="Ketik koreksi untuk jawaban bot terakhir..."
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          disabled={loading}
                        />
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          disabled={!input.trim() || loading}
                          endIcon={
                            loading ? (
                              <CircularProgress size={20} />
                            ) : (
                              <SendIcon />
                            )
                          }
                          sx={{backgroundColor: '#06344E', '&:hover': {backgroundColor: '#347AB6',}}}
                        >
                          Koreksi
                        </Button>
                      </Box>
                    </form>
                  </Box>
                </>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <Typography color="text.secondary">
                    Pilih chat di daftar untuk melihat detail
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </LayoutAdmin>
      <style jsx global>{`
        * {
          font-family: 'Inter', sans-serif !important;
        }
      `}</style>
    </Box>
  );
}
