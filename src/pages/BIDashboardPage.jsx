import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GetThingsDoneBoard from './GetThingsDoneBoard';
import AIChatbotBoard from './AIChatbotBoard';
import { authService } from '../services/auth.service';

const BIDashboardPage = () => {
    const [user, setUser] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [showAIChatbotModal, setShowAIChatbotModal] = useState(false);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        const companyRaw = localStorage.getItem('selectedCompany');
        
        if (!currentUser) {
            window.location.href = '/login';
            return;
        }

        setUser(currentUser);
        if (companyRaw) {
            setSelectedCompany(JSON.parse(companyRaw));
        }
    }, []);

    if (!user) return null;

    const handleClose = () => {
        // If opened in a new tab, close the tab, otherwise navigate back
        if (window.history.length > 1) {
            window.close();
            // Fallback if window.close() is blocked
            window.location.href = '/dashboard';
        } else {
            window.location.href = '/dashboard';
        }
    };

    return (
        <div className="h-screen w-screen overflow-hidden flex flex-row relative bg-[#f8fafc]">
            <div className="flex-1 min-w-0 relative h-full">
                <GetThingsDoneBoard 
                    isOpen={true} 
                    isInline={true}
                    onClose={handleClose}
                    user={user}
                    selectedCompany={selectedCompany}
                    onAction={(actionId) => {
                        if (actionId === 'header_ai') {
                            setShowAIChatbotModal(prev => !prev); // Toggle chatbot
                            return;
                        }
                        // Send a message to the opener if it exists, or handle it via local storage
                        // The GetThingsDoneBoard usually triggers modals on the dashboard.
                        // For a standalone page, we might just redirect back to dashboard.
                        window.location.href = '/dashboard';
                    }}
                />
            </div>

            <AIChatbotBoard 
                isOpen={showAIChatbotModal} 
                onClose={() => setShowAIChatbotModal(false)} 
                position="inline-right" 
            />
        </div>
    );
};

export default BIDashboardPage;
