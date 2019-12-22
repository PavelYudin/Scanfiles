const Filehound = require('filehound');
const path = require("path");
const maskFile = require('./mask');
module.exports.search=function(ext,patch,includeSubdirectories,mask){
	let files=Filehound.create();
	if(ext!=='*.*') files=files.ext(ext);  	
  	return files.path(patch)
  	.depth(includeSubdirectories)
  	.size(">0kb")
  	.find()
  	.then(array=>{
        if(!mask) return array;
  			let arrCheckMask=array.filter(item=>{
          return maskFile.check(item,mask);
  			});
        return arrCheckMask;
  	})
}