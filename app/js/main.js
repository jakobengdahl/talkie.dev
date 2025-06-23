const userPromptEl = document.getElementById("user-prompt");
const chatMessagesEl = document.getElementById("chat-messages");
const sendPromptForm = document.getElementById("send-prompt");

function appendMessage(sender, text) {
  const div = document.createElement("div");
  div.className = "message";
  div.textContent = `${sender}: ${text}`;
  chatMessagesEl.appendChild(div);
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

async function sendPrompt(promptText) {
  const apiKey = sessionStorage.getItem("OPENAI_API_KEY");

  if (!apiKey) {
    appendMessage("System", "Ingen API-nyckel angiven.");
    return;
  }

  appendMessage("Du", promptText);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "Du är Agent Echo, en hjälpsam teknisk guide från NullTrace." },
          { role: "user", content: promptText }
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim();

    if (reply) {
      appendMessage("Agent Echo", reply);
    } else {
      appendMessage("Agent Echo", "Inget svar mottogs från modellen.");
    }

  } catch (error) {
    console.error(error);
    appendMessage("System", "Något gick fel vid kontakt med OpenAI.");
  }
}

// Skicka prompt vid formulärsubmit
sendPromptForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = userPromptEl.value.trim();
  if (text) {
    userPromptEl.value = "";
    sendPrompt(text);
  }
});

// Initiera om det kommer en första prompt från prompt.js
window.addEventListener("injectPrompt", (event) => {
  const prompt = event.detail;
  if (prompt) {
    sendPrompt(prompt);
  }
});
