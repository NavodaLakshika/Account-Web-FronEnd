import React, { useState, useEffect, useRef } from 'react';
import SystemLoader from './SystemLoader';

const GlobalLoader = () => {
    const [isLoading, setIsLoading] = useState(false);
    const timeoutRef = useRef(null);

    useEffect(() => {
        const handleStart = () => {
            // Add a small delay to prevent flickering for fast requests
            if (!timeoutRef.current) {
                timeoutRef.current = setTimeout(() => {
                    setIsLoading(true);
                }, 300); // 300ms delay
            }
        };

        const handleEnd = () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            setIsLoading(false);
        };

        window.addEventListener('globalLoadingStart', handleStart);
        window.addEventListener('globalLoadingEnd', handleEnd);

        return () => {
            window.removeEventListener('globalLoadingStart', handleStart);
            window.removeEventListener('globalLoadingEnd', handleEnd);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    if (!isLoading) return null;

    return <SystemLoader />;
};

export default GlobalLoader;
