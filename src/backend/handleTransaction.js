'use strict';

const config = require("./config.json");
const data = require("./sampleData.json");//Move required details to config and remove this file
const utils = require("./utils");
const moment = require("moment");

const retrieveAccounts = function (userId, callback){
    utils.hsbcRequest(obj,cust.key, function (err,res) {
        callback(err, res);
    });
};


const provideTransactionRequest = function (userId, transactionDetails, callback){
		var message ={"prvidTrsfInstrRqst":{"$":{"xmlns:xsi":"http://www.w3.org/2001/XMLSchema-instance","xsi:noNamespaceSchemaLocation":"ProvideTransferInstruction.xsd"},"gsmHead":[{"msgName":["ProvideTransferInstructionRequest"],"msgVersNum":["2.0"]}],"msgUseSeg":[{"gsmComSeg":[{"respCde":[""],"respType":[""],"respText":[""],"rqstType":[""]}],"applSeg":[{"applProp":[{"key":["sessionIdentifier"],"value":["ssnId"]},{"key":["clientIPAddress"],"value":["127.0.0.1"]},{"key":["httpUserAgent"],"value":["IE"]}],"servPrfl":[{"globlUniqId":["02d63110-78f1-11e3-b04e-000006010407"],"applName":["APP004"],"servPrflDetl":[{"servId":["02d6311078f111e3b04e006147"],"svtp":["THGPCoreBank"]}]},{"globlUniqId":["b1bbffa0-21d7-11e3-93dc-000006010006"],"applName":["CD045"],"servPrflDetl":[{"servId":["b1bbffa021d711e393dc006106"],"svtp":["P4GPCoreBank"]}]},{"globlUniqId":["b1bbffa0-11e3-93dc-000006010006"],"applName":["APP_HPAY"],"servPrflDetl":[{"servId":["02d6311078f111e3b04e006147"],"svtp":["APP_HPAY"]}]}]}]}],"busDataSeg":[{"trsfInstr":[{"tranId":[""],"trsfType":["IMM"],"desc":["R2lyaXNo"],"stat":[""],"valueDt":[{"dtValue":["2015-04-26"],"tmValue":["00:00:00"],"formt":["ISO"],"tmzn":["EST"]}],"debitAmt":[{"value":[transactionDetails.transferAmount],"precsnCnt":["0"],"signInd":["1"],"theCcod":["EUR"]}],"srce":[{"intrnId":["PHHSBC010044352100"],"extnlId":["PHHSBCEANPHHSBC010044352100       E"],"ptyp":["CUA"],"ccod":["EUR"],"ctryCde":["PH"],"entyAppl":["CD045"],"name":["Q3VycmVudCBBL0MgTm9uIEludGVyZXN0IEJlYXJpbmc="]}],"trgt":[{"intrnId":["RecipientId140GDX"],"extnlId":["gdxsample2@gmail.com"],"ptyp":["HPY"],"ccod":["USD"],"ctryCde":["FF"],"entyAppl":["APP_HPAY"],"name":["Q3VycmVudCBBL0MgTm9uIEludGVyZXN0IEJlYXJpbmc="]}],"debitReasonCde":["Orders"],"creditReasonCde":["Orders"]}],"schedDetl":[{"freqCde":["DLY"],"stdt":[{"dtValue":[transactionDetails.transferDate],"tmValue":["00:00:00"],"formt":["ISO"],"tmzn":["EST"]}],"endt":[{"dtValue":[""],"tmValue":[""],"formt":[""],"tmzn":["EST"]}],"eventCnt":["4"],"isIndefin":["F"]}],"debitCustId":["b1bbffa021d711e393dc006106"],"creditCustId":["02d6311078f111e3b04e006147"],"cntc":[{"phoNum":["3453-2344-1234"],"eaddr":["testing@ismail.com"],"langPrfr":["en_US"]}],"trsfCond":[{"trsfProp":[{"key":["TFR_ADDITIONAL_reason"],"value":["Kiran:Order Testing"]},{"key":["FXOW_TGT_FX_RATE"],"value":["VFhUIDAuNg=="]},{"key":["DR_LCL_CUST_PROP"],"value":["VFhUIFA="]},{"key":["INSTR_CHANL_ID"],"value":["VFhUIE9ISQ=="]},{"key":["FXOW_RATE_EXPIRY_DATE"],"value":["VFhUIDIwMTMtMTAtMjA="]}]}]}]}};
	   utils.hsbcRequest(message, function (err,res) {
        console.log("response is", res);
        callback(err,res);
    });
}

const makeTransaction = function (id, transactionID, callback) {
   console.log(transactionID);
	var message = {"cfmTrsfInstrRqst":{"$":{"xmlns:xsi":"http://www.w3.org/2001/XMLSchema-instance","xsi:noNamespaceSchemaLocation":"ConfirmTransferInstruction.xsd"},"gsmHead":[{"msgName":["ConfirmTransferInstructionRequest"],"msgVersNum":["2.0"]}],"msgUseSeg":[{"gsmComSeg":[{"respCde":[""],"respType":[""],"respText":[""],"rqstType":[""]}],"applSeg":[{"applProp":[{"key":["sessionIdentifier"],"value":["ssnId"]},{"key":["clientIPAddress"],"value":["127.0.0.1"]},{"key":["httpUserAgent"],"value":["IE"]}],"servPrfl":[{"globlUniqId":["02d63110-78f1-11e3-b04e-000006010407"],"applName":["APP004"],"servPrflDetl":[{"servId":["02d6311078f111e3b04e006147"],"svtp":["THGPCoreBank"]}]},{"globlUniqId":["b1bbffa0-21d7-11e3-93dc-000006010006"],"applName":["CD045"],"servPrflDetl":[{"servId":["b1bbffa021d711e393dc006106"],"svtp":["P4GPCoreBank"]}]},{"globlUniqId":["b1bbffa0-11e3-93dc-000006010006"],"applName":["APP_HPAY"],"servPrflDetl":[{"servId":["02d6311078f111e3b04e006147"],"svtp":["APP_HPAY"]}]}]}]}],"busDataSeg":[{"tranId":[transactionID]}]}}
	utils.hsbcRequest(message, function (err,res) {    
        callback(err,res);
    });
	
}

module.exports = {
retrieveAccounts: retrieveAccounts,
makeTransaction: makeTransaction,
provideTransactionRequest: provideTransactionRequest
};