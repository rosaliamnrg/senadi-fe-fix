import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemButton, 
  Divider, 
  Typography, 
  IconButton, 
  Paper, 
  CircularProgress,
  Button,
  Alert
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { formatDistanceToNow } from 'date-fns';

const ChatList = ({ onSelectChat, onCreateNewChat, selectedChatId }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { fetchWithAuth } = useAuth();

  // Load all user chats
  useEffect(() => {
    const loadChats = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/chats`, {
          method: 'GET'
        });
        
        if (!response.ok) {
          throw new Error('Failed to load chats');
        }
        
        const data = await response.json();
        if (data.success) {
          setChats(data.chats);
        } else {
          throw new Error(data.error || 'Failed to load chat list');
        }
      } catch (err) {
        console.error('Error loading chats:', err);
        setError('Failed to load chat history');
      } finally {
        setLoading(false);
      }
    };
    
    loadChats();
  }, [fetchWithAuth]);

  const handleCreateNewChat = () => {
    if (onCreateNewChat) {
      onCreateNewChat();
    }
  };

  const handleSelectChat = (chatId) => {
    if (onSelectChat) {
      onSelectChat(chatId);
    }
  };

  const formatChatTitle = (chat) => {
    if (chat.title) return chat.title;
    if (chat.last_message) {
      // Truncate last message to create a title
      return chat.last_message.length > 30 
        ? chat.last_message.substring(0, 30) + '...'
        : chat.last_message;
    }
    return 'New Chat';
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        width: '100%', 
        maxWidth: 360,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Daftar Chat</Typography>
        <Button 
          startIcon={<AddCircleIcon />} 
          onClick={handleCreateNewChat}
          color="primary"
          variant="contained"
          size="small"
        >
          Chat Baru
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ overflow: 'auto', flex: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : chats.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              Belum ada chat
            </Typography>
          </Box>
        ) : (
          <List>
            {chats.map((chat) => (
              <React.Fragment key={chat.id}>
                <ListItemButton 
                  selected={selectedChatId === chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                >
                  <ListItemText 
                    primary={formatChatTitle(chat)}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {chat.verified && (
                          <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
                        )}
                        <Typography variant="caption" component="span">
                          {formatTime(chat.created_at)}
                        </Typography>
                      </Box>
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
  );
};

export default ChatList; 