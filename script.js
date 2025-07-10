// Get references to your HTML elements
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const messagesContainer = document.getElementById('messages'); // Assuming you have a div with id="messages"

const N8N_WEBHOOK_URL = 'https://shreya4.app.n8n.cloud/webhook/b993985d-e5c6-4b19-8975-c6b9b15d56ea/chat';

// --- NEW: Generate or retrieve a session ID ---
let sessionId = localStorage.getItem('chatSessionId'); // Try to get it from local storage
if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('chatSessionId', sessionId); // Store it for future visits
}
console.log('Using sessionId:', sessionId); // For debugging: check this in your browser console

// Function to display a message in the chat
function displayMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender); // Add classes for styling (e.g., 'message user', 'message ai')
    messageDiv.textContent = text;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Auto-scroll to bottom
}

// Function to send the message to n8n
async function sendMessage() {
    const userMessage = messageInput.value.trim();

    if (userMessage === '') {
        return; // Don't send empty messages
    }

    // Display user's message immediately
    displayMessage(userMessage, 'user');
    messageInput.value = ''; // Clear input field

    // Display a "typing..." or loading indicator (optional)
    displayMessage('AI is thinking...', 'ai-thinking'); // You might want to style this differently

    try {
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST', // <-- THIS IS WHERE YOU SPECIFY IT'S A POST REQUEST
            headers: {
                'Content-Type': 'application/json', // We're sending JSON data
                'Accept': 'application/json' // We expect JSON back
            },
            body: JSON.stringify({ // Convert your data to a JSON string
                sessionId: "4d2fda9e6cc14b1bad7056949af29270", // <--- NEW: Include the session ID here
                action: "sendMessage",
                chatInput: userMessage // This is the payload n8n will receive
            })
        });

        if (!response.ok) { // Check if the HTTP status code is in the 2xx range
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json(); // Assuming n8n sends back JSON

        // Remove the "AI is thinking..." message or replace it
        const thinkingMessage = messagesContainer.querySelector('.ai-thinking');
        if (thinkingMessage) {
            thinkingMessage.remove();
        }

        // Display AI's response
        // n8n's webhook typically returns the output of the last node.
        // If your AI Agent node is the last node, its output might be directly in data.
        // You might need to inspect the 'data' object in your browser's console (F12)
        // to see the exact structure n8n returns and adjust 'data.response' accordingly.
        // For example, it might be data.text, data.output, data.result, etc.
        // Based on the n8n chat output screenshot, it could be data.output or data.result.output
        displayMessage(data.output || data.response || "No response received.", 'ai');


    } catch (error) {
        console.error('Error sending message to n8n:', error);
        // Remove thinking message
        const thinkingMessage = messagesContainer.querySelector('.ai-thinking');
        if (thinkingMessage) {
            thinkingMessage.remove();
        }
        displayMessage('Error: Could not connect to AI. ' + error.message, 'error'); // Display error to user
    }
}

// Event Listeners for sending message
sendButton.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        sendMessage();
        event.preventDefault(); // Prevent default Enter key behavior (e.g., new line in textarea)
    }
});

// Initial greeting message (appears when chat loads)
displayMessage("How can I help you explore today?", 'ai'); // Or your preferred opening line
