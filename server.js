require('dotenv').config()

const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')

app.use(express.json())

const users = [
    {
        name: 'EJ Beron',
        username: 'ejberon02'
    },
    {
        name: 'Juan Dela Cruz',
        username: 'juandc'
    }
]

app.get('/user', authToken, (req, res) => {
    res.json(users.filter(user => user.name === req.user.name && user.username === req.user.username))
})

/* ------------------------------- MIDDLEWARE ------------------------------- */
function authToken(req, res, next) {
    const authHeader = req.headers['authorization']

    //check if authHeader has a value then split, otherwise return undefined
    const token = authHeader && authHeader.split(' ')[1]

    //check token, if empty, return http status 401(Unauthorized, lacks credentials)
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
        if (err) return res.sendStatus(403) //403 = Forbidden
        req.user = user
        next() //move on from middleware
    })
}

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening to port ${port}`))