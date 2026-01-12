import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Config, ConfigKey, ConfigItemWithKey, Limits, FeatureFlagContextType } from '../types';

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

// Configuration Premium vs Free - using translation keys
const DEFAULT_CONFIG: Config = {
    isPremium: {
        value: false,
        label: 'restrictions.premiumMode',
        description: 'restrictions.premiumModeDesc',
        category: 'Compte',
        isToggle: true
    },
    // Restrictions Free (inversées - true = restriction active)
    blurProfiles: {
        value: true,
        label: 'restrictions.blurProfiles',
        description: 'restrictions.blurProfilesDesc',
        category: 'Restrictions Free',
        freeOnly: true
    },
    disableMessages: {
        value: true,
        label: 'restrictions.disableMessages',
        description: 'restrictions.disableMessagesDesc',
        category: 'Restrictions Free',
        freeOnly: true
    },
    blurEventAddress: {
        value: false,
        label: 'restrictions.blurEventAddress',
        description: 'restrictions.blurEventAddressDesc',
        category: 'Restrictions Free',
        freeOnly: true
    },
    limitEventCreation: {
        value: true,
        label: 'restrictions.limitEventCreation',
        description: 'restrictions.limitEventCreationDesc',
        category: 'Restrictions Free',
        freeOnly: true
    },
    limitParticipants: {
        value: true,
        label: 'restrictions.limitParticipants',
        description: 'restrictions.limitParticipantsDesc',
        category: 'Restrictions Free',
        freeOnly: true
    },
    limitRegistrations: {
        value: true,
        label: 'restrictions.limitRegistrations',
        description: 'restrictions.limitRegistrationsDesc',
        category: 'Restrictions Free',
        freeOnly: true
    },
    disableSearch: {
        value: true,
        label: 'restrictions.disableSearch',
        description: 'restrictions.disableSearchDesc',
        category: 'Restrictions Free',
        freeOnly: true
    },
    isAdmin: {
        value: false,
        label: 'restrictions.adminMode',
        description: 'restrictions.adminModeDesc',
        category: 'Compte',
        isToggle: true
    }
};

// Limites selon le statut
const LIMITS: { free: Limits; premium: Limits } = {
    free: {
        maxParticipants: 8,
        maxRegistrations: 3,
        maxFavorites: 3,
        maxActiveEvents: 1
    },
    premium: {
        maxParticipants: 20,
        maxRegistrations: 10,
        maxFavorites: 10,
        maxActiveEvents: 999
    }
};

interface FeatureFlagProviderProps {
    children: ReactNode;
}

export const FeatureFlagProvider: React.FC<FeatureFlagProviderProps> = ({ children }) => {
    // Charger la config depuis localStorage ou utiliser les valeurs par défaut
    const [config, setConfig] = useState<Config>(() => {
        const saved = localStorage.getItem('appConfig');
        if (saved) {
            try {
                const parsed = JSON.parse(saved) as Partial<Config>;
                const merged = { ...DEFAULT_CONFIG };
                (Object.keys(parsed) as ConfigKey[]).forEach(key => {
                    if (merged[key] && parsed[key]) {
                        merged[key] = { ...merged[key], value: parsed[key]!.value };
                    }
                });
                return merged;
            } catch {
                return DEFAULT_CONFIG;
            }
        }
        return DEFAULT_CONFIG;
    });

    // Sauvegarder dans localStorage à chaque changement
    useEffect(() => {
        localStorage.setItem('appConfig', JSON.stringify(config));
    }, [config]);

    const isPremium = config.isPremium.value;
    const isAdmin = config.isAdmin?.value || false;

    // Toggle une config
    const toggleConfig = (configKey: ConfigKey): void => {
        setConfig(prev => ({
            ...prev,
            [configKey]: {
                ...prev[configKey],
                value: !prev[configKey].value
            }
        }));
    };

    // Vérifier si une restriction est active (prend en compte le premium)
    const isRestricted = (configKey: ConfigKey): boolean => {
        if (isPremium) return false; // Premium = pas de restriction
        return config[configKey]?.value ?? false;
    };

    // Obtenir les limites actuelles selon le statut premium
    const getLimits = (): Limits => {
        return isPremium ? LIMITS.premium : LIMITS.free;
    };

    // Obtenir la config groupée par catégorie
    const getConfigByCategory = (): Record<string, ConfigItemWithKey[]> => {
        const categories: Record<string, ConfigItemWithKey[]> = {};
        (Object.entries(config) as [ConfigKey, typeof config[ConfigKey]][]).forEach(([key, item]) => {
            const category = item.category || 'Autres';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push({ key, ...item });
        });
        return categories;
    };

    // Reset toute la config aux valeurs par défaut
    const resetConfig = (): void => {
        setConfig(DEFAULT_CONFIG);
    };

    // Compatibilité avec l'ancien système
    const isEnabled = (flagKey: string): boolean => {
        // Pour les anciens flags, retourner true par défaut
        if (flagKey === 'favoriteButton') return true;
        if (flagKey === 'showEventPrice') return true;
        if (flagKey === 'showAttendeeCount') return true;
        return !isRestricted(flagKey as ConfigKey);
    };

    return (
        <FeatureFlagContext.Provider value={{
            config,
            isPremium,
            toggleConfig,
            isRestricted,
            getLimits,
            getConfigByCategory,
            resetConfig,
            isAdmin,
            // Compatibilité
            isEnabled,
            flags: config,
            toggleFlag: toggleConfig,
            getFlagsByCategory: getConfigByCategory,
            resetFlags: resetConfig
        }}>
            {children}
        </FeatureFlagContext.Provider>
    );
};

export const useFeatureFlags = (): FeatureFlagContextType => {
    const context = useContext(FeatureFlagContext);
    if (!context) {
        throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
    }
    return context;
};

export default FeatureFlagContext;

