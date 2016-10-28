'use strict';

const getHistory = require("../backend/getHistory");
const data = require("../backend/sampleData.json");
const prompts = require("../backend/prompts").prompts;
const util = require('util');
const moment = require('moment');
const retrievefundAccounts = require("../backend/handleTransaction").retrieveAccounts;
const handleTransaction = require("../backend/handleTransaction");
const utils = require("../backend/utils");
const constants =  require("../backend/constants");


const startTransaction = function (sessionData, response, callback) {
        var details, minDue, totalDue, parameters, respText, fundAccountNames, fundAccountOptionString, fundAccountNameMap, fundAccounts, fundAccountEntered, FundAcctNo, fundAccountMatched, name, creditAccounts;
        try{
            parameters = response.result.parameters;
            console.log(parameters);
            utils.checkForDebitAccount(sessionData, response.result.resolvedQuery);
            var options = utils.checkForCreditAccount(sessionData, response.result.resolvedQuery);
            if (options) creditAccounts = options;
            else creditAccounts = constants.creditAccounts;
            var debitAccounts = constants.debitAccounts;
            var creditAccountOptionString = "";
            var debitAccountOptionString = "";
            for(var i in debitAccounts) debitAccountOptionString = debitAccountOptionString+"\n"+"-"+debitAccounts[i];

            if(parameters.toAc.length == 0){
                creditAccountOptionString = utils.getCreditAccountOptions(parameters.incompleteCredit);
                respText = util.format(prompts.creditAccountOptions, creditAccountOptionString);
                response.result.fulfillment.speech = respText;
                callback(sessionData, response);                
            }
            else if(parameters.transferAmount.length == 0) {
                respText = prompts.amountOptions;
                response.result.fulfillment.speech = respText;
                callback(sessionData, response);                   
            }
            else if(parameters.fromAc.length == 0) {
                respText = util.format(prompts.debitAccountOptions, debitAccountOptionString);
                response.result.fulfillment.speech = respText;
                callback(sessionData, response);                   
            }
            else if(parameters.date.length == 0){
                respText = prompts.dateOptions;
                response.result.fulfillment.speech = respText;
                callback(sessionData, response);
            }
            else{
                var transferAmount = utils.extractTransferAmount(parameters, sessionData);
                var transferDate = utils.extractTransferDate(parameters, sessionData);

                sessionData.userData.transferAmount = transferAmount;
                sessionData.userData.transferDate = transferDate;
                
                var transactionDetails = {};
                var details = sessionData.userData.details
                var debitAc = parameters.fromAc;
                var creditAc = parameters.toAc;
                transactionDetails["transferAmount"] = sessionData.userData.transferAmount;
                transactionDetails["transferDate"] = sessionData.userData.transferDate;
                transactionDetails["debitAc"] = debitAc;
                transactionDetails["creditAc"] = creditAc;

                handleTransaction.provideTransactionRequest("", transactionDetails, function(err, res){
                    if(res && res.prvidTrsfInstrResp.busDataSeg.trsfInstr.tranId){
                        respText = util.format(prompts.confirmTransaction, transferAmount, debitAc, creditAc, transferDate);
                        sessionData.userData.TransactionID = res.prvidTrsfInstrResp.busDataSeg.trsfInstr.tranId;
                    }
                    else{
                        respText = "Something wrong with your payment. Please try again in sometime";
                    }
                    response.result.fulfillment.speech = respText;
                    callback(sessionData,response);
                });
                }
        }
        catch (err){        
            console.log(prompts.unableToFecthDetails + JSON.stringify(err), err);
            response.result.fulfillment.speech = prompts.unableToFecthDetails;
            callback(sessionData,response)
        }
    }

const confirmTransaction = function (sessionData, response, callback) {
        var details, parameters, respText, transactionDetails, name, fromAc, toAc;
        transactionDetails = {};        
        try{
            handleTransaction.makeTransaction(sessionData.id, sessionData.userData.TransactionID, function(err,res){
                name = "Manish";                
                console.log(res);
                if (res && res.cfmTrsfInstrResp.busDataSeg.cfmNum) respText = util.format(prompts.transactionSuccess, name, res.cfmTrsfInstrResp.busDataSeg.cfmNum);
                else respText = util.format(prompts.transactionError, name);
                response.result.fulfillment.speech = respText;
                callback(sessionData,response);
            });
            }
        catch (err){        
            console.log(prompts.unableToFecthDetails + JSON.stringify(err), err);
            response.result.fulfillment.speech = prompts.unableToFecthDetails;
            callback(sessionData,response)
        }
    }

const cancelTransaction = function (sessionData, response, callback) {
        response.result.fulfillment.speech = prompts.cancelTransaction;
        callback(sessionData,response)
}
module.exports = {
    startTransaction: startTransaction,
    confirmTransaction: confirmTransaction,
    cancelTransaction: cancelTransaction
};

