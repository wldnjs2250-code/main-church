
import React, { useState, useEffect } from 'react';
import { ChurchInfo, Sermon, News, WorshipItem } from '../types';
import { LayoutDashboard, BookOpen, Newspaper, Settings, LogOut, Plus, Trash2, Edit2, Save, X, Info, Lock, Loader2, FileText, ChevronLeft, ChevronRight, Image as ImageIcon, Pin } from 'lucide-react';

interface AdminProps {
  churchInfo: ChurchInfo;
  setChurchInfo: (info: ChurchInfo) => void;
  sermons: Sermon[];
  setSermons: (sermons: Sermon[]) => void;
  news: News[];
  setNews: (news: News[]) => void;
}

const DB_API_URL = '/api/db';

const Admin: React.FC<AdminProps> = ({ churchInfo, setChurchInfo, sermons, setSermons, news, setNews }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'sermons' | 'news'>('info');
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [localChurchInfo, setLocalChurchInfo] = useState<ChurchInfo>(churchInfo);
  const [localSermons, setLocalSermons] = useState<Sermon[]>(sermons);
  const [localNews, setLocalNews] = useState<News[]>(news);
  
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const [sermonPage, setSermonPage] = useState(1);
  const [newsPage, setNewsPage] = useState(1);
  const itemsPerPage = 10;

  const [formTitle, setFormTitle] = useState('');
  const [formSpeaker, setFormSpeaker] = useState('');
  const [formScripture, setFormScripture] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formIsPinned, setFormIsPinned] = useState(false);

  useEffect(() => {
    const isInfoChanged = JSON.stringify(localChurchInfo) !== JSON.stringify(churchInfo);
    const isSermonsChanged = JSON.stringify(localSermons) !== JSON.stringify(sermons);
    const isNewsChanged = JSON.stringify(localNews) !== JSON.stringify(news);
    setHasChanges(isInfoChanged || isSermonsChanged || isNewsChanged);
  }, [localChurchInfo, localSermons, localNews, churchInfo, sermons, news]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === churchInfo.adminPassword) setIsLoggedIn(true);
    else alert('비밀번호가 틀렸습니다.');
  };

  const handleSaveAllToGlobal = async () => {
    try {
      setIsSaving(true);
      
      const resInfo = await fetch(`${DB_API_URL}?sheet=info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...localChurchInfo,
          password: localChurchInfo.adminPassword,
          worship_schedule: JSON.stringify(localChurchInfo.worshipSchedule),
          about_content: localChurchInfo.aboutContent,
          pastor_image: localChurchInfo.pastorImage
        })
      });
      if (!resInfo.ok) throw new Error("정보 저장 실패");

      const resSermons = await fetch(`${DB_API_URL}?sheet=sermons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localSermons)
      });
      if (!resSermons.ok) throw new Error("설교 저장 실패");

      const resNews = await fetch(`${DB_API_URL}?sheet=news`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localNews)
      });
      if (!resNews.ok) throw new Error("소식 저장 실패");
      
      setChurchInfo(localChurchInfo);
      setSermons(localSermons);
      setNews(localNews);
      alert('데이터베이스에 영구적으로 저장되었습니다.');
      setHasChanges(false);
    } catch (error) {
      alert('저장 중 오류 발생: ' + (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const openForm = (type: 'add' | 'edit', item?: any) => {
    if (type === 'edit' && item) {
      setEditingItem(item);
      setFormTitle(item.title);
      setFormSpeaker(item.speaker || '');
      setFormScripture(item.scripture || '');
      setFormContent(item.content || '');
      setFormImage(item.image || '');
      setFormDate(item.date || '');
      setFormVideoUrl(item.videoUrl || '');
      setFormIsPinned(item.is_pinned || false);
    } else {
      setEditingItem(null);
      setFormTitle('');
      setFormSpeaker('담임목사');
      setFormScripture('');
      setFormContent('');
      setFormImage('');
      setFormDate(new Date().toISOString().split('T')[0]);
      setFormVideoUrl('');
      setFormIsPinned(false);
    }
    setIsAdding(true);
  };

  const handleApplyLocal = () => {
    if (!formTitle) return;
    if (activeTab === 'sermons') {
      const data: Sermon = {
        id: editingItem ? editingItem.id : Date.now().toString(),
        title: formTitle,
        speaker: formSpeaker || '담임목사',
        date: formDate,
        videoUrl: formVideoUrl,
        scripture: formScripture,
        thumbnail: formVideoUrl.includes('youtube.com/embed/') ? `https://img.youtube.com/vi/${formVideoUrl.split('/embed/')[1].split('?')[0]}/maxresdefault.jpg` : 'https://picsum.photos/seed/sermon/600/400'
      };
      if (editingItem) setLocalSermons(localSermons.map(s => s.id === editingItem.id ? data : s));
      else setLocalSermons([data, ...localSermons]);
    } else if (activeTab === 'news') {
      const data: News = {
        id: editingItem ? editingItem.id : Date.now().toString(),
        title: formTitle,
        content: formContent,
        date: formDate,
        image: formImage,
        is_pinned: formIsPinned
      };
      if (editingItem) setLocalNews(localNews.map(n => n.id === editingItem.id ? data : n));
      else setLocalNews([data, ...localNews]);
    }
    setIsAdding(false);
  };

  const togglePin = (id: string) => {
    setLocalNews(localNews.map(n => n.id === id ? { ...n, is_pinned: !n.is_pinned } : n));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in pb-48">
      {!isLoggedIn ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <form onSubmit={handleLogin} className="bg-white p-12 rounded-[40px] shadow-2xl w-full max-w-md border border-slate-100 text-center">
            <h2 className="text-3xl font-black mb-8">관리자 모드</h2>
            <input 
              type="password" 
              placeholder="비밀번호" 
              className="w-full px-6 py-4 bg-slate-50 border rounded-2xl mb-6 text-center text-xl font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              autoFocus
            />
            <button type="submit" className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl">접속하기</button>
          </form>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="md:w-64 space-y-3">
             <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-2">
                {[
                  { id: 'info', icon: Settings, label: '교회 정보' },
                  { id: 'sermons', icon: BookOpen, label: '설교 관리' },
                  { id: 'news', icon: Newspaper, label: '소식 관리' },
                ].map((t) => (
                  <button 
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`w-full flex items-center px-5 py-3.5 rounded-2xl font-bold transition-all ${activeTab === t.id ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    <t.icon size={18} className="mr-3" /> {t.label}
                  </button>
                ))}
                <button onClick={() => setIsLoggedIn(false)} className="w-full flex items-center px-5 py-3.5 rounded-2xl font-bold text-slate-400 hover:text-red-500 transition-all">
                  <LogOut size={18} className="mr-3" /> 로그아웃
                </button>
             </div>
          </aside>

          <main className="flex-grow bg-white p-8 md:p-12 rounded-[40px] border border-slate-100 shadow-sm min-h-[600px]">
            {activeTab === 'info' && (
              <div className="space-y-12 animate-in fade-in">
                <section>
                  <h3 className="text-2xl font-black mb-8 flex items-center"><Info className="text-primary mr-3" /> 기본 정보</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: '교회 명칭', key: 'name' },
                      { label: '담임목사', key: 'pastor' },
                      { label: '주소', key: 'address' },
                      { label: '전화번호', key: 'phone' },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">{f.label}</label>
                        <input 
                          type="text" 
                          value={localChurchInfo[f.key as keyof ChurchInfo] as string} 
                          onChange={(e) => setLocalChurchInfo({ ...localChurchInfo, [f.key]: e.target.value })}
                          className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </section>
                <section>
                  <h3 className="text-2xl font-black mb-8 flex items-center"><ImageIcon className="text-primary mr-3" /> 담임목사님 사진 URL</h3>
                  <input 
                    type="text" 
                    value={localChurchInfo.pastorImage} 
                    onChange={(e) => setLocalChurchInfo({ ...localChurchInfo, pastorImage: e.target.value })}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none"
                  />
                </section>
              </div>
            )}

            {(activeTab === 'sermons' || activeTab === 'news') && (
              <div className="animate-in fade-in">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-black">{activeTab === 'sermons' ? '설교 관리' : '소식 관리'}</h3>
                  <button onClick={() => openForm('add')} className="px-6 py-3 bg-primary text-white font-black rounded-2xl flex items-center shadow-lg hover:scale-105 transition-all"><Plus size={20} className="mr-2" /> 추가하기</button>
                </div>
                <div className="space-y-4">
                  {(activeTab === 'sermons' ? localSermons : localNews).map((item: any) => (
                    <div key={item.id} className={`flex items-center p-5 rounded-3xl border transition-all ${item.is_pinned ? 'bg-primary/5 border-primary/20' : 'bg-slate-50 border-slate-100'} hover:bg-white hover:shadow-md`}>
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-1">
                          {activeTab === 'news' && (
                             <button onClick={() => togglePin(item.id)} className={`transition-colors ${item.is_pinned ? 'text-primary' : 'text-slate-300 hover:text-primary'}`} title="핀 고정">
                               <Pin size={16} fill={item.is_pinned ? "currentColor" : "none"} />
                             </button>
                          )}
                          <h4 className="text-lg font-black line-clamp-1">{item.title}</h4>
                        </div>
                        <p className="text-slate-400 font-bold text-sm">{item.date} {item.speaker ? `• ${item.speaker}` : ''}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openForm('edit', item)} className="p-3 text-slate-400 hover:text-primary transition-colors bg-white rounded-xl shadow-sm"><Edit2 size={18} /></button>
                        <button onClick={() => activeTab === 'sermons' ? setLocalSermons(localSermons.filter(s => s.id !== item.id)) : setLocalNews(localNews.filter(n => n.id !== item.id))} className="p-3 text-slate-400 hover:text-red-500 transition-colors bg-white rounded-xl shadow-sm"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* Save Bar */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-slate-900 z-[100] animate-in slide-in-from-bottom duration-500 shadow-2xl">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="text-white">
              <p className="text-xl font-black text-amber-400 flex items-center"><Save className="mr-2" /> 변경사항 저장 필요</p>
              <p className="text-white/40 text-sm">수정된 내용을 네온 DB에 반영하려면 저장 버튼을 누르세요.</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => { setLocalChurchInfo(churchInfo); setLocalSermons(sermons); setLocalNews(news); setHasChanges(false); }} className="px-8 py-4 bg-white/5 text-white/50 font-black rounded-2xl hover:bg-white/10">취소</button>
              <button onClick={handleSaveAllToGlobal} disabled={isSaving} className="px-12 py-4 bg-primary text-white font-black rounded-2xl shadow-xl flex items-center hover:scale-105 transition-all">
                {isSaving ? <Loader2 size={20} className="mr-2 animate-spin" /> : <Save size={20} className="mr-2" />} 저장하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in duration-300">
            <button onClick={() => setIsAdding(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900"><X size={28} /></button>
            <h3 className="text-2xl font-black mb-10">{editingItem ? '항목 수정하기' : '새로운 항목 추가'}</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">제목</label>
                <input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-primary/10 transition-all" />
              </div>
              
              {activeTab === 'sermons' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase mb-2">강사명</label>
                      <input type="text" value={formSpeaker} onChange={e => setFormSpeaker(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border rounded-2xl font-bold outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase mb-2">성경 본문</label>
                      <input type="text" value={formScripture} onChange={e => setFormScripture(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border rounded-2xl font-bold outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2">유튜브 임베드 URL</label>
                    <input type="text" value={formVideoUrl} onChange={e => setFormVideoUrl(e.target.value)} placeholder="https://www.youtube.com/embed/..." className="w-full px-6 py-4 bg-slate-50 border rounded-2xl font-bold outline-none" />
                  </div>
                </>
              )}

              {activeTab === 'news' && (
                <>
                  <div className="flex items-center space-x-3 bg-primary/5 p-4 rounded-2xl border border-primary/10 mb-6">
                    <input type="checkbox" checked={formIsPinned} onChange={e => setFormIsPinned(e.target.checked)} className="w-5 h-5 accent-primary" id="pin-modal" />
                    <label htmlFor="pin-modal" className="font-bold text-slate-700 cursor-pointer flex items-center"><Pin size={16} className="mr-2" /> 이 게시물을 상단에 고정합니다</label>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2">이미지 URL</label>
                    <input type="text" value={formImage} onChange={e => setFormImage(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border rounded-2xl font-bold outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2">내용</label>
                    <textarea rows={5} value={formContent} onChange={e => setFormContent(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border rounded-2xl font-bold outline-none leading-relaxed" />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">날짜</label>
                <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border rounded-2xl font-bold outline-none" />
              </div>
            </div>
            <button onClick={handleApplyLocal} className="w-full py-5 bg-primary text-white font-black rounded-2xl shadow-xl mt-12 hover:scale-[1.02] transition-transform">반영하기</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
