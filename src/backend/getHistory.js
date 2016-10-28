'use strict';

const config = require("./config.json");
const data = require("./sampleData.json");//Move required details to config and remove this file
const utils = require("./utils");
const moment = require("moment");

const getHistory = function (userId ,startDt, endDt, callback) {
		if(!endDt) endDt = moment().format('YYYY-MM-DD');
		var message ={
		  "rtrvTrsfSummRqst": {
		    "-xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
		    "-xsi:noNamespaceSchemaLocation": "RetrieveTransferSummaries.xsd",
		    "gsmHead": {
		      "msgName": "RetrieveTransferSummariesRequest",
		      "msgVersNum": "2.0"
		    },
		    "msgUseSeg": {
		      "gsmComSeg": {
		        
		      },
		      "applSeg": {
		        "applProp": [
		          {
		            "key": "sessionIdentifier",
		            "value": "ssnId"
		          },
		          {
		            "key": "clientIPAddress",
		            "value": "127.0.0.1"
		          },
		          {
		            "key": "httpUserAgent",
		            "value": "IE"
		          }
		        ],
		        "servPrfl": [
		          {
		            "globlUniqId": "02d63110-78f1-11e3-b04e-000006010407",
		            "applName": "CORE_CD560_APPVN",
		            "servPrflDetl": {
		              "servId": "02d6311078f111e3b04e006147",
		              "svtp": "VNGPCoreBank"
		            }
		          },
		          {
		            "globlUniqId": "b1bbffa0-21d7-11e3-93dc-000006010006",
		            "applName": "CORE_CD676_APPPH",
		            "servPrflDetl": {
		              "servId": "b1bbffa021d711e393dc006106",
		              "svtp": "P4GPCoreBank"
		            }
		          }
		        ]
		      }
		    },
		    "srchRefer": "7746032",
		    "busDataSeg": {
		      "srchCrta": {
		        "srchType": "FDT",
		        "srchAcct": {
		          "intrnId": "PHHSBC010044352100",
		          "extnlId": "PHHSBCEANPHHSBC010044352100                 E",
		          "ptyp": "CUA",
		          "ccod": "EUR",
		          "ctryCde": "PH",
		          "entyAppl": "CORE_CD676_APPPH",
		          "name": "Q3VycmVudCBBL0MgTm9uIEludGVyZXN0IEJlYXJpbmc="
		        },
		        "fromDt": {
		          "value": startDt,
		          "formt": "ISO"
		        },
		        "td": {
		          "value": endDt,
		          "formt": "ISO"
		        }
		      },
		      "applUseExtn": {
		        "srtCntl": {
		          "srtKey": "Debit",
		          "srtDrct": "Asce"
		        },
		        "pageCntl": {
		          "startRec": "1",
		          "endRec": "15",
		          "ttlRec": "50"
		        }
		      }
		    }
		  }
		}
		utils.hsbcRequest(message, function (err,res) {
	        console.log("response is", res);
	        callback(err,res);
    	});
}


module.exports = {
    getHistory: getHistory
};
