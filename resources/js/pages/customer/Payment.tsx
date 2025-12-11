import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import api from '../../lib/api';
import { formatRupiah } from '../../utils/formatRupiah';
import { ChevronLeft, CreditCard, Shield, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

declare global {
    interface Window {
        snap: any;
    }
}

// Midtrans Client Key from environment
const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-vV5SeV13lU54GLgK';

interface PaymentState {
    orderId: number;
    totalAmount: number;
}

type PaymentStatus = 'loading' | 'ready' | 'processing' | 'success' | 'error' | 'pending';

export default function Payment() {
    const navigate = useNavigate();
    const location = useLocation();
    const { clearCart } = useCart();
    
    const [status, setStatus] = useState<PaymentStatus>('loading');
    const [error, setError] = useState('');
    const [snapToken, setSnapToken] = useState<string | null>(null);
    const [snapLoaded, setSnapLoaded] = useState(false);
    const [actualAmount, setActualAmount] = useState<number>(0);
    
    // Use ref to prevent double initialization
    const tokenFetched = useRef(false);

    // Get order data from navigation state
    const paymentState = location.state as PaymentState | null;

    // Load Snap script
    useEffect(() => {
        if (!paymentState?.orderId) {
            navigate('/cart');
            return;
        }

        // Set initial amount from navigation state
        setActualAmount(paymentState.totalAmount || 0);

        if (window.snap) {
            setSnapLoaded(true);
            return;
        }

        const existingScript = document.querySelector('script[src*="snap.js"]');
        if (existingScript) {
            // Wait for script to be ready
            const checkSnap = setInterval(() => {
                if (window.snap) {
                    setSnapLoaded(true);
                    clearInterval(checkSnap);
                }
            }, 100);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY);
        script.async = true;
        script.onload = () => {
            setSnapLoaded(true);
        };
        script.onerror = () => {
            setError('Gagal memuat sistem pembayaran');
            setStatus('error');
        };
        document.body.appendChild(script);
    }, [paymentState, navigate]);

    // Fetch Snap token
    useEffect(() => {
        if (!snapLoaded || !paymentState?.orderId || tokenFetched.current) return;
        tokenFetched.current = true;

        const fetchToken = async () => {
            try {
                const response = await api.post('/payment/create-token', {
                    order_id: paymentState.orderId,
                });
                setSnapToken(response.data.snap_token);
                // Use actual amount from backend
                if (response.data.total_amount) {
                    setActualAmount(response.data.total_amount);
                }
                setStatus('ready');
            } catch (err: any) {
                console.error('Failed to get token:', err);
                setError(err.response?.data?.message || err.response?.data?.error || 'Gagal memulai pembayaran');
                setStatus('error');
                tokenFetched.current = false;
            }
        };

        fetchToken();
    }, [snapLoaded, paymentState]);

    // Handle payment button click - opens Snap popup
    const handlePayNow = useCallback(() => {
        if (!snapToken || !window.snap || !paymentState) return;

        setStatus('processing');

        // Hide any existing popup first to reset state
        try {
            window.snap.hide();
        } catch (e) {
            // Ignore if no popup is open
        }

        // Small delay to ensure state is reset
        setTimeout(() => {
            window.snap.pay(snapToken, {
                onSuccess: async (result: any) => {
                    console.log('Payment success:', result);
                    setStatus('success');
                    
                    try {
                        await api.post('/payment/update-status', {
                            order_id: paymentState.orderId,
                            status: 'success',
                        });
                    } catch (e) {
                        console.error('Failed to update status:', e);
                    }
                    
                    clearCart();
                    
                    setTimeout(() => {
                        navigate('/order-success', { 
                            state: { orderId: paymentState.orderId },
                            replace: true 
                        });
                    }, 2000);
                },
                onPending: async (result: any) => {
                    console.log('Payment pending:', result);
                    setStatus('pending');
                    
                    clearCart();
                    
                    setTimeout(() => {
                        navigate('/orders', { replace: true });
                    }, 2000);
                },
                onError: async (result: any) => {
                    console.log('Payment error:', result);
                    setStatus('error');
                    setError('Pembayaran gagal. Silakan coba lagi.');
                    
                    try {
                        await api.post('/payment/update-status', {
                            order_id: paymentState.orderId,
                            status: 'error',
                        });
                    } catch (e) {
                        console.error('Failed to update status:', e);
                    }
                },
                onClose: () => {
                    console.log('Payment popup closed');
                    setStatus('ready');
                },
            });
        }, 100);
    }, [snapToken, paymentState, clearCart, navigate]);

    const handleRetry = () => {
        setError('');
        tokenFetched.current = false;
        setSnapToken(null);
        setStatus('loading');
        window.location.reload();
    };

    const handleBack = () => {
        navigate('/cart');
    };

    // Render status overlays
    const renderStatusOverlay = () => {
        if (status === 'success') {
            return (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white rounded-3xl p-8 mx-4 max-w-sm w-full text-center shadow-2xl">
                        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Pembayaran Berhasil!</h2>
                        <p className="text-gray-500">Pesanan Anda sedang diproses</p>
                    </div>
                </div>
            );
        }

        if (status === 'pending') {
            return (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white rounded-3xl p-8 mx-4 max-w-sm w-full text-center shadow-2xl">
                        <div className="h-20 w-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                            <Clock className="h-10 w-10 text-yellow-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Menunggu Pembayaran</h2>
                        <p className="text-gray-500">Silakan selesaikan pembayaran Anda</p>
                    </div>
                </div>
            );
        }

        return null;
    };

    if (!paymentState?.orderId) {
        return null;
    }

    return (
        <div className="bg-gradient-to-b from-gray-100 to-gray-50 min-h-screen">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg px-4 py-4 shadow-sm border-b border-gray-100 flex items-center max-w-7xl mx-auto w-full">
                <button onClick={handleBack} className="mr-3 p-2 rounded-xl hover:bg-gray-100 transition-colors">
                    <ChevronLeft className="h-5 w-5 text-gray-700" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-sm">
                        <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Pembayaran</h1>
                        <p className="text-xs text-gray-500">Order #{paymentState.orderId}</p>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-2xl px-4 py-6">
                {/* Payment Info Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
                    <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-blue-600" />
                                <span className="text-sm font-medium text-gray-900">Pembayaran Aman</span>
                            </div>
                            <span className="text-lg font-bold text-blue-600">
                                {formatRupiah(actualAmount)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {status === 'loading' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center">
                        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                        <p className="text-gray-600 font-medium">Mempersiapkan pembayaran...</p>
                    </div>
                )}

                {/* Ready State - Show Pay Button */}
                {(status === 'ready' || status === 'processing') && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center">
                        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
                            <CreditCard className="h-10 w-10 text-green-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Siap Membayar</h3>
                        <p className="text-gray-500 text-center mb-6">
                            Klik tombol di bawah untuk memilih metode pembayaran
                        </p>
                        <button
                            onClick={handlePayNow}
                            disabled={status === 'processing'}
                            className="w-full max-w-xs px-8 py-4 rounded-2xl bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {status === 'processing' ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="h-5 w-5" />
                                    Bayar Sekarang
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Error State */}
                {status === 'error' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 flex flex-col items-center justify-center">
                        <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                            <XCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Pembayaran Gagal</h3>
                        <p className="text-gray-500 text-center mb-6">{error}</p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleBack}
                                className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Kembali
                            </button>
                            <button
                                onClick={handleRetry}
                                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                            >
                                Coba Lagi
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Status Overlays */}
            {renderStatusOverlay()}
        </div>
    );
}
