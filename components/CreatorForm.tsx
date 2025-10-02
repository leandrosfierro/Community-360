import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { PostInput, SocialNetwork, Tone, CopyLength, Language, PostFormat, TemplateType } from '../types';
import { InstagramIcon, TikTokIcon, LinkedInIcon, UploadIcon, PdfIcon, DocumentTextIcon, LayersIcon, CheckBadgeIcon } from './icons';
import ProfileBrief from './ProfileBrief';

interface CreatorFormProps {
  onGenerate: (input: PostInput, mode: 'individual' | 'monthly') => void;
  isLoading: boolean;
}

const toneEmojis: Record<Tone, string> = {
    [Tone.Formal]: '👔',
    [Tone.Institutional]: '🏛️',
    [Tone.Commercial]: '🛒',
    [Tone.Friendly]: '👋',
    [Tone.Inspirational]: '✨',
    [Tone.Humorous]: '😂',
    [Tone.Neutral]: '😐',
};

const availableFormats: Record<SocialNetwork, PostFormat[]> = {
    [SocialNetwork.Instagram]: [PostFormat.Post, PostFormat.Story, PostFormat.Reel],
    [SocialNetwork.TikTok]: [PostFormat.Reel],
    [SocialNetwork.LinkedIn]: [PostFormat.Post],
};

const steps = [
  { id: 1, name: 'Definir Contenido', description: 'Idea, contexto y voz de marca.' },
  { id: 2, name: 'Elegir Canal y Tono', description: 'Red social, formato y estilo.' },
  { id: 3, name: 'Personalizar y Generar', description: 'Ajustes finales y creación.' },
];


const CreatorForm: React.FC<CreatorFormProps> = ({ onGenerate, isLoading }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [creationMode, setCreationMode] = useState<'individual' | 'monthly'>('individual');

  // Individual state
  const [idea, setIdea] = useState('');
  
  // Monthly state
  const [monthlyAxes, setMonthlyAxes] = useState([{ name: '', postCount: 1 }]);
  const [ephemeris, setEphemeris] = useState('');
  const [topics, setTopics] = useState('');
  const [campaigns, setCampaigns] = useState('');
  const [totalPosts, setTotalPosts] = useState(12);

  // Common state
  const [userProfile, setUserProfile] = useState('');
  const [image, setImage] = useState<{ base64: string; mimeType: string; name: string; } | undefined>(undefined);
  const [pdf, setPdf] = useState<{ base64: string; mimeType: string; name: string; } | undefined>(undefined);
  const [template, setTemplate] = useState<{ base64: string; mimeType: string; name: string; } | undefined>(undefined);
  const [templateType, setTemplateType] = useState<TemplateType>(TemplateType.Full);
  const [socialNetwork, setSocialNetwork] = useState<SocialNetwork>(SocialNetwork.Instagram);
  const [postFormat, setPostFormat] = useState<PostFormat>(PostFormat.Post);
  const [tones, setTones] = useState<Tone[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [usernames, setUsernames] = useState({
    useGlobal: true,
    global: 'bs360_oficial',
    instagram: '',
    tiktok: '',
    linkedin: '',
  });

  // Advanced options
  const [copyLength, setCopyLength] = useState<CopyLength>(CopyLength.Medium);
  const [language, setLanguage] = useState<Language>(Language.Spanish);
  const [includeCta, setIncludeCta] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(true);

  useEffect(() => {
    const formatsForNetwork = availableFormats[socialNetwork];
    if (!formatsForNetwork.includes(postFormat)) {
      setPostFormat(formatsForNetwork[0]);
    }
  }, [socialNetwork, postFormat]);


  const handleToneChange = (tone: Tone) => {
    setTones(prev =>
      prev.includes(tone) ? prev.filter(t => t !== tone) : [...prev, tone]
    );
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<{ base64: string; mimeType: string; name: string; } | undefined>>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setter({
            base64: base64String.split(',')[1],
            mimeType: file.type,
            name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadBrief = () => {
    const briefWindow = window.open('', '_blank', 'width=800,height=600');
    if (briefWindow) {
        briefWindow.document.title = 'Guía de Perfil de Comunicación - Posteos 360';
        
        const appContainer = briefWindow.document.createElement('div');
        briefWindow.document.body.appendChild(appContainer);
        briefWindow.document.body.className = 'bg-slate-50';

        const tailwindScript = briefWindow.document.createElement('script');
        tailwindScript.src = 'https://cdn.tailwindcss.com';
        briefWindow.document.head.appendChild(tailwindScript);
        
        const BriefPage = () => (
            <>
                <header className="p-4 text-center sticky top-0 bg-white/90 backdrop-blur-sm border-b z-10">
                    <h1 className="text-xl font-bold text-gray-800">Guía de Perfil de Comunicación</h1>
                    <p className="text-sm text-gray-600 mt-1">Utiliza esta guía para construir tu perfil y luego cópialo en la aplicación.</p>
                    <button
                        onClick={() => briefWindow.print()}
                        className="mt-3 px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Imprimir o Guardar como PDF
                    </button>
                </header>
                <main>
                    <ProfileBrief />
                </main>
            </>
        );
        
        ReactDOM.createRoot(appContainer).render(<BriefPage />);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
        if (creationMode === 'individual' && !idea.trim()) {
            setError('Necesitás ingresar una temática antes de continuar.');
            window.scrollTo(0, 0);
            return;
        }
        if (creationMode === 'monthly' && monthlyAxes.every(a => !a.name.trim())) {
            setError('Debes definir al menos un eje conceptual para la planificación mensual.');
            window.scrollTo(0, 0);
            return;
        }
    }
    setError(null);
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

    const handleAxisChange = (index: number, field: 'name' | 'postCount', value: string | number) => {
        const newAxes = [...monthlyAxes];
        if (field === 'postCount' && typeof value === 'number') {
            newAxes[index][field] = value < 1 ? 1 : value;
        // FIX: Add check for `field === 'name'` to satisfy TypeScript's type checker.
        } else if (field === 'name' && typeof value === 'string') {
            newAxes[index][field] = value;
        }
        setMonthlyAxes(newAxes);
    };

    const addAxis = () => {
        setMonthlyAxes([...monthlyAxes, { name: '', postCount: 1 }]);
    };

    const removeAxis = (index: number) => {
        if (monthlyAxes.length > 1) {
            setMonthlyAxes(monthlyAxes.filter((_, i) => i !== index));
        }
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    let finalIdea = '';
    if (creationMode === 'individual') {
        if (!idea.trim()) {
          setError('Necesitás ingresar una temática antes de continuar.');
          setCurrentStep(1);
          window.scrollTo(0, 0);
          return;
        }
        finalIdea = idea;
    } else {
        if (monthlyAxes.every(a => !a.name.trim())) {
            setError('Debes definir al menos un eje conceptual para la planificación mensual.');
            setCurrentStep(1);
            window.scrollTo(0, 0);
            return;
        }
        finalIdea = `
        **TAREA PRINCIPAL: GENERAR UN PLAN DE CONTENIDO MENSUAL AUTOMÁTICO COMPLETO.**
        El objetivo es crear una grilla de contenido para todo el mes, generando una idea de post para cada una de las ${totalPosts} publicaciones solicitadas. La respuesta debe ser una lista de ideas de posts, no un único post.

        **Cantidad total de publicaciones para el mes:** ${totalPosts}

        **Ejes conceptuales del mes (distribuir las publicaciones según estos porcentajes):**
        ${monthlyAxes.filter(a => a.name.trim()).map(axis => `- ${axis.name}: ${axis.postCount} publicaciones`).join('\n')}

        **Fechas de efemérides destacadas a incluir:**
        ${ephemeris || "No se especificaron efemérides."}

        **Tópicos específicos para desarrollar:**
        ${topics || "No se especificaron tópicos adicionales."}

        **Campañas comerciales activas a integrar en el contenido:**
        ${campaigns || "No se especificaron campañas activas."}

        Genera una idea de post para cada una de las ${totalPosts} publicaciones, distribuyéndolas a lo largo de un mes calendario y asegurándote de cubrir todos los puntos mencionados. La respuesta debe ser una lista de ideas concisas.
        `;
    }
    
    setError(null);
    onGenerate({
      idea: finalIdea,
      userProfile,
      image,
      pdf,
      template: template ? { ...template, type: templateType } : undefined,
      socialNetwork,
      postFormat,
      tones: tones.length > 0 ? tones : [Tone.Neutral],
      copyLength,
      language,
      includeCta,
      includeHashtags,
      usernames,
    }, creationMode);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/70 dark:bg-gray-800/50 p-6 sm:p-8 rounded-2xl shadow-lg dark:shadow-black/20 backdrop-blur-sm border border-white/20">
      
      <nav aria-label="Progress" className="mb-8">
        <ol role="list" className="border border-gray-300 dark:border-gray-700 rounded-lg md:flex">
          {steps.map((step, stepIdx) => (
            <li key={step.name} className={`relative md:flex-1 md:flex ${stepIdx === 0 ? '' : 'md:border-l-0'} ${stepIdx < steps.length - 1 ? 'border-b md:border-b-0 md:border-r' : ''} border-gray-300 dark:border-gray-700`}>
              {currentStep > step.id ? (
                <div className="group w-full flex items-center">
                  <span className="px-6 py-4 flex items-center text-sm font-medium">
                    <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-600 rounded-full">
                      <CheckBadgeIcon className="w-6 h-6 text-white" />
                    </span>
                    <span className="ml-4 text-sm font-medium text-gray-900 dark:text-gray-100">{step.name}</span>
                  </span>
                </div>
              ) : currentStep === step.id ? (
                <div className="px-6 py-4 flex items-center text-sm font-medium" aria-current="step">
                  <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center border-2 border-blue-600 rounded-full">
                    <span className="text-blue-600 dark:text-blue-400">{step.id}</span>
                  </span>
                  <span className="ml-4 text-sm font-medium text-blue-600 dark:text-blue-400">{step.name}</span>
                </div>
              ) : (
                <div className="group w-full flex items-center">
                  <span className="px-6 py-4 flex items-center text-sm font-medium">
                    <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600 rounded-full">
                      <span className="text-gray-500 dark:text-gray-400">{step.id}</span>
                    </span>
                    <span className="ml-4 text-sm font-medium text-gray-500 dark:text-gray-400">{step.name}</span>
                  </span>
                </div>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {error && <div className="mb-6 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md text-sm">{error}</div>}

      <div className="space-y-8">
        {currentStep === 1 && (
            <>
                <fieldset>
                    <legend className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">Modo de Creación</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button type="button" onClick={() => setCreationMode('individual')} className={`p-6 text-left border rounded-lg transition-all ${creationMode === 'individual' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50 ring-2 ring-blue-500' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'}`}>
                            <h3 className="font-bold">Creación Individual</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Genera un único post a partir de una idea o temática.</p>
                        </button>
                        <button type="button" onClick={() => setCreationMode('monthly')} className={`p-6 text-left border rounded-lg transition-all ${creationMode === 'monthly' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50 ring-2 ring-blue-500' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'}`}>
                            <h3 className="font-bold">Planificación Mensual</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Crea una grilla de contenido para todo el mes basada en ejes estratégicos.</p>
                        </button>
                    </div>
                </fieldset>
                
                {creationMode === 'individual' ? (
                    <div className="space-y-8 animate-fade-in">
                        <fieldset>
                          <legend className="block text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
                            Escribe tu idea principal o temática
                          </legend>
                          <textarea
                            id="idea"
                            value={idea}
                            onChange={e => setIdea(e.target.value)}
                            maxLength={4500}
                            placeholder="Ej: Lanzamiento de nuestro nuevo programa de liderazgo para mandos medios, enfocado en bienestar sostenible y gestión consciente..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                            rows={5}
                          />
                          <div className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">{idea.length}/4500</div>
                        </fieldset>
                    </div>
                ) : (
                    <div className="space-y-8 animate-fade-in">
                         <fieldset>
                            <legend className="block text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
                                Ejes conceptuales del mes
                            </legend>
                            <div className="space-y-3">
                                {monthlyAxes.map((axis, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={axis.name}
                                            onChange={(e) => handleAxisChange(index, 'name', e.target.value)}
                                            placeholder={`Eje ${index + 1} (Ej: Bienestar Sostenible)`}
                                            className="flex-grow p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <input
                                            type="number"
                                            value={axis.postCount}
                                            onChange={(e) => handleAxisChange(index, 'postCount', parseInt(e.target.value, 10))}
                                            min="1"
                                            className="w-24 p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                            title="Cantidad de publicaciones"
                                        />
                                        <button type="button" onClick={() => removeAxis(index)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full disabled:opacity-50" disabled={monthlyAxes.length === 1}>&times;</button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={addAxis} className="mt-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">+ Añadir otro eje</button>
                        </fieldset>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <fieldset>
                                <legend className="block text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
                                    Fechas / Efemérides
                                </legend>
                                <textarea
                                    value={ephemeris} onChange={e => setEphemeris(e.target.value)}
                                    placeholder="Ej: 8 - Día de la Mujer, 22 - Día de la Tierra..."
                                    className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600" rows={4}
                                />
                            </fieldset>
                             <fieldset>
                                <legend className="block text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
                                    Tópicos a desarrollar
                                </legend>
                                <textarea
                                    value={topics} onChange={e => setTopics(e.target.value)}
                                    placeholder="Ej: Entrevistas a líderes, Consejos para la gestión del tiempo..."
                                    className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600" rows={4}
                                />
                            </fieldset>
                        </div>
                         <fieldset>
                            <legend className="block text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
                                Campañas comerciales activas
                            </legend>
                            <textarea
                                value={campaigns} onChange={e => setCampaigns(e.target.value)}
                                placeholder="Ej: Lanzamiento del curso 'Liderazgo Consciente' (15 al 30 del mes), 20% de descuento en consultorías..."
                                className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600" rows={3}
                            />
                        </fieldset>
                        <fieldset>
                            <label htmlFor="total-posts" className="block text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                                Cantidad de publicaciones para el mes
                            </label>
                            <input
                                id="total-posts" type="number" value={totalPosts} onChange={e => setTotalPosts(parseInt(e.target.value, 10) || 1)} min="1"
                                className="w-32 p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            />
                        </fieldset>
                    </div>
                )}

                <div className="pt-8 border-t dark:border-gray-700/50 space-y-8">
                     <fieldset>
                      <legend className="block text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
                        Perfil de Comunicación (Opcional)
                      </legend>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Define la voz y personalidad de tu marca o perfil. Esto actuará como una instrucción maestra para la IA, asegurando consistencia en cada post.
                      </p>
                      <textarea
                        id="userProfile"
                        value={userProfile}
                        onChange={e => setUserProfile(e.target.value)}
                        placeholder="Ej: Somos una marca de bienestar corporativo con un tono experto pero cercano. Nos dirigimos a líderes de RRHH en empresas tecnológicas. Evitamos el lenguaje demasiado corporativo y usamos emojis con moderación..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                        rows={4}
                      />
                      <div className="mt-3">
                        <button type="button" onClick={handleDownloadBrief} className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                          <DocumentTextIcon className="w-4 h-4" />
                          ¿No sabes qué poner? Descarga nuestra guía de perfil
                        </button>
                      </div>
                    </fieldset>

                    <fieldset>
                      <legend className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                        Archivos de referencia (Opcional)
                      </legend>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <label htmlFor="image-upload" className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:ring-blue-500">
                              <UploadIcon />
                              <span>Subir imagen</span>
                          </label>
                          <input id="image-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={(e) => handleFileUpload(e, setImage)} />
                          
                          <label htmlFor="pdf-upload" className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:ring-blue-500">
                              <PdfIcon />
                              <span>Cargar PDF de contexto</span>
                          </label>
                          <input id="pdf-upload" type="file" className="hidden" accept="application/pdf" onChange={(e) => handleFileUpload(e, setPdf)} />
                      </div>
                      {(image || pdf) && (
                          <div className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                              {image && <p className="truncate">Imagen: <span className="font-medium">{image.name}</span></p>}
                              {pdf && <p className="truncate">PDF: <span className="font-medium">{pdf.name}</span></p>}
                          </div>
                      )}
                    </fieldset>
                </div>
            </>
        )}
        
        {currentStep === 2 && (
          <div className="space-y-8">
            <fieldset>
              <legend className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Elige la red social</legend>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[SocialNetwork.Instagram, SocialNetwork.TikTok, SocialNetwork.LinkedIn].map(network => (
                  <button
                    type="button"
                    key={network}
                    onClick={() => setSocialNetwork(network)}
                    className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-all duration-200 outline-none ${socialNetwork === network ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50 scale-105 ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-800' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-600'}`}
                  >
                    {network === SocialNetwork.Instagram && <InstagramIcon className="w-8 h-8 mb-2" />}
                    {network === SocialNetwork.TikTok && <TikTokIcon className="w-8 h-8 mb-2" />}
                    {network === SocialNetwork.LinkedIn && <LinkedInIcon className="w-8 h-8 mb-2" />}
                    <span className="font-medium text-sm">{network}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Elige el formato</legend>
              <div className="flex flex-wrap gap-3">
                {availableFormats[socialNetwork].map(format => (
                  <button
                    type="button"
                    key={format}
                    onClick={() => setPostFormat(format)}
                    className={`px-4 py-2 text-sm font-medium border rounded-full transition-colors ${postFormat === format ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
                <legend className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Nombre de Usuario (para la vista previa)</legend>
                <div className="p-4 bg-slate-50 dark:bg-gray-700/60 rounded-xl space-y-4 border dark:border-gray-600/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">Esto solo cambia el nombre en la previsualización, no afecta el contenido del post.</p>
                    <div className="flex gap-2 rounded-lg p-1 bg-gray-200 dark:bg-gray-900/80 w-full md:w-auto md:max-w-md">
                        <button type="button" onClick={() => setUsernames(prev => ({ ...prev, useGlobal: true }))} className={`w-full text-center px-4 py-1.5 text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${usernames.useGlobal ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow' : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/50'}`}>
                            Usar un solo nombre
                        </button>
                        <button type="button" onClick={() => setUsernames(prev => ({ ...prev, useGlobal: false }))} className={`w-full text-center px-4 py-1.5 text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${!usernames.useGlobal ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow' : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/50'}`}>
                            Personalizar por red
                        </button>
                    </div>
                    
                    {usernames.useGlobal ? (
                        <div className="animate-fade-in">
                            <label htmlFor="global-username" className="block text-sm font-medium mb-1">Nombre de usuario global</label>
                            <input 
                                id="global-username"
                                type="text" 
                                value={usernames.global} 
                                onChange={e => setUsernames(prev => ({ ...prev, global: e.target.value }))}
                                className="w-full md:w-1/2 p-2 border border-gray-300 rounded-md dark:bg-gray-600 dark:border-gray-500 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    ) : (
                        <div className="space-y-3 animate-fade-in">
                            <div>
                                <label htmlFor="instagram-username" className="block text-sm font-medium mb-1">Instagram</label>
                                <input id="instagram-username" type="text" value={usernames.instagram} onChange={e => setUsernames(prev => ({ ...prev, instagram: e.target.value }))} placeholder={usernames.global} className="w-full md:w-1/2 p-2 border border-gray-300 rounded-md dark:bg-gray-600 dark:border-gray-500 focus:ring-blue-500 focus:border-blue-500"/>
                            </div>
                            <div>
                                <label htmlFor="tiktok-username" className="block text-sm font-medium mb-1">TikTok</label>
                                <input id="tiktok-username" type="text" value={usernames.tiktok} onChange={e => setUsernames(prev => ({ ...prev, tiktok: e.target.value }))} placeholder={usernames.global} className="w-full md:w-1/2 p-2 border border-gray-300 rounded-md dark:bg-gray-600 dark:border-gray-500 focus:ring-blue-500 focus:border-blue-500"/>
                            </div>
                            <div>
                                <label htmlFor="linkedin-username" className="block text-sm font-medium mb-1">LinkedIn (Nombre de Perfil/Página)</label>
                                <input id="linkedin-username" type="text" value={usernames.linkedin} onChange={e => setUsernames(prev => ({ ...prev, linkedin: e.target.value }))} placeholder={usernames.global} className="w-full md:w-1/2 p-2 border border-gray-300 rounded-md dark:bg-gray-600 dark:border-gray-500 focus:ring-blue-500 focus:border-blue-500"/>
                            </div>
                        </div>
                    )}
                </div>
            </fieldset>

            <fieldset>
              <legend className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Tono de comunicación</legend>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.values(Tone).map(tone => (
                  <label key={tone} className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition ${tones.includes(tone) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50 ring-2 ring-blue-500' : 'border-gray-300 dark:border-gray-600'}`}>
                    <input
                      type="checkbox"
                      checked={tones.includes(tone)}
                      onChange={() => handleToneChange(tone)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0"
                    />
                    <span className="text-sm">{toneEmojis[tone]} {tone}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-8">
            <fieldset>
              <legend className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Plantilla de Diseño (Opcional)
              </legend>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Sube un archivo PNG con transparencias. Elige si es una plantilla completa o un logo para aplicarlo como marca de agua.
              </p>
              <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Tipo de plantilla:</label>
                  <div className="flex gap-2 rounded-lg p-1 bg-gray-200 dark:bg-gray-900/80 w-full">
                      {Object.values(TemplateType).map(type => (
                          <button
                              type="button"
                              key={type}
                              onClick={() => setTemplateType(type)}
                              className={`w-full text-center px-4 py-1.5 text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                                  templateType === type
                                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow'
                                      : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/50'
                              }`}
                          >
                              {type}
                          </button>
                      ))}
                  </div>
              </div>
              <label htmlFor="template-upload" className="w-full cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:ring-blue-500">
                  <LayersIcon />
                  <span>Cargar plantilla PNG</span>
              </label>
              <input id="template-upload" type="file" className="hidden" accept="image/png" onChange={(e) => handleFileUpload(e, setTemplate)} />
              {template && (
                  <div className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                      <p className="truncate">Plantilla: <span className="font-medium">{template.name}</span></p>
                  </div>
              )}
            </fieldset>

            <fieldset>
              <legend className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Configuraciones adicionales</legend>
              <div className="p-4 bg-slate-50 dark:bg-gray-700/60 rounded-xl space-y-4 border dark:border-gray-600/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Longitud del copy</label>
                        <select value={copyLength} onChange={e => setCopyLength(e.target.value as CopyLength)} className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-600 dark:border-gray-500 focus:ring-blue-500 focus:border-blue-500">
                            {Object.values(CopyLength).map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Idioma</label>
                        <select value={language} onChange={e => setLanguage(e.target.value as Language)} className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-600 dark:border-gray-500 focus:ring-blue-500 focus:border-blue-500">
                            {Object.values(Language).map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                    <label className="text-sm font-medium">Añadir CTA automático</label>
                    <button type="button" onClick={() => setIncludeCta(!includeCta)} className={`${includeCta ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}>
                        <span className={`${includeCta ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}/>
                    </button>
                </div>
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Generar hashtags automáticos</label>
                    <button type="button" onClick={() => setIncludeHashtags(!includeHashtags)} className={`${includeHashtags ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}>
                        <span className={`${includeHashtags ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}/>
                    </button>
                </div>
              </div>
            </fieldset>
          </div>
        )}
      </div>

      <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Atrás
            </button>
          )}
        </div>
        <div>
          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Siguiente
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white font-bold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generando...
                </>
              ) : (
                `🚀 Generar ${creationMode === 'monthly' ? 'Plan Mensual' : 'Post'}`
              )}
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default CreatorForm;