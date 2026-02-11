# Yee Wei Liang's Portfolio

A modern, responsive portfolio website showcasing the professional experience and projects of Yee Wei Liang, a Staff Analyst Data Scientist with expertise in machine learning and computer vision.

## 🌟 Features

- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI**: Clean and professional design using Bootstrap 5
- **Interactive Sections**: Smooth scrolling navigation and animated elements
- **Photography Gallery**: Dynamic photo gallery powered by Cloudinary CDN with EXIF metadata display
- **Portfolio Showcase**: Dedicated sections for projects and achievements
- **Contact Form**: Integrated contact form for easy communication
- **Docker Support**: Containerized deployment with Nginx

## 🚀 Live Demo

The portfolio is deployed and accessible via Docker on Synology NAS. See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment instructions.

## 📋 Sections

- **Hero**: Professional introduction and profile
- **About**: Personal background and qualifications
- **Resume**: Education and professional experience
- **Skills**: Technical competencies and expertise levels
- **Contact**: Contact information and form

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Framework**: Bootstrap 5.3.3
- **Icons**: Bootstrap Icons
- **Animations**: AOS (Animate On Scroll)
- **Photo CDN**: Cloudinary (free tier)
- **Build**: Docker with Nginx
- **Template**: MyResume Bootstrap Template by BootstrapMade

## 📁 Project Structure

```
/
├── src/                    # Portfolio source files
│   ├── index.html         # Main homepage
│   ├── portfolio-details.html  # Portfolio details page
│   ├── starter-page.html  # Template starter page
│   ├── service-details.html    # Service details page
│   ├── assets/            # CSS, JS, images, and vendor files
│   │   ├── css/          # Stylesheets
│   │   ├── js/           # JavaScript files
│   │   ├── img/          # Images and icons
│   │   ├── photos.json   # Photo gallery data (generated)
│   │   └── vendor/       # Third-party libraries
│   └── forms/            # Contact form scripts
├── gallery/              # Local photos by category (not committed)
├── upload_photos.py      # Cloudinary upload & metadata script
├── package.json          # Node.js dependencies & scripts
├── Dockerfile            # Docker configuration
├── nginx.conf           # Nginx web server configuration
├── docker-compose.yml   # Docker Compose setup
├── .dockerignore        # Files to ignore during Docker build
└── DEPLOYMENT.md        # Deployment instructions
```

## 🔧 Local Development

### Prerequisites

- Web browser (Chrome, Firefox, Safari, etc.)
- Optional: Docker for containerized deployment

### Running Locally

1. **Direct File Access**:
   ```bash
   # Clone the repository
   git clone https://github.com/yeewliang/MyPortfolio.git
   cd MyPortfolio
   
   # Open in browser
   open src/index.html
   ```

2. **Using a Local Server** (Recommended):
   ```bash
   # Using Python
   cd src
   python -m http.server 8000
   
   # Using Node.js
   npx http-server src -p 8000
   
   # Access at http://localhost:8000
   ```

### Docker Development

1. **Build and run with Docker**:
   ```bash
   docker build -t my-portfolio .
   docker run -d -p 8080:80 --name my-portfolio my-portfolio
   ```

2. **Using Docker Compose**:
   ```bash
   docker-compose up -d
   ```

Visit `http://localhost:8080` to view the portfolio.

## 🚀 Deployment

The portfolio supports multiple deployment options:

### Docker Deployment (Recommended)
See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions on deploying to Synology NAS or other Docker environments.

### Static Hosting
Upload the contents of the `src/` directory to any static hosting service like:
- GitHub Pages
- Netlify
- Vercel
- AWS S3
- Traditional web hosting

## 🎨 Customization

### Personal Information
Update personal details in `src/index.html`:
- Name and title in the hero section
- About section content
- Resume/experience details
- Contact information

### Styling
- Main styles: `src/assets/css/main.css`
- Colors and themes can be customized in the CSS variables
- Bootstrap components can be overridden as needed

### Images
Replace images in `src/assets/img/` with your own:
- `bg.jpg` - Hero background image
- `favicon.png` - Browser favicon
- `apple-touch-icon.png` - Apple touch icon
- Portfolio images in the respective folders

## 📄 License

This project is based on the MyResume Bootstrap template by BootstrapMade.

**Template License**: https://bootstrapmade.com/license/

For commercial use of the template, please purchase a license from BootstrapMade.

## 🤝 Contributing

While this is a personal portfolio, suggestions and improvements are welcome:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit your changes (`git commit -am 'Add some improvement'`)
4. Push to the branch (`git push origin feature/improvement`)
5. Open a Pull Request

## 📞 Contact

**Yee Wei Liang**
- Email: weiliang.yee [at] gmail.com
- Telegram: [@wl_yee](https://t.me/wl_yee)
- Location: Singapore

## 🙏 Acknowledgments

- [BootstrapMade](https://bootstrapmade.com/) for the excellent MyResume template
- [Bootstrap](https://getbootstrap.com/) for the responsive framework
- [AOS](https://michalsnik.github.io/aos/) for scroll animations
- [Bootstrap Icons](https://icons.getbootstrap.com/) for the icon set