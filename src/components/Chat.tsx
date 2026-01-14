import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Volume2, VolumeX, Bell, BellOff, UserMinus, LogOut, UserPlus, Crown, UserX, User, Lock, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import BlurImage from './BlurImage';
import PageTransition from './PageTransition';
import { ChatHeader, ChatMessageBubble, ChatInput } from './Chat/index';
import { useMessages, SocialGroup } from '../context/MessageContext';
import { getUserData, CURRENT_USER_ID, CURRENT_USER } from '../context/VisitContext';
import { useFeatureFlags } from '../context/FeatureFlagContext';
import { useFriends } from '../context/FriendContext';
import { GroupAvatar } from './Social/GroupAvatar';
import { SUGGESTIONS } from '../data/mockSuggestions';
import { toast } from 'sonner';

const Chat: React.FC = () => {
    const { id = '' } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { getConversationMessages, sendMessage, markAsRead, chatSettings, updateChatSettings, toggleMuteUser, isUserMuted, leaveGroup, removeMember, groups, addMember } = useMessages();
    const { isPremium } = useFeatureFlags();
    const { isFriend, sendFriendRequest, canSendRequest } = useFriends();
    const [newMessage, setNewMessage] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [isConfirmingLeave, setIsConfirmingLeave] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);
    const [mutedMembers, setMutedMembers] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isGroup = id.startsWith('group-');
    const numericId = parseInt(isGroup ? id.replace('group-', '') : id);
    
    // Vérifier si c'est un ami (pour les conversations privées)
    // Il faut être amis mutuellement pour discuter (même Premium)
    const isUserFriend = isGroup ? true : isFriend(numericId);

    const toggleMuteMember = (memberName: string) => {
        if (!isPremium) {
            toast.error(
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Crown size={18} color="#fbbf24" />
                    <span>{t('premium.muteRequired', 'Passez Premium pour muter les membres')}</span>
                </div>
            );
            return;
        }
        setMutedMembers(prev => 
            prev.includes(memberName) 
                ? prev.filter(m => m !== memberName)
                : [...prev, memberName]
        );
        toast.success(
            mutedMembers.includes(memberName) 
                ? t('chat.memberUnmuted', { name: memberName })
                : t('chat.memberMuted', { name: memberName })
        );
    };

    const isMemberMuted = (memberName: string) => mutedMembers.includes(memberName);

    const navigateToProfile = (userId: number) => {
        if (!isPremium) {
            toast.error(
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Crown size={18} color="#fbbf24" />
                    <span>{t('premium.profileRequired', 'Passez Premium pour voir les profils')}</span>
                </div>
            );
            return;
        }
        navigate(`/user/${userId}`);
    };

    const otherUser = isGroup ? null : getUserData(numericId);
    const groupData = isGroup ? groups.find((g: SocialGroup) => g.id === numericId) : null;
    const messages = getConversationMessages(numericId);

    useEffect(() => { markAsRead(numericId); }, [numericId, markAsRead]);
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleSend = () => {
        if (newMessage.trim()) {
            sendMessage(numericId, newMessage.trim());
            setNewMessage('');
        }
    };

    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const handleSendFriendRequest = () => {
        if (!isPremium && !canSendRequest(false)) {
            toast.error(
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Crown size={18} color="#fbbf24" />
                    <span>{t('friends.dailyLimitReached', 'Limite atteinte !')}</span>
                </div>
            );
            return;
        }
        sendFriendRequest(numericId);
        toast.success(t('friends.requestSent', 'Demande d\'ami envoyée !'));
    };

    // Si conversation privée et pas ami, afficher un écran de blocage
    if (!isGroup && !isUserFriend) {
    return (
        <PageTransition>
                <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-background)' }}>
                    {/* Header simplifié */}
                <div style={{
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                        gap: '12px',
                    borderBottom: '1px solid var(--color-border)'
                }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)' }}
                    >
                            <Lock size={24} />
                    </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden' }}>
                                <BlurImage src={otherUser?.image || ''} alt={otherUser?.name || ''} />
                            </div>
                            <div>
                                <h2 style={{ fontWeight: '700', fontSize: '16px', color: 'var(--color-text)' }}>
                                    {otherUser?.name}, {otherUser?.age}
                                </h2>
                            </div>
                        </div>
                    </div>

                    {/* Contenu bloqué */}
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '32px',
                        gap: '24px',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            background: 'rgba(239, 68, 68, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Lock size={40} color="#ef4444" />
                        </div>
                        
                        <div>
                            <h2 style={{ 
                                fontSize: '20px', 
                                fontWeight: '700', 
                                color: 'var(--color-text)',
                                marginBottom: '8px'
                            }}>
                                {t('friends.notFriendsYet', 'Vous n\'êtes pas encore amis')}
                            </h2>
                            <p style={{ 
                                fontSize: '14px', 
                                color: 'var(--color-text-muted)',
                                lineHeight: '1.5'
                            }}>
                                {t('friends.mustBeFriendsToChat', 'Vous devez être amis pour pouvoir discuter avec cette personne.')}
                            </p>
                        </div>

                        <button
                            onClick={handleSendFriendRequest}
                            style={{
                                padding: '14px 32px',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
                                color: 'white',
                                border: 'none',
                                fontSize: '15px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <Heart size={18} />
                            {t('friends.sendRequest', 'Envoyer une demande d\'ami')}
                        </button>

                        <button
                            onClick={() => navigate(-1)}
                            style={{
                                padding: '12px 24px',
                                borderRadius: '12px',
                                background: 'transparent',
                                color: 'var(--color-text-muted)',
                                border: '1px solid var(--color-border)',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            {t('common.back', 'Retour')}
                        </button>
                    </div>
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-background)' }}>
                {/* Header */}
                <ChatHeader
                    isGroup={isGroup}
                    name={isGroup ? (groupData?.name || '') : `${otherUser?.name}, ${otherUser?.age}`}
                    subtitle={isGroup ? `${groupData?.members.length} membres` : t('social.online')}
                    images={isGroup ? (groupData?.images || []) : [otherUser?.image || '']}
                    eventId={groupData?.eventId}
                    showSettings={showSettings}
                    onBack={() => navigate(-1)}
                    onToggleSettings={() => setShowSettings(!showSettings)}
                    onNavigateToProfile={() => navigateToProfile(numericId)}
                    onNavigateToEvent={() => groupData?.eventId && navigate(`/event/${groupData.eventId}`)}
                />

                {/* Settings Menu */}
                <AnimatePresence>
                    {showSettings && (
                        <SettingsMenu
                            isGroup={isGroup}
                            userId={numericId}
                            userName={otherUser?.name || ''}
                            groupData={groupData}
                            chatSettings={chatSettings}
                            updateChatSettings={updateChatSettings}
                            isUserMuted={isUserMuted(numericId)}
                            onToggleMuteUser={() => toggleMuteUser(numericId)}
                            isPremium={isPremium}
                            isMemberMuted={isMemberMuted}
                            toggleMuteMember={toggleMuteMember}
                            showAddMember={showAddMember}
                            setShowAddMember={setShowAddMember}
                            isConfirmingLeave={isConfirmingLeave}
                            setIsConfirmingLeave={setIsConfirmingLeave}
                            addMember={addMember}
                            removeMember={removeMember}
                            leaveGroup={leaveGroup}
                            navigate={navigate}
                            t={t}
                        />
                    )}
                </AnimatePresence>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {messages.length === 0 ? (
                        <EmptyState isGroup={isGroup} groupData={groupData} otherUser={otherUser} t={t} />
                    ) : (
                        messages.map((msg) => (
                            <ChatMessageBubble
                                key={msg.id}
                                message={msg}
                                isMe={msg.senderId === CURRENT_USER_ID}
                                formatTime={formatTime}
                            />
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <ChatInput
                    value={newMessage}
                    placeholder={t('chat.placeholder')}
                    onChange={setNewMessage}
                    onSend={handleSend}
                />
            </div>
        </PageTransition>
    );
};

// Settings Menu Component
interface SettingsMenuProps {
    isGroup: boolean;
    userId: number;
    userName: string;
    groupData: SocialGroup | null | undefined;
    chatSettings: { muteSounds: boolean; blockNotifications: boolean };
    updateChatSettings: (settings: Partial<{ muteSounds: boolean; blockNotifications: boolean }>) => void;
    isUserMuted: boolean;
    onToggleMuteUser: () => void;
    isPremium: boolean;
    isMemberMuted: (memberName: string) => boolean;
    toggleMuteMember: (memberName: string) => void;
    showAddMember: boolean;
    setShowAddMember: (show: boolean) => void;
    isConfirmingLeave: boolean;
    setIsConfirmingLeave: (show: boolean) => void;
    addMember: (groupId: number, name: string) => void;
    removeMember: (groupId: number, name: string) => void;
    leaveGroup: (groupId: number) => void;
    navigate: (path: number) => void;
    t: (key: string, options?: Record<string, string>) => string;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({
    isGroup, userId, userName, groupData, chatSettings, updateChatSettings,
    isUserMuted, onToggleMuteUser, isPremium, isMemberMuted, toggleMuteMember,
    showAddMember, setShowAddMember, isConfirmingLeave, setIsConfirmingLeave,
    addMember, removeMember, leaveGroup, navigate, t
}) => (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            style={{
            position: 'absolute', top: '80px', right: '16px', width: '240px',
            background: 'var(--color-surface)', borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid var(--color-border)',
            zIndex: 100, padding: '8px'
                            }}
                        >
                            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border)', marginBottom: '4px' }}>
                                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                                    {t('chat.settings')}
                                </span>
                            </div>

        <ToggleRow
            icon={chatSettings.muteSounds ? <VolumeX size={18} color="#ef4444" /> : <Volume2 size={18} color="var(--color-text-muted)" />}
            label={t('chat.muteSounds')}
            isActive={chatSettings.muteSounds}
                                onClick={() => updateChatSettings({ muteSounds: !chatSettings.muteSounds })}
        />

        <ToggleRow
            icon={chatSettings.blockNotifications ? <BellOff size={18} color="#ef4444" /> : <Bell size={18} color="var(--color-text-muted)" />}
            label={t('chat.blockNotifications')}
            isActive={chatSettings.blockNotifications}
            onClick={() => updateChatSettings({ blockNotifications: !chatSettings.blockNotifications })}
        />

        {/* Mute utilisateur - uniquement pour les conversations privées */}
        {!isGroup && (
            <ToggleRow
                icon={isUserMuted ? <UserX size={18} color="#ef4444" /> : <User size={18} color="var(--color-text-muted)" />}
                label={t('chat.muteUser', { name: userName.split(',')[0] || 'cet utilisateur' })}
                isActive={isUserMuted}
                onClick={onToggleMuteUser}
                style={{ marginBottom: '0' }}
            />
        )}

        {isGroup && groupData && (
            <GroupManagement
                groupData={groupData}
                isPremium={isPremium}
                isMemberMuted={isMemberMuted}
                toggleMuteMember={toggleMuteMember}
                showAddMember={showAddMember}
                setShowAddMember={setShowAddMember}
                isConfirmingLeave={isConfirmingLeave}
                setIsConfirmingLeave={setIsConfirmingLeave}
                addMember={addMember}
                removeMember={removeMember}
                leaveGroup={leaveGroup}
                navigate={navigate}
                t={t}
            />
        )}
    </motion.div>
);

// Toggle Row Component
const ToggleRow: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
    style?: React.CSSProperties;
}> = ({ icon, label, isActive, onClick, style }) => (
    <div
        onClick={onClick}
                                style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px', borderRadius: '12px', cursor: 'pointer',
            background: isActive ? 'rgba(0,0,0,0.03)' : 'transparent', ...style
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {icon}
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text)' }}>{label}</span>
                                </div>
                                <div style={{
            width: '40px', height: '22px', borderRadius: '11px',
            background: isActive ? 'var(--color-primary)' : '#d1d5db',
            position: 'relative', transition: 'background 0.3s ease'
                                }}>
                                    <div style={{
                position: 'absolute', left: isActive ? '20px' : '2px', top: '2px',
                width: '18px', height: '18px', borderRadius: '50%',
                background: 'white', transition: 'left 0.3s ease'
                                    }} />
                                </div>
                            </div>
);

// Group Management Component
const GroupManagement: React.FC<{
    groupData: SocialGroup;
    isPremium: boolean;
    isMemberMuted: (memberName: string) => boolean;
    toggleMuteMember: (memberName: string) => void;
    showAddMember: boolean;
    setShowAddMember: (show: boolean) => void;
    isConfirmingLeave: boolean;
    setIsConfirmingLeave: (show: boolean) => void;
    addMember: (groupId: number, name: string) => void;
    removeMember: (groupId: number, name: string) => void;
    leaveGroup: (groupId: number) => void;
    navigate: (path: number) => void;
    t: (key: string, options?: Record<string, string>) => string;
}> = ({ groupData, isPremium, isMemberMuted, toggleMuteMember, showAddMember, setShowAddMember, isConfirmingLeave, setIsConfirmingLeave, addMember, removeMember, leaveGroup, navigate, t }) => (
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
                    <UserPlus size={14} />{t('chat.addMember')}
                                            </button>
                                        )}
                                    </div>

                                    {showAddMember && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={{ overflow: 'hidden', padding: '0 8px', marginBottom: '8px', borderBottom: '1px solid var(--color-border)' }}>
                                            <div style={{ padding: '8px', background: 'rgba(0,0,0,0.03)', borderRadius: '12px' }}>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '8px', fontWeight: '600' }}>{t('chat.selectFriend')}</p>
                                                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
                        {SUGGESTIONS.slice(0, 15).filter(f => !groupData.members.includes(f.name)).map(friend => (
                                                            <div
                                                                key={friend.id}
                                onClick={() => { addMember(groupData.id, friend.name); setShowAddMember(false); }}
                                                                style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', width: '60px' }}
                                                            >
                                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden' }}>
                                                                    <BlurImage src={friend.image} alt={friend.name} />
                                                                </div>
                                <span style={{ fontSize: '10px', fontWeight: '600', color: 'var(--color-text)', textAlign: 'center', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{friend.name}</span>
                                                            </div>
                        ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

        <div style={{ maxHeight: '170px', overflowY: 'auto', paddingRight: '4px', scrollbarWidth: 'thin' }}>
                                        {groupData.members.map((member: string, idx: number) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '10px', gap: '8px', background: member === 'Moi' ? 'rgba(0,0,0,0.02)' : 'transparent', marginBottom: '2px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden', background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <BlurImage src={member === 'Moi' ? CURRENT_USER.image : (groupData.images[idx] || `https://i.pravatar.cc/100?u=${member}`)} alt={member} />
                                                    </div>
                        <span style={{ fontSize: '14px', color: 'var(--color-text)', fontWeight: member === 'Moi' ? '700' : '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member}</span>
                                                </div>
                                                {member !== 'Moi' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {/* Bouton Mute - Premium */}
                                                    <button
                                onClick={() => toggleMuteMember(member)} 
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    cursor: 'pointer', 
                                    padding: '4px',
                                    position: 'relative',
                                    opacity: isPremium ? 1 : 0.5
                                }}
                                title={isPremium ? (isMemberMuted(member) ? t('chat.unmuteMember') : t('chat.muteMember')) : t('premium.required')}
                            >
                                {isMemberMuted(member) ? (
                                    <BellOff size={16} color="#ef4444" />
                                ) : (
                                    <Bell size={16} color="var(--color-text-muted)" />
                                )}
                                {!isPremium && (
                                    <Crown size={8} color="#fbbf24" style={{ position: 'absolute', top: 0, right: 0 }} />
                                )}
                            </button>
                            {/* Bouton Remove */}
                            <button onClick={() => removeMember(groupData.id, member)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', opacity: 0.7, padding: '4px' }}>
                                                        <UserMinus size={16} />
                                                    </button>
                        </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '8px', paddingTop: '8px' }}>
                                        {isConfirmingLeave ? (
                                            <div style={{ padding: '8px' }}>
                    <p style={{ fontSize: '12px', color: 'var(--color-text)', marginBottom: '8px', textAlign: 'center' }}>{t('chat.confirmLeave')}</p>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => setIsConfirmingLeave(false)} style={{ flex: 1, padding: '6px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'transparent', fontSize: '12px', fontWeight: '600' }}>{t('common.cancel')}</button>
                        <button onClick={() => { leaveGroup(groupData.id); navigate(-1); }} style={{ flex: 1, padding: '6px', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', fontSize: '12px', fontWeight: '600' }}>{t('common.confirm')}</button>
                                                </div>
                                            </div>
                                        ) : (
                <button onClick={() => setIsConfirmingLeave(true)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', borderRadius: '12px', border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                    <LogOut size={18} />{t('chat.leaveGroup')}
                                            </button>
                                        )}
                                    </div>
                                </>
);

// Empty State Component
const EmptyState: React.FC<{ isGroup: boolean; groupData: SocialGroup | null | undefined; otherUser: ReturnType<typeof getUserData> | null; t: ReturnType<typeof useTranslation>['t'] }> = ({ isGroup, groupData, otherUser, t }) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'var(--color-text-muted)' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isGroup ? <GroupAvatar images={groupData?.images || []} size={80} /> : <BlurImage src={otherUser?.image || ''} alt={otherUser?.name || ''} />}
                            </div>
                            <p style={{ fontSize: '14px' }}>
            {isGroup ? `Bienvenue dans le groupe ${groupData?.name}` : t('chat.startChat', { name: otherUser?.name })}
                            </p>
                        </div>
);

export default Chat;
