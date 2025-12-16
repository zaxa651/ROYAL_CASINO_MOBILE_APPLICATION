import React from 'react';
import { render } from '@testing-library/react-native';
import SlotMachineScreen from '../screens/SlotMachineScreen';

test('SlotMachineScreen renders', () => {
  render(
    <SlotMachineScreen
      balance={100}
      setBalance={jest.fn()}
      slotGames={0}
      setSlotGames={jest.fn()}
      slotWins={0}
      setSlotWins={jest.fn()}
      slotHistory={[]}
      setSlotHistory={jest.fn()}
    />
  );
});
