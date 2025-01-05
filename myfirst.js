

































































































// graphlookup
exports.graphlookup = async (req,res) =>{
  try {
    const siva=await reffer.aggregate([
      {
        $match: {
          "refferalid": new mongoose.Types.ObjectId(Onlineid)
        }
      },
        {      
          $graphLookup: {
            from: "refferalusers",
            startWith: "$refferalid",
            connectFromField: "downlines.childid",
            connectToField: "refferalid",
            as: "string"
          }
        },
        {
          $unwind: "$string"
        },
    ])
    let store=[]
    for (let i = 0; i < siva.length; i++) {
    store.push(siva[i].string.downlines)  
    }
    let a=store.flat().length
   
    if (a >=1 && a<=2) {
    const levelup=await reffer.updateOne({refferalid:Onlineid},{ $set: { leveluser: 1,rewart:10 } }) 
    return res.send({status:true,data:levelup,message:"level 1 complete"})  
    } else if (a >= 3&& a <= 9){
      const levelup=await reffer.updateOne({refferalid:Onlineid},{ $set: { leveluser: 2,rewart:20 } }) 
      return res.send({status:true,data:levelup,message:"level 2 complete"}) 
    } else {
      const levelup=await reffer.updateOne({refferalid:Onlineid},{ $set: { leveluser: 3,rewart:30 } }) 
      return res.send({status:true,data:levelup,message:"level 3 complete"})    
    }

  } catch (error) {
    res.send(error)
  }
}





