var express = require('express');
var router = express.Router();
let productSchema = require('../schemas/product');
let categorySchema = require('../schemas/category');
const { verifyToken, isAdmin, isMod } = require('../middlewares/auth');

function BuildQuery(query){
  let result = {};
  if(query.name){
    result.name = new RegExp(query.name,'i');
  }
  result.price = {};
  if(query.price){
    result.price.$gte = Number(query.price.$gte || 0);
    result.price.$lte = Number(query.price.$lte || 10000);
  } else {
    result.price.$gte = 0;
    result.price.$lte = 10000;
  }
  return result;
}

// GET - public
router.get('/', async function(req, res, next) {
  let products = await productSchema.find(BuildQuery(req.query)).populate({
    path:'category', select:'name'
  });
  res.status(200).send({ success:true, data:products });
});

router.get('/:id', async function(req, res, next) {
  try {
    let product = await productSchema.findById(req.params.id);
    res.status(200).send({ success:true, data:product });
  } catch (error) {
    res.status(404).send({ success:false, message:error.message });
  }
});

// CREATE - mod
router.post('/', verifyToken, isMod, async function(req, res, next) {
  try {
    let body = req.body;
    let getCategory = await categorySchema.findOne({ name: body.category });
    if(getCategory){  
      let newProduct = new productSchema({
        name: body.name,
        price: body.price || 0,
        quantity: body.quantity || 0,
        category: getCategory._id,
      });
      await newProduct.save();
      res.status(200).send({ success: true, data: newProduct });
    } else {
      res.status(404).send({ success: false, message: "category sai" });
    }
  } catch (error) {
    res.status(404).send({ success: false, message: error.message });
  }
});

// UPDATE - mod
router.put('/:id', verifyToken, isMod, async function(req, res, next) {
  try {
    let id = req.params.id;
    let product = await productSchema.findById(id);
    if(product){
      let body = req.body;
      if(body.name) product.name = body.name;
      if(body.price) product.price = body.price;
      if(body.quantity) product.quantity = body.quantity;
      if(body.category) product.category = body.category;
      await product.save();
      res.status(200).send({ success: true, data: product });
    } else {
      res.status(404).send({ success: false, message: "ID không tồn tại" });
    }
  } catch (error) {
    res.status(404).send({ success: false, message: error.message });
  }
});

// DELETE - admin
router.delete('/:id', verifyToken, isAdmin, async function(req, res, next) {
  try {
    let id = req.params.id;
    let product = await productSchema.findById(id);
    if(product){
      product.isDeleted = true;
      await product.save();
      res.status(200).send({ success: true, data: product });
    } else {
      res.status(404).send({ success: false, message: "ID không tồn tại" });
    }
  } catch (error) {
    res.status(404).send({ success: false, message: error.message });
  }
});

module.exports = router;
