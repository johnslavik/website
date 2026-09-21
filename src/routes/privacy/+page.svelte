<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<svelte:head
	><title>Privacy policy — Bartosz Sławecki</title><meta
		name="description"
		content="How this website handles contact details, meeting requests and technical data."
	/></svelte:head
>
<main class="privacy-page">
	<a class="home-link" href={resolve('/')}>Bartosz Sławecki</a>
	<h1>Privacy policy</h1>
	<p class="updated">Updated 22 September 2026</p>
	<section>
		<h2>Who handles your data</h2>
		<p>
			Bartosz Sławecki is the controller of personal data collected through this website, including
			its Cloudflare preview address. For privacy questions or requests, email <a
				href="mailto:bartosz@nawczoraj.com">bartosz@nawczoraj.com</a
			>.
		</p>
	</section>
	<section>
		<h2>Messages and meeting requests</h2>
		<p>
			The form collects your name, email address, message and browser timezone. A meeting request
			also includes your preferred date and time. The site records the submission time and request
			status. These details are stored in a dedicated Cloudflare D1 database and may be sent to my
			email inbox through Cloudflare’s email service so I can respond.
		</p>
		<p>
			I use this information to answer your enquiry and arrange a conversation. For enquiries about
			working together, processing is necessary to take steps at your request before a contract
			(GDPR Article 6(1)(b)). For other correspondence, my legitimate interest is responding to
			messages (Article 6(1)(f)). Providing the requested details is voluntary, but I need them to
			handle the form submission. They are not used for mailing lists or advertising.
		</p>
	</section>
	<section>
		<h2>Technical data and abuse prevention</h2>
		<p>
			Cloudflare hosts and protects the site and processes technical request data, which can include
			your IP address, browser information and requested URL. The form uses a salted hash derived
			from your IP address to limit repeated submissions. These rate-limit records expire after 15
			minutes and are cleared on a subsequent submission. This processing serves the legitimate
			interest of keeping the site secure and available.
		</p>
	</section>
	<section>
		<h2>External services</h2>
		<p>
			The contact portrait loads from GitHub and video thumbnails load from YouTube’s image service.
			Your browser contacts those providers to retrieve the images, sharing technical information
			such as your IP address. GitHub activity is fetched by the site’s server. Videos are not
			embedded: opening a recording takes you to YouTube. Other external links take you to the
			respective provider’s website.
		</p>
		<p>
			Cloudflare and external providers may process data outside the European Economic Area.
			Cloudflare describes its transfer safeguards, including standard contractual clauses, in its <a
				href="https://www.cloudflare.com/cloudflare-customer-dpa/"
				target="_blank"
				rel="noopener noreferrer">Data Processing Addendum</a
			>. See also
			<a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer"
				>Cloudflare’s privacy policy</a
			>,
			<a
				href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
				target="_blank"
				rel="noopener noreferrer">GitHub’s privacy statement</a
			>
			and
			<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer"
				>Google’s privacy policy</a
			>.
		</p>
	</section>
	<section>
		<h2>Cookies and retention</h2>
		<p>
			The website does not add analytics or advertising cookies, and form drafts are not saved to
			browser storage. Infrastructure providers may use necessary security mechanisms.
		</p>
		<p>
			Correspondence is retained for as long as needed to handle the enquiry, related follow-up and
			any applicable legal obligations or claims. The appropriate period depends on whether the
			conversation leads to an ongoing working relationship. You can request deletion using the
			email address above. Provider security logs and email copies are subject to their respective
			retention settings.
		</p>
	</section>
	<section>
		<h2>Your rights</h2>
		<p>
			Depending on the circumstances, you can request access, correction, deletion, restriction or
			portability of your personal data, and object to processing based on legitimate interests.
			Contact me at the address above. You can also complain to Poland’s <a
				href="https://uodo.gov.pl/"
				target="_blank"
				rel="noopener noreferrer">Personal Data Protection Office (UODO)</a
			> or your local supervisory authority. The site does not use profiling or automated decisions with
			legal or similarly significant effects.
		</p>
	</section>
</main>

<style>
	.privacy-page {
		max-width: 900px;
		margin: 0 auto;
		padding: 56px 32px 100px;
		color: #171717;
	}
	.home-link {
		display: inline-block;
		font-size: 16px;
		margin-bottom: 72px;
	}
	h1 {
		font-size: clamp(44px, 7vw, 80px);
		line-height: 1;
		letter-spacing: -0.055em;
		margin: 0 0 24px;
	}
	.updated {
		font-size: 13px;
		color: #666;
		margin-bottom: 56px;
	}
	section {
		border-top: 1px solid #ddd;
		padding-top: 24px;
		margin-top: 36px;
	}
	h2 {
		font-size: 25px;
		line-height: 1.25;
		letter-spacing: -0.025em;
		margin-bottom: 16px;
	}
	p {
		font-size: 16px;
		line-height: 1.75;
		margin: 0 0 18px;
	}
	a {
		text-decoration: underline;
		text-decoration-color: #e52a24;
		text-underline-offset: 4px;
		overflow-wrap: anywhere;
	}
	a:hover {
		color: #c8211c;
	}
	@media (max-width: 600px) {
		.privacy-page {
			padding: 32px 24px 64px;
		}
		.home-link {
			margin-bottom: 48px;
		}
	}
</style>
