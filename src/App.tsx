/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Copy, 
  RefreshCw, 
  Download,
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Minus,
  Check,
  Layout,
  FileText,
  Zap,
  RotateCcw,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Scene, GeneratorInputs } from './types';
import { generateMagicalTrainPrompts, regenerateSingleScene, regenerateSinglePrompt } from './services/promptService';

const STYLE_PRESETS = [
  "Hiện thực huyền ảo điện ảnh",
  "Hoạt hình 3D Disney/Pixar",
  "Thẩm mỹ Studio Ghibli",
  "Cyberpunk giả tưởng",
  "Tranh sơn dầu cổ điển",
  "Siêu thực 8K",
  "Minh họa kỳ ảo",
  "Magical Realism",
  "Cinematic Surrealism",
  "Tùy chỉnh..."
];

const ANIMAL_SUGGESTIONS = [
  "Sư tử", "Phượng hoàng", "Cá voi", "Rồng", "Hổ", "Voi", "Cáo", "Gấu Bắc Cực", "Hươu", "Đại bàng"
];

export default function App() {
  const [inputs, setInputs] = useState<GeneratorInputs>({
    animalName: '',
    numScenes: 3,
    brandingText: '',
    stylePreset: STYLE_PRESETS[0],
    customStyle: ''
  });

  const [scenes, setScenes] = useState<Scene[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);
  const [regeneratingPrompt, setRegeneratingPrompt] = useState<{index: number, type: 'image' | 'video'} | null>(null);
  const [expandedScenes, setExpandedScenes] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);

  const sceneRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const finalInputs = {
        ...inputs,
        stylePreset: inputs.stylePreset === "Tùy chỉnh..." ? (inputs.customStyle || "Hiện thực huyền ảo điện ảnh") : inputs.stylePreset
      };
      const result = await generateMagicalTrainPrompts(finalInputs);
      setScenes(result);
      if (result.length > 0) {
        setActiveSceneId(result[0].id);
        const initialExpanded: Record<string, boolean> = {};
        result.forEach(s => initialExpanded[s.id] = true);
        setExpandedScenes(initialExpanded);
      }
    } catch (error) {
      console.error("Lỗi tạo gợi ý", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateScene = async (index: number) => {
    setRegeneratingIndex(index);
    const existingThemes = scenes.map(s => s.theme || "").filter(t => t !== "");
    try {
      const finalInputs = {
        ...inputs,
        stylePreset: inputs.stylePreset === "Tùy chỉnh..." ? (inputs.customStyle || "Hiện thực huyền ảo điện ảnh") : inputs.stylePreset
      };
      const newScene = await regenerateSingleScene(finalInputs, index, existingThemes);
      const updatedScenes = [...scenes];
      updatedScenes[index] = newScene;
      setScenes(updatedScenes);
    } catch (error) {
      console.error("Lỗi tạo lại cảnh", error);
    } finally {
      setRegeneratingIndex(null);
    }
  };

  const handleRegeneratePrompt = async (index: number, type: 'image' | 'video') => {
    setRegeneratingPrompt({ index, type });
    try {
      const finalInputs = {
        ...inputs,
        stylePreset: inputs.stylePreset === "Tùy chỉnh..." ? (inputs.customStyle || "Hiện thực huyền ảo điện ảnh") : inputs.stylePreset
      };
      const newPrompt = await regenerateSinglePrompt(finalInputs, scenes[index], type);
      const updatedScenes = [...scenes];
      if (type === 'image') {
        updatedScenes[index].imagePrompt = newPrompt;
      } else {
        updatedScenes[index].videoPrompt = newPrompt;
      }
      setScenes(updatedScenes);
    } catch (error) {
      console.error(`Lỗi tạo lại prompt ${type}`, error);
    } finally {
      setRegeneratingPrompt(null);
    }
  };

  const handleNewJourney = () => {
    setScenes([]);
    setActiveSceneId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleExpand = (id: string) => {
    setExpandedScenes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const scrollToScene = (id: string) => {
    setActiveSceneId(id);
    sceneRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const exportImagePrompts = () => {
    const content = scenes.map(s => s.imagePrompt).join('\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompts_hinh_anh_${inputs.animalName.toLowerCase()}.txt`;
    a.click();
  };

  const exportVideoPrompts = () => {
    const content = scenes.map(s => s.videoPrompt).join('\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompts_video_${inputs.animalName.toLowerCase()}.txt`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#EEEEEE] text-zinc-900 font-sans selection:bg-brand-orange/30">
      {/* Điều hướng trên cùng */}
      <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md px-6 py-4 grid grid-cols-[1fr_auto_1fr] items-center shadow-sm">
        <div className="flex justify-start">
          {/* Left side empty to center the middle content */}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg shadow-brand-red/20">
            <img 
              src="https://yt3.googleusercontent.com/Gug5UDLjPMRBto68HqZvJCSryebEkqiI2_9qV_8y16ZKIVLgxYBFx_PyUYZStcTzSc3v7TLq=s900-c-k-c0x00ffffff-no-rj" 
              alt="Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="text-center">
            <h1 className="text-xl md:text-2xl font-black tracking-tighter text-zinc-900 leading-none">Biên Kịch Video Short Tạo Tàu Động Vật Thần Thoại</h1>
            <p className="text-[11px] text-brand-red font-black uppercase tracking-[0.2em] mt-1">Công cụ Gợi ý AI Điện ảnh</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          {/* Buttons moved to results header */}
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-0 h-[calc(100vh-73px)]">
        
        {/* Bảng trái: Phần nhập liệu */}
        <aside className="border-r border-zinc-200 p-6 overflow-y-auto bg-white">
          <div className="space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Layout className="w-4 h-4 text-brand-red" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Cấu hình hành trình</h2>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-500 ml-1 uppercase tracking-wider">Tên loài vật (nhập 1 tên con vật)</label>
                  <input 
                    type="text"
                    value={inputs.animalName}
                    onChange={(e) => setInputs({...inputs, animalName: e.target.value})}
                    placeholder="VD: Sư tử, Phượng hoàng, Cá voi"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all placeholder:text-zinc-400 text-sm font-medium"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {ANIMAL_SUGGESTIONS.map(animal => (
                      <button
                        key={animal}
                        onClick={() => setInputs({...inputs, animalName: animal})}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                          inputs.animalName === animal 
                            ? 'bg-brand-red text-white border-brand-red shadow-sm' 
                            : 'bg-white text-zinc-500 border-zinc-200 hover:border-brand-red/30 hover:text-brand-red'
                        }`}
                      >
                        {animal}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 ml-1 uppercase tracking-wider">Số lượng cảnh</label>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setInputs({...inputs, numScenes: Math.max(1, inputs.numScenes - 1)})}
                      className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 transition-all text-zinc-600"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input 
                      type="number"
                      min="1"
                      max="100"
                      value={inputs.numScenes}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          setInputs({...inputs, numScenes: Math.min(100, Math.max(1, val))});
                        } else if (e.target.value === '') {
                          // Allow empty string temporarily while typing
                          setInputs({...inputs, numScenes: 1});
                        }
                      }}
                      className="flex-1 text-center font-mono text-lg bg-zinc-50 border border-zinc-200 py-2 rounded-xl font-bold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all"
                    />
                    <button 
                      onClick={() => setInputs({...inputs, numScenes: Math.min(100, inputs.numScenes + 1)})}
                      className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 transition-all text-zinc-600"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 ml-1 uppercase tracking-wider">Tên thương hiệu/ Tên kênh</label>
                  <input 
                    type="text"
                    value={inputs.brandingText}
                    onChange={(e) => setInputs({...inputs, brandingText: e.target.value})}
                    placeholder="VD: Tên kênh, Văn bản Logo"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all placeholder:text-zinc-400 text-sm font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 ml-1 uppercase tracking-wider">Phong cách nghệ thuật</label>
                  <select 
                    value={inputs.stylePreset}
                    onChange={(e) => setInputs({...inputs, stylePreset: e.target.value})}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all appearance-none cursor-pointer text-sm font-medium"
                  >
                    {STYLE_PRESETS.map(style => (
                      <option key={style} value={style}>{style}</option>
                    ))}
                  </select>
                  
                  {inputs.stylePreset === "Tùy chỉnh..." && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2"
                    >
                      <input 
                        type="text"
                        value={inputs.customStyle}
                        onChange={(e) => setInputs({...inputs, customStyle: e.target.value})}
                        placeholder="Nhập phong cách riêng của bạn..."
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all placeholder:text-zinc-400 text-sm font-medium"
                      />
                    </motion.div>
                  )}
                </div>
              </div>
            </section>

            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !inputs.animalName.trim() || inputs.numScenes <= 0 || (inputs.stylePreset === "Tùy chỉnh..." && !inputs.customStyle?.trim())}
              className={`w-full relative group overflow-hidden rounded-2xl p-px transition-all active:scale-[0.98] disabled:scale-100 disabled:cursor-not-allowed disabled:grayscale disabled:opacity-50 ${
                !inputs.animalName.trim() || inputs.numScenes <= 0 || (inputs.stylePreset === "Tùy chỉnh..." && !inputs.customStyle?.trim())
                ? 'bg-zinc-300'
                : 'bg-gradient-to-r from-brand-red to-brand-orange hover:shadow-xl hover:shadow-brand-red/20'
              }`}
            >
              <div className={`relative flex items-center justify-center gap-2 rounded-[15px] px-8 py-4 font-bold text-white transition-all ${
                !inputs.animalName.trim() || inputs.numScenes <= 0 || (inputs.stylePreset === "Tùy chỉnh..." && !inputs.customStyle?.trim())
                ? 'bg-zinc-400/20'
                : 'bg-white/10 group-hover:bg-white/0'
              }`}>
                {isGenerating ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Zap className="w-5 h-5 fill-current" />
                )}
                {isGenerating ? 'Đang tạo phép màu...' : 'Tạo Gợi Ý Ngay'}
              </div>
            </button>

            <div className="p-5 rounded-2xl bg-brand-red/5 border border-brand-red/10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3 h-3 text-brand-red" />
                <p className="text-[10px] text-brand-red leading-relaxed uppercase tracking-widest font-black">Bật mí với bạn</p>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                Cảnh 1 luôn là ngoại thất tàu thú. Các cảnh tiếp theo sẽ tự động tạo ra các toa tàu nội thất độc đáo với thương hiệu của bạn.
              </p>
            </div>
          </div>
        </aside>

        {/* Bảng giữa: Kết quả gợi ý */}
        <section className="overflow-y-auto bg-[#EEEEEE] custom-scrollbar">
          {scenes.length > 0 && (
            <div className="sticky top-0 z-20 bg-[#EEEEEE]/80 backdrop-blur-md px-8 py-4 border-b border-zinc-200 flex items-center justify-between">
              <button 
                onClick={handleNewJourney}
                className="flex items-center gap-2 text-sm font-bold text-zinc-600 hover:text-brand-red transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center group-hover:border-brand-red/30 transition-all">
                  <ArrowLeft className="w-4 h-4" />
                </div>
                Quay lại cấu hình
              </button>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={exportImagePrompts}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-200 transition-all text-sm font-bold text-zinc-700 shadow-sm active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-brand-orange" />
                  Tải Prompt Hình Ảnh
                </button>
                <button 
                  onClick={exportVideoPrompts}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-200 transition-all text-sm font-bold text-zinc-700 shadow-sm active:scale-95"
                >
                  <Zap className="w-4 h-4 text-brand-red" />
                  Tải Prompt Video
                </button>
              </div>
            </div>
          )}

          {scenes.length === 0 && !isGenerating ? (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
              <div className="w-24 h-24 rounded-3xl bg-white flex items-center justify-center mb-6 border border-zinc-200 shadow-sm rotate-3">
                <Sparkles className="w-10 h-10 text-brand-orange" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-800 mb-2">Sẵn sàng sáng tạo?</h3>
              <p className="text-zinc-500 max-w-sm font-medium">
                Thiết lập hành trình kỳ diệu của bạn và để AI biến loài vật yêu thích thành một đoàn tàu điện ảnh.
              </p>
            </div>
          ) : (
            <div className="p-8 space-y-8 max-w-4xl mx-auto">
              {isGenerating && scenes.length === 0 && (
                <div className="space-y-8 animate-pulse">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-64 bg-white rounded-3xl border border-zinc-200" />
                  ))}
                </div>
              )}
              
              <AnimatePresence>
                {scenes.map((scene, index) => (
                  <motion.div 
                    key={scene.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.1 }}
                    className={`group relative rounded-3xl border transition-all duration-500 ${
                      activeSceneId === scene.id 
                        ? 'bg-white border-brand-red/30 shadow-xl shadow-brand-red/5 ring-1 ring-brand-red/10' 
                        : 'bg-white border-zinc-200 hover:border-zinc-300 shadow-sm'
                    }`}
                  >
                    <div ref={el => { sceneRefs.current[scene.id] = el; }}>
                      {/* Tiêu đề cảnh */}
                      <div className="p-6 flex items-center justify-between border-b border-zinc-100">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono text-sm font-black shadow-sm ${
                          scene.type === 'exterior' 
                            ? 'bg-brand-red text-white' 
                            : 'bg-brand-orange text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-bold text-zinc-800 text-lg tracking-tight">{scene.title}</h3>
                          <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-black">
                            {scene.type === 'exterior' ? 'Ngoại thất' : 'Nội thất'} • {scene.theme || 'Góc nhìn bên ngoài'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleRegenerateScene(index)}
                          disabled={regeneratingIndex === index}
                          className={`p-2.5 rounded-xl hover:bg-zinc-50 text-zinc-400 hover:text-brand-red transition-all border border-transparent hover:border-zinc-200 disabled:opacity-50`}
                          title="Tạo lại cảnh này"
                        >
                          <RefreshCw className={`w-4 h-4 ${regeneratingIndex === index ? 'animate-spin text-brand-red' : ''}`} />
                        </button>
                        <button 
                          onClick={() => toggleExpand(scene.id)}
                          className="p-2.5 rounded-xl hover:bg-zinc-50 text-zinc-400 hover:text-zinc-800 transition-all border border-transparent hover:border-zinc-200"
                        >
                          {expandedScenes[scene.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Nội dung cảnh */}
                    <AnimatePresence initial={false}>
                      {expandedScenes[scene.id] && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-6 space-y-6 relative">
                            {regeneratingIndex === index && (
                              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center gap-3">
                                <RefreshCw className="w-8 h-8 text-brand-red animate-spin" />
                                <p className="text-xs font-bold text-brand-red uppercase tracking-widest">Đang cập nhật cảnh...</p>
                              </div>
                            )}
                            {/* Gợi ý hình ảnh */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-black flex items-center gap-2">
                                  <Sparkles className="w-3 h-3 text-brand-orange" /> Gợi ý Hình ảnh
                                </span>
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => handleRegeneratePrompt(index, 'image')}
                                    disabled={regeneratingPrompt?.index === index && regeneratingPrompt?.type === 'image'}
                                    className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-brand-red transition-all disabled:opacity-50"
                                    title="Tạo lại prompt ảnh"
                                  >
                                    <RefreshCw className={`w-3.5 h-3.5 ${regeneratingPrompt?.index === index && regeneratingPrompt?.type === 'image' ? 'animate-spin text-brand-red' : ''}`} />
                                  </button>
                                  <button 
                                    onClick={() => copyToClipboard(scene.imagePrompt, `${scene.id}-img`)}
                                    className="text-xs font-bold text-brand-red hover:text-brand-red/80 flex items-center gap-1.5 transition-colors bg-brand-red/5 px-3 py-1.5 rounded-lg"
                                  >
                                    {copiedId === `${scene.id}-img` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    {copiedId === `${scene.id}-img` ? 'Đã chép' : 'Sao chép'}
                                  </button>
                                </div>
                              </div>
                              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-100 text-sm text-zinc-600 leading-relaxed font-medium relative overflow-hidden">
                                {(regeneratingPrompt?.index === index && regeneratingPrompt?.type === 'image') && (
                                  <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center">
                                    <RefreshCw className="w-5 h-5 text-brand-red animate-spin" />
                                  </div>
                                )}
                                {scene.imagePrompt}
                              </div>
                            </div>

                            {/* Gợi ý video */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-black flex items-center gap-2">
                                  <Zap className="w-3 h-3 text-brand-red" /> Gợi ý Video
                                </span>
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => handleRegeneratePrompt(index, 'video')}
                                    disabled={regeneratingPrompt?.index === index && regeneratingPrompt?.type === 'video'}
                                    className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-brand-red transition-all disabled:opacity-50"
                                    title="Tạo lại prompt video"
                                  >
                                    <RefreshCw className={`w-3.5 h-3.5 ${regeneratingPrompt?.index === index && regeneratingPrompt?.type === 'video' ? 'animate-spin text-brand-red' : ''}`} />
                                  </button>
                                  <button 
                                    onClick={() => copyToClipboard(scene.videoPrompt, `${scene.id}-vid`)}
                                    className="text-xs font-bold text-brand-red hover:text-brand-red/80 flex items-center gap-1.5 transition-colors bg-brand-red/5 px-3 py-1.5 rounded-lg"
                                  >
                                    {copiedId === `${scene.id}-vid` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    {copiedId === `${scene.id}-vid` ? 'Đã chép' : 'Sao chép'}
                                  </button>
                                </div>
                              </div>
                              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-100 text-sm text-zinc-600 leading-relaxed font-medium relative overflow-hidden">
                                {(regeneratingPrompt?.index === index && regeneratingPrompt?.type === 'video') && (
                                  <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center">
                                    <RefreshCw className="w-5 h-5 text-brand-red animate-spin" />
                                  </div>
                                )}
                                {scene.videoPrompt}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Chân trang hành động nhanh */}
                    <div className="px-6 py-4 border-t border-zinc-50 flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => copyToClipboard(`${scene.imagePrompt}\n\n${scene.videoPrompt}`, scene.id)}
                        className="text-xs font-bold text-zinc-400 hover:text-brand-red flex items-center gap-2 transition-colors"
                      >
                        <FileText className="w-3 h-3" /> Sao chép toàn bộ cảnh
                      </button>
                    </div>
                  </div>
                </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>

      {/* Thông báo toàn cục */}
      <AnimatePresence>
        {copiedId && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl bg-zinc-900 text-white text-sm font-bold shadow-2xl flex items-center gap-3"
          >
            <div className="w-6 h-6 rounded-full bg-brand-orange flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-white" />
            </div>
            Đã sao chép vào bộ nhớ tạm
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
