'use strict';

const prompts = require("../backend/prompts").prompts;
const util = require('util');

const startConversation = function (sessionData, response, callback) {
	var name = "Manish";
	response.result.fulfillment.speech = util.format(prompts.startConversation, name);
    callback(sessionData,response)
}

module.exports = {
    startConversation: startConversation
};
