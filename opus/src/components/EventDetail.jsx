import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvents } from '../context/EventContext';
import { ArrowLeft, MapPin, Clock, Share2, Heart, MessageCircle } from 'lucide-react';
import PageTransition from './PageTransition';
import BlurImage from './BlurImage';
import { toast } from 'sonner';

// Mock Participants Data
const MOCK_PARTICIPANTS = [
    { id: 1, name: "Sophie M.", score: 4.9, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop" },
    { id: 2, name: "Lucas D.", score: 4.2, avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop" },
    { id: 3, name: "Emma W.", score: 5.0, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop" },
    { id: 4, name: "Thomas R.", score: 4.8, avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop" }
];

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { events, toggleRegistration } = useEvents();

    const event = events.find(e => e.id.toString() === id);

    if (!event) return <div className="p-4">Événement non trouvé</div>;

    const handleShare = () => {
        toast.success("Lien partagé !");
    };

    const handleRegistration = () => {
        toggleRegistration(event.id);
        if (!event.registered) {
            toast.success("Inscription confirmée !");
        } else {
            toast.info("Désinscription prise en compte");
        }
    };

    return (
        <PageTransition>
            <div style={{ background: 'var(--color-surface)', minHeight: '100vh', position: 'relative', paddingBottom: '90px' }}>

                {/* 1. Header Image Area */}
                <div style={{ position: 'relative', height: '350px', width: '100%' }}>
                    <BlurImage
                        src={event.image}
                        alt={event.title}
                    />

                    {/* Header Icons Overlay */}
                    <div style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        right: '0',
                        padding: '20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        zIndex: 50
                    }}>
                        <button
                            onClick={() => navigate(-1)}
                            style={{
                                width: '40px',
                                height: '40px',
                                background: 'white',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                        >
                            <ArrowLeft size={20} color="black" />
                        </button>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={handleShare}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    background: 'white',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                            >
                                <Share2 size={18} color="black" />
                            </button>
                            <button
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    background: 'white',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                            >
                                <Heart size={20} color="black" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. Overlapping Content Card */}
                <div style={{
                    position: 'relative',
                    marginTop: '-40px',
                    background: 'var(--color-surface)',
                    borderTopLeftRadius: '32px',
                    borderTopRightRadius: '32px',
                    padding: '32px 24px',
                    minHeight: '500px',
                    zIndex: 10
                }}>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: '800',
                        lineHeight: '1.2',
                        marginBottom: '16px',
                        color: 'var(--color-text)'
                    }}>
                        {event.title}
                    </h1>

                    {/* Price & Count Row */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '32px',
                        color: 'var(--color-text-muted)',
                        fontSize: '15px',
                        fontWeight: '500'
                    }}>
                        <span>10.00€ / personne</span>
                        <span>{event.attendees} participants</span>
                    </div>

                    {/* Info Rows */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ width: '40px', display: 'flex', justifyContent: 'center' }}>
                                <MapPin size={24} style={{ color: 'var(--color-text-muted)' }} />
                            </div>
                            <div>
                                <div style={{ fontWeight: '500', color: 'var(--color-text-muted)' }}>{event.location}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ width: '40px', display: 'flex', justifyContent: 'center' }}>
                                <Clock size={24} style={{ color: 'var(--color-text-muted)' }} />
                            </div>
                            <div>
                                <div style={{ fontWeight: '500', color: 'var(--color-text-muted)' }}>
                                    {event.date.toLocaleDateString('fr-FR', { month: 'long', day: 'numeric' })}, {event.time}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: '32px' }}>
                        <p style={{ lineHeight: '1.6', color: 'var(--color-text-muted)', fontSize: '15px' }}>
                            {event.description}
                            <br /><br />
                            Un tournoi hebdomadaire où vous pouvez gagner de l'expérience en affrontant des adversaires de votre niveau. C'est une super opportunité de garder la forme !
                        </p>
                    </div>

                    {/* Participants - Restored */}
                    <div style={{ marginBottom: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontWeight: '700', fontSize: '18px', color: 'var(--color-text)' }}>Participants</h3>
                            <button style={{ color: 'var(--color-primary)', fontSize: '14px', fontWeight: '600' }}>Voir tout</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {MOCK_PARTICIPANTS.map(p => (
                                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                                        <BlurImage
                                            src={p.avatar}
                                            alt={p.name}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: '700', color: 'var(--color-text)', marginBottom: '4px' }}>{p.name}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '80px', height: '6px', background: 'var(--color-border)', borderRadius: '10px' }}>
                                                <div style={{ height: '100%', background: 'var(--color-success)', borderRadius: '10px', width: `${(p.score / 5) * 100}%` }}></div>
                                            </div>
                                            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-muted)' }}>{p.score}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Registration Warning */}
                    <div style={{ marginBottom: '24px', fontSize: '14px', color: 'var(--color-text)', fontWeight: '500' }}>
                        Les inscriptions se terminent 15 minutes avant le début de l'événement !
                    </div>

                    {/* Map Placeholder */}
                    <div style={{
                        width: '100%',
                        height: '120px',
                        borderRadius: '16px',
                        background: 'url(https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80) center/cover',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'rgba(0,0,0,0.1)' }}></div>
                    </div>
                </div>

                {/* 3. Bottom Action Bar */}
                <div style={{
                    position: 'fixed',
                    bottom: '0',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '100%',
                    maxWidth: '430px',
                    background: 'var(--color-surface)',
                    borderTop: '1px solid var(--color-border)',
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    zIndex: 100
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '800', fontSize: '18px', color: 'var(--color-text)' }}>10.00€</span>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>/ personne</span>
                    </div>

                    <button style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'transparent',
                        flexShrink: 0
                    }}>
                        <MessageCircle size={24} color="var(--color-text)" />
                    </button>

                    <button
                        onClick={handleRegistration}
                        className="btn-primary"
                        style={{
                            flex: 1,
                            height: '50px',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: '600',
                            background: event.registered ? 'var(--color-surface-hover)' : '#be185d',
                            border: event.registered ? '1px solid var(--color-border)' : 'none',
                            color: event.registered ? 'var(--color-text)' : 'white'
                        }}
                    >
                        {event.registered ? 'Inscrit ✔' : "S'inscrire"}
                    </button>
                </div>

            </div>
        </PageTransition>
    );
};

export default EventDetail;
