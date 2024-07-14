import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface TimeEntry {
  date: string;
  jobName: string;
  hours: number;
}

interface Timesheet {
  _id: string;
  weekStart: string;
  entries: TimeEntry[];
  totalHours: number;
  status: 'in_progress' | 'completed';
}

const Timesheet: React.FC = () => {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [selectedTimesheet, setSelectedTimesheet] = useState<Timesheet | null>(null);
  const [newEntry, setNewEntry] = useState<TimeEntry>({ date: '', jobName: '', hours: 0 });
  const [jobs, setJobs] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchTimesheets();
    fetchJobs();
  }, []);

  const fetchTimesheets = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/timesheet', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTimesheets(response.data);
      if (response.data.length > 0) {
        setSelectedTimesheet(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching timesheets:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/job', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setJobs(response.data.map((job: any) => job.name));
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleCreateTimesheet = async () => {
    try {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      const response = await axios.post('http://localhost:5000/api/timesheet', 
        { weekStart: weekStart.toISOString() },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setTimesheets([response.data, ...timesheets]);
      setSelectedTimesheet(response.data);
    } catch (error) {
      console.error('Error creating timesheet:', error);
    }
  };

  const handleAddEntry = async () => {
    if (!selectedTimesheet) return;
    try {
      const response = await axios.post(`http://localhost:5000/api/timesheet/${selectedTimesheet._id}/entry`, 
        newEntry,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setSelectedTimesheet(response.data);
      setNewEntry({ date: '', jobName: '', hours: 0 });
    } catch (error) {
      console.error('Error adding entry:', error);
    }
  };

  const handleCompleteTimesheet = async () => {
    if (!selectedTimesheet) return;
    try {
      const response = await axios.patch(`http://localhost:5000/api/timesheet/${selectedTimesheet._id}/complete`, 
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setSelectedTimesheet(response.data);
    } catch (error) {
      console.error('Error completing timesheet:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Employee Timesheet</h1>
      <button 
        onClick={handleCreateTimesheet}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Create New Timesheet
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Timesheets</h2>
          <ul>
            {timesheets.map((timesheet) => (
              <li 
                key={timesheet._id}
                onClick={() => setSelectedTimesheet(timesheet)}
                className={`cursor-pointer p-2 ${selectedTimesheet?._id === timesheet._id ? 'bg-gray-200' : ''}`}
              >
                Week of {new Date(timesheet.weekStart).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
        <div>
          {selectedTimesheet && (
            <>
              <h2 className="text-xl font-semibold mb-2">
                Selected Timesheet: Week of {new Date(selectedTimesheet.weekStart).toLocaleDateString()}
              </h2>
              <table className="w-full mb-4">
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
              {selectedTimesheet.status === 'in_progress' && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Add New Entry</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                    <input
                      type="date"
                      value={newEntry.date}
                      onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                      className="border p-2 rounded"
                    />
                    <select
                      value={newEntry.jobName}
                      onChange={(e) => setNewEntry({ ...newEntry, jobName: e.target.value })}
                      className="border p-2 rounded"
                    >
                      <option value="">Select Job</option>
                      {jobs.map((job) => (
                        <option key={job} value={job}>{job}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={newEntry.hours}
                      onChange={(e) => setNewEntry({ ...newEntry, hours: parseFloat(e.target.value) })}
                      step="0.25"
                      min="0"
                      max="24"
                      className="border p-2 rounded"
                    />
                  </div>
                  <button 
                    onClick={handleAddEntry}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
                  >
                    Add Entry
                  </button>
                  <button 
                    onClick={handleCompleteTimesheet}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Mark as Completed
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timesheet;
