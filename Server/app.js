const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const router = express.Router();
const Collection = {
  USER: 'usercollections',
  ORDER: 'ordercollection'
}
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json())
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const InitModule = require('./InitModule');
const initObject = new InitModule();

let dbObject;
initObject.getMongoDB()
  .then(dbo => {
    dbObject = dbo;
  })
  .catch(e => {
    console.log("Mongo Connection Failed", e);
  });


//api2
router.get('/api2',async(req,res)=>{
  try{
    let dict = await dbObject.collection(Collection.USER).find().project({_id:0}).toArray();
    let dict2 = await dbObject.collection(Collection.ORDER).find().project({_id:0,date:0,orderId:0}).toArray();
    for(let i =0;i<dict.length;i++){
      let cnt=0
      for(let j=0;j<dict2.length;j++){
        if(dict[i].userId === dict2[j].userId){
          cnt = cnt+1;
         }
      }
      await dbObject.collection(Collection.USER).updateOne({userId:dict[i].userId},{
        $set:{
          noOfOrders:cnt
        }
      })
    }
    res.send({success:true,message:"Successfully Updated"})
  } catch(err){
    res.send({message:err.message})
  } 
})

//api1
router.get('/api1',async(req,res)=>{
  try{
    let dict = await dbObject.collection(Collection.USER).find().project({_id:0}).toArray();
    // console.log(dict)
    let dict2 = await dbObject.collection(Collection.ORDER).find().project({_id:0,date:0,orderId:0}).toArray();
    // console.log(dict2)
    let resp = []
    for(let i =0;i<dict.length;i++){
      let cnt=0
      let total = 0
      for(let j=0;j<dict2.length;j++){
        if(dict[i].userId === dict2[j].userId){
          cnt = cnt+1;
          total = total + Number(dict2[j].subtotal) ; 
        }
      }
      resp.push({userId:dict[i].userId,name:dict[i].name,noOfOrders:cnt,averageBillValue:parseInt(total/cnt)})
    }
    console.log(resp)
    res.send({data:resp})
  } catch(err){
    res.send({message:err.message})
  } 
})

app.use('/', router);

app.listen(9000);
