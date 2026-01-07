# MyPortfolio Constitution

<!--
Sync Impact Report - Version 1.0.0
- Version change: INITIAL → 1.0.0
- Principles defined:
  * I. Simplicity & Static-First (NEW)
  * II. Responsive Design (NEW)
  * III. Performance & Optimization (NEW)
  * IV. Docker-First Deployment (NEW)
  * V. Progressive Enhancement (NEW)
- Sections added:
  * Core Principles
  * Development Standards
  * Governance
- Templates updated:
  ✅ plan-template.md - Constitution Check section customized with MyPortfolio principles
  ✅ spec-template.md - Added portfolio context note for static site features
  ✅ tasks-template.md - Updated path conventions for static site structure & added Portfolio Quality Checks
  ✅ checklist-template.md - Not modified (generic checklist remains applicable)
  ✅ agent-file-template.md - Not modified (generic agent template remains applicable)
- No command files exist in .specify/templates/commands/ - none to update
- Documentation files reviewed:
  ✅ README.md - Aligned with principles (Docker deployment, responsive design documented)
  ✅ CONTRIBUTING.md - Aligned with version control standards
  ✅ DEPLOYMENT.md - Aligned with Docker-First principle
- Follow-up items:
  * Photos page implementation in progress - ensure adherence to principles I-III when completed
  * Future features should validate against Constitution Check in plan-template.md
  * Consider adding USAGE.md guidance referencing constitution principles
-->

## Core Principles

### I. Simplicity & Static-First

This portfolio MUST remain a static site built with HTML, CSS, and JavaScript. All features start as static implementations before considering dynamic solutions. Dependencies are minimized to essential libraries (Bootstrap, AOS, etc.). No build process complexity unless justified by measurable benefit. The goal is maintainability and straightforward deployment.

**Rationale**: Static sites offer superior performance, security, and ease of deployment. Complexity in a portfolio site reduces maintainability without significant user benefit. Every dependency added increases surface area for breakage.

### II. Responsive Design

Every page and component MUST be responsive across desktop, tablet, and mobile devices. Mobile-first approach is mandatory. Bootstrap grid system and utilities MUST be used consistently. Custom CSS breakpoints require justification. Test on multiple viewport sizes before marking complete.

**Rationale**: Portfolio visitors access from diverse devices. Poor mobile experience directly impacts professional impression. Bootstrap provides battle-tested responsive patterns that ensure consistency.

### III. Performance & Optimization

Page load times MUST be under 3 seconds on 3G connections. Images MUST be optimized (use `optimize_images.py` script). Lazy loading MUST be implemented for below-the-fold images. Minimize render-blocking resources. Lighthouse performance score target: >90.

**Rationale**: Performance directly impacts user engagement and SEO. Visitors judge professionalism within seconds. Slow sites create negative first impressions that override content quality.

### IV. Docker-First Deployment

All deployment configurations MUST be containerized. The Docker image MUST be production-ready and include Nginx configuration. Environment-specific settings use environment variables, not hardcoded values. Deployment instructions MUST be documented in DEPLOYMENT.md. Changes affecting deployment require testing in Docker environment before merge.

**Rationale**: Docker ensures consistent deployment across development and production. Synology NAS deployment requires containerization. Version drift between environments causes production issues that are difficult to diagnose.

### V. Progressive Enhancement

Core content and navigation MUST function without JavaScript. Enhanced features (animations, forms, interactive elements) layer on top. Graceful degradation is mandatory. Accessibility (WCAG 2.1 AA) is non-negotiable. Semantic HTML required.

**Rationale**: Search engines and assistive technologies must access all content. JavaScript failures should not break the site. Accessibility is both ethical imperative and professional requirement.

## Development Standards

### Code Quality
- HTML MUST validate against HTML5 standard
- CSS organized by component/section, not scattered
- JavaScript follows modern ES6+ patterns
- Comments required for non-obvious logic
- Consistent indentation (2 spaces)

### Version Control
- Meaningful commit messages following conventional commits format
- Feature branches follow naming: `feature/descriptive-name`
- No commits directly to `main` without review for significant changes
- Atomic commits (one logical change per commit)

### Testing Checklist
- [ ] Desktop Chrome, Firefox, Safari
- [ ] Mobile iOS Safari, Android Chrome
- [ ] Tablet landscape and portrait
- [ ] Lighthouse audit passing (Performance >90, Accessibility >95)
- [ ] Forms tested with valid/invalid inputs
- [ ] Links verified (no broken links)

### Documentation Requirements
- README.md updated for new features
- DEPLOYMENT.md updated for deployment changes
- Inline comments for complex CSS/JavaScript
- Image assets documented in relevant sections

## Governance

This constitution is the authoritative reference for all development decisions. When in doubt, consult these principles. Violations must be explicitly justified in PR descriptions with business or technical rationale.

**Amendment Process**: Amendments require:
1. Document proposed change with rationale
2. Review impact on existing codebase
3. Update affected documentation
4. Version bump according to semantic versioning (below)

**Versioning Policy**: Constitution follows semantic versioning (MAJOR.MINOR.PATCH):
- **MAJOR**: Principle removal or fundamental redefinition (breaking change)
- **MINOR**: New principle added or existing principle materially expanded
- **PATCH**: Clarifications, wording improvements, non-semantic refinements

**Compliance Review**: All feature specifications in `.specify/specs/` MUST reference applicable principles. Implementation plans MUST include "Constitution Check" section validating alignment. Pull requests introducing complexity not covered by principles MUST justify or amend constitution first.

**Runtime Guidance**: For AI-assisted development, agents should reference this constitution before proposing implementations. Templates in `.specify/templates/` are structured to enforce constitutional compliance through gates and checklists.

**Version**: 1.0.0 | **Ratified**: 2026-01-07 | **Last Amended**: 2026-01-07
