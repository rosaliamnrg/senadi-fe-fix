// src/pages/daftarchat.jsx
import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import styles from '../styles/style-daftarchat.module.css'; // ✅ CSS Module

export default function DaftarChat() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [correctionMessage, setCorrectionMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (selectedChat) fetchChatMessages(selectedChat);
  }, [selectedChat]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const { chats } = await api.getAllChats();
      setChats(chats);
    } catch (err) {
      setError('Gagal memuat percakapan');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatMessages = async (chatId) => {
    try {
      setLoading(true);
      const { messages } = await api.getChatHistory(chatId);
      setChatMessages(messages);
    } catch (err) {
      setError('Gagal memuat pesan');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (messageId) => {
    try {
      setLoading(true);
      await api.verifyAnswer(messageId, selectedChat);
      await Promise.all([fetchChatMessages(selectedChat), fetchChats()]);
    } catch (err) {
      setError('Gagal verifikasi jawaban');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCorrectSubmit = async (messageId) => {
    if (!correctionMessage.trim()) return;
    
    try {
      setLoading(true);
      await api.correctAnswer(messageId, selectedChat, correctionMessage);
      setCorrectionMessage('');
      await Promise.all([fetchChatMessages(selectedChat), fetchChats()]);
    } catch (err) {
      setError('Gagal mengirim koreksi');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  return (
    <div className="daftar-chat-container">
      <div className="chat-list">
        <h2>Daftar Percakapan</h2>
        {chats.length === 0 ? (
          <p>Tidak ada percakapan</p>
        ) : (
          <ul>
            {chats.map((chat) => (
              <li
                key={chat.id}
                className={`
                  chat-item 
                  ${selectedChat === chat.id ? 'selected' : ''} 
                  ${chat.status === 'closed' ? 'closed' : ''}
                `}
                onClick={() => setSelectedChat(chat.id)}
              >
                <div className="chat-item-header">
                  <span className="chat-username">{chat.username}</span>
                  <span className={`chat-status ${chat.status}`}>
                    {chat.status === 'active' ? 'Aktif' : 'Tutup'}
                  </span>
                </div>
                <div className="chat-item-details">
                  <span className="message-count">
                    {chat.message_count} pesan
                  </span>
                  <span className="last-activity">
                    {chat.last_activity ? formatDate(chat.last_activity) : 'Tidak ada aktivitas'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="chat-details">
        {selectedChat ? (
          <>
            <h2>Detail Percakapan</h2>
            <div className="chat-messages-container">
              {chatMessages.length === 0 ? (
                <p>Tidak ada pesan</p>
              ) : (
                <div className="admin-chat-messages">
                  {chatMessages.map((msg) => {
                    const messageType = msg.message_type === 'user' 
                      ? 'user-message' 
                      : msg.message_type === 'admin' 
                        ? 'admin-message' 
                        : 'bot-message';

                    return (
                      <div 
                        key={msg.id} 
                        className={`admin-message ${messageType}`}
                      >
                        <div className="admin-message-header">
                          <span className="admin-message-sender">
                            {msg.message_type === 'user' && msg.username}
                            {msg.message_type === 'admin' && 'Admin'}
                            {msg.message_type === 'bot' && 'Susenas Bot'}
                          </span>
                          <span className="admin-message-time">
                            {formatDate(msg.created_at)}
                          </span>
                          {msg.verified && (
                            <span className="verified-badge" title="Jawaban terverifikasi">
                              ✓ Terverifikasi
                            </span>
                          )}
                          {msg.corrected && (
                            <span className="corrected-badge" title="Jawaban dikoreksi">
                              Dikoreksi
                            </span>
                          )}
                          {msg.is_correction && (
                            <span className="correction-badge" title="Koreksi">
                              Koreksi
                            </span>
                          )}
                        </div>
                        <div className="admin-message-content">{msg.content}</div>
                        
                        {msg.message_type === 'bot' && !msg.verified && !msg.corrected && (
                          <div className="admin-actions">
                            <button 
                              className="verify-btn"
                              onClick={() => handleVerify(msg.id)}
                              disabled={loading}
                            >
                              Verifikasi
                            </button>
                            
                            <div className="correction-form">
                              <textarea
                                placeholder="Masukkan koreksi..."
                                value={correctionMessage}
                                onChange={(e) => setCorrectionMessage(e.target.value)}
                                disabled={loading}
                              />
                              <button 
                                onClick={() => handleCorrectSubmit(msg.id)}
                                disabled={loading || !correctionMessage.trim()}
                              >
                                Koreksi & Verifikasi
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <p>Pilih percakapan untuk melihat detail</p>
          </div>
        )}
      </div>
      
      {loading && <div className="loading-overlay">Memuat...</div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}