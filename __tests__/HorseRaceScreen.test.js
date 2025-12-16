import React from 'react';
import { render } from '@testing-library/react-native';
import HorseRaceScreen from '../screens/HorseRaceScreen';

describe('HorseRaceScreen', () => {
  it('renders without crashing', () => {
    render(
      <HorseRaceScreen
        balance={100}
        setBalance={jest.fn()}
        raceGames={0}
        setRaceGames={jest.fn()}
        raceWins={0}
        setRaceWins={jest.fn()}
        raceHistory={[]}
        setRaceHistory={jest.fn()}
      />
    );
  });
});
