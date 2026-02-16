
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

const SHEETDB_BASE_URL = 'https://sheetdb.io/api/v1/9llt4ltqhe7fo';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
  const [churchInfo, setChurchInfo] = useState<ChurchInfo>(INITIAL_CHURCH_INFO);
  const [sermons, setSermons] = useState<Sermon[]>(INITIAL_SERMONS);
  const [news, setNews] = useState<News[]>(INITIAL_NEWS);
  const [isLoading, setIsLoading] = useState(true);

  // SheetDB 데이터 페칭 로직
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // 3개의 탭에서 동시에 데이터 로드
        const [infoRes, sermonsRes, newsRes] = await Promise.all([
          fetch(`${SHEETDB_BASE_URL}?sheet=church_info`),
          fetch(`${SHEETDB_BASE_URL}?sheet=sermons`),
          fetch(`${SHEETDB_BASE_URL}?sheet=news`)
        ]);

        const infoData = await infoRes.json();
        const sermonsData = await sermonsRes.json();
        const newsData = await newsRes.json();

        if (infoData && infoData.length > 0) {
          const rawInfo = infoData[0];
          // 구글 시트의 컬럼명이 adminPassword 또는 password일 경우를 대비하여 처리
          const fetchedPassword = rawInfo.adminPassword || rawInfo.password || INITIAL_CHURCH_INFO.adminPassword;
          
          setChurchInfo({
            ...rawInfo,
            adminPassword: fetchedPassword, // 시트에서 가져온 비밀번호 적용
            worshipSchedule: typeof rawInfo.worshipSchedule === 'string' 
              ? JSON.parse(rawInfo.worshipSchedule) 
              : (rawInfo.worshipSchedule || INITIAL_CHURCH_INFO.worshipSchedule)
          });
        }

        if (sermonsData && Array.isArray(sermonsData)) {
          setSermons(sermonsData);
        }

        if (newsData && Array.isArray(newsData)) {
          setNews(newsData);
        }
      } catch (error) {
        console.error("데이터를 가져오는 중 오류가 발생했습니다:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sync with Hash for simple routing support
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
    handleHashChange(); // Initial check

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
        return <Home 
          churchInfo={churchInfo} 
          latestSermon={sermons[0]} 
          allSermons={sermons}
          recentNews={news.slice(0, 3)} 
          onNavigate={setCurrentPage} 
        />;
      case Page.About:
        return <About churchInfo={churchInfo} />;
      case Page.Sermons:
        return <Sermons sermons={sermons} />;
      case Page.Community:
        return <Community news={news} />;
      case Page.Location:
        return <Location churchInfo={churchInfo} />;
      case Page.Admin:
        return (
          <Admin 
            churchInfo={churchInfo} 
            setChurchInfo={setChurchInfo} 
            sermons={sermons} 
            setSermons={setSermons} 
            news={news} 
            setNews={setNews} 
          />
        );
      default:
        return <Home 
          churchInfo={churchInfo} 
          latestSermon={sermons[0]} 
          allSermons={sermons}
          recentNews={news.slice(0, 3)} 
          onNavigate={setCurrentPage} 
        />;
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
