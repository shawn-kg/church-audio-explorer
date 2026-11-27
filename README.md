# Church Audio Explorer

An interactive map of our stage that follows every signal from the mic to the mixer. Click any piece of gear to see what it does, what happens to the signal there, how we use it, and what commonly goes wrong.

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

Small text fixes can be made directly on GitHub: open `js/data.js`, click the pencil icon, edit, and commit.

## Publish

Turn on GitHub Pages (Settings, Pages, deploy from the `main` branch, root folder). The site will be at `https://<owner>.github.io/church-audio-explorer/`.
