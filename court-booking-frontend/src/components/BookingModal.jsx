import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
export default function BookingModal({ slot, onClose }){
  const [courts,setCourts] = useState(slot.courts || []);
  const [equipments,setEquipments] = useState(slot.equipments || []);
  const [coaches,setCoaches] = useState(slot.coaches || []);
  const [selectedCourt,setSelectedCourt] = useState(null);
  const [selectedEquip,setSelectedEquip] = useState([]);
  const [selectedCoach,setSelectedCoach] = useState(null);
  const [pricing,setPricing] = useState(null);
  const [token,setToken] = useState(null);
  const tokenRef = useRef(null);
  useEffect(()=>{ setCourts(slot.courts); setEquipments(slot.equipments); setCoaches(slot.coaches); },[slot]);
  useEffect(()=>{ preview(); },[selectedCourt,selectedEquip,selectedCoach]);
  useEffect(()=>{ return ()=>{ if (tokenRef.current) { axios.post('/api/reservation/release', { key: tokenRef.current }).catch(()=>{}); } } },[]);
  async function preview(){
    if (!selectedCourt) return setPricing(null);
    const body = { courtId: selectedCourt, startTime: slot.slotStart, endTime: slot.slotEnd, equipments: selectedEquip.map(e=>({ equipment: e.id, quantity: e.quantity })), coachId: selectedCoach };
    const r = await axios.post('/api/bookings/preview', body);
    setPricing(r.data.pricing);
  }
  function toggleEquip(id){
    const found = selectedEquip.find(x=>x.id===id);
    if (found) setSelectedEquip(selectedEquip.filter(x=>x.id!==id));
    else{
      const e = equipments.find(x=>String(x.id)===String(id));
      setSelectedEquip([...selectedEquip, { id: e.id, quantity: 1 }]);
    }
  }
  function setEquipQuantity(id, quantity){
    if (quantity < 1) return;
    setSelectedEquip(selectedEquip.map(e=> e.id===id ? { ...e, quantity } : e));
  }
  async function obtainToken(){
    if (!selectedCourt) return null;
    try{
      const r = await axios.post('/api/reservation/token', { courtId: selectedCourt, startTime: slot.slotStart, ttlSeconds: 45 });
      if (r.data && r.data.token){
        setToken(r.data.token);
        tokenRef.current = r.data.token;
        return r.data.token;
      }
    }catch(e){
      return null;
    }
    return null;
  }
  async function confirm(){
  if (!selectedCourt) return;
  let tokenToUse = token;
  if (!tokenToUse){
    tokenToUse = await obtainToken();
    if (!tokenToUse){
      alert('Could not obtain reservation token. Try again');
      return;
    }
  }
  try {
    const me = await axios.get('/api/me');
    const userId = me.data.userId || null;
    const body = { userId, courtId: selectedCourt, startTime: slot.slotStart, endTime: slot.slotEnd, equipments: selectedEquip.map(e=>({ equipment: e.id, quantity: e.quantity })), coachId: selectedCoach, reservationToken: tokenToUse };
    const r = await axios.post('/api/bookings/create', body);
    if (r.data.ok) {
      if (tokenRef.current) { await axios.post('/api/reservation/release', { key: tokenRef.current }).catch(()=>{}); tokenRef.current = null; }
      onClose();
      alert('Booked');
    } else {
      alert('Booking failed: ' + (r.data.error || JSON.stringify(r.data)));
    }
  } catch(e) {
    console.error('Booking error', e);
    const serverBody = e.response && e.response.data ? e.response.data : null;
    console.error('serverBody', serverBody);
    alert('Booking failed. Server response: ' + (serverBody && (serverBody.error || serverBody.message) ? (serverBody.error || serverBody.message) : JSON.stringify(serverBody)));
  }
}

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white p-4 rounded w-11/12 md:w-2/3">
        <div className="flex justify-between items-center mb-2">
          <div>Book slot {new Date(slot.slotStart).toLocaleTimeString()}</div>
          <button onClick={async ()=>{ if (tokenRef.current) { await axios.post('/api/reservation/release', { key: tokenRef.current }).catch(()=>{}); tokenRef.current = null; } onClose(); }} className="px-2">Close</button>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="font-semibold">Courts</div>
            <div className="space-y-2">
              {courts.map(c=>(
                <div key={c.id} className="flex items-center gap-2">
                  <input type="radio" name="court" value={c.id} onChange={()=>{ setSelectedCourt(c.id); setToken(null); if (tokenRef.current) { axios.post('/api/reservation/release', { key: tokenRef.current }).catch(()=>{}); tokenRef.current = null; } }} disabled={!c.available}/>
                  <div>{c.name} - {c.available? 'Available':'Taken'}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 font-semibold">Equipments</div>
            <div className="space-y-2">
              {equipments.map(e=>(
                <div key={e.id} className="flex items-center gap-2">
                  <input type="checkbox" onChange={()=>toggleEquip(e.id)} checked={!!selectedEquip.find(x=>x.id===e.id)} disabled={e.quantityAvailable<=0}/>
                  <div className="flex items-center gap-2">
                    <span>{e.name} ({e.quantityAvailable} available)</span>
                    {selectedEquip.find(x=>x.id===e.id) && (
                      <input type="number" min="1" max={e.quantityAvailable} value={selectedEquip.find(x=>x.id===e.id)?.quantity || 1} onChange={ev=>setEquipQuantity(e.id, Number(ev.target.value))} className="w-16 border p-1"/>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="font-semibold">Coaches</div>
            <div className="space-y-2">
              {coaches.map(ch=>(
                <div key={ch.id} className="flex items-center gap-2">
                  <input type="radio" name="coach" value={ch.id} onChange={()=>setSelectedCoach(ch.id)} disabled={!ch.available}/>
                  <div>{ch.name} - {ch.available? 'Available':'Not'}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 font-semibold">Price</div>
            <div>
              {pricing? (
                <div>
                  <div>Base: {pricing.basePrice}</div>
                  <div>Equipment: {pricing.equipmentFee}</div>
                  <div>Coach: {pricing.coachFee}</div>
                  <div className="font-semibold">Total: {pricing.total}</div>
                </div>
              ) : <div>Select court to see price</div>}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button onClick={confirm} className="bg-green-600 text-white px-3 py-2 rounded">Confirm</button>
              <div>
                {token ? <div className="text-sm">Token acquired</div> : <div className="text-sm text-gray-500">No token</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
