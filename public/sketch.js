//initialising serial
var serial;          // variable to hold an instance of the serialport library
let canvas;
var portName = '/dev/tty.usbmodem1421'; // fill in your serial port name here
var inData;                            // for incoming serial data
var outByte = 0; 
let serialOptions = { baudrate: 9600};
let video;
let stream;
let poseNet;
let pose;
let skeleton;
let brain;
let poseLabel = "";
let poseMapping = {
  'moveLeft':2,
  'moveRight':3,
  'drawLongLeft':5,
  'drawLongRight':4,
  'drawShortRight':6,
  'drawShortLeft':7,
  'drawBothLeft':8,
  'drawBothRight':9,
  'moveLeftRepeat':10,
  'moveRightRepeat':11
}

const ws = new WebSocket('ws://localhost:3030');
ws.onopen = () => { 
  console.log('Now connected'); 
};
ws.onmessage = function(event) {
  console.log('EVENT',event.data);
}
var el;
// get the list of ports:
function printList(portList) {
  // portList is an array of serial port names
  for (var i = 0; i < portList.length; i++) {
    // Display the list the console:
    console.log(i + portList[i]);
  }
}
function serverConnected() {
  console.log('connected to server.');
}
 
function portOpen() {
  console.log('the serial port opened.')
}
 
function serialEvent() {
  var inString = serial.readLine();
  if (inString.length > 0 ) {
    // convert it to a number:
    inData = Number(inString);
    console.log('NUM',inData);
  }
}
 
function serialError(err) {
  console.log('Something went wrong with the serial port. ' + err);
}
 
function portClose() {
  console.log('The serial port closed.');
}
function setup() {
  canvas = createCanvas(window.screen.width, window.screen.height);
  canvas.position(window.screen.width /2,window.screen.height*3/10+12)
  serial = new p5.SerialPort();    // make a new instance of the serialport library
  serial.on('list', printList);  // set a callback function for the serialport list event
  serial.on('connected', serverConnected); // callback for connecting to the server
  serial.on('open', portOpen);        // callback for the port opening
  serial.on('data', serialEvent);     // callback for when new data arrives
  serial.on('error', serialError);    // callback for errors
  serial.on('close', portClose);      // callback for the port closing
  serial.list();  
  serial.open(portName,serialOptions); 
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);
  for(let i=0;i<poseMeta.length;i++) {
    drawPoseCat(poseMeta[i]);
  }
  drawPose();
  let options = {
    inputs: 34,
    outputs: 4,
    task: 'classification',
    debug: true
  }
  brain = ml5.neuralNetwork(options);
  const modelInfo = {
    model: 'model2/model.json',
    metadata: 'model2/model_meta.json',
    weights: 'model2/model.weights.bin',
  };
  brain.load(modelInfo, brainLoaded);
  createframe();
}

function brainLoaded() {
  console.log('pose classification ready!');
  classifyPose();
}

function classifyPose() {
  if (pose) {
    let inputs = [];
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      inputs.push(x);
      inputs.push(y);
    }
    brain.classify(inputs, gotResult);
  } else {
    setTimeout(classifyPose, 100);
  }
}

function gotResult(error, results) {

  if (results[0].confidence > 0.75) {
    console.log(results[0].label);
    poseLabel = results[0].label;
  }
  //console.log(results[0].confidence);
  classifyPose();
}


function gotPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}


function modelLoaded() {
  console.log('poseNet ready');
}

function draw() {
  push();
  translate(video.width, 0);
  scale(-1, 1);
  image(video, 0, 0, video.width, video.height); 
  /*if (pose) {
    for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(2);
      stroke(0);

      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }
    for (let i = 0; i < pose.keypoints.length; i++) {
      if(pose.keypoints[i].position.y+10 < video.height) {
        let x = pose.keypoints[i].position.x;
        let y = pose.keypoints[i].position.y;
        fill(0);
        stroke(255);
        ellipse(x, y, 16, 16);
      }
    }
  }*/
  pop();

  fill(255, 0, 255);
  //noStroke();
  //textSize(70);
  //textAlign(CENTER, CENTER);
  if(poseMapping[poseLabel]) {
    ws.send(poseMapping[poseLabel]);
  }
  //text(poseLabel, width / 2, height / 2);
}
function drawPoseCat(meta) {
    console.log('MEE',meta,meta.poses)
  
  var element = document.createElement("div");
  element.className = 'posecategory';
  element.appendChild(document.createTextNode(meta.category));
  var poses = document.createElement("div");
  poses.className = 'justinline';
  for(let i=0;i<meta.poses.length;i++) {
    poses.appendChild(drawPose(meta.poses[i]));
  }
  element.style.width = meta.poses.length*9.8 + '%';
  element.appendChild(poses);
  document.getElementById('posemenu').appendChild(element);
}
function drawPose(meta) {
if(meta) {
  var element = document.createElement("div");
  element.className = "pose";

  //element.appendChild(document.createTextNode(meta.name));
  //add image
  var img = document.createElement('img'); 
  img.src =  meta.image; 
  img.className = 'image';
  element.appendChild(img);

  var line = document.createElement("div");
  line.className = "line";
  line.style.backgroundColor = meta.colour;
  //element.appendChild(line);
  return element;
}
}
function createframe(src) {
  let node = document.createElement('div');
  node.className = 'videoelement';
  var iframe = document.createElement('iframe');
  iframe.src = 'https://www.youtube.com/embed/XYZ123';
  iframe.width = window.screen.width/2;
  iframe.height = window.screen.width/3;
  node.appendChild(iframe);
  document.getElementById('videos').appendChild(node);
}