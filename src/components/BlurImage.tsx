import React, { useState, CSSProperties, ImgHTMLAttributes } from 'react';

interface BlurImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'style'> {
    src: string;
    alt: string;
    style?: CSSProperties;
    className?: string;
}

/**
 * BlurImage - Affiche un placeholder flouté immédiatement,
 * puis révèle l'image une fois chargée avec une transition douce.
 */
const BlurImage: React.FC<BlurImageProps> = ({ 
    src, 
    alt, 
    style = {}, 
    className = '',
    ...props 
}) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div 
            style={{ 
                position: 'relative', 
                overflow: 'hidden',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #1f1f23 0%, #2d2a3e 50%, #1f1f23 100%)',
                ...style 
            }}
            className={className}
        >
            {/* Shimmer animation - visible tant que l'image n'est pas chargée */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.15) 50%, transparent 100%)',
                    backgroundSize: '200% 100%',
                    animation: isLoaded ? 'none' : 'shimmer 1.2s ease-in-out infinite',
                    zIndex: 2,
                    opacity: isLoaded ? 0 : 1,
                    transition: 'opacity 0.3s ease-out'
                }}
            />

            {/* Image avec transition */}
            <img
                src={src}
                alt={alt}
                onLoad={() => setIsLoaded(true)}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: isLoaded ? 1 : 0,
                    transform: isLoaded ? 'scale(1)' : 'scale(1.05)',
                    filter: isLoaded ? 'blur(0px)' : 'blur(10px)',
                    transition: 'opacity 0.4s ease-out, transform 0.4s ease-out, filter 0.4s ease-out',
                }}
                {...props}
            />

            <style>{`
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
};

export default BlurImage;

