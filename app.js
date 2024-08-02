const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const sartDB = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    console.log('Server restarted...!')
  } catch (e) {
    console.log(e.message)
    process.exit(1)
  }
}

sartDB()

const convertDbObjectToResponseObject = eachPlayer => {
  return {
    playerId: eachPlayer.player_id,
    playerName: eachPlayer.player_name,
    jerseyNumber: eachPlayer.jersey_number,
    role: eachPlayer.role,
  }
}

//GET players API
app.get('/players/', async (req, res) => {
  const getPlayersList = `SELECT * FROM cricket_team`
  const responseData = await db.all(getPlayersList)
  res.send(responseData.map(each => convertDbObjectToResponseObject(each)))
})

//POST Player API
app.post('/players/', async (request, response) => {
  const clientBody = request.body
  const {playerName, jerseyNumber, role} = clientBody

  const sqlQuery = `INSERT INTO cricket_team (player_name, jersey_number, role) 
  VALUES ('${playerName}', '${jerseyNumber}', '${role}');`

  const dbResponse = await db.run(sqlQuery)
  response.send('Player Added to Team')
})

//GET only one player API
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const sqlQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId};`
  const playerDetails = await db.get(sqlQuery)
  response.send(convertDbObjectToResponseObject(playerDetails))
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const clientBody = request.body
  const {playerName, jerseyNumber, role} = clientBody
  const sqlQuery = `
  UPDATE 
    cricket_team 
  SET 
    player_name = '${playerName}',
    jersey_number = '${jerseyNumber}',
    role = '${role}'
  WHERE player_id = ${playerId}
  `
  await db.run(sqlQuery)
  response.send('Player Details Updated')
})

//DELETE API
app.delete('/players/:playerId/', async (request, respond) => {
  const {playerId} = request.params
  const sqlQuery = `
  DELETE 
  FROM cricket_team
  WHERE  player_id = ${playerId};`
  await db.run(sqlQuery)
  respond.send('Player Removed!')
})

app.listen(3000)

module.exports = app
