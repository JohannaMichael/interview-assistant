import config from './config.js';
import message from './const.js';

const API_BASE_URL = config.API_BASE_URL;
const userForm = document.getElementById('userForm');
const interviewSection = document.getElementById('interviewSection');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const endBtn = document.getElementById('endBtn');
const generateBtn = document.getElementById('generateReportBtn');
const transcript = document.getElementById('transcript');
const fileUpload = document.getElementById('fileUpload');
const fileName = document.getElementById('fileName');
const jobLink = document.getElementById('jobLink');
const loadingOverlay = document.getElementById('loadingOverlay');
const generateReportOverlay = document.getElementById('generateReportOverlay');
const generatedReport = document.getElementById('generatedReport');
const themeToggle = document.getElementById('themeToggle');
const themeStylesheet = document.getElementById('theme-stylesheet');

// Set up
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

const recognition = new SpeechRecognition();
const speechRecognitionList = new SpeechGrammarList();

const savedTheme = localStorage.getItem('theme') || 'light';
updateTheme(savedTheme);

let threadId = null;
let file = null;
let fileId = null;

recognition.grammars = speechRecognitionList;
recognition.continuous = true;
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

themeToggle.addEventListener('click', () => {
    const newTheme = themeStylesheet.getAttribute('href') === 'light_theme.css' ? 'dark' : 'light';
    updateTheme(newTheme);
});

function updateTheme(theme) {
    if (theme === 'dark') {
        themeToggle.textContent = '☀️Light';
        themeStylesheet.setAttribute('href', 'dark_theme.css');
    } else {
        themeToggle.textContent = '🌙 Dark';
        themeStylesheet.setAttribute('href', 'light_theme.css');
    }
    localStorage.setItem('theme', theme);
}

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

        initMessage = message.intro + userName + message.jobInterview;

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

        initMessage = initMessage.concat(message.understandResume);
    }
    //TODO: job description to openai 

    await sendMessageAndPlayAudioResponse(initMessage, threadId, fileId);
    startInterviewTimer();
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
        await sendMessageAndPlayAudioResponse(result, threadId, null);
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

// initial message, send message, threadid, fileid (loading and voice)
// conversational message, send only message, thread (loading and voice)
// generate report message, send message, thread (loading and show of report)

async function sendMessageAndPlayAudioResponse(message, threadId, fileId) {
    showLoading();
    userForm.style.display = 'none';
    interviewSection.style.display = 'block'; 

    console.log(JSON.stringify({ message, threadId, fileId }))
    const response = await sendMessageToAssistant(message, threadId, fileId)

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

generateBtn.onclick = async function() {
    generateReport();
};

// Needs to move to Generate Report Component:

async function generateReport() {
    recognition.stop();
    showLoading();
    userForm.style.display = 'none';
    interviewSection.style.display = 'block'; 
    const response = await sendMessageToAssistant(message.generateReport, threadId, null);
    if (!response.ok) {
        generatedReport.value = 'Oops! There seems to have gone something wrong! Could not connect to your assistant';
    } else {
        const result = await response.json();
        generatedReport.value = result.response;
    }
    hideLoading();
    userForm.style.display = 'none';
    interviewSection.style.display = 'block';
    generateReportOverlay.style.display = 'flex';
}



async function sendMessageToAssistant(message, threadId, fileId) {

    const response = await fetch(`${API_BASE_URL}/assistant/message`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message, threadId, fileId })
    });

    return response;

}

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

function startInterviewTimer() {

    // TODO: refine this
    // able to generate report after 15 min (?)
    setTimeout(() => {
        generateBtn.style.display = 'inline-block'
    }, 900000); // 900,000 milliseconds = 15 minutes
}

