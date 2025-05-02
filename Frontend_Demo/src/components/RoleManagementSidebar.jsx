import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createRoleThunk,
  updateRoleThunk,
  getPermissionsByCategoryThunk
} from '../redux/role/roleSlice';
import PermissionGroup from './PermissionGroup';
import { PERMISSIONS } from '../utils/permissions';

/**
 * Sidebar component for managing roles and permissions
 */
function RoleManagementSidebar({ isOpen, onClose, editRole = null }) {
  const dispatch = useDispatch();
  const { permissionsByCategory, loading } = useSelector((state) => state.role);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState({ view_courses: true });

  // Load permissions by category when component mounts
  useEffect(() => {
    dispatch(getPermissionsByCategoryThunk());
  }, [dispatch]);

  // Set form values when editing a role
  useEffect(() => {
    if (editRole) {
      setName(editRole.name || '');
      setDescription(editRole.description || '');
      // Ensure view_courses is always true
      setPermissions({
        ...(editRole.permissions || {}),
        view_courses: true
      });
    } else {
      setName('');
      setDescription('');
      setPermissions({ view_courses: true });
    }
  }, [editRole]);

  // Handle permission toggle
  const handlePermissionChange = (category, updates) => {
    // If updates contains view_courses, ensure it's always true
    if ('view_courses' in updates) {
      updates.view_courses = true;
    }

    setPermissions(prev => ({
      ...prev,
      ...updates
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    const roleData = {
      name,
      description,
      permissions: {
        ...permissions,
        view_courses: true // Always ensure view_courses is true
      }
    };

    if (editRole) {
      dispatch(updateRoleThunk({ id: editRole._id, roleData }))
        .unwrap()
        .then(() => {
          onClose();
        });
    } else {
      dispatch(createRoleThunk(roleData))
        .unwrap()
        .then(() => {
          onClose();
        });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Sidebar panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="relative w-screen max-w-md">
          <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
            {/* Header */}
            <div className="px-4 py-6 bg-blue-700 sm:px-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-white">
                  {editRole ? 'Edit Role' : 'Create New Role'}
                </h2>
                <button
                  type="button"
                  className="text-blue-200 hover:text-white focus:outline-none"
                  onClick={onClose}
                >
                  <span className="sr-only">Close panel</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="flex-1 px-4 py-6 sm:px-6 overflow-y-auto">
              <form onSubmit={handleSubmit}>
                {/* Role Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Role Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows="2"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Permissions</h3>

                  {/* Course Management */}
                  <PermissionGroup
                    title="Course Management"
                    permissions={PERMISSIONS.COURSE_MANAGEMENT}
                    values={permissions}
                    onChange={(updates) => handlePermissionChange('course_management', updates)}
                    disabled={loading}
                  />

                  {/* Quiz Management */}
                  <PermissionGroup
                    title="Quiz Management"
                    permissions={PERMISSIONS.QUIZ_MANAGEMENT}
                    values={permissions}
                    onChange={(updates) => handlePermissionChange('quiz_management', updates)}
                    disabled={loading}
                  />

                  {/* User Management */}
                  <PermissionGroup
                    title="User Management"
                    permissions={PERMISSIONS.USER_MANAGEMENT}
                    values={permissions}
                    onChange={(updates) => handlePermissionChange('user_management', updates)}
                    disabled={loading}
                  />

                  {/* Content Management */}
                  <PermissionGroup
                    title="Content Management"
                    permissions={PERMISSIONS.CONTENT_MANAGEMENT}
                    values={permissions}
                    onChange={(updates) => handlePermissionChange('content_management', updates)}
                    disabled={loading}
                  />

                  {/* Certificate Management */}
                  <PermissionGroup
                    title="Certificate Management"
                    permissions={PERMISSIONS.CERTIFICATE_MANAGEMENT}
                    values={permissions}
                    onChange={(updates) => handlePermissionChange('certificate_management', updates)}
                    disabled={loading}
                  />

                  {/* Reports & Analytics */}
                  <PermissionGroup
                    title="Reports & Analytics"
                    permissions={PERMISSIONS.REPORTS_ANALYTICS}
                    values={permissions}
                    onChange={(updates) => handlePermissionChange('reports_analytics', updates)}
                    disabled={loading}
                  />

                  {/* System Settings */}
                  <PermissionGroup
                    title="System Settings"
                    permissions={PERMISSIONS.SYSTEM_SETTINGS}
                    values={permissions}
                    onChange={(updates) => handlePermissionChange('system_settings', updates)}
                    disabled={loading}
                  />
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200 sm:px-6">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (editRole ? 'Update Role' : 'Create Role')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoleManagementSidebar;
