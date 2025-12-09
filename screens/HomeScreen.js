import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  SafeAreaView
} from 'react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation, balance }) {
  // Данные для игр
  const games = [
    {
      id: 1,
      title: "Jednoręki bandyta",
      subtitle: "Klasyczne sloty",
      icon: "🎰",
      color: "#FF6B6B",
      screen: 'SlotMachine',
      description: "Kręć bębnami i wygrywaj nagrody!"
    },
    {
      id: 2,
      title: "Gra 21",
      subtitle: "Blackjack",
      icon: "♠️",
      color: "#4ECDC4",
      screen: 'Blackjack',
      description: "Pokonaj krupiera w klasycznej grze karcianej"
    },
    {
      id: 3,
      title: "Wyścigi języków",
      subtitle: "Nowość!",
      icon: "🏇",
      color: "#FFD166",
      screen: 'HorseRace',
      description: "Obstaw na swój ulubiony język programowania"
    },
    {
      id: 4,
      title: "Profil gracza",
      subtitle: "Twoje statystyki",
      icon: "👤",
      color: "#06D6A0",
      screen: 'Profile',
      description: "Sprawdź swoje osiągnięcia i historię gier"
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Заголовок */}
        <View style={styles.header}>
          <Text style={styles.title}>🎰 ROYAL CASINO 🎲</Text>
          <Text style={styles.subtitle}>Losowanie na najwyższym poziomie</Text>
        </View>

        {/* Панель баланса */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>TWÓJ BALANS</Text>
            <View style={styles.chip}>
              <Text style={styles.chipText}>VIP</Text>
            </View>
          </View>
          <Text style={styles.balanceAmount}>{balance.toLocaleString()} 💰</Text>
          <Text style={styles.balanceHint}>Dostępne środki do gry</Text>
          
          <TouchableOpacity 
            style={styles.depositButton}
            onPress={() => console.log('Deposit pressed')}
          >
            <Text style={styles.depositButtonText}>+ Doładuj konto</Text>
          </TouchableOpacity>
        </View>

        {/* Приветствие */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Witaj, Graczu! 🎮</Text>
          <Text style={styles.welcomeText}>
            Wybierz grę i spróbuj swojego szczęścia. 
            Pamiętaj o odpowiedzialnej grze!
          </Text>
        </View>

        {/* Сетка игр */}
        <View style={styles.gamesSection}>
          <Text style={styles.sectionTitle}>DOSTĘPNE GRY</Text>
          
          {games.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={[styles.gameCard, { borderLeftColor: game.color }]}
              onPress={() => navigation.navigate(game.screen)}
              activeOpacity={0.7}
            >
              <View style={styles.gameHeader}>
                <Text style={styles.gameIcon}>{game.icon}</Text>
                <View style={styles.gameTitleContainer}>
                  <Text style={styles.gameTitle}>{game.title}</Text>
                  <Text style={styles.gameSubtitle}>{game.subtitle}</Text>
                </View>
                <View style={styles.arrowContainer}>
                  <Text style={styles.arrow}>➔</Text>
                </View>
              </View>
              <Text style={styles.gameDescription}>{game.description}</Text>
              
              <View style={styles.gameStats}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>24/7</Text>
                  <Text style={styles.statLabel}>Dostępne</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statValue}>95%</Text>
                  <Text style={styles.statLabel}>RTP</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statValue}>🎯</Text>
                  <Text style={styles.statLabel}>Losowe</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Информация */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ Informacje</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>• Graj odpowiedzialnie</Text>
            <Text style={styles.infoText}>• Wsparcie 24/7</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>• Bezpieczne płatności</Text>
            <Text style={styles.infoText}>• Certyfikat RNG</Text>
          </View>
        </View>

        {/* Футер */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 Royal Casino. Wersja 1.0.0</Text>
          <Text style={styles.footerText}>Tylko dla osób powyżej 18 roku życia</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0E17',
  },
  scrollContainer: {
    paddingHorizontal: width * 0.05,
    paddingVertical: 20,
    paddingBottom: 40,
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 10,
  },
  title: {
    fontSize: width > 400 ? 32 : 28,
    fontWeight: '900',
    color: '#FFD700',
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    letterSpacing: 1,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#8A8D93',
    letterSpacing: 0.5,
  },
  balanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.1)',
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  balanceLabel: {
    color: '#8A8D93',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  chip: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  chipText: {
    color: '#0A0E17',
    fontSize: 10,
    fontWeight: '900',
  },
  balanceAmount: {
    fontSize: width > 400 ? 42 : 36,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  balanceHint: {
    color: '#8A8D93',
    fontSize: 12,
    marginBottom: 15,
  },
  depositButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  depositButtonText: {
    color: '#0A0E17',
    fontSize: 16,
    fontWeight: '700',
  },
  welcomeCard: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 25,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  welcomeTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  welcomeText: {
    color: '#B0B3B8',
    fontSize: 14,
    lineHeight: 20,
  },
  gamesSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    color: '#8A8D93',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 15,
    paddingLeft: 5,
  },
  gameCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  gameIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  gameTitleContainer: {
    flex: 1,
  },
  gameTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  gameSubtitle: {
    color: '#8A8D93',
    fontSize: 12,
  },
  arrowContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  gameDescription: {
    color: '#B0B3B8',
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
  },
  gameStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 10,
    padding: 10,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: '#8A8D93',
    fontSize: 10,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 25,
  },
  infoTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: width > 400 ? 'row' : 'column',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 10,
  },
  infoText: {
    color: '#8A8D93',
    fontSize: 12,
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  footerText: {
    color: '#8A8D93',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 4,
  },
});