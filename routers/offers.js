const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");
const Offer = require("../models/Offer");

const cloudinary = require("cloudinary").v2;


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const convertToBase64 = (file) =>
  `data:${file.mimetype};base64,${file.data.toString("Base64")}`;

const isAuthenticated = require("../middleware/isAuthenticated");
router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      const newOffer = new Offer({
        product_name: req.body.title,
        product_description: req.body.description,
        product_price: req.body.price,
        product_details: [
          { MARQUE: req.body.brand },
          { TAILLE: req.body.size },
          { ÉTAT: req.body.condition },
          { COULEUR: req.body.color },
          { EMPLACEMENT: req.body.city },
        ],
        owner: req.user,
      });
      const result = await cloudinary.uploader.upload(
        convertToBase64(req.files.picture),
        {
          folder: "vinted/offers",
          public_id: `${req.body.title} - ${newOffer._id}`,
        }
      );
      newOffer.product_image = result;
      await newOffer.save();
      res.json(newOffer);
    } catch (error) {
      console.log({ error: error.message });
    }
  }
);

router.get("/offers", async (req, res) => {
  try {
    let filterObjects = {};
    if (req.query.title) {
      filterObjects.title = new RegExp(req.query.title, "i");
    }
    if (req.query.priceMin) {
      filterObjects.product_price = { $gte: req.query.priceMin };
    }
    if (req.query.priceMax) {
      if (filterObjects.product_price) {
        filterObjects.product_price.$lte = req.querypriceMax;
      }
    }
    if (req.query.priceMin) {
      filterObjects = await Offer.find({
        product_price: { $gte: req.query.priceMin },
      });
    } else {
      filterObjects = { $lte: req.query.priceMax };
    }
    let sortObjects = {};
    if (req.query.sort === "price-asc" || req.query.sort === "price-desc") {
      sortObjects.product_price = req.query.sort.replace("price-", "");
    }

    if (req.query.limit) {
      const limit = req.query.limit;
    } else {
      const limit = 3;
    }
    if (req.query.page) {
      const page = req.query.page;
    } else {
      const page = 1;
    }

    const offers = await Offer.find(filterObjects)
      .sort(sortObjects)
      .limit(limit)
      .skip((page - 1) * limit);
    const count = await Offer.countDocuments(filterObjects);
    res.json({ count: count, offers: offers });
  } catch (error) {
    console.log({ error: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  console.log(req.params);
  try {
    const offer = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: "account.username email",
    });
    res.json(offer);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

module.exports = router;
