# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

General-purpose survey creators (product builders, community leaders, educators, and independent makers) seeking a fast, free, and open alternative to Typeform and Google Forms. Secondary audience: survey respondents participating via direct links across mobile and desktop devices.

## Product Purpose

SurveyNexus enables anyone to create, customize, and analyze interactive, conversational surveys without subscription paywalls or platform lock-in. Success means creators can launch engaging surveys in minutes with custom logic flows and themes, while respondents experience a fast, frictionless completion experience.

## Positioning

All-in-one simplicity that unifies form building, custom visual theming, node-based interactive logic routing, and real-time response analytics into a single cohesive, transparent suite.

## Operating Context

- **Creator Workflow:** Desktop-optimized dashboard environment for authoring questions, structuring conditional question trees via an interactive node canvas (`@xyflow/react`), styling themes, previewing respondent flows, reviewing submission records, and visualizing response trends (`recharts`).
- **Respondent Workflow:** Accessed via direct public shareable link (`/s/:slug`), primarily on mobile smartphones and desktop browsers. Requires immediate page responsiveness, thumb-friendly touch targets, minimal bandwidth consumption, and clear progression indicators.

## Capabilities and Constraints

- **Confirmed Capabilities:**
  - Account authentication and session management (Sign Up, Login, Forgot Password).
  - Drag-and-drop / structured Form Builder with multiple question types.
  - Interactive Logic Flow Page using node-graph canvas (`@xyflow/react`) for conditional branching.
  - Live Theme Customizer supporting color palettes, typography, and card treatments.
  - Test-drive Preview mode and public Respondent portal (`/s/:slug`).
  - Submissions management table and visual Analytics reporting (`recharts`).
  - Survey configuration and settings management.
- **Durable Constraints:**
  - Platform: Full-stack web application (React 19, TypeScript, Vite, Tailwind CSS v4 client; Node.js/Express server).
  - Responsive priority: Respondent surface must remain mobile-first and performant across varied network speeds and screen sizes.

## Brand Commitments

- **Name:** SurveyNexus
- **Tone & Voice:** Clear, capable, approachable, and focused. Avoids unnecessary administrative jargon.

## Evidence on Hand

- Complete working client codebase with routed dashboard and public survey flows (`client/src/`).
- Express/Node API backend scaffold (`server/`).
- Note: External customer testimonials, production usage analytics, and deployment metrics are not yet established (project is in active local development per `README.md`).

## Product Principles

1. **All-in-One Cohesion:** Form authoring, branching logic, design styling, and analytics work together seamlessly without needing third-party add-ons or fragmented tools.
2. **Mobile-First Respondent Experience:** The respondent interface is sacred. It must be blazing fast, thumb-friendly, visually clear, and effortless to complete on any device.
3. **Intuitive Visual Logic:** Branching and conditional routing should be easy to understand through visual canvas connections, avoiding complex conditional formula nesting.
4. **Zero Paywall Friction:** Provide core survey capabilities—including multi-path branching and custom theming—without arbitrary gates or restrictions.

## Accessibility & Inclusion

- Respondent survey interfaces must fully support keyboard-only navigation (Tab, Enter, Arrow keys), WCAG AA color contrast ratios across both light and dark modes, clear focus rings, and accessible form labels/ARIA descriptions for screen readers.
