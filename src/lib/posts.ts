export interface PostMetadata {
	title: string;
	date: string;
	description: string;
	tags: string[];
}

export interface Post extends PostMetadata {
	slug: string;
}

type GlobModule = { metadata: PostMetadata };

function slugFromPath(path: string): string {
	return path.split('/').pop()!.replace('.svx', '');
}

export async function getPosts(): Promise<Post[]> {
	const modules = import.meta.glob<GlobModule>('/src/posts/*.svx', { eager: true });
	return Object.entries(modules)
		.filter(([, m]) => m.metadata?.title)
		.map(([path, m]) => ({ slug: slugFromPath(path), ...m.metadata }))
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPythonPosts(): Promise<Post[]> {
	return (await getPosts()).filter((p) => p.tags?.includes('python'));
}
