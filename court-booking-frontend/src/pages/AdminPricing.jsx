import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminPricing(){
  const [items,setItems] = useState([]);
  const [name,setName] = useState('');
  const [type,setType] = useState('surcharge');
  const [value,setValue] = useState(0);
  const [holidayDate,setHolidayDate] = useState('');

  async function load(){
    const r = await axios.get('/api/pricing');
    setItems(r.data);
  }

  async function add(){
    let criteria = {};
    if (type === 'multiplier') criteria = { type:'peak', startHour:18, endHour:21 };
    else if (type === 'surcharge') criteria = { type:'weekend', weekend:true };
    else if (type === 'fixed') criteria = { type:'fixed' };
    if (type === 'holiday' || (type === 'surcharge' && holidayDate)) criteria = { type:'holiday', date: holidayDate };
    await axios.post('/api/pricing', {
      name,
      type,
      value: Number(value),
      enabled: true,
      priority: 1,
      criteria
    });
    setName('');
    setValue(0);
    setHolidayDate('');
    load();
  }

  async function toggle(id, enabled){
    await axios.patch(`/api/pricing/${id}`, { enabled: !enabled });
    load();
  }

  useEffect(()=>{ load(); },[]);

  return (
    <div className="p-4">
      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-2">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Rule Name" className="border p-2" />
        <select value={type} onChange={e=>setType(e.target.value)} className="border p-2">
          <option value="surcharge">surcharge</option>
          <option value="multiplier">multiplier</option>
          <option value="fixed">fixed</option>
          <option value="holiday">holiday</option>
        </select>
        <input value={value} onChange={e=>setValue(e.target.value)} type="number" className="border p-2" placeholder="Value" />
        <input value={holidayDate} onChange={e=>setHolidayDate(e.target.value)} type="date" className="border p-2" />
      </div>

      <div className="mb-4">
        <button onClick={add} className="bg-black text-white px-3 py-2 rounded">Add Rule</button>
      </div>

      <div className="space-y-3">
        {items.map(r=>(
          <div key={r._id} className="border p-3 flex justify-between">
            <div>
              <div className="font-semibold">{r.name}</div>
              <div className="text-sm">{r.type} | {r.value} | {r.enabled ? 'enabled':'disabled'}</div>
              <div className="text-xs text-gray-600">{JSON.stringify(r.criteria)}</div>
            </div>
            <button onClick={()=>toggle(r._id, r.enabled)} className="px-3 py-1 bg-gray-800 text-white rounded">
              {r.enabled ? 'Disable' : 'Enable'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
