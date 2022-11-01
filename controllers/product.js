const Product=require("../models/product")
const formidable=require("formidable")
const _ = require("lodash")
const fs = require("fs")


// middleware
exports.getProductById=(req,res,next,id)=>{
    Product.findById(id)
    .populate('category')
    .exec((err,product)=>{
        if(err){
            return res.status(400).json({
                error:"product not found"
            })
        }
        req.product=product
        next()
    })
}


exports.createProduct=(req,res)=>{
    let form=new formidable.IncomingForm();
    form.keepExtension=true

    form.parse(req,(err,fields,file)=>{
        if(err){
            return res.status(400).json({
                error:"problem with image"
            })
        }
        //destructure the field
        const {name,description,price,category,stock}=fields

        if(
            !name ||
            !description ||
            !price ||
            !category ||
            !stock
        ){
            return res.status(400).json({
                error:"Please include all fields"
            })
        }

        //todo:restrictions on fields
        let product=new Product(fields)

        //handle file here
        if(file.photo){
            if(file.photo.size>3000000){
                res.status(400).json({
                    error:"file size too big"
                })
            }
            product.photo.data=fs.readFileSync(file.photo.path)
            product.photo.contentType=file.photo.type
        } 

        //save to db
        product.save((err,product)=>{
            if(err){
                res.status(400).json({
                    error:"saving t shirt in db failed"
                })
            }
            res.json(product)
        })
    })
}


exports.getProduct=(req,res)=>{
    req.product.photo=undefined //u can avoid the below middleware and remove photo = undefined, thid is to make more faster
    return res.json(req,product)
}

//middleware
exports.photo=(req,res,next)=>{
    if(req.product.photo.data){
        res.set("Content-Type",req.product.photo.contentType)
        return res.send(req.product.photo.data)
    }
}

//delete
exports.deleteProduct=(req,res)=>{
    let product=req.product
    product.remove((err,deletedProduct)=>{
        if(err){
            return res.status(400).json({
                error:"Failed to delete the product"
            })
        }
        res.json({
            message:"deletion was sucessful",
            deletedProduct
        })
    })
}




//update
exports.updataProduct=(req,res)=>{
    let form=new formidable.IncomingForm();
    form.keepExtension=true

    form.parse(req,(err,fields,file)=>{
        if(err){
            return res.status(400).json({
                error:"problem with image"
            })
        }
      
        //updation code
        let product=req.product
        product=_.extend(product,fields)

        //handle file here
        if(file.photo){
            if(file.photo.size>3000000){
                res.status(400).json({
                    error:"file size too big"
                })
            }
            product.photo.data=fs.readFileSync(file.photo.path)
            product.photo.contentType=file.photo.type
        } 

        //save to db
        product.save((err,product)=>{
            if(err){
                res.status(400).json({
                    error:"updation of product failed"
                })
            }
            res.json(product)
        })
    })
}

//listing
exports.getAllProducts=(req,res)=>{
    let limit=req.query.limit ? parseInt(req.query.limit):8
    let sortBy=req.query.sortBy ? req.query.sortBy : "_id"

    
    Product.find()
    .select("-photo")
    .populate("category")
    .sort([[soryBy,"asc"]])
    .limit(limit)
    .exec((err,products)=>{
        if(err){
            return res.status(400).json({
                error:"no product found"
            })
        }
        res.json({products})
    })
}

exports.getAllUniqueCategory=(req,res)=>{
    Product.distinct("category",{},(err,category)=>{
        if(err){
            return res.status(400).json({
                error:"no category found"
            })
        }
        res.json(category)
    })
}

//middleware to update stock
exports.updateStock=(req,res,next)=>{
    let myOperations=req.body.order.products.map(product=>{
        return{
            insertOne:{
                filter:{_id:product._id},
                update:{$inc:{stock:-product.count,sold:+product.coutn}}
            }
        }
    })

    Product.bulkWrite(myOperations,{},(err,products)=>{
        if (err){
            return res.status(400).json({
                error:"bulk operation failed"
            })
        }
        next()
    })
}