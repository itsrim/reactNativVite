import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, ShieldCheck, Heart, Calendar, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageTransition from './PageTransition';
import BlurImage from './BlurImage';
import { useVisits, getUserData, CURRENT_USER_ID } from '../context/VisitContext';

const BIOS = [
    "Passionné(e) de randonnée et de photographie. Toujours partant(e) pour de nouvelles aventures !",
    "Amateur de musique et de concerts. On se retrouve au prochain festival ?",
    "Yoga, méditation et brunchs le dimanche. Namaste 🧘",
    "Foodie assumé(e). Toujours à la recherche du meilleur resto !",
    "Fan de sport et de sorties entre amis. La vie est trop courte pour rester chez soi !",
    "Passionné(e) d'art et de culture. Musées, expos, théâtre... je suis partant(e) !",
    "Amoureux(se) de la nature et des animaux. Promenades et pique-niques sont ma spécialité.",
    "Cinéphile et amateur de séries. Netflix and chill ? 🎬",
    "Voyageur(se) dans l'âme. Toujours à la recherche de nouvelles découvertes.",
    "Gamer et geek assumé(e). Let's play ! 🎮"
];

const BADGES_LIST = [
    ['Ponctuel(le)', 'Amical(e)', 'Explorateur(trice)'],
    ['Organisateur(trice)', 'Ponctuel(le)', 'Top Contributeur(trice)'],
    ['Zen', 'Amical(e)', 'Bienveillant(e)'],
    ['Gourmet', 'Ponctuel(le)', 'VIP'],
    ['Sportif(ve)', 'Dynamique', 'Motivé(e)'],
    ['Cultivé(e)', 'Curieux(se)', 'Ouvert(e)'],
    ['Nature', 'Calme', 'Attentionné(e)'],
    ['Cinéphile', 'Créatif(ve)'],
    ['Aventurier(ère)', 'Spontané(e)', 'Fun'],
    ['Geek', 'Passionné(e)', 'Cool']
];

const getFullUserData = (userId: number) => {
    const baseData = getUserData(userId);
    const bio = BIOS[userId % BIOS.length];
    const events = 5 + (userId % 50);
    const friends = 10 + (userId % 150);
    const reliability = 4.0 + ((userId % 10) / 10);
    const badges = BADGES_LIST[userId % BADGES_LIST.length];
    const memberSince = 2022 + (userId % 4);
    
    return { ...baseData, bio, events, friends, reliability, badges, memberSince: memberSince.toString() };
};

const UserProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { recordVisit } = useVisits();
    const userId = parseInt(id || '0');
    const user = getFullUserData(userId);

    useEffect(() => {
        recordVisit(CURRENT_USER_ID, userId);
    }, [userId, recordVisit]);

    return (
        <PageTransition>
            <div style={{ padding: '16px', paddingBottom: '96px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <button 
                        onClick={() => navigate(-1)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)' }}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 style={{ fontWeight: '700', fontSize: '20px', color: 'var(--color-text)' }}>{t('profile.title')}</h1>
                </div>

                {/* Photo et infos */}
                <div style={{
                    position: 'relative',
                    height: '280px',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    marginBottom: '20px'
                }}>
                    <BlurImage src={user.image} alt={user.name} />
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.7) 100%)'
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '20px',
                        right: '20px'
                    }}>
                        <h1 style={{ 
                            color: 'white', 
                            fontSize: '28px', 
                            fontWeight: '800',
                            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                            marginBottom: '4px'
                        }}>
                            {user.name}, {user.age}
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShieldCheck size={16} color="#22c55e" />
                            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
                                {t('profile.verified')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bio */}
                <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
                    <p style={{ color: 'var(--color-text)', fontSize: '14px', lineHeight: '1.6' }}>
                        {user.bio}
                    </p>
                    <div style={{ 
                        marginTop: '12px', 
                        paddingTop: '12px', 
                        borderTop: '1px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'var(--color-text-muted)',
                        fontSize: '12px'
                    }}>
                        <Calendar size={12} />
                        {t('profile.memberSince', { year: user.memberSince })}
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                    <div className="card" style={{ flex: 1, padding: '16px', textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-primary)' }}>
                            {user.reliability.toFixed(1)}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{t('profile.reliability')}</div>
                    </div>
                    <div className="card" style={{ flex: 1, padding: '16px', textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-primary)' }}>
                            {user.events}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{t('profile.events')}</div>
                    </div>
                    <div className="card" style={{ flex: 1, padding: '16px', textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-primary)' }}>
                            {user.friends}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{t('profile.friends')}</div>
                    </div>
                </div>

                {/* Badges */}
                <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: '700', 
                    color: 'var(--color-text)',
                    marginBottom: '12px'
                }}>
                    {t('profile.badges')}
                </h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
                    {user.badges.map((badge, i) => (
                        <div key={i} className="card" style={{ 
                            padding: '8px 14px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px'
                        }}>
                            <Award size={14} color="#eab308" />
                            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>
                                {badge}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        onClick={() => navigate(`/chat/${userId}`)}
                        style={{
                            flex: 1,
                            padding: '14px',
                            borderRadius: '16px',
                            background: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text)',
                            fontSize: '15px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <MessageCircle size={18} />
                        {t('profile.message')}
                    </button>
                    <button style={{
                        flex: 1,
                        padding: '14px',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
                        color: 'white',
                        border: 'none',
                        fontSize: '15px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}>
                        <Heart size={18} />
                        {t('profile.addFriend')}
                    </button>
                </div>
            </div>
        </PageTransition>
    );
};

export default UserProfile;
