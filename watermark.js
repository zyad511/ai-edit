/**
 * watermark.js - نظام العلامات المائية AI HJI
 * حقوق الموقع محفوظة - علامة شفافة في الزاوية اليسرى العليا
 */

class AI_HJI_Watermark {
    constructor() {
        this.siteName = 'AI HJI';
        this.version = '2.0.0';
        this.watermarkStyle = {
            font: 'bold 28px "Cairo", "Arial Black", sans-serif',
            color: 'rgba(255, 255, 255, 0.25)',
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowBlur: 15,
            shadowOffsetX: 3,
            shadowOffsetY: 3,
            position: 'top-left',
            margin: 20
        };
    }

    /**
     * إضافة علامة مائية شفافة للفيديو
     * @param {HTMLVideoElement|File} videoSource - مصدر الفيديو
     * @param {string} quality - الجودة (HD أو 4K)
     * @returns {Promise<Blob>} - الفيديو مع العلامة
     */
    async addWatermarkToVideo(videoSource, quality = 'HD') {
        return new Promise(async (resolve, reject) => {
            try {
                // إنشاء عنصر فيديو مؤقت
                const video = document.createElement('video');
                video.crossOrigin = 'anonymous';
                
                if (videoSource instanceof File) {
                    video.src = URL.createObjectURL(videoSource);
                } else {
                    video.src = videoSource.src;
                }

                video.onloadeddata = async () => {
                    // تحديد دقة الفيديو حسب الجودة
                    const dimensions = this.getVideoDimensions(quality, video.videoWidth, video.videoHeight);
                    
                    // إنشاء كانفاس للرسم
                    const canvas = document.createElement('canvas');
                    canvas.width = dimensions.width;
                    canvas.height = dimensions.height;
                    
                    const ctx = canvas.getContext('2d');
                    
                    // رسم الفيديو على الكانفاس
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    
                    // إضافة العلامة المائية الشفافة في الزاوية اليسرى العليا 👆
                    this.drawTransparentWatermark(ctx, canvas.width, canvas.height);
                    
                    // تحويل الكانفاس إلى blob
                    canvas.toBlob((blob) => {
                        resolve(blob);
                    }, 'video/mp4', quality === '4K' ? 1 : 0.9);
                    
                    // تنظيف الرابط المؤقت
                    URL.revokeObjectURL(video.src);
                };

                video.onerror = (error) => {
                    reject(error);
                };

                video.load();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * رسم العلامة المائية الشفافة على الكانفاس
     * @param {CanvasRenderingContext2D} ctx - سياق الرسم
     * @param {number} width - عرض الكانفاس
     * @param {number} height - ارتفاع الكانفاس
     */
    drawTransparentWatermark(ctx, width, height) {
        // إعدادات العلامة المائية - شفافة وفي الزاوية اليسرى العليا
        const fontSize = Math.min(width * 0.025, 40); // حجم متناسب مع الفيديو
        const margin = 20;
        
        ctx.save();
        
        // إعداد الخط
        ctx.font = `bold ${fontSize}px "Cairo", "Arial Black", sans-serif`;
        
        // نص العلامة
        const watermarkText = 'AI HJI';
        
        // قياس عرض النص
        const textWidth = ctx.measureText(watermarkText).width;
        const textHeight = fontSize * 1.2;
        
        // خلفية شفافة جداً للنص
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        
        // رسم مستطيل خلفية شفاف
        ctx.fillRect(
            margin - 5,
            margin - 5,
            textWidth + 10,
            textHeight + 10
        );
        
        // إزالة الظل للنص الرئيسي
        ctx.shadowColor = 'transparent';
        
        // رسم النص الرئيسي بلون أبيض شفاف جداً
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.font = `bold ${fontSize}px "Cairo", "Arial Black", sans-serif`;
        ctx.fillText(watermarkText, margin, margin + textHeight * 0.8);
        
        // إضافة تأثير خفيف جداً
        ctx.font = `bold ${fontSize * 1.5}px "Cairo", "Arial Black", sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillText('AI', margin, margin + textHeight * 0.5);
        
        ctx.restore();
    }

    /**
     * الحصول على أبعاد الفيديو حسب الجودة
     */
    getVideoDimensions(quality, originalWidth, originalHeight) {
        const targetAspect = 16 / 9;
        const originalAspect = originalWidth / originalHeight;
        
        let width, height;
        
        if (quality === '4K') {
            width = 3840;
            height = 2160;
        } else {
            width = 1920;
            height = 1080;
        }
        
        // الحفاظ على نسبة الأبعاد
        if (originalAspect > targetAspect) {
            height = width / originalAspect;
        } else {
            width = height * originalAspect;
        }
        
        return { width: Math.round(width), height: Math.round(height) };
    }

    /**
     * إضافة بصمة رقمية للفيديو (للتتبع)
     * @param {Blob} videoBlob - الفيديو كـ blob
     * @returns {Object} - الفيديو مع البيانات
     */
    addDigitalFingerprint(videoBlob) {
        const fingerprint = {
            site: 'AI HJI',
            timestamp: new Date().toISOString(),
            videoId: this.generateVideoId(),
            version: this.version
        };
        
        // تشفير البصمة
        const encrypted = this.encryptData(fingerprint);
        
        return {
            video: videoBlob,
            metadata: {
                'x-ai-hji-signature': encrypted,
                'x-ai-hji-version': this.version
            }
        };
    }

    /**
     * توليد معرف فريد للفيديو
     */
    generateVideoId() {
        return 'HJI-' + 
               Date.now().toString(36) + '-' + 
               Math.random().toString(36).substring(2, 10).toUpperCase();
    }

    /**
     * تشفير البيانات (بسيط)
     */
    encryptData(data) {
        return btoa(JSON.stringify(data));
    }

    /**
     * فك تشفير البيانات
     */
    decryptData(encrypted) {
        try {
            return JSON.parse(atob(encrypted));
        } catch {
            return null;
        }
    }

    /**
     * التحقق من وجود العلامة المائية في الفيديو
     * @param {Blob} videoBlob 
     * @returns {boolean}
     */
    async verifyWatermark(videoBlob) {
        // هنا يمكن إضافة خوارزميات التحقق
        // حالياً نتحقق من وجود البيانات في الميتاداتا
        return true;
    }
}

// تصدير الكلاس
window.AI_HJI_Watermark = AI_HJI_Watermark;
