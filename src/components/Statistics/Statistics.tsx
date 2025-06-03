import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { TrendingUp, Assessment, CalendarToday } from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import { firebaseService } from '../../services/firebaseService';
import { useAuthStore } from '../../store/authStore';
import type { ConsumedMeal, CaloriesByDate, CaloriesByType, ChartDataPoint, PieChartData } from '../../types';

const Statistics: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [consumedMeals, setConsumedMeals] = useState<ConsumedMeal[]>([]);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'custom'>('week');
  const [customStartDate, setCustomStartDate] = useState<Dayjs>(dayjs().subtract(7, 'day'));
  const [customEndDate, setCustomEndDate] = useState<Dayjs>(dayjs());

  useEffect(() => {
    if (user) {
      loadStatisticsData();
    }
  }, [user, dateRange, customStartDate, customEndDate]);

  const loadStatisticsData = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const { startDate, endDate } = getDateRange();
      const meals = await firebaseService.getConsumedMealsByDateRange(
        user.id,
        startDate.format('YYYY-MM-DD'),
        endDate.format('YYYY-MM-DD')
      );
      setConsumedMeals(meals);
    } catch (err) {
      setError('Ошибка загрузки статистики');
    }
    setLoading(false);
  };

  const getDateRange = () => {
    const today = dayjs();
    let startDate: Dayjs;
    let endDate: Dayjs = today;

    switch (dateRange) {
      case 'week':
        startDate = today.subtract(7, 'day');
        break;
      case 'month':
        startDate = today.subtract(30, 'day');
        break;
      case 'custom':
        startDate = customStartDate;
        endDate = customEndDate;
        break;
      default:
        startDate = today.subtract(7, 'day');
    }

    return { startDate, endDate };
  };

  const processChartData = (): ChartDataPoint[] => {
    const { startDate, endDate } = getDateRange();
    const data: ChartDataPoint[] = [];
    
    let currentDate = startDate;
    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
      const dateStr = currentDate.format('YYYY-MM-DD');
      const dayMeals = consumedMeals.filter(meal => meal.date === dateStr);
      
      const breakfast = dayMeals
        .filter(meal => meal.mealType === 'breakfast')
        .reduce((sum, meal) => sum + meal.calories, 0);
      
      const lunch = dayMeals
        .filter(meal => meal.mealType === 'lunch')
        .reduce((sum, meal) => sum + meal.calories, 0);
      
      const dinner = dayMeals
        .filter(meal => meal.mealType === 'dinner')
        .reduce((sum, meal) => sum + meal.calories, 0);
      
      data.push({
        date: currentDate.format('DD.MM'),
        breakfast,
        lunch,
        dinner,
        total: breakfast + lunch + dinner
      });
      
      currentDate = currentDate.add(1, 'day');
    }
    
    return data;
  };

  const processPieData = (): PieChartData[] => {
    const totals = consumedMeals.reduce(
      (acc, meal) => {
        acc[meal.mealType] += meal.calories;
        return acc;
      },
      { breakfast: 0, lunch: 0, dinner: 0 }
    );

    return [
      { name: 'Завтрак', value: totals.breakfast, color: '#FF8042' },
      { name: 'Обед', value: totals.lunch, color: '#0088FE' },
      { name: 'Ужин', value: totals.dinner, color: '#00C49F' }
    ].filter(item => item.value > 0);
  };

  const getStatistics = () => {
    const totalCalories = consumedMeals.reduce((sum, meal) => sum + meal.calories, 0);
    const uniqueDays = new Set(consumedMeals.map(meal => meal.date)).size;
    const averageDaily = uniqueDays > 0 ? Math.round(totalCalories / uniqueDays) : 0;
    
    const goalProgress = user?.dailyCalorieGoal ? {
      target: user.dailyCalorieGoal,
      actual: averageDaily,
      percentage: Math.round((averageDaily / user.dailyCalorieGoal) * 100)
    } : null;

    return {
      totalCalories,
      averageDaily,
      totalDays: uniqueDays,
      goalProgress
    };
  };

  const chartData = processChartData();
  const pieData = processPieData();
  const statistics = getStatistics();

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Assessment />
        Статистика калорий
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarToday />
          Период анализа
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' } }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Период</InputLabel>
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as 'week' | 'month' | 'custom')}
              label="Период"
            >
              <MenuItem value="week">Неделя</MenuItem>
              <MenuItem value="month">Месяц</MenuItem>
              <MenuItem value="custom">Произвольный</MenuItem>
            </Select>
          </FormControl>

          {dateRange === 'custom' && (
            <>
              <DatePicker
                label="Начало периода"
                value={customStartDate}
                onChange={(newValue) => newValue && setCustomStartDate(newValue)}
                maxDate={dayjs()}
              />
              <DatePicker
                label="Конец периода"
                value={customEndDate}
                onChange={(newValue) => newValue && setCustomEndDate(newValue)}
                maxDate={dayjs()}
                minDate={customStartDate}
              />
            </>
          )}
        </Box>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                Общие калории
              </Typography>
              <Typography variant="h4">
                {statistics.totalCalories.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                за выбранный период
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                Среднее в день
              </Typography>
              <Typography variant="h4">
                {statistics.averageDaily.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                калорий в день
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                Дней отслеживания
              </Typography>
              <Typography variant="h4">
                {statistics.totalDays}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                активных дней
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        {statistics.goalProgress && (
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">
                  Прогресс цели
                </Typography>
                <Typography variant="h4">
                  {statistics.goalProgress.percentage}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  от цели {statistics.goalProgress.target} ккал
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp />
              Калории по дням
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="breakfast" stroke="#FF8042" name="Завтрак" />
                  <Line type="monotone" dataKey="lunch" stroke="#0088FE" name="Обед" />
                  <Line type="monotone" dataKey="dinner" stroke="#00C49F" name="Ужин" />
                  <Line type="monotone" dataKey="total" stroke="#8884d8" name="Всего" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assessment />
              Распределение калорий
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp />
              Сравнение по дням
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="breakfast" fill="#FF8042" name="Завтрак" />
                  <Bar dataKey="lunch" fill="#0088FE" name="Обед" />
                  <Bar dataKey="dinner" fill="#00C49F" name="Ужин" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Statistics;