import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        // Scroll del window
        window.scrollTo({ top: 0, behavior: 'auto' });

        // Scroll del contenedor principal
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.scrollTo({ top: 0, behavior: 'auto' });
        }
    }, [pathname]);

    return null;
}

