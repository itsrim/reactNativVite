import React from 'react';

interface ParticipantStackProps {
    images: string[];
    totalAttendees: number;
    maxVisible?: number;
    size?: number;
    overlap?: number;
}

const ParticipantStack: React.FC<ParticipantStackProps> = ({
    images,
    totalAttendees,
    maxVisible = 3,
    size = 24,
    overlap = 10
}) => {
    if (!images || images.length === 0) return null;

    const visibleImages = images.slice(0, maxVisible);
    const hasMore = totalAttendees > maxVisible;

    return (
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            {visibleImages.map((img, i) => (
                <div
                    key={i}
                    style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        borderRadius: '50%',
                        border: '2px solid var(--color-surface)',
                        overflow: 'hidden',
                        marginLeft: i === 0 ? 0 : `-${overlap}px`,
                        zIndex: maxVisible - i,
                        background: 'var(--color-surface-hover)'
                    }}
                >
                    <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={`Participant ${i + 1}`} />
                </div>
            ))}
            {hasMore && (
                <div style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    borderRadius: '50%',
                    background: 'var(--color-surface-hover)',
                    border: '2px solid var(--color-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: size * 0.4,
                    fontWeight: '800',
                    marginLeft: `-${overlap}px`,
                    zIndex: 0,
                    color: 'var(--color-text)'
                }}>
                    +
                </div>
            )}
        </div>
    );
};

export default ParticipantStack;
