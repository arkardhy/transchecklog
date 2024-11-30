import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { storage } from '../../../utils/storage';
import { exportToCSV } from '../../../utils/csv';
import type { Employee } from '../../../types';

export function TimeTracking() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const employees = storage.getEmployees();

  const calculateMonthlyHours = (employee: Employee) => {
    return employee.workingHours
      .filter(hours => hours.date.startsWith(selectedMonth))
      .reduce((total, hours) => total + hours.totalHours, 0);
  };

  const calculateWages = (hours: number) => {
    return Math.round(hours * 10000); // 10,000 IDR per hour
  };

  const handleExportCSV = () => {
    const timeData = employees.map(employee => ({
      name: employee.name,
      position: employee.position,
      monthlyHours: calculateMonthlyHours(employee),
      wages: calculateWages(calculateMonthlyHours(employee)),
    }));
    exportToCSV(timeData, `time-tracking-${selectedMonth}`);
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Time Tracking</h2>
          <div className="flex space-x-4">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Employee</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Position</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Monthly Hours</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Wages (IDR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {employees.map((employee) => {
                    const monthlyHours = calculateMonthlyHours(employee);
                    const wages = calculateWages(monthlyHours);
                    return (
                      <tr key={employee.id}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{employee.name}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{employee.position}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {monthlyHours.toFixed(2)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {wages.toLocaleString()}
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