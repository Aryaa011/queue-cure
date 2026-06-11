'use client';
import { useState, useEffect } from 'react';
import io from 'socket.io-client';

let socket: any;

export default function ReceptionistPage() {
  const [patientName, setPatientName] = useState('');
  const [avgTime, setAvgTime] = useState(10);
  const [queueData, setQueueData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchQueue = async () => {
    const res = await fetch('/api/queue');
    const data = await res.json();
    setQueueData(data);
  };

  useEffect(() => {
    fetchQueue();
    // Socket for local, polling for deployed
    try {
      socket = io();
      socket.on('queue_updated', fetchQueue);
    } catch(e) {}
    // Polling fallback
    const interval = setInterval(fetchQueue, 3000);
    return () => { 
      clearInterval(interval);
      if(socket) socket.disconnect(); 
    }; 
  }, []);

  const addPatient = async () => {
    if (!patientName.trim()) { setError('Please enter patient name'); return; }
    setError('');
    setLoading(true);
    await fetch('/api/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patient_name: patientName, avg_consultation_time: avgTime })
    });
    setPatientName('');
    setSuccess('Patient added successfully!');
    setTimeout(() => setSuccess(''), 3000);
    setLoading(false);
  };

  const callNext = async () => {
    if (queueData?.total_waiting === 0 && !queueData?.current_token) {
      setError('No patients in queue!');
      setTimeout(() => setError(''), 3000);
      return;
    }
    await fetch('/api/queue', { method: 'PATCH' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">🏥</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Queue Cure</h1>
            <p className="text-xs text-gray-400">Receptionist Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">Live</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
            ✅ {success}
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Now Serving</p>
            <p className="text-4xl font-black text-blue-600 mt-1">
              {queueData?.current_token ? `#${queueData.current_token.token_number}` : '—'}
            </p>
            <p className="text-xs text-gray-500 mt-1 truncate">
              {queueData?.current_token?.patient_name || 'No one yet'}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Waiting</p>
            <p className="text-4xl font-black text-orange-500 mt-1">{queueData?.total_waiting || 0}</p>
            <p className="text-xs text-gray-500 mt-1">patients in queue</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Avg Time</p>
            <p className="text-4xl font-black text-green-600 mt-1">{avgTime}</p>
            <p className="text-xs text-gray-500 mt-1">minutes per patient</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left — Add Patient */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Register Patient</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Patient Name</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={patientName}
                  onChange={e => { setPatientName(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && addPatient()}
                  className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Avg Consultation Time (min)</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={avgTime}
                  onChange={e => setAvgTime(Number(e.target.value))}
                  className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition"
                />
              </div>
              <button
                onClick={addPatient}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 mt-2"
              >
                {loading ? 'Adding...' : '+ Register Patient'}
              </button>
            </div>
          </div>

          {/* Right — Call Next */}
          <div className="flex flex-col gap-4">
            <button
              onClick={callNext}
              className="flex-1 bg-green-600 text-white rounded-2xl text-xl font-bold hover:bg-green-700 active:scale-95 transition shadow-lg shadow-green-100 flex flex-col items-center justify-center gap-2"
            >
              <span className="text-4xl">📢</span>
              <span>Call Next Patient</span>
              {queueData?.total_waiting > 0 && (
                <span className="text-sm font-normal opacity-80">
                  Next: #{(queueData?.queue?.[0]?.token_number)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Queue Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Waiting Queue</h2>
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">
              {queueData?.total_waiting || 0} waiting
            </span>
          </div>
          {!queueData?.queue?.length ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-2">🎉</p>
              <p className="text-gray-400 text-sm">Queue is empty!</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">Token</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">Patient</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">Est. Wait</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {queueData?.queue?.map((p: any, i: number) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-6 py-3">
                      <span className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                        {p.token_number}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-900 font-medium">{p.patient_name}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">~{(i + 1) * avgTime} min</td>
                    <td className="px-6 py-3">
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Waiting</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}  
