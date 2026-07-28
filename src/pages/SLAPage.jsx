import React from 'react';
import { Helmet } from 'react-helmet-async';

const SLAPage = () => {
    return (
        <div className="min-h-screen bg-white">
            <Helmet>
                <title>Software License Agreement - Onimta</title>
                <meta name="description" content="Onimta Software License Agreement" />
            </Helmet>

            <main className="max-w-4xl mx-auto px-6 py-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">SOFTWARE LICENSE AGREEMENT</h1>
                <h2 className="text-2xl font-bold text-gray-800 mb-8 pb-4 border-b border-gray-200">End-User License Agreement (EULA)</h2>

                <div className="space-y-6 text-gray-600 leading-relaxed">
                    <p className="italic bg-gray-50 p-4 border-l-4 border-[#00acee]">
                        This End-User License Agreement ("EULA") is a legal agreement between you and Onimta Information Technology Pvt Ltd.
                    </p>

                    <p>
                        This EULA agreement governs your acquisition and use of our Onimta Financial System software ("Software") directly from Onimta Information Technology Pvt Ltd or indirectly through an authorized reseller or distributor (a "Reseller").
                    </p>

                    <h4 className="text-xl font-bold text-gray-900 mt-8 mb-4">License Grant</h4>
                    <p>
                        Onimta Information Technology Pvt Ltd grants you a personal, non-transferable, non-exclusive license to use the Onimta Financial System software on your devices in accordance with the terms of this EULA agreement.
                    </p>
                    <p>
                        You are permitted to load the Onimta Financial System software (for example a PC, laptop, mobile or tablet) under your control. You are responsible for ensuring your device meets the minimum requirements of the Onimta Financial System software.
                    </p>

                    <h4 className="text-xl font-bold text-gray-900 mt-8 mb-4">Restrictions</h4>
                    <p>
                        You are not permitted to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                        <li>Edit, alter, modify, adapt, translate or otherwise change the whole or any part of the Software nor permit the whole or any part of the Software to be combined with or become incorporated in any other software.</li>
                        <li>Reproduce, copy, distribute, resell or otherwise use the Software for any commercial purpose.</li>
                        <li>Allow any third party to use the Software on behalf of or for the benefit of any third party.</li>
                        <li>Use the Software in any way which breaches any applicable local, national or international law.</li>
                        <li>Use the Software for any purpose that Onimta Information Technology Pvt Ltd considers is a breach of this EULA agreement.</li>
                    </ul>

                    <h4 className="text-xl font-bold text-gray-900 mt-8 mb-4">Intellectual Property and Ownership</h4>
                    <p>
                        Onimta Information Technology Pvt Ltd shall at all times retain ownership of the Software as originally downloaded by you and all subsequent downloads of the Software by you. The Software (and the copyright, and other intellectual property rights of whatever nature in the Software, including any modifications made thereto) are and shall remain the property of Onimta Information Technology Pvt Ltd.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default SLAPage;
