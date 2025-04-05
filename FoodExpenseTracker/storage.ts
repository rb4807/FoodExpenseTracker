import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, isToday, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, getDay } from 'date-fns';

// Meal prices
export const mealPrices = {
  breakfast: 40,
  lunch: 60,
  dinner: 50
};

// Meal time windows
export const mealTimes = {
  breakfast: { start: 9, end: 11 },
  lunch: { start: 13, end: 15 },
  dinner: { start: 19, end: 22 }
};

export type MealType = 'breakfast' | 'lunch' | 'dinner';

export interface MealData {
  had: boolean;
  amount: number;
}

export interface DailyExpense {
  breakfast: MealData;
  lunch: MealData;
  dinner: MealData;
  date: string;
}

export interface PeriodExpense {
  date: Date;
  total: number;
}

export const loadExpenses = async (): Promise<DailyExpense[]> => {
  try {
    const savedExpenses = await AsyncStorage.getItem('foodExpenses');
    return savedExpenses ? JSON.parse(savedExpenses) : [];
  } catch (error) {
    console.error('Failed to load expenses', error);
    return [];
  }
};

export const saveExpenses = async (expenses: DailyExpense[]): Promise<void> => {
  try {
    await AsyncStorage.setItem('foodExpenses', JSON.stringify(expenses));
  } catch (error) {
    console.error('Failed to save expenses', error);
  }
};

export const getTodayExpense = async (): Promise<DailyExpense> => {
  const expenses = await loadExpenses();
  return expenses.find(exp => isToday(parseISO(exp.date))) || {
    breakfast: { had: false, amount: 0 },
    lunch: { had: false, amount: 0 },
    dinner: { had: false, amount: 0 },
    date: new Date().toISOString()
  };
};

export const updateTodayExpense = async (meal: MealType, hadMeal: boolean): Promise<DailyExpense> => {
  const expenses = await loadExpenses();
  let todayExpense = await getTodayExpense();
  
  // Update the meal data
  todayExpense = {
    ...todayExpense,
    [meal]: {
      had: hadMeal,
      amount: hadMeal ? mealPrices[meal] : 0
    }
  };
  
  // Remove today's expense if it exists
  const filteredExpenses = expenses.filter(exp => !isToday(parseISO(exp.date)));
  
  // Add updated today's expense
  const updatedExpenses = [...filteredExpenses, todayExpense];
  await saveExpenses(updatedExpenses);
  
  return todayExpense;
};

export const getWeeklyExpenses = async (): Promise<PeriodExpense[]> => {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const expenses = await loadExpenses();
  
  return weekDays.map(day => {
    const dayExpense = expenses.find(exp => {
      const expDate = parseISO(exp.date);
      return expDate.getDate() === day.getDate() && 
             expDate.getMonth() === day.getMonth() && 
             expDate.getFullYear() === day.getFullYear();
    }) || { breakfast: { amount: 0 }, lunch: { amount: 0 }, dinner: { amount: 0 } };
    
    return {
      date: day,
      total: dayExpense.breakfast.amount + dayExpense.lunch.amount + dayExpense.dinner.amount
    };
  });
};

export const getMonthlyExpenses = async (): Promise<PeriodExpense[]> => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const expenses = await loadExpenses();
  
  return expenses
    .filter(exp => {
      const expDate = parseISO(exp.date);
      return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    })
    .map(exp => ({
      date: parseISO(exp.date),
      total: exp.breakfast.amount + exp.lunch.amount + exp.dinner.amount
    }));
};

export const checkCurrentMeal = (): MealType | null => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = getDay(now); // 0 (Sunday) to 6 (Saturday)

  // Only show buttons on weekdays (Monday to Friday)
  if (currentDay === 0 || currentDay === 6) return null;

  for (const [meal, time] of Object.entries(mealTimes)) {
    if (currentHour >= time.start && currentHour <= time.end) {
      return meal as MealType;
    }
  }

  return null;
};