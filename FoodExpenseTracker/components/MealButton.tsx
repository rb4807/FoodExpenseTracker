import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { MealType } from '../app/storage';

interface MealButtonProps {
  meal: MealType;
  onResponse: (meal: MealType, hadMeal: boolean) => void;
}

export function MealButton({ meal, onResponse }: MealButtonProps) {
  const [showOptions, setShowOptions] = useState(false);
  
  const handleShowOptions = () => {
    setShowOptions(true);
  };

  const handleResponse = (hadMeal: boolean) => {
    onResponse(meal, hadMeal);
    setShowOptions(false);
  };

  const getMealTitle = () => {
    const time = meal.charAt(0).toUpperCase() + meal.slice(1);
    return `Had ${time}?`;
  };

  if (!showOptions) {
    return (
      <TouchableOpacity onPress={handleShowOptions} activeOpacity={0.8} style={styles.buttonContainer}>
        <LinearGradient
          colors={['#3b82f6', '#2563eb']}
          style={styles.button}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.buttonText}>{getMealTitle()}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.optionsContainer}>
      <Text style={styles.questionText}>Record your {meal}</Text>
      
      <View style={styles.optionsRow}>
        <TouchableOpacity 
          onPress={() => handleResponse(true)} 
          activeOpacity={0.8}
          style={styles.optionButton}
        >
          <View style={styles.optionYes}>
            <FontAwesome name="check" size={24} color="#ffffff" />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => handleResponse(false)}
          activeOpacity={0.8}
          style={styles.optionButton}
        >
          <View style={styles.optionNo}>
            <FontAwesome name="times" size={24} color="#ffffff" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  optionsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 20,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  optionButton: {
    marginHorizontal: 16,
  },
  optionYes: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionNo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  }
});