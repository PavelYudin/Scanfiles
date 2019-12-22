const fs = require("fs");
const path = require('path');
const log=require('../log');
const config = require('../config');
const jwt=require('../token').getToken();
const multithreading=require('../multithreading');
const findDouble=multithreading.findDouble();
const nodeCmd = require('node-cmd');
let objThreads={};//thread object
let objNumberFile=[];//object amount file
const bcrypt=require('bcryptjs');
config.tools([false]);
exports.error=function(request,response){
	response.status(404).send("Not Found");
}
exports.download=function(request,response){//download log files
	response.download(request.params[Object.keys(request.params)[Object.keys(request.params).length-1]]);
}

exports.duplicate_identifiers=function(request,response){//page display duplicate_identifiers.html
	if(!jwt.verification(request.cookies[jwt.nameToken])){
		response.redirect('/authentication');
		return;
	}
	response.sendFile(path.join(__dirname, '../page', 'duplicate_identifiers.html'));
}

exports.search=function(request,response){//search for duplicates in NDR files
	if(!jwt.verification(request.cookies[jwt.nameToken]) && path){
 		response.send('/authentication');
 		return;
 	}
 	let path=request.body.path; 
	let id=request.body.id;
	findDouble(path,id,response);
}
exports.console=function(request,response){//page display console.html
	if(!jwt.verification(request.cookies[jwt.nameToken])){
		response.redirect('/authentication');
		return;
	}
	response.sendFile(path.join(__dirname, '../page', 'console.html'));
}
exports.consoleRun=function(request,response){//processing commands from the console
	function findLog(){
		let response=[];
		if(fs.existsSync(path.join(__dirname,'../server.log'))){
			response.push(path.join(__dirname,'../server.log'));
		}
		if(fs.existsSync(path.join(__dirname,'../log threads'))){
			for(let i=1;i<=10;i++){
				if(fs.existsSync(path.join(__dirname,`../log threads/thread ${i}.log`))) response.push(path.join(__dirname,`../log threads/thread ${i}.log`));
			}
		}
		return response;
	}
	if(request.body.length){
		if(request.body[request.body.length-1].toLowerCase()=='logs'){
			response.send(findLog());
		}else if(request.body[request.body.length-1].includes('\\')){
			if(fs.existsSync(request.body[request.body.length-1])) {
				try{
					let stream = fs.createReadStream(request.body[request.body.length-1]);
	    			stream.pipe(response);
				}catch(err){response.send('Error reading file!')}
			}
		}
		else{
			nodeCmd.get(request.body[request.body.length-1], (err, data, stderr) =>{
				response.send(data);
			});
		}
	}
}

exports.index=function(request,response){//page display main
	if(jwt.verification(request.cookies[jwt.nameToken])){
		response.sendFile(path.join(__dirname, '../page', 'index.html')); return;}
	else{
		response.redirect('/authentication');
		return;
	}
}

exports.renew=function(request,response){//display the number of files in directories
	function answer(){
		let arr=config.tools().threads;
		let from,to;
		objNumberFile[0]=config.tools().status;
		return new Promise((resolve,reject)=>{
				arr.forEach((item)=>{
					if(item.to || item.from) objNumberFile.push(multithreading.amount(fs,item));
				});
		})
 	}
 	if(!jwt.verification(request.cookies[jwt.nameToken])){
 		response.send('/authentication');
 		return;
 	}
 	if(objNumberFile.length<2){
 		answer().then(res=>{ response.send(objNumberFile);})
 		.catch(err=>{console.log('!!!!!!!!!'+err.message);});
 	}else{
 		response.send(objNumberFile);
 	}
}

exports.config=function(request,response){//entering settings into config.json file
	response.send(config.tools());
}

exports.authentication=function(request,response){//authentication page display
	if(jwt.verification(request.cookies[jwt.nameToken])){
		response.redirect('/');
		return;
	}
	response.sendFile(path.join(__dirname, '../page', 'aut.html'));
}

exports.check=function(request,response){//login and password verification
	function connection(){//connection to the database
		const Datastore = require('nedb');
		const db = new Datastore('users');
		db.loadDatabase();
		return db;
	}
	const db=connection();
	db.find({login: request.body.login}, function (err, docs) {
		try{
			if (bcrypt.compareSync(request.body.password,docs[docs.length-1].password)) {
				jwt.getToken(request.body.login);
				response.cookie(jwt.nameToken,jwt.token);
				response.send('/');
			}else{
				throw err;
			}
		}catch(err){
			response.send('Invalid login or password');
		}
	});	
}

exports.start=function(request,response){//start stream
	if(request.body.length){
		request.body=config.tools(request.body);//write json  			
		log.server(1,null);//write to the log file the time to start the program
		for(let i=1;i<objNumberFile.length;i++){
			Object.keys(objNumberFile[i]).forEach(item=>{
				if(item.includes('worker')){
					objNumberFile[i][item].terminate();//completion of file counting threads
				}
			});
		}
		objNumberFile=[];
		request.body.forEach((item)=>{
			multithreading.threads(fs,log,item.thread,item,objThreads,config,objNumberFile);//start stream to copy files
		});
		response.send(config.tools().status);
	}else{
		Object.keys(objThreads).reduce(function(promise,item){
			return promise.then(()=>{
				return multithreading.close(objThreads[item])
				.then(obj=>{obj.terminate();});////stop stream
			})
		},Promise.resolve())
		.then(()=>{
			objNumberFile[0]=config.tools().status;
			response.send(config.tools().status);
		})
		.catch(err=>{console.log(err.message)});
	}
}

