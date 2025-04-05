import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { MealType } from '../storage';

interface MealStatusProps {
  meal: MealType;
  had: boolean;
  amount: number;
}

export function MealStatus({ meal, had, amount }: MealStatusProps) {
  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <View style={[styles.statusIndicator, had ? styles.statusCompleted : styles.statusPending]}>
          {had ? (
            <FontAwesome name="check" size={12} color="#ffffff" />
          ) : (
            <FontAwesome name="clock-o" size={12} color="#ffffff" />
          )}
        </View>
        <Text style={styles.amountText}>{amount}₹</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  statusCompleted: {
    backgroundColor: '#10b981',
  },
  statusPending: {
    backgroundColor: '#f59e0b',
  },
  amountText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});