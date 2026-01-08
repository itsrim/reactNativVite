import React from 'react';
import { useEvents, getDays } from '../context/EventContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useSwipe from '../hooks/useSwipe';
import { motion, AnimatePresence } from 'framer-motion';

const CalendarStrip = () => {
    const { selectedDate, setSelectedDate, eventCounts, hasEventOnDate } = useEvents();
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
            className="bg-white shadow-sm relative z-20"
            style={{
                borderBottomLeftRadius: '32px',
                borderBottomRightRadius: '32px',
                background: 'white',
                borderBottom: '1px solid #f4f4f5',
                overflow: 'hidden'
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 10px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', textTransform: 'capitalize', margin: 0 }}>
                    {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </h2>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', background: '#f4f4f5', borderRadius: '50px', padding: '4px' }}>
                        <button onClick={prev} style={{ padding: '8px', borderRadius: '50%', display: 'flex' }}><ChevronLeft size={18} /></button>
                        <button onClick={next} style={{ padding: '8px', borderRadius: '50%', display: 'flex' }}><ChevronRight size={18} /></button>
                    </div>
                </div>
            </div>

            {/* Days Grid Wrapper with Framer Motion for smooth height resize */}
            <motion.div
                initial={false}
                animate={{ height: isWeekly ? 80 : 340 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{
                    overflow: 'hidden',
                    padding: '0 8px'
                }}
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
                            rowGap: isWeekly ? '0' : '16px',
                            paddingTop: '10px'
                        }}
                    >
                        {/* Weekday Labels */}
                        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                            <div key={i} style={{ textAlign: 'center', fontSize: '10px', color: '#a1a1aa', fontWeight: 'bold', marginBottom: '8px' }}>
                                {d}
                            </div>
                        ))}

                        {days.map((date, index) => {
                            const isSelected = date.getDate() === selectedDate.getDate() &&
                                date.getMonth() === selectedDate.getMonth();
                            const isToday = date.getDate() === new Date().getDate() &&
                                date.getMonth() === new Date().getMonth();

                            const count = eventCounts[date.toDateString()] || 0;
                            const hasMyEvent = hasEventOnDate(date);

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
                                        width: '100%'
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '38px',
                                            height: '38px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '50%',
                                            fontSize: '15px',
                                            fontWeight: isSelected ? 'bold' : '500',
                                            background: isSelected ? 'var(--color-primary)' : 'transparent',
                                            color: isSelected ? 'white' : (isToday ? 'var(--color-primary)' : '#3f3f46'),
                                            boxShadow: isSelected ? '0 4px 10px rgba(99, 102, 241, 0.4)' : 'none',
                                            border: (!isSelected && isToday) ? '1px solid var(--color-primary)' : 'none',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {date.getDate()}
                                    </div>

                                    {/* Indicators */}
                                    <div style={{ display: 'flex', gap: '3px', marginTop: '6px', height: '4px', position: 'absolute', bottom: '0px' }}>
                                        {hasMyEvent && (
                                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#22c55e' }}></div>
                                        )}
                                        {!hasMyEvent && count > 0 && (
                                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#d4d4d8' }}></div>
                                        )}
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
                    padding: '12px 0 16px', // Increased touch area
                    cursor: 'grab',
                    touchAction: 'none' // Important for drag
                }}
                whileTap={{ cursor: 'grabbing' }}
            >
                <div style={{
                    width: '40px',
                    height: '5px',
                    background: '#e4e4e7',
                    borderRadius: '10px'
                }}
                />
            </motion.div>
        </div>
    );
};

export default CalendarStrip;
