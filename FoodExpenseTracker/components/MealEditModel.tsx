import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Dimensions, Pressable } from 'react-native';
import { FontAwesome, Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { MealType, mealPrices } from '../storage';

const { width } = Dimensions.get('window');

interface MealEditModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (meal: MealType, hadMeal: boolean) => Promise<void>;
  mealData: {
    breakfast: { had: boolean; amount: number };
    lunch: { had: boolean; amount: number };
    dinner: { had: boolean; amount: number };
  };
  selectedMeal: MealType;
}

export const MealEditModal = ({ visible, onClose, onSave, mealData, selectedMeal }: MealEditModalProps) => {
  const [selectedOption, setSelectedOption] = useState<MealType | null>(null);

  useEffect(() => {
    // Prefill the selection based on the meal that was clicked
    if (visible && selectedMeal) {
      setSelectedOption(selectedMeal);
    }
  }, [visible, selectedMeal]);

  const handleSave = async () => {
    if (selectedOption) {
      // Toggle the meal status - if it was had, mark as not had, and vice versa
      const newStatus = !mealData[selectedOption].had;
      await onSave(selectedOption, newStatus);
      onClose();
    }
  };

  const getMealIcon = (meal: MealType) => {
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

  const getMealTime = (meal: MealType) => {
    switch(meal) {
      case 'breakfast':
        return '9-11 AM';
      case 'lunch':
        return '1-3 PM';
      case 'dinner':
        return '7-10 PM';
      default:
        return '';
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Meal</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome name="close" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsContainer}>
            {(['breakfast', 'lunch', 'dinner'] as MealType[]).map((meal) => (
              <TouchableOpacity
                key={meal}
                style={[
                  styles.optionItem,
                  selectedOption === meal && styles.selectedOption
                ]}
                onPress={() => setSelectedOption(meal)}
              >
                <View style={styles.mealIconContainer}>
                  {getMealIcon(meal)}
                </View>
                <View style={styles.mealInfo}>
                  <Text style={styles.mealName}>{meal.charAt(0).toUpperCase() + meal.slice(1)}</Text>
                  <Text style={styles.mealTime}>{getMealTime(meal)}</Text>
                  <Text style={styles.mealPrice}>{mealPrices[meal]}₹</Text>
                </View>
                <View style={styles.checkboxContainer}>
                  {selectedOption === meal && (
                    <View style={styles.checkbox}>
                      <FontAwesome name="check" size={16} color="#ffffff" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Current Status:</Text>
            {selectedOption && (
              <View style={[
                styles.statusChip,
                mealData[selectedOption].had ? styles.statusHad : styles.statusNotHad
              ]}>
                <Text style={styles.statusText}>
                  {mealData[selectedOption].had ? 'Had meal' : 'Not had'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.saveButton, !selectedOption && styles.disabledButton]} 
              onPress={handleSave}
              disabled={!selectedOption}
            >
              <Text style={styles.saveButtonText}>
                {selectedOption && mealData[selectedOption].had ? 'Mark as Not Had' : 'Mark as Had'}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0f3457',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  closeButton: {
    padding: 5,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  selectedOption: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: '#3b82f6',
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
    marginBottom: 2,
  },
  mealPrice: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusLabel: {
    color: '#94a3b8',
    fontSize: 14,
    marginRight: 8,
  },
  statusChip: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  statusHad: {
    backgroundColor: '#10b981',
  },
  statusNotHad: {
    backgroundColor: '#f59e0b',
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 14,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#64748b',
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});