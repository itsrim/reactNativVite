import { useState, TouchEvent } from 'react';
import { UseSwipeReturn, SwipeHandlers } from '../types';

import { useFeatureFlags } from '../context/FeatureFlagContext';

const useSwipe = (initialDate?: Date): UseSwipeReturn => {
    const { isAdmin } = useFeatureFlags();
    const [currentDate, setCurrentDate] = useState<Date>(initialDate || new Date());
    const [isWeekly, setWeekly] = useState<boolean>(true);
    const [direction, setDirection] = useState<number>(0);

    // Swipe State
    const [touchStartX, setTouchStartX] = useState<number | null>(null);
    const [touchStartY, setTouchStartY] = useState<number | null>(null);
    const [touchEndX, setTouchEndX] = useState<number | null>(null);
    const [touchEndY, setTouchEndY] = useState<number | null>(null);

    const next = (): void => {
        setDirection(1);
        const newDate = new Date(currentDate);
        if (isWeekly) {
            newDate.setDate(newDate.getDate() + 7);
        } else {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        setCurrentDate(newDate);
    };

    const prev = (): void => {
        const newDate = new Date(currentDate);
        if (isWeekly) {
            newDate.setDate(newDate.getDate() - 7);
        } else {
            newDate.setMonth(newDate.getMonth() - 1);
        }

        // Restriction pour les non-admins : ne pas aller avant aujourd'hui
        if (!isAdmin) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Si la nouvelle date (début de semaine/mois) est avant aujourd'hui,
            // on vérifie si on est déjà au minimum possible
            if (newDate < today) {
                // On s'assure de ne pas descendre en dessous d'aujourd'hui
                // Pour la vue hebdo, on peut rester sur la semaine en cours si elle contient aujourd'hui
                if (isWeekly) {
                    // Si on recule d'une semaine et qu'on dépasse aujourd'hui, on bloque
                    return;
                } else {
                    // Pour le mois, on bloque si on passe au mois précédent
                    return;
                }
            }
        }

        setDirection(-1);
        setCurrentDate(newDate);
    };

    // Swipe Handlers
    const minSwipeDistance = 50;

    const onTouchStart = (e: TouchEvent): void => {
        setTouchEndX(null);
        setTouchEndY(null);
        setTouchStartX(e.targetTouches[0].clientX);
        setTouchStartY(e.targetTouches[0].clientY);
    };

    const onTouchMove = (e: TouchEvent): void => {
        setTouchEndX(e.targetTouches[0].clientX);
        setTouchEndY(e.targetTouches[0].clientY);
    };

    const onTouchEnd = (): void => {
        if (!touchStartX || !touchStartY) return;

        const distanceX = touchStartX - (touchEndX || touchStartX);
        const distanceY = touchStartY - (touchEndY || touchStartY);

        // Determine if horizontal or vertical swipe
        if (Math.abs(distanceX) > Math.abs(distanceY)) {
            // Horizontal swipe - navigation
            if (distanceX > minSwipeDistance) {
                next();
            } else if (distanceX < -minSwipeDistance) {
                prev();
            }
        } else {
            // Vertical swipe - toggle view
            if (distanceY > minSwipeDistance && !isWeekly) {
                // Swipe up -> collapse to week
                setWeekly(true);
            } else if (distanceY < -minSwipeDistance && isWeekly) {
                // Swipe down -> expand to month
                setWeekly(false);
            }
        }
    };

    const handlers: SwipeHandlers = {
        onTouchStart,
        onTouchMove,
        onTouchEnd
    };

    return {
        isWeekly,
        setWeekly,
        currentDate,
        next,
        prev,
        direction,
        handlers
    };
};

export default useSwipe;

