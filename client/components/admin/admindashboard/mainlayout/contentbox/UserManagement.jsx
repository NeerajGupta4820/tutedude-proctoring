import React from 'react';

const UserManagement = ({ users, meetings }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">User Management</h2>
      <div className="space-y-3">
        {users.map(u => (
          <div key={u._id} className="bg-gray-50 p-4 rounded-lg flex items-center gap-4 hover:bg-gray-100 transition">
            <div className="w-12 h-12 bg-cyan-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {u.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{u.name}</div>
              <div className="text-sm text-gray-600">{u.email}</div>
            </div>
            <div className="text-sm text-gray-500">
              {meetings.filter(m => m.user?._id === u._id).length} meetings
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No users found
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;