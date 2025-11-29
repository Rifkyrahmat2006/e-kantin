import { ReactNode } from 'react';
import BottomNav from '../components/BottomNav';
import DesktopNav from '../components/DesktopNav';
import FloatingCart from '../components/FloatingCart';

interface MobileLayoutProps {
    children: ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 md:pt-16">
            <DesktopNav />
            <div className="mx-auto max-w-md md:max-w-7xl md:px-6 lg:px-8">
                {children}
            </div>
            <FloatingCart />
            <div className="md:hidden">
                <BottomNav />
            </div>
        </div>
    );
}
