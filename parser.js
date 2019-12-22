const csv = require('csv-parser')
const fs = require('fs')
const path = require('path');
let checkCSV=false;
let headlineCSV={};
headlineCSV['Barcode']=function(value){
	if(value.length==14){
	  if(isAN(+value) && +value[0]!=0) return true;
	}else if(value.length==13){
		if( isSign(value.substr(0,2)) && isSign(value.slice(-2)) ) return true;
	}
	return false;
}
headlineCSV['IndexTo']=function(value){
	if(value.length==6 && isAN(+value) && +value[0]!=0) return true;
	return false;
}
headlineCSV['MailDirect']=function(value){
	if(value.length==3 && isAN(+value)) return true;
	return false;
}
function  isSign(value) {
   for (let i = 0; i < value.length; i++){ 
      if (!(value[i] >= "A" && value[i] <= "Z")) return false;
   }
   return true;
}
function isAN(value) {
  return (value instanceof Number||typeof value === 'number') && !isNaN(value);
}
module.exports.CSV=function(fileCSV,index,log){
  return new Promise((resolve,reject)=>{
    if(fs.statSync(fileCSV).size==0){checkCSV=false;resolve(checkCSV);}
    let readStream = fs.createReadStream(fileCSV);
    readStream
           .pipe(csv({ separator: '|'}))
           .on('headers', (headers) => {
           	if(Object.keys(headlineCSV).length!=headers.length)return;
           	for(let i=0;i<headers.length;i++)
           		if (headlineCSV.hasOwnProperty(headers[i])){
        			checkCSV=true;
           		}else{checkCSV=false;break;}
          })
          .on('data', (data) =>{
          	if(checkCSV){
          		for(i in data){			
          			if( !data[i] || !(headlineCSV[i](data[i])) ){
          				checkCSV=false;return;
          			}
          		}
          	}
          })
         .on('end', () => {resolve(checkCSV);
          })
  })
}
module.exports.reading_SHI=function(fileCSV){
  let objCSV={
    nameCSV:path.basename(fileCSV),
    arr:[],
    bad:new Set()
  };
  return new Promise((resolve,reject)=>{
    fs.createReadStream(fileCSV)
    .pipe(csv({ separator: '|'}))
    .on('headers',headers=>{})
    .on('data',data=>{
      let shi;
      for(i in data){
        if(i.length==14) shi=data[i];
      }
      if(objCSV.arr.includes(shi)){
        objCSV.bad.add(shi)
      }else{
        objCSV.arr.push(shi)
      }
    })
    .on('end',()=>{
      resolve(objCSV);
    })
  })  
}