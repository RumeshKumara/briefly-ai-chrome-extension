document.getElementById("summarize").addEventListener("click", async () => {
  const summaryContent = document.getElementById("summary-content");
  const copyBtn = document.getElementById("copy-btn");

  // Hide copy button while loading
  copyBtn.style.display = "none";

  summaryContent.innerHTML = '<div class="loading"><div class="loader"></div></div>';

  const summaryType = document.getElementById("summary-type").value;

  // Get API key from storage
  chrome.storage.sync.get(["geminiApiKey"], async (result) => {
    if (!result.geminiApiKey) {
      summaryContent.innerHTML =
        "API key not found. Please set your API key in the extension options.";
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.tabs.sendMessage(
        tab.id,
        { type: "GET_ARTICLE_TEXT" },
        async (res) => {
          if (!res || !res.text) {
            summaryContent.innerText =
              "Could not extract article text from this page.";
            return;
          }

          try {
            const summary = await getGeminiSummary(
              res.text,
              summaryType,
              result.geminiApiKey
            );
            summaryContent.innerHTML = formatSummary(summary, summaryType);

            // Show copy button after summary is generated
            copyBtn.style.display = "block";
          } catch (error) {
            summaryContent.innerText = `Error: ${error.message || "Failed to generate summary."
              }`;
            // Hide copy button on error
            copyBtn.style.display = "none";
          }
        }
      );
    });
  });
});

// Format summary with HTML and modern styling
function formatSummary(summary, summaryType) {
  if (summaryType === "detailed") {
    // Replace emoji headers with styled HTML
    let formatted = summary
      .replace(/📌\s*OVERVIEW/gi, '<div class="summary-section"><div class="section-header overview">📌 OVERVIEW</div>')
      .replace(/🔑\s*KEY INSIGHTS/gi, '</div><div class="summary-section"><div class="section-header insights">🔑 KEY INSIGHTS</div>')
      .replace(/💡\s*TAKEAWAYS/gi, '</div><div class="summary-section"><div class="section-header takeaways">💡 TAKEAWAYS</div>');

    // Close the last section
    if (formatted.includes('summary-section')) {
      formatted += '</div>';
    }

    // Wrap paragraphs
    formatted = formatted.replace(/\n\n/g, '</p><p class="summary-text">');
    formatted = '<p class="summary-text">' + formatted + '</p>';

    return formatted;
  } else if (summaryType === "bullets") {
    // Format bullet points with modern styling
    let formatted = summary
      .split('\n')
      .map(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
          // Remove bullet symbols and wrap in styled div
          const text = trimmed.replace(/^[•\-*]\s*/, '');
          return text ? `<div class="bullet-point"><span class="bullet">●</span><span class="bullet-text">${text}</span></div>` : '';
        }
        return trimmed ? `<p class="summary-text">${trimmed}</p>` : '';
      })
      .filter(line => line !== '')
      .join('');

    return formatted || summary;
  } else {
    // Brief or default - simple paragraph formatting
    return `<p class="summary-text">${summary.replace(/\n\n/g, '</p><p class="summary-text">')}</p>`;
  }
}

document.getElementById("copy-btn").addEventListener("click", () => {
  const summaryContent = document.getElementById("summary-content");

  // Extract plain text from HTML content
  const summaryText = summaryContent.innerText || summaryContent.textContent;

  if (summaryText && summaryText.trim() !== "") {
    navigator.clipboard
      .writeText(summaryText)
      .then(() => {
        const copyBtn = document.getElementById("copy-btn");
        const originalText = copyBtn.innerText;

        copyBtn.innerText = "Copied!";
        setTimeout(() => {
          copyBtn.innerText = originalText;
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  }
});

async function getGeminiSummary(text, summaryType, apiKey) {
  // Truncate very long texts to avoid API limits (typically around 30K tokens)
  const maxLength = 20000;
  const truncatedText =
    text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

  let prompt;
  switch (summaryType) {
    case "brief":
      prompt = `You are a modern content curator creating engaging summaries. Provide a brief, punchy summary of the following article in 2-3 sentences. Make it clear, compelling, and easy to understand. Use active voice and present tense where appropriate:\n\n${truncatedText}`;
      break;
    case "detailed":
      prompt = `You are a modern content curator creating comprehensive summaries. Provide a detailed, well-structured summary of the following article. Use the following format:

📌 OVERVIEW
[A compelling 1-2 sentence overview]

🔑 KEY INSIGHTS
[Cover all main points with clear explanations, organized logically]

💡 TAKEAWAYS
[2-3 practical takeaways or conclusions]

Make it engaging, informative, and easy to scan. Use clear language and maintain a modern, professional tone:\n\n${truncatedText}`;
      break;
    case "bullets":
      prompt = `You are a modern content curator creating scannable summaries. Extract the most important insights from the following article and present them as 5-7 bullet points.

Format each point as:
• [Concise, impactful statement of the key insight]

Requirements:
- Start each bullet with "•" (bullet symbol)
- Keep each point to 1-2 sentences maximum
- Use active voice and clear language
- Make each point standalone and actionable
- Focus on the most valuable insights
- Use modern, engaging language

Article to summarize:\n\n${truncatedText}`;
      break;
    default:
      prompt = `You are a modern content curator. Create a clear, engaging summary of the following article. Make it informative and easy to understand, using modern language and active voice:\n\n${truncatedText}`;
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
          },
        }),
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error?.message || "API request failed");
    }

    const data = await res.json();
    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No summary available."
    );
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate summary. Please try again later.");
  }
}