"use strict"
const prompts = {};
prompts["startConversation"] = "Hi %s. Being a premier customer, you can now send money to your friends and family. Would you like me to help with that?";
prompts["amountOptions"] = "How much would you like to send?";	
prompts["debitAccountOptions"] ="Which one of your accounts would you like to pay from?%s?";
prompts["creditAccountOptions"] ="Which one of these accounts would you like to transfer the money to?%s";
prompts["dateOptions"] = "When would you like to send the money?";
prompts["confirmTransaction"] = "You are about to transfer $%s from %s to %s on %s. Shall I go ahead and confirm that?";
prompts["transactionSuccess"] = "That's cool %s. You just chatted your way through the transaction :). Hey, btw, your transaction reference is %s. So.. how else may I help you?";
prompts["transactionError"] = "Oops. There seems to be a problem here %s. It's just temporary. Could you try later please? Sorry for that.";
prompts["transactionCancel"] = "What happened? Are you having second thoughts about the payment? That's fine, no problem. Do come back when you want to.";
prompts["fieldMissing"] = "Oops. There seems to be some missing data. Please give proper %s and try again!!"
prompts["transactionSummary"] = "These are your last few transactions.\n%s."
prompts["transactionDetail"] = "These are the details of the transaction you requested for.\n%s."
module.exports ={
	prompts:prompts
}
