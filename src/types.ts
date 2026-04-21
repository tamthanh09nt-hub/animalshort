export interface Scene {
  id: string;
  title: string;
  imagePrompt: string;
  videoPrompt: string;
  type: 'exterior' | 'interior';
  theme?: string;
}

export interface GeneratorInputs {
  animalName: string;
  numScenes: number;
  brandingText: string;
  stylePreset: string;
  customStyle?: string;
}
