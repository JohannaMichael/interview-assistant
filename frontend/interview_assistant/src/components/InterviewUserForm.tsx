function InterviewUserForm() {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Handle form submission logic
        console.log('Form submitted');
    };

    return (
        <form id="userForm" className="user-form" onSubmit={handleSubmit}>
            <input type="text" id="userName" placeholder="Enter Your Name" required />
            <div className="file-input-wrapper">
                <input type="file" id="fileUpload" className="file-input" accept=".pdf" />
                <label htmlFor="fileUpload" className="file-label">Upload Resume</label>
                <span id="fileName" className="file-name"></span>
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
