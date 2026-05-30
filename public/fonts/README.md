# Fonts

The 3D extruded letters (PIXEL WEB DEVELOPERS in front of the spawn) load a
Typeface JSON font from this folder. Until you add the file, the letters will
render as nothing (the rest of the world is unaffected).

## Required file

`helvetiker_regular.typeface.json`

Download it from three.js:

<https://raw.githubusercontent.com/mrdoob/three.js/master/examples/fonts/helvetiker_regular.typeface.json>

Save it as `public/fonts/helvetiker_regular.typeface.json`.

## Using a different font

Generate a Typeface JSON for any TTF/OTF with <https://gero3.github.io/facetype.js/>
and drop it in this folder. Then update `FONT_URL` at the top of
`components/world/LetterBlocks.tsx` to point at it.
