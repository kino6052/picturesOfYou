function initAffineTransformationsArray(){
	affineTransformationsArray = []; // start with an empty array
	for (var i = 0; i < dropletQuantity; i++) {
		affineTransformationsArray[i] = new Array(0, 0, 0, 0, 0, 0);
		// Random angles
		affineTransformationsArray[i][0] = ((Math.random() * 1000) % 360) ; 
		affineTransformationsArray[i][1] = ((Math.random() * 1000) % 360) ; 
		affineTransformationsArray[i][2] = ((Math.random() * 1000) % 360) ; 
		affineTransformationsArray[i][3] = ((Math.random() * 10000) % spread - spread/2) / 1000; 
		affineTransformationsArray[i][4] = 10-((Math.random() * 10000) % 10000) / 1000; 
		affineTransformationsArray[i][5] = ((Math.random() * 10000) % spread - spread/2) / 1000; 
	}
	console.log(affineTransformationsArray);
}

function updateAffineTransformationsArray(){
	for (var i = 0; i < dropletQuantity; i++) {
		// Random angles
		affineTransformationsArray[i][1] -= rotationSpeed; affineTransformationsArray[i][1] = affineTransformationsArray[i][1] % 360;  // fall
		affineTransformationsArray[i][4] -= speed; 
		if (affineTransformationsArray[i][4] < -5){
		    affineTransformationsArray[i][4] = 5;
		}
	}
}