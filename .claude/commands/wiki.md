# IrinaBot Wiki Search

Search the IrinaBot documentation wiki for articles matching the query.

## Instructions

The user wants to search the IrinaBot wiki. Their query is: **$ARGUMENTS**

Follow these steps:

### Step 1 — Fetch the article list

Use WebFetch to retrieve: `https://api.irinabot.ru/v1/wiki/irina-help/articles?locale=ru-RU`

Prompt: "Return the raw JSON array of all articles with their id, url, title, parentId, hasChild, hasPayload fields."

### Step 2 — Find matching articles

From the list, find articles whose **title** or **url** contains words from the user's query (case-insensitive). If the query is empty or generic, list all articles with their titles and urls.

### Step 3 — Fetch and display content

For each matching article (up to 3 best matches), fetch the full content:
`https://api.irinabot.ru/v1/wiki/irina-help/article/{url}?locale=ru-RU`

Prompt: "Return the title and payload fields from this JSON."

### Step 4 — Present results

Display results in this format:

---

## {article title}

{payload content — render as markdown as-is}

---

If no matches found, list all available articles with their titles so the user can pick one.
If the query matches multiple articles, show a short summary of each and ask the user which one to open in full.
