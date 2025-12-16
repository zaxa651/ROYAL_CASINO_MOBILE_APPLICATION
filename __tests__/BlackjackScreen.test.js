import React from 'react';
import { render } from '@testing-library/react-native';
import BlackjackScreen from '../screens/BlackjackScreen';

describe('BlackjackScreen', () => {
  it('renders without crashing', () => {
    render(
      <BlackjackScreen
        balance={100}
        setBalance={jest.fn()}
        bjGames={0}
        setBJGames={jest.fn()}
        bjWins={0}
        setBJWins={jest.fn()}
        bjHistory={[]}
        setBJHistory={jest.fn()}
      />
    );
  });
});
