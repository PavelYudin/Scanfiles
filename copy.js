const fs = require('fs');
const path = require('path');
const log=require('./log');
module.exports.arch=function(folder,item,index){
		const date=new Date();
		const year=date.getFullYear();
		const strDate=date.toString();
		const month=strDate.slice(strDate.indexOf(' '),strDate.indexOf(' ',strDate.indexOf(' ')+1));
		const number=date.getDate();
		if(!fs.existsSync(`${folder}\\${year}`)) fs.mkdirSync(`${folder}\\${year}`);
		if(!fs.existsSync(`${folder}\\${date.getFullYear()}\\${month}`)) fs.mkdirSync(`${folder}\\${date.getFullYear()}\\${month}`);
		if(!fs.existsSync(`${folder}\\${date.getFullYear()}\\${month}\\${number}`))  fs.mkdirSync(`${folder}\\${date.getFullYear()}\\${month}\\${number}`);
		if(!fs.existsSync(`${folder}\\${date.getFullYear()}\\${month}\\${number}\\${index} thread`))  fs.mkdirSync(`${folder}\\${date.getFullYear()}\\${month}\\${number}\\${index} thread`);
		return new Promise((resolve,reject)=>{
			//copy to archive
			fs.copyFile(item, `${folder}\\${date.getFullYear()}\\${month}\\${number}\\${index} thread\\${path.basename(item)}`,
				err=>{
					if(err) throw err;
					log.thread(fs,'copied to archive '+path.basename(item),index);
					resolve();
				}
			);
		})
}