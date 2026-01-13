import React, { createContext, useContext, useState, ReactNode } from 'react';
import { getUserData, CURRENT_USER_ID } from './VisitContext';

export interface Message {
    id: number;
    senderId: number;
    receiverId: number;
    content: string;
    timestamp: Date;
    read: boolean;
}

export interface Conversation {
    otherId: number;
    name: string;
    age: number;
    image: string;
    lastMessage: string;
    lastMessageTime: Date;
    unreadCount: number;
}

export interface SocialGroup {
    id: number;
    name: string;
    members: string[];
    images: string[];
    msg: number;
    lastMessage: string;
    lastMessageDate: Date;
}

export interface ChatSettings {
    muteSounds: boolean;
    blockNotifications: boolean;
}

interface MessageContextType {
    messages: Message[];
    sendMessage: (receiverId: number, content: string) => void;
    getConversations: () => Conversation[];
    getConversationMessages: (otherId: number) => Message[];
    markAsRead: (otherId: number) => void;
    getTotalUnread: () => number;
    chatSettings: ChatSettings;
    updateChatSettings: (settings: Partial<ChatSettings>) => void;
    groups: SocialGroup[];
    leaveGroup: (groupId: number) => void;
    removeMember: (groupId: number, memberName: string) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [messages, setMessages] = useState<Message[]>([
        // Conversations initiales pour la démo
        { id: 1, senderId: 0, receiverId: CURRENT_USER_ID, content: "Salut ! Tu vas à l'événement de samedi ?", timestamp: new Date(Date.now() - 5 * 60 * 1000), read: false },
        { id: 2, senderId: CURRENT_USER_ID, receiverId: 0, content: "Hey ! Oui je pense y aller, et toi ?", timestamp: new Date(Date.now() - 4 * 60 * 1000), read: true },
        { id: 3, senderId: 0, receiverId: CURRENT_USER_ID, content: "Super ! On se retrouve là-bas alors 😊", timestamp: new Date(Date.now() - 3 * 60 * 1000), read: false },

        { id: 4, senderId: 5, receiverId: CURRENT_USER_ID, content: "Merci pour hier c'était sympa !", timestamp: new Date(Date.now() - 38 * 60 * 1000), read: true },

        { id: 5, senderId: 12, receiverId: CURRENT_USER_ID, content: "On se fait un café cette semaine ?", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), read: false },
        { id: 6, senderId: CURRENT_USER_ID, receiverId: 12, content: "Avec plaisir ! Jeudi ça te va ?", timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000), read: true },
        { id: 7, senderId: 12, receiverId: CURRENT_USER_ID, content: "Parfait, on dit 15h au Café Central ?", timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), read: false },

        { id: 8, senderId: 23, receiverId: CURRENT_USER_ID, content: "Hey ! Tu connais un bon resto dans le coin ?", timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), read: true },

        { id: 9, senderId: 42, receiverId: CURRENT_USER_ID, content: "Ça fait longtemps ! Comment tu vas ?", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), read: true },
    ]);

    const [nextId, setNextId] = useState(10);
    const [groups, setGroups] = useState<SocialGroup[]>([
        { id: 1, name: 'Team Padel', members: ['Lucas', 'Théo', 'Marie', 'Moi'], images: ['https://i.pravatar.cc/150?img=1', 'https://i.pravatar.cc/150?img=2', 'https://i.pravatar.cc/150?img=3'], msg: 2, lastMessage: "On joue demain ?", lastMessageDate: new Date(Date.now() - 15 * 60 * 1000) },
        { id: 2, name: 'Amis Pro', members: ['Sophie', 'Marc', 'Moi'], images: ['https://i.pravatar.cc/150?img=5', 'https://i.pravatar.cc/150?img=6'], msg: 0, lastMessage: "Le compte rendu est prêt.", lastMessageDate: new Date(Date.now() - 2 * 60 * 60 * 1000) },
        { id: 3, name: 'Rando Dimanche', members: ['Julie', 'Antoine', 'Léa', 'Kevin', 'Moi'], images: ['https://i.pravatar.cc/150?img=9', 'https://i.pravatar.cc/150?img=10', 'https://i.pravatar.cc/150?img=11', 'https://i.pravatar.cc/150?img=12'], msg: 5, lastMessage: "RDV 8h à la gare", lastMessageDate: new Date(Date.now() - 5 * 60 * 1000) },
        { id: 4, name: 'Apéro Jeux', members: ['Clémence', 'Thomas', 'Moi'], images: ['https://i.pravatar.cc/150?img=4', 'https://i.pravatar.cc/150?img=7'], msg: 1, lastMessage: "Je ramène le Monopoly", lastMessageDate: new Date(Date.now() - 45 * 60 * 1000) },
        { id: 5, name: 'Famille', members: ['Maman', 'Papa', 'Sœur', 'Moi'], images: ['https://i.pravatar.cc/150?img=8', 'https://i.pravatar.cc/150?img=13', 'https://i.pravatar.cc/150?img=14'], msg: 0, lastMessage: "Bisous à tous !", lastMessageDate: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        { id: 6, name: 'Voyage 2025', members: ['Alice', 'Bob', 'Moi'], images: ['https://i.pravatar.cc/150?img=11', 'https://i.pravatar.cc/150?img=15'], msg: 3, lastMessage: "Billets réservés !", lastMessageDate: new Date(Date.now() - 10 * 60 * 1000) },
        { id: 7, name: 'Voisins', members: ['Mr. Martin', 'Mme. Dupont', 'Julie', 'Moi'], images: ['https://i.pravatar.cc/150?img=16', 'https://i.pravatar.cc/150?img=17', 'https://i.pravatar.cc/150?img=18'], msg: 0, lastMessage: "Qui a ma clé ?", lastMessageDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    ]);

    const leaveGroup = (groupId: number) => {
        setGroups(prev => prev.filter(g => g.id !== groupId));
    };

    const removeMember = (groupId: number, memberName: string) => {
        setGroups(prev => prev.map(g => {
            if (g.id === groupId) {
                return { ...g, members: g.members.filter(m => m !== memberName) };
            }
            return g;
        }));
    };
    const [chatSettings, setChatSettings] = useState<ChatSettings>({
        muteSounds: false,
        blockNotifications: false
    });

    const updateChatSettings = (newSettings: Partial<ChatSettings>) => {
        setChatSettings(prev => ({ ...prev, ...newSettings }));
    };

    // Envoyer un message
    const sendMessage = (receiverId: number, content: string) => {
        const newMessage: Message = {
            id: nextId,
            senderId: CURRENT_USER_ID,
            receiverId,
            content,
            timestamp: new Date(),
            read: true
        };
        setMessages(prev => [...prev, newMessage]);
        setNextId(prev => prev + 1);

        // Simuler une réponse automatique après 1-3 secondes
        setTimeout(() => {
            const responses = [
                "D'accord, je note !",
                "Super, merci ! 😊",
                "Ah oui bonne idée !",
                "Je te dis ça rapidement",
                "Cool ! 👍",
                "Parfait !",
                "Haha oui c'est vrai",
                "On en reparle bientôt !",
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];

            setMessages(prev => [...prev, {
                id: prev.length + 1,
                senderId: receiverId,
                receiverId: CURRENT_USER_ID,
                content: randomResponse,
                timestamp: new Date(),
                read: false
            }]);
        }, 1000 + Math.random() * 2000);
    };

    // Formater le temps relatif
    const formatRelativeTime = (date: Date): string => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return "À l'instant";
        if (diffMins < 60) return `${diffMins} min`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays === 1) return 'Hier';
        if (diffDays < 7) return `${diffDays}j`;
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    // Obtenir la liste des conversations
    const getConversations = (): Conversation[] => {
        const conversationMap = new Map<number, { messages: Message[]; lastTime: Date }>();

        messages.forEach(msg => {
            const otherId = msg.senderId === CURRENT_USER_ID ? msg.receiverId : msg.senderId;
            const existing = conversationMap.get(otherId);

            if (existing) {
                existing.messages.push(msg);
                if (msg.timestamp > existing.lastTime) {
                    existing.lastTime = msg.timestamp;
                }
            } else {
                conversationMap.set(otherId, { messages: [msg], lastTime: msg.timestamp });
            }
        });

        const conversations: Conversation[] = [];
        conversationMap.forEach((data, otherId) => {
            const userData = getUserData(otherId);
            const sortedMessages = data.messages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            const lastMsg = sortedMessages[0];
            const unreadCount = data.messages.filter(m => m.senderId !== CURRENT_USER_ID && !m.read).length;

            conversations.push({
                otherId,
                name: userData.name,
                age: userData.age,
                image: userData.image,
                lastMessage: lastMsg.content,
                lastMessageTime: lastMsg.timestamp,
                unreadCount
            });
        });

        return conversations.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
    };

    // Obtenir les messages d'une conversation
    const getConversationMessages = (otherId: number): Message[] => {
        return messages
            .filter(m =>
                (m.senderId === CURRENT_USER_ID && m.receiverId === otherId) ||
                (m.senderId === otherId && m.receiverId === CURRENT_USER_ID)
            )
            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    };

    // Marquer les messages comme lus
    const markAsRead = (otherId: number) => {
        setMessages(prev => prev.map(msg => {
            if (msg.senderId === otherId && msg.receiverId === CURRENT_USER_ID && !msg.read) {
                return { ...msg, read: true };
            }
            return msg;
        }));
    };

    // Obtenir le nombre total de messages non lus
    const getTotalUnread = (): number => {
        return messages.filter(m => m.receiverId === CURRENT_USER_ID && !m.read).length;
    };

    return (
        <MessageContext.Provider value={{
            messages,
            sendMessage,
            getConversations,
            getConversationMessages,
            markAsRead,
            getTotalUnread,
            chatSettings,
            updateChatSettings,
            groups,
            leaveGroup,
            removeMember
        }}>
            {children}
        </MessageContext.Provider>
    );
};

export const useMessages = (): MessageContextType => {
    const context = useContext(MessageContext);
    if (!context) {
        throw new Error('useMessages must be used within a MessageProvider');
    }
    return context;
};
