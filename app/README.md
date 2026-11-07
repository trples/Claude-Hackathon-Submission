# ADU Pathfinder

A tool for nonprofit housing project managers (and the homeowners and permit staff they work with) that shows the fastest legal approval path for a project in an Orange County city, with state deadlines, law citations and that city's forms.

**Team:** [Placeholder]
**Members:** [Jocelyn, Angelina, Vienna, Joy, Andrew]
**Lane:** 2 Clear it
**Built at:** Claude Impact Lab: UCI × SoCal Affordable Housing, November 7, 2026

## The real user

A nonprofit project manager or individual homeowner is trying to build new ADU homes in Orange County. Each of the county's 34 cities has its own forms, fees and checklists, and some city forms misread state law, so it is hard to tell whether a project qualifies for a ministerial approval (no hearing, no discretion) or has to go through a hearing.

**Before:** They read state law and each city's website by hand, and they often find out late which path applies and how long it will take.
**After:** They pick a city and project type and see the fastest legal path, the laws behind it, and the city's own forms in one place.

## What we built

[TODO: 2 to 3 sentences on what the tool does, plus a screenshot or short clip.]

- Pick an Orange County city and a project type (for example ADU, SB 9 two-unit, SB 9 lot split, small map, streamlined multifamily) [TODO: confirm which are supported]
- See the fastest legal path: ministerial vs. hearing, state deadlines, citations and the city's forms
- [TODO: what makes it more than a lookup, for example flagging stale law numbers or comparing a city's checklist to what state law allows]

## How Claude is used

**How we built it with Claude:** [TODO: e.g. Claude Code or the Claude app for scaffolding, data cleanup, writing the path logic, drafting this README.]

**What Claude does when the tool runs:** [TODO: e.g. reads the city and project details, matches them to the state-law rules, and explains the path in plain language with citations.]

**What a person checks:** Every citation and deadline against the statute or the city page before relying on it. The tool does not replace the city planning department or a lawyer.

## Try it

```bash
# [TODO: exact steps for a laptop]
git clone https://github.com/angeliinawang/Claude-Hackathon-Submission.git
cd Claude-Hackathon-Submission/app
# install dependencies
# run the app
```

**Needs installed:** [TODO: e.g. Node 20+ or Python 3.11+]
**Environment variables:** `ANTHROPIC_API_KEY` (set it in your shell or a local `.env` file that is git-ignored). No keys are in this repo.

## Sources and assumptions

| Item | Source or assumption | Date checked |
|---|---|---|
| ADU law, Gov Code 66310 to 66342 (renumbered from 65852.2) | California statute text | [TODO] |
| State housing department (HCD) guidance and letters to cities | HCD | [TODO] |
| City permit pages, checklists and fees for OC cities | Each city's public website | [TODO] |
| Four-year baseline timeline and other delays | Provided challenge data (`lanes/2-clear-it/data/timeline.json`) | [TODO] |
| [TODO any number we made up] | ASSUMPTION | n/a |

Every number we made up is labelled ASSUMPTION here and in the tool.

## What is real and what is mocked

| Part | Status |
|---|---|
| Path logic (ministerial vs. hearing) | [TODO working / partly working / mocked] |
| State law citations | [TODO] |
| City forms and fees for all 34 cities | [TODO] |
| Timeline estimates | [TODO] |
| Claude explanations | [TODO] |

## Where it gets things wrong

[TODO: what you saw it miss.] Things we would not trust it with yet: [TODO, e.g. fee amounts, cities whose pages we did not check, projects with unusual lot conditions]. Where the answer is unknown, the tool should say so. How reliable it is for [TODO] is unknown.

## Next steps

**For a nonprofit or city to use this next month:** [TODO: e.g. check every city's data with its planning staff, add a way to report errors, confirm the law citations with a housing attorney.]
**With one more week:** [TODO]

## Data and privacy

This project uses only public or provided data. It contains no personal information about real tenants, buyers or residents. It does not file applications or contact any city or person.

## License

MIT, see the LICENSE file in this repo.