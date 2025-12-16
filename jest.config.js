// jest.config.js
module.exports = {
  // 1. Используем пресет Expo
  preset: 'jest-expo',

  // 2. ГЛАВНАЯ НАСТРОЙКА: Отмена игнорирования модулей Expo/RN в node_modules
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(?!-.*)|@expo(?!-.*)|.*)'
  ],

  // 3. Указываем файл для моков
  setupFilesAfterEnv: [
    "./jest.setup.js"
  ]
};