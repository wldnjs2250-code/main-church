
import React, { useState, useEffect } from 'react';
import { Page, Sermon, News, ChurchInfo } from './types';
import { INITIAL_CHURCH_INFO, INITIAL_SERMONS, INITIAL_NEWS } from './constants';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Sermons from './pages/Sermons';
import Community from './pages/Community';
import Location from './pages/Location';
import Admin from './pages/Admin';

const DB_API_URL = '/api/db';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
  const [churchInfo, setChurchInfo] = useState<ChurchInfo>(INITIAL_CHURCH_INFO);
  const [sermons, setSermons] = useState<Sermon[]>(INITIAL_SERMONS);
  const [news, setNews] = useState<News[]>(INITIAL_NEWS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const fetchTable = async (tableName: string) => {
          try {
            // 사용자 요청 API 구조에 따라 'table' 대신 'sheet' 파라미터 사용
            const res = await fetch(`${DB_API_URL}?sheet=${tableName}`);
            if (!res.ok) return null;
            return await res.json();
          } catch (e) {
            return null;
          }
        };

        const [infoData, sermonsData, newsData] = await Promise.all([
          fetchTable('info'),
          fetchTable('sermons'),
          fetchTable('news')
        ]);

        // 새로운 API는 info 호출 시 배열이 아닌 단일 객체를 반환함
        if (infoData && typeof infoData === 'object' && !Array.isArray(infoData)) {
          const raw = infoData as any;
          if (raw.id || raw.name) { // 유효한 데이터인지 확인
            setChurchInfo({
              ...INITIAL_CHURCH_INFO,
              ...raw,
              pastorImage: raw.pastor_image || raw.pastorImage || INITIAL_CHURCH_INFO.pastorImage,
              adminPassword: raw.password || INITIAL_CHURCH_INFO.adminPassword,
              greeting: raw.greeting || INITIAL_CHURCH_INFO.greeting,
              vision: raw.vision || INITIAL_CHURCH_INFO.vision,
              aboutContent: raw.about_content || raw.aboutContent || INITIAL_CHURCH_INFO.aboutContent,
              worshipSchedule: typeof raw.worship_schedule === 'string' ? JSON.parse(raw.worship_schedule) : (Array.isArray(raw.worship_schedule) ? raw.worship_schedule : INITIAL_CHURCH_INFO.worshipSchedule)
            });
          }
        } else if (Array.isArray(infoData) && infoData.length > 0) {
          // 기존 배열 방식 호환성 유지
          const raw = infoData[0];
          setChurchInfo({
            ...INITIAL_CHURCH_INFO,
            ...raw,
            pastorImage: raw.pastor_image || raw.pastorImage || INITIAL_CHURCH_INFO.pastorImage,
            adminPassword: raw.password || INITIAL_CHURCH_INFO.adminPassword,
            greeting: raw.greeting || INITIAL_CHURCH_INFO.greeting,
            vision: raw.vision || INITIAL_CHURCH_INFO.vision,
            aboutContent: raw.about_content || raw.aboutContent || INITIAL_CHURCH_INFO.aboutContent,
            worshipSchedule: typeof raw.worship_schedule === 'string' ? JSON.parse(raw.worship_schedule) : (Array.isArray(raw.worship_schedule) ? raw.worship_schedule : INITIAL_CHURCH_INFO.worshipSchedule)
          });
        }
        
        if (Array.isArray(sermonsData)) setSermons(sermonsData.length > 0 ? sermonsData : INITIAL_SERMONS);
        if (Array.isArray(newsData)) setNews(newsData.length > 0 ? newsData : INITIAL_NEWS);
      } catch (error) {
        console.error("Data loading error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as Page;
      if (Object.values(Page).includes(hash)) setCurrentPage(hash);
      else setCurrentPage(Page.Home);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderPage = () => {
    if (isLoading && currentPage !== Page.Admin) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }
    switch (currentPage) {
      case Page.Home: return <Home churchInfo={churchInfo} latestSermon={sermons[0]} allSermons={sermons} recentNews={news.slice(0, 3)} onNavigate={setCurrentPage} />;
      case Page.About: return <About churchInfo={churchInfo} />;
      case Page.Sermons: return <Sermons sermons={sermons} />;
      case Page.Community: return <Community news={news} />;
      case Page.Location: return <Location churchInfo={churchInfo} />;
      case Page.Admin: return <Admin churchInfo={churchInfo} setChurchInfo={setChurchInfo} sermons={sermons} setSermons={setSermons} news={news} setNews={setNews} />;
      default: return <Home churchInfo={churchInfo} latestSermon={sermons[0]} allSermons={sermons} recentNews={news.slice(0, 3)} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} churchName={churchInfo.name} />
      <main className="flex-grow pt-20">{renderPage()}</main>
      <Footer churchInfo={churchInfo} />
    </div>
  );
};

export default App;
