# Clock — GitHub Pages static clock

A simple, static, GitHub Pages-friendly clock that reads the local PC time and shows it in the browser. It supports:

- WebFont for numeric display (from Google Fonts)
- Dark mode / Light mode toggle via keyboard (`d` key)
- Show/hide seconds via keyboard (`s` key)
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
- `f` — toggle fullscreen if the browser allows the Fullscreen API

Touch Controls
--------------
- Tap or move the pointer to reveal the control bar.
- Use the on-screen buttons to toggle theme, seconds, outline, and fullscreen on tablets.
- Fullscreen depends on browser support and user gesture permissions.

Customization
-------------
- Replace another font in `index.html` if you prefer
- Modify `styles.css` for color changes or different layout arrangements

License
-------
This repository is public domain, or use any license you prefer.
