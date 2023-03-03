import { config } from "dotenv";
import express from "express";
import axios from "axios";
import { ProductsDatas } from "./helpers/static_data";
const app = express();

const ENV = config().parsed;

import pMemoize from "p-memoize";

const SHOP = "local-cc-1.myshopify.com";

app.get("/", (req, res) => {
  res.send("Welcome to image generator");
});

const getProductImage = async (title, price, image_url) => {
  const { data } = await axios.get(
    `${ENV.IMAGE_GEN_URL}/api/og?title=${title}&price=${price}&image_url=${image_url}`,
    { responseType: "arraybuffer" }
  );
  return data;
};

const getProduct = async (productIds, index) => {
  // Todo convert to dynamic
  const strProdIds: any = productIds as string[];
  const currentProd = ProductsDatas[strProdIds][parseInt(index, 10)];
  return currentProd;
};
const memProductImage = pMemoize(getProductImage, {
  maxAge: 0,
});
const memProductData = pMemoize(getProduct, {
  maxAge: 0,
});

app.get("/reco/product-card/click/:index", async (req, res) => {
  try {
    const { index } = req.params;
    const { productIds } = req.query;
    if (!productIds) throw new Error("Invalid product id's");

    const currentProd = await memProductData(productIds, index);
    const productUrl = `https://${SHOP}/products/${currentProd.handle}`;
    res.redirect(productUrl);
  } catch (error) {
    if (error instanceof Error) res.status(500).send(error.message);
    return;
  }
});

app.get("/reco/product-card/render/:index", async (req, res) => {
  try {
    const { index } = req.params;
    const { productIds } = req.query;
    if (!productIds) throw new Error("Invalid product id's");

    const currentProd = await memProductData(productIds, index);
    const data = await memProductImage(
      currentProd.title,
      currentProd.price,
      currentProd.image
    );
    res.writeHead(200, {
      "Content-Type": "image/png", // Replace with the appropriate image file type
      "Content-Length": data.length,
    });
    res.end(Buffer.from(data));
  } catch (error) {
    if (error instanceof Error) res.status(500).send(error.message);
    return;
  }
});

app.listen(4000, () => {
  console.log("App listening on port 4000!");
});
