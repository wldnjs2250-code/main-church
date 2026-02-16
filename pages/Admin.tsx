
import React, { useState, useEffect } from 'react';
import { ChurchInfo, Sermon, News, WorshipItem } from '../types';
import { LayoutDashboard, BookOpen, Newspaper, Settings, LogOut, Plus, Trash2, Edit2, Save, X, Info, Lock, Loader2, FileText, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

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

  // 설교 목록 페이징 상태
  const [sermonPage, setSermonPage] = useState(1);
  const itemsPerPage = 10;

  // 설교/소식 폼 상태
  const [formTitle, setFormTitle] = useState('');
  const [formSpeaker, setFormSpeaker] = useState('');
  const [formScripture, setFormScripture] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  useEffect(() => {
    const isInfoChanged = JSON.stringify(localChurchInfo) !== JSON.stringify(churchInfo);
    const isSermonsChanged = JSON.stringify(localSermons) !== JSON.stringify(sermons);
    const isNewsChanged = JSON.stringify(localNews) !== JSON.stringify(news);
    setHasChanges(isInfoChanged || isSermonsChanged || isNewsChanged);
  }, [localChurchInfo, localSermons, localNews, churchInfo, sermons, news]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === churchInfo.adminPassword) {
      setIsLoggedIn(true);
    } else {
      alert('비밀번호가 틀렸습니다.');
    }
  };

  const handleSaveAllToGlobal = async () => {
    try {
      setIsSaving(true);

      const payload = {
        name: localChurchInfo.name,
        pastor: localChurchInfo.pastor,
        address: localChurchInfo.address,
        phone: localChurchInfo.phone,
        password: localChurchInfo.adminPassword,
        worship_schedule: JSON.stringify(localChurchInfo.worshipSchedule),
        greeting: localChurchInfo.greeting,
        vision: localChurchInfo.vision,
        about_content: localChurchInfo.aboutContent,
        pastor_image: localChurchInfo.pastorImage // 페이로드에 이미지 추가
      };
      
      const response = await fetch(`${DB_API_URL}?table=info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'DB 저장에 실패했습니다.');
      }
      
      setChurchInfo(localChurchInfo);
      setSermons(localSermons);
      setNews(localNews);
      
      alert('모든 수정사항이 서버에 저장되었습니다.');
      setHasChanges(false);
    } catch (error) {
      console.error("저장 중 오류:", error);
      alert('저장 실패: ' + (error as Error).message);
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
    } else {
      setEditingItem(null);
      setFormTitle('');
      setFormSpeaker('담임목사');
      setFormScripture('');
      setFormContent('');
      setFormImage('');
      setFormDate(new Date().toISOString().split('T')[0]);
      setFormVideoUrl('');
    }
    setIsAdding(true);
  };

  const handleApplyItemLocal = () => {
    if (!formTitle) return;
    if (activeTab === 'sermons') {
      const videoId = getYoutubeId(formVideoUrl);
      const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : formVideoUrl;
      const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : 'https://picsum.photos/seed/sermon/600/400';

      const data: Sermon = {
        id: editingItem ? editingItem.id : Date.now().toString(),
        title: formTitle,
        speaker: formSpeaker || '담임목사',
        date: formDate,
        videoUrl: embedUrl,
        scripture: formScripture,
        thumbnail: thumbnailUrl
      };
      if (editingItem) setLocalSermons(localSermons.map(s => s.id === editingItem.id ? data : s));
      else setLocalSermons([data, ...localSermons]);
    } else if (activeTab === 'news') {
      const data: News = {
        id: editingItem ? editingItem.id : Date.now().toString(),
        title: formTitle,
        content: formContent,
        date: formDate,
        image: formImage
      };
      if (editingItem) setLocalNews(localNews.map(n => n.id === editingItem.id ? data : n));
      else setLocalNews([data, ...localNews]);
    }
    setIsAdding(false);
  };

  const updateWorshipLocal = (idx: number, key: keyof WorshipItem, val: string) => {
    const schedule = [...localChurchInfo.worshipSchedule];
    schedule[idx] = { ...schedule[idx], [key]: val };
    setLocalChurchInfo({ ...localChurchInfo, worshipSchedule: schedule });
  };

  // 설교 페이징 데이터 계산
  const totalSermonPages = Math.ceil(localSermons.length / itemsPerPage);
  const paginatedSermons = localSermons.slice((sermonPage - 1) * itemsPerPage, sermonPage * itemsPerPage);

  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 px-4">
        <form onSubmit={handleLogin} className="bg-white p-8 md:p-16 rounded-[32px] md:rounded-[48px] shadow-2xl w-full max-w-lg border border-slate-100 text-center">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-[24px] flex items-center justify-center mx-auto mb-8 shadow-inner">
            <LayoutDashboard size={32} />
          </div>
          <h2 className="text-2xl md:text-3xl font-black mb-4">관리자 접속</h2>
          <input 
            type="password" 
            placeholder="비밀번호" 
            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl mb-6 outline-none text-center text-xl font-bold"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            autoFocus
          />
          <button type="submit" className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl hover:scale-[1.02] transition-all">접속하기</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-500 pb-48">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">통합 관리 대시보드</h2>
          <p className="text-slate-400 font-medium">교회 정보를 실시간으로 업데이트하세요.</p>
        </div>
        <button onClick={() => setIsLoggedIn(false)} className="flex items-center px-6 py-3 text-slate-400 hover:text-red-500 font-bold transition-all">
          <LogOut size={18} className="mr-2" /> 로그아웃
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-64 space-y-2 flex md:flex-col overflow-x-auto pb-4 md:pb-0">
          {[
            { id: 'info', icon: Settings, label: '정보 및 소개' },
            { id: 'sermons', icon: BookOpen, label: '설교 관리' },
            { id: 'news', icon: Newspaper, label: '소식 관리' },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`whitespace-nowrap flex items-center px-6 py-4 rounded-2xl text-lg font-black transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-100'}`}
            >
              <tab.icon size={20} className="mr-3" /> {tab.label}
            </button>
          ))}
        </aside>

        <div className="flex-grow bg-white p-8 md:p-12 rounded-[40px] border border-slate-100 shadow-sm min-h-[600px]">
          
          {activeTab === 'info' && (
            <div className="space-y-12 animate-in fade-in">
              {/* 기본 정보 */}
              <section>
                <div className="flex items-center mb-8 border-b border-slate-50 pb-4">
                   <Info size={20} className="text-primary mr-3" />
                   <h3 className="text-2xl font-black">기본 기관 정보</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: '교회 명칭', key: 'name' as keyof ChurchInfo },
                    { label: '담임목사 성함', key: 'pastor' as keyof ChurchInfo },
                    { label: '소재지 주소', key: 'address' as keyof ChurchInfo },
                    { label: '대표 번호', key: 'phone' as keyof ChurchInfo },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="block text-xs font-black text-slate-400 uppercase mb-2">{f.label}</label>
                      <input 
                        type="text" 
                        value={localChurchInfo[f.key] as string} 
                        onChange={(e) => setLocalChurchInfo({ ...localChurchInfo, [f.key]: e.target.value })}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* 담임 목사님 사진 관리 섹션 - 추가됨 */}
              <section className="bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                <div className="flex items-center mb-6">
                   <ImageIcon size={20} className="text-primary mr-3" />
                   <h3 className="text-xl font-black">담임 목사님 사진 관리</h3>
                </div>
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden bg-slate-200 flex-shrink-0 shadow-inner">
                    <img src={localChurchInfo.pastorImage} alt="Pastor Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow w-full">
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2">사진 이미지 URL (직접 입력)</label>
                    <input 
                      type="text" 
                      value={localChurchInfo.pastorImage} 
                      onChange={(e) => setLocalChurchInfo({ ...localChurchInfo, pastorImage: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 mb-2"
                    />
                    <p className="text-[10px] text-slate-400 font-medium">* 외부 이미지 링크 또는 서버에 업로드된 URL을 입력해 주세요.</p>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center mb-8 border-b border-slate-50 pb-4">
                   <FileText size={20} className="text-primary mr-3" />
                   <h3 className="text-2xl font-black">교회 소개 상세 편집</h3>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2">담임목사 인사말 요약 (Greeting)</label>
                    <textarea 
                      rows={3}
                      value={localChurchInfo.greeting} 
                      onChange={(e) => setLocalChurchInfo({ ...localChurchInfo, greeting: e.target.value })}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 leading-relaxed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2">교회 비전 (Vision Statement)</label>
                    <input 
                      type="text"
                      value={localChurchInfo.vision} 
                      onChange={(e) => setLocalChurchInfo({ ...localChurchInfo, vision: e.target.value })}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2">교회 상세 역사 및 소개 (About Content)</label>
                    <textarea 
                      rows={6}
                      value={localChurchInfo.aboutContent} 
                      onChange={(e) => setLocalChurchInfo({ ...localChurchInfo, aboutContent: e.target.value })}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 leading-relaxed"
                    />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-black mb-8 border-b border-slate-50 pb-4">예배 일정 관리</h3>
                <div className="space-y-4">
                  {localChurchInfo.worshipSchedule.map((w, i) => (
                    <div key={i} className="flex gap-4">
                      <input type="text" value={w.title} onChange={(e) => updateWorshipLocal(i, 'title', e.target.value)} className="flex-grow px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" placeholder="예배명" />
                      <input type="text" value={w.time} onChange={(e) => updateWorshipLocal(i, 'time', e.target.value)} className="w-48 px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" placeholder="시간" />
                    </div>
                  ))}
                </div>
              </section>

              <section className="p-8 bg-amber-50 rounded-3xl border border-amber-100">
                <div className="flex items-center mb-4 text-amber-600">
                  <Lock size={18} className="mr-2" />
                  <h4 className="font-black text-lg">보안 비밀번호 수정</h4>
                </div>
                <input 
                  type="text" 
                  value={localChurchInfo.adminPassword} 
                  onChange={(e) => setLocalChurchInfo({ ...localChurchInfo, adminPassword: e.target.value })}
                  className="w-full px-5 py-3 bg-white border border-amber-200 rounded-xl font-bold text-slate-700"
                />
              </section>
            </div>
          )}

          {activeTab === 'sermons' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black">설교 목록 ({localSermons.length})</h3>
                <button onClick={() => openForm('add')} className="px-6 py-3 bg-primary text-white font-black rounded-xl flex items-center shadow-lg transition-all hover:scale-105"><Plus size={18} className="mr-2" /> 설교 추가</button>
              </div>
              <div className="space-y-4">
                {paginatedSermons.map(s => (
                  <div key={s.id} className="flex items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                    <img src={s.thumbnail} className="w-24 h-16 object-cover rounded-lg mr-6 shadow-sm" alt="" />
                    <div className="flex-grow">
                      <h4 className="text-lg font-black text-slate-900 mb-1">{s.title}</h4>
                      <p className="text-slate-400 font-bold text-sm">{s.date} • {s.speaker} • {s.scripture}</p>
                    </div>
                    <div className="flex space-x-1">
                      <button onClick={() => openForm('edit', s)} className="p-2 text-slate-400 hover:text-primary transition-colors"><Edit2 size={18} /></button>
                      <button onClick={() => setLocalSermons(localSermons.filter(item => item.id !== s.id))} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>

              {/* 관리자 설교 페이징 추가 */}
              {totalSermonPages > 1 && (
                <div className="flex justify-center items-center space-x-3 pt-8">
                  <button 
                    disabled={sermonPage === 1}
                    onClick={() => setSermonPage(p => p - 1)}
                    className="p-2 rounded-lg bg-slate-100 disabled:opacity-30"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="font-black text-slate-600">{sermonPage} / {totalSermonPages}</span>
                  <button 
                    disabled={sermonPage === totalSermonPages}
                    onClick={() => setSermonPage(p => p + 1)}
                    className="p-2 rounded-lg bg-slate-100 disabled:opacity-30"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'news' && (
            <div className="space-y-8 animate-in fade-in">
               <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black">교회 소식</h3>
                <button onClick={() => openForm('add')} className="px-6 py-3 bg-primary text-white font-black rounded-xl flex items-center shadow-lg transition-all hover:scale-105"><Plus size={18} className="mr-2" /> 소식 추가</button>
              </div>
              <div className="space-y-4">
                {localNews.map(n => (
                  <div key={n.id} className="flex items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    {n.image && <img src={n.image} className="w-16 h-16 object-cover rounded-lg mr-6" alt="" />}
                    <div className="flex-grow">
                      <h4 className="text-lg font-black text-slate-900 mb-1">{n.title}</h4>
                      <p className="text-slate-400 font-bold text-sm">{n.date}</p>
                    </div>
                    <div className="flex space-x-1">
                      <button onClick={() => openForm('edit', n)} className="p-2 text-slate-400 hover:text-primary"><Edit2 size={18} /></button>
                      <button onClick={() => setLocalNews(localNews.filter(item => item.id !== n.id))} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 저장 바 */}
      <div className={`fixed bottom-0 left-0 right-0 p-6 z-[100] transition-all duration-500 ${hasChanges ? 'bg-slate-900 translate-y-0' : 'bg-slate-800 translate-y-2 opacity-0 pointer-events-none'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-white">
            <p className="text-xl font-black text-amber-400">변경사항 저장 필요</p>
            <p className="text-white/40 text-sm font-medium">수정된 내용을 서버에 반영하려면 저장 버튼을 누르세요.</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => { setLocalChurchInfo(churchInfo); setLocalSermons(sermons); setLocalNews(news); setHasChanges(false); }} className="px-8 py-4 bg-white/5 text-white/50 font-black rounded-2xl hover:bg-white/10">취소</button>
            <button 
              onClick={handleSaveAllToGlobal} 
              disabled={isSaving}
              className="px-12 py-4 bg-primary text-white font-black rounded-2xl shadow-2xl transition-all hover:scale-[1.02] flex items-center"
            >
              {isSaving ? <Loader2 size={20} className="mr-2 animate-spin" /> : <Save size={20} className="mr-2" />}
              서버에 최종 저장
            </button>
          </div>
        </div>
      </div>

      {/* 추가/수정 모달 */}
      {isAdding && (activeTab === 'sermons' || activeTab === 'news') && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in duration-300">
            <button onClick={() => setIsAdding(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900"><X size={28} /></button>
            <h3 className="text-2xl font-black mb-8">{editingItem ? '항목 수정' : '새 항목 추가'}</h3>
            <div className="space-y-6 mb-10">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">제목</label>
                <input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" />
              </div>
              
              {activeTab === 'sermons' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase mb-2">강사명 (이름)</label>
                      <input type="text" value={formSpeaker} onChange={e => setFormSpeaker(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase mb-2">성경 본문</label>
                      <input type="text" value={formScripture} onChange={e => setFormScripture(e.target.value)} placeholder="예: 요한복음 3:16" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2">유튜브 URL</label>
                    <input type="text" value={formVideoUrl} onChange={e => setFormVideoUrl(e.target.value)} placeholder="https://youtube.com/..." className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" />
                  </div>
                </>
              )}

              {activeTab === 'news' && (
                <>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2">이미지 URL</label>
                    <input type="text" value={formImage} onChange={e => setFormImage(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2">내용</label>
                    <textarea rows={4} value={formContent} onChange={e => setFormContent(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold leading-relaxed" />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">날짜</label>
                <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" />
              </div>
            </div>
            <button onClick={handleApplyItemLocal} className="w-full py-5 bg-primary text-white font-black rounded-2xl shadow-xl">반영하기</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
