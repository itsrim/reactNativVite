import React, { useEffect, useState } from 'react';
import CalendarStrip from './CalendarStrip';
import { MapPin, Clock, Users, Send, CheckCircle, Plus, Scan } from 'lucide-react';
import { useEvents } from '../context/EventContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PageTransition from './PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { Virtuoso } from 'react-virtuoso';

const EventCard = ({ event, onToggle }) => {
    const navigate = useNavigate();
    const isRegistered = event.registered;
    const isOrganizer = event.isOrganizer;

    const handleCardClick = () => {
        navigate(`/event/${event.id}`);
    };

    const handleInvite = (e) => {
        e.stopPropagation();
        toast.info(`Lien d'invitation copié pour : ${event.title}`);
    };

    const handleActionClick = (e, action) => {
        e.stopPropagation();
        action();
        if (!isRegistered) {
            toast.success("Inscription réussie ! 🎟️");
        } else {
            toast('Désinscription prise en compte.', { icon: '👋' });
        }
    };

    return (
        <div style={{ paddingBottom: '16px', paddingLeft: '16px', paddingRight: '16px' }}>
            <motion.div
                onClick={handleCardClick}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.98 }}
                className="card cursor-pointer"
                style={{ overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}
            >
                <div style={{ position: 'relative', height: '160px', flexShrink: 0 }}>
                    <img
                        src={event.image || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80"}
                        alt={event.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(255,255,255,0.9)',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        fontSize: '0.8rem',
                        color: 'var(--color-primary)'
                    }}>
                        {event.date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    </div>

                    <button
                        onClick={handleInvite}
                        style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            background: 'rgba(0,0,0,0.5)',
                            color: 'white',
                            padding: '8px',
                            borderRadius: '50%',
                            border: 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <Send size={16} />
                    </button>
                </div>

                <div className="p-4" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                    </div>

                    <div className="flex items-center gap-4 mb-3 text-sm text-muted">
                        <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            <span>{event.location}</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center gap-2 mt-4">
                        <div className="flex gap-2 w-full">
                            {isOrganizer ? (
                                <button className="btn btn-primary flex-1 opacity-80" disabled>
                                    <Scan size={16} className="mr-2 inline" /> Organisateur
                                </button>
                            ) : (
                                <button
                                    onClick={(e) => handleActionClick(e, () => onToggle(event.id))}
                                    className={`btn flex-1 flex items-center justify-center gap-2 text-sm px-3 py-2 ${isRegistered ? 'btn-primary' : ''}`}
                                    style={!isRegistered ? { border: '1px solid var(--color-primary)', color: 'var(--color-primary)', background: 'transparent' } : {}}
                                >
                                    {isRegistered ? <CheckCircle size={14} /> : <Plus size={14} />}
                                    {isRegistered ? 'Inscrit' : "S'inscrire"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const EventList = () => {
    const { events, selectedDate, toggleRegistration } = useEvents();
    const [filteredEvents, setFilteredEvents] = useState([]);

    useEffect(() => {
        const dayEvents = events.filter(e =>
            e.date.getDate() === selectedDate.getDate() &&
            e.date.getMonth() === selectedDate.getMonth() &&
            e.date.getFullYear() === selectedDate.getFullYear()
        );
        setFilteredEvents(dayEvents);
    }, [events, selectedDate]);

    return (
        <PageTransition>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', paddingBottom: '90px' }}>



                <div style={{ flexShrink: 0 }}>
                    <CalendarStrip />
                    <div className="px-4 py-2">
                        <h2 className="font-bold text-lg">
                            {filteredEvents.length > 0 ? `Événements du ${selectedDate.getDate()}` : "Aucun événement"}
                        </h2>
                    </div>
                </div>

                <div style={{ flexGrow: 1 }}>
                    {filteredEvents.length > 0 ? (
                        <Virtuoso
                            style={{ height: '100%' }}
                            data={filteredEvents}
                            itemContent={(index, event) => (
                                <EventCard
                                    event={event}
                                    onToggle={toggleRegistration}
                                />
                            )}
                        />
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="text-center text-muted py-8 px-4"
                        >
                            <p>Pas d'événements pour le {selectedDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}.</p>
                            <p className="text-sm mt-2">Essayez le 6, 8, or 10 Janvier !</p>
                        </motion.div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
};

export default EventList;
