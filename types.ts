
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
  greeting: string;
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
