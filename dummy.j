import express from "express";
import axios from "axios";
import pMemoize from "p-memoize";
import { ProductsDatas } from "./helpers/static_data";
const app = express();

const SHOP = "local-cc-1.myshopify.com";

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const getProduct = async (productIds, index) => {
  try {
    const strProdIds: any = productIds as string[];
    const currentProd = ProductsDatas[strProdIds][parseInt(index, 10)];
    return currentProd;
  } catch (error) {
    throw error;
  }
};
const getProductImage = async (title, price, image) => {
  try {
    const { data } = await axios.get(
      `https://vercelog-image-generator.vercel.app/api/og?title=${title}&price=${price}&image_url=${image}`,
      { responseType: "arraybuffer" }
    );
    return data;
  } catch (error) {
    throw error;
  }
};

const memGetProductImage = pMemoize(getProductImage);
const memGetProduct = pMemoize(getProduct);

app.get("/reco/product-card/click/:index", async (req, res) => {
  try {
    const { index } = req.params;
    const { productIds } = req.query;
    if (!productIds) throw new Error("Invalid product id's");

    const currentProd = await memGetProduct(productIds, index);
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

    const currentProd = await memGetProduct(productIds, index);
    if (currentProd) {
      const imageBuffer = await memGetProductImage(
        currentProd.title,
        currentProd.price,
        currentProd.image
      );
      // const { data } = await axios.get(
      //   `https://vercelog-image-generator.vercel.app/api/og?title=${currentProd.title}&price=${currentProd.price}&image_url=${currentProd.image}`,
      //   { responseType: "arraybuffer" }
      // );
      // console.log(
      //   `https://vercelog-image-generator.vercel.app/api/og?title=${currentProd.title}&price=${currentProd.price}&image_url=${currentProd.image}`
      // );
      // const imageData = Buffer.from(data.data, "binary").toString("base64");
      res.send(imageBuffer);
    }
  } catch (error) {
    if (error instanceof Error) res.status(500).send(error.message);
    return;
  }
});

app.listen(4000, () => {
  console.log("App listening on port 4000!");
});
