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
2, how many category user select this category?
  
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
4,How do you calculate the total sales and average sales in the same pipeline?
  // [{ "_id": 1, "product": "Laptop", "amount": 1200 },
  // { "_id": 2, "product": "Smartphone", "amount": 800 },
  // { "_id": 3, "product": "Headphones", "amount": 100 },
  // { "_id": 4, "product": "Mouse", "amount": 50 },
  // { "_id": 5, "product": "Keyboard", "amount": 150 }]
db.sales.aggregate([
  {
    $group: {
      _id: null,
      totalSales: { $sum: "$amount" },
      avgSales: { $avg: "$amount" }
    }
  }
])
// [{
//     "_id": null,
//     "totalSales": 2300,        // 1200 + 800 + 100 + 50 + 150
//     "avgSales": 460            // (2300 / 5)
// }]
----------------------------------------------------
5,$addFields
// [{  _id: 1, student: "Maya",  homework: [ 10, 5, 10 ], quiz: [ 10, 8 ], extraCredit: 0 },
//    {  _id: 2, student: "Ryan", homework: [ 5, 6, 5 ],  quiz: [ 8, 8 ],  extraCredit: 8 }]
db.scores.aggregate([
   {
     $addFields: {
       totalHomework: { $sum: "$homework" } ,
       totalQuiz: { $sum: "$quiz" }
     }
   },
   {
     $addFields: { totalScore:
       { $add: [ "$totalHomework", "$totalQuiz", "$extraCredit" ] } }
   }
])
// [{ _id: 1,student: "Maya",  homework: [ 10, 5, 10 ], quiz: [ 10, 8 ], extraCredit: 0,
//   totalHomework: 25, totalQuiz: 18, totalScore: 43 },
//   {_id: 2, student: "Ryan", homework: [ 5, 6, 5 ],quiz: [ 8, 8 ],  extraCredit: 8,
//   totalHomework: 16, totalQuiz: 16,  totalScore: 40}]
-----------------------------------------------------
6, "$bucket" Age Group Categorization
// [{ "_id": 1, "name": "John", "age": 15 },
//   { "_id": 2, "name": "Mary", "age": 25 },
//   { "_id": 3, "name": "Alex", "age": 35 },
//   { "_id": 4, "name": "Kate", "age": 45 },
//   { "_id": 5, "name": "Emma", "age": 55 }]
db.users.aggregate([
  {
    $bucket: {
      groupBy: "$age",
      boundaries: [0, 20, 40, 60],
      default: "Other",
      output: {
        count: { $sum: 1 },
        users: { $push: "$name" }
      }
    }
  }
])
  
// [{ "_id": 0, "count": 1, "users": ["John"] },
//   { "_id": 20, "count": 2, "users": ["Mary", "Alex"] },
//   { "_id": 40, "count": 2, "users": ["Kate", "Emma"] }]
------------------------------------------------------
7,
  // [ { "name": "Phone", "category": "Electronics", "price": 800 },
  // { "name": "Laptop", "category": "Electronics", "price": 1200 },
  // { "name": "Shirt", "category": "Fashion", "price": 50 },
  // { "name": "Shoes", "category": "Fashion", "price": 100 },
  // { "name": "Book", "category": "Education", "price": 20 }]
db.products.aggregate([
  {
    $facet: {
      priceStats: [
        { $group: { _id: null, maxPrice: { $max: "$price" }, minPrice: { $min: "$price" }, avgPrice: { $avg: "$price" } } }
      ],
      categoryCounts: [
        { $group: { _id: "$category", count: { $sum: 1 } } }
      ],
      highPriceItems: [
        { $match: { price: { $gte: 100 } } },
        { $project: { name: 1, price: 1, _id: 0 } }
      ]
    }
  }
])

// {
//   "priceStats": [
//     { "maxPrice": 1200, "minPrice": 20, "avgPrice": 434 }
//   ],
//   "categoryCounts": [
//     { "_id": "Electronics", "count": 2 },
//     { "_id": "Fashion", "count": 2 },
//     { "_id": "Education", "count": 1 }
//   ],
//   "highPriceItems": [
//     { "name": "Phone", "price": 800 },
//     { "name": "Laptop", "price": 1200 },
//     { "name": "Shoes", "price": 100 }
//   ]
// }
------------------------------------------------------
8,$project: Shape Output Documents
// Include only the name and salary fields while renaming salary to income.
// dp la erukura name namma usecase ku ethamathiri rename pannikalam
  db.employees.aggregate([
  { $project: { _id: 0, name: 1, income: "$salary" } }
])
------------------------------------------------------















































































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





