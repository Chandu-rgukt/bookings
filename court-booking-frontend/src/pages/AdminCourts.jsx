import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminCourts(){
  const [items,setItems] = useState([]);
  const [name,setName] = useState('');
  const [type,setType] = useState('indoor');
  const [basePrice,setBasePrice] = useState(0);
  const [loading,setLoading] = useState(false);
  const navigate = useNavigate();

  async function load(){
    setLoading(true);
    try{
      const r = await axios.get('/api/courts');
      setItems(r.data || []);
    }catch(err){
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        navigate('/login');
        return;
      }
      console.error('load courts error', err);
      alert('Failed to load courts. Check console for details.');
    }finally{
      setLoading(false);
    }
  }

  async function add(){
    try{
      await axios.post('/api/courts', { name, type, basePrice: Number(basePrice), enabled: true });
      setName('');
      setType('indoor');
      setBasePrice(0);
      load();
    }catch(err){
      const status = err?.response?.status;
      if (status === 401 || status === 403) { navigate('/login'); return; }
      console.error('add court error', err);
      alert('Failed to add court');
    }
  }

  async function toggle(id, enabled){
    try{
      await axios.patch(`/api/courts/${id}`, { enabled: !enabled });
      load();
    }catch(err){
      const status = err?.response?.status;
      if (status === 401 || status === 403) { navigate('/login'); return; }
      console.error('toggle court error', err);
      alert('Failed to toggle court');
    }
  }

  useEffect(()=>{ load(); },[]);

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-2">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Court Name" className="border p-2" />
        <select value={type} onChange={e=>setType(e.target.value)} className="border p-2">
          <option value="indoor">indoor</option>
          <option value="outdoor">outdoor</option>
        </select>
        <input value={basePrice} onChange={e=>setBasePrice(e.target.value)} type="number" placeholder="Base Price" className="border p-2" />
        <button onClick={add} className="bg-black text-white px-3 py-2 rounded">Add</button>
      </div>

      {loading && <div className="p-3">Loading courts...</div>}

      <div className="space-y-3">
        {items.map(c=>(
          <div key={c._id} className="border p-3 flex justify-between">
            <div>{c.name} | {c.type} | {c.basePrice}</div>
            <button onClick={()=>toggle(c._id, c.enabled)} className="px-3 py-1 bg-gray-800 text-white rounded">
              {c.enabled ? 'Disable' : 'Enable'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
