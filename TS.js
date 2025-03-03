class AudioTranscriptor {
    constructor() {
        this.recognition = null;
        this.isRecording = false;
        this.transcripts = [];
        this.transcriptData = ''; // Store transcript data
        
        // Initialize UI elements
        this.toggleButton = document.getElementById('toggleButton');
        this.clearButton = document.getElementById('clearButton');
        this.downloadButton = document.getElementById('downloadButton'); // New download button
        this.statusDiv = document.getElementById('status');
        this.transcriptsDiv = document.getElementById('transcripts');
        
        // Bind methods
        this.toggleRecording = this.toggleRecording.bind(this);
        this.clearTranscripts = this.clearTranscripts.bind(this);
        this.handleResult = this.handleResult.bind(this);
        this.downloadTranscripts = this.downloadTranscripts.bind(this); // Bind download method
        
        // Setup event listeners
        this.toggleButton.addEventListener('click', this.toggleRecording);
        this.clearButton.addEventListener('click', this.clearTranscripts);
        this.downloadButton.addEventListener('click', this.downloadTranscripts); // Add event listener for download button
        
        // Initialize speech recognition
        this.initializeSpeechRecognition();
    }
    
    initializeSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Speech recognition is not supported in this browser. Please use Chrome.');
            return;
        }
        
        this.recognition = new webkitSpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        
        this.recognition.onresult = this.handleResult;
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.updateStatus('Error: ' + event.error);
        };
        
        this.recognition.onend = () => {
            if (this.isRecording) {
                this.recognition.start();
            }
        };
    }
    
    toggleRecording() {
        this.isRecording = !this.isRecording;
        
        if (this.isRecording) {
            this.recognition.start();
            this.updateStatus('Recording...', true);
        } else {
            this.recognition.stop();
            this.updateStatus('Not Recording', false);
        }
    }
    
    handleResult(event) {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
                this.saveTranscript(transcript);
            } else {
                interimTranscript += transcript;
            }
        }
        
        if (finalTranscript) {
            console.log('Final transcript:', finalTranscript);
        }
    }
    
    saveTranscript(text) {
        const timestamp = new Date().toLocaleString();
        const transcriptEntry = {
            text: text,
            timestamp: timestamp
        };
        
        this.transcripts.push(transcriptEntry);
        this.displayTranscript(transcriptEntry);
        this.transcriptData += `${timestamp}: ${text}\n`; // Append to transcript data
    }
    
    displayTranscript(entry) {
        const transcriptElement = document.createElement('div');
        transcriptElement.className = 'transcript-entry';
        transcriptElement.innerHTML = `
            <strong>${entry.timestamp}</strong><br>
            ${entry.text}
        `;
        
        this.transcriptsDiv.insertBefore(transcriptElement, this.transcriptsDiv.firstChild);
    }
    
    downloadTranscripts() {
        // Create a Blob with the transcript data
        const blob = new Blob([this.transcriptData], { type: 'text/plain' });
        
        // Create a download link and trigger it
        const filename = `transcripts_${new Date().toLocaleString().replace(/[/:]/g, '-')}.txt`;
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = filename;
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }
    
    clearTranscripts() {
        this.transcripts = [];
        this.transcriptsDiv.innerHTML = '';
        this.transcriptData = ''; // Clear transcript data
    }
    
    updateStatus(message, isRecording = false) {
        this.statusDiv.textContent = `Status: ${message}`;
        this.statusDiv.className = `status ${isRecording ? 'recording' : 'not-recording'}`;
    }
}

// Initialize the transcriptor when the page loads
window.addEventListener('load', () => {
    new AudioTranscriptor();
});