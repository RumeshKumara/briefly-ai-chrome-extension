// Tab Navigation Functionality
document.addEventListener("DOMContentLoaded", () => {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remove active class from all buttons and contents
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // Add active class to clicked button
      btn.classList.add("active");

      // Show corresponding tab content
      const tabId = btn.getAttribute("data-tab") + "-tab";
      document.getElementById(tabId).classList.add("active");

      // Load history when History tab is clicked
      if (btn.getAttribute("data-tab") === "history") {
        loadHistory();
      }
    });
  });

  // Load history on initial load
  loadHistory();

  // Clear history button
  document.getElementById("clear-history-btn").addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all history?")) {
      chrome.storage.local.set({ summaryHistory: [] }, () => {
        loadHistory();
      });
    }
  });
});

// Load and display history
function loadHistory() {
  chrome.storage.local.get(["summaryHistory"], (result) => {
    const history = result.summaryHistory || [];
    const historyList = document.getElementById("history-list");

    if (history.length === 0) {
      historyList.innerHTML = '<p class="empty-state">No history yet. Generate your first summary!</p>';
      return;
    }

    historyList.innerHTML = history
      .map((item, index) => {
        const date = new Date(item.timestamp);
        const formattedDate = formatDate(date);
        const preview = stripHtml(item.summary).substring(0, 120) + "...";

        return `
          <div class="history-item" data-index="${index}">
            <div class="history-item-title">${item.title || "Untitled Summary"}</div>
            <div class="history-item-preview">${preview}</div>
            <div class="history-item-meta">
              <span class="history-item-date">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                ${formattedDate}
              </span>
              <span class="history-item-type">${formatType(item.type)}</span>
            </div>
          </div>
        `;
      })
      .join("");

    // Add click handlers to history items
    document.querySelectorAll(".history-item").forEach((item) => {
      item.addEventListener("click", () => {
        const index = item.getAttribute("data-index");
        viewHistoryItem(history[index]);
      });
    });
  });
}

// View a history item
function viewHistoryItem(item) {
  // Switch to summarize tab
  document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach((content) => content.classList.remove("active"));

  document.querySelector('[data-tab="summarize"]').classList.add("active");
  document.getElementById("summarize-tab").classList.add("active");

  // Display the summary
  const summaryContent = document.getElementById("summary-content");
  const copyBtn = document.getElementById("copy-btn");

  summaryContent.innerHTML = item.summary;
  copyBtn.style.display = "block";
}

// Save summary to history
function saveToHistory(title, summary, type) {
  chrome.storage.local.get(["summaryHistory"], (result) => {
    const history = result.summaryHistory || [];

    // Add new item to beginning of array
    history.unshift({
      title: title,
      summary: summary,
      type: type,
      timestamp: Date.now()
    });

    // Keep only last 50 items
    const trimmedHistory = history.slice(0, 50);

    chrome.storage.local.set({ summaryHistory: trimmedHistory });
  });
}

// Helper function to format date
function formatDate(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

// Helper function to format type
function formatType(type) {
  const types = {
    brief: "Brief",
    detailed: "Detailed",
    bullets: "Bullets"
  };
  return types[type] || "Brief";
}

// Helper function to strip HTML tags
function stripHtml(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

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
            const formattedSummary = formatSummary(summary, summaryType);
            summaryContent.innerHTML = formattedSummary;

            // Save to history
            chrome.tabs.query({ active: true, currentWindow: true }, ([currentTab]) => {
              const pageTitle = currentTab.title || "Untitled Page";
              saveToHistory(pageTitle, formattedSummary, summaryType);
            });

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