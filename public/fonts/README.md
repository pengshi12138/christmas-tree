# Local fonts bundle

This folder is intended to hold Google Fonts `.woff2` files and a generated `fonts.css` that maps the `@font-face` rules to the local files.

How to generate:

1. Open PowerShell in the project root.
2. Run `.	ools\download-fonts.ps1` (or `.
equests\download-fonts.ps1` depending on location).
3. The script fetches the Google Fonts CSS, downloads the referenced `.woff2` files into this folder, and writes `fonts.css`.

After generation:

- Update `index.html` to replace the Google Fonts `<link>` with `<link href="/fonts/fonts.css" rel="stylesheet">`.
- Commit the files if you choose to include them in the repo (large binary files).

Note: the Chinese font families include many unicode-range shards and can produce dozens of `.woff2` files. Consider using external storage if repo size is a concern.
