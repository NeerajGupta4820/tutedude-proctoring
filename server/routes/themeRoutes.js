import express from 'express';
import ThemeSettings from '../models/ThemeSettingsSchema.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Get theme settings for current user
router.get('/', requireAuth, async (req, res) => {
  try {
    let settings = await ThemeSettings.findOne({ userId: req.user.id });

    if (!settings) {
      // Return default theme if no settings exist
      settings = {
        selectedTheme: 'midnight',
        customColors: {
          primary: '#0891b2',
          secondary: '#7c3aed',
          background: '#0f172a',
          surface: '#1e293b',
          accent: '#22d3ee',
          text: '#f8fafc',
          textMuted: '#94a3b8',
        },
        useCustomColors: false,
      };
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching theme settings:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch theme settings' });
  }
});

// Save theme settings
router.post('/', requireAuth, async (req, res) => {
  try {
    const { selectedTheme, customColors, useCustomColors } = req.body;

    const settings = await ThemeSettings.findOneAndUpdate(
      { userId: req.user.id },
      {
        selectedTheme,
        customColors,
        useCustomColors,
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: settings,
      message: 'Theme settings saved successfully',
    });
  } catch (error) {
    console.error('Error saving theme settings:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to save theme settings' });
  }
});

// Get theme for interview room (public - by admin ID or meeting ID)
router.get('/public/:adminId', async (req, res) => {
  try {
    console.log('🎨 Fetching public theme for adminId:', req.params.adminId);

    const settings = await ThemeSettings.findOne({
      userId: req.params.adminId,
    });

    console.log(
      '🎨 Found settings:',
      settings ? settings.selectedTheme : 'default'
    );

    if (!settings) {
      return res.json({
        success: true,
        data: {
          selectedTheme: 'midnight',
          customColors: {
            primary: '#0891b2',
            secondary: '#7c3aed',
            background: '#0f172a',
            surface: '#1e293b',
            accent: '#22d3ee',
            text: '#f8fafc',
            textMuted: '#94a3b8',
          },
          useCustomColors: false,
        },
      });
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching public theme:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch theme' });
  }
});

export default router;
