const email = require("./node_modules/emailjs/email");
const CryptoJS = require("crypto-js");
const login='enter your';
const log=require('./log');
const host="enter your";
module.exports.send=function send(message,index){
	function connection(){//connection to the database
		const Datastore = require('nedb');
		const db = new Datastore('users');
		db.loadDatabase();
		return db;
	}
	const db=connection();
	return new Promise(function(resolve,reject){
		db.find({login:login}, function (err, docs) {//user search
			if(err){log.server(null,err.message);return;}
			let bytes  = CryptoJS.AES.decrypt(docs[docs.length-1].password,'Scanfiles');//check password
			const password = bytes.toString(CryptoJS.enc.Utf8);
			let server 	= email.server.connect({
		  		user:    login, 
		   		password: password, 
		   		host:   host
			});
			let k=4;//counter
			(function sendMessage(){
			server.send({
		  		text:  	  index+' thread: '+message, 
		   		from:    login, 
		   		to:      "enter your",
		   		cc:      "",
		   		subject: "Scanfiles!"
				}, 
				function(err, mess) {
					if(err) {
						k--;
						if(k==3) log.server(null,err.message);
						if(k) sendMessage();
					}
					return resolve();
				}
			);
			})()
		});
	});
}