
import React, { useState } from 'react';
import { Page } from '../types';
import { Menu, X, User } from 'lucide-react';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  churchName: string;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate, churchName }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: '홈', page: Page.Home },
    { label: '교회소개', page: Page.About },
    { label: '예배/설교', page: Page.Sermons },
    { label: '교제/소식', page: Page.Community },
    { label: '오시는길', page: Page.Location },
  ];

  const handleNav = (page: Page) => {
    window.location.hash = page;
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div 
            className="flex items-center cursor-pointer group"
            onClick={() => handleNav(Page.Home)}
          >
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center">
              {churchName}
            </h1>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => handleNav(item.page)}
                className={`text-sm font-semibold transition-colors ${
                  currentPage === item.page 
                  ? 'text-primary' 
                  : 'text-slate-600 hover:text-primary'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button 
              onClick={() => handleNav(Page.Admin)}
              className="p-2 text-slate-400 hover:text-primary transition-colors"
              title="관리자"
            >
              <User size={20} />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-600 p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 animate-in fade-in slide-in-from-top-4">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => handleNav(item.page)}
                className={`block w-full text-left px-3 py-4 text-base font-medium ${
                  currentPage === item.page 
                  ? 'text-primary bg-accent' 
                  : 'text-slate-600'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => handleNav(Page.Admin)}
              className="block w-full text-left px-3 py-4 text-base font-medium text-slate-500"
            >
              관리자 로그인
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
