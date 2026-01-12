import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../context/EventContext';
import { useFeatureFlags } from '../context/FeatureFlagContext';
import { ArrowLeft, Image as ImageIcon, Users, Lock, MapPin, EyeOff } from 'lucide-react';
import PageTransition from './PageTransition';
import { toast } from 'sonner';

interface FormData {
    title: string;
    date: string;
    time: string;
    location: string;
    description: string;
    maxAttendees: number;
    hideAddressUntilRegistered: boolean;
}

const CreateEvent: React.FC = () => {
    const navigate = useNavigate();
    const { addEvent, events } = useEvents();
    const { isRestricted, getLimits, isPremium } = useFeatureFlags();
    
    const limits = getLimits();
    const limitEventCreation = isRestricted('limitEventCreation');
    const limitParticipants = isRestricted('limitParticipants');
    
    // Vérifier si l'utilisateur a déjà un événement actif (organisateur)
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
        hideAddressUntilRegistered: false
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        
        if (!canCreateEvent) {
            toast.error("Limite atteinte ! Passez en Premium pour créer plus d'événements.");
            return;
        }
        
        // Create new event object
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

    return (
        <PageTransition>
            <div className="p-4 pb-24">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => navigate(-1)}><ArrowLeft size={24} /></button>
                    <h1 className="font-bold text-xl">Créer un événement</h1>
                </div>

                {/* Alerte si limite atteinte */}
                {!canCreateEvent && (
                    <div style={{
                        background: '#fef3c7',
                        border: '1px solid #fbbf24',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '16px',
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
                                Passez en Premium pour en créer plus.
                            </div>
                        </div>
                    </div>
                )}

                {/* Info limite participants */}
                {limitParticipants && (
                    <div style={{
                        background: '#f3f4f6',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '13px',
                        color: 'var(--color-text-muted)'
                    }}>
                        <Users size={16} />
                        <span>Limite de <strong>{maxParticipantsAllowed}</strong> participants max (Premium: 20)</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{ opacity: canCreateEvent ? 1 : 0.5, pointerEvents: canCreateEvent ? 'auto' : 'none' }}>
                    <div
                        className="card flex items-center justify-center text-muted"
                        style={{ height: '150px', border: '2px dashed var(--color-border)', cursor: 'pointer' }}
                    >
                        <div className="flex flex-col items-center gap-2">
                            <ImageIcon size={32} />
                            <span className="text-sm">Ajouter une photo</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">Titre de l'événement</label>
                        <input
                            required
                            className="card p-3"
                            value={formData.title}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Ex: Soirée Pizza"
                            style={{ border: 'none', background: 'var(--color-surface)' }}
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1 flex flex-col gap-2">
                            <label className="text-sm font-bold">Date</label>
                            <input
                                type="date"
                                required
                                className="card p-3 w-full"
                                value={formData.date}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                            <label className="text-sm font-bold">Heure</label>
                            <input
                                type="time"
                                required
                                className="card p-3 w-full"
                                value={formData.time}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, time: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1 flex flex-col gap-2">
                            <label className="text-sm font-bold">Lieu</label>
                            <input
                                className="card p-3"
                                value={formData.location}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="Ex: Parc Monceau"
                            />
                        </div>
                        <div className="flex flex-col gap-2" style={{ width: '120px' }}>
                            <label className="text-sm font-bold flex items-center gap-1">
                                <Users size={14} />
                                Max {limitParticipants && <Lock size={10} color="#f59e0b" />}
                            </label>
                            <input
                                type="number"
                                min="1"
                                max={maxParticipantsAllowed}
                                className="card p-3"
                                value={formData.maxAttendees}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, maxAttendees: Math.min(parseInt(e.target.value) || 1, maxParticipantsAllowed) })}
                                placeholder={String(maxParticipantsAllowed)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">Description</label>
                        <textarea
                            className="card p-3"
                            rows={4}
                            value={formData.description}
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Dites-nous en plus..."
                            style={{ resize: 'none' }}
                        />
                    </div>

                    {/* Option pour masquer l'adresse */}
                    <div 
                        className="card p-4"
                        onClick={() => setFormData({ ...formData, hideAddressUntilRegistered: !formData.hideAddressUntilRegistered })}
                        style={{ 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                background: formData.hideAddressUntilRegistered ? '#fef3c7' : '#f3f4f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {formData.hideAddressUntilRegistered ? (
                                    <EyeOff size={20} color="#f59e0b" />
                                ) : (
                                    <MapPin size={20} color="#9ca3af" />
                                )}
                            </div>
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--color-text)' }}>
                                    Masquer l'adresse
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                    {formData.hideAddressUntilRegistered 
                                        ? "Visible uniquement pour les participants" 
                                        : "Adresse visible par tous"}
                                </div>
                            </div>
                        </div>
                        <div style={{
                            width: '44px',
                            height: '26px',
                            borderRadius: '13px',
                            background: formData.hideAddressUntilRegistered ? '#f59e0b' : '#d1d5db',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '2px',
                            transition: 'background 0.2s'
                        }}>
                            <div style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                background: 'white',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                transform: formData.hideAddressUntilRegistered ? 'translateX(18px)' : 'translateX(0)',
                                transition: 'transform 0.2s'
                            }} />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary mt-4 py-4 text-lg">
                        Publier l'événement
                    </button>
                </form>
            </div>
        </PageTransition>
    );
};

export default CreateEvent;

