import React, { createContext, useContext, useState } from 'react';

const EventContext = createContext();

const INITIAL_EVENTS = [
    {
        id: 1,
        title: "Soirée Jeux de Société",
        image: "https://picsum.photos/800/600?random=1",
        date: new Date(2026, 0, 6), // Jan 06 2026
        time: "19:00",
        location: "Le Bar à Jeux, Paris",
        attendees: 12,
        description: "Une soirée détendue pour découvrir les nouveaux jeux du moment. Débutants bienvenus !",
        registered: true,
        isOrganizer: true, // Mock: I am the organizer of this event
        price: 15 // Mock price
    },
    {
        id: 2,
        title: "Randonnée Urbaine",
        image: "https://picsum.photos/800/600?random=2",
        date: new Date(2026, 0, 8), // Jan 08 2026
        time: "14:00",
        location: "Départ Bastille",
        attendees: 24,
        description: "Redécouvrez Paris à pied à travers un parcours insolite de 10km.",
        registered: false,
        isOrganizer: false,
        price: 0 // Free event
    },
    {
        id: 3,
        title: "Atelier Cuisine Italienne",
        image: "https://picsum.photos/800/600?random=3",
        date: new Date(2026, 0, 10), // Jan 10 2026
        time: "18:30",
        location: "Chez Luigi",
        attendees: 6,
        description: "Apprenez à faire vos propres pâtes fraîches avec un chef italien.",
        registered: true,
        isOrganizer: false,
        price: 45
    },
    {
        id: 4,
        title: "Yoga au Parc",
        image: "https://picsum.photos/800/600?random=4",
        date: new Date(2026, 0, 15), // Jan 15 2026
        time: "10:00",
        location: "Parc des Buttes Chaumont",
        attendees: 15,
        description: "Séance de yoga en plein air pour tous niveaux.",
        registered: false,
        isOrganizer: false,
        price: 10
    },
    {
        id: 5,
        title: "Conférence Tech",
        image: "https://picsum.photos/800/600?random=5",
        date: new Date(2026, 0, 20), // Jan 20 2026
        time: "19:00",
        location: "Station F",
        attendees: 50,
        description: "Découvrez les dernières tendances en matière d'IA et de développement web.",
        registered: false,
        isOrganizer: false,
        price: 150
    },
    {
        id: 6,
        title: "Afterwork Salsa",
        image: "https://picsum.photos/800/600?random=6",
        date: new Date(2026, 0, 22), // Jan 22 2026
        time: "20:00",
        location: "La Pachanga",
        attendees: 30,
        description: "Initiation gratuite suivie d'une soirée dansante.",
        registered: false,
        isOrganizer: false,
        price: 12
    }
];

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
