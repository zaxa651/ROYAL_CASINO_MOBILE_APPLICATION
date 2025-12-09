import React, { useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

// ekrany
import HomeScreen from './screens/HomeScreen'
import SlotMachineScreen from './screens/SlotMachineScreen'
import BlackjackScreen from './screens/BlackjackScreen'
import ProfileScreen from './screens/ProfileScreen'
import HorseRaceScreen from './screens/HorseRaceScreen'

const Stack = createNativeStackNavigator()

export default function App() {

  // ================================ BALANS ================================
  // balans gracza (globalny)
  const [balance, setBalance] = useState(100)


  // ======================= STATYSTYKI SLOTÓW ==============================
  // ile razy gracz grał w sloty
  const [slotGames, setSlotGames] = useState(0)

  // ile wygrał
  const [slotWins, setSlotWins] = useState(0)

  // historia gier
  const [slotHistory, setSlotHistory] = useState([])


  // ======================= STATYSTYKI BLACKJACK ===========================
  const [bjGames, setBJGames] = useState(0)
  const [bjWins, setBJWins] = useState(0)
  const [bjHistory, setBJHistory] = useState([])


  // ======================= STATYSTYKI WYŚCIGÓW ============================
  const [raceGames, setRaceGames] = useState(0)
  const [raceWins, setRaceWins] = useState(0)
  const [raceHistory, setRaceHistory] = useState([])


  // *********** propsy globalne przekazane do każdego ekranu
  const shared = {
    balance, setBalance,

    slotGames, setSlotGames,
    slotWins, setSlotWins,
    slotHistory, setSlotHistory,

    bjGames, setBJGames,
    bjWins, setBJWins,
    bjHistory, setBJHistory,

    raceGames, setRaceGames,
    raceWins, setRaceWins,
    raceHistory, setRaceHistory,
  }


  return (
    <NavigationContainer>

      <Stack.Navigator initialRouteName="Home">

        {/* ekran główny */}
        <Stack.Screen name="Home">
          {props => <HomeScreen {...props} {...shared} />}
        </Stack.Screen>

        {/* jednoręki bandyta */}
        <Stack.Screen name="SlotMachine">
          {props => <SlotMachineScreen {...props} {...shared} />}
        </Stack.Screen>

        {/* blackjack */}
        <Stack.Screen name="Blackjack">
          {props => <BlackjackScreen {...props} {...shared} />}
        </Stack.Screen>

        {/* wyścigi języków ;)  */}
        <Stack.Screen name="HorseRace" options={{ title: 'Ściganie języków' }}>
          {props => <HorseRaceScreen {...props} {...shared} />}
        </Stack.Screen>

        {/* profil gracza */}
        <Stack.Screen name="Profile">
          {props => <ProfileScreen {...props} {...shared} />}
        </Stack.Screen>

      </Stack.Navigator>
    </NavigationContainer>
  )
}
