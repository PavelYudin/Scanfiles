const jwt=require('jsonwebtoken');
module.exports.getToken=function(){
	const secret='scanfiles';
	const nameToken='auth';
	let token=null;
	return {
				token:token,
				nameToken:nameToken,
				getToken(login,response){
					this.token=jwt.sign({data:login},secret, { expiresIn: 3000 });
				},
				verification(token){
					try{
						const decoded=jwt.verify(token,secret);
						return true; 
					}catch(err){
						return false;
					}
				}
			
	}
}