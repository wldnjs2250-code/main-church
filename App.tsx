
import React, { useState, useEffect } from 'react';
import { Page, Sermon, News, ChurchInfo } from './types.ts';
import { INITIAL_CHURCH_INFO, INITIAL_SERMONS, INITIAL_NEWS } from './constants.tsx';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import Home from './pages/Home.tsx';
import About from './pages/About.tsx';
import Sermons from './pages/Sermons.tsx';
import Community from './pages/Community.tsx';
import Location from './pages/Location.tsx';
import Admin from './pages/Admin.tsx';

// netlify.toml의 리다이렉트 설정을 활용한 깔끔한 API 경로
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
            const res = await fetch(`${DB_API_URL}?table=${tableName}`);
            
            if (res.status === 404) {
              console.warn(`[API 404] ${tableName} 테이블 정보를 찾을 수 없습니다. 기본 데이터를 사용합니다.`);
              return null;
            }

            if (!res.ok) {
              const errorText = await res.text();
              console.error(`[Fetch Error] ${tableName}: ${res.status}`, errorText);
              return null;
            }
            
            return await res.json();
          } catch (e) {
            console.error(`[Network Error] ${tableName}:`, e);
            return null;
          }
        };

        const [infoData, sermonsData, newsData] = await Promise.all([
          fetchTable('info'),
          fetchTable('sermons'),
          fetchTable('news')
        ]);

        if (Array.isArray(infoData) && infoData.length > 0) {
          const raw = infoData[0];
          setChurchInfo({
            ...INITIAL_CHURCH_INFO,
            ...raw,
            adminPassword: raw.password || raw.adminPassword || INITIAL_CHURCH_INFO.adminPassword,
            worshipSchedule: (() => {
              const schedule = raw.worship_schedule || raw.worshipSchedule;
              if (typeof schedule === 'string') {
                try { return JSON.parse(schedule); } catch (e) { return INITIAL_CHURCH_INFO.worshipSchedule; }
              }
              return Array.isArray(schedule) ? schedule : INITIAL_CHURCH_INFO.worshipSchedule;
            })()
          });
        }

        if (Array.isArray(sermonsData) && sermonsData.length > 0) {
          setSermons(sermonsData);
        }

        if (Array.isArray(newsData) && newsData.length > 0) {
          setNews(newsData);
        }

      } catch (error) {
        console.error("데이터 초기 로딩 중 오류 발생:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as Page;
      if (Object.values(Page).includes(hash)) {
        setCurrentPage(hash);
      } else {
        setCurrentPage(Page.Home);
      }
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
      case Page.Home:
        return <Home churchInfo={churchInfo} latestSermon={sermons[0]} allSermons={sermons} recentNews={news.slice(0, 3)} onNavigate={setCurrentPage} />;
      case Page.About:
        return <About churchInfo={churchInfo} />;
      case Page.Sermons:
        return <Sermons sermons={sermons} />;
      case Page.Community:
        return <Community news={news} />;
      case Page.Location:
        return <Location churchInfo={churchInfo} />;
      case Page.Admin:
        return <Admin churchInfo={churchInfo} setChurchInfo={setChurchInfo} sermons={sermons} setSermons={setSermons} news={news} setNews={setNews} />;
      default:
        return <Home churchInfo={churchInfo} latestSermon={sermons[0]} allSermons={sermons} recentNews={news.slice(0, 3)} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} churchName={churchInfo.name} />
      <main className="flex-grow pt-20">
        {renderPage()}
      </main>
      <Footer churchInfo={churchInfo} />
    </div>
  );
};

export default App;
