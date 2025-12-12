import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

interface LikeButtonProps {
    menuId: number;
    initialLikesCount?: number;
    variant?: 'mobile' | 'desktop';
}

export default function LikeButton({
    menuId,
    initialLikesCount = 0,
    variant = 'mobile',
}: LikeButtonProps) {
    const { isAuthenticated } = useAuth();
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(initialLikesCount);
    const [loading, setLoading] = useState(false);
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            checkLikeStatus();
        }
    }, [menuId, isAuthenticated]);

    const checkLikeStatus = async () => {
        try {
            const response = await api.get(`/menus/${menuId}/like-status`);
            setLiked(response.data.liked);
            setLikesCount(response.data.likes_count);
        } catch (err) {
            console.error('Failed to check like status:', err);
        }
    };

    const handleToggle = async () => {
        if (!isAuthenticated) {
            alert('Silakan login untuk menyukai menu ini');
            return;
        }

        if (loading) return;

        setLoading(true);
        setAnimating(true);

        try {
            const response = await api.post(`/menus/${menuId}/like`);
            setLiked(response.data.liked);
            setLikesCount(response.data.likes_count);
        } catch (err) {
            console.error('Failed to toggle like:', err);
        } finally {
            setLoading(false);
            setTimeout(() => setAnimating(false), 300);
        }
    };

    if (variant === 'desktop') {
        return (
            <button
                onClick={handleToggle}
                disabled={loading}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 transition-all duration-200 ${
                    liked
                        ? 'border-red-200 bg-red-50 text-red-500'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                } ${animating ? 'scale-110' : 'scale-100'}`}
            >
                <Heart
                    className={`h-4 w-4 transition-all duration-200 ${
                        liked ? 'fill-red-500 text-red-500' : ''
                    } ${animating ? 'animate-pulse' : ''}`}
                />
                <span className="text-sm font-medium">{likesCount}</span>
            </button>
        );
    }

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`flex items-center gap-1.5 rounded-full px-3 py-2 transition-all duration-200 ${
                liked
                    ? 'bg-red-50 text-red-500'
                    : 'bg-white/20 text-white hover:bg-white/30'
            } ${animating ? 'scale-110' : 'scale-100'}`}
        >
            <Heart
                className={`h-5 w-5 transition-all duration-200 ${
                    liked ? 'fill-red-500 text-red-500' : ''
                } ${animating ? 'animate-pulse' : ''}`}
            />
            <span className="text-sm font-medium">{likesCount}</span>
        </button>
    );
}
