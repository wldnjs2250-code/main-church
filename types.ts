
export interface Sermon {
  id: string;
  title: string;
  speaker: string;
  date: string;
  videoUrl: string;
  scripture: string;
  thumbnail: string;
}

export interface News {
  id: string;
  title: string;
  content: string;
  date: string;
  image?: string;
  is_pinned?: boolean; // 상단 고정 여부
}

export interface WorshipItem {
  title: string;
  time: string;
}

export interface ChurchInfo {
  name: string;
  pastor: string;
  pastorImage: string;
  adminPassword: string;
  greetingTitle: string; // 추가: "담임목사 인사말" 등 제목 수정용
  greeting: string;
  visionTitle: string;    // 추가: "우리의 비전" 등 제목 수정용
  vision: string;
  address: string;
  phone: string;
  kakaoUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  worshipSchedule: WorshipItem[];
  aboutContent: string;
}

export enum Page {
  Home = 'home',
  About = 'about',
  Sermons = 'sermons',
  Community = 'community',
  Location = 'location',
  Admin = 'admin'
}
