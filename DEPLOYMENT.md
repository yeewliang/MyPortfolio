# Portfolio Deployment on Synology

This portfolio is containerized and ready for deployment on Synology NAS using Docker.

## Structure
```
/
├── src/                    # Portfolio source files
│   ├── index.html         # Main homepage
│   ├── assets/            # CSS, JS, images
│   ├── forms/             # Contact forms
│   └── ...                # Other HTML pages
├── Dockerfile             # Docker configuration
├── nginx.conf             # Nginx web server configuration
├── docker-compose.yml     # Docker Compose setup
└── .dockerignore          # Files to ignore during build
```

## Deployment Instructions

### Option 1: Using Docker Compose (Recommended)
1. Upload all files to your Synology NAS
2. Open Docker app on Synology DSM
3. Go to "Project" tab
4. Click "Create" and select the folder containing your files
5. The portfolio will be accessible on port 80

### Option 2: Using Docker directly
1. Build the image:
   ```bash
   docker build -t my-portfolio .
   ```

2. Run the container:
   ```bash
   docker run -d -p 80:80 --name my-portfolio my-portfolio
   ```

## Configuration

### Port Configuration
- Default port: 80
- To change port, modify the `ports` section in docker-compose.yml
- Example for port 8080: `"8080:80"`

### SSL/HTTPS
- For HTTPS, use Synology's reverse proxy feature
- Configure reverse proxy to forward HTTPS traffic to your container

### Logs
- Nginx logs are mounted to `./logs` directory
- Access logs: `./logs/access.log`
- Error logs: `./logs/error.log`

## Features
- Nginx web server with optimized configuration
- Gzip compression enabled
- Static asset caching (1 year)
- Security headers included
- Error page handling
- Mobile-responsive design support

## Troubleshooting
- If port 80 is already in use, change the port in docker-compose.yml
- Check Synology firewall settings if the site is not accessible
- View logs using: `docker logs my-portfolio`