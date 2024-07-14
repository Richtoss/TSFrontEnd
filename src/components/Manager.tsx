import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface TimeEntry {
  date: string;
  jobName: string;
  hours: number;
}

interface Timesheet {
  _id: string;
  user: {
    _id: string;
    email: string;
  };
  weekStart: string;
  entries: TimeEntry[];
  totalHours: number;
  status: 'in_progress' | 'completed';
}

const Manager: React.FC = () => {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [selectedTimesheet, setSelectedTimesheet] = useState<Timesheet | null>(null);

  useEffect(() => {
    fetchTimesheets();
  }, []);

  const fetchTimesheets = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/timesheet/all', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTimesheets(response.data);
    } catch (error) {
      console.error('Error fetching timesheets:', error);
    }
  };

  const groupTimesheetsByWeek = () => {
    const grouped: { [key: string]: { totalHours: number; timesheets: Timesheet[] } } = {};
    timesheets.forEach((timesheet) => {
      const weekStart = new Date(timesheet.weekStart).toLocaleDateString();
      if (!grouped[weekStart]) {
        grouped[weekStart] = { totalHours: 0, timesheets: [] };
      }
      grouped[weekStart].totalHours += timesheet.totalHours;
      grouped[weekStart].timesheets.push(timesheet);
    });
    return grouped;
  };

  const groupedTimesheets = groupTimesheetsByWeek();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Manager Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Weekly Summaries</h2>
          <table className="w-full">
            <thead>
              <tr>
                <th>Week Starting</th>
                <th>Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedTimesheets).map(([weekStart, data]) => (
                <tr key={weekStart} onClick={() => setSelectedTimesheet(null)} className="cursor-pointer hover:bg-gray-100">
                  <td>{weekStart}</td>
                  <td>{data.totalHours.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          {selectedTimesheet ? (
            <>
              <h2 className="text-xl font-semibold mb-2">
                Timesheet Details for {selectedTimesheet.user.email}
              </h2>
              <table className="w-full">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Job Name</th>
                    <th>Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTimesheet.entries.map((entry, index) => (
                    <tr key={index}>
                      <td>{new Date(entry.date).toLocaleDateString()}</td>
                      <td>{entry.jobName}</td>
                      <td>{entry.hours}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2}>Total Hours:</td>
                    <td>{selectedTimesheet.totalHours}</td>
					</tr>
                </tfoot>
              </table>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-2">Employee Timesheets</h2>
              <table className="w-full">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Week Starting</th>
                    <th>Total Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {timesheets.map((timesheet) => (
                    <tr 
                      key={timesheet._id} 
                      onClick={() => setSelectedTimesheet(timesheet)}
                      className="cursor-pointer hover:bg-gray-100"
                    >
                      <td>{timesheet.user.email}</td>
                      <td>{new Date(timesheet.weekStart).toLocaleDateString()}</td>
                      <td>{timesheet.totalHours.toFixed(2)}</td>
                      <td>{timesheet.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Manager;