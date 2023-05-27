const User = require('../model/User')

const getAllUsers = async (req, res) => {
  // faster data queries with lean
  // source https://mongoosejs.com/docs/tutorials/lean.html
  const users = await User.find({}).select('-password').lean()
  console.log(users)

  return res.status(200).json({
    message: "Query Success",
    data: users
  })
}

const addNewUser = async (req, res) => {
  const { username, password, roles } = req.body
  // confirm data
  if(!username || !password || !roles || roles?.length === 0 ){
    return res.status(400).json({
      message: "Invalid request"
    })
  }

  // check for duplication
  const duplicate = await User.findOne({ username }).exec().lean()
  if (duplicate){
    return res.status().json({
      message: "Duplicate username"
    })
  }

  // check password length


}


// const updateUser


// const deleteUser


module.exports = {
  getAllUsers
}