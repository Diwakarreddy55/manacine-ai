export type StoryResult = {
  title: string;
  characters: Array<{
    name: string;
    role_name: string;
    gender: string;
    age: number;
    appearance: string;
    personality: string;
  }>;
  scenes: Array<{
    scene_number: number;
    title: string;
    description: string;
    dialogue: string;
    duration_seconds: number;
  }>;
};

export async function generateStory(prompt: string, duration: number): Promise<StoryResult> {
  // Replace this adapter with Ollama/OpenAI-compatible/local LLM in production.
  const sceneCount = Math.max(6, Math.min(60, Math.ceil(duration * 4)));

  const scenes = Array.from({ length: sceneCount }, (_, i) => ({
    scene_number: i + 1,
    title: `Scene ${i + 1}`,
    description: i === 0
      ? "Opening scene introducing the main characters and setting."
      : `Story progression scene ${i + 1} based on the user's prompt.`,
    dialogue: "తెలుగులో డైలాగ్ ఇక్కడ AI ద్వారా తయారు చేయబడుతుంది.",
    duration_seconds: Math.max(5, Math.floor((duration * 60) / sceneCount))
  }));

  return {
    title: "ManaCine AI Movie",
    characters: [
      {
        name: "Arjun",
        role_name: "Hero",
        gender: "male",
        age: 28,
        appearance: "Young Telugu commercial-film protagonist",
        personality: "Confident, kind and humorous"
      },
      {
        name: "Ananya",
        role_name: "Heroine",
        gender: "female",
        age: 26,
        appearance: "Young professional woman",
        personality: "Smart, warm and independent"
      },
      {
        name: "Ravi",
        role_name: "Comedian",
        gender: "male",
        age: 29,
        appearance: "Energetic best friend",
        personality: "Funny and talkative"
      }
    ],
    scenes
  };
}
