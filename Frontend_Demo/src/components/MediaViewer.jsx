import { useState, useEffect, useRef } from 'react';

function MediaViewer({ content, onClose }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (!content) return;
    
    setIsLoading(true);
    setError(null);
    
    // Reset loading state when content changes
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [content]);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setError('Failed to load image');
  };

  const handleVideoLoad = () => {
    setIsLoading(false);
  };

  const handleVideoError = () => {
    setIsLoading(false);
    setError('Failed to load video');
  };

  const isVideo = content?.mediaType === 'video' || 
                 (content?.type === 'video') || 
                 (content?.fileUrl && /\.(mp4|mov|avi|mkv)$/i.test(content.fileUrl));
  
  const isImage = content?.mediaType === 'image' || 
                 (content?.type === 'image') || 
                 (content?.fileUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(content.fileUrl));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-semibold text-gray-900">{content?.title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center justify-center">
          {isLoading && (
            <div className="flex items-center justify-center h-64 w-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-center p-4">
              <p>{error}</p>
              <p className="mt-2">URL: {content?.fileUrl}</p>
            </div>
          )}

          {!isLoading && !error && isVideo && (
            <div className="w-full">
              <video
                ref={videoRef}
                src={content.fileUrl}
                className="w-full max-h-[70vh] object-contain"
                controls
                autoPlay
                onLoadedData={handleVideoLoad}
                onError={handleVideoError}
              />
            </div>
          )}

          {!isLoading && !error && isImage && (
            <div className="w-full">
              <img
                ref={imageRef}
                src={content.fileUrl}
                alt={content.title}
                className="w-full max-h-[70vh] object-contain"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </div>
          )}

          {!isLoading && !error && !isVideo && !isImage && (
            <div className="text-center p-4">
              <p className="text-gray-500">This content type cannot be previewed.</p>
              <a 
                href={content.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Download File
              </a>
            </div>
          )}
        </div>

        {/* Footer with description */}
        {content?.description && (
          <div className="p-4 border-t">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
            <p className="text-gray-700">{content.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MediaViewer;
