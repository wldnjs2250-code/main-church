
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

// Netlify Functions 호출을 위한 API 경로 (netlify.toml의 리다이렉트 활용)
const DB_API_URL = '/.netlify/functions/db';

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
          // 404 에러 발생 시 빠르게 catch로 넘기기 위해 timeout이나 에러 핸들링 강화
          try {
            const res = await fetch(`${DB_API_URL}?table=${tableName}`);
            
            if (res.status === 404) {
              console.warn(`API Endpoint not found (404) for [${tableName}]. Using local constants.`);
              return null; // 404인 경우 null 반환하여 초기값 유지 유도
            }

            if (!res.ok) {
              const errorText = await res.text();
              console.error(`Fetch Error [${tableName}]: Status ${res.status}`, errorText);
              return null;
            }
            
            return await res.json();
          } catch (e) {
            console.error(`Network or Parsing Error [${tableName}]:`, e);
            return null;
          }
        };

        const [infoData, sermonsData, newsData] = await Promise.all([
          fetchTable('info'),
          fetchTable('sermons'),
          fetchTable('news')
        ]);

        // 1. 교회 정보 처리
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
        } else {
          setChurchInfo(INITIAL_CHURCH_INFO);
        }

        // 2. 설교 데이터 처리
        if (Array.isArray(sermonsData) && sermonsData.length > 0) {
          setSermons(sermonsData);
        } else {
          setSermons(INITIAL_SERMONS);
        }

        // 3. 소식 데이터 처리
        if (Array.isArray(newsData) && newsData.length > 0) {
          setNews(newsData);
        } else {
          setNews(INITIAL_NEWS);
        }

      } catch (error) {
        console.error("데이터 로딩 중 예상치 못한 오류:", error);
        // 오류 발생 시 전체 초기화
        setChurchInfo(INITIAL_CHURCH_INFO);
        setSermons(INITIAL_SERMONS);
        setNews(INITIAL_NEWS);
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
