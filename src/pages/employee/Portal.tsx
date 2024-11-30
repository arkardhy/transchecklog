import { useState } from 'react';
import { Clock, Calendar, FileText } from 'lucide-react';
import { storage } from '../../utils/storage';
import { sendDiscordNotification } from '../../utils/discord';
import type { Employee, LeaveRequest } from '../../types';

export function EmployeePortal() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveRequest, setLeaveRequest] = useState({
    startDate: '',
    endDate: '',
    reason: '',
  });
  
  const employees = storage.getEmployees();

  const handleCheckIn = async () => {
    if (!selectedEmployee) return;

    const now = new Date();
    const checkIn = now.toISOString();
    
    const updatedEmployees = employees.map(emp => {
      if (emp.id === selectedEmployee.id) {
        const workingHours = emp.workingHours || [];
        return {
          ...emp,
          workingHours: [
            ...workingHours,
            { date: now.toISOString().split('T')[0], checkIn, checkOut: null, totalHours: 0 }
          ]
        };
      }
      return emp;
    });

    storage.setEmployees(updatedEmployees);
    setSelectedEmployee(updatedEmployees.find(emp => emp.id === selectedEmployee.id) || null);
    await sendDiscordNotification(`${selectedEmployee.name} has checked in at ${now.toLocaleTimeString()}`);
  };

  const handleCheckOut = async () => {
    if (!selectedEmployee) return;

    const now = new Date();
    const checkOut = now.toISOString();
    
    const updatedEmployees = employees.map(emp => {
      if (emp.id === selectedEmployee.id) {
        const workingHours = emp.workingHours || [];
        const lastEntry = workingHours[workingHours.length - 1];
        if (lastEntry && !lastEntry.checkOut) {
          const checkInTime = new Date(lastEntry.checkIn);
          const totalHours = (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
          
          return {
            ...emp,
            workingHours: [
              ...workingHours.slice(0, -1),
              { ...lastEntry, checkOut, totalHours }
            ]
          };
        }
      }
      return emp;
    });

    storage.setEmployees(updatedEmployees);
    setSelectedEmployee(updatedEmployees.find(emp => emp.id === selectedEmployee.id) || null);
    await sendDiscordNotification(`${selectedEmployee.name} has checked out at ${now.toLocaleTimeString()}`);
  };

  const handleLeaveRequest = async () => {
    if (!selectedEmployee) return;

    const newRequest: LeaveRequest = {
      id: Date.now().toString(),
      employeeId: selectedEmployee.id,
      startDate: leaveRequest.startDate,
      endDate: leaveRequest.endDate,
      reason: leaveRequest.reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const existingRequests = storage.getLeaveRequests();
    storage.setLeaveRequests([...existingRequests, newRequest]);
    
    await sendDiscordNotification(
      `New leave request from ${selectedEmployee.name} for ${new Date(leaveRequest.startDate).toLocaleDateString()} to ${new Date(leaveRequest.endDate).toLocaleDateString()}`
    );

    setShowLeaveModal(false);
    setLeaveRequest({ startDate: '', endDate: '', reason: '' });
  };

  const getLastCheckIn = () => {
    if (!selectedEmployee?.workingHours?.length) return null;
    const lastEntry = selectedEmployee.workingHours[selectedEmployee.workingHours.length - 1];
    return lastEntry && !lastEntry.checkOut ? lastEntry : null;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Employee Portal</h1>
          
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Employee
            </label>
            <select
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={selectedEmployee?.id || ''}
              onChange={(e) => setSelectedEmployee(employees.find(emp => emp.id === e.target.value) || null)}
            >
              <option value="">Select an employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} - {employee.position}
                </option>
              ))}
            </select>
          </div>

          {selectedEmployee && (
            <div className="space-y-6">
              <div className="flex space-x-4">
                <button
                  onClick={handleCheckIn}
                  disabled={!!getLastCheckIn()}
                  className={`flex-1 ${
                    getLastCheckIn()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
                >
                  <Clock className="inline-block w-5 h-5 mr-2" />
                  Check In
                </button>
                <button
                  onClick={handleCheckOut}
                  disabled={!getLastCheckIn()}
                  className={`flex-1 ${
                    !getLastCheckIn()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700'
                  } text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2`}
                >
                  <Clock className="inline-block w-5 h-5 mr-2" />
                  Check Out
                </button>
                <button
                  onClick={() => setShowLeaveModal(true)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <FileText className="inline-block w-5 h-5 mr-2" />
                  Request Leave
                </button>
              </div>

              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  {(selectedEmployee.workingHours || []).slice(-5).map((hours, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {new Date(hours.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(hours.checkIn).toLocaleTimeString()} -{' '}
                          {hours.checkOut
                            ? new Date(hours.checkOut).toLocaleTimeString()
                            : 'Active'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showLeaveModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Request Leave</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={leaveRequest.startDate}
                  onChange={(e) => setLeaveRequest({ ...leaveRequest, startDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={leaveRequest.endDate}
                  onChange={(e) => setLeaveRequest({ ...leaveRequest, endDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reason</label>
                <textarea
                  value={leaveRequest.reason}
                  onChange={(e) => setLeaveRequest({ ...leaveRequest, reason: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLeaveRequest}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}