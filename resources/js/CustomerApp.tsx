import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import CustomerLayout from './layouts/CustomerLayout';
import Login from './pages/customer/auth/Login';
import Register from './pages/customer/auth/Register';
import Home from './pages/customer/Home';
import Menu from './pages/customer/Menu';
import MenuDetail from './pages/customer/MenuDetail';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import OrderSuccess from './pages/customer/OrderSuccess';
import OrderHistory from './pages/customer/OrderHistory';

export default function CustomerApp() {
    return (
        <AuthProvider>
            <CartProvider>
                <BrowserRouter>
                    <CustomerLayout>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/menu" element={<Menu />} />
                            <Route path="/menu/:id" element={<MenuDetail />} />

                            {/* Protected Routes */}
                            <Route element={<ProtectedRoute />}>
                                <Route path="/cart" element={<Cart />} />
                                <Route path="/checkout" element={<Checkout />} />
                                <Route path="/order-success" element={<OrderSuccess />} />
                                <Route path="/orders" element={<OrderHistory />} />
                                <Route path="/profile" element={
                                    <div className="flex min-h-screen items-center justify-center bg-gray-100">
                                        <div className="text-center">
                                            <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
                                            <p className="mt-2 text-gray-600">This is a protected route.</p>
                                        </div>
                                    </div>
                                } />
                            </Route>
                        </Routes>
                    </CustomerLayout>
                </BrowserRouter>
            </CartProvider>
        </AuthProvider>
    );
}
