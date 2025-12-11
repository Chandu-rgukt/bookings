import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminPricing(){
  const [items,setItems] = useState([]);
  const [name,setName] = useState('');
  const [type,setType] = useState('surcharge'); // pricing rule type: multiplier | surcharge | fixed
  const [criteriaType,setCriteriaType] = useState('weekend'); // weekend | peak | indoor | holiday
  const [value,setValue] = useState(0);
  const [holidayDate,setHolidayDate] = useState('');
  const [startHour,setStartHour] = useState(18);
  const [endHour,setEndHour] = useState(21);

  async function load(){
    const r = await axios.get('/api/pricing');
    setItems(r.data);
  }

  async function add(){
    let criteria = {};
    if (criteriaType === 'peak') criteria = { type:'peak', startHour:Number(startHour), endHour:Number(endHour) };
    if (criteriaType === 'weekend') criteria = { type:'weekend', weekend:true };
    if (criteriaType === 'indoor') criteria = { type:'indoor', indoor:true };
    if (criteriaType === 'holiday') {
      if (!holidayDate) { alert('Select a holiday date'); return; }
      criteria = { type:'holiday', date: holidayDate };
    }
    if (!name) { alert('Name is required'); return; }
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
    setCriteriaType('weekend');
    setStartHour(18);
    setEndHour(21);
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
        </select>
        <select value={criteriaType} onChange={e=>setCriteriaType(e.target.value)} className="border p-2">
          <option value="weekend">weekend</option>
          <option value="peak">peak hours</option>
          <option value="indoor">indoor</option>
          <option value="holiday">holiday</option>
        </select>
        <input value={value} onChange={e=>setValue(e.target.value)} type="number" className="border p-2" placeholder="Value" />
        {criteriaType === 'holiday' && (
          <input value={holidayDate} onChange={e=>setHolidayDate(e.target.value)} type="date" className="border p-2" />
        )}
        {criteriaType === 'peak' && (
          <div className="flex gap-2">
            <input value={startHour} onChange={e=>setStartHour(e.target.value)} type="number" min="0" max="23" className="border p-2 w-full" placeholder="Start hour" />
            <input value={endHour} onChange={e=>setEndHour(e.target.value)} type="number" min="1" max="24" className="border p-2 w-full" placeholder="End hour" />
          </div>
        )}
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
