# Contributing to Snake Feast

Thank you for your interest in contributing to Snake Feast! This document provides guidelines and information for contributors.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)
- [Feature Requests](#feature-requests)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:
- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Keep discussions professional and friendly

## How to Contribute

### Reporting Bugs
- Use the [GitHub Issues](https://github.com/raghul-tech/Snake-Feast/issues) page
- Provide clear steps to reproduce
- Include your OS, browser, and device information
- Add screenshots if applicable

### Suggesting Features
- Open an issue with the "enhancement" label
- Describe the feature and why it would be useful
- Consider how it fits with the current game design

### Contributing Code
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Development Setup

### Prerequisites
- Git
- Python 3.7+ (for desktop app)
- Modern web browser (for web version)
- Text editor/IDE

### Web Version
```bash
# Clone the repository
git clone https://github.com/raghul-tech/Snake-Feast.git
cd Snake-Feast

# Serve the web version
cd web
python -m http.server 8000
# Open http://localhost:8000 in your browser
```

### Desktop Version
```bash
# Install dependencies
pip install PyQt5 PyQtWebEngine

# Run the desktop app
cd desktop
python main.py
```

### Extension Version
1. Open Chrome/Edge and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `extension/` folder

## Project Structure

```
Snake-Feast/
├── web/                 # Web/PWA version
│   ├── index.html      # Main HTML file
│   ├── manifest.json   # PWA manifest
│   ├── sw.js          # Service worker
│   ├── style.css      # Styles
│   └── js/            # JavaScript files
├── desktop/            # Desktop app (Python + PyQt)
│   └── main.py        # Main desktop application
├── extension/          # Browser extension
│   ├── manifest.json   # Extension manifest
│   ├── index.html      # Extension popup
│   └── assets/         # Extension assets
├── assets/             # Shared assets
├── desktop/            # Desktop-specific files
└── README.md
```

## Submitting Changes

### Pull Request Process
1. Update the README.md with details of your changes if applicable
2. Ensure your code follows the existing style
3. Add tests if applicable
4. Update documentation
5. Ensure all tests pass

### Code Style
- Use consistent indentation (2 spaces for HTML/CSS, 4 for JavaScript/Python)
- Write clear, descriptive comments
- Keep functions small and focused
- Use meaningful variable names

### Testing
- Test web version in multiple browsers (Chrome, Firefox, Edge)
- Test desktop app on Windows/Linux if possible
- Test extension in Chrome/Edge
- Verify responsive design on mobile devices

## Reporting Issues

When reporting bugs, please include:
- **Description**: What happened and what you expected
- **Steps to reproduce**: Detailed steps to trigger the issue
- **Environment**: OS, browser version, device type
- **Screenshots**: If the issue is visual
- **Console errors**: Any browser console errors

### Common Issues
- **Game not loading**: Check browser console for errors
- **Score not saving**: Verify localStorage is enabled
- **Extension not working**: Check manifest permissions and CSP

## Feature Requests

We welcome feature suggestions! Consider:
- Does it enhance the core gameplay?
- Is it technically feasible?
- Will it work across all platforms (web, desktop, extension)?
- Does it maintain the game's simplicity?

### Popular Feature Ideas
- Multiplayer support
- New game modes
- Additional themes/skins
- Sound effects
- Leaderboards
- Achievements

## Getting Help

- **Documentation**: Check the README.md and inline code comments
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Community**: Join our Discord server (link in README)

## Release Process

Maintainers will:
1. Review and merge pull requests
2. Update version numbers
3. Create releases on GitHub
4. Update stores (Microsoft Store, Chrome Web Store, etc.)
5. Update documentation

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## Thank You!

Contributions of any kind are appreciated, whether it's:
- Reporting bugs
- Suggesting features
- Writing code
- Improving documentation
- Sharing the project
- Providing feedback

---

## Quick Start for Contributors

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/Snake-Feast.git
cd Snake-Feast

# 2. Add upstream remote
git remote add upstream https://github.com/raghul-tech/Snake-Feast.git

# 3. Create feature branch
git checkout -b feature/your-feature-name

# 4. Make changes and test
# Test web version, desktop app, and extension

# 5. Commit and push
git commit -m "Add: Your feature description"
git push origin feature/your-feature-name

# 6. Create pull request
# Visit GitHub and create PR from your branch
```

Happy coding! 🐍🎮
