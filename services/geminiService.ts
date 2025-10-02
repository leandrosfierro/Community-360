import { GoogleGenAI, Type, GenerateContentResponse, Part, Modality } from "@google/genai";
import { PostInput, GeneratedPost, SocialNetwork, PostAnalysis, Tone, CopyLength, PostFormat } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const postGenerationSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A short, catchy title for the post. Generate this ONLY for LinkedIn and TikTok. For Instagram, this field should be omitted or left empty.",
    },
    mainCopy: {
      type: Type.STRING,
      description: "The main, optimized social media post copy. It should integrate relevant emojis naturally to increase engagement.",
    },
    variants: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Provide 2 alternative versions of the main copy with different nuances.",
    },
    hashtags: {
      type: Type.STRING,
      description: "A string of relevant, well-researched hashtags, all in lowercase, separated by spaces. Example: '#hashtag1 #hashtag2'",
    },
    cta: {
      type: Type.STRING,
      description: "A recommended Call to Action for the post.",
    },
    tip: {
      type: Type.STRING,
      description: "An optional extra tip or creative idea to enhance the post's impact (e.g., 'Try a poll in your stories').",
    },
  },
  required: ["mainCopy", "variants", "hashtags", "cta"],
};

const postIdeasSchema = {
    type: Type.OBJECT,
    properties: {
        ideas: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    idea: {
                        type: Type.STRING,
                        description: "Una idea de post concreta y específica, lista para ser desarrollada."
                    }
                },
                required: ["idea"]
            },
            description: "Una lista de ideas de posts para desarrollar durante el mes."
        }
    },
    required: ["ideas"]
};

const scoreCategorySchema = {
    type: Type.OBJECT,
    properties: {
        score: { type: Type.INTEGER, description: "Una puntuación de 0 a 100, donde 100 es lo mejor." },
        feedback: { type: Type.STRING, description: "Feedback conciso y constructivo en español, explicando la puntuación." }
    },
    required: ["score", "feedback"],
};

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        engagement: { ...scoreCategorySchema, description: "Potencial de Interacción (Engagement): Evalúa ganchos emocionales, preguntas, y llamadas a la interacción que fomenten likes, comentarios y compartidos." },
        clarity: { ...scoreCategorySchema, description: "Claridad y Valor del Mensaje: Mide si el mensaje es fácil de entender, si aporta valor real a la audiencia y si el CTA es claro." },
        hashtags: { ...scoreCategorySchema, description: "Estrategia de Hashtags y SEO: Analiza la relevancia, la mezcla de hashtags populares y de nicho, y su potencial para aumentar la visibilidad." },
        visual: { ...scoreCategorySchema, description: "Impacto y Coherencia Visual: Evalúa qué tan bien la descripción de la imagen (prompt inicial) se alinea con el texto y tiene el potencial de captar la atención en el feed." },
    },
    required: ["engagement", "clarity", "hashtags", "visual"],
};

export const analyzePost = async (post: GeneratedPost, socialNetwork: SocialNetwork): Promise<PostAnalysis> => {
    const systemInstruction = `Eres un estratega de redes sociales de clase mundial y experto en los algoritmos de 2024. Tu tarea es analizar un post y evaluar su calidad de forma profesional, crítica y objetiva, basándote en las mejores prácticas para la red social especificada.
- **Instagram:** Prioriza la autenticidad, el storytelling visual, la creación de comunidad y un 'hook' fuerte en los Reels.
- **TikTok:** Enfócate en la capacidad de enganchar en los primeros 2 segundos, el potencial de viralidad, el uso de tendencias y la autenticidad.
- **LinkedIn:** Evalúa la autoridad, el valor profesional, la capacidad de generar conversación y la estructura del texto (uso de espacios, listas, etc.).

Proporciona una puntuación de 0 a 100 para cada categoría y un feedback breve, accionable y completamente en español. Sé riguroso y profesional en tu análisis.`;
    
    const userPrompt = `Por favor, analiza el siguiente post creado para **${socialNetwork}** en formato **${post.postFormat}**.
--- CONTENIDO DEL POST ---
Título: ${post.title || 'N/A'}
Copy: ${post.mainCopy}
Hashtags: ${post.hashtags}
CTA: ${post.cta}
Prompt Inicial de Imagen: ${post.initialImagePrompt}
--------------------
Evalúalo basándote en el esquema JSON proporcionado. Tu respuesta debe ser 100% en español.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: analysisSchema,
        }
    });

    return JSON.parse(response.text.trim());
};

export const optimizePost = async (post: GeneratedPost, analysis: PostAnalysis): Promise<Pick<GeneratedPost, 'mainCopy' | 'hashtags'>> => {
    const systemInstruction = `Eres un copywriter experto en redes sociales y estratega de contenido. Tu tarea es optimizar un post basándote en un análisis de calidad previo. Reescribe el 'mainCopy' y los 'hashtags' para abordar el feedback recibido, especialmente en las áreas con menor puntuación. Tu objetivo es hacer que el post sea significativamente más efectivo y atractivo. La respuesta debe ser 100% en español.`;
    
    const userPrompt = `Por favor, optimiza el siguiente post basándote en su análisis.
--- POST ORIGINAL ---
Copy: ${post.mainCopy}
Hashtags: ${post.hashtags}
--- ANÁLISIS Y FEEDBACK ---
${JSON.stringify(analysis, null, 2)}
-----------------------
Reescribe el 'mainCopy' y los 'hashtags' para mejorar el rendimiento del post. Devuelve únicamente los campos actualizados en el formato JSON especificado.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    mainCopy: { type: Type.STRING },
                    hashtags: { type: Type.STRING },
                },
                required: ["mainCopy", "hashtags"],
            }
        }
    });

    return JSON.parse(response.text.trim());
};


export const generatePost = async (input: PostInput): Promise<GeneratedPost> => {
  try {
    let systemInstruction: string;
    if (input.userProfile && input.userProfile.trim() !== '') {
        systemInstruction = `Eres un asistente de IA y experto en redes sociales. Tu tarea es generar un post.
--- INSTRUCCIÓN MAESTRA: TONO DE COMUNICACIÓN ---
El 'tono' especificado en las instrucciones del usuario es tu directiva principal y más importante. Debes priorizarlo por sobre todo.
--- GUÍA SECUNDARIA: PERFIL DE USUARIO ---
El siguiente perfil de usuario debe usarse para dar sabor y contexto a la respuesta, pero NUNCA debe anular la instrucción del 'tono'.
<perfil>
${input.userProfile}
</perfil>
-------------------------
Genera el contenido siguiendo estas reglas de prioridad.`;
    } else {
        systemInstruction = `Actúa como un experto en marketing de redes sociales. Tu directiva principal es adherirte estrictamente al 'tono' de comunicación solicitado en el prompt del usuario.`;
    }

    const characterLimits: Record<SocialNetwork, Record<CopyLength, string>> = {
        [SocialNetwork.Instagram]: {
            [CopyLength.Short]: '125-150 caracteres',
            [CopyLength.Medium]: '300-500 caracteres',
            [CopyLength.Long]: 'hasta 2000 caracteres',
        },
        [SocialNetwork.TikTok]: {
            [CopyLength.Short]: '100-150 caracteres',
            [CopyLength.Medium]: '200-300 caracteres',
            [CopyLength.Long]: 'hasta 1000 caracteres',
        },
        [SocialNetwork.LinkedIn]: {
            [CopyLength.Short]: 'hasta 300 caracteres',
            [CopyLength.Medium]: '500-800 caracteres',
            [CopyLength.Long]: '1500-2000 caracteres',
        },
    };

    const toneDescriptions: Record<Tone, string> = {
        [Tone.Formal]: "Estilo profesional, lenguaje cuidado, estructurado y respetuoso. Sin coloquialismos ni humor.",
        [Tone.Institutional]: "Comunicación corporativa que refleja la cultura, valores y misión de la empresa. El tono es formal, informativo y busca construir imagen de marca.",
        [Tone.Commercial]: "Enfocado 100% en la venta. El objetivo es persuadir al usuario para que realice una acción. Debe describir beneficios, crear urgencia y tener un Llamado a la Acción (CTA) muy claro y directo. Este tono es la prioridad.",
        [Tone.Friendly]: "Cercano, cálido y conversacional. Usa un lenguaje sencillo, tuteo (o un 'vos' amigable si es apropiado para el español de LatAm) y emoticones para conectar emocionalmente.",
        [Tone.Inspirational]: "El objetivo principal es crear una frase o mensaje potente, memorable e impactante que inspire, motive o haga reflexionar al lector. El copy debe centrarse en esta frase.",
        [Tone.Humorous]: "Busca entretener y sacar una sonrisa. Puede usar ironía, juegos de palabras o anécdotas divertidas relacionadas con la temática.",
        [Tone.Neutral]: "Directo, informativo y objetivo. Sin carga emocional, simplemente presenta la información de manera clara.",
    };

    const selectedTones = input.tones.length > 0 ? input.tones : [Tone.Neutral];
    const toneInstructions = selectedTones.map(t => `\n- **${t}:** ${toneDescriptions[t]}`).join('');
    const copyLengthInstruction = characterLimits[input.socialNetwork][input.copyLength];

    let formatInstruction = '';
    switch(input.postFormat) {
        case PostFormat.Reel:
            formatInstruction = `El formato es un **Reel / Video corto**. El 'mainCopy' debe ser un guion corto y dinámico para el video, que puede incluir ideas de escenas o texto en pantalla.`;
            break;
        case PostFormat.Story:
            formatInstruction = `El formato es una **Historia**. El 'mainCopy' debe ser un texto breve, directo e interactivo, ideal para este formato efímero. Puedes sugerir el uso de stickers como encuestas o preguntas.`;
            break;
        case PostFormat.Post:
        default:
            formatInstruction = `El formato es un **Post de Muro/Feed**. El 'mainCopy' debe ser un texto bien estructurado para ser leído en el feed.`;
            break;
    }


    const userPrompt = `Tu tarea es generar un post para la red social: **${input.socialNetwork}**.
${formatInstruction}
${(input.socialNetwork === SocialNetwork.LinkedIn || input.socialNetwork === SocialNetwork.TikTok) ? 'Genera también un título corto y atractivo (campo "title") para el post.' : ''}

La temática principal es: "${input.idea}".
${input.pdf ? 'Utiliza el contenido del archivo PDF adjunto como contexto principal y fuente de información para crear el post.' : ''}
${input.image ? 'Considera también la imagen de referencia adjunta para contextualizar el post.' : ''}

**REGLA DE ORO: Tono de Comunicación**
El tono es la directiva más importante. La personalidad del post debe basarse fundamentalmente en el siguiente tono seleccionado: ${toneInstructions}

**REGLA DE ORO: Longitud del Texto**
La longitud del texto principal ('mainCopy') debe ser **${input.copyLength}**, lo que para ${input.socialNetwork} significa aproximadamente **${copyLengthInstruction}**.

El idioma del post debe ser: ${input.language}.
${input.includeCta ? 'Incluye un Llamado a la Acción (CTA) claro y efectivo. Si el tono es "Comercial", el CTA debe ser el foco principal.' : 'No es necesario un Llamado a la Acción (CTA) explícito.'}
${input.includeHashtags ? 'Genera hashtags relevantes y en minúscula.' : 'No incluyas hashtags.'}

Genera el contenido siguiendo estrictamente el esquema JSON proporcionado. Asegúrate de que el texto principal y las variantes integren emoticones relevantes de forma natural para aumentar el engagement, siempre que el tono lo permita.`;
    
    const contentParts: Part[] = [];
    if (input.image) {
      contentParts.push({ inlineData: { data: input.image.base64, mimeType: input.image.mimeType } });
    }
    if (input.pdf) {
      contentParts.push({ inlineData: { data: input.pdf.base64, mimeType: input.pdf.mimeType } });
    }
    contentParts.push({ text: userPrompt });
    
    const textResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: contentParts },
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: postGenerationSchema,
            temperature: 0.7,
        }
    });

    const textContent = JSON.parse(textResponse.text.trim());

    // STEP 2: Generate a purely visual prompt from the main copy to avoid text contamination.
    const visualPromptGeneratorSystemInstruction = `You are an expert art director specializing in creating prompts for AI image generators. Your task is to convert a social media post's text into a concise, purely visual, and descriptive prompt. The prompt must be in English.
RULES:
- The output prompt MUST NOT contain words that suggest text, like 'poster', 'announcement', 'logo', 'title', 'text', 'words'.
- Focus on actions, objects, environments, lighting, colors, and emotions.
- Describe a tangible scene.
- Keep it concise (around 25-50 words).`;

    const visualPromptUserPrompt = `Based on the following social media copy, create a purely visual prompt for an image generator.
COPY: "${textContent.mainCopy}"`;

    const visualPromptResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: visualPromptUserPrompt,
        config: {
            systemInstruction: visualPromptGeneratorSystemInstruction,
            temperature: 0.4,
        }
    });

    const visualConcept = visualPromptResponse.text.trim();
    
    // STEP 3: Construct the final, robust image prompt.
    const imagePrompt = `A professional, high-quality, photorealistic image depicting: ${visualConcept}. The style should be clean, modern, with vibrant yet elegant colors, suitable for a social media post.

**CULTURAL CONTEXT (LATIN AMERICA):**
If people are depicted, they must represent a diverse Latin American audience. The setting and individuals should feel authentic to a modern Latin American environment. **No incluyas personas de etnia afroamericana.**

**ABSOLUTE CRITICAL RULE (TOP PRIORITY):**
ZERO TEXT. The image must be 100% visual. No letters, no numbers, no words, no logos, no writing of any kind. Verify the final image has no text. This is a non-negotiable instruction.`;

    const isVertical = input.postFormat === PostFormat.Reel || input.postFormat === PostFormat.Story;
    const aspectRatio = isVertical ? '9:16' : '1:1';

    const imageResponse = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: imagePrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: aspectRatio,
        },
    });

    const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;

    let partialResult: GeneratedPost = {
      ...textContent,
      generatedImage: {
        base64: base64ImageBytes,
        mimeType: 'image/png',
      },
      initialImagePrompt: imagePrompt,
      postFormat: input.postFormat,
    };

    const analysis = await analyzePost(partialResult, input.socialNetwork);
    
    const finalResult: GeneratedPost = {
      ...partialResult,
      analysis,
    };
    
    return finalResult;

  } catch (error) {
    console.error("Error generating post with Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate post: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the post.");
  }
};

export const generateMonthlyContent = async (
    input: PostInput,
    onProgress: (progress: { currentStep: number; totalSteps: number; message: string; percentage: number }) => void
): Promise<GeneratedPost[]> => {
    try {
        // Step 1: Generate the list of post ideas from the monthly plan
        onProgress({
            currentStep: 0,
            totalSteps: 0,
            message: 'Fase 1/4: Analizando tu plan estratégico y generando ideas...',
            percentage: 5,
        });

        const ideasResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: input.idea, // This contains the detailed monthly plan prompt
            config: {
                systemInstruction: "Eres un estratega de contenido senior. Tu tarea es analizar la planificación mensual y generar una lista de ideas de posts concretas y creativas basadas en los ejes y tópicos proporcionados. Devuelve solo el JSON.",
                responseMimeType: 'application/json',
                responseSchema: postIdeasSchema,
            }
        });

        const { ideas } = JSON.parse(ideasResponse.text.trim());

        if (!ideas || ideas.length === 0) {
            throw new Error("La IA no pudo generar ideas para el plan mensual.");
        }

        const totalPosts = (ideas as any[]).length;
        onProgress({
            currentStep: 0,
            totalSteps: totalPosts,
            message: `Fase 2/4: ¡${totalPosts} ideas generadas! Comenzando la creación de cada post.`,
            percentage: 15,
        });


        // Step 2: Generate a full post for each idea sequentially to avoid rate limiting.
        const generatedPosts: GeneratedPost[] = [];
        for (const [index, postIdea] of (ideas as { idea: string }[]).entries()) {
            const currentPostNumber = index + 1;
            const percentage = 15 + Math.round((currentPostNumber / totalPosts) * 80); // Progress from 15% to 95%

            onProgress({
                currentStep: currentPostNumber,
                totalSteps: totalPosts,
                message: `Fase 3/4: Creando post ${currentPostNumber}/${totalPosts}: "${postIdea.idea.substring(0, 50)}..."`,
                percentage,
            });

            const individualPostInput: PostInput = {
                ...input,
                idea: postIdea.idea, // Override with the specific idea
            };
            
            try {
                // Wait for 1 second before starting the generation of the next post
                // to respect API rate limits.
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const post = await generatePost(individualPostInput);
                generatedPosts.push(post);
            } catch (postError) {
                 console.error(`Failed to generate post for idea: "${postIdea.idea}"`, postError);
                 // For a better UX, we'll log the error and continue, allowing partial success.
            }
        }

        if (generatedPosts.length === 0 && ideas.length > 0) {
            throw new Error("All individual post generations failed during the monthly plan creation. This might be due to API rate limits or content policy violations.");
        }

        onProgress({
            currentStep: totalPosts,
            totalSteps: totalPosts,
            message: 'Fase 4/4: Compilando y finalizando el plan mensual.',
            percentage: 100,
        });

        return generatedPosts;

    } catch (error) {
        console.error("Error generating monthly content:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate monthly plan: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the monthly plan.");
    }
};

export const refineImage = async (
    base64ImageData: string,
    mimeType: string,
    prompt: string,
    negativePrompt: string
): Promise<{ base64: string, mimeType: string }> => {
    try {
        let fullPrompt = prompt;
        if (negativePrompt && negativePrompt.trim() !== '') {
            fullPrompt += `\n\n---IMPORTANT---\nAVOID THE FOLLOWING ELEMENTS: ${negativePrompt}`;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: fullPrompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return {
                    base64: part.inlineData.data,
                    mimeType: part.inlineData.mimeType,
                };
            }
        }
        throw new Error("No image was generated by the refinement model.");
    } catch (error) {
        console.error("Error refining image:", error);
        throw new Error("Failed to refine the image.");
    }
};

export const generateVideo = async (
    base64ImageData: string,
    mimeType: string,
    prompt: string
): Promise<string> => {
    try {
        let operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            image: {
                imageBytes: base64ImageData,
                mimeType: mimeType,
            },
            config: {
                numberOfVideos: 1,
            },
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

        if (!downloadLink) {
            throw new Error("Video generation completed, but no download link was found.");
        }
        
        return downloadLink;
    } catch (error) {
        console.error("Error generating video:", error);
        throw new Error("Failed to generate the video.");
    }
};