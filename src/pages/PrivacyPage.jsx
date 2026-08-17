import React from 'react';
import { Helmet } from 'react-helmet-async';

const PrivacyPage = () => {
    return (
        <div className="min-h-screen bg-white">
            <Helmet>
                <title>Privacy Policy - Onimta</title>
                <meta name="description" content="Onimta Privacy Policy" />
            </Helmet>

            <main className="max-w-4xl mx-auto px-6 py-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">PRIVACY POLICY</h1>
                <h2 className="text-2xl font-bold text-gray-800 mb-8 pb-4 border-b border-gray-200">Our Privacy Practices</h2>

                <div className="space-y-6 text-gray-600 leading-relaxed">
                    <p className="italic bg-gray-50 p-4 border-l-4 border-[#00acee]">
                        Onimta is committed to protecting your privacy. This policy explains how we collect, use, and protect your personal information when you use our services.
                    </p>

                    <h4 className="text-xl font-bold text-gray-900 mt-8 mb-4">Information We Collect</h4>
                    <p>
                        We may collect personal information such as your name, email address, phone number, and billing information when you register for an account or use our platform. We also collect usage data to improve our services.
                    </p>

                    <h4 className="text-xl font-bold text-gray-900 mt-8 mb-4">How We Use Your Information</h4>
                    <p>
                        Your information is used to provide and improve our services, process payments, and communicate with you about your account. We do not sell your personal information to third parties.
                    </p>

                    <h4 className="text-xl font-bold text-gray-900 mt-8 mb-4">Data Sharing and Disclosure</h4>
                    <p>
                        We may share your information with trusted third-party service providers who assist us in operating our platform, conducting our business, or serving our users. These service providers are bound by strict confidentiality agreements.
                    </p>

                    <h4 className="text-xl font-bold text-gray-900 mt-8 mb-4">Your Rights</h4>
                    <p>
                        You have the right to access, correct, or delete your personal information. You can manage your data preferences within your account settings or by contacting our support team directly.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default PrivacyPage;
