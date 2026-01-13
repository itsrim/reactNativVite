import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../context/EventContext';
import { useFeatureFlags } from '../context/FeatureFlagContext';
import { ArrowLeft, Image as ImageIcon, Users, Lock, MapPin, EyeOff, UserCheck, Calendar, Clock, FileText, Sparkles } from 'lucide-react';
import PageTransition from './PageTransition';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface FormData {
    title: string;
    date: string;
    time: string;
    location: string;
    description: string;
    maxAttendees: number;
    hideAddressUntilRegistered: boolean;
    requireManualApproval: boolean;
}

const CreateEvent: React.FC = () => {
    const navigate = useNavigate();
    const { addEvent, events } = useEvents();
    const { isRestricted, getLimits } = useFeatureFlags();

    const limits = getLimits();
    const limitEventCreation = isRestricted('limitEventCreation');
    const limitParticipants = isRestricted('limitParticipants');

    const today = new Date();
    const myActiveEvents = events.filter(e => e.isOrganizer && e.date >= today);
    const canCreateEvent = !limitEventCreation || myActiveEvents.length < limits.maxActiveEvents;
    const maxParticipantsAllowed = limits.maxParticipants;

    const [formData, setFormData] = useState<FormData>({
        title: '',
        date: new Date().toISOString().split('T')[0],
        time: '19:00',
        location: '',
        description: '',
        maxAttendees: Math.min(20, maxParticipantsAllowed),
        hideAddressUntilRegistered: false,
        requireManualApproval: false
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();

        if (!canCreateEvent) {
            toast.error("Limite atteinte ! Passez en Premium pour créer plus d'événements.");
            return;
        }

        const newEvent = {
            title: formData.title,
            date: new Date(formData.date),
            time: formData.time,
            location: formData.location || 'Lieu secret',
            description: formData.description,
            maxAttendees: Math.min(formData.maxAttendees || 20, maxParticipantsAllowed),
            hideAddressUntilRegistered: formData.hideAddressUntilRegistered
        };

        addEvent(newEvent);
        toast.success("Événement créé avec succès ! 🎉");
        navigate('/');
    };

    // Toggle component réutilisable
    const ToggleOption = ({
        icon: Icon,
        iconActive: IconActive,
        title,
        description,
        descriptionActive,
        isActive,
        onToggle,
        color = '#3b82f6'
    }: {
        icon: React.ElementType;
        iconActive?: React.ElementType;
        title: string;
        description: string;
        descriptionActive?: string;
        isActive: boolean;
        onToggle: () => void;
        color?: string;
    }) => (
        <motion.div
            onClick={onToggle}
            whileTap={{ scale: 0.98 }}
            style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '16px',
                background: isActive ? `${color}10` : 'var(--color-surface)',
                borderRadius: '16px',
                border: `1px solid ${isActive ? color : 'var(--color-border)'}`,
                transition: 'all 0.2s'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: isActive ? color : 'rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                }}>
                    {isActive && IconActive ? (
                        <IconActive size={22} color="white" />
                    ) : (
                        <Icon size={22} color={isActive ? 'white' : '#9ca3af'} />
                    )}
                </div>
                <div>
                    <div style={{ fontWeight: '600', fontSize: '15px', color: 'var(--color-text)' }}>
                        {title}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        {isActive && descriptionActive ? descriptionActive : description}
                    </div>
                </div>
            </div>
            <div style={{
                width: '48px',
                height: '28px',
                borderRadius: '14px',
                background: isActive ? color : '#d1d5db',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
                transition: 'background 0.2s',
                flexShrink: 0
            }}>
                <motion.div
                    animate={{ x: isActive ? 20 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'white',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                    }}
                />
            </div>
        </motion.div>
    );

    return (
        <PageTransition>
            <div style={{
                minHeight: '100vh',
                background: 'var(--color-background)',
                paddingBottom: '100px'
            }}>
                {/* Header with gradient */}
                <div style={{
                    position: 'sticky',
                    top: 0,
                    left: 0,
                    right: 0,
                    flexShrink: 0,
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f472b6 100%)',
                    padding: '20px 20px 24px',
                    borderBottomLeftRadius: '28px',
                    borderBottomRightRadius: '28px',
                    boxShadow: '0 10px 30px rgba(244, 114, 182, 0.3)',
                    zIndex: 100,
                    marginBottom: '20px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button
                            onClick={() => navigate(-1)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                padding: '8px'
                            }}
                        >
                            <ArrowLeft size={24} color="#1f2937" />
                        </button>
                        <div>
                            <h1 style={{
                                fontWeight: '800',
                                fontSize: '24px',
                                color: '#1f2937',
                                margin: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <Sparkles size={24} />
                                Créer un événement
                            </h1>
                            <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.6)', margin: '4px 0 0' }}>
                                Partagez un moment unique
                            </p>
                        </div>
                    </div>
                </div>

                {/* Alertes */}
                {!canCreateEvent && (
                    <div style={{
                        background: '#fef3c7',
                        border: '1px solid #fbbf24',
                        borderRadius: '16px',
                        padding: '16px',
                        margin: '0 20px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <Lock size={24} color="#f59e0b" />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '700', color: '#92400e', marginBottom: '4px' }}>
                                Limite atteinte
                            </div>
                            <div style={{ fontSize: '13px', color: '#a16207' }}>
                                Vous avez déjà {myActiveEvents.length} événement(s) actif(s).
                            </div>
                        </div>
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    style={{
                        padding: '0 20px',
                        opacity: canCreateEvent ? 1 : 0.5,
                        pointerEvents: canCreateEvent ? 'auto' : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px'
                    }}
                >
                    {/* Photo upload */}
                    <motion.div
                        whileTap={{ scale: 0.98 }}
                        style={{
                            height: '160px',
                            border: '2px dashed var(--color-border)',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            background: 'var(--color-surface)',
                            transition: 'all 0.2s'
                        }}
                    >
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <ImageIcon size={28} color="white" />
                        </div>
                        <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-text-muted)' }}>
                            Ajouter une photo
                        </span>
                    </motion.div>

                    {/* Titre */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileText size={16} />
                            Titre de l'événement
                        </label>
                        <input
                            required
                            value={formData.title}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Ex: Soirée Pizza entre amis"
                            style={{
                                padding: '16px',
                                borderRadius: '14px',
                                border: '1px solid var(--color-border)',
                                background: 'var(--color-surface)',
                                fontSize: '16px',
                                color: 'var(--color-text)',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Date & Heure */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Calendar size={16} />
                                Date
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, date: e.target.value })}
                                style={{
                                    padding: '16px',
                                    borderRadius: '14px',
                                    border: '1px solid var(--color-border)',
                                    background: 'var(--color-surface)',
                                    fontSize: '15px',
                                    color: 'var(--color-text)',
                                    outline: 'none',
                                    colorScheme: 'dark'
                                }}
                            />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Clock size={16} />
                                Heure
                            </label>
                            <input
                                type="time"
                                required
                                value={formData.time}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, time: e.target.value })}
                                style={{
                                    padding: '16px',
                                    borderRadius: '14px',
                                    border: '1px solid var(--color-border)',
                                    background: 'var(--color-surface)',
                                    fontSize: '15px',
                                    color: 'var(--color-text)',
                                    outline: 'none',
                                    colorScheme: 'dark'
                                }}
                            />
                        </div>
                    </div>

                    {/* Lieu & Max */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MapPin size={16} />
                                Lieu
                            </label>
                            <input
                                value={formData.location}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="Ex: Parc Monceau"
                                style={{
                                    padding: '16px',
                                    borderRadius: '14px',
                                    border: '1px solid var(--color-border)',
                                    background: 'var(--color-surface)',
                                    fontSize: '15px',
                                    color: 'var(--color-text)',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <div style={{ width: '100px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Users size={16} />
                                Max
                                {limitParticipants && <Lock size={12} color="#f59e0b" />}
                            </label>
                            <input
                                type="number"
                                min="1"
                                max={maxParticipantsAllowed}
                                value={formData.maxAttendees}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, maxAttendees: Math.min(parseInt(e.target.value) || 1, maxParticipantsAllowed) })}
                                style={{
                                    padding: '16px',
                                    borderRadius: '14px',
                                    border: '1px solid var(--color-border)',
                                    background: 'var(--color-surface)',
                                    fontSize: '15px',
                                    color: 'var(--color-text)',
                                    outline: 'none',
                                    textAlign: 'center'
                                }}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text)' }}>
                            Description
                        </label>
                        <textarea
                            rows={4}
                            value={formData.description}
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Décrivez votre événement..."
                            style={{
                                padding: '16px',
                                borderRadius: '14px',
                                border: '1px solid var(--color-border)',
                                background: 'var(--color-surface)',
                                fontSize: '15px',
                                color: 'var(--color-text)',
                                outline: 'none',
                                resize: 'none',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>

                    {/* Options Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Options
                        </h3>

                        {/* Toggle: Masquer l'adresse */}
                        <ToggleOption
                            icon={MapPin}
                            iconActive={EyeOff}
                            title="Masquer l'adresse"
                            description="Adresse visible par tous"
                            descriptionActive="Visible uniquement pour les inscrits"
                            isActive={formData.hideAddressUntilRegistered}
                            onToggle={() => setFormData({ ...formData, hideAddressUntilRegistered: !formData.hideAddressUntilRegistered })}
                            color="#f59e0b"
                        />

                        {/* Toggle: Validation manuelle */}
                        <ToggleOption
                            icon={Users}
                            iconActive={UserCheck}
                            title="Validation manuelle"
                            description="Inscriptions automatiques"
                            descriptionActive="Vous validez chaque participant"
                            isActive={formData.requireManualApproval}
                            onToggle={() => setFormData({ ...formData, requireManualApproval: !formData.requireManualApproval })}
                            color="#8b5cf6"
                        />
                    </div>

                    {/* Submit button */}
                    <motion.button
                        type="submit"
                        whileTap={{ scale: 0.98 }}
                        style={{
                            marginTop: '12px',
                            padding: '18px',
                            borderRadius: '16px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
                            color: 'white',
                            fontSize: '17px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)'
                        }}
                    >
                        ✨ Publier l'événement
                    </motion.button>
                </form>
            </div>
        </PageTransition>
    );
};

export default CreateEvent;
