# interview-assistant

AI Assistant helping you train for job interviews.

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


Set up API Keys in OpenAI and set up an Assistant with an AssistantID, place both in an .env file (see env.example). You have to give the Assistant system instructions. Write something like this: "You are a Job Interview Trainer and Assistant. You need to train the user for job interviews by asking them questions about their resume or past projects." Activate File Search. Currently using gpt-4o-mini-2024-07-18 model. 

Set up an Account and API keys in Elevenlabs to get high quality text-to-speech voices. They have a free plan initially. Place the key in your .env file as well.

Running the backend server: 

```
uvicorn app:app --reload
```

The fastapi app will run on http://localhost:8000 

Finally, for the frontend, I run a Live Server in VSCode. You have to place the url (for me it is this: http://localhost:5500) in the .env file as well (as shown in .env.example)

Run both frontend and backend to get the running application.

## Set up (with Docker):

Clone this repository as described above. 

```
git clone https://github.com/JohannaMichael/interview-assistant.git
cd interview-assistant
```
Set up the api keys and assistant id for openai and elevenlabs as described above. 

Then run the docker command: 

```
docker compose up --build
```







## Current functionality: 

1. Upload your name and resume to openai (resume is optional)
2. Assistant starts a mock interview asking you questions about you and your resume/document
3. Conversational flow with assistant

## What will (soon) be added:

1. Ability to generate report of interview session
2. Adding of job posting link (will add more information for the assistant)
3. First better text-to-speech, then better speech-to-text (Elevenlabs most likely)
4. Streaming of message instead of polling from open ai


![image](https://github.com/user-attachments/assets/f5dc777e-65bf-48fb-8e21-253d5ef9a309)


![image](https://github.com/user-attachments/assets/96d5f3ed-47a0-4ad7-a9cf-c84b062aad59)

