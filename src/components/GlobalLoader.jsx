import React, { useState, useEffect, useRef } from 'react';
import SystemLoader from './SystemLoader';
import AlertModal from './modals/AlertModal';

const GlobalLoader = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });
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

        const handleError = (e) => {
            setErrorModal({ isOpen: true, message: e.detail?.message || 'An unexpected error occurred.' });
            handleEnd();
        };

        window.addEventListener('globalLoadingStart', handleStart);
        window.addEventListener('globalLoadingEnd', handleEnd);
        window.addEventListener('globalError', handleError);

        return () => {
            window.removeEventListener('globalLoadingStart', handleStart);
            window.removeEventListener('globalLoadingEnd', handleEnd);
            window.removeEventListener('globalError', handleError);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <>
            {isLoading && <SystemLoader />}
            <AlertModal 
                isOpen={errorModal.isOpen} 
                onClose={() => setErrorModal({ isOpen: false, message: '' })}
                title="Error"
                message={errorModal.message}
                variant="error"
                confirmText="OK"
                showCancel={false}
            />
        </>
    );
};

export default GlobalLoader;
