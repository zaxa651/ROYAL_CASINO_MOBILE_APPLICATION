import React from 'react';
import { render } from '@testing-library/react-native';
import HomeScreen from '../screens/HomeScreen';

test('HomeScreen renders', () => {
  const { getByText } = render(
    <HomeScreen balance={100} />
  );

  expect(getByText(/100/)).toBeTruthy();
});
