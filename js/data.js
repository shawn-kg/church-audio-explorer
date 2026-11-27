/*
  All site content lives here. To fix a fact, edit the text in this file.
  Coordinates are in the stage drawing's units (1140 wide), drawn as seen
  from the congregation: stage left on the left, the snake room back right.

  Each stop has:
    label   short name drawn on the stage
    ch      channel numbers on the FOH X32 (if any)
    gear    the model of gear at this stop
    signal  signal type key (see SIGNALS)
    what    what it is
    flow    what happens to the signal here
    ours    how we use it
    wrong   what commonly goes wrong
    confirm facts still to check with the team
*/

window.SIGNALS = {
  inst:     { name: 'Instrument level', note: 'Unbalanced 1/4" (TS)' },
  mic:      { name: 'Mic level, balanced', note: 'XLR and the analog snake' },
  digital:  { name: 'Digital audio', note: 'AES50, Ultranet, USB' },
  line:     { name: 'Line level', note: 'Console outputs to speakers' },
  monitor:  { name: 'Monitor mix', note: 'Buses to the in-ear transmitters' },
  wireless: { name: 'Wireless', note: 'Radio, no cable' }
};

window.AREAS = [
  { id: 'side',  label: 'Side space',          x: 10,  y: 60,  w: 95,  h: 345 },
  { id: 'stage', label: 'Stage',               x: 115, y: 60,  w: 650, h: 345 },
  { id: 'snake', label: 'Snake room',          x: 810, y: 60,  w: 290, h: 155 },
  { id: 'drums', label: 'Drum cage',           x: 810, y: 230, w: 290, h: 175, door: [810, 320, 810, 360] },
  { id: 'foh',   label: 'FOH booth',           x: 150, y: 570, w: 360, h: 130 }
];

const VOCAL = (name, ch, sub, who) => ({
  label: name, ch: [ch], gear: 'Shure SM58', signal: 'mic', kind: 'source',
  what: 'A dynamic, cardioid handheld mic. It turns the singer\'s voice into a small electrical signal and mostly ignores sound arriving from behind it.',
  flow: 'The mic puts out mic level, a few thousandths of a volt, balanced on an XLR cable. That is far too quiet to use directly, so the preamp at the FOH X32 adds most of the gain. Dynamic mics need no phantom power.',
  ours: `Ch ${ch}, the ${who} vocal position. It plugs into the ${sub}. The singer hears their mix through an Xvive in-ear pack, controlled from MX-Bus or MX-Q on their phone.`,
  wrong: 'Cupping the grille makes a 58 boomy and much more likely to feed back. If the channel is silent, swap in a known-good cable, then try another sub snake input to find which part failed.'
});

window.STOPS = {
  /* ---------- Left of stage ---------- */
  keys: {
    label: 'Keys', x: 205, y: 100, ch: [17, 18], gear: 'Stereo keyboard rig', signal: 'inst', kind: 'source',
    what: 'The main keyboard, at the back left of the stage, facing forward.',
    flow: 'Its left and right outputs are unbalanced 1/4" cables at instrument or line level. Unbalanced cables pick up hum over long runs, so they only travel a few feet to the DI.',
    ours: 'Keys L and R go into the left and right sides of a stereo Radial DI, then to channels 17 and 18 through the left sub snake. The keys player mixes their own monitor on a P16.',
    wrong: 'Only the left side sounds: the keyboard may be set to mono output, or one cable is unplugged. Hum: try the ground lift switch on the DI.'
  },
  diKeys: {
    label: 'DI', x: 235, y: 75, ch: [17, 18], gear: 'Radial stereo DI', signal: 'mic', kind: 'di',
    what: 'A direct injection (DI) box. It converts an unbalanced instrument signal into a balanced, mic-level signal.',
    flow: 'This is where the line on the stage changes color. Amber instrument-level signal goes in on 1/4"; cyan balanced mic-level signal comes out on XLR, ready for a long cable run without picking up noise.',
    ours: 'One stereo Radial DI takes both keys outputs and sends two XLRs to the left sub snake.',
    wrong: 'Hum or buzz: press the ground lift. A distorted, crunchy keys sound: the signal is too hot, so engage the pad if the DI has one.',
    confirm: ['Exact Radial model, and whether it is passive or active.']
  },
  aux: {
    label: 'Aux keys', x: 175, y: 225, ch: [21, 22], gear: 'Stereo keyboard rig', signal: 'inst', kind: 'source',
    what: 'A second keyboard, in front of and to the left of the main keys, facing the middle of the stage.',
    flow: 'Stereo unbalanced 1/4" outputs, the same as the main keys, into a DI a few feet away.',
    ours: 'Aux keys L and R go into a Radial DI behind it, then around the edge of the stage to the left sub snake on channels 21 and 22. Its P16 is behind it and to its left. The aux keys P16 is daisy-chained off the keys P16.',
    wrong: 'If the aux keys P16 goes silent, check the keys P16 first: the aux one gets its signal through it.'
  },
  diAux: {
    label: 'DI', x: 150, y: 190, ch: [21, 22], gear: 'Radial DI', signal: 'mic', kind: 'di',
    what: 'A DI box for the aux keys.',
    flow: 'Converts the two unbalanced keyboard outputs into two balanced, mic-level XLR signals.',
    ours: 'Left and right sides feed channels 21 and 22 on the left sub snake.',
    wrong: 'Hum: try the ground lift. No signal: check that both 1/4" cables are fully seated.',
    confirm: ['Exact Radial model.']
  },
  electric: {
    label: 'Electric', x: 440, y: 95, ch: [19, 20], gear: 'Stereo guitar rig', signal: 'inst', kind: 'source',
    what: 'The electric guitar rig at the center back of the stage, facing forward.',
    flow: 'The rig\'s stereo outputs leave on unbalanced 1/4" cables and go straight into DIs, so there is no mic on an amp.',
    ours: 'Electric L and R each go into a Behringer mono DI, then to channels 19 and 20 through the left sub snake. The guitarist mixes their own monitor on a P16.',
    wrong: 'One side missing: check both DIs and both cables. A thin or harsh tone in the room is usually the rig\'s output settings, not the console.',
    confirm: ['What the rig is (amp modeler, pedalboard), and whether it outputs at instrument or line level.']
  },
  diElec: {
    label: 'DIs', x: 410, y: 72, ch: [19, 20], gear: 'Two Behringer mono DIs', signal: 'mic', kind: 'di',
    what: 'Two mono DI boxes, one for each side of the guitar rig.',
    flow: 'Each converts one unbalanced output into one balanced, mic-level XLR signal.',
    ours: 'Feed channels 19 and 20 on the left sub snake.',
    wrong: 'If one is an active DI and its battery dies, that side goes silent. Phantom power on the channel can also run it.',
    confirm: ['Behringer model (for example DI100 active or DI400P passive).']
  },
  red: Object.assign(VOCAL('Red', 13, 'left sub snake', 'red'), { x: 215, y: 300 }),
  green: Object.assign(VOCAL('Green', 14, 'left sub snake', 'green'), { x: 335, y: 300 }),
  leftSub: {
    label: 'Left sub snake', x: 325, y: 75, gear: '8-channel sub snake', signal: 'mic', kind: 'snake',
    what: 'A small box with eight XLR inputs, joined into one multicore cable.',
    flow: 'Each input stays a separate balanced mic-level signal; the multicore just bundles them. That saves running eight long cables across the stage.',
    ours: 'It sits at the back of the stage, between the keys and the electric. It carries keys L/R (17, 18), electric L/R (19, 20), aux keys L/R (21, 22), and the red and green vocals (13, 14), which use its last two inputs. It runs to the main snake in the snake room.',
    wrong: 'A dead channel that works when moved to another input points to a bad sub snake input. Keep the multicore out of walkways.',
    confirm: ['Which sub snake input number each source uses.']
  },

  /* ---------- Right of stage ---------- */
  bass: {
    label: 'Bass', x: 690, y: 95, ch: [23], gear: 'Bass guitar', signal: 'inst', kind: 'source',
    what: 'The bass guitar, at the back right of the stage, facing forward.',
    flow: 'A passive bass pickup is a weak, high-impedance source. Plugging it straight into a long cable or a mic input would lose low end and pick up noise, which is why it goes through an active DI.',
    ours: 'Into a Radial J48 active DI, then channel 23 through the right sub snake. The bassist mixes their own monitor on a P16.',
    wrong: 'No bass at all: the J48 needs phantom power from channel 23 to run. Check the 48V switch first.'
  },
  diBass: {
    label: 'J48', x: 660, y: 72, ch: [23], gear: 'Radial J48 active DI', signal: 'mic', kind: 'di',
    what: 'An active DI box. It has electronics inside that need power.',
    flow: 'It takes its power from the console\'s 48V phantom power, sent back up the XLR cable. It converts the bass\'s weak signal into a strong, balanced mic-level signal.',
    ours: 'Feeds channel 23 on the right sub snake. Phantom power (48V) must be on for channel 23 at the FOH X32.',
    wrong: 'Silent: 48V is off. Hum: try the ground lift. The thru jack can feed a bass amp if one is added.'
  },
  mal: {
    label: 'Malayalam keys', short: 'Mal keys', x: 705, y: 345, ch: [31, 32], gear: 'Stereo keyboard rig', signal: 'inst', kind: 'source',
    what: 'The keyboard for Malayalam worship, at the right of the stage just in front of the drum cage entrance, facing the middle of the stage.',
    flow: 'Stereo unbalanced 1/4" outputs into two mono DIs.',
    ours: 'Into two mono Radial DIs just behind it, then around the edge of the stage to the right sub snake on channels 31 and 32. The player has their own P16.',
    wrong: 'Same as the other keys: check for mono output mode, and use the ground lift for hum.'
  },
  diMal: {
    label: 'DIs', x: 728, y: 318, ch: [31, 32], gear: 'Two Radial mono DIs', signal: 'mic', kind: 'di',
    what: 'Two mono DI boxes, one for each side of the Malayalam keys.',
    flow: 'Each converts one unbalanced output into one balanced, mic-level XLR signal.',
    ours: 'Feed channels 31 and 32 on the right sub snake.',
    wrong: 'Hum: ground lift. One side silent: swap the two cables to find out whether the keyboard or the DI is the problem.',
    confirm: ['Exact Radial model.']
  },
  tbMain: {
    label: 'Main talkback', short: 'Talkback', x: 690, y: 150, ch: [1], gear: 'Shure Beta 58A', signal: 'mic', kind: 'source',
    what: 'A talkback mic in front of the bass, so the band and worship leader can talk to each other and the tech team without the congregation hearing.',
    flow: 'An ordinary mic-level signal. What makes it talkback is the routing: it goes to the monitor mixes, not the mains. The Beta 58A is a supercardioid dynamic mic, with tighter pickup than a 58.',
    ours: 'Ch 1, into the right sub snake. It usually sits in front of the bass but moves around.',
    wrong: 'Talkback heard in the room or on the stream: the channel is assigned to the main mix. It should only feed monitor buses.'
  },
  tbBand: {
    label: 'Band talkback', short: 'Talkback', x: 205, y: 150, ch: [2], gear: 'Samson mic', signal: 'mic', kind: 'source',
    what: 'A second talkback mic, in front of the main keys.',
    flow: 'A mic-level signal routed to the monitor mixes only.',
    ours: 'Ch 2. It usually sits in front of the keys on the left of the stage but moves around, and its cable runs across to the right sub snake.',
    wrong: 'Heard in the room: the channel is assigned to the main mix.'
  },
  joji: {
    label: 'Joji', x: 470, y: 370, ch: [12], gear: 'Shure KSM9', signal: 'mic', kind: 'source',
    what: 'A handheld condenser vocal mic, used by a singer who brings his own.',
    flow: 'Unlike the 58s, a condenser has electronics inside that need 48V phantom power from the console. It is more detailed and more sensitive, so it needs less gain.',
    ours: 'Ch 12, at the front of the stage. Its cable runs around the edge of the stage to the right sub snake. The KSM9 has a switch for cardioid or supercardioid pickup.',
    wrong: 'Silent: 48V phantom power is off on channel 12. Because it is more sensitive than a 58, it can feed back sooner in a wedge.'
  },
  blue: Object.assign(VOCAL('Blue', 15, 'right sub snake', 'blue'), { x: 565, y: 300 }),
  yellow: Object.assign(VOCAL('Yellow', 16, 'right sub snake', 'yellow'), { x: 685, y: 300 }),
  rightSub: {
    label: 'Right sub snake', x: 565, y: 75, gear: '8-channel sub snake', signal: 'mic', kind: 'snake',
    what: 'The second 8-input sub snake, on the right of the stage.',
    flow: 'Bundles eight balanced mic-level signals into one multicore that runs to the snake room.',
    ours: 'It sits at the back of the stage, between the electric and the bass. It carries main and band talkback (1, 2), Joji (12), blue and yellow (15, 16), bass (23), and Malayalam keys L/R (31, 32).',
    wrong: 'Same as the left sub snake: if a source works on another input, the input is bad. Label every input.',
    confirm: ['Which sub snake input number each source uses.']
  },

  /* ---------- Front of house (the congregation side) ---------- */
  roomL: {
    label: 'Room mic L', x: 128, y: 300, ch: [5], gear: 'Rode mic', signal: 'mic', kind: 'source',
    what: 'A mic on the left edge of the stage, in line with the vocalists, pointed out at the congregation.',
    flow: 'Picks up the room and the congregation singing. It runs directly to the snake room instead of through a sub snake.',
    ours: 'Ch 5. Its cable runs around the outside of the stage to the snake room. Paired with the right room mic on channel 6.',
    wrong: 'Room mics in the main speakers can cause feedback. They usually go to the livestream mix, so it sounds like a room full of people.',
    confirm: ['Rode model (most need phantom power).', 'Whether the room mics feed the stream only.']
  },
  roomR: {
    label: 'Room mic R', x: 758, y: 300, ch: [6], gear: 'Rode mic', signal: 'mic', kind: 'source',
    what: 'A mic on the right edge of the stage, in line with the vocalists, pointed out at the congregation.',
    flow: 'Picks up the room and the congregation singing. It runs directly to the snake room.',
    ours: 'Ch 6. Its cable runs off the right edge of the stage to the snake room. Paired with the left room mic on channel 5.',
    wrong: 'Left and right levels should match, or the stream sounds lopsided.',
    confirm: ['Rode model.']
  },
  wireless: {
    label: 'Wireless 1–4', x: 300, y: 360, ch: [8, 9, 10, 11], gear: 'Sennheiser e835 handhelds', signal: 'wireless', kind: 'source',
    what: 'Four wireless handheld mics for speaking: preaching, announcements, readings.',
    flow: 'The e835 capsule is a dynamic, cardioid mic. A transmitter in the handle sends the signal by radio to a matching receiver in the snake room, which turns it back into an XLR signal.',
    ours: 'Wireless 1 to 4 on channels 8 to 11, usually spoken into from the stage. The receivers live in the snake room and plug directly into the main snake.',
    wrong: 'Dead batteries are the number one problem: fresh batteries every service. Dropouts happen when a body or wall blocks the radio path.',
    confirm: ['Wireless system model and frequency band.']
  },

  /* ---------- Drum cage ---------- */
  kit: {
    label: 'Drum kit', x: 930, y: 320, ch: [24, 25, 26, 27, 28, 29, 30], gear: 'Seven mics', signal: 'mic', kind: 'source',
    what: 'The drum kit, inside the drum cage to the right of the stage. The cage\'s front lines up with the front of the stage, with the snake room behind it. The cage keeps loud drums from bleeding into every other mic.',
    flow: 'Seven mics, each close to one drum, plus two overheads for the cymbals and the whole kit. All go into the drum sub snake.',
    ours: 'Kick (24), snare top (25), snare bottom (26), hi tom (27), low tom (28), overheads L and R (29, 30). The drummer mixes their own monitor on a P16.',
    wrong: 'Pick a mic below to see its own notes.',
    parts: [
      { id: 'kick', label: 'Kick', ch: [24], gear: 'Audix D6', text: 'A dynamic mic built for kick drums, with a scooped sound that brings out the low thump and the beater click.' },
      { id: 'snt', label: 'Snare top', ch: [25], gear: 'Shure SM57', text: 'The classic snare mic: dynamic, rugged, and pointed at the drum head.' },
      { id: 'snb', label: 'Snare bottom', ch: [26], gear: 'Shure SM57', text: 'Picks up the snare wires underneath. It faces the opposite way from the top mic, so its polarity should be flipped (the Ø button on the X32) or the two mics cancel each other out.' },
      { id: 'tom1', label: 'Hi tom', ch: [27], gear: 'Audix D2', text: 'A small dynamic tom mic.' },
      { id: 'tom2', label: 'Low tom', ch: [28], gear: 'Audix D4', text: 'A dynamic tom mic tuned for bigger, lower drums.' },
      { id: 'ohl', label: 'Overhead L', ch: [29], gear: 'Behringer C2', text: 'A small condenser mic above the kit. Condensers need 48V phantom power. The two overheads make the stereo picture of the kit.' },
      { id: 'ohr', label: 'Overhead R', ch: [30], gear: 'Behringer C2', text: 'The right overhead. Both overheads should be the same distance from the snare, or the snare sounds thin.' }
    ]
  },
  click: {
    label: 'Click', x: 1070, y: 370, ch: [4], gear: 'Playback device', signal: 'inst', kind: 'source',
    what: 'The click track: a metronome, and often spoken cues, that keeps the band in time.',
    flow: 'It comes out of a 1/8" headphone jack and is split into two 1/4" plugs. One goes into a Behringer DI.',
    ours: 'Ch 4, through the drum sub snake. It goes to the band\'s monitors only.',
    wrong: 'Click heard in the room or on the stream: channel 4 is assigned to the main mix. It must never be.',
    confirm: ['What plays the click (phone, laptop, sample pad).']
  },
  diClick: {
    label: 'DI', x: 1070, y: 330, ch: [4], gear: 'Behringer DI', signal: 'mic', kind: 'di',
    what: 'A DI box for the click.',
    flow: 'Converts the click\'s unbalanced signal into balanced mic level.',
    ours: 'Sits just behind the click, and feeds channel 4 on the drum sub snake, which sits behind it.',
    wrong: 'Hum in the band\'s ears: try the ground lift.'
  },
  spd: {
    label: 'SPD', x: 845, y: 385, ch: [7], gear: 'Sample pad', signal: 'inst', kind: 'source',
    what: 'An electronic sample pad the drummer plays for extra sounds.',
    flow: 'A 1/4" output into a Behringer DI. From the DI it skips the drum sub snake and runs straight to the main snake.',
    ours: 'Ch 7.',
    wrong: 'Very loud hits: the pad\'s output level is set too high, so turn it down at the pad, not just at the console.'
  },
  diSpd: {
    label: 'DI', x: 845, y: 350, ch: [7], gear: 'Behringer DI', signal: 'mic', kind: 'di',
    what: 'A DI box for the SPD.',
    flow: 'Converts its unbalanced output into balanced mic level.',
    ours: 'Runs directly to the main snake in the snake room, channel 7.',
    wrong: 'Hum: ground lift.'
  },
  drumTB: {
    label: 'Drum talkback', x: 960, y: 265, ch: [3], gear: 'Samson mic', signal: 'mic', kind: 'source',
    what: 'The drummer\'s talkback mic.',
    flow: 'A mic-level signal that runs directly to the main snake.',
    ours: 'Ch 3, at the back of the drum cage next to the drummer. It runs directly to the main snake and goes to monitors, not the mains.',
    wrong: 'Heard in the room: it is assigned to the main mix.'
  },
  drumSub: {
    label: 'Drum snake', x: 1070, y: 290, gear: '8-channel sub snake', signal: 'mic', kind: 'snake',
    what: 'The drum cage\'s own sub snake.',
    flow: 'Bundles the kit mics and click into one multicore to the snake room.',
    ours: 'It sits to the right of the kit, behind the click DI. It carries the click (4), kick (24), snare top and bottom (25, 26), hi and low tom (27, 28), and overheads (29, 30).',
    wrong: 'Overheads silent: phantom power is off on channels 29 and 30.'
  },

  /* ---------- Snake room ---------- */
  receivers: {
    label: 'Receivers', x: 1050, y: 80, ch: [8, 9, 10, 11], gear: 'Wireless receivers', signal: 'mic', kind: 'hub',
    what: 'The receivers for the four wireless speaking mics.',
    flow: 'Each one picks up its transmitter by radio and puts out an ordinary XLR signal.',
    ours: 'Four receivers in the snake room, plugged directly into the main snake for channels 8 to 11.',
    wrong: 'Check the receiver\'s signal (RF) and audio (AF) meters: no RF means the mic is off or out of range.'
  },
  mainSnake: {
    label: 'Main snake', x: 980, y: 195, gear: 'Analog multicore', signal: 'mic', kind: 'hub',
    what: 'The main analog snake: one thick multicore cable carrying every stage input to the FOH booth.',
    flow: 'Each channel stays a separate balanced mic-level signal all the way to the X32\'s preamps. Nothing is converted to digital until it reaches FOH.',
    ours: 'It sits below the monitor mixer in the snake room. The three sub snakes plug in here, along with the room mics, drum talkback, SPD, and wireless receivers. Most snake channels match the X32 channel numbers.',
    wrong: 'A channel dead on every source points to the snake channel or its connector. The snake carries tiny signals a long way, so keep connectors clean and dry.',
    confirm: ['Total channel count, and whether it has returns back to the stage.']
  },
  monMixer: {
    label: 'Monitor mixer', x: 990, y: 115, gear: 'Behringer X32', signal: 'digital', kind: 'hub',
    what: 'A second mixer that builds what the musicians and singers hear on stage, separately from what the congregation hears.',
    flow: 'It receives all 32 inputs digitally from the FOH X32 over AES50, after the FOH preamps. Gain is set once, at FOH, so a gain change at FOH also changes every monitor mix.',
    ours: 'An X32, at the front of the snake room with the router and P16-D to its left, and the main snake below it. It builds a mono bus for each of the five singers, feeds the P16 system, and connects to a router so singers can adjust their own mix from MX-Bus or MX-Q.',
    wrong: 'All monitors suddenly louder or quieter: someone changed gain at FOH. Monitors silent but FOH fine: check the AES50 cable and the monitor mixer\'s input routing.',
    confirm: ['Which X32 model (full, Compact, Producer or Rack).', 'Which bus feeds each singer.']
  },
  p16d: {
    label: 'P16-D', x: 835, y: 115, gear: 'Behringer P16-D', signal: 'digital', kind: 'hub',
    what: 'A distributor for the P16 personal monitor system.',
    flow: 'It takes the Ultranet stream from the monitor mixer and sends it, with power, to each P16 mixer over ethernet cable. Ultranet carries 16 channels, so the monitor engineer picks which 16 sources the band can mix.',
    ours: 'Feeds the P16s for bass, electric, keys, Malayalam keys and drums. The aux keys P16 is daisy-chained from the keys P16.',
    wrong: 'One P16 dark: swap its cable or port. All dark: check the cable from the monitor mixer.'
  },
  router: {
    label: 'Router', x: 905, y: 115, gear: 'Network router', signal: 'digital', kind: 'hub',
    what: 'A network router connected to the monitor mixer.',
    flow: 'It carries control data, not audio. Phones and tablets on its Wi-Fi can change the monitor mixer\'s settings.',
    ours: 'Singers join its Wi-Fi and use MX-Bus or MX-Q to adjust their own in-ear mixes.',
    wrong: 'App will not connect: the phone is on the wrong Wi-Fi network, or the router is off.'
  },

  /* ---------- Side space ---------- */
  xvive: {
    label: 'Xvive ×5', x: 58, y: 215, gear: 'Xvive U45 in-ear systems', signal: 'monitor', kind: 'hub',
    what: 'Five wireless in-ear transmitters, one for each singer, each paired with a receiver pack the singer wears.',
    flow: 'Each transmitter takes one mono mix and sends it by radio to its receiver. They are raised high on a mic stand and bar so the radio path to the singers stays clear.',
    ours: 'In the side space to the left of the stage. Five lines come from the monitor mixer: one long XLR, plus four over a 4-channel XLR-over-etherCON run.',
    wrong: 'Dropouts: a body or object is blocking the line of sight, or the pair has lost its link. Charge every pack before service.',
    confirm: ['Which transmitter belongs to which singer.']
  },

  /* ---------- P16 personal mixers ---------- */
  p16Keys:  { label: 'P16', x: 150, y: 80,  gear: 'Behringer P16-M', signal: 'digital', kind: 'p16', for: 'keys', what: 'The keys player\'s personal mixer.', ours: 'Fed from the P16-D. The aux keys P16 is daisy-chained from this one.' },
  p16Aux:   { label: 'P16', x: 135, y: 215, gear: 'Behringer P16-M', signal: 'digital', kind: 'p16', for: 'aux keys', what: 'The aux keys player\'s personal mixer.', ours: 'Behind the aux keys and to the left. Daisy-chained from the keys P16, so it depends on that one staying connected.' },
  p16Elec:  { label: 'P16', x: 480, y: 130, gear: 'Behringer P16-M', signal: 'digital', kind: 'p16', for: 'electric', what: 'The electric guitarist\'s personal mixer.', ours: 'Fed from the P16-D.' },
  p16Bass:  { label: 'P16', x: 720, y: 120, gear: 'Behringer P16-M', signal: 'digital', kind: 'p16', for: 'bass', what: 'The bassist\'s personal mixer.', ours: 'Fed from the P16-D.' },
  p16Mal:   { label: 'P16', x: 735, y: 290, gear: 'Behringer P16-M', signal: 'digital', kind: 'p16', for: 'Malayalam keys', what: 'The Malayalam keys player\'s personal mixer.', ours: 'Behind and to the right of the Malayalam keys. Fed from the P16-D.' },
  p16Drums: { label: 'P16', x: 845, y: 260, gear: 'Behringer P16-M', signal: 'digital', kind: 'p16', for: 'drums', what: 'The drummer\'s personal mixer.', ours: 'Fed from the P16-D.' },

  /* ---------- FOH ---------- */
  x32: {
    label: 'FOH X32', x: 210, y: 610, gear: 'Behringer X32', signal: 'mic', kind: 'board', console: true,
    what: 'The front-of-house (FOH) mixer: where the congregation\'s mix is built.',
    flow: 'The analog snake lands on the X32\'s preamps, which add gain and turn each channel into digital audio. From there every channel goes through its processing, out to Waves and back, into buses, and on to the speakers. All inputs are also sent on to the monitor mixer over AES50.',
    ours: 'On the left side of the FOH booth, back of the room left of center, with the Mac mini to its right and the amps below it. Gain and phantom power for all 32 inputs are set here. Open the console view to follow a channel through the X32 itself.',
    wrong: 'Distortion on loud parts: gain is too high, so lower it at the preamp, not the fader.',
    confirm: ['X32 model and firmware.']
  },
  mac: {
    label: 'Mac mini', x: 340, y: 610, gear: 'Waves SuperRack Performer', signal: 'digital', kind: 'board',
    what: 'A Mac mini running Waves SuperRack Performer, which hosts Waves plugins (EQs, compressors, reverbs) on the computer.',
    flow: 'Selected channels leave the X32 digitally, run through plugins on the Mac, and come back into the same channel. This is called an insert. The round trip adds a few milliseconds of delay, set by SuperRack\'s buffer size.',
    ours: 'To the right of the FOH X32 in the booth. Open the console view to see where the insert sits in a channel.',
    wrong: 'If the Mac sleeps, updates or loses its connection, channels with an active insert go silent. Know how to bypass the insert on the X32.',
    confirm: ['How audio travels between the X32 and the Mac (most likely the X-USB card).', 'Buffer size, and which plugins are on which channels.']
  },
  amps: {
    label: 'Amps', x: 210, y: 660, gear: 'Power amplifiers', signal: 'line', kind: 'board',
    what: 'The amplifiers for the mains, subs and stage monitors, in the rack below the FOH mixer.',
    flow: 'The console puts out line level, a signal strong enough to travel down a cable but far too weak to move a speaker. An amp boosts it to speaker level, which carries real power.',
    ours: 'Below the FOH X32. They feed the left and right mains, both subs, and the two stage wedges.',
    wrong: 'One speaker silent: check that amp channel\'s power, its clip and protect lights, and its speaker cable. Never unplug a speaker cable while the amp is on and loud.',
    confirm: ['Amp models, and which amp channel feeds which speaker.']
  },
  stream: {
    label: 'Stream', x: 470, y: 650, gear: 'Matrix output on the FOH X32', signal: 'line', kind: 'board',
    what: 'The livestream mix, built on a matrix output of the FOH X32.',
    flow: 'A matrix blends the main mix and buses into a separate mix. The stream needs one because the room is already loud: drums and guitar amps reach the congregation directly, but the stream only hears what the console sends it.',
    ours: 'A matrix on the FOH X32 feeds the stream.',
    wrong: 'Stream sounds thin or vocal-heavy: the room mix relies on acoustic sound the stream never hears. Bring up instruments and room mics in the matrix.',
    confirm: ['Which matrix it is, and what device receives it (stream computer, encoder).']
  },
  mainL: {
    label: 'Main L', x: 150, y: 425, gear: 'Main speaker, hung above the stage', signal: 'line', kind: 'out',
    what: 'The left main speaker, hung above the front of the stage.',
    flow: 'Turns the amp\'s speaker-level signal back into sound. Hanging the mains high spreads the sound evenly to the back rows and keeps it off the stage mics.',
    ours: 'Plays the main left side of the FOH mix. Powered from the amps at FOH.',
    wrong: 'Feedback: a mic is pointed toward a main or held in front of it.',
    confirm: ['Speaker model.']
  },
  mainR: {
    label: 'Main R', x: 740, y: 425, gear: 'Main speaker, hung above the stage', signal: 'line', kind: 'out',
    what: 'The right main speaker, hung above the front of the stage.',
    flow: 'Turns the amp\'s speaker-level signal back into sound for the right side of the room.',
    ours: 'Plays the main right side of the FOH mix. Powered from the amps at FOH.',
    wrong: 'Left and right sounding different: check that both amp channels are set to the same level.',
    confirm: ['Speaker model.']
  },
  subL: {
    label: 'Sub L', x: 95, y: 450, gear: 'Subwoofer, on the floor', signal: 'line', kind: 'out',
    what: 'The left subwoofer, on the floor next to the stage.',
    flow: 'Subs play only the lowest notes, roughly below 100 Hz: kick, bass and the bottom of the keys. That frees the mains to play everything above.',
    ours: 'Powered from the amps at FOH.',
    wrong: 'Muddy or boomy room: too much sub, or the vocals are not using their low cut.',
    confirm: ['Whether the subs get the main mix or their own bus, and the crossover point.']
  },
  subR: {
    label: 'Sub R', x: 795, y: 450, gear: 'Subwoofer, on the floor', signal: 'line', kind: 'out',
    what: 'The right subwoofer, on the floor to the right of the right main.',
    flow: 'Plays only the lowest notes, under the right main.',
    ours: 'Powered from the amps at FOH.',
    wrong: 'Sub silent: check its amp channel first.',
    confirm: ['Speaker model.']
  },
  monL: {
    label: 'Wedge L', x: 140, y: 390, gear: 'Stage monitor', signal: 'line', kind: 'out',
    what: 'A floor wedge on the left side of the stage, facing the center.',
    flow: 'A wedge points back at the performers so they can hear themselves. It plays its own monitor mix, not the room mix.',
    ours: 'On the front edge of the stage at the left, facing center. Powered from the monitor amp at FOH.',
    wrong: 'Wedges are the most common source of feedback. Keep vocal mics pointed away from them, and turn the wedge down before turning anything else up.',
    confirm: ['Which console and bus builds the wedge mixes.']
  },
  monR: {
    label: 'Wedge R', x: 740, y: 390, gear: 'Stage monitor', signal: 'line', kind: 'out',
    what: 'A floor wedge on the right side of the stage, facing the center.',
    flow: 'Plays a monitor mix back toward the performers on the right side.',
    ours: 'On the front edge of the stage at the right, facing center. Powered from the monitor amp at FOH.',
    wrong: 'Ringing on stage: pull the wedge down first.',
    confirm: ['Which console and bus builds the wedge mixes.']
  }
};

/* Connections. Each goes from -> to in the direction the signal flows. */
window.WIRES = [
  // instruments into DIs (each DI sits just behind its instrument)
  ['keys', 'diKeys', 'inst'], ['aux', 'diAux', 'inst'], ['electric', 'diElec', 'inst'],
  ['bass', 'diBass', 'inst'], ['mal', 'diMal', 'inst'], ['click', 'diClick', 'inst'], ['spd', 'diSpd', 'inst'],
  // into the left sub snake (back of stage, between keys and electric)
  ['diKeys', 'leftSub', 'mic'], ['diElec', 'leftSub', 'mic'],
  ['diAux', 'leftSub', 'mic', [[124, 190], [124, 47], [325, 47]]],
  ['red', 'leftSub', 'mic', [[310, 300], [310, 75]]],
  ['green', 'leftSub', 'mic', [[318, 300], [318, 75]]],
  // into the right sub snake (back of stage, between electric and bass)
  ['diBass', 'rightSub', 'mic'], ['tbMain', 'rightSub', 'mic'],
  ['diMal', 'rightSub', 'mic', [[774, 318], [774, 61], [570, 61]]],
  ['tbBand', 'rightSub', 'mic', [[260, 150], [260, 58], [555, 58]]],
  ['joji', 'rightSub', 'mic', [[470, 400], [770, 400], [770, 58], [565, 58]]],
  ['blue', 'rightSub', 'mic'],
  ['yellow', 'rightSub', 'mic', [[685, 280], [580, 280], [580, 75]]],
  // drum cage
  ['kit', 'drumSub', 'mic'], ['diClick', 'drumSub', 'mic'],
  // runs to the main snake
  ['leftSub', 'mainSnake', 'mic', [[325, 50], [800, 50], [800, 195]]],
  ['rightSub', 'mainSnake', 'mic', [[565, 55], [795, 55], [795, 195]]],
  ['roomL', 'mainSnake', 'mic', [[120, 300], [120, 42], [805, 42], [805, 195]]],
  ['roomR', 'mainSnake', 'mic', [[780, 300], [780, 195]]],
  ['drumTB', 'mainSnake', 'mic', [[960, 195]]],
  ['drumSub', 'mainSnake', 'mic', [[1070, 195]]],
  ['diSpd', 'mainSnake', 'mic', [[825, 350], [825, 195]]],
  ['wireless', 'receivers', 'wireless'], ['receivers', 'mainSnake', 'mic', [[1050, 195]]],
  // to FOH, back of the room left of center
  ['mainSnake', 'x32', 'mic', [[980, 222], [1112, 222], [1112, 585], [230, 585], [230, 610]]],
  ['x32', 'mac', 'digital', null, true],
  ['x32', 'amps', 'line'], ['x32', 'stream', 'line', [[240, 650]]],
  // amps to the speakers and wedges
  ['amps', 'mainL', 'line', [[120, 660], [120, 425]]],
  ['amps', 'subL', 'line', [[120, 660], [120, 450]]],
  ['amps', 'monL', 'line', [[120, 660], [120, 390]]],
  ['amps', 'mainR', 'line', [[255, 660], [255, 565], [760, 565], [760, 425]]],
  ['amps', 'subR', 'line', [[255, 660], [255, 565], [795, 565]]],
  ['amps', 'monR', 'line', [[255, 660], [255, 565], [760, 565], [760, 390]]],
  // monitor world
  ['x32', 'monMixer', 'digital', [[196, 610], [196, 575], [1124, 575], [1124, 115]]],
  ['router', 'monMixer', 'digital'],
  ['monMixer', 'p16d', 'digital', [[975, 92], [835, 92]]],
  ['p16d', 'p16Keys', 'digital', [[820, 115], [820, 36], [150, 36]]], ['p16Keys', 'p16Aux', 'digital'],
  ['p16d', 'p16Elec', 'digital', [[820, 115], [820, 36], [480, 36]]],
  ['p16d', 'p16Bass', 'digital', [[820, 115], [820, 36], [720, 36]]],
  ['p16d', 'p16Mal', 'digital', [[820, 115], [820, 36], [735, 36]]],
  ['p16d', 'p16Drums', 'digital'],
  ['monMixer', 'xvive', 'monitor', [[990, 30], [58, 30]]],
  ['xvive', 'red', 'wireless'], ['xvive', 'green', 'wireless'], ['xvive', 'joji', 'wireless'],
  ['xvive', 'blue', 'wireless'], ['xvive', 'yellow', 'wireless']
];

/* Guided tours: an ordered list of stops. */
window.TOURS = [
  { id: 'vocal', name: 'A vocal to the room', stops: ['red', 'leftSub', 'mainSnake', 'x32', 'amps', 'mainL'] },
  { id: 'ears', name: 'A singer\'s in-ear mix', stops: ['green', 'leftSub', 'mainSnake', 'x32', 'monMixer', 'xvive', 'green'] },
  { id: 'waves', name: 'Out to Waves and back', stops: ['joji', 'rightSub', 'mainSnake', 'x32', 'mac'] },
  { id: 'keys', name: 'Keys through a DI', stops: ['keys', 'diKeys', 'leftSub', 'mainSnake', 'x32', 'stream'] },
  { id: 'bass', name: 'Bass to the bassist\'s P16', stops: ['bass', 'diBass', 'rightSub', 'mainSnake', 'x32', 'monMixer', 'p16d', 'p16Bass'] },
  { id: 'drums', name: 'Kick drum to the subs', stops: ['kit', 'drumSub', 'mainSnake', 'x32', 'amps', 'subL'] },
  { id: 'speak', name: 'A wireless speaking mic', stops: ['wireless', 'receivers', 'mainSnake', 'x32', 'amps', 'mainR'] }
];

/* Inside the FOH X32: the order a channel's signal travels. */
window.CONSOLE = [
  { id: 'c-pre', label: 'Preamp', sub: 'Gain, 48V', what: 'The first and most important control. The preamp raises a tiny mic-level signal to a healthy working level and converts it to digital.', flow: 'Aim for peaks well below the top of the meter. The X32 has plenty of headroom, so a little lower is safer than a little higher. 48V phantom power is switched on here for condensers and active DIs.', ours: 'Phantom needed on: Joji (12), bass J48 (23), overheads (29, 30), and probably the room mics (5, 6).', wrong: 'Clipping (the red light) cannot be fixed later in the chain. Turn the gain down.' },
  { id: 'c-split', label: 'AES50 split', sub: 'To monitors', branch: true, what: 'Right after the preamp, every input is copied out over AES50 to the monitor mixer.', flow: 'The monitor mixer gets the signal after gain but before any of FOH\'s EQ, compression or faders. FOH processing does not change what the band hears, but FOH gain does.', ours: 'All 32 inputs, over one etherCON cable to the snake room.', wrong: 'Changing gain during a service changes every monitor mix. Set gain at soundcheck, then leave it.' },
  { id: 'c-hpf', label: 'Low cut', sub: 'High-pass filter', what: 'Removes the low rumble a source does not need.', flow: 'Below the frequency you set, the signal is turned down. Vocals rarely need anything under about 100 Hz.', ours: 'On every vocal and speaking mic. Off for kick, bass and keys.', wrong: 'Too high and a voice sounds thin. Too low and stage rumble and handling noise get through.' },
  { id: 'c-gate', label: 'Gate', sub: 'Noise gate', what: 'Mutes a channel when the signal drops below a threshold.', flow: 'Useful on toms to cut bleed between hits.', ours: 'To be filled in from the scene file.', wrong: 'A threshold set too high cuts off quiet notes.' },
  { id: 'c-eq', label: 'EQ', sub: 'Tone shaping', what: 'Turns specific frequency ranges up or down.', flow: 'Cutting usually sounds more natural than boosting. Cut the mud first; boost only if something is missing.', ours: 'To be filled in from the scene file. The X32 can swap the order of EQ and compressor.', wrong: 'Big boosts invite feedback.' },
  { id: 'c-comp', label: 'Compressor', sub: 'Dynamics', what: 'Evens out volume by turning down the loudest moments.', flow: 'Threshold sets when it starts working; ratio sets how hard. A singer who goes from a whisper to a belt stays easier to hear.', ours: 'To be filled in from the scene file.', wrong: 'Too much compression sounds squashed and raises the stage noise between phrases.' },
  { id: 'c-ins', label: 'Insert', sub: 'Waves on the Mac', branch: true, what: 'The channel leaves the X32, runs through Waves SuperRack Performer on the Mac mini, and returns to the same channel.', flow: 'The round trip adds a few milliseconds of delay. If one mic of a pair is inserted and the other is not, the two can sound phasey.', ours: 'To be filled in: which plugins sit on which channels, and the buffer size.', wrong: 'If the Mac stops, inserted channels go silent. Bypass the insert on the X32 to get them back.' },
  { id: 'c-fad', label: 'Fader, mute, DCAs', sub: 'Level', what: 'The fader sets how much of the channel goes into the main mix. DCAs move groups of faders together.', flow: 'Faders change level after all the processing, so moving them does not change how hard the compressor works.', ours: 'To be filled in from the scene file: our DCA groups.', wrong: 'If a fader is near the bottom and the channel is still too loud, the gain is too high.' },
  { id: 'c-bus', label: 'Buses', sub: 'Effects, stream', what: 'Buses combine channels into extra mixes: reverb sends, the livestream, and subgroups.', flow: 'A pre-fader send ignores the channel fader; a post-fader send follows it. Effects sends are usually post-fader.', ours: 'To be filled in from the scene file.', wrong: 'Reverb still audible after a fader comes down: the reverb send is pre-fader.' },
  { id: 'c-main', label: 'Main and matrix', sub: 'Outputs', what: 'The main L/R mix goes to the speakers. Matrix outputs make blends of the main mix and buses for other destinations.', flow: 'A matrix can feed the livestream a different balance than the room hears.', ours: 'To be filled in from the scene file.', wrong: 'Nothing anywhere: check the main fader and the main mute.' }
];
