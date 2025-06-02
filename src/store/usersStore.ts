import { create } from 'zustand';
import type { User } from '../types';

interface UsersState {
  users: User[];
  loading: boolean;
  setUsers: (users: User[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useUsersStore = create<UsersState>((set) => ({
  users: [],
  loading: false,
  setUsers: (users) => set({ users }),
  setLoading: (loading) => set({ loading }),
}));
