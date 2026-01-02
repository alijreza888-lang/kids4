
export interface Item {
  id: string;
  name: string;
  persianName: string;
  emoji: string;
  color: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  items: Item[];
}

export enum GameType {
  FLASHCARDS = 'Flashcards',
  QUIZ = 'Quiz',
  MEMORY = 'Memory',
  MATCHING = 'Matching',
  SPELLING = 'Spelling',
  ODD_ONE_OUT = 'Odd One Out'
}

export interface GameState {
  view: 'main' | 'learning_detail' | 'game_types' | 'game_cats' | 'game_active' | 'alphabet';
  selectedCategory: Category | null;
  selectedGame: GameType | null;
  score: number;
}
