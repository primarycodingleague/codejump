# Lesson units, one file per lab

Each file exports `LESSONS` (in unit order) and `SLIDES` (id → slides), in exactly the same format as `lessons/lessons.js`
(see the comment at its top). `lessons.js` appends every unit's lessons after its own, in the order below, and attaches the
slides. Lessons in a unit carry `unit: '<Unit name> · Block N · Lesson M'`; the Lesson card's Next lesson button and the
library's Before this / Next links follow the order the lessons appear in.

To fold an EXISTING lesson (one in lessons.js) into a unit, put `{ adopt: '<existing id>', unit: '…', …overrides }` at its place
in the unit's `LESSONS`: lessons.js moves that lesson object there and applies the overrides (its id, starter and slides stay).
