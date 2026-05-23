# Naming Conventions

Consistent names across campaigns, ad sets, ads, creatives, and UTMs make reporting actually work. Apply these to every client.

---

## Tokens

- `{Client}` — short client slug, lowercase, no spaces. Example: `a1seal`.
- `{Objective}` — Meta objective shortcode: `calls`, `leads`, `traffic`, `engage`, `awareness`, `sales`.
- `{Geo}` — the targeted area. City code or state. Example: `nj`, `monmouth-nj`.
- `{Theme}` — what the campaign is about. Example: `driveways`, `sealcoat`, `freeest`.
- `{Audience}` — ad set audience descriptor. Example: `res-homeowners`, `comm-lots`.
- `{Placement}` — `auto` for Advantage+ placements, or specific: `fb-feed`, `ig-feed`, `ig-reels`.
- `{Creative}` — short slug for the creative concept. Example: `hero-driveway`, `trailer-shot`, `carousel-finished`.
- `{Format}` — `img`, `carousel`, `video`, `reel`.
- `{Variant}` — `v1`, `v2`, etc.
- `{YYYY-MM}` — the launch month. Example: `2026-05`.

All tokens are lowercase, kebab-case, no spaces.

---

## Campaign name

```
{Client}_{Objective}_{Geo}_{Theme}_{YYYY-MM}
```

Example:

```
a1seal_calls_nj_driveways_2026-05
```

## Ad set name

```
{Audience}_{Geo}_{Placement}_{YYYY-MM}
```

Example:

```
res-homeowners_monmouth-nj_auto_2026-05
```

## Ad name

```
{Creative}_{Format}_{Variant}_{YYYY-MM}
```

Example:

```
hero-driveway_img_v1_2026-05
```

## Creative file names

When saving creative source files in the client folder:

```
{Client}_{Creative}_{Format}_{Variant}.{ext}
```

Example:

```
a1seal_hero-driveway_img_v1.jpg
```

---

## UTM convention

Append the same five UTM parameters to every website destination URL.

| Param | Value | Notes |
|---|---|---|
| `utm_source` | `facebook` or `instagram` | The platform serving the ad. |
| `utm_medium` | `paid-social` | Constant for paid Meta. Use `organic-social` for organic posts. |
| `utm_campaign` | `{Client}_{Objective}_{Geo}_{Theme}_{YYYY-MM}` | Matches the campaign name. |
| `utm_content` | `{Creative}_{Format}_{Variant}` | Matches the ad name minus the date. |
| `utm_term` | `{Audience}` | Matches the ad set audience. |

Example URL:

```
https://example.com/quote?utm_source=facebook&utm_medium=paid-social&utm_campaign=a1seal_calls_nj_driveways_2026-05&utm_content=hero-driveway_img_v1&utm_term=res-homeowners
```

For organic posts, swap `utm_medium` to `organic-social` and drop `utm_term`.

---

## Folder layout per client

```
clients/
  {client-slug}/
    intake.md
    launch-plan.md
    creatives/
      a1seal_hero-driveway_img_v1.jpg
      ...
    reports/
      2026-05-week1.md
      2026-05-week2.md
```

---

## Rules

- Never use spaces or capital letters in names. Reporting tools split on case.
- Never change a campaign/ad set/ad name after launch without recording the rename. Old reports will be orphaned.
- The campaign `YYYY-MM` is the month it launched, not the current month. Don't update it later.
- If you rebuild a campaign for any reason, bump the date suffix to the new month so historical reports stay clean.
