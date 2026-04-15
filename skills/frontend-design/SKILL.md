---
name: frontend-design
description: Use when building or restyling frontend pages, components, dashboards, landing pages, posters, or other UI that should feel distinctive, context-aware, and not like a generic AI template
license: Complete terms in LICENSE.txt
---

# Frontend Design

## Overview

Build real frontend code with strong taste. The goal is not just "pretty UI" - it is UI that feels intentional, specific to the product, and free of default AI output patterns.

Core loop:
1. Predict the model's default output for this task.
2. Reject the parts that feel generic, templated, or context-free.
3. Choose a sharper visual point of view that fits the product and audience.
4. Implement that direction as production-ready code.

If the first concept could work for any startup, landing page, or dashboard after swapping a logo, it is still default output.

## When to Use

- The user asks to build or restyle pages, components, dashboards, landing pages, posters, or app UI.
- The current UI feels bland, overly safe, template-like, or "AI generated".
- The task needs visual direction, brand expression, or stronger product taste.
- The user says things like "make it prettier", "make it feel premium", "less generic", "more designed", or "more distinctive".

Do not invent an unrelated new visual language if the project already has a clear design system. In that case, keep the system and use the anti-default pass to avoid lazy, samey compositions inside that language.

## Anti-Default Pass

Before coding, stop and answer these questions:
- What would the default AI answer probably look like?
- Which parts of that default answer would feel too safe, symmetrical, polished-in-the-same-way, or unrelated to the product?
- What visual decision would make this unmistakably more specific?
- What should someone remember after looking at it for five seconds?

Default frontend traps usually look like:
- centered hero on a clean white page with a soft gradient blob
- purple, pink, or blue gradients used because they feel "modern"
- feature-card grids with interchangeable iconography and rounded pills
- typography chosen from habit rather than intent
- motion sprinkled everywhere instead of building a coherent rhythm

If the first draft feels familiar, do not polish it in place. Change at least one of these before shipping:
- layout system
- typography pairing
- palette logic
- background treatment
- motion language
- component silhouette

If you need more examples of these traps, scan `references/frontend-default-traps.md` before finalizing the design.

## Design Direction

Before coding, lock four things:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick a real direction: brutally minimal, maximalist chaos, retro-futuristic, organic, luxury, editorial, brutalist, art deco, soft/pastel, industrial, playful, archival, etc.
- **Constraints**: Framework, performance, accessibility, content density, responsiveness.
- **Differentiation**: What makes this memorable instead of merely competent?

Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism can both work. Intentionality matters more than intensity.

## Build Standard

Implement real working code (HTML/CSS/JS, React, Vue, etc.) that is:
- production-grade and functional
- responsive on desktop and mobile
- visually striking and memorable
- cohesive with a clear aesthetic point of view
- meticulous in spacing, hierarchy, rhythm, and finishing

Match implementation complexity to the vision. Maximalist designs need rich systems and disciplined layering. Minimalist designs need restraint, precision, and very high taste.

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Use type with intention. Avoid defaulting to Inter, Roboto, Arial, or system stacks just because they are easy. If the existing product already uses them intentionally, keep them and create distinctiveness through scale, weight, spacing, casing, and contrast.
- **Color & Theme**: Use CSS variables. Build a palette that comes from brand, mood, material, or product context, not from "modern SaaS vibes". Dominant colors with clear accents beat timid, evenly spread palettes.
- **Motion**: Use animation as a system, not decoration. One orchestrated reveal, sweep, shutter, or stagger is better than generic fade-ups on every element. For React, use Motion when it fits the stack.
- **Spatial Composition**: Push beyond safe symmetry when the context allows it. Use asymmetry, overlap, broken grids, strong axes, or deliberate quiet space. Make layout carry the concept.
- **Backgrounds & Visual Details**: Build atmosphere. Use gradients, textures, patterns, borders, transparency, grain, lighting, image treatment, or surface logic that matches the direction. Do not default to a flat neutral canvas unless restraint is itself the concept.

## Quick Reference

| Smell | Usually Means | Better Move |
| --- | --- | --- |
| Centered hero plus three feature cards | No real concept yet | Pick a stronger composition or narrative rhythm |
| Purple gradient on white | Default palette reflex | Derive color from product truth or mood |
| Same radius and shadow everywhere | Tokenized blandness | Choose a sharper surface language |
| Inter plus Space Grotesk again | Habit, not taste | Pick a new pairing or vary hierarchy more aggressively |
| Every element fades up | Motion without intent | Design one motion idea and repeat it selectively |
| Every section uses cards | Layout autopilot | Alternate density, structure, and pacing |

## Common Mistakes

- Mistaking "modern" for "good". Generic polish is still generic.
- Preserving the first draft and only decorating it. If the concept is weak, replace it.
- Over-designing without hierarchy. Maximalism still needs order.
- Under-designing without craft. Minimalism only works when spacing, type, and proportions are excellent.
- Ignoring the existing product language. Distinctive does not mean random.

Remember: the job is not to make something flashy. The job is to make something intentional, memorable, and correct for the context.
