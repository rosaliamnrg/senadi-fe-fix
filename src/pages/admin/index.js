import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Container,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Divider,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardActions,
  Grid
} from '@mui/material';
import Link from 'next/link';

export default function Admin() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [correction, setCorrection] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const { email } = useAuth();

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const res = await fetch('http://localhost:5000/admin/chats');
      const data = await res.json();
      setChats(data.chats || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const handleViewChat = async (chatId) => {
    try {
      const res = await fetch(`http://localhost:5000/chat/${chatId}`);
      const data = await res.json();
      setSelectedChat(data);
      setOpenDialog(true);
    } catch (error) {
      console.error('Error fetching chat:', error);
    }
  };

  const handleVerify = async (messageId) => {
    try {
      await fetch('http://localhost:5000/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: messageId })
      });
      fetchChats();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error verifying message:', error);
    }
  };

  const handleCorrect = async (messageId) => {
    try {
      await fetch('http://localhost:5000/admin/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message_id: messageId,
          correction: correction 
        })
      });
      setCorrection('');
      fetchChats();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error correcting message:', error);
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await fetch('http://localhost:5000/admin/knowledge', {
        method: 'POST',
        body: formData
      });
      alert('File berhasil diupload');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Gagal upload file');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4 }}>
      <Container maxWidth="md">
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Logged in as: {email}
          </Typography>
        </Paper>

        {/* Admin Navigation Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Verifikasi Chat
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Verifikasi dan koreksi chat pengguna dengan bot susenas.
                </Typography>
              </CardContent>
              <CardActions>
                <Link href="/admin/chat" passHref>
                  <Button size="small" color="primary">
                    Buka Halaman Verifikasi
                  </Button>
                </Link>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Upload Knowledge Base
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Upload file PDF, CSV, atau teks sebagai knowledge base bot.
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  component="label"
                  size="small"
                >
                  Upload File
                  <input
                    type="file"
                    hidden
                    onChange={handleUpload}
                    accept=".pdf,.csv,.txt,.xlsx"
                  />
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>

        <Stack spacing={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Daftar Chat
            </Typography>
            <List>
              {chats.map((chat, index) => (
                <Box key={chat.id}>
                  {index > 0 && <Divider />}
                  <ListItem
                    secondaryAction={
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleViewChat(chat.id)}
                      >
                        Lihat Chat
                      </Button>
                    }
                  >
                    <ListItemText
                      primary={chat.question}
                      secondary={`From: ${chat.user} - ${chat.verified ? '✓ Terverifikasi' : 'Belum diverifikasi'}`}
                    />
                  </ListItem>
                </Box>
              ))}
            </List>
          </Paper>
        </Stack>
      </Container>

      {/* Dialog untuk melihat dan verifikasi chat */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Detail Chat</DialogTitle>
        <DialogContent>
          {selectedChat?.messages?.map((msg, index) => (
            <Paper 
              key={index}
              sx={{ 
                p: 2, 
                mb: 2, 
                bgcolor: msg.sender === 'user' ? 'primary.light' : 'background.default'
              }}
            >
              <Typography variant="body1">
                {msg.message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {msg.sender} - {msg.verified ? '✓ Terverifikasi' : 'Belum diverifikasi'}
              </Typography>
              
              {msg.sender === 'bot' && !msg.verified && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleVerify(msg.id)}
                    sx={{ mr: 1 }}
                  >
                    Verifikasi
                  </Button>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Masukkan koreksi jika jawaban salah"
                    value={correction}
                    onChange={(e) => setCorrection(e.target.value)}
                    sx={{ mt: 1 }}
                  />
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={() => handleCorrect(msg.id)}
                    disabled={!correction}
                    sx={{ mt: 1 }}
                  >
                    Kirim Koreksi
                  </Button>
                </Box>
              )}
            </Paper>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Tutup</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}