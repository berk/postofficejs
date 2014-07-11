/**
 * Copyright (c) 2014 Michael Berkovich, Vladimir Islamov, Ian McDaniel
 *
 *   ____           _    ___   __  __ _
 *  |  _ \ ___  ___| |_ / _ \ / _|/ _(_) ___ ___
 *  | |_) / _ \/ __| __| | | | |_| |_| |/ __/ _ \
 *  |  __/ (_) \__ \ |_| |_| |  _|  _| | (_|  __/
 *  |_|   \___/|___/\__|\___/|_| |_| |_|\___\___|
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var nodemailer = require("nodemailer");
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

    // read the html template and store it
    fs.readFile(config.templates.path + "/" + templateKey + ".html.liquid", function (err, data) {
      if (err) throw err;

      // process html template
      engine.parseAndRender(data, tokens).then(function(output) {
        content.html = output;

        // read the text template and store it
        fs.readFile(config.templates.path + "/" + templateKey + ".text.liquid", function (err, data) {
          if (err) throw err;

          // process text template
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
    smtpTransport.close(); // shut down the connection pool, no more messages
  }

};

