import { callGemini } from './api.js';

document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll('.content-section');
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    
    function setActiveSection(targetId) {
        contentSections.forEach(section => {
            section.classList.toggle('hidden', section.id !== targetId);
        });
        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.target === targetId);
        });
        window.scrollTo(0, 0);
        if(history.pushState) {
            history.pushState(null, null, '#' + targetId);
        } else {
            window.location.hash = targetId;
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.currentTarget.dataset.target;
            setActiveSection(targetId);
            if (window.innerWidth < 768) {
                sidebar.classList.add('-translate-x-full');
                sidebarOverlay.classList.add('hidden');
            }
        });
    });

    const initialTarget = window.location.hash ? window.location.hash.substring(1) : 'overview';
    const validInitialTarget = document.getElementById(initialTarget) ? initialTarget : 'overview';
    setActiveSection(validInitialTarget);

    function toggleMenu() {
        sidebar.classList.toggle('-translate-x-full');
        sidebarOverlay.classList.toggle('hidden');
    }
    menuToggle.addEventListener('click', toggleMenu);
    sidebarOverlay.addEventListener('click', toggleMenu);

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const icon = header.querySelector('span:last-child');
            const isOpen = content.classList.contains('open');
            content.classList.toggle('open');
            icon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
        });
    });

    document.querySelectorAll('.tabs-container').forEach(container => {
        const tabButtons = container.querySelectorAll('.tab-button');
        const tabContents = container.querySelectorAll('.tab-content');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.dataset.target;
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                tabContents.forEach(content => {
                    content.classList.toggle('active', content.id === targetId);
                });
            });
        });
        if(tabButtons.length > 0) tabButtons[0].click();
    });
    
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', () => {
            const pre = button.closest('.code-block').querySelector('pre');
            const code = pre.querySelector('code').innerText;
            navigator.clipboard.writeText(code).then(() => {
                button.innerText = 'Đã chép!';
                setTimeout(() => {
                    button.innerText = 'Copy';
                }, 2000);
            }).catch(err => { console.error('Failed to copy text: ', err); });
        });
    });
    
    // AI Code Explainer
    document.querySelectorAll('.ai-explain-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const codeId = button.dataset.codeId;
            const codeElement = document.getElementById(codeId);
            const explanationContainer = button.nextElementSibling;
            
            if (codeElement && explanationContainer) {
                const code = codeElement.querySelector('pre code').innerText;
                const prompt = `Với vai trò là một giảng viên lập trình web, hãy giải thích đoạn mã hoặc cấu trúc sau cho một sinh viên Việt Nam mới bắt đầu. Giải thích rõ ràng từng phần, mục đích tổng thể, và tại sao nó lại quan trọng. Sử dụng định dạng markdown đơn giản (dùng **để in đậm**, *để in nghiêng*, và \`để highlight code inline). Nội dung cần giải thích:\n\n\`\`\`\n${code}\n\`\`\``;
                await callGemini(prompt, explanationContainer);
            }
        });
    });

    // AI Assistant Chat
    const chatForm = document.getElementById('ai-chat-form');
    const chatInput = document.getElementById('ai-chat-input');
    const chatContainer = document.getElementById('ai-chat-container');

    if(chatForm) {
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userMessage = chatInput.value.trim();
            if (!userMessage) return;

            const userBubble = document.createElement('div');
            userBubble.className = 'user-chat-bubble p-4 rounded-lg self-end max-w-lg';
            userBubble.textContent = userMessage;
            chatContainer.appendChild(userBubble);
            chatContainer.scrollTop = chatContainer.scrollHeight;

            chatInput.value = '';

            const aiBubble = document.createElement('div');
            aiBubble.className = 'ai-chat-bubble p-4 rounded-lg self-start max-w-lg';
            chatContainer.appendChild(aiBubble);

            const prompt = `Hãy trả lời câu hỏi sau đây từ một sinh viên Việt Nam đang học lập trình web với PHP và MySQL. Giữ câu trả lời ngắn gọn, dễ hiểu, chính xác và tập trung vào câu hỏi. Sử dụng định dạng markdown đơn giản. Câu hỏi: "${userMessage}"`;
            await callGemini(prompt, aiBubble);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        });
    }

    // --- Chart.js Logic ---
    const ctx = document.getElementById('courseStructureChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Nền tảng', 'Thao tác CSDL', 'CRUD', 'MVC', 'Dự án'],
            datasets: [{
                label: 'Phân bổ khóa học',
                data: [15, 20, 35, 20, 10],
                backgroundColor: [
                    'rgba(34, 211, 238, 0.7)',
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(139, 92, 246, 0.7)',
                    'rgba(168, 85, 247, 0.7)',
                    'rgba(217, 70, 239, 0.7)'
                ],
                borderColor: '#0f172a',
                borderWidth: 3,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#cbd5e1', font: { family: "'Readex Pro', sans-serif" } }
                },
                title: {
                    display: true,
                    text: 'Cấu trúc nội dung khóa học (%)',
                    color: '#e2e8f0',
                    font: { size: 16, family: "'Roboto Mono', monospace" }
                }
            }
        }
    });
});