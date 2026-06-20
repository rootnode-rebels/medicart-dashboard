document.addEventListener('DOMContentLoaded', initChatbot);
// If loaded dynamically, DOMContentLoaded might have already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initChatbot();
}

function initChatbot() {
  if (document.getElementById('ai-chatbot-container')) return; // Prevent duplicate injection

  const container = document.createElement('div');
  container.id = 'ai-chatbot-container';
  container.innerHTML = `
    <div id="ai-chat-window" class="ai-chat-hidden">
      <div class="ai-chat-header">
        <div class="ai-chat-title">✨ MediCart AI</div>
        <button id="ai-chat-close" aria-label="Close">✖</button>
      </div>
      <div id="ai-chat-messages">
        <div class="ai-message ai-message-system">Hello! I'm your AI assistant. Ask me anything about medicines, side effects, or pharmacy management.</div>
      </div>
      <div class="ai-chat-input-area">
        <input type="text" id="ai-chat-input" placeholder="Ask a question..." autocomplete="off" />
        <button id="ai-chat-send">Send</button>
      </div>
    </div>
    <button id="ai-chat-toggle" title="Chat with AI">✨</button>
  `;
  document.body.appendChild(container);

  const toggleBtn = document.getElementById('ai-chat-toggle');
  const closeBtn = document.getElementById('ai-chat-close');
  const chatWindow = document.getElementById('ai-chat-window');
  const sendBtn = document.getElementById('ai-chat-send');
  const input = document.getElementById('ai-chat-input');
  const messagesArea = document.getElementById('ai-chat-messages');

  toggleBtn.addEventListener('click', () => {
    chatWindow.classList.toggle('ai-chat-hidden');
    if(!chatWindow.classList.contains('ai-chat-hidden')) {
      input.focus();
    }
  });

  closeBtn.addEventListener('click', () => {
    chatWindow.classList.add('ai-chat-hidden');
  });

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    
    // Add user message
    addMessage(text, 'user');
    input.value = '';
    
    // Add loading message
    const loadingId = addMessage('Thinking...', 'system');
    
    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text })
      });
      const data = await res.json();
      
      // Remove loading
      const loadingEl = document.getElementById(loadingId);
      if(loadingEl) loadingEl.remove();
      
      if (data.success) {
        addMessage(data.answer, 'system');
      } else {
        addMessage('Sorry, I encountered an error.', 'error');
      }
    } catch (e) {
      const loadingEl = document.getElementById(loadingId);
      if(loadingEl) loadingEl.remove();
      addMessage('Network error. Please try again.', 'error');
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  function addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = 'ai-message ai-message-' + sender;
    
    // Format text: basic markdown to HTML for bold and lists
    let htmlText = text.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
    htmlText = htmlText.replace(/\\*(.*?)\\*/g, '<em>$1</em>');
    htmlText = htmlText.replace(/\\n/g, '<br>');
    msg.innerHTML = htmlText;
    
    const id = 'msg-' + Date.now() + Math.random().toString(36).substr(2, 5);
    msg.id = id;
    
    messagesArea.appendChild(msg);
    messagesArea.scrollTop = messagesArea.scrollHeight;
    return id;
  }
}
