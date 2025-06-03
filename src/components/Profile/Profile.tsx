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
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { Person, Save, Fitness } from '@mui/icons-material';
import { firebaseService } from '../../services/firebaseService';
import { useAuthStore } from '../../store/authStore';
import type { ProfileFormData } from '../../types';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<ProfileFormData>({
    displayName: '',
    height: '',
    weight: '',
    age: '',
    gender: '',
    targetWeight: '',
    dailyCalorieGoal: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        height: user.height || '',
        weight: user.weight || '',
        age: user.age || '',
        gender: user.gender || '',
        targetWeight: user.targetWeight || '',
        dailyCalorieGoal: user.dailyCalorieGoal || ''
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof ProfileFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateBMI = () => {
    if (formData.height && formData.weight) {
      const heightM = Number(formData.height) / 100;
      const weightKg = Number(formData.weight);
      return (weightKg / (heightM * heightM)).toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Недостаток веса', color: 'info' };
    if (bmi < 25) return { category: 'Нормальный вес', color: 'success' };
    if (bmi < 30) return { category: 'Избыточный вес', color: 'warning' };
    return { category: 'Ожирение', color: 'error' };
  };

  const calculateRecommendedCalories = () => {
    if (formData.weight && formData.height && formData.age && formData.gender) {
      const weight = Number(formData.weight);
      const height = Number(formData.height);
      const age = Number(formData.age);
      
      // Mifflin-St Jeor Equation
      let bmr;
      if (formData.gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
      } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
      }
      
      // Assuming sedentary lifestyle (BMR * 1.2)
      const tdee = bmr * 1.2;
      return Math.round(tdee);
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData = {
        displayName: formData.displayName,
        height: formData.height ? Number(formData.height) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        age: formData.age ? Number(formData.age) : undefined,
        gender: formData.gender || undefined,
        targetWeight: formData.targetWeight ? Number(formData.targetWeight) : undefined,
        dailyCalorieGoal: formData.dailyCalorieGoal ? Number(formData.dailyCalorieGoal) : undefined,
        updatedAt: new Date().toISOString()
      };

      await firebaseService.updateUser(user.id, updateData);
      updateUser(updateData);
      setSuccess('Профиль успешно обновлен!');
    } catch (err) {
      setError('Ошибка обновления профиля');
    }
    setLoading(false);
  };

  const bmi = calculateBMI();
  const bmiInfo = bmi ? getBMICategory(Number(bmi)) : null;
  const recommendedCalories = calculateRecommendedCalories();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Person />
        Профиль пользователя
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              Личная информация
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Имя"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                margin="normal"
                required
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Рост (см)"
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    margin="normal"
                    inputProps={{ min: 100, max: 250 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Текущий вес (кг)"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    margin="normal"
                    inputProps={{ min: 30, max: 300 }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Возраст"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    margin="normal"
                    inputProps={{ min: 13, max: 120 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Пол</InputLabel>
                    <Select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      label="Пол"
                    >
                      <MenuItem value="male">Мужской</MenuItem>
                      <MenuItem value="female">Женский</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Fitness />
                Цели
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Целевой вес (кг)"
                    type="number"
                    value={formData.targetWeight}
                    onChange={(e) => handleInputChange('targetWeight', e.target.value)}
                    margin="normal"
                    inputProps={{ min: 30, max: 300 }}
                    helperText="Вес, к которому вы стремитесь"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Дневная цель калорий"
                    type="number"
                    value={formData.dailyCalorieGoal}
                    onChange={(e) => handleInputChange('dailyCalorieGoal', e.target.value)}
                    margin="normal"
                    inputProps={{ min: 800, max: 5000 }}
                    helperText={recommendedCalories ? `Рекомендуется: ${recommendedCalories} ккал` : ''}
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<Save />}
                disabled={loading}
                sx={{ mt: 3 }}
              >
                {loading ? 'Сохранение...' : 'Сохранить изменения'}
              </Button>
            </form>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Статистика здоровья
            </Typography>
            
            {bmi && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Индекс массы тела (ИМТ)
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {bmi}
                  </Typography>
                  {bmiInfo && (
                    <Typography variant="body2" color={`${bmiInfo.color}.main`}>
                      {bmiInfo.category}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}

            {recommendedCalories && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Рекомендуемые калории
                  </Typography>
                  <Typography variant="h5" color="secondary">
                    {recommendedCalories} ккал/день
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Базовый метаболизм для поддержания веса
                  </Typography>
                </CardContent>
              </Card>
            )}

            {formData.targetWeight && formData.weight && (
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Прогресс к цели
                  </Typography>
                  <Typography variant="body1">
                    Текущий: {formData.weight} кг
                  </Typography>
                  <Typography variant="body1">
                    Цель: {formData.targetWeight} кг
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {Number(formData.weight) > Number(formData.targetWeight) 
                      ? `Нужно сбросить: ${Number(formData.weight) - Number(formData.targetWeight)} кг`
                      : `Нужно набрать: ${Number(formData.targetWeight) - Number(formData.weight)} кг`
                    }
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;