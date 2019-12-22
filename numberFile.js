const { workerData, parentPort, threadId } =require('worker_threads');
let fs=require('fs');
const maskFile = require('./mask');
let _path = require('path');
let{ext,path,includeSubdirectories,mask}=workerData.options;
if(ext==='*.*') ext='';
let timerId=setInterval(function tick(){
		let count;
		function find(path,count){
			count=0;//file counter 
			let stat;
			try{
				let arr=fs.readdirSync(path);	
				arr.forEach(file=>{
					let buf=_path.resolve(path,file);
					try{	
						stat=fs.statSync(buf);
					}catch(e){count--;return;}		
					if(includeSubdirectories && stat.isDirectory()){
						count+=find(path+'\\'+file)
					}else if(stat.isFile()){
						if(workerData.options.ext===''){
							if(!file.includes('.') && maskFile.check(file,mask)) ++count;
						}else{
							if(file.slice(file.length-ext.length)===ext && maskFile.check(file,mask)) ++count;
						}
					}
				});
			}catch(err){count='null';}
			return count;
		}
		parentPort.postMessage(find(path,count));
	}
,10000);


