import { createContext } from 'svelte';
import type { ListSummary } from './lists';
import type { Item } from './types';

/**
 * Data of the list being viewed, loaded once by the list layout and shared with every
 * page below it (sections and item detail) instead of each page querying again.
 * Getters, not plain values: they always return the latest live query result.
 */
export type ListContext = {
	readonly summary: ListSummary;
	readonly items: Item[];
};

export const [getListContext, setListContext] = createContext<ListContext>();
