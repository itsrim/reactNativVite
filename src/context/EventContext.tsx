import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Event, NewEvent, EventContextType } from '../types';
import { getUserData } from './VisitContext';

const EventContext = createContext<EventContextType | undefined>(undefined);

// Générateur de données massives pour tester la scalabilité
const EVENT_TITLES: string[] = [
    "Soirée Jeux de Société", "Randonnée Urbaine", "Atelier Cuisine Italienne", "Yoga au Parc",
    "Conférence Tech", "Afterwork Salsa", "Cours de Peinture", "Dégustation de Vins",
    "Session Photo", "Tournoi d'Échecs", "Karaoké Night", "Brunch Networking",
    "Atelier Poterie", "Concert Jazz", "Cours de Danse", "Méditation Guidée",
    "Escape Game", "Soirée Cinéma", "Cours de Yoga", "Atelier Écriture",
    "Running Club", "Cours de Guitare", "Soirée Trivia", "Atelier DIY",
    "Visite Musée", "Cours de Boxe", "Soirée Poker", "Atelier Cocktails"
];

const LOCATIONS: string[] = [
    "Le Bar à Jeux, Paris", "Parc des Buttes Chaumont", "Station F", "La Pachanga",
    "Café de Flore", "Le Marais", "Montmartre", "Bastille", "République",
    "Belleville", "Oberkampf", "Nation", "Châtelet", "Saint-Germain"
];

const TIMES: string[] = ["08:00", "09:30", "10:00", "11:00", "12:30", "14:00", "15:30", "17:00", "18:30", "19:00", "20:00", "21:00"];

const ORGANIZER_NAMES: string[] = [
    "Sophie M.", "Lucas D.", "Emma W.", "Thomas R.", "Léa P.", "Hugo B.",
    "Camille V.", "Nathan L.", "Chloé G.", "Maxime F.", "Julie K.", "Antoine S.",
    "Marie C.", "Alexandre T.", "Sarah J.", "Pierre N.", "Clara H.", "Julien M."
];

// Génère ~30 événements par jour pour tout janvier 2026 (31 jours * ~30 = ~930 événements)
const generateMassiveEvents = (): Event[] => {
    const events: Event[] = [];
    let id = 1;

    for (let day = 1; day <= 31; day++) {
        const eventsPerDay = 25 + Math.floor(Math.random() * 15); // 25-40 événements par jour

        for (let i = 0; i < eventsPerDay; i++) {
            const maxAttendees = [20, 30, 50, 75, 100, 150, 200][Math.floor(Math.random() * 7)];
            const attendees = Math.floor(Math.random() * maxAttendees * 0.95) + 5;
            const isOrganizer = Math.random() > 0.9;
            events.push({
                id: id++,
                title: EVENT_TITLES[Math.floor(Math.random() * EVENT_TITLES.length)] + ` #${id}`,
                image: `https://picsum.photos/800/600?random=${id}`,
                date: new Date(2026, 0, day),
                time: TIMES[Math.floor(Math.random() * TIMES.length)],
                location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
                attendees,
                maxAttendees,
                description: `Événement passionnant du ${day} janvier. Rejoignez-nous pour une expérience unique !`,
                registered: Math.random() > 0.7, // 30% de chance d'être inscrit
                isOrganizer, // 10% de chance d'être organisateur
                organizer: isOrganizer ? 'Moi' : ORGANIZER_NAMES[Math.floor(Math.random() * ORGANIZER_NAMES.length)],
                price: Math.random() > 0.3 ? Math.floor(Math.random() * 150) + 5 : 0,
                favorite: Math.random() > 0.85, // 15% de chance d'être en favoris
                hideAddressUntilRegistered: Math.random() > 0.6, // 40% masquent l'adresse aux non-inscrits
                participantImages: Array.from({ length: Math.min(attendees, 5) }, (_, j) => getUserData(Math.floor(Math.random() * 50)).image)
            });
        }
    }

    return events;
};

const INITIAL_EVENTS = generateMassiveEvents();

interface EventProviderProps {
    children: ReactNode;
}

export const EventProvider: React.FC<EventProviderProps> = ({ children }) => {
    const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const addEvent = (newEvent: NewEvent): void => {
        setEvents([...events, {
            ...newEvent,
            id: Date.now(),
            registered: true,
            isOrganizer: true,
            organizer: 'Moi',
            attendees: 1,
            maxAttendees: newEvent.maxAttendees || 20,
            price: 0,
            favorite: false,
            image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
            hideAddressUntilRegistered: newEvent.hideAddressUntilRegistered || false
        }]);
    };

    const toggleRegistration = (eventId: number): void => {
        setEvents(events.map(e =>
            e.id === eventId ? { ...e, registered: !e.registered } : e
        ));
    };

    const toggleFavorite = (eventId: number): void => {
        setEvents(events.map(e =>
            e.id === eventId ? { ...e, favorite: !e.favorite } : e
        ));
    };

    const getFavoriteEvents = (): Event[] => {
        return events.filter(e => e.favorite).sort((a, b) => a.date.getTime() - b.date.getTime());
    };

    const getEventsForDate = (date: Date): Event[] => {
        return events.filter(e =>
            e.date.getDate() === date.getDate() &&
            e.date.getMonth() === date.getMonth() &&
            e.date.getFullYear() === date.getFullYear()
        );
    };

    const hasEventOnDate = (date: Date): boolean => {
        return events.some(e =>
            e.registered &&
            e.date.getDate() === date.getDate() &&
            e.date.getMonth() === date.getMonth() &&
            e.date.getFullYear() === date.getFullYear()
        );
    };

    // Calculate event counts per date for dot indicators
    const eventCounts = events.reduce<Record<string, number>>((acc, event) => {
        const dateStr = event.date.toDateString();
        acc[dateStr] = (acc[dateStr] || 0) + 1;
        return acc;
    }, {});

    return (
        <EventContext.Provider value={{
            events,
            addEvent,
            selectedDate,
            setSelectedDate,
            getEventsForDate,
            hasEventOnDate,
            toggleRegistration,
            toggleFavorite,
            getFavoriteEvents,
            eventCounts
        }}>
            {children}
        </EventContext.Provider>
    );
};

export const useEvents = (): EventContextType => {
    const context = useContext(EventContext);
    if (!context) {
        throw new Error('useEvents must be used within an EventProvider');
    }
    return context;
};

// Utility function to get days for basic calendar logic
export const getDays = (currentDate: Date, isWeekly: boolean): Date[] => {
    const days: Date[] = [];
    if (isWeekly) {
        // Find Monday of the current week (or Sunday depending on locale, let's assume Mon start)
        const day = currentDate.getDay();
        const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        const monday = new Date(currentDate);
        monday.setDate(diff);

        for (let i = 0; i < 7; i++) {
            const nextDay = new Date(monday);
            nextDay.setDate(monday.getDate() + i);
            days.push(nextDay);
        }
    } else {
        // Full Month
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const numDays = new Date(year, month + 1, 0).getDate();
        for (let i = 1; i <= numDays; i++) {
            days.push(new Date(year, month, i));
        }
    }
    return days;
};

