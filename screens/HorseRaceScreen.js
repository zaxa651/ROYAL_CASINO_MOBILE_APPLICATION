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
  ScrollView,
  Easing
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Языки программирования с иконками
const LANGUAGES = [
  { id: 1, name: 'JavaScript', icon: '⚡', color: '#F7DF1E', description: 'Szybki i wszechstronny' },
  { id: 2, name: 'Python', icon: '🐍', color: '#3776AB', description: 'Elegancki i prosty' },
  { id: 3, name: 'Java', icon: '☕', color: '#007396', description: 'Niezawodny i skalowalny' },
  { id: 4, name: 'C++', icon: '⚙️', color: '#00599C', description: 'Wydajny i potężny' },
  { id: 5, name: 'Go', icon: '🚀', color: '#00ADD8', description: 'Szybki i współbieżny' },
  { id: 6, name: 'Rust', icon: '🦀', color: '#000000', description: 'Bezpieczny i nowoczesny' },
  { id: 7, name: 'TypeScript', icon: '📘', color: '#3178C6', description: 'Typowany JavaScript' },
  { id: 8, name: 'Swift', icon: '🍎', color: '#FA7343', description: 'Nowoczesny dla Apple' },
];

export default function HorseRaceScreen({
  navigation,
  balance,
  setBalance,
  raceGames,
  setRaceGames,
  raceWins,
  setRaceWins,
  raceHistory,
  setRaceHistory,
}) {
  // Выбранные языки для текущего заезда (4 случайных)
  const [raceLanguages, setRaceLanguages] = useState([]);
  const [progress, setProgress] = useState({});
  const [running, setRunning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [bet, setBet] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [odds, setOdds] = useState({});
  const [currentRound, setCurrentRound] = useState(0);
  const [raceStarted, setRaceStarted] = useState(false);
  const [finalResults, setFinalResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [customBet, setCustomBet] = useState('');

  // Анимации
  const raceScale = useRef(new Animated.Value(1)).current;
  const winScale = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Инициализация новой гонки
  const initializeRace = () => {
    // Выбираем 4 случайных языка
    const shuffled = [...LANGUAGES].sort(() => Math.random() - 0.5).slice(0, 4);
    setRaceLanguages(shuffled);
    
    // Сбрасываем прогресс
    const initialProgress = {};
    shuffled.forEach(lang => {
      initialProgress[lang.name] = 0;
    });
    setProgress(initialProgress);
    
    // Генерируем коэффициенты
    const newOdds = {};
    shuffled.forEach((lang, index) => {
      // Разные коэффициенты для разных позиций
      const baseOdds = [2.5, 3.0, 3.5, 4.0];
      newOdds[lang.name] = (baseOdds[index] + Math.random() * 1.5).toFixed(1);
    });
    setOdds(newOdds);
    
    // Сбрасываем состояние
    setWinner(null);
    setSelectedLanguage(null);
    setBet(0);
    setRaceStarted(false);
    setShowResults(false);
    setWinAmount(0);
    setCurrentRound(0);
    setFinalResults([]);
    setCustomBet('');
  };

  useEffect(() => {
    initializeRace();
  }, []);

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

  const handleCustomBet = () => {
    const betValue = parseInt(customBet);
    if (isNaN(betValue) || betValue <= 0) {
      Alert.alert('Błąd', 'Wprowadź poprawną kwotę');
      return;
    }
    if (betValue > balance) {
      Alert.alert('Brak środków', `Masz tylko ${balance} 💰`);
      return;
    }
    setBet(betValue);
  };

  const startRace = () => {
    if (balance <= 0) {
      Alert.alert(
        'Brak środków!',
        'Nie masz pieniędzy na zakład!',
        [{ text: 'OK', style: 'cancel' }]
      );
      return;
    }

    if (!selectedLanguage) {
      Alert.alert(
        'Wybierz język!',
        'Musisz obstawić jeden język przed rozpoczęciem wyścigu.',
        [{ text: 'OK', style: 'cancel' }]
      );
      return;
    }

    if (bet === 0) {
      Alert.alert(
        'Wybierz stawkę!',
        'Musisz wybrać kwotę zakładu.',
        [{ text: 'OK', style: 'cancel' }]
      );
      return;
    }

    if (bet > balance) {
      Alert.alert(
        'Brak środków!',
        `Masz tylko ${balance} 💰`,
        [{ text: 'OK', style: 'cancel' }]
      );
      return;
    }

    // Списание ставки
    setBalance(prev => prev - bet);
    setRaceStarted(true);
    setRunning(true);
    setRaceGames(prev => prev + 1);

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

    // Старт гонки
    simulateRace();
  };

  const simulateRace = () => {
    const roundDuration = 1500; // 1.5 секунды на раунд
    const totalRounds = 4; // 4 раунда гонки
    
    let currentProgress = { ...progress };
    const results = [];
    
    const runRound = (round) => {
      if (round > totalRounds) {
        // Гонка завершена
        finishRace(results);
        return;
      }
      
      setCurrentRound(round);
      
      // Обновляем прогресс для каждого языка
      raceLanguages.forEach(lang => {
        // Случайный прогресс + бонус за коэффициент (меньший коэффициент = больше шансов)
        const baseSpeed = Math.random() * 15;
        const oddsFactor = (4.5 - parseFloat(odds[lang.name])) * 3; // Языки с меньшим коэффициентом быстрее
        const roundProgress = baseSpeed + oddsFactor;
        
        currentProgress[lang.name] = Math.min(
          100,
          currentProgress[lang.name] + roundProgress
        );
      });
      
      setProgress({ ...currentProgress });
      
      // Определяем лидера после раунда
      const sorted = [...raceLanguages].sort(
        (a, b) => currentProgress[b.name] - currentProgress[a.name]
      );
      results[round - 1] = sorted[0].name;
      
      // Анимация прогресса
      Animated.timing(raceScale, {
        toValue: 1.05,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(raceScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
      
      // Следующий раунд
      setTimeout(() => runRound(round + 1), roundDuration);
    };
    
    runRound(1);
  };

  const finishRace = (results) => {
    setRunning(false);
    setFinalResults(results);
    
    // Определяем победителя по итогам всех раундов
    const winnerCount = {};
    results.forEach(winner => {
      winnerCount[winner] = (winnerCount[winner] || 0) + 1;
    });
    
    let finalWinner = Object.keys(winnerCount).reduce((a, b) => 
      winnerCount[a] > winnerCount[b] ? a : b
    );
    
    setWinner(finalWinner);
    setShowResults(true);
    
    // Проверка выигрыша
    setTimeout(() => {
      if (finalWinner === selectedLanguage) {
        const multiplier = parseFloat(odds[finalWinner]);
        const winTotal = Math.floor(bet * multiplier);
        setWinAmount(winTotal);
        setBalance(prev => prev + winTotal);
        setRaceWins(prev => prev + 1);
        setRaceHistory(prev => [...prev, `Win +${winTotal} (${finalWinner} @${multiplier}x)`]);
        
        Alert.alert(
          '🎉 WYGRANA!',
          `Twój język ${finalWinner} wygrał!\n` +
          `Wygrywasz ${winTotal} 💰 (${multiplier}x)`,
          [{ text: 'Super!', style: 'default' }]
        );
      } else {
        setRaceHistory(prev => [...prev, `Lose -${bet} (${selectedLanguage})`]);
        
        Alert.alert(
          '😢 PRZEGRANA',
          `Wygrał język ${finalWinner}\n` +
          `Twój wybór: ${selectedLanguage}`,
          [{ text: 'Następnym razem!', style: 'cancel' }]
        );
      }
    }, 1000);
  };

  const resetRace = () => {
    initializeRace();
  };

  // Рендер дорожки для языка
  const renderTrack = (language, index) => {
    const isSelected = selectedLanguage === language.name;
    const isWinner = winner === language.name;
    const progressValue = progress[language.name] || 0;
    
    return (
      <View key={language.id} style={styles.trackContainer}>
        {/* Номер дорожки */}
        <View style={styles.trackNumber}>
          <Text style={styles.trackNumberText}>{index + 1}</Text>
        </View>
        
        {/* Информация о языке */}
        <View style={[
          styles.languageInfo,
          isSelected && styles.languageInfoSelected,
          isWinner && styles.languageInfoWinner
        ]}>
          <View style={styles.languageHeader}>
            <Text style={[styles.languageIcon, { color: language.color }]}>
              {language.icon}
            </Text>
            <View style={styles.languageDetails}>
              <Text style={styles.languageName}>{language.name}</Text>
              <Text style={styles.languageDescription}>{language.description}</Text>
            </View>
            <View style={styles.oddsContainer}>
              <Text style={styles.oddsLabel}>KURS</Text>
              <Text style={styles.oddsValue}>{odds[language.name] || '2.5'}x</Text>
            </View>
          </View>
          
          {/* Прогресс гонки */}
          <View style={styles.progressContainer}>
            <Animated.View 
              style={[
                styles.progressBar,
                { 
                  width: `${progressValue}%`,
                  backgroundColor: language.color,
                  transform: [{ scaleX: raceScale }]
                }
              ]}
            />
            <View style={styles.progressTrack} />
            <Text style={styles.progressText}>{Math.min(100, Math.round(progressValue))}%</Text>
          </View>
          
          {/* Индикаторы */}
          <View style={styles.indicators}>
            {isSelected && (
              <View style={styles.selectedIndicator}>
                <Text style={styles.selectedIndicatorText}>TWÓJ WYBÓR</Text>
              </View>
            )}
            {isWinner && (
              <View style={styles.winnerIndicator}>
                <Text style={styles.winnerIndicatorText}>🏆 ZWYCIĘZCA</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  // Быстрые ставки
  const quickBets = [10, 25, 50, 100, 250, 500];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Шапка */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>🏇 WYŚCIGI JĘZYKÓW</Text>
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>BALANS:</Text>
              <Text style={styles.balanceAmount}>{balance.toLocaleString()} 💰</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.profileButton}>
            <Text style={styles.profileButtonText}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Основное поле гонки */}
        <ScrollView style={styles.raceArea} showsVerticalScrollIndicator={false}>
          {/* Заголовок */}
          <View style={styles.raceHeader}>
            <Text style={styles.raceTitle}>PROGRAMMING GRAND PRIX</Text>
            <Text style={styles.raceSubtitle}>Który język wygra dzisiaj?</Text>
          </View>

          {/* Информация о текущей rundzie */}
          {raceStarted && (
            <View style={styles.roundInfo}>
              <Text style={styles.roundText}>RUNDA {currentRound}/4</Text>
              <View style={styles.roundProgress}>
                <View style={[styles.roundProgressFill, { width: `${(currentRound / 4) * 100}%` }]} />
              </View>
            </View>
          )}

          {/* Дорожки */}
          <View style={styles.tracksContainer}>
            {raceLanguages.map((language, index) => renderTrack(language, index))}
          </View>

          {/* Результаты */}
          {showResults && (
            <View style={styles.resultsCard}>
              <Text style={styles.resultsTitle}>🏁 WYNIKI WYŚCIGU</Text>
              <View style={styles.resultsList}>
                {finalResults.map((result, index) => (
                  <View key={index} style={styles.resultItem}>
                    <Text style={styles.resultRound}>Runda {index + 1}:</Text>
                    <Text style={styles.resultWinner}>
                      {raceLanguages.find(l => l.name === result)?.icon} {result}
                    </Text>
                  </View>
                ))}
              </View>
              <Text style={styles.finalWinner}>
                🏆 ZWYCIĘZCA: {winner}
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
        </ScrollView>

        {/* Панель управления */}
        <View style={styles.controlPanel}>
          {!raceStarted ? (
            <View style={styles.bettingPanel}>
              {/* Выбор языка */}
              <View style={styles.selectionSection}>
                <Text style={styles.sectionTitle}>WYBIERZ JĘZYK:</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.languageScroll}
                >
                  {raceLanguages.map((language) => (
                    <TouchableOpacity
                      key={language.id}
                      style={[
                        styles.languageButton,
                        { borderColor: language.color },
                        selectedLanguage === language.name && styles.languageButtonSelected
                      ]}
                      onPress={() => setSelectedLanguage(language.name)}
                    >
                      <View style={styles.languageButtonContent}>
                        <Text style={[styles.languageButtonIcon, { color: language.color }]}>
                          {language.icon}
                        </Text>
                        <Text style={styles.languageButtonName}>{language.name}</Text>
                        <Text style={styles.languageButtonOdds}>{odds[language.name]}x</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Выбор ставки */}
              <View style={styles.betSection}>
                <Text style={styles.sectionTitle}>WYBIERZ STAWKĘ:</Text>
                
                {/* Быстрые ставки */}
                <View style={styles.quickBetsContainer}>
                  {quickBets.map((amount) => (
                    <TouchableOpacity
                      key={amount}
                      style={[
                        styles.quickBetButton,
                        bet === amount && styles.quickBetButtonSelected,
                        amount > balance && styles.quickBetButtonDisabled
                      ]}
                      onPress={() => setBet(amount)}
                      disabled={amount > balance}
                    >
                      <Text style={[
                        styles.quickBetText,
                        bet === amount && styles.quickBetTextSelected
                      ]}>
                        {amount}💰
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Кастомная ставка */}
                <View style={styles.customBetContainer}>
                  <View style={styles.customBetInputContainer}>
                    <Text style={styles.customBetLabel}>WŁASNA STAWKA:</Text>
                    <View style={styles.customBetInputWrapper}>
                      <Text style={styles.customBetPrefix}>💰</Text>
                      <Text style={styles.customBetInput}>
                        {customBet || '0'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={[
                      styles.customBetButton,
                      (!customBet || parseInt(customBet) <= 0 || parseInt(customBet) > balance) && styles.customBetButtonDisabled
                    ]}
                    onPress={handleCustomBet}
                    disabled={!customBet || parseInt(customBet) <= 0 || parseInt(customBet) > balance}
                  >
                    <Text style={styles.customBetButtonText}>USTAW</Text>
                  </TouchableOpacity>
                </View>

                {/* Блок цифр для кастомной ставки */}
                <View style={styles.numberPad}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, 'C'].map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={styles.numberButton}
                      onPress={() => {
                        if (item === '⌫') {
                          setCustomBet(prev => prev.slice(0, -1));
                        } else if (item === 'C') {
                          setCustomBet('');
                          setBet(0);
                        } else {
                          setCustomBet(prev => {
                            const newValue = prev + item;
                            return newValue.length <= 6 ? newValue : prev;
                          });
                        }
                      }}
                    >
                      <Text style={styles.numberButtonText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Информация о ставке */}
                {selectedLanguage && bet > 0 && (
                  <View style={styles.betInfoCard}>
                    <View style={styles.betInfoRow}>
                      <Text style={styles.betInfoLabel}>Twój zakład:</Text>
                      <Text style={styles.betInfoValue}>{selectedLanguage}</Text>
                    </View>
                    <View style={styles.betInfoRow}>
                      <Text style={styles.betInfoLabel}>Stawka:</Text>
                      <Text style={styles.betInfoValue}>{bet} 💰</Text>
                    </View>
                    <View style={styles.betInfoRow}>
                      <Text style={styles.betInfoLabel}>Kurs:</Text>
                      <Text style={styles.betInfoValue}>{odds[selectedLanguage]}x</Text>
                    </View>
                    <View style={styles.betInfoRow}>
                      <Text style={styles.betInfoLabel}>Potencjalna wygrana:</Text>
                      <Text style={styles.potentialWin}>
                        {Math.floor(bet * parseFloat(odds[selectedLanguage]))} 💰
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Кнопка старта */}
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                  style={[
                    styles.startButton,
                    (!selectedLanguage || bet === 0) && styles.startButtonDisabled
                  ]}
                  onPress={startRace}
                  disabled={!selectedLanguage || bet === 0}
                >
                  <Text style={styles.startButtonText}>🏁 ROZPOCZNIJ WYŚCIG!</Text>
                  <Text style={styles.startButtonSubtext}>STAWKA: {bet} 💰</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          ) : (
            <View style={styles.raceControls}>
              <View style={styles.currentBetInfo}>
                <Text style={styles.currentBetLabel}>TWÓJ ZAKŁAD:</Text>
                <View style={styles.betDetails}>
                  <View style={styles.betDetailItem}>
                    <Text style={styles.betDetailLabel}>Język:</Text>
                    <Text style={styles.betDetailValue}>{selectedLanguage}</Text>
                  </View>
                  <View style={styles.betDetailItem}>
                    <Text style={styles.betDetailLabel}>Stawka:</Text>
                    <Text style={styles.betDetailValue}>{bet} 💰</Text>
                  </View>
                  <View style={styles.betDetailItem}>
                    <Text style={styles.betDetailLabel}>Kurs:</Text>
                    <Text style={styles.betDetailValue}>{odds[selectedLanguage]}x</Text>
                  </View>
                </View>
              </View>

              {running ? (
                <View style={styles.raceStatus}>
                  <Text style={styles.raceStatusText}>🎬 WYŚCIG W TRAKCIE...</Text>
                  <View style={styles.progressAnimation}>
                    <View style={[styles.progressDot, styles.progressDot1]} />
                    <View style={[styles.progressDot, styles.progressDot2]} />
                    <View style={[styles.progressDot, styles.progressDot3]} />
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.newRaceButton}
                  onPress={resetRace}
                >
                  <Text style={styles.newRaceButtonText}>🏁 NOWY WYŚCIG</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Статистика */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🎮</Text>
              <Text style={styles.statValue}>{raceGames}</Text>
              <Text style={styles.statLabel}>WYŚCIGI</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🏆</Text>
              <Text style={styles.statValue}>{raceWins}</Text>
              <Text style={styles.statLabel}>WYGRANE</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>📈</Text>
              <Text style={styles.statValue}>
                {raceGames > 0 ? ((raceWins / raceGames) * 100).toFixed(1) : 0}%
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
    backgroundColor: 'rgba(155, 89, 182, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(155, 89, 182, 0.2)',
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
    color: '#9B59B6',
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
    color: '#9B59B6',
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
  raceArea: {
    flex: 1,
    padding: 15,
  },
  raceHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  raceTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#9B59B6',
    letterSpacing: 2,
    textShadowColor: 'rgba(155, 89, 182, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  raceSubtitle: {
    color: '#8A8D93',
    fontSize: 12,
    marginTop: 4,
  },
  roundInfo: {
    backgroundColor: 'rgba(155, 89, 182, 0.1)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  roundText: {
    color: '#9B59B6',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  roundProgress: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  roundProgressFill: {
    height: '100%',
    backgroundColor: '#9B59B6',
    borderRadius: 3,
  },
  tracksContainer: {
    marginBottom: 20,
  },
  trackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  trackNumber: {
    width: 30,
    height: 30,
    backgroundColor: 'rgba(155, 89, 182, 0.2)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  trackNumberText: {
    color: '#9B59B6',
    fontSize: 14,
    fontWeight: '900',
  },
  languageInfo: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  languageInfoSelected: {
    backgroundColor: 'rgba(155, 89, 182, 0.1)',
    borderColor: '#9B59B6',
  },
  languageInfoWinner: {
    backgroundColor: 'rgba(46, 213, 115, 0.1)',
    borderColor: '#2ED573',
  },
  languageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  languageIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  languageDetails: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  languageDescription: {
    fontSize: 10,
    color: '#8A8D93',
  },
  oddsContainer: {
    alignItems: 'center',
  },
  oddsLabel: {
    fontSize: 8,
    color: '#8A8D93',
    marginBottom: 2,
  },
  oddsValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFD700',
  },
  progressContainer: {
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 8,
  },
  progressTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
  },
  progressBar: {
    height: '100%',
    borderRadius: 10,
  },
  progressText: {
    position: 'absolute',
    right: 10,
    top: 0,
    bottom: 0,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textAlignVertical: 'center',
  },
  indicators: {
    flexDirection: 'row',
    gap: 8,
  },
  selectedIndicator: {
    backgroundColor: 'rgba(155, 89, 182, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  selectedIndicatorText: {
    color: '#9B59B6',
    fontSize: 8,
    fontWeight: '700',
  },
  winnerIndicator: {
    backgroundColor: 'rgba(46, 213, 115, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  winnerIndicatorText: {
    color: '#2ED573',
    fontSize: 8,
    fontWeight: '700',
  },
  resultsCard: {
    backgroundColor: 'rgba(155, 89, 182, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
  },
  resultsTitle: {
    color: '#9B59B6',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 1,
  },
  resultsList: {
    marginBottom: 10,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  resultRound: {
    color: '#8A8D93',
    fontSize: 12,
  },
  resultWinner: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  finalWinner: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 5,
  },
  winContainer: {
    alignItems: 'center',
    marginTop: 15,
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
    letterSpacing: 1.5,
    marginTop: 2,
  },
  controlPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 15,
    maxHeight: height * 0.6,
  },
  bettingPanel: {
    flex: 1,
  },
  selectionSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#8A8D93',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
    letterSpacing: 1,
  },
  languageScroll: {
    marginHorizontal: -15,
    paddingHorizontal: 15,
  },
  languageButton: {
    width: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    borderWidth: 2,
  },
  languageButtonSelected: {
    backgroundColor: 'rgba(155, 89, 182, 0.1)',
    borderWidth: 3,
  },
  languageButtonContent: {
    alignItems: 'center',
  },
  languageButtonIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  languageButtonName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  languageButtonOdds: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '900',
  },
  betSection: {
    marginBottom: 15,
  },
  quickBetsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 15,
  },
  quickBetButton: {
    width: width * 0.28,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickBetButtonSelected: {
    backgroundColor: 'rgba(155, 89, 182, 0.2)',
    borderColor: '#9B59B6',
    borderWidth: 2,
  },
  quickBetButtonDisabled: {
    opacity: 0.4,
  },
  quickBetText: {
    color: '#8A8D93',
    fontSize: 14,
    fontWeight: '600',
  },
  quickBetTextSelected: {
    color: '#9B59B6',
    fontWeight: '900',
    fontSize: 16,
  },
  customBetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  customBetInputContainer: {
    flex: 1,
  },
  customBetLabel: {
    color: '#8A8D93',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 5,
  },
  customBetInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  customBetPrefix: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  customBetInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    minHeight: 24,
  },
  customBetButton: {
    backgroundColor: '#9B59B6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  customBetButtonDisabled: {
    backgroundColor: 'rgba(155, 89, 182, 0.3)',
  },
  customBetButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 15,
  },
  numberButton: {
    width: width * 0.18,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  numberButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  betInfoCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  betInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  betInfoLabel: {
    color: '#8A8D93',
    fontSize: 12,
    fontWeight: '600',
  },
  betInfoValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  potentialWin: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: '900',
  },
  startButton: {
    backgroundColor: '#9B59B6',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#9B59B6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startButtonDisabled: {
    backgroundColor: 'rgba(155, 89, 182, 0.3)',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
  },
  startButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  raceControls: {
    flex: 1,
  },
  currentBetInfo: {
    backgroundColor: 'rgba(155, 89, 182, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  currentBetLabel: {
    color: '#8A8D93',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
  },
  betDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  betDetailItem: {
    alignItems: 'center',
    flex: 1,
  },
  betDetailLabel: {
    color: '#8A8D93',
    fontSize: 10,
    marginBottom: 4,
  },
  betDetailValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  raceStatus: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  raceStatusText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 15,
  },
  progressAnimation: {
    flexDirection: 'row',
    gap: 10,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFD700',
  },
  progressDot1: {
    animation: 'pulse',
    animationDuration: '1s',
    animationIterationCount: 'infinite',
  },
  progressDot2: {
    animation: 'pulse',
    animationDuration: '1s',
    animationDelay: '0.2s',
    animationIterationCount: 'infinite',
  },
  progressDot3: {
    animation: 'pulse',
    animationDuration: '1s',
    animationDelay: '0.4s',
    animationIterationCount: 'infinite',
  },
  newRaceButton: {
    backgroundColor: '#2ED573',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  newRaceButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: 12,
    marginTop: 15,
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