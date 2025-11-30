// import React, { useEffect, useState, useContext } from 'react';
// import axios from 'axios';
// import { AuthContext } from '../../components/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import CreateMeeting from './CreateMeeting';
// import UpcomingMeetings from './UpcomingMeetings';
// import AllMeetings from './AllMeetings';
// import QuestionManager from './QuestionManager';

// const API_URL = 'http://localhost:5000/api';

// const Dashboard = () => {
//   const { user, logout } = useContext(AuthContext);
//   const navigate = useNavigate();
//   const [users, setUsers] = useState([]);
//   const [meetings, setMeetings] = useState([]);
//   const [questions, setQuestions] = useState([]);
//   const [checkingRole, setCheckingRole] = useState(true);
//   const [activeTab, setActiveTab] = useState('create');

//   useEffect(() => {
//     if (!user) return;
//     if (user.role !== 'admin') {
//       navigate('/');
//     } else {
//       setCheckingRole(false);
//     }
//   }, [user, navigate]);

//   const fetchData = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const headers = { Authorization: `Bearer ${token}` };
      
//       const [usersRes, meetingsRes, questionsRes] = await Promise.all([
//         axios.get(`${API_URL}/meeting/users`, { headers }),
//         axios.get(`${API_URL}/meeting`, { headers }),
//         axios.get(`${API_URL}/question`, { headers }),
//       ]);

//       setUsers(usersRes.data.data.filter(u => u.role === 'user'));
//       setMeetings(meetingsRes.data.data);
//       setQuestions(questionsRes.data.data);
//     } catch (err) {
//       console.error('Failed to fetch data:', err);
//     }
//   };

//   useEffect(() => {
//     if (checkingRole) return;
//     fetchData();
//   }, [checkingRole]);

//   const now = new Date();
//   const upcomingMeetings = meetings.filter(m => new Date(m.scheduledDate) >= now);

//   if (checkingRole) {
//     return (
//       <div className="min-h-screen bg-gray-200 flex items-center justify-center">
//         <div className="bg-white rounded-lg shadow p-8">
//           <div className="text-xl text-gray-600">Loading...</div>
//         </div>
//       </div>
//     );
//   }

//   const tabs = [
//     { id: 'create', label: 'Create Meeting', icon: '➕' },
//     { id: 'upcoming', label: 'Upcoming Meetings', badge: upcomingMeetings.length },
//     { id: 'all', label: 'All Meetings', badge: meetings.length },
//     { id: 'questions', label: 'Questions Manager', badge: questions.length },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-200 font-sans flex flex-col">
//       {/* Header */}
//       <div className="bg-cyan-700 text-white shadow-lg">
//         <div className="max-w-7xl mx-auto px-6 py-4">
//           <div className="flex justify-between items-center">
//             <div>
//               <h1 className="text-3xl font-bold">Admin Dashboard</h1>
//             </div>
//             <button 
//               onClick={logout} 
//               className="bg-white text-cyan-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow"
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//           <div className="bg-white rounded-lg shadow p-6 hover:scale-105 transition-transform">
//             <div className="text-3xl font-bold text-cyan-700 mb-2">{users.length}</div>
//             <div className="text-gray-600 font-semibold">Total Users</div>
//           </div>
//           <div className="bg-white rounded-lg shadow p-6 hover:scale-105 transition-transform">
//             <div className="text-3xl font-bold text-cyan-700 mb-2">{meetings.length}</div>
//             <div className="text-gray-600 font-semibold">Total Meetings</div>
//           </div>
//           <div className="bg-white rounded-lg shadow p-6 hover:scale-105 transition-transform">
//             <div className="text-3xl font-bold text-cyan-700 mb-2">{upcomingMeetings.length}</div>
//             <div className="text-gray-600 font-semibold">Upcoming</div>
//           </div>
//           <div className="bg-white rounded-lg shadow p-6 hover:scale-105 transition-transform">
//             <div className="text-3xl font-bold text-cyan-700 mb-2">{questions.length}</div>
//             <div className="text-gray-600 font-semibold">Questions</div>
//           </div>
//         </div>

//         {/* Tabs Navigation */}
//         <div className="bg-white rounded-lg shadow mb-6">
//           <div className="flex border-b border-gray-200">
//             {tabs.map((tab, index) => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`flex-1 px-6 py-4 font-semibold transition-all ${
//                   activeTab === tab.id
//                     ? 'text-cyan-700 border-b-4 border-cyan-700 bg-gray-50'
//                     : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
//                 }`}
//               >
//                 <span className="flex items-center justify-center gap-2">
//                   {tab.icon && <span>{tab.icon}</span>}
//                   <span>{tab.label}</span>
//                   {tab.badge !== undefined && (
//                     <span className={`px-2 py-1 rounded-full text-xs font-bold ${
//                       activeTab === tab.id 
//                         ? 'bg-cyan-700 text-white' 
//                         : 'bg-gray-300 text-gray-700'
//                     }`}>
//                       {tab.badge}
//                     </span>
//                   )}
//                 </span>
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Tab Content */}
//         <div className="transition-all duration-300">
//           {activeTab === 'create' && (
//             <div className="bg-white rounded-lg shadow p-6">
//               <CreateMeeting users={users} questions={questions} onMeetingCreated={fetchData} />
//             </div>
//           )}
          
//           {activeTab === 'upcoming' && (
//             <div className="bg-white rounded-lg shadow p-6">
//               <UpcomingMeetings meetings={upcomingMeetings} navigate={navigate} />
//             </div>
//           )}
          
//           {activeTab === 'all' && (
//             <div className="bg-white rounded-lg shadow p-6">
//               <AllMeetings meetings={meetings} navigate={navigate} />
//             </div>
//           )}
          
//           {activeTab === 'questions' && (
//             <div className="bg-white rounded-lg shadow p-6">
//               <QuestionManager questions={questions} onUpdate={fetchData} />
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Footer */}
//       <footer className="bg-cyan-700 text-white py-4 mt-auto">
//         <div className="text-center font-semibold">&copy; The Online Interview Proctor System</div>
//       </footer>
//     </div>
//   );
// };

// export default Dashboard;