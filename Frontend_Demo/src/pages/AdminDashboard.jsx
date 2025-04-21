import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../components/Card';
import ProtectedComponent from '../components/ProtectedComponent';
import { PERMISSIONS } from '../utils/permissions';

function AdminDashboard() {
  const { user } = useSelector((state) => state.auth);
  const { t } = useTranslation();

  const dashboardCards = [
    {
      title: t('admin.universities'),
      description: t('admin.universityDetails'),
      link: '/admin/universities',
      icon: (
        <svg className="h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      permission: PERMISSIONS.USER_MANAGEMENT.VIEW_USERS
    },
    {
      title: t('admin.contentManagement'),
      description: t('admin.approveContent'),
      link: '/admin/content',
      icon: (
        <svg className="h-8 w-8 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      permission: PERMISSIONS.CONTENT_MANAGEMENT.APPROVE_CONTENT
    },
    {
      title: t('admin.courseManagement'),
      description: t('admin.courses'),
      link: '/admin/courses',
      icon: (
        <svg className="h-8 w-8 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M12 14l9-5-9-5-9 5 9 5z" />
          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>
      ),
      permission: PERMISSIONS.COURSE_MANAGEMENT.VIEW_COURSES
    },
    {
      title: t('admin.quizManagement'),
      description: t('quiz.questions'),
      link: '/admin/quizzes',
      icon: (
        <svg className="h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      permission: PERMISSIONS.QUIZ_MANAGEMENT.VIEW_QUIZZES
    },
    {
      title: t('admin.cmsBuilder'),
      description: t('admin.cmsPages'),
      link: '/admin/pages',
      icon: (
        <svg className="h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
      permission: PERMISSIONS.CONTENT_MANAGEMENT.VIEW_CONTENT
    },
    {
      title: t('admin.roleManagement') || 'Role Management',
      description: t('admin.assignRole') || 'Assign roles and permissions',
      link: '/admin/roles',
      icon: (
        <svg className="h-8 w-8 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      permission: PERMISSIONS.SYSTEM_SETTINGS.MANAGE_ROLES
    },
    {
      title: t('admin.staffManagement') || 'Staff Management',
      description: t('admin.staffDetails') || 'Manage staff members with admin privileges',
      link: '/admin/staff',
      icon: (
        <svg className="h-8 w-8 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      permission: PERMISSIONS.SYSTEM_SETTINGS.MANAGE_ROLES
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('common.welcome')}, {user?.name}!
          </h1>
          <p className="mt-2 text-gray-600">
            {t('common.dashboard')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardCards.map((card, index) => (
            <ProtectedComponent key={index} permissions={card.permission}>
              <Link to={card.link}>
                <Card
                  title={card.title}
                  description={card.description}
                  icon={card.icon}
                  className="h-full transition-transform transform hover:scale-105"
                />
              </Link>
            </ProtectedComponent>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
