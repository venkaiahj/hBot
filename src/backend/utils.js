'use strict';
const Promise = require("bluebird");
// const request = Promise.promisifyAll(require("request"));
// Promise.promisifyAll(request);
const request = require("request");
const crypto = require("crypto");
const xml2js = require("xml2js");
const xmlParser = xml2js.parseString;
const xmlBuilder = new xml2js.Builder();
const config = require("./config.json");
const fs = require("fs");
const key = config.key;
const orbipayUrl = config.orbipayUrl;

const prompts = require("./prompts").prompts;
const util = require('util');
const moment = require('moment');
const constants = require("./constants");
const apiToken = require("../../app.json").env.APIAI_ACCESS_TOKEN.value;
var previousCurrency, previousBalanceType, latestPayAmount, previousDate, previousPeriod, latesttransferDate;

//Generates signature for orbipay
const generate_signature = function (message, signatureKey) {
    var fulltext = message+"&";
    fulltext = fulltext + signatureKey;
    var sigHash = crypto.createHash('sha1').update(fulltext,'utf-8').digest('base64');
    var signature = sigHash.replace(/\+/g,".").replace(/=/g,"-").replace(/\//g,"_");
    return signature;
};

const orbipay_request = function (message,key,callback){
    var xmlMessage = build_xml(message);
    var sign = generate_signature(xmlMessage,key);
    request({
        url: orbipayUrl,
        method: 'POST',
        form: {
            message: xmlMessage,
            signature: sign
        },
        headers:{
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    },function (err,res,body) {
        parse_orbipay_response(body,callback)
        
    })
};

const hsbc_request =  function (message, callback){
    var xmlMessage = build_xml(message);
    var url = "http://192.168.32.13:6789/resteasymq/rest/";    
    request({
        url: url,
        method: 'POST',
        body: xmlMessage,
        headers:{
            'Content-Type': 'application/xml'
        }
    }, function (err,res,body) {
        console.log("----------------res------------------", res.body);
        parse_hsbc_response(body,callback);
    })
}    

const parse_hsbc_response = function (responseString,callback) {
    return parse_xml(responseString,callback);

};
const build_xml = function (obj) {
    var xml = xmlBuilder.buildObject(obj);
    console.log(xml)
    return xml;
};

const parse_xml = function (xmlString,callback) {
    xmlParser(xmlString, {trim: true, ignoreAttrs: true, explicitArray: false}, function(err,result){
        console.log("error",err, "result",result);
        return callback(err,result)
    })
};

function checkEntity(entities, entity_type) {

    for (var i in entities)  {
        var entity = entities[i];
        if (entity['type']==entity_type){ 
            return true;
        }
    }
    return false;
}

function updateCurrentIntent(session, currentIntent){
    session.userData.previousIntent = session.userData.currentIntent;
    session.userData.currentIntent = currentIntent;
}

function clearPayDetails(session){
    delete session.userData.transferAmount;
    delete session.userData.fundAccount;
    delete session.userData.transferDate;
}

function saveFundAccounts(sessionData, orbipayResponse){
    var accName, respText, fundAccountNames, fundAccountNameMap, fundAccounts;
    fundAccountNameMap = {};
    fundAccounts = orbipayResponse.fundingAcctList.fundingAcct;
    if ("extIssuedAcctId" in fundAccounts) fundAccounts = [fundAccounts];
    if (fundAccounts) fundAccountNames = []; 
    for(var i=0; i < fundAccounts.length; i++){
        //todo: check from orbipay side whether user can have more than one account with same bank name
        if("nickName" in fundAccounts[i]){
            accName = fundAccounts[i]["nickName"].replace(/\+/g," ");
        }
        else continue;
        //todo: how do you give options if we have same account names, we can display names(in this case we have to take care of identifying nick name by luis)
        if (fundAccountNames && fundAccountNames.indexOf(accName)>=0) continue;
        fundAccountNames.push(accName);
        fundAccountNameMap[accName] ={};
        //we can use this name to diaply options
        fundAccountNameMap[accName]["name"] = fundAccounts[i]["name"];
        fundAccountNameMap[accName]["inst"] = accName;
        fundAccountNameMap[accName]["FundExtIssuedAcctId"] = fundAccounts[i]["extIssuedAcctId"];
        fundAccountNameMap[accName]["FundAcctNo"] = fundAccounts[i]["acctNo"];
    }
    sessionData.userData.fundingSourcesMap = fundAccountNameMap;
    sessionData.userData.fundAccountNames = fundAccountNames;
}

function prepareSpeech(sessionData, response, callback){
    var fundAccountNames, respText, fundAccountOptionString;
    fundAccountNames = sessionData.userData.fundAccountNames;
    fundAccountOptionString = '';
    if(fundAccountNames.length==0){
        respText = prompts.zeroFundAccounts;
    }
    else if(fundAccountNames.length==1){
        sessionData.userData.fundAccount = fundAccountNames[0];
        respText = prompts.dateOptions;
    }
    else{
        for(var i in fundAccountNames.slice(0,5)) fundAccountOptionString = fundAccountOptionString+"\n"+"-"+fundAccountNames[i];
        respText = util.format(prompts.fundAccountOptions, fundAccountOptionString);
    }
    response.result.fulfillment.speech = respText;
    callback(sessionData, response);
}

function searchFundAccount(sessionData, fundAccountEntered){
    var fundAccountNames = sessionData.userData.fundAccountNames;
    var fundAccountMatched;
    for(var i in fundAccountNames.slice(0,5)){
        if(fundAccountNames[i].toLowerCase().includes(fundAccountEntered)){
            fundAccountMatched = fundAccountNames[i];
            sessionData.userData.fundAccount = fundAccountMatched;
            break;
        }
    }
    return fundAccountMatched;
}

function isValidData(transferAmount, transferDate){
    var validatedData;
    if(isNaN(transferAmount)) validatedData = [false, 'amount'];
    else if(!moment(transferDate, "YYYY-MM-DD").isValid()) validatedData = [false, 'date'];
    else validatedData =[true, ''];
    return validatedData
}

function extractTransferAmount(parameters, sessionData){
    var amount, transferAmount, minDue, totalDue;
    var details = sessionData.userData.details;
    try{
        amount = parameters.transferAmount.balance;
        if(typeof(amount)=='string'){
            amount = amount.toLowerCase();
            if(amount.includes('min')) transferAmount = minDue;
            else transferAmount = totalDue;
        }
        else if(!isNaN(amount)) transferAmount = amount;
        else transferAmount = amount.amount;
    }
    catch(err){
        console.log(err);
        transferAmount = parameters.transferAmount;
    }
    return transferAmount;
}

function extractTransferDate(parameters, sessionData){
    var date = parameters.date;
    var transferDate;
    var details = sessionData.userData.details;
    try{
        if ('date' in date) date = date.date;
        if(typeof(date)=='string'){
            //two cases, it can be time
            //time case
            date = date.toLowerCase();
            if(date=='due date')  transferDate = moment(details.custAcctList.custAcct.pymntDueDate, 'MM/DD/YYYY').format('YYYY-MM-DD');
            else if(date == 'right away' || date.match(/[0-2][0-9]:[0-5][0-9]:[0-5][0-9]/)) transferDate = moment().format('YYYY-MM-DD');
            else transferDate = date.split('/')[0];  
        }
        else if(date.date == 'due date'){
            if(date.number) transferDate = moment(details.custAcctList.custAcct.pymntDueDate, 'MM/DD/YYYY').subtract(parseInt(date.number), 'day').format('YYYY-MM-DD');
            else transferDate = moment(details.custAcctList.custAcct.pymntDueDate, 'MM/DD/YYYY').format('YYYY-MM-DD');
        }
        else transferDate = date;
    }
    catch(err){
        console.log(err);
        transferDate = parameters.date;
    }
    return transferDate;
}
const checkForDebitAccount= function (sessionData, text){
    var debitAccounts = constants.debitAccounts;    
    for(var i in debitAccounts){
        if(text.includes(debitAccounts[i])){
         sessionData.userData.debitAc = debitAccounts[i]
         break;
     }
    }
}

const checkForCreditAccount= function (sessionData, text){
    var creditAccounts = constants.creditAccounts;
    var creditAccountsMapping = constants.creditAccountsMapping;
    var extraCreditAccounts = constants.extraCreditAccounts;
    var creditAccountMatched;
    var options;
    for(var i in creditAccounts){
        if(text.includes(creditAccounts[i])){
         creditAccountMatched = creditAccounts[i];
         sessionData.userData.creditAc = creditAccountMatched;
         break;
     }
    }
    if (!creditAccountMatched) { 
     for(var i in extraCreditAccounts){
        if(text.includes(extraCreditAccounts[i])){
         options = creditAccountsMapping[extraCreditAccounts[i]];
         break;
     }  
    }
    }
    return options
}

/*const updateEntites = function(response){
    const debitAccounts = constants.debitAccounts;
    var data = [{"value":debitAccounts[0], "synonyms": [debitAccounts[0]]},{'value':debitAccounts[1], 'synonyms':[debitAccounts[1]]}]
    request({
        url: orbipayUrl,
        method: 'PUT',
        data: data
        headers:{
            'Content-Type': 'application/json',
            'Authorization':'Bearer '+apiToken
        }
    },function (err,res,body) {
        console.log("succefully updated entries");
    })

}*/

const getCreditAccountOptions = function(incompleteCredit){
    var creditAccountOptionString = "";
    var creditAccountOptions;
    if(incompleteCredit.length!=0 && ['mom', 'dad'].indexOf(incompleteCredit)>=0)  creditAccountOptions=constants.creditAccountsMapping[incompleteCredit];
    else creditAccountOptions= constants.creditAccounts;
    for(var i in creditAccountOptions) creditAccountOptionString = creditAccountOptionString+"\n"+"-"+creditAccountOptions[i];
        return creditAccountOptionString;
}


module.exports = {
    orbipayRequest: orbipay_request,
    checkEntity: checkEntity,
    updateCurrentIntent: updateCurrentIntent,
    clearPayDetails: clearPayDetails,
    saveFundAccounts: saveFundAccounts,
    prepareSpeech: prepareSpeech,
    searchFundAccount: searchFundAccount,
    isValidData: isValidData,
    extractTransferDate : extractTransferDate,
    extractTransferAmount: extractTransferAmount,
    hsbcRequest: hsbc_request,
    checkForCreditAccount: checkForCreditAccount,
    checkForDebitAccount: checkForDebitAccount,
    getCreditAccountOptions: getCreditAccountOptions
};



