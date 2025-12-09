import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  SafeAreaView,
  Image,
  Alert,
  Easing
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Символы для слотов
const SYMBOLS = ['🍒', '🍋', '🍊', '🍉', '⭐', '7️⃣', '🔔', '💎'];
const SYMBOL_COLORS = ['#FF4757', '#FFA502', '#FF6348', '#2ED573', '#FFD700', '#1E90FF', '#9C88FF', '#00CEC9'];

export default function SlotMachineScreen({
  navigation,
  balance,
  setBalance,
  slotGames,
  setSlotGames,
  slotWins,
  setSlotWins,
  slotHistory,
  setSlotHistory,
}) {
  const [reels, setReels] = useState(['🍒', '🍒', '🍒']);
  const [choosingBet, setChoosingBet] = useState(true);
  const [bet, setBet] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [winStreak, setWinStreak] = useState(0);
  const [lastSpinTime, setLastSpinTime] = useState(0);

  // Анимационные значения
  const spinAnimation = useRef(new Animated.Value(0)).current;
  const winScale = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Эффект для анимации выигрыша
  useEffect(() => {
    if (winAmount > 0) {
      Animated.sequence([
        Animated.timing(winScale, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(winScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [winAmount]);

  const startSpin = (selectedBet) => {
    if (selectedBet > balance) {
      Alert.alert(
        'Brak środków!',
        `Masz tylko ${balance} 💰\nWybierz mniejszą stawkę.`,
        [{ text: 'OK', style: 'cancel' }]
      );
      return;
    }

    if (Date.now() - lastSpinTime < 1000 && lastSpinTime !== 0) {
      Alert.alert('Za szybko!', 'Poczekaj chwilę przed kolejnym spinem.');
      return;
    }

    setBet(selectedBet);
    setChoosingBet(false);
    setSpinning(true);
    setWinAmount(0);

    // Анимация кнопки
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Анимация вращения
    spinAnimation.setValue(0);
    Animated.timing(spinAnimation, {
      toValue: 1,
      duration: 2000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start(() => {
      // Генерация результатов после анимации
      generateResults(selectedBet);
    });
  };

  const generateResults = (selectedBet) => {
    setLastSpinTime(Date.now());
    setBalance(prev => prev - selectedBet);
    
    // Генерация новых символов
    const newReels = [
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    ];
    
    setReels(newReels);
    
    // Проверка выигрыша
    let winMultiplier = 0;
    let winType = '';
    
    if (newReels[0] === newReels[1] && newReels[1] === newReels[2]) {
      // Все три одинаковые
      winMultiplier = newReels[0] === '7️⃣' ? 10 : 5;
      winType = 'JACKPOT!';
      setWinStreak(prev => prev + 1);
    } else if (newReels[0] === newReels[1] || newReels[1] === newReels[2]) {
      // Две одинаковые
      winMultiplier = 2;
      winType = 'DOUBLE!';
    } else if (newReels.includes('💎') && newReels.includes('⭐')) {
      // Особые комбинации
      winMultiplier = 3;
      winType = 'SPECIAL COMBO!';
    }
    
    const winTotal = selectedBet * winMultiplier;
    
    if (winMultiplier > 0) {
      setTimeout(() => {
        setBalance(prev => prev + winTotal);
        setWinAmount(winTotal);
        setSlotWins(prev => prev + 1);
        
        Alert.alert(
          `🎉 ${winType}`,
          `Wygrałeś ${winTotal} 💰!\n${newReels.join(' ')}`,
          [{ text: 'Super!', style: 'default' }]
        );
        
        setSlotHistory(prev => [...prev, `Win +${winTotal}`]);
      }, 500);
    } else {
      setWinStreak(0);
      setSlotHistory(prev => [...prev, `Lose -${selectedBet}`]);
    }
    
    setSlotGames(prev => prev + 1);
    setTimeout(() => setSpinning(false), 1000);
  };

  const resetGame = () => {
    setChoosingBet(true);
    setBet(0);
    setWinStreak(0);
  };

  // Создание анимированных барабанов
  const renderReel = (symbol, index) => {
    const spinValue = spinAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', `${360 * (index + 1)}deg`],
    });

    return (
      <View key={index} style={styles.reelContainer}>
        <Animated.View
          style={[
            styles.reel,
            {
              transform: spinning ? [{ rotate: spinValue }] : [],
            },
          ]}
        >
          <View style={styles.symbolWrapper}>
            <Text style={[styles.symbol, { color: SYMBOL_COLORS[SYMBOLS.indexOf(symbol)] }]}>
              {symbol}
            </Text>
          </View>
        </Animated.View>
        <View style={styles.reelBorder} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Шапка с информацией */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>JEDNORĘKI BANDYTA 🎰</Text>
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>BALANS:</Text>
              <Text style={styles.balanceAmount}>{balance.toLocaleString()} 💰</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.profileButton}>
            <Text style={styles.profileButtonText}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Основное поле слотов */}
        <View style={styles.slotMachine}>
          <View style={styles.slotHeader}>
            <Text style={styles.slotTitle}>ROYAL SLOTS</Text>
            <Text style={styles.slotSubtitle}>Spróbuj szczęścia!</Text>
          </View>

          {/* Отображение барабанов */}
          <View style={styles.reelsRow}>
            {reels.map((symbol, index) => renderReel(symbol, index))}
          </View>

          {/* Индикатор выигрыша */}
          {winAmount > 0 && (
            <Animated.View style={[styles.winContainer, { transform: [{ scale: winScale }] }]}>
              <Text style={styles.winText}>+{winAmount} 💰</Text>
              <Text style={styles.winSubtext}>WYGRAŁEŚ!</Text>
            </Animated.View>
          )}

          {/* Линия выплат */}
          <View style={styles.payline}>
            <View style={styles.paylineMarker} />
            <Text style={styles.paylineText}>LINIA WYPŁAT</Text>
            <View style={styles.paylineMarker} />
          </View>

          {/* Информация о серии выигрышей */}
          {winStreak > 0 && (
            <View style={styles.streakContainer}>
              <Text style={styles.streakText}>🔥 Seria wygranych: {winStreak}</Text>
            </View>
          )}
        </View>

        {/* Панель управления */}
        <View style={styles.controlPanel}>
          {choosingBet ? (
            <View style={styles.betSelection}>
              <Text style={styles.betTitle}>WYBIERZ STAWKĘ</Text>
              <View style={styles.betGrid}>
                {[10, 25, 50, 100, 250, 500].map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    style={[
                      styles.betButton,
                      amount > balance && styles.betButtonDisabled,
                    ]}
                    onPress={() => startSpin(amount)}
                    disabled={amount > balance || spinning}
                  >
                    <Text style={styles.betButtonText}>{amount} 💰</Text>
                    {amount > balance && (
                      <Text style={styles.betDisabledText}>Brak</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.customBetContainer}>
                <Text style={styles.customBetText}>lub wprowadź własną:</Text>
                <TouchableOpacity style={styles.customBetButton}>
                  <Text style={styles.customBetButtonText}>WŁASNA STAWKA</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.gameControls}>
              <View style={styles.currentBetContainer}>
                <Text style={styles.currentBetLabel}>AKTUALNA STAWKA:</Text>
                <Text style={styles.currentBetAmount}>{bet} 💰</Text>
              </View>

              <View style={styles.controlButtons}>
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <TouchableOpacity
                    style={[styles.controlButton, styles.spinButton]}
                    onPress={() => startSpin(bet)}
                    disabled={spinning || bet > balance}
                  >
                    <Text style={styles.spinButtonText}>
                      {spinning ? 'KRĘCENIE...' : 'ZAKRĘĆ!'}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>

                <TouchableOpacity
                  style={[styles.controlButton, styles.changeButton]}
                  onPress={resetGame}
                  disabled={spinning}
                >
                  <Text style={styles.changeButtonText}>ZMIEŃ STAWKĘ</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlButton, styles.infoButton]}
                  onPress={() => {
                    Alert.alert(
                      'Tabela wypłat',
                      `🎯 Wypłaty:\n\n` +
                      `3x7️⃣ = x10\n` +
                      `3x ⭐ = x8\n` +
                      `3x 💎 = x8\n` +
                      `3x 🔔 = x6\n` +
                      `3x owoc = x5\n` +
                      `2x identyczne = x2\n` +
                      `💎 + ⭐ = x3\n\n` +
                      `💰 Minimalna stawka: 10`
                    );
                  }}
                >
                  <Text style={styles.infoButtonText}>ℹ️ WYPŁATY</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Статистика */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Gry</Text>
              <Text style={styles.statValue}>{slotGames}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Wygrane</Text>
              <Text style={styles.statValue}>{slotWins}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>W/L</Text>
              <Text style={styles.statValue}>
                {slotGames > 0 ? ((slotWins / slotGames) * 100).toFixed(1) : 0}%
              </Text>
            </View>
          </View>
        </View>

        {/* Быстрые действия */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => startSpin(10)}
            disabled={spinning || balance < 10}
          >
            <Text style={styles.quickActionText}>SPIN 10</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => startSpin(50)}
            disabled={spinning || balance < 50}
          >
            <Text style={styles.quickActionText}>SPIN 50</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.quickActionText}>🏠 HOME</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0E17',
  },
  container: {
    flex: 1,
    backgroundColor: '#0A0E17',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.2)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFD700',
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    letterSpacing: 1,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  balanceLabel: {
    color: '#8A8D93',
    fontSize: 12,
    marginRight: 5,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
  },
  slotMachine: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  slotHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  slotTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  slotSubtitle: {
    color: '#8A8D93',
    fontSize: 12,
    marginTop: 5,
  },
  reelsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  reelContainer: {
    marginHorizontal: 10,
    position: 'relative',
  },
  reel: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    shadowOpacity: 0.3,
  },
  symbolWrapper: {
    transform: [{ rotate: '0deg' }],
  },
  symbol: {
    fontSize: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  reelBorder: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    borderRadius: 20,
    zIndex: -1,
  },
  payline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  paylineMarker: {
    flex: 1,
    height: 2,
    backgroundColor: '#FFD700',
  },
  paylineText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 10,
    letterSpacing: 1,
  },
  winContainer: {
    position: 'absolute',
    top: '50%',
    backgroundColor: 'rgba(46, 213, 115, 0.9)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#2ED573',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    shadowOpacity: 0.8,
    zIndex: 10,
  },
  winText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
  },
  winSubtext: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 2,
  },
  streakContainer: {
    marginTop: 15,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  streakText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '700',
  },
  controlPanel: {
    flex: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },
  betSelection: {
    flex: 1,
  },
  betTitle: {
    color: '#8A8D93',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1,
  },
  betGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  betButton: {
    width: width * 0.25,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  betButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: '#8A8D93',
    opacity: 0.5,
  },
  betButtonText: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: '700',
  },
  betDisabledText: {
    color: '#FF4757',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 5,
  },
  customBetContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  customBetText: {
    color: '#8A8D93',
    fontSize: 12,
    marginBottom: 10,
  },
  customBetButton: {
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  customBetButtonText: {
    color: '#4A90E2',
    fontSize: 12,
    fontWeight: '600',
  },
  gameControls: {
    flex: 1,
  },
  currentBetContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 15,
  },
  currentBetLabel: {
    color: '#8A8D93',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 10,
  },
  currentBetAmount: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: '900',
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  controlButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  spinButton: {
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  spinButtonText: {
    color: '#0A0E17',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  changeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: '#8A8D93',
  },
  changeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  infoButton: {
    backgroundColor: 'rgba(116, 185, 255, 0.2)',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  infoButtonText: {
    color: '#4A90E2',
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 15,
    padding: 15,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: '#8A8D93',
    fontSize: 10,
    marginBottom: 5,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  quickAction: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  quickActionText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
});