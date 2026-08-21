import React from 'react';
import { Helmet } from 'react-helmet-async';

const SecurityPage = () => {
    return (
        <div className="min-h-screen bg-white">
            <Helmet>
                <title>Security - Onimta</title>
                <meta name="description" content="Onimta Security Information" />
            </Helmet>

            <main className="max-w-4xl mx-auto px-6 py-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">SECURITY AND COMPLIANCE</h1>
                <h2 className="text-2xl font-bold text-gray-800 mb-8 pb-4 border-b border-gray-200">Our Commitment to Security</h2>

                <div className="space-y-6 text-gray-600 leading-relaxed">
                    <p className="italic bg-gray-50 p-4 border-l-4 border-[#00acee]">
                        At Onimta, the security of your data is our highest priority. We utilize industry-standard security measures to ensure your information is safe.
                    </p>

                    <h4 className="text-xl font-bold text-gray-900 mt-8 mb-4">Infrastructure Security</h4>
                    <p>
                        Our platform is hosted on secure, enterprise-grade cloud infrastructure. We employ firewalls, intrusion detection and prevention systems, and continuous monitoring to detect and mitigate potential threats.
                    </p>

                    <h4 className="text-xl font-bold text-gray-900 mt-8 mb-4">Data Encryption</h4>
                    <p>
                        All user data is encrypted in transit and at rest. We use TLS (Transport Layer Security) for all data transfers over the internet, and AES-256 bit encryption for data stored in our databases.
                    </p>

                    <h4 className="text-xl font-bold text-gray-900 mt-8 mb-4">Access Control</h4>
                    <p>
                        Access to customer data by Onimta staff is strictly limited and audited. We adhere to the principle of least privilege, ensuring employees only have access to the data necessary to perform their job duties.
                    </p>

                    <h4 className="text-xl font-bold text-gray-900 mt-8 mb-4">Vulnerability Management</h4>
                    <p>
                        We conduct regular security assessments, penetration testing, and vulnerability scanning to proactively identify and address potential security weaknesses in our applications and systems.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default SecurityPage;
