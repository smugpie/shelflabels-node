import { connect } from "./utils/connection.js";

(async function () {
  console.log("Initialising...");
  await connect();
})();
