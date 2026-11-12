import type { CollectionItem, OptionalCollectionName, Page, Post, Settings } from '../schema';

/** Contratto comune degli adattatori. Nessuna logica di filtro qui: sta in `../index.ts`. */
export interface ContentAdapter {
  getSettings(): Promise<Settings>;
  getPage(slug: string): Promise<Page | undefined>;
  getPages(): Promise<Page[]>;
  /** Tutti i post (anche bozze/futuri): il filtro è nello strato comune. `body` = HTML. */
  getPosts(): Promise<Post[]>;
  getCollectionItems<K extends OptionalCollectionName>(name: K): Promise<CollectionItem<K>[]>;
}
