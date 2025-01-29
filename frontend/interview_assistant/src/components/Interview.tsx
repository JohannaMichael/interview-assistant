import { useState } from 'react';
import { sendMessage } from '../assistantApiService';

interface Props {
  threadId: string | null;
  transcript: string;
  setTranscript: (value: string) => void;
}

function Interview({ threadId, transcript, setTranscript }: Props) {

    const [isRecording, setIsRecording] = useState(false);

    const startRecording = () => {
        setIsRecording(true);
        // Start recording logic
    };

    const stopRecording = () => {
        setIsRecording(false);
        // Stop recording logic
    };

    const handleSendMessage = async (message: string) => {
        if (!threadId) return;
        try {
            const response = await sendMessage(message, threadId, null);
            setTranscript(response.response + '\n' + transcript);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };


    return (
        <div className="interview-section" id="interviewSection" style={{ display: 'none' }}>
            <div className="instructions">
                <p>Press "Stop" to stop any recording. Press "Start" to start recording.</p>
                <p>Generate a report about your interview to see how you are doing.</p>
                <p>All responses between you and the assistant will be transcribed below.</p>
            </div>
            <div className="transcript-window">
                <textarea id="transcript" readOnly></textarea>
            </div>
            <div className="controls">
                <button id="startBtn" className="btn btn-success">Record</button>
                <button id="stopBtn" className="btn btn-danger">Stop</button>
                <button id="generateReportBtn" className="btn btn-primary">Generate Report</button>
                <button id="endBtn" className="btn btn-warning">End Interview</button>
            </div>
        </div>
    );
}

export default Interview;