import React from 'react';
import { Virtuoso } from 'react-virtuoso';
import { MessageCircle, Heart, Search } from 'lucide-react';
import PageTransition from './PageTransition';
import { useNavigate } from 'react-router-dom';

const FRIENDS = [
    { id: 1, name: 'Hanna', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', msg: 2 },
    { id: 2, name: 'Sara', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80', msg: 0 },
    { id: 3, name: 'Georgie', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80', msg: 5 },
    { id: 4, name: 'Britney', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80', msg: 1 },
    { id: 5, name: 'Mike', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', msg: 0 },
    { id: 6, name: 'Josh', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80', msg: 3 },
    { id: 7, name: 'Emma', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', msg: 0 },
];

const SUGGESTIONS = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    name: ['Maya', 'Nancy', 'Kat', 'Stacey', 'Zoe', 'Lily', 'Rose'][i % 7],
    age: 20 + (i % 10),
    image: [
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1516726817505-f5ed825b05a8?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80'
    ][i % 6],
    height: i % 2 === 0 ? 280 : 220,
    rotation: (Math.random() - 0.5) * 12, // Random rotation between -6 and 6 degrees
    offset: Math.random() * 40 // Random top offset between 0 and 40px
}));

const MESSAGES = [
    { id: 1, name: 'Peggie', age: 23, message: 'That sounds like a lot of fun! Would you like...', time: '5 mins', unread: true, image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80' },
    { id: 2, name: 'Eve', age: 22, message: "I'm good! Thanks", time: '38 mins', unread: false, image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80' },
    { id: 3, name: 'Sofi', age: 26, message: 'Yes, it works for me! See you!', time: '2 hrs', unread: true, image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=150&q=80' },
    { id: 4, name: 'Rachel', age: 23, message: 'Yeah!', time: '8 hrs', unread: false, image: 'https://images.unsplash.com/photo-1516726817505-f5ed825b05a8?auto=format&fit=crop&w=150&q=80' },
    { id: 5, name: 'Roberta', age: 25, message: 'How are you doing?', time: '2 days', unread: false, image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150&q=80' },
    { id: 6, name: 'Rosella', age: 21, message: 'Maybe tomorrow?', time: 'Last week', unread: true, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' },
];

const SocialPage = () => {
    const [activeTab, setActiveTab] = React.useState('suggestions');

    // Render 2 items per row to simulate grid in Virtuoso
    const rows = [];
    for (let i = 0; i < SUGGESTIONS.length; i += 2) {
        rows.push([SUGGESTIONS[i], SUGGESTIONS[i + 1]]);
    }

    const Row = ({ index, style }) => {
        const items = rows[index];
        return (
            <div style={{ ...style, display: 'flex', gap: '16px', padding: '0 16px 16px' }}>
                {items.map((item, i) => item && (
                    <div
                        key={item.id}
                        style={{
                            flex: 1,
                            height: `${item.height}px`,
                            position: 'relative',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                            transform: `rotate(${item.rotation}deg)`,
                            marginTop: `${item.offset}px`,
                        }}
                    >
                        <img
                            src={item.image}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
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
                            border: '1px solid rgba(255,255,255,0.3)'
                        }}>
                            <Heart size={16} color="white" />
                        </div>
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: '12px',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)'
                        }}>
                            <h3 style={{ color: 'white', fontWeight: '700', fontSize: '16px', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                                {item.name}, {item.age}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <PageTransition>
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'white' }}>

                {/* Header */}
                <div style={{ padding: '24px 24px 0', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h1 style={{ fontSize: '28px', fontWeight: '800' }}>Amitié</h1>
                        <button style={{
                            width: '44px', height: '44px',
                            borderRadius: '50%', background: '#f3f4f6',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: 'none'
                        }}>
                            <Search size={22} color="#1f2937" />
                        </button>
                    </div>

                    {/* Friends Horizontal Scroll */}
                    <div style={{
                        display: 'flex',
                        gap: '20px',
                        overflowX: 'auto',
                        paddingBottom: '16px',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                    }}>
                        {FRIENDS.map(friend => (
                            <div key={friend.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                <div style={{ position: 'relative' }}>
                                    <div style={{
                                        width: '64px', height: '64px',
                                        borderRadius: '50%',
                                        padding: '2px',
                                        background: friend.msg > 0 ? 'linear-gradient(45deg, #f97316, #ec4899)' : 'transparent'
                                    }}>
                                        <img
                                            src={friend.image}
                                            alt={friend.name}
                                            style={{
                                                width: '100%', height: '100%',
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                border: '2px solid white'
                                            }}
                                        />
                                    </div>
                                    {friend.msg > 0 && (
                                        <div style={{
                                            position: 'absolute', bottom: '0', right: '0',
                                            background: '#ef4444', color: 'white',
                                            fontSize: '10px', fontWeight: 'bold',
                                            width: '20px', height: '20px',
                                            borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            border: '2px solid white'
                                        }}>
                                            {friend.msg}
                                        </div>
                                    )}
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>{friend.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div style={{ flex: 1, background: '#f9fafb', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                    {/* Data Tabs */}
                    <div style={{ padding: '24px 24px 16px', display: 'flex', gap: '24px' }}>
                        <button
                            onClick={() => setActiveTab('suggestions')}
                            style={{
                                background: 'transparent', border: 'none', padding: 0,
                                fontSize: '18px', fontWeight: activeTab === 'suggestions' ? '800' : '600',
                                color: activeTab === 'suggestions' ? '#111827' : '#9ca3af',
                                transition: 'color 0.2s'
                            }}
                        >
                            Suggestions
                        </button>
                        <button
                            onClick={() => setActiveTab('messages')}
                            style={{
                                background: 'transparent', border: 'none', padding: 0,
                                fontSize: '18px', fontWeight: activeTab === 'messages' ? '800' : '600',
                                color: activeTab === 'messages' ? '#111827' : '#9ca3af',
                                transition: 'color 0.2s',
                                display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                        >
                            Messages
                            <span style={{
                                background: '#ef4444', color: 'white',
                                fontSize: '12px', fontWeight: 'bold',
                                padding: '2px 8px', borderRadius: '12px',
                            }}>3</span>
                        </button>
                    </div>

                    {/* Content Switcher */}
                    <div style={{ flex: 1, position: 'relative' }}>
                        {activeTab === 'suggestions' ? (
                            <Virtuoso
                                style={{ height: '100%', paddingBottom: '100px' }}
                                data={rows}
                                itemContent={(index) => <Row index={index} style={{}} />}
                            />
                        ) : (
                            <div style={{ padding: '0 24px 100px', overflowY: 'auto', height: '100%' }}>
                                {MESSAGES.map(msg => (
                                    <div key={msg.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', cursor: 'pointer' }}>
                                        <div style={{ position: 'relative' }}>
                                            <img
                                                src={msg.image}
                                                alt={msg.name}
                                                style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
                                            />
                                            {msg.unread && (
                                                <div style={{
                                                    position: 'absolute', bottom: '2px', right: '2px',
                                                    width: '12px', height: '12px',
                                                    background: '#10b981',
                                                    borderRadius: '50%',
                                                    border: '2px solid white'
                                                }}></div>
                                            )}
                                        </div>
                                        <div style={{ flex: 1, paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>
                                                    {msg.name}, {msg.age}
                                                    {msg.unread && <span style={{ marginLeft: '6px', color: '#f97316', fontSize: '20px', lineHeight: 0 }}>•</span>}
                                                </h3>
                                                <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>{msg.time}</span>
                                            </div>
                                            <p style={{
                                                fontSize: '14px',
                                                color: msg.unread ? '#374151' : '#9ca3af',
                                                fontWeight: msg.unread ? '600' : '400',
                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px'
                                            }}>
                                                {msg.message}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default SocialPage;
