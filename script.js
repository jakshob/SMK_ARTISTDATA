import * as THREE from './nm/three/build/three.module.js';
//import { PointerLockControls } from './nm/three/examples/jsm/controls/PointerLockControls.js';
import { GUI } from './nm/three/examples/jsm/libs/dat.gui.module.js';
import { MapControls } from './nm/three/examples/jsm/controls/OrbitControls.js';

var camera, scene, renderer, controls;

var pickingData = [], pickingTexture, pickingScene;
var highlightBox;
var mouse = new THREE.Vector2();
var offset = new THREE.Vector3(10, 10, 10);


init();
animate();

function init() {

	
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xcccccc); //baggrundsfarve
	scene.fog = new THREE.Fog(0xFFFFFF, 10, 3000); //Tåge: farve, tæt på, lang væk

	
	
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
	camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.set(400, 200, 0);

	// controls
	controls = new MapControls(camera, renderer.domElement);
	//controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
	controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
	controls.dampingFactor = 0.1;
	controls.screenSpacePanning = false;
	controls.minDistance = 100;
	controls.maxDistance = 500;
	controls.maxPolarAngle = Math.PI / 2;

	//Make lists of artist names, workamount per artist, and birthyear
	var request = new XMLHttpRequest();

	var artistNames = [];
	var genders = [];
	var workCounts = [];
	var birthyears = [];


	request.open('GET', 'https://api.smk.dk/api/v1/person/search/?keys=*&offset=0&rows=2000', true);
	request.onload = function () {

		//_________________________________________________________________________________IMPORTANT FOR MATERIAL:________________________________________________________________________


		// Begin accessing JSON data here

		var data = JSON.parse(this.response);
		if (request.status >= 200 && request.status < 400) {
			var birthyearTemp = "";
			var iteratorCount = 0;
			data.items.forEach(artist => {
					
				if (artist.forename !== undefined &&
					artist.surname !== undefined &&
					artist.birth_date_start !== undefined) {

					artistNames.push(artist.forename + " " + artist.surname);

					workCounts.push(artist.works.length);

					genders.push(artist.gender[0])

					birthyearTemp = artist.birth_date_start.toString();
					var birthyear = birthyearTemp.substring(0, 4);
					birthyears.push(birthyear);

					

				} else {
					console.log("undefined info in this field: " + iteratorCount);

				}

				iteratorCount++;

			});

		} else {
			const errorMessage = document.createElement('marquee');
			errorMessage.textContent = `Gah, it's not working!`;
		}

		console.log(genders);
		console.log(birthyears);
		console.log(workCounts);
		console.log(artistNames);


	// world
	var geometry = new THREE.BoxBufferGeometry(1, 1, 1);
	geometry.translate(0, 0.5, 0);
		
		
		for (var i = 0; i < artistNames.length; i++) {

			//material.color = new THREE.Color("rgb(0," + Math.floor(birthyears[i].substring(1, 4) / 4) + ", 0)");
			//material.color = new THREE.Color("rgb(240," + 240 + ", 0)");
			//material.color = 'rgb(0,' + birthyears[i].substring(1, 4) +',0';
			var material = new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true });
			if (genders[i] === "MALE") {
				material.color.set("rgb(0, 250, 0)");
			}
			if (genders[i] === "FEMALE") {
				material.color.set("rgb(0, 0, 250)");
			}
			if (genders[i] === "UNKNOWN") {
				material.color.set("rgb(250, 0, 0)");
				console.log(artistNames[i]);
			}
			
			//material.color.set("rgb(0," + Math.floor(workCounts[i] / 10) + ", 0)");
			var mesh = new THREE.Mesh(geometry, material);
			
			//console.log(Math.floor(birthyears[i].substring(1, 4) / 4));

			mesh.position.x = 0;
			mesh.position.y = -200;
			mesh.position.z = birthyears[i]*i/70-1500;
			mesh.scale.x = 12;
			mesh.scale.y = workCounts[i]/10;
			mesh.scale.z = 6;
			mesh.updateMatrix();
			mesh.matrixAutoUpdate = false;
			scene.add(mesh);
	}
	// lights
	var light = new THREE.DirectionalLight(0xffffff);
	light.position.set(1, 1, 1);
	scene.add(light);
	var light = new THREE.DirectionalLight(0x002288);
	light.position.set(- 1, - 1, - 1);
	scene.add(light);
	var light = new THREE.AmbientLight(0x222222);
	scene.add(light);
	//
	window.addEventListener('resize', onWindowResize, false);
	var gui = new GUI();
	gui.add(controls, 'screenSpacePanning');


	


	

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
	controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
	render();
}
function render() {


	renderer.render(scene, camera);
}
