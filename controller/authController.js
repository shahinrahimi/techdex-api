const User = require('../model/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const createAccessToken = (foundUser, expiresIn='15min') => {
  const accessToken = jwt.sign(
    // payload
    { 
      "UserInfo": { 
          "username" :foundUser.username,
          "roles" : foundUser.roles,
          "userId": foundUser._id
      }
    },
    // secret
    process.env.ACCESS_TOKEN_SECRET,
    // callback
    { expiresIn: expiresIn}
  )

  return accessToken
}

const createRefreshToken = (foundUser, expiresIn='1d') => {
  const refreshToken = jwt.sign(
    {
      "username": foundUser.username
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: expiresIn}
  )
}

// @desc Login
// @route POST /auth
// @access Public
const login = async (req, res) => {
  const { username, password } = req.body

  // confirm data
  if (!username || !password){
    return res.status(400).json({
      'message': "All fields are required"
    })
  }

  //  Check User
  // explicit to execute the query string
  const foundUser = await User.findOne({ username }).exec()

  if (!foundUser) {
    return res.status(401).json({
      "message": "Unauthorized"
    })
  }

  const match =  await bcrypt.compare(password, foundUser.password)

  if (!match){
    return res.status(401).json({
      "message": "Unauthorized"
    })
  }

  const accessToken = createAccessToken(foundUser)
  const refreshToken = createRefreshToken(foundUser)

  res.cookie('jwt', refreshToken, {
    httpOnly: true, //
    secure: true,
    sameSite: 'None',
    maxAge: 1 * 24 * 60 * 60 * 1000 // set to 1 day
  })

  res.json({ accessToken })

}

// @desc refresh
// @route POST /refresh
// @access Public

const refresh = async (req, res) => {
  const cookie = req.cookies

  if (!cookie?.jwt){
    return res.status(401).json({
      message: "Unauthorized"
    })
  }

  const refreshToken = cookie.jwt

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) {
        return res.status(403).json({
          message: "Forbidden"
        })
      }

      const foundUser = await User.findOne({ username: decoded.username }).exec()

      if (!foundUser) {
        return res.status(401).json({
          message: "Unauthorized"
        })
      }

      const accessToken = createAccessToken(foundUser)

      res.json({ accessToken })
    }
  )
}

// @desc logout
// @route POST /auth/logout
// @access Public
const logout = async (req, res) => {
    const cookies = req.cookies
    if( !cookies?.jwt ) return res.sendStatus(204) // No content
    res.clearCookie('jwt', {
        httpOnly: true,
        secure: true, 
        sameSite: 'None'
    })
    res.json({ message: 'Cookie cleared' })
}

module.exports = {
    login,
    refresh,
    logout
}