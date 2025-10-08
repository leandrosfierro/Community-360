export enum SocialNetwork {
  Instagram = 'Instagram',
  TikTok = 'TikTok',
  LinkedIn = 'LinkedIn',
}

export enum Tone {
  Formal = 'Formal',
  Institutional = 'Institucional',
  Commercial = 'Comercial',
  Friendly = 'Cercano / amigable',
  Inspirational = 'Frase destacada / inspiracional',
  Humorous = 'Con humor',
  Neutral = 'Neutro',
}

export enum CopyLength {
  Short = 'corto',
  Medium = 'medio',
  Long = 'largo',
}

export enum Language {
  Spanish = 'Español',
  English = 'Inglés',
}

export enum PostFormat {
  Post = 'Post (Muro/Feed)',
  Story = 'Historia',
  Reel = 'Reel / Video corto'
}

export enum TemplateType {
  Full = 'Plantilla completa',
  Logo = 'Logo (marca de agua)',
}

export interface PostInput {
  idea: string;
  userProfile?: string;
  image?: {
    base64: string;
    mimeType: string;
  };
  pdf?: {
    base64: string;
    mimeType: string;
  };
  template?: {
    base64: string;
    mimeType: string;
    type: TemplateType;
  };
  socialNetwork: SocialNetwork;
  postFormat: PostFormat;
  tones: Tone[];
  copyLength: CopyLength;
  language: Language;
  includeCta: boolean;
  includeHashtags: boolean;
  usernames: {
    useGlobal: boolean;
    global: string;
    instagram: string;
    tiktok: string;
    linkedin: string;
  };
  monthlyPostTones?: Tone[];
}

export interface ScoreCategory {
  score: number;
  feedback: string;
}

export interface PostAnalysis {
    engagement: ScoreCategory;
    clarity: ScoreCategory;
    hashtags: ScoreCategory;
    visual: ScoreCategory;
}


export interface GeneratedPost {
  title?: string;
  mainCopy: string;
  variants: string[];
  hashtags: string;
  cta: string;
  tip?: string;
  generatedImage?: {
    base64: string;
    mimeType: string;
  };
  initialImagePrompt: string;
  generatedVideoUrl?: string;
  analysis?: PostAnalysis;
  postFormat: PostFormat;
}

export interface MonthlyProgress {
  active: boolean;
  currentStep: number;
  totalSteps: number;
  message: string;
  percentage: number;
}