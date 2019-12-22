const date=require('./date');
const new_line=require('os').EOL;
const fs = require("fs");
function checkSize(file){//log file auto cleanup
	let stat=fs.statSync(file);
	if(stat.size>10000000) fs.unlinkSync(file);
}
module.exports.server=function(state,text){//write to the main log file 
	text=text || (state?'Start ':'program shutdown ');
	try {
		if(fs.existsSync('server.log')) checkSize('server.log');
		fs.appendFileSync('server.log',text+date.log()+new_line);
	 	console.log(text+date.log());
	} catch (err) {
		console.log(err.message);
	 	console.log('not possible to write to file Server.log');
	}
}
module.exports.thread=function log(fs,text,index){//write to log files for streams
	try{
		if(fs.existsSync('log threads')){
			let nameFile='thread '+index+'.log';
			if(fs.existsSync(`log threads\\${nameFile}`)) checkSize(`log threads\\${nameFile}`);
			fs.appendFileSync(`log threads\\${nameFile}`,date.log()+text+new_line);
		}else{
			fs.mkdirSync('log threads');
			log(fs,text,index);
		}
	}catch(err){
		console.log(err);
	}
}




