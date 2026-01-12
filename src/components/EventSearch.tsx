import React, { useState } from 'react';
import { Search, Bell, SlidersHorizontal, MapPin, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEvents } from '../context/EventContext';
import { useFeatureFlags } from '../context/FeatureFlagContext';
import PageTransition from './PageTransition';
import BlurImage from './BlurImage';
import './SearchInput.css';

const EventSearch: React.FC = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { events } = useEvents();
    const { isRestricted } = useFeatureFlags();
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    
    const CATEGORIES = [
        { key: "all", label: t('search.allCategories') },
        { key: "outings", label: i18n.language === 'fr' ? "Sorties" : "Outings" },
        { key: "museum", label: i18n.language === 'fr' ? "Musée" : "Museum" },
        { key: "sport", label: "Sport" },
        { key: "hiking", label: i18n.language === 'fr' ? "Rando" : "Hiking" },
        { key: "dance", label: i18n.language === 'fr' ? "Danse" : "Dance" },
        { key: "drinks", label: i18n.language === 'fr' ? "Verre" : "Drinks" }
    ];
    
    const searchDisabled = isRestricted('disableSearch');

    // Trier les événements par date et horaire
    const sortedEvents = [...events].sort((a, b) => {
        // D'abord par date
        const dateCompare = a.date.getTime() - b.date.getTime();
        if (dateCompare !== 0) return dateCompare;
        // Ensuite par horaire
        const timeA = a.time.split(':').map(Number);
        const timeB = b.time.split(':').map(Number);
        return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
    });

    // Events pour le masonry
    const allEvents = sortedEvents.slice(0, 10);

    return (
        <PageTransition>
            <div style={{ minHeight: '100vh', background: 'var(--color-background)', paddingBottom: '100px' }}>

                {/* NEW HEADER - Compact */}
                <div style={{
                    flexShrink: 0,
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f472b6 100%)',
                    padding: '16px 20px 20px',
                    borderBottomLeftRadius: '30px',
                    borderBottomRightRadius: '30px',
                    color: '#111827',
                    boxShadow: '0 10px 30px rgba(244, 114, 182, 0.3)',
                    zIndex: 10,
                    marginBottom: '12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Search Input */}
                        <div style={{
                            flex: 1,
                            background: searchDisabled ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.3)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: '20px',
                            padding: '10px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            opacity: searchDisabled ? 0.7 : 1
                        }}>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <Search size={20} color="rgba(0,0,0,0.6)" />
                                {searchDisabled && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '-8px',
                                        right: '-10px',
                                        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                        borderRadius: '50%',
                                        width: '16px',
                                        height: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 2px 4px rgba(251, 191, 36, 0.4)'
                                    }}>
                                        <Crown size={9} color="#111827" />
                                    </div>
                                )}
                            </div>
                            <input
                                type="text"
                                placeholder={searchDisabled ? t('social.premium') : t('search.placeholder')}
                                disabled={searchDisabled}
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    flex: 1,
                                    fontSize: '15px',
                                    background: 'transparent',
                                    color: '#111827',
                                    cursor: searchDisabled ? 'not-allowed' : 'text'
                                }}
                                className="search-input-placeholder-dark"
                            />
                            {!searchDisabled && (
                                <button style={{
                                    background: 'rgba(0,0,0,0.1)',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}>
                                    <SlidersHorizontal size={16} color="#111827" />
                                </button>
                            )}
                        </div>
                        {/* Bell Button - Outside input */}
                        <button style={{
                            background: 'rgba(255,255,255,0.4)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: '50%',
                            width: '48px',
                            height: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            position: 'relative',
                            flexShrink: 0
                        }}>
                            <Bell size={20} color="#111827" />
                            <div style={{ position: 'absolute', top: '10px', right: '10px', width: '10px', height: '10px', background: '#facc15', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.5)' }}></div>
                        </button>
                    </div>
                </div>

                {/* 2. Trending Carousel */}
                <div style={{ padding: '0 0 24px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: '24px', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text)' }}>{t('search.trending')} 🔥</h2>
                    </div>

                    <div style={{
                        display: 'flex',
                        gap: '16px',
                        overflowX: 'auto',
                        paddingRight: '24px',
                        paddingBottom: '1px',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                    }}>
                        {sortedEvents.slice(0, 5).map((event, i) => (
                            <div
                                key={i}
                                onClick={() => navigate(`/event/${event.id}`)}
                                style={{
                                    flexShrink: 0,
                                    width: '280px',
                                    height: '180px',
                                    borderRadius: '24px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                                    scrollSnapAlign: 'start',
                                    cursor: 'pointer'
                                }}
                            >
                                <BlurImage
                                    src={event.image}
                                    alt={event.title}
                                />
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    padding: '16px',
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)'
                                }}>
                                    <h3 style={{ color: 'white', fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>{event.title}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <MapPin size={12} color="#d1d5db" />
                                        {(() => {
                                            const shouldHide = event.hideAddressUntilRegistered && !event.registered && !event.isOrganizer;
                                            return (
                                                <span style={{ 
                                                    color: '#d1d5db', 
                                                    fontSize: '12px',
                                                    filter: shouldHide ? 'blur(4px)' : 'none'
                                                }}>
                                                    {shouldHide ? t('events.locationHidden') : event.location.split(',')[0]}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* 3. Categories List */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    overflowX: 'auto',
                    padding: '0 24px 16px',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}>
                    {CATEGORIES.map(cat => {
                        const isSelected = selectedCategory === cat.key;
                        return (
                            <button
                                key={cat.key}
                                onClick={() => setSelectedCategory(cat.key)}
                                style={{
                                    padding: '10px 24px',
                                    borderRadius: '30px',
                                    background: isSelected ? '#f97316' : 'var(--color-surface)',
                                    color: isSelected ? 'white' : 'var(--color-text-muted)',
                                    border: isSelected ? 'none' : '1px solid var(--color-border)',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    whiteSpace: 'nowrap',
                                    boxShadow: isSelected ? '0 4px 12px rgba(249, 115, 22, 0.3)' : 'none',
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer'
                                }}
                            >
                                {cat.label}
                            </button>
                        );
                    })}
                </div>

                {/* 4. Masonry Grid */}
                <div style={{ padding: '0 24px', columns: '2', columnGap: '16px' }}>
                    {allEvents.map((event, index) => {
                        // Random height aspect for masonry feel
                        const heights = [180, 240, 200, 260];
                        const height = heights[index % heights.length];

                        return (
                            <div
                                key={`${event.id}-${index}`}
                                onClick={() => navigate(`/event/${event.id}`)}
                                style={{
                                    breakInside: 'avoid',
                                    marginBottom: '12px',
                                    position: 'relative',
                                    borderRadius: '20px',
                                    overflow: 'hidden',
                                    height: `${height}px`,
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                    cursor: 'pointer'
                                }}
                            >
                                <BlurImage
                                    src={event.image}
                                    alt={event.title}
                                />

                                {/* Overlay Card at Bottom */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '0',
                                    left: '0',
                                    right: '0',
                                    padding: '12px',
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)'
                                }}>
                                    <div style={{
                                        background: 'var(--color-surface)',
                                        backdropFilter: 'blur(4px)',
                                        borderRadius: '16px',
                                        padding: '10px 12px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div style={{ overflow: 'hidden' }}>
                                            <h4 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {event.title}
                                            </h4>
                                            {(() => {
                                                const shouldHide = event.hideAddressUntilRegistered && !event.registered && !event.isOrganizer;
                                                return (
                                                    <span style={{ 
                                                        fontSize: '10px', 
                                                        color: 'var(--color-text-muted)',
                                                        filter: shouldHide ? 'blur(4px)' : 'none'
                                                    }}>
                                                        {shouldHide ? t('events.locationHidden') : event.location.split(',')[0]}
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                        <div style={{ fontSize: '12px', fontWeight: '800', color: '#f97316' }}>
                                            {event.date.toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </PageTransition>
    );
};

export default EventSearch;

