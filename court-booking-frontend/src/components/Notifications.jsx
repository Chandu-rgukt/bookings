import React, { useEffect, useState } from 'react';
import axios from 'axios';
export default function Notifications(){
  const [notes,setNotes] = useState([]);
  useEffect(()=>{ fetch(); const iv = setInterval(fetch, 15000); return ()=>clearInterval(iv); },[]);
  async function fetch(){
    const me = await axios.get('/api/me');
    const userId = me.data.userId;
    const r = await axios.get(`/api/notifications/${userId}`);
    setNotes(r.data.notifications || []);
  }
  async function mark(id){
    await axios.post(`/api/notifications/${id}/read`);
    setNotes(notes.map(n=> n._id===id ? { ...n, read: true } : n));
  }
  return (
    <div className="p-3 border rounded max-h-80 overflow-auto">
      <div className="font-semibold mb-2">Notifications</div>
      <div className="space-y-2">
        {notes.map(n=>(
          <div key={n._id} className={`p-2 rounded ${n.read? 'bg-gray-100':'bg-yellow-50'}`}>
            <div>{n.data && n.data.message ? n.data.message : n.type}</div>
            <div className="text-xs mt-1">
              <button onClick={()=>mark(n._id)} className="text-sm text-blue-600">Mark read</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
