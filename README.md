# 🎰 Casino Mobile App

A modern, interactive casino mobile application built with React Native featuring multiple casino games with realistic animations and beautiful UI.

## ✨ Features

### 🎮 Available Games
1. **Slot Machine** 🎰
   - Realistic spinning animation
   - Progressive winning system
   - Multiple betting options
   - Jackpot combinations

2. **Blackjack 21** 🂡
   - Real card deck simulation
   - Dealer AI with standard casino rules
   - Blackjack (21) bonus payout
   - Professional card animations

3. **Programming Language Races** 🏇
   - Bet on programming languages
   - Random odds generation
   - Live race animations
   - Multi-round competition system

### 🏆 Player Features
- **Profile System** with avatar customization
- **Statistics Tracking** for all games
- **Achievements System** with unlockable rewards
- **Level Progression** based on games played
- **Game History** with detailed records
- **VIP Credit System** for low balance

### 🎨 Design Features
- **Dark Theme** with casino-style aesthetics
- **Responsive Design** for all screen sizes
- **Smooth Animations** using React Native Animated
- **Intuitive Navigation** with clear user flow
- **Professional UI** following UX best practices

## 🛠️ Tech Stack

- **React Native** - Cross-platform mobile development
- **Expo** - Development platform with image picker
- **AsyncStorage** - Local data persistence
- **React Navigation** - Screen navigation
- **React Native Animated** - Smooth animations

## 📋 Installation

### Prerequisites
- Node.js (v14 or newer)
- npm or yarn
- Expo CLI
- Android Studio / Xcode (for emulators) or physical device

### Setup Steps

1. **Clone the repository**
```bash
git clone https://github.com/zaxa651/ROYAL_CASINO_MOBILE_APPLICATION.git
cd casino-app
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Install Expo CLI globally** (if not already installed)
```bash
npm install -g expo-cli
```

4. **Start the development server**
```bash
expo start
# or
npm start
```

5. **Run on your device/emulator**
   - Scan QR code with Expo Go app (physical device)
   - Press 'a' for Android emulator
   - Press 'i' for iOS simulator

## 📁 Project Structure

```
casino-app/
├── App.js                 # Main app component with navigation
├── screens/               # All screen components
│   ├── HomeScreen.js      # Main menu with game selection
│   ├── SlotMachineScreen.js  # Slot machine game
│   ├── BlackjackScreen.js    # Blackjack game
│   ├── HorseRaceScreen.js    # Programming language races
│   └── ProfileScreen.js      # Player profile
├── assets/                # Images and static assets
│   └── casino-bg.jpg      # Background image (optional)
└── README.md              # This file
```

## 🎯 Game Rules

### Slot Machine
- Minimum bet: 10 coins
- Payout multipliers:
  - 3x 7️⃣ = 10x
  - 3x 💎/⭐ = 8x
  - 3x 🔔 = 6x
  - 3x fruits = 5x
  - 2x identical = 2x
  - 💎 + ⭐ = 3x

### Blackjack 21
- Objective: Get closest to 21 without exceeding
- Card values:
  - 2-10 = Face value
  - J/Q/K = 10
  - A = 1 or 11
- Blackjack (A + 10/J/Q/K) = 2.5x payout
- Win = 2x payout
- Push = Return bet

### Programming Language Races
- 4 randomly selected languages per race
- Random odds for each language
- 4-round race format
- Winner determined by most round wins
- Payout based on selected odds

## 📊 Data Persistence

The app saves:
- Player balance
- Game statistics
- Achievement progress
- Player level
- Profile avatar
- Player name
- Game history

All data is stored locally using AsyncStorage.

## 🎨 UI/UX Design

- **Color Scheme**: Dark theme (#0A0E17) with gold accents (#FFD700)
- **Typography**: Clear hierarchy with appropriate font weights
- **Animations**: Smooth transitions and feedback animations
- **Accessibility**: Touch-friendly buttons with proper sizing
- **Responsiveness**: Adapts to different screen sizes

## 🔧 Configuration

### Customizing the App
1. **Change colors**: Modify color variables in each screen's StyleSheet
2. **Add new games**: Create new screen components and add to navigation
3. **Modify odds**: Adjust payout multipliers in game logic files
4. **Add achievements**: Extend the achievements system in ProfileScreen

### Environment Setup
No environment variables required for basic functionality. For advanced features, create a `.env` file with:
```
EXPO_PUBLIC_API_URL=your_api_url
EXPO_PUBLIC_ENV=development
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and structure
- Add comments for complex logic
- Test changes on both iOS and Android
- Update documentation if needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

**This is a simulation/gaming application for entertainment purposes only.**

**IMPORTANT:**
- This app does not involve real money gambling
- All currency in the app is virtual
- No real-world value is associated with in-app coins
- Not affiliated with any real casinos or gambling establishments
- For users 18+ only

## 🙏 Acknowledgments

- React Native community for excellent documentation
- Expo team for the amazing development platform
- Icons and emojis from native platforms
- Casino game logic based on standard casino rules

## 📞 Support

For support, email zaxa651248g@gmail.com or create an issue in the GitHub repository.

---

Made with ❤️ by [zaxa651]

<div align="center">
  <sub>If you find this project helpful, please give it a ⭐️!</sub>
</div>
