import { Bodies, Body, Composite, Engine, Sleeping } from 'matter-js';

type Piece = {
	source: HTMLElement | SVGGraphicsElement;
	node: HTMLElement;
	body: Body;
	width: number;
	height: number;
};
export function startPuzzlePhysics(root: HTMLElement) {
	const engine = Engine.create({ enableSleeping: true });
	engine.gravity.y = 1;
	const layer = document.createElement('div');
	layer.className = 'puzzle-stage';
	document.body.appendChild(layer);
	const pieces: Piece[] = [];
	let walls: Body[] = [];
	let frame = 0;
	let last = 0;
	let drag:
		| {
				piece: Piece;
				id: number;
				x: number;
				y: number;
				lastX: number;
				lastY: number;
				stamp: number;
				vx: number;
				vy: number;
		  }
		| undefined;
	const reduced = matchMedia('(prefers-reduced-motion: reduce)');
	const sources = Array.from(
		root.querySelectorAll<HTMLElement | SVGGraphicsElement>(
			'.background-art > path, .background-art > rect, .hero-block, .hero-bridge, .portrait-block, .activity-art i, .activity-art b, .contact-block, .contact-outline, .talks-piece, .composition-piece'
		)
	);
	function boundaries() {
		Composite.remove(engine.world, walls);
		const w = innerWidth,
			h = innerHeight;
		walls = [
			Bodies.rectangle(w / 2, h + 30, w + 120, 60, { isStatic: true }),
			Bodies.rectangle(-30, h / 2, 60, h * 3, { isStatic: true }),
			Bodies.rectangle(w + 30, h / 2, 60, h * 3, { isStatic: true })
		];
		Composite.add(engine.world, walls);
	}
	function draw(piece: Piece) {
		piece.node.style.transform = `translate(${piece.body.position.x - piece.width / 2}px, ${piece.body.position.y - piece.height / 2}px) rotate(${piece.body.angle}rad)`;
	}
	function tick(now: number) {
		frame = 0;
		if (document.hidden) return;
		const dt = Math.min(33, last ? now - last : 16.67);
		last = now;
		Engine.update(engine, dt);
		pieces.forEach(draw);
		if (drag || pieces.some((p) => !p.body.isStatic && !p.body.isSleeping))
			frame = requestAnimationFrame(tick);
	}
	function wake() {
		if (!frame && !document.hidden) {
			last = 0;
			frame = requestAnimationFrame(tick);
		}
	}
	function reset() {
		drag = undefined;
		cancelAnimationFrame(frame);
		frame = 0;
		for (const p of pieces) {
			p.source.style.visibility = '';
			p.node.remove();
			Composite.remove(engine.world, p.body);
		}
		pieces.length = 0;
	}
	function clone(source: HTMLElement | SVGGraphicsElement): Piece {
		const rect = source.getBoundingClientRect();
		const node = document.createElement('div');
		node.className = 'puzzle-loose';
		node.tabIndex = 0;
		node.setAttribute('role', 'button');
		node.setAttribute(
			'aria-label',
			'Movable artwork. Drag to throw; arrow keys to nudge; Escape to restore artwork.'
		);
		const width = Math.max(16, Math.min(rect.width, innerWidth * 0.8));
		const height = Math.max(16, Math.min(rect.height, innerHeight * 0.7));
		node.style.width = `${width}px`;
		node.style.height = `${height}px`;
		if (source instanceof SVGGraphicsElement) {
			const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			const box = source.getBBox();
			svg.setAttribute('viewBox', `${box.x - 1} ${box.y - 1} ${box.width + 2} ${box.height + 2}`);
			svg.setAttribute('preserveAspectRatio', 'none');
			const defs = source.ownerSVGElement?.querySelector('defs')?.cloneNode(true);
			if (defs) {
				const suffix = `-loose-${pieces.length}`;
				const copy = source.cloneNode(true) as SVGElement;
				(defs as Element).querySelectorAll('[id]').forEach((el) => {
					const id = el.id;
					el.id += suffix;
					if (copy.getAttribute('fill') === `url(#${id})`)
						copy.setAttribute('fill', `url(#${id}${suffix})`);
				});
				svg.appendChild(defs);
				svg.appendChild(copy);
			} else svg.appendChild(source.cloneNode(true));
			node.appendChild(svg);
		} else {
			const css = getComputedStyle(source);
			for (const prop of [
				'background',
				'border-top',
				'border-right',
				'border-bottom',
				'border-left',
				'box-shadow',
				'opacity'
			])
				node.style.setProperty(prop, css.getPropertyValue(prop));
		}
		source.style.visibility = 'hidden';
		layer.appendChild(node);
		const body = Bodies.rectangle(rect.left + width / 2, rect.top + height / 2, width, height, {
			restitution: reduced.matches ? 0 : 0.42,
			friction: 0.45,
			frictionAir: 0.018
		});
		Body.setStatic(body, true);
		const piece = { source, node, body, width, height };
		pieces.push(piece);
		Composite.add(engine.world, body);
		draw(piece);
		node.addEventListener('pointerdown', (e) => grab(e, piece));
		node.addEventListener('keydown', (e) => keyboard(e, piece));
		return piece;
	}
	function grab(event: PointerEvent, piece: Piece) {
		if (event.pointerType !== 'mouse' || event.button !== 0 || drag) return;
		event.preventDefault();
		event.stopPropagation();
		Body.setStatic(piece.body, true);
		Body.setAngle(piece.body, 0);
		const x = Math.max(
			-piece.width / 2,
			Math.min(piece.width / 2, event.clientX - piece.body.position.x)
		);
		const y = Math.max(
			-piece.height / 2,
			Math.min(piece.height / 2, event.clientY - piece.body.position.y)
		);
		drag = {
			piece,
			id: event.pointerId,
			x,
			y,
			lastX: event.clientX,
			lastY: event.clientY,
			stamp: performance.now(),
			vx: 0,
			vy: 0
		};
		piece.node.classList.add('is-held');
		piece.node.focus({ preventScroll: true });
		wake();
	}
	function move(event: PointerEvent) {
		if (!drag || event.pointerId !== drag.id) return;
		event.preventDefault();
		const now = performance.now(),
			dt = Math.max(8, now - drag.stamp);
		drag.vx = Math.max(-25, Math.min(25, ((event.clientX - drag.lastX) * 16.67) / dt));
		drag.vy = Math.max(-25, Math.min(25, ((event.clientY - drag.lastY) * 16.67) / dt));
		drag.lastX = event.clientX;
		drag.lastY = event.clientY;
		drag.stamp = now;
		const p = drag.piece;
		Body.setPosition(p.body, {
			x: Math.max(p.width / 2, Math.min(innerWidth - p.width / 2, event.clientX - drag.x)),
			y: Math.max(p.height / 2, Math.min(innerHeight - p.height / 2, event.clientY - drag.y))
		});
		draw(p);
	}
	function release(event?: PointerEvent) {
		if (!drag || (event && event.pointerId !== drag.id)) return;
		const { piece, vx, vy, stamp } = drag;
		piece.node.classList.remove('is-held');
		Body.setStatic(piece.body, false);
		Sleeping.set(piece.body, false);
		const throwIt = !reduced.matches && performance.now() - stamp < 100;
		Body.setVelocity(piece.body, { x: throwIt ? vx : 0, y: throwIt ? vy : 0 });
		Body.setAngularVelocity(piece.body, throwIt ? vx * 0.003 : 0);
		drag = undefined;
		wake();
	}
	function keyboard(event: KeyboardEvent, piece?: Piece) {
		if (event.key === 'Escape') {
			event.preventDefault();
			const source = piece?.source;
			reset();
			source?.focus({ preventScroll: true });
			return;
		}
		if (!piece || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(event.key))
			return;
		event.preventDefault();
		Body.setStatic(piece.body, false);
		Sleeping.set(piece.body, false);
		Body.setVelocity(piece.body, {
			x: event.key === 'ArrowLeft' ? -8 : event.key === 'ArrowRight' ? 8 : 0,
			y: event.key === 'ArrowUp' || event.key === ' ' ? -10 : 4
		});
		wake();
	}
	const cleanup: (() => void)[] = [];
	sources.forEach((source) => {
		source.setAttribute('data-puzzle', '');
		source.setAttribute('tabindex', '0');
		source.setAttribute('role', 'button');
		source.setAttribute(
			'aria-label',
			'Drag this artwork. Press Enter to drop it; Escape to restore all pieces.'
		);
		const down = (event: Event) => {
			const e = event as PointerEvent;
			if (e.pointerType === 'mouse' && e.button === 0 && !drag) grab(e, clone(source));
		};
		const key = (event: Event) => {
			const e = event as KeyboardEvent;
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				const p = clone(source);
				p.node.focus({ preventScroll: true });
				Body.setStatic(p.body, false);
				wake();
			} else keyboard(e);
		};
		source.addEventListener('pointerdown', down);
		source.addEventListener('keydown', key);
		cleanup.push(() => {
			source.removeEventListener('pointerdown', down);
			source.removeEventListener('keydown', key);
			for (const attribute of ['data-puzzle', 'tabindex', 'role', 'aria-label'])
				source.removeAttribute(attribute);
		});
	});
	const escape = (event: KeyboardEvent) => {
		if (event.key === 'Escape' && !event.defaultPrevented) reset();
	};
	window.addEventListener('keydown', escape);
	const blur = () => release();
	const resize = () => {
		reset();
		boundaries();
	};
	const hidden = () => {
		release();
		if (document.hidden) {
			cancelAnimationFrame(frame);
			frame = 0;
		} else wake();
	};
	boundaries();
	window.addEventListener('pointermove', move, { passive: false });
	window.addEventListener('pointerup', release);
	window.addEventListener('pointercancel', release);
	window.addEventListener('blur', blur);
	window.addEventListener('resize', resize);
	document.addEventListener('visibilitychange', hidden);
	return () => {
		reset();
		window.removeEventListener('keydown', escape);
		cleanup.forEach((fn) => fn());
		layer.remove();
		Engine.clear(engine);
		window.removeEventListener('pointermove', move);
		window.removeEventListener('pointerup', release);
		window.removeEventListener('pointercancel', release);
		window.removeEventListener('blur', blur);
		window.removeEventListener('resize', resize);
		document.removeEventListener('visibilitychange', hidden);
	};
}
