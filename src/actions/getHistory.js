'use strict';

const prompts = require("../backend/prompts").prompts;

const getHistory = function (sessionData, response, callback) {
        var minDue, totalDue, dueDate, respText;
        try{
            respText = "Your latest transactions are"+"\n"+"1. Transfer of $100 from account Citi A/c(India) to Bofa A/c(USA)"+"\n"+"2. Transfer of $99 from account Bofa A/c(USA) to Bofa A/c(Bangladesh)";
            response.result.fulfillment.speech = respText;
            callback(sessionData,response);
        }
        catch (err){
            console.log(prompts.unableToFecthDetails + JSON.stringify(err));
            response.result.fulfillment.speech = prompts.unableToFecthDetails;
            callback(sessionData,response)
        }
    }

module.exports = {
    getHistory: getHistory
};

