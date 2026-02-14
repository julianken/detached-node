---
name: design-review
description: Run a critical design review on a web application
user-invocable: true
disable-model-invocation: true
context: fork
agent: design-reviewer
---

# Design Review

Review the web application for design issues. Be thorough and critical.

## Instructions

1. If a URL was provided as an argument, navigate to that URL
2. If no URL was provided, ask the user what URL to review
3. If the user says "this app" or similar, use http://localhost:3000
4. Run through the full design review checklist
5. Test both desktop and mobile (375px) viewports
6. Provide a prioritized list of issues with specific, actionable fixes

## Default URL
If reviewing "the app" or "this site" without a specific URL, use: http://localhost:3000
