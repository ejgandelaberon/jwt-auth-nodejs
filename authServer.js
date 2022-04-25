require('dotenv').config()

const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')

app.use(express.json())

//should store refresh token to database in production, but for now store it locally to variable
let refreshTokens = []

app.post('/token', (req, res) => {
    const refreshToken = req.body.token
    if (refreshToken == null) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) res.sendStatus(403)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, user) => {
        if (err) return res.sendStatus(403)
        const accessToken = generateAccessToken({ name: user.name, username: user.username }, 'access')
        res.json({accessToken: accessToken})
    })
})

app.post('/login', (req, res) => {
    //todo authenticate user

    const {name, username} = req.body
    const user = { name: name, username: username }

    const accessToken = generateAccessToken(user, 'access')
    const refreshToken = generateAccessToken(user, 'refresh')
    refreshTokens.push(refreshToken)
    res.json({accessToken: accessToken, refreshToken: refreshToken})
})

app.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204)
})

function generateAccessToken(user, type = 'access') {
    if (type == 'access') return jwt.sign(user, process.env.ACCESS_TOKEN, {expiresIn: '15s'})
    if (type == 'refresh') return jwt.sign(user, process.env.REFRESH_TOKEN)
}

const port = process.env.PORT_AUTH || 3000
app.listen(port, () => console.log(`Listening to port ${port}`))