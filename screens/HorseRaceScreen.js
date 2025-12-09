import React, { useState, useEffect } from 'react'
import { View, Text, Button, StyleSheet, Pressable } from 'react-native'

export default function HorseRaceScreen({
  balance, setBalance,
  raceGames, setRaceGames,
  raceWins, setRaceWins,
  raceHistory, setRaceHistory,
}) {

  // dostępne języki do wyścigu
  const languages = ['JavaScript', 'Python', 'C++', 'Java']

  // postęp każdego języka
  const [progress, setProgress] = useState({})
  
  // czy wyścig trwa
  const [running, setRunning] = useState(false)

  // zwycięzca aktualnego wyścigu
  const [winner, setWinner] = useState(null)

  // aktualna stawka gracza
  const [bet, setBet] = useState(null)

  // na kogo obstawiamy
  const [selectedHorse, setSelectedHorse] = useState(null)


  // przygotowanie nowej gry
  const startRace = () => {

    // brak balansu = elo ;)
    if (balance <= 0) {
      alert('Brak środków, idź po kredyt ;)')
      return
    }

    // musi wybrać konia
    if (!selectedHorse) {
      alert('Wybierz język, na którego obstawiasz!')
      return
    }

    // musi wybrać stawkę
    if (!bet) {
      alert('Wybierz stawkę ;)')
      return
    }

    // odejmujemy stawkę od balansu
    setBalance(balance - bet)

    // resetujemy postęp
    const start = {}
    languages.forEach(l => start[l] = 0)
    setProgress(start)

    // reset zwycięzcy
    setWinner(null)

    // start!
    setRunning(true)
  }


  // logika biegu
  useEffect(() => {
    if (!running) return

    const interval = setInterval(() => {
      setProgress(prev => {
        const updated = { ...prev }

        languages.forEach(lang => {
          // tu magia ;P — każdy skacze inaczej
          const jump = Math.random() * 8 + Math.random() * 4
          updated[lang] += jump
        })

        // ktoś wygrał
        const finished = Object.entries(updated).find(([_, v]) => v >= 100)
        if (finished) {
          finishRace(finished[0])
        }

        return updated
      })
    }, 200)

    return () => clearInterval(interval)
  }, [running])


  // koniec biegu
  const finishRace = (lang) => {
    setWinner(lang)
    setRunning(false)
    setRaceGames(raceGames + 1)

    // wygrana?
    if (lang === selectedHorse) {
      const win = bet * 4
      alert(`Wygrywasz ${win} 💰`)
      setBalance(balance + win)
      setRaceWins(raceWins + 1)
      setRaceHistory([...raceHistory, `WIN +${win}`])
    } else {
      setRaceHistory([...raceHistory, `LOSE -${bet}`])
    }
  }


  return (
    <View style={styles.container}>

      {/* tytuł */}
      <Text style={styles.title}>🏇 Wyścigi języków programowania</Text>

      {/* lista koni jak prawdziwe tory */}
      {languages.map(lang => (
        <View key={lang} style={styles.track}>

          {/* nazwa języka */}
          <Text style={styles.name}>{lang}</Text>

          {/* pasek biegu */}
          <View style={styles.line}>
            <View style={[styles.runner, { width: `${progress[lang]||0}%` }]} />
          </View>

        </View>
      ))}


      {/* wybór konia */}
      {!running && !winner && (
        <View>
          <Text style={styles.label}>Obstaw język:</Text>
          <View style={{flexDirection:'row', gap:10}}>
            {languages.map(l => (
              <Pressable
                key={l}
                onPress={() => setSelectedHorse(l)}
                style={{ padding: 10, backgroundColor: selectedHorse===l ? '#FFD700' :'#ddd' }}
              >
                <Text>{l}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}


      {/* wybór stawki */}
      {!running && !winner && (
        <View>
          <Text style={styles.label}>Stawka:</Text>
          <View style={{flexDirection:'row', gap:10}}>
            {[5,10,20,50].map(v => (
              <Pressable
                key={v}
                onPress={() => setBet(v)}
                style={{padding:10, backgroundColor: bet===v? 'orange':'#ddd'}}
              >
                <Text>{v}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}




      {/* start */}
      {!running && !winner && (
        <Button title="START!" onPress={startRace}/>
      )}

      {/* zwycięzca */}
      {winner && (
        <Text style={styles.win}>Wygrywa ➤ {winner} 🎉</Text>
      )}

    </View>
  )
}


// ===== STYLES =====
const styles = StyleSheet.create({
  container: { flex:1, padding:20, gap:18 },

  title:{ fontSize:28, textAlign:'center', marginBottom:10 },

  track:{
    marginBottom:10,
  },

  name:{ fontWeight:'bold' },

  line:{
    width:'100%',
    height:14,
    backgroundColor:'#ddd',
    marginTop:3,
    borderRadius:6,
  },

  runner:{
    height:14,
    backgroundColor:'green',
    borderRadius:6,
  },

  label:{marginTop:15, fontSize:18 },

  win:{ fontSize:26, fontWeight:'bold', color:'green', textAlign:'center' },
})
