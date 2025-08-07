// src/utils/script-chat.js
import { sendMessage, getChatHistory, createNewChat } from './api';

export const initChat = (chatId, setChatId, messages, setMessages, getToken) => {
  // Load chat history if chatId exists
  const loadChatHistory = async () => {
    if (chatId) {
      try {
        const token = getToken();
        const data = await getChatHistory(chatId, token);
        if (data.messages) {
          setMessages(data.messages);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
  };
  
  // Create new chat if no chatId
  const startNewChat = async () => {
    try {
      const token = getToken();
      const data = await createNewChat(token);
      if (data.chat_id) {
        setChatId(data.chat_id);
        return data.chat_id;
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
    return null;
  };
  
  // Send message to bot
  const handleSendMessage = async (message) => {
    if (!message.trim()) return;
    
    // Add user message to UI
    const userMessage = {
      id: Date.now(),
      content: message,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      const token = getToken();
      const data = await sendMessage(message, chatId, token);
      
      if (data.response) {
        // Add bot response to UI
        const botMessage = {
          id: data.message_id,
          content: data.response,
          sender: 'bot',
          verified: false,
          timestamp: new Date().toISOString(),
        };
        
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error in UI
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          content: 'Sorry, there was an error processing your message.',
          sender: 'system',
          timestamp: new Date().toISOString(),
        }
      ]);
    }
  };
  
  return {
    loadChatHistory,
    startNewChat,
    handleSendMessage
  };
};