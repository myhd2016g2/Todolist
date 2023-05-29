

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

mongoose.connect("mongodb+srv://admin-amjad:test123@atlascluster.jnfw03x.mongodb.net/todolistDB", { useNewUrlParser: true });

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
  name: "Welcome to your todolist!"
})

const item2 = new Item({
  name: "Hit the + to add an item"
})

const item3 = new Item({
  name: "<-- Hit this to delete an item"
})

const defaults = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
})

const List = mongoose.model("List", listSchema)
// Item.insertMany(defaults)
// .catch(function(err){
//   console.log(err);
// })
// .then(function(){
//   console.log("saved to database");
// })



app.get("/", function (req, res) {

  // const day = date.getDate();
  Item.find({}).then(function (foundItems) {

    if (foundItems.length === 0) {
      console.log(foundItems)
      Item.insertMany(defaults)
        .catch(function (err) {
          console.log(err);
        })
        .then(function () {
          console.log("saved to database");
        });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }

  })


});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  

  // List.exists({ name: customListName }).then(function (result) {
  //   console.log(result);
  // });

  List.findOne({ name: customListName }).then(function (foundList, err) {
    // console.log(result, !result);
    // console.log(!result);
    //   
    if (!foundList) {
      const list = new List({
        name: customListName,
        items: defaults
      })

      list.save()

      res.redirect("/" + customListName);


    } else {
      
      res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
    }

  });

  // List.exists({ name: customListName }).then(function (result) {
  //   if (result === null) {

  //      const list = new List({
  //       name: customListName,
  //       items: defaults
  //     })

  //     list.save()
  //     console.log("List created!");

  //   } else {

  //     console.log("List exists!");


  //   }
  // })



})




app.post("/", function (req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
      name: itemName,
    })

    if (listName === "Today") {
     
      item.save();
      res.redirect("/");
    } else {
      List.findOne({name: listName}).then(function(foundList,err) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      })
    }


   
});



app.post("/delete", function (req, res) {
  
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
 
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId)
    .catch(function (err) {
      console.log(err);
    })
    .then(function () {
      res.redirect("/");
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
    .then(function(foundList, err){
      
      res.redirect("/" + listName);
    })
    
  }

  

})




// app.get("/work", function (req, res) {
//   res.render("list", { listTitle: "Work List", newListItems: workItems });
// });

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
