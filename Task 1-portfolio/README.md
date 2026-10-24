# Ankit Vishwakarma | Portfolio

A responsive developer portfolio built with plain HTML, CSS and JavaScript. No frameworks, no build step.

## Features

- Mobile-first layout using Flexbox and CSS Grid
- Dark / light theme toggle (remembers the visitor's choice)
- Smooth-scrolling navigation with active section highlight
- Hamburger menu on mobile
- Project detail popups using the native `<dialog>` element
- Downloadable resume
- Accessible: keyboard focus styles, ARIA labels, reduced-motion support

## Project structure

```
ankit-portfolio/
├── index.html    # Page structure and content
├── style.css     # Styling, themes and responsive layout
├── script.js     # Menu, theme toggle, project popups, nav highlight
├── resume.pdf    # Resume used by the "Download resume" button
└── README.md
```

## Run locally

Open `index.html` in any browser. Or, for a local server:

```bash
# Python
python -m http.server 8000

# or Node
npx serve .
```

Then visit http://localhost:8000

## Customize

| What to change | Where |
| --- | --- |
| Name, summary, skills, education, contact | `index.html` |
| Projects (title, description, bullets, tags) | `projects` array at the top of `script.js` |
| Colors | CSS variables in `:root` and `:root[data-theme="dark"]` in `style.css` |
| Fonts | Google Fonts link in `index.html` and `--head` / `--body` in `style.css` |
| Resume | Replace `resume.pdf` (keep the same file name) |

### Add a GitHub or LinkedIn link

In `index.html`, inside `<div class="links">`, add:

```html
<a href="https://github.com/your-username" target="_blank" rel="noopener"><small>GitHub</small>github.com/your-username</a>
```

## Deploy

### GitHub Pages

1. Create a new repository and push all files to the `main` branch.
2. Go to **Settings → Pages**.
3. Under **Source**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. Your site will be live at `https://<username>.github.io/<repo-name>/`.

### Netlify

- Drag and drop the project folder into [Netlify Drop](https://app.netlify.com/drop), or
- Import the GitHub repo, leave the build command empty and set the publish directory to `.`

### Vercel

Import the GitHub repo, set the framework preset to **Other**, leave the build command empty and deploy.

## Tech stack

HTML5 · CSS3 · JavaScript (ES6+)

## Contact

- Email: ankithvi909@gmail.com
- Location: Thane, Maharashtra, India
