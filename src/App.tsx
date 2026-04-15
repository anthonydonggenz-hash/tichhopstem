import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  LibraryBig, 
  CheckSquare, 
  Settings, 
  Bell, 
  UserCircle,
  BookOpen,
  Clock,
  Search,
  Filter,
  ChevronRight,
  PlayCircle,
  FileText,
  Award,
  Loader2,
  Menu,
  X,
  ImagePlay,
  Copy,
  Check,
  AlertCircle,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { marked } from 'marked';
import { asBlob } from 'html-docx-js-typescript';
import { generateSTEMLesson } from './services/geminiService';
import { STEMLesson, STEMParams } from './types';

// --- MOCK DATA ---
const MOCK_STATS = {
  total: 124,
  pending: 12,
  implemented: 85,
  topTeacher: 'Nguyễn Văn A',
  topSubject: 'Khoa học (Lớp 4)'
};

const MOCK_LIBRARY = [
  { id: 1, title: 'Máy lọc nước mini', subject: 'Khoa học', grade: 'Lớp 4', status: 'Đã duyệt', author: 'Lê Thị B' },
  { id: 2, title: 'Thuyền mút xốp tự hành', subject: 'Vật lý', grade: 'Lớp 6', status: 'Đã duyệt', author: 'Trần Văn C' },
  { id: 3, title: 'Hệ thống báo cháy đơn giản', subject: 'Công nghệ', grade: 'Lớp 8', status: 'Chờ duyệt', author: 'Nguyễn Văn A' },
  { id: 4, title: 'Mô hình vòng tuần hoàn nước', subject: 'Khoa học', grade: 'Lớp 4', status: 'Đã duyệt', author: 'Phạm Thị D' },
];

// --- COMPONENTS ---

const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
    {children}
  </div>
);

const TabButton = ({ active, onClick, icon: Icon, label, isSpecial = false }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
      active 
        ? (isSpecial ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-200' : 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-200')
        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
    }`}
  >
    <Icon className={`w-4 h-4 ${active ? (isSpecial ? 'text-indigo-500' : 'text-emerald-500') : ''}`} />
    <span className="hidden sm:inline">{label}</span>
  </button>
);

// --- MAIN APP ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [role, setRole] = useState('teacher'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigation = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'create', label: 'Tạo bài bằng AI', icon: Sparkles },
    { id: 'library', label: 'Kho học liệu', icon: LibraryBig },
  ];

  // Close sidebar on mobile by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && window.innerWidth < 768 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-20 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-30 h-full bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full md:w-20 md:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-emerald-500 p-2 rounded-xl shrink-0 shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-white font-bold text-xl tracking-tight"
              >
                STEM OS
              </motion.span>
            )}
          </div>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          <div>
            {isSidebarOpen && (
              <p className="px-4 mb-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                Phân hệ chính
              </p>
            )}
            <nav className="space-y-2">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === item.id 
                      ? 'bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/20' 
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-slate-400'}`} />
                  {isSidebarOpen && <span>{item.label}</span>}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <UserCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
            </div>
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-semibold text-white truncate">Trần Đông</p>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="text-[10px] uppercase font-bold tracking-wider bg-slate-800 text-emerald-400 border-none rounded-md mt-1 outline-none w-full px-2 py-1 cursor-pointer hover:bg-slate-700 transition-colors"
                >
                  <option value="teacher">Giáo viên</option>
                  <option value="head">Tổ trưởng</option>
                  <option value="admin">Ban giám hiệu</option>
                </select>
              </motion.div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-20 flex items-center justify-between px-6 sm:px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {navigation.find(n => n.id === activeTab)?.label}
              </h1>
              <p className="text-xs text-slate-500 font-medium">Hệ điều hành STEM thông minh</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center bg-slate-100 rounded-xl px-3 py-2 border border-slate-200">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input type="text" placeholder="Tìm kiếm..." className="bg-transparent border-none outline-none text-sm w-40" />
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2.5 text-slate-500 hover:text-emerald-600 rounded-xl hover:bg-emerald-50 transition-all relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>
              <button className="p-2.5 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-all">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}
              {activeTab === 'create' && <CreateSTEMView />}
              {activeTab === 'library' && <LibraryView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// --- VIEWS ---

function DashboardView({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="relative bg-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/40 to-indigo-600/40 opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-emerald-500/30">
              AI Assistant Ready
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
              Chào mừng trở lại, <br/><span className="text-emerald-400">Thầy Đông!</span>
            </h2>
            <p className="text-slate-300 mb-8 text-lg leading-relaxed max-w-lg">
              Hệ thống AI đã sẵn sàng để giúp thầy thiết kế những bài giảng STEM bùng nổ cho tuần tới.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => setActiveTab('create')}
                className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold text-base hover:bg-emerald-400 transition-all flex items-center gap-3 shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-5 h-5" />
                Thiết kế bài STEM mới
              </button>
              <button className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-2xl font-bold text-base hover:bg-white/20 transition-all flex items-center gap-3 border border-white/10">
                <BookOpen className="w-5 h-5" />
                Xem giáo án mẫu
              </button>
            </div>
          </motion.div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] animate-pulse"></div>
           <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 text-emerald-400/10 rotate-12" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={BookOpen} label="Tổng bài STEM" value={MOCK_STATS.total} color="bg-blue-500" />
        <StatCard icon={Award} label="Môn phổ biến" value={MOCK_STATS.topSubject} color="bg-amber-500" isText />
        <StatCard icon={PlayCircle} label="Đã triển khai" value={MOCK_STATS.implemented} color="bg-emerald-500" />
        <StatCard icon={UserCircle} label="GV tích cực" value={MOCK_STATS.topTeacher} color="bg-indigo-500" isText />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-900">Hoạt động gần đây</h3>
            <button className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">Xem tất cả</button>
          </div>
          <div className="space-y-6">
            {MOCK_LIBRARY.slice(0,4).map((item, idx) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-6 p-4 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100 group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                  <FileText className="w-7 h-7 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-bold text-slate-900 truncate group-hover:text-emerald-600 transition-colors">{item.title}</h4>
                  <p className="text-sm text-slate-500 mt-1 font-medium">{item.subject} • {item.grade} • {item.author}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  item.status === 'Đã duyệt' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {item.status}
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-400" />
              </motion.div>
            ))}
          </div>
        </Card>

        <Card className="p-8 bg-emerald-600 text-white border-none shadow-xl shadow-emerald-600/20">
          <h3 className="text-xl font-bold mb-6">Mẹo thiết kế STEM</h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium leading-relaxed">
                Sử dụng mô hình 5E để học sinh luôn là trung tâm của mọi hoạt động khám phá.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <CheckSquare className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium leading-relaxed">
                Đừng quên tích hợp các tiêu chí đánh giá năng lực thế kỷ 21 vào Rubric.
              </p>
            </div>
            <div className="pt-4">
              <img 
                src="https://picsum.photos/seed/stem/400/300" 
                alt="STEM" 
                className="rounded-2xl w-full h-40 object-cover border-2 border-white/20"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function CreateSTEMView() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<STEMLesson | null>(null);
  const [resultTab, setResultTab] = useState<keyof STEMLesson>('plan');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<STEMParams>({
    level: 'THCS',
    grade: 'Lớp 8',
    subject: 'Khoa học Tự nhiên',
    book: 'Kết nối tri thức',
    topic: 'Áp suất chất lỏng - Khí quyển',
    duration: '2 tiết (90p)',
    features: 'Tạo Prompt Ảnh & Video',
    notes: ''
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setResult(null);
    setError(null);
    
    try {
      const lesson = await generateSTEMLesson(formData);
      setResult(lesson);
    } catch (err) {
      console.error(err);
      setError('Đã có lỗi xảy ra khi gọi AI. Vui lòng thử lại sau.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result[resultTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportContent = async (format: 'md' | 'docx') => {
    if (!result) return;
    const content = result[resultTab];
    let blob: Blob;
    let fileName = `STEM_${formData.topic.replace(/\s+/g, '_')}_${resultTab}.${format}`;

    if (format === 'md') {
      blob = new Blob([content], { type: 'text/markdown' });
    } else {
      // Convert Markdown to HTML
      const htmlContent = marked.parse(content);
      const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; }
            h1 { color: #059669; font-size: 18pt; border-bottom: 1px solid #059669; }
            h2 { color: #047857; font-size: 16pt; margin-top: 15pt; }
            h3 { color: #4338ca; font-size: 14pt; }
            table { border-collapse: collapse; width: 100%; margin: 10pt 0; }
            th { background-color: #1e293b; color: #ffffff; padding: 8pt; text-align: left; border: 1px solid #000000; }
            td { border: 1px solid #000000; padding: 8pt; vertical-align: top; }
            blockquote { border-left: 4pt solid #6366f1; padding-left: 10pt; font-style: italic; color: #4338ca; }
            strong { font-weight: bold; }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `;
      
      // Use html-docx-js-typescript to generate a real docx blob
      const docxBlob = await asBlob(fullHtml);
      blob = docxBlob as Blob;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-[1600px] mx-auto h-full flex flex-col xl:flex-row gap-8">
      {/* Form Section */}
      <Card className="xl:w-[400px] flex flex-col h-full shrink-0 border-slate-200">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
          <div className="p-2 bg-emerald-500 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h2 className="font-bold text-slate-900">Trợ lý Thiết kế AI</h2>
        </div>
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          <form id="ai-stem-form" onSubmit={handleGenerate} className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">1. Định chuẩn Chương trình</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Cấp học">
                  <select 
                    value={formData.level}
                    onChange={(e) => setFormData({...formData, level: e.target.value})}
                    className="form-select"
                  >
                    <option>Mầm non</option>
                    <option>Tiểu học</option>
                    <option>THCS</option>
                    <option>THPT</option>
                  </select>
                </FormGroup>
                <FormGroup label="Khối lớp">
                  <select 
                    value={formData.grade}
                    onChange={(e) => setFormData({...formData, grade: e.target.value})}
                    className="form-select"
                  >
                    <option>Lớp 1</option><option>Lớp 2</option><option>Lớp 3</option>
                    <option>Lớp 4</option><option>Lớp 5</option><option>Lớp 6</option>
                    <option>Lớp 7</option><option>Lớp 8</option><option>Lớp 9</option>
                    <option>Lớp 10</option><option>Lớp 11</option><option>Lớp 12</option>
                  </select>
                </FormGroup>
              </div>
              <FormGroup label="Môn học chính">
                <select 
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="form-select"
                >
                  <option>Khoa học Tự nhiên</option>
                  <option>Toán học</option>
                  <option>Công nghệ</option>
                  <option>Vật lý</option>
                  <option>Hóa học</option>
                  <option>Sinh học</option>
                  <option>Tin học</option>
                </select>
              </FormGroup>
              <FormGroup label="Bộ sách">
                <select 
                  value={formData.book}
                  onChange={(e) => setFormData({...formData, book: e.target.value})}
                  className="form-select"
                >
                  <option>Kết nối tri thức</option>
                  <option>Chân trời sáng tạo</option>
                  <option>Cánh diều</option>
                </select>
              </FormGroup>
              <FormGroup label="Tên bài học / Chủ đề SGK">
                <input 
                  type="text" 
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  className="form-input" 
                />
              </FormGroup>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-100">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">2. Yêu cầu Hệ thống AI</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Thời lượng">
                  <select 
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="form-select"
                  >
                    <option>1 tiết (45p)</option>
                    <option>2 tiết (90p)</option>
                    <option>Chuyên đề (3-4 tiết)</option>
                  </select>
                </FormGroup>
                <FormGroup label="Tính năng">
                  <select 
                    value={formData.features}
                    onChange={(e) => setFormData({...formData, features: e.target.value})}
                    className="form-select"
                  >
                    <option>Đầy đủ Prompt Media</option>
                    <option>Chỉ tạo Giáo án</option>
                  </select>
                </FormGroup>
              </div>
              <FormGroup label="Ghi chú thiết bị/vật liệu hiện có">
                <textarea 
                  rows={3} 
                  placeholder="VD: Trường có sẵn chai nhựa, ống bơm..." 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="form-input resize-none"
                ></textarea>
              </FormGroup>
            </div>
          </form>
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <button 
            type="submit" 
            form="ai-stem-form"
            disabled={isGenerating}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-all flex justify-center items-center gap-3 disabled:opacity-70 shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isGenerating ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Đang thiết kế...</>
            ) : (
              <><Sparkles className="w-5 h-5" /> Sinh Nội Dung STEM</>
            )}
          </button>
        </div>
      </Card>

      {/* Result Section */}
      <Card className="xl:flex-1 h-full flex flex-col min-h-[600px] border-slate-200">
        {!result && !isGenerating && !error ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
              <FileText className="w-12 h-12 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Sẵn sàng thiết kế</h3>
            <p className="text-sm text-slate-500 max-w-md leading-relaxed">
              Điền thông tin ở bên trái và bấm nút sinh nội dung. AI sẽ tự động soạn thảo giáo án, phiếu bài tập và các prompt tạo ảnh/video minh họa.
            </p>
          </div>
        ) : isGenerating ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
             <div className="relative w-32 h-32 mb-8">
                <div className="absolute inset-0 rounded-full border-8 border-slate-100"></div>
                <div className="absolute inset-0 rounded-full border-8 border-emerald-500 border-t-transparent animate-spin"></div>
                <Sparkles className="absolute inset-0 m-auto w-12 h-12 text-emerald-500 animate-pulse" />
             </div>
             <h3 className="text-2xl font-bold text-slate-900 mb-4">AI đang làm việc...</h3>
             <div className="space-y-3 text-sm font-medium text-slate-500">
                <motion.p 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ repeat: Infinity, duration: 2 }}
                >
                  Đang phân tích Yêu cầu cần đạt SGK...
                </motion.p>
                <motion.p 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                >
                  Đang cấu trúc hoạt động 5E...
                </motion.p>
                <motion.p 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                >
                  Đang tạo Prompt Media thông minh...
                </motion.p>
             </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-rose-600">
            <AlertCircle className="w-16 h-16 mb-4" />
            <h3 className="text-xl font-bold mb-2">Lỗi hệ thống</h3>
            <p className="text-slate-500">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-6 px-6 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Tabs */}
            <div className="flex items-center gap-2 p-4 border-b border-slate-100 bg-slate-50/50 flex-wrap">
              <TabButton active={resultTab === 'plan'} onClick={() => setResultTab('plan')} icon={BookOpen} label="Kế hoạch dạy học" />
              <TabButton active={resultTab === 'student'} onClick={() => setResultTab('student')} icon={FileText} label="Phiếu học sinh" />
              <TabButton active={resultTab === 'rubric'} onClick={() => setResultTab('rubric')} icon={Award} label="Đánh giá" />
              <TabButton active={resultTab === 'media'} onClick={() => setResultTab('media')} icon={ImagePlay} label="Prompt Media & Slide" isSpecial />
              
              <div className="ml-auto flex gap-2">
                <button 
                  onClick={() => exportContent('docx')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm"
                  title="Xuất file Word (.docx)"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden md:inline">Xuất Word</span>
                </button>
                <button 
                  onClick={() => exportContent('md')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all"
                  title="Xuất file Markdown (.md)"
                >
                  <Download className="w-4 h-4 text-slate-400" />
                  <span className="hidden md:inline">Xuất MD</span>
                </button>
                <button 
                  onClick={copyToClipboard}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                    copied ? 'bg-emerald-500 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Đã sao chép' : 'Sao chép'}
                </button>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/10">
                  Lưu vào kho
                </button>
              </div>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 sm:p-12 bg-white custom-scrollbar">
              <motion.div
                key={resultTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-extrabold prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600 prose-strong:text-slate-900 prose-table:border prose-table:rounded-xl prose-th:bg-slate-50 prose-th:p-4 prose-td:p-4"
              >
                <ReactMarkdown>{result![resultTab]}</ReactMarkdown>
              </motion.div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function LibraryView() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Kho học liệu STEM</h2>
          <p className="text-slate-500 font-medium mt-1">Khám phá và tái sử dụng tài nguyên từ cộng đồng giáo viên</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm bài STEM..." 
              className="w-full pl-12 pr-4 py-3 text-sm border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
            />
          </div>
          <button className="p-3 border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 flex items-center justify-center shrink-0 transition-colors shadow-sm">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {MOCK_LIBRARY.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full cursor-pointer border-slate-200">
              <div className="h-48 bg-slate-100 relative overflow-hidden">
                <img 
                  src={`https://picsum.photos/seed/${item.id + 100}/600/400`} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-bold rounded-lg uppercase tracking-wider shadow-sm">
                    {item.subject}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                   <button className="w-full bg-white text-slate-900 py-2 rounded-xl font-bold text-sm shadow-lg">Xem chi tiết</button>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3 text-xs text-emerald-600 font-bold uppercase tracking-widest">
                  <span>{item.grade}</span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 leading-tight mb-4 group-hover:text-emerald-600 transition-colors">
                  {item.title}
                </h3>
                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                      <UserCircle className="w-5 h-5 text-slate-400" />
                    </div>
                    <span className="text-xs font-bold text-slate-700">{item.author}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px] font-bold">2 ngày trước</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// --- UTILS ---

const StatCard = ({ icon: Icon, label, value, color, isText = false }: any) => (
  <Card className="p-6 flex items-center gap-5 border-slate-200 hover:border-emerald-200 transition-colors group">
    <div className={`p-4 rounded-2xl ${color} text-white shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
      <Icon className="w-6 h-6" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">{label}</p>
      <p className={`font-black text-slate-900 truncate ${isText ? 'text-lg' : 'text-3xl'}`}>{value}</p>
    </div>
  </Card>
);

const FormGroup = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
    {children}
  </div>
);
