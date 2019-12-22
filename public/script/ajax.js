function request(metod,URL,async,onreadystatechange,body=''){
	let xhr = new XMLHttpRequest();
	xhr.open(metod,URL,async);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.onreadystatechange = onreadystatechange;
    xhr.send(body);
}