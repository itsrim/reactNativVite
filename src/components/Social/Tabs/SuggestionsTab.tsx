import React, { CSSProperties } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { Heart, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BlurImage from '../../BlurImage';
import { SUGGESTIONS, Suggestion } from '../../../data/mockSuggestions';

interface SuggestionsTabProps {
    searchQuery: string;
    blurProfiles: boolean;
}

const SuggestionsTab: React.FC<SuggestionsTabProps> = ({ searchQuery, blurProfiles }) => {
    const navigate = useNavigate();

    // Fonction pour naviguer vers un profil (toujours accessible, mais infos floutées sur le profil si non-premium)
    const navigateToProfile = (userId: number) => {
        navigate(`/user/${userId}`);
    };

    const filteredSuggestions = SUGGESTIONS.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Render 2 items per row to simulate grid in Virtuoso
    const rows: Suggestion[][] = [];
    for (let i = 0; i < filteredSuggestions.length; i += 2) {
        rows.push([filteredSuggestions[i], filteredSuggestions[i + 1]]);
    }

    interface RowProps {
        index: number;
        style: CSSProperties;
    }

    const Row: React.FC<RowProps> = ({ index, style }) => {
        const items = rows[index];
        return (
            <div style={{ ...style, display: 'flex', gap: '16px', padding: '0 16px 16px' }}>
                {items.map((item, i) => item && (
                    <div
                        key={item.id}
                        onClick={() => navigateToProfile(item.id)}
                        style={{
                            flex: 1,
                            height: `${item.height}px`,
                            position: 'relative',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                            transform: `rotate(${item.rotation}deg)`,
                            marginTop: `${item.offset}px`,
                            cursor: 'pointer'
                        }}
                    >
                        {/* Image - toujours visible, jamais floutée */}
                        <div style={{
                            width: '100%',
                            height: '100%',
                            pointerEvents: 'none'
                        }}>
                            <BlurImage
                                src={item.image}
                                alt={item.name}
                            />
                        </div>

                        {/* Cadenas en haut à droite si non-premium */}
                        {blurProfiles && (
                            <div style={{
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                                background: 'rgba(0,0,0,0.5)',
                                backdropFilter: 'blur(5px)',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(255,255,255,0.2)',
                                pointerEvents: 'none'
                            }}>
                                <Lock size={14} color="#fbbf24" />
                            </div>
                        )}

                        {/* Coeur en haut à droite si premium */}
                        {!blurProfiles && (
                            <div style={{
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                                background: 'rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(5px)',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(255,255,255,0.3)',
                                pointerEvents: 'none'
                            }}>
                                <Heart size={16} color="white" />
                            </div>
                        )}

                        {/* Nom et âge - floutés si non-premium */}
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: '12px',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                            pointerEvents: 'none'
                        }}>
                            <h3 style={{
                                color: 'white',
                                fontWeight: '700',
                                fontSize: '16px',
                                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                filter: blurProfiles ? 'blur(6px)' : 'none',
                                userSelect: 'none'
                            }}>
                                {item.name}, {item.age}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Virtuoso
            style={{ height: '100%', paddingBottom: '100px' }}
            data={rows}
            itemContent={(index) => <Row index={index} style={{}} />}
        />
    );
};

export default SuggestionsTab;
