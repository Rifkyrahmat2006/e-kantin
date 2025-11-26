import { ReactNode } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface CustomerLayoutProps {
    children: ReactNode;
}

import FloatingCart from '../components/FloatingCart';

export default function CustomerLayout({ children }: CustomerLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <FloatingCart />
            <Footer />
        </div>
    );
}
