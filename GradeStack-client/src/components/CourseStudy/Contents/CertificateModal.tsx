import React, { useState } from 'react';
import { generateCertificate } from '../../../services/certificate.service';
import { useNavigate } from 'react-router-dom';

interface CertificateModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: string;
    learnerId: string;
}

const CertificateModal: React.FC<CertificateModalProps> = ({
    isOpen,
    onClose,
    courseId,
    learnerId
}) => {
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    const handleGenerateCertificate = async () => {
        if (!name.trim()) {
            alert('Please enter your name');
            return;
        }

        try {
            setIsLoading(true);
            const response = await generateCertificate(learnerId, courseId, name);
            setIsSuccess(true);
            // Open the certificate URL in a new tab
            window.open(response.certificateUrl, '_blank');

            // Redirect to course detail page after 3 seconds
            setTimeout(() => {
                navigate(`/courses/${courseId}`);
            }, 3000);
        } catch (error) {
            console.error('Error generating certificate:', error);
            alert('Failed to generate certificate. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
                </div>

                <div className="inline-block align-bottom bg-[#1c2936] rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-[#1c2936] px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                {!isSuccess ? (
                                    <>
                                        <h3 className="text-lg leading-6 font-medium text-gray-200">
                                            Congratulations on completing the course!
                                        </h3>
                                        <div className="mt-4 space-y-6">
                                            <div>
                                                <p className="text-gray-400 mb-2">Enter your name to receive your course completion certificate</p>
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="Your full name"
                                                    className="w-full px-3 py-2 bg-[#0d1117] border border-[#29334a] rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
                                                <p className="text-blue-400 text-sm">
                                                    Your certificate will be generated with the name you provide. Please verify the information before proceeding.
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="mb-6">
                                            <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-200 mb-2">Certificate Generated Successfully!</h3>
                                        <p className="text-gray-400 mb-4">Your certificate has been downloaded. Redirecting to course page...</p>
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {!isSuccess && (
                        <div className="bg-[#1c2936] px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="button"
                                onClick={handleGenerateCertificate}
                                disabled={isLoading}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-500 text-base font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : null}
                                Get Certificate
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CertificateModal;