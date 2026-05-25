import React, { useState } from 'react';
import api from '../../../services/api';
import { showErrorToast, showSuccessToast } from '../../../utils/toastUtils';
import AdminVerificationModal from '../AdminVerificationModal';

const SystemUpdateAuthModal = ({ isOpen, onClose, onVerified }) => {
    const [isVerifying, setIsVerifying] = useState(false);

    const handleVerify = async (password) => {
        if (!password) return;

        setIsVerifying(true);

        try {
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            const empName = userData.empName || userData.EmpName;
            
            if (!empName) {
                throw new Error("User session not found. Please log in again.");
            }

            const response = await api.post('/Auth/verify-password', {
                emp_name: empName,
                pass_word: password
            });

            if (response.data.success) {
                onVerified();
                onClose();
            }
        } catch (err) {
            console.error("Verification failed:", err);
            const msg = err.response?.data?.message || "Invalid password. Please try again.";
            showErrorToast(msg);
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <AdminVerificationModal
            isOpen={isOpen}
            onClose={onClose}
            onVerify={handleVerify}
            loading={isVerifying}
            title="SYSTEM UPDATE AUTH"
            message="CONFIRM PASSWORD TO APPLY SYSTEM UPDATES"
        />
    );
};

export default SystemUpdateAuthModal;
