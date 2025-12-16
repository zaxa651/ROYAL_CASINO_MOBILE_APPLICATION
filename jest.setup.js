import 'react-native-gesture-handler/jestSetup';
import { jest } from '@jest/globals';

// Настройка для Expo winter runtime
global.__ExpoImportMetaRegistry = {};

// Добавляем structuredClone если не существует
if (!global.structuredClone) {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

// Моки для Expo модулей, которые не используются в тестах UI
jest.mock('expo-application', () => ({}));
jest.mock('expo-file-system', () => ({}));
jest.mock('expo-font', () => ({ loadAsync: jest.fn() }));
jest.mock('expo-asset', () => ({}));

// Мок для навигации
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({ navigate: jest.fn() }),
  };
});
