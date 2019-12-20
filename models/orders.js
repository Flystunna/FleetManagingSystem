const db = require("../config/db");
const dbName = "Users";
const collectionName = "Orders";

db.initialize(dbName, collectionName, function (dbCollection) { // successCallback
   // get all items
   dbCollection.find().toArray(function (err, result) {
      if (err) throw err;
      // console.log(result);

      // << return response to client >>
   });
});


module.exports = dbCollection;