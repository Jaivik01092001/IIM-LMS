import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getContentThunk, addCommentThunk } from '../redux/educator/educatorSlice';
import Card from '../components/Card';
import { Link } from 'react-router-dom';

function ContentPage() {
  const dispatch = useDispatch();
  const { content, loading } = useSelector((state) => state.educator);
  const [activeContent, setActiveContent] = useState(null);
  const [comment, setComment] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    dispatch(getContentThunk());
  }, [dispatch]);

  const handleComment = (id) => {
    if (!comment.trim()) return;
    dispatch(addCommentThunk(id, comment));
    setComment('');
  };

  const handleContentClick = (item) => {
    setActiveContent(activeContent && activeContent._id === item._id ? null : item);
  };

  // Filter content based on search term and filter type
  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Content Header */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Educational Content</h1>
            <p className="mt-1 text-gray-500">Browse and discover educational resources shared by educators</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg py-2 px-4 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="document">Documents</option>
              <option value="video">Videos</option>
              <option value="presentation">Presentations</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      {filteredContent.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No content found</h3>
          <p className="mt-1 text-gray-500">Try adjusting your search or check back later for new content.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((item) => (
            <div key={item._id} className="flex flex-col h-full">
              <Card
                title={item.title}
                description={item.description}
                image={item.fileUrl || "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"}
                actions={
                  <div className="space-y-3 w-full">
                    <button
                      onClick={() => handleContentClick(item)}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 px-4 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {activeContent && activeContent._id === item._id ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>
                }
              />

              {/* Expanded Content Details */}
              {activeContent && activeContent._id === item._id && (
                <div className="mt-4 bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Content Details</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Created By</h4>
                        <p className="text-gray-900">{item.creator?.name || 'Unknown'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Type</h4>
                        <p className="text-gray-900 capitalize">{item.type || 'Document'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Created On</h4>
                        <p className="text-gray-900">{new Date(item.createdAt).toLocaleDateString()}</p>
                      </div>
                      {item.fileUrl && (
                        <div>
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download File
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Comments Section */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Comments</h4>
                      {item.comments && item.comments.length > 0 ? (
                        <div className="space-y-4 mb-4">
                          {item.comments.map((comment, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-start">
                                <div className="flex-shrink-0">
                                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                    {comment.user?.name?.charAt(0) || 'U'}
                                  </div>
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900">{comment.user?.name || 'User'}</p>
                                  <p className="text-sm text-gray-700">{comment.text}</p>
                                  <p className="text-xs text-gray-500 mt-1">{new Date(comment.date).toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 mb-4">No comments yet. Be the first to comment!</p>
                      )}

                      <div className="flex">
                        <input
                          type="text"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="flex-1 border border-gray-300 rounded-l-lg py-2 px-4 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          onClick={() => handleComment(item._id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-r-lg transition-colors"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ContentPage;