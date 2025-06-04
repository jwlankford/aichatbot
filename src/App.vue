<template>
    <!-- Main wrapper for the entire application content -->
    <div class="main-wrapper flex flex-col md:flex-row md:gap-8 justify-center items-start p-4 md:p-8 w-full max-w-screen-xl mx-auto">
        <!-- Title and description container -->
        <div class="title-container w-full md:w-1/3 mb-8 md:mb-0">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">AI Chat Bot</h1>
            <h2 class="text-xl font-semibold text-gray-700 mb-4">developed by</h2>
            <p class="text-gray-600 mb-2">This is a simple chat bot that uses the Gemini LLM to generate responses.</p>
            <p class="text-gray-600 mb-4">Type your message below and press enter or click send to get a response.</p>
            <small class="text-gray-500">
                <p class="mb-1">Note: This is a demo app and the API key is hardcoded for demonstration purposes. In a production app, the API key is restricted to this domain only.</p>
            </small>
        </div>

        <!-- Main chat interface container -->
        <div class="body-container w-full md:w-2/3 bg-white rounded-xl shadow-lg flex flex-col overflow-hidden h-80vh">
            <!-- Chat messages display area -->
            <div class="chat-messages">
                <div v-for="(message, index) in messages" :key="index"
                     :class="['message-bubble message-container', message.sender === 'user' ? 'user-message' : 'bot-message']">
                    <!-- Use v-html for bot messages to render Markdown -->
                    <span v-if="message.sender === 'user'">{{ message.text }}</span>
                    <span v-else v-html="message.html"></span>
                </div>
                <!-- Loading indicator for bot response -->
                <div v-show="isLoading" class="loading-indicator">
                    Bot is typing...
                </div>
            </div>

            <!-- Input area for new messages -->
            <div class="input-area">
                <input
                    v-model="newMessage"
                    @keyup.enter="sendMessage"
                    placeholder="Type your message..."
                    :disabled="isLoading"
                    class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                <button @click="sendMessage" :disabled="isLoading || !newMessage.trim()">
                    Send
                </button>
            </div>
        </div>
    </div>
</template>

<script>
// Explicitly import ref and nextTick from 'vue'
import { ref, nextTick } from 'vue';
// Import marked directly from the 'marked' package
import { marked } from 'marked';

export default {
    // The setup function is where you define reactive state, computed properties, methods, etc.
    setup() {
        console.log("App.vue setup function started.");

        // Reactive data properties
        const messages = ref([
            // Initial message now includes both raw text and parsed HTML
            { sender: 'bot', text: "Hello! How can I help you today?", html: marked.parse("Hello! How can I help you today?") }
        ]); // Stores chat history
        const newMessage = ref(''); // Stores the current message being typed
        const isLoading = ref(false); // Indicates if the bot is generating a response

        // Function to scroll chat to the bottom of the message area
        const scrollToBottom = () => {
            nextTick(() => {
                const chatMessages = document.querySelector('.chat-messages');
                if (chatMessages) {
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }
            });
        };

        // Function to send a message to the chatbot
        const sendMessage = async () => {
            const messageText = newMessage.value.trim();
            if (!messageText) return; // Do nothing if message is empty

            // Add user message to chat history (no HTML parsing needed for user messages)
            messages.value.push({ sender: 'user', text: messageText });
            newMessage.value = ''; // Clear input field after sending
            scrollToBottom(); // Scroll to show the newly sent message

            isLoading.value = true; // Show loading indicator while waiting for bot response

            try {
                // Call the Gemini API to get the bot's response
                await callGeminiAPI(messageText);
            } catch (error) {
                console.error("Error sending message:", error);
                // Add an error message to the chat with HTML parsing
                messages.value.push({ sender: 'bot', text: "Oops! Something went wrong. Please try again.", html: marked.parse("Oops! Something went wrong. Please try again.") });
            } finally {
                isLoading.value = false; // Hide loading indicator
                scrollToBottom(); // Scroll to show the bot's response or error message
            }
        };

        // Function to make the API call to the Gemini LLM
        const callGeminiAPI = async (prompt) => {
            let chatHistory = [];
            // For this example, we're only sending the current prompt.
            // For a full conversational AI, you would send a history of recent messages
            // to provide context to the LLM.
            chatHistory.push({ role: "user", parts: [{ text: prompt }] });

            const payload = { contents: chatHistory };
            // The apiKey is expected to be provided by the Canvas environment at runtime.
            // If running outside Canvas, you would insert your actual API key here.
            const apiKey = "AIzaSyDo9ZW7pB4DlF3EInk-9FXuPTqDA4fgXzo"; // NOTE: This API key is hardcoded for demo.
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            console.log("General Chat API Key (before fetch):", apiKey); // Log API key for debugging
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error:", errorData);
                throw new Error(`API call failed: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const botResponseText = result.candidates[0].content.parts[0].text;
                // Store both raw text and parsed HTML for display
                messages.value.push({ sender: 'bot', text: botResponseText, html: marked.parse(botResponseText) });
            } else {
                // Handle cases where the API response structure is unexpected
                messages.value.push({ sender: 'bot', text: "I couldn't generate a response. Please try rephrasing.", html: marked.parse("I couldn't generate a response. Please try rephrasing.") });
            }
        };

        // Return reactive properties and methods to the template
        return {
            messages,
            newMessage,
            isLoading,
            sendMessage
        };
    }
};
</script>

<style scoped>
/* Scoped styles for the App component ensure they only apply to this component */
/* Styling for the main wrapper */
.main-wrapper {
    /* These styles are applied directly in the template for the main wrapper div */
    /* width: 100%; */
    /* max-width: 768px; */ /* Removed as it's now on the main-wrapper in template */
    /* background-color: #ffffff; */
    /* border-radius: 1rem; */
    /* box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); */
    /* display: flex; */
    /* flex-direction: column; */
    /* overflow: hidden; */
    /* height: 80vh; */
}

/* Styles for the chat interface container */
.body-container {
    background-color: #ffffff;
    border-radius: 1rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    height: 80vh; /* Fixed height for chat window */
}

.chat-messages {
    flex-grow: 1;
    overflow-y: auto;
    padding: 1.5rem;
    background-color: #f9fafb;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
.message-bubble {
    max-width: 80%;
    padding: 0.75rem 1rem;
    border-radius: 1rem;
    word-wrap: break-word;
}
.user-message {
    align-self: flex-end;
    background-color: #3b82f6; /* Blue */
    color: white;
    border-bottom-right-radius: 0.25rem; /* Sharper corner for user message */
}
.bot-message {
    align-self: flex-start;
    background-color: #e5e7eb; /* Light gray */
    color: #374151; /* Dark gray text */
    border-bottom-left-radius: 0.25rem; /* Sharper corner for bot message */
}
/* Styling for Markdown content within bot messages */
.bot-message p {
    margin-bottom: 0.5em;
}
.bot-message ul, .bot-message ol {
    list-style-position: inside;
    margin-left: 1em;
    margin-bottom: 0.5em;
}
.bot-message strong {
    font-weight: 600;
}
.input-area {
    padding: 1.5rem;
    border-top: 1px solid #e5e7eb;
    background-color: #ffffff;
    display: flex;
    flex-wrap: wrap; /* Allow wrapping for buttons on small screens */
    gap: 0.75rem;
    align-items: center;
}
.input-area input {
    flex-grow: 1;
    padding: 0.75rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 0.75rem;
    outline: none;
    transition: border-color 0.2s;
}
.input-area input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
}
.input-area button {
    padding: 0.75rem 1.5rem;
    background-color: #3b82f6;
    color: white;
    border-radius: 0.75rem;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s, transform 0.1s;
    font-weight: 600;
}
.input-area button:hover:not(:disabled) {
    background-color: #2563eb;
}
.input-area button:active:not(:disabled) {
    transform: scale(0.98);
}
.input-area button:disabled {
    background-color: #93c5fd; /* Light blue for disabled */
    cursor: not-allowed;
}
.loading-indicator {
    text-align: center;
    padding: 1rem;
    color: #6b7280;
    font-style: italic;
}
/* Responsive adjustments */
@media (max-width: 640px) {
    .body-container {
        height: 90vh;
        border-radius: 0.5rem;
    }
    .chat-messages {
        padding: 1rem;
    }
    .input-area {
        padding: 1rem;
        flex-direction: column;
        gap: 0.5rem;
    }
    .input-area input {
        width: 100%;
    }
    .input-area button {
        width: 100%;
    }
}

/* Dark mode styles for elements within the component */
@media (prefers-color-scheme: dark) {
    .body-container {
        background-color: #222222;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    }
    .chat-messages {
        background-color: #2c2c2c;
    }
    .bot-message {
        background-color: #333333; /* Darker grey */
        color: #e0e0e0; /* Lighter text */
    }
    .user-message {
        background-color: #5a8bf7; /* A slightly lighter blue for contrast */
        color: white;
    }
    .input-area {
        background-color: #222222;
        border-top-color: #333333;
    }
    .input-area input {
        background-color: #2c2c2c;
        border-color: #444444;
        color: #f0f0f0;
    }
    .input-area input::placeholder {
        color: #aaaaaa;
    }
    .loading-indicator {
        color: #aaaaaa;
    }
    .title-container h1, .title-container h2, .title-container p {
        color: #e0e0e0; /* Light text for title container in dark mode */
    }
    .title-container small p {
        color: #b0b0b0;
    }
    .title-container a {
        color: #8ab4f8; /* Lighter blue for links in dark mode */
    }
}
</style>
