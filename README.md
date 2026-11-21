# 🧱 Git & CI/CD Lab for QA

An interactive website that teaches complete beginners how Git, GitHub and GitHub Actions work in a real software team. No setup, no install, no command-line experience needed.

I built this because most Git tutorials are written for developers. As a QA engineer you need a slightly different view: reviewing pull requests, catching bugs before they merge, and reading CI failures. So the lessons and games are built around that.

## How learning works

1. **Learn:** 8 short lesson cards (repo, clone, branch, stage & commit, push, pull request, merge, CI/CD). Each has a plain-English explanation, an everyday analogy, the real command and an animated visual.
2. **Branch Lab:** a live commit graph. Create branches, commit, switch and merge, and watch lanes split and join.
3. **CI/CD:** an animated pipeline (Trigger → Runner → Tests → Logs → Artifact) with a pass/fail toggle, plus ready-to-copy sample files for GitHub Actions and Playwright.
4. **Practice:** three "Lego puzzle" games, unlocked after all lessons are visited. Drag or click command blocks into the right order. Wrong order gives a friendly explanation instead of just "incorrect".

The practice modules:

| Module | Scenario | Extra challenge |
|---|---|---|
| 1. Git basics | Clone, branch, add, commit, push a login test | Branch graph animates as blocks snap in |
| 2. Pull requests | Fetch and switch to Sam's PR #42 | Click the buggy line (`disabled={false}`) in the diff to block the merge |
| 3. CI/CD robot | Trigger a failed nightly run, read logs | Open the failure screenshot artifact |

Finishing all three shows a "QA Git Certified" banner.

## Tech stack

Deliberately simple:

- **HTML5**: one page shell (`index.html`)
- **CSS3**: one hand-written stylesheet (`style.css`) with keyframe animations for snapping blocks, flying packages and the bouncing robot
- **Vanilla JavaScript (ES6)**: all logic in `app.js`
- **SVG**: the commit graph is drawn as inline SVG
- **HTML5 Drag and Drop API**: for the Lego blocks, with click-to-place as a fallback so it works on touch devices

No frameworks, no build step, no npm packages, no external requests. Just open the file.

## Project structure

```
├── index.html   # page shell: loads the CSS and JS
├── style.css    # reset, Lego blocks, animations, utility classes
├── app.js       # data, state, rendering and events
└── README.md
```

## How it works under the hood

- **State:** one plain object (`S`) holds the current tab, lesson, practice progress, terminal output and the branch-lab data.
- **Rendering:** a `render()` function rebuilds the page from template strings whenever the state changes. This keeps the code easy to follow, and it also replays the CSS animations on every update.
- **Events:** one click listener on the app container reads `data-a` (action) and `data-k` (value) attributes, instead of attaching a handler to every button.
- **Commit graph:** commits are objects with an `id`, a `branch` and a list of `parents`. Branches are just labels pointing at a commit, the same way Git does it. A merge commit has two parents, drawn as a dashed line. The graph function turns this model into SVG, and `reach()` walks the parents to detect "already up to date".
- **Pipeline:** one `pipe(step, failed)` function draws the CI/CD stages. It is reused in the CI/CD tab, in lesson 8 and in practice module 3.
- **Puzzles:** each step stores its block label, plain-English description, hint, "too early" explanation and the fake terminal output. Dropping a block only snaps if it is the next expected step.

## Run it locally

Open `index.html` in any modern browser. Or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy

Because it's static, it works on any static host:

- **GitHub Pages:** push the files, then Settings → Pages → deploy from `main`
- **Netlify / Cloudflare Pages:** drag and drop the folder

## Customising

- **Add a lesson:** add an object to the `L` array in `app.js` (emoji, title, explanation, analogy, command) and a matching case in `lviz()` for its animation.
- **Add a puzzle:** add an entry to `M` with its steps, and a block order in `PERM`.
- **Change the sample CI files:** edit the `FILES` array.
- **New styles:** `style.css` has hand-written rules for the utility-style classes used in the markup. If you add a new one, add its rule there.

## Known limitations

- The Copy button for the sample files needs the browser clipboard API, which some embedded or non-HTTPS contexts block.
- The terminal output is simulated. No real Git commands run.
- Progress is kept in memory only, so refreshing the page resets it.

## Ideas for next

- Save progress with `localStorage`
- Merge conflict lesson and game
- Rebase vs merge visualiser
- Quiz at the end of each lesson

## License

MIT. Use it, fork it and teach with it.
