import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, LogOut, UserPlus, FileText, Calendar } from 'lucide-react';
import { storage } from '../../utils/storage';
import { EmployeeList } from './components/EmployeeList';
import { LeaveRequests } from './components/LeaveRequests';
import { TimeTracking } from './components/TimeTracking';

type Tab = 'employees' | 'leave-requests' | 'time-tracking';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('employees');
  const navigate = useNavigate();

  const handleLogout = () => {
    storage.clearAdminToken();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Users className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">HR Portal</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setActiveTab('employees')}
                  className={`${
                    activeTab === 'employees'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <Users className="h-5 w-5 mr-2" />
                  Employees
                </button>
                <button
                  onClick={() => setActiveTab('leave-requests')}
                  className={`${
                    activeTab === 'leave-requests'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Leave Requests
                </button>
                <button
                  onClick={() => setActiveTab('time-tracking')}
                  className={`${
                    activeTab === 'time-tracking'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Time Tracking
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'employees' && <EmployeeList />}
        {activeTab === 'leave-requests' && <LeaveRequests />}
        {activeTab === 'time-tracking' && <TimeTracking />}
      </main>
    </div>
  );
}