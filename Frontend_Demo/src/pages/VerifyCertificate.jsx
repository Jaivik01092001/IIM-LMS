import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

function VerifyCertificate() {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [manualCertificateId, setManualCertificateId] = useState(certificateId || '');

  const verifyCertificate = async (id) => {
    if (!id) {
      setError(t('Please enter a certificate ID'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${API_URL}/certificate/verify/${id}`);
      
      if (response.data.status === 'success') {
        setCertificate(response.data.data.certificate);
        if (id !== certificateId) {
          navigate(`/verify-certificate/${id}`, { replace: true });
        }
      } else {
        setError(t('Invalid certificate'));
      }
    } catch (error) {
      setError(t('Certificate verification failed. Please check the ID and try again.'));
    } finally {
      setLoading(false);
    }
  };

  // Verify certificate on initial load if ID is provided in URL
  useState(() => {
    if (certificateId) {
      verifyCertificate(certificateId);
    }
  }, [certificateId]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
          <h1 className="text-xl font-bold text-white">{t('Certificate Verification')}</h1>
        </div>

        <div className="p-6">
          <div className="mb-8">
            <p className="text-gray-600 mb-4">
              {t('Enter the certificate ID to verify its authenticity.')}
            </p>

            <div className="flex space-x-2">
              <input
                type="text"
                value={manualCertificateId}
                onChange={(e) => setManualCertificateId(e.target.value)}
                placeholder={t('Enter certificate ID')}
                className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => verifyCertificate(manualCertificateId)}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center"
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {t('Verify')}
              </button>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
          </div>

          {certificate && (
            <div className="border border-green-200 rounded-lg p-6 bg-green-50">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-green-100 rounded-full p-2">
                  <svg
                    className="h-8 w-8 text-green-600"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="text-xl font-bold text-center text-gray-900 mb-6">
                {t('Certificate Verified')}
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600">{t('Certificate ID')}:</span>
                  <span className="font-medium text-gray-900">{certificate.id}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600">{t('Student Name')}:</span>
                  <span className="font-medium text-gray-900">{certificate.studentName}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600">{t('Course')}:</span>
                  <span className="font-medium text-gray-900">{certificate.courseName}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600">{t('Instructor')}:</span>
                  <span className="font-medium text-gray-900">{certificate.instructorName}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600">{t('Issue Date')}:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(certificate.issueDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('Completion Date')}:</span>
                  <span className="font-medium text-gray-900">{certificate.completionDate}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyCertificate;
