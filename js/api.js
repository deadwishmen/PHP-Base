// --- Gemini API Integration ---
const API_KEY = ""; // API key sẽ được cung cấp bởi môi trường

async function callGemini(prompt, elementToUpdate) {
    elementToUpdate.innerHTML = `<div class="flex items-center gap-2 text-slate-400"><div class="spinner"></div><span>AI đang phân tích, vui lòng chờ...</span></div>`;
    
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
    
    const payload = {
        contents: [{
            role: "user",
            parts: [{ text: prompt }]
        }]
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error("API Error Response:", errorBody);
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 && result.candidates[0].content) {
            const text = result.candidates[0].content.parts[0].text;
            // Basic markdown to HTML conversion
            let htmlText = text
                .replace(/</g, "&lt;").replace(/>/g, "&gt;") // Escape HTML tags first
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`([^`]+)`/g, '<code class="bg-slate-700 text-cyan-400 rounded px-1 py-0.5 font-mono">$1</code>')
                .replace(/\n/g, '<br>');
            elementToUpdate.innerHTML = htmlText;
        } else {
             elementToUpdate.innerText = "Không nhận được phản hồi hợp lệ từ AI. Phản hồi có thể đã bị chặn.";
             console.log("Invalid AI response:", result);
        }
    } catch (error) {
        console.error("Gemini API call failed:", error);
        elementToUpdate.innerText = "Đã có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại sau.";
    }
}

export { callGemini };