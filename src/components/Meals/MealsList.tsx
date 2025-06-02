import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { mealService } from '../../services/mealService';
import { useMealsStore } from '../../store/mealsStore';
import type { Meal } from '../../types';

const MealsList: React.FC = () => {
  const navigate = useNavigate();
  const { meals, categories, loading, setMeals, setCategories, setLoading } = useMealsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredMeals, setFilteredMeals] = useState<Meal[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    filterMeals();
  }, [meals, searchQuery, selectedCategory]);

  const loadInitialData = async () => {
    setLoading(true);
    setError('');
    try {
      const [categoriesData, randomMeals] = await Promise.all([
        mealService.getCategories(),
        mealService.getRandomMeals(20)
      ]);
      setCategories(categoriesData);
      setMeals(randomMeals);
    } catch (err) {
      setError('Ошибка загрузки данных');
    }
    setLoading(false);
  };

  const filterMeals = () => {
    let filtered = meals;

    if (searchQuery) {
      filtered = filtered.filter(meal =>
        meal.strMeal.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(meal => meal.strCategory === selectedCategory);
    }

    setFilteredMeals(filtered);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      setLoading(true);
      try {
        const searchResults = await mealService.searchMeals(query);
        setMeals(searchResults);
      } catch (err) {
        setError('Ошибка поиска');
      }
      setLoading(false);
    } else if (query.length === 0) {
      loadInitialData();
    }
  };

  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category);
    if (category) {
      setLoading(true);
      try {
        const categoryMeals = await mealService.getMealsByCategory(category);
        setMeals(categoryMeals);
      } catch (err) {
        setError('Ошибка загрузки категории');
      }
      setLoading(false);
    } else {
      loadInitialData();
    }
  };

  const handleMealClick = (mealId: string) => {
    navigate(`/meals/${mealId}`);
  };

  if (loading && meals.length === 0) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Список блюд
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
        <TextField
          fullWidth
          label="Поиск блюд"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          sx={{ flex: 1 }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Категория</InputLabel>
          <Select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            label="Категория"
          >
            <MenuItem value="">Все категории</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.idCategory} value={category.strCategory}>
                {category.strCategory}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', mb: 2 }} />}

      <Grid container spacing={3}>
        {filteredMeals.map((meal) => (
          <Grid item xs={12} sm={6} md={4} key={meal.idMeal}>
            <Card 
              sx={{ 
                height: '100%', 
                cursor: 'pointer',
                '&:hover': { transform: 'scale(1.02)', transition: 'transform 0.2s' }
              }}
              onClick={() => handleMealClick(meal.idMeal)}
            >
              <CardMedia
                component="img"
                height="200"
                image={meal.strMealThumb}
                alt={meal.strMeal}
              />
              <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                  {meal.strMeal}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Категория: {meal.strCategory}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Кухня: {meal.strArea}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredMeals.length === 0 && !loading && (
        <Typography variant="h6" align="center" sx={{ mt: 4 }}>
          Блюда не найдены
        </Typography>
      )}
    </Container>
  );
};

export default MealsList;