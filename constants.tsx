
import { Sermon, News, ChurchInfo } from './types';

export const INITIAL_CHURCH_INFO: ChurchInfo = {
  name: '산전온누리교회',
  pastor: '김온누리 담임목사',
  pastorImage: 'https://picsum.photos/seed/pastor/400/400',
  adminPassword: '0000',
  greeting: '하나님의 사랑이 가득한 산전온누리교회에 오신 것을 진심으로 환영합니다.',
  vision: '하나님을 기쁘시게, 세상을 아름답게 하는 제자 공동체',
  address: '울산광역시 중구 산전길 103 (동동 162-4)',
  phone: '052-297-0691',
  kakaoUrl: 'https://pf.kakao.com',
  instagramUrl: 'https://instagram.com',
  youtubeUrl: 'https://youtube.com',
  worshipSchedule: [
    { title: '주일 1부 예배', time: '오전 11:00' },
    { title: '주일 2부 예배', time: '오후 1:30' },
    { title: '수요 기도회', time: '오후 8:00' },
    { title: '금요 기도회', time: '오후 8:00' },
  ],
  aboutContent: '산전온누리교회는 하나님의 영광이 가득하며, 모든 성도가 주님의 제자로 성장하는 공동체입니다. 우리는 성경의 권위를 인정하며 복음의 능력을 믿습니다.',
};

export const INITIAL_SERMONS: Sermon[] = [
  {
    id: '1',
    title: '참된 평안의 길',
    speaker: '김온누리 목사',
    date: '2024-05-19',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    scripture: '요한복음 14:27',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
  },
  {
    id: '2',
    title: '믿음으로 승리하는 삶',
    speaker: '김온누리 목사',
    date: '2024-05-12',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    scripture: '히브리서 11:1-3',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
  },
  {
    id: '3',
    title: '사랑으로 역사하는 믿음',
    speaker: '김온누리 목사',
    date: '2024-05-05',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    scripture: '갈라디아서 5:6',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
  }
];

export const INITIAL_NEWS: News[] = [
  {
    id: '1',
    title: '2024 전교인 체육대회 안내',
    content: '오는 6월 1일(토) 오전 10시부터 운동장에서 전교인 체육대회가 열립니다.',
    date: '2024-05-15',
    image: 'https://picsum.photos/seed/news1/600/400'
  }
];
