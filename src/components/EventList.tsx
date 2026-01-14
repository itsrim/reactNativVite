import React, { useEffect, useState, useMemo } from 'react';
import CalendarStrip from './CalendarStrip';
import { MapPin, Clock, Users, CheckCircle, Plus, Heart } from 'lucide-react';
import { useEvents } from '../context/EventContext';
import { useFeatureFlags } from '../context/FeatureFlagContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PageTransition from './PageTransition';
import { motion } from 'framer-motion';
import { Virtuoso } from 'react-virtuoso';
import BlurImage from './BlurImage';
import { Event } from '../types';
import ParticipantStack from './ParticipantStack';

interface FeatureFlags {
    favoriteButton: boolean;
    showEventPrice: boolean;
    showAttendeeCount: boolean;
    blurEventAddress: boolean;
    limitRegistrations: boolean;
    maxRegistrations: number;
    maxFavorites: number;
}

interface EventCardProps {
    event: Event;
    onToggle: (eventId: number) => void;
    onToggleFavorite: (eventId: number) => void;
    isLast: boolean;
    featureFlags: FeatureFlags;
    registrationCount: number;
    favoriteCount: number;
}

const EventCard: React.FC<EventCardProps> = ({ event, onToggle, onToggleFavorite, isLast, featureFlags, registrationCount, favoriteCount }) => {
    const navigate = useNavigate();
    const isRegistered = event.registered;
    const isOrganizer = event.isOrganizer;
    const isFavorite = event.favorite;

    const canRegister = isRegistered || registrationCount < featureFlags.maxRegistrations;
    const canFavorite = isFavorite || favoriteCount < featureFlags.maxFavorites;

    const handleCardClick = (): void => {
        navigate(`/event/${event.id}`);
    };

    const handleActionClick = (e: React.MouseEvent, action: () => void): void => {
        e.stopPropagation();
        if (!isRegistered && !canRegister) {
            toast.error(`Limite de ${featureFlags.maxRegistrations} inscriptions atteinte ! 🔒`);
            return;
        }
        action();
        if (!isRegistered) {
            toast.success("Inscription réussie ! 🎟️");
        } else {
            toast('Désinscription prise en compte.', { icon: '👋' });
        }
    };

    const handleFavoriteClick = (e: React.MouseEvent): void => {
        e.stopPropagation();
        if (!isFavorite && !canFavorite) {
            toast.error(`Limite de ${featureFlags.maxFavorites} favoris atteinte ! 🔒`);
            return;
        }
        onToggleFavorite(event.id);
        if (!isFavorite) {
            toast.success("Ajouté aux favoris ❤️");
        } else {
            toast("Retiré des favoris", { icon: '💔' });
        }
    };

    return (
        <div
            onClick={handleCardClick}
            className="card cursor-pointer"
            style={{ 
                overflow: 'hidden', 
                display: 'flex', 
                flexDirection: 'column',
                height: '100%'
            }}
        >
            {/* Image en haut */}
            <div style={{ position: 'relative', height: '90px', flexShrink: 0 }}>
                <BlurImage
                    src={event.image || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80"}
                    alt={event.title}
                />
                {/* Bouton Inscrit/S'inscrire ou Organisateur - Haut gauche */}
                {isOrganizer ? (
                    <div style={{
                        position: 'absolute',
                        top: '6px',
                        left: '6px',
                        background: '#ec4899',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        fontSize: '9px',
                        fontWeight: '600',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                        Organisateur
                    </div>
                ) : (
                    <button
                        onClick={(e) => handleActionClick(e, () => onToggle(event.id))}
                        style={{
                            position: 'absolute',
                            top: '6px',
                            left: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '9px',
                            fontWeight: '600',
                            padding: '4px 8px',
                            borderRadius: '8px',
                            border: 'none',
                            background: isRegistered ? 'var(--color-primary)' : 'rgba(255,255,255,0.95)',
                            color: isRegistered ? 'white' : 'var(--color-primary)',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                    >
                        {isRegistered ? <CheckCircle size={10} /> : <Plus size={10} />}
                        {isRegistered ? 'Inscrit' : "S'inscrire"}
                    </button>
                )}
                {/* Prix - Haut droite */}
                {featureFlags.showEventPrice && (
                    <div style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        background: '#111827',
                        color: 'white',
                        padding: '3px 7px',
                        borderRadius: '6px',
                        fontWeight: '700',
                        fontSize: '9px'
                    }}>
                        {(event.price !== undefined && event.price !== null) ? (event.price === 0 ? 'Gratuit' : `${event.price}€`) : ''}
                    </div>
                )}
                {/* Participants Stack - Bas gauche */}
                {event.participantImages && event.participantImages.length > 0 && (
                    <div style={{ position: 'absolute', bottom: '6px', left: '6px' }}>
                        <ParticipantStack images={event.participantImages} totalAttendees={event.attendees} size={18} />
                    </div>
                )}
                {/* Compteur participants - Bas droite */}
                {featureFlags.showAttendeeCount && (
                    <div style={{
                        position: 'absolute',
                        bottom: '6px',
                        right: '6px',
                        background: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '6px',
                        fontSize: '9px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                    }}>
                        <Users size={10} />
                        <span>{event.attendees}/{event.maxAttendees}</span>
                    </div>
                )}
            </div>

            {/* Contenu en bas */}
            <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
                {/* Titre + Cœur favori */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h3 style={{
                        fontWeight: '700',
                        fontSize: '13px',
                        flex: 1,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        color: 'var(--color-text)',
                        lineHeight: '1.2',
                        margin: 0
                    }}>
                        {event.title}
                    </h3>
                    {featureFlags.favoriteButton && (
                        <button
                            onClick={handleFavoriteClick}
                            style={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                flexShrink: 0
                            }}
                        >
                            <Heart 
                                size={14} 
                                color={isFavorite ? '#ec4899' : 'var(--color-text-muted)'} 
                                fill={isFavorite ? '#ec4899' : 'transparent'} 
                            />
                        </button>
                    )}
                </div>
                
                {/* Heure + Ville */}
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={11} />
                    <span>{event.time}</span>
                    <MapPin size={11} style={{ marginLeft: '4px' }} />
                    <span style={{ 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        filter: event.hideAddressUntilRegistered && !isRegistered && !isOrganizer ? 'blur(4px)' : 'none'
                    }}>
                        {event.location.split(',').pop()?.trim() || event.location.split(',')[0]}
                    </span>
                </div>
            </div>
        </div>
    );
};

interface EventItem {
    event: Event;
    date: Date;
    id: string;
}

interface EventRow {
    items: EventItem[];
    date: Date;
}

const EventList: React.FC = () => {
    const { events, selectedDate, setSelectedDate, toggleRegistration, toggleFavorite, getFavoriteEvents } = useEvents();
    const { isEnabled, isRestricted, getLimits, isAdmin } = useFeatureFlags();
    const [allItems, setAllItems] = useState<EventItem[]>([]);
    const [currentVisibleDate, setCurrentVisibleDate] = useState<Date>(selectedDate);
    const [initialIndex, setInitialIndex] = useState<number>(0);

    const limits = getLimits();
    const todayAtZero = new Date();
    todayAtZero.setHours(0, 0, 0, 0);

    // Reset selectedDate if past for non-admins
    useEffect(() => {
        if (!isAdmin && selectedDate.getTime() < todayAtZero.getTime()) {
            setSelectedDate(todayAtZero);
        }
    }, [isAdmin, selectedDate, setSelectedDate]);

    // Compteurs pour les limites
    const registrationCount = events.filter(e => e.registered && !e.isOrganizer && e.date >= todayAtZero).length;
    const favoriteCount = getFavoriteEvents().length;

    // Feature flags pour les cartes d'événements
    const featureFlags: FeatureFlags = {
        favoriteButton: isEnabled('favoriteButton'),
        showEventPrice: isEnabled('showEventPrice'),
        showAttendeeCount: isEnabled('showAttendeeCount'),
        blurEventAddress: isRestricted('blurEventAddress'),
        limitRegistrations: isRestricted('limitRegistrations'),
        maxRegistrations: limits.maxRegistrations,
        maxFavorites: limits.maxFavorites
    };

    // Générer une liste d'événements pour tout le mois de janvier
    useEffect(() => {
        const items: EventItem[] = [];

        // Charger tout le mois de janvier 2026
        const startDate = new Date(2026, 0, 1);
        const endDate = new Date(2026, 0, 31);
        const todayAtZero = new Date();
        todayAtZero.setHours(0, 0, 0, 0);

        let currentDay = new Date(startDate);
        let selectedDateIndex = 0;
        let itemCount = 0;

        while (currentDay <= endDate) {
            const dayEvents = events.filter(e =>
                e.date.getDate() === currentDay.getDate() &&
                e.date.getMonth() === currentDay.getMonth() &&
                e.date.getFullYear() === currentDay.getFullYear()
            ).sort((a, b) => {
                // Trier par horaire
                const timeA = a.time.split(':').map(Number);
                const timeB = b.time.split(':').map(Number);
                return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
            });

            // Marquer l'index du premier événement de la date sélectionnée
            if (dayEvents.length > 0 &&
                currentDay.getDate() === selectedDate.getDate() &&
                currentDay.getMonth() === selectedDate.getMonth()) {
                selectedDateIndex = itemCount;
            }

            // Ajouter les événements avec leur date
            // Restriction non-admin : ne pas ajouter d'événements passés à la liste scrollable
            if (isAdmin || currentDay >= todayAtZero) {
                dayEvents.forEach(event => {
                    items.push({ event, date: new Date(currentDay), id: `event-${event.id}` });
                    itemCount++;
                });
            }

            // Passer au jour suivant
            currentDay.setDate(currentDay.getDate() + 1);
        }

        setAllItems(items);
        // L'index pour les rows sera calculé dans le useMemo
        setInitialIndex(Math.floor(selectedDateIndex / 2));

        if (items.length > 0) {
            const initialItem = items[selectedDateIndex] || items[0];
            setCurrentVisibleDate(initialItem.date);
        }
    }, [events, selectedDate]);

    // Grouper les événements par paires (rows de 2)
    const rows: EventRow[] = useMemo(() => {
        const result: EventRow[] = [];
        for (let i = 0; i < allItems.length; i += 2) {
            const rowItems = allItems.slice(i, i + 2);
            result.push({
                items: rowItems,
                date: rowItems[0]?.date || new Date()
            });
        }
        return result;
    }, [allItems]);

    // Mettre à jour la date visible et le calendrier quand on scrolle
    const handleVisibleItemsChanged = (range: { startIndex: number; endIndex: number }): void => {
        if (range.startIndex >= 0 && rows.length > 0) {
            const firstVisibleRow = rows[range.startIndex];
            if (firstVisibleRow && firstVisibleRow.date) {
                const newDate = firstVisibleRow.date;
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

                <div style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    background: 'var(--color-background)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ flexShrink: 0 }}>
                        <CalendarStrip />
                    </div>

                    {/* Header de date sticky sous le calendrier */}
                    <div
                        style={{
                            padding: '10px 16px',
                            background: 'var(--color-background)',
                            borderBottom: '1px solid var(--color-border)',
                            flexShrink: 0
                        }}
                    >
                        <h2
                            className="font-bold text-lg"
                            style={{
                                letterSpacing: '-0.3px',
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
                </div>

                <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                    {rows.length > 0 ? (
                        <Virtuoso
                            style={{ height: '100%' }}
                            data={rows}
                            overscan={200}
                            initialTopMostItemIndex={initialIndex}
                            rangeChanged={handleVisibleItemsChanged}
                            itemContent={(index, row) => (
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(2, 1fr)', 
                                    gap: '10px',
                                    padding: '5px 12px',
                                    paddingBottom: index === rows.length - 1 ? '120px' : '5px',
                                    height: '160px'
                                }}>
                                    {row.items.map((item) => (
                                        <EventCard
                                            key={item.id}
                                            event={item.event}
                                            onToggle={toggleRegistration}
                                            onToggleFavorite={toggleFavorite}
                                            isLast={false}
                                            featureFlags={featureFlags}
                                            registrationCount={registrationCount}
                                            favoriteCount={favoriteCount}
                                        />
                                    ))}
                                </div>
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

