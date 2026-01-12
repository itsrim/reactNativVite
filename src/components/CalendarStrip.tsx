import React from 'react';
import { useEvents, getDays } from '../context/EventContext';
import { useFeatureFlags } from '../context/FeatureFlagContext';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import useSwipe from '../hooks/useSwipe';
import { motion, AnimatePresence } from 'framer-motion';

const CalendarStrip: React.FC = () => {
    const { selectedDate, setSelectedDate, getEventsForDate } = useEvents();
    const { isAdmin } = useFeatureFlags();
    const { isWeekly, setWeekly, currentDate, next, prev, direction, handlers } = useSwipe(selectedDate);

    const days = getDays(currentDate, isWeekly);

    // Toggle view function
    const toggleView = (): void => setWeekly(!isWeekly);

    return (
        <div
            {...handlers}
            className="relative z-20"
            style={{
                borderBottomLeftRadius: '32px',
                borderBottomRightRadius: '32px',
                background: 'linear-gradient(135deg,rgb(225, 242, 40) 0%,rgb(218, 232, 92) 30%,rgb(212, 74, 166) 100%)',
                overflow: 'hidden',
                paddingBottom: '10px',
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
            }}
        >
            {/* Header Month/Year */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '12px 0 20px', position: 'relative' }}>
                {/* Navigation Arrows Absolute to stay out of center Text */}
                <button
                    onClick={prev}
                    style={{
                        position: 'absolute',
                        left: '24px',
                        padding: '8px',
                        color: '#111827',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        opacity: 1 // Let useSwipe handle the block, or we could add visual feedback here
                    }}
                >
                    <ChevronLeft size={20} />
                </button>

                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', textTransform: 'capitalize', color: '#111827' }}>
                    {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </h2>

                <button onClick={next} style={{ position: 'absolute', right: '24px', padding: '8px', color: '#111827', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Days Grid Wrapper with Framer Motion for smooth height resize */}
            <motion.div
                initial={false}
                animate={{ height: isWeekly ? 90 : 360 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{ overflow: 'hidden', position: 'relative', zIndex: 2 }}
            >
                <AnimatePresence mode="wait" initial={false} custom={direction}>
                    <motion.div
                        key={currentDate.toISOString() + (isWeekly ? 'week' : 'month')}
                        custom={direction}
                        initial={{ x: direction > 0 ? 50 : -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: direction > 0 ? -50 : 50, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            width: '100%',
                            rowGap: isWeekly ? '0' : '20px',
                        }}
                    >
                        {/* Weekday Labels */}
                        {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
                            <div key={i} style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(0,0,0,0.6)', marginBottom: '8px' }}>
                                {['L', 'M', 'M', 'J', 'V', 'S', 'D'][i]}
                            </div>
                        ))}

                        {days.map((date, index) => {
                            const isSelected = date.getDate() === selectedDate.getDate() &&
                                date.getMonth() === selectedDate.getMonth();

                            const dayEvents = getEventsForDate(date);
                            const hasEvent = dayEvents.length > 0;
                            const eventImage = hasEvent ? dayEvents[0].image : null;

                            return (
                                <div
                                    key={index}
                                    onClick={() => {
                                        if (!isAdmin) {
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);
                                            if (date.getTime() < today.getTime()) return;
                                        }
                                        setSelectedDate(date);
                                    }}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: (!isAdmin && date.getTime() < (new Date().setHours(0, 0, 0, 0))) ? 'default' : 'pointer',
                                        position: 'relative',
                                        height: '50px',
                                        opacity: (!isAdmin && date.getTime() < (new Date().setHours(0, 0, 0, 0))) ? 0.3 : 1
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '42px',
                                            height: '42px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '50%',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            background: hasEvent ? `url(${eventImage}) center/cover` : 'transparent',
                                            color: hasEvent ? 'white' : (isSelected ? 'var(--color-primary)' : 'rgba(0,0,0,0.7)'),
                                            boxShadow: isSelected
                                                ? (hasEvent ? '0 0 0 3px var(--color-primary), 0 0 15px var(--color-primary)' : '0 0 15px var(--color-primary-dark)')
                                                : 'none',
                                            textShadow: hasEvent ? '0 1px 3px rgba(0,0,0,0.8)' : 'none',
                                            opacity: (!hasEvent && !isSelected) ? 0.7 : 1
                                        }}
                                    >
                                        {hasEvent && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)', borderRadius: '50%' }}></div>}
                                        <span style={{ position: 'relative', zIndex: 1 }}>{date.getDate()}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            {/* Small arrow indicator */}
            <div
                onClick={toggleView}
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    paddingTop: '4px'
                }}
            >
                {isWeekly ? (
                    <ChevronDown size={16} color="rgba(0,0,0,0.5)" />
                ) : (
                    <ChevronUp size={16} color="rgba(0,0,0,0.5)" />
                )}
            </div>
        </div>
    );
};

export default CalendarStrip;

