const express = require("express");
const request = require("request");
const app = express();

app.get("/", (req, res) => {
  res.send("testing...............");
});

const SHOP = "local-cc-1.myshopify.com";

app.get("/reco/product-card/click/:index", async (_req, res) => {
  const staticProducts = [
    8140201951517, 8140205654301, 8140210536733, 8140205031709,
  ];

  // TODO use the index to get the most buyed product
  const { index } = _req.params;
  // const { productIds } = _req.query;

  // TODO need to take the handle of dynamic product
  const handle = "converse-chuck-taylor-all-star-lo";

  // create product url;
  const productUrl = `https://${SHOP}/products/${handle}`;
  res.redirect(productUrl);
});

app.get("/reco/product-card/render/:index", async (_req, res) => {
  const imageUrl =
    "https://images.unsplash.com/photo-1575936123452-b67c3203c357?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8&w=1000&q=80";
  request.get(imageUrl, { encoding: null }, (error, response, body) => {
    console.log(response);
    if (error) {
      res.status(500).send(error.message);
      return;
    }
    res.set("Content-Type", "image/jpeg");
    res.send(body);
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started on port 3000");
});
