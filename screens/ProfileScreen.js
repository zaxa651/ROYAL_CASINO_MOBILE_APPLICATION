import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, StyleSheet, FlatList, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({
  balance, setBalance,
  slotGames, slotWins, slotHistory,
  bjGames, bjWins, bjHistory,
  raceGames, raceWins, raceHistory
}) {

  const [avatar, setAvatar] = useState(null);

  // ładowanie avatara z pamięci
  useEffect(() => {
    const loadAvatar = async () => {
      const saved = await AsyncStorage.getItem('avatarImage');
      if (saved) setAvatar(saved);
    };
    loadAvatar();
  }, []);

  // zapis avatara
  const saveAvatar = async (uri) => {
    setAvatar(uri);
    await AsyncStorage.setItem('avatarImage', uri);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Brak dostępu do galerii!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.canceled) saveAvatar(result.assets[0].uri);
  };

  const takeCredit = () => {
    Alert.alert('Kredyt przyznany!', 'Dodano 100 💰 do twojego balansu ;)');
    setBalance(balance + 100);
  };

  const renderHistory = (title, data) => (
    <>
      <Text style={styles.subTitle}>{title} (ostatnie 5):</Text>
      <FlatList
        data={data.slice(-5).reverse()}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <Text style={styles.historyItem}>{item}</Text>}
      />
    </>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Twój profil</Text>

      {avatar && <Image source={{ uri: avatar }} style={styles.avatar} />}
      <Button title="Wybierz zdjęcie" onPress={pickImage} />

      <Text style={styles.stat}>Saldo: {balance} 💰</Text>

      {balance <= 0 && (
        <Button title="Weź kredyt (+100 💰)" onPress={takeCredit} color="red" />
      )}

      <Text style={styles.stat}>🎰 Sloty - Gier: {slotGames}, Wygrane: {slotWins}</Text>
      {renderHistory('Sloty', slotHistory)}

      <Text style={styles.stat}>🂡 Blackjack - Gier: {bjGames}, Wygrane: {bjWins}</Text>
      {renderHistory('Blackjack', bjHistory)}

      <Text style={styles.stat}>🏇 Wyścigi - Gier: {raceGames}, Wygrane: {raceWins}</Text>
      {renderHistory('Wyścigi', raceHistory)}
    </View>
  );
}

// ======================= STYLES =======================
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  avatar: { width: 150, height: 150, borderRadius: 75, marginBottom: 20 },
  stat: { fontSize: 18, marginBottom: 5 },
  subTitle: { fontSize: 20, marginTop: 15, marginBottom: 5, fontWeight: 'bold' },
  historyItem: { fontSize: 16, paddingVertical: 2 },
});
