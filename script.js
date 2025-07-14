/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Cloudflare Worker endpoint
const CLOUDFLARE_WORKER_URL = "https://broken-frog.happydylan2.workers.dev/";

// Set initial message
chatWindow.innerHTML = "<div class='chat-message bot-message'>👋 Hello! How can I help you today?</div>";

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const message = userInput.value.trim();
  if (!message) return;
  
  // Add user message to chat
  chatWindow.innerHTML += `<div class='chat-message user-message'>You: ${message}</div>`;
  userInput.value = '';
  
  // Show typing indicator
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'chat-message bot-message typing';
  typingIndicator.textContent = 'AI is typing...';
  chatWindow.appendChild(typingIndicator);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  
  try {
    // Call Cloudflare Worker endpoint
    const response = await fetch(CLOUDFLARE_WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message,  // Simplified format for Worker
        model: 'gpt-3.5-turbo'  // Optional: specify model
      })
    });
    
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Remove typing indicator
    chatWindow.removeChild(typingIndicator);
    
    // Add bot response to chat
    if (data.response) {
      chatWindow.innerHTML += `<div class='chat-message bot-message'>AI: ${data.response}</div>`;
    } else {
      chatWindow.innerHTML += `<div class='chat-message bot-message error'>Error: No response from AI</div>`;
    }
  } catch (error) {
    console.error('Error:', error);
    chatWindow.removeChild(typingIndicator);
    chatWindow.innerHTML += `<div class='chat-message bot-message error'>Error: ${error.message}</div>`;
  }
  
  chatWindow.scrollTop = chatWindow.scrollHeight;
});
