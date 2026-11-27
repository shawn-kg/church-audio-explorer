# Church Audio Explorer

An interactive map of our stage that follows every signal from the mic to the mixer. Click any piece of gear to see what it does, what happens to the signal there, how we use it, and what commonly goes wrong.

Live site: https://shawn-kg.github.io/church-audio-explorer/

## Run it

It is a plain static site with no build step. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Edit the content

All the words live in `js/data.js`:

- `STOPS`: every piece of gear on the map, with its position, channel numbers and the four panel sections (`what`, `flow`, `ours`, `wrong`). Facts we still need to check are listed under `confirm`.
- `WIRES`: the cables and links between stops, in the direction the signal flows, with their signal type.
- `TOURS`: the guided "Follow a signal" paths.
- `CONSOLE`: the stations inside the FOH X32.

Changes go through a pull request into `main`; see [CONTRIBUTING.md](CONTRIBUTING.md). Small text fixes can be made on GitHub: open `js/data.js`, click the pencil icon, and choose "Create a new branch" when you commit.

## Check it

```bash
npm test
```

This checks that every cable and tour points at a real stop and every stop is on the drawing. The same check runs automatically on every pull request.

## Publish

GitHub Pages serves the `main` branch as it is: there is no build step. Merging a pull request republishes the site within a couple of minutes.

## Layout

```
index.html                 page skeleton
css/style.css              colors, type and layout
js/data.js                 all content: stops, cables, tours, console view
js/app.js                  drawing and interaction
scripts/validate-data.js   data checks run by npm test and CI
.github/                   CI workflow and pull request template
```
