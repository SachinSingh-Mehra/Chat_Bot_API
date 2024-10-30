const apiKey = "AIzaSyDHEBetRziHjFnzbBRbSpuFgLe76zaHwFM";

const articles = new Array(60).fill(`
  Nearly two million children may die of malnutrition because a product used to treat the condition is in short supply,
  the United Nations Children’s Fund said on Monday. Four countries — Mali, Nigeria, Niger, and Chad — have exhausted
  their supplies of the peanut-based, high-nutrient product, called ready-to-use therapeutic food, or are on the brink
  of doing so. Another eight nations, including South Sudan, the Democratic Republic of Congo, and Uganda, could run
  out by mid-2025. "Urgent action is needed now to save the lives of nearly two million children who are fighting this
  silent killer," Victor Aguayo, UNICEF’s director for child nutrition and development, said in a statement.
`);

function getCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0'); // Get hours and pad with leading zero
  const minutes = String(now.getMinutes()).padStart(2, '0'); // Get minutes and pad with leading zero
  return `${hours}:${minutes}`;
}

async function fetchResponse() {
  const userInput = document.getElementById('input-value').value;
  const chatContainer = document.getElementById('chatContainer');

  chatContainer.innerHTML += `<div id="user-message" class="message user">
      ${userInput}
      <div id="message-time" class="timestamp">${getCurrentTime()}</div>
  </div>`;

  const requestData = {
      contents: [
          {
              parts: [{ text: userInput }], 
          },
      ],
  };

  try {
      const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify(requestData),
          }
      );

      if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const resultValue = data.candidates[0].content.parts[0].text;

      chatContainer.innerHTML += `<div id="message-response" class="message assistant">
          ${resultValue}
          <div class="actions">
              <span>👍</span> <span>🔄</span>
          </div>
          <div class="timestamp">${getCurrentTime()}</div>
      </div>`;

      document.getElementById('input-value').value = '';

  } catch (error) {
      console.error(error);
      chatContainer.innerHTML += `<div class="error">Failed to get a response. Please try again.</div>`;
  }
}
async function processBatch(startIndex, batchSize) {
  for (
    let i = startIndex;
    i < startIndex + batchSize && i < articles.length;
    i++
  ) {
    const summary = await fetchSummary(articles[i], i);
    document.getElementById("summary").innerText += `Article ${
      i + 1
    } Summary:\n${summary}\n\n`;
  }
}

async function summarizeArticles() {
  const batchSize = 10;
  let startIndex = 0;
  document.getElementById('loader').style.display='block';
  console.log(
    `Processing articles ${startIndex + 1} to ${startIndex + batchSize}`
  );
  await processBatch(startIndex, batchSize);
  startIndex += batchSize;

  const intervalId = setInterval(async () => {
    if (startIndex >= articles.length) {
      clearInterval(intervalId);
      return;
    }

    console.log(
      `Processing articles ${startIndex + 1} to ${startIndex + batchSize}`
    );
    await processBatch(startIndex, batchSize);

    startIndex += batchSize;
  }, 60000);
}
