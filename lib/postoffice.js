;;;;var nodemailer = require("nodemailer");
var liquid = require("liquid-node");
var engine = new liquid.Engine();
var fs = require("fs");
var path = require('path');

var smtpTransport;

var config = {
  smtp: {
    host: "mailtrap.io",
    port: 2525,
    auth: {
      user: "177934039fdb1379c",
      pass: "3e38be9ab971f5"
    }
  },
  templates: {
    path: path.dirname(require.main.filename) + "/../data/templates"
  }
};

module.exports = {

  configure: function(configurator) {
    configurator(config);
  },

  init: function() {
    smtpTransport = nodemailer.createTransport("SMTP", config.smtp);
  },

  send: function(options) {
    smtpTransport.sendMail(options, function(error, response){
      if (error) {
        console.log(error);
      } else {
        console.log("Message sent: " + response.message);
      }
    });
  },

  sendTemplate: function(templateKey, tokens, options) {
    var content = {};

    console.log(config.templates.path + "/" + templateKey + ".html.liquid");

        fs.readFile(config.templates.path + "/" + templateKey + ".html.liquid", function (err, data) {
      if (err) throw err;

            engine.parseAndRender(data, tokens).then(function(output) {
        content.html = output;

                fs.readFile(config.templates.path + "/" + templateKey + ".text.liquid", function (err, data) {
          if (err) throw err;

                    engine.parseAndRender(data, tokens).then(function(output) {
            content.text = output;

            options.subject = templateKey;
            options.html = content.html;
            options.text = content.text;

            smtpTransport.sendMail(options, function(error, response){
              if (error) {
                console.log(error);
              } else {
                console.log("Message sent: " + response.message);
              }
            });
          });
        });
      });
    });
  },

  close: function() {
    smtpTransport.close();   }

};

