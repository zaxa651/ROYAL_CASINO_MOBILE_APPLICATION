// __tests__/App.test.js
import { render, fireEvent } from '@testing-library/react-native';
import React from 'react';
import HomeScreen from '../screens/HomeScreen';

test('przycisk do slot machine działa', () => {
  const { getByText } = render(<HomeScreen navigation={{ navigate: jest.fn() }} />);
  expect(getByText('Zagraj w jednorękiego bandytę')).toBeTruthy();
});

test('przycisk do profilu działa', () => {
  const { getByText } = render(<HomeScreen navigation={{ navigate: jest.fn() }} />);
  expect(getByText('Mój profil')).toBeTruthy();
});
