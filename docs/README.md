# Docs

This folder contains brainstorming and concept development for Mind-Controlled.

## Structure

```
docs/
├── brainstorms/      # Dated session files (raw ideation)
│   └── _TEMPLATE.md  # Copy this to start a new session
├── concepts/         # Graduated ideas (refined, reusable)
│   └── _TEMPLATE.md  # Template for concept files
└── README.md         # You are here
```

## Workflow

### Starting a brainstorm

1. Copy `brainstorms/_TEMPLATE.md` to a new dated file:
   ```
   brainstorms/2026-01-25-topic-name.md
   ```
2. Fill in the Context section with what you're exploring
3. Dump ideas freely in Raw Ideas
4. As patterns emerge, note them in Threads Worth Pulling

### During a session

- Don't edit as you go — capture first, organize later
- Use tags liberally (they'll help with search later)
- It's fine to leave sections empty

### Graduating an idea

When an idea from a brainstorm feels solid enough to stand on its own:

1. Create a new file in `concepts/` using the template
2. Link back to the originating brainstorm(s)
3. Update the brainstorm's status to `graduated` and note which concept it became
4. The concept file is now the canonical place for that idea

### Statuses

**Brainstorms:**
- `raw` — Just captured, unprocessed
- `developing` — Being actively worked on
- `graduated` — Key ideas have moved to concepts/

**Concepts:**
- `draft` — Still forming
- `solid` — Core idea is clear, details may shift
- `ready-to-use` — Can be referenced or turned into content

## Tags

Use hashtags in the Tags field. Some suggested categories:

- Topics: `#propaganda` `#ellul` `#conditioning` `#media`
- Types: `#post-idea` `#structure` `#voice` `#design`
- Meta: `#process` `#direction` `#question`

## Finding things

Search across all brainstorms:
```bash
grep -r "keyword" docs/brainstorms/
```

List all files with a specific tag:
```bash
grep -l "#propaganda" docs/brainstorms/*.md
```

## Tips

- One brainstorm can spawn multiple concepts
- Multiple brainstorms can feed into one concept
- It's okay for brainstorms to go nowhere — that's the point
- Review old brainstorms periodically; ideas age interestingly
