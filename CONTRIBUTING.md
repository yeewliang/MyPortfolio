# Contributing to Yee Wei Liang's Portfolio

Thank you for your interest in contributing to this portfolio project! While this is primarily a personal portfolio website, suggestions and improvements are welcome.

## 🤝 How to Contribute

### Reporting Issues

If you find any bugs or have suggestions for improvements:

1. Check if the issue already exists in the [Issues](https://github.com/yeewliang/MyPortfolio/issues) section
2. If not, create a new issue with:
   - Clear description of the problem or suggestion
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Screenshots if applicable
   - Browser/device information

### Suggesting Enhancements

For feature requests or enhancements:

1. Open an issue with the `enhancement` label
2. Provide a clear description of the proposed feature
3. Explain why this enhancement would be valuable
4. Include mockups or examples if possible

### Code Contributions

If you'd like to contribute code:

#### Prerequisites

- Basic knowledge of HTML, CSS, and JavaScript
- Familiarity with Bootstrap framework
- Understanding of responsive web design principles

#### Development Process

1. **Fork the Repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/your-username/MyPortfolio.git
   cd MyPortfolio
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

3. **Make Your Changes**
   - Follow the existing code style and structure
   - Test your changes across different browsers and devices
   - Ensure responsive design is maintained
   - Update documentation if necessary

4. **Test Your Changes**
   ```bash
   # Test locally by opening src/index.html in a browser
   # Or use a local server
   cd src
   python -m http.server 8000
   ```

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "Type: Brief description of changes"
   
   # Examples:
   # git commit -m "Fix: Responsive layout issue on mobile devices"
   # git commit -m "Feature: Add new portfolio section"
   # git commit -m "Update: Improve contact form styling"
   ```

6. **Push and Create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a Pull Request on GitHub with:
   - Clear title and description
   - Reference any related issues
   - Screenshots of changes (if applicable)

## 📝 Code Style Guidelines

### HTML
- Use semantic HTML5 elements
- Maintain proper indentation (2 spaces)
- Include appropriate `alt` attributes for images
- Ensure accessibility standards are met

### CSS
- Follow existing naming conventions
- Use Bootstrap classes when possible
- Keep custom CSS organized and commented
- Maintain responsive design principles

### JavaScript
- Use modern ES6+ syntax when appropriate
- Keep code readable and well-commented
- Test functionality across browsers

## 🎨 Design Guidelines

- Maintain the professional, clean aesthetic
- Ensure consistency with existing color scheme
- Preserve responsive behavior across all devices
- Keep animations smooth and purposeful

## 📱 Testing

Before submitting changes, please test on:

- **Browsers**: Chrome, Firefox, Safari, Edge
- **Devices**: Desktop, tablet, mobile
- **Screen Sizes**: Various resolutions and orientations

## 🚀 Deployment Testing

If making significant changes, test with Docker:

```bash
# Build and run locally
docker build -t portfolio-test .
docker run -d -p 8080:80 --name portfolio-test portfolio-test

# Test at http://localhost:8080
```

## 📚 Resources

- [Bootstrap Documentation](https://getbootstrap.com/docs/)
- [Bootstrap Icons](https://icons.getbootstrap.com/)
- [AOS Animation Library](https://michalsnik.github.io/aos/)
- [MyResume Template Documentation](https://bootstrapmade.com/free-html-bootstrap-template-my-resume/)

## ❓ Questions?

If you have questions about contributing:

1. Check existing issues and discussions
2. Open a new issue with the `question` label
3. Contact via the methods listed in the README

## 🙏 Recognition

Contributors will be acknowledged in the README or a dedicated contributors file, depending on the significance of the contribution.

Thank you for helping improve this portfolio!