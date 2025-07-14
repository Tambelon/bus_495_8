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
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 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'
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
    chatWindow.innerHTML += `<div class='chat-message bot-message error'>An error occurred. Please check your connection and try again.</div>`;
  }
  
  chatWindow.scrollTop = chatWindow.scrollHeight;
});
