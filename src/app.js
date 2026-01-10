const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const { initializeFirebase } = require("./config/firebase");
initializeFirebase();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const routes = require("./routes");
app.use("/api", routes);

app.get("/", (req, res) => {
  res.send("Advertising App Backend is Running");
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
