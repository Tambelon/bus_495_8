/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.innerHTML = "<div class='chat-message bot-message'>👋 Hello! How can I help you today?</div>";

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const message = userInput.value.trim();
  if (!message) return;
  
  // Add user message to chat
  addMessageToChat(message, 'user');
  
  // Clear input
  userInput.value = '';
  
  // Show loading indicator
  const loadingId = showLoadingIndicator();
  
  try {
    // Send message to Cloudflare worker (which will proxy to OpenAI)
    const response = await fetch('https://broken-frog.happydylan2.workers.dev', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message
      })
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Remove loading indicator
    removeLoadingIndicator(loadingId);
    
    // Add bot response to chat
    if (data.reply) {
      addMessageToChat(data.reply, 'bot');
    } else {
      throw new Error('No reply in response');
    }
  } catch (error) {
    // Remove loading indicator
    removeLoadingIndicator(loadingId);
    
    // Show error message
    addMessageToChat(`Sorry, I encountered an error: ${error.message}`, 'bot');
    console.error('Chat error:', error);
  }
});

// Helper function to add a message to the chat
function addMessageToChat(message, sender) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('chat-message', `${sender}-message`);
  messageElement.textContent = message;
  chatWindow.appendChild(messageElement);
  
  // Scroll to bottom
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Helper function to show loading indicator
function showLoadingIndicator() {
  const id = 'loading-' + Date.now();
  const loadingElement = document.createElement('div');
  loadingElement.id = id;
  loadingElement.classList.add('chat-message', 'bot-message', 'loading');
  loadingElement.textContent = '...';
  chatWindow.appendChild(loadingElement);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return id;
}

// Helper function to remove loading indicator
function removeLoadingIndicator(id) {
  const element = document.getElementById(id);
  if (element) {
    element.remove();
  }
}
