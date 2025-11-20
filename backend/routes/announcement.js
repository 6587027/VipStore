// backend/routes/announcement.js
const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');

// ✅ GET: ดึงข้อมูล Announcement (จะมีแค่ 1 อันเสมอที่เป็น Global Config)
router.get('/', async (req, res) => {
  try {
    // หาข้อมูลตัวแรกสุดใน Database
    let announcement = await Announcement.findOne();

    // ถ้ายังไม่มี (เพิ่งรันระบบครั้งแรก) ให้สร้างค่า Default ขึ้นมา
    if (!announcement) {
      announcement = await Announcement.create({
        active: false,
        title: 'Welcome',
        content: 'Welcome to VipStore',
        priority: 'green',
        mode: 'toast',
        lastUpdated: Date.now()
      });
    }

    res.json({ success: true, data: announcement });
  } catch (error) {
    console.error('Error fetching announcement:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// ✅ PUT: อัปเดตข้อมูล (สำหรับ Admin กด Save)
router.put('/', async (req, res) => {
  try {
    const { active, title, content, priority, mode, lastUpdated } = req.body;

    // หาตัวเดิมแล้วแก้ หรือถ้าไม่มีให้สร้างใหม่ (upsert: true)
    const announcement = await Announcement.findOneAndUpdate(
      {}, // เงื่อนไขการหา (เอาตัวไหนก็ได้ เพราะมีตัวเดียว)
      {
        active,
        title,
        content,
        priority,
        mode,
        lastUpdated: lastUpdated || Date.now() // ถ้าไม่ส่งเวลามา ให้ใช้เวลาปัจจุบัน
      },
      { new: true, upsert: true } // options: คืนค่าใหม่กลับไป, ถ้าไม่มีให้สร้าง
    );

    res.json({ success: true, data: announcement });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;