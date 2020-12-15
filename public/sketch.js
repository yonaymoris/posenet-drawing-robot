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
let use = true;
const ws = new WebSocket('ws://localhost:3030');
ws.onopen = () => { 
  console.log('Now connected'); 
};
ws.onmessage = function(event) {
  if(event.data == 'IN_USE') {
    use = false;
    window.alert('Hey! You are in waiting. Looks like there is a person just finishing off their drawing. You can enjoy the live stream meanwhile');
  }
  if(event.data == 'WAITING_CLEARED') {
    use = true;
    window.alert('Ready to use');
  }
}
var el;
function setup() {
  canvas = createCanvas(window.screen.width, window.screen.height- window.screen.height*33/100);
  canvas.position(window.screen.width /2 + 35,window.screen.height*33/100 - 35) 
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
  let currPose = posestyle[poseLabel]
  if(currPose && use) {
    /*let currPose = document.getElementById(poseLabel);
    console.log('CURR POSE',currPose,poseMapping[poseLabel])
    if(currPose) {
      currPose.style.borderStyle = 'solid';
    }*/
    //image(video, 0, 0);
    //tint(0, 153, 204);
    tint(Number(currPose.r), Number(currPose.g), Number(currPose.b));
    image(video, 0, 0, video.width, video.height);
    //image(video, 50, 0);
    ws.send(currPose.id);
  }
  if (pose && use) {
    for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(2);
      stroke(0);

      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }
    for (let i = 0; i < pose.keypoints.length; i++) {
      if(pose.keypoints[i].position.y+10 < video.height && pose.keypoints[i].position.x > (video.width - 500)) {
        let x = pose.keypoints[i].position.x;
        let y = pose.keypoints[i].position.y;
        fill(0);
        stroke(255);
        ellipse(x, y, 16, 16);
      }
    }
  }
  pop();

  fill(255, 0, 255);
  //noStroke();
  //textSize(70);
  //textAlign(CENTER, CENTER);
  //text(poseLabel, width / 2, height / 2);
}
function drawPoseCat(meta) {
  var element = document.createElement("div");
  element.className = 'posecategory';
  //element.appendChild(document.createTextNode(meta.category));
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
  if(meta.id) {
    element.id = meta.id;
  }
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
  iframe.src = 'https://www.youtube.com/embed/XYZ123?autoplay=1';
  iframe.width = window.screen.width/2;
  iframe.height = window.screen.width/3;
  iframe.allow = 'autoplay'
  node.appendChild(iframe);
  document.getElementById('videos').appendChild(node);
}