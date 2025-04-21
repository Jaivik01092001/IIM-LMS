import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getRolesThunk, deleteRoleThunk } from '../redux/role/roleSlice';
import RoleManagementSidebar from '../components/RoleManagementSidebar';
import Card from '../components/Card';
import { useTranslation } from 'react-i18next';
import { hasPermission } from '../utils/permissions';
import { PERMISSIONS } from '../utils/permissions';

function AdminRoles() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { roles, loading } = useSelector((state) => state.role);
  const { user } = useSelector((state) => state.auth);
  
  const [showSidebar, setShowSidebar] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Check if user has permission to manage roles
  const canManageRoles = hasPermission(user, PERMISSIONS.SYSTEM_SETTINGS.MANAGE_ROLES);
  
  // Load roles when component mounts
  useEffect(() => {
    dispatch(getRolesThunk());
  }, [dispatch]);
  
  // Filter roles based on search term
  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Handle role edit
  const handleEditRole = (role) => {
    setEditRole(role);
    setShowSidebar(true);
  };
  
  // Handle role delete
  const handleDeleteRole = (id) => {
    if (window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      dispatch(deleteRoleThunk(id));
    }
  };
  
  // Handle create new role
  const handleCreateRole = () => {
    setEditRole(null);
    setShowSidebar(true);
  };
  
  // Close sidebar
  const handleCloseSidebar = () => {
    setShowSidebar(false);
    setEditRole(null);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
            {t('admin.roleManagement')}
          </h1>
          <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-3">
            {canManageRoles && (
              <button
                onClick={handleCreateRole}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                {t('admin.createRole')}
              </button>
            )}
            <div className="relative">
              <input
                type="text"
                placeholder={t('common.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {loading && roles.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-sm text-gray-500">{t('common.loading')}</p>
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-2 text-sm text-gray-500">
              {searchTerm ? t('common.noSearchResults') : t('admin.noRoles')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoles.map((role) => (
              <Card
                key={role._id}
                title={role.name}
                description={role.description || t('admin.noDescription')}
                actions={
                  <>
                    {canManageRoles && (
                      <>
                        <button
                          onClick={() => handleEditRole(role)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg className="-ml-1 mr-1 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role._id)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-5 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <svg className="-ml-1 mr-1 h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {t('common.delete')}
                        </button>
                      </>
                    )}
                    {!canManageRoles && (
                      <span className="text-sm text-gray-500">{t('common.noPermission')}</span>
                    )}
                  </>
                }
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Role Management Sidebar */}
      <RoleManagementSidebar
        isOpen={showSidebar}
        onClose={handleCloseSidebar}
        editRole={editRole}
      />
    </div>
  );
}

export default AdminRoles;
