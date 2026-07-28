import React from 'react';
import { Helmet } from 'react-helmet-async';

const SecurityPage = () => {
    return (
        <div className="min-h-screen bg-white">
            <Helmet>
                <title>Security - Onimta</title>
                <meta name="description" content="Onimta Security Guarantee" />
            </Helmet>

            <main className="max-w-4xl mx-auto px-6 py-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">ONIMTA SECURITY GUARANTEE</h1>
                <h2 className="text-2xl font-bold text-gray-800 mb-8 pb-4 border-b border-gray-200">Enterprise-Grade Security</h2>

                <div className="space-y-6 text-gray-600 leading-relaxed">
                    <p className="italic bg-gray-50 p-4 border-l-4 border-[#00acee]">
                        We take the security of your financial data extremely seriously. Our platform is built from the ground up with military-grade encryption and strict access controls.
                    </p>

                    <h4 className="text-xl font-bold text-gray-900 mt-8 mb-4">End-to-End Encryption</h4>
                    <p>
                        All data transmitted between your device and our servers is encrypted using industry-standard TLS 1.3 encryption. This ensures that your financial data cannot be intercepted or read by third parties while in transit.
                    </p>

                    <h4 className="text-xl font-bold text-gray-900 mt-8 mb-4">Data Storage</h4>
                    <p>
                        Your data is stored in ISO 27001 certified data centers with 24/7 physical security. We utilize advanced database encryption to ensure that even at rest, your data remains secure and inaccessible to unauthorized personnel.
                    </p>

                    <h4 className="text-xl font-bold text-gray-900 mt-8 mb-4">Regular Audits</h4>
                    <p>
                        We undergo independent third-party security audits and penetration testing quarterly. These audits help us identify and patch potential vulnerabilities before they can be exploited.
                    </p>

                    <h4 className="text-xl font-bold text-gray-900 mt-8 mb-4">Access Control</h4>
                    <p>
                        Strict access controls are enforced across the Onimta ecosystem. We support multi-factor authentication (MFA), role-based access control (RBAC), and maintain detailed, immutable audit logs for all administrative and user actions within the system.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default SecurityPage;
