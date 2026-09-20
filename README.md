# Clock — GitHub Pages static clock

A simple, static, GitHub Pages-friendly clock that reads the local PC time and shows it in the browser. It supports:

- WebFont for numeric display (from Google Fonts)
- Dark mode / Light mode toggle via keyboard (`d` key)
- Show/hide seconds via keyboard (`s` key)
- On-screen font size menu for fine tuning the time, date and seconds sizes (`m` key)
- Tablet-friendly touch controls for theme / seconds / outline / fullscreen
- Desktop-friendly layout: date (small, displayed as yyyy/mm/dd), HH:MM (large), seconds (small, toggleable)
	- Desktop-friendly layout: date (small, displayed as yyyy/mm/dd), HH:MM (large), seconds (small, toggleable)
	- The HH:MM colon is centered on the page and does not shift when seconds are shown/hidden
	- The keyboard hint appears when using mouse/keyboard and auto-hides after a few seconds

Quick start
-----------

Open `index.html` in a browser to view the clock. 

Local preview
-------------
To preview locally before pushing: you can use a simple static file server. With Python (works on Windows):

```pwsh
python -m http.server 8000
# then open http://localhost:8000
```

Alternatively, use any static file server such as `http-server` or `serve` from npm.

Keyboard Shortcuts
------------------
- `d` — toggle dark/light theme (press again to cycle back to system default)
- `s` — toggle seconds on/off
- `o` — toggle outline (stroke-only) mode for OLED-friendly always-on behaviour
- `i` — toggle outline fill between transparent and background-colored interior
- `f` — toggle fullscreen if the browser allows the Fullscreen API
- `m` — open/close the font size menu (`Esc` also closes it)
- `-` / `+` — decrease/increase the HH:MM size in 2% steps
- `0` — reset all font sizes to 100%

Touch Controls
--------------
- Tap or move the pointer to reveal the control bar.
- Use the on-screen buttons to toggle theme, seconds, outline, and fullscreen on tablets.
- Use the on-screen buttons to toggle theme, seconds, outline, outline fill, and fullscreen on tablets.
- Fullscreen depends on browser support and user gesture permissions.
- The font size menu is fully operable by touch: tap `Size`, then use the sliders or the `-` / `+` buttons. Its controls use 44px touch targets and the control bar stays on screen while the menu is open.

Font Size Menu
--------------
- Press `m` or tap the `Size` button to open the adjustment menu.
- Each row adjusts one element independently: `Time` (HH:MM), `Date` and `Seconds`.
- Drag the slider for coarse changes, or tap the `-` / `+` buttons for 2% steps.
- Ranges are 40%-160% for the time and 40%-200% for the date and seconds, relative to the default layout size.
- `Reset sizes` restores every element to 100%.
- The menu keeps the control overlay on screen while it is open, and the chosen sizes are stored together with the other preferences.

Stored Data
-----------
- All preferences (theme, seconds, outline, outline fill, font sizes) are kept in `localStorage` under the single key `clock:prefs`.
- No cookies are used and nothing is sent to a server; the data stays in the browser profile on that device and is removed when site data is cleared.
- When storage is unavailable (private mode, blocked site data), reads and writes fail silently and the clock falls back to the default settings.

Customization
-------------
- Replace another font in `index.html` if you prefer
- Modify `styles.css` for color changes or different layout arrangements
- Change the base font sizes with the `--size-time`, `--size-date` and `--size-seconds` variables in `styles.css`; the menu multiplies them by the `--scale-*` variables

License
-------
This repository is public domain, or use any license you prefer.
