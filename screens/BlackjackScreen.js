import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';

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

  const drawCard = () => Math.floor(Math.random() * 10) + 1;
  const calculateTotal = cards => cards.reduce((a,b)=>a+b,0);

  const startGame = selectedBet => {
    if (selectedBet > balance) {
      Alert.alert('Nie masz wystarczająco monet!', `Twój balance: ${balance}`);
      return;
    }
    setBet(selectedBet);
    setBalance(balance - selectedBet);
    setPlayerCards([drawCard(), drawCard()]);
    setDealerCards([drawCard(), drawCard()]);
    setChoosingBet(false);
    setGameOver(false);
  };

  const hit = () => {
    if(gameOver) return;
    const newCard = drawCard();
    const newPlayerCards = [...playerCards,newCard];
    setPlayerCards(newPlayerCards);

    const total = calculateTotal(newPlayerCards);
    if(total>21){
      Alert.alert('Przegrałeś!',`Twoja suma: ${total} 😢`);
      setBJGames(bjGames+1);
      setBJHistory([...bjHistory,`Lose ${bet}💰`]);
      setGameOver(true);
    } else if(total===21){
      Alert.alert('Wygrana!',`Masz idealne 21! 🎉`);
      setBalance(balance+bet*2);
      setBJGames(bjGames+1);
      setBJWins(bjWins+1);
      setBJHistory([...bjHistory,`Win ${bet*2}💰`]);
      setGameOver(true);
    }
  };

  const stand = () => {
    if(gameOver) return;

    let dealerTotal = calculateTotal(dealerCards);
    while(dealerTotal<17){
      const card = drawCard();
      dealerCards.push(card);
      dealerTotal = calculateTotal(dealerCards);
    }
    const playerTotal = calculateTotal(playerCards);

    if(dealerTotal>21 || playerTotal>dealerTotal){
      Alert.alert('Wygrana!',`Twoja suma: ${playerTotal}, suma dealera: ${dealerTotal} 🎉`);
      setBalance(balance+bet*2);
      setBJWins(bjWins+1);
      setBJHistory([...bjHistory,`Win ${bet*2}💰`]);
    } else if(playerTotal<dealerTotal){
      Alert.alert('Przegrałeś!',`Twoja suma: ${playerTotal}, suma dealera: ${dealerTotal} 😢`);
      setBJHistory([...bjHistory,`Lose ${bet}💰`]);
    } else{
      Alert.alert('Remis!',`Twoja suma: ${playerTotal}, suma dealera: ${dealerTotal} 😐`);
      setBalance(balance+bet);
      setBJHistory([...bjHistory,`Draw ${bet}💰`]);
    }
    setBJGames(bjGames+1);
    setDealerCards([...dealerCards]);
    setGameOver(true);
  };

  const resetGame = () => {
    setChoosingBet(true);
    setBet(0);
    setPlayerCards([]);
    setDealerCards([]);
    setGameOver(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gra 21 (Blackjack)</Text>
      <Text style={styles.balance}>Balance: {balance} 💰</Text>

      {choosingBet ? (
        <View style={styles.betContainer}>
          <Text>Wybierz stawkę:</Text>
          <View style={styles.betButtons}>
            {[10,20,50].map(amount=>
              <Button key={amount} title={`${amount}`} onPress={()=>startGame(amount)}/>
            )}
          </View>
        </View>
      ) : (
        <>
          <Text style={styles.cards}>Twoje karty: {playerCards.join(', ')} ({calculateTotal(playerCards)} pkt)</Text>
          <Text style={styles.cards}>Dealer: {gameOver ? `${dealerCards.join(', ')} (${calculateTotal(dealerCards)} pkt)` : '???'}</Text>

          <View style={styles.buttons}>
            <Button title="Hit" onPress={hit} disabled={gameOver}/>
            <Button title="Stand" onPress={stand} disabled={gameOver}/>
            {gameOver && <Button title="Nowa gra" onPress={resetGame}/>}
            <Button title="Profil" onPress={()=>navigation.navigate('Profile')}/>
          </View>
          <Text style={{marginTop:10}}>Aktualna stawka: {bet} 💰</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,justifyContent:'center',alignItems:'center',padding:20},
  title:{fontSize:28,fontWeight:'bold',marginBottom:20},
  balance:{fontSize:20,marginBottom:20},
  cards:{fontSize:20,marginBottom:10},
  buttons:{flexDirection:'row',justifyContent:'space-around',width:'100%',marginTop:20},
  betContainer:{marginBottom:20,alignItems:'center'},
  betButtons:{flexDirection:'row',justifyContent:'space-around',width:'60%',marginVertical:5},
});
