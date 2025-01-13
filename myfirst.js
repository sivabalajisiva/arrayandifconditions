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
7,$facet
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
9,$sortByCount
// The $sortByCount stage in MongoDB's aggregation framework is a convenient way to group documents
// by a specific field or expression, count the number of documents in each group, and sort the groups
// in descending order by their count. It combines the functionality of $group and $sort into a single stage.

// [{ "name": "Phone", "category": "Electronics" },
//   { "name": "Laptop", "category": "Electronics" },
//   { "name": "Shirt", "category": "Fashion" },
//   { "name": "Shoes", "category": "Fashion" },
//   { "name": "Book", "category": "Education" }]
db.products.aggregate([
  { $sortByCount: "$category" }
])
// [ { "_id": "Electronics", "count": 2 },
//   { "_id": "Fashion", "count": 2 },
//   { "_id": "Education", "count": 1 } ]
---------------------------------------------------------
10,$sample
// sample pipeline is used to randomly select collection data
// [ { "name": "Phone", "price": 800 },
//   { "name": "Laptop", "price": 1200 },
//   { "name": "Tablet", "price": 400 },
//   { "name": "Monitor", "price": 300 },
//   { "name": "Keyboard", "price": 100 }]
db.products.aggregate([
  { $sample: { size: 2 } }
])
  
// [{ "name": "Tablet", "price": 400 },
//   { "name": "Laptop", "price": 1200 }]
--------------------------------------------------------
11,$year
// [{ "_id": 1, "orderDate": ISODate("2023-12-01T10:00:00Z") },
//   { "_id": 2, "orderDate": ISODate("2024-01-15T12:30:00Z") },
//   { "_id": 3, "orderDate": ISODate("2023-07-20T08:15:00Z") }]
db.orders.aggregate([
  {
    $project: {
      _id: 1,
      orderYear: { $year: "$orderDate" }
    }
  }
])

// [{ "_id": 1, "orderYear": 2023 },
//   { "_id": 2, "orderYear": 2024 },
//   { "_id": 3, "orderYear": 2023 }]
---------------------------------------------------------
12,$expr and $eq
  in MongoDB The $expr operator allows you to use aggregation expressions within a $match stage.
  This enables field comparisons, calculations, and complex queries directly within the query language.

  The $eq operator checks if two values are equal. It returns true if they are equal, 
  and false otherwise. When combined with $expr, it becomes a powerful tool for comparing fields,
  expressions, or constants.
  
// [ { "_id": 1, "name": "Phone", "price": 500, "discountedPrice": 500 },
//   { "_id": 2, "name": "Laptop", "price": 1200, "discountedPrice": 1000 },
//   { "_id": 3, "name": "Tablet", "price": 300, "discountedPrice": 300 }]
db.products.find({
  $expr: { $eq: ["$price", "$discountedPrice"] }
})
  
  // [{ "_id": 1, "name": "Phone", "price": 500, "discountedPrice": 500 },
  // { "_id": 3, "name": "Tablet", "price": 300, "discountedPrice": 300 }]
---------------------------------------------------------








































































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





