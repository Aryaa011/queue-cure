'use client';
import { useState, useEffect } from 'react';
import io from 'socket.io-client';

let socket: any;

export default function WaitingPage() {
  const [queueData, setQueueData] = useState<any>(null);
  const [prevToken, setPrevToken] = useState<any>(null);
  const [flash, setFlash] = useState(false);

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

  const estimatedWait = (position: number) => {
    const avg = queueData?.avg_consultation_time || 10;
    return position * avg;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">🏥</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Queue Cure</h1>
            <p className="text-xs text-gray-400">Patient Waiting Room</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">Live updates</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Current Token — BIG */}
        <div className={`rounded-3xl p-10 text-center mb-8 transition-all duration-300 ${
          flash ? 'bg-blue-600 scale-105' : 'bg-blue-50'
        }`}>
          <p className={`text-sm font-semibold uppercase tracking-widest mb-3 ${
            flash ? 'text-blue-100' : 'text-blue-400'
          }`}>
            Now Serving
          </p>
          <div className={`text-9xl font-black mb-3 ${
            flash ? 'text-white' : 'text-blue-600'
          }`}>
            {queueData?.current_token
              ? `${queueData.current_token.token_number}`
              : '—'}
          </div>
          <p className={`text-lg font-medium ${
            flash ? 'text-blue-100' : 'text-gray-600'
          }`}>
            {queueData?.current_token?.patient_name || 'Waiting for first patient'}
          </p>
          {flash && (
            <p className="text-white text-sm mt-2 animate-bounce">🔔 Token Updated!</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
            <p className="text-xs text-gray-400 font-medium">Waiting</p>
            <p className="text-3xl font-black text-gray-900 mt-1">{queueData?.total_waiting || 0}</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
            <p className="text-xs text-gray-400 font-medium">Avg Time</p>
            <p className="text-3xl font-black text-gray-900 mt-1">{queueData?.avg_consultation_time || 10}<span className="text-base font-normal">m</span></p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
            <p className="text-xs text-gray-400 font-medium">Your Wait</p>
            <p className="text-3xl font-black text-orange-500 mt-1">
              {queueData?.total_waiting ? `~${estimatedWait(queueData.total_waiting)}m` : '0m'}
            </p>
          </div>
        </div>

        {/* Queue List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Upcoming Tokens</h2>
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">
              Next 5
            </span>
          </div>
          {!queueData?.queue?.length ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-2">✅</p>
              <p className="text-gray-400 text-sm">No patients waiting</p>
            </div>
          ) : (
            queueData?.queue?.slice(0, 5).map((p: any, i: number) => (
              <div key={p.id} className={`flex items-center justify-between px-6 py-4 border-b border-gray-50 ${
                i === 0 ? 'bg-blue-50' : ''
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    i === 0 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {p.token_number}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.patient_name}</p>
                    <p className="text-xs text-gray-400">Position {i + 1}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">~{estimatedWait(i + 1)} min</p>
                  <p className="text-xs text-gray-400">est. wait</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-6">
          This screen updates automatically. No need to refresh.
        </p>
      </div>
    </div>
  );
} 