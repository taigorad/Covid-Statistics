const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
///////////
const result=require("./createDatabase")

// Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

const { connection } = require('./connector');
///////

app.get('/totalRecovered', async (req, res) => {
    try{
        const tally = await connection.aggregate([
            { $group:
               { _id: "total",
                   recovered: { $sum: '$recovered' } 
              } }
          ])
          res.json({data:tally[0]});
          /////
        // Send only the first element of the array as a response
    }catch{(err)=>{
        res.status(500).send(err)
    }}
  
});

app.get('/totalActive', async (req, res) => {
    try {
        const tally = await connection.aggregate([
            {
                $group: {
                    _id: "total",
                    infected: { $sum: "$infected" },
                    recovered: { $sum: "$recovered" },
                }
            }
        ]);

        res.json({ data: { _id: "total", active: tally[0].infected-tally[0].recovered } });
    
        
    } catch (err) {
        res.status(500).send(err);
    }
});
//totaldeath
app.get('/totalDeath', async (req, res) => {
    try{
        const tally = await connection.aggregate([
            { $group:
               { _id: "total",
               death: { $sum: '$death' },
              } }
          ])
          res.json({data:tally[0]});
          
    }catch{(err)=>{
        res.status(500).send(err);
    }}
  
});
//hotspotStates
app.get('/hotspotStates', async (req, res) => {
    try {
        const tally = await connection.aggregate([
            {
                $group: {
                    _id: "$state",
                    infected: { $sum: "$infected" },
                    recovered: { $sum: "$recovered" }
                }
            },
            {
                $project: {
                    state: "$_id",
                    rate: {
                        $round: [
                            {
                                $divide: [
                                    { $subtract: ["$infected", "$recovered"] },
                                    "$infected"
                                ]
                            },
                            5
                        ]
                    }
                }
            },
            {
                $match: {
                    rate: { $gt: 0.1 }
                }
            }
        ]);
        
        res.json({ data: tally });
        
    } catch (err) {
        res.status(500).send(err);
    }
})
    //healthyStates
    app.get('/healthyStates', async (req, res) => {
        try {
          const states = await connection.aggregate([
            {
              $project: {
                _id: "$state",
                mortality: {
                  $round: [{ $divide: ['$death', '$infected'] }, 5]
                }
              }
            },
            {
              $match: {
                mortality: { $lt: 0.005 }
              }
            },
            {
              $project: {
                _id: "$_id",
                state:"$_id",
                mortality: 1
              }
            }
          ])
      
          res.json({ data: states });
        } catch (err) {
          res.status(500).send(err);
        }
      });
      

if(process.env.NODE_ENV == "production"){
    app.use(express.static("client/build"))
}

app.listen(port, () => console.log(`App listening on port ${port}!`))

