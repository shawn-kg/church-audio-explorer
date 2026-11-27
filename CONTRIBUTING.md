# Contributing

Thanks for helping keep the audio guide accurate. Every change goes through a pull request so someone else on the team can check it before it reaches the live site.

## The workflow

1. Create a branch from `main` (on GitHub, editing a file and choosing "Create a new branch" does this for you).
2. Make your change and commit it to that branch.
3. Open a pull request into `main` and fill in the checklist.
4. The **Check** run validates the stage data automatically. Fix anything it reports.
5. Another team member reviews and merges. GitHub Pages republishes the site within a couple of minutes.

## Where things live

| File | What it holds |
| --- | --- |
| `js/data.js` | All the content: stops, cables, tours and the console view. Most changes happen here. |
| `js/app.js` | How the map is drawn and how clicking, tours and the phone layout work. |
| `css/style.css` | Colors, type and layout. |
| `index.html` | The page skeleton. |
| `scripts/validate-data.js` | The check that runs on every pull request. |

## Common edits

- **Fix or add a fact:** edit the `what`, `flow`, `ours` or `wrong` text on a stop in `js/data.js`. When a "Still to confirm" item is answered, remove it from that stop's `confirm` list.
- **Move a piece of gear:** change its `x` and `y` in `STOPS`. The drawing is 1140 units wide, seen from the congregation, with the back of the stage at the top. If a cable now bends in the wrong place, adjust its bend points in `WIRES`.
- **Add a cable:** add `['fromId', 'toId', 'signalType']` to `WIRES`, in the direction the signal flows. Signal types are listed in `SIGNALS`.
- **Change where an input goes:** each input branches at the FOH X32 to the destinations in `DESTINATIONS` (main PA, stream, monitors). Most inputs use `SENDS.default`. To give one input a different set, add it to `SENDS`, for example `click: ['monitor']`.
- **Add a tour:** add an entry to `TOURS`. Each pair of neighbouring stops must be joined by a cable, or the check will fail.

## Check locally (optional)

With Node 18 or newer installed:

```bash
npm test
```

To preview the site:

```bash
npm start
```

Then open http://localhost:8000.
