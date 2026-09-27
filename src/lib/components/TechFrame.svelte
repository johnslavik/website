<script lang="ts">
	let { compact = false }: { compact?: boolean } = $props();
</script>

<div class="tech-frame" class:compact aria-hidden="true">
	<svg viewBox="0 0 500 500" preserveAspectRatio="none" fill="none">
		<path
			class="frame-main"
			d="M70 12H24L12 24V164M12 206V370L40 398M12 440V476L24 488H180M232 488H450L488 450V334M488 286V76L466 54H414M362 12H226"
		/>
		<path
			class="frame-secondary"
			d="M48 0H188M0 302V410L28 438H102M500 146V304M300 500H432L500 432"
		/>
		<path class="frame-accent" d="M12 70V32L32 12H70M430 488H456L488 456V426" />
		<path
			class="frame-ticks"
			d="M246 6V18M254 6V18M262 6V18M270 6V18M278 6V18M286 6V18M294 6V18M302 6V18M310 6V18M318 6V18"
		/>
		<path class="frame-secondary" d="M456 24H472M464 16V32M30 460H46M38 452V468" />
	</svg>
	<div class="frame-orbit"><i></i><b></b></div>
	<span class="frame-nodes"><i></i><i></i><i></i></span>
	<span class="frame-strip"></span>
</div>

<style>
	.tech-frame {
		position: absolute;
		inset: -15px;
		z-index: 2;
		pointer-events: none;
		color: #e52a24;
	}
	svg {
		width: 100%;
		height: 100%;
		overflow: visible;
	}
	path {
		vector-effect: non-scaling-stroke;
	}
	.frame-main {
		stroke: currentColor;
		stroke-width: 1;
	}
	.frame-secondary {
		stroke: #888;
		stroke-width: 1;
		opacity: 0.6;
	}
	.frame-accent {
		stroke: currentColor;
		stroke-width: 4;
	}
	.frame-ticks {
		stroke: currentColor;
		stroke-width: 2;
	}
	.frame-orbit {
		position: absolute;
		right: -12px;
		top: -22px;
		width: 82px;
		aspect-ratio: 1;
		border: 1px solid currentColor;
		border-radius: 50%;
		background: transparent;
	}
	.frame-orbit i {
		position: absolute;
		inset: 8px;
		border: 5px solid currentColor;
		border-left-color: transparent;
		border-bottom-color: transparent;
		border-radius: 50%;
		transform: rotate(-24deg);
	}
	.frame-orbit b {
		position: absolute;
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: currentColor;
		left: 8px;
		bottom: 9px;
	}
	.frame-nodes {
		position: absolute;
		bottom: -3px;
		left: 30px;
		display: flex;
		gap: 6px;
	}
	.frame-nodes i {
		width: 6px;
		height: 6px;
		border: 1px solid currentColor;
		border-radius: 50%;
	}
	.frame-nodes i:first-child {
		background: currentColor;
	}
	.frame-strip {
		position: absolute;
		right: 12%;
		bottom: 10px;
		width: 22%;
		height: 5px;
		background: repeating-linear-gradient(120deg, currentColor 0 2px, transparent 2px 5px);
	}
	.compact {
		inset: -10px;
	}
	.compact .frame-orbit {
		width: 45px;
		top: -12px;
		right: -10px;
	}
	.compact .frame-orbit i {
		inset: 5px;
		border-width: 3px;
	}
	.compact .frame-nodes {
		left: 15px;
	}
	@media (hover: hover) and (prefers-reduced-motion: no-preference) {
		.frame-orbit i {
			transition: transform 700ms cubic-bezier(0.2, 0.7, 0.2, 1);
		}
		:global(.portrait:hover) .frame-orbit i,
		:global(.contact-photo:hover) .frame-orbit i {
			transform: rotate(66deg);
		}
	}
	@media (max-width: 760px) {
		.tech-frame {
			inset: -9px;
		}
		.frame-orbit {
			width: 52px;
			top: -14px;
			right: -6px;
		}
		.compact .frame-orbit {
			width: 30px;
			top: -7px;
		}
		.compact .frame-nodes,
		.compact .frame-strip {
			display: none;
		}
	}
</style>
