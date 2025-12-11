import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MobileLayout from './layouts/MobileLayout';
import Login from './pages/customer/auth/Login';
import Register from './pages/customer/auth/Register';
import Home from './pages/customer/Home';
import Menu from './pages/customer/Menu';
import MenuDetail from './pages/customer/MenuDetail';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import Payment from './pages/customer/Payment';
import OrderHistory from './pages/customer/OrderHistory';
import OrderDetail from './pages/customer/OrderDetail';
import OrderSuccess from './pages/customer/OrderSuccess';
import Profile from './pages/customer/Profile';
import Settings from './pages/customer/Settings';
import UserGuide from './pages/customer/UserGuide';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './contexts/ToastContext';

import { GoogleOAuthProvider } from '@react-oauth/google';

export default function CustomerApp() {
    return (
        <GoogleOAuthProvider clientId="1084439484932-a53s4dafu0gtl0pb30ugkd6vesssjktq.apps.googleusercontent.com">
            <AuthProvider>
                <ToastProvider>
                <CartProvider>
                    <BrowserRouter>
                        <MobileLayout>
                            <Routes>
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />

                                <Route path="/" element={<Home />} />
                                <Route path="/menu" element={<Menu />} />
                                <Route path="/menu/:id" element={<MenuDetail />} />
                                <Route path="/guide" element={<UserGuide />} />

                                {/* Protected Routes */}
                                <Route element={<ProtectedRoute />}>
                                    <Route path="/cart" element={<Cart />} />
                                    <Route path="/checkout" element={<Checkout />} />
                                    <Route path="/payment" element={<Payment />} />
                                    <Route path="/order-success" element={<OrderSuccess />} />
                                    <Route path="/orders" element={<OrderHistory />} />
                                    <Route path="/orders/:id" element={<OrderDetail />} />
                                    <Route path="/profile" element={<Profile />} />
                                    <Route path="/profile/edit" element={<Settings />} />
                                </Route>

                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </MobileLayout>
                    </BrowserRouter>
                </CartProvider>
            </ToastProvider>
            </AuthProvider>
        </GoogleOAuthProvider>
    );
}
