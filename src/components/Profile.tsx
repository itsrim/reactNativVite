import React, { useState } from 'react';
import { Award, ShieldCheck, Heart, CalendarDays, History, Users, Settings, RotateCcw, Crown, Lock, Globe, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageTransition from './PageTransition';
import BlurImage from './BlurImage';
import { useEvents } from '../context/EventContext';
import { useFeatureFlags } from '../context/FeatureFlagContext';
import { ConfigKey, ConfigItemWithKey } from '../types';

interface Friend {
    id: number;
    name: string;
    image: string;
    events: number;
}

// Fake friends data
const FRIENDS: Friend[] = [
    { id: 1, name: 'Marie L.', image: 'https://i.pravatar.cc/150?img=1', events: 12 },
    { id: 2, name: 'Lucas M.', image: 'https://i.pravatar.cc/150?img=8', events: 8 },
    { id: 3, name: 'Emma R.', image: 'https://i.pravatar.cc/150?img=5', events: 15 },
    { id: 4, name: 'Hugo D.', image: 'https://i.pravatar.cc/150?img=11', events: 6 },
    { id: 5, name: 'Léa P.', image: 'https://i.pravatar.cc/150?img=9', events: 22 },
    { id: 6, name: 'Nathan B.', image: 'https://i.pravatar.cc/150?img=12', events: 4 },
];

type TabType = 'upcoming' | 'favorites' | 'friends' | 'past' | 'settings';

const Profile: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { events, getFavoriteEvents } = useEvents();
    const { getConfigByCategory, toggleConfig, resetConfig, isPremium, getLimits, isAdmin } = useFeatureFlags();
    const [activeTab, setActiveTab] = useState<TabType>('upcoming');

    const currentLanguage = i18n.language;
    const toggleLanguage = () => {
        i18n.changeLanguage(currentLanguage === 'fr' ? 'en' : 'fr');
    };

    const today = new Date();
    const limits = getLimits();
    // Filter events where user is registered or is organizer
    const myEvents = events.filter(e => (e.registered || e.isOrganizer) && e.date >= today).sort((a, b) => a.date.getTime() - b.date.getTime());
    const pastEvents = events.filter(e => (e.registered || e.isOrganizer) && e.date < today).sort((a, b) => b.date.getTime() - a.date.getTime());
    const favoriteEvents = getFavoriteEvents();
    const configByCategory = getConfigByCategory();

    return (
        <PageTransition>
            <div className="p-4" style={{ paddingBottom: '90px' }}>

                {/* Header Profile */}
                <div className="flex flex-col items-center mb-4 pt-4">
                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: '4px solid var(--color-surface)',
                            boxShadow: 'var(--shadow-md)'
                        }}>
                            <BlurImage
                                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                                alt="Profile"
                            />
                        </div>
                        <div style={{
                            position: 'absolute',
                            bottom: '0',
                            right: '0',
                            background: 'var(--color-success)',
                            color: 'white',
                            padding: '4px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid white'
                        }}>
                            <ShieldCheck size={16} />
                        </div>
                    </div>
                    <h2 className="font-bold text-lg">Thomas R.</h2>
                    <span className="text-muted text-sm">{t('profile.memberSince', { year: '2024' })}</span>
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    <div className="card p-3" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <span className="text-primary font-bold" style={{ fontSize: '24px' }}>4.9</span>
                        <span className="text-muted text-xs">{t('profile.reliability')}</span>
                    </div>
                    <div className="card p-3" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <span className="text-primary font-bold" style={{ fontSize: '24px' }}>{myEvents.length}</span>
                        <span className="text-muted text-xs">{t('profile.events')}</span>
                    </div>
                    <div className="card p-3" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <span style={{ fontSize: '24px', color: '#10b981', fontWeight: 'bold' }}>0</span>
                        <span className="text-muted text-xs">No-shows</span>
                    </div>
                </div>

                {/* Badges */}
                <h3 className="font-bold mb-2">{t('profile.badges')}</h3>
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
                    {[t('badges.punctual'), t('badges.organizer'), t('badges.friendly'), t('badges.explorer')].map((badge, i) => (
                        <div key={i} className="card" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', minWidth: 'max-content' }}>
                            <Award size={16} style={{ color: '#eab308' }} />
                            <span className="text-sm font-bold">{badge}</span>
                        </div>
                    ))}
                </div>

                {/* Reliability Section */}
                {/* <div className="card p-4" style={{ marginBottom: '24px' }}>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold">{t('settings.reliabilityIndicator')}</h3>
                        <span style={{
                            fontSize: '12px',
                            fontWeight: 'bold',
                            padding: '4px 8px',
                            background: '#dcfce7',
                            color: '#15803d',
                            borderRadius: '999px'
                        }}>{t('settings.exemplary')}</span>
                    </div>

                    <div style={{ width: '100%', background: '#e4e4e7', borderRadius: '10px', height: '10px', marginBottom: '8px' }}>
                        <div style={{ width: '95%', background: 'var(--color-primary)', height: '100%', borderRadius: '10px' }}></div>
                    </div>
                    <p className="text-sm text-muted">
                        {t('settings.reliabilityDesc')}
                    </p>
                </div> */}

                {/* Tabs - Underline style */}
                <div style={{
                    display: 'flex',
                    gap: '16px',
                    marginBottom: '16px',
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}>
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            padding: '8px 0',
                            fontSize: '13px',
                            fontWeight: activeTab === 'upcoming' ? '700' : '500',
                            color: activeTab === 'upcoming' ? 'var(--color-text)' : 'var(--color-text-muted)',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                            borderBottom: activeTab === 'upcoming' ? '2px solid var(--color-primary)' : '2px solid transparent'
                        }}
                    >
                        <CalendarDays size={14} />
                        {t('settings.upcoming')}
                        <span style={{
                            background: 'var(--color-primary)',
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            padding: '1px 5px',
                            borderRadius: '8px',
                        }}>{myEvents.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('favorites')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            padding: '8px 0',
                            fontSize: '13px',
                            fontWeight: activeTab === 'favorites' ? '700' : '500',
                            color: activeTab === 'favorites' ? 'var(--color-text)' : 'var(--color-text-muted)',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                            borderBottom: activeTab === 'favorites' ? '2px solid #ec4899' : '2px solid transparent'
                        }}
                    >
                        <Heart size={14} />
                        {t('settings.favorites')}
                        <span style={{
                            background: '#ec4899',
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            padding: '1px 5px',
                            borderRadius: '8px',
                        }}>{favoriteEvents.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('friends')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            padding: '8px 0',
                            fontSize: '13px',
                            fontWeight: activeTab === 'friends' ? '700' : '500',
                            color: activeTab === 'friends' ? 'var(--color-text)' : 'var(--color-text-muted)',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                            borderBottom: activeTab === 'friends' ? '2px solid #8b5cf6' : '2px solid transparent'
                        }}
                    >
                        <Users size={14} />
                        {t('profile.friends')}
                        <span style={{
                            background: '#8b5cf6',
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            padding: '1px 5px',
                            borderRadius: '8px',
                        }}>{FRIENDS.length}</span>
                    </button>
                    <button
                        onClick={() => isPremium && setActiveTab('past')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            padding: '8px 0',
                            fontSize: '13px',
                            fontWeight: activeTab === 'past' ? '700' : '500',
                            color: !isPremium ? '#d1d5db' : (activeTab === 'past' ? 'var(--color-text)' : 'var(--color-text-muted)'),
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            whiteSpace: 'nowrap',
                            cursor: !isPremium ? 'not-allowed' : 'pointer',
                            borderBottom: activeTab === 'past' ? '2px solid #6b7280' : '2px solid transparent',
                            opacity: !isPremium ? 0.5 : 1
                        }}
                    >
                        {!isPremium && <Lock size={12} color="#fbbf24" />}
                        <History size={14} />
                        {t('settings.past')}
                        {isPremium ? (
                            <span style={{
                                background: '#6b7280',
                                color: 'white',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                padding: '1px 5px',
                                borderRadius: '8px',
                            }}>{pastEvents.length}</span>
                        ) : (
                            <span style={{
                                background: '#fbbf24',
                                color: 'white',
                                fontSize: '9px',
                                fontWeight: 'bold',
                                padding: '2px 5px',
                                borderRadius: '8px',
                            }}>PRO</span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            padding: '8px 0',
                            fontSize: '13px',
                            fontWeight: activeTab === 'settings' ? '700' : '500',
                            color: activeTab === 'settings' ? 'var(--color-text)' : 'var(--color-text-muted)',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                            borderBottom: activeTab === 'settings' ? '2px solid #6b7280' : '2px solid transparent'
                        }}
                    >
                        <Settings size={14} />
                        {t('profile.settings')}
                    </button>
                </div>

                {/* Content based on active tab */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Upcoming Events */}
                    {activeTab === 'upcoming' && (
                        myEvents.length > 0 ? myEvents.slice(0, 10).map((event) => (
                            <div key={event.id} className="card p-3" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                    <BlurImage src={event.image} alt={event.title} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div className="font-bold text-sm" style={{ marginBottom: '2px' }}>{event.title}</div>
                                    <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                                        <span>{event.date.toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' })}</span>
                                        <span>•</span>
                                        <span>{event.time}</span>
                                        <span>•</span>
                                        <span style={{ color: event.isOrganizer ? 'var(--color-primary)' : 'var(--color-success)' }}>
                                            {event.isOrganizer ? t('events.organizer') : t('settings.registered')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="card p-4 text-center text-muted text-sm">
                                <CalendarDays size={24} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                                {t('settings.noUpcomingEvents')}
                            </div>
                        )
                    )}

                    {/* Past Events */}
                    {activeTab === 'past' && (
                        pastEvents.length > 0 ? pastEvents.slice(0, 10).map((event) => (
                            <div key={event.id} className="card p-3" style={{ display: 'flex', gap: '12px', alignItems: 'center', opacity: 0.7 }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                    <BlurImage src={event.image} alt={event.title} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div className="font-bold text-sm" style={{ marginBottom: '2px' }}>{event.title}</div>
                                    <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                                        <span>{event.date.toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' })}</span>
                                        <span>•</span>
                                        <span>{event.time}</span>
                                        <span>•</span>
                                        <span style={{ color: '#10b981' }}>✓ {t('settings.participated')}</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="card p-4 text-center text-muted text-sm">
                                <History size={24} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                                {t('settings.noPastEvents')}
                            </div>
                        )
                    )}

                    {/* Favorites */}
                    {activeTab === 'favorites' && (
                        favoriteEvents.length > 0 ? favoriteEvents.slice(0, 10).map((event) => (
                            <div key={event.id} className="card p-3" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                                    <BlurImage src={event.image} alt={event.title} />
                                    <div style={{
                                        position: 'absolute', top: '4px', right: '4px',
                                        background: '#ec4899', borderRadius: '50%',
                                        width: '16px', height: '16px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Heart size={10} color="white" fill="white" />
                                    </div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div className="font-bold text-sm" style={{ marginBottom: '2px' }}>{event.title}</div>
                                    <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                                        <span>{event.date.toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' })}</span>
                                        <span>•</span>
                                        <span>{event.time}</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="card p-4 text-center text-muted text-sm">
                                <Heart size={24} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                                {t('settings.noFavorites')}
                            </div>
                        )
                    )}

                    {/* Friends */}
                    {activeTab === 'friends' && (
                        FRIENDS.map((friend) => (
                            <div key={friend.id} className="card p-3" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                                    <BlurImage src={friend.image} alt={friend.name} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div className="font-bold text-sm" style={{ marginBottom: '2px' }}>{friend.name}</div>
                                    <div className="text-xs text-muted">
                                        {friend.events} {t('settings.commonEvents')}
                                    </div>
                                </div>
                                <button style={{
                                    background: '#8b5cf6',
                                    color: 'white',
                                    border: 'none',
                                    padding: '6px 12px',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}                                >
                                    {t('settings.view')}
                                </button>
                            </div>
                        ))
                    )}

                    {/* Settings - Premium & Restrictions */}
                    {activeTab === 'settings' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Statut Premium */}
                            <div
                                className="card"
                                onClick={() => toggleConfig('isPremium')}
                                style={{
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    background: isPremium ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' : 'var(--color-surface)'
                                }}
                            >
                                <div style={{
                                    padding: '16px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '44px',
                                            height: '44px',
                                            borderRadius: '12px',
                                            background: isPremium ? 'rgba(255,255,255,0.3)' : '#fef3c7',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Crown size={24} color={isPremium ? 'white' : '#f59e0b'} />
                                        </div>
                                        <div>
                                            <div style={{
                                                fontSize: '15px',
                                                fontWeight: '700',
                                                color: isPremium ? 'white' : 'var(--color-text)',
                                                marginBottom: '2px'
                                            }}>
                                                {isPremium ? t('settings.premiumActive') : t('settings.premiumInactive')}
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                color: isPremium ? 'rgba(255,255,255,0.8)' : 'var(--color-text-muted)'
                                            }}>
                                                {isPremium ? t('settings.allFeaturesUnlocked') : t('settings.limitedFeatures')}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{
                                        width: '44px',
                                        height: '26px',
                                        borderRadius: '13px',
                                        background: isPremium ? 'rgba(255,255,255,0.4)' : '#d1d5db',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '2px',
                                        transition: 'background 0.2s'
                                    }}>
                                        <div style={{
                                            width: '22px',
                                            height: '22px',
                                            borderRadius: '50%',
                                            background: 'white',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                            transform: isPremium ? 'translateX(18px)' : 'translateX(0)',
                                            transition: 'transform 0.2s'
                                        }} />
                                    </div>
                                </div>
                            </div>

                            {/* Admin Mode - NEW */}
                            <div
                                className="card"
                                onClick={() => toggleConfig('isAdmin')}
                                style={{
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    background: isAdmin ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' : 'var(--color-surface)'
                                }}
                            >
                                <div style={{
                                    padding: '16px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '44px',
                                            height: '44px',
                                            borderRadius: '12px',
                                            background: isAdmin ? 'rgba(255,255,255,0.3)' : '#e0e7ff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Shield size={24} color={isAdmin ? 'white' : '#4f46e5'} />
                                        </div>
                                        <div>
                                            <div style={{
                                                fontSize: '15px',
                                                fontWeight: '700',
                                                color: isAdmin ? 'white' : 'var(--color-text)',
                                                marginBottom: '2px'
                                            }}>
                                                Admin Mode
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                color: isAdmin ? 'rgba(255,255,255,0.8)' : 'var(--color-text-muted)'
                                            }}>
                                                {isAdmin ? "Accès illimité aux dates passées" : "Mode utilisateur standard"}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{
                                        width: '44px',
                                        height: '26px',
                                        borderRadius: '13px',
                                        background: isAdmin ? 'rgba(255,255,255,0.4)' : '#d1d5db',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '2px',
                                        transition: 'background 0.2s'
                                    }}>
                                        <div style={{
                                            width: '22px',
                                            height: '22px',
                                            borderRadius: '50%',
                                            background: 'white',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                            transform: isAdmin ? 'translateX(18px)' : 'translateX(0)',
                                            transition: 'transform 0.2s'
                                        }} />
                                    </div>
                                </div>
                            </div>

                            {/* Sélecteur de langue */}
                            <div
                                className="card"
                                onClick={toggleLanguage}
                                style={{
                                    overflow: 'hidden',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{
                                    padding: '16px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '44px',
                                            height: '44px',
                                            borderRadius: '12px',
                                            background: '#e0f2fe',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Globe size={24} color="#0284c7" />
                                        </div>
                                        <div>
                                            <div style={{
                                                fontSize: '15px',
                                                fontWeight: '700',
                                                color: 'var(--color-text)',
                                                marginBottom: '2px'
                                            }}>
                                                {t('settings.language')}
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                color: 'var(--color-text-muted)'
                                            }}>
                                                {currentLanguage === 'fr' ? t('settings.french') : t('settings.english')}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        gap: '8px'
                                    }}>
                                        <span style={{
                                            padding: '6px 12px',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            background: currentLanguage === 'fr' ? '#0284c7' : 'var(--color-border)',
                                            color: currentLanguage === 'fr' ? 'white' : 'var(--color-text-muted)'
                                        }}>FR</span>
                                        <span style={{
                                            padding: '6px 12px',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            background: currentLanguage === 'en' ? '#0284c7' : 'var(--color-border)',
                                            color: currentLanguage === 'en' ? 'white' : 'var(--color-text-muted)'
                                        }}>EN</span>
                                    </div>
                                </div>
                            </div>

                            {/* Limites actuelles */}
                            <div className="card" style={{ overflow: 'hidden' }}>
                                <div style={{
                                    padding: '10px 12px',
                                    background: 'var(--color-surface)',
                                    borderBottom: '1px solid var(--color-border)',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    color: 'var(--color-text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    {t('profile.settings')}
                                </div>
                                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                        <span style={{ color: 'var(--color-text-muted)' }}>{t('settings.maxParticipants')}</span>
                                        <span style={{ fontWeight: '600', color: 'var(--color-text)' }}>{limits.maxParticipants}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                        <span style={{ color: 'var(--color-text-muted)' }}>{t('settings.maxRegistrations')}</span>
                                        <span style={{ fontWeight: '600', color: 'var(--color-text)' }}>{limits.maxRegistrations}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                        <span style={{ color: 'var(--color-text-muted)' }}>{t('settings.maxFavorites')}</span>
                                        <span style={{ fontWeight: '600', color: 'var(--color-text)' }}>{limits.maxFavorites}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                        <span style={{ color: 'var(--color-text-muted)' }}>{t('settings.maxActiveEvents')}</span>
                                        <span style={{ fontWeight: '600', color: 'var(--color-text)' }}>{limits.maxActiveEvents === 999 ? '∞' : limits.maxActiveEvents}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Restrictions - visible pour tous, éditable seulement si premium */}
                            <div className="card" style={{ overflow: 'hidden' }}>
                                <div style={{
                                    padding: '10px 12px',
                                    background: isPremium ? 'var(--color-surface)' : '#fef2f2',
                                    borderBottom: '1px solid var(--color-border)',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    color: isPremium ? 'var(--color-text-muted)' : '#dc2626',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    {!isPremium && <Lock size={12} />}
                                    {isPremium ? t('settings.restrictionsControl') : t('settings.restrictionsFree')}
                                </div>
                                {(configByCategory['Restrictions Free'] || []).map((item: ConfigItemWithKey, index: number, arr: ConfigItemWithKey[]) => (
                                    <div
                                        key={item.key}
                                        onClick={() => isPremium && toggleConfig(item.key as ConfigKey)}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '12px',
                                            borderBottom: index < arr.length - 1 ? '1px solid var(--color-border)' : 'none',
                                            cursor: isPremium ? 'pointer' : 'not-allowed',
                                            transition: 'background 0.2s',
                                            opacity: isPremium ? 1 : 0.6
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '13px', fontWeight: '600', color: isPremium ? 'var(--color-text)' : 'var(--color-text-muted)', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                {!isPremium && <Lock size={12} color="#9ca3af" />}
                                                {t(item.label)}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                                {t(item.description)}
                                            </div>
                                        </div>
                                        <div style={{
                                            width: '44px',
                                            height: '26px',
                                            borderRadius: '13px',
                                            background: isPremium ? (item.value ? '#ef4444' : '#d1d5db') : '#ef4444',
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '2px',
                                            flexShrink: 0,
                                            marginLeft: '12px',
                                            opacity: isPremium ? 1 : 0.7,
                                            transition: 'background 0.2s'
                                        }}>
                                            <div style={{
                                                width: '22px',
                                                height: '22px',
                                                borderRadius: '50%',
                                                background: 'white',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                                transform: isPremium ? (item.value ? 'translateX(18px)' : 'translateX(0)') : 'translateX(18px)',
                                                transition: 'transform 0.2s'
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Bouton Reset */}
                            <button
                                onClick={resetConfig}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    fontSize: '13px',
                                    color: '#ef4444',
                                    background: '#fef2f2',
                                    border: '1px solid #fecaca',
                                    cursor: 'pointer',
                                    padding: '12px',
                                    borderRadius: '12px',
                                    fontWeight: '600'
                                }}
                            >
                                <RotateCcw size={14} />
                                {t('settings.resetSettings')}
                            </button>

                            {/* Info */}
                            <div style={{
                                fontSize: '11px',
                                color: 'var(--color-text-muted)',
                                textAlign: 'center',
                                padding: '8px'
                            }}>
                                {t('settings.autoSaved')}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
};

export default Profile;

