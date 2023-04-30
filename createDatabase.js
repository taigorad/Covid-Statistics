////
const { connection } = require('./connector')
const  data  = require('./data')

const refreshAll = async () => {
   // await connection.deleteMany({})
    // console.log(connection)
    //await connection.save(data[0])
    //console.log(data[9])

    await connection.insertMany(data)
   
}
refreshAll()

module.exports=refreshAll