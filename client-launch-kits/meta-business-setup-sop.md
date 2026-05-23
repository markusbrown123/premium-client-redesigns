# Meta Business Setup — Standard Operating Procedure

This SOP describes how to launch a local service client on Meta (Facebook + Instagram) from zero. It is the master workflow. Every other file in this folder supports a step in this SOP.

**Scope:** Page setup, Instagram Business setup, Meta Business Portfolio, ad account, first campaign, first organic posts, handoff.

**Out of scope:** Anything that requires logging into Meta on the client's behalf. Anything that handles their passwords, 2FA, payments, or identity verification. Those steps are flagged as **manual, client-present**.

---

## Phase 0 — Pre-engagement

1. Sign the agency services agreement with the client.
2. Confirm the client owns (or is the legal operator of) the business.
3. Confirm the client has, or will create, a personal Facebook account they control.
4. Send `client-intake-template.md` and collect it back fully filled in.

Do **not** proceed until intake is complete and you have written confirmation of the business name, address, phone, and website.

---

## Phase 1 — Intake review

Read the completed intake and confirm:

- Legal business name and DBA (if any).
- Primary phone number (the one that should ring from ads).
- Website URL (must be live and reachable).
- Service area (city/county/radius).
- Top three service categories.
- Existing brand assets: logo, colors, photos, videos.
- Existing accounts (if any) the client already has on Facebook or Instagram.

If the client already has a Page or IG account, **do not** create new ones. Plan to claim/clean up the existing ones instead.

---

## Phase 2 — What must be done manually in Meta

These steps require a real human, signed into their own Meta account, completing platform flows that include identity checks, 2FA, and payment entry. The agency may guide the client through these on a screen share, but the **client must drive the keyboard** for any step that touches credentials, 2FA, payment, or identity.

1. **Create or log into the client's personal Facebook account.**
   - Client-driven. Agency never types the password.
2. **Create the Facebook Page** for the business.
   - From the client's personal account, create a new Page.
   - Use the intake to fill business name, category, contact info.
3. **Create the Instagram account** for the business.
   - Either from the IG app or on instagram.com, client-driven.
4. **Convert Instagram to a Business account.**
   - In IG settings → Account type and tools → Switch to professional → Business.
   - Choose the matching business category.
5. **Connect Page + Instagram.**
   - From the Facebook Page settings → Linked accounts → Instagram, link the IG Business account.
6. **Create a Meta Business Portfolio** (Business Manager).
   - business.facebook.com → Create portfolio.
   - Add the Page and the Instagram account as business assets.
7. **Create an ad account** inside the portfolio.
   - Set currency, time zone, and country to the client's actual operating values. These cannot be changed later without creating a new ad account.
8. **Add a payment method.**
   - Client enters their own card or billing details. Agency never types card numbers.
9. **Verify the domain** (if running conversion campaigns or to protect the Page).
   - Add the DNS TXT record or upload the HTML file the client's web host requires.
10. **Add the Meta Pixel later** (only when the website has events worth tracking — leads, form submits, calls).
    - Install via Google Tag Manager or directly in the site head.
11. **Grant the agency partner access** to the portfolio, the Page, the IG account, and the ad account.
    - Via Business Manager → Partners → Add partner using the agency's business ID.
    - **Never** share usernames or passwords. Partner access only.

Stop here and verify each item above is green before moving on.

---

## Phase 3 — Page and profile population

Once the Page and IG Business profile exist and the agency has partner access:

1. Use `facebook-page-checklist.md` to fully populate the Page: profile photo, cover, About, services, hours, action button, website, location.
2. Use `instagram-profile-checklist.md` to fully populate the IG profile: handle, bio, link, contact options, category, profile photo, highlights placeholder.
3. Confirm the **action button** on the Page is set correctly (Call Now or Send Message for most local service clients).
4. Confirm the IG profile's **contact buttons** are visible (Call, Email, Directions if applicable).

---

## Phase 4 — First organic posts

Publish at least three organic posts on the Page and on Instagram **before** any paid campaign goes live. This makes the profiles look real to both users and Meta's review systems.

Use `organic-post-template.md` for:

1. **Intro post** — who the business is, what they do, service area, phone.
2. **Finished-work post** — best before/after or hero photo with a one-line caption.
3. **Owner / trust post** — owner-led photo or a customer trust signal (years in business, licensed/insured, reviews).

Cross-post to Instagram where appropriate.

---

## Phase 5 — First paid campaign

Use `ad-campaign-template.md` to build the first campaign. Apply `naming-conventions.md` throughout.

1. Pick the objective from the recommendations in the launch plan. For local service clients the default is **Calls** or **Leads**. Use **Traffic** only when the website/form is fully confirmed and the Pixel is firing.
2. Build the campaign as a **draft** first. Do not publish.
3. Have the client review the draft inside Ads Manager (they have access via the partner connection).
4. Once approved by the client, publish.
5. Set a conservative starting budget (the launch plan specifies).

---

## Phase 6 — Tracking and reporting

1. Standardize UTMs on every link using `naming-conventions.md`.
2. Set up a weekly reporting cadence: spend, impressions, clicks/calls/leads, cost per result.
3. After 7 days of data, review. After 14 days, make the first optimization pass.

---

## Phase 7 — Handoff documentation

For every client, store in their folder:

- Completed intake form.
- Filled-in launch plan (model on `a1-sealcoating-launch-plan.md`).
- Screenshots or notes of the partner access grant.
- The published campaign IDs and ad set IDs.
- The first three organic post links.

---

## What can be automated later with official APIs

Once partner access is in place and the client signs off on automation scope, these are appropriate candidates for tooling **using official, approved Meta APIs only**:

- **Campaign drafts** — generating draft campaign structures (objective, ad sets, ads) for human review before publishing.
- **Creative naming** — applying `naming-conventions.md` to creatives uploaded by humans.
- **UTM generation** — building consistent UTM strings for all destination URLs.
- **Reporting exports** — pulling Insights / Ads Insights data into a sheet or dashboard.
- **Ad performance summaries** — turning the exported data into weekly client-facing summaries.
- **Campaign creation** — only after the agency holds approved **Meta Marketing API** access and the client has authorized it in writing.

None of these involve logging in as the client, automating signup, handling 2FA, or bypassing review.

---

## Hard rules (do not break)

- No scripted logins to Meta.
- No automated account signup.
- No handling of client passwords, 2FA codes, payment methods, or government ID.
- No scraping of Meta surfaces in lieu of using the official API.
- Access is granted via Business Manager partner access. Always.
