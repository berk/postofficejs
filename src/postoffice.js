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

var nodemailer = require("nodemailer"),
	liquid = require("liquid-node"),
	engine = new liquid.Engine(),
	fs = require("fs"),
	path = require('path'),
	async = require('async'),
	smtpTransport;

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

	configure: function (configurator) {
		configurator(config);
	},

	init: function () {
		smtpTransport = nodemailer.createTransport("SMTP", config.smtp);
	},

	send: function (options) {
		smtpTransport.sendMail(options, function (error, response) {
			if (error) {
				console.log(error);
			} else {
				console.log("Message sent: " + response.message);
			}
		});
	},

	sendTemplate: function (templateKey, tokens, options) {
		var tasks = {};

		console.log(config.templates.path + "/" + templateKey + ".html.liquid");

		tasks.html = function (callback) {
			fs.readFile(config.templates.path + "/" + templateKey + ".html.liquid", function (err, data) {
				if (err) throw err;

				engine.parseAndRender(data, tokens).then(function (output) {
					callback(null, output);
				});
			});
		};

		tasks.text = function (callback) {
			fs.readFile(config.templates.path + "/" + templateKey + ".text.liquid", function (err, data) {
				if (err) throw err;

				// process text template
				engine.parseAndRender(data, tokens).then(function (output) {
					callback(null, output);
				});
			});
		};

		async.parallel(tasks, function(err, results) {
			if (err) throw err;

			options.subject = templateKey;
			options.html = results.html;
			options.text = results.text;

			smtpTransport.sendMail(options, function (error, response) {
				if (error) {
					console.log(error);
				} else {
					console.log("Message sent: " + response.message);
				}
			});
		});
	},

	close: function () {
		smtpTransport.close(); // shut down the connection pool, no more messages
	}

};

