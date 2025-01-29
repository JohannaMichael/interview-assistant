import ThemeToggleButton from './components/ThemeToggleButton';
import InterviewUserForm from './components/InterviewUserForm';
import Interview from './components/Interview';
import InterviewReport from './components/InterviewReport';
import {LoadingOverlay} from './components/LoadingOverlay';
import {useState} from 'react';

function App() {
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [threadId, setThreadId] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [currentResponse, setCurrentResponse] = useState<string>('');

    return (
        <>
            <ThemeToggleButton />
            <div className="background-animation"></div>
            <div className="container">
                <h1>Interview Assistant</h1>
                {loading && <LoadingOverlay />}
                  {!isInterviewStarted ? (
              <InterviewUserForm 
                setIsInterviewStarted={setIsInterviewStarted} 
                threadId={threadId}
                setThreadId={setThreadId}
                fileId={fileId}
                file={file}
                setFile={setFile}
                setLoading={setLoading}
                setMessage={setMessage}
                setFileId={setFileId}
                setCurrentResponse={setCurrentResponse}
              />) : (
                <>
                  <Interview 
                    threadId={threadId} 
                    transcript={transcript} 
                    setTranscript={setTranscript} />
                </>
            )}
            </div>
        </>
    );
}

export default App;
