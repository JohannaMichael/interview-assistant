import {useState, useEffect} from 'react';

interface Props {
    setIsInterviewStarted: (value: boolean) => void;
    setThreadId: (value: string | null) => void;
    file: File | null;
    setFile: (value: File) => void;
  }

function InterviewUserForm({ setIsInterviewStarted, setThreadId, file, setFile }: Props) {
    const [fileName, setFileName] = useState<string>('No file selected');
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Handle form submission logic
        console.log('Form submitted');
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
        <form id="userForm" className="user-form" onSubmit={handleSubmit}>
            <input type="text" id="userName" placeholder="Enter Your Name" required />
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
fileUpload.addEventListener('change', (event) => {
    const eventFile = event.target.files[0];
    if (eventFile) {
        fileName.textContent = eventFile.name;
        file = eventFile;
    } else {
        fileName.textContent = "No file selected";
    }
});









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
