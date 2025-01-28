function InterviewReport() {
    return (
        <div id="generateReportOverlay" className="generate-report-overlay">
            <div className="report-content">
                <h2>Mock Interview Report</h2>
                <div className="transcript-window">
                    <textarea id="generatedReport" readOnly></textarea>
                </div>
                <button id="acknowledgeReportBtn" className="btn btn-primary">Exit Interview</button>
            </div>
        </div>
    );
}

export default InterviewReport;
