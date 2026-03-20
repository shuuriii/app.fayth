# How to Generate the Complete YB Seed Data Using Claude Code

## Context

You are building the seed data for fayth.life's YB Programme content engine.
The source material is the book "ADHD in Adults" by Susan Young & Jessica Bramham.
The book text has been extracted and is available. Your job is to encode every
worksheet, table, diary, exercise, and psychoeducation block from all 14 chapters
as structured JSON content items following the schema defined in CLAUDE.md.

## File you already have

- `supabase/seed/yb_modules_seed.json` — all 14 modules defined
- `supabase/seed/module_05_seed.json` — Chapter 5 (Time Management) fully seeded as example

## Your job: generate the remaining 13 modules

For each module, create `supabase/seed/module_XX_seed.json` following the exact
same structure as `module_05_seed.json`.

## Schema rules (must follow exactly)

```json
{
  "module_id": "<number>",
  "chapter": "<number>",
  "title": "<chapter title>",
  "content_items": [
    {
      "id": "ch<N>_item_<01|02|03...>",
      "type": "worksheet | diary | exercise | psychoeducation | table",
      "title": "<table number and title from book>",
      "instructions": "<what the patient is told before starting>",
      "xp_value": "<20-100 depending on complexity>",
      "companion_website_ref": "<e.g. Table 5.1>",
      "schema": {
        "fields": ["..."],
        "scoring": { "method": "sum|average|none", "..." : "..." },
        "instructions_for_patient": "...",
        "clinician_notes": "..."
      }
    }
  ]
}
```

## Field types available

- `text` — single line
- `textarea` — multi-line
- `likert` — scale with labeled options (use for frequency/agreement scales)
- `scale` — numeric slider (use `scale_min`, `scale_max`, `scale_labels`)
- `checkbox` — multiple select from options list
- `select` — single select from options list
- `date` — date picker
- `time` — time picker
- `number` — numeric input
- `repeating_group` — for tables where user adds multiple rows (has `sub_fields` array)

## Priority order to generate (most clinically important first)

1. **module_09_seed.json** — Anxiety (Chapter 9)
   - Key tables: 9.1 (Anxiety checklist), 9.2 (Anxiety chart), 9.3 (Thought diary),
     9.6 (Thinking errors), 9.8 (Positive self-statements), 9.9 (Ten rules for panic),
     9.10 (Breathing exercises), 9.11 (Progressive muscle relaxation),
     9.12-9.15 (Overcoming avoidance — graded exposure stages)

2. **module_07_seed.json** — Impulsivity (Chapter 7)
   - Key tables: 7.1 (Impulse control problems list), 7.2 (IMPULSE method),
     7.3 (CONTROL process), 7.4 (Double-check questions), 7.5 (Distraction techniques)

3. **module_04_seed.json** — Inattention & Memory (Chapter 4)
   - Key tables: 4.1 (Attentional impairments), 4.2 (External attention strategies),
     4.3 (Internal attention strategies), 4.4 (External memory strategies),
     4.5 (Internal memory strategies)

4. **module_11_seed.json** — Low Mood & Depression (Chapter 11)
   - Key tables: 11.1 (Thinking errors), 11.2 (Thinking errors exercise),
     11.3 (Challenging negative thinking), 11.4 (Replacing negative thoughts),
     11.6 (Making a task list), 11.7-11.8 (Activity scheduling diary)

5. **module_10_seed.json** — Frustration & Anger (Chapter 10)
   - Key tables: 10.1 (ADHD formula), 10.2 (Measure of assertion)

6. **module_08_seed.json** — Social Relationships (Chapter 8)
   - Key tables: 8.1 (Social skills questionnaire), 8.2 (ADHD speech characteristics),
     8.3 (Conversational skills), 8.4 (Listening skills), 8.5-8.6 (Emotion recognition)

7. **module_12_seed.json** — Sleep Problems (Chapter 12)
   - Key tables: 12.1 (Stages of sleep), 12.2 (Factors affecting sleep),
     12.3 (Sleep diary), 12.4 (Behavioural sleep strategies), 12.5 (Mood sleep strategies)

8. **module_13_seed.json** — Substance Misuse (Chapter 13)
   - Key tables: 13.1-13.5 (stages, problems, motivation), 13.6 (problem of change),
     13.7 (Decisional balance), 13.8 (Weighted advantages), 13.9-13.10 (Distraction)

9. **module_06_seed.json** — Problem Solving (Chapter 6)
   - Key tables: 6.1 (Common problem domains), 6.2 (Understanding the problem),
     6.3 (Pros and cons list)

10. **module_14_seed.json** — Preparing for the Future (Chapter 14)
    - Key tables: 14.1 (Top ten achievements), 14.2 (Future goals),
      14.3 (Review of successful strategies)

11. **module_01_seed.json** — Introduction (Chapter 1)
    - Focus on psychoeducation blocks and the six adjustment stages

12. **module_02_seed.json** — Assessment (Chapter 2)
    - Key: DSM-IV symptom checklist as a self-report, symptomatic features table

13. **module_03_seed.json** — Treatment Overview (Chapter 3)
    - Key: Medication tips table, side effects table, psychoeducation blocks

## How to run Claude Code on this task

In your terminal:

```bash
cd fayth.life
claude
```

Then paste this prompt:

```
Read CLAUDE.md first. Then read supabase/seed/module_05_seed.json as the
reference schema. Then generate module_09_seed.json (Anxiety chapter) following
the exact same structure. Use the chapter content provided below.

[paste the relevant chapter text here]
```

## Getting chapter text to paste

Run this Python script to extract any chapter:

```python
# extract_chapter.py
import sys

chapter_markers = {
    4: ("INATTENTION AND MEMORY", "TIME MANAGEMENT"),
    5: ("TIME MANAGEMENT", "PROBLEM-SOLVING"),
    6: ("PROBLEM-SOLVING", "IMPULSIVITY"),
    7: ("IMPULSIVITY", "SOCIAL RELATIONSHIPS"),
    8: ("SOCIAL RELATIONSHIPS", "ANXIETY"),
    9: ("ANXIETY", "FRUSTRATION AND ANGER"),
    10: ("FRUSTRATION AND ANGER", "LOW MOOD"),
    11: ("LOW MOOD", "SLEEP PROBLEMS"),
    12: ("SLEEP PROBLEMS", "SUBSTANCE MISUSE"),
    13: ("SUBSTANCE MISUSE", "PREPARING FOR"),
    14: ("PREPARING FOR", "References"),
}

ch = int(sys.argv[1])
with open("book.txt") as f:
    text = f.read()

start_marker, end_marker = chapter_markers[ch]
start = text.find(start_marker)
end = text.find(end_marker, start + 100)
print(text[start:end])
```

Usage:

```bash
python extract_chapter.py 9 > chapter_09.txt
# Then paste chapter_09.txt content into Claude Code
```

## Seed runner script

Once all JSON files are created, run this to load them into Supabase:

```python
# supabase/seed/run_seed.py
import json
import os
from supabase import create_client

url = os.environ["SUPABASE_URL"]
key = os.environ["SUPABASE_SERVICE_KEY"]
supabase = create_client(url, key)

# Seed modules
with open("yb_modules_seed.json") as f:
    modules = json.load(f)
supabase.table("yb_modules").upsert(modules).execute()
print(f"Seeded {len(modules)} modules")

# Seed content items
for i in range(1, 15):
    fname = f"module_{i:02d}_seed.json"
    if not os.path.exists(fname):
        print(f"Skipping {fname} — not yet created")
        continue
    with open(fname) as f:
        data = json.load(f)
    items = data["content_items"]
    # Add module_id to each item
    for item in items:
        item["module_id"] = data["module_id"]
    supabase.table("yb_content_items").upsert(items).execute()
    print(f"Seeded {len(items)} items for module {i}")

print("Done.")
```
