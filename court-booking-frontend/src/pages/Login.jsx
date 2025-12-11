import React, { useState } from 'react';
import axios from 'axios';
import { setToken } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

export default function Login(){
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [error,setError] = useState('');
  const navigate = useNavigate();

  async function submit(e){
    e.preventDefault();
    setError('');
    try{
      const r = await axios.post('/api/auth/login', { email, password });
      if (r.data && r.data.token){
        setToken(r.data.token);
        navigate('/admin/courts');
      } else {
        setError('login-failed');
      }
    }catch(err){
      setError(err.response && err.response.data ? (err.response.data.error || JSON.stringify(err.response.data)) : 'network-error');
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl mb-4">Admin Login</h2>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border p-2" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="w-full border p-2" placeholder="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <div className="flex gap-2">
          <button className="bg-black text-white px-3 py-2 rounded" type="submit">Login</button>
          <button type="button" onClick={()=>{ setEmail('admin@example.com'); setPassword('Admin@123'); }} className="px-3 py-2 border rounded">Fill</button>
        </div>
        {error && <div className="text-red-600">{error}</div>}
      </form>
    </div>
  );
}
