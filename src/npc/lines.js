// What people say. Everything here is plain data, so new areas, topics, people and goods are added by adding entries.
//   - every area has five topics that everybody there knows, and each topic has one answer per temperament
//     (six temperaments x five topics = thirty answers an area)
//   - a few topics are known everywhere: background, rumours, and (for people who run a shop) their trade
//   - a word in [square brackets] in an answer is a topic: it shows as a link and can be asked about
// All names, shops and places are made up.

export const TEMPERS = ['warm', 'gruff', 'gossip', 'nervous', 'proud', 'dreamy'];

export const NAMES = {
  f: ['Mara', 'June', 'Odile', 'Tess', 'Priya', 'Noor', 'Hattie', 'Wren', 'Ines', 'Dot', 'Yuki', 'Farah', 'Lottie', 'Bea', 'Suki', 'Nell', 'Carmen', 'Ada'],
  m: ['Hank', 'Otto', 'Reuben', 'Sal', 'Dev', 'Milo', 'Arlo', 'Gus', 'Kenji', 'Walt', 'Tomas', 'Idris', 'Ned', 'Emil', 'Joon', 'Cyrus', 'Abe', 'Lev'],
  last: ['Pell', 'Okafor', 'Marsh', 'Tanaka', 'Voss', 'Quill', 'Abara', 'Lindqvist', 'Rook', 'Sato', 'Bright', 'Carrow', 'Dunmore', 'Ferro', 'Hale', 'Imai', 'Juno', 'Kessler', 'Lark', 'Moss', 'Nakai', 'Orlov', 'Pike', 'Reyes'],
};
export const JOBS = ['courier', 'student', 'line cook', 'bookkeeper', 'retired machinist', 'night nurse', 'bus driver', 'sign painter', 'clerk', 'window cleaner', 'piano teacher', 'delivery rider', 'locksmith', 'handyman', 'dog walker', 'electrician', 'waiter', 'tram mechanic'];

// how each temperament opens, closes and talks about itself. {name} {job} {area} are filled in.
export const VOICE = {
  warm:    { base: 60, again: ['Hello again! Good to see you.', 'There you are. How have you been?'], cold: "I'd rather not talk to you. I saw what you did.", thanks: "Oh, you shouldn't have. Thank you, truly.", tip: "Between us: the mart on the corner pays for anything, but take your good things to the shop that deals in them. You'll get half as much again.", hello: ['Hello there! Lovely night for a walk.', 'Oh, hello. What can I do for you?'], bye: 'Take care of yourself.', self: "I'm {name}. {Job}, and happy enough with it. I've lived in {area} most of my life.", price: 0.9,
    away: "That's not round here, dear. Ask someone who lives over that way.", no: "I wish I could tell you something about that." },
  gruff:   { base: 40, again: ['You again.', 'Back, are you.'], cold: 'Get lost.', thanks: "Hm. All right. That's decent of you.", tip: "You're all right. Listen: a lamp post gives if you hit it fast enough. A wall doesn't. Remember which is which.", hello: ['Yeah?', 'Make it quick.'], bye: 'Right.', self: "{name}. {Job}. That's all you need.", price: 1.1,
    away: "Wrong part of town. Go and ask them.", no: "Don't know. Don't care." },
  gossip:  { base: 55, again: ['Oh good, it’s you. Sit, sit.', 'I was just talking about you. Nicely!'], cold: "Oh no. No, no. Everyone knows about you now. I made sure.", thanks: "For me? Oh, I'm telling everyone how generous you are.", tip: "Since it's you: the shopkeepers talk to each other. Be good to one and the rest hear of it. Be bad to one...", hello: ['Ooh, a new face! Come here, come here.', "You didn't hear this from me, but hello."], bye: "Come back, I'll have more by tomorrow.", self: "{name}, {job}, and I hear everything that goes on in {area}. Everything.", price: 1.0,
    away: "Oh, that's across town. I only have second-hand news from there, and I never pass on second-hand news. Much.", no: "Nothing on that. Yet." },
  nervous: { base: 45, again: ['Oh. It’s you. That’s all right then.', 'Hello again. You gave me a start.'], cold: 'Please. Just leave me alone.', thanks: "Is this... for me? Nobody gives me things. Thank you.", tip: "I trust you, so: if a car goes over on its roof, don't look for the driver. Run. I've seen it.", hello: ['Oh! You startled me.', 'Yes? Is something wrong?'], bye: 'Mind how you go. Please.', self: "Me? {name}. I'm {a job}. Why do you ask?", price: 1.0,
    away: "I don't go that far. Not after dark.", no: "I'd rather not say. I don't know, I mean." },
  proud:   { base: 45, again: ['Ah. You return.', 'Good evening again.'], cold: 'I do not speak to your sort.', thanks: "Acceptable. More than acceptable. You have manners.", tip: "I shall tell you something I tell few: the tailor in town gives a fair price for good cloth, and a poor one for everything else.", hello: ['Good evening.', 'You may speak.'], bye: 'Good evening to you.', self: "{name}. {Job}, and a good one. People in {area} know my name.", price: 1.15,
    away: "I do not concern myself with other districts.", no: "That is beneath my notice." },
  dreamy:  { base: 55, again: ['Oh, you. I dreamt about you, I think.', 'Hello again. Or is it still the first time?'], cold: 'You feel like bad weather. Go away, please.', thanks: "A present. I'll keep it on the windowsill with the others.", tip: "Here's a thing I noticed: the coffee makes your feet quicker. Try it and walk somewhere.", hello: ['Hm? Oh. Hello.', 'The lamps are nice tonight, aren’t they.'], bye: 'Mm. See you in the morning, maybe.', self: "{name}, I think. {Job}, when I remember to go.", price: 0.95,
    away: "Is that far? Everything feels far.", no: "I had a thought about that once. It's gone." },
};

// (each area also has one more subject, `odd`: the thing nobody quite agrees about. It is asked about like the rest.)
// rumours: known everywhere. Each person has their own two or three out of these.
export const RUMOURS = [
  "Somebody's been tearing round at night in cars that aren't theirs. Three wrecks this week.",
  "They say if a car lands on its roof you've got about six seconds. I'd not wait to count.",
  "The [Lucky 8 Mart] pays for just about anything you bring in. Not much, mind.",
  "Buy cheap on one side of town and sell on the other. That's how the hardware man got his van.",
  "The street lamps flickered all at once last Tuesday. Every one. Nobody will say why.",
  "There's a fellow in a black hood and a beanie who stands by the road in [Midtown] all night. Never moves on.",
  "Old Town Square is still shut to cars. You have to walk in from the west side of [Midtown].",
  "The video shop in [Eastside] gives good money for anything you can read, watch or play.",
  "Tools and clothes fetch more in [Eastside]. Games, books and flowers fetch more in [Midtown]. Don't ask me why.",
  "The noodle place changed cooks again. Third one since spring.",
  "Someone left a kei car in the garage off the main street and never came back. It's grey with dust.",
  "Half these shops keep the stock-room door locked even from their own staff.",
  "There's a door in [Midtown] that's always a little open. I've never seen anyone go in. I've seen people come out.",
  "Don't use the door that's ajar on the east side. It's bigger inside than the building is. I paced it.",
  "Some nights the street just empties. No cars, nobody. Then it fills up again like nothing happened.",
  "There's one who stands with their face to the wall. Don't speak to them. I mean, you can. They answer.",
  "There's a spray booth in one of the back courts. Drive in, and you drive out another colour with the dents gone.",
];

// ---- the areas. topics: [id, label]. answers[topic][temper]
export const AREAS = {
  west: { name: 'Midtown', wants: ['media', 'gift'],
    topics: [['midtown', 'Midtown'], ['aqueduct', 'aqueduct ruins'], ['kiln', 'Kiln & Co.'], ['mural', 'rainbow mural'], ['traffic', 'the traffic']], odd: ['tuesday', 'last Tuesday'],
    answers: {
      tuesday: {
        warm: "Oh, the lamps? They flickered, that's all. A fault at the substation, they said. Though... every one, at once, and then every one back. I made tea and didn't look out again.",
        gruff: "Nothing happened last Tuesday.",
        gossip: "Now. I was up. I saw it. The lamps went, and for as long as they were out there was nobody on the street. Nobody. And when they came back, everybody was a step to the left of where they'd been. Don't tell people I said that.",
        nervous: "I don't talk about Tuesday. I was indoors. I was indoors the whole time. Ask anyone. Don't ask anyone.",
        proud: "A power cut. People in this town will make a ghost story of a blown fuse.",
        dreamy: "Was that Tuesday? I thought it hadn't happened yet.",
      },
      midtown: {
        warm: "It's the middle of everything. Shops under, flats over, and a back court behind nearly every block. You'll find the [aqueduct ruins] and the [rainbow mural] up on the main street.",
        gruff: "Shops. Flats. Noise. Go west on the main street and you hit Old Town Square, go east and it's [Eastside].",
        gossip: "Midtown? Everyone here knows everyone's rent. The potter at [Kiln & Co.] pays the least, and I can tell you why some other time.",
        nervous: "It used to be quiet. Now there's [the traffic]. I keep to the inside of the pavement.",
        proud: "The best address in town. [Eastside] has a temple; we have taste.",
        dreamy: "It's all corners. You turn one and there's a court with a tree in it, and you turn another and it's the same tree." },
      aqueduct: {
        warm: "The old arches on the main street. They made a little garden of them. Sit a while, it's the nicest bench in [Midtown].",
        gruff: "Pile of old stone with a fence round it. Kids climb it.",
        gossip: "They found it when they dug the footings for the pottery. Held the building up two years. The owner of [Kiln & Co.] still won't walk past it.",
        nervous: "I don't like the arches at night. Things echo in there.",
        proud: "The ruins are older than the town. My family gave money for the garden. There should be a plaque.",
        dreamy: "Water used to run along the top of it. Imagine that, a river in the air." },
      kiln: {
        warm: "The pottery on the main street. Lovely people. They'll let you look round even if you buy nothing.",
        gruff: "Cups. Forty dollars a cup. No.",
        gossip: "Kiln & Co. There's no 'Co.' It's one woman and a kiln, and the kiln's on its last legs.",
        nervous: "Everything in there is breakable. I wait outside.",
        proud: "I own several of their pieces. The early ones. Before they were known.",
        dreamy: "I like the bowls nobody buys. The lopsided ones on the bottom shelf." },
      mural: {
        warm: "On the little plaza by the [aqueduct ruins]. The schoolchildren painted the bottom half and you can tell, bless them.",
        gruff: "Paint on a wall.",
        gossip: "The council wanted it grey. The painter did it overnight in every colour she had, and by morning it was too popular to scrub.",
        nervous: "It's very bright. Is it meant to be that bright?",
        proud: "A cheerful thing. Not what I would have chosen, but [Midtown] wears it well.",
        dreamy: "I count the colours when I can't sleep. I always get a different number." },
      traffic: {
        warm: "Mind yourself crossing, love. Most drivers are fine, but lately somebody's been going far too fast.",
        gruff: "Idiots. If one comes at you, get out of the way. They won't stop.",
        gossip: "You know the cars parked along here? Half of them, the keys are just sitting in them. That's how it starts.",
        nervous: "I heard one go over on its roof last week. The fire. I ran. Everybody ran.",
        proud: "I do not drive. One is driven. But I'll grant the coupe on the corner is a handsome machine.",
        dreamy: "The little kei cars are my favourite. They sound like sewing machines." },
    } },
  east: { name: 'Eastside', wants: ['tool', 'clothes'],
    topics: [['eastside', 'Eastside'], ['temple', 'lantern temple'], ['gallery', 'art gallery'], ['arcade', 'Nakamachi Arcade'], ['park', 'pocket park']], odd: ['lanterns', 'the lanterns going out'],
    answers: {
      lanterns: {
        warm: "They never go out, dear. That's the whole point of them. ...Who told you they went out?",
        gruff: "They didn't. Electric now. Can't go out.",
        gossip: "All of them, for the length of a breath, the same night the lamps went in [Midtown]. The keeper says he was at the switch the whole time. He was not at the switch. He was standing in the road looking up.",
        nervous: "If they went out I didn't see it, and if I saw it I've forgotten, and I'd like to go on forgetting.",
        proud: "The temple lanterns have burned without a break since before your grandparents. I will not hear otherwise.",
        dreamy: "They didn't go out. Everything else went out, and the lanterns were what was left. It's different.",
      },
      eastside: {
        warm: "Quieter than [Midtown] and all the better for it. You've the [lantern temple] on the main street and the [pocket park] down the back.",
        gruff: "It's the east side. Things cost less and break more.",
        gossip: "Eastside's where people move when [Midtown] finds out about them. I'm naming nobody.",
        nervous: "It's all right in daylight. At night I go the long way, by the [lantern temple], where it's lit.",
        proud: "People call it the poor side. It has the temple and the [art gallery]. Let them talk.",
        dreamy: "It always smells a bit of rain here, even when there's been none." },
      temple: {
        warm: "Up the stairs on the main street. They light every lantern at dusk. You're welcome to go up, anyone is.",
        gruff: "Stairs. A lot of stairs.",
        gossip: "The lanterns are electric now. The old keeper swore he'd never allow it, and then his knees went.",
        nervous: "I go up when things are bad. Nobody drives fast near the temple. They wouldn't dare.",
        proud: "The finest thing in the town, and it stands in [Eastside]. Remember that.",
        dreamy: "From the top step the street looks like a river with lights floating down it." },
      gallery: {
        warm: "On the main street. One person's paintings, all of it, wall to wall. Go in, it's free.",
        gruff: "Pictures of the same street we're standing in. I can see the street for nothing.",
        gossip: "Nothing in the gallery is for sale. Not one. People have offered silly money.",
        nervous: "I feel watched in there. All those painted windows.",
        proud: "I sat for one of those paintings. Third from the door. A fair likeness.",
        dreamy: "There's one of this street at night, and if you look long enough you find yourself in it." },
      arcade: {
        warm: "The covered passage down by the [pocket park]. Handy when it rains. Mostly shutters these days, I'm sorry to say.",
        gruff: "A corridor with a roof. Half of it's shut.",
        gossip: "Nakamachi Arcade. The landlord's waiting for everyone to give up so he can sell the lot. Two tenants left.",
        nervous: "Sounds carry in the arcade. You hear footsteps and there's nobody.",
        proud: "In my mother's day you dressed up to walk the arcade. Gloves.",
        dreamy: "I like the shut shops best. You can imagine anything behind a shutter." },
      park: {
        warm: "Just a patch of green at the back, by the [Nakamachi Arcade], but there's a bench and it catches the morning sun.",
        gruff: "Grass. A bin. Call that a park.",
        gossip: "The pocket park was meant to be a car park. Somebody on the council lost a bet.",
        nervous: "It's too open. I walk round the outside.",
        proud: "Small, but kept properly. [Midtown] has nothing like it.",
        dreamy: "There's one tree that turns before all the others. I think it's in a hurry." },
    } },
  old: { name: 'Old Town Square', wants: ['food', 'health'],
    topics: [['square', 'Old Town Square'], ['mall', 'underground mall'], ['baralley', 'bar alley'], ['pond', 'lotus pond'], ['station', 'the station']], odd: ['lasttrain', 'the last train'],
    answers: {
      lasttrain: {
        warm: "It left years ago, love. Before the gate was painted. ...No, that's not right, I saw it last week. How odd. I've got both of those in my head at once.",
        gruff: "There's no train.",
        gossip: "It still comes. Not on the rails. You hear it under the [underground mall] about four in the morning, going the wrong way.",
        nervous: "I was meant to be on it. I'm very glad I wasn't. I don't know why I'm glad.",
        proud: "It ran to time for sixty years and it stopped at this station last of all. That is all anyone needs to know.",
        dreamy: "I wait for it. Not to get on. I just want to see who gets off.",
      },
      square: {
        warm: "The oldest paving in town, and still the nicest place to sit. Benches by the white building, lamps all round.",
        gruff: "Square. Benches. Pigeons, when there were pigeons.",
        gossip: "They wanted to put a car park here. The brick warehouse man chained himself to a lamp. Well. Leaned on it, firmly.",
        nervous: "It's on foot only, which I like. Nothing comes at you here.",
        proud: "This was the town before there was a [Midtown]. Everything else is an afterthought.",
        dreamy: "The grey bands in the paving point somewhere. I've followed them. They point at each other." },
      mall: {
        warm: "Down the stair off the forecourt. It's warm in winter and half the units still trade.",
        gruff: "A basement with shops in. Mind the stair, it's wet.",
        gossip: "The [underground mall] floods every spring and every spring they say it won't.",
        nervous: "I don't go down. One way in, one way out.",
        proud: "It was very smart, once. I had a coat made down there.",
        dreamy: "It hums. The whole place hums one note. I think it's the lights." },
      baralley: {
        warm: "Tiny bars, six stools each, and a teahouse at the end if you'd rather. Go on through.",
        gruff: "Where the drinking's done. Loud till two.",
        gossip: "The Knot Room's owner hasn't spoken to the teahouse in eleven years. They share a wall.",
        nervous: "Too narrow. If someone's coming the other way you both have to breathe in.",
        proud: "I don't frequent the [bar alley]. I have been carried through it.",
        dreamy: "All the signs are a different red. I like to stand where they overlap." },
      pond: {
        warm: "Along the path past the station gate. The lotuses close up at night, come back in the morning.",
        gruff: "A pond. With plants in.",
        gossip: "Somebody's been feeding the fish noodles from the shop. The fish are enormous now.",
        nervous: "No railing. I stay on the path.",
        proud: "The [lotus pond] predates the station, the street and the town. It was here first.",
        dreamy: "If you watch long enough one flower opens while you're not looking at it." },
      station: {
        warm: "Through the big gate at the end of the shopping street. No trains tonight, but the gate's worth seeing.",
        gruff: "Gate's there. Trains aren't.",
        gossip: "The last train left with the stationmaster's hat on the platform. He's still cross.",
        nervous: "Stations make me think of leaving. I don't like to think of leaving.",
        proud: "Everyone who ever arrived in this town arrived through that gate.",
        dreamy: "I wait there sometimes. Not for a train. Just to be somebody waiting." },
    } },
  south: { name: 'Old Town South', wants: ['tool', 'food'],
    topics: [['lot', 'the lot'], ['tires', 'tire shop'], ['restaurant', 'the restaurant'], ['grocery', 'the grocery'], ['shrines', 'roadside shrines']], odd: ['argument', 'the night of the argument'],
    answers: {
      argument: {
        warm: "At [the restaurant]? Raised voices, a plate or two. Every kitchen has a night like that. They'll open again. They will.",
        gruff: "Wasn't an argument. Only one of them was talking.",
        gossip: "I'll tell you what I heard through the wall. One voice. Arguing, pausing, answering, like a telephone call. There's no telephone in that kitchen.",
        nervous: "The lights went off in there and nobody came out. I counted. Nobody came out. I've stopped counting now.",
        proud: "A disagreement among staff. Hardly the first. It is vulgar to keep on about it.",
        dreamy: "The soup was still warm in the morning. Three days running. That's what I think about.",
      },
      lot: {
        warm: "Just a cracked old car park, but everything round here faces onto it, so it's where you meet people.",
        gruff: "Concrete. Weeds. A storefront nobody's opened in years.",
        gossip: "The boarded-up place across [the lot]? The owner still pays the rates. Nobody knows why.",
        nervous: "It's very open. I walk the edge, under the lamp.",
        proud: "It wants resurfacing. I've written. Twice.",
        dreamy: "The cracks make a map of somewhere. I'm still working out where." },
      tires: {
        warm: "North-east corner of [the lot]. Honest work, fair price, and he'll pump your tyres for nothing.",
        gruff: "Tyres. He sells tyres. There's a dead van out the back.",
        gossip: "That van behind the [tire shop] was meant to be a weekend job. That was six years of weekends ago.",
        nervous: "The garage doors come up by themselves when you walk near. I jumped a foot.",
        proud: "He fitted the wheels on a car of mine. I mention it because he does.",
        dreamy: "It smells of rubber and rain in there even when it's dry." },
      restaurant: {
        warm: "The brick place in the middle of everything. Shut just now, I'm sorry to say. The soup was famous.",
        gruff: "Shut.",
        gossip: "[the restaurant] is shut 'for redecoration'. It's been redecorating since the night of the argument.",
        nervous: "The lights are off. I don't like a building with its lights off.",
        proud: "I had a regular table. It will be waiting when they reopen.",
        dreamy: "I still stand by the door at seven. Habit's a kind of loyalty." },
      grocery: {
        warm: "Down the east side. The doors slide open for you, and the dairy case is the coldest thing in town.",
        gruff: "Food shop. Doors stick.",
        gossip: "They found a whole cheese in the stockroom of [the grocery] that nobody ordered. It's been promoted to assistant manager.",
        nervous: "The doors open before I've decided to go in.",
        proud: "Adequate. The fruit is adequate.",
        dreamy: "I go in for the hum of the cooler and come out with milk I didn't need." },
      shrines: {
        warm: "Little ones, by the road. People leave a coin or a flower going past. It costs nothing to nod.",
        gruff: "Stone boxes with candles in. Leave them be.",
        gossip: "Somebody leaves a tin of tuna at the middle shrine every Friday. For the cats, they say. The cats say nothing.",
        nervous: "I always nod. Just in case.",
        proud: "My grandmother kept the first of the [roadside shrines]. The others came after.",
        dreamy: "The candles are never lit and never out. I can't explain that better." },
    } },
};
// a topic label -> [area id, topic id], for links and for "that's not round here"
export const TOPIC_INDEX = (() => { const m = new Map(); for (const [aid, a] of Object.entries(AREAS)) for (const [id, label] of [...a.topics, ...(a.odd ? [a.odd] : [])]) m.set(label.toLowerCase(), [aid, id, label]); return m; })();

// ---- goods. [name, price, category]
// shops are indexed as the district's shopfront list (src/models/district.js SHOPS)
export const SHOP_KINDS = [
  { title: 'noodle cook', buys: ['food'], line: "Noodles, dumplings, tea. Made tonight. Eat it hot.", goods: [['Bowl of noodles', 8, 'food'], ['Dumplings', 6, 'food'], ['Bottle of tea', 3, 'food']] },
  { title: 'café owner', buys: ['food', 'gift'], line: "Coffee's fresh, the pastry's from this morning. I'll not lie to you about the pastry.", goods: [['Coffee', 4, 'food'], ['Pastry', 5, 'food'], ['Bag of coffee beans', 12, 'gift']] },
  { title: 'laundry attendant', buys: ['clothes'], line: "Wash, dry, fold. I sell the odd shirt nobody came back for.", goods: [['Clean shirt', 9, 'clothes'], ['Soap powder', 4, 'home']] },
  { title: 'hardware dealer', buys: ['tool', 'home'], line: "If it turns, cuts or holds two things together, I've got it.", goods: [['Hammer', 14, 'tool'], ['Flashlight', 11, 'tool'], ['Duct tape', 5, 'tool'], ['Jerry can', 18, 'tool']] },
  { title: 'shopkeeper', buys: ['any'], line: "Bit of everything. And I'll take most things off your hands, for a price.", goods: [['Soda', 2, 'food'], ['Snack bar', 2, 'food'], ['Lottery ticket', 5, 'gift'], ['Umbrella', 9, 'clothes']] },
  { title: 'game shop clerk', buys: ['media'], line: "New stuff's on the wall, old stuff's in the bin by the door. The bin's better.", goods: [['Game cartridge', 25, 'media'], ['Controller', 20, 'media'], ['Game magazine', 6, 'media']] },
  { title: 'florist', buys: ['gift'], line: "Cut this afternoon. They'll last the week if you talk to them.", goods: [['Bouquet', 12, 'gift'], ['Potted fern', 10, 'gift'], ['Packet of seeds', 3, 'gift']] },
  { title: 'barber', buys: ['health'], line: "I cut hair. I also sell what I put in it.", goods: [['Hair tonic', 8, 'health'], ['Comb', 3, 'health']] },
  { title: 'pharmacist', buys: ['health'], line: "Nothing stronger than what's on the shelf, before you ask.", goods: [['Bandages', 6, 'health'], ['Painkillers', 9, 'health'], ['Vitamins', 7, 'health']] },
  { title: 'bookseller', buys: ['media'], line: "Paperbacks at the front. The good ones I keep at the back, so people have to ask.", goods: [['Paperback', 7, 'media'], ['Town map', 5, 'media'], ['Notebook', 4, 'media']] },
  { title: 'restaurant owner', buys: ['food'], line: "Hot pot for the table, rice wine for after. Sit, or take it with you.", goods: [['Hot pot', 15, 'food'], ['Rice wine', 13, 'food']] },
  { title: 'tailor', buys: ['clothes'], line: "Off the peg today. Made to measure takes a fortnight and I don't rush.", goods: [['Scarf', 14, 'clothes'], ['Jacket', 45, 'clothes'], ['Sewing kit', 6, 'tool']] },
  { title: 'diner cook', buys: ['food'], line: "Open all night. Burger, pie, shake. That's the menu.", goods: [['Burger', 7, 'food'], ['Slice of pie', 4, 'food'], ['Milkshake', 5, 'food']] },
  { title: 'butcher', buys: ['food'], line: "Cut to order. Tell me how thick.", goods: [['Sausages', 8, 'food'], ['Steak', 16, 'food']] },
  { title: 'video shop clerk', buys: ['media'], line: "Rentals are due back by midnight. Nobody brings them back by midnight.", goods: [['Video tape', 6, 'media'], ['Blank tape', 3, 'media'], ['Popcorn', 3, 'food']] },
];
// the hand-built places: their keepers are written people (CHARACTERS below) with a counter of their own
export const PLACES = {
  kiln: { title: 'potter', buys: ['gift', 'home'], line: "Everything here came out of the one kiln. The glaze never does the same thing twice, which is the point.", goods: [['Tea bowl', 22, 'gift'], ['Small vase', 30, 'gift'], ['Lopsided bowl', 6, 'gift']] },
  izakaya: { title: 'izakaya host', buys: ['food'], line: "Skewers off the grill, something cold to go with them. No menu. You get what's good.", goods: [['Grilled skewers', 9, 'food'], ['Pickles', 4, 'food'], ['Cold barley tea', 3, 'food']] },
  gallery: { title: 'gallery attendant', buys: [], line: "The paintings aren't for sale. I'm allowed to sell the postcards.", goods: [['Postcard of the street', 3, 'media'], ['Exhibition booklet', 8, 'media']] },
  market: { title: 'checkout clerk', buys: ['food', 'home'], line: "Bread, milk, tins, ice. Whatever the shelves say we have. The shelves and the scanner don't always agree.", goods: [['Loaf of bread', 3, 'food'], ['Carton of milk', 3, 'food'], ['Tin of soup', 2, 'food'], ['Energy drink', 4, 'food'], ['Bag of ice', 4, 'home']] },
  temple: { title: 'temple keeper', buys: [], line: "A charm for the road, a fortune for the year. The lanterns are free.", goods: [['Road-safety charm', 10, 'gift'], ['Paper fortune', 2, 'gift']] },
};
// things only found, not sold (starting kit and, later, things picked up in the world)
export const EXTRA_ITEMS = [['Pocket radio', 18, 'media']];
// what a thing does when you use it from your bag: 'brisk' (walk faster for a while), 'mend' (patch up the car beside you),
// 'luck' (a ticket: scratch it), 'wear' (put it on / take it off), 'torch', 'map', 'radio' (switch on and off; kept).
// Anything that is food and has no other use is eaten ('eat'). Everything can be given as a gift.
export const WEAR = { 'Clean shirt': 'shirt', 'Jacket': 'coat', 'Scarf': 'neck', 'Umbrella': 'hand' };   // (what goes where: one thing in each place)
// what people make of what you have on: `like` moves what they think of you while you wear it; `says` is the remark
// they make the first time they see you in it
export const DRESS = {
  'Clean shirt': { on: 'You put on the clean shirt.', off: 'You take the shirt off.', like: { warm: 3, gruff: 2, gossip: 3, nervous: 2, proud: 4, dreamy: 1 },
    says: { warm: "A clean shirt. Somebody's looking after themselves.", gruff: "Shirt's clean. Makes a change round here.", gossip: "Ooh, pressed. Who's it for?", nervous: "You look... official. Are you official?", proud: "A clean collar. Good. Standards.", dreamy: "White. You'll show up in the dark, you know." } },
  'Jacket': { on: 'You put on the jacket.', off: 'You take the jacket off.', like: { warm: 3, gruff: 2, gossip: 4, nervous: -1, proud: 8, dreamy: 0 },
    says: { warm: "That's a good jacket. Keeps the night off.", gruff: "Tailor's work. Cost you, I'll bet.", gossip: "That's off the tailor's rail, isn't it. I know exactly what you paid. Or didn't.", nervous: "A dark jacket. People in dark jackets came round asking, once. Not you. Was it you?", proud: "Now that is a proper jacket. I can talk to a person in a proper jacket.", dreamy: "It had someone else's shape in it before yours. Can you feel that?" } },
  'Scarf': { on: 'You wind the scarf round your neck.', off: 'You take the scarf off.', like: { warm: 4, gruff: 0, gossip: 2, nervous: 0, proud: 2, dreamy: 4 },
    says: { warm: "Lovely scarf. My mother knitted one that colour.", gruff: "Scarf. It's not that cold.", gossip: "A red scarf! You'll be seen coming from three streets off.", nervous: "Don't let the ends hang. Things catch.", proud: "A little colour at the neck. Acceptable.", dreamy: "I had that scarf. Or I will. It's the same scarf." } },
  'Umbrella': { on: 'You put the umbrella up.', off: 'You fold the umbrella.', like: { warm: 0, gruff: -3, gossip: 3, nervous: -4, proud: -5, dreamy: 7 },
    says: { warm: "It's not raining, dear. ...Is it? You'd know better than me.", gruff: "Put that thing down. It's dry.", gossip: "An umbrella, up, on a dry night. Oh, I am going to enjoy telling people.", nervous: "Why is it up? What do you know? What's coming down?", proud: "You look ridiculous.", dreamy: "Good. You've noticed it too. Most people don't bother keeping it off." } },
};
export const USES = { 'Coffee': 'brisk', 'Soda': 'brisk', 'Milkshake': 'brisk', 'Bottle of tea': 'brisk', 'Cold barley tea': 'brisk', 'Duct tape': 'mend', 'Hammer': 'mend', 'Lottery ticket': 'luck', 'Energy drink': 'brisk',
  'Clean shirt': 'wear', 'Jacket': 'wear', 'Scarf': 'wear', 'Umbrella': 'wear', 'Flashlight': 'torch', 'Town map': 'map', 'Pocket radio': 'radio',
 };
// (parked with the health bar: 'heal' for Bandages / Painkillers / Vitamins)
export const ITEM = (() => { const m = new Map(); for (const k of [...SHOP_KINDS, ...Object.values(PLACES)]) for (const g of k.goods) m.set(g[0], { price: g[1], cat: g[2] }); for (const g of EXTRA_ITEMS) m.set(g[0], { price: g[1], cat: g[2] }); return m; })();

// ---- people with a part of their own. `answers` override the area's; `topics` are extra topics only they have.
export const CHARACTERS = {
  potter: { name: 'Ines Carrow', title: 'potter, Kiln & Co.', temper: 'dreamy', sex: 'f', place: 'kiln', hello: ['Mind the bottom shelf. Those are my favourites.'],
    self: "Ines. I'm the 'Kiln' and the '& Co.' both. I throw in the morning and fire at night, which is why I look like this.",
    answers: { kiln: "That's me, and that's it behind me. People say it's on its last legs. It has been on its last legs for nine years.", aqueduct: "They found it under my floor. I didn't mind. The arches and the kiln are the same shape, if you look." } },
  host: { name: 'Kenji Sato', title: 'host of the old izakaya', temper: 'warm', sex: 'm', place: 'izakaya', hello: ['Welcome, welcome. Cold out, warm in.'],
    self: "Kenji. My grandfather hung that lantern. I just keep it lit and keep the grill going.",
    answers: { midtown: "I've watched this street from this door for thirty years. It gets louder and I get deafer, so it evens out." } },
  attendant: { name: 'Farah Quill', title: 'gallery attendant', temper: 'proud', sex: 'f', place: 'gallery', hello: ['Please do not touch the paintings.'],
    self: "Farah Quill. I look after the collection. The painter doesn't come in; I do, every day.",
    answers: { gallery: "Every picture here is by the one hand, and every one is of this town. Nothing is for sale. I have turned down sums that would embarrass you." } },
  keeper: { name: 'Abe Imai', title: 'temple keeper', temper: 'gruff', sex: 'm', place: 'temple', hello: ['Stairs are behind me. Take your time on them.'],
    self: "Abe. I keep the lanterns. Kept them with oil for forty years, and now it's a switch. My knees chose the switch.",
    answers: { temple: "Go up if you like. Anyone can. Leave the noise down here.", traffic: "Nobody drives fast past the temple. Not twice." } },
  clerk: { name: 'Dell Marsh', title: 'checkout clerk, Freshway Market', temper: 'nervous', sex: 'f', place: 'market', hello: ['Oh. A customer. Sorry, I was counting.'],
    self: "Dell. I do the till and the shelf checks. Mostly nights. There's supposed to be two of us on nights.",
    topics: [['scanner', 'the scanner'], ['stockroom', 'the stock room']],
    answers: { scanner: "It says an item no longer exists. I'm holding the item. So I count it, and it says I should have fourteen, and I have six. I've counted four times. It's always six. It was six yesterday as well, and I sold two.", stockroom: "Through the curtain, past the cooler. The pallets come in wrapped. I've never seen the lorry. I come in and they're there, and the wrap is still warm." } },
  hank: { name: 'Hank', title: 'keeps an eye on the street', temper: 'gruff', hello: ["Evening. You're new."],
    self: "Hank. I look after the kei garage round the corner. Mostly I stand here and watch who drives what.",
    topics: [['garage', 'kei garage']],
    answers: { garage: "Round the corner. There's a kei car in there under an inch of dust. Owner never came back. Starts first time, though. Take it if you want, nobody else will.",
      traffic: "I see all of it from here. If one goes on its roof, you leave it and you run. It won't be turned back over and it won't wait." } },
};
