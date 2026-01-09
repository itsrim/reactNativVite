import React, { useState } from 'react';
import { Search, Bell, MapPin, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../context/EventContext';
import PageTransition from './PageTransition';
import BlurImage from './BlurImage';
import './SearchInput.css';

const CATEGORIES = ["Tout", "Sorties", "Musée", "Sport", "Rando", "Danse", "Verre"];

const EventSearch = () => {
    const navigate = useNavigate();
    const { events } = useEvents();
    const [selectedCategory, setSelectedCategory] = useState("Tout");

    // Mocking more events for masonry effect
    const allEvents = [...events, ...events, ...events].slice(0, 10);

    return (
        <PageTransition>
            <div style={{ minHeight: '100vh', background: '#f9f9f9', paddingBottom: '100px' }}>

                {/* NEW HEADER */}
                <div style={{
                    flexShrink: 0,
                    background: 'linear-gradient(135deg, #73f755ff 0%, #4649efff 50%, #ec4899 100%)', // Purple to Pink gradient
                    padding: '12px 24px 24px',
                    borderBottomLeftRadius: '30px',
                    borderBottomRightRadius: '30px',
                    color: 'white',
                    boxShadow: '0 10px 30px rgba(217, 70, 239, 0.2)',
                    zIndex: 10,
                    marginBottom: '12px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.9, marginBottom: '4px' }}>
                                <MapPin size={14} color="white" />
                                <span style={{ fontSize: '12px', fontWeight: '500' }}>Événements autour de moi</span>
                            </div>
                            <h1 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>Paris, France</h1>
                        </div>
                        <button style={{
                            background: 'rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '50%',
                            width: '44px',
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}>
                            <div style={{ position: 'relative' }}>
                                <Bell size={20} color="white" />
                                <div style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', background: '#facc15', borderRadius: '50%', border: '2px solid #d946ef' }}></div>
                            </div>
                        </button>
                    </div>

                    <div style={{
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '20px',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                    }}>
                        <Search size={20} color="rgba(255,255,255,0.8)" />
                        <input
                            type="text"
                            placeholder="Rechercher un événement..."
                            style={{
                                border: 'none',
                                outline: 'none',
                                flex: 1,
                                fontSize: '15px',
                                background: 'transparent',
                                color: 'white',
                                '::placeholder': { color: 'rgba(255,255,255,0.6)' }
                            }}
                            className="search-input-placeholder-white"
                        />
                        <button style={{
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none',
                            cursor: 'pointer'
                        }}>
                            <SlidersHorizontal size={16} color="white" />
                        </button>
                    </div>
                </div>

                {/* 2. Trending Carousel */}
                <div style={{ padding: '0 0 24px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: '24px', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#18181b' }}>Tendance cette semaine 🔥</h2>
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
                        {events.slice(0, 5).map((event, i) => (
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
                                    scrollSnapAlign: 'start'
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
                                        <span style={{ color: '#d1d5db', fontSize: '12px' }}>{event.location.split(',')[0]}</span>
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
                        const isSelected = selectedCategory === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                style={{
                                    padding: '10px 24px',
                                    borderRadius: '30px',
                                    background: isSelected ? '#f97316' : 'white', // Orange selected, white unselected
                                    color: isSelected ? 'white' : '#71717a',
                                    border: isSelected ? 'none' : '1px solid #e4e4e7',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    whiteSpace: 'nowrap',
                                    boxShadow: isSelected ? '0 4px 12px rgba(249, 115, 22, 0.3)' : 'none',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {cat}
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
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
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
                                        background: 'rgba(255,255,255,0.9)',
                                        backdropFilter: 'blur(4px)',
                                        borderRadius: '16px',
                                        padding: '10px 12px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div style={{ overflow: 'hidden' }}>
                                            <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#18181b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {event.title}
                                            </h4>
                                            <span style={{ fontSize: '10px', color: '#71717a' }}>{event.location.split(',')[0]}</span>
                                        </div>
                                        <div style={{ fontSize: '12px', fontWeight: '800', color: '#f97316' }}>
                                            {event.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
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
