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
let fileId = null;

recognition.grammars = speechRecognitionList;
recognition.continuous = true;
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

userForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    showLoading();
    userForm.style.display = 'none';
    interviewSection.style.display = 'block'; 
    let initMessage = ""
    const userName = document.getElementById('userName').value;

    //create new thread 
    try {
        // Fetch the thread data
        const response = await fetch(`${API_BASE_URL}/assistant/thread`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch thread: ${response.statusText}`);
        }
        
        const data = await response.json();
        threadId = data.threadId

        initMessage = `Hi, my name is ${userName} and you need to conduct a job interview with me now.`;

    } catch (error) {
        console.error('Error fetching thread:', error);
    }

    //upload file to openai, use file var
    if (file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_BASE_URL}/assistant/upload-file`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            fileId = data.file_id //TODO: Refactor to one or the other fileId or file_id

            if (response.ok) {
                console.log('File uploaded successfully:');
            } else {
                console.error('Error uploading file:');
            }
        } catch (err) {
            console.error('Network error:', err);
        }

        initMessage = initMessage.concat("Understand my uploaded resume and use it as a reference.")
    }
    //TODO: job description to openai 

    await sendMessage(initMessage);
});


// Start recording
startBtn.onclick = function() {
    recognition.start();
}

// Stop recording
stopBtn.onclick = function() {
    recognition.stop();
}

// Output
recognition.onresult = async function(event) {
    // Get the latest transcript 
    const lastItem = event.results[event.results.length - 1];
    const result = lastItem[0].transcript;

    if (result != "") {
        transcript.value = `${result}\n\n` + transcript.value;
        recognition.stop();
        await sendMessage(result);
    }
}

recognition.onspeechend = function() {
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
    showLoading();
    userForm.style.display = 'none';
    interviewSection.style.display = 'block'; 

    console.log(JSON.stringify({ message, threadId, fileId }))
    const response = await fetch(`${API_BASE_URL}/assistant/message`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message, threadId, fileId })
    });

    hideLoading();
    userForm.style.display = 'none';
    interviewSection.style.display = 'block';

    if (!response.ok) {
        transcript.value = `Oops! There seems to have gone something wrong! Could not connect to your assistant\n\n` + transcript.value;
    } else {
        const result = await response.json();
        transcript.value = `${result.response}\n\n` + transcript.value;
        await handleSpeechAndRecognition(result.response);
    }
}
/*
function speak(message) {
    if (synthesis && message) { //TODO different speech synthesis

        return new Promise((resolve) => {
            const utterance = new SpeechSynthesisUtterance(message);
    
            // Event triggered when speech synthesis is finished
            utterance.onend = () => {
                console.log("Speech synthesis finished");
                resolve(); // Resolve the promise
            };
    
            // Handle any potential errors
            utterance.onerror = (event) => {
                console.error("Speech synthesis error:", event.error);
                resolve(); // Still resolve to prevent blocking
            };
    
            synthesis.speak(utterance);
        });
    }
} */

async function playAndWaitForAudio(audioUrl) {
    return new Promise((resolve) => {
        const audio = new Audio(audioUrl);

        // Resolve the promise when the audio finishes playing
        audio.onended = () => {
            resolve();
        };

        // Start playing the audio
        audio.play();
    });
}

async function handleSpeechAndRecognition(message) {

    // Perform speech synthesis and wait for it to finish
    await synthesizeAndPlayAudio(message);

    // Start recognition after speech synthesis
    recognition.start();
}

endBtn.onclick = function() {
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


async function synthesizeAndPlayAudio(text) {

    try {
        // Send the text to the backend
        const response = await fetch(`${API_BASE_URL}/synthesis/text-to-speech`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text, voice_id: "" }),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch audio from the backend");
        }

        // Convert the audio stream to a Blob
        const audioBlob = await response.blob();

        // Create a URL for the audio Blob
        const audioUrl = URL.createObjectURL(audioBlob);

        await playAndWaitForAudio(audioUrl);

    } catch (error) {
        console.error("Error during synthesis or playback:", error);
    }
}

