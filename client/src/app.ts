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
    var port = 3000;

    var bodyParser = require('body-parser');
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    var mongoose = require("mongoose");
    channel.assertQueue('client_created', {durable: false})

    mongoose.Promise = global.Promise;
    mongoose.connect("mongodb://localhost:27017/arbetsprov");

    var clientSchema = new mongoose.Schema({
      clientID: String,
      checked: Boolean
    });
    var Client = mongoose.model("Client", clientSchema);

    channel.consume('client_created', (msg) => {
      var myData = new Client({clientID: msg?.content, checked: true});
        myData.save()
            .then(item => {
                console.log("Saved to client database");
                console.log(item);
            })
            .catch(err => {
                console.error("Unable to save to client database");
                console.error(err);
            });
      
    })

    app.post("/client/:id", async (req, res) => {
      
      axios
        .post(`http://localhost:3001/third/client/${req.params.id}`, {})  
        .then((thirdPartyResponse) => {
          
          res.status(200).send("Client registered");
        })
        .catch((err) => console.error(`Error sending to Third Party: ${err}`));
        
    });

    app.post("/webhook/:id", async (req, res) => {
      const client = await Client.exists({
        clientID: req.params.id
      }).then(result => {
        if (result) {
        res.status(200).send("ok")
        }else{
          res.status(400).send("Client not found");
        }
      }
      )
      
    });

    app.listen(port, () => {
      console.log("Server listening on port " + port);
    });
  })
})
