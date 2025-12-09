import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Dimensions,
  Animated,
  TextInput
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function ProfileScreen({
  navigation,
  balance,
  setBalance,
  slotGames,
  slotWins,
  slotHistory,
  bjGames,
  bjWins,
  bjHistory,
  raceGames,
  raceWins,
  raceHistory
}) {
  const [avatar, setAvatar] = useState(null);
  const [playerName, setPlayerName] = useState('Gracz VIP');
  const [selectedTab, setSelectedTab] = useState('stats');
  const [totalGames, setTotalGames] = useState(0);
  const [totalWins, setTotalWins] = useState(0);
  const [level, setLevel] = useState(1);
  const [achievements, setAchievements] = useState({});
  const [creditScale] = useState(new Animated.Value(1));

  // Загрузка всего при старте
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const savedAvatar = await AsyncStorage.getItem('avatarImage');
        const savedName = await AsyncStorage.getItem('playerName');
        const savedBalance = await AsyncStorage.getItem('playerBalance');
        const savedAchievements = await AsyncStorage.getItem('achievements');
        const savedLevel = await AsyncStorage.getItem('playerLevel');

        if (savedAvatar) setAvatar(savedAvatar);
        if (savedName) setPlayerName(savedName);
        if (savedBalance) setBalance(Number(savedBalance));
        if (savedAchievements) setAchievements(JSON.parse(savedAchievements));
        if (savedLevel) setLevel(Number(savedLevel));
      } catch (err) {
        console.log('Error loading profile', err);
      }
    };
    loadProfile();
  }, []);

  // Автоматическое обновление статистики
  useEffect(() => {
    const updateStats = () => {
      const games = slotGames + bjGames + raceGames;
      const wins = slotWins + bjWins + raceWins;
      setTotalGames(games);
      setTotalWins(wins);

      const newLevel = Math.floor(games / 10) + 1;
      setLevel(newLevel);
      AsyncStorage.setItem('playerLevel', newLevel.toString());

      // Обновление ачивок
      const newAch = {
        slot10: slotGames >= 10,
        bj5: bjWins >= 5,
        balance1k: balance >= 1000,
        wins10: wins >= 10,
      };
      setAchievements(newAch);
      AsyncStorage.setItem('achievements', JSON.stringify(newAch));
    };

    updateStats(); // Вызываем сразу при изменении данных
  }, [slotGames, bjGames, raceGames, slotWins, bjWins, raceWins, balance]);

  // Сохранение изменений
  const saveAvatar = async (uri) => {
    setAvatar(uri);
    await AsyncStorage.setItem('avatarImage', uri);
  };

  const saveName = async (name) => {
    setPlayerName(name);
    await AsyncStorage.setItem('playerName', name);
  };

  const saveBalance = async (amount) => {
    setBalance(amount);
    await AsyncStorage.setItem('playerBalance', amount.toString());
  };

  // Выбор аватара
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Brak uprawnień', 'Potrzebujemy dostępu do galerii.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) saveAvatar(result.assets[0].uri);
  };

  // VIP кредит
  const takeCredit = () => {
    Animated.sequence([
      Animated.timing(creditScale, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(creditScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    const newBalance = balance + 1000;
    saveBalance(newBalance);
    Alert.alert('Kredyt VIP!', 'Dodano 1000 💰!');
  };

  // Рендер истории
  const renderHistory = (title, data, icon) => {
    const displayData = data.slice(-10).reverse();

    return (
      <View style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyIcon}>{icon}</Text>
          <Text style={styles.historyTitle}>{title}</Text>
          <Text style={styles.historyCount}>({displayData.length})</Text>
        </View>

        {displayData.length > 0 ? (
          <ScrollView style={styles.historyList}>
            {displayData.map((item, index) => (
              <View key={index} style={styles.historyItem}>
                <View style={styles.historyNumber}>
                  <Text style={styles.historyNumberText}>
                    #{displayData.length - index}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.historyText,
                    item.includes('Win')
                      ? styles.historyWin
                      : item.includes('Lose')
                      ? styles.historyLose
                      : styles.historyDraw,
                  ]}>
                  {item}
                </Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.noHistory}>Brak historii</Text>
        )}
      </View>
    );
  };

  // Рендер статистики
  const renderStats = () => (
    <View style={styles.statsContainer}>
      {/* Основная статистика */}
      <View style={styles.mainStats}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🎮</Text>
          <Text style={styles.statNumber}>{totalGames}</Text>
          <Text style={styles.statLabel}>ŁĄCZNA LICZBA GIER</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🏆</Text>
          <Text style={styles.statNumber}>{totalWins}</Text>
          <Text style={styles.statLabel}>WYGRANYCH GIER</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📊</Text>
          <Text style={styles.statNumber}>
            {totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(1) : 0}%
          </Text>
          <Text style={styles.statLabel}>EFEKTYWNOŚĆ</Text>
        </View>
      </View>

      {/* Статистика по играм */}
      <View style={styles.gameStats}>
        {/* Sloty */}
        <View style={styles.gameStatCard}>
          <View style={styles.gameStatHeader}>
            <Text style={styles.gameStatIcon}>🎰</Text>
            <Text style={styles.gameStatTitle}>SLOTY</Text>
          </View>
          <View style={styles.gameStatRow}>
            <Text style={styles.gameStatLabel}>Gry:</Text>
            <Text style={styles.gameStatValue}>{slotGames}</Text>
          </View>
          <View style={styles.gameStatRow}>
            <Text style={styles.gameStatLabel}>Wygrane:</Text>
            <Text style={styles.gameStatValue}>{slotWins}</Text>
          </View>
          <View style={styles.gameStatRow}>
            <Text style={styles.gameStatLabel}>W/L:</Text>
            <Text style={styles.gameStatValue}>
              {slotGames > 0 ? ((slotWins / slotGames) * 100).toFixed(1) : 0}%
            </Text>
          </View>
        </View>

        {/* Blackjack */}
        <View style={styles.gameStatCard}>
          <View style={styles.gameStatHeader}>
            <Text style={styles.gameStatIcon}>🂡</Text>
            <Text style={styles.gameStatTitle}>BLACKJACK</Text>
          </View>
          <View style={styles.gameStatRow}>
            <Text style={styles.gameStatLabel}>Gry:</Text>
            <Text style={styles.gameStatValue}>{bjGames}</Text>
          </View>
          <View style={styles.gameStatRow}>
            <Text style={styles.gameStatLabel}>Wygrane:</Text>
            <Text style={styles.gameStatValue}>{bjWins}</Text>
          </View>
          <View style={styles.gameStatRow}>
            <Text style={styles.gameStatLabel}>W/L:</Text>
            <Text style={styles.gameStatValue}>
              {bjGames > 0 ? ((bjWins / bjGames) * 100).toFixed(1) : 0}%
            </Text>
          </View>
        </View>

        {/* Wyścigi */}
        <View style={styles.gameStatCard}>
          <View style={styles.gameStatHeader}>
            <Text style={styles.gameStatIcon}>🏇</Text>
            <Text style={styles.gameStatTitle}>WYŚCIGI</Text>
          </View>
          <View style={styles.gameStatRow}>
            <Text style={styles.gameStatLabel}>Gry:</Text>
            <Text style={styles.gameStatValue}>{raceGames}</Text>
          </View>
          <View style={styles.gameStatRow}>
            <Text style={styles.gameStatLabel}>Wygrane:</Text>
            <Text style={styles.gameStatValue}>{raceWins}</Text>
          </View>
          <View style={styles.gameStatRow}>
            <Text style={styles.gameStatLabel}>W/L:</Text>
            <Text style={styles.gameStatValue}>
              {raceGames > 0 ? ((raceWins / raceGames) * 100).toFixed(1) : 0}%
            </Text>
          </View>
        </View>
      </View>

      {/* Баланс */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceTitle}>AKTUALNY BALANS</Text>
          <Text style={styles.vipBadge}>VIP</Text>
        </View>
        <Text style={styles.balanceAmount}>{balance.toLocaleString()} 💰</Text>

        {balance <= 1000 && (
          <Animated.View style={{ transform: [{ scale: creditScale }] }}>
            <TouchableOpacity style={styles.creditButton} onPress={takeCredit}>
              <Text style={styles.creditButtonText}>
                WEŹ KREDYT VIP +1000💰
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Шапка профиля */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>PROFIL GRACZA</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Основной контент */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Аватар и информация */}
          <View style={styles.profileHeader}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarPlaceholderText}>👤</Text>
                </View>
              )}
              <View style={styles.avatarEdit}>
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <View style={styles.profileInfo}>
              <TextInput
                value={playerName}
                onChangeText={saveName}
                style={styles.playerNameInput}
                placeholder="Wpisz swoje imię"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
              <Text style={styles.playerLevel}>Poziom: {level}</Text>
              <View style={styles.levelBar}>
                <View
                  style={[
                    styles.levelFill,
                    { width: `${(totalGames % 10) * 10}%` },
                  ]}
                />
              </View>
              <Text style={styles.levelText}>
                Do następnego poziomu: {10 - (totalGames % 10)} gier
              </Text>
            </View>
          </View>

          {/* Табы */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'stats' && styles.tabActive]}
              onPress={() => setSelectedTab('stats')}>
              <Text
                style={[
                  styles.tabText,
                  selectedTab === 'stats' && styles.tabTextActive,
                ]}>
                📊 STATYSTYKI
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                selectedTab === 'history' && styles.tabActive,
              ]}
              onPress={() => setSelectedTab('history')}>
              <Text
                style={[
                  styles.tabText,
                  selectedTab === 'history' && styles.tabTextActive,
                ]}>
                📋 HISTORIA
              </Text>
            </TouchableOpacity>
          </View>

          {/* Контент табов */}
          {selectedTab === 'stats' ? (
            renderStats()
          ) : (
            <View style={styles.historyContent}>
              {renderHistory('Sloty', slotHistory, '🎰')}
              {renderHistory('Blackjack', bjHistory, '🂡')}
              {renderHistory('Wyścigi', raceHistory, '🏇')}
            </View>
          )}

          {/* Достижения */}
          <View style={styles.achievementsCard}>
            <Text style={styles.achievementsTitle}>🏆 OSIĄGNIĘCIA</Text>
            <View style={styles.achievementsGrid}>
              <View
                style={[
                  styles.achievement,
                  achievements.slot10 && styles.achievementUnlocked,
                ]}>
                <Text style={styles.achievementIcon}>🎰</Text>
                <Text style={styles.achievementText}>10 gier w sloty</Text>
                <Text style={styles.achievementStatus}>
                  {achievements.slot10 ? '✓' : `${slotGames}/10`}
                </Text>
              </View>

              <View
                style={[
                  styles.achievement,
                  achievements.bj5 && styles.achievementUnlocked,
                ]}>
                <Text style={styles.achievementIcon}>🂡</Text>
                <Text style={styles.achievementText}>5 wygranych w BJ</Text>
                <Text style={styles.achievementStatus}>
                  {achievements.bj5 ? '✓' : `${bjWins}/5`}
                </Text>
              </View>

              <View
                style={[
                  styles.achievement,
                  achievements.balance1k && styles.achievementUnlocked,
                ]}>
                <Text style={styles.achievementIcon}>💰</Text>
                <Text style={styles.achievementText}>1000+ monet</Text>
                <Text style={styles.achievementStatus}>
                  {achievements.balance1k ? '✓' : `${balance}/1000`}
                </Text>
              </View>

              <View
                style={[
                  styles.achievement,
                  achievements.wins10 && styles.achievementUnlocked,
                ]}>
                <Text style={styles.achievementIcon}>🏆</Text>
                <Text style={styles.achievementText}>10 wygranych</Text>
                <Text style={styles.achievementStatus}>
                  {achievements.wins10 ? '✓' : `${totalWins}/10`}
                </Text>
              </View>
            </View>
          </View>

          {/* Информация */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>ℹ️ INFORMACJE O PROFILU</Text>
            <Text style={styles.infoText}>
              • Zdjęcie profilowe: dotknij avatara, aby zmienić
            </Text>
            <Text style={styles.infoText}>
              • Statystyki aktualizowane w czasie rzeczywistym
            </Text>
            <Text style={styles.infoText}>
              • Historia przechowuje ostatnie 10 wyników z każdej gry
            </Text>
            <Text style={styles.infoText}>
              • Poziom rośnie co 10 rozegranych gier
            </Text>
            <Text style={styles.infoText}>
              • Kliknij na imię, aby je zmienić
            </Text>
          </View>

          {/* Футер */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2024 Royal Casino</Text>
            <Text style={styles.footerText}>
              ID Gracza: VIP-{Date.now().toString().slice(-6)}
            </Text>
            <Text style={styles.footerText}>Wersja 1.0.0</Text>
          </View>
        </ScrollView>
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
    backgroundColor: 'rgba(116, 185, 255, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(116, 185, 255, 0.2)',
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
    color: '#74B9FF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#74B9FF',
    letterSpacing: 1,
  },
  headerSpacer: {
    width: 36,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#74B9FF',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(116, 185, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#74B9FF',
  },
  avatarPlaceholderText: {
    fontSize: 40,
  },
  avatarEdit: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#74B9FF',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 20,
  },
  playerNameInput: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(116, 185, 255, 0.3)',
  },
  playerLevel: {
    fontSize: 12,
    color: '#74B9FF',
    fontWeight: '600',
    marginBottom: 6,
  },
  levelBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  levelFill: {
    height: '100%',
    backgroundColor: '#74B9FF',
    borderRadius: 3,
  },
  levelText: {
    fontSize: 10,
    color: '#8A8D93',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginTop: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: 'rgba(116, 185, 255, 0.2)',
  },
  tabText: {
    color: '#8A8D93',
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#74B9FF',
    fontWeight: '700',
  },
  statsContainer: {
    paddingHorizontal: 15,
    marginTop: 15,
  },
  mainStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 9,
    color: '#8A8D93',
    textAlign: 'center',
    lineHeight: 12,
  },
  gameStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  gameStatCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  gameStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  gameStatIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  gameStatTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  gameStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  gameStatLabel: {
    fontSize: 9,
    color: '#8A8D93',
  },
  gameStatValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  balanceCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    marginBottom: 15,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  balanceTitle: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginRight: 10,
  },
  vipBadge: {
    backgroundColor: '#FFD700',
    color: '#0A0E17',
    fontSize: 10,
    fontWeight: '900',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  creditButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  creditButtonText: {
    color: '#0A0E17',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  historyContent: {
    paddingHorizontal: 15,
    marginTop: 15,
  },
  historyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  historyCount: {
    fontSize: 10,
    color: '#8A8D93',
  },
  historyList: {
    maxHeight: 200,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  historyNumber: {
    width: 30,
    alignItems: 'center',
    marginRight: 10,
  },
  historyNumberText: {
    fontSize: 10,
    color: '#8A8D93',
    fontWeight: '600',
  },
  historyText: {
    fontSize: 12,
    flex: 1,
  },
  historyWin: {
    color: '#2ED573',
  },
  historyLose: {
    color: '#FF4757',
  },
  historyDraw: {
    color: '#FFD700',
  },
  noHistory: {
    color: '#8A8D93',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  achievementsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 15,
    marginTop: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  achievementsTitle: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 15,
    letterSpacing: 1,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievement: {
    width: width * 0.43,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  achievementUnlocked: {
    backgroundColor: 'rgba(46, 213, 115, 0.1)',
    borderColor: 'rgba(46, 213, 115, 0.3)',
  },
  achievementIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  achievementText: {
    fontSize: 10,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: '600',
  },
  achievementStatus: {
    fontSize: 10,
    fontWeight: '900',
    color: '#8A8D93',
  },
  infoCard: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 15,
    marginTop: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  infoTitle: {
    color: '#4A90E2',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 1,
  },
  infoText: {
    color: '#B0B3B8',
    fontSize: 10,
    lineHeight: 16,
    marginBottom: 4,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 15,
  },
  footerText: {
    color: '#8A8D93',
    fontSize: 9,
    textAlign: 'center',
    marginBottom: 3,
  },
});