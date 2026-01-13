import React, { useState, CSSProperties } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { Heart, Search, X, Lock, Crown, Eye } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from './PageTransition';
import BlurImage from './BlurImage';
import { useFeatureFlags } from '../context/FeatureFlagContext';
import { useVisits } from '../context/VisitContext';
import { useMessages } from '../context/MessageContext';

// GROUPS and SocialGroup are now in MessageContext

interface Suggestion {
    id: number;
    name: string;
    age: number;
    image: string;
    height: number;
    rotation: number;
    offset: number;
}

// Interface Message est maintenant dans MessageContext

// Interface Visitor est maintenant dans VisitContext (VisitorInfo)

export const GroupAvatar: React.FC<{ images: string[], size: number }> = ({ images, size }) => {
    const displayImages = images.slice(0, 4);

    if (displayImages.length === 1) {
        return <BlurImage src={displayImages[0]} alt="Group" />;
    }

    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gridTemplateRows: 'repeat(2, 1fr)',
            gap: '1px',
            background: 'white',
            borderRadius: '50%',
            overflow: 'hidden'
        }}>
            {displayImages.map((img, i) => (
                <div key={i} style={{
                    position: 'relative',
                    overflow: 'hidden',
                    gridColumn: displayImages.length === 3 && i === 2 ? 'span 2' : 'auto'
                }}>
                    <BlurImage src={img} alt={`Member ${i}`} />
                </div>
            ))}
        </div>
    );
};

// 1000 profils pour tester la virtualisation et la scalabilité
const FIRST_NAMES = [
    'Maya', 'Nancy', 'Kat', 'Stacey', 'Zoe', 'Lily', 'Rose', 'Emma', 'Sophie', 'Clara',
    'Léa', 'Manon', 'Chloé', 'Camille', 'Sarah', 'Laura', 'Julie', 'Marie', 'Anna', 'Eva',
    'Jade', 'Louise', 'Alice', 'Lola', 'Inès', 'Léna', 'Lucie', 'Nina', 'Mia', 'Zoé',
    'Lucas', 'Hugo', 'Louis', 'Nathan', 'Gabriel', 'Jules', 'Adam', 'Raphaël', 'Arthur', 'Léo',
    'Noah', 'Ethan', 'Paul', 'Tom', 'Mathis', 'Théo', 'Maxime', 'Alexandre', 'Antoine', 'Victor'
];

const SUGGESTIONS: Suggestion[] = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    name: FIRST_NAMES[i % FIRST_NAMES.length],
    age: 18 + (i % 20),
    image: `https://i.pravatar.cc/600?img=${(i % 70) + 1}`,
    height: 200 + (i % 5) * 30,
    rotation: ((i * 7) % 13) - 6,
    offset: (i * 11) % 45
}));

// Les messages sont maintenant gérés par MessageContext

// Les visites sont maintenant gérées par VisitContext

type TabType = 'suggestions' | 'messages' | 'visitors';

const SocialPage: React.FC = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = (searchParams.get('tab') as TabType) || 'suggestions';

    const setActiveTab = (tab: TabType) => {
        setSearchParams({ tab }, { replace: true });
    };

    const [isTabSearchExpanded, setIsTabSearchExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { isRestricted, isPremium } = useFeatureFlags();
    const { getMyVisitors } = useVisits();
    const { getConversations, getTotalUnread, groups } = useMessages();

    // Récupérer les vrais visiteurs depuis le contexte
    const visitors = getMyVisitors();

    // Récupérer les vraies conversations
    const rawConversations = getConversations();
    const totalUnread = getTotalUnread();

    // Trier les groupes par date de dernier message (Plus récent en premier)
    const sortedGroups = [...groups].sort((a, b) => b.lastMessageDate.getTime() - a.lastMessageDate.getTime());

    // Fusionner groupes et conversations pour l'onglet Messages
    const mergedMessages = [
        ...sortedGroups.map(g => ({
            id: `group-${g.id}`,
            isGroup: true,
            name: g.name,
            image: g.images, // On passe le tableau d'images
            lastMessage: g.lastMessage,
            lastMessageTime: g.lastMessageDate,
            unreadCount: g.msg,
            originalId: g.id
        })),
        ...rawConversations.map(c => ({
            id: `conv-${c.otherId}`,
            isGroup: false,
            name: c.name,
            image: [c.image], // On passe un tableau à un élément pour l'unifier
            lastMessage: c.lastMessage,
            lastMessageTime: c.lastMessageTime,
            unreadCount: c.unreadCount,
            originalId: c.otherId
        }))
    ].sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());

    // Filtrer les suggestions en fonction de la recherche des onglets
    const filteredSuggestions = SUGGESTIONS.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filtrer les messages fusionnés (onglet Messages)
    const filteredMergedMessages = mergedMessages.filter(msg =>
        msg.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filtrer les visiteurs en fonction de la recherche des onglets
    const filteredVisitors = visitors.filter(visitor =>
        visitor.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Formater le temps relatif
    const formatRelativeTime = (date: Date): string => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return t('time.now');
        if (diffMins < 60) return t('time.minutesAgo', { count: diffMins });
        if (diffHours < 24) return t('time.hoursAgo', { count: diffHours });
        if (diffDays === 1) return t('time.yesterday');
        if (diffDays < 7) return t('time.daysAgo', { count: diffDays });
        return date.toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' });
    };

    const blurProfiles = isRestricted('blurProfiles');
    const disableMessages = isRestricted('disableMessages');
    const searchDisabled = isRestricted('disableSearch');

    // Render 2 items per row to simulate grid in Virtuoso
    const rows: Suggestion[][] = [];
    for (let i = 0; i < filteredSuggestions.length; i += 2) {
        rows.push([filteredSuggestions[i], filteredSuggestions[i + 1]]);
    }

    interface RowProps {
        index: number;
        style: CSSProperties;
    }

    const Row: React.FC<RowProps> = ({ index, style }) => {
        const items = rows[index];
        return (
            <div style={{ ...style, display: 'flex', gap: '16px', padding: '0 16px 16px' }}>
                {items.map((item, i) => item && (
                    <div
                        key={item.id}
                        onClick={() => !blurProfiles && navigate(`/user/${item.id}`)}
                        style={{
                            flex: 1,
                            height: `${item.height}px`,
                            position: 'relative',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                            transform: `rotate(${item.rotation}deg)`,
                            marginTop: `${item.offset}px`,
                            cursor: blurProfiles ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {/* Image avec blur conditionnel */}
                        <div style={{
                            width: '100%',
                            height: '100%',
                            filter: blurProfiles ? 'blur(15px)' : 'none',
                            transform: blurProfiles ? 'scale(1.1)' : 'none',
                            pointerEvents: 'none'
                        }}>
                            <BlurImage
                                src={item.image}
                                alt={item.name}
                            />
                        </div>

                        {/* Overlay Premium si profils floutés */}
                        {blurProfiles && (
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                background: 'rgba(0,0,0,0.6)',
                                backdropFilter: 'blur(5px)',
                                borderRadius: '16px',
                                padding: '16px 20px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '8px',
                                pointerEvents: 'none'
                            }}>
                                <Lock size={24} color="#fbbf24" />
                                <span style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>Premium</span>
                            </div>
                        )}

                        <div style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: 'rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(5px)',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid rgba(255,255,255,0.3)',
                            pointerEvents: 'none'
                        }}>
                            <Heart size={16} color="white" />
                        </div>
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: '12px',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                            pointerEvents: 'none'
                        }}>
                            <h3 style={{
                                color: 'white',
                                fontWeight: '700',
                                fontSize: '16px',
                                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                filter: blurProfiles ? 'blur(8px)' : 'none'
                            }}>
                                {item.name}, {item.age}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <PageTransition>
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-background)' }}>

                {/* Header with Gradient - Compact */}
                <div style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f472b6 100%)',
                    padding: '12px 16px 12px',
                    borderBottomLeftRadius: '24px',
                    borderBottomRightRadius: '24px',
                    boxShadow: '0 10px 30px rgba(244, 114, 182, 0.3)',
                    marginBottom: '0',
                    minHeight: '80px',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', position: 'relative', height: '72px' }}>
                        {/* Friends Horizontal Scroll */}
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            gap: '14px',
                            overflowX: 'auto',
                            paddingRight: '20px',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            WebkitMaskImage: 'linear-gradient(to right, black 80%, transparent 100%)',
                            maskImage: 'linear-gradient(to right, black 80%, transparent 100%)',
                            alignItems: 'center',
                            height: '100%'
                        }}>
                            {sortedGroups.map(group => (
                                <div
                                    key={group.id}
                                    onClick={() => {
                                        if (disableMessages) return;
                                        // Ouvrir directement le chat du groupe
                                        navigate(`/chat/group-${group.id}`);
                                    }}
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}
                                >
                                    <div style={{ position: 'relative' }}>
                                        <div style={{
                                            width: '56px',
                                            height: '56px',
                                            borderRadius: '50%',
                                            border: '2px solid rgba(255,255,255,0.4)',
                                            padding: '2px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'rgba(255,255,255,0.2)',
                                            backdropFilter: 'blur(10px)',
                                            overflow: 'hidden',
                                            cursor: 'pointer'
                                        }}>
                                            <GroupAvatar images={group.images} size={48} />
                                        </div>
                                        {group.msg > 0 && (
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '0',
                                                right: '0',
                                                backgroundColor: '#ef4444',
                                                borderRadius: '50%',
                                                width: '18px',
                                                height: '18px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '10px',
                                                fontWeight: 'bold',
                                                border: '1px solid white',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                            }}>
                                                {group.msg}
                                            </div>
                                        )}
                                    </div>
                                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.2)', maxWidth: '64px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {group.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div style={{ flex: 1, background: 'var(--color-surface)', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                    {/* Data Tabs */}
                    <div style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 90,
                        background: 'var(--color-surface)',
                        padding: '14px 16px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid rgba(0,0,0,0.05)'
                    }}>
                        <AnimatePresence mode="wait">
                            {!isTabSearchExpanded ? (
                                <motion.div
                                    key="tabs-list"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    style={{ display: 'flex', gap: '20px', alignItems: 'center' }}
                                >
                                    <button
                                        onClick={() => setActiveTab('suggestions')}
                                        style={{
                                            background: 'transparent', border: 'none', padding: 0,
                                            fontSize: '15px', fontWeight: activeTab === 'suggestions' ? '800' : '600',
                                            color: activeTab === 'suggestions' ? 'var(--color-text)' : 'var(--color-text-muted)',
                                            transition: 'color 0.2s',
                                            paddingBottom: '6px',
                                            borderBottom: activeTab === 'suggestions' ? '2px solid var(--color-text)' : '2px solid transparent',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {t('social.suggestions')}
                                    </button>
                                    <button
                                        onClick={() => !disableMessages && setActiveTab('messages')}
                                        style={{
                                            background: 'transparent', border: 'none', padding: 0,
                                            fontSize: '15px', fontWeight: activeTab === 'messages' ? '800' : '600',
                                            color: disableMessages ? 'var(--color-text-muted)' : (activeTab === 'messages' ? 'var(--color-text)' : 'var(--color-text-muted)'),
                                            transition: 'color 0.2s',
                                            display: 'flex', alignItems: 'center', gap: '5px',
                                            paddingBottom: '6px',
                                            borderBottom: activeTab === 'messages' ? '2px solid var(--color-text)' : '2px solid transparent',
                                            cursor: disableMessages ? 'not-allowed' : 'pointer',
                                            opacity: disableMessages ? 0.5 : 1
                                        }}
                                    >
                                        {t('social.messages')}
                                        {!disableMessages && totalUnread > 0 && (
                                            <span style={{
                                                background: '#ef4444', color: 'white',
                                                fontSize: '10px', fontWeight: 'bold',
                                                padding: '2px 6px', borderRadius: '10px',
                                            }}>{totalUnread}</span>
                                        )}
                                        {disableMessages && (
                                            <div style={{
                                                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                                borderRadius: '50%',
                                                width: '18px',
                                                height: '18px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 2px 4px rgba(251, 191, 36, 0.4)'
                                            }}>
                                                <Crown size={10} color="#111827" />
                                            </div>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => isPremium && setActiveTab('visitors')}
                                        style={{
                                            background: 'transparent', border: 'none', padding: 0,
                                            fontSize: '15px', fontWeight: activeTab === 'visitors' ? '800' : '600',
                                            color: !isPremium ? 'var(--color-text-muted)' : (activeTab === 'visitors' ? 'var(--color-text)' : 'var(--color-text-muted)'),
                                            transition: 'color 0.2s',
                                            display: 'flex', alignItems: 'center', gap: '5px',
                                            paddingBottom: '6px',
                                            borderBottom: activeTab === 'visitors' ? '2px solid #fbbf24' : '2px solid transparent',
                                            cursor: !isPremium ? 'not-allowed' : 'pointer',
                                            opacity: !isPremium ? 0.5 : 1
                                        }}
                                    >
                                        <Eye size={14} />
                                        {t('social.visitors')}
                                        {isPremium && (
                                            <span style={{
                                                background: '#fbbf24', color: 'white',
                                                fontSize: '10px', fontWeight: 'bold',
                                                padding: '2px 6px', borderRadius: '10px',
                                            }}>{visitors.length}</span>
                                        )}
                                        {!isPremium && (
                                            <div style={{
                                                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                                borderRadius: '50%',
                                                width: '18px',
                                                height: '18px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 2px 4px rgba(251, 191, 36, 0.4)'
                                            }}>
                                                <Crown size={10} color="#111827" />
                                            </div>
                                        )}
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="tab-search-input"
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: '100%' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    style={{ flex: 1, display: 'flex', alignItems: 'center' }}
                                >
                                    <div style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        background: 'rgba(0,0,0,0.05)',
                                        borderRadius: '24px',
                                        padding: '4px 16px',
                                        marginRight: '12px',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        height: '44px'
                                    }}>
                                        <Search size={16} color="var(--color-text-muted)" />
                                        <input
                                            autoFocus
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder={
                                                activeTab === 'suggestions' ? (t('social.searchSuggestions') || "Rechercher un membre...") :
                                                    activeTab === 'messages' ? (t('social.searchMessages') || "Rechercher un auteur...") :
                                                        (t('social.searchVisitors') || "Rechercher un visiteur...")
                                            }
                                            style={{
                                                width: '100%',
                                                background: 'transparent',
                                                border: 'none',
                                                padding: '6px 8px',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                color: 'var(--color-text)',
                                                outline: 'none'
                                            }}
                                        />
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', padding: '4px' }}
                                            >
                                                <span style={{ fontSize: '16px' }}>×</span>
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            onClick={() => {
                                if (searchDisabled) return;
                                if (isTabSearchExpanded) {
                                    setSearchQuery('');
                                }
                                setIsTabSearchExpanded(!isTabSearchExpanded);
                            }}
                            style={{
                                width: '44px', height: '44px',
                                borderRadius: '50%',
                                background: 'transparent',
                                border: 'none',
                                cursor: searchDisabled ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                opacity: searchDisabled ? 0.6 : 1,
                                transition: 'all 0.2s',
                                flexShrink: 0,
                                transform: 'translateY(-4px)'
                            }}
                        >
                            {isTabSearchExpanded ? (
                                <X size={24} color="var(--color-text)" />
                            ) : (
                                <Search size={22} color="var(--color-text-muted)" />
                            )}
                            {searchDisabled && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    right: '-4px',
                                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                    borderRadius: '50%',
                                    width: '18px',
                                    height: '18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 4px rgba(251, 191, 36, 0.4)',
                                    zIndex: 2
                                }}>
                                    <Crown size={10} color="#111827" />
                                </div>
                            )}
                        </button>
                    </div>

                    {/* Content Switcher */}
                    <div style={{ flex: 1, position: 'relative' }}>
                        {activeTab === 'suggestions' && (
                            <Virtuoso
                                style={{ height: '100%', paddingBottom: '100px' }}
                                data={rows}
                                itemContent={(index) => <Row index={index} style={{}} />}
                            />
                        )}

                        {activeTab === 'messages' && (
                            <div style={{ padding: '0 24px 100px', overflowY: 'auto', height: '100%' }}>
                                {filteredMergedMessages.length === 0 ? (
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '40px 20px',
                                        color: 'var(--color-text-muted)',
                                        textAlign: 'center'
                                    }}>
                                        <p style={{ fontSize: '14px' }}>
                                            {searchQuery ? t('social.noSearchResults') || "Aucun résultat trouvé" : t('social.noMessages')}
                                        </p>
                                        {!searchQuery && <p style={{ fontSize: '12px', marginTop: '8px' }}>{t('social.startConversation')}</p>}
                                    </div>
                                ) : (
                                    filteredMergedMessages.map(item => (
                                        <div
                                            key={item.id}
                                            onClick={() => {
                                                if (item.isGroup) {
                                                    // On utilise un préfixe pour distinguer les chats de groupe
                                                    navigate(`/chat/group-${item.originalId}`);
                                                } else {
                                                    navigate(`/chat/${item.originalId}`);
                                                }
                                            }}
                                            style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', cursor: 'pointer' }}
                                        >
                                            <div style={{ position: 'relative' }}>
                                                <div style={{
                                                    width: '56px',
                                                    height: '56px',
                                                    borderRadius: '50%',
                                                    overflow: 'hidden',
                                                    background: '#f3f4f6',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    {item.isGroup ? (
                                                        <GroupAvatar images={item.image} size={56} />
                                                    ) : (
                                                        <BlurImage
                                                            src={item.image[0]}
                                                            alt={item.name}
                                                        />
                                                    )}
                                                </div>
                                                {item.unreadCount > 0 && (
                                                    <div style={{
                                                        position: 'absolute', bottom: '-2px', right: '-2px',
                                                        minWidth: '20px', height: '20px',
                                                        background: '#ef4444',
                                                        borderRadius: '10px',
                                                        border: '2px solid var(--color-surface)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        padding: '0 4px',
                                                        zIndex: 5
                                                    }}>
                                                        <span style={{ color: 'white', fontSize: '10px', fontWeight: 'bold' }}>
                                                            {item.unreadCount}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                    <h3 style={{
                                                        fontSize: '15px',
                                                        fontWeight: '700',
                                                        color: 'var(--color-text)',
                                                        margin: 0,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}>
                                                        {item.name}
                                                        {item.isGroup && <span style={{ fontSize: '10px', background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '4px', fontWeight: '500' }}>Groupe</span>}
                                                    </h3>
                                                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                                        {formatRelativeTime(item.lastMessageTime)}
                                                    </span>
                                                </div>
                                                <p style={{
                                                    fontSize: '13px',
                                                    color: item.unreadCount > 0 ? 'var(--color-text)' : 'var(--color-text-muted)',
                                                    fontWeight: item.unreadCount > 0 ? '600' : '400',
                                                    margin: 0,
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}>
                                                    {item.lastMessage}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {
                            activeTab === 'visitors' && (
                                <div style={{ padding: '0 24px 100px', overflowY: 'auto', height: '100%' }}>
                                    {/* Premium Badge */}
                                    <div style={{
                                        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                        borderRadius: '16px',
                                        padding: '16px',
                                        marginBottom: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}>
                                        <Crown size={24} color="#111827" />
                                        <div>
                                            <div style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>
                                                {t('social.premiumFeature')}
                                            </div>
                                            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                                                {t('social.visitedProfile', { count: visitors.length })}
                                            </div>
                                        </div>
                                    </div>

                                    {filteredVisitors.length === 0 ? (
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '40px 20px',
                                            color: 'var(--color-text-muted)',
                                            textAlign: 'center'
                                        }}>
                                            <p style={{ fontSize: '14px' }}>
                                                {searchQuery ? t('social.noSearchResults') || "Aucun résultat trouvé" : t('social.noVisitors') || "Aucune visite pour le moment"}
                                            </p>
                                        </div>
                                    ) : (
                                        filteredVisitors.map((visitor: any) => (
                                            <div key={visitor.id} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '16px',
                                                marginBottom: '16px',
                                                cursor: 'pointer',
                                                padding: '12px',
                                                background: 'var(--color-background)',
                                                borderRadius: '16px',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                            }}>
                                                <div style={{ position: 'relative' }}>
                                                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', overflow: 'hidden' }}>
                                                        <BlurImage
                                                            src={visitor.image}
                                                            alt={visitor.name}
                                                        />
                                                    </div>
                                                    {visitor.visits > 1 && (
                                                        <div style={{
                                                            position: 'absolute', bottom: '-4px', right: '-4px',
                                                            background: '#fbbf24',
                                                            color: 'white',
                                                            fontSize: '10px',
                                                            fontWeight: 'bold',
                                                            padding: '2px 6px',
                                                            borderRadius: '10px',
                                                            border: '2px solid var(--color-surface)'
                                                        }}>
                                                            x{visitor.visits}
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text)', marginBottom: '2px' }}>
                                                        {visitor.name}, {visitor.age}
                                                    </h3>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <Eye size={12} color="var(--color-text-muted)" />
                                                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{visitor.time}</span>
                                                    </div>
                                                </div>
                                                <button style={{
                                                    background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '8px 16px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer'
                                                }}>
                                                    <Heart size={12} style={{ marginRight: '4px', display: 'inline' }} />
                                                    {t('social.like')}
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default SocialPage;
