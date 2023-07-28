export interface MangaBackend {
  title: string;
  link: string;
  image: string;
}

export interface MangaChapter {
  mangaTitle: string;
  chapters_titles: string | string[];
  chapters: string;
}
