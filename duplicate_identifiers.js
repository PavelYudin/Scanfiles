const find=require('./find');
const parser = require('./parser');
const fs = require("fs");
const { workerData, parentPort, threadId } =require('worker_threads');
let {path,result}=workerData;
	function checkResult(shi,result,nameCSV){//verification with the result
		let flag=false;
		result.forEach(item=>{
	    	if(shi===item.shi) {
				flag=!flag;
				item.nameCSV.push(nameCSV);
				parentPort.postMessage(item)
			}
		})
		return flag;
	}
	_find();
	function _find(){
		fs.stat(path,function(err,stat){
			if(err) {parentPort.postMessage(err.message);return;}
			if(stat.isDirectory()){
				find.search('NDR',path,0)//file search
				.then(arr=>{
					if(!arr.length){
						message='There are no files in the specified directory';
						parentPort.postMessage(message);
						return;
					}
					if(arr.length==1){
						message='Only 1 file in the specified directory';
						parentPort.postMessage(message);
						return;
					}
					let arrayCSV=[];
					arr.reduce((promise,file)=>{
						return promise.then(()=>{
								return parser.reading_SHI(file)
								.then(objCSV=>{
									objCSV.arr.forEach(item=>{
										let badCSV={
											shi:null,
											nameCSV:[]
										};
										badCSV.nameCSV.push(objCSV.nameCSV);
										if(checkResult(item,result,objCSV.nameCSV)) {return;}
											arrayCSV.forEach(obj=>{
												if(obj.arr.includes(item)){
													badCSV.shi=item;
													badCSV.nameCSV.push(obj.nameCSV);
												}
											});
										
										if(badCSV.shi){ result.push(badCSV);parentPort.postMessage(badCSV)}
									})
									arrayCSV.push(objCSV);						
								})
						})
					},Promise.resolve()).then(()=>{result[0]=true;parentPort.postMessage(true);})
				})
			}
		})
	}
