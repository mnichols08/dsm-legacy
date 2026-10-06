# Diamond Star Motors: Automotive Legend

A static, responsive website about Diamond Star Motors (DSM), the Chrysler–Mitsubishi partnership, and the cars and engineering that shaped its legacy. It covers the DSM triplets (Mitsubishi Eclipse, Eagle Talon, and Plymouth Laser), the 4G63 engine, the Normal, Illinois factory, and the enthusiast community.

## Explore the site

The single-page site includes:

- The partnership and its history timeline
- Mitsubishi performance cars that preceded and accompanied DSM
- The Eclipse, Talon, and Laser, with technical specifications
- The Normal factory and DSM’s manufacturing legacy
- 4G63 engine heritage and milestones
- An enthusiast community section and an image gallery with a lightbox

The site also includes responsive layouts and a light/dark theme toggle that remembers the selected theme.

## Run locally

This project has no build step or package installation. Serve the repository root with any local static web server, then open the address it provides. For example, with the **Live Server** extension in Visual Studio Code, open `index.html` and choose **Open with Live Server**.

Serving the files over HTTP is recommended because the page loads its content from `data/site-content.json`.

## Project structure

```text
.
├── index.html              # Single-page site and section markup
├── css/                    # Site styles
├── data/
│   └── site-content.json   # Content used to populate page sections
├── images/                 # Site photography and logos
└── js/
    ├── content-loader.js   # Loads JSON content into the page
    ├── theme-toggle.js     # Theme selection and persistence
    └── components/         # Reusable custom elements
```

## Update the content

Edit `data/site-content.json` to change the hero, partnership copy, precursor vehicle cards, timeline, and engine heritage content. Keep the JSON valid and use image paths relative to the repository root. The page markup, styles, and component behavior live in `index.html`, `css/`, and `js/`, respectively.

## Dependencies

The project uses browser-native HTML, CSS, and JavaScript and has no build tool or package manager configuration. Font Awesome and Google Fonts are loaded from external CDNs.
