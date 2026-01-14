import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';

interface FriendRequest {
    fromUserId: number;
    toUserId: number;
    timestamp: Date;
    status: 'pending' | 'accepted' | 'rejected';
}

interface FriendContextType {
    friends: number[]; // IDs des amis mutuels
    sentRequests: FriendRequest[]; // Demandes envoyées
    receivedRequests: FriendRequest[]; // Demandes reçues
    addFriendRequestsToday: number; // Nombre de demandes envoyées aujourd'hui
    sendFriendRequest: (toUserId: number) => boolean; // true si succès
    acceptFriendRequest: (fromUserId: number) => void;
    rejectFriendRequest: (fromUserId: number) => void;
    removeFriend: (userId: number) => void;
    isFriend: (userId: number) => boolean;
    hasSentRequest: (toUserId: number) => boolean;
    hasReceivedRequest: (fromUserId: number) => boolean;
    canSendRequest: (isPremium: boolean) => boolean;
    getRemainingRequestsToday: (isPremium: boolean) => number;
}

const FriendContext = createContext<FriendContextType | undefined>(undefined);

const CURRENT_USER_ID = 999;
const MAX_REQUESTS_PER_DAY_FREE = 1;
const MAX_REQUESTS_PER_DAY_PREMIUM = 999;

// Simuler des amis existants pour la démo
// Inclut les utilisateurs des conversations existantes et quelques suggestions
const INITIAL_FRIENDS = [0, 1, 2, 3, 5, 8, 10, 12, 15, 20]; // Amis mutuels pour la démo
const INITIAL_RECEIVED_REQUESTS: FriendRequest[] = [
    { fromUserId: 23, toUserId: CURRENT_USER_ID, timestamp: new Date(), status: 'pending' },
    { fromUserId: 42, toUserId: CURRENT_USER_ID, timestamp: new Date(), status: 'pending' },
    { fromUserId: 25, toUserId: CURRENT_USER_ID, timestamp: new Date(), status: 'pending' },
];

interface FriendProviderProps {
    children: ReactNode;
}

// Version pour forcer la réinitialisation du localStorage si nécessaire
const FRIENDS_VERSION = '3'; // Incrémenté pour forcer reset

export const FriendProvider: React.FC<FriendProviderProps> = ({ children }) => {
    const [friends, setFriends] = useState<number[]>(() => {
        const version = localStorage.getItem('friends_version');
        // Si la version est différente, réinitialiser
        if (version !== FRIENDS_VERSION) {
            localStorage.setItem('friends_version', FRIENDS_VERSION);
            localStorage.removeItem('friends');
            localStorage.removeItem('sentRequests');
            localStorage.removeItem('receivedRequests');
            return INITIAL_FRIENDS;
        }
        const saved = localStorage.getItem('friends');
        return saved ? JSON.parse(saved) : INITIAL_FRIENDS;
    });

    const [sentRequests, setSentRequests] = useState<FriendRequest[]>(() => {
        const saved = localStorage.getItem('sentRequests');
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed.map((r: FriendRequest) => ({ ...r, timestamp: new Date(r.timestamp) }));
        }
        return [];
    });

    const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>(() => {
        const saved = localStorage.getItem('receivedRequests');
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed.map((r: FriendRequest) => ({ ...r, timestamp: new Date(r.timestamp) }));
        }
        return INITIAL_RECEIVED_REQUESTS;
    });

    // Sauvegarder dans localStorage
    useEffect(() => {
        localStorage.setItem('friends', JSON.stringify(friends));
    }, [friends]);

    useEffect(() => {
        localStorage.setItem('sentRequests', JSON.stringify(sentRequests));
    }, [sentRequests]);

    useEffect(() => {
        localStorage.setItem('receivedRequests', JSON.stringify(receivedRequests));
    }, [receivedRequests]);

    // Calculer les demandes envoyées aujourd'hui
    const getRequestsToday = (): number => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return sentRequests.filter(r => {
            const requestDate = new Date(r.timestamp);
            requestDate.setHours(0, 0, 0, 0);
            return requestDate.getTime() === today.getTime();
        }).length;
    };

    const addFriendRequestsToday = getRequestsToday();

    const canSendRequest = useCallback((isPremium: boolean): boolean => {
        const maxRequests = isPremium ? MAX_REQUESTS_PER_DAY_PREMIUM : MAX_REQUESTS_PER_DAY_FREE;
        return addFriendRequestsToday < maxRequests;
    }, [addFriendRequestsToday]);

    const getRemainingRequestsToday = useCallback((isPremium: boolean): number => {
        const maxRequests = isPremium ? MAX_REQUESTS_PER_DAY_PREMIUM : MAX_REQUESTS_PER_DAY_FREE;
        return Math.max(0, maxRequests - addFriendRequestsToday);
    }, [addFriendRequestsToday]);

    const isFriend = useCallback((userId: number): boolean => {
        return friends.includes(userId);
    }, [friends]);

    const hasSentRequest = useCallback((toUserId: number): boolean => {
        return sentRequests.some(r => r.toUserId === toUserId && r.status === 'pending');
    }, [sentRequests]);

    const hasReceivedRequest = useCallback((fromUserId: number): boolean => {
        return receivedRequests.some(r => r.fromUserId === fromUserId && r.status === 'pending');
    }, [receivedRequests]);

    const sendFriendRequest = useCallback((toUserId: number): boolean => {
        // Vérifier si déjà ami
        if (friends.includes(toUserId)) return false;
        
        // Vérifier si demande déjà envoyée
        if (sentRequests.some(r => r.toUserId === toUserId && r.status === 'pending')) return false;

        // Ajouter la demande
        const newRequest: FriendRequest = {
            fromUserId: CURRENT_USER_ID,
            toUserId,
            timestamp: new Date(),
            status: 'pending'
        };
        setSentRequests(prev => [...prev, newRequest]);

        // Simuler acceptation automatique après 2 secondes (pour la démo)
        setTimeout(() => {
            setFriends(prev => [...prev, toUserId]);
            setSentRequests(prev => 
                prev.map(r => r.toUserId === toUserId ? { ...r, status: 'accepted' as const } : r)
            );
        }, 2000);

        return true;
    }, [friends, sentRequests]);

    const acceptFriendRequest = useCallback((fromUserId: number): void => {
        // Ajouter aux amis
        setFriends(prev => {
            if (prev.includes(fromUserId)) return prev;
            return [...prev, fromUserId];
        });
        // Mettre à jour le statut de la demande
        setReceivedRequests(prev =>
            prev.map(r => r.fromUserId === fromUserId ? { ...r, status: 'accepted' as const } : r)
        );
    }, []);

    const rejectFriendRequest = useCallback((fromUserId: number): void => {
        setReceivedRequests(prev =>
            prev.map(r => r.fromUserId === fromUserId ? { ...r, status: 'rejected' as const } : r)
        );
    }, []);

    const removeFriend = useCallback((userId: number): void => {
        setFriends(prev => prev.filter(id => id !== userId));
    }, []);

    const contextValue = useMemo(() => ({
        friends,
        sentRequests,
        receivedRequests,
        addFriendRequestsToday,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        removeFriend,
        isFriend,
        hasSentRequest,
        hasReceivedRequest,
        canSendRequest,
        getRemainingRequestsToday
    }), [
        friends,
        sentRequests,
        receivedRequests,
        addFriendRequestsToday,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        removeFriend,
        isFriend,
        hasSentRequest,
        hasReceivedRequest,
        canSendRequest,
        getRemainingRequestsToday
    ]);

    return (
        <FriendContext.Provider value={contextValue}>
            {children}
        </FriendContext.Provider>
    );
};

export const useFriends = (): FriendContextType => {
    const context = useContext(FriendContext);
    if (!context) {
        throw new Error('useFriends must be used within a FriendProvider');
    }
    return context;
};

export default FriendContext;
