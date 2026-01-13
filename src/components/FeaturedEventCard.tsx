import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CheckCircle2 } from 'lucide-react';
import { Event } from '../types';
import ParticipantStack from './ParticipantStack';
import { useTranslation } from 'react-i18next';

interface FeaturedEventCardProps {
    event: Event;
    backgroundColor?: string;
}

const FeaturedEventCard: React.FC<FeaturedEventCardProps> = ({
    event,
    backgroundColor = '#c2410c'
}) => {
    const navigate = useNavigate();
    const { i18n } = useTranslation();

    const formattedDate = {
        day: event.date.getDate(),
        month: event.date.toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { month: 'short' }),
        year: event.date.getFullYear()
    };

    return (
        <div
            onClick={() => navigate(`/event/${event.id}`)}
            style={{
                flexShrink: 0,
                width: '260px',
                height: '180px',
                background: backgroundColor,
                borderRadius: '32px',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Main Image as absolute background */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0
            }}>
                <img
                    src={event.image}
                    alt={event.title}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: 0.8
                    }}
                />
                {/* Gradient Overlay for Title readability */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '60%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)'
                }} />
            </div>

            {/* The "Encoche" (Date Notch) */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                background: 'white',
                padding: '8px 12px',
                borderBottomRightRadius: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '54px',
                color: '#1e293b',
                boxShadow: '2px 2px 10px rgba(0,0,0,0.1)',
                zIndex: 10
            }}>
                <span style={{ fontSize: '16px', fontWeight: '900', lineHeight: '1' }}>{formattedDate.day}</span>
                <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>{formattedDate.month}</span>
                <span style={{ fontSize: '10px', fontWeight: '700', opacity: 0.7 }}>{formattedDate.year}</span>
            </div>

            {/* Title Overlay in Image */}
            <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                right: '16px',
                zIndex: 5
            }}>
                <h3 style={{
                    fontSize: '18px',
                    fontWeight: '900',
                    lineHeight: '1.2',
                    margin: 0,
                    letterSpacing: '-0.3px',
                    color: 'white',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                    {event.title}
                </h3>
            </div>
        </div>
    );
};

export default FeaturedEventCard;
