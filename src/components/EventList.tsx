import React, { useEffect, useState } from 'react';
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
                    {/* Bouton favori - contrôlé par feature flag */}
                    {featureFlags.favoriteButton && (
                        <button
                            onClick={handleFavoriteClick}
                            style={{
                                position: 'absolute',
                                top: '6px',
                                right: '6px',
                                background: isFavorite ? '#ec4899' : 'rgba(0,0,0,0.4)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '26px',
                                height: '26px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Heart
                                size={14}
                                color="white"
                                fill={isFavorite ? 'white' : 'transparent'}
                            />
                        </button>
                    )}
                    {/* Prix overlay - contrôlé par feature flag */}
                    {featureFlags.showEventPrice && (
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
                    )}
                </div>

                {/* Contenu à droite */}
                <div style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0, position: 'relative' }}>
                    <div>
                        {/* Participant Stack */}
                        {event.participantImages && event.participantImages.length > 0 && !isOrganizer && (
                            <div style={{
                                position: 'absolute',
                                top: '10px',
                                right: '12px',
                                zIndex: 10
                            }}>
                                <ParticipantStack
                                    images={event.participantImages}
                                    totalAttendees={event.attendees}
                                />
                            </div>
                        )}
                        <h3 style={{
                            fontWeight: '700',
                            fontSize: '14px',
                            marginBottom: '4px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            color: 'var(--color-text)',
                            paddingRight: event.participantImages && event.participantImages.length > 0 ? '60px' : '0'
                        }}>
                            {event.title}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Clock size={11} />
                                <span>{event.time}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', overflow: 'hidden' }}>
                                <MapPin size={11} style={{ flexShrink: 0 }} />
                                {(() => {
                                    const shouldHideAddress = event.hideAddressUntilRegistered && !isRegistered && !isOrganizer;
                                    return (
                                        <span style={{
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            filter: shouldHideAddress ? 'blur(4px)' : 'none'
                                        }}>
                                            {shouldHideAddress ? 'Inscrivez-vous pour voir' : event.location.split(',')[0]}
                                        </span>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Organisateur + Participants + Bouton */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {/* Compteur participants - contrôlé par feature flag */}
                            {featureFlags.showAttendeeCount && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '11px',
                                    color: 'var(--color-text-muted)'
                                }}>
                                    <Users size={12} />
                                    <span>
                                        {event.attendees}/{event.maxAttendees}
                                    </span>
                                </div>
                            )}
                        </div>
                        {/* Organisateur en couleur */}
                        <span style={{
                            fontSize: '10px',
                            fontWeight: '600',
                            color: isOrganizer ? '#ec4899' : '#6366f1'
                        }}>
                            {isOrganizer ? 'Organisateur' : event.organizer}
                        </span>
                        {!isOrganizer && (
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

interface EventItem {
    event: Event;
    date: Date;
    id: string;
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
        setInitialIndex(selectedDateIndex);

        if (items.length > 0) {
            const initialItem = items[selectedDateIndex] || items[0];
            setCurrentVisibleDate(initialItem.date);
        }
    }, [events, selectedDate]);

    // Mettre à jour la date visible et le calendrier quand on scrolle
    const handleVisibleItemsChanged = (range: { startIndex: number; endIndex: number }): void => {
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
                                    onToggleFavorite={toggleFavorite}
                                    isLast={index === allItems.length - 1}
                                    featureFlags={featureFlags}
                                    registrationCount={registrationCount}
                                    favoriteCount={favoriteCount}
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

