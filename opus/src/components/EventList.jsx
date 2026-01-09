import React, { useEffect, useState } from 'react';
import CalendarStrip from './CalendarStrip';
import { MapPin, Clock, Users, Send, CheckCircle, Plus, Scan } from 'lucide-react';
import { useEvents } from '../context/EventContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PageTransition from './PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { Virtuoso } from 'react-virtuoso';
import BlurImage from './BlurImage';

const EventCard = ({ event, onToggle, isLast }) => {
    const navigate = useNavigate();
    const isRegistered = event.registered;
    const isOrganizer = event.isOrganizer;

    const handleCardClick = () => {
        navigate(`/event/${event.id}`);
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
        <div style={{ paddingBottom: isLast ? '120px' : '10px', paddingLeft: '16px', paddingRight: '16px' }}>
            <motion.div
                onClick={handleCardClick}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.98 }}
                className="card cursor-pointer"
                style={{ overflow: 'hidden', display: 'flex', flexDirection: 'row', height: '100px' }}
            >
                {/* Image compacte à gauche */}
                <div style={{ position: 'relative', width: '100px', flexShrink: 0 }}>
                    <BlurImage
                        src={event.image || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80"}
                        alt={event.title}
                    />
                    {/* Prix overlay */}
                    <div style={{
                        position: 'absolute',
                        bottom: '6px',
                        left: '6px',
                        background: '#111827',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '6px',
                        fontWeight: '700',
                        fontSize: '10px'
                    }}>
                        {(event.price !== undefined && event.price !== null) ? (event.price === 0 ? 'Gratuit' : `${event.price}€`) : ''}
                    </div>
                </div>

                {/* Contenu à droite */}
                <div style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                    <div>
                        <h3 style={{ 
                            fontWeight: '700', 
                            fontSize: '14px', 
                            marginBottom: '4px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            color: 'var(--color-text)'
                        }}>
                            {event.title}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Clock size={11} />
                                <span>{event.time}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', overflow: 'hidden' }}>
                                <MapPin size={11} style={{ flexShrink: 0 }} />
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {event.location.split(',')[0]}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Bouton compact */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        {isOrganizer ? (
                            <span style={{ 
                                fontSize: '10px', 
                                fontWeight: '600', 
                                color: 'var(--color-primary)',
                                padding: '4px 8px',
                                background: 'var(--color-primary-light)',
                                borderRadius: '6px'
                            }}>
                                Organisateur
                            </span>
                        ) : (
                            <button
                                onClick={(e) => handleActionClick(e, () => onToggle(event.id))}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    padding: '5px 10px',
                                    borderRadius: '8px',
                                    border: isRegistered ? 'none' : '1px solid var(--color-primary)',
                                    background: isRegistered ? 'var(--color-primary)' : 'transparent',
                                    color: isRegistered ? 'white' : 'var(--color-primary)',
                                    cursor: 'pointer'
                                }}
                            >
                                {isRegistered ? <CheckCircle size={12} /> : <Plus size={12} />}
                                {isRegistered ? 'Inscrit' : "S'inscrire"}
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const EventList = () => {
    const { events, selectedDate, setSelectedDate, toggleRegistration } = useEvents();
    const [allItems, setAllItems] = useState([]);
    const [currentVisibleDate, setCurrentVisibleDate] = useState(selectedDate);
    const [initialIndex, setInitialIndex] = useState(0);

    // Générer une liste d'événements pour tout le mois de janvier
    useEffect(() => {
        const items = [];
        
        // Charger tout le mois de janvier 2026
        const startDate = new Date(2026, 0, 1);
        const endDate = new Date(2026, 0, 31);
        
        let currentDay = new Date(startDate);
        let selectedDateIndex = 0;
        let itemCount = 0;
        
        while (currentDay <= endDate) {
            const dayEvents = events.filter(e =>
                e.date.getDate() === currentDay.getDate() &&
                e.date.getMonth() === currentDay.getMonth() &&
                e.date.getFullYear() === currentDay.getFullYear()
            );

            // Marquer l'index du premier événement de la date sélectionnée
            if (dayEvents.length > 0 && 
                currentDay.getDate() === selectedDate.getDate() &&
                currentDay.getMonth() === selectedDate.getMonth()) {
                selectedDateIndex = itemCount;
            }

            // Ajouter les événements avec leur date
            dayEvents.forEach(event => {
                items.push({ event, date: new Date(currentDay), id: `event-${event.id}` });
                itemCount++;
            });
            
            // Passer au jour suivant
            currentDay.setDate(currentDay.getDate() + 1);
        }
        
        setAllItems(items);
        setInitialIndex(selectedDateIndex);
        
        if (items.length > 0) {
            const initialItem = items[selectedDateIndex] || items[0];
            setCurrentVisibleDate(initialItem.date);
        }
    }, [events]);

    // Mettre à jour la date visible et le calendrier quand on scrolle
    const handleVisibleItemsChanged = (range) => {
        if (range.startIndex >= 0 && allItems.length > 0) {
            const firstVisibleItem = allItems[range.startIndex];
            if (firstVisibleItem && firstVisibleItem.date) {
                const newDate = firstVisibleItem.date;
                if (newDate.getDate() !== currentVisibleDate.getDate() || 
                    newDate.getMonth() !== currentVisibleDate.getMonth()) {
                    setCurrentVisibleDate(newDate);
                    setSelectedDate(newDate);
                }
            }
        }
    };

    return (
        <PageTransition>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>

                <div style={{ flexShrink: 0 }}>
                    <CalendarStrip />
                </div>

                {/* Header de date sticky sous le calendrier */}
                <div 
                    style={{ 
                        padding: '16px 24px',
                        background: 'var(--color-background)',
                        borderBottom: '1px solid var(--color-border)',
                        flexShrink: 0
                    }}
                >
                    <h2 
                        className="font-bold text-xl" 
                        style={{ 
                            letterSpacing: '-0.5px', 
                            textTransform: 'capitalize',
                            color: 'var(--color-text)',
                            textAlign: 'center'
                        }}
                    >
                        <span style={{ color: 'var(--color-primary)' }}>
                            {currentVisibleDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </span>
                    </h2>
                </div>

                <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                    {allItems.length > 0 ? (
                        <Virtuoso
                            style={{ height: '100%' }}
                            data={allItems}
                            overscan={200}
                            initialTopMostItemIndex={initialIndex}
                            rangeChanged={handleVisibleItemsChanged}
                            itemContent={(index, item) => (
                                <EventCard
                                    event={item.event}
                                    onToggle={toggleRegistration}
                                    isLast={index === allItems.length - 1}
                                />
                            )}
                        />
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="text-center text-muted py-8 px-4"
                        >
                            <p>Pas d'événements pour les prochains jours.</p>
                        </motion.div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
};

export default EventList;
