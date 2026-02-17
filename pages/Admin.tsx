
import React, { useState, useEffect } from 'react';
import { ChurchInfo, Sermon, News, WorshipItem } from '../types';
import { LayoutDashboard, BookOpen, Newspaper, Settings, LogOut, Plus, Trash2, Edit2, Save, X, Info, Lock, Loader2, FileText, ChevronLeft, ChevronRight, Image as ImageIcon, Pin, Home, Clock, Share2, Youtube, Instagram, MessageCircle } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'info' | 'about' | 'sermons' | 'news'>('info');
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [localChurchInfo, setLocalChurchInfo] = useState<ChurchInfo>(churchInfo);
  const [localSermons, setLocalSermons] = useState<Sermon[]>(sermons);
  const [localNews, setLocalNews] = useState<News[]>(news);
  
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const itemsPerPage = 10;
  const [sermonPage, setSermonPage] = useState(1);
  const [newsPage, setNewsPage] = useState(1);

  // 모달 폼 상태
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
          greeting_title: localChurchInfo.greetingTitle,
          vision_title: localChurchInfo.visionTitle,
          worship_schedule: JSON.stringify(localChurchInfo.worshipSchedule),
          about_content: localChurchInfo.aboutContent,
          pastor_image: localChurchInfo.pastorImage,
          youtube_url: localChurchInfo.youtubeUrl,
          instagram_url: localChurchInfo.instagramUrl,
          kakao_url: localChurchInfo.kakaoUrl
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
      alert('서버 DB에 모든 내용이 저장되었습니다.');
      setHasChanges(false);
    } catch (error) {
      alert('저장 오류: ' + (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const addWorshipItem = () => {
    setLocalChurchInfo({
      ...localChurchInfo,
      worshipSchedule: [...localChurchInfo.worshipSchedule, { title: '', time: '' }]
    });
  };

  const updateWorshipItem = (idx: number, field: 'title' | 'time', value: string) => {
    const newSchedule = [...localChurchInfo.worshipSchedule];
    newSchedule[idx] = { ...newSchedule[idx], [field]: value };
    setLocalChurchInfo({ ...localChurchInfo, worshipSchedule: newSchedule });
  };

  const removeWorshipItem = (idx: number) => {
    const newSchedule = localChurchInfo.worshipSchedule.filter((_, i) => i !== idx);
    setLocalChurchInfo({ ...localChurchInfo, worshipSchedule: newSchedule });
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

  // 요청하신 < - 1, 2, 3 - > 스타일의 페이징 렌더러
  const renderPagination = (currentPage: number, totalItems: number, setPage: (p: number) => void) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    const block = Math.floor((currentPage - 1) / 10);
    const startPage = block * 10 + 1;
    const endPage = Math.min(startPage + 9, totalPages);
    
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex justify-center items-center space-x-2 pt-12 text-slate-400 font-bold">
        <button 
          disabled={block === 0} 
          onClick={() => setPage(Math.max(1, startPage - 10))}
          className="p-2 transition-colors hover:text-primary disabled:opacity-20"
        >
          <ChevronLeft size={24} />
        </button>
        
        <div className="flex items-center">
          <span className="mx-1">-</span>
          {pages.map((p, idx) => (
            <React.Fragment key={p}>
              <button
                onClick={() => setPage(p)}
                className={`px-1.5 transition-all ${currentPage === p ? 'text-primary scale-110 font-black' : 'hover:text-slate-600'}`}
              >
                {p}
              </button>
              {idx < pages.length - 1 && <span className="mx-0.5">,</span>}
            </React.Fragment>
          ))}
          <span className="mx-1">-</span>
        </div>

        <button 
          disabled={endPage === totalPages} 
          onClick={() => setPage(Math.min(totalPages, endPage + 1))}
          className="p-2 transition-colors hover:text-primary disabled:opacity-20"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in pb-48">
      {!isLoggedIn ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <form onSubmit={handleLogin} className="bg-white p-10 md:p-14 rounded-[40px] shadow-2xl w-full max-w-md border border-slate-100 text-center">
            <Lock size={32} className="mx-auto mb-8 text-primary/20" />
            <h2 className="text-2xl font-black mb-8 text-slate-900">관리자 접속</h2>
            <input 
              type="password" 
              placeholder="비밀번호" 
              className="w-full px-6 py-4 bg-slate-50 border rounded-2xl mb-6 text-center text-xl font-bold outline-none focus:ring-2 focus:ring-primary/20"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              autoFocus
            />
            <button type="submit" className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl">접속하기</button>
          </form>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="md:w-64">
             <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-2 sticky top-24">
                {[
                  { id: 'info', icon: Home, label: '정보 및 예배' },
                  { id: 'about', icon: Info, label: '교회 소개 수정' },
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
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <button onClick={() => setIsLoggedIn(false)} className="w-full flex items-center px-5 py-3.5 rounded-2xl font-bold text-slate-400 hover:text-red-500 transition-all">
                    <LogOut size={18} className="mr-3" /> 로그아웃
                  </button>
                </div>
             </div>
          </aside>

          <main className="flex-grow bg-white p-8 md:p-12 rounded-[40px] border border-slate-100 shadow-sm min-h-[600px]">
            {activeTab === 'info' && (
              <div className="space-y-16 animate-in fade-in">
                <section>
                  <h3 className="text-2xl font-black mb-8 flex items-center text-slate-900">
                    <Home className="text-primary mr-3" /> 홈 화면 기본 정보 및 슬로건
                  </h3>
                  <div className="grid grid-cols-1 gap-8">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">교회 명칭 (Footer 연동)</label>
                      <input 
                        type="text" 
                        value={localChurchInfo.name} 
                        onChange={(e) => setLocalChurchInfo({ ...localChurchInfo, name: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">홈 화면 메인 슬로건 (Vision - Footer 연동)</label>
                      <input 
                        type="text" 
                        value={localChurchInfo.vision} 
                        onChange={(e) => setLocalChurchInfo({ ...localChurchInfo, vision: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-primary text-lg outline-none focus:ring-2 focus:ring-primary/10"
                        placeholder="하나님을 기쁘시게, 세상을 아름답게 하는 제자 공동체"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {[
                        { label: '교회 주소', key: 'address' },
                        { label: '대표 연락처', key: 'phone' },
                      ].map((f) => (
                        <div key={f.key}>
                          <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">{f.label}</label>
                          <input 
                            type="text" 
                            value={localChurchInfo[f.key as keyof ChurchInfo] as string} 
                            onChange={(e) => setLocalChurchInfo({ ...localChurchInfo, [f.key]: e.target.value })}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-black mb-8 flex items-center text-slate-900 border-t border-slate-50 pt-12">
                    <Share2 className="text-primary mr-3" /> SNS 연결 링크
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="flex items-center text-xs font-black text-slate-400 uppercase mb-2 ml-1"><Youtube size={14} className="mr-1.5 text-red-600" /> 유튜브 링크</label>
                      <input type="text" value={localChurchInfo.youtubeUrl} onChange={(e) => setLocalChurchInfo({ ...localChurchInfo, youtubeUrl: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none" />
                    </div>
                    <div>
                      <label className="flex items-center text-xs font-black text-slate-400 uppercase mb-2 ml-1"><Instagram size={14} className="mr-1.5 text-pink-600" /> 인스타 링크</label>
                      <input type="text" value={localChurchInfo.instagramUrl} onChange={(e) => setLocalChurchInfo({ ...localChurchInfo, instagramUrl: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none" />
                    </div>
                    <div>
                      <label className="flex items-center text-xs font-black text-slate-400 uppercase mb-2 ml-1"><MessageCircle size={14} className="mr-1.5 text-yellow-500" /> 카톡 링크</label>
                      <input type="text" value={localChurchInfo.kakaoUrl} onChange={(e) => setLocalChurchInfo({ ...localChurchInfo, kakaoUrl: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none" />
                    </div>
                  </div>
                </section>

                <section>
                  <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-4">
                    <h3 className="text-2xl font-black flex items-center text-slate-900"><Clock className="text-primary mr-3" /> 예배 시간 안내</h3>
                    <button onClick={addWorshipItem} className="text-sm font-bold text-primary flex items-center hover:underline"><Plus size={16} className="mr-1" /> 시간 추가</button>
                  </div>
                  <div className="space-y-3">
                    {localChurchInfo.worshipSchedule.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-center">
                        <input type="text" placeholder="예배명" value={item.title} onChange={(e) => updateWorshipItem(idx, 'title', e.target.value)} className="flex-grow px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
                        <input type="text" placeholder="오전 11:00" value={item.time} onChange={(e) => updateWorshipItem(idx, 'time', e.target.value)} className="w-1/3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-primary" />
                        <button onClick={() => removeWorshipItem(idx)} className="p-3 text-slate-300 hover:text-red-500"><Trash2 size={18} /></button>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-amber-50 p-8 rounded-[32px] border border-amber-100">
                  <h4 className="text-xl font-black text-amber-600 mb-6 flex items-center">
                    <Lock size={20} className="mr-3" /> 관리자 비밀번호 수정
                  </h4>
                  <div className="max-w-xs">
                    <input 
                      type="text" 
                      value={localChurchInfo.adminPassword} 
                      onChange={(e) => setLocalChurchInfo({ ...localChurchInfo, adminPassword: e.target.value })}
                      className="w-full px-5 py-3 bg-white border border-amber-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-200"
                    />
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-12 animate-in fade-in">
                <div className="flex items-center mb-10 border-b border-slate-50 pb-4">
                  <FileText className="text-primary mr-3" />
                  <h3 className="text-2xl font-black text-slate-900">교회 소개 정밀 수정</h3>
                </div>
                <div className="grid grid-cols-1 gap-10">
                  <div className="space-y-8 bg-slate-50/50 p-8 rounded-[40px] border border-slate-100">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      <div className="w-40 h-40 rounded-[32px] overflow-hidden bg-slate-100 flex-shrink-0 shadow-lg border-4 border-white">
                        <img src={localChurchInfo.pastorImage} alt="Pastor Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow w-full space-y-6">
                        <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">1. 인사말 영역 대제목</label><input type="text" value={localChurchInfo.greetingTitle} onChange={(e) => setLocalChurchInfo({ ...localChurchInfo, greetingTitle: e.target.value })} className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl font-bold outline-none" /></div>
                        <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">2. 담임목사님 성함 및 직함</label><input type="text" value={localChurchInfo.pastor} onChange={(e) => setLocalChurchInfo({ ...localChurchInfo, pastor: e.target.value })} className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl font-bold outline-none" /></div>
                      </div>
                    </div>
                    <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">3. 핵심 인사말</label><textarea rows={2} value={localChurchInfo.greeting} onChange={(e) => setLocalChurchInfo({ ...localChurchInfo, greeting: e.target.value })} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl font-bold outline-none" /></div>
                    <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">담임목사님 사진 이미지 URL</label><input type="text" value={localChurchInfo.pastorImage} onChange={(e) => setLocalChurchInfo({ ...localChurchInfo, pastorImage: e.target.value })} className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl font-bold outline-none" /></div>
                  </div>
                  <div className="space-y-8 bg-slate-50/50 p-8 rounded-[40px] border border-slate-100">
                    <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">4. 비전 영역 제목</label><input type="text" value={localChurchInfo.visionTitle} onChange={(e) => setLocalChurchInfo({ ...localChurchInfo, visionTitle: e.target.value })} className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl font-bold outline-none" /></div>
                    <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">5. 교회 비전 (소개 페이지용)</label><input type="text" value={localChurchInfo.vision} onChange={(e) => setLocalChurchInfo({ ...localChurchInfo, vision: e.target.value })} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl font-bold outline-none" /></div>
                    <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">6. 상세 소개 본문</label><textarea rows={10} value={localChurchInfo.aboutContent} onChange={(e) => setLocalChurchInfo({ ...localChurchInfo, aboutContent: e.target.value })} className="w-full px-6 py-6 bg-white border border-slate-200 rounded-[32px] font-bold outline-none leading-loose" /></div>
                  </div>
                </div>
              </div>
            )}

            {(activeTab === 'sermons' || activeTab === 'news') && (
              <div className="animate-in fade-in">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-black text-slate-900">{activeTab === 'sermons' ? '설교 관리' : '소식 관리'}</h3>
                  <button onClick={() => openForm('add')} className="px-6 py-3 bg-primary text-white font-black rounded-2xl flex items-center shadow-lg hover:scale-105 transition-all"><Plus size={20} className="mr-2" /> 추가</button>
                </div>
                <div className="space-y-4">
                  {(activeTab === 'sermons' 
                    ? localSermons.slice((sermonPage - 1) * itemsPerPage, sermonPage * itemsPerPage) 
                    : localNews.slice((newsPage - 1) * itemsPerPage, newsPage * itemsPerPage)).map((item: any) => (
                    <div key={item.id} className={`flex items-center p-5 rounded-3xl border transition-all ${item.is_pinned ? 'bg-primary/5 border-primary/20' : 'bg-slate-50 border-slate-100'} hover:bg-white hover:shadow-md`}>
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-1">
                          {activeTab === 'news' && (
                             <button onClick={() => setLocalNews(localNews.map(n => n.id === item.id ? { ...n, is_pinned: !n.is_pinned } : n))} className={`transition-colors ${item.is_pinned ? 'text-primary' : 'text-slate-300 hover:text-primary'}`}>
                               <Pin size={16} fill={item.is_pinned ? "currentColor" : "none"} />
                             </button>
                          )}
                          <h4 className="text-lg font-black line-clamp-1">{item.title}</h4>
                        </div>
                        <p className="text-slate-400 font-bold text-sm">{item.date} {item.speaker ? `• ${item.speaker}` : ''}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openForm('edit', item)} className="p-3 text-slate-400 hover:text-primary transition-colors bg-white rounded-xl border border-slate-100"><Edit2 size={18} /></button>
                        <button onClick={() => activeTab === 'sermons' ? setLocalSermons(localSermons.filter(s => s.id !== item.id)) : setLocalNews(localNews.filter(n => n.id !== item.id))} className="p-3 text-slate-400 hover:text-red-500 transition-colors bg-white rounded-xl border border-slate-100"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))}
                </div>
                {activeTab === 'sermons' 
                  ? renderPagination(sermonPage, localSermons.length, setSermonPage)
                  : renderPagination(newsPage, localNews.length, setNewsPage)
                }
              </div>
            )}
          </main>
        </div>
      )}
      {/* 하단 저장 바 */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-slate-900 z-[100] animate-in slide-in-from-bottom duration-500 shadow-2xl">
          <div className="max-w-7xl mx-auto flex justify-between items-center text-white">
            <div><p className="text-xl font-black text-amber-400 flex items-center"><Save className="mr-2" /> 변경사항 저장 필요</p></div>
            <div className="flex gap-4">
              <button onClick={() => { setLocalChurchInfo(churchInfo); setLocalSermons(sermons); setLocalNews(news); setHasChanges(false); }} className="px-8 py-4 bg-white/5 text-white/50 font-black rounded-2xl hover:bg-white/10">취소</button>
              <button onClick={handleSaveAllToGlobal} disabled={isSaving} className="px-12 py-4 bg-primary text-white font-black rounded-2xl shadow-xl flex items-center">
                {isSaving ? <Loader2 size={20} className="mr-2 animate-spin" /> : <Save size={20} className="mr-2" />} 서버 DB에 최종 저장
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 추가/수정 모달 */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button onClick={() => setIsAdding(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900"><X size={28} /></button>
            <h3 className="text-2xl font-black mb-10 text-slate-900">{editingItem ? '항목 수정' : '항목 추가'}</h3>
            <div className="space-y-6">
              <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">제목</label><input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border rounded-2xl font-bold" /></div>
              {activeTab === 'sermons' && (
                <><div className="grid grid-cols-2 gap-4"><input type="text" placeholder="강사명" value={formSpeaker} onChange={e => setFormSpeaker(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border rounded-2xl font-bold" /><input type="text" placeholder="성경 본문" value={formScripture} onChange={e => setFormScripture(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border rounded-2xl font-bold" /></div><input type="text" placeholder="유튜브 임베드 URL" value={formVideoUrl} onChange={e => setFormVideoUrl(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border rounded-2xl font-bold" /></>
              )}
              {activeTab === 'news' && (
                <><div className="flex items-center space-x-3 bg-primary/5 p-4 rounded-2xl"><input type="checkbox" checked={formIsPinned} onChange={e => setFormIsPinned(e.target.checked)} className="w-5 h-5 accent-primary" id="pin-modal" /><label htmlFor="pin-modal" className="font-bold text-slate-700 cursor-pointer flex items-center"><Pin size={16} className="mr-2" /> 상단 고정</label></div><input type="text" placeholder="이미지 URL" value={formImage} onChange={e => setFormImage(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border rounded-2xl font-bold" /><textarea rows={5} value={formContent} onChange={e => setFormContent(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border rounded-2xl font-bold" placeholder="내용" /></>
              )}
              <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border rounded-2xl font-bold" />
            </div>
            <button onClick={handleApplyLocal} className="w-full py-5 bg-primary text-white font-black rounded-2xl shadow-xl mt-12">반영하기</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
