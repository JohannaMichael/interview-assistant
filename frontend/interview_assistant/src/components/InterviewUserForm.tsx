import {useState, useEffect} from 'react';
import { createThread, uploadFile, sendMessage } from '../assistantApiService';
import {assistantMessage} from '../../messages';

interface Props {
    setIsInterviewStarted: (value: boolean) => void;
    threadId: string;
    setThreadId: (value: string) => void;
    fileId : string | null;
    file: File | null;
    setFile: (value: File) => void;
    setLoading: (value: boolean) => void;
    setMessage: (value: string) => void;
    setFileId: (value: string | null) => void;
    setCurrentResponse: (value: string) => void;
  }

function InterviewUserForm({ setIsInterviewStarted, threadId, setThreadId, fileId, file, setFile, setLoading, setMessage, setFileId, setCurrentResponse}: Props) {
    const [fileName, setFileName] = useState<string>('No file selected');
    const [userName, setUserName] = useState<string>('');

    const handleUserNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUserName(event.target.value);
    };
    
    
    const handleSubmitAndStartInterview = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        let message = '';
        threadId = '';
        fileId = null;

        //create thread
        try {
            const response = await createThread();
            setThreadId(response.threadId);
            threadId = response.threadId;
            message = assistantMessage.intro + userName + assistantMessage.jobInterview;
        } catch (error) {
            console.error('Failed to fetch thread:', error);
        }

        //upload file
        if (file) {

            try {
                const response = await uploadFile(file);
                setFileId(response.file_id); //TODO: Refactor to one or the other fileId or file_id)
                fileId = response.file_id;
                message = assistantMessage.intro + userName + assistantMessage.jobInterview;
            } catch (error) {
                console.error('Failed to fetch thread:', error);
            }

            message = message.concat(assistantMessage.understandResume);
            setMessage(message)
        }

        //send message with created thread and file
        try {
            const response = await sendMessage(message, threadId, fileId);
            console.log(response)
            setCurrentResponse(response.response);
        } catch (error) {
            console.error('Error sending message:', error);
        }

        setIsInterviewStarted(true);

    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
          setFile(selectedFile);
          setFileName(selectedFile.name);
        } else {
          setFileName('No file selected');
        }
    };

    return (
        <form id="userForm" className="user-form" onSubmit={handleSubmitAndStartInterview}>
            <input 
                type="text" 
                id="userName" 
                placeholder="Enter Your Name" 
                value={userName} 
                onChange={handleUserNameChange} 
                required/>
            <div className="file-input-wrapper">
                <input type="file" id="fileUpload" className="file-input" accept=".pdf" onChange={handleFileChange}/>
                <label htmlFor="fileUpload" className="file-label">Upload Resume</label>
                <span id="fileName" className="file-name">{fileName}</span>
            </div>
            <input
                type="text"
                id="jobLink"
                className="link-input"
                placeholder="🔗 Job Posting Link - Coming Soon!"
                disabled
            />
            <button type="submit" className="btn btn-primary">Start Interview</button>
        </form>
    );
}

export default InterviewUserForm;


/*


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

*/
