import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getStaffMembersThunk,
  createStaffMemberThunk,
  updateStaffMemberThunk,
  deleteStaffMemberThunk,
  updateStaffMemberPasswordThunk
} from '../redux/admin/staffSlice';
import Card from '../components/Card';
import { useTranslation } from 'react-i18next';
import { FaEdit, FaTrash, FaKey } from 'react-icons/fa';

function AdminStaff() {
  const dispatch = useDispatch();
  const { staffMembers, loading, error } = useSelector((state) => state.staff);
  const [form, setForm] = useState({ name: '', email: '', password: '', phoneNumber: '' });
  const [passwordForm, setPasswordForm] = useState({ password: '', confirmPassword: '' });
  const [formErrors, setFormErrors] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentStaffId, setCurrentStaffId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(getStaffMembersThunk());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormErrors({});

    // Validate form
    const errors = {};
    if (!form.name) errors.name = 'Name is required';
    if (!form.email) errors.email = 'Email is required';
    if (!editMode && !form.password) errors.password = 'Password is required';
    if (!form.phoneNumber) errors.phoneNumber = 'Phone number is required';
    // Role is automatically set to Super Admin, so no validation needed

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editMode) {
      dispatch(updateStaffMemberThunk({ id: currentStaffId, data: {
        name: form.name,
        email: form.email,
        phoneNumber: form.phoneNumber
      }}))
        .unwrap()
        .then(() => {
          resetForm();
        })
        .catch((err) => {
          if (err.errors) {
            setFormErrors(err.errors);
          }
        });
    } else {
      dispatch(createStaffMemberThunk(form))
        .unwrap()
        .then(() => {
          resetForm();
        })
        .catch((err) => {
          if (err.errors) {
            setFormErrors(err.errors);
          }
        });
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setFormErrors({});

    // Validate password form
    const errors = {};
    if (!passwordForm.password) errors.password = 'Password is required';
    if (passwordForm.password !== passwordForm.confirmPassword) errors.confirmPassword = 'Passwords do not match';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    dispatch(updateStaffMemberPasswordThunk({ id: currentStaffId, password: passwordForm.password }))
      .unwrap()
      .then(() => {
        setPasswordForm({ password: '', confirmPassword: '' });
        setShowPasswordForm(false);
      })
      .catch((err) => {
        if (err.errors) {
          setFormErrors(err.errors);
        }
      });
  };

  const handleEdit = (staff) => {
    setForm({
      name: staff.name,
      email: staff.email,
      phoneNumber: staff.phoneNumber || '',
      password: '' // Don't set password when editing
    });
    setCurrentStaffId(staff._id);
    setEditMode(true);
    setShowForm(true);
    setShowPasswordForm(false);
  };

  const handleChangePassword = (staff) => {
    setPasswordForm({ password: '', confirmPassword: '' });
    setCurrentStaffId(staff._id);
    setShowPasswordForm(true);
    setShowForm(false);
  };

  const handleDelete = (id) => {
    dispatch(deleteStaffMemberThunk(id))
      .then(() => {
        setConfirmDelete(null);
      });
  };

  const resetForm = () => {
    setForm({ name: '', email: '', password: '', phoneNumber: '' });
    setEditMode(false);
    setCurrentStaffId(null);
    setShowForm(false);
  };

  const filteredStaff = staffMembers.filter(staff =>
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
            {t('admin.staffManagement') || 'Staff Management'}
          </h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder={t('common.search') || 'Search'}
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
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              {t('admin.addStaffMember') || 'Add Staff Member'}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {editMode ? (t('admin.editStaffMember') || 'Edit Staff Member') : (t('admin.addStaffMember') || 'Add Staff Member')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">{t('common.name') || 'Name'}</label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">{t('common.email') || 'Email'}</label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
              </div>
              {!editMode && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">{t('common.password') || 'Password'}</label>
                  <input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required={!editMode}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  {formErrors.password && <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>}
                </div>
              )}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">{t('common.phoneNumber') || 'Phone Number'}</label>
                <input
                  id="phoneNumber"
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  required
                  placeholder="+919876543210"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {formErrors.phoneNumber && <p className="mt-1 text-sm text-red-600">{formErrors.phoneNumber}</p>}
              </div>
              {/* Role is automatically assigned on the backend */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {t('common.cancel') || 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {editMode ? (t('common.update') || 'Update') : (t('common.create') || 'Create')}
                </button>
              </div>
            </form>
          </div>
        )}

        {showPasswordForm && (
          <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">{t('admin.changePassword') || 'Change Password'}</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">{t('common.newPassword') || 'New Password'}</label>
                <input
                  id="new-password"
                  type="password"
                  value={passwordForm.password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {formErrors.password && <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>}
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">{t('common.confirmPassword') || 'Confirm Password'}</label>
                <input
                  id="confirm-password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {formErrors.confirmPassword && <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>}
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {t('common.cancel') || 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {t('common.update') || 'Update'}
                </button>
              </div>
            </form>
          </div>
        )}

        {filteredStaff.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('admin.noStaffMembers') || 'No staff members found'}</h3>
            <p className="mt-1 text-sm text-gray-500">{t('admin.addStaffMemberToGetStarted') || 'Add a staff member to get started'}</p>
            <div className="mt-6">
              <button
                onClick={() => { resetForm(); setShowForm(true); }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                {t('admin.addStaffMember') || 'Add Staff Member'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStaff.map((staff) => (
              <Card
                key={staff._id}
                title={staff.name}
                description={
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">{staff.email}</p>
                    <p className="text-sm text-gray-500">{staff.phoneNumber}</p>
                  </div>
                }
                icon={
                  <svg className="h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
                actions={
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => handleEdit(staff)}
                      className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                      title={t('common.edit') || 'Edit'}
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleChangePassword(staff)}
                      className="p-2 text-green-600 hover:text-green-800 transition-colors"
                      title={t('admin.changePassword') || 'Change Password'}
                    >
                      <FaKey />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(staff._id)}
                      className="p-2 text-red-600 hover:text-red-800 transition-colors"
                      title={t('common.delete') || 'Delete'}
                    >
                      <FaTrash />
                    </button>
                  </div>
                }
                className="relative"
              />
            ))}
          </div>
        )}

        {/* Confirmation Dialog */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('common.confirmDelete') || 'Confirm Delete'}</h3>
              <p className="text-sm text-gray-500 mb-4">{t('admin.deleteStaffConfirmation') || 'Are you sure you want to delete this staff member? This action cannot be undone.'}</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {t('common.cancel') || 'Cancel'}
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  {t('common.delete') || 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminStaff;
