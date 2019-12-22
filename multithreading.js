const {Worker,isMainThread,MessageChannel}=require('worker_threads');
const mail=require('./mail');
module.exports.findDouble=function(){//create a thread to search for duplicates in an NDR file
	let arrThreadDoubleFile=new Map();//dynamic collection for the result
	return function(path,id,response){
		class CreateThread{
			constructor(path){
				this.path=path;
				this.result=[false];
			}
			runWorker(id){
				this['worker_'+id]= new Worker(__dirname + '/duplicate_identifiers.js',{ workerData:{
					path:this.path,
					result:this.result
				}
				});
				this['worker_'+id].on('message', (msg) => {
					if(msg===true){
						this.result[0]=true;
					}else if(typeof msg==='string'){this.result=msg;}
					 else{
						this.result.push(msg);
					}
				});
				arrThreadDoubleFile.set(id,this)		
			}
		}
		if(arrThreadDoubleFile.size){
			if(arrThreadDoubleFile.get(id)){
				let obj=arrThreadDoubleFile.get(id);
				setTimeout(()=>{
					response.send(obj.result);
					if(obj.result[0]){		
						obj['worker_'+id].terminate();
						arrThreadDoubleFile.delete(id);
					}else{
						obj.result.splice(1);
					}
				},2000);
				return;
			}
		}
		let threadDoubleFile=new CreateThread(path);
		threadDoubleFile.runWorker(id);
		response.send(arrThreadDoubleFile.get(id).result);
	}
}
module.exports.close=function(obj){//thread completion(maincontroller)
	return new Promise((resolve,reject)=>{
		obj.postMessage(null);
		obj.on('message', (msg) => {
			resolve(obj);
		});
	})
}
module.exports.threads=function(fs,log,i,options,objThreads,config,objNumberFile){//create thread to copy files
	function stopThread(text){
		delete objThreads['worker'+i];
		log.server(null,text);
		if(!Object.keys(objThreads).length) {
	      	log.server(0,null);
	      	config.tools([false]);
	      	objNumberFile[0]=config.tools().status;
	    }
	    objNumberFile.forEach(item=>{
	      	if(item.thread==i) item.state=false;
	    });
	}
	    objThreads['worker'+options.thread] = new Worker(__dirname + '/app.js',{ workerData:{

			index:i,
			options:options
		    }
		});

	    objThreads['worker'+i].on('message', (msg) => {
	    	if(!msg) return;
	    	objThreads['worker'+i].emit('error',new Error(msg));
	    });

	    objThreads['worker'+i].on('online', () => {
	    	let text='Thread started '+i+' ';
	      	log.server(null,text);
	    });

	    objThreads['worker'+i].on('error', (err) => {
	    	mail.send('STOP '+err.message,i);
	    	let text='Thread '+i+' is error: '+err+' ';
	    	stopThread(text);
	    });

	    objThreads['worker'+i].on('exit', (code) => {
	      let text='Thread '+i+' exit code: '+code+' ';
	      stopThread(text);
	    });
	
}
module.exports.amount=function(fs,item){//create a thread to count the number of files
	return createWork('from','to');
	function createWork(from,to){
		let threadObj={};
		threadObj.thread=item.thread;
		threadObj.state=true;
		threadObj.paths={
			from:null,
			to:null
		};
		for(let i=0;i<arguments.length;i++){
				if(item[arguments[i]]){
					threadObj['worker'+i]= new Worker(__dirname + '/numberFile.js',{ workerData:{
						options:{
							path:item[arguments[i]],
							includeSubdirectories:item.subdirectories,
							ext:item.ext,
							mask:item.mask	}
		    			}
					});
					threadObj['worker'+i].on('message', (msg) => {
						threadObj.paths[arguments[i]]=msg;
					});
				    threadObj['worker'+i].on('error', (err) => {
				    	log.server(null,err.message);
				    });
			   }
		}
		return threadObj;
	}
}