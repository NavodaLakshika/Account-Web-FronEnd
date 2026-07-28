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
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">ONIMTA PRIVACY POLICY</h1>
                <h2 className="text-2xl font-bold text-gray-800 mb-8 pb-4 border-b border-gray-200">Your Privacy Matters To Us</h2>

                <div className="space-y-6 text-gray-600 leading-relaxed">
                    <p className="text-sm font-mono text-gray-500 mb-6">Last Updated: October 2024</p>
                    
                    <p className="italic bg-gray-50 p-4 border-l-4 border-[#00acee]">
                        This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our application. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
                    </p>

                    <h4 className="text-xl font-bold text-gray-900 mt-8 mb-4">Information Collection</h4>
                    <p>
                        We may collect information about you in a variety of ways. The information we may collect includes personal data, derivative data, financial data, and mobile device data that you voluntarily give to us when you register for the Onimta Financial System or our cloud services.
                    </p>

                    <h4 className="text-xl font-bold text-gray-900 mt-8 mb-4">Use of Your Information</h4>
                    <p>
                        Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the application to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                        <li>Create and manage your account.</li>
                        <li>Process your transactions and financial data securely.</li>
                        <li>Deliver targeted advertising, coupons, newsletters, and other information regarding promotions.</li>
                        <li>Email you regarding your account or order.</li>
                        <li>Fulfill and manage purchases, orders, payments, and other transactions related to the application.</li>
                    </ul>

                    <h4 className="text-xl font-bold text-gray-900 mt-8 mb-4">Data Security</h4>
                    <p>
                        We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default PrivacyPage;
