import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  Divider, 
  TextField, 
  Button, 
  CircularProgress, 
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';

const AdminChat = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState('');
  const [correction, setCorrection] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { fetchWithAuth } = useAuth();

  // Load all chats for verification
  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/chats`, {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error('Failed to load chats');
      }
      
      const data = await response.json();
      console.log("Data chats dari server:", data);
      
      if (data.success) {
        console.log("Chat list:", data.chats);
        
        // Pastikan message_count adalah angka untuk setiap chat dan filter hanya chat dengan pesan
        const processedChats = data.chats
          .map(chat => ({
            ...chat,
            message_count: Number(chat.message_count) || 0
          }))
          .filter(chat => chat.message_count > 0);
        
        setChats(processedChats);
      } else {
        throw new Error(data.error || 'Failed to load chat list');
      }
    } catch (err) {
      console.error('Error loading chats:', err);
      setError('Failed to load chats: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadChatDetails = async (chatId) => {
    try {
      setChatLoading(true);
      setError('');
      
      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/chats/${chatId}`, {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error('Failed to load chat details');
      }
      
      const data = await response.json();
      if (data.success) {
        setSelectedChat(data.chat);
        setMessages(data.messages);
      } else {
        throw new Error(data.error || 'Failed to load chat details');
      }
    } catch (err) {
      console.error('Error loading chat details:', err);
      setError('Failed to load chat: ' + err.message);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSelectChat = (chatId) => {
    loadChatDetails(chatId);
  };

  const handleVerifyChat = async () => {
    if (!selectedChat) return;
    
    try {
      setChatLoading(true);
      setError('');
      
      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/verify/${selectedChat.id}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to verify chat');
      }
      
      const data = await response.json();
      if (data.success) {
        // Update the chat in the list
        setChats(chats.map(chat => 
          chat.id === selectedChat.id ? { ...chat, verified: true } : chat
        ));
        
        // Update selected chat
        setSelectedChat({ ...selectedChat, verified: true });
        
        // Reload all chats to get fresh data
        loadChats();
      } else {
        throw new Error(data.error || 'Failed to verify chat');
      }
    } catch (err) {
      console.error('Error verifying chat:', err);
      setError('Failed to verify chat: ' + err.message);
    } finally {
      setChatLoading(false);
    }
  };

  const handleOpenCorrection = (message) => {
    if (message.sender !== 'bot') return;
    setSelectedMessage(message);
    setCorrection(message.message); // Pre-fill with the original message
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedMessage(null);
    setCorrection('');
  };

  const handleSubmitCorrection = async () => {
    if (!selectedMessage || !correction.trim()) return;
    
    try {
      setLoading(true);
      
      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/correct/${selectedMessage.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correction })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit correction');
      }
      
      const data = await response.json();
      if (data.success) {
        // Close the dialog
        handleCloseDialog();
        
        // Reload the chat details to show the correction
        if (selectedChat) {
          loadChatDetails(selectedChat.id);
        }
        
        // Reload all chats to refresh verification status
        loadChats();
      } else {
        throw new Error(data.error || 'Failed to submit correction');
      }
    } catch (err) {
      console.error('Error submitting correction:', err);
      setError('Failed to submit correction: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      
      // Simple relative time formatting
      const now = new Date();
      const diffMs = now - date;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);
      
      if (diffSec < 60) return 'baru saja';
      if (diffMin < 60) return `${diffMin} menit yang lalu`;
      if (diffHour < 24) return `${diffHour} jam yang lalu`;
      if (diffDay < 30) return `${diffDay} hari yang lalu`;
      
      // If older than 30 days, just show the date
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Admin - Verifikasi Chat</Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2, mx: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ flex: 1, overflow: 'hidden', px: 2, pb: 2 }}>
        {/* Chats List */}
        <Grid item xs={12} md={4} sx={{ height: '100%' }}>
          <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="h6">Daftar Chat</Typography>
            </Box>
            
            <Box sx={{ overflow: 'auto', flex: 1 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : chats.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    Belum ada chat yang memiliki pesan
                  </Typography>
                </Box>
              ) : (
                <List>
                  {chats.map((chat) => (
                    <React.Fragment key={chat.id}>
                      <ListItemButton 
                        selected={selectedChat && selectedChat.id === chat.id}
                        onClick={() => handleSelectChat(chat.id)}
                      >
                        <ListItemText 
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1" noWrap>
                                {chat.username}
                              </Typography>
                              {chat.verified && (
                                <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
                              )}
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="caption" component="span">
                                {formatTime(chat.created_at)}
                              </Typography>
                              {chat.message_count > 0 && (
                                <Typography 
                                  variant="caption" 
                                  component="span" 
                                  sx={{ 
                                    ml: 1, 
                                    background: 'primary.main', 
                                    color: 'white', 
                                    borderRadius: '10px', 
                                    px: 1, 
                                    py: 0.2
                                  }}
                                >
                                  {chat.message_count} pesan
                                </Typography>
                              )}
                              {chat.last_user_message && (
                                <Typography 
                                  variant="caption"
                                  component="div"
                                  sx={{ 
                                    mt: 1,
                                    display: 'flex',
                                    color: 'text.secondary',
                                    fontStyle: 'italic'
                                  }}
                                >
                                  <Box sx={{ fontWeight: 'bold', mr: 1 }}>User:</Box> 
                                  {chat.last_user_message}
                                </Typography>
                              )}
                              {chat.last_bot_message && (
                                <Typography 
                                  variant="caption"
                                  component="div"
                                  sx={{ 
                                    mt: 0.5,
                                    display: 'flex',
                                    color: 'text.primary',
                                    fontStyle: 'italic',
                                    border: chat.verified ? '1px solid #4caf50' : '1px dashed #ff9800',
                                    borderRadius: '4px',
                                    p: 0.5,
                                    background: chat.verified ? 'rgba(76, 175, 80, 0.05)' : 'rgba(255, 152, 0, 0.05)'
                                  }}
                                >
                                  <Box sx={{ fontWeight: 'bold', mr: 1, color: chat.verified ? 'success.main' : 'warning.main' }}>
                                    Bot:
                                  </Box> 
                                  {chat.last_bot_message}
                                </Typography>
                              )}
                            </>
                          }
                        />
                      </ListItemButton>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Chat Messages */}
        <Grid item xs={12} md={8} sx={{ height: '100%' }}>
          <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                {selectedChat ? `Chat dengan ${selectedChat.username}` : 'Pilih Chat'}
              </Typography>
              {selectedChat && !selectedChat.verified && (
                <Button 
                  variant="contained" 
                  color="success" 
                  startIcon={<CheckCircleIcon />}
                  onClick={handleVerifyChat}
                  disabled={chatLoading}
                >
                  Verifikasi
                </Button>
              )}
            </Box>
            
            <Box sx={{ overflow: 'auto', flex: 1, p: 2 }}>
              {chatLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : !selectedChat ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    Pilih chat untuk melihat pesan
                  </Typography>
                </Box>
              ) : messages.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    Belum ada pesan
                  </Typography>
                </Box>
              ) : (
                messages.map((message, index) => (
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
                        position: 'relative',
                        bgcolor: message.sender === 'user' ? 'primary.main' : 'grey.100',
                        color: message.sender === 'user' ? 'white' : 'text.primary',
                        borderLeft: message.is_correction ? '3px solid green' : 'none',
                        borderRight: message.is_corrected ? '3px solid orange' : 'none'
                      }}
                    >
                      <Typography>{message.message}</Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(message.created_at)}
                        </Typography>
                        
                        {message.sender === 'bot' && !message.is_corrected && !message.is_correction && (
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleOpenCorrection(message)}
                            sx={{ ml: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                      
                      {message.is_corrected && (
                        <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1 }}>
                          Jawaban ini telah dikoreksi
                        </Typography>
                      )}
                      {message.is_correction && (
                        <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1 }}>
                          Jawaban terkoreksi
                        </Typography>
                      )}
                    </Paper>
                  </Box>
                ))
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Correction Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Koreksi Jawaban Bot</DialogTitle>
        <DialogContent>
          {selectedMessage && (
            <>
              <Box sx={{ mb: 3, mt: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">Jawaban Original:</Typography>
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.100' }}>
                  <Typography>{selectedMessage.message}</Typography>
                </Paper>
              </Box>
              
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Jawaban Koreksi:</Typography>
              <TextField
                fullWidth
                multiline
                rows={6}
                value={correction}
                onChange={(e) => setCorrection(e.target.value)}
                placeholder="Ketik koreksi jawaban disini..."
                variant="outlined"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Batal</Button>
          <Button 
            onClick={handleSubmitCorrection} 
            variant="contained" 
            color="primary"
            disabled={!correction.trim() || loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
          >
            Kirim Koreksi
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminChat; 