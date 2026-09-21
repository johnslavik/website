<script lang="ts">
	import SectionComposition from '$lib/components/SectionComposition.svelte';
	const recordings = [
		{
			title: 'Anecdotes from Python 3.15',
			event: 'PIWO × PyCon PL',
			date: 'May 2026',
			video: 'pyxGWo0UK5I',
			start: 8131
		},
		{
			title: 'Programming Strategically',
			event: 'PyWaw #125',
			date: 'Apr 2026',
			video: 'XTNRxTCfU_k',
			start: 2687
		},
		{
			title: 'Programming Strategically',
			event: 'PyPoznań',
			date: 'Feb 2026',
			video: '0sGhlnRQ18w',
			start: 0
		},
		{
			title: 'Programming Strategically',
			event: 'Pykonik #80',
			date: 'Jan 2026',
			video: 'YPGz2NeGH0E',
			start: 1936
		}
	];
	const events = [
		{
			title: 'Anecdotes from Python 3.15',
			event: 'Python Łódź',
			date: 'May 2026',
			url: 'https://pythonlodz.org/spotkania/64/'
		},
		{
			title: 'Context Is All You Need (Sometimes)',
			event: 'PyCon PL',
			date: 'Aug 2025',
			url: 'https://pl.pycon.org/2025/'
		},
		{
			title: 'Wireless Argument Transmission',
			event: 'PyWaw #122',
			date: 'Aug 2025',
			url: 'https://pywaw.org/122/'
		},
		{
			title: 'What NOT TO DO when type hinting in Python?',
			event: 'PyWaw #117',
			date: 'Jan 2025',
			url: 'https://pywaw.org/117/#talk-what-not-to-do-when-type-hinting-in-python'
		}
	];
	const posters = [
		'/art/anecdotes-python.svg',
		'/art/talk-poster-strategy.svg',
		'/art/talk-poster-context.svg',
		'/art/talk-poster-wireless.svg',
		'/art/talk-poster-typing.svg'
	];
	const groups = [...new Set([...recordings, ...events].map((talk) => talk.title))].map(
		(title) => ({
			title,
			recordings: recordings.filter((talk) => talk.title === title),
			events: events.filter((talk) => talk.title === title)
		})
	);
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -->
<section id="talks" class="talks-section" aria-labelledby="talks-title">
	<div class="talks-heading">
		<h2 id="talks-title">Talks</h2>
		<span class="talks-piece"></span>
	</div>
	<span class="talks-texture" aria-hidden="true"></span>

	<div class="talk-gallery">
		{#each groups as group, index (group.title)}
			<section class="talk-edition" aria-label={group.title}>
				<h3 class="sr-only">{group.title}</h3>

				<a
					target="_blank"
					rel="noopener noreferrer"
					class="talk-cover"
					href={group.recordings.length
						? `https://www.youtube.com/watch?v=${group.recordings[0].video}&t=${group.recordings[0].start}`
						: group.events[0].url}
					aria-label={`${group.recordings.length ? 'Watch' : 'Event details for'} ${group.title}`}
				>
					<img
						src={posters[index]}
						alt=""
						width={index === 0 ? 1280 : 1200}
						height={index === 0 ? 720 : 900}
						loading="lazy"
					/>
				</a>
				<div class="talk-appearances">
					{#each group.recordings as talk (talk.video)}
						<a
							target="_blank"
							rel="noopener noreferrer"
							class="talk-appearance"
							href={`https://www.youtube.com/watch?v=${talk.video}&t=${talk.start}`}
							aria-label={`Watch ${group.title} at ${talk.event}`}
						>
							{#if talk.video !== 'pyxGWo0UK5I'}<img
									class="talk-video-preview"
									src={`https://i.ytimg.com/vi/${talk.video}/hqdefault.jpg`}
									alt=""
									width="80"
									height="60"
									loading="lazy"
								/>{/if}
							<span class="appearance-name">{talk.event}<small>Watch recording</small></span><time
								>{talk.date}</time
							>
						</a>
					{/each}
					{#each group.events as talk (talk.url)}
						<a
							target="_blank"
							rel="noopener noreferrer"
							class="talk-appearance"
							href={talk.url}
							aria-label={`${group.title} at ${talk.event}: event details`}
						>
							<span class="appearance-name">{talk.event}<small>Event details</small></span><time
								>{talk.date}</time
							>
						</a>
					{/each}
				</div>
			</section>
		{/each}
	</div>
	<SectionComposition variant="b" />
</section>

<style>
	.talk-gallery {
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		gap: 64px 32px;
		align-items: start;
	}
	.talk-edition {
		min-width: 0;
		grid-column: span 5;
	}
	.talk-edition:nth-child(1) {
		grid-column: span 7;
	}
	.talk-edition:nth-child(2) {
		margin-top: 96px;
	}
	.talk-edition:nth-child(3) {
		grid-column: span 4;
		margin-top: -88px;
	}
	.talk-edition:nth-child(4) {
		grid-column: span 5;
		margin-top: 32px;
	}
	.talk-edition:nth-child(5) {
		grid-column: span 3;
		margin-top: 116px;
	}
	.talk-cover {
		display: block;
		overflow: hidden;
		background: #171717;
	}
	.talk-cover > img {
		display: block;
		width: 100%;
		height: auto;
		transition: transform 400ms ease;
	}
	.talk-cover:hover > img {
		transform: scale(1.025);
	}
	.talk-cover:focus-visible {
		outline: 3px solid #e52a24;
		outline-offset: 5px;
	}
	.talk-appearances {
		margin-top: 18px;
		border-top: 1px solid #171717;
	}
	.talk-appearance {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 15px 0;
		border-bottom: 1px solid #ddd;
		color: #171717;
	}
	.talk-appearance:hover {
		color: #c8211c;
	}
	.appearance-name {
		font-size: 15px;
		line-height: 1.3;
	}
	.appearance-name small {
		display: block;
		margin-top: 5px;
		font-size: 11px;
		color: #666;
	}
	.talk-appearance time {
		margin-left: auto;
		flex-shrink: 0;
		font-size: 12px;
		color: #666;
	}
	.talk-video-preview {
		width: 60px;
		height: 44px;
		object-fit: cover;
	}
	@media (max-width: 1050px) {
		.talk-gallery {
			gap: 48px 24px;
		}
		.talk-edition:nth-child(3) {
			margin-top: 0;
			grid-column: span 6;
		}
		.talk-edition:nth-child(4) {
			grid-column: span 6;
		}
		.talk-edition:nth-child(5) {
			grid-column: span 6;
			margin-top: 0;
		}
	}
	@media (max-width: 680px) {
		.talk-gallery {
			grid-template-columns: 1fr;
			gap: 44px;
		}
		.talk-edition:nth-child(n) {
			grid-column: 1;
			margin-top: 0;
		}
		.talk-edition:nth-child(3) {
			width: 88%;
		}
		.talk-edition:nth-child(5) {
			width: 90%;
			justify-self: end;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.talk-cover > img {
			transition: none;
		}
	}
</style>
