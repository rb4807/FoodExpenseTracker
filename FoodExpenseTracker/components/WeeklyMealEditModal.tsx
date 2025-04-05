import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { DailyExpense, MealType, updateTodayExpense } from '../storage';
import { useState } from 'react';

interface WeeklyMealEditModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (meal: MealType, hadMeal: boolean) => Promise<void>;
  mealData: DailyExpense;
  selectedDay: Date;
}

export const WeeklyMealEditModal = ({
  visible,
  onClose,
  onSave,
  mealData,
  selectedDay,
}: WeeklyMealEditModalProps) => {
  const [editedAmount, setEditedAmount] = useState<string>(
    mealData.breakfast.amount.toString()
  );

  const handleSave = async (meal: MealType) => {
    const amount = parseFloat(editedAmount) || 0;
    const hadMeal = amount > 0;
    await onSave(meal, hadMeal);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <LinearGradient
          colors={['#1e3a8a', '#1e40af']}
          style={styles.modalContent}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Edit Meal for {selectedDay.toDateString()}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <View style={styles.mealSection}>
            <Text style={styles.mealLabel}>Breakfast</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="numeric"
              value={editedAmount}
              onChangeText={setEditedAmount}
              placeholder="Amount"
              placeholderTextColor="#94a3b8"
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => handleSave('breakfast')}
            >
              <Text style={styles.saveButtonText}>Save Breakfast</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mealSection}>
            <Text style={styles.mealLabel}>Lunch</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="numeric"
              value={editedAmount}
              onChangeText={setEditedAmount}
              placeholder="Amount"
              placeholderTextColor="#94a3b8"
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => handleSave('lunch')}
            >
              <Text style={styles.saveButtonText}>Save Lunch</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mealSection}>
            <Text style={styles.mealLabel}>Dinner</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="numeric"
              value={editedAmount}
              onChangeText={setEditedAmount}
              placeholder="Amount"
              placeholderTextColor="#94a3b8"
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => handleSave('dinner')}
            >
              <Text style={styles.saveButtonText}>Save Dinner</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  mealSection: {
    marginBottom: 15,
  },
  mealLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8,
    fontWeight: '600',
  },
  amountInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 12,
    color: '#ffffff',
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});