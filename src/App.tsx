import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { useAuthStore } from './store/authStore';
import { firebaseService } from './services/firebaseService';

import Header from './components/Layout/Header';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import MealsList from './components/Meals/MealsList';
import MealDetail from './components/Meals/MealDetail';
import AddMealForm from './components/Meals/AddMealForm';
import TodayMeals from './components/Meals/TodayMeal';
import Profile from './components/Profile/Profile';
import Statistics from './components/Statistics/Statistics';
import UsersList from './components/Users/UsersList';
import UserProfile from './components/Users/UserProfile';

import 'dayjs/locale/ru';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const App: React.FC = () => {
  const { user, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await firebaseService.getUser(firebaseUser.uid);
        if (userData) {
          setUser(userData);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
        <CssBaseline />
        <Router>
          <Header />
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/meals" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/meals" />} />
            <Route path="/meals" element={user ? <MealsList /> : <Navigate to="/login" />} />
            <Route path="/meals/:id" element={user ? <MealDetail /> : <Navigate to="/login" />} />
            <Route path="/add-meal" element={user ? <AddMealForm /> : <Navigate to="/login" />} />
            <Route path="/edit-meal/:id" element={user ? <AddMealForm /> : <Navigate to="/login" />} />
            <Route path="/today" element={user ? <TodayMeals /> : <Navigate to="/login" />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
            <Route path="/statistics" element={user ? <Statistics /> : <Navigate to="/login" />} />
            <Route path="/users" element={user ? <UsersList /> : <Navigate to="/login" />} />
            <Route path="/users/:id" element={user ? <UserProfile /> : <Navigate to="/login" />} />
            <Route path="/" element={<Navigate to="/meals" />} />
          </Routes>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;