import React, { useEffect, useState } from 'react';
import axios from 'axios';
export default function BookingHistory(){
  const [items,setItems] = useState([]);
  useEffect(()=>{ fetch(); },[]);
  async function fetch(){
    const me = await axios.get('/api/me');
    const userId = me.data.userId;
    const r = await axios.get(`/api/user/${userId}/bookings`);
    setItems(r.data.bookings || []);
  }
  async function cancel(id){
    await axios.post(`/api/user/booking/${id}/cancel`);
    fetch();
  }
  return (
    <div>
      <h2 className="text-lg mb-2">My Bookings</h2>
      <div className="space-y-3">
        {items.map(b=>(
          <div key={b._id} className="p-3 border rounded">
            <div>{b.court.name} {new Date(b.startTime).toLocaleString()}</div>
            <div className="mt-2">
              <button onClick={()=>cancel(b._id)} className="bg-red-600 text-white px-2 py-1 rounded">Cancel</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
