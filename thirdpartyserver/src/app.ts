import * as amqp from 'amqplib/callback_api';
var express = require("express");
const axios = require("axios").default;


amqp.connect('amqps://nrpzxdld:1KtVfUr67DvgwBsyIuT6nNQv3TJnp6JX@jackal.rmq.cloudamqp.com/nrpzxdld', (error0, connection) => {
  if(error0){
    throw error0;
  }

  connection.createChannel((error1, channel) => {
    if(error1){
      throw error1;
    }

    var app = express();
    var port = 3001;

    var bodyParser = require('body-parser');
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    var mongoose = require("mongoose");
    mongoose.Promise = global.Promise;
    mongoose.connect("mongodb://localhost:27017/arbetsprov_third");

    var clientSchema = new mongoose.Schema({
        clientID: String,
        checked: Boolean
    });

    var Client = mongoose.model("Client", clientSchema);
    
    app.post("/third/client/:id", (req, res) => {
        var myData = new Client({clientID: req.params.id, checked: false});
        myData.save()
            .then(item => {
                channel.sendToQueue('client_created', Buffer.from(req.params.id))     
            })
            .then(item =>{
              res.send("Client saved to database");
            })
            .catch(err => {
                res.status(400).send("Unable to save to database");
            });
    });
    
    app.listen(port, () => {
        console.log("Server listening on port " + port);
    });
  })
  
})
