// Shared by the Projects page and the homepage hover card.

export interface Project {
  title: string;
  description: string;
  link: string;
  tags: string[];
  layout: 'one-column' | 'two-column';
  media: { type: 'image' | 'video'; src: string }[];
}

export const projects: Project[] = [
  {
    title: "FeastFinder",
    description: "An intelligent platform that provides optimal food recommendations via natural language processing, matching user intent to culinary profiles.",
    link: "https://github.com/fazmain/FeastFinder",
    tags: ["LLMs", "React", "Node.js"],
    layout: "two-column",
    media: [
      { type: "image", src: "/images/projects/feastfinder_1.png" },
      // { type: "video", src: "/images/projects/feastfinder_demo.mp4" }
    ]
  },
  {
    title: "Quizzard",
    description: "A generative AI application designed to dynamically assemble structurally coherent academic quizzes to enhance student studying habits.",
    link: "https://github.com/fazmain/Quizzard-AI_quiz_app",
    tags: ["OpenAI", "Next.js", "GPT-4"],
    layout: "one-column",
    media: [
      { type: "image", src: "/images/projects/quizzard.png" }
    ]
  },
  {
    title: "ClassiBERT",
    description: "Deep learning research exploration focusing on BERT architectural efficiencies, classifying immense text layers efficiently.",
    link: "https://github.com/fazmain/ClassiBERT",
    tags: ["Python", "PyTorch", "NLP"],
    layout: "one-column",
    media: [
      { type: "image", src: "/images/projects/classibert.png" }
    ]
  },
  {
    title: "Attribution-Graph-Research",
    description: "Tools for Mechanistic Interpretability, creating interactive node connection mappings allowing researchers to peel back LLM neural circuitry.",
    link: "https://github.com/fazmain/Attribution-Graph-Research",
    tags: ["HTML", "Data Viz", "AI Safety"],
    layout: "two-column",
    media: [
      { type: "image", src: "/images/projects/attribution_1.png" },
      { type: "image", src: "/images/projects/attribution_2.png" }
    ]
  }
];
