const path = require('path');
module.exports.check=function(file,mask){
	let ext=path.extname(file);
  	let basename=path.basename(file,ext);
  	return basename.includes(mask);
}