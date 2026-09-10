# Raaina Nagpal — Portfolio Website

A 4-page personal portfolio built as plain HTML, CSS and JavaScript — no build
step, no framework, no dependencies beyond two Google Fonts. Open
`index.html` in a browser, or host the whole folder anywhere (GitHub Pages,
Netlify, Vercel, etc.) and it works as-is.

## Pages

| File               | Page              |
|---------------------|-------------------|
| `index.html`         | Home / About      |
| `projects.html`       | Projects          |
| `experience.html`     | Experience        |
| `resume.html`         | Resume            |

Navigation, the mobile menu, footer and the "Now Playing" audio player are
shared across all four pages (see `js/main.js` and `css/style.css`).

## Running it

No install, no build. Just open `index.html` directly, or for the most
accurate preview (some browsers restrict local file access for audio/PDF
embeds), serve the folder locally:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

To publish it, upload the whole `portfolio` folder to GitHub Pages, Netlify,
Vercel, or any static host — there is nothing to build or compile.

## What to replace before you share it

Everything below is a placeholder. Filenames matter — replace the file
**with the same name** and every page updates automatically.

| What                          | File to replace                                         | Notes |
|-------------------------------|----------------------------------------------------------|-------|
| Your profile photo            | `assets/images/profile/profile-photo.jpg`                 | Portrait orientation (3:4) works best — the frame crops to that ratio. |
| Your AI song                  | `assets/audio/theme-song.mp3`                              | Any MP3 works; update the song title text in `js/main.js`'s HTML is actually in `build_site.py` / the `<span data-audio-title>` in each page's HTML — see below. |
| Unwind (after 9) product photos | `assets/images/projects/unwind-1.jpg` … `unwind-4.jpg`  | Square (1:1) images work best. Add more by copying the `<figure>` block in `projects.html`. |
| Make.com workflow screenshot  | `assets/images/projects/makecom-workflow.jpg`              | Landscape screenshot of your actual scenario. |
| AI Speaker Bot screenshot/demo| `assets/images/projects/ai-speaker-bot.jpg`                | Also update the "Demo video" / "External link" placeholders directly in `projects.html`. |
| Resume PDF                    | `assets/resume/Raaina_Nagpal_Resume.pdf`                   | Keep the exact filename and both the preview and the View/Download buttons on `resume.html` keep working. |
| Project metrics (Unwind)      | `projects.html` — search for `[REVENUE]`, `[ORDERS]`, `[PRODUCTS]`, `[DURATION]` | Replace with real numbers once you have them. |
| LinkedIn / Instagram links    | Every page's footer — search for `href="#"` next to LinkedIn/Instagram | There are two spots: the footer (shared) and nothing else — the footer markup is generated once per page by `build_site.py`, but you can just find-and-replace across the 4 HTML files. |
| Email address                 | Search for `hello@raainanagpal.com` across all files       | Appears in the header "Let's connect" button and the footer. |
| Song title text                | Search for `Midnight Bloom` across all 4 HTML files        | Shown in the audio player. |

### A note on how this site is built

The 4 HTML files were generated from one Python script (`build_site.py`) so
the header, footer, nav and audio player stay identical across pages. You
don't need Python to edit the site day-to-day — editing the HTML files
directly works fine. But if you'd rather change shared content (like the
footer or nav) in one place and regenerate all 4 pages consistently, edit
`build_site.py` and run:

```
python3 build_site.py
```

This is optional — plain HTML editing is completely fine too.

## Design system

All colours, fonts and spacing are defined as CSS variables at the top of
`css/style.css` (`:root { ... }`). Change a value there and it updates
everywhere. The palette and type scale come from the original Stitch design
system (Playfair Display for headlines, Plus Jakarta Sans for body text,
soft blush/rose/cream tones).

## Notes on placeholders

- The audio file currently shipped is **silent** (10 seconds of silence) so
  the player works without erroring — swap it for your real track.
- All project/profile images are labelled placeholder graphics generated for
  this handoff — replace them before sharing the site.
- The resume PDF is a one-page placeholder that says to replace it — swap it
  for your real resume, same filename.

## Browser support

Built and tested in a modern Chromium browser (nav, mobile menu, audio
player, and inline PDF preview all confirmed working). Works in all current
major browsers. Safari may open the resume PDF preview in a slightly
different way but the View/Download buttons always work regardless.
