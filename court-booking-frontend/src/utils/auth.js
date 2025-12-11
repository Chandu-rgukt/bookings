import axios from 'axios';

export function setToken(token){
  if (token){
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  }
}

export function getToken(){
  return localStorage.getItem('token');
}
