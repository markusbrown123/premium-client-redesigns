# First Ad Campaign Template

Reusable structure for the first paid campaign for a local service client. Apply `naming-conventions.md` to every name. Build the campaign as a **draft** first and have the client approve it inside Ads Manager before publishing.

---

## 1. Objective

Pick one. Defaults for local service:

- **Calls** — best when the business wants the phone to ring and conversions happen on the call.
- **Leads** — best when the business has a lead form (instant form on Meta, or a form on the website with a working Pixel + event).
- **Traffic** — only if the website/form is fully confirmed (page is fast, form works, Pixel fires on submit). Otherwise traffic ads waste budget.

Do **not** pick Conversions / Sales without the Pixel installed and at least one verified standard event.

## 2. Campaign

- Campaign name: see `naming-conventions.md` (`{Client}_{Objective}_{Geo}_{Theme}_{YYYY-MM}`).
- Special ad category: set if the business is in housing, employment, credit, or social/political issues. Otherwise leave off.
- Campaign budget optimization (CBO): off for the first campaign. Set budgets at the ad set level so we can learn per audience.
- A/B test: off for the very first launch. Start one clean ad set, then iterate.

## 3. Ad set

One ad set to start. Add more only after we have data.

- Ad set name: `{Audience}_{Geo}_{Placement}_{YYYY-MM}`.
- Conversion location: matches the objective (Phone call, Instant form, Website).
- Performance goal: matches the objective (Maximize calls, Maximize leads, etc.).
- Budget: daily budget, conservative for the first 7 days. Define the dollar amount in the client's launch plan.
- Schedule: start tomorrow, no end date for the first run.
- **Location targeting**: the actual service area from the intake. Use radius around the home base or specific zip codes, not entire states.
- Age: matches the buyer for the service (homeowner age range is usually 28–65).
- Gender: all unless the service is genuinely gendered.
- Detailed targeting: keep narrow on first launch. One or two interests max, or broad with location only.
- Languages: leave blank unless the business serves a specific language community.
- Placements: **Advantage+ placements** for the first launch (let Meta pick). Revisit after 14 days of data.

## 4. Ads

Start with one ad. Plan creative variants for week 2 once we see what's working.

- Ad name: `{Creative}_{Format}_{Variant}_{YYYY-MM}`.
- Identity: the client's Facebook Page and Instagram Business account.
- Format: image, carousel, or short video. For local service, a single strong hero image or a 3–5 card carousel of finished work is the safest first ad.
- Primary text: see copy section below.
- Headline: see copy section below.
- Description: see copy section below.
- Destination: phone number (Calls), instant form (Leads), or website URL with UTMs (Traffic).
- Call to action button: see CTA section below.
- Tracking: append standard UTMs to any website URL (see `naming-conventions.md`).

## 5. Creative

Three creative directions to prepare:

1. **Hero image** — the best single photo of finished work (driveway, roof, lawn, etc.).
2. **Branded equipment** — the truck, trailer, or crew on a job. Builds trust.
3. **Carousel of finished jobs** — 3–5 before/after or finished shots. Each card has a one-line caption.

All creative should:

- Be high resolution (1080×1080 minimum for square, 1080×1350 for portrait).
- Have minimal overlaid text (Meta no longer hard-blocks it, but performance still suffers past ~20%).
- Look real, not stock.

## 6. Copy framework

Write **5 primary texts**, **5 headlines**, and **3 descriptions**. The first ad uses one of each; the rest are queued for iteration.

**Primary text pattern:**
- Line 1: local hook ("Need [service] in [city]?")
- Line 2: offer ("[Offer], no obligation.")
- Line 3: trust ("[Years] years serving [area]. Licensed & insured.")
- Line 4: CTA ("Call [phone] or tap below.")

**Headline pattern:** 4–7 words. Lead with the service + the geo OR the offer.

**Description pattern:** one sentence reinforcing the offer or the trust point.

## 7. CTA

Default CTA for local service:

- **Calls campaign** → `Call Now`.
- **Leads campaign** → `Get Quote` or `Sign Up`.
- **Traffic campaign** → `Learn More`.

Match the CTA to the actual destination so the click doesn't surprise the user.

## 8. Tracking

- Add standard UTMs to every website URL using `naming-conventions.md`.
- Confirm the phone number on calls ads matches the number on the Page and the website.
- If using the lead form, confirm the lead notification email and CRM destination before publishing.

## 9. Launch checklist

- [ ] Page and IG are populated and have at least three organic posts.
- [ ] Ad account has a payment method and a spending limit set.
- [ ] Naming follows `naming-conventions.md` throughout.
- [ ] Draft has been reviewed by the client in Ads Manager.
- [ ] Phone number / form / URL tested end-to-end.
- [ ] UTMs verified on the landing page.
- [ ] Client has approved the budget and the schedule.
- [ ] Reporting cadence and dashboard agreed.

Only then: publish.
