function normalizeEvent(e){
	if(e instanceof MouseEvent){
		e.x = e.x || e.clientX;
		e.y = e.y || e.clientY;
	}
	return e;
}

module.exports = normalizeEvent;