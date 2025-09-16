import { createSlice } from '@reduxjs/toolkit';

const savedData = JSON.parse(localStorage.getItem('user'));

const initialState = {
  user: savedData?.user || null,
  token: savedData?.token || null,
  isAuthenticated: !!savedData,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify({ user, token }));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;

export default authSlice.reducer;
