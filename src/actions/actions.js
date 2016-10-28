"use strict";

const getHistory = require("./getHistory");
const handleTransaction = require("./handleTransaction");
const greetings = require("./greetings");
const utils = require("../backend/utils");

const actions = {
  "transferSummary": getHistory.getHistory,
  "transfer": handleTransaction.startTransaction,
  "transferYes": handleTransaction.confirmTransaction,
  'transferNo': handleTransaction.cancelTransaction,
  'startConversation': greetings.startConversation
};

const getDetails = function(sessionData, response, callback){
    if (!sessionData.userData["details"]){
        var user = sessionData.id;
        sessionData.userData["details"] = {};
        callback(sessionData,response);
    }
    else{
        callback(sessionData,response);
    }
};
const matchActions = function (sessionData, response, callback) {
    //utils.updateEntites(response);
    getDetails(sessionData,response,function (sessionData, response) {
        let action = response.result.action;
        if(actions[action]){
            actions[action](sessionData,response,callback);
        }else{
            callback(sessionData,response);
        }
    });
};

module.exports = {
    matchActions: matchActions
};