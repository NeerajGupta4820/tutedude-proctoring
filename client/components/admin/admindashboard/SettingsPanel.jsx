import React, { useState, useEffect } from 'react';
import { 
  FaPalette, 
  FaSave, 
  FaCheck, 
  FaUndo, 
  FaMicrophone, 
  FaVideo, 
  FaUser,
  FaEye
} from 'react-icons/fa';
import { HiSparkles, HiColorSwatch, HiRefresh } from 'react-icons/hi';
import { useTheme, THEMES } from '../../../context/ThemeContext';

const SettingsPanel = () => {
  const { 
    selectedTheme, 
    setSelectedTheme, 
    customColors, 
    setCustomColors, 
    useCustomColors, 
    setUseCustomColors,
    saveThemeSettings,
    currentColors 
  } = useTheme();

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [localCustomColors, setLocalCustomColors] = useState(customColors);
  const [activeTab, setActiveTab] = useState('themes');

  useEffect(() => {
    setLocalCustomColors(customColors);
  }, [customColors]);

  const handleSave = async () => {
    setSaving(true);
    setCustomColors(localCustomColors);
    const success = await saveThemeSettings();
    setSaving(false);
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleColorChange = (key, value) => {
    setLocalCustomColors(prev => ({ ...prev, [key]: value }));
  };

  const resetToThemeDefaults = () => {
    setLocalCustomColors(THEMES[selectedTheme].colors);
    setUseCustomColors(false);
  };

  const colorLabels = {
    primary: { label: 'Primary', desc: 'Main accent color' },
    secondary: { label: 'Secondary', desc: 'Supporting color' },
    background: { label: 'Background', desc: 'Page background' },
    surface: { label: 'Surface', desc: 'Cards & panels' },
    accent: { label: 'Accent', desc: 'Highlights' },
    text: { label: 'Text', desc: 'Main text' },
    textMuted: { label: 'Muted', desc: 'Secondary text' }
  };

  // Get preview colors
  const previewColors = useCustomColors ? localCustomColors : THEMES[selectedTheme]?.colors || THEMES.midnight.colors;

  // Mini Interview Room Preview
  const InterviewPreview = ({ colors, size = 'normal' }) => {
    const isLarge = size === 'large';
    
    return (
      <div 
        className={`rounded-2xl overflow-hidden shadow-2xl ${isLarge ? 'w-full' : 'w-full'}`}
        style={{ backgroundColor: colors.background }}
      >
        {/* Header */}
        <div 
          className={`flex items-center justify-between ${isLarge ? 'px-6 py-4' : 'px-3 py-2'}`}
          style={{ 
            background: `linear-gradient(135deg, ${colors.background}, ${colors.surface})`,
            borderBottom: `1px solid ${colors.primary}30`
          }}
        >
          <div className="flex items-center gap-2">
            <div 
              className={`${isLarge ? 'w-8 h-8' : 'w-5 h-5'} rounded-lg flex items-center justify-center text-white font-bold`}
              style={{ 
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                fontSize: isLarge ? '14px' : '8px'
              }}
            >
              T
            </div>
            <div>
              <span 
                className={`font-semibold ${isLarge ? 'text-base' : 'text-[10px]'}`}
                style={{ color: colors.text }}
              >
                Interview Room
              </span>
              {isLarge && (
                <p className="text-[10px]" style={{ color: colors.textMuted }}>TuteDude Proctoring</p>
              )}
            </div>
          </div>
          <div 
            className={`${isLarge ? 'text-xs px-3 py-1' : 'text-[7px] px-1.5 py-0.5'} rounded-full font-medium`}
            style={{ backgroundColor: '#10b98120', color: '#10b981' }}
          >
            ● Live
          </div>
        </div>

        {/* Video Grid */}
        <div className={`${isLarge ? 'p-6' : 'p-2'} flex gap-2`}>
          {/* Local Video */}
          <div 
            className={`flex-1 ${isLarge ? 'rounded-xl min-h-[180px]' : 'rounded-lg h-16'} flex flex-col items-center justify-center relative`}
            style={{ 
              backgroundColor: colors.surface,
              border: `1px solid ${colors.primary}30`
            }}
          >
            <div 
              className={`${isLarge ? 'w-16 h-16' : 'w-6 h-6'} rounded-full flex items-center justify-center text-white font-bold`}
              style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
            >
              <FaUser size={isLarge ? 24 : 8} />
            </div>
            <span 
              className={`mt-1 font-medium ${isLarge ? 'text-sm' : 'text-[6px]'}`}
              style={{ color: colors.text }}
            >
              You
            </span>
            
            {/* Mic indicator */}
            <div 
              className={`absolute ${isLarge ? 'top-3 right-3 p-2' : 'top-1 right-1 p-0.5'} rounded-lg`}
              style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
            >
              <FaMicrophone className="text-white" size={isLarge ? 12 : 5} />
            </div>
          </div>

          {/* Remote Video */}
          <div 
            className={`flex-1 ${isLarge ? 'rounded-xl min-h-[180px]' : 'rounded-lg h-16'} flex flex-col items-center justify-center relative`}
            style={{ 
              backgroundColor: colors.surface,
              border: `1px solid ${colors.secondary}30`
            }}
          >
            <div 
              className={`${isLarge ? 'w-16 h-16' : 'w-6 h-6'} rounded-full flex items-center justify-center text-white font-bold`}
              style={{ background: `linear-gradient(135deg, ${colors.secondary}, ${colors.primary})` }}
            >
              <FaUser size={isLarge ? 24 : 8} />
            </div>
            <span 
              className={`mt-1 font-medium ${isLarge ? 'text-sm' : 'text-[6px]'}`}
              style={{ color: colors.text }}
            >
              Candidate
            </span>

            {/* Live badge */}
            <div 
              className={`absolute ${isLarge ? 'top-3 left-3 px-2 py-1 text-[10px]' : 'top-1 left-1 px-1 py-0.5 text-[4px]'} rounded-full font-medium flex items-center gap-0.5`}
              style={{ backgroundColor: '#10b981', color: 'white' }}
            >
              <span className={`${isLarge ? 'w-1.5 h-1.5' : 'w-0.5 h-0.5'} bg-white rounded-full`}></span>
              Live
            </div>
          </div>
        </div>

        {/* Controls */}
        <div 
          className={`flex justify-center ${isLarge ? 'gap-3 py-4' : 'gap-1 py-1.5'}`}
          style={{ 
            background: `linear-gradient(135deg, ${colors.background}, ${colors.surface})`,
            borderTop: `1px solid ${colors.primary}30`
          }}
        >
          <div 
            className={`${isLarge ? 'p-3' : 'p-1'} rounded-lg text-white`}
            style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
          >
            <FaMicrophone size={isLarge ? 16 : 6} />
          </div>
          <div 
            className={`${isLarge ? 'p-3' : 'p-1'} rounded-lg text-white`}
            style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
          >
            <FaVideo size={isLarge ? 16 : 6} />
          </div>
          <div 
            className={`${isLarge ? 'px-4 py-3 text-sm' : 'px-1.5 py-1 text-[5px]'} rounded-lg text-white font-medium`}
            style={{ background: 'linear-gradient(135deg, #ef4444, #f43f5e)' }}
          >
            Leave
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-cyan-50/30">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-8 py-8 -mx-6 -mt-6 mb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/30">
              <FaPalette className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                Theme Settings
              </h1>
              <p className="text-slate-400 text-sm">Customize interview room appearance</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => setActiveTab('themes')}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 text-sm ${
                activeTab === 'themes'
                  ? 'bg-white text-slate-900 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <HiSparkles className="inline mr-2" />
              Themes
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 text-sm ${
                activeTab === 'custom'
                  ? 'bg-white text-slate-900 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <HiColorSwatch className="inline mr-2" />
              Custom Colors
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-2">
        {/* Themes Tab */}
        {activeTab === 'themes' && (
          <div className="space-y-8">
            {/* Theme Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Choose Your Theme</h2>
                  <p className="text-slate-500 text-sm">8 premium themes designed for professional interviews</p>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-3 py-1.5 rounded-lg border border-cyan-200">
                  <span className="text-xs text-slate-600">
                    Active: <span className="font-semibold text-cyan-600">{THEMES[selectedTheme]?.name}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(THEMES).map(([key, theme]) => {
                  const isSelected = selectedTheme === key && !useCustomColors;
                  
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedTheme(key);
                        setUseCustomColors(false);
                      }}
                      className={`group relative bg-white rounded-xl overflow-hidden transition-all duration-300 text-left border-2 hover:shadow-xl ${
                        isSelected
                          ? 'border-cyan-500 shadow-lg shadow-cyan-500/20 scale-[1.02]'
                          : 'border-transparent shadow-md hover:border-slate-200'
                      }`}
                    >
                      {/* Selected Badge */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 z-20 w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                          <FaCheck className="text-white text-xs" />
                        </div>
                      )}

                      {/* Mini Preview */}
                      <div className="p-2">
                        <InterviewPreview colors={theme.colors} size="normal" />
                      </div>

                      {/* Theme Info */}
                      <div className="px-3 pb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{theme.icon}</span>
                          <h3 className="font-semibold text-slate-800 text-sm">{theme.name}</h3>
                        </div>
                        <p className="text-slate-500 text-xs line-clamp-1">{theme.description}</p>

                        {/* Color dots */}
                        <div className="flex gap-1 mt-2">
                          {Object.values(theme.colors).slice(0, 5).map((color, i) => (
                            <div
                              key={i}
                              className="w-3 h-3 rounded-full shadow-sm"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Theme Preview */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{THEMES[selectedTheme]?.icon}</span>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">{THEMES[selectedTheme]?.name} Preview</h2>
                    <p className="text-slate-500 text-sm">{THEMES[selectedTheme]?.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-lg border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs text-emerald-700 font-medium">Live Preview</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Large Preview */}
                <div>
                  <InterviewPreview colors={previewColors} size="large" />
                </div>

                {/* Color Palette */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-700">Color Palette</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(colorLabels).map(([key, { label }]) => (
                      <div key={key} className="flex items-center gap-3 bg-slate-50 rounded-lg p-2">
                        <div 
                          className="w-10 h-10 rounded-lg shadow-inner"
                          style={{ backgroundColor: previewColors[key] }}
                        />
                        <div>
                          <span className="text-sm font-medium text-slate-700">{label}</span>
                          <p className="text-xs text-slate-400 font-mono">{previewColors[key]}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-3 bg-cyan-50 rounded-lg border border-cyan-100">
                    <p className="text-xs text-cyan-700 flex items-center gap-2">
                      <FaEye />
                      Both admin and candidates will see this theme in the interview room
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custom Colors Tab */}
        {activeTab === 'custom' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <HiColorSwatch className="text-white text-lg" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Custom Colors</h2>
                    <p className="text-slate-500 text-sm">Fine-tune colors based on {THEMES[selectedTheme]?.name}</p>
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer bg-slate-50 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors">
                  <span className="text-sm font-medium text-slate-700">Enable</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={useCustomColors}
                      onChange={(e) => setUseCustomColors(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-12 h-6 rounded-full transition-colors ${useCustomColors ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-slate-300'}`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${useCustomColors ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </div>
                  </div>
                </label>
              </div>

              <div className={`transition-opacity duration-300 ${!useCustomColors ? 'opacity-40 pointer-events-none' : ''}`}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(colorLabels).map(([key, { label, desc }]) => (
                    <div key={key} className="space-y-2">
                      <div>
                        <label className="text-sm font-semibold text-slate-700">{label}</label>
                        <p className="text-xs text-slate-400">{desc}</p>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-2">
                        <input
                          type="color"
                          value={localCustomColors[key]}
                          onChange={(e) => handleColorChange(key, e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer border-2 border-white shadow"
                        />
                        <input
                          type="text"
                          value={localCustomColors[key]}
                          onChange={(e) => handleColorChange(key, e.target.value)}
                          className="flex-1 px-2 py-1.5 text-xs border-0 bg-white rounded focus:ring-2 focus:ring-cyan-500 font-mono uppercase"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={resetToThemeDefaults}
                  className="mt-4 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100"
                >
                  <HiRefresh size={14} />
                  Reset to {THEMES[selectedTheme]?.name} defaults
                </button>
              </div>
            </div>

            {/* Side-by-side preview */}
            {useCustomColors && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl shadow-lg p-4 border border-slate-100">
                  <h3 className="font-medium text-slate-600 mb-3 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    Original
                  </h3>
                  <InterviewPreview colors={THEMES[selectedTheme].colors} size="normal" />
                </div>
                <div className="bg-white rounded-xl shadow-lg p-4 border border-cyan-200">
                  <h3 className="font-medium text-cyan-600 mb-3 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                    Custom
                  </h3>
                  <InterviewPreview colors={localCustomColors} size="normal" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Floating Save Button */}
        <div className="fixed bottom-6 right-6 flex items-center gap-3">
          {saved && (
            <div className="bg-emerald-500 text-white px-4 py-2.5 rounded-xl shadow-xl shadow-emerald-500/30 flex items-center gap-2 text-sm">
              <FaCheck />
              Saved! Theme applied
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 shadow-xl hover:scale-105 active:scale-95 ${
              saving
                ? 'bg-slate-400'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-cyan-500/40'
            }`}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FaSave size={16} />
                Save Theme
              </>
            )}
          </button>
        </div>

        {/* Bottom spacing */}
        <div className="h-20" />
      </div>
    </div>
  );
};

export default SettingsPanel;
