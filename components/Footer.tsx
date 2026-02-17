
import React from 'react';
import { ChurchInfo } from '../types';
import { Phone, MapPin, Youtube, Instagram, MessageCircle } from 'lucide-react';

interface FooterProps {
  churchInfo: ChurchInfo;
}

const Footer: React.FC<FooterProps> = ({ churchInfo }) => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-black mb-4 md:mb-6 text-slate-900">{churchInfo.name}</h3>
            <p className="text-slate-500 mb-6 leading-relaxed text-sm md:text-base break-keep">
              {churchInfo.vision}
            </p>
            <div className="flex justify-center md:justify-start space-x-4">
              <a href={churchInfo.youtubeUrl} target="_blank" rel="noreferrer" className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-red-600 hover:border-red-600 transition-all">
                <Youtube size={20} />
              </a>
              <a href={churchInfo.instagramUrl} target="_blank" rel="noreferrer" className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-pink-600 hover:border-pink-600 transition-all">
                <Instagram size={20} />
              </a>
              <a href={churchInfo.kakaoUrl} target="_blank" rel="noreferrer" className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:yellow-600 hover:border-yellow-600 transition-all">
                <MessageCircle size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 text-center md:text-left">연락처 및 위치</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="text-primary mr-3 flex-shrink-0" size={18} />
                <span className="text-slate-600 text-sm">{churchInfo.address}</span>
              </li>
              <li className="flex items-center">
                <Phone className="text-primary mr-3 flex-shrink-0" size={18} />
                <span className="text-slate-600 text-sm">{churchInfo.phone}</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 text-center md:text-left">예배 안내</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              {churchInfo.worshipSchedule.map((item, idx) => (
                <li key={idx} className="flex items-center border-b border-slate-100 pb-2">
                  <span className="flex-grow text-left">{item.title}</span>
                  {/* 정렬 최적화: 고정 너비와 tabular-nums를 사용하여 '오전/오후' 라인을 맞춤 */}
                  <span className="font-bold w-24 text-left pl-2 whitespace-nowrap">
                    {item.time}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest gap-4">
          <p>© 2024 {churchInfo.name}. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
