import React, { useEffect, useState } from 'react';
import {
  Container,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Grid
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { mealService } from '../../services/mealService';
import type { Meal } from '../../types';

const MealDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadMeal(id);
    }
  }, [id]);

  const loadMeal = async (mealId: string) => {
    setLoading(true);
    setError('');
    try {
      const mealData = await mealService.getMealById(mealId);
      setMeal(mealData);
    } catch (err) {
      setError('Ошибка загрузки блюда');
    }
    setLoading(false);
  };

  const handleAddToCount = () => {
    if (meal) {
      navigate(`/add-meal?mealId=${meal.idMeal}&mealName=${encodeURIComponent(meal.strMeal)}`);
    }
  };

  const getIngredients = () => {
    if (!meal) return [];
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push(`${measure ? measure.trim() + ' ' : ''}${ingredient.trim()}`);
      }
    }
    return ingredients;
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !meal) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Блюдо не найдено'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button 
        variant="outlined" 
        onClick={() => navigate('/meals')}
        sx={{ mb: 2 }}
      >
        ← Назад к списку
      </Button>

      <Card>
        <Grid container>
          <Grid item xs={12} md={6}>
            <CardMedia
              component="img"
              image={meal.strMealThumb}
              alt={meal.strMeal}
              sx={{ height: { xs: 300, md: 400 } }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {meal.strMeal}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Chip label={meal.strCategory} color="primary" sx={{ mr: 1 }} />
                <Chip label={meal.strArea} color="secondary" />
              </Box>

              <Button
                variant="contained"
                size="large"
                onClick={handleAddToCount}
                sx={{ mb: 3 }}
              >
                Добавить в подсчет
              </Button>

              {meal.strYoutube && (
                <Button
                  variant="outlined"
                  href={meal.strYoutube}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ ml: 2, mb: 3 }}
                >
                  Видео рецепт
                </Button>
              )}

              <Typography variant="h6" gutterBottom>
                Ингредиенты:
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                {getIngredients().map((ingredient, index) => (
                  <Typography component="li" key={index} variant="body2" sx={{ mb: 0.5 }}>
                    {ingredient}
                  </Typography>
                ))}
              </Box>
            </CardContent>
          </Grid>
        </Grid>
        
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Инструкции по приготовлению:
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {meal.strInstructions}
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default MealDetail;