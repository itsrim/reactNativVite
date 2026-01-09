import React, { useState } from 'react';
import { Award, ShieldCheck, MapPin, Clock, Calendar, Heart, CalendarDays } from 'lucide-react';
import PageTransition from './PageTransition';
import BlurImage from './BlurImage';
import { useEvents } from '../context/EventContext';

const Profile = () => {
    const { events, getFavoriteEvents } = useEvents();
    const [activeTab, setActiveTab] = useState('upcoming');
    
    // Filter events where user is registered or is organizer
    const myEvents = events.filter(e => e.registered || e.isOrganizer).sort((a, b) => a.date - b.date);
    const favoriteEvents = getFavoriteEvents();

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
                    <span className="text-muted text-sm">Membre depuis 2024</span>
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    <div className="card p-3" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <span className="text-primary font-bold" style={{ fontSize: '24px' }}>4.9</span>
                        <span className="text-muted text-xs">Fiabilité</span>
                    </div>
                    <div className="card p-3" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <span className="text-primary font-bold" style={{ fontSize: '24px' }}>{myEvents.length}</span>
                        <span className="text-muted text-xs">Événements</span>
                    </div>
                    <div className="card p-3" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <span style={{ fontSize: '24px', color: '#10b981', fontWeight: 'bold' }}>0</span>
                        <span className="text-muted text-xs">No-shows</span>
                    </div>
                </div>

                {/* Reliability Section */}
                <div className="card p-4" style={{ marginBottom: '24px' }}>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold">Indicateur de Sérieux</h3>
                        <span style={{
                            fontSize: '12px',
                            fontWeight: 'bold',
                            padding: '4px 8px',
                            background: '#dcfce7',
                            color: '#15803d',
                            borderRadius: '999px'
                        }}>Exemplaire</span>
                    </div>

                    <div style={{ width: '100%', background: '#e4e4e7', borderRadius: '10px', height: '10px', marginBottom: '8px' }}>
                        <div style={{ width: '95%', background: 'var(--color-primary)', height: '100%', borderRadius: '10px' }}></div>
                    </div>
                    <p className="text-sm text-muted">
                        Thomas est un participant très fiable. Il confirme sa présence et arrive à l'heure.
                    </p>
                </div>

                {/* Badges */}
                <h3 className="font-bold mb-2">Badges</h3>
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '24px' }}>
                    {['Ponctuel', 'Organisateur', 'Amical', 'Explorateur'].map((badge, i) => (
                        <div key={i} className="card" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', minWidth: 'max-content' }}>
                            <Award size={16} style={{ color: '#eab308' }} />
                            <span className="text-sm font-bold">{badge}</span>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        style={{
                            background: 'transparent', border: 'none', padding: 0,
                            fontSize: '18px', fontWeight: activeTab === 'upcoming' ? '800' : '600',
                            color: activeTab === 'upcoming' ? 'var(--color-text)' : 'var(--color-text-muted)',
                            transition: 'color 0.2s',
                            display: 'flex', alignItems: 'center', gap: '6px',
                            paddingBottom: '8px',
                            borderBottom: activeTab === 'upcoming' ? '3px solid var(--color-primary)' : '3px solid transparent'
                        }}
                    >
                        <CalendarDays size={18} />
                        À venir
                        <span style={{
                            background: 'var(--color-primary)', color: 'white',
                            fontSize: '12px', fontWeight: 'bold',
                            padding: '2px 8px', borderRadius: '12px',
                        }}>{myEvents.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('favorites')}
                        style={{
                            background: 'transparent', border: 'none', padding: 0,
                            fontSize: '18px', fontWeight: activeTab === 'favorites' ? '800' : '600',
                            color: activeTab === 'favorites' ? 'var(--color-text)' : 'var(--color-text-muted)',
                            transition: 'color 0.2s',
                            display: 'flex', alignItems: 'center', gap: '6px',
                            paddingBottom: '8px',
                            borderBottom: activeTab === 'favorites' ? '3px solid var(--color-primary)' : '3px solid transparent'
                        }}
                    >
                        <Heart size={18} />
                        Favoris
                        <span style={{
                            background: '#ec4899', color: 'white',
                            fontSize: '12px', fontWeight: 'bold',
                            padding: '2px 8px', borderRadius: '12px',
                        }}>{favoriteEvents.length}</span>
                    </button>
                </div>

                {/* Events List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {activeTab === 'upcoming' ? (
                        myEvents.length > 0 ? myEvents.slice(0, 10).map((event) => (
                            <div key={event.id} className="card p-3" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                    <BlurImage
                                        src={event.image}
                                        alt={event.title}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div className="font-bold text-sm" style={{ marginBottom: '2px' }}>{event.title}</div>
                                    <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                                        <span>{event.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                                        <span>•</span>
                                        <span>{event.time}</span>
                                        <span>•</span>
                                        <span style={{ color: event.isOrganizer ? 'var(--color-primary)' : 'var(--color-success)' }}>
                                            {event.isOrganizer ? 'Organisateur' : 'Inscrit'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="card p-4 text-center text-muted text-sm">
                                Aucun événement à venir.
                            </div>
                        )
                    ) : (
                        favoriteEvents.length > 0 ? favoriteEvents.slice(0, 10).map((event) => (
                            <div key={event.id} className="card p-3" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                                    <BlurImage
                                        src={event.image}
                                        alt={event.title}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        top: '4px',
                                        right: '4px',
                                        background: '#ec4899',
                                        borderRadius: '50%',
                                        width: '16px',
                                        height: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Heart size={10} color="white" fill="white" />
                                    </div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div className="font-bold text-sm" style={{ marginBottom: '2px' }}>{event.title}</div>
                                    <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                                        <span>{event.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                                        <span>•</span>
                                        <span>{event.time}</span>
                                        <span>•</span>
                                        <span>{event.location.split(',')[0]}</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="card p-4 text-center text-muted text-sm">
                                <Heart size={24} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                                Aucun événement en favoris.
                            </div>
                        )
                    )}
                </div>
            </div>
        </PageTransition>
    );
};

export default Profile;
