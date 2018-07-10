/**
 * Copyright 2016 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Botkit = require('botkit');

var controller = Botkit.facebookbot({
  access_token: process.env.FB_ACCESS_TOKEN,
  verify_token: process.env.FB_VERIFY_TOKEN
});

var bot = controller.spawn();

  controller.middleware.normalize.use(function handleQuickReply (bot, message, next) {
console.log("************** no middleware!");
console.log(message);
    if (message.attachments && message.attachments.length > 0) {
	if (message.attachments[0].type == 'location') {
	 console.log("***************** LOCATION!!!");
	console.log(message.attachments[0].payload);
      	message.text = message.attachments[0].payload.coordinates.lat+', '+message.attachments[0].payload.coordinates.long;
controller.trigger('message_received', [bot, message]);
//      	message.payload = message.attachments[0].payload;
//      	message.type = 'facebook_location';
	}
    }
    next();
  });

controller.hears('(.*)', 'message_received', function(bot, message) {
console.log(message);
  if (message.watsonError) {
    console.log(message.watsonError);
    bot.reply(message, message.watsonError.description || message.watsonError.error);
 /* } else if (message.watsonData && 'precisalocal' in message.watsonData.context) {
console.log('precisa localizacao');
bot.reply({
	text: message.watsonData.output.text,
	content_type: "location"
});*/
  } else if (message.watsonData && 'output' in message.watsonData) {
if ('precisalocal' in message.watsonData.context && message.watsonData.context.precisalocal === true) { 
	bot.startConversation(message, function(err, convo) {
		convo.ask({
			text:message.watsonData.output.text,
			quick_replies: [{content_type: 'location'}]
		}, function(response, convo){ convo.successful(); });
	});
} else {
console.log("********************* no bot");
console.log(message);
    bot.reply(message, message.watsonData.output.text.join('\n'));
}
  } else {
    console.log('Error: received message in unknown format. (Is your connection with Watson Conversation up and running?)');
    bot.reply(message, "I'm sorry, but for technical reasons I can't respond to your message");
  }
});

module.exports.controller = controller;
module.exports.bot = bot;
