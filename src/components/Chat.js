import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Box, TextField, Button, Paper, Typography, CircularProgress, Alert, Grid } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ChatList from './ChatList';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [chatVerified, setChatVerified] = useState(false);
  const [error, setError] = useState('');
  const { fetchWithAuth, logout } = useAuth();

  // Load chat ID from localStorage on component mount
  useEffect(() => {
    const storedChatId = localStorage.getItem('currentChatId');
    const storedChatVerified = localStorage.getItem('currentChatVerified') === 'true';
    
    if (storedChatId) {
      setChatId(storedChatId);
      setChatVerified(storedChatVerified);
      
      // Load messages for the stored chat
      if (storedChatId) {
        loadMessages(storedChatId);
      }
    } else {
      createNewChat();
    }
  }, []);
  
  // Load messages for a chat
  const loadMessages = async (id) => {
    try {
      setError('');
      setLoading(true);
      
      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/chat/${id}/messages`, {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error('Failed to load messages');
      }
      
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages.map(msg => ({
          id: msg.id,
          text: msg.message,
          sender: msg.sender,
          verified: !msg.is_corrected,
          isCorrected: msg.is_corrected,
          isCorrection: msg.is_correction
        })));
        setChatVerified(data.chat.verified);
        
        // Update localStorage
        localStorage.setItem('currentChatVerified', data.chat.verified);
      } else {
        throw new Error(data.error || 'Failed to load messages');
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createNewChat = async () => {
    try {
      setError('');
      setLoading(true);
      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/chat/new`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to create new chat');
      }
      
      const data = await response.json();
      if (data.success) {
        const newChatId = data.chat_id;
        setChatId(newChatId);
        setChatVerified(false);
        setMessages([]);
        
        // Save to localStorage
        localStorage.setItem('currentChatId', newChatId);
        localStorage.setItem('currentChatVerified', 'false');
      } else {
        throw new Error(data.error || 'Failed to create chat');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      setError('Failed to start chat. Please try logging in again.');
      logout();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !chatId || chatVerified || loading) return;
    
    const userMessage = input;
    setInput('');
    setLoading(true);
    setError('');
    
    // Add user message to chat immediately
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    
    try {
      console.log('Sending message to:', `${process.env.NEXT_PUBLIC_API_URL}/chat/${chatId}`);
      console.log('Message:', userMessage);
      
      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/chat/${chatId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Gagal mengirim pesan');
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setMessages(prev => [...prev, { 
          text: data.message,
          sender: 'bot',
          verified: data.verified
        }]);
        
        if (data.verified) {
          setChatVerified(true);
          localStorage.setItem('currentChatVerified', 'true');
        }
      } else {
        throw new Error(data.error || 'Gagal mendapatkan respons');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Gagal mengirim pesan: ' + error.message);
      
      // Remove user message if error occurs
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    // Clear localStorage values
    localStorage.removeItem('currentChatId');
    localStorage.removeItem('currentChatVerified');
    
    setChatId(null);
    setChatVerified(false);
    setMessages([]);
    setError('');
    
    // Create a new chat
    createNewChat();
  };

  const handleSelectChat = (selectedChatId) => {
    // Check if we're already viewing this chat
    if (selectedChatId === chatId) return;
    
    // Save the new chat ID to localStorage
    localStorage.setItem('currentChatId', selectedChatId);
    
    // Load the selected chat
    setChatId(selectedChatId);
    setMessages([]);
    setError('');
    loadMessages(selectedChatId);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Paper elevation={3} sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6">Chat dengan Bot Susenas</Typography>
      </Paper>

      <Grid container spacing={2} sx={{ flex: 1, overflow: 'hidden' }}>
        {/* Chat List Column */}
        <Grid item xs={12} md={3} sx={{ height: '100%' }}>
          <ChatList 
            onSelectChat={handleSelectChat} 
            onCreateNewChat={handleNewChat}
            selectedChatId={chatId}
          />
        </Grid>

        {/* Chat Content Column */}
        <Grid item xs={12} md={9} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ flex: 1, overflow: 'auto', mb: 2, p: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    bgcolor: message.sender === 'user' ? 'primary.main' : 'grey.100',
                    color: message.sender === 'user' ? 'white' : 'text.primary',
                    borderLeft: message.isCorrection ? '3px solid green' : 'none',
                    borderRight: message.isCorrected ? '3px solid orange' : 'none'
                  }}
                >
                  <Typography>{message.text}</Typography>
                  {message.verified && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <CheckCircleIcon color="success" fontSize="small" />
                      <Typography variant="caption" sx={{ ml: 1 }}>
                        Terverifikasi
                      </Typography>
                    </Box>
                  )}
                  {message.isCorrected && (
                    <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1 }}>
                      Jawaban ini telah dikoreksi
                    </Typography>
                  )}
                  {message.isCorrection && (
                    <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1 }}>
                      Jawaban terkoreksi
                    </Typography>
                  )}
                </Paper>
              </Box>
            ))}
            
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={30} />
              </Box>
            )}
          </Box>

          <Paper elevation={3} sx={{ p: 2 }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={chatVerified ? "Chat telah diverifikasi. Klik tombol Chat Baru untuk memulai sesi baru" : "Ketik pesan Anda..."}
                  disabled={loading || chatVerified || !chatId}
                  error={!!error}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!input.trim() || loading || chatVerified || !chatId}
                  color="primary"
                >
                  {loading ? <CircularProgress size={24} /> : <SendIcon />}
                </Button>
              </Box>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Chat; 