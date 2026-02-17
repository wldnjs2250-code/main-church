
import React from 'react';
import { ChurchInfo } from '../types';

interface AboutProps {
  churchInfo: ChurchInfo;
}

const About: React.FC<AboutProps> = ({ churchInfo }) => {
  return (
    <div className="animate-in fade-in duration-500">
      <section className="bg-slate-900 py-24 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-extrabold text-white mb-6">교회 소개</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">{churchInfo.vision}</p>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-12 md:p-20 rounded-[48px] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            
            <div className="flex flex-col md:flex-row items-center gap-16 mb-20">
              <div className="w-56 h-56 bg-slate-100 rounded-[40px] overflow-hidden flex-shrink-0 shadow-lg border-4 border-white">
                <img src={churchInfo.pastorImage} alt="Pastor" className="w-full h-full object-cover" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-3xl font-black mb-2 text-slate-900">{churchInfo.greetingTitle}</h3>
                <p className="text-primary font-black text-xl mb-8">{churchInfo.pastor}</p>
                <div className="w-16 h-1.5 bg-primary/20 rounded-full mb-8 mx-auto md:mx-0"></div>
                <p className="text-slate-600 leading-relaxed italic text-xl whitespace-pre-line font-medium">
                  "{churchInfo.greeting}"
                </p>
              </div>
            </div>
            
            <div className="space-y-12">
              <div className="p-10 bg-slate-50 rounded-[32px] border border-slate-100">
                 <h4 className="text-2xl font-black text-slate-900 mb-6">{churchInfo.visionTitle}</h4>
                 <p className="text-2xl font-bold text-primary leading-tight italic">"{churchInfo.vision}"</p>
              </div>
              
              <div className="text-slate-600 leading-loose text-lg whitespace-pre-line font-medium px-4">
                {churchInfo.aboutContent}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
