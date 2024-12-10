import config from './config.js';

const API_BASE_URL = config.API_BASE_URL;
const userForm = document.getElementById('userForm');
const interviewSection = document.getElementById('interviewSection');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const endBtn = document.getElementById('endBtn');
const transcript = document.getElementById('transcript');
const fileUpload = document.getElementById('fileUpload');
const fileName = document.getElementById('fileName');
const jobLink = document.getElementById('jobLink');
const loadingOverlay = document.getElementById('loadingOverlay');

// Set up
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

const recognition = new SpeechRecognition();
const speechRecognitionList = new SpeechGrammarList();

let threadId = null;
let file = null;
let isRecording = false;

recognition.grammars = speechRecognitionList;
recognition.continuous = true;
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

userForm.addEventListener('submit', (event) => {
    event.preventDefault();
    showLoading();
    userForm.style.display = 'none';
    interviewSection.style.display = 'block'; 

    //create new thread 
    fetch(`${API_BASE_URL}/thread`)
        .then(response => response.json())
        .then(data => {
            threadId = data;
            //TODO: place this after uploading function
            hideLoading();
            userForm.style.display = 'none';
            interviewSection.style.display = 'block'; 
    });

    //upload file to openai, use file var


    //upload function to openai 
});


// Start recording
startBtn.onclick = function() {
    isRecording = true;
    recognition.start();
}

// Stop recording
stopBtn.onclick = function() {
    isRecording = false;
    recognition.stop();
    console.log('Stopped recording.');
}

// Output
recognition.onresult = async function(event) {
    // Get the latest transcript 
    const result = event.results[event.resultIndex][0].transcript;
    transcript.value += `${result}\n`;

    isRecording = false;
    recognition.stop();
    await sendMessage(result);
}

recognition.onspeechend = function() {
    isRecording = false;
    recognition.stop();
}

// SpeechSynthesis
let synthesis = null
if ('speechSynthesis' in window) {
    synthesis = window.speechSynthesis;
} else {
        console.log('Text-to-speech not supported.');
}

async function sendMessage(message) {

    const file_id = "";

    console.log(JSON.stringify({ message, threadId, file_id }))
    const response = await fetch(`${API_BASE_URL}/message`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message, threadId, file_id })
    });

    const data = await response.json();

    // TODO: catch 400 bad request 
    transcript.value += `${data.response}\n`;

    speak(data.response);
}

function speak(message) {
    if (synthesis) { //TODO different speech synthesis, from openai?
        const utterance = new SpeechSynthesisUtterance(message);
        synthesis.speak(utterance);
    }
}

endBtn.onclick = function() {
    console.log("Here")
    if (confirm('Are you sure you want to end the interview?')) {
        window.location.reload();
    }
};

fileUpload.addEventListener('change', (event) => {
    const eventFile = event.target.files[0];
    if (eventFile) {
        fileName.textContent = eventFile.name;
        file = eventFile;
    } else {
        fileName.textContent = "No file selected";
    }
});

function showLoading() {
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
}

// Add some visual feedback when recording
/*function pulseAnimation() {
    if (isRecording) {
        startBtn.style.transform = 'scale(1.05)';
        setTimeout(() => {
            startBtn.style.transform = 'scale(1)';
        }, 200);
    }
    requestAnimationFrame(pulseAnimation);
}

pulseAnimation(); */
