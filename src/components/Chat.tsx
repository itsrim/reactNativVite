import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Settings, Volume2, VolumeX, Bell, BellOff, UserMinus, LogOut, Trash2, User, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import BlurImage from './BlurImage';
import PageTransition from './PageTransition';
import { useMessages, SocialGroup } from '../context/MessageContext';
import { getUserData, CURRENT_USER_ID, CURRENT_USER } from '../context/VisitContext';
import { GroupAvatar } from './Social/GroupAvatar';
import { SUGGESTIONS } from '../data/mockSuggestions';

const Chat: React.FC = () => {
    const { id = '' } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { getConversationMessages, sendMessage, markAsRead, chatSettings, updateChatSettings, leaveGroup, removeMember, groups, addMember } = useMessages();
    const [newMessage, setNewMessage] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [isConfirmingLeave, setIsConfirmingLeave] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Vérifier si c'est un groupe ou un utilisateur
    const isGroup = id.startsWith('group-');
    const numericId = parseInt(isGroup ? id.replace('group-', '') : id);

    const otherUser = isGroup ? null : getUserData(numericId);
    const groupData = isGroup ? groups.find((g: SocialGroup) => g.id === numericId) : null;

    // Pour l'instant, MessageContext gère des Ids numériques.
    // On pourrait l'étendre, mais ici on va juste utiliser numericId pour les messages du groupe.
    // NOTE: Dans une vraie app, on utiliserait des Ids uniques ou on séparerait les appels.
    const messages = getConversationMessages(numericId);

    useEffect(() => {
        markAsRead(numericId);
    }, [numericId, markAsRead]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (newMessage.trim()) {
            sendMessage(numericId, newMessage.trim());
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
                        onClick={() => !isGroup && navigate(`/user/${numericId}`)}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, cursor: isGroup ? 'default' : 'pointer' }}
                    >
                        <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            background: '#f3f4f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {isGroup ? (
                                <GroupAvatar images={groupData?.images || []} size={44} />
                            ) : (
                                <BlurImage src={otherUser?.image || ''} alt={otherUser?.name || ''} />
                            )}
                        </div>
                        <div
                            onClick={() => {
                                if (isGroup && groupData?.eventId) {
                                    navigate(`/event/${groupData.eventId}`);
                                }
                            }}
                            style={{ cursor: (isGroup && groupData?.eventId) ? 'pointer' : 'default' }}
                        >
                            <h3 style={{ fontWeight: '700', fontSize: '16px', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {isGroup ? groupData?.name : `${otherUser?.name}, ${otherUser?.age}`}
                                {isGroup && groupData?.eventId && (
                                    <span style={{ color: '#3b82f6', fontSize: '14px' }}>↗</span>
                                )}
                            </h3>
                            <span style={{ fontSize: '12px', color: isGroup ? 'var(--color-text-muted)' : '#22c55e' }}>
                                {isGroup ? `${groupData?.members.length} membres` : t('social.online')}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '8px' }}
                    >
                        <Settings size={22} style={{ transform: showSettings ? 'rotate(45deg)' : 'none', transition: 'transform 0.3s ease' }} />
                    </button>
                </div>

                {/* Settings Menu */}
                <AnimatePresence>
                    {showSettings && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            style={{
                                position: 'absolute',
                                top: '80px',
                                right: '16px',
                                width: '240px',
                                background: 'var(--color-surface)',
                                borderRadius: '16px',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                border: '1px solid var(--color-border)',
                                zIndex: 100,
                                padding: '8px'
                            }}
                        >
                            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border)', marginBottom: '4px' }}>
                                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                                    {t('chat.settings')}
                                </span>
                            </div>

                            {/* Mute toggle */}
                            <div
                                onClick={() => updateChatSettings({ muteSounds: !chatSettings.muteSounds })}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '12px',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    background: chatSettings.muteSounds ? 'rgba(0,0,0,0.03)' : 'transparent'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {chatSettings.muteSounds ? <VolumeX size={18} color="#ef4444" /> : <Volume2 size={18} color="var(--color-text-muted)" />}
                                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text)' }}>{t('chat.muteSounds')}</span>
                                </div>
                                <div style={{
                                    width: '40px',
                                    height: '22px',
                                    borderRadius: '11px',
                                    background: chatSettings.muteSounds ? 'var(--color-primary)' : '#d1d5db',
                                    position: 'relative',
                                    transition: 'background 0.3s ease'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        left: chatSettings.muteSounds ? '20px' : '2px',
                                        top: '2px',
                                        width: '18px',
                                        height: '18px',
                                        borderRadius: '50%',
                                        background: 'white',
                                        transition: 'left 0.3s ease'
                                    }} />
                                </div>
                            </div>

                            {/* Notifications toggle */}
                            <div
                                onClick={() => updateChatSettings({ blockNotifications: !chatSettings.blockNotifications })}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '12px',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    background: chatSettings.blockNotifications ? 'rgba(0,0,0,0.03)' : 'transparent',
                                    marginBottom: isGroup ? '8px' : '0'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {chatSettings.blockNotifications ? <BellOff size={18} color="#ef4444" /> : <Bell size={18} color="var(--color-text-muted)" />}
                                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text)' }}>{t('chat.blockNotifications')}</span>
                                </div>
                                <div style={{
                                    width: '40px',
                                    height: '22px',
                                    borderRadius: '11px',
                                    background: chatSettings.blockNotifications ? 'var(--color-primary)' : '#d1d5db',
                                    position: 'relative',
                                    transition: 'background 0.3s ease'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        left: chatSettings.blockNotifications ? '20px' : '2px',
                                        top: '2px',
                                        width: '18px',
                                        height: '18px',
                                        borderRadius: '50%',
                                        background: 'white',
                                        transition: 'left 0.3s ease'
                                    }} />
                                </div>
                            </div>

                            {/* Group Management Section */}
                            {isGroup && groupData && (
                                <>
                                    <div style={{ padding: '8px 12px', borderTop: '1px solid var(--color-border)', marginTop: '8px', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                                            Membres ({groupData.members.length})
                                        </span>
                                        {!groupData.eventId && (
                                            <button
                                                onClick={() => setShowAddMember(!showAddMember)}
                                                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700' }}
                                            >
                                                <UserPlus size={14} />
                                                {t('chat.addMember')}
                                            </button>
                                        )}
                                    </div>

                                    {showAddMember && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            style={{ overflow: 'hidden', padding: '0 8px', marginBottom: '8px', borderBottom: '1px solid var(--color-border)' }}
                                        >
                                            <div style={{ padding: '8px', background: 'rgba(0,0,0,0.03)', borderRadius: '12px' }}>
                                                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '8px', fontWeight: '600' }}>
                                                    {t('chat.selectFriend')}
                                                </p>
                                                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
                                                    {SUGGESTIONS.slice(0, 15)
                                                        .filter(f => !groupData.members.includes(f.name))
                                                        .map(friend => (
                                                            <div
                                                                key={friend.id}
                                                                onClick={() => {
                                                                    addMember(groupData.id, friend.name);
                                                                    setShowAddMember(false);
                                                                }}
                                                                style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', width: '60px' }}
                                                            >
                                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden' }}>
                                                                    <BlurImage src={friend.image} alt={friend.name} />
                                                                </div>
                                                                <span style={{ fontSize: '10px', fontWeight: '600', color: 'var(--color-text)', textAlign: 'center', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                    {friend.name}
                                                                </span>
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                    <div style={{
                                        maxHeight: '170px',
                                        overflowY: 'auto',
                                        paddingRight: '4px',
                                        scrollbarWidth: 'thin'
                                    }}>
                                        {groupData.members.map((member: string, idx: number) => (
                                            <div key={idx} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '8px 12px',
                                                borderRadius: '10px',
                                                gap: '8px',
                                                background: member === 'Moi' ? 'rgba(0,0,0,0.02)' : 'transparent',
                                                marginBottom: '2px'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                                                    <div style={{
                                                        width: '28px',
                                                        height: '28px',
                                                        borderRadius: '50%',
                                                        overflow: 'hidden',
                                                        background: 'rgba(0,0,0,0.05)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0
                                                    }}>
                                                        <BlurImage
                                                            src={member === 'Moi' ? CURRENT_USER.image : (groupData.images[idx] || `https://i.pravatar.cc/100?u=${member}`)}
                                                            alt={member}
                                                        />
                                                    </div>
                                                    <span style={{
                                                        fontSize: '14px',
                                                        color: 'var(--color-text)',
                                                        fontWeight: member === 'Moi' ? '700' : '500',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}>
                                                        {member}
                                                    </span>
                                                </div>
                                                {member !== 'Moi' && (
                                                    <button
                                                        onClick={() => removeMember(groupData.id, member)}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', opacity: 0.7, padding: '4px' }}
                                                    >
                                                        <UserMinus size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '8px', paddingTop: '8px' }}>
                                        {isConfirmingLeave ? (
                                            <div style={{ padding: '8px' }}>
                                                <p style={{ fontSize: '12px', color: 'var(--color-text)', marginBottom: '8px', textAlign: 'center' }}>
                                                    {t('chat.confirmLeave')}
                                                </p>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => setIsConfirmingLeave(false)}
                                                        style={{
                                                            flex: 1, padding: '6px', borderRadius: '8px', border: '1px solid var(--color-border)',
                                                            background: 'transparent', fontSize: '12px', fontWeight: '600'
                                                        }}
                                                    >
                                                        {t('common.cancel')}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            leaveGroup(groupData.id);
                                                            navigate(-1);
                                                        }}
                                                        style={{
                                                            flex: 1, padding: '6px', borderRadius: '8px', border: 'none',
                                                            background: '#ef4444', color: 'white', fontSize: '12px', fontWeight: '600'
                                                        }}
                                                    >
                                                        {t('common.confirm')}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setIsConfirmingLeave(true)}
                                                style={{
                                                    width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px',
                                                    borderRadius: '12px', border: 'none', background: 'transparent', color: '#ef4444',
                                                    cursor: 'pointer', fontSize: '14px', fontWeight: '600'
                                                }}
                                            >
                                                <LogOut size={18} />
                                                {t('chat.leaveGroup')}
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

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
                                overflow: 'hidden',
                                background: '#f3f4f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {isGroup ? (
                                    <GroupAvatar images={groupData?.images || []} size={80} />
                                ) : (
                                    <BlurImage src={otherUser?.image || ''} alt={otherUser?.name || ''} />
                                )}
                            </div>
                            <p style={{ fontSize: '14px' }}>
                                {isGroup
                                    ? `Bienvenue dans le groupe ${groupData?.name}`
                                    : t('chat.startChat', { name: otherUser?.name })}
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
