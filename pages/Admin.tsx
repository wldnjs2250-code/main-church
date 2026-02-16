
import React, { useState, useEffect } from 'react';
import { ChurchInfo, Sermon, News, WorshipItem } from '../types';
import { LayoutDashboard, BookOpen, Newspaper, Settings, LogOut, Plus, Trash2, Edit2, Save, X, Info, Lock, Loader2 } from 'lucide-react';

interface AdminProps {
  churchInfo: ChurchInfo;
  setChurchInfo: (info: ChurchInfo) => void;
  sermons: Sermon[];
  setSermons: (sermons: Sermon[]) => void;
  news: News[];
  setNews: (news: News[]) => void;
}

// Netlify 서버리스 함수 경로
const DB_API_URL = '/.netlify/functions/db';

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

  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formScripture, setFormScripture] = useState('');

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
        worship_schedule: JSON.stringify(localChurchInfo.worshipSchedule)
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
      
      alert('모든 수정사항이 네온DB에 안전하게 저장되었습니다.');
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
      setFormContent(item.content || '');
      setFormImage(item.image || '');
      setFormDate(item.date || '');
      setFormVideoUrl(item.videoUrl || '');
      setFormScripture(item.scripture || '');
    } else {
      setEditingItem(null);
      setFormTitle('');
      setFormContent('');
      setFormImage('');
      setFormDate(new Date().toISOString().split('T')[0]);
      setFormVideoUrl('');
      setFormScripture('');
    }
    setIsAdding(true);
  };

  const handleApplyItemLocal = () => {
    if (!formTitle) return;
    if (activeTab === 'sermons') {
      const videoId = getYoutubeId(formVideoUrl);
      const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}` : formVideoUrl;
      const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=1000&auto=format&fit=crop';

      const data = {
        id: editingItem ? editingItem.id : Date.now().toString(),
        title: formTitle,
        speaker: '담임목사',
        date: formDate,
        videoUrl: embedUrl,
        scripture: formScripture,
        thumbnail: thumbnailUrl
      };
      if (editingItem) setLocalSermons(localSermons.map(s => s.id === editingItem.id ? data : s));
      else setLocalSermons([data, ...localSermons]);
    } else if (activeTab === 'news') {
      const data = {
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

  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 px-4">
        <form onSubmit={handleLogin} className="bg-white p-8 md:p-16 rounded-[32px] md:rounded-[48px] shadow-2xl w-full max-w-lg border border-slate-100 text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 text-primary rounded-[24px] md:rounded-[32px] flex items-center justify-center mx-auto mb-8 md:mb-10 shadow-inner">
            <LayoutDashboard size={32} className="md:w-10 md:h-10" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black mb-4">관리자 접속</h2>
          <p className="text-slate-400 mb-8 md:mb-10 font-medium text-sm md:text-base">홈페이지 정보를 수정하려면 암호를 입력하세요.</p>
          <input 
            type="password" 
            placeholder="비밀번호" 
            className="w-full px-6 md:px-8 py-4 md:py-5 bg-slate-50 border border-slate-200 rounded-2xl md:rounded-3xl mb-6 md:mb-8 focus:ring-4 focus:ring-primary/10 transition-all outline-none text-center text-lg md:text-xl font-bold"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            autoFocus
          />
          <button type="submit" className="w-full py-4 md:py-5 bg-primary text-white font-black rounded-2xl md:rounded-3xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">접속하기</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 animate-in fade-in duration-500 pb-48">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 md:mb-16 gap-6 md:gap-8">
        <div className="text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">통합 관리 대시보드</h2>
          <p className="text-slate-400 font-medium text-sm md:text-base">수정 후 하단의 '최종 수정 저장'을 눌러 네온DB에 반영하세요.</p>
        </div>
        <button onClick={() => setIsLoggedIn(false)} className="flex items-center px-6 py-3 text-slate-400 hover:text-red-500 font-bold transition-all text-sm md:text-base">
          <LogOut size={18} className="mr-2" /> 로그아웃
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 md:gap-12">
        <aside className="md:w-72 space-x-2 md:space-x-0 md:space-y-3 flex md:flex-col overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-hide shrink-0 -mx-4 md:mx-0 px-4 md:px-0">
          {[
            { id: 'info', icon: Settings, label: '정보 및 예배' },
            { id: 'sermons', icon: BookOpen, label: '설교 영상' },
            { id: 'news', icon: Newspaper, label: '교회 소식' },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`whitespace-nowrap flex items-center px-6 md:px-8 py-4 md:py-5 rounded-[20px] md:rounded-[24px] text-sm md:text-lg font-black transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-white md:bg-transparent text-slate-500 hover:bg-white hover:text-primary border border-slate-100 md:border-transparent hover:border-slate-100'}`}
            >
              <tab.icon size={20} className="mr-3 md:mr-4 md:w-6 md:h-6" /> {tab.label}
            </button>
          ))}
        </aside>

        <div className="flex-grow bg-white p-6 md:p-16 rounded-[32px] md:rounded-[48px] border border-slate-100 shadow-sm min-h-[500px] md:min-h-[600px] relative">
          
          {activeTab === 'info' && (
            <div className="space-y-12 md:space-y-16 animate-in fade-in duration-500">
              <section>
                <div className="flex items-center mb-6 md:mb-8 border-b border-slate-50 pb-4">
                   <Info size={20} className="text-primary mr-3 md:w-6 md:h-6" />
                   <h3 className="text-xl md:text-2xl font-black">기관 및 보안 설정</h3>
                </div>
                <div className="grid grid-cols-1 gap-6 md:gap-8 max-w-3xl">
                  {[
                    { label: '교회 명칭', key: 'name' as keyof ChurchInfo },
                    { label: '담임목사 성함', key: 'pastor' as keyof ChurchInfo },
                    { label: '소재지 주소', key: 'address' as keyof ChurchInfo },
                    { label: '대표 번호', key: 'phone' as keyof ChurchInfo },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="block text-xs md:text-sm font-black text-slate-400 uppercase tracking-widest mb-2 md:mb-3">{f.label}</label>
                      <input 
                        type="text" 
                        value={localChurchInfo[f.key] as string} 
                        onChange={(e) => setLocalChurchInfo({ ...localChurchInfo, [f.key]: e.target.value })}
                        className="w-full px-5 md:px-8 py-3 md:py-4 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl outline-none font-bold text-slate-700 text-sm md:text-base"
                      />
                    </div>
                  ))}
                  
                  <div className="p-6 md:p-8 bg-amber-50 rounded-[24px] md:rounded-3xl border border-amber-100">
                    <div className="flex items-center mb-4 text-amber-600">
                      <Lock size={18} className="mr-2" />
                      <h4 className="font-black text-base md:text-lg">관리자 보안 설정</h4>
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-black text-amber-800 uppercase tracking-widest mb-2 md:mb-3">접속 비밀번호 수정</label>
                      <input 
                        type="text" 
                        value={localChurchInfo.adminPassword} 
                        onChange={(e) => setLocalChurchInfo({ ...localChurchInfo, adminPassword: e.target.value })}
                        className="w-full px-5 md:px-8 py-3 md:py-4 bg-white border border-amber-200 rounded-xl md:rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-amber-500/20 text-sm md:text-base"
                        placeholder="새로운 비밀번호를 입력하세요"
                      />
                      <p className="mt-2 text-amber-600/70 text-[10px] md:text-xs font-medium">* 저장 시 Neon DB의 'password' 컬럼에 실시간 반영됩니다.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl md:text-2xl font-black mb-6 md:mb-8 border-b border-slate-50 pb-4">예배 일정</h3>
                <div className="space-y-3 md:space-y-4 max-w-3xl">
                  {localChurchInfo.worshipSchedule.map((w, i) => (
                    <div key={i} className="flex flex-col sm:flex-row gap-2 md:gap-4">
                      <input type="text" value={w.title} onChange={(e) => updateWorshipLocal(i, 'title', e.target.value)} className="flex-grow px-5 py-3 md:py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm md:text-base" placeholder="예배명" />
                      <input type="text" value={w.time} onChange={(e) => updateWorshipLocal(i, 'time', e.target.value)} className="w-full sm:w-48 px-5 py-3 md:py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm md:text-base" placeholder="시간" />
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'sermons' && (
            <div className="space-y-8 md:space-y-10 animate-in fade-in duration-500">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-xl md:text-2xl font-black">전체 설교 데이터</h3>
                <button onClick={() => openForm('add')} className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-primary text-white font-black rounded-xl md:rounded-2xl shadow-lg flex items-center justify-center transition-all hover:scale-105"><Plus size={20} className="mr-2" /> 설교 등록</button>
              </div>
              <div className="grid grid-cols-1 gap-4 md:gap-6">
                {localSermons.map(s => (
                  <div key={s.id} className="flex flex-col sm:flex-row items-center p-4 md:p-6 bg-slate-50 rounded-[24px] md:rounded-[32px] border border-slate-100">
                    <img src={s.thumbnail} className="w-full sm:w-40 h-32 sm:h-24 object-cover rounded-xl sm:mr-8 shadow-sm mb-4 sm:mb-0" alt="" />
                    <div className="flex-grow text-center sm:text-left py-2">
                      <h4 className="text-lg md:text-xl font-black text-slate-900 mb-1 leading-tight">{s.title}</h4>
                      <p className="text-slate-400 font-bold text-sm">{s.date} • {s.speaker}</p>
                    </div>
                    <div className="flex space-x-2 mt-4 sm:mt-0">
                      <button onClick={() => openForm('edit', s)} className="p-3 text-slate-400 hover:text-primary"><Edit2 size={20} /></button>
                      <button onClick={() => setLocalSermons(localSermons.filter(item => item.id !== s.id))} className="p-3 text-slate-400 hover:text-red-500"><Trash2 size={20} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'news' && (
            <div className="space-y-8 md:space-y-10 animate-in fade-in duration-500">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-xl md:text-2xl font-black">교회 소식 리스트</h3>
                <button onClick={() => openForm('add')} className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-primary text-white font-black rounded-xl md:rounded-2xl shadow-lg flex items-center justify-center transition-all hover:scale-105"><Plus size={20} className="mr-2" /> 소식 등록</button>
              </div>
              <div className="grid grid-cols-1 gap-4 md:gap-6">
                {localNews.map(n => (
                  <div key={n.id} className="flex flex-col sm:flex-row items-center p-4 md:p-6 bg-slate-50 rounded-[24px] md:rounded-[32px] border border-slate-100">
                    {n.image && <img src={n.image} className="w-full sm:w-20 h-24 sm:h-20 object-cover rounded-xl sm:mr-6 mb-4 sm:mb-0" alt="" />}
                    <div className="flex-grow text-center sm:text-left">
                      <h4 className="text-lg md:text-xl font-black text-slate-900 mb-1 leading-tight">{n.title}</h4>
                      <p className="text-slate-400 font-bold text-sm">{n.date}</p>
                    </div>
                    <div className="flex space-x-2 mt-4 sm:mt-0">
                      <button onClick={() => openForm('edit', n)} className="p-3 text-slate-400 hover:text-primary"><Edit2 size={20} /></button>
                      <button onClick={() => setLocalNews(localNews.filter(item => item.id !== n.id))} className="p-3 text-slate-400 hover:text-red-500"><Trash2 size={20} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`fixed bottom-0 left-0 right-0 p-4 md:p-8 z-[100] border-t border-white/10 transition-all duration-500 ${hasChanges ? 'bg-slate-900 shadow-[0_-20px_50px_rgba(0,0,0,0.4)] translate-y-0' : 'bg-slate-800 translate-y-2 opacity-80'}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
          <div className="flex items-center text-white w-full md:w-auto">
            <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full mr-3 md:mr-4 ${hasChanges ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'}`}></div>
            <div className="text-left">
              <p className={`text-base md:text-xl font-black uppercase tracking-wider ${hasChanges ? 'text-amber-400' : 'text-slate-400'}`}>
                {hasChanges ? '변경사항 저장 필요' : '최신 상태'}
              </p>
              <p className="text-white/40 font-bold text-[10px] md:text-sm">수정 내용을 네온DB에 반영해 주세요.</p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            {hasChanges && (
              <button onClick={() => { setLocalChurchInfo(churchInfo); setLocalSermons(sermons); setLocalNews(news); }} className="flex-1 md:px-8 py-3 md:py-5 bg-white/5 text-white/50 font-black rounded-xl md:rounded-[24px] hover:bg-white/10 text-sm md:text-base">취소</button>
            )}
            <button 
              onClick={handleSaveAllToGlobal} 
              disabled={!hasChanges || isSaving}
              className={`flex-[2] md:px-16 py-3 md:py-5 font-black rounded-xl md:rounded-[24px] transition-all flex items-center justify-center text-sm md:text-base ${hasChanges && !isSaving ? 'bg-primary text-white shadow-2xl shadow-primary/40 hover:scale-[1.02]' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
            >
              {isSaving ? <Loader2 size={20} className="mr-2 animate-spin" /> : <Save size={20} className="mr-2 md:mr-3 md:w-6 md:h-6" />}
              {isSaving ? 'DB에 저장 중...' : '최종 수정 저장 (반영)'}
            </button>
          </div>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] md:rounded-[48px] p-8 md:p-12 max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative animate-in zoom-in duration-300">
            <button onClick={() => setIsAdding(false)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-900"><X size={28} /></button>
            <h3 className="text-2xl md:text-3xl font-black mb-8 text-slate-900">{editingItem ? '로컬 수정' : '항목 추가'}</h3>
            <div className="space-y-6 mb-10">
              <div>
                <label className="block text-xs md:text-sm font-black text-slate-400 uppercase mb-2">제목</label>
                <input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)} className="w-full px-5 md:px-8 py-3 md:py-4 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl outline-none font-bold text-sm md:text-base" />
              </div>
              {activeTab === 'sermons' && (
                <>
                  <div>
                    <label className="block text-xs md:text-sm font-black text-slate-400 uppercase mb-2">유튜브 URL</label>
                    <input 
                      type="text" 
                      value={formVideoUrl} 
                      onChange={e => setFormVideoUrl(e.target.value)} 
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-5 md:px-8 py-3 md:py-4 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl outline-none font-bold text-sm md:text-base" 
                    />
                  </div>
                </>
              )}
              {activeTab === 'news' && (
                <>
                  <div>
                    <label className="block text-xs md:text-sm font-black text-slate-400 uppercase mb-2">이미지 URL (링크)</label>
                    <input type="text" value={formImage} onChange={e => setFormImage(e.target.value)} placeholder="https://..." className="w-full px-5 md:px-8 py-3 md:py-4 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl outline-none font-bold text-sm md:text-base" />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-black text-slate-400 uppercase mb-2">내용</label>
                    <textarea rows={4} value={formContent} onChange={e => setFormContent(e.target.value)} className="w-full px-5 md:px-8 py-3 md:py-4 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl outline-none font-bold text-sm md:text-base" />
                  </div>
                </>
              )}
              <div>
                <label className="block text-xs md:text-sm font-black text-slate-400 uppercase mb-2">일자</label>
                <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="w-full px-5 md:px-8 py-3 md:py-4 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl outline-none font-bold text-sm md:text-base" />
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={handleApplyItemLocal} className="flex-grow py-4 md:py-5 bg-primary text-white font-black rounded-2xl md:rounded-3xl shadow-xl text-sm md:text-base">임시 저장 (반영 대기)</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
