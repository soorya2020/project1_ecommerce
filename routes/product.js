const express = require("express");
const router = express.Router();

const {
  getProductById,
  createProduct,
  getProduct,
  photo, 
  deleteProduct,
  updataProduct,
  getAllProducts,
  getAllUniqueCategory
} = require("../controllers/product");
const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth");
const { getUserById } = require("../controllers/user");

//params
router.param("userId", getUserById);
router.param("productId", getProductById);

//routes
router.post(
  "/product/create/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  createProduct
);

router.get("/product/:productId", getProduct);

router.get("/product/photo/:productId", photo);

//delete
router.put(
  "/products/:productId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  deleteProduct
);

//update
router.put(
  "/products/:productId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  updataProduct
);

//listing
router.get("/products",getAllProducts)

router.get("/products/categories",getAllUniqueCategory)

module.exports = router;
