import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { getMonthlyExpenses, PeriodExpense } from './storage';
import { format, startOfMonth, endOfMonth, eachWeekOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface WeekExpense {
  weekStart: Date;
  weekEnd: Date;
  total: number;
}

export default function MonthlyScreen() {
  const [monthlyExpenses, setMonthlyExpenses] = useState<PeriodExpense[]>([]);
  const [weeklyBreakdown, setWeeklyBreakdown] = useState<WeekExpense[]>([]);

  const loadData = async () => {
    const expenses = await getMonthlyExpenses();
    setMonthlyExpenses(expenses);
    
    // Calculate weekly breakdown
    const today = new Date();
    const firstDayOfMonth = startOfMonth(today);
    const lastDayOfMonth = endOfMonth(today);
    
    // Get all weeks in the current month
    const weeksInMonth = eachWeekOfInterval({
      start: firstDayOfMonth,
      end: lastDayOfMonth
    });
    
    // Create weekly breakdown
    const weekBreakdown = weeksInMonth.map(weekStart => {
      const weekEnd = endOfWeek(weekStart);
      const weekExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startOfWeek(weekStart) && expenseDate <= weekEnd;
      });
      
      const total = weekExpenses.reduce((sum, expense) => sum + expense.total, 0);
      
      return {
        weekStart,
        weekEnd,
        total
      };
    });
    
    setWeeklyBreakdown(weekBreakdown);
  };

  useFocusEffect(() => {
    loadData();
  });

  const totalMonth = monthlyExpenses.reduce((sum, day) => sum + day.total, 0);

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
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Monthly Summary</Text>
            
            {/* Monthly Total Card */}
            <View style={styles.walletCard}>
              <LinearGradient
                colors={['#18456f', '#0f3457']}
                style={styles.walletGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.walletHeader}>
                  <Text style={styles.walletTitle}>Current Month Total</Text>
                  <View style={styles.chipContainer}>
                    <Text style={styles.chipText}>{format(new Date(), 'MMMM')}</Text>
                  </View>
                </View>
                
                <Text style={styles.walletAmount}>{totalMonth}₹</Text>
                
                <View style={styles.cardDecoration}></View>
              </LinearGradient>
            </View>
          </View>
          
          {/* Weekly breakdown list */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Weekly Breakdown</Text>
            
            <View style={styles.expensesContainer}>
              {weeklyBreakdown.map((week, index) => (
                <View key={index} style={styles.dayItem}>
                  <View style={styles.dayIconContainer}>
                    <FontAwesome name="calendar-o" size={20} color="#ffffff" />
                  </View>
                  <View style={styles.dayInfo}>
                    <Text style={styles.dayName}>Week {index + 1}</Text>
                    <Text style={styles.dayDate}>
                      {format(week.weekStart, 'MMM d')} - {format(week.weekEnd, 'MMM d')}
                    </Text>
                  </View>
                  <View style={styles.amountContainer}>
                    <Text style={styles.amountText}>{week.total}₹</Text>
                    <FontAwesome5 name="angle-right" size={16} color="#94a3b8" />
                  </View>
                </View>
              ))}
            </View>
          </View>
          
        </View>
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
  headerContainer: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
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
    marginBottom: 10,
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
  expensesContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 12,
  },
  dayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  dayIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dayDate: {
    color: '#94a3b8',
    fontSize: 12,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amountText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});