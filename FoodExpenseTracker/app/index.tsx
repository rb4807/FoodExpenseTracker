import { View, Text, ScrollView, StyleSheet, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { MealButton } from '../components/MealButton';
import { MealStatus } from '../components/MealStatus';
import { DailyExpense, getTodayExpense, updateTodayExpense, checkCurrentMeal, MealType, getWeeklyExpenses, getMonthlyExpenses } from './storage';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { format } from 'date-fns';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const [todayExpense, setTodayExpense] = useState<DailyExpense | null>(null);
  const [currentMeal, setCurrentMeal] = useState<MealType | null>(null);
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const loadData = async () => {
    const [expense, weekly, monthly] = await Promise.all([
      getTodayExpense(),
      getWeeklyExpenses(),
      getMonthlyExpenses()
    ]);
    
    setTodayExpense(expense);
    setCurrentMeal(checkCurrentMeal());
    setWeeklyTotal(weekly.reduce((sum, day) => sum + day.total, 0));
    setMonthlyTotal(monthly.reduce((sum, day) => sum + day.total, 0));
    
    Animated.parallel([
      Animated.spring(fadeAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 10,
        bounciness: 8
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 10,
        bounciness: 8
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 10,
        bounciness: 8
      })
    ]).start();
  };

  useFocusEffect(() => {
    loadData();
    const interval = setInterval(() => {
      setCurrentMeal(checkCurrentMeal());
    }, 60000);

    return () => clearInterval(interval);
  });

  const handleMealResponse = async (meal: MealType, hadMeal: boolean) => {
    const updatedExpense = await updateTodayExpense(meal, hadMeal);
    setTodayExpense(updatedExpense);
    const [weekly, monthly] = await Promise.all([
      getWeeklyExpenses(),
      getMonthlyExpenses()
    ]);
    setWeeklyTotal(weekly.reduce((sum, day) => sum + day.total, 0));
    setMonthlyTotal(monthly.reduce((sum, day) => sum + day.total, 0));
  };

  if (!todayExpense) {
    return (
      <LinearGradient
        colors={['#0a2540', '#0f3457', '#18456f']}
        style={styles.loadingContainer}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <ActivityIndicator size="large" color="#7ae7ff" />
          <Text style={styles.loadingText}>Preparing your meal dashboard...</Text>
        </Animated.View>
      </LinearGradient>
    );
  }

  const totalToday = todayExpense.breakfast.amount + 
                     todayExpense.lunch.amount + 
                     todayExpense.dinner.amount;

  const getMealIcon = (meal: string) => {
    switch(meal) {
      case 'breakfast':
        return <Ionicons name="cafe-outline" size={24} color="#f59e0b" />;
      case 'lunch':
        return <MaterialCommunityIcons name="food-drumstick-outline" size={24} color="#10b981" />;
      case 'dinner':
        return <FontAwesome5 name="utensils" size={22} color="#8b5cf6" />;
      default:
        return null;
    }
  };

  return (
    <LinearGradient
      colors={['#0a2540', '#0f3457', '#18456f']}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Header with greeting and wallet info */}
          <View style={styles.headerContainer}>
            <View style={styles.greetingRow}>
              <View>
                <Text style={styles.greetingText}>Hey, <Text style={styles.nameText}>Rajesh Balasubramaniam</Text></Text>
                <Text style={styles.dateText}>{format(new Date(), 'EEEE, MMM d')}</Text>
              </View>
              <View style={styles.profileIcon}>
                <Text style={styles.profileInitial}>RB</Text>
              </View>
            </View>
            
            {/* Wallet card */}
            <Animated.View style={[styles.walletCard, { transform: [{ scale: scaleAnim }] }]}>
              <LinearGradient
                colors={['#18456f', '#0f3457']}
                style={styles.walletGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.walletHeader}>
                  <Text style={styles.walletTitle}>Today's Expense</Text>
                  <View style={styles.chipContainer}>
                    <Text style={styles.chipText}>STAY HEALTHY</Text>
                  </View>
                </View>
                
                <Text style={styles.walletAmount}>{totalToday}₹</Text>
                
                <View style={styles.walletFooter}>
                  <View style={styles.walletStat}>
                    <Text style={styles.walletStatLabel}>Weekly</Text>
                    <Text style={styles.walletStatValue}>{weeklyTotal}₹</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.walletStat}>
                    <Text style={styles.walletStatLabel}>Monthly</Text>
                    <Text style={styles.walletStatValue}>{monthlyTotal}₹</Text>
                  </View>
                </View>
                
                <View style={styles.cardDecoration}></View>
              </LinearGradient>
            </Animated.View>
          </View>
          
          {/* Daily meals section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Today's Meals</Text>
            
            <View style={styles.mealsContainer}>
              {['breakfast', 'lunch', 'dinner'].map((meal) => (
                <View key={meal} style={styles.mealItem}>
                  <View style={styles.mealIconContainer}>
                    {getMealIcon(meal)}
                  </View>
                  <View style={styles.mealInfo}>
                    <Text style={styles.mealName}>{meal.charAt(0).toUpperCase() + meal.slice(1)}</Text>
                    <Text style={styles.mealTime}>
                      {meal === 'breakfast' ? '8-10 AM' : 
                       meal === 'lunch' ? '12-2 PM' : '7-9 PM'}
                    </Text>
                  </View>
                  <View style={styles.mealStatus}>
                    {todayExpense[meal as MealType].had ? (
                      <View style={styles.statusChipCompleted}>
                        <FontAwesome name="check" size={14} color="#ffffff" />
                      </View>
                    ) : (
                      <View style={styles.statusChipPending}>
                        <FontAwesome name="clock-o" size={14} color="#ffffff" />
                      </View>
                    )}
                    <Text style={styles.mealAmount}>{todayExpense[meal as MealType].amount}₹</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
          
          {/* Current meal prompt */}
          {currentMeal && !todayExpense[currentMeal].had && (
            <View style={styles.promptContainer}>
              <MealButton 
                meal={currentMeal} 
                onResponse={handleMealResponse} 
              />
            </View>
          )}
          
          {/* Expense overview */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Expense Overview</Text>
            
            <View style={styles.overviewContainer}>
              <View style={styles.overviewItem}>
                <View style={[styles.overviewIcon, styles.todayIcon]}>
                  <FontAwesome name="calendar-o" size={20} color="#ffffff" />
                </View>
                <View style={styles.overviewInfo}>
                  <Text style={styles.overviewLabel}>Today</Text>
                  <Text style={styles.overviewValue}>{totalToday}₹</Text>
                </View>
              </View>
              
              <View style={styles.overviewItem}>
                <View style={[styles.overviewIcon, styles.weeklyIcon]}>
                  <FontAwesome name="calendar" size={20} color="#ffffff" />
                </View>
                <View style={styles.overviewInfo}>
                  <Text style={styles.overviewLabel}>This Week</Text>
                  <Text style={styles.overviewValue}>{weeklyTotal}₹</Text>
                </View>
              </View>
              
              <View style={styles.overviewItem}>
                <View style={[styles.overviewIcon, styles.monthlyIcon]}>
                  <FontAwesome name="calendar-check-o" size={20} color="#ffffff" />
                </View>
                <View style={styles.overviewInfo}>
                  <Text style={styles.overviewLabel}>This Month</Text>
                  <Text style={styles.overviewValue}>{monthlyTotal}₹</Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    padding: 20,
    minHeight: '100%',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#e2e8f0',
    fontWeight: '600',
    marginTop: 20,
    letterSpacing: 0.5,
  },
  headerContainer: {
    marginBottom: 24,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '500',
  },
  nameText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  dateText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  walletCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  walletGradient: {
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletTitle: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  chipContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chipText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  walletAmount: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 20,
  },
  walletFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletStat: {
    flex: 1,
  },
  walletStatLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 4,
  },
  walletStatValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 15,
  },
  cardDecoration: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  mealsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 12,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  mealIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  mealTime: {
    color: '#94a3b8',
    fontSize: 12,
  },
  mealStatus: {
    alignItems: 'flex-end',
  },
  statusChipCompleted: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statusChipPending: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  mealAmount: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  promptContainer: {
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
  },
  overviewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overviewItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '31%',
  },
  overviewIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  todayIcon: {
    backgroundColor: '#3b82f6',
  },
  weeklyIcon: {
    backgroundColor: '#10b981',
  },
  monthlyIcon: {
    backgroundColor: '#f59e0b',
  },
  overviewInfo: {
    alignItems: 'center',
  },
  overviewLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 4,
  },
  overviewValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});