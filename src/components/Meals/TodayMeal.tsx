import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Grid,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Paper
} from '@mui/material';
import { Edit, Delete, Restaurant } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { firebaseService } from '../../services/firebaseService';
import { useAuthStore } from '../../store/authStore';
import { useConsumedMealsStore } from '../../store/consumedMealsStore';
import type { ConsumedMeal } from '../../types';

const TodayMeals: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { consumedMeals, setConsumedMeals, removeConsumedMeal } = useConsumedMealsStore();
  const [todayMeals, setTodayMeals] = useState<ConsumedMeal[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    mealId: string;
    mealName: string;
  }>({ open: false, mealId: '', mealName: '' });

  const today = dayjs().format('YYYY-MM-DD');

  useEffect(() => {
    if (user) {
      loadTodayMeals();
    }
  }, [user]);

  useEffect(() => {
    filterTodayMeals();
  }, [consumedMeals]);

  const loadTodayMeals = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const meals = await firebaseService.getConsumedMealsByDate(user.id, today);
      setConsumedMeals(meals);
    } catch (err) {
      console.error('Error loading today meals:', err);
    }
    setLoading(false);
  };

  const filterTodayMeals = () => {
    const filtered = consumedMeals.filter(meal => meal.date === today);
    setTodayMeals(filtered);
  };

  const getTotalCalories = () => {
    return todayMeals.reduce((total, meal) => total + meal.calories, 0);
  };

  const getMealsByType = (type: 'breakfast' | 'lunch' | 'dinner') => {
    return todayMeals.filter(meal => meal.mealType === type);
  };

  const getMealTypeLabel = (type: 'breakfast' | 'lunch' | 'dinner') => {
    const labels = {
      breakfast: 'Завтрак',
      lunch: 'Обед',
      dinner: 'Ужин'
    };
    return labels[type];
  };

  const getMealTypeColor = (type: 'breakfast' | 'lunch' | 'dinner') => {
    const colors = {
      breakfast: 'warning',
      lunch: 'primary',
      dinner: 'secondary'
    } as const;
    return colors[type];
  };

  const handleEdit = (mealId: string) => {
    navigate(`/edit-meal/${mealId}`);
  };

  const handleDeleteClick = (mealId: string, mealName: string) => {
    setDeleteDialog({ open: true, mealId, mealName });
  };

  const handleDeleteConfirm = async () => {
    const { mealId } = deleteDialog;
    try {
      await firebaseService.deleteConsumedMeal(mealId);
      removeConsumedMeal(mealId);
      setDeleteDialog({ open: false, mealId: '', mealName: '' });
    } catch (err) {
      console.error('Error deleting meal:', err);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, mealId: '', mealName: '' });
  };

  const renderMealCard = (meal: ConsumedMeal) => (
    <Card key={meal.id} sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Typography variant="h6" component="div">
              {meal.mealName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {meal.calories} калорий
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip 
              label={getMealTypeLabel(meal.mealType)} 
              color={getMealTypeColor(meal.mealType)}
              size="small"
            />
            <Button
              size="small"
              startIcon={<Edit />}
              onClick={() => handleEdit(meal.id)}
            >
              Редактировать
            </Button>
            <Button
              size="small"
              color="error"
              startIcon={<Delete />}
              onClick={() => handleDeleteClick(meal.id, meal.mealName)}
            >
              Удалить
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const renderMealSection = (type: 'breakfast' | 'lunch' | 'dinner') => {
    const meals = getMealsByType(type);
    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);

    return (
      <Box key={type} sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ mr: 2 }}>
            {getMealTypeLabel(type)}
          </Typography>
          <Chip 
            label={`${totalCalories} калорий`}
            color={getMealTypeColor(type)}
          />
        </Box>
        
        {meals.length > 0 ? (
          meals.map(renderMealCard)
        ) : (
          <Alert severity="info" sx={{ mb: 2 }}>
            Нет блюд на {getMealTypeLabel(type).toLowerCase()}
          </Alert>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Сегодняшние блюда
        </Typography>
        <Button
          variant="contained"
          startIcon={<Restaurant />}
          onClick={() => navigate('/add-meal')}
        >
          Добавить блюдо
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Общая сумма калорий за сегодня
        </Typography>
        <Typography variant="h3" align="center" color="primary">
          {getTotalCalories()} калорий
        </Typography>
        {user?.dailyCalorieGoal && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Цель: {user.dailyCalorieGoal} калорий
            </Typography>
            <Typography 
              variant="body2" 
              color={getTotalCalories() > user.dailyCalorieGoal ? 'error' : 'success'}
            >
              {getTotalCalories() > user.dailyCalorieGoal 
                ? `Превышение на ${getTotalCalories() - user.dailyCalorieGoal} калорий`
                : `Осталось ${user.dailyCalorieGoal - getTotalCalories()} калорий`
              }
            </Typography>
          </Box>
        )}
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12}>
          {(['breakfast', 'lunch', 'dinner'] as const).map(renderMealSection)}
        </Grid>
      </Grid>

      {todayMeals.length === 0 && (
        <Alert severity="info" sx={{ mt: 4 }}>
          Вы еще не добавили ни одного блюда на сегодня. 
          <Button 
            variant="text" 
            onClick={() => navigate('/add-meal')}
            sx={{ ml: 1 }}
          >
            Добавить первое блюдо
          </Button>
        </Alert>
      )}

      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить "{deleteDialog.mealName}" из списка съеденных блюд?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Отмена</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TodayMeals;