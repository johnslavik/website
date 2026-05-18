import { error } from '@sveltejs/kit';
import type { Component } from 'svelte';
import type { PageLoad } from './$types';
import type { PostMetadata } from '$lib/posts';

type PostModule = { default: Component; metadata: PostMetadata };

export const load: PageLoad = async ({ params }) => {
	const posts = import.meta.glob<PostModule>('/src/posts/*.svx');
	const loader = posts[`/src/posts/${params.slug}.svx`];
	if (!loader) throw error(404, 'Post not found');
	const post = await loader();
	return { content: post.default, meta: post.metadata };
};
