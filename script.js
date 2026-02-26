/**
 * script.js - المنطق الرئيسي للموقع
 * AI HJI Studio - جميع الحقوق محفوظة
 */

// ========== التهيئة والمتغيرات العامة ==========
let uploadedFiles = [];
let chatHistory = [];
let currentDesign = null;
let aiWatermark = null;

// عناصر DOM
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const filesPreview = document.getElementById('filesPreview');
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const previewSection = document.getElementById('previewSection');
const videoPreview = document.getElementById('videoPreview');
const exampleChips = document.querySelectorAll('.example-chip');

// ========== تهيئة الموقع ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('AI HJI Studio - جاهز للعمل');
    
    // تهيئة نظام العلامات المائية
    aiWatermark = new AI_HJI_Watermark();
    
    // إضافة مستمعات الأحداث
    initEventListeners();
    
    // تأثير دخول رائع
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 1.5s ease';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// ========== تهيئة مستمعات الأحداث ==========
function initEventListeners() {
    // رفع الملفات
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary-color)';
        uploadArea.style.background = 'rgba(255, 51, 102, 0.1)';
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = 'var(--border-color)';
        uploadArea.style.background = 'var(--card-bg)';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--border-color)';
        uploadArea.style.background = 'var(--card-bg)';
        handleFiles(e.dataTransfer.files);
    });
    
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
    
    // الدردشة
    sendButton.addEventListener('click', sendMessage);
    
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // الأمثلة السريعة
    exampleChips.forEach(chip => {
        chip.addEventListener('click', () => {
            userInput.value = chip.getAttribute('data-example') || chip.textContent;
            sendMessage();
        });
    });
    
    // أزرار المساعدة
    document.getElementById('helpBtn').addEventListener('click', showHelp);
    document.getElementById('aboutBtn').addEventListener('click', showAbout);
}

// ========== معالجة الملفات المرفوعة ==========
function handleFiles(files) {
    const fileArray = Array.from(files);
    
    fileArray.forEach(file => {
        // التحقق من حجم الملف (حد أقصى 100MB)
        if (file.size > 100 * 1024 * 1024) {
            addAIMessage(`الملف ${file.name} كبير جداً. الحد الأقصى 100MB`);
            return;
        }
        
        uploadedFiles.push(file);
    });
    
    displayFilePreviews();
    addAIMessage(`تم رفع ${fileArray.length} ملف. شكراً! الآن صف لي التصميم اللي تبيه`);
}

// ========== عرض معاينة الملفات ==========
function displayFilePreviews() {
    filesPreview.innerHTML = '';
    
    uploadedFiles.forEach((file, index) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-file';
        
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewItem.innerHTML = `
                    <img src="${e.target.result}" alt="${file.name}">
                    <span class="file-type"><i class="fas fa-image"></i></span>
                `;
            };
            reader.readAsDataURL(file);
        } else if (file.type.startsWith('video/')) {
            previewItem.innerHTML = `
                <i class="fas fa-video" style="font-size: 40px; color: var(--primary-color); margin-top: 25px;"></i>
                <span class="file-type"><i class="fas fa-video"></i></span>
            `;
        }
        
        filesPreview.appendChild(previewItem);
    });
}

// ========== نظام الدردشة الذكي ==========
function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;
    
    // عرض رسالة المستخدم
    addUserMessage(message);
    userInput.value = '';
    
    // معالجة الطلب
    processUserRequest(message);
}

function addUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `
        <div class="message-content">
            <div class="message-sender">أنت</div>
            <div class="message-text">${text}</div>
            <div class="message-time">الآن</div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addAIMessage(text, isTyping = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai-message';
    
    if (isTyping) {
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="message-sender">المصمم AI HJI</div>
                <div class="message-text typing-indicator">
                    <span>.</span><span>.</span><span>.</span>
                </div>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="message-sender">المصمم AI HJI</div>
                <div class="message-text">${text}</div>
                <div class="message-time">الآن</div>
            </div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ========== معالجة طلب المستخدم ==========
async function processUserRequest(message) {
    // إظهار مؤشر الكتابة
    addAIMessage('', true);
    
    // محاكاة تفكير الذكاء الاصطناعي
    setTimeout(() => {
        // إزالة مؤشر الكتابة
        chatMessages.removeChild(chatMessages.lastChild);
        
        // تحليل الطلب
        const response = analyzeRequest(message);
        
        // إضافة الرد
        addAIMessage(response.text);
        
        // إذا كان الطلب يتطلب تصميم، نظهر المعاينة
        if (response.hasDesign) {
            currentDesign = response.design;
            showPreview(response.design);
        }
    }, 2000);
}

// ========== تحليل الطلب ==========
function analyzeRequest(message) {
    const message_lower = message.toLowerCase();
    
    // تحليل نوع الطلب
    if (message_lower.includes('أغنية') || message_lower.includes('music')) {
        return {
            text: '🎵 رائع! سأصمم فيديو أغنية احترافي. اختر النمط المناسب:\n\n1️⃣ رومانسي (قلوب وألوان دافئة)\n2️⃣ حماسي (إضاءات نارية)\n3️⃣ كلاسيك (أبيض وأسود مع لمسات ذهبية)\n\nأخبرني أي نمط تختار؟',
            hasDesign: true,
            design: {
                type: 'music',
                style: 'romantic',
                duration: 30,
                quality: '4K'
            }
        };
    }
    
    if (message_lower.includes('إعلان') || message_lower.includes('ad')) {
        return {
            text: '📺 إعلان فخم! حدد مدة الإعلان:\n\n• 15 ثانية (قصير ومكثف)\n• 30 ثانية (قياسي)\n• 60 ثانية (تفصيلي مع تأثيرات)',
            hasDesign: true,
            design: {
                type: 'ad',
                duration: 30,
                style: 'premium',
                quality: '4K'
            }
        };
    }
    
    if (message_lower.includes('مونتاج') || message_lower.includes('صور')) {
        return {
            text: '🖼️ مونتاج صور رائع! أخبرني عن:\n- نوع المناسبة (عائلية، سفر، حفلة)\n- الموسيقى المفضلة\n- التأثيرات المطلوبة',
            hasDesign: true,
            design: {
                type: 'slideshow',
                transition: 'fade',
                duration: 20,
                quality: '4K'
            }
        };
    }
    
    // رد عام
    return {
        text: '✨ ممتاز! صف لي أكثر ما تبغاه بالضبط:\n- نوع الفيديو (أغنية، إعلان، مونتاج)\n- الألوان المفضلة\n- المدة التقريبية\n- أي تفاصيل إضافية',
        hasDesign: false,
        design: null
    };
}

// ========== عرض المعاينة ==========
function showPreview(design) {
    previewSection.style.display = 'block';
    
    // محاكاة معاينة التصميم
    videoPreview.innerHTML = `
        <div style="position: relative; width: 100%; height: 100%;">
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(45deg, #ff3366, #6c5ce7); opacity: 0.2;"></div>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: white;">
                <i class="fas fa-check-circle" style="font-size: 60px; color: #00b894; margin-bottom: 20px;"></i>
                <h3 style="font-size: 24px; margin-bottom: 10px;">تم تصميم الفيديو بنجاح!</h3>
                <p style="color: rgba(255,255,255,0.7);">النوع: ${design.type} | المدة: ${design.duration} ثانية</p>
                <p style="color: rgba(255,255,255,0.5); font-size: 14px; margin-top: 20px;">
                    <i class="fas fa-copyright"></i> AI HJI - علامة مائية شفافة في الزاوية اليسرى العليا
                </p>
            </div>
        </div>
    `;
    
    // تمرير سلس للمعاينة
    previewSection.scrollIntoView({ behavior: 'smooth' });
}

// ========== تحميل الفيديو ==========
window.downloadVideo = async function(quality) {
    if (!currentDesign) {
        addAIMessage('الرجاء إنشاء تصميم أولاً عن طريق وصف ما تريد');
        return;
    }
    
    addAIMessage(`🎬 جاري تجهيز الفيديو بجودة ${quality} مع العلامة المائية AI HJI...`);
    
    try {
        // محاكاة تحضير الفيديو
        setTimeout(async () => {
            // إنشاء فيديو تجريبي مع العلامة المائية
            const demoVideo = await createDemoVideo(quality);
            
            // إضافة العلامة المائية
            const videoWithWatermark = await aiWatermark.addWatermarkToVideo(demoVideo, quality);
            
            // إضافة بصمة رقمية
            const finalVideo = aiWatermark.addDigitalFingerprint(videoWithWatermark);
            
            // إنشاء رابط التحميل
            const url = URL.createObjectURL(finalVideo.video);
            const link = document.createElement('a');
            link.href = url;
            link.download = `AI_HJI_${quality}_${Date.now()}.mp4`;
            link.click();
            
            // تنظيف
            URL.revokeObjectURL(url);
            
            addAIMessage(`✨ تم التحميل بنجاح! الفيديو بجودة ${quality} جاهز.\n📍 العلامة المائية الشفافة AI HJI في الزاوية اليسرى العليا`);
        }, 3000);
        
    } catch (error) {
        console.error(error);
        addAIMessage('عذراً، حدث خطأ في تجهيز الفيديو. حاول مرة أخرى');
    }
};

// ========== إنشاء فيديو تجريبي ==========
async function createDemoVideo(quality) {
    return new Promise((resolve) => {
        // إنشاء عنصر فيديو تجريبي
        const video = document.createElement('video');
        video.width = quality === '4K' ? 3840 : 1920;
        video.height = quality === '4K' ? 2160 : 1080;
        
        // إنشاء canvas للفيديو التجريبي
        const canvas = document.createElement('canvas');
        canvas.width = video.width;
        canvas.height = video.height;
        
        const ctx = canvas.getContext('2d');
        
        // رسم خلفية متدرجة
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#ff3366');
        gradient.addColorStop(0.5, '#6c5ce7');
        gradient.addColorStop(1, '#00b894');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // رسم نص
        ctx.font = `bold ${canvas.height * 0.1}px 'Cairo', sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.textAlign = 'center';
        ctx.fillText('AI HJI', canvas.width / 2, canvas.height / 2);
        
        // تحويل canvas إلى blob
        canvas.toBlob((blob) => {
            const videoBlob = new Blob([blob], { type: 'video/mp4' });
            resolve(videoBlob);
        }, 'video/mp4');
    });
}

// ========== المساعدة ==========
function showHelp() {
    addAIMessage('🔍 المساعدة:\n\n1. ارفع صور أو فيديو\n2. صف التصميم اللي تبيه\n3. انتظر المعاينة\n4. حمل بجودة HD أو 4K\n\n📍 العلامة المائية AI HJI تضاف تلقائياً في الزاوية اليسرى العليا');
}

// ========== عن الموقع ==========
function showAbout() {
    addAIMessage('🎬 AI HJI Studio\n\nإصدار: 2.0.0\nمنصة تصميم فيديوهات بالذكاء الاصطناعي\nجميع الحقوق محفوظة © 2025\n\n📍 العلامة المائية الشفافة تحمي حقوق الموقع');
}

// ========== تصدير الدوال العامة ==========
window.addAIMessage = addAIMessage;
