import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { GeneratedPost, SocialNetwork, PostInput, PostAnalysis, PostFormat } from '../types';
import { 
    InstagramIcon, TikTokIcon, LinkedInIcon, ShareIcon, DownloadIcon, 
    SparklesIcon, VideoIcon, ClipboardIcon, AtSymbolIcon, ArrowPathIcon, 
    Squares2X2Icon, CheckBadgeIcon, WandIcon, QuestionMarkCircleIcon,
    HeartIcon, ChatBubbleIcon, MusicNoteIcon
} from './icons';
import { refineImage, generateVideo, analyzePost, optimizePost } from '../services/geminiService';

interface ResultsDisplayProps {
  posts: Partial<Record<SocialNetwork, GeneratedPost[]>>;
  setPosts: React.Dispatch<React.SetStateAction<Partial<Record<SocialNetwork, GeneratedPost[]>>>>;
  input: PostInput | null;
  isLoading: boolean;
  error: string | null;
  initialSocialNetwork: SocialNetwork;
  onGenerateAll: () => void;
  onReset: () => void;
}

const LoadingSkeleton: React.FC = () => (
  <div className="bg-white/70 dark:bg-gray-800/50 p-6 sm:p-8 rounded-2xl shadow-lg animate-pulse">
    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
    <div className="space-y-3">
      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-4/6"></div>
    </div>
    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mt-4"></div>
    <div className="aspect-square bg-gray-300 dark:bg-gray-700 rounded-lg mt-6"></div>
  </div>
);

const SocialMockup: React.FC<{ socialNetwork: SocialNetwork; post: GeneratedPost }> = ({ socialNetwork, post }) => {
  const isVertical = post.postFormat === PostFormat.Story || post.postFormat === PostFormat.Reel;
  const containerClass = isVertical ? 'aspect-[9/16]' : 'aspect-square';

  const imagePreview = post.generatedImage ? (
    <img src={`data:image/png;base64,${post.generatedImage.base64}`} alt="AI generated post visual" className="w-full h-full object-cover"/>
  ) : (
    <div className="flex items-center justify-center w-full h-full bg-slate-200 dark:bg-slate-700">
        <span className="text-gray-500">Imagen no disponible</span>
    </div>
  );

  const renderInstagram = () => {
    if (post.postFormat === PostFormat.Reel || post.postFormat === PostFormat.Story) {
      return (
        <div className={`${containerClass} mx-auto max-w-sm border-4 border-black dark:border-gray-700 rounded-3xl overflow-hidden shadow-lg bg-black relative flex flex-col justify-between`}>
          <div className="absolute inset-0">{imagePreview}</div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          
          <div className="relative p-4 flex justify-between items-start text-white">
            <div className="font-bold">{post.postFormat === PostFormat.Reel ? 'Reels' : 'Stories'}</div>
            <div>{/* Icons like close, etc. can go here */}</div>
          </div>
          
          <div className="relative p-4 text-white flex gap-4">
            <div className="flex-grow">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-600"></div>
                <span className="font-semibold text-sm">bs360_oficial</span>
              </div>
              <p className="text-sm mt-2 line-clamp-3">{post.mainCopy}</p>
              <p className="text-sm mt-1 opacity-80">{post.hashtags}</p>
              <div className="flex items-center gap-2 mt-2">
                <MusicNoteIcon className="w-4 h-4" />
                <p className="text-xs">Sonido Original - bs360_oficial</p>
              </div>
            </div>
            {post.postFormat === PostFormat.Reel && (
              <div className="flex flex-col items-center justify-end gap-4">
                <div className="text-center">
                  <HeartIcon className="w-8 h-8"/>
                  <span className="text-xs font-semibold">12.3k</span>
                </div>
                <div className="text-center">
                  <ChatBubbleIcon className="w-8 h-8"/>
                  <span className="text-xs font-semibold">123</span>
                </div>
                <div className="text-center">
                  <ShareIcon className="w-8 h-8"/>
                  <span className="text-xs font-semibold">45</span>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    // Default Instagram Post
    return (
      <div className="border dark:border-gray-700 rounded-lg overflow-hidden shadow-md max-w-md mx-auto">
        <div className="p-3 border-b dark:border-gray-700 flex items-center gap-3 bg-white dark:bg-gray-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-600"></div>
            <span className="font-semibold text-sm">bs360_oficial</span>
        </div>
        <div className={`${containerClass} bg-gray-200 dark:bg-gray-700`}>{imagePreview}</div>
        <div className="p-3 text-sm bg-white dark:bg-gray-800">
            <p><span className="font-semibold">bs360_oficial</span> {post.mainCopy.split('\n\n')[0]}</p>
            <p className="whitespace-pre-wrap mt-2">{post.mainCopy.split('\n\n').slice(1).join('\n\n')}</p>
            <p className="text-gray-500 dark:text-gray-400 mt-2">{post.hashtags}</p>
        </div>
      </div>
    );
  };

  const renderTikTok = () => {
    // TikTok is primarily Reels
     return (
        <div className={`${containerClass} mx-auto max-w-sm border-4 border-black dark:border-gray-700 rounded-3xl overflow-hidden shadow-lg bg-black relative flex flex-col justify-end`}>
            <div className="absolute inset-0">{imagePreview}</div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="relative z-10 p-4 text-white">
                <p className="font-bold">@bs360_oficial</p>
                {post.title && <p className="font-bold text-md mt-2">{post.title}</p>}
                <p className="mt-2 text-sm line-clamp-4">{post.mainCopy}</p>
                <p className="mt-1 text-sm font-semibold">{post.hashtags}</p>
            </div>
             <div className="absolute z-20 bottom-4 right-2 flex flex-col items-center justify-end gap-4 text-white">
                <div className="w-12 h-12 rounded-full bg-blue-500 border-2 border-white"></div>
                <div className="text-center">
                    <HeartIcon className="w-10 h-10"/>
                    <span className="text-sm font-semibold">1.2M</span>
                </div>
                <div className="text-center">
                    <ChatBubbleIcon className="w-10 h-10"/>
                    <span className="text-sm font-semibold">4,5K</span>
                </div>
                <div className="text-center">
                    <ShareIcon className="w-10 h-10"/>
                    <span className="text-sm font-semibold">8,2K</span>
                </div>
            </div>
        </div>
    );
  }

  const renderLinkedIn = () => {
    // LinkedIn is always Post format
    return (
      <div className="border dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-md max-w-lg mx-auto">
          <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-xl shrink-0">B</div>
              <div>
                  <p className="font-semibold">BS360 | Impulsando Bienestar Sostenible</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">1,234 seguidores</p>
              </div>
          </div>
          <div className="mt-3 text-sm whitespace-pre-wrap">
            {post.title && <p className="font-bold mb-2">{post.title}</p>}
            <p>{post.mainCopy}</p>
          </div>
          <div className={`${containerClass} bg-gray-200 dark:bg-gray-700 my-3 rounded-md overflow-hidden`}>{imagePreview}</div>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">{post.hashtags}</p>
      </div>
    );
  }

  switch (socialNetwork) {
    case SocialNetwork.Instagram: return renderInstagram();
    case SocialNetwork.TikTok: return renderTikTok();
    case SocialNetwork.LinkedIn: return renderLinkedIn();
    default: return null;
  }
};

const ScoreDisplay: React.FC<{ label: string; score: number; feedback: string }> = ({ label, score, feedback }) => {
    const getColor = (s: number) => {
        if (s >= 80) return 'text-green-600 dark:text-green-400';
        if (s >= 50) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };
    return (
        <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex justify-between items-baseline">
                <h4 className="font-semibold text-sm">{label}</h4>
                <p className={`font-bold text-lg ${getColor(score)}`}>{score}<span className="text-xs">/100</span></p>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{feedback}</p>
        </div>
    );
};


const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ posts, setPosts, input, isLoading, error, initialSocialNetwork, onGenerateAll, onReset }) => {
  const [activeTab, setActiveTab] = useState<SocialNetwork>(initialSocialNetwork);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showNotification, setShowNotification] = useState<{type: 'copy' | 'publish', text: string} | null>(null);
  
  const [tags, setTags] = useState('');
  const [imageRefinePrompt, setImageRefinePrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);
  
  const [generateVideoEnabled, setGenerateVideoEnabled] = useState(false);
  const [videoPrompt, setVideoPrompt] = useState('');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizeError, setOptimizeError] = useState<string | null>(null);

  const postArray = posts[activeTab] || [];
  const post = postArray[currentIndex];
  const isMonthlyPlan = postArray.length > 1;

  useEffect(() => {
    setActiveTab(initialSocialNetwork);
    setCurrentIndex(0);
  }, [initialSocialNetwork]);
  
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeTab]);

  useEffect(() => {
    if (post) {
      setImageRefinePrompt(post.initialImagePrompt);
      setVideoPrompt(post.mainCopy);
      setTags(''); // Reset tags for each post
    }
  }, [post]);

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => setShowNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const updateCurrentPost = (updatedPost: GeneratedPost) => {
    const newPostsArray = [...postArray];
    newPostsArray[currentIndex] = updatedPost;
    setPosts(prev => ({ ...prev, [activeTab]: newPostsArray }));
  };

  const handleRefineImage = async () => {
    if (!post?.generatedImage) return;
    setIsRefining(true);
    setRefineError(null);
    try {
        const refined = await refineImage(post.generatedImage.base64, post.generatedImage.mimeType, imageRefinePrompt, negativePrompt);
        updateCurrentPost({ ...post, generatedImage: refined });
    } catch (e) {
        setRefineError(e instanceof Error ? e.message : "Ocurrió un error al refinar la imagen.");
    } finally {
        setIsRefining(false);
    }
  };

  const handleOptimizePost = async () => {
    if (!post || !post.analysis) return;
    setIsOptimizing(true);
    setOptimizeError(null);
    try {
      const optimizedContent = await optimizePost(post, post.analysis);
      const updatedPostWithContent = { ...post, ...optimizedContent };
      
      const newAnalysis = await analyzePost(updatedPostWithContent, activeTab);
      const finalOptimizedPost = { ...updatedPostWithContent, analysis: newAnalysis };

      updateCurrentPost(finalOptimizedPost);
    } catch (e) {
      setOptimizeError(e instanceof Error ? e.message : "Ocurrió un error al optimizar el post.");
    } finally {
      setIsOptimizing(false);
    }
  };
  
  const handleGenerateVideo = async () => {
    if (!post?.generatedImage) return;
    setIsGeneratingVideo(true);
    setVideoError(null);
    try {
        const videoUrl = await generateVideo(post.generatedImage.base64, post.generatedImage.mimeType, videoPrompt);
        updateCurrentPost({ ...post, generatedVideoUrl: videoUrl });
    } catch (e) {
        setVideoError(e instanceof Error ? e.message : "Ocurrió un error al generar el video.");
    } finally {
        setIsGeneratingVideo(false);
    }
  };

  const fullText = post ? `${post.title ? post.title + '\n\n' : ''}${post.mainCopy}\n\n${tags ? tags + '\n\n' : ''}${post.cta ? post.cta + '\n\n' : ''}${post.hashtags}` : '';

  const handleCopy = () => {
      navigator.clipboard.writeText(fullText);
      setShowNotification({type: 'copy', text: '¡Texto copiado al portapapeles!'});
  };

  const handlePublish = () => {
    if (!post || !input) return;
    navigator.clipboard.writeText(fullText);
    if (post.generatedImage) {
        const link = document.createElement('a');
        link.href = `data:${post.generatedImage.mimeType};base64,${post.generatedImage.base64}`;
        link.download = `post-image.png`;
        link.click();
    }
    setShowNotification({type: 'publish', text: 'Texto copiado e imagen descargada. ¡Listo para publicar!'});
    const urls: Record<SocialNetwork, string> = {
        [SocialNetwork.Instagram]: 'https://www.instagram.com',
        [SocialNetwork.TikTok]: 'https://www.tiktok.com/upload',
        [SocialNetwork.LinkedIn]: 'https://www.linkedin.com/feed/',
    };
    window.open(urls[activeTab], '_blank');
  };
  
  const handleDownload = async () => {
    if (!post || !input) return;

    const ideaSlug = (post.title || post.mainCopy).substring(0, 40);
    const filenameBase = ideaSlug.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') || 'post';

    const zip = new JSZip();

    zip.file(`${filenameBase}.txt`, fullText);

    if (post.generatedImage) {
        zip.file(`${filenameBase}.png`, post.generatedImage.base64, { base64: true });
    }

    if (post.generatedVideoUrl) {
        try {
            const response = await fetch(`${post.generatedVideoUrl}&key=${process.env.API_KEY}`);
            const videoBlob = await response.blob();
            zip.file(`${filenameBase}.mp4`, videoBlob);
        } catch (e) {
            console.error("Failed to download and add video to zip:", e);
            alert("No se pudo descargar el video para incluirlo en el ZIP. Se descargarán los demás archivos.");
        }
    }

    zip.generateAsync({ type: "blob" }).then(content => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${filenameBase}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    });
  };
  
  const handleDownloadAll = async () => {
    const zip = new JSZip();
    
    for (let i = 0; i < postArray.length; i++) {
        const p = postArray[i];
        const postFolder = zip.folder(`post_${i + 1}`);
        if (!postFolder) continue;

        const postFullText = `${p.title ? p.title + '\n\n' : ''}${p.mainCopy}\n\n${p.cta ? p.cta + '\n\n' : ''}${p.hashtags}`;
        postFolder.file('copy.txt', postFullText);
        
        if (p.generatedImage) {
            postFolder.file('image.png', p.generatedImage.base64, { base64: true });
        }
    }

    zip.generateAsync({ type: "blob" }).then(content => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `plan-mensual-${activeTab.toLowerCase()}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    });
  };

  if (isLoading && Object.keys(posts).length === 0) return <LoadingSkeleton />;
  if (error) return <div className="p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-lg shadow-md">{error}</div>;
  if (Object.keys(posts).length === 0 || postArray.length === 0) {
    return (
        <div className="text-center py-16 px-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Tus resultados aparecerán aquí</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">Completa el formulario y haz clic en "Generar Post" para ver la magia de la IA en acción.</p>
        </div>
    );
  }

  const hasAllPosts = Object.keys(posts).length === 3;
  const networkOrder = [SocialNetwork.Instagram, SocialNetwork.TikTok, SocialNetwork.LinkedIn];

  return (
    <>
      {showNotification && (
        <div className="fixed top-5 right-5 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg dark:bg-green-900 dark:text-green-200 dark:border-green-600 animate-fade-in-down" role="alert">
          <strong className="font-bold">{showNotification.type === 'copy' ? '¡Éxito!' : '¡Listo para publicar!'} </strong>
          <span className="block sm:inline">{showNotification.text}</span>
        </div>
      )}
      <div className="bg-white/70 dark:bg-gray-800/50 p-6 sm:p-8 rounded-2xl shadow-lg dark:shadow-black/20 space-y-8 backdrop-blur-sm border border-white/20">
        
        <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                {networkOrder.map(network => (
                    <button key={network} onClick={() => setActiveTab(network)}
                        className={`${activeTab === network
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300 dark:hover:border-gray-600'}
                            group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                        aria-current={activeTab === network ? 'page' : undefined}>
                        {network === SocialNetwork.Instagram && <InstagramIcon className="mr-2"/>}
                        {network === SocialNetwork.TikTok && <TikTokIcon className="mr-2"/>}
                        {network === SocialNetwork.LinkedIn && <LinkedInIcon className="mr-2"/>}
                        {posts[network] ? network : <span className="opacity-50">{network}</span>}
                        {!posts[network] && isLoading && <svg className="animate-spin ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                    </button>
                ))}
            </nav>
        </div>

        {!post ? (
            <div className="text-center py-12">Cargando contenido para {activeTab}...</div>
        ) : (
        <>
            {isMonthlyPlan && (
              <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/50 p-3 rounded-lg">
                  <button onClick={() => setCurrentIndex(p => Math.max(0, p - 1))} disabled={currentIndex === 0} className="px-4 py-2 bg-white dark:bg-gray-700 rounded-md shadow disabled:opacity-50 font-semibold">‹ Anterior</button>
                  <div className="text-center font-bold">
                      <p>Plan Mensual</p>
                      <p className="text-sm font-normal">Post {currentIndex + 1} de {postArray.length}</p>
                  </div>
                  <button onClick={() => setCurrentIndex(p => Math.min(postArray.length - 1, p + 1))} disabled={currentIndex === postArray.length - 1} className="px-4 py-2 bg-white dark:bg-gray-700 rounded-md shadow disabled:opacity-50 font-semibold">Siguiente ›</button>
              </div>
            )}
            
            <SocialMockup socialNetwork={activeTab} post={post} />

            {post.analysis && (
              <div className="p-4 bg-slate-100 dark:bg-gray-900/40 rounded-xl border dark:border-gray-600/50 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CheckBadgeIcon className="w-6 h-6 text-blue-500"/>
                        <h3 className="font-bold text-lg">Análisis de Calidad y Algoritmo</h3>
                        <div title="Este análisis utiliza IA para evaluar qué tan bien se alinea tu post con las mejores prácticas del algoritmo de esta red social." className="cursor-help">
                          <QuestionMarkCircleIcon className="w-5 h-5 text-gray-500" />
                        </div>
                    </div>
                    <button onClick={handleOptimizePost} disabled={isOptimizing} className="flex items-center gap-2 text-sm px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-wait">
                      <WandIcon className="w-4 h-4" /> {isOptimizing ? 'Optimizando...' : 'Optimizar con IA'}
                    </button>
                </div>
                {optimizeError && <p className="text-red-500 text-sm -mt-2">{optimizeError}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <ScoreDisplay label="Potencial de Interacción (Engagement)" score={post.analysis.engagement.score} feedback={post.analysis.engagement.feedback} />
                  <ScoreDisplay label="Claridad y Valor del Mensaje" score={post.analysis.clarity.score} feedback={post.analysis.clarity.feedback} />
                  <ScoreDisplay label="Estrategia de Hashtags y SEO" score={post.analysis.hashtags.score} feedback={post.analysis.hashtags.feedback} />
                  <ScoreDisplay label="Impacto y Coherencia Visual" score={post.analysis.visual.score} feedback={post.analysis.visual.feedback} />
                </div>
              </div>
            )}

            <fieldset className="p-4 bg-slate-50 dark:bg-gray-700/60 rounded-xl border dark:border-gray-600/50">
                <legend className="font-bold text-lg mb-2 flex items-center gap-2"><AtSymbolIcon/>Paso 4.1: Etiquetar Personas (Opcional)</legend>
                <textarea value={tags} onChange={e => setTags(e.target.value)} placeholder="Ej: @bs360_oficial @usuario2"
                    className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-600 dark:border-gray-500 focus:ring-blue-500 focus:border-blue-500 text-sm" rows={2}/>
            </fieldset>

            <div className="p-4 bg-slate-50 dark:bg-gray-700/60 rounded-xl border dark:border-gray-600/50 space-y-4">
                <h3 className="font-bold text-lg">Paso 5: Refinar Imagen (Opcional)</h3>
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Prompt Principal (Qué añadir o cambiar)</label>
                    <textarea value={imageRefinePrompt} onChange={e => setImageRefinePrompt(e.target.value)} placeholder="Ej: Agrega un sol brillante en la esquina superior izquierda"
                        className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-600 dark:border-gray-500 focus:ring-blue-500 focus:border-blue-500 text-sm" rows={3}/>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Prompt Negativo (Qué evitar)</label>
                    <textarea value={negativePrompt} onChange={e => setNegativePrompt(e.target.value)} placeholder="Ej: texto, logos, colores borrosos, personas"
                        className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-600 dark:border-gray-500 focus:ring-blue-500 focus:border-blue-500 text-sm" rows={2}/>
                </div>
                {refineError && <p className="text-red-500 text-sm">{refineError}</p>}
                <button onClick={handleRefineImage} disabled={isRefining} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition font-semibold disabled:opacity-50">
                    {isRefining ? 'Refinando...' : <><SparklesIcon/>Refinar Imagen</>}
                </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-gray-700/60 rounded-xl border dark:border-gray-600/50">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">Paso 6: Generar Video (Opcional)</h3>
                    <button type="button" onClick={() => setGenerateVideoEnabled(!generateVideoEnabled)} className={`${generateVideoEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}>
                        <span className={`${generateVideoEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}/>
                    </button>
                </div>
                {generateVideoEnabled && (
                    <div className="mt-4">
                        {post.generatedVideoUrl ? (
                            <video src={`${post.generatedVideoUrl}&key=${process.env.API_KEY}`} controls className="w-full rounded-lg" />
                        ) : isGeneratingVideo ? (
                            <div className="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
                                <p className="font-semibold">🎥 Generando video...</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Este proceso puede tomar unos minutos. ¡Gracias por tu paciencia!</p>
                            </div>
                        ) : (
                            <>
                                <textarea value={videoPrompt} onChange={e => setVideoPrompt(e.target.value)} placeholder="Describe el video que quieres crear a partir de la imagen..."
                                    className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-600 dark:border-gray-500 focus:ring-blue-500 focus:border-blue-500 text-sm" rows={3}/>
                                {videoError && <p className="text-red-500 text-sm mt-2">{videoError}</p>}
                                <button onClick={handleGenerateVideo} disabled={isGeneratingVideo} className="mt-3 w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition font-semibold disabled:opacity-50">
                                    <VideoIcon/>Generar Video
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="space-y-6 pt-6 border-t dark:border-gray-700/50">
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg">✍️ Copy Principal</h3>
                    <button onClick={handleCopy} title="Copiar texto del post" className="flex items-center gap-2 text-sm px-3 py-1.5 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition font-medium">
                        <ClipboardIcon className="w-4 h-4" /> Copiar
                    </button>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-md whitespace-pre-wrap text-sm leading-relaxed">{post.mainCopy}</div>
            </div>
            <div>
                <h3 className="font-bold text-lg mb-2">💡 Variantes Alternativas</h3>
                <div className="space-y-4">{post.variants.map((variant, index) => (<div key={index} className="p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-md whitespace-pre-wrap text-sm leading-relaxed">{variant}</div>))}</div>
            </div>
            {post.tip && (
                <div>
                    <h3 className="font-bold text-lg mb-2">⭐ Tip Extra</h3>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/40 border-l-4 border-blue-400 text-sm text-blue-800 dark:text-blue-200 rounded-r-md">{post.tip}</div>
                </div>
            )}
            </div>

            <div className="flex flex-wrap gap-3 pt-6 border-t dark:border-gray-700/50">
                <button onClick={handlePublish} className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:from-blue-700 hover:to-teal-600 transition font-bold shadow-lg hover:shadow-xl transform hover:scale-105">
                    <ShareIcon/> Publicar en {activeTab}
                </button>
                <button onClick={handleDownload} className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition font-medium shadow-sm hover:shadow-md">
                    <DownloadIcon/> Descargar Post
                </button>
                 {isMonthlyPlan && (
                    <button onClick={handleDownloadAll} className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium shadow-sm hover:shadow-md">
                        <DownloadIcon/> Descargar Plan Mensual (.zip)
                    </button>
                )}
                {!hasAllPosts && !isMonthlyPlan && (
                <button onClick={onGenerateAll} disabled={isLoading} className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-200 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/80 transition font-medium shadow-sm hover:shadow-md disabled:opacity-50">
                    <Squares2X2Icon/> {isLoading ? 'Replicando...' : 'Replicar Multi-Red'}
                </button>
                )}
                <button onClick={onReset} className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition font-medium shadow-sm hover:shadow-md ml-auto">
                    <ArrowPathIcon/> Comenzar de nuevo
                </button>
            </div>
        </>
        )}
      </div>
    </>
  );
};

export default ResultsDisplay;