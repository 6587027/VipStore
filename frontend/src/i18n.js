import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 1. Import ไฟล์ JSON ของเรา
import translationTH from './locales/th.json';
import translationEN from './locales/en.json';

// 2. กำหนดค่า resources (i18next จะอ่าน key 'translation' ภายในไฟล์เองครับ)
const resources = {
  th: translationTH,
  en: translationEN
};

// 3. 🌟 นี่คือส่วนสำคัญที่ขาดไป: การ Initialize 🌟
i18n
  .use(initReactI18next) // ส่ง i18n instance ไปให้ react-i18next
  .init({
    resources,        // ไฟล์คำแปล
    lng: 'th',        // ภาษาเริ่มต้น
    fallbackLng: 'th', // ภาษาสำรอง ถ้าหาคำแปลในภาษาที่เลือกไม่เจอ
    
    interpolation: {
      escapeValue: false // React จัดการเรื่อง XSS (Cross-site scripting) ให้อยู่แล้ว
    }
  });

export default i18n;