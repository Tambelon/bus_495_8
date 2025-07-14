/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.innerHTML = "<div class='bot-message'>👋 Hello! How can I help you today?</div>";

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  // Get and trim user input
  const message = userInput.value.trim();
  if (!message) return;
  
  // Add user message to chat
  addMessageToChat(message, 'user');
  
  // Clear input field
  userInput.value = '';
  
  try {
    // Show typing indicator
    const typingIndicator = addTypingIndicator();
    
    // Send message to OpenAI via Cloudflare worker
    const response = await fetch('https://broken-frog.happydylan2.workers.dev/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [{role: "user", content: message}]
      })
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Remove typing indicator and add bot response
    chatWindow.removeChild(typingIndicator);
    if (data.choices && data.choices[0].message.content) {
      addMessageToChat(data.choices[0].message.content, 'bot');
    } else {
      throw new Error('Invalid response format from API');
    }
    
  } catch (error) {
    console.error('Error:', error);
    addMessageToChat("Sorry, I encountered an error. Please try again later.", 'bot');
  }
});

// Helper function to add a message to the chat
function addMessageToChat(message, sender) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add(`${sender}-message`);
  messageDiv.textContent = message;
  chatWindow.appendChild(messageDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Helper function to add typing indicator
function addTypingIndicator() {
  const typingDiv = document.createElement('div');
  typingDiv.classList.add('bot-message');
  typingDiv.textContent = '...';
  typingDiv.id = 'typing-indicator';
  chatWindow.appendChild(typingDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return typingDiv;
}
