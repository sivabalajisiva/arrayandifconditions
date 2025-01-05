var fs = require('fs');
var User = require("../model/user")
let Secure = require("../helpers/secure")
const Authenticate = require("../helpers/token")
const CategoryShema = require("../model/category")
const SelectiveCategory = require("../model/SelectiveCuser");
const crud = require("../model/crut")
const { default: mongoose } = require('mongoose');
const { error } = require('console');
const Orters = require("../model/order");
const order = require('../model/order');
const user = require('../model/user');
const lotteries = require("../model/lottery")
const randomstring = require("randomstring")
const reffer=require('../model/referal')


// register
exports.Registeruser = async (req, res, error) => {
  try {
    const { Name, Email, Password, refferance } = req.body
    function generateOTP() {
      return randomstring.generate({
        length: 6,
        charset: 'numeric'
      })
    }
    let generateUnicid = generateOTP()

    const SecureEmail = await Secure.EncryptFunction(Email)

    const SecurePassword = await Secure.BcriptFunction(Password)

    const alreadyemail = await User.findOne({ Email: SecureEmail })
    if (alreadyemail) {
      return res.send({ status: false, message: "already register this email" })
    }

   

   if (refferance) {
      const findreffer = await User.findOne({ userId: refferance });
      if (!findreffer) {
      return res.send({ status: false, message:"not match this refferal id"})
      }
      const abc = await User.create({Name: Name, Email: SecureEmail, Password: SecurePassword,
        userId: generateUnicid, parent:findreffer.userId })
     
      const findparent=await reffer.findOne({refferalid:findreffer._id})
      if(!findparent){
        let obj={
          childid:abc._id,
          childname:abc.Name
        }
        const createrefferal=await reffer.create({refferalid:findreffer?._id,refferancename:findreffer?.Name,downlines:obj})
        
        return res.send({ status: true, message: 'successfully register user using refferal id', data: createrefferal })    
      }else{
        let obj={
          childid:abc._id,
          childname:abc.Name
        }
        const createrefferal=await reffer.updateOne({refferalid:findreffer._id},{$push:{downlines:obj}})
        const levelmeet=await reffer.findOne({refferalid:findreffer._id})
        console.log("🚀 ~ exports.Registeruser= ~ levelmeet:", levelmeet.downlines.length)
        if(levelmeet.downlines.length<=3){
        const levelupdate=await reffer.updateOne({refferalid:findreffer._id},{$push:{level:1}})
        console.log("🚀 ~ exports.Registeruser= ~ levelmeet:", levelupdate)
        }
               
      return res.send({ status: true, message: 'successfully register user using refferal id', data: createrefferal })    
      }
  }else {
      const abcd = await User.create({Name: Name, Email: SecureEmail, Password: SecurePassword,userId: generateUnicid})
      return res.send({ status: true, message: 'successfully register user not using refferal id', data: abcd })
  }

  
  
  } catch (e) {
    res.send(e.message)
  }
}
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

// login
exports.LoginUser = async (req, res) => {
  try {
    const { Email, Password } = req.body

    const UsingEncryptEmail = await Secure.EncryptFunction(Email)

    const FindUser = await User.findOne({ Email: UsingEncryptEmail })
    if (!FindUser) {
      return res.send("you not register email first assain")
    }

    const ComparePassword = await Secure.BcriptCompareFunction(Password, FindUser.Password)
    if (!ComparePassword) {
      return res.send("password is not match")
    }

    if (FindUser && ComparePassword) {
      let Obj = { id: FindUser._id }
      const Token = await Authenticate.tokengenrate(Obj)
      res.send({ status: true, name: FindUser.Name, data: Token })
    }
  } catch (e) {
    res.send(e.message)
  }
}
// using params
exports.params = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await CategoryShema.deleteOne({ _id: userId });
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.send({ status: true, data: user })
  } catch (error) {
    console.error(error);
  }
};

//update
exports.UpdateUser = async (req, res) => {
  try {
    const Updateuser = await User.updateOne({ _id: Onlineid }, { $set: { Name: req.body.Name } })
    console.log(Updateuser);
    if (Updateuser) {
      res.send({ status: true, message: 'success', data: Updateuser })
    }
  } catch (e) {
    res.send(e.message)
  }
}
//updatefind
exports.FindUpdateUser = async (req, res) => {
  try {
    const FUpdateuser = await User.find({Name:{$ne:"anpu"}})
    //  const FUpdateuser = await User.find({Name:Name })
    console.log(FUpdateuser, 'user')
    if (FUpdateuser) {
      res.send({ status: true, message: 'success', data: FUpdateuser })
    }
  } catch (e) {
    res.send(e.message)
  }
}
// findandupdatemethod this is used for decrese youe api
exports.findAndupdatemethod = async (req, res) => {
  try {
    const Updateuser = await User.findOneAndUpdate({ _id: Onlineid }, { $set: { Name: req.body.Name } })
    console.log(Updateuser);
    if (Updateuser) {
      res.send({ status: true, message: 'success', data: Updateuser })
    }
  } catch (error) {
    res.send(error)
  }
}
// exports.getupdate = async (req,res)=>{
//   try {
//     console.log(req.UserId,'vicky')
//       const userId = req.UserId
//       console.log(userId.id,'usserff')
//       const dataget = await User.findOne({_id:userId.id})
//       console.log(dataget,'dataget')
//       if(dataget){
//           res.json({status:true,data:dataget,message:'success'})
//       }else{
//       res.json({status:false,message:'Id invalid'})
//       }
//   } catch (error) {
//       res.json({status:false,message:'something wrong',error:error})
//   }
// }
// SelectCategory
exports.SelectCategory = async (req, res) => {
  try {
    const UserSide = await CategoryShema.find({})
    if (UserSide) {
      res.send({ status: true, message: 'success', data: UserSide })
    }
  } catch (e) {
    res.send(e.message)
  }
}
//category
exports.CategoryList = async (req, res) => {
  try {
    const { Categoryis, Discription, AnyQuarys, image } = req.body

    const Category = await CategoryShema.findOne({ Categoryis: Categoryis })
    const imageurl = req.protocal + "://" + req.get("host") + "/uploads/" + req.file.filename

    // console.log(imgurl);
    if (Category) {
      const SelectiveCategoryUser = await SelectiveCategory.create(
        {
          Discription: Discription,
          AnyQuarys: AnyQuarys,
          Categoryidis: Category._id,
          Userid: Onlineid,
          image: imageurl
        })
      res.send({ status: true, message: 'success', data: SelectiveCategoryUser })
    }
  } catch (e) {
    res.send(e.message)
  }
}
// aggrigate
exports.UsingAggricate = async (req, res) => {
  CategoryShema.aggregate([
    {
      $lookup: {
        from: "selectivecatogiryusers",
        localField: "_id",
        foreignField: "Categoryidis",
        as: "data"
      }
    },
    {
      $unwind: "$data"
    }, {
      $match: {
        "data.Userid": new mongoose.Types.ObjectId(Onlineid)
      }
    }
  ]).then((datas) => {
    res.send({ status: true, data: datas })
  })
}
// aggrigateUptade
exports.aggrigateUpdateUser = async (req, res) => {
  try {
    const { Categoryis, Discription, AnyQuarys } = req.body
    const Updateuser = await CategoryShema.findOne({ Categoryis: Categoryis })
    let userCategory = Updateuser._id
    const imgurl = req.protocal + "://" + req.get("host") + "/uploads/" + req.file.filename

    const Update = await SelectiveCategory.updateOne({ Userid: Onlineid, Categoryidis: userCategory },
      { $set: { Discription: Discription, AnyQuarys: AnyQuarys, image: imgurl } })

    if (Update) {
      res.send({ status: true, message: 'success', data: Update })
    } else {
      res.send({ message: "user title not match" })
    }
  } catch (e) {
    res.send(e.message)
  }
}
// delete Category
exports.DeleteCategory = async (req, res) => {
  try {
    const Delet = await SelectiveCategory.deleteOne({ Userid: Onlineid })
    if (Delet) {
      res.send({ status: true, message: 'success', data: Delet })
    }
  } catch (e) {
    res.send(e.message)
  }
}
// orders
exports.userOrders = async (req, res) => {
  try {
    const { Name, Price, Userid, Quantity } = req.body
    let total = Number((Price * Quantity).toFixed(2))


    const createOrders = await order.create({ Name: Name, Total: total })
    if (createOrders) {
      res.send({ status: true, message: 'success', data: createOrders })
    }
  } catch (e) {
    res.send(e.message)
  }
}


// crud
// create
exports.create = async (req, res) => {
  try {
    const { name, price, status } = req.body
    const createdata = await crud.create({ name: name, price: price, userid: Onlineid, status: status })
    if (!createdata) {
      res.send({ status: false, message: "user not create a content" })
    }
    res.send({ status: true, data: createdata, message: "create sucessfully" })
  } catch (error) {
    res.send(error)
  }
}
exports.read = async (req, res) => {
  try {
    const readdata = await crud.find({ userid: Onlineid })
    if (!readdata) {
      res.send({ status: false, message: "user not have a content" })
    }
    res.send({ status: true, data: readdata, message: " sucessfully view content" })
  } catch (error) {
    res.send(error)
  }
}
exports.update = async (req, res) => {
  try {
    const params = req.params.id
    const updatedata = await crud.updateMany({ userid: Onlineid, _id: params },
      { $set: { name: req.body.name, price: req.body.price, status: req.body.status } })
    if (!updatedata) {
      res.send({ status: false, message: "user not have a content" })
    }
    res.send({ status: true, data: updatedata, message: " sucessfully view content" })
  } catch (error) {
    res.send(error)
  }
}
exports.delete = async (req, res) => {
  try {
    const params = req.params.id
    const deletedata = await crud.deleteOne({ userid: Onlineid, _id: params })
    if (!deletedata) {
      res.send({ status: false, message: "user not have a content" })
    }
    res.send({ status: true, data: deletedata, message: " sucessfully view content" })
  } catch (error) {
    res.send(error)
  }
}




