import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BlurImage from './BlurImage';
import PageTransition from './PageTransition';
import { useMessages } from '../context/MessageContext';
import { getUserData, CURRENT_USER_ID } from '../context/VisitContext';

const Chat: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { getConversationMessages, sendMessage, markAsRead } = useMessages();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const oderId = parseInt(id || '0');
    const otherUser = getUserData(oderId);
    const messages = getConversationMessages(oderId);

    useEffect(() => {
        markAsRead(oderId);
    }, [oderId, markAsRead]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (newMessage.trim()) {
            sendMessage(oderId, newMessage.trim());
            setNewMessage('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <PageTransition>
            <div style={{ 
                height: '100vh',
                display: 'flex', 
                flexDirection: 'column',
                background: 'var(--color-background)'
            }}>
                {/* Header */}
                <div style={{ 
                    padding: '16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '16px',
                    background: 'var(--color-surface)', 
                    borderBottom: '1px solid var(--color-border)' 
                }}>
                    <button 
                        onClick={() => navigate(-1)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)' }}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div 
                        onClick={() => navigate(`/user/${oderId}`)}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, cursor: 'pointer' }}
                    >
                        <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            overflow: 'hidden'
                        }}>
                            <BlurImage src={otherUser.image} alt={otherUser.name} />
                        </div>
                        <div>
                            <h3 style={{ fontWeight: '700', fontSize: '16px', color: 'var(--color-text)' }}>
                                {otherUser.name}, {otherUser.age}
                            </h3>
                            <span style={{ fontSize: '12px', color: '#22c55e' }}>{t('social.online')}</span>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}>
                    {messages.length === 0 ? (
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            color: 'var(--color-text-muted)'
                        }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                overflow: 'hidden'
                            }}>
                                <BlurImage src={otherUser.image} alt={otherUser.name} />
                            </div>
                            <p style={{ fontSize: '14px' }}>
                                {t('chat.startChat', { name: otherUser.name })}
                            </p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.senderId === CURRENT_USER_ID;
                            return (
                                <div
                                    key={msg.id}
                                    style={{
                                        display: 'flex',
                                        justifyContent: isMe ? 'flex-end' : 'flex-start'
                                    }}
                                >
                                    <div style={{
                                        maxWidth: '75%',
                                        padding: '10px 14px',
                                        borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                        background: isMe 
                                            ? 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' 
                                            : 'var(--color-surface)',
                                        color: isMe ? 'white' : 'var(--color-text)',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }}>
                                        <p style={{ fontSize: '14px', lineHeight: '1.4', marginBottom: '4px' }}>
                                            {msg.content}
                                        </p>
                                        <span style={{ fontSize: '10px', opacity: 0.7, display: 'block', textAlign: 'right' }}>
                                            {formatTime(msg.timestamp)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div style={{
                    padding: '12px 16px 24px',
                    background: 'var(--color-surface)',
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-end'
                }}>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={t('chat.placeholder')}
                        style={{
                            flex: 1,
                            padding: '12px 16px',
                            borderRadius: '24px',
                            border: '1px solid var(--color-border)',
                            background: 'var(--color-background)',
                            color: 'var(--color-text)',
                            fontSize: '14px',
                            outline: 'none'
                        }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!newMessage.trim()}
                        style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            border: 'none',
                            background: newMessage.trim() 
                                ? 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)'
                                : 'var(--color-border)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: newMessage.trim() ? 'pointer' : 'not-allowed'
                        }}
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </PageTransition>
    );
};

export default Chat;
