import express from "express";
import axios from "axios";
import { ProductsDatas } from "./helpers/static_data";
const app = express();

const SHOP = "local-cc-1.myshopify.com";

export const config = {
  runtime: "experimental-edge",
};

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/reco/product-card/click/:index", async (req, res) => {
  try {
    const { index } = req.params;
    const { productIds } = req.query;
    if (!productIds) throw new Error("Invalid product id's");

    const strProdIds: any = productIds as string[];
    const currentProd = ProductsDatas[strProdIds][parseInt(index, 10)];

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

    const strProdIds: any = productIds as string[];

    const currentProd = ProductsDatas[strProdIds][parseInt(index, 10)];

    const data = await axios.get(
      `https://vercelog-image-generator.vercel.app/api/og?title=${currentProd.title}&price=${currentProd.price}&image_url=${currentProd.image}`,
      { responseType: "arraybuffer" }
    );
    console.log(
      `https://vercelog-image-generator.vercel.app/api/og?title=${currentProd.title}&price=${currentProd.price}&image_url=${currentProd.image}`
    );
    // const imageData = Buffer.from(data.data, "binary").toString("base64");

    // res.send(`data:image/png;base64,${imageData}`);
    res.send(data.data);
  } catch (error) {
    if (error instanceof Error) res.status(500).send(error.message);
    return;
  }
});

app.listen(4000, () => {
  console.log("App listening on port 4000!");
});
