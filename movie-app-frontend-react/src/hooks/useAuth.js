import { useContext } from 'react';
import { AuthContext } from '../context/AuthContextContext';

export function useAuth() {
  return useContext(AuthContext);
}