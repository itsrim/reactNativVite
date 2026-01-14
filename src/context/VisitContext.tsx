import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// L'utilisateur connecté (simulé)
export const CURRENT_USER_ID = 999;
export const CURRENT_USER = {
    id: CURRENT_USER_ID,
    name: 'Thomas',
    age: 28,
    image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
};

// Mêmes prénoms que dans SocialPage/UserProfile pour cohérence
const FIRST_NAMES = [
    'Maya', 'Nancy', 'Kat', 'Stacey', 'Zoe', 'Lily', 'Rose', 'Emma', 'Sophie', 'Clara',
    'Léa', 'Manon', 'Chloé', 'Camille', 'Sarah', 'Laura', 'Julie', 'Marie', 'Anna', 'Eva',
    'Jade', 'Louise', 'Alice', 'Lola', 'Inès', 'Léna', 'Lucie', 'Nina', 'Mia', 'Zoé',
    'Lucas', 'Hugo', 'Louis', 'Nathan', 'Gabriel', 'Jules', 'Adam', 'Raphaël', 'Arthur', 'Léo',
    'Noah', 'Ethan', 'Paul', 'Tom', 'Mathis', 'Théo', 'Maxime', 'Alexandre', 'Antoine', 'Victor'
];

// Génère les données utilisateur de façon déterministe
export const getUserData = (userId: number) => {
    if (userId === CURRENT_USER_ID) return CURRENT_USER;
    
    const name = FIRST_NAMES[userId % FIRST_NAMES.length];
    const age = 18 + (userId % 20);
    const image = `https://i.pravatar.cc/600?img=${(userId % 70) + 1}`;
    
    return { id: userId, name, age, image };
};

export interface Visit {
    visitorId: number;
    visitedId: number;
    timestamp: Date;
}

export interface VisitorInfo {
    id: number;
    name: string;
    age: number;
    image: string;
    time: string;
    visits: number;
}

interface VisitContextType {
    visits: Visit[];
    recordVisit: (visitorId: number, visitedId: number) => void;
    getMyVisitors: () => VisitorInfo[];
    getVisitCount: (visitorId: number, visitedId: number) => number;
}

const VisitContext = createContext<VisitContextType | undefined>(undefined);

export const VisitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Base de données des visites en state
    const [visits, setVisits] = useState<Visit[]>([
        // Quelques visites initiales pour la démo
        { visitorId: 0, visitedId: CURRENT_USER_ID, timestamp: new Date(Date.now() - 2 * 60 * 1000) },
        { visitorId: 5, visitedId: CURRENT_USER_ID, timestamp: new Date(Date.now() - 15 * 60 * 1000) },
        { visitorId: 12, visitedId: CURRENT_USER_ID, timestamp: new Date(Date.now() - 60 * 60 * 1000) },
        { visitorId: 0, visitedId: CURRENT_USER_ID, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
        { visitorId: 23, visitedId: CURRENT_USER_ID, timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) },
        { visitorId: 5, visitedId: CURRENT_USER_ID, timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) },
        { visitorId: 5, visitedId: CURRENT_USER_ID, timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        { visitorId: 42, visitedId: CURRENT_USER_ID, timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000) },
    ]);

    // Enregistrer une visite (mémoïsé pour éviter les re-renders en boucle)
    const recordVisit = useCallback((visitorId: number, visitedId: number) => {
        // Ne pas enregistrer si on visite son propre profil
        if (visitorId === visitedId) return;
        
        const newVisit: Visit = {
            visitorId,
            visitedId,
            timestamp: new Date()
        };
        
        setVisits(prev => [newVisit, ...prev]);
    }, []);

    // Formater le temps relatif
    const formatRelativeTime = (date: Date): string => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return "À l'instant";
        if (diffMins < 60) return `Il y a ${diffMins} min`;
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        if (diffDays === 1) return 'Hier';
        if (diffDays < 7) return `Il y a ${diffDays} jours`;
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    // Obtenir les visiteurs de l'utilisateur connecté
    const getMyVisitors = (): VisitorInfo[] => {
        // Filtrer les visites sur mon profil
        const myVisits = visits.filter(v => v.visitedId === CURRENT_USER_ID);
        
        // Grouper par visiteur
        const visitorMap = new Map<number, { count: number; lastVisit: Date }>();
        
        myVisits.forEach(visit => {
            const existing = visitorMap.get(visit.visitorId);
            if (existing) {
                existing.count++;
                if (visit.timestamp > existing.lastVisit) {
                    existing.lastVisit = visit.timestamp;
                }
            } else {
                visitorMap.set(visit.visitorId, { count: 1, lastVisit: visit.timestamp });
            }
        });

        // Convertir en tableau et trier par dernière visite
        const visitors: VisitorInfo[] = [];
        visitorMap.forEach((data, visitorId) => {
            const userData = getUserData(visitorId);
            visitors.push({
                id: visitorId,
                name: userData.name,
                age: userData.age,
                image: userData.image,
                time: formatRelativeTime(data.lastVisit),
                visits: data.count
            });
        });

        // Trier par date de dernière visite (plus récent en premier)
        return visitors.sort((a, b) => {
            const visitA = myVisits.find(v => v.visitorId === a.id)!;
            const visitB = myVisits.find(v => v.visitorId === b.id)!;
            return visitB.timestamp.getTime() - visitA.timestamp.getTime();
        });
    };

    // Obtenir le nombre de visites d'un utilisateur sur un profil
    const getVisitCount = (visitorId: number, visitedId: number): number => {
        return visits.filter(v => v.visitorId === visitorId && v.visitedId === visitedId).length;
    };

    return (
        <VisitContext.Provider value={{ visits, recordVisit, getMyVisitors, getVisitCount }}>
            {children}
        </VisitContext.Provider>
    );
};

export const useVisits = (): VisitContextType => {
    const context = useContext(VisitContext);
    if (!context) {
        throw new Error('useVisits must be used within a VisitProvider');
    }
    return context;
};
