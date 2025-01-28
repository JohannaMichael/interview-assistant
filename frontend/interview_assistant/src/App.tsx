import ThemeToggleButton from './components/ThemeToggleButton';
import InterviewUserForm from './components/InterviewUserForm';
import Interview from './components/Interview';
import InterviewReport from './components/InterviewReport';
import {useState, useEffect} from 'react';

function App() {
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [threadId, setThreadId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);


    return (
        <div className="App">
            <ThemeToggleButton />
            <div className="background-animation"></div>
            <div id="loadingOverlay" className="loading-overlay">
                <div className="loader"></div>
            </div>
            <div className="container">
                <h1>Interview Assistant</h1>
                  {!isInterviewStarted ? (
              <InterviewUserForm 
                setIsInterviewStarted={setIsInterviewStarted} 
                setThreadId={setThreadId}
                file={file}
                setFile={setFile}
              />) : (
                <>
                  <Interview 
                    threadId={threadId} 
                    transcript={transcript} 
                    setTranscript={setTranscript} 
                  />
                  <InterviewReport transcript={transcript} />
              </>
            )}
            </div>
        </div>
    );
}

export default App;
