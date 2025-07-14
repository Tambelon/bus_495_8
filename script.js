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
  chatWindow.innerHTML += `<div class='chat-message user-message'>${message}</div>`;
  userInput.value = '';
  
  // Show typing indicator
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'chat-message bot-message typing';
  typingIndicator.textContent = '...';
  chatWindow.appendChild(typingIndicator);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  
  try {
    // Call Cloudflare Worker which will proxy to OpenAI API
    const response = await fetch('https://broken-frog.happydylan2.workers.dev/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'user',
          content: message
        }],
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Remove typing indicator
    chatWindow.removeChild(typingIndicator);
    
    // Add bot response to chat
    if (data.choices && data.choices[0].message) {
      const botResponse = data.choices[0].message.content;
      chatWindow.innerHTML += `<div class='chat-message bot-message'>${botResponse}</div>`;
    } else {
      chatWindow.innerHTML += `<div class='chat-message bot-message error'>Sorry, I couldn't process your request. Please try again.</div>`;
    }
  } catch (error) {
    console.error('Error:', error);
    chatWindow.removeChild(typingIndicator);
    chatWindow.innerHTML += `<div class='chat-message bot-message error'>An error occurred: ${error.message}</div>`;
  }
  
  chatWindow.scrollTop = chatWindow.scrollHeight;
});
