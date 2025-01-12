1,quantity and price sa multiple panni total amount ah sollum
// [ { "_id": 1, "product": "A", "quantity": 10, "price": 5 },
//   { "_id": 2, "product": "B", "quantity": 5, "price": 20 },
//   { "_id": 3, "product": "C", "quantity": 8, "price": 15 }]

db.orders.aggregate([
  {
    $project: {
      product: 1,
      total: { $multiply: ["$quantity", "$price"] } // Calculate total for each order
    }
  }
])

// [ { "_id": 1, "product": "A", "total": 50 },
//   { "_id": 2, "product": "B", "total": 100 },
//   { "_id": 3, "product": "C", "total": 120 } ]
-------------------------------------------------
2, how many category user select?
  
 db.orders.aggregate([
    {  $match: { Categoryis: "abc"  } },
    {  $count: "value" }
])
  
// value 3
--------------------------------------------------
3, price list la 50 ku mela erukura price only show akum
  // [ { "_id": 1, "name": "Laptop", "price": 1200 },
  // { "_id": 2, "name": "Smartphone", "price": 800 },
  // { "_id": 3, "name": "Headphones", "price": 100 },
  // { "_id": 4, "name": "Mouse", "price": 25 },
  // { "_id": 5, "name": "Keyboard", "price": 60 },
  // { "_id": 6, "name": "Monitor", "price": 200 },
  // { "_id": 7, "name": "Charger", "price": 50 }]
db.products.aggregate([
  { $match: { price: { $gt: 50 } } }, // Filter products with price > 50
  { $sort: { price: -1 } }           // Sort by price descending
])
// [{ "_id": 1, "name": "Laptop", "price": 1200 },
//   { "_id": 2, "name": "Smartphone", "price": 800 },
//   { "_id": 6, "name": "Monitor", "price": 200 },
//   { "_id": 3, "name": "Headphones", "price": 100 },
//   { "_id": 5, "name": "Keyboard", "price": 60 }]
----------------------------------------------------

























































































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





