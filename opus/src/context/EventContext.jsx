import React, { createContext, useContext, useState } from 'react';

const EventContext = createContext();

// Générateur de données massives pour tester la scalabilité
const EVENT_TITLES = [
    "Soirée Jeux de Société", "Randonnée Urbaine", "Atelier Cuisine Italienne", "Yoga au Parc",
    "Conférence Tech", "Afterwork Salsa", "Cours de Peinture", "Dégustation de Vins",
    "Session Photo", "Tournoi d'Échecs", "Karaoké Night", "Brunch Networking",
    "Atelier Poterie", "Concert Jazz", "Cours de Danse", "Méditation Guidée",
    "Escape Game", "Soirée Cinéma", "Cours de Yoga", "Atelier Écriture",
    "Running Club", "Cours de Guitare", "Soirée Trivia", "Atelier DIY",
    "Visite Musée", "Cours de Boxe", "Soirée Poker", "Atelier Cocktails"
];

const LOCATIONS = [
    "Le Bar à Jeux, Paris", "Parc des Buttes Chaumont", "Station F", "La Pachanga",
    "Café de Flore", "Le Marais", "Montmartre", "Bastille", "République",
    "Belleville", "Oberkampf", "Nation", "Châtelet", "Saint-Germain"
];

const TIMES = ["08:00", "09:30", "10:00", "11:00", "12:30", "14:00", "15:30", "17:00", "18:30", "19:00", "20:00", "21:00"];

// Génère ~30 événements par jour pour tout janvier 2026 (31 jours * ~30 = ~930 événements)
const generateMassiveEvents = () => {
    const events = [];
    let id = 1;
    
    for (let day = 1; day <= 31; day++) {
        const eventsPerDay = 25 + Math.floor(Math.random() * 15); // 25-40 événements par jour
        
        for (let i = 0; i < eventsPerDay; i++) {
            events.push({
                id: id++,
                title: EVENT_TITLES[Math.floor(Math.random() * EVENT_TITLES.length)] + ` #${id}`,
                image: `https://picsum.photos/800/600?random=${id}`,
                date: new Date(2026, 0, day),
                time: TIMES[Math.floor(Math.random() * TIMES.length)],
                location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
                attendees: Math.floor(Math.random() * 100) + 5,
                description: `Événement passionnant du ${day} janvier. Rejoignez-nous pour une expérience unique !`,
                registered: Math.random() > 0.7, // 30% de chance d'être inscrit
                isOrganizer: Math.random() > 0.9, // 10% de chance d'être organisateur
                price: Math.random() > 0.3 ? Math.floor(Math.random() * 150) + 5 : 0,
                favorite: Math.random() > 0.85 // 15% de chance d'être en favoris
            });
        }
    }
    
    return events;
};

const INITIAL_EVENTS = generateMassiveEvents();

export const EventProvider = ({ children }) => {
    const [events, setEvents] = useState(INITIAL_EVENTS);
    const [selectedDate, setSelectedDate] = useState(new Date(2026, 0, 6));

    const addEvent = (newEvent) => {
        // New events created by me are Organizer=true
        setEvents([...events, { ...newEvent, id: Date.now(), registered: true, isOrganizer: true }]);
    };

    const toggleRegistration = (eventId) => {
        setEvents(events.map(e =>
            e.id === eventId ? { ...e, registered: !e.registered } : e
        ));
    };

    const toggleFavorite = (eventId) => {
        setEvents(events.map(e =>
            e.id === eventId ? { ...e, favorite: !e.favorite } : e
        ));
    };

    const getFavoriteEvents = () => {
        return events.filter(e => e.favorite).sort((a, b) => a.date - b.date);
    };

    const getEventsForDate = (date) => {
        return events.filter(e =>
            e.date.getDate() === date.getDate() &&
            e.date.getMonth() === date.getMonth() &&
            e.date.getFullYear() === date.getFullYear()
        );
    };

    const hasEventOnDate = (date) => {
        return events.some(e =>
            e.registered &&
            e.date.getDate() === date.getDate() &&
            e.date.getMonth() === date.getMonth() &&
            e.date.getFullYear() === date.getFullYear()
        );
    };

    // Calculate event counts per date for dot indicators
    const eventCounts = events.reduce((acc, event) => {
        const dateStr = event.date.toDateString();
        // Only count if registered? Or all? Let's count all available logic, 
        // but ui uses hasEventOnDate for green dots (registered).
        // Let's keep a map of valid events.
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

export const useEvents = () => useContext(EventContext);

// Utility function to get days for basic calendar logic
export const getDays = (currentDate, isWeekly) => {
    const days = [];
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
