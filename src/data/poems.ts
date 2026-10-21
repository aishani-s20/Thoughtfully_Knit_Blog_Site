import { Poem } from '../types/index.ts';

export const INITIAL_POEMS: Poem[] = [
  {
    id: 'the-weight-of-rain',
    slug: 'the-weight-of-rain',
    title: 'The Weight of Rain',
    subtitle: 'A study on architecture, grief, and precipitation',
    author: 'A. Samit',
    publishedAt: 'October 14, 2026',
    readTime: '3 min read',
    coverGradient: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #0f172a 100%)',
    tags: ['Monsoon', 'Solitude', 'Memory', 'Grief'],
    soundscapeId: 'steady_rain',
    soundscapeName: 'Rain Sound',
    soundscapeRationale: 'Gentle steady rain pattering on window glass with rhythmic roof droplets captures the quiet weight of precipitation.',
    overallMood: 'Pensive Rain & Memory',
    authorNotes: `Written on an overcast Tuesday during the extended Bangalore monsoon in 2021. The poem attempts to map the physical weight of roof water against the emotional compression of quiet departure. Stanza 2 references an abandoned brick kiln near Sarjapur where water had gathered into an unintentional mirror. The emotional trajectory moves from sharp isolation into a slow, suspended truce with memory.`,
    fullText: `The eaves hold water like an unfinished sentence.
Every drop hesitates along the zinc lip,
suspending gravity for half a second
before meeting the pavement's dark slate.

Across the courtyard, an empty terra cotta vessel
measures the storm by quarters of an inch.
We left our names inside the house,
taped to the backs of picture frames
so the moisture would not dissolve who we were.

To let go is not an arithmetic of subtraction,
but a change in atmospheric pressure.
You wake to find the ceiling uncracked,
the window glass weeping only on the outside,
and your hands entirely free of mud.`,
  },
  {
    id: 'cartography-of-silence',
    slug: 'cartography-of-silence',
    title: 'Cartography of Silence',
    subtitle: 'Lines drawn across northern coastlines and internal pauses',
    author: 'A. Samit',
    publishedAt: 'September 28, 2026',
    readTime: '4 min read',
    coverGradient: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #44403c 100%)',
    tags: ['Solitude', 'Coastline', 'Metaphysics', 'Winter'],
    soundscapeId: 'ocean_waves',
    soundscapeName: 'Sea Sound',
    soundscapeRationale: 'Rhythmic sea waves and coastal surf rolling against limestone cliffs mirror the unmapped meadows of the coast.',
    overallMood: 'Sovereign Serenity & Sea Distance',
    authorNotes: `Drafted on the western coast of Ireland near the Burren. The limestone pavements here possess deep fissures known as 'grykes', inside which delicate ferns flourish completely protected from Atlantic gales. The poem connects this geological silence to psychological sanctuary: how the deepest thoughts inhabit fractures where no wind can penetrate.`,
    fullText: `Between two words there is an unmapped meadow
where sheep wander without shepherds
and the wind does not bother to announce itself.
We spend our whole lives building bridges
over spaces that were meant to be walked upon.

The limestone coast cracks under cold pressure,
each fissure offering shelter to small green ferns
that know nothing of the ocean's fury.
What we call solitude is merely the geography
of something that has stopped defending its perimeter.

I do not need your agreement to be whole.
The rock does not ask the tide to validate its weight.
When evening falls, the gulls fold their wings
and settle into the hollows of the cliff,
trusting the stone that never spoke a word.`,
  },
  {
    id: 'knit-in-the-loom-of-time',
    slug: 'knit-in-the-loom-of-time',
    title: 'Knit in the Loom of Time',
    subtitle: 'On hereditary craft, neural threads, and maternal syntax',
    author: 'A. Samit',
    publishedAt: 'August 19, 2026',
    readTime: '3 min read',
    coverGradient: 'linear-gradient(135deg, #3f2e24 0%, #573c2c 50%, #1e130c 100%)',
    tags: ['Craft', 'Heredity', 'Memory', 'Metaphysics'],
    soundscapeId: 'crackling_hearth',
    soundscapeName: 'Fireplace & Hearth Sound',
    soundscapeRationale: 'Warm burning wood embers and gentle crackling sparks create a cozy sanctuary celebrating hereditary craft and memory.',
    overallMood: 'Warm Hearth & Ancestral Craft',
    authorNotes: `Dedicated to my grandmother, who could calculate the tension of hand-spun raw silk purely through the pads of her index fingers without looking. She used to say that a knot is simply a thought that refused to unravel. This poem explores how code, neural networks, and textile weaving all share the fundamental vocabulary of looping, tension, and release.`,
    fullText: `My mother’s grandmother taught her fingers to think
before the thought could reach her tongue.
A pull of warp, an answer in the weft,
coaxing unruly silk into disciplined rows
that could outlast the dynasty that bought them.

Now I sit before a pane of glowing glass,
knitting matrices of weights and probabilities.
We call it intelligence, as if we invented the loop,
as if the shuttle had not been teaching silicon
how to remember since the first spindle turned.`,
  },
  {
    id: 'nocturne-for-an-empty-room',
    slug: 'nocturne-for-an-empty-room',
    title: 'Nocturne for an Empty Room',
    subtitle: 'Observations on architecture, shadows, and the residue of speech',
    author: 'A. Samit',
    publishedAt: 'July 11, 2026',
    readTime: '2 min read',
    coverGradient: 'linear-gradient(135deg, #18181b 0%, #27272a 50%, #09090b 100%)',
    tags: ['Architecture', 'Nocturne', 'Absence', 'Stillness'],
    soundscapeId: 'night_crickets',
    soundscapeName: 'Night Crickets Sound',
    soundscapeRationale: 'Quiet nocturnal crickets and gentle night air match the bare plaster walls and stillness after departure.',
    overallMood: 'Nocturnal Crickets & Architecture',
    authorNotes: `An architectural sketch written after clearing out an apartment lived in for six years. When the rugs and armchairs are removed, the room's acoustics revert to an ecclesiastical echo. You realize that a home is not furniture, but the specific way plaster walls hold the vibration of laughter and silence.`,
    fullText: `Remove the bookshelves, and the room learns to speak again.
The bare lime-plaster wall carries an echo
that belongs to cathedral naves or caves.
Here is where we argued about the future;
here is where the morning sun cut an amber triangle on the floor.

A house is not walls, but a box of trapped air
that has learned the temperature of your skin.
Even when the key turns in the deadbolt for the last time,
the volume inside does not instantly forget.
It waits, humming in the dark like a struck tuning fork.`,
  },
];
