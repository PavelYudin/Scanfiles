const find=require('./find');
const fs = require('fs');
const log=require('./log');
const date=require('./date');
const path = require('path');
const parser = require('./parser');
const copy=require('./copy');
const mail=require('./mail');
const { workerData, parentPort, threadId, MessagePort } =require('worker_threads');
let {from,to,ext,includeSubdirectories,checkCSV,archive,mask}=workerData.options;
let end=true;//program shutdown flag
includeSubdirectories=includeSubdirectories==true?undefined:0;
let {index}=workerData;
let flag=true;//if the connection to the folder is broken
parentPort.on('message', (data) => {//copy completion
	end=false;
	parser.CSV=function(){return Promise.resolve();};
});
function choice(item,index,log){//file check
	if(checkCSV){ return parser.CSV(item,index,log)}
	else{ 
		return Promise.resolve(true)
	}
}
function checkDirectory(_path){//check directory
	return new Promise((resolve,reject)=>{
		fs.stat(_path,(err,stats)=>{
			if(err) reject(err)
			resolve(_path);
		})
	});
}
function checkError(err) {
	const arr=err.message.split('\\');
	const file=arr[arr.length-1];
	return file.includes(mask)?true:false;
}
function error(err,start){
	return new Promise((resolve,reject)=>{
		if(flag){
			log.thread(fs,err.message,index);
	   	 	mail.send(err.message,index)
	   	 	.then(()=>{
	   	 		resolve();
	   	 	});
		}else{	
		resolve();}				
	})
	.then(()=>{flag=false;setTimeout(start,5000);})
}
function copyFile(item,to){//copy file
	let text='successful file '+path.basename(item)+' copy from '+'\\'+path.dirname(item)+' to '+to;
	to=to+'\\'+path.basename(item)+'.$$$';
	return new Promise((resolve,reject)=>{
		fs.copyFile(item, to,
			err=>{
				if(err) {
					reject(err);}
				else{
					const newName=to.slice(0,to.length-4);
					fs.rename(to,newName,(err)=>{
						let flagDel=true;
						if (err){return reject(err);}
							(function delFile(){
								fs.unlink(item,err=>{
									if(err) {		
										if(flagDel) {
											log.thread(fs,'!!'+err.message,index);
											mail.send(err.message,index);
											flagDel=false;
										}
										 if(!end) {console.log('undefined');parentPort.postMessage(undefined)};
										delFile();
										return;
									}
									log.thread(fs,text,index);
									resolve();
								});
							})()
						}
					)
				}
			}
		)
	})
}
(function start(){//thread start
	if(!end) parentPort.postMessage(undefined);
	 find.search(ext,from,includeSubdirectories,mask)//search files in a directory
		.then(array=>{
			if(!array.length) flag=true; //if the folder is empty
			if(!end) parentPort.postMessage(undefined);
			array.reduce(function(promise,item){
				return promise.then(()=>{
					if(!end) parentPort.postMessage(undefined);
					return choice(item,index,log)})	
						.then((res)=>{
							if(res){
								return Promise.resolve()
								.then(()=>{
									return checkDirectory(from)
									.then((from)=>{
										if(archive && flag){
											return checkDirectory(archive)
												.then((archive)=>{													
													return copy.arch(archive,item,index)	
												})
												.catch(err=>{throw err;})
										}else{
											return Promise.resolve();
										}
									})
									.then(()=>{
										return checkDirectory(to)
									})
									.then((to)=>{flag=true;
										return copyFile(item,to)
									})
								});
							}
						})
			},Promise.resolve())
			.then((res)=>{start();}).
			catch((err)=>{
				if(err.path.endsWith(archive)){parentPort.postMessage(err.message);return;}
				error(err,start)
			})
		})
		.catch(err=>{
			if(checkError(err)) {error(err,stats)}else{setTimeout(start,5000);}
		})
})();

