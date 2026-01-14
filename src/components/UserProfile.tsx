import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, ShieldCheck, Heart, Calendar, MessageCircle, Lock, Crown, UserCheck, Clock, UserMinus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import PageTransition from './PageTransition';
import BlurImage from './BlurImage';
import { useVisits, getUserData, CURRENT_USER_ID } from '../context/VisitContext';
import { useFeatureFlags } from '../context/FeatureFlagContext';
import { useFriends } from '../context/FriendContext';

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
    const { isPremium } = useFeatureFlags();
    const { 
        isFriend, 
        hasSentRequest, 
        sendFriendRequest,
        removeFriend,
        canSendRequest, 
        getRemainingRequestsToday 
    } = useFriends();
    
    const userId = parseInt(id || '0');
    const user = getFullUserData(userId);
    const isAlreadyFriend = isFriend(userId);
    const hasPendingRequest = hasSentRequest(userId);

    useEffect(() => {
        recordVisit(CURRENT_USER_ID, userId);
    }, [userId, recordVisit]);

    const handleAddFriend = () => {
        // Vérifier si premium
        if (!isPremium) {
            // Vérifier la limite journalière
            if (!canSendRequest(false)) {
                toast.error(
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Crown size={18} color="#fbbf24" />
                        <span>{t('friends.dailyLimitReached', 'Limite atteinte ! Passez Premium pour ajouter plus d\'amis')}</span>
                    </div>
                );
                return;
            }
        }

        const success = sendFriendRequest(userId);
        if (success) {
            toast.success(t('friends.requestSent', 'Demande d\'ami envoyée !'));
        }
    };

    const handleRemoveFriend = () => {
        removeFriend(userId);
        toast.info(t('friends.removed', 'Ami retiré'));
    };

    const handleMessage = () => {
        // Il faut être amis mutuellement pour discuter
        if (!isAlreadyFriend) {
            toast.error(
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Lock size={18} color="#ef4444" />
                    <span>{t('friends.mustBeFriends', 'Vous devez être amis pour discuter')}</span>
                </div>
            );
            return;
        }
        navigate(`/chat/${userId}`);
    };
    
    // Le bouton message est actif seulement si amis mutuels
    const canMessage = isAlreadyFriend;

    // Détermine si les infos doivent être floutées (non-premium)
    const shouldBlur = !isPremium;

    return (
        <PageTransition>
            <div style={{ padding: '16px', paddingBottom: '96px' }}>
                {/* Photo et infos */}
                <div style={{
                    position: 'relative',
                    height: '320px',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    marginBottom: '20px'
                }}>
                    {/* Photo - jamais floutée */}
                    <BlurImage src={user.image} alt={user.name} />
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.7) 100%)'
                    }} />

                    {/* Bouton retour en haut à gauche sur la photo */}
                    <button 
                        onClick={() => navigate(-1)}
                        style={{ 
                            position: 'absolute',
                            top: '16px',
                            left: '16px',
                            background: 'rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(5px)',
                            border: 'none', 
                            cursor: 'pointer', 
                            color: 'white',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10
                        }}
                    >
                        <ArrowLeft size={22} />
                    </button>

                    {/* Cadenas si non-premium */}
                    {shouldBlur && (
                        <div style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            background: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(5px)',
                            borderRadius: '12px',
                            padding: '8px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <Lock size={14} color="#fbbf24" />
                            <span style={{ color: '#fbbf24', fontSize: '12px', fontWeight: '600' }}>Premium</span>
                        </div>
                    )}

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
                            marginBottom: '4px',
                            filter: shouldBlur ? 'blur(8px)' : 'none',
                            userSelect: shouldBlur ? 'none' : 'auto'
                        }}>
                            {user.name}, {user.age}
                        </h1>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            filter: shouldBlur ? 'blur(6px)' : 'none'
                        }}>
                            <ShieldCheck size={16} color="#22c55e" />
                            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
                                {t('profile.verified')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bio - floutée si non-premium */}
                <div className="card" style={{ 
                    padding: '16px', 
                    marginBottom: '16px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <p style={{ 
                        color: 'var(--color-text)', 
                        fontSize: '14px', 
                        lineHeight: '1.6',
                        filter: shouldBlur ? 'blur(6px)' : 'none',
                        userSelect: shouldBlur ? 'none' : 'auto'
                    }}>
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
                        fontSize: '12px',
                        filter: shouldBlur ? 'blur(4px)' : 'none'
                    }}>
                        <Calendar size={12} />
                        {t('profile.memberSince', { year: user.memberSince })}
                    </div>
                    {shouldBlur && (
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(var(--color-surface-rgb), 0.3)'
                        }}>
                            <div style={{
                                background: 'var(--color-surface)',
                                borderRadius: '12px',
                                padding: '8px 16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}>
                                <Lock size={14} color="#fbbf24" />
                                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text)' }}>
                                    {t('premium.unlockWithPremium', 'Débloquez avec Premium')}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats - floutées si non-premium */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', position: 'relative' }}>
                    <div className="card" style={{ flex: 1, padding: '16px', textAlign: 'center' }}>
                        <div style={{ 
                            fontSize: '24px', 
                            fontWeight: '800', 
                            color: 'var(--color-primary)',
                            filter: shouldBlur ? 'blur(6px)' : 'none'
                        }}>
                            {user.reliability.toFixed(1)}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{t('profile.reliability')}</div>
                    </div>
                    <div className="card" style={{ flex: 1, padding: '16px', textAlign: 'center' }}>
                        <div style={{ 
                            fontSize: '24px', 
                            fontWeight: '800', 
                            color: 'var(--color-primary)',
                            filter: shouldBlur ? 'blur(6px)' : 'none'
                        }}>
                            {user.events}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{t('profile.events')}</div>
                    </div>
                    <div className="card" style={{ flex: 1, padding: '16px', textAlign: 'center' }}>
                        <div style={{ 
                            fontSize: '24px', 
                            fontWeight: '800', 
                            color: 'var(--color-primary)',
                            filter: shouldBlur ? 'blur(6px)' : 'none'
                        }}>
                            {user.friends}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{t('profile.friends')}</div>
                    </div>
                </div>

                {/* Badges - floutés si non-premium */}
                <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: '700', 
                    color: 'var(--color-text)',
                    marginBottom: '12px'
                }}>
                    {t('profile.badges')}
                </h3>
                <div style={{ 
                    display: 'flex', 
                    gap: '10px', 
                    flexWrap: 'wrap', 
                    marginBottom: '24px',
                    filter: shouldBlur ? 'blur(6px)' : 'none'
                }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Bouton Message */}
                    {isAlreadyFriend ? (
                        // Amis mutuels → bouton actif
                        <button 
                            type="button"
                            onClick={handleMessage}
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                border: 'none',
                                color: 'white',
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
                    ) : (
                        // Pas amis → bouton désactivé avec explication
                        <button 
                            disabled
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: '16px',
                                background: 'rgba(0,0,0,0.05)',
                                border: '1px solid var(--color-border)',
                                color: 'var(--color-text-muted)',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                opacity: 0.7
                            }}
                        >
                            <Clock size={16} />
                            {hasPendingRequest 
                                ? t('friends.messageWaitingMutual', 'Message - En attente d\'amitié mutuelle')
                                : t('friends.messageNeedFriend', 'Message - Ajoutez en ami d\'abord')
                            }
                        </button>
                    )}

                    {/* Bouton Ami */}
                    {isAlreadyFriend ? (
                        // Déjà amis → bouton retirer
                        <button 
                            onClick={handleRemoveFriend}
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: '16px',
                                background: 'var(--color-surface)',
                                color: '#ef4444',
                                border: '1px solid #ef4444',
                                fontSize: '15px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}>
                            <UserMinus size={18} />
                            {t('friends.removeFriend', 'Retirer des amis')}
                        </button>
                    ) : hasPendingRequest ? (
                        // Demande envoyée → en attente
                        <button 
                            disabled
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                color: 'white',
                                border: 'none',
                                fontSize: '15px',
                                fontWeight: '700',
                                cursor: 'default',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}>
                            <Clock size={18} />
                            {t('friends.requestSentWaiting', 'Demande d\'ami envoyée')}
                        </button>
                    ) : (
                        <button 
                            onClick={handleAddFriend}
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: '16px',
                                background: isPremium || canSendRequest(false) 
                                    ? 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)'
                                    : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                                color: 'white',
                                border: 'none',
                                fontSize: '15px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                position: 'relative'
                            }}
                        >
                            <Heart size={18} />
                            {t('profile.addFriend')}
                            {!isPremium && !canSendRequest(false) && (
                                <Crown size={14} color="#fbbf24" style={{ position: 'absolute', top: 8, right: 8 }} />
                            )}
                        </button>
                    )}
                </div>

                {/* Indication limite journalière pour non-premium */}
                {!isPremium && !isAlreadyFriend && !hasPendingRequest && (
                    <div style={{
                        marginTop: '12px',
                        padding: '10px 16px',
                        background: 'rgba(251, 191, 36, 0.1)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}>
                        <Crown size={14} color="#fbbf24" />
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                            {getRemainingRequestsToday(false) > 0 
                                ? t('friends.remainingToday', { count: getRemainingRequestsToday(false) })
                                : t('friends.noMoreToday', 'Revenez demain ou passez Premium')
                            }
                        </span>
                    </div>
                )}
            </div>
        </PageTransition>
    );
};

export default UserProfile;
