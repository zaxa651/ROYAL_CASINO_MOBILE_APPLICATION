import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  SafeAreaView,
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
  const [currentSpin, setCurrentSpin] = useState(0);
  const [showReels, setShowReels] = useState(['🍒', '🍒', '🍒']); // То, что показывается во время анимации

  // Анимационные значения для каждого барабана
  const reelAnimations = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current
  ];

  const winScale = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Эффект для анимации выигрыша
  useEffect(() => {
    if (winAmount > 0) {
      Animated.sequence([
        Animated.timing(winScale, {
          toValue: 1.3,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(winScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(winScale, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(winScale, {
          toValue: 1,
          duration: 200,
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
    setCurrentSpin(prev => prev + 1);

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

    // Генерируем результаты заранее, но не показываем их
    const newReels = [
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    ];

    // Запускаем анимацию прокрутки каждого барабана с задержкой
    reelAnimations.forEach((anim, index) => {
      anim.setValue(0);
      setTimeout(() => {
        Animated.timing(anim, {
          toValue: 1,
          duration: 1000 + Math.random() * 300,
          easing: Easing.bezier(0.165, 0.84, 0.44, 1),
          useNativeDriver: true,
        }).start(() => {
          // После окончания анимации показываем реальный символ
          if (index === 2) { // Последний барабан
            setTimeout(() => {
              setReels(newReels);
              setShowReels(newReels);
              checkWin(newReels, selectedBet);
              setSpinning(false);
            }, 300);
          }
        });
      }, index * 150);
    });
  };

  const checkWin = (newReels, selectedBet) => {
    setLastSpinTime(Date.now());
    setBalance(prev => prev - selectedBet);
    
    // Проверка выигрыша
    let winMultiplier = 0;
    let winType = '';
    
    if (newReels[0] === newReels[1] && newReels[1] === newReels[2]) {
      // Все три одинаковые
      winMultiplier = newReels[0] === '7️⃣' ? 10 : 
                     newReels[0] === '💎' ? 8 :
                     newReels[0] === '⭐' ? 8 :
                     newReels[0] === '🔔' ? 6 : 5;
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
      setBalance(prev => prev + winTotal);
      setWinAmount(winTotal);
      setSlotWins(prev => prev + 1);
      
      setTimeout(() => {
        Alert.alert(
          `🎉 ${winType}`,
          `Wygrałeś ${winTotal} 💰!\n${newReels.join(' ')}`,
          [{ text: 'Super!', style: 'default' }]
        );
      }, 800);
      
      setSlotHistory(prev => [...prev, `Win +${winTotal}`]);
    } else {
      setWinStreak(0);
      setSlotHistory(prev => [...prev, `Lose -${selectedBet}`]);
    }
    
    setSlotGames(prev => prev + 1);
  };

  const resetGame = () => {
    setChoosingBet(true);
    setBet(0);
    setWinStreak(0);
  };

  // Рендер одного барабана
  const renderReel = (symbol, index) => {
    const currentSymbol = spinning ? '?' : symbol;
    
    const animatedStyle = {
      transform: [
        {
          translateY: reelAnimations[index].interpolate({
            inputRange: [0, 0.3, 0.7, 1],
            outputRange: [0, -100, 100, 0],
          })
        }
      ],
      opacity: reelAnimations[index].interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 0.3, 1]
      })
    };

    return (
      <View key={index} style={styles.reelContainer}>
        <View style={styles.reelWindow}>
          {/* Фон барабана */}
          <View style={styles.reelBackground}>
            {/* Анимированная часть */}
            <Animated.View style={[styles.reelContent, animatedStyle]}>
              {/* Центральный символ */}
              <View style={styles.symbolSlot}>
                <Text style={[
                  styles.symbol,
                  { 
                    color: SYMBOL_COLORS[SYMBOLS.indexOf(symbol) % SYMBOL_COLORS.length],
                    fontSize: spinning ? 24 : 40,
                  }
                ]}>
                  {currentSymbol}
                </Text>
              </View>
            </Animated.View>
          </View>
          
          {/* Выделение центрального символа */}
          {!spinning && (
            <View style={styles.centerHighlight}>
              <Text style={[
                styles.centerSymbol,
                { 
                  color: SYMBOL_COLORS[SYMBOLS.indexOf(symbol) % SYMBOL_COLORS.length],
                  fontSize: 46
                }
              ]}>
                {symbol}
              </Text>
            </View>
          )}
          
          {/* Эффект вращения */}
          {spinning && (
            <View style={styles.spinEffect}>
              <Text style={styles.spinEffectText}>↻</Text>
            </View>
          )}
        </View>
        
        {/* Границы барабана */}
        <View style={styles.reelBorder} />
        
        {/* Подсветка барабана */}
        <View style={[
          styles.reelGlow,
          { backgroundColor: SYMBOL_COLORS[SYMBOLS.indexOf(symbol) % SYMBOL_COLORS.length] }
        ]} />
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
            <Text style={styles.title}>SLOT MACHINE 🎰</Text>
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
          {/* Заголовок */}
          <View style={styles.slotHeader}>
            <Text style={styles.slotTitle}>GOLDEN SLOTS</Text>
            <Text style={styles.slotSubtitle}>Kręć i wygrywaj!</Text>
          </View>

          {/* Барабаны */}
          <View style={styles.reelsContainer}>
            {reels.map((symbol, index) => renderReel(symbol, index))}
          </View>

          {/* Линия выплат */}
          <View style={styles.payline}>
            <View style={styles.paylineMarker} />
            <Text style={styles.paylineText}>WIN LINE</Text>
            <View style={styles.paylineMarker} />
          </View>

          {/* Отображение выпавших символов */}
          {!spinning && (
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsText}>
                Wynik: {reels.join(' | ')}
              </Text>
            </View>
          )}

          {/* Индикатор выигрыша */}
          {winAmount > 0 && (
            <Animated.View style={[styles.winContainer, { transform: [{ scale: winScale }] }]}>
              <View style={styles.winInner}>
                <Text style={styles.winText}>+{winAmount} 💰</Text>
                <Text style={styles.winSubtext}>WYGRANA!</Text>
              </View>
            </Animated.View>
          )}

          {/* Информация о серии */}
          {winStreak > 1 && (
            <View style={styles.streakContainer}>
              <Text style={styles.streakText}>🔥 Seria: {winStreak} wygranych z rzędu!</Text>
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
            </View>
          ) : (
            <View style={styles.gameControls}>
              <View style={styles.betInfo}>
                <View style={styles.betInfoRow}>
                  <Text style={styles.betInfoLabel}>STAWKA:</Text>
                  <Text style={styles.betInfoAmount}>{bet} 💰</Text>
                </View>
                {winAmount > 0 && (
                  <View style={styles.winInfoRow}>
                    <Text style={styles.winInfoLabel}>WYGRANA:</Text>
                    <Text style={styles.winInfoAmount}>+{winAmount} 💰</Text>
                  </View>
                )}
              </View>

              <Animated.View style={[styles.spinButtonContainer, { transform: [{ scale: buttonScale }] }]}>
                <TouchableOpacity
                  style={[styles.spinButton, spinning && styles.spinButtonDisabled]}
                  onPress={() => startSpin(bet)}
                  disabled={spinning || bet > balance}
                >
                  <Text style={styles.spinButtonText}>
                    {spinning ? 'KRĘCENIE...' : 'ZAKRĘĆ!'}
                  </Text>
                  {spinning && (
                    <View style={styles.spinningIcon}>
                      <Text style={styles.spinningIconText}>↻</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>

              <View style={styles.controlButtons}>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={resetGame}
                  disabled={spinning}
                >
                  <Text style={styles.controlButtonText}>ZMIEŃ STAWKĘ</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.infoButton}
                  onPress={() => navigation.navigate('Home')}
                >
                  <Text style={styles.infoButtonText}>🏠 HOME</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Статистика */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{slotGames}</Text>
              <Text style={styles.statLabel}>GRY</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{slotWins}</Text>
              <Text style={styles.statLabel}>WYGRANE</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {slotGames > 0 ? ((slotWins / slotGames) * 100).toFixed(1) : 0}%
              </Text>
              <Text style={styles.statLabel}>W/L</Text>
            </View>
          </View>

          {/* Быстрые ставки */}
          <View style={styles.quickActions}>
            <Text style={styles.quickActionsTitle}>SZYBKIE SPINY:</Text>
            <View style={styles.quickButtons}>
              {[10, 50, 100].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.quickButton,
                    amount > balance && styles.quickButtonDisabled,
                    spinning && styles.quickButtonDisabled
                  ]}
                  onPress={() => startSpin(amount)}
                  disabled={spinning || amount > balance}
                >
                  <Text style={styles.quickButtonText}>{amount}💰</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
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
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.2)',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFD700',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 1,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  balanceLabel: {
    color: '#8A8D93',
    fontSize: 11,
    marginRight: 5,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  slotMachine: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  slotHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  slotTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 2,
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  slotSubtitle: {
    color: '#8A8D93',
    fontSize: 12,
    marginTop: 4,
    letterSpacing: 1,
  },
  reelsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
    height: 120,
  },
  reelContainer: {
    width: 80,
    height: 100,
    marginHorizontal: 6,
    position: 'relative',
  },
  reelWindow: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reelBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reelContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  symbolSlot: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  symbol: {
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  centerHighlight: {
    position: 'absolute',
    width: '90%',
    height: '70%',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  centerSymbol: {
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  spinEffect: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  spinEffectText: {
    fontSize: 36,
    color: '#FFD700',
    fontWeight: 'bold',
    opacity: 0.7,
  },
  reelBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.5)',
    borderRadius: 12,
  },
  reelGlow: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 16,
    opacity: 0.1,
    zIndex: -1,
  },
  payline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    width: '85%',
  },
  paylineMarker: {
    flex: 1,
    height: 3,
    backgroundColor: '#FFD700',
    borderRadius: 2,
  },
  paylineText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 10,
    letterSpacing: 1,
    backgroundColor: '#0A0E17',
  },
  resultsContainer: {
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
  },
  resultsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  winContainer: {
    position: 'absolute',
    top: '45%',
    zIndex: 10,
  },
  winInner: {
    backgroundColor: 'rgba(46, 213, 115, 0.9)',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#2ED573',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    shadowOpacity: 0.7,
  },
  winText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  winSubtext: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 2,
    marginTop: 2,
  },
  streakContainer: {
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  streakText: {
    color: '#FF6B6B',
    fontSize: 11,
    fontWeight: '700',
  },
  controlPanel: {
    flex: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
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
    marginBottom: 15,
    letterSpacing: 1,
  },
  betGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 15,
  },
  betButton: {
    width: width * 0.25,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 10,
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
    fontSize: 15,
    fontWeight: '700',
  },
  betDisabledText: {
    color: '#FF4757',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  },
  gameControls: {
    flex: 1,
  },
  betInfo: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },
  betInfoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  betInfoLabel: {
    color: '#8A8D93',
    fontSize: 13,
    fontWeight: '600',
    marginRight: 8,
  },
  betInfoAmount: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: '900',
  },
  winInfoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  winInfoLabel: {
    color: '#8A8D93',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
  },
  winInfoAmount: {
    color: '#2ED573',
    fontSize: 16,
    fontWeight: '900',
  },
  spinButtonContainer: {
    marginBottom: 15,
  },
  spinButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  spinButtonDisabled: {
    backgroundColor: 'rgba(255, 215, 0, 0.5)',
  },
  spinButtonText: {
    color: '#0A0E17',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 1,
  },
  spinningIcon: {
    marginLeft: 10,
  },
  spinningIconText: {
    color: '#0A0E17',
    fontSize: 18,
    fontWeight: 'bold',
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  controlButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#8A8D93',
    alignItems: 'center',
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  infoButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4A90E2',
    alignItems: 'center',
  },
  infoButtonText: {
    color: '#4A90E2',
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: 12,
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    color: '#8A8D93',
    fontSize: 9,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickActions: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    padding: 12,
  },
  quickActionsTitle: {
    color: '#8A8D93',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  quickButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  quickButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    alignItems: 'center',
  },
  quickButtonDisabled: {
    opacity: 0.4,
  },
  quickButtonText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
});