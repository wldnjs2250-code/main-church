
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

        if (infoData && typeof infoData === 'object' && !Array.isArray(infoData)) {
          const raw = infoData as any;
          if (raw.id || raw.name) {
            let parsedWorshipSchedule = INITIAL_CHURCH_INFO.worshipSchedule;
            try {
              if (typeof raw.worship_schedule === 'string') {
                parsedWorshipSchedule = JSON.parse(raw.worship_schedule);
              } else if (Array.isArray(raw.worship_schedule)) {
                parsedWorshipSchedule = raw.worship_schedule;
              } else if (Array.isArray(raw.worshipSchedule)) {
                parsedWorshipSchedule = raw.worshipSchedule;
              }
            } catch (e) {
              console.error("Worship schedule parse error:", e);
            }

            setChurchInfo({
              ...INITIAL_CHURCH_INFO,
              ...raw,
              name: raw.name || INITIAL_CHURCH_INFO.name,
              greetingTitle: raw.greeting_title ? raw.greeting_title : "환영합니다",
              visionTitle: raw.vision_title || raw.visionTitle || INITIAL_CHURCH_INFO.visionTitle,
              pastorImage: raw.pastor_image || raw.pastorImage || INITIAL_CHURCH_INFO.pastorImage,
              adminPassword: raw.password || raw.adminPassword || INITIAL_CHURCH_INFO.adminPassword,
              greeting: raw.greeting || INITIAL_CHURCH_INFO.greeting,
              vision: raw.vision || INITIAL_CHURCH_INFO.vision,
              aboutContent: raw.about_content || raw.aboutContent || INITIAL_CHURCH_INFO.aboutContent,
              youtubeUrl: raw.youtube_url || raw.youtubeUrl || INITIAL_CHURCH_INFO.youtubeUrl,
              instagramUrl: raw.instagram_url || raw.instagramUrl || INITIAL_CHURCH_INFO.instagramUrl,
              kakaoUrl: raw.kakao_url || raw.kakaoUrl || INITIAL_CHURCH_INFO.kakaoUrl,
              worshipSchedule: parsedWorshipSchedule
            });
          }
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
