# Yee Wei Liang — Portfolio

A responsive personal portfolio website for Yee Wei Liang, Staff Analyst Data Scientist with expertise in machine learning and computer vision.

## Features

- **Responsive Design** — Optimized for desktop, tablet, and mobile
- **Content-Driven** — All bio, skills, and resume data lives in `content.json`; no HTML edits needed
- **Photography Gallery** — Dynamic gallery powered by Cloudinary CDN with EXIF metadata
- **Docker Deployment** — Containerized with Nginx, ready for self-hosting

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Framework | Bootstrap 5.3.3 |
| Photo CDN | Cloudinary (free tier) |
| Web Server | Nginx (Docker) |
| Template | [MyResume by BootstrapMade](https://bootstrapmade.com/) |

## Project Structure

```
├── src/                        # Website source
│   ├── index.html             # Single-page app entry point
│   └── assets/
│       ├── content.json       # Editable: bio, skills, resume, contact
│       ├── photos.json        # Generated: photo gallery metadata
│       ├── css/main.css       # Custom styles
│       ├── js/main.js         # Dynamic content loader
│       ├── img/               # Static images
│       └── vendor/            # Bootstrap, AOS, GLightBox, Isotope, typed.js
├── nas-scripts/               # NAS auto-deploy & photo-sync cron scripts
├── upload_photos.js           # Cloudinary uploader with EXIF extraction
├── package.json               # Node.js scripts
├── Dockerfile                 # Nginx container definition
├── nginx.conf                 # Nginx config with security headers & caching
└── docker-compose.yml         # Container orchestration
```

## Local Development

```bash
# Clone
git clone https://github.com/yeewliang/MyPortfolio.git
cd MyPortfolio

# Serve (Python)
cd src && python -m http.server 8000

# Serve (Node.js)
npx http-server src -p 8000
```

Then open `http://localhost:8000`.

## Docker

```bash
# Build and run
docker compose up -d
```

Visit `http://localhost:8081`.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for Docker/NAS deployment details and [USAGE.md](USAGE.md) for the photo gallery workflow.

## Customization

Edit `src/assets/content.json` to update bio, skills, resume, and social links — the page reloads the data dynamically.

Replace images in `src/assets/img/`:
- `hero-bg.jpg` / `bg.jpg` — background images
- `profile-img.jpg` — profile photo
- `favicon.png` / `apple-touch-icon.png` — browser icons

## License

Based on the [MyResume Bootstrap template](https://bootstrapmade.com/free-html-bootstrap-template-my-resume/) by BootstrapMade. See [LICENSE](LICENSE) for details.

## Contact

**Yee Wei Liang**
- Email: weiliang.yee [at] gmail.com
- Telegram: [@wl_yee](https://t.me/wl_yee)
- Location: Singapore
