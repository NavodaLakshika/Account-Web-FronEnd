import React from 'react';
import { Helmet } from 'react-helmet-async';

const SupportPage = () => {
    return (
        <div className="min-h-screen bg-white">
            <Helmet>
                <title>Support - Onimta</title>
                <meta name="description" content="Onimta Support" />
            </Helmet>

            <main className="max-w-4xl mx-auto px-6 py-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">ONIMTA SUPPORT</h1>
                <h2 className="text-2xl font-bold text-gray-800 mb-8 pb-4 border-b border-gray-200">How can we help you?</h2>

                <div className="space-y-6 text-gray-600 leading-relaxed">
                    <p className="italic bg-gray-50 p-4 border-l-4 border-[#00acee]">
                        Our dedicated support team is available to assist you with any inquiries regarding the Onimta Financial System, Onimta Cloud, or your account.
                    </p>

                    <h4 className="text-xl font-bold text-gray-900 mt-8 mb-4">Contact Options</h4>
                    <p>
                        <strong>Email:</strong><br />
                        <a href="mailto:sales@onimtait.com">sales@onimtait.com</a>
                    </p>

                    <p>
                        <strong>Phone:</strong><br />
                        <a href="tel:+94112897507">011 2 897 507</a>
                    </p>

                    <p>
                        <strong>Mobile:</strong><br />
                        <a href="tel:+94759888809">075 9 888 809</a><br />
                        <a href="tel:+94759888888">075 9 888 888</a>
                    </p>

                    <p>
                        <strong>FAX:</strong><br />
                        011 2 897 973
                    </p>

                    <h4 className="text-xl font-bold text-gray-900 mt-8 mb-4">Headquarters</h4>
                    <p>
                        <strong>Onimta Information Technology (Pvt) Ltd.</strong><br />
                        No. 41/3,<br />
                        Lake Road,<br />
                        Maharagama,<br />
                        Sri Lanka.
                    </p>

                    <h4 className="text-xl font-bold text-gray-900 mt-8 mb-4">System Status</h4>
                    <p>
                        All systems are currently operational. If you are experiencing connectivity issues, please check your local network or reach out to our technical team for immediate assistance.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default SupportPage;
