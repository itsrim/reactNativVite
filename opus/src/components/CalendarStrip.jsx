import React from 'react';
import { useEvents, getDays } from '../context/EventContext';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import useSwipe from '../hooks/useSwipe';
import { motion, AnimatePresence } from 'framer-motion';

const CalendarStrip = () => {
    const { selectedDate, setSelectedDate, getEventsForDate } = useEvents();
    const { isWeekly, setWeekly, currentDate, next, prev, direction, handlers } = useSwipe(selectedDate);

    const days = getDays(currentDate, isWeekly);

    // Toggle view function
    const toggleView = () => setWeekly(!isWeekly);

    // Handle Drag for Expand/Collapse
    const handleDragEnd = (event, info) => {
        const swipeThreshold = 50;
        if (info.offset.y > swipeThreshold && isWeekly) {
            setWeekly(false); // Drag Down -> Open Month
        } else if (info.offset.y < -swipeThreshold && !isWeekly) {
            setWeekly(true); // Drag Up -> Close to Week
        }
    };

    return (
        <div
            {...handlers}
            className="relative z-20"
            style={{
                borderBottomLeftRadius: '32px',
                borderBottomRightRadius: '32px',
                background: 'linear-gradient(135deg,rgb(51, 164, 79) 0%,rgb(65, 40, 204) 30%,rgb(212, 74, 166) 100%)',
                overflow: 'hidden',
                paddingBottom: '10px',
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
            }}
        >
            {/* Header Month/Year */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '12px 0 20px', position: 'relative' }}>
                {/* Navigation Arrows Absolute to stay out of center Text */}
                <button onClick={prev} style={{ position: 'absolute', left: '24px', padding: '8px', color: 'var(--color-text)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <ChevronLeft size={20} />
                </button>

                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', textTransform: 'capitalize', color: 'var(--color-text)' }}>
                    {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </h2>

                <button onClick={next} style={{ position: 'absolute', right: '24px', padding: '8px', color: 'var(--color-text)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Days Grid Wrapper with Framer Motion for smooth height resize */}
            <motion.div
                initial={false}
                animate={{ height: isWeekly ? 90 : 360 }} // Increased height slightly for bigger circles
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{ overflow: 'hidden' }}
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
                        {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => ( // US Format in screenshot? No, let's keep user locale order. Assuming standard Mon-Sun or Sun-Sat based on getDays.
                            // Actually getDays logic I wrote previously was adapting.
                            // Let's stick to Fr: L M M J V S D if that's what we did.
                            // Wait, previous file had L M M J... let's stick to that.
                            <div key={i} style={{ textAlign: 'center', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
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
                                    onClick={async () => {
                                        await setSelectedDate(date);
                                    }}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        height: '50px',
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
                                            // Logic for Circle Style
                                            background: hasEvent ? `url(${eventImage}) center/cover` : 'transparent',
                                            color: hasEvent ? 'white' : (isSelected ? 'var(--color-primary)' : 'rgba(255,255,255,0.9)'),

                                            // Selection Ring
                                            boxShadow: isSelected
                                                ? (hasEvent ? '0 0 0 3px var(--color-primary), 0 0 15px var(--color-primary)' : '0 0 15px var(--color-primary-dark)')
                                                : 'none',
                                            textShadow: hasEvent ? '0 1px 3px rgba(0,0,0,0.8)' : 'none',

                                            opacity: (!hasEvent && !isSelected) ? 0.7 : 1
                                        }}
                                    >
                                        { /* Overlay for readability if image */}
                                        {hasEvent && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)', borderRadius: '50%' }}></div>}

                                        <span style={{ position: 'relative', zIndex: 1 }}>{date.getDate()}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            {/* Pull Handle for Smooth Unfold - Draggable */}
            <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                onClick={toggleView}
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '2px 0',
                    cursor: 'grab',
                    touchAction: 'none'
                }}
                whileTap={{ cursor: 'grabbing' }}
            >
                {isWeekly ? (
                    <ChevronDown size={20} color="var(--color-text-muted)" />
                ) : (
                    <ChevronUp size={20} color="var(--color-text-muted)" />
                )}
            </motion.div>
        </div>
    );
};

export default CalendarStrip;
