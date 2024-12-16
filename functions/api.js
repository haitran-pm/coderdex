const serverless = require("serverless-http");
const app = require("../app"); // Import the Express app

// Export the app wrapped for serverless
module.exports.handler = serverless(app);
