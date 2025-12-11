import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BookingModal from './BookingModal';

function normalizeDateInput(value){
  if (!value) return null;
  // If already YYYY-MM-DD return as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  // If DD-MM-YYYY or DD/MM/YYYY -> convert to YYYY-MM-DD
  const dmy = value.match(/^(\d{2})[-\/](\d{2})[-\/](\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  // Last-resort: try Date parsing to ISO date
  const parsed = new Date(value);
  if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0,10);
  return null;
}

export default function SlotGrid(){
  const todayIso = new Date().toISOString().slice(0,10);
  const [date, setDate] = useState(todayIso);
  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(()=>{ fetchSlots(); },[date]);

  async function fetchSlots(){
  setLoading(true);
  setError(null);
  const d = normalizeDateInput(date);
  if (!d) {
    setError('Invalid date format');
    setSlots([]);
    setLoading(false);
    return;
  }
  try{
    const relative = `/api/availability?date=${encodeURIComponent(d)}&startHour=6&endHour=22&slotMinutes=60`;
    const full = axios.defaults.baseURL ? axios.defaults.baseURL + relative : relative;
    console.log('fetching availability ->', full);
    const r = await axios.get(relative, { timeout: 8000 });
    console.log('availability response', r.status, r.data);
    if (r.data && Array.isArray(r.data.slots)) {
      setSlots(r.data.slots);
      if (r.data.slots.length === 0) setError('No slots returned for this date');
    } else {
      setSlots([]);
      setError('Unexpected response from server');
    }
  }catch(e){
    console.error('fetchSlots error', e);
    if (e.response && e.response.data) setError(`Server: ${e.response.data.error || JSON.stringify(e.response.data)}`);
    else setError('Network or server error (see console)');
    setSlots([]);
  }finally{
    setLoading(false);
  }
}


  return (
    <div>
      <div className="mb-3 flex gap-2 items-center">
        <input
          value={date}
          onChange={e => setDate(e.target.value)}
          type="date"
          placeholder="YYYY-MM-DD or DD-MM-YYYY"
          className="border p-2"
        />
        <button onClick={fetchSlots} className="bg-slate-700 text-white px-3 py-2 rounded">Refresh</button>
      </div>

      {loading && <div className="p-3">Loading slots...</div>}

      {error && !loading && <div className="p-3 text-red-600">{error}</div>}

      {!loading && slots.length === 0 && !error && <div className="p-3 text-gray-500">No slots available</div>}

      <div className="space-y-3">
        {slots.map(s => (
          <div key={s.slotStart} className="p-3 border rounded">
            <div className="flex justify-between">
              <div>{new Date(s.slotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(s.slotEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              <div className="flex gap-2">
                <button onClick={()=>setSelected(s)} className="bg-blue-600 text-white px-2 py-1 rounded">Book</button>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {s.courts.map(c => <div key={c.id} className={`p-2 rounded ${c.available? 'bg-green-100':'bg-red-100'}`}>{c.name} {c.available? 'Available':'Taken'}</div>)}
            </div>
          </div>
        ))}
      </div>

      {selected && <BookingModal slot={selected} onClose={()=>{ setSelected(null); fetchSlots(); }} />}
    </div>
  );
}
