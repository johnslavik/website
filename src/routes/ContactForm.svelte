<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount, tick } from 'svelte';
	import { meetingTimes } from '$lib/meeting-times';
	let mode = $state<'message' | 'meeting'>('meeting');
	let details = $state(false);
	let nameInput = $state<HTMLInputElement>();
	let timeInput = $state<HTMLSelectElement>();
	let name = $state('');
	let email = $state('');
	let note = $state('');
	let website = $state('');
	let date = $state('');
	let time = $state('');
	let timeZone = $state('Europe/Warsaw');
	let today = $state('');
	let month = $state(new Date().getMonth());
	let year = $state(new Date().getFullYear());
	let ready = $state(false);
	let sending = $state(false);
	let sent = $state(false);
	let error = $state('');
	let sentMeeting = $state(false);
	let retryKey = '';
	let retryBody = '';
	const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
	const dateKey = (d: Date) =>
		`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	let maxDate = $state('');
	onMount(() => {
		const now = new Date();
		time =
			meetingTimes.find(
				(slot) => new Date(`${dateKey(now)}T${slot}:00`).getTime() >= now.getTime() + 3600000
			) ?? meetingTimes[0];
		today = dateKey(now);
		maxDate = dateKey(new Date(now.getTime() + 60 * 86400000));
		month = now.getMonth();
		year = now.getFullYear();
		timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		ready = true;
	});
	const monthLabel = $derived(
		new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(
			new Date(year, month, 1)
		)
	);
	const days = $derived(
		Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, i) => ({
			day: i + 1,
			key: dateKey(new Date(year, month, i + 1))
		}))
	);
	const offset = $derived((new Date(year, month, 1).getDay() + 6) % 7);
	const canPrevious = $derived(dateKey(new Date(year, month, 1)) > today.slice(0, 7) + '-01');
	const canNext = $derived(dateKey(new Date(year, month + 1, 1)) <= maxDate);
	function changeMonth(step: number) {
		const next = new Date(year, month + step, 1);
		month = next.getMonth();
		year = next.getFullYear();
	}
	const selectedLabel = $derived(
		date
			? new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(
					new Date(`${date}T12:00:00`)
				)
			: 'Choose a date'
	);
	function availableTimes(day: string) {
		return meetingTimes.filter(
			(slot) => new Date(`${day}T${slot}:00`).getTime() >= Date.now() + 3600000
		);
	}
	function chooseDate(day: string) {
		date = day;
		const available = availableTimes(day);
		if (!available.includes(time)) time = available[0] ?? '';
		error = '';
	}
	function validTime() {
		const delay = new Date(`${date}T${time}:00`).getTime() - Date.now();
		return Boolean(
			date &&
			meetingTimes.includes(time) &&
			Number.isFinite(delay) &&
			delay >= 3600000 &&
			delay <= 60 * 86400000
		);
	}
	async function continueToDetails() {
		if (!validTime()) {
			error = 'Choose a date and time at least an hour from now, within the next 60 days.';
			return;
		}
		error = '';
		details = true;
		await tick();
		nameInput?.focus();
	}
	async function editTime() {
		details = false;
		error = '';
		await tick();
		timeInput?.focus();
	}
	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (sending) return;
		if (mode === 'meeting' && !details) {
			await continueToDetails();
			return;
		}
		error = '';
		let start: string | undefined;
		if (mode === 'meeting') {
			const proposed = new Date(`${date}T${time}:00`);
			const delay = proposed.getTime() - Date.now();
			if (!date || !time || !Number.isFinite(delay) || delay < 3600000 || delay > 60 * 86400000) {
				error = 'Choose a time at least an hour from now, within the next 60 days.';
				return;
			}
			start = proposed.toISOString();
		}
		const body = JSON.stringify({
			name,
			email,
			note,
			website,
			timeZone,
			preferredTime: start ? `${date} ${time}` : '',
			...(start ? { start } : {})
		});
		if (body !== retryBody) {
			retryBody = body;
			retryKey = crypto.randomUUID();
		}
		sending = true;
		try {
			const response = await fetch('/api/booking/request', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'Idempotency-Key': retryKey },
				body,
				signal: AbortSignal.timeout(15000)
			});
			const result = (await response.json()) as {
				error?: string;
				status?: string;
				requestId?: string;
			};
			if (!response.ok)
				throw new Error(result.error || 'Your request could not be confirmed. Please try again.');
			if (result.status !== 'pending' || !result.requestId)
				throw new Error('Your request could not be confirmed. Please try again.');
			sentMeeting = mode === 'meeting';
			sent = true;
		} catch (cause) {
			error =
				cause instanceof Error && cause.name !== 'TimeoutError' && cause.name !== 'TypeError'
					? cause.message
					: 'Could not confirm delivery. Your details are still here. Please try again.';
		} finally {
			sending = false;
		}
	}
	function reset() {
		sent = false;
		details = false;
		name = '';
		email = '';
		note = '';
		date = '';
		retryBody = '';
		retryKey = '';
	}
</script>

<div class="contact-panel" class:message-mode={mode === 'message'}>
	{#if sent}
		<div class="contact-success" role="status">
			<h3>{sentMeeting ? 'Meeting request received' : 'Message received'}</h3>
			<p>
				{sentMeeting
					? 'I’ll reply by email to confirm the time. Your meeting is not booked yet.'
					: 'I’ll reply to the email address you provided.'}
			</p>
			<button type="button" class="plain-button" onclick={reset}>Send another message</button>
		</div>
	{:else}
		<div class="contact-modes" aria-label="Contact method">
			<button
				type="button"
				aria-pressed={mode === 'message'}
				disabled={sending}
				onclick={() => {
					mode = 'message';
					error = '';
				}}>Send a message</button
			><button
				type="button"
				aria-pressed={mode === 'meeting'}
				disabled={sending}
				onclick={() => {
					mode = 'meeting';
					error = '';
				}}>Plan a call</button
			>
		</div>
		<form onsubmit={submit}>
			<fieldset disabled={sending}>
				{#if mode === 'meeting' && ready && !details}
					<div class="booking-intro">
						<h3>When works for you?</h3>
						<p>30 minutes ({timeZone.replaceAll('_', ' ')})</p>
					</div>
					<div class="calendar">
						<div class="calendar-header">
							<button
								type="button"
								aria-label="Previous month"
								disabled={!canPrevious}
								onclick={() => changeMonth(-1)}><span aria-hidden="true">←</span></button
							>
							<h3 aria-live="polite">{monthLabel}</h3>
							<button
								type="button"
								aria-label="Next month"
								disabled={!canNext}
								onclick={() => changeMonth(1)}><span aria-hidden="true">→</span></button
							>
						</div>
						<div class="calendar-grid">
							{#each weekdays as day (day)}<span class="weekday">{day}</span>{/each}
							{#each Array.from({ length: offset }, (_, index) => index) as blank (blank)}<span
								></span>{/each}
							{#each days as day (day.key)}<button
									type="button"
									class:selected={date === day.key}
									aria-pressed={date === day.key}
									aria-label={new Intl.DateTimeFormat('en', { dateStyle: 'full' }).format(
										new Date(year, month, day.day)
									)}
									disabled={day.key < today ||
										day.key > maxDate ||
										availableTimes(day.key).length === 0}
									onclick={() => {
										chooseDate(day.key);
									}}>{day.day}</button
								>{/each}
						</div>
					</div>
					<div class="meeting-time">
						<label for="meeting-time"
							>Preferred time<select
								bind:this={timeInput}
								id="meeting-time"
								bind:value={time}
								required
							>
								{#each meetingTimes as slot (slot)}
									<option
										value={slot}
										disabled={Boolean(date) && !availableTimes(date).includes(slot)}>{slot}</option
									>
								{/each}
							</select></label
						>
					</div>

					{#if error}<p class="form-error" role="alert">{error}</p>{/if}
					<button
						type="button"
						class="primary-link booking-continue"
						disabled={!date || !time}
						onclick={continueToDetails}>Continue</button
					>
				{/if}
				{#if mode === 'message' || details}
					{#if mode === 'meeting'}
						<div class="booking-summary">
							<div>
								<strong>{selectedLabel} at {time}</strong>
								<span>30 minutes ({timeZone.replaceAll('_', ' ')})</span>
							</div>
							<button type="button" class="plain-button" onclick={editTime}>Change time</button>
						</div>
					{/if}
					<div class="contact-fields">
						<label for="contact-name"
							>Name<input
								bind:this={nameInput}
								id="contact-name"
								name="name"
								autocomplete="name"
								bind:value={name}
								required
								maxlength="120"
							/></label
						><label for="contact-email"
							>Email<input
								id="contact-email"
								name="email"
								type="email"
								autocomplete="email"
								bind:value={email}
								required
								maxlength="254"
							/></label
						>
					</div>
					<label for="contact-note"
						>{mode === 'meeting' ? 'What would you like to discuss?' : 'Message'}<textarea
							id="contact-note"
							name="note"
							bind:value={note}
							required
							maxlength="1500"
							rows="4"
						></textarea></label
					>
					<div class="contact-trap" aria-hidden="true">
						<label for="contact-website"
							>Website<input
								id="contact-website"
								bind:value={website}
								tabindex="-1"
								autocomplete="off"
							/></label
						>
					</div>
					<p class="form-note">
						<a href={resolve('/privacy')} target="_blank" rel="noopener noreferrer"
							>Privacy policy</a
						>
					</p>
					{#if error}<p class="form-error" role="alert">{error}</p>{/if}
					<button class="primary-link" type="submit" disabled={!ready || sending}
						>{sending
							? 'Sending…'
							: mode === 'meeting'
								? 'Send meeting request'
								: 'Send message'}</button
					>
				{/if}
			</fieldset>
		</form>
		<noscript><p>Please enable JavaScript to use this form.</p></noscript>
	{/if}
</div>

<style>
	.contact-panel.message-mode {
		align-self: start;
	}
	.booking-continue {
		margin-top: 20px;
	}
	.calendar-header button {
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
		padding: 0;
		font-size: 24px;
		line-height: 1;
	}
	.calendar-header button:focus-visible {
		outline: 2px solid #e52a24;
		outline-offset: 2px;
	}
	.calendar-header {
		margin-bottom: 8px;
	}
	.booking-intro p {
		margin-bottom: 18px;
	}
	.meeting-time {
		margin-top: 18px;
	}
	.meeting-time label {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		gap: 16px;
	}
	.meeting-time select {
		width: auto;
		min-width: 110px;
		margin: 0;
	}
</style>
