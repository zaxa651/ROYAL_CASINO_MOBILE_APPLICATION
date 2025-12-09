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

// Масти карт
const SUITS = ['♥', '♦', '♠', '♣'];
const SUIT_COLORS = {
  '♥': '#FF4757',
  '♦': '#FF4757',
  '♠': '#2C3A47',
  '♣': '#2C3A47'
};

// Значения карт для Blackjack
const CARD_VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const CARD_WEIGHTS = {
  'A': 11, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 10, 'Q': 10, 'K': 10
};

export default function BlackjackScreen({
  navigation, balance, setBalance,
  bjGames, setBJGames, bjWins, setBJWins, bjHistory, setBJHistory,
  slotGames, slotWins, slotHistory
}) {
  const [playerCards, setPlayerCards] = useState([]);
  const [dealerCards, setDealerCards] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [bet, setBet] = useState(0);
  const [choosingBet, setChoosingBet] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [dealerHidden, setDealerHidden] = useState(true);
  const [gameStatus, setGameStatus] = useState('');
  const [playerScore, setPlayerScore] = useState(0);
  const [dealerScore, setDealerScore] = useState(0);
  const [winAmount, setWinAmount] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);

  // Анимационные значения
  const cardScale = useRef(new Animated.Value(1)).current;
  const winScale = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const chipScale = useRef(new Animated.Value(1)).current;

  // Генерация случайной карты
  const drawCard = () => {
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    const value = CARD_VALUES[Math.floor(Math.random() * CARD_VALUES.length)];
    return { suit, value, weight: CARD_WEIGHTS[value] };
  };

  // Расчет счета с учетом тузов
  const calculateScore = (cards) => {
    let score = cards.reduce((total, card) => total + card.weight, 0);
    let aces = cards.filter(card => card.value === 'A').length;
    
    while (score > 21 && aces > 0) {
      score -= 10;
      aces--;
    }
    
    return score;
  };

  // Анимация выигрыша
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
      ]).start();
    }
  }, [winAmount]);

  const startGame = (selectedBet) => {
    if (selectedBet > balance) {
      Alert.alert(
        'Brak środków!',
        `Masz tylko ${balance} 💰\nWybierz mniejszą stawkę.`,
        [{ text: 'OK', style: 'cancel' }]
      );
      return;
    }

    setBet(selectedBet);
    setBalance(prev => prev - selectedBet);
    setChoosingBet(false);
    setGameStarted(true);
    setGameOver(false);
    setDealerHidden(true);
    setGameStatus('');
    setWinAmount(0);

    // Анимация фишки
    Animated.sequence([
      Animated.timing(chipScale, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(chipScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Раздача карт с задержкой для анимации
    setTimeout(() => {
      const playerCard1 = drawCard();
      setPlayerCards([playerCard1]);
      
      setTimeout(() => {
        const dealerCard1 = drawCard();
        setDealerCards([dealerCard1]);
        
        setTimeout(() => {
          const playerCard2 = drawCard();
          setPlayerCards(prev => [...prev, playerCard2]);
          
          setTimeout(() => {
            const dealerCard2 = drawCard();
            setDealerCards(prev => [...prev, dealerCard2]);
            
            // Расчет начальных очков
            const playerScore = calculateScore([playerCard1, playerCard2]);
            const dealerScore = calculateScore([dealerCard1, dealerCard2]);
            
            setPlayerScore(playerScore);
            setDealerScore(dealerScore);
            
            // Проверка блэкджека
            if (playerScore === 21 && dealerScore !== 21) {
              setTimeout(() => {
                endGame('blackjack');
              }, 1000);
            } else if (playerScore === 21 && dealerScore === 21) {
              setTimeout(() => {
                endGame('push');
              }, 1000);
            }
          }, 300);
        }, 300);
      }, 300);
    }, 300);
  };

  const hit = () => {
    if (gameOver) return;

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

    setTimeout(() => {
      const newCard = drawCard();
      const newPlayerCards = [...playerCards, newCard];
      setPlayerCards(newPlayerCards);
      
      const newScore = calculateScore(newPlayerCards);
      setPlayerScore(newScore);
      
      // Анимация карты
      Animated.sequence([
        Animated.timing(cardScale, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(cardScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      if (newScore > 21) {
        setTimeout(() => {
          endGame('bust');
        }, 500);
      } else if (newScore === 21) {
        setTimeout(() => {
          dealerPlay();
        }, 500);
      }
    }, 200);
  };

  const dealerPlay = () => {
    setDealerHidden(false);
    
    let currentDealerCards = [...dealerCards];
    let currentDealerScore = calculateScore(currentDealerCards);
    
    const dealerDrawInterval = setInterval(() => {
      if (currentDealerScore < 17) {
        const newCard = drawCard();
        currentDealerCards.push(newCard);
        currentDealerScore = calculateScore(currentDealerCards);
        
        setDealerCards([...currentDealerCards]);
        setDealerScore(currentDealerScore);
      } else {
        clearInterval(dealerDrawInterval);
        setTimeout(() => {
          compareScores(currentDealerScore);
        }, 1000);
      }
    }, 800);
  };

  const stand = () => {
    if (gameOver) return;
    
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

    setTimeout(() => {
      setDealerHidden(false);
      dealerPlay();
    }, 300);
  };

  const compareScores = (finalDealerScore) => {
    if (playerScore > 21) {
      endGame('bust');
    } else if (finalDealerScore > 21) {
      endGame('dealer_bust');
    } else if (playerScore > finalDealerScore) {
      endGame('win');
    } else if (playerScore < finalDealerScore) {
      endGame('lose');
    } else {
      endGame('push');
    }
  };

  const endGame = (result) => {
    setGameOver(true);
    setDealerHidden(false);
    setBJGames(prev => prev + 1);
    
    let winMultiplier = 1;
    let message = '';
    let amount = 0;
    
    switch (result) {
      case 'blackjack':
        winMultiplier = 2.5;
        message = 'BLACKJACK! 🎉';
        setCurrentStreak(prev => prev + 1);
        setBJWins(prev => prev + 1);
        break;
      case 'win':
        winMultiplier = 2;
        message = 'WYGRANA! 🎉';
        setCurrentStreak(prev => prev + 1);
        setBJWins(prev => prev + 1);
        break;
      case 'dealer_bust':
        winMultiplier = 2;
        message = 'DEALER PRZEKROCZYŁ 21! 🎉';
        setCurrentStreak(prev => prev + 1);
        setBJWins(prev => prev + 1);
        break;
      case 'push':
        winMultiplier = 1;
        message = 'REMIS! 🤝';
        setCurrentStreak(0);
        break;
      case 'bust':
        winMultiplier = 0;
        message = 'PRZEKROCZYŁEŚ 21! 😢';
        setCurrentStreak(0);
        break;
      case 'lose':
        winMultiplier = 0;
        message = 'PRZEGRANA 😢';
        setCurrentStreak(0);
        break;
    }
    
    amount = bet * winMultiplier;
    setWinAmount(amount);
    
    if (amount > 0) {
      setBalance(prev => prev + amount);
    }
    
    const historyEntry = result === 'push' ? 
      `Push +${bet}💰` : 
      winMultiplier > 1 ? `Win +${amount}💰` : `Lose -${bet}💰`;
    
    setBJHistory(prev => [...prev, historyEntry]);
    
    setTimeout(() => {
      Alert.alert(
        message,
        `Twój wynik: ${playerScore}\nDealer: ${dealerScore}\n${amount > 0 ? `+${amount} 💰` : ''}`,
        [{ text: 'OK', style: 'default' }]
      );
    }, 500);
  };

  const resetGame = () => {
    setChoosingBet(true);
    setBet(0);
    setPlayerCards([]);
    setDealerCards([]);
    setGameOver(false);
    setGameStarted(false);
    setDealerHidden(true);
    setGameStatus('');
    setPlayerScore(0);
    setDealerScore(0);
    setWinAmount(0);
  };

  // Рендер карты
  const renderCard = (card, index, isDealer = false, isHidden = false) => {
    if (isHidden) {
      return (
        <Animated.View 
          key={index} 
          style={[styles.card, styles.cardHidden, { transform: [{ scale: cardScale }] }]}
        >
          <View style={styles.cardPattern}>
            <Text style={styles.cardPatternText}>♠♣♥♦</Text>
            <Text style={styles.cardPatternText}>♠♣♥♦</Text>
            <Text style={styles.cardPatternText}>♠♣♥♦</Text>
          </View>
          <View style={styles.cardBackLogo}>
            <Text style={styles.cardBackLogoText}>21</Text>
          </View>
        </Animated.View>
      );
    }

    return (
      <Animated.View 
        key={index} 
        style={[styles.card, { transform: [{ scale: cardScale }] }]}
      >
        <View style={styles.cardCornerTop}>
          <Text style={[styles.cardValue, { color: SUIT_COLORS[card.suit] }]}>
            {card.value}
          </Text>
          <Text style={[styles.cardSuit, { color: SUIT_COLORS[card.suit] }]}>
            {card.suit}
          </Text>
        </View>
        
        <View style={styles.cardCenter}>
          <Text style={[styles.cardCenterSuit, { color: SUIT_COLORS[card.suit] }]}>
            {card.suit}
          </Text>
        </View>
        
        <View style={styles.cardCornerBottom}>
          <Text style={[styles.cardValue, { color: SUIT_COLORS[card.suit] }]}>
            {card.value}
          </Text>
          <Text style={[styles.cardSuit, { color: SUIT_COLORS[card.suit] }]}>
            {card.suit}
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Шапка */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>BLACKJACK 21</Text>
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>BALANS:</Text>
              <Text style={styles.balanceAmount}>{balance.toLocaleString()} 💰</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.profileButton}>
            <Text style={styles.profileButtonText}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Основное поле игры */}
        <View style={styles.gameArea}>
          {/* Дилер */}
          <View style={styles.dealerSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>KRUPIER</Text>
              {!dealerHidden && (
                <Text style={styles.scoreBadge}>{dealerScore} pkt</Text>
              )}
            </View>
            <View style={styles.cardsRow}>
              {dealerCards.map((card, index) => 
                renderCard(card, index, true, index === 1 && dealerHidden)
              )}
            </View>
            {dealerHidden && dealerCards.length > 0 && (
              <Text style={styles.hiddenInfo}>Druga karta ukryta</Text>
            )}
          </View>

          {/* Разделитель */}
          <View style={styles.divider}>
            <Text style={styles.dividerText}>VS</Text>
          </View>

          {/* Игрок */}
          <View style={styles.playerSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>GRACZ</Text>
              <Text style={styles.scoreBadge}>{playerScore} pkt</Text>
            </View>
            <View style={styles.cardsRow}>
              {playerCards.map((card, index) => renderCard(card, index))}
            </View>
            
            {/* Индикатор статуса игры */}
            {gameStatus && (
              <View style={styles.gameStatus}>
                <Text style={styles.gameStatusText}>{gameStatus}</Text>
              </View>
            )}
          </View>

          {/* Индикатор выигрыша */}
          {winAmount > 0 && (
            <Animated.View style={[styles.winContainer, { transform: [{ scale: winScale }] }]}>
              <View style={styles.winInner}>
                <Text style={styles.winText}>+{winAmount} 💰</Text>
                <Text style={styles.winSubtext}>WYGRANA!</Text>
              </View>
            </Animated.View>
          )}

          {/* Серия выигрышей */}
          {currentStreak > 0 && (
            <View style={styles.streakContainer}>
              <Text style={styles.streakText}>🔥 Seria: {currentStreak} wygranych</Text>
            </View>
          )}
        </View>

        {/* Панель управления */}
        <View style={styles.controlPanel}>
          {choosingBet ? (
            <View style={styles.betSelection}>
              <Text style={styles.betTitle}>POSTAW ZAKŁAD</Text>
              <Text style={styles.betSubtitle}>Cel: pokonać krupiera bez przekraczania 21</Text>
              
              <View style={styles.betGrid}>
                {[10, 25, 50, 100, 250, 500].map((amount) => (
                  <Animated.View key={amount} style={{ transform: [{ scale: chipScale }] }}>
                    <TouchableOpacity
                      style={[
                        styles.betChip,
                        amount > balance && styles.betChipDisabled,
                      ]}
                      onPress={() => startGame(amount)}
                      disabled={amount > balance}
                    >
                      <Text style={styles.betChipText}>{amount}</Text>
                      <Text style={styles.betChipSymbol}>💰</Text>
                      {amount > balance && (
                        <View style={styles.betChipOverlay}>
                          <Text style={styles.betChipOverlayText}>Brak</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
              
              <View style={styles.betRules}>
                <Text style={styles.betRulesText}>🎯 Blackjack = x2.5</Text>
                <Text style={styles.betRulesText}>🎯 Wygrana = x2</Text>
                <Text style={styles.betRulesText}>🎯 Remis = zwrot</Text>
              </View>
            </View>
          ) : (
            <View style={styles.gameControls}>
              {/* Информация о ставке */}
              <View style={styles.gameInfo}>
                <View style={styles.betInfo}>
                  <Text style={styles.betInfoLabel}>STAWKA:</Text>
                  <Text style={styles.betInfoAmount}>{bet} 💰</Text>
                </View>
                
                {winAmount > 0 && (
                  <View style={styles.winInfo}>
                    <Text style={styles.winInfoLabel}>WYGRANA:</Text>
                    <Text style={styles.winInfoAmount}>+{winAmount} 💰</Text>
                  </View>
                )}
              </View>

              {/* Кнопки действий */}
              {!gameOver ? (
                <View style={styles.actionButtons}>
                  <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.hitButton]}
                      onPress={hit}
                      disabled={playerScore >= 21}
                    >
                      <Text style={styles.hitButtonText}>HIT</Text>
                      <Text style={styles.actionButtonSubtext}>Dobierz kartę</Text>
                    </TouchableOpacity>
                  </Animated.View>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.standButton]}
                    onPress={stand}
                  >
                    <Text style={styles.standButtonText}>STAND</Text>
                    <Text style={styles.actionButtonSubtext}>Pasuj</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.gameOverButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.playAgainButton]}
                    onPress={resetGame}
                  >
                    <Text style={styles.playAgainButtonText}>GRAJ PONOWNIE</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, styles.changeBetButton]}
                    onPress={resetGame}
                  >
                    <Text style={styles.changeBetButtonText}>ZMIEŃ STAWKĘ</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Быстрые действия */}
              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={styles.quickAction}
                  onPress={() => navigation.navigate('Home')}
                >
                  <Text style={styles.quickActionText}>🏠 MENU</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.quickAction}
                  onPress={() => {
                    Alert.alert(
                      'ZASADY BLACKJACK',
                      `🎯 Cel: zdobyć jak najbliżej 21 punktów\n` +
                      `🎯 Karty 2-10 = wartość nominalna\n` +
                      `🎯 Walet, Dama, Król = 10 punktów\n` +
                      `🎯 As = 1 lub 11 punktów\n` +
                      `🎯 Blackjack = As + 10/J/Q/K\n` +
                      `🎯 Krupier musi dobierać do 17\n\n` +
                      `💎 Blackjack = x2.5\n` +
                      `💎 Wygrana = x2\n` +
                      `💎 Remis = zwrot\n` +
                      `💎 Przegrana = strata zakładu`
                    );
                  }}
                >
                  <Text style={styles.quickActionText}>ℹ️ ZASADY</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Статистика */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🎮</Text>
              <Text style={styles.statValue}>{bjGames}</Text>
              <Text style={styles.statLabel}>GRY</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🏆</Text>
              <Text style={styles.statValue}>{bjWins}</Text>
              <Text style={styles.statLabel}>WYGRANE</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>📈</Text>
              <Text style={styles.statValue}>
                {bjGames > 0 ? ((bjWins / bjGames) * 100).toFixed(1) : 0}%
              </Text>
              <Text style={styles.statLabel}>W/L</Text>
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
    backgroundColor: 'rgba(46, 213, 115, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(46, 213, 115, 0.2)',
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
    color: '#2ED573',
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
    color: '#2ED573',
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
  gameArea: {
    flex: 3,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  dealerSection: {
    flex: 1,
    marginBottom: 10,
  },
  playerSection: {
    flex: 1,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8A8D93',
    letterSpacing: 1,
  },
  scoreBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '900',
    color: '#FFD700',
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: -15,
    paddingHorizontal: 10,
  },
  card: {
    width: 60,
    height: 85,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 5,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    position: 'relative',
  },
  cardHidden: {
    backgroundColor: '#1E3A8A',
    borderColor: '#3B82F6',
  },
  cardPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.1,
  },
  cardPatternText: {
    color: '#FFFFFF',
    fontSize: 12,
    transform: [{ rotate: '45deg' }],
    marginVertical: 2,
  },
  cardBackLogo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBackLogoText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  cardCornerTop: {
    position: 'absolute',
    top: 4,
    left: 4,
    alignItems: 'center',
  },
  cardCornerBottom: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    alignItems: 'center',
    transform: [{ rotate: '180deg' }],
  },
  cardValue: {
    fontSize: 12,
    fontWeight: '900',
  },
  cardSuit: {
    fontSize: 10,
    marginTop: -2,
  },
  cardCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardCenterSuit: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  hiddenInfo: {
    color: '#8A8D93',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  divider: {
    alignItems: 'center',
    marginVertical: 5,
  },
  dividerText: {
    color: '#8A8D93',
    fontSize: 12,
    fontWeight: '900',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  gameStatus: {
    alignItems: 'center',
    marginTop: 10,
  },
  gameStatusText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
  winContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -75,
    marginTop: -30,
    zIndex: 10,
  },
  winInner: {
    backgroundColor: 'rgba(46, 213, 115, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#2ED573',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    shadowOpacity: 0.7,
  },
  winText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  winSubtext: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  streakContainer: {
    position: 'absolute',
    top: 10,
    right: 20,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  streakText: {
    color: '#FF6B6B',
    fontSize: 9,
    fontWeight: '700',
  },
  controlPanel: {
    flex: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 15,
  },
  betSelection: {
    flex: 1,
  },
  betTitle: {
    color: '#8A8D93',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 5,
    letterSpacing: 1,
  },
  betSubtitle: {
    color: '#8A8D93',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 15,
  },
  betGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 15,
  },
  betChip: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#2ED573',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#2ED573',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    position: 'relative',
  },
  betChipDisabled: {
    backgroundColor: '#8A8D93',
    shadowColor: '#8A8D93',
    opacity: 0.6,
  },
  betChipText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  betChipSymbol: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 2,
  },
  betChipOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 71, 87, 0.8)',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  betChipOverlayText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  betRules: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginTop: 10,
  },
  betRulesText: {
    color: '#8A8D93',
    fontSize: 10,
    fontWeight: '600',
  },
  gameControls: {
    flex: 1,
  },
  gameInfo: {
    backgroundColor: 'rgba(46, 213, 115, 0.1)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  betInfo: {
    alignItems: 'center',
  },
  betInfoLabel: {
    color: '#8A8D93',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  betInfoAmount: {
    color: '#2ED573',
    fontSize: 16,
    fontWeight: '900',
  },
  winInfo: {
    alignItems: 'center',
  },
  winInfoLabel: {
    color: '#8A8D93',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  winInfoAmount: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '900',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  hitButton: {
    backgroundColor: '#FF4757',
    shadowColor: '#FF4757',
  },
  hitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  standButton: {
    backgroundColor: '#2ED573',
    shadowColor: '#2ED573',
  },
  standButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  actionButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 9,
    marginTop: 2,
  },
  gameOverButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 10,
  },
  playAgainButton: {
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
  },
  playAgainButtonText: {
    color: '#0A0E17',
    fontSize: 14,
    fontWeight: '900',
  },
  changeBetButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#8A8D93',
  },
  changeBetButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 10,
  },
  quickAction: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  quickActionText: {
    color: '#8A8D93',
    fontSize: 11,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: 10,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    color: '#8A8D93',
    fontSize: 8,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});