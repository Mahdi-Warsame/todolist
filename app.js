//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
 
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://mwarsame:Mahdi123@cluster0.a7ymbj1.mongodb.net/todoListDB");

const itemsSchema = new mongoose.Schema({
  name : String
});

const Item = new mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name:'Welcome to you to do list'
});

const item2 = new Item({
  name:'Hit the plus buttom to add list'
});

const item3 = new Item({
  name:'Hit add to add'
});

var defaultItems = [item1, item2, item3];

const listSchema = mongoose.Schema({
  name:String,
  list:[itemsSchema]
});

const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {

  Item.find({},function(err, foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems, function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Success Insertion");
      }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});

app.post("/", function(req, res){

  const item = req.body.newItem;
  const listName = req.body.list;
  const newItem = new Item({
    name:item
  });
  if(listName === "Today"){
    newItem.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName}, function(err, foundList){
      
        foundList.list.push(newItem);
        foundList.save();
        res.redirect("/" + listName);
      
    });
  }
});

app.post("/delete", function(req, res){
  const itemId = req.body.checkbox;
  const listName = req.body.list;

  if(listName === "Today"){
      Item.findByIdAndRemove(itemId, function(err){
    if(err){
      console.log(err);
    }else{
      console.log("Item removed sucessfully");
      res.redirect("/");
    }
  });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{list:{_id:itemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }
});


app.get("/:newListName", function(req, res){
  listName = _.capitalize(req.params.newListName);
  List.findOne({name:listName}, function(err, foundList){
    if(!err){
      if(!foundList){
        // Create a new List
        const list = new List({
          name:listName,
          list:defaultItems
        });
        list.save();
        res.redirect("/"+listName);
      }else{
        res.render("list", {listTitle:foundList.name, newListItems:foundList.list});
      }
    }else{
      console.log(err);
    }
  });

  });

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started successfully");
});