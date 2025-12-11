import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminCoaches(){
  const [items,setItems] = useState([]);
  const [name,setName] = useState('');
  const [rate,setRate] = useState(0);

  async function load(){
    const r = await axios.get('/api/coaches');
    setItems(r.data);
  }

  async function add(){
    await axios.post('/api/coaches', { name, hourlyRate: Number(rate), enabled: true, availability: [] });
    setName('');
    setRate(0);
    load();
  }

  async function toggle(id, enabled){
    await axios.patch(`/api/coaches/${id}`, { enabled: !enabled });
    load();
  }

  useEffect(()=>{ load(); },[]);

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-2">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Coach Name" className="border p-2" />
        <input value={rate} onChange={e=>setRate(e.target.value)} type="number" placeholder="Hourly Rate" className="border p-2" />
        <button onClick={add} className="bg-black text-white px-3 py-2 rounded">Add</button>
      </div>

      <div className="space-y-3">
        {items.map(c=>(
          <div key={c._id} className="border p-3 flex justify-between items-center">
            <div>{c.name} | {c.hourlyRate} | {c.enabled ? 'available' : 'unavailable'}</div>
            <button onClick={()=>toggle(c._id, c.enabled)} className="px-3 py-1 bg-gray-800 text-white rounded">
              {c.enabled ? 'Mark unavailable' : 'Mark available'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
