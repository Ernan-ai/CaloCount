import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import { firebaseService } from '../../services/firebaseService';
import { mealService } from '../../services/mealService';
import { useAuthStore } from '../../store/authStore';
import { useConsumedMealsStore } from '../../store/consumedMealsStore';
import type { ConsumedMeal, Meal } from '../../types';

const AddMealForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const { addConsumedMeal, updateConsumedMeal } = useConsumedMealsStore();

  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast');
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [calories, setCalories] = useState<number>(0);
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadMeals();
    
    if (id) {
      setIsEditing(true);
      loadExistingMeal(id);
    }
    
    const mealId = searchParams.get('mealId');
    const mealName = searchParams.get('mealName');
    if (mealId && mealName) {
      loadSelectedMeal(mealId);
    }
  }, [id, searchParams]);

  const loadMeals = async () => {
    try {
      const randomMeals = await mealService.getRandomMeals(50);
      setMeals(randomMeals);
    } catch (err) {
      setError('Ошибка загрузки блюд');
    }
  };

  const loadSelectedMeal = async (mealId: string) => {
    try {
      const meal = await mealService.getMealById(mealId);
      if (meal) {
        setSelectedMeal(meal);
      }
    } catch (err) {
      console.error('Error loading selected meal:', err);
    }
  };

  const loadExistingMeal = async (mealId: string) => {
    try {
      if (!user) return;
      
      const userMeals = await firebaseService.getUserConsumedMeals(user.id);
      const existingMeal = userMeals.find(m => m.id === mealId);
      
      if (existingMeal) {
        setMealType(existingMeal.mealType);
        setCalories(existingMeal.calories);
        setDate(dayjs(existingMeal.date));
        
        
        const meal = await mealService.getMealById(existingMeal.mealId);
        if (meal) {
          setSelectedMeal(meal);
        }
      }
    } catch (err) {
      setError('Ошибка загрузки данных блюда');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedMeal) return;

    
    if (date.isAfter(dayjs(), 'day')) {
      setError('Нельзя указывать будущую дату');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const mealData: Omit<ConsumedMeal, 'id'> = {
        userId: user.id,
        mealId: selectedMeal.idMeal,
        mealName: selectedMeal.strMeal,
        mealType,
        calories,
        date: date.format('YYYY-MM-DD'),
        createdAt: dayjs().toISOString()
      };

      if (isEditing && id) {
        await firebaseService.updateConsumedMeal(id, mealData);
        updateConsumedMeal({ ...mealData, id });
      } else {
        const newId = await firebaseService.addConsumedMeal(mealData);
        addConsumedMeal({ ...mealData, id: newId });
      }

      navigate('/today');
    } catch (err) {
      setError('Ошибка сохранения данных');
    }
    setLoading(false);
  };

  const mealTypeOptions = [
    { value: 'breakfast', label: 'Завтрак' },
    { value: 'lunch', label: 'Обед' },
    { value: 'dinner', label: 'Ужин' }
  ];

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditing ? 'Редактировать блюдо' : 'Добавить съеденное блюдо'}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Тип приема пищи</InputLabel>
            <Select
              value={mealType}
              onChange={(e) => setMealType(e.target.value as 'breakfast' | 'lunch' | 'dinner')}
              label="Тип приема пищи"
            >
              {mealTypeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Autocomplete
            fullWidth
            options={meals}
            getOptionLabel={(option) => option.strMeal}
            value={selectedMeal}
            onChange={(_, newValue) => setSelectedMeal(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Название блюда"
                margin="normal"
                required
              />
            )}
            sx={{ mt: 2, mb: 2 }}
          />

          <TextField
            fullWidth
            label="Калории"
            type="number"
            value={calories}
            onChange={(e) => setCalories(Number(e.target.value))}
            margin="normal"
            required
            inputProps={{ min: 0 }}
          />

          <DatePicker
            label="Дата"
            value={date}
            onChange={(newValue) => newValue && setDate(newValue)}
            maxDate={dayjs()}
            slotProps={{
              textField: {
                fullWidth: true,
                margin: 'normal',
                required: true
              }
            }}
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !selectedMeal}
              sx={{ flex: 1 }}
            >
              {loading ? 'Сохранение...' : (isEditing ? 'Обновить' : 'Добавить')}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/today')}
              sx={{ flex: 1 }}
            >
              Отмена
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default AddMealForm;