/**
 * Adattatore LIVELLO 1 (`static`): legge le content collections di Astro.
 * È l'UNICO file (con src/content.config.ts) autorizzato a importare `astro:content`
 * (verificato da tools/check-data-layer.mjs).
 */
import { getCollection } from 'astro:content';
import type { ContentAdapter } from './types';
import type { Page, Post, Settings } from '../schema';

export const filesAdapter: ContentAdapter = {
  async getSettings() {
    const entries = await getCollection('settings');
    if (!entries.length) throw new Error('settings/site.json mancante');
    return entries[0].data as Settings;
  },
  async getPages() {
    return (await getCollection('pages')).map((e) => e.data as Page);
  },
  async getPage(slug) {
    return (await this.getPages()).find((p) => p.slug === slug);
  },
  async getPosts() {
    return (await getCollection('posts')).map((e) => ({ ...e.data, body: e.rendered?.html ?? '' }) as Post);
  },
  async getCollectionItems(name) {
    return (await getCollection(name)).map((e) => e.data) as never;
  },
};
