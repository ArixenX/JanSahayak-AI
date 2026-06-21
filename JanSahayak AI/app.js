const GEMINI_API_KEY = 'REPLACE_WITH_YOUR_API_KEY';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// Translation Dictionary 
const translations = {
    en: {
        heroBadge: "GovTech Innovation", heroTitle: "Smart Citizen, Smarter Access.", heroSub: "Instantly discover eligible government schemes and verify your documentation with our AI engine.",
        schemeTitle: "Scheme Discovery Engine", schemeSub: "AI matches your profile with 1000+ state & central schemes.", btnAnalyze: "Analyze My Profile",
        docTitle: "Document Readiness", docSub: "Check if you have the essential paperwork ready.", btnCalc: "Evaluate Documents"
    },
    hi: {
        heroBadge: "गवर्नमेंट-टेक इनोवेशन", heroTitle: "स्मार्ट नागरिक, स्मार्ट एक्सेस।", heroSub: "तुरंत योग्य सरकारी योजनाओं की खोज करें और एआई के साथ अपने दस्तावेज़ सत्यापित करें।",
        schemeTitle: "योजना खोज इंजन", schemeSub: "एआई आपके प्रोफाइल को 1000+ योजनाओं से मिलाता है।", btnAnalyze: "प्रोफाइल एनालाइज करें",
        docTitle: "दस्तावेज़ की तैयारी", docSub: "जांचें कि क्या आपके पास आवश्यक कागजी कार्रवाई तैयार है।", btnCalc: "दस्तावेजों का मूल्यांकन करें"
    },
    bn: {
        heroBadge: "গভটেক ইনোভেশন", heroTitle: "স্মার্ট নাগরিক, স্মার্ট অ্যাক্সেস।", heroSub: "তাত্ক্ষণিকভাবে যোগ্য সরকারি স্কিমগুলি আবিষ্কার করুন এবং আমাদের এআই ইঞ্জিন দিয়ে আপনার ডকুমেন্টেশন যাচাই করুন।",
        schemeTitle: "স্কিম ডিসকভারি ইঞ্জিন", schemeSub: "এআই আপনার প্রোফাইলকে 1000+ স্কিমের সাথে মেলে।", btnAnalyze: "আমার প্রোফাইল বিশ্লেষণ করুন",
        docTitle: "নথির প্রস্তুতি", docSub: "আপনার প্রয়োজনীয় কাগজপত্র প্রস্তুত আছে কিনা তা পরীক্ষা করুন।", btnCalc: "নথি মূল্যায়ন করুন"
    }
};

let currentLang = 'en';

// Language Switcher
document.getElementById('langSwitch').addEventListener('change', (e) => {
    currentLang = e.target.value;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang] && translations[currentLang][key]) el.innerHTML = translations[currentLang][key];
    });
});

// Theme Switcher
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    const html = document.documentElement;
    html.setAttribute('data-theme', html.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
    themeToggle.innerText = html.getAttribute('data-theme') === 'light' ? '🌙' : '☀️';
});

// Utility: Button Loading State
function setButtonLoading(btnId, isLoading) {
    const btn = document.getElementById(btnId);
    if (isLoading) {
        btn.classList.add('is-loading');
        btn.querySelector('.btn-text').innerText = 'Processing via AI...';
    } else {
        btn.classList.remove('is-loading');
        // Reset progress bar width instantly visually
        const pb = btn.querySelector('.progress-bar');
        pb.style.animation = 'none';
        pb.style.width = '100%';
        setTimeout(() => { pb.style.width = '0%'; pb.style.animation = ''; }, 300);

        const originalText = document.getElementById(btnId).querySelector('.btn-text').getAttribute('data-i18n');
        btn.querySelector('.btn-text').innerText = translations[currentLang][originalText] || (btnId === 'btn-discover' ? 'Analyze My Profile' : 'Evaluate Documents');
    }
}

// 1. AI Scheme Discovery
document.getElementById('schemeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    setButtonLoading('btn-discover', true);

    const profile = {
        name: document.getElementById('name').value, state: document.getElementById('state').value,
        age: document.getElementById('age').value, occupation: document.getElementById('occupation').value,
        income: document.getElementById('income').value
    };

    const prompt = `You are a professional Indian Government Scheme Advisor. Profile: ${JSON.stringify(profile)}.
    Provide exactly 3 highly relevant government schemes. 
    CRITICAL RULES:
    1. Output MUST BE strictly clean HTML. NO markdown, NO backticks.
    2. LINK RULE: If you know the EXACT official application URL for the scheme (e.g., https://pmkisan.gov.in/), include the link tag. If you are NOT 100% sure of the exact specific link, DO NOT include the <a> tag at all. NEVER use generic fallback links.
    3. Format EACH scheme EXACTLY like this:
    <div class="scheme-card">
        <h3>[Scheme Name]</h3>
        <h4>Eligibility Details:</h4>
        <ul>
            <li>[Point 1]</li>
            <li>[Point 2]</li>
        </ul>
        <h4>Key Benefits:</h4>
        <ul>
            <li>[Benefit 1]</li>
        </ul>
        <a href="[EXACT_URL]" target="_blank" class="official-link">Apply / Official Site ➔</a>
    </div>
    Respond in ${currentLang === 'hi' ? 'Hindi' : currentLang === 'bn' ? 'Bengali' : 'English'}.`;
    try {
        const response = await callGemini(prompt);
        const resultsDiv = document.getElementById('recommendation-results');
        resultsDiv.innerHTML = response;
        resultsDiv.classList.remove('hidden');
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
        alert('API Error. Check console.');
    } finally {
        setButtonLoading('btn-discover', false);
    }
});

// 2. Document Readiness Checker
document.getElementById('btn-check-docs').addEventListener('click', async () => {
    const checkedBoxes = document.querySelectorAll('.doc-check:checked');
    if (checkedBoxes.length === 0) { alert("Please select at least one document."); return; }

    setButtonLoading('btn-check-docs', true);
    const availableDocs = Array.from(checkedBoxes).map(cb => cb.value);

    const prompt = `A citizen in India has these documents: ${availableDocs.join(', ')}.
    Analyze readiness for basic government welfare schemes.
    RULES: Output ONLY clean HTML, no markdown. Format:
    <div class="scheme-card">
        <h3>Document Readiness Score: [Insert %]</h3>
        <h4>Crucial Missing Documents:</h4>
        <ul><li>[Missing Doc 1] - [Why it's needed]</li></ul>
        <h4>Next Steps:</h4>
        <ul><li>[Actionable Step]</li></ul>
    </div>
    Respond in ${currentLang === 'hi' ? 'Hindi' : currentLang === 'bn' ? 'Bengali' : 'English'}.`;

    try {
        const response = await callGemini(prompt);
        const resultsDiv = document.getElementById('readiness-results');
        resultsDiv.innerHTML = response;
        resultsDiv.classList.remove('hidden');
    } catch (error) {
        alert('API Error.');
    } finally {
        setButtonLoading('btn-check-docs', false);
    }
});

// Gemini API Connector
async function callGemini(promptText) {
    const response = await fetch(GEMINI_API_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
    });
    const data = await response.json();
    return data.candidates[0].content.parts[0].text.replace(/```html/g, '').replace(/```/g, '');
}

// --- Floating AI Chat Widget Logic ---
const chatToggleBtn = document.getElementById('chat-toggle-btn');
const chatWindow = document.getElementById('chat-widget-window');
const chatCloseBtn = document.getElementById('chat-close-btn');
const chatSendBtn = document.getElementById('chat-widget-send-btn');
const chatInput = document.getElementById('chat-widget-input-text');
const chatBody = document.getElementById('chat-widget-body');

// Toggle Chat Window
if(chatToggleBtn && chatCloseBtn) {
    chatToggleBtn.addEventListener('click', () => {
        chatWindow.classList.remove('hidden');
        chatToggleBtn.style.display = 'none';
    });

    chatCloseBtn.addEventListener('click', () => {
        chatWindow.classList.add('hidden');
        chatToggleBtn.style.display = 'flex';
    });
}

// Handle Sending Message
if(chatSendBtn && chatInput) {
    chatSendBtn.addEventListener('click', handleChatMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleChatMessage();
    });
}

async function handleChatMessage() {
    const msg = chatInput.value.trim();
    if (!msg) return;

    // Add User Message
    chatBody.innerHTML += `<div class="chat-message user-message">${msg}</div>`;
    chatInput.value = '';
    chatBody.scrollTop = chatBody.scrollHeight;

    // Add Loading Indicator
    const loadingId = 'loading-' + Date.now();
    chatBody.innerHTML += `<div class="chat-message ai-message" id="${loadingId}">Thinking...</div>`;
    chatBody.scrollTop = chatBody.scrollHeight;

    // Gemini API Prompt for Guidance
    const prompt = `You are JanSahayak, an AI assistant for Indian citizens. 
    User question: "${msg}"
    Task: Provide clear, concise, and factual guidance. 
    Rules: 
    1. Use simple bullet points if explaining steps. 
    2. Keep it under 4-5 sentences.
    3. Output plain HTML (use <ul>, <li>, <strong>) with NO markdown backticks.
    Respond strictly in ${currentLang === 'hi' ? 'Hindi' : currentLang === 'bn' ? 'Bengali' : 'English'}.`;

    try {
        const response = await callGemini(prompt);
        document.getElementById(loadingId).remove();
        chatBody.innerHTML += `<div class="chat-message ai-message">${response}</div>`;
    } catch (error) {
        if(document.getElementById(loadingId)) document.getElementById(loadingId).remove();
        chatBody.innerHTML += `<div class="chat-message ai-message">Sorry, I am facing network issues. Please try again.</div>`;
    }
    chatBody.scrollTop = chatBody.scrollHeight;
}