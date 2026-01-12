// Event Types
export interface Event {
    id: number;
    title: string;
    image: string;
    date: Date;
    time: string;
    location: string;
    attendees: number;
    maxAttendees: number;
    description: string;
    registered: boolean;
    isOrganizer: boolean;
    organizer: string;
    price: number;
    favorite: boolean;
    hideAddressUntilRegistered: boolean;
    participantImages?: string[];
}

export interface NewEvent {
    title: string;
    date: Date;
    time: string;
    location: string;
    description: string;
    maxAttendees?: number;
    hideAddressUntilRegistered?: boolean;
}

export interface EventContextType {
    events: Event[];
    addEvent: (newEvent: NewEvent) => void;
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    getEventsForDate: (date: Date) => Event[];
    hasEventOnDate: (date: Date) => boolean;
    toggleRegistration: (eventId: number) => void;
    toggleFavorite: (eventId: number) => void;
    getFavoriteEvents: () => Event[];
    eventCounts: Record<string, number>;
}

// Feature Flag Types
export interface ConfigItem {
    value: boolean;
    label: string;
    description: string;
    category: string;
    isToggle?: boolean;
    freeOnly?: boolean;
}

export interface ConfigItemWithKey extends ConfigItem {
    key: string;
}

export type ConfigKey =
    | 'isPremium'
    | 'blurProfiles'
    | 'disableMessages'
    | 'blurEventAddress'
    | 'limitEventCreation'
    | 'limitParticipants'
    | 'limitRegistrations'
    | 'disableSearch'
    | 'isAdmin';

export type Config = Record<ConfigKey, ConfigItem>;

export interface Limits {
    maxParticipants: number;
    maxRegistrations: number;
    maxFavorites: number;
    maxActiveEvents: number;
}

export interface FeatureFlagContextType {
    config: Config;
    isPremium: boolean;
    toggleConfig: (configKey: ConfigKey) => void;
    isRestricted: (configKey: ConfigKey) => boolean;
    getLimits: () => Limits;
    getConfigByCategory: () => Record<string, ConfigItemWithKey[]>;
    resetConfig: () => void;
    isAdmin: boolean;
    isEnabled: (flagKey: string) => boolean;
    flags: Config;
    toggleFlag: (configKey: ConfigKey) => void;
    getFlagsByCategory: () => Record<string, ConfigItemWithKey[]>;
    resetFlags: () => void;
}

// Theme Types
export type Theme = 'light' | 'dark';

export interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

// Swipe Hook Types
export interface SwipeHandlers {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
}

export interface UseSwipeReturn {
    isWeekly: boolean;
    setWeekly: (value: boolean) => void;
    currentDate: Date;
    next: () => void;
    prev: () => void;
    direction: number;
    handlers: SwipeHandlers;
}

// Component Props Types
export interface BlurImageProps {
    src: string;
    alt: string;
    placeholderColor?: string;
}

export interface PageTransitionProps {
    children: React.ReactNode;
}

export interface EventCardProps {
    event: Event;
    onToggle: (eventId: number) => void;
    onToggleFavorite: (eventId: number) => void;
    isLast: boolean;
    featureFlags: {
        favoriteButton: boolean;
        showEventPrice: boolean;
        showAttendeeCount: boolean;
        blurEventAddress: boolean;
        maxRegistrations: number;
        maxFavorites: number;
    };
    registrationCount: number;
    favoriteCount: number;
}

