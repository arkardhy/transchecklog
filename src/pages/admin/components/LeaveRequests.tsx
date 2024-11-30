import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { storage } from '../../../utils/storage';
import { sendDiscordNotification } from '../../../utils/discord';
import { exportToCSV } from '../../../utils/csv';
import type { LeaveRequest } from '../../../types';

export function LeaveRequests() {
  const [requests, setRequests] = useState<LeaveRequest[]>(storage.getLeaveRequests());

  const handleApprove = async (request: LeaveRequest) => {
    const updatedRequests = requests.map(req =>
      req.id === request.id ? { ...req, status: 'approved' } : req
    );
    storage.setLeaveRequests(updatedRequests);
    setRequests(updatedRequests);
    
    const employee = storage.getEmployees().find(emp => emp.id === request.employeeId);
    if (employee) {
      await sendDiscordNotification(
        `Leave request for ${employee.name} from ${new Date(request.startDate).toLocaleDateString()} to ${new Date(request.endDate).toLocaleDateString()} has been approved.`
      );
    }
  };

  const handleReject = async (request: LeaveRequest) => {
    const updatedRequests = requests.map(req =>
      req.id === request.id ? { ...req, status: 'rejected' } : req
    );
    storage.setLeaveRequests(updatedRequests);
    setRequests(updatedRequests);
    
    const employee = storage.getEmployees().find(emp => emp.id === request.employeeId);
    if (employee) {
      await sendDiscordNotification(
        `Leave request for ${employee.name} from ${new Date(request.startDate).toLocaleDateString()} to ${new Date(request.endDate).toLocaleDateString()} has been rejected.`
      );
    }
  };

  const handleExportCSV = () => {
    exportToCSV(requests, 'leave-requests');
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Leave Requests</h2>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Export CSV
          </button>
        </div>

        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Employee</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Start Date</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">End Date</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Reason</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {requests.map((request) => {
                    const employee = storage.getEmployees().find(emp => emp.id === request.employeeId);
                    return (
                      <tr key={request.id}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                          {employee?.name || 'Unknown'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(request.startDate).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(request.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">{request.reason}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              request.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : request.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {request.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {request.status === 'pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleApprove(request)}
                                className="text-green-600 hover:text-green-900"
                              >
                                <Check className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleReject(request)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}