import * as THREE from './nm/three/build/three.module.js';
import { PointerLockControls } from './nm/three/examples/jsm/controls/PointerLockControls.js';
var camera, scene, renderer, controls;
var objects = [];
var raycaster;
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;
var prevTime = performance.now();
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();
var vertex = new THREE.Vector3();
var color = new THREE.Color();
init();
animate();
function init() {
	console.log("hej");
	var backgroundTex = new THREE.TextureLoader().load("textures/back.jpg");
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.y = 10;
	scene = new THREE.Scene();
	scene.background = backgroundTex; //Baggrundsfarve
	scene.fog = new THREE.Fog(0xFFFFFF, 100, 1000); //T�ge: farve, t�t p�, lang v�k
	var light = new THREE.HemisphereLight(0xeeeeff, 0x686868, 0.75);
	light.position.set(0.5, 1, 0.75);
	scene.add(light);
	controls = new PointerLockControls(camera);
	var blocker = document.getElementById('blocker');
	var instructions = document.getElementById('instructions');
	instructions.addEventListener('click', function () {
		controls.lock();
	}, false);
	controls.addEventListener('lock', function () {
		instructions.style.display = 'none';
		blocker.style.display = 'none';
	});
	controls.addEventListener('unlock', function () {
		blocker.style.display = 'block';
		instructions.style.display = '';
	});
	scene.add(controls.getObject());
	var onKeyDown = function (event) {
		switch (event.keyCode) {
			case 38: // up
			case 87: // w
				moveForward = true;
				break;
			case 37: // left
			case 65: // a
				moveLeft = true;
				break;
			case 40: // down
			case 83: // s
				moveBackward = true;
				break;
			case 39: // right
			case 68: // d
				moveRight = true;
				break;
			case 32: // space
				if (canJump === true) velocity.y += 350*2;
				canJump = false;
				break;
		}
	};
	var onKeyUp = function (event) {
		switch (event.keyCode) {
			case 38: // up
			case 87: // w
				moveForward = false;
				break;
			case 37: // left
			case 65: // a
				moveLeft = false;
				break;
			case 40: // down
			case 83: // s
				moveBackward = false;
				break;
			case 39: // right
			case 68: // d
				moveRight = false;
				break;
		}
	};


	document.addEventListener('keydown', onKeyDown, false);
	document.addEventListener('keyup', onKeyUp, false);

	//Making a random string to make random highlight URL random.
	function makeid(length) {
		var result = '';
		var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		var charactersLength = characters.length;
		for (var i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	}

	var random = makeid(5);
	
	console.log(random);

	var request = new XMLHttpRequest();
	var textureList = [];
	request.open('GET', 'https://api.smk.dk/api/v1/art/search/?keys=*&offset=0&rows=30&randomHighlights=' + random, true);
	request.onload = function () {

	raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, - 1, 0), 0, 10);
	// floor
	var floorGeometry = new THREE.PlaneBufferGeometry(2000, 2000, 100, 100);
	floorGeometry.rotateX(- Math.PI / 2);
	// vertex displacement
	var position = floorGeometry.attributes.position;
	for (var i = 0, l = position.count; i < l; i++) {
		vertex.fromBufferAttribute(position, i);
		/*
		vertex.x += Math.random() * 20 - 10;
		vertex.y += Math.random() * 2;
		vertex.z += Math.random() * 20 - 10;*/
		vertex.x += 0;
		vertex.y += -100;
		vertex.z += 0;
		position.setXYZ(i, vertex.x, vertex.y, vertex.z);
	}
	floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices
	position = floorGeometry.attributes.position;
	
	var colors = [];
	for (var i = 0, l = position.count; i < l; i++) {
		color.setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
		colors.push(color.r, color.g, color.b);
	}
	floorGeometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

	//_________________________________________________________________________________IMPORTANT FOR MATERIAL:________________________________________________________________________
	

		// Begin accessing JSON data here

		var data = JSON.parse(this.response);
		if (request.status >= 200 && request.status < 400) {

			data.items.forEach(image => {
				if (image.image_native === undefined) {
					console.log("nej");


				} else {
					textureList.push(image.image_native);
					console.log("ja");
				}


			});
		} else {
			const errorMessage = document.createElement('marquee');
			errorMessage.textContent = `Gah, it's not working!`;
			app.appendChild(errorMessage);
		}

		console.log(textureList)

		//______________________________________________________________________LOADER_________________________________________________________
		var texture = new THREE.TextureLoader().load(textureList[3]);
		


		//var floorMaterial = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors });
		var floorMaterial = new THREE.MeshBasicMaterial({ map: texture });

		var floor = new THREE.Mesh(floorGeometry, floorMaterial);

		scene.add(floor);
		// objects
		var boxGeometry = new THREE.BoxBufferGeometry(40, 40, 40);
		boxGeometry = boxGeometry.toNonIndexed(); // ensure each face has unique vertices
		position = boxGeometry.attributes.position;
		colors = [];
		for (var i = 0, l = position.count; i < l; i++) {
			color.setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
			colors.push(color.r, color.g, color.b);
		}
		boxGeometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
		for (var i = 0; i < 25; i++) {
			console.log("box");
			var textureFromAPI = new THREE.TextureLoader().load(textureList[i]);
			var boxMaterial = new THREE.MeshPhongMaterial({
				specular: 0xffffff,
				flatShading: true,
				map: textureFromAPI
			});
			boxMaterial.color.setHSL(Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
			/*boxGeometry.height = 10;
			boxGeometry.width = 500;
			boxGeometry.depth = 50;*/
			var box = new THREE.Mesh(boxGeometry, boxMaterial);
			/*
			box.position.x = Math.floor(Math.random() * 20 - 10) * 20;
			box.position.y = Math.floor(Math.random() * 20) * 20 + 10;
			box.position.z = Math.floor(Math.random() * 20 - 10) * 20;*/
			
			box.position.x = i * 10;
			box.position.y = 30;
			box.position.z = Math.floor(Math.random() * 20 - 10) * 20;
			scene.add(box);
			objects.push(box);
		}
		//
		renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(renderer.domElement);
		//
		window.addEventListener('resize', onWindowResize, false);
	}
	request.send();
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
	requestAnimationFrame(animate);
	if (controls.isLocked === true) {
		raycaster.ray.origin.copy(controls.getObject().position);
		raycaster.ray.origin.y -= 10;
		var intersections = raycaster.intersectObjects(objects);
		var onObject = intersections.length > 0;
		var time = performance.now();
		var delta = (time - prevTime) / 1000;
		velocity.x -= velocity.x * 10.0 * delta;
		velocity.z -= velocity.z * 10.0 * delta;
		velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
		direction.z = Number(moveForward) - Number(moveBackward);
		direction.x = Number(moveRight) - Number(moveLeft);
		direction.normalize(); // this ensures consistent movements in all directions
		if (moveForward || moveBackward) velocity.z -= direction.z * 2400.0 * delta;
		if (moveLeft || moveRight) velocity.x -= direction.x * 2400.0 * delta;
		if (onObject === true) {
			velocity.y = Math.max(0, velocity.y);
			canJump = true;
		}
		controls.moveRight(- velocity.x * delta);
		controls.moveForward(- velocity.z * delta);
		controls.getObject().position.y += (velocity.y * delta); // new behavior
		if (controls.getObject().position.y < 10) {
			velocity.y = 0;
			controls.getObject().position.y = 10;
			canJump = true;
		}
		prevTime = time;
	}
	renderer.render(scene, camera);
}