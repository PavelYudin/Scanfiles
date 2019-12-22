module.exports.log=function(separatorDate='/',separatorTime=':'){//we form a date for writing to the log file
	function adjustment(date){
		return (''+date).length==1?'0'+date:date;
	}
	let now = new Date();
	const date=`${adjustment(now.getDate())}${separatorDate}${adjustment(now.getMonth()+1)}${separatorDate}${adjustment(now.getFullYear())}`;
	const time=`${adjustment(now.getHours())}${separatorTime}${adjustment(now.getMinutes())}${separatorTime}${adjustment(now.getSeconds())}`;
	return 	`${date}_${time}_`;
}