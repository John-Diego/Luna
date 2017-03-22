var express = require("express");
var bodyParser = require("body-parser");
var request = require("request");


app = express(); // responsavel por tratar as requisicoes http
app.listen(3000); // metodo listen determina as portas que comunicam com o servidor 
app.use(bodyParser.urlencoded({ extended: false })); // Facilita a vida pra que o servidor entenda formatos como JSON, XML sem ter que fazer parse de string
app.use(bodyParser.json()); // Faz com que o app entenda JSON


/* ------------------------------------  POST  --------------------------------- */

isajgfiasfijadsifjdsaijfidsafsajdfidsa

app.post('/', function (req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});

/* ------------------------------------  FIM POST  --------------------------------- */

/* ------------------------------------  RECEIVED MESSAGE  --------------------------------- */
function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback 
  // button for Structured Messages. 
  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " + 
    "at %d", senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to 
  // let them know it was successful
  sendTextMessage(senderID, "Postback called");
}
/* ------------------------------------  FIM RECEIVED MESSAGE  --------------------------------- */

/* ------------------------------------  SEND MESSAGE  --------------------------------- */
function sendTextMessage(recipientId, messageText, callback) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: messageText
        }
    };

    callSendAPI(messageData, function () { callback(); });
}

function sendImage(recipientId, imageURL, callback) {
    var messageData = {
        "recipient": {
            "id": recipientId
        },
        "message": {
            "attachment": {
                "type": "image",
                "payload": {
                    "url": imageURL
                }
            }
        }
    };

    callSendAPI(messageData, function () { callback() });
}

/* ------------------------------------  FIM SEND MESSAGE  --------------------------------- */


/* --------------------------------- CALL SEND API ---------------------------------- */
function callSendAPI(messageData, callback) {
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: 'EAAEoBfcIby8BAAWBEA18zJ305NlshBwyRqePpOAvyaeuLekYRoHpm5AbbQ2Yv9LWVdKZAYZBgWeGiBze0xFIyewzCEFsigZAYUJSCQ4I0BeOTZByDmy2dNfAEhaL5ZBUagZB7ozwskVWZAugd2MVbrWMslZA1tjPCTERcKXDZBaP8gAZDZD' },
        method: 'POST',
        json: messageData

    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var recipientId = body.recipient_id;
            var messageId = body.message_id;
            callback();
            console.log("Successfully sent generic message with id %s to recipient %s",
                messageId, recipientId);
        } else {
            console.error("Unable to send message.");
            console.error(response);
            console.error(error);
        }
    });
}

/* --------------------------------- FIM CALL SEND API ---------------------------------- */


/* -----------------------------------------  GET  -------------------------------------- */
app.get('/', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === 'abcdefg') {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }  
});

/* ------------------------------------ FIM GET --------------------------------- */