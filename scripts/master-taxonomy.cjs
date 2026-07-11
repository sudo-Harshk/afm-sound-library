/**
 * Master Sound Taxonomy
 *
 * Merged from:
 * - PDF "Complete Sound Event Taxonomy and Characterization Guide" v2.0 (203 labels)
 * - Firestore live data (extra animal labels, typo fixes)
 *
 * Total: 211 labels across 18 sections
 *
 * Changes vs PDF:
 *   + Added 8 new animal labels from Firestore: Dog panting, Dog whining,
 *     Chicken Clucking, Cricket chirping, Crow cawing, Donkey braying,
 *     Duck quacking, Goat sound
 *   + Fixed typo: "Crow creepy" → "Crow cawing"
 *
 * Changes vs Firestore:
 *   + Fixed typo: "BREKE SCREECH" → "Brake screech"
 *   + Fixed typo: "Chicken Cluking" → "Chicken Clucking"
 *   + Fixed typo: "Crow creepy" → "Crow cawing"
 *   + Fixed typo: "Breakag" → "Breakage"
 *   + Normalized casing to Title Case throughout
 *   + Moved misplaced labels to correct sections:
 *       - Bubbling, Dripping, Gurgling, etc. → Liquid and fluid sounds
 *       - Applause, Booing, Chanting, etc. → Social and crowd sounds
 *       - Thunder, Wind howling, Rain pattering, etc. → Nature and environmental sounds
 *   + Removed non-sound labels (annotation guidelines, confusable pairs, background/ambience)
 */

const SECTIONS = [
  {
    section: "Human vocal and speech sounds",
    labels: [
      ["Speech", "Talking or chatting", "Continuous conversational speech from one or more people."],
      ["Speech", "Whispering", "Soft breathy speech with little or no vocal fold vibration."],
      ["Speech", "Shouting", "Loud projected speech with strong vocal energy."],
      ["Speech", "Singing", "Melodic vocalization with sustained pitch and rhythm."],
      ["Speech", "Humming", "Closed-mouth tonal vocalization."],
      ["Expression", "Laughing", "Vocal expression of amusement, from chuckles to loud laughter."],
      ["Expression", "Giggling", "Light, high-pitched repeated laughter."],
      ["Expression", "Crying or sobbing", "Vocal expression of sadness or distress, often with sobs."],
      ["Expression", "Screaming", "Very loud high-energy vocalization from fear, pain, or excitement."],
      ["Expression", "Sighing", "Long audible exhale expressing relief, fatigue, or frustration."],
      ["Expression", "Moaning or groaning", "Low prolonged vocal sound expressing discomfort, effort, or pleasure."],
      ["Mouth generated", "Whistling", "High-pitched tone made by forcing air through lips or teeth."],
      ["Exertion", "Grunting", "Short forceful voiced sound made during physical effort."],
    ],
  },
  {
    section: "Human respiratory and involuntary sounds",
    labels: [
      ["Reflex", "Sneezing", "Sudden explosive burst of air through nose and mouth."],
      ["Reflex", "Coughing", "Sharp expulsion of air to clear throat or airways."],
      ["Deliberate airway", "Throat clearing", "Short guttural sound used to clear mucus or prepare to speak."],
      ["Sleep/breathing", "Snoring", "Rhythmic vibrating sound during sleep from relaxed airway tissues."],
      ["Breathing", "Wheezing", "High-pitched strained breathing sound caused by narrow airflow."],
      ["Breathing", "Gasping", "Sudden sharp intake of breath."],
      ["Breathing", "Yawning", "Deep inhalation with open mouth, often expressing fatigue."],
      ["Reflex", "Hiccupping", "Involuntary diaphragm spasm producing a short hic sound."],
      ["Breathing", "Panting", "Rapid shallow breathing after exertion or heat."],
      ["Nasal", "Sniffling", "Repeated short nasal inhalations."],
      ["Breathing", "Breathing", "Audible inhale and exhale without another stronger respiratory event."],
    ],
  },
  {
    section: "Human digestive, body, and contact sounds",
    labels: [
      ["Digestive", "Burping or belching", "Release of gas from the stomach through the mouth."],
      ["Digestive", "Vomiting or gagging", "Retching or forceful expulsion sounds from throat/stomach."],
      ["Digestive", "Stomach growling", "Rumbling sound from digestive activity."],
      ["Mouth/eating", "Swallowing or gulping", "Audible throat movement when ingesting liquid or food."],
      ["Mouth/eating", "Chewing or crunching", "Teeth breaking down food."],
      ["Mouth/eating", "Slurping", "Noisy suction of liquid into the mouth."],
      ["Mouth/eating", "Lip smacking", "Short wet mouth contact sounds."],
      ["Body contact", "Footsteps", "Repeated foot-ground impacts from walking or running."],
      ["Body contact", "Hand clapping", "Sharp sound from striking palms together."],
      ["Body contact", "Finger snapping", "Short sharp sound from finger friction and release."],
    ],
  },
  {
    section: "Baby and infant sounds",
    labels: [
      ["Pre-speech", "Cooing", "Soft vowel-like infant vocalization expressing comfort."],
      ["Pre-speech", "Babbling", "Repetitive consonant-vowel combinations in pre-speech."],
      ["Distress", "Baby crying or wailing", "Loud sustained infant distress vocalization."],
      ["Wet vocal", "Baby gurgling", "Bubbly wet infant vocalization from saliva and air."],
      ["Distress", "Fussing or whimpering", "Low-level intermittent infant distress sounds."],
      ["Excited vocal", "Baby squealing", "High-pitched excited infant vocalization."],
    ],
  },
  {
    section: "Social and crowd sounds",
    labels: [
      ["Audience", "Applause", "Sustained collective clapping from multiple people."],
      ["Audience", "Cheering", "Loud enthusiastic vocal celebration by one or many people."],
      ["Audience", "Booing", "Vocal disapproval from a crowd."],
      ["Group vocal", "Chanting", "Rhythmic repeated group vocalization."],
      ["Crowd bed", "Crowd murmur", "Diffuse background voices without clear individual speech."],
      ["Crowd expression", "Crowd laughter", "Multiple people laughing together."],
    ],
  },
  {
    section: "Animal sounds",
    labels: [
      ["Dog", "Barking", "Short loud dog vocal bursts."],
      ["Dog", "Growling", "Low rumbling animal threat sound."],
      ["Dog", "Panting", "Rapid shallow breathing from a dog."],
      ["Dog", "Whining", "High-pitched distressed vocalization from a dog."],
      ["Cat", "Meowing", "Cat vocal call with changing pitch."],
      ["Cat", "Purring", "Soft continuous vibration from a cat."],
      ["Cat/reptile", "Hissing", "Sharp sustained warning sound from animal mouth."],
      ["Bird", "Chirping or tweeting", "Short high-pitched bird calls."],
      ["Bird", "Screeching", "Loud harsh high-pitched bird or animal cry."],
      ["Bird", "Rooster crowing", "Distinctive loud rooster call."],
      ["Bird", "Chicken clucking", "Repetitive clucking sounds from a chicken."],
      ["Bird", "Crow cawing", "Loud harsh calls from a crow."],
      ["Bird", "Duck quacking", "Nasal quacking sounds from a duck."],
      ["Insect", "Buzzing insect", "Rapid wing vibration from an insect."],
      ["Insect", "Cricket chirping", "Rhythmic high-pitched chirping from a cricket."],
      ["Amphibian", "Croaking", "Low rough repetitive frog or toad call."],
      ["Wild animal", "Howling", "Long mournful animal vocalization."],
      ["Reptile", "Rattlesnake rattling", "Rapid dry rattle from tail movement."],
      ["Small mammal", "Chittering", "Rapid high-pitched chatter from small animals."],
      ["Livestock", "Horse neighing", "High-energy horse vocalization."],
      ["Livestock", "Cow mooing", "Low sustained cattle vocalization."],
      ["Livestock", "Donkey braying", "Loud harsh vocalization from a donkey."],
      ["Livestock", "Goat sound", "Bleating vocalization from a goat."],
    ],
  },
  {
    section: "Nature and environmental sounds",
    labels: [
      ["Weather", "Thunder", "Deep rumbling boom caused by lightning."],
      ["Weather", "Wind howling", "Sustained moaning sound of strong air currents."],
      ["Weather", "Rain pattering", "Many raindrops tapping surfaces."],
      ["Weather", "Hail", "Hard pelting sound of ice striking surfaces."],
      ["Geophysical", "Avalanche rumble", "Deep growing roar of snow and debris moving downhill."],
      ["Geophysical", "Earthquake rumble", "Low-frequency ground-shaking vibration."],
      ["Water body", "Wave crashing", "Powerful rolling ocean or lake water breaking on shore."],
      ["Fire/vegetation", "Fire crackling", "Irregular snapping of burning material."],
      ["Vegetation", "Rustling sound", "Soft swishing from leaves or light vegetation moving."],
      ["Water body", "Flowing water", "Continuous water movement over rocks or terrain."],
      ["Water body", "Continuous water roar", "Continuous heavy falling water."],
      ["Water body", "Surf or rolling waves", "Repeated distant waves and foam wash."],
      ["Ice/natural material", "Cracking sound", "Sharp fracture sounds from ice stress."],
    ],
  },
  {
    section: "Liquid and fluid sounds",
    labels: [
      ["Impact", "Splashing", "Object or body displacing liquid suddenly."],
      ["Drops", "Dripping", "Single drops falling at intervals."],
      ["Flow", "Gurgling", "Irregular bubbling or draining flow."],
      ["Flow", "Pouring", "Steady stream of liquid entering a container."],
      ["Container motion", "Sloshing", "Heavy liquid shifting inside a container."],
      ["Gas in liquid", "Bubbling", "Repeated gas bubbles escaping through liquid."],
      ["Pressure", "Spraying", "Fine mist or liquid expelled under pressure."],
      ["Flow", "Gushing", "Sudden forceful rush of liquid."],
      ["Small flow", "Trickling", "Light continuous small stream of liquid."],
      ["Heat/liquid", "Sizzling sound", "Hissing from moisture contacting a hot surface."],
      ["Plumbing", "Toilet flushing", "Rushing and gurgling water from a toilet flush cycle, ending with tank refill."],
    ],
  },
  {
    section: "Impact and collision sounds",
    labels: [
      ["Heavy impact", "Thud", "Heavy dull sound from an object hitting a surface."],
      ["Deliberate strike", "Knock", "Sharp repeated strike on a hard surface."],
      ["Loud impact", "Bang", "Sudden loud impact or explosive-like event."],
      ["Multi-object collision", "Crash", "Chaotic collision or breaking involving multiple components."],
      ["Metal impact", "Clang", "Loud resonant metallic impact."],
      ["Multiple small impacts", "Clatter", "Rapid series of short hard impacts."],
      ["Muffled impact", "Thump", "Heavy muffled impact."],
      ["Small mechanism", "Click", "Short sharp sound from a small mechanism engaging."],
      ["Fracture", "Crack", "Sharp sound from breaking or splitting."],
      ["Burst", "Pop", "Short explosive burst."],
      ["Flat contact", "Smack or slap", "Sharp flat contact between skin or flat surfaces."],
      ["Door impact", "Slam or bang", "Loud impact from a door closing hard."],
      ["Object handling", "Drop impact", "Generic object falling and hitting a surface."],
      ["Large energy event", "Explosion", "Sudden very loud broadband burst from combustion or rapid pressure release."],
      ["Door mechanism", "Door opening or closing", "Quiet to moderate mechanical sound of a door moving on hinges and latching."],
      ["Breakage", "Glass shattering", "Sharp breaking of glass into fragments, with high-frequency tinkling debris."],
    ],
  },
  {
    section: "Friction and texture sounds",
    labels: [
      ["Hard friction", "Scraping", "Harsh grating from dragging a hard object across a surface."],
      ["Fine friction", "Scratching", "Light abrasive sound from a pointed object on a surface."],
      ["Flexible material", "Scrunching or crinkling", "Compressing or crumpling flexible material."],
      ["Tight friction", "Squeaking", "High-pitched short friction sound."],
      ["Hard surfaces", "Grinding", "Harsh continuous friction from hard surfaces rubbing."],
      ["Structural friction", "Creaking", "Slow strained sound from wood, metal, or joints under pressure."],
      ["High friction", "Squealing", "Prolonged high-pitched friction screech."],
      ["Paper", "Rustling or crinkling sound", "Soft movement of paper sheets or book pages."],
      ["Abrasive material", "Abrasive rubbing", "Dry rough friction from abrasive surface movement."],
      ["Surface cleaning", "Brushing or sweeping", "Repeated light contact of bristles against a surface."],
      ["Sliding mechanism", "Drawer or cabinet sliding", "Sliding sound of a drawer or cabinet runner opening or closing, often ending in a soft stop."],
      ["Fastener", "Zipping sound", "Rapid ratchet-like sound of a zipper being opened or closed."],
      ["Cutting tool", "Scissor snipping", "Short metallic shearing sound of scissor blades closing through material."],
    ],
  },
  {
    section: "Metallic and resonant sounds",
    labels: [
      ["Metal impact", "Clanging", "Loud sharp metallic strike."],
      ["Small metal objects", "Jangling", "Light collision of small metal objects."],
      ["Glass/metal contact", "Clinking", "Light clear metal or glass contact."],
      ["Heavy metal", "Clanking", "Heavy dull metallic collision."],
      ["Small resonances", "Tinkling", "Series of light high-pitched metallic or glass sounds."],
      ["Resonance", "Ringing", "Sustained clear vibrating tone from a resonant object."],
      ["Loose parts", "Rattling", "Rapid loose vibration of small objects or parts."],
      ["Bell/chime", "Ringing sound", "Clear resonant bell tone after strike."],
      ["Metal drag", "Metallic dragging", "Metal chain pulled across a hard surface."],
    ],
  },
  {
    section: "Mechanical, appliance, and industrial sounds",
    labels: [
      ["Rotating machine", "Whirring", "Smooth continuous rotating machine sound."],
      ["Electrical/motor", "Hum", "Low steady vibration from electrical equipment."],
      ["Loose machine", "Rattle", "Loose repetitive vibration from parts."],
      ["Engine", "Roar", "Loud sustained powerful engine sound."],
      ["Mechanical engagement", "Clunk", "Heavy solid mechanical engagement."],
      ["Brake/friction", "Screeching sound", "High-pitched friction from brakes or metal on rails."],
      ["Appliance", "Low-frequency hum", "Steady low motor vibration from compressor."],
      ["Air handling", "Whooshing sound", "Rushing air from fan or vent."],
      ["Kitchen appliance", "Whirring or grinding", "High-speed blender motor and blade interaction."],
      ["Kitchen appliance", "Wet grinding sound", "Labored motor and grinding food waste."],
      ["Laundry appliance", "Rumbling sound", "Deep continuous vibration during wash or spin."],
      ["HVAC", "Droning sound", "Monotonous sustained low hum from HVAC."],
      ["Cleaning appliance", "Suction motor noise", "Loud suction and motor noise."],
      ["Industrial ambience", "Machine noise", "Dense background of industrial motors and mechanical activity."],
      ["Clock", "Ticking sound", "Regular periodic mechanical pulse from a clock or timing mechanism."],
      ["Electrical", "Electrical buzz or vibration", "Continuous low buzz or vibratory sound from electrical equipment or a vibrating device on a surface."],
    ],
  },
  {
    section: "Air and pressure sounds",
    labels: [
      ["Gas release", "Hiss", "Steady release of pressurized gas."],
      ["Fast airflow", "Whoosh", "Rushing sound of air moving quickly past."],
      ["Short airflow", "Puff", "Short soft burst of air."],
      ["Aperture tone", "Whistling airflow", "Tone from air forced through a narrow opening."],
      ["Steam/gas", "Pressure-release hiss", "Pressurized steam or vapor escaping."],
      ["Leak", "Hissing sound", "Air escaping from a tire or valve."],
      ["Deflation", "Deflation hiss or whoosh", "Air release from a balloon opening."],
    ],
  },
  {
    section: "Electronic, alert, and interface sounds",
    labels: [
      ["Signal", "Beep", "Short electronic tone used as a signal."],
      ["Warning", "Alarm or siren", "Loud urgent warning tone, often oscillating or repetitive."],
      ["Signal", "Buzzer", "Harsh continuous electronic tone."],
      ["Digital", "Notification tone", "Short distinctive digital sound."],
      ["Timer", "Timer or countdown beeping", "Repeated ticking or beeping approaching zero."],
      ["Door alert", "Doorbell or chime tone", "Tonal signal indicating someone at the door."],
      ["Typing/interface", "Typing or keystrokes", "Rapid repetitive tapping on keyboard keys."],
      ["Interface", "Interface click", "Short precise snap from mouse button press."],
      ["Interface", "Tapping sound", "Soft muted taps on glass surface."],
      ["Small mechanism", "Mechanical click", "Click of a retractable pen mechanism."],
      ["Switch", "Switch snap or click", "Crisp snap of a toggle or light switch."],
      ["Telephony", "Phone ringing tone", "Repeated alert tone from telephone or smartphone."],
      ["Sound reproduction", "Media playback sound", "Mixed reproduced audio from a television, radio, or streaming device, often combining speech, music, and effects."],
    ],
  },
  {
    section: "Music and tonal sounds",
    labels: [
      ["Chime", "Chime", "Clear melodic resonant tone from chimes."],
      ["String", "Strumming sound", "Sweeping sound across multiple strings."],
      ["Percussion", "Drum beat", "Rhythmic strike on a drum membrane."],
      ["Resonant", "Bell ringing tone", "Sustained resonant tone from a bell."],
      ["String/pluck", "Twang", "Sharp vibrating pluck of a taut string."],
      ["Keyboard instrument", "Piano note", "Hammered string tone from piano."],
      ["Wind instrument", "Flute tone", "Clear sustained tone from flute-like instrument."],
      ["Brass/horn", "Horn or trumpet", "Loud bright brass or horn tone."],
      ["Rhythm", "Small percussion tone", "Small struck musical object producing a tone."],
    ],
  },
  {
    section: "Food preparation and cooking sounds",
    labels: [
      ["Preparation", "Chopping", "Rhythmic blade-on-board impacts."],
      ["Preparation", "Slicing", "Smooth gliding cut through food."],
      ["Preparation", "Dicing", "Rapid light chopping into small pieces."],
      ["Preparation", "Stirring", "Circular swishing of utensil through liquid or mixture."],
      ["Preparation", "Whisking", "Rapid beating motion in liquid."],
      ["Preparation", "Grinding or crushing", "Pulverizing solid ingredients."],
      ["Preparation", "Peeling", "Tearing or stripping food skin."],
      ["Preparation", "Grating", "Repetitive scraping against a grater."],
      ["Preparation", "Kneading", "Rhythmic pressing and folding of dough."],
      ["Cooking", "Boiling", "Rapid bubbling of heated liquid."],
      ["Cooking", "Frying", "Crackling and popping of food in hot oil."],
      ["Cooking", "Simmering", "Gentle low bubbling below boiling."],
      ["Cooking", "Steaming", "Soft hiss of water vapor escaping."],
      ["Cooking", "Popping sound", "Sudden bursts from expanding kernels."],
      ["Cooking", "Crackling sound", "Irregular snapping from heat on food surface."],
    ],
  },
  {
    section: "Transportation and vehicle sounds",
    labels: [
      ["Road vehicle", "Vehicle pass-by", "Moving car sound passing a listener."],
      ["Road vehicle", "Road vehicle horn", "Loud warning tone from a vehicle."],
      ["Emergency vehicle", "Siren", "Oscillating warning tone from emergency vehicle."],
      ["Rail", "Track or vehicle rumble", "Low rolling vibration of a train moving."],
      ["Rail", "Rail horn", "Loud low/mid warning horn from train."],
      ["Rail", "Brake screech", "High-pitched rail/brake friction."],
      ["Aircraft", "Aircraft takeoff roar", "High-power aircraft engine and airflow."],
      ["Road vehicle", "Engine revving", "Engine acceleration from motorcycle."],
      ["Bicycle", "Bell sound", "Small bright bell signal from a bicycle."],
      ["Road friction", "Tire squeal", "High-pitched tire friction during sharp turn or braking."],
      ["Aircraft", "Rotor sound", "Periodic blade chopping and engine sound."],
      ["Truck alert", "Reversing beep", "Repetitive warning beep from reversing truck."],
    ],
  },
  {
    section: "Construction and tool sounds",
    labels: [
      ["Hand tool", "Hammering", "Repeated hammer impacts on nail or surface."],
      ["Power tool", "Drilling", "Rotating drill motor and bit contact."],
      ["Power tool", "Sawing", "Cutting material with hand or power saw."],
      ["Surface finishing", "Sanding", "Abrasive smoothing of material."],
      ["Heavy tool", "Jackhammer", "Rapid heavy percussive construction tool."],
      ["Fastener", "Staple gun", "Sharp mechanical impact inserting a staple."],
      ["Small metal", "Small metal objects dropping", "Small metallic objects falling and colliding."],
      ["Ratchet", "Ratcheting sound", "Repeated mechanical clicks from ratchet tool."],
    ],
  },
];

module.exports = { SECTIONS };
