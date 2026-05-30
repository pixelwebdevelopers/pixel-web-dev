# Audio

The sound system uses **multi-variant pools** — each logical event has a small
pool of clips and one is picked at random per play, so repeated impacts don't
sound identical. Each play also gets a small random pitch shift (±6%) for
extra variety. Anything missing falls back to a procedural Web Audio synth so
the site is never silent.

## Folder layout

| Folder         | Slot       | Trigger                                                  |
| -------------- | ---------- | -------------------------------------------------------- |
| `engines/1/`   | `engine`   | Continuous loop, `playbackRate` follows car speed        |
| `horns/`       | `horn`     | **H** key — long musical horn (random of 3)              |
| `car-horns/`   | `carHorn`  | Reserved (not currently triggered)                       |
| `car-hits/`    | `carHit`   | Layered on top of material sound on every collision      |
| `bricks/`      | `brick`    | Car hits a rock (random of 6)                            |
| `wood-hits/`   | `wood`     | Car hits a tree, station pole, or letter block           |
| `bowling/`     | `pin`      | Car knocks a bowling pin                                 |
| `ui/`          | `area`     | Drives into a station — opens its panel                  |
| `screeches/`   | `screech`  | Triggered on the first frame of a drift (Space at speed) |
| `reveal/`      | `reveal`   | Intro stinger — plays on the first user interaction       |

## File inventory

```
public/audio/
├── bowling/         pin-1.mp3
├── bricks/          brick-1.mp3 brick-2.mp3 brick-4.mp3 brick-6.mp3 brick-7.mp3 brick-8.mp3
├── car-hits/        car-hit-1.mp3 car-hit-3.mp3 car-hit-4.mp3 car-hit-5.mp3
├── car-horns/       car-horn-1.mp3 car-horn-2.mp3
├── engines/1/       low_off.mp3
├── horns/           horn-1.mp3 horn-2.mp3 horn-3.mp3
├── reveal/          reveal-1.mp3
├── screeches/       screech-1.mp3
├── ui/              area-1.mp3
└── wood-hits/       wood-hit-1.mp3
```

## Layering

Tree, pole, rock, and letter hits all play the **material sound** *and* the
**`carHit`** sound together, so you get both "the car going thud" and "the
thing being hit" at once. Pin hits use only the pin clack — they're light
enough that an extra car-body thud would feel wrong.
