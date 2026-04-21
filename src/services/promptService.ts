import { GoogleGenAI, Type } from "@google/genai";
import { GeneratorInputs, Scene } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const SCENE_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      imagePrompt: { type: Type.STRING },
      videoPrompt: { type: Type.STRING },
      type: { type: Type.STRING },
      theme: { type: Type.STRING },
    },
    required: ["title", "imagePrompt", "videoPrompt", "type"],
  },
};

export async function generateMagicalTrainPrompts(inputs: GeneratorInputs): Promise<Scene[]> {
  const { animalName, numScenes, brandingText, stylePreset = "Hiện thực huyền ảo điện ảnh" } = inputs;

  // Translate animal name to English first
  const translationResponse = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: `Translate the following animal name to a single English word: "${animalName}". Return only the English word.`,
  });
  const englishAnimalName = translationResponse.text.trim();

  const prompt = `You are a professional cinematic prompt engineer and creative director.
  Your task is to generate a sequence of cinematic scenes for a magical train journey based on the user's inputs.

  UNIVERSAL VIDEO RULE:
  - The scene takes place inside or around a magical animal-themed train world.
  - All living characters in the scene must be the specified animal species: ${englishAnimalName}.
  - Every character must be that animal only (for example: penguins, eagles, lions, etc.).
  - No humans are allowed in the scene. Do not generate humans, people, human faces, human bodies, passengers, staff, or humanoid figures.
  - All characters must be fully animals with natural anatomy and behavior.
  - Brand names or logos (like "${brandingText}") may exist naturally in the environment (on walls, objects, decorations, or train design) but the camera must NOT zoom in, focus on, or center the frame on any brand text or logo.
  - Camera movement must remain simple and natural: slow tracking, gentle pan, smooth glide.
  - Avoid: zoom into text, zoom into logo, dramatic camera movement, close-up focus on brand names.
  - The camera should explore the environment naturally while showing animals interacting with the space.
  - Cinematic lighting, magical atmosphere, highly detailed environment, natural motion, ultra realistic, 8k cinematic quality.

  USER INPUTS:
  * ANIMAL NAME (English): ${englishAnimalName}
  * ORIGINAL ANIMAL NAME: ${animalName}
  * NUMBER OF SCENES: ${numScenes}
  * BRANDING TEXT / CHANNEL NAME: "${brandingText}"
  * ART STYLE: ${stylePreset}

  Your output must follow these strict rules.

  GLOBAL ANIMAL–TRAIN FUSION RULE (APPLIES TO ALL ANIMALS):
  - The animal must always be the train itself.
  - The animal and the train must form a single unified creature–machine structure.
  - The animal must never appear as a separate creature next to or on top of a train.
  - The body of the animal transforms seamlessly into the train:
    * The animal’s head becomes the locomotive front.
    * The animal’s body gradually transforms into the train engine and carriages.
    * The spine or back of the animal extends into connected train cars.
    * Natural animal features (fur, scales, skin, feathers) transition smoothly into train materials such as brass, steel, glass, wood, and steam machinery.
  - Anatomical Integration:
    * fins / wings → decorative fins, side panels, or aerodynamic train elements.
    * ears / horns → steam vents or ornamental structures.
    * tail → the final train carriage.
    * patterns on fur/scales → engraved decorative train patterns.
  - The transformation must feel organic and believable in magical realism style.
  - PROHIBITED STRUCTURES: Do NOT generate a normal train behind a separate animal, an animal standing next to the train, multiple locomotive heads, duplicated animals attached to different parts of the train, or two separate trains in the same structure. There must only be ONE locomotive head, and it must be the animal’s head.

  VISUAL CONSISTENCY RULE:
  - The animal-train hybrid must maintain a consistent design throughout all scenes of the journey.
  - The same creature-train design continues through every scene.

  GLOBAL ANIMAL WORLD RULE:
  - This magical train world is inhabited by a community of the same animal species: ${englishAnimalName}.
  - NEVER generate a scene with only one animal.
  - Every scene must include a group of animals of the same species interacting naturally inside the magical train environment.

  CHARACTER RULES:
  - Each scene must contain approximately 4–10 animals of the species "${englishAnimalName}" depending on the activity and environment.
  - Some animals perform the main action while others appear in the background interacting, observing, relaxing, talking, dancing, working, or assisting.
  - The scene should feel like a living community of animal passengers traveling together on the train.

  CHARACTER VARIATION:
  - Animals should not look identical. Add natural variation such as: slightly different sizes or ages, different poses and expressions, accessories (aprons, scarves, hats, glasses, instruments, tools), and different roles within the scene.

  COMPOSITION RULE:
  - Characters must be distributed across foreground, midground, and background to create cinematic depth and a lively environment.

  CONTINUITY RULE:
  - All scenes belong to the same magical train journey.
  - The design of the train interior, materials, lighting style, and magical realism tone must remain visually consistent across all scenes.
  - The animals are recurring passengers traveling together through different themed carriages.

  STYLE RULE:
  - All prompts must be written in English and designed for high-end AI image and video generation models.
  - Every prompt must be cinematic, whimsical, and 8K quality.
  - If ART STYLE is "Hoạt hình 3D Disney/Pixar" or contains "3D", "Cartoon", or "Hoạt hình", focus on expressive character designs, vibrant colors, and smooth 3D textures. Otherwise, make it photorealistic and magical realism.
  - Include strong storytelling, natural lighting, depth of field, and environmental atmosphere.
  - All visuals should feel like ultra high-end cinematic frames with 8K ultra detail.
  - Incorporate the ART STYLE: ${stylePreset} into the visual descriptions.

  STRICT SUBJECT RULE:
  - The entire scene must contain ONLY the specified animal species: ${englishAnimalName}.
  - All living characters in the scene MUST be that animal species.
  - NO HUMANS are allowed in the scene under any circumstances.
  - Do NOT generate: humans, people, human faces, human bodies, human passengers, human staff, waiters, guests, crowds, humanoid figures, or anthropomorphic humans.
  - All characters must be fully animals with their natural anatomy and appearance.
  - The train, environment, decorations, logos, sculptures, and interior design may be inspired by the animal species, but the living beings must always be the specified animal species.
  - If multiple characters appear, they must all be animals of the same species interacting naturally.
  - The scene must remain animal-only with zero human presence.

  BRANDING RULE:
  The BRANDING TEXT "${brandingText}" must appear naturally in every scene as part of the environment. It must never feel like a forced logo.
  Examples: engraved wood sign, glowing brass plaque, painted train emblem, embroidered fabric, luggage tags, chalkboard menu, decorative posters, etched metal plates, menu titles, wall art, signage, banners.
  The branding should match the tone and theme of the scene.

  SCENE STRUCTURE:
  Generate exactly ${numScenes} scenes.
  Each scene must contain: Scene Title, Image Prompt, Video Prompt.
  Format: JSON array of objects with keys: title, imagePrompt, videoPrompt, type, theme.
  LANGUAGE RULE: 
  - Use Vietnamese for "title" and "theme".
  - Use English for "imagePrompt" and "videoPrompt".
  - The animal name in the prompts must ALWAYS be the English name "${englishAnimalName}".

  SCENE 1 RULE (MANDATORY):
  Scene 1 must always be titled: "Ngoại thất – Đoàn tàu ${animalName}"
  Scene 1 type must be "exterior".
  IMAGE PROMPT REQUIREMENTS: Create a wide cinematic photorealistic shot of a gigantic ${englishAnimalName} transformed into a magical train following the FUSION RULES. The animal’s head forms the locomotive with expressive natural facial features. Its body extends into multiple magical train carriages that blend living creature traits with mechanical train structures. The train travels through a cinematic fantasy environment. Include: volumetric lighting, cinematic depth of field, realistic materials, dynamic composition, magical realism atmosphere, ultra detailed textures. The BRANDING TEXT "${brandingText}" must appear subtly on the locomotive. Even in this exterior shot, show small ${englishAnimalName} passengers visible through the glowing windows of the carriages.
  VIDEO PROMPT REQUIREMENTS: Create a cinematic sequence. Start with a wide establishing aerial shot showing the environment and the massive moving train-creature hybrid. Then the camera tracks alongside the moving train, revealing the BRANDING TEXT "${brandingText}" emblem on the train body. Environmental particles such as fog, dust, pollen, sparks, or mist should enhance realism. The camera slowly pushes toward a warm glowing train window. Inside the window we see a group of ${englishAnimalName} passengers interacting inside the carriage. Maintain smooth cinematic transitions and natural camera motion.

  SCENE 2 TO ${numScenes} RULES:
  All remaining scenes must be interior train carriages. Each scene must have a completely new themed carriage with a different activity.
  Scene 2 to ${numScenes} type must be "interior".
  Examples of themes: nature carriage, tea or dining car, playroom, music room, library, observation dome, dream or sleeping car, garden car, art studio, relaxation lounge, storytelling room, science lab, magic workshop.
  ACTIVITY RULE: Every scene must include a different activity performed by the ${englishAnimalName} characters. No repeated activities.
  ENVIRONMENT RULE: The train must always feel like it is moving. The outside scenery should be visible through windows.
  ANIMAL NAME RULE: Always use the English name "${englishAnimalName}" in image and video prompts. In titles and themes, you can use the original name "${animalName}".

  IMAGE PROMPT RULES: Describe the themed interior environment, the ${englishAnimalName} characters and their activities, props and objects, textures and materials, lighting direction and color contrast, camera framing and depth of field, atmospheric elements, magical realism cinematic tone. The BRANDING TEXT "${brandingText}" must appear naturally.

  VIDEO PROMPT RULES: Describe opening camera framing, camera movement (dolly, pan, track, orbit, push-in), character actions, environmental animation, parallax between foreground and background, light interaction and atmosphere. The BRANDING TEXT "${brandingText}" should be revealed subtly through camera movement.

  CONTINUITY RULE: All scenes must feel like they belong to the same magical train journey. Maintain consistent cinematic style, magical realism tone, and immersive storytelling across the entire sequence.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: SCENE_SCHEMA,
    },
  });

  const rawScenes = JSON.parse(response.text || "[]");
  return rawScenes.map((s: any, index: number) => ({
    ...s,
    id: `scene-${index + 1}`,
  }));
}

export async function regenerateSingleScene(inputs: GeneratorInputs, sceneIndex: number, existingThemes: string[]): Promise<Scene> {
  const { animalName, brandingText, stylePreset = "Hiện thực huyền ảo điện ảnh" } = inputs;
  const isExterior = sceneIndex === 0;

  // Translate animal name to English first
  const translationResponse = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: `Translate the following animal name to a single English word: "${animalName}". Return only the English word.`,
  });
  const englishAnimalName = translationResponse.text.trim();

  const prompt = `You are a professional cinematic prompt engineer and creative director.
  Your task is to regenerate a single cinematic scene for a magical train journey.

  UNIVERSAL VIDEO RULE:
  - The scene takes place inside or around a magical animal-themed train world.
  - All living characters in the scene must be the specified animal species: ${englishAnimalName}.
  - Every character must be that animal only.
  - No humans are allowed in the scene. Do not generate humans, people, human faces, human bodies, passengers, staff, or humanoid figures.
  - All characters must be fully animals with natural anatomy and behavior.
  - Brand names or logos (like "${brandingText}") may exist naturally in the environment but the camera must NOT zoom in, focus on, or center the frame on any brand text or logo.
  - Camera movement must remain simple and natural: slow tracking, gentle pan, smooth glide.
  - Avoid: zoom into text, zoom into logo, dramatic camera movement, close-up focus on brand names.
  - The camera should explore the environment naturally while showing animals interacting with the space.
  - Cinematic lighting, magical atmosphere, highly detailed environment, natural motion, ultra realistic, 8k cinematic quality.

  USER INPUTS:
  * ANIMAL NAME (English): ${englishAnimalName}
  * ORIGINAL ANIMAL NAME: ${animalName}
  * BRANDING TEXT: "${brandingText}"
  * ART STYLE: ${stylePreset}
  * SCENE TYPE: ${isExterior ? 'Exterior' : 'Interior'}
  * EXISTING THEMES TO AVOID: ${existingThemes.join(', ')}

  FOLLOW THESE RULES:
  1. GLOBAL ANIMAL–TRAIN FUSION RULE: The animal IS the train. Head = locomotive, Body = carriages, Tail = final car. Seamless blend of creature traits and train materials (brass, steel, glass, wood).
     - Structural Transformation: Animal head becomes locomotive front. Body transforms into engine and carriages. Spine extends into connected cars. Features (fur, scales, feathers) transition into train materials.
     - Anatomical Integration: fins/wings → side panels; ears/horns → steam vents; tail → final carriage; patterns → engraved patterns.
     - PROHIBITED: No separate animals next to train. Only ONE locomotive head.
  2. GLOBAL ANIMAL WORLD RULE: Community of same species (${englishAnimalName}), never just one animal. 4-10 animals per scene.
  3. CHARACTER VARIATION: Different sizes, ages, poses, expressions, accessories, and roles.
  4. COMPOSITION: Distributed across foreground, midground, and background for depth.
  5. CONTINUITY: Consistent train design, materials, lighting, and tone. Recurring passengers.
  6. STYLE: English for prompts, cinematic, whimsical, 8K ultra detail. If ART STYLE is "Hoạt hình 3D Disney/Pixar" or contains "3D", "Cartoon", or "Hoạt hình", focus on 3D animation style. Otherwise, make it photorealistic and magical realism. Incorporate style: ${stylePreset}.
  7. STRICT SUBJECT RULE:
     - The entire scene must contain ONLY the specified animal species: ${englishAnimalName}.
     - All living characters MUST be that animal species.
     - NO HUMANS allowed (no people, faces, bodies, passengers, staff, waiters, guests, crowds, humanoid figures, or anthropomorphic humans).
     - Characters must be fully animals with natural anatomy.
     - Zero human presence.
  8. BRANDING: Integrate "${brandingText}" naturally into the environment.
  8. IF EXTERIOR (Scene 1): Gigantic ${englishAnimalName} transformed into a magical train following FUSION RULES. Head is locomotive. Aerial shot, tracking reveal of branding, push to window showing passengers. Set type to "exterior".
  9. IF INTERIOR: Unique themed carriage (avoid: ${existingThemes.join(', ')}). Unique activity for a group of ${englishAnimalName} characters. Train must feel moving (visible scenery). Set type to "interior".
  10. IMAGE PROMPT: Detailed environment, group of characters, activities, lighting, textures, branding.
  11. VIDEO PROMPT: Camera movement, group actions, environmental animation, branding reveal.
  11. OUTPUT: JSON object with keys: title, imagePrompt, videoPrompt, type, theme. 
     - Use Vietnamese for "title" and "theme".
     - Use English for "imagePrompt" and "videoPrompt".
     - The animal name in prompts must ALWAYS be "${englishAnimalName}".`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          imagePrompt: { type: Type.STRING },
          videoPrompt: { type: Type.STRING },
          type: { type: Type.STRING },
          theme: { type: Type.STRING },
        },
        required: ["title", "imagePrompt", "videoPrompt", "type"],
      },
    },
  });

  const scene = JSON.parse(response.text || "{}");
  return { ...scene, id: `scene-${Date.now()}` };
}

export async function regenerateSinglePrompt(inputs: GeneratorInputs, scene: Scene, promptType: 'image' | 'video'): Promise<string> {
  const { animalName, brandingText, stylePreset = "Hiện thực huyền ảo điện ảnh" } = inputs;
  
  // Translate animal name to English first
  const translationResponse = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: `Translate the following animal name to a single English word: "${animalName}". Return only the English word.`,
  });
  const englishAnimalName = translationResponse.text.trim();

  const prompt = `You are a professional cinematic prompt engineer and creative director.
  Your task is to regenerate a single ${promptType === 'image' ? 'Image Prompt' : 'Video Prompt'} for a specific scene.

  UNIVERSAL VIDEO RULE:
  - The scene takes place inside or around a magical animal-themed train world.
  - All living characters in the scene must be the specified animal species: ${englishAnimalName}.
  - Every character must be that animal only.
  - No humans are allowed in the scene. Do not generate humans, people, human faces, human bodies, passengers, staff, or humanoid figures.
  - All characters must be fully animals with natural anatomy and behavior.
  - Brand names or logos (like "${brandingText}") may exist naturally in the environment but the camera must NOT zoom in, focus on, or center the frame on any brand text or logo.
  - Camera movement must remain simple and natural: slow tracking, gentle pan, smooth glide.
  - Avoid: zoom into text, zoom into logo, dramatic camera movement, close-up focus on brand names.
  - The camera should explore the environment naturally while showing animals interacting with the space.
  - Cinematic lighting, magical atmosphere, highly detailed environment, natural motion, ultra realistic, 8k cinematic quality.

  SCENE INFO:
  * TITLE: ${scene.title}
  * THEME: ${scene.theme}
  * ANIMAL (English): ${englishAnimalName}
  * ORIGINAL ANIMAL: ${animalName}
  * BRANDING: "${brandingText}"
  * ART STYLE: ${stylePreset}
  * CURRENT PROMPT: ${promptType === 'image' ? scene.imagePrompt : scene.videoPrompt}

  RULES:
  1. Create a NEW, more creative version in English.
  2. GLOBAL ANIMAL–TRAIN FUSION RULE: The animal IS the train. Head = locomotive, Body = carriages, Tail = final car. Seamless blend of creature traits and train materials (brass, steel, glass, wood).
     - Structural Transformation: Animal head becomes locomotive front. Body transforms into engine and carriages. Spine extends into connected cars. Features (fur, scales, feathers) transition into train materials.
     - Anatomical Integration: fins/wings → side panels; ears/horns → steam vents; tail → final carriage; patterns → engraved patterns.
     - PROHIBITED: No separate animals next to train. Only ONE locomotive head.
  3. GLOBAL ANIMAL WORLD RULE: Community of same species (${englishAnimalName}), never just one animal. 4-10 animals per scene.
  4. CHARACTER VARIATION: Different sizes, ages, poses, expressions, accessories, and roles.
  5. COMPOSITION: Distributed across foreground, midground, and background for depth.
  6. CONTINUITY: Consistent train design, materials, lighting, and tone. Recurring passengers.
  7. Follow the high-end cinematic, whimsical, 8K detail style. If ART STYLE is "Hoạt hình 3D Disney/Pixar" or contains "3D", "Cartoon", or "Hoạt hình", focus on 3D animation style. Otherwise, make it photorealistic and magical realism.
  8. STRICT SUBJECT RULE:
     - The entire scene must contain ONLY the specified animal species: ${englishAnimalName}.
     - All living characters MUST be that animal species.
     - NO HUMANS allowed (no people, faces, bodies, passengers, staff, waiters, guests, crowds, humanoid figures, or anthropomorphic humans).
     - Characters must be fully animals with natural anatomy.
     - Zero human presence.
  9. Incorporate style: ${stylePreset}.
  9. Integrate branding "${brandingText}" naturally.
  10. If Image: focus on composition, lighting, textures.
  11. If Video: focus on camera movement, actions, environmental animation.
  12. Use the English animal name "${englishAnimalName}" instead of "${animalName}".
  13. Return ONLY the prompt text, no explanations.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: prompt,
  });

  return response.text.trim();
}
