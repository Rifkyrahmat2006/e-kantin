import '../css/app.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import CustomerApp from './CustomerApp';

const rootElement = document.getElementById('customer-app');

if (rootElement) {
    createRoot(rootElement).render(
        <StrictMode>
            <CustomerApp />
        </StrictMode>
    );
}
