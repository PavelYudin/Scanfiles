const fs = require("fs");
module.exports.tools=function(obj){
	const config = require('./config.json'); //reading settings from a file
	if(!obj){//status change
		let obj={};
		obj.status=config.status;
		obj.threads=config.threads;
		return obj;
	}
	config.status=obj.pop();
	obj.forEach((item)=>{//write settings to a file config.json
		config.threads[item.thread-1].toggle=item.toggle;
		config.threads[item.thread-1].from=item.from;
		config.threads[item.thread-1].to=item.to;
		config.threads[item.thread-1].archive=item.archive;
		config.threads[item.thread-1].ext=item.ext;
		config.threads[item.thread-1].mask=item.mask;
		config.threads[item.thread-1].checkCSV=item.checkCSV;
		config.threads[item.thread-1].subdirectories=item.includeSubdirectories;
	});
	let newObj=obj.filter((item)=>{//filter out not included streams
		return item.toggle==true;
	});
	fs.writeFileSync('./config.json',JSON.stringify(config).replace(/,/g,',\n'));
	return newObj;
}