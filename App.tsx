import React, { useState } from 'react';
import { PostInput, GeneratedPost, SocialNetwork, TemplateType } from './types';
import { generatePost, generateMonthlyContent } from './services/geminiService';
import CreatorForm from './components/CreatorForm';
import ResultsDisplay from './components/ResultsDisplay';

const applyTemplateOverlayToPost = (
  post: GeneratedPost,
  template: { base64: string; type: TemplateType }
): Promise<GeneratedPost> => {
  return new Promise((resolve, reject) => {
    if (!post.generatedImage) {
      resolve(post);
      return;
    }
    
    const baseImage = new Image();
    const templateImage = new Image();
    
    let loadedImages = 0;
    const onImageLoad = () => {
      loadedImages++;
      if (loadedImages === 2) {
        const canvas = document.createElement('canvas');
        canvas.width = baseImage.width;
        canvas.height = baseImage.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        
        ctx.drawImage(baseImage, 0, 0);

        if (template.type === TemplateType.Logo) {
          const padding = baseImage.height * 0.03;
          const logoWidth = baseImage.width * 0.1;
          const aspectRatio = templateImage.height / templateImage.width;
          const logoHeight = logoWidth * aspectRatio;
          const x = (baseImage.width - logoWidth) / 2;
          const y = baseImage.height - logoHeight - padding;
          ctx.drawImage(templateImage, x, y, logoWidth, logoHeight);
        } else {
          ctx.drawImage(templateImage, 0, 0, baseImage.width, baseImage.height);
        }
        
        const mergedImageBase64 = canvas.toDataURL('image/png').split(',')[1];
        
        const updatedPost = {
            ...post,
            generatedImage: {
                ...post.generatedImage!,
                base64: mergedImageBase64
            }
        };
        resolve(updatedPost);
      }
    };
    
    baseImage.onload = onImageLoad;
    templateImage.onload = onImageLoad;
    baseImage.onerror = (e) => reject(new Error(`Failed to load base image: ${e.toString()}`));
    templateImage.onerror = (e) => reject(new Error(`Failed to load template image: ${e.toString()}`));
    
    baseImage.src = `data:image/png;base64,${post.generatedImage.base64}`;
    templateImage.src = `data:image/png;base64,${template.base64}`;
  });
};

export default function App() {
  const [generatedPosts, setGeneratedPosts] = useState<Partial<Record<SocialNetwork, GeneratedPost[]>>>({});
  const [currentInput, setCurrentInput] = useState<PostInput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isReplicating, setIsReplicating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSocialNetwork, setActiveSocialNetwork] = useState<SocialNetwork>(SocialNetwork.Instagram);
  const [formKey, setFormKey] = useState(0);

  const handleGeneratePost = async (input: PostInput, mode: 'individual' | 'monthly') => {
    setIsLoading(true);
    setError(null);
    setGeneratedPosts({});
    setCurrentInput(input);
    setActiveSocialNetwork(input.socialNetwork);

    try {
      let results: GeneratedPost[];

      if (mode === 'monthly') {
        results = await generateMonthlyContent(input);
      } else {
        const singleResult = await generatePost(input);
        results = [singleResult];
      }

      if (input.template) {
        const templatedResults = await Promise.all(
          results.map(post => applyTemplateOverlayToPost(post, input.template!))
        );
        setGeneratedPosts({ [input.socialNetwork]: templatedResults });
      } else {
        setGeneratedPosts({ [input.socialNetwork]: results });
      }
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAllPosts = async () => {
      if (!currentInput) return;
      setIsReplicating(true);
      const networksToGenerate: SocialNetwork[] = [SocialNetwork.Instagram, SocialNetwork.TikTok, SocialNetwork.LinkedIn];
      
      for (const network of networksToGenerate) {
          if (!generatedPosts[network]) {
              try {
                  const postInput = { ...currentInput, socialNetwork: network };
                  // For replication, we always generate a single post based on the core idea, even from a monthly plan.
                  // This avoids re-generating the entire monthly schedule for each network.
                  const result = await generatePost(postInput);
                  let finalResult = result;
                  if (postInput.template && result.generatedImage) {
                    finalResult = await applyTemplateOverlayToPost(result, postInput.template);
                  }
                  // Store as an array with a single item
                  setGeneratedPosts(prev => ({ ...prev, [network]: [finalResult] }));
              } catch (e) {
                  console.error(`Failed to generate post for ${network}`, e);
              }
          }
      }
      setIsReplicating(false);
  };

  const handleReset = () => {
      setGeneratedPosts({});
      setCurrentInput(null);
      setError(null);
      setIsLoading(false);
      setIsReplicating(false);
      setFormKey(prevKey => prevKey + 1);
      window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400">
              Posteos 360
            </div>
            <div className="ml-3 text-xs bg-blue-100 text-blue-800 font-semibold px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-200">
                AI Beta
            </div>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <CreatorForm key={formKey} onGenerate={handleGeneratePost} isLoading={isLoading} />
          <div className="mt-8 sm:mt-12">
            <ResultsDisplay
              posts={generatedPosts}
              setPosts={setGeneratedPosts}
              input={currentInput}
              isLoading={isLoading || isReplicating}
              error={error}
              initialSocialNetwork={activeSocialNetwork}
              onGenerateAll={handleGenerateAllPosts}
              onReset={handleReset}
            />
          </div>
        </div>
      </main>
      <footer className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
        <p>Powered by the Gemini API</p>
      </footer>
    </div>
  );
}