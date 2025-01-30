# interview-assistant

AI Assistant helping you train for job interviews.

## Set up (with Docker):

Clone this repository: 

```
git clone https://github.com/JohannaMichael/interview-assistant.git
cd interview-assistant
```

Set up API Keys: 

Set up API Keys in OpenAI and set up an Assistant with an AssistantID, place both in an .env file WITHIN backend folder (see env.example). You have to give the Assistant system instructions. Write something like this: "You are a Job Interview Trainer and Assistant. You need to train the user for job interviews by asking them questions about their resume or past projects." Activate File Search. Currently using gpt-4o-mini-2024-07-18 model. 

Set up an Account and API keys in Elevenlabs to get high quality text-to-speech voices. They have a free plan initially. Place the key in your .env file as well.

Then run the docker command: 

```
docker compose up --build
```


## Setup (without Docker):

Clone this repository:

```
git clone https://github.com/JohannaMichael/interview-assistant.git
cd interview-assistant
```

Create a virtual environment for backend. Activate it:

```
cd backend
python3 -m venv venv
source venv/bin/activate
```

Install the required dependencies:

```
pip install -r ./requirements.txt
```

Set up the api keys and assistant id for openai and elevenlabs as described above. 

Running the backend server: 

```
uvicorn app:app --reload
```

The fastapi app will run on http://localhost:8000 

Finally, for the frontend, I run a Live Server in VSCode. You have to place the url (for me it is this: http://localhost:5500) in the .env file as well (as shown in .env.example)

Run both frontend and backend to get the running application.







## Current functionality: 

1. Upload your name and resume to openai (resume is optional)
2. Assistant starts a mock interview asking you questions about you and your resume/document
3. Conversational flow with assistant
4. Generate a report after 15 min

## What will (soon) be added:

1. React App for a modern frontend. Focused on backend, so currently I only have a static, vanilla JS frontend.
2. Adding of job posting link (will add more information for the assistant)
3. better speech-to-text, with Elevenlabs again
4. Streaming of message instead of polling from openAi



