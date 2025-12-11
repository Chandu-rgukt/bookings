import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminEquipment(){
  const [items,setItems] = useState([]);
  const [name,setName] = useState('');
  const [quantity,setQuantity] = useState(0);
  const [price,setPrice] = useState(0);

  async function load(){
    const r = await axios.get('/api/equipment');
    setItems(r.data);
  }

  async function add(){
    await axios.post('/api/equipment', { name, quantity: Number(quantity), pricePerUnit: Number(price), enabled: true });
    setName('');
    setQuantity(0);
    setPrice(0);
    load();
  }

  async function toggle(id, enabled){
    await axios.patch(`/api/equipment/${id}`, { enabled: !enabled });
    load();
  }

  useEffect(()=>{ load(); },[]);

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-2">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Equipment Name" className="border p-2" />
        <input value={quantity} onChange={e=>setQuantity(e.target.value)} type="number" placeholder="Qty" className="border p-2" />
        <input value={price} onChange={e=>setPrice(e.target.value)} type="number" placeholder="Price" className="border p-2" />
        <button onClick={add} className="bg-black text-white px-3 py-2 rounded">Add</button>
      </div>

      <div className="space-y-3">
        {items.map(e=>(
          <div key={e._id} className="border p-3 flex justify-between">
            <div>{e.name} | {e.quantity} | {e.pricePerUnit}</div>
            <button onClick={()=>toggle(e._id, e.enabled)} className="px-3 py-1 bg-gray-800 text-white rounded">
              {e.enabled ? 'Disable' : 'Enable'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
