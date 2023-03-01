import express from "express";
import axios from "axios";
import puppeteer from "puppeteer";
import { ProductsDatas } from "./helpers/static_data";
const app = express();

const SHOP = "local-cc-1.myshopify.com";

export const config = {
  runtime: "experimental-edge",
};

app.get("/", (req, res) => {
  res.send("Hello World!");
});

async function generateOpenGraphImage(
  imageUrl: String,
  title: String,
  price: String
): Promise<Buffer> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const html = `
    <html>
      <head>
        <meta property="og:title" content="My Page Title" />
        <meta property="og:image" content="https://example.com/my-image.png" />
      </head>
      <body>
        <img src="${imageUrl}" alt="product image"/>
        <p>${title}</p>
        <p>${price}</p>
      </body>
    </html>
  `;

  await page.setContent(html);
  const screenshot = await page.screenshot({
    type: "png",
    encoding: "binary",
    fullPage: true,
  });

  await browser.close();
  return screenshot;
}

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
      `http://localhost:3000/api/og?title=${currentProd.title}&price=${currentProd.price}&image_url=${currentProd.image}`,
      { responseType: "arraybuffer" }
    );
    // console.log(
    //   `http://localhost:3000/api/og?title=${currentProd.title}&price=${currentProd.price}&image_url=${currentProd.image}`
    // );
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
