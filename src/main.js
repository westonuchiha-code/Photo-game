// A whole restaurant assembled only from things in the four photos:
// bar counter + yellow stools, lime booths + terrazzo tables, pink slat chairs,
// triangle-tile entrance with bronze glass doors and mat, the neon OPEN sign,
// teal window trim, subway tile and lime walls, globe pendants, LED strips,
// napkin dispensers, the framed poster, the slatted fence and wall globes outside.
import * as THREE from 'three';
import { makeStreamer, mergeStatic } from './stream.js';
import { autoNormals } from './normals.js';
import { applyFinishes } from './finishes.js';
import { makeQuality } from './quality.js';
import { makeInteriors } from './interiors.js';
import { afterStart } from './defer.js';
import { makeCar, LIVERIES, carEnv } from './vehicle/carbody.js';
import { makeDriver } from './drive.js';
import { finishLoading } from './loading.js';
import { shrinkCanvases } from './texcache.js';
import { makeTrail } from './models/trail40.js';
import { makeMossCreature, makeMossMound } from './models/creature55.js';
import { makeThriftCorner } from './models/fabrics56.js';
import { makeDistrict, GRID } from './models/district.js';
import { placeStreetServices, makeATM } from './models/street92.js';
import { instanceGroup } from './models/kit.js';
import { makeRoads } from './models/roads.js';
import { makeCommunityGarden } from './models/garden87.js';
import { placeHouses } from './models/house94.js';
import { makeWorks } from './models/factory95.js';
import { makeFurnitureShowroom } from './models/furniture88.js';
import { makeKitchenBathShowroom } from './models/kitchen89.js';
import { makeOfficeShowroom } from './models/office90.js';
import { makeDentistOffice } from './models/dentist57.js';
import { makeTreatmentWing } from './models/treatment58.js';
import { makeUtilityLot } from './models/utility59.js';
import { makeStorageRow } from './models/storage62.js';
import { makeCornerStore, makeAircraftCarport } from './models/random64.js';
import { makeCafeFrontage } from './models/signs65.js';
import { makeCanalPark } from './models/misc67.js';
import { makeArtGallery } from './models/inspo68.js';
import { makeWarehouseStore } from './models/inspo69.js';
import { makeWetFloorFolded, makeConcreteBollard } from './models/batch85.js';
import { makeFireHydrant as makeDryHydrant, makeWallPack, makeSteelDoor, makeWornBollard } from './models/batch84.js';
import { makeUtilityCorner } from './models/batch83.js';
import { makeYellowFreeBox, makeMessageTrailer, makeTakeoutShop } from './models/batch80.js';
import { makeFreePaperCorner } from './models/batch79.js';
import { makeBrickPillar, makeParkGateway } from './models/batch78.js';
import { makeHearthMarket } from './models/batch77.js';
import { makeKeiGarage } from './models/batch76.js';
import { makeMallPassage } from './models/batch75.js';
import { makeQueueCard, makeEnergyCan74, makeAppAdPost, makeStickerPole, makeStickerPillar } from './models/batch74.js';
import { makeOldTownRow, makePocketPark } from './models/batch73.js';
import { makeArcade, makeShutterShop as makeShutterStall, makeStreetDrum, makeTempleFront, makeFairground, makeCairn } from './models/inspo72.js';
import { makeBackroomCorner, makeGameShelf, makeBinShelf, makePinkHouse } from './models/inspo71.js';
import { makeAqueductGarden, makeIzakaya, makePotteryGallery, makeBarrelPlanter, makeCurvedBench, makeWifiStand, makeWeepingMaple, makePizzaAFrame, makeComicVending, makeStickerPost, makeMural as makeRainbowMural } from './models/inspo70.js';
import { makeGunShop } from './models/gunshop41.js';
import { makePosterCase } from './models/posters42.js';
import { makeSchoolBus } from './models/bus44.js';
import { makeStickerBox, makeMoldySign } from './models/graffiti45.js';
import { makeBurlKiosk } from './models/burl46.js';
import { makeDriedRose, makePropPistol, makeWhitePC } from './models/misc48.js';
import { makeFoldingEbike, makeWaveRack, makePourGrid } from './models/misc49.js';
import { makeCompactCorner } from './models/badparker50.js';
import { makeCartCorral } from './models/cart51.js';
import { makeRealtyWindow } from './models/listings52.js';
import { makeRobotVending, makePlainVending } from './models/robotvend53.js';
import { makeCleanBot } from './models/cleanbot54.js';
import { makeCoachBus, makeCommuterTrain, makeTrainPlatform, PLAT_Y, makeVintageScooter, makeRustedScooter } from './models/vehicles36.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { makeMaterials } from './materials.js';
import { makeStool, makePinkChair } from './models/stool.js';
import { makeCounter } from './models/counter.js';
import { makeBooth, makeTerrazzoTable } from './models/booth.js';
import { makeInfinityBox } from './models/neon.js';
import { makeDoubleDoor, makeWindowBay, makeDoorMat } from './models/entrance.js';
import { makeNapkinDispenser, makePoster, makeOpenPlaque, makeWallGlobe, makeCanvas, makeMural, makeSoupPot } from './models/props.js';
import { makeLiquorSign, makeTwoRiversSign } from './models/signs.js';
import { makeAbandonedBuilding, makeStreetLamp, makeFireHydrant } from './models/abandoned.js';
import { plane } from './world/util.js';
import { makeTireShop } from './models/tireshop.js';
import { makeRustyPole, makeWalkSignalPole } from './models/street.js';
import { makeStreetBuilding } from './models/buildings.js';
import { makePaverSidewalk, makeDrainCover, makePaverCrosswalk, makeTactilePlate, makeCracks, makeUtilityLid, makeTrafficIsland, makeDirtLot } from './models/streetground.js';
import { makeSky } from './models/sky.js';
import { makeGrocery } from './models/grocery.js';
import { makePatrolCart, makePatrolScooter } from './models/police.js';
import { makeCreep } from './models/creep.js';
import { makeScooter, makeBattery } from './models/scooter.js';
import { makePizza, makeRamenTray, makeSpaghettiTray, makeCurryPlate, makeWaffleSandwich, makeCerealPuffCup, makeClearSoda, makeDarkSodaCan, makeCupNoodles } from './models/food.js';
import { makeAlienFormation } from './models/alien.js';
import { makeApartment } from './models/apartment.js';
import { makeNewsBox, makeParkingSignBlock, makeParkingRamp, makeTealStorefront, makeRabbitSculpture } from './models/locations.js';
import { makeSpruce, makeCherry, makePaleTree, makeOak, makeTreePit, makeMulchBed, makeDoorTree } from './models/trees.js';
import { makeRockBed, makeGrassTufts, makeCurbWithLeaves, makeLooseLeaves, makeBikeRack } from './models/ground.js';
import { makeStatueShrine, makeStoneShrine } from './models/shrines.js';
import { makeTireWheel } from './models/wheel.js';
import { makeHouse } from './models/houses.js';
import { makeBlueHouse } from './models/bluehouse.js';
import { makeStationGate, makeLotusPond, makeRockDoor } from './models/city28e.js';
import { makeCargoTrike, makeArcadeCabinet, makeGraffitiFront } from './models/street28d.js';
import { makeShutterShop, makeVendingMachine, makeJunkShop } from './models/shops28c.js';
import { makeShopHouse, makeStreetLamp as makeOldTownLamp, makeBollard, makeMonkey, makeBanner, makeGreenPillar } from './models/oldtown.js';
import { makeBrickGable, makeSpiral, makeOvalBuilding, makePebbleBench, makeOrnateLamp, makePlanter, makePaverTexture, makeGreyBandTexture } from './models/cityplaza.js';
import { makePlywoodSheet, makeGlassShards, makePasteWall, makePickupZone } from './models/misc27e.js';
import { makeDumpTruck, makePipeBarrier, makeSiteSign, makeWeeds } from './models/dumpsite.js';
import { makeDeliveryBag, makeCupCarrier, makePaperBag } from './models/delivery.js';
import { makeUndergroundMall } from './models/mall28f.js';
import { makeStairEntrance } from './models/stairs28g.js';
import { makeMarketAlley } from './models/alley28h.js';
import { makeBarAlley } from './models/baralley28i.js';
import { makeAbandonedOffice } from './models/abandoned29.js';
import { makeKetchupBottle } from './models/ketchup32.js';
import { makeTunaCan } from './models/tuna34.js';
import { makeKnotRoom } from './models/knotroom30.js';
import { makeCornDog, makePorkBun, makeMelonBread, makeKatsuCurry, makeCheeseSticks, makeYogurtDrink, makeEnergyCan, makeUmeSour, makeCocoCan, makeCandyPack, makePizzaDisplay, makeNoodleShop } from './models/food16.js';
import { WalkControls } from './walk.js';
import { fontsReady, F, fitText } from './fonts.js';
await fontsReady;   // sign fonts must be loaded before any canvas sign is drawn

// ------------------------------------------------------------------ renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, precision: 'highp', powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, matchMedia('(pointer: coarse)').matches ? 1.5 : 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.85;
document.getElementById('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#0b1018');
// night haze: far streets, towers and hills fade into the horizon instead of ending at a hard edge
scene.fog = new THREE.Fog('#20232c', 120, 900);   // (tightened for streaming: far things fade before they cull)
const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 3200);   // (near 0.1: twice the depth precision of 0.05, for the many stacked ground layers)
const mats = makeMaterials();

// ------------------------------------------------------------------ shell
// 16 m x 10 m dining room. North = window wall (bar counters), east = storefront
// (doors + neon sign), west = subway tile (booths), south = lime green wall.
const X0 = -8, X1 = 8, Z0 = -5, Z1 = 5, H = 3.2;
const room = new THREE.Group();
room.name = 'restaurant';
scene.add(room);
const add = (o) => { room.add(o); return o; };

// Floors (each texture repeats at its real-world size).
add(plane(mats.floorWood(1, 1), X0, X1, Z0, Z1, 0, 1.6));                 // bar photo laminate
add(plane(mats.floorWalnut(1, 1), X0, X0 + 2.7, Z0, Z1, 0.001, 0.76, 1.52)); // booth photo walnut
add(plane(mats.floorVinyl(1, 1), -7.1, 4.3, Z0, Z0 + 1.8, 0.002, 0.6));    // bar photo green band
add(plane(mats.floorTriangle(1, 1), 5.4, X1, -3.6, 1.0, 0.002, 0.6, 0.75)); // entrance photo tiles

function wallPanel(mat, w, h, x, y, z, ry) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(x, y, z);
  m.rotation.y = ry;
  m.receiveShadow = true;
  return add(m);
}
function tilePanel(w, h, x, y, z, ry) {
  // subway_tile.png covers 0.3 m x 0.3 m (2 x 4 tiles of 150 x 75 mm)
  const geo = new THREE.PlaneGeometry(w, h);
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / 0.3, uv.getY(i) * h / 0.3);
  const m = new THREE.Mesh(geo, mats.subwayTile(1, 1));
  m.material.side = THREE.DoubleSide;
  m.position.set(x, y, z);
  m.rotation.y = ry;
  m.receiveShadow = true;
  return add(m);
}
// Walls seen from both sides now that you can walk outside.
mats.wall.side = THREE.DoubleSide;
// West: white subway tile.
tilePanel(Z1 - Z0, H, X0, H / 2, 0, Math.PI / 2);
// South: lime green paint + black baseboard.
wallPanel(mats.limeWall, X1 - X0, H, 0, H / 2, Z1, Math.PI);
const baseboard = new THREE.Mesh(new THREE.BoxGeometry(X1 - X0, 0.14, 0.02), mats.post);
baseboard.position.set(0, 0.07, Z1 - 0.01);
add(baseboard);
// East: tile piers around the storefront openings.
const DOOR_Z = -1.3;
tilePanel(0.67, H, X1, H / 2, 0.065, -Math.PI / 2);
tilePanel(1.6, H, X1, H / 2, 4.2, -Math.PI / 2);
wallPanel(mats.wall, 2.06, H - 2.35, X1, 2.35 + (H - 2.35) / 2, DOOR_Z, -Math.PI / 2);

// Ceiling + LED strips (the long linear lights reflected in the bar photo).
const ceil = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, Z1 - Z0), mats.ceiling);
ceil.rotation.x = Math.PI / 2;
ceil.position.y = H;
add(ceil);
const stripMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.75, 1.8), toneMapped: false });
for (const z of [-3.6, -1.2, 1.2, 3.6]) {
  const s = new THREE.Mesh(new THREE.BoxGeometry(11, 0.03, 0.06), stripMat);
  s.position.set(-0.5, H - 0.02, z);
  add(s);
}

// Windows: teal-framed bays along the north (bar photo), bronze storefront on
// the east with the double doors (entrance photo).
for (let i = 0; i < 8; i++) {
  const w = makeWindowBay(mats, { w: 2.0, h: H, transom: 2.45, frame: mats.teal });
  w.position.set(X0 + 1 + i * 2, 0, Z0);
  add(w);
}
const eastWinN = makeWindowBay(mats, { w: 2.6, h: H, transom: 2.45 });
eastWinN.position.set(X1, 0, -3.65);
eastWinN.rotation.y = -Math.PI / 2;
add(eastWinN);
const eastWinS = makeWindowBay(mats, { w: 3.0, h: H, transom: 2.45 });
eastWinS.position.set(X1, 0, 1.9);
eastWinS.rotation.y = -Math.PI / 2;
add(eastWinS);
const door = makeDoubleDoor(mats, { w: 1.9, h: 2.25 });
door.position.set(X1, 0, DOOR_Z);
door.rotation.y = -Math.PI / 2;
add(door);
const plaque = makeOpenPlaque(mats);
plaque.position.set(X1 - 0.02, 2.75, DOOR_Z);
plaque.rotation.y = -Math.PI / 2;
add(plaque);

// ------------------------------------------------------------------ outside (night)
const outside = new THREE.Group();
// Ground plane in 4 pieces around the parking-ramp opening (x 13..17, z -23..-9).
// (polish: the old town's base ground is worn asphalt from the street photo, not a flat dark colour)
const pavementTex = new THREE.TextureLoader().load('assets/textures/city_asphalt.png'); pavementTex.colorSpace = THREE.SRGBColorSpace; pavementTex.wrapS = pavementTex.wrapT = THREE.RepeatWrapping; pavementTex.anisotropy = 8;
const pavementMat = new THREE.MeshStandardMaterial({ map: pavementTex, color: '#c4c6c8', roughness: 0.92 });
pavementMat.polygonOffset = true; pavementMat.polygonOffsetFactor = 2; pavementMat.polygonOffsetUnits = 16;   // (always loses depth ties to the floors, walks and roads laid a few mm above it)
pavementMat.color.setRGB(1.5, 1.5, 1.56);   // (the asphalt photo is dark: lifted so unlit stretches of street still read as a surface at night)
const pavement = new THREE.Group();
// (the Elmwood footprint, world x 52..62 z -8..6, is left open so its garden-level floor isn't capped)
// (and the underground-mall stair well, world x 0.2..3.8 z 50.9..58.7)
for (const [a, b, c, d] of [[-80, 0.2, -120, 80], [3.8, 13, -120, 80], [0.2, 3.8, -120, 50.9], [0.2, 3.8, 58.7, 80], [17, 52, -120, 80], [62, 120, -120, 80], [52, 62, -120, -8], [52, 62, 6, 80], [13, 17, -120, -23], [13, 17, -9, 80]]) {
  const pg = new THREE.PlaneGeometry(b - a, d - c); { const uv = pg.attributes.uv, pp = pg.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (pp.getX(i) + (a + b) / 2) / 3, (pp.getY(i) - (c + d) / 2) / 3); }   // world-scale tiling (3 m)
  const m = new THREE.Mesh(pg, pavementMat);
  m.rotation.x = -Math.PI / 2;
  m.position.set((a + b) / 2, 0, (c + d) / 2);
  m.receiveShadow = true;
  pavement.add(m);
}
pavement.position.set(0, -0.01, 0);
outside.add(pavement);
// Night sky with the photographed clouds and the half moon (sky + moon photos).
const sky = makeSky();
scene.add(sky);
// Moonlight: a cool, faint key light from the moon's direction.
const moonLight = new THREE.DirectionalLight('#b9c6dd', 0.35);
moonLight.position.copy(sky.userData.moonDir).multiplyScalar(50);
scene.add(moonLight);
// Vertical slatted fence seen through the bar window (bar photo).
const slatGeo = new THREE.BoxGeometry(0.06, 2.4, 0.03);
const slatMat = new THREE.MeshStandardMaterial({ color: '#4b4741', roughness: 0.8 });
const nSlats = 180;
const fence = new THREE.InstancedMesh(slatGeo, slatMat, nSlats);
const m4 = new THREE.Matrix4();
for (let i = 0; i < nSlats; i++) {
  m4.makeTranslation(-9 + i * 0.1, 1.2, Z0 - 2.6);
  fence.setMatrixAt(i, m4);
}
outside.add(fence);
// Wall globe lights on outside posts (neon photo).
for (const x of [-6, -2, 2, 6]) {
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.2, 0.3), mats.post);
  post.position.set(x, 1.6, Z0 - 1.2);
  outside.add(post);
  const lamp = makeWallGlobe(mats);
  lamp.position.set(x, 2.1, Z0 - 1.05);
  outside.add(lamp);
}
for (const z of [0.07, 4.2]) { // in line with the tile piers, clear of the windows
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.2, 0.3), mats.post);
  post.position.set(X1 + 1.2, 1.6, z);
  outside.add(post);
  const lamp = makeWallGlobe(mats);
  lamp.position.set(X1 + 1.05, 2.1, z);
  lamp.rotation.y = -Math.PI / 2;
  outside.add(lamp);
}
const farLights = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 8, 6),
  new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.2, 1.2), toneMapped: false }), 40);
for (let i = 0; i < 40; i++) {
  const a = Math.random(), y = 0.6 + Math.random() * 3;
  m4.makeTranslation(...(i < 22 ? [-30 + a * 100, y, -69.8] : [74.8, y, -70 + a * 90]));
  farLights.setMatrixAt(i, m4);
}
outside.add(farLights);
scene.add(outside);

// ------------------------------------------------------------------ lights
scene.add(new THREE.HemisphereLight('#dfe6f0', '#5e544a', 0.55));
const key = new THREE.DirectionalLight('#fff6ea', 1.2);
key.position.set(1.5, 8, 2);
key.target.position.set(0, 0, 0);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, { left: -9, right: 9, top: 6, bottom: -6, near: 0.5, far: 18 });
key.shadow.bias = -0.0004;
key.shadow.normalBias = 0.02;
scene.add(key, key.target);
for (const [x, z] of [[-5, -2.5], [0, -2.5], [5, -2.5], [-5, 2.5], [0, 2.5], [5, 2.5]]) {
  const p = new THREE.PointLight('#eef7ff', 2.2, 7, 2);
  p.position.set(x, H - 0.3, z);
  scene.add(p);
}

// Globe pendants (half black shade + white globe, bar + neon photos).
function makePendant() {
  const g = new THREE.Group();
  g.name = 'globe_pendant';
  const shade = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mats.post);
  const globe = new THREE.Mesh(new THREE.SphereGeometry(0.15, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 2.5, 2.6), toneMapped: false }));
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.9, 4), mats.post);
  cord.position.y = 0.6;
  g.add(shade, globe, cord);
  return g;
}

// ------------------------------------------------------------------ furniture
const colliders = [];
// the town's cars: rebuilt with the car generator and made drivable once the driver exists (see 'driving' below)
const townCars = [];   // [type, opts, x, z, heading(+z nose)]
const H90 = Math.PI / 2;   // old models point their nose along +x; generator cars along +z
const circle = (x, z, r) => colliders.push({ type: 'circle', x, z, r });
const rect = (x0, x1, z0, z1) => colliders.push({ type: 'box', minX: x0, maxX: x1, minZ: z0, maxZ: z1 });

// Two bar counters along the north window, 5 yellow stools each (bar photo).
const counters = [];
const stools = [];
const stoolProto = makeStool(mats);
const pendantProto = makePendant();
const napkinProto = makeNapkinDispenser(mats);
for (const cx of [-4.6, 1.7]) {
  const counter = makeCounter(mats, { length: 4.4 });
  counter.position.set(cx, 0, Z0 + 0.32);
  add(counter);
  counters.push(counter);
  rect(cx - 2.25, cx + 2.25, Z0, Z0 + 0.6);
  for (let i = 0; i < 5; i++) {
    const s = stoolProto.clone();
    s.position.set(cx + (i - 2) * 0.66 - 0.25, 0, Z0 + 0.8);
    s.rotation.y = Math.PI + (Math.random() - 0.5) * 0.12;
    add(s);
    stools.push(s);
    circle(s.position.x, s.position.z, 0.26);
  }
  for (const dx of [-1.6, 0.4]) {
    const n = napkinProto.clone();
    n.position.set(cx + dx, 1.07, Z0 + 0.25);
    add(n);
  }
  for (const dx of [-1.5, 0, 1.5]) {
    const p = pendantProto.clone();
    p.position.set(cx + dx, 2.15, Z0 + 0.5);
    add(p);
  }
}

// Booths along the tiled west wall (booth photo), with the framed poster above each.
const booths = [];
for (const z of [-2.1, 0.3, 2.7]) {
  const b = makeBooth(mats, { length: 1.25 });
  b.position.set(X0 + 0.65, 0, z);
  add(b);
  booths.push(b);
  const { x: sx, z: sz } = b.userData.size;
  rect(X0, X0 + 0.02 + sx, z - sz / 2, z + sz / 2);
  const poster = makePoster(mats);
  poster.position.set(X0 + 0.005, 1.85, z);
  poster.rotation.y = Math.PI / 2;
  add(poster);
}

// Terrazzo tables with pink slat chairs (pink chair from the entrance photo,
// terrazzo from the booth photo).
const chairProto = makePinkChair(mats);
const chairs = [];
function chairAt(x, z, ry) {
  const c = chairProto.clone();
  c.position.set(x, 0, z);
  c.rotation.y = ry + (Math.random() - 0.5) * 0.15;
  add(c);
  chairs.push(c);
  return c;
}
const tableProto4 = makeTerrazzoTable(mats, { w: 0.8, d: 0.8 });
const tables = [];
for (const x of [-3.4, -0.6, 2.2]) {
  for (const z of [-1.4, 1.4]) {
    const t = tableProto4.clone();
    t.position.set(x, 0, z);
    add(t);
    tables.push(t);
    chairAt(x, z - 0.6, 0);
    chairAt(x, z + 0.6, Math.PI);
    chairAt(x - 0.6, z, Math.PI / 2);
    chairAt(x + 0.6, z, -Math.PI / 2);
    rect(x - 0.85, x + 0.85, z - 0.85, z + 0.85);
  }
}
// Two-tops against the lime wall.
const tableProto2 = makeTerrazzoTable(mats, { w: 0.7, d: 0.6 });
for (const x of [-4.2, -2.0, 0.2, 2.4]) {
  const t = tableProto2.clone();
  const z = Z1 - 0.35;
  t.position.set(x, 0, z);
  add(t);
  chairAt(x - 0.55, z, Math.PI / 2);
  chairAt(x + 0.55, z, -Math.PI / 2);
  rect(x - 0.8, x + 0.8, z - 0.4, Z1);
}

// Entrance: mat inside the doors, a pink chair by the tile pier, neon OPEN sign
// in its LED box in the window beside the door.
const mat = makeDoorMat(mats, { w: 1.9, d: 0.95 });
mat.rotation.y = Math.PI / 2;
mat.position.set(X1 - 0.6, 0.006, DOOR_Z);
add(mat);
const waitChair = chairAt(X1 - 0.45, Z1 - 0.45, -Math.PI / 2 - 0.5);
circle(waitChair.position.x, waitChair.position.z, 0.3);
const neon = makeInfinityBox(mats);
neon.position.set(X1 - 0.08, 1.3, -3.65);
neon.rotation.y = -Math.PI / 2;
add(neon);

// ------------------------------------------------------------------ outside the front doors
// Sidewalk, dirt and gravel from the two sign photos, with both signs.
add(plane(mats.sidewalk, X1, X1 + 3, -9.5, 9, 0.003, 1.5));
add(plane(mats.dirt, X1 + 3, X1 + 9, -9, 1.0, 0.003, 2.0));
add(plane(mats.gravel, X1 + 3, X1 + 9, 1.0, 9, 0.003, 1.2));
const liquor = makeLiquorSign(mats);
liquor.position.set(X1 + 5.2, 0, -2.8);
liquor.rotation.y = -Math.PI / 2; // face toward the sidewalk and the doors
add(liquor);
const twoRivers = makeTwoRiversSign();
twoRivers.position.set(X1 + 4.6, 0, 3.0);
twoRivers.rotation.y = -Math.PI / 2;
add(twoRivers);
for (const s of [liquor, twoRivers]) {
  s.updateMatrixWorld(true);
  for (const [px, , r] of s.userData.poles) {
    const v = new THREE.Vector3(px, 0, 0).applyMatrix4(s.matrixWorld);
    circle(v.x, v.z, r);
  }
}
// Walls of the storefront either side of the doors, and the doors themselves.
rect(X1 - 0.1, X1 + 0.1, Z0, DOOR_Z - 1.03);
rect(X1 - 0.1, X1 + 0.1, DOOR_Z + 1.03, Z1);
const doorCollider = { type: 'box', minX: X1 - 0.12, maxX: X1 + 0.12, minZ: DOOR_Z - 1.03, maxZ: DOOR_Z + 1.03 };
colliders.push(doorCollider);
circle(X1 + 1.2, 0.07, 0.25);
circle(X1 + 1.2, 4.2, 0.25);

// ------------------------------------------------------------------ boarded-up storefront across the lot
// (four "abandoned" photos) with the street lamp and fire hydrant from the side photo.
const abandoned = makeAbandonedBuilding();
const AB = { x: X1 + 11.5, z: 0 }; // facade line, facing -x (toward the signs and the restaurant)
abandoned.position.set(AB.x, 0, AB.z);
abandoned.rotation.y = -Math.PI / 2;
add(abandoned);
add(plane(mats.sidewalkLeaves, X1 + 9, AB.x + 1.45, -6, 6.5, 0.004, 1.5)); // runs into the recessed doorways
// local (x, z) -> world (AB.x - z, AB.z + x) for this rotation
for (const [x0, x1, z0, z1] of abandoned.userData.colliders) rect(AB.x - z1, AB.x - z0, AB.z + x0, AB.z + x1);
const lamp = makeStreetLamp();
lamp.position.set(X1 + 9.4, 0, 0.9);
add(lamp);
circle(lamp.position.x, lamp.position.z, 0.3);
const hydrant = makeFireHydrant();
hydrant.position.set(X1 + 9.4, 0, -4.2);
hydrant.rotation.y = -Math.PI / 2;
add(hydrant);
circle(hydrant.position.x, hydrant.position.z, 0.25);

// ------------------------------------------------------------------ tire shop (two tire-shop photos)
// Faces south (+z) onto a big cracked concrete lot, north-east of the restaurant.
const TS = { x: 26, z: -17 };
add(plane(mats.lotConcrete, 12, 13, -32, -8, 0.003, 4));
add(plane(mats.lotConcrete, 17, 42, -32, -8, 0.003, 4));
add(plane(mats.lotConcrete, 13, 17, -32, -23, 0.003, 4));
const tireShop = makeTireShop();
tireShop.position.set(TS.x, 0, TS.z);
add(tireShop);
for (const [x0, x1, z0, z1] of tireShop.userData.colliders) rect(TS.x + x0, TS.x + x1, TS.z + z0, TS.z + z1);
const interactables = [];
for (const d of tireShop.userData.doors) {
  const [a, b, c, e] = d.gap;
  const col = { type: 'box', minX: TS.x + a, maxX: TS.x + b, minZ: TS.z + c, maxZ: TS.z + e };
  colliders.push(col);
  interactables.push({ ...d, x: TS.x + d.at[0], z: TS.z + d.at[1], t: 0, target: 0, col,
    speed: d.kind === 'garage' ? 0.6 : 2.2 });
}

// ------------------------------------------------------------------ rusty poles on the sidewalk (rusty-pole photos)
const rustyPoles = [];
for (const [x, z] of [[10.4, -7.2], [10.4, 7.6]]) {
  const p = makeRustyPole();
  p.position.set(x, 0, z);
  add(p);
  rustyPoles.push(p);
  circle(x, z, 0.22);
}

// ------------------------------------------------------------------ street row (wall-texture photos)
// Facing the lot from the south, one building per wall texture.
add(plane(mats.sidewalk, X1 + 0.2, 48, 9, 12, 0.003, 1.5));
const streetRow = [];
const ROW_Z = 12;
let rx = 10;
for (const [wall, w, floors] of [['red_brick', 7, 2], ['olive_stucco', 5.6, 1], ['red_sandstone', 7.6, 3], ['teal_stucco', 5.6, 2], ['gray_tile', 4.6, 1], ['gray_brick', 6, 2]]) {
  const d = 10;
  const b = makeStreetBuilding({ wall, w, d, floors, seed: streetRow.length + 3 });
  b.position.set(rx + w / 2, 0, ROW_Z + d / 2);
  b.rotation.y = Math.PI;
  add(b);
  streetRow.push(b);
  rect(rx, rx + w, ROW_Z, ROW_Z + d);
  rx += w + 0.25;
}

// ------------------------------------------------------------------ rocks, grass, leaves (rock / leaf photos)
// River-rock bed with dry grass tufts between the sidewalk and the rental sign.
add(makeRockBed(11.2, 16.8, 3.6, 8.6, { seed: 2 }));
const tuftSpots = [];
{
  let s = 7;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 22; i++) tuftSpots.push([11.5 + r() * 5, 3.9 + r() * 4.4]);
}
add(makeGrassTufts(tuftSpots));
// Narrow rock strip along the restaurant sidewalk (sidewalk-rocks photo).
add(makeRockBed(10.6, 11.2, -9.5, 2.4, { seed: 5, density: 500 }));
// Curb between the lot and the street-row sidewalk, leaves drifted in the gutter.
// Curb split for the crosswalk ramp (paver/curb photos).
add(makeCurbWithLeaves(10, 29.6, 9.0, { dir: -1 }));
add(makeCurbWithLeaves(32.4, 48, 9.0, { dir: -1, seed: 8 }));

// ------------------------------------------------------------------ ground & sidewalks (paver / crack / lid photos)
// Herringbone paver sidewalk in front of the first half of the street row.
add(makePaverSidewalk(10, 29.6, 9.0, 12.0));
for (const x of [14.2, 24.6]) { const d = makeDrainCover(); d.position.set(x, 0, 10.3); add(d); }
// Paver crosswalk across the street, through a raised island, to the tire-shop lot.
add(makePaverCrosswalk(29.8, 32.2, -8, 9.0));
add(makeTrafficIsland(26.5, 35.5, -1.2, 0.8, [29.6, 32.4]));
rect(26.5, 29.6, -1.2, 0.8);
rect(32.4, 35.5, -1.2, 0.8);
add(makeTactilePlate(31.0, 9.45));
add(makeTactilePlate(31.0, -8.45));
// Walk signal poles at both ends of the crosswalk (walk-button / ped-signal photos).
const walkPoles = [];
for (const [x, z, ry] of [[32.7, 9.9, Math.PI], [29.3, -8.9, 0]]) {
  const p = makeWalkSignalPole();
  p.position.set(x, 0, z);
  p.rotation.y = ry;
  add(p);
  walkPoles.push(p);
  circle(x, z, 0.24);
}
// Cracked concrete slabs on the rest of the sidewalk, a utility lid with locate paint.
add(makeCracks(32.6, 47.6, 9.3, 11.8, 9, 4));
add(makeUtilityLid(38.5, 10.6, Math.PI / 2));
// Dirt lot behind a blue-screened fence at the end of the street (dirt-lot photo).
add(makeDirtLot(42.5, 46.5, -7.5, 3.5));
rect(46.5, 46.7, -7.5, 3.5);
add(makeUtilityLid(43.6, 1.6));
const lotLamp = makeStreetLamp();
lotLamp.position.set(41.8, 0, -2);
add(lotLamp);
circle(41.8, -2, 0.3);
add(makeLooseLeaves(10, 46, 6.5, 11.8, 90));
add(makeLooseLeaves(8.2, 11, -9, 9, 40, 23));
// Teal bike rack on the street-row sidewalk (curb photo).
const rack = makeBikeRack(5);
rack.position.set(22.5, 0, 10.3);
add(rack);
rect(22.4, 25.6, 10.0, 10.6);

// ------------------------------------------------------------------ trees (bark / tree photos)
// Spruce with holiday lights + cherry in a red mulch bed east of the tire shop.
const bed = makeMulchBed(3.4);
bed.position.set(38.8, 0.012, -12.2);
add(bed);
const spruce = makeSpruce({ seed: 4, height: 10 });
spruce.position.set(38.6, 0, -12.6);
add(spruce);
circle(38.6, -12.6, 0.6);
const cherry = makeCherry({ seed: 11 });
cherry.position.set(41.2, 0, -9.8);
add(cherry);
circle(41.2, -9.8, 0.35);
// Street trees in leaf-filled pits along the paver sidewalk: pale bark and oak alternating.
const streetTrees = [];
[[12.2, makePaleTree, 5], [19.0, makeOak, 7], [27.6, makePaleTree, 9], [35.0, makeOak, 13], [42.0, makePaleTree, 17]].forEach(([x, make, seed]) => {
  const pit = makeTreePit(1.3, 1.3);
  pit.position.set(x, 0, 10.4);
  add(pit);
  const t = make({ seed });
  t.position.set(x, 0, 10.4);
  t.rotation.y = seed;
  add(t);
  streetTrees.push(t);
  circle(x, 10.4, 0.35);
});

// ------------------------------------------------------------------ objects & locations (objects/locations photos)
// Underground parking ramp down from the tire-shop lot, with a lit tunnel and roll-up door.
const ramp = makeParkingRamp({ x0: 13, x1: 17, z0: -9, z1: -17, zDoor: -23, depth: 2.8 });
// built facing north, then turned 180 deg about its centre so the open top of the ramp faces the
// lot by the tire shop (south end, z -23) and the garage door is at the north end (z -9)
const rampPivot = new THREE.Group();
rampPivot.position.set(15, 0, -16); rampPivot.rotation.y = Math.PI;
ramp.position.set(-15, 0, 16); rampPivot.add(ramp);
add(rampPivot);
const rampFloorY = (x, z) => ramp.userData.floorY(30 - x, -32 - z);
rect(12.75, 13.0, -23, -8.8);   // side walls / parapets (you enter from the open end)
rect(17.0, 17.25, -23, -8.8);
rect(13, 17, -9.0, -8.6);      // garage door
const parkSign = makeParkingSignBlock();
parkSign.position.set(18.2, 0, -8.4);
add(parkSign);
circle(18.2, -8.4, 0.5);
// Teal storefront at the east end of the lot.
const tealShop = makeTealStorefront({ number: '714' });
tealShop.position.set(45, 0, -21);
add(tealShop);
rect(41, 49, -26, -16);
// Red news box by the restaurant door; rabbit sculpture on the paver sidewalk.
const newsBox = makeNewsBox();
newsBox.position.set(8.55, 0, -3.1);
newsBox.rotation.y = Math.PI / 2;
add(newsBox);
circle(8.55, -3.1, 0.3);
const rabbit = makeRabbitSculpture();
rabbit.position.set(16.0, 0, 10.3);
rabbit.rotation.y = Math.PI + 0.4;
add(rabbit);
rect(15.5, 16.5, 9.8, 10.8);

// ------------------------------------------------------------------ wall art (painting photos)
// Four canvases above the two-tops on the lime wall in the restaurant.
[['canvas_impasto.png', -4.2, 0.62, 1.1], ['canvas_drip.png', -2.0, 0.62, 1.1], ['canvas_sunset.png', 0.2, 1.3, 0.73], ['canvas_splatter.png', 2.4, 0.62, 1.1]]
  .forEach(([file, x, w, h]) => {
    const c = makeCanvas(file, w, h);
    c.position.set(x, 1.85, Z1 - 0.005);
    c.rotation.y = Math.PI;
    add(c);
  });
// The graffiti painting as a lit mural on the end wall of the street row, facing the lot.
const mural = makeMural('canvas_graffiti.png', 2.9, 5.1);
mural.position.set(9.99, 3.0, 16.2);
mural.rotation.y = -Math.PI / 2;
add(mural);

// ------------------------------------------------------------------ apartment building (apartment photos)
// Faces west across a sidewalk toward the dirt lot. local (x, z) -> world (AP.x - z, AP.z + x)
const AP = { x: 57, z: -1 };
add(plane(mats.sidewalk, 46.8, 52.2, -10, 8, 0.003, 1.5));
const apt = makeApartment();
apt.position.set(AP.x, 0, AP.z);
apt.rotation.y = -Math.PI / 2;
add(apt);
for (const [x0, x1, z0, z1, y0, y1] of apt.userData.colliders) {
  colliders.push({ type: 'box', minX: AP.x - z1, maxX: AP.x - z0, minZ: AP.z + x0, maxZ: AP.z + x1, ...(y0 !== undefined ? { y0, y1 } : {}) });
}
{
  const d = apt.userData.door;
  const [a, b, c, e] = d.gap;
  const col = { type: 'box', minX: AP.x - e, maxX: AP.x - c, minZ: AP.z + a, maxZ: AP.z + b };
  colliders.push(col);
  interactables.push({ name: 'front door', kind: 'door', setOpen: d.setOpen, x: AP.x - d.at[1] + 0.6, z: AP.z + d.at[0], t: 0, target: 0, col, speed: 2.2 });
}
for (const d of apt.userData.unitDoors) {
  const [a, b, c, e] = d.gap;      // local x range a..b, z range c..e
  const col = { type: 'box', minX: AP.x - e, maxX: AP.x - c, minZ: AP.z + a, maxZ: AP.z + b, y0: d.y, y1: d.y + 1 };
  colliders.push(col);
  interactables.push({ name: 'apartment door', kind: 'door', setOpen: d.setOpen, x: AP.x - d.at[1], z: AP.z + d.at[0], y: d.y, t: 0, target: 0, col, speed: 2.2 });
}

// ------------------------------------------------------------------ soup pots on the bar (soup photos)
const soupPots = [];
for (const [x, soup] of [[-3.1, 'soup_lentil'], [0.45, 'soup_smooth']]) {
  const p = makeSoupPot({ soup });
  p.position.set(x, 1.07, Z0 + 0.3);
  add(p);
  soupPots.push(p);
}

// ------------------------------------------------------------------ food on the tables (food photos)
// Terrazzo four-tops are 0.76 m tall; the tables sit at x -3.4/-0.6/2.2, z -1.4/1.4.
const foods = [];
const onTable = (obj, x, z, ry = 0) => { obj.position.set(x, 0.76, z); obj.rotation.y = ry; add(obj); foods.push(obj); };
onTable(makePizza('mushroom'), -3.45, -1.45, 0.3);
onTable(makeRamenTray(), -0.6, -1.4, 0.2);
onTable(makeSpaghettiTray(), 2.2, -1.4, -0.3);
onTable(makeCurryPlate(), -3.4, 1.4, 0.8);
onTable(makePizza('corn'), 2.2, 1.4, 1.1);
// Snacks on the two-tops along the lime wall (food set 2).
const twoZ = Z1 - 0.35;
onTable(makeWaffleSandwich(), -4.32, twoZ, 0.4);
const puffCup = makeCerealPuffCup(); onTable(puffCup, -4.08, twoZ + 0.05, 0);
onTable(makeCupNoodles(), -2.1, twoZ, 0.3);
onTable(makeClearSoda(), -1.85, twoZ + 0.05, 1.88);
onTable(makeDarkSodaCan(), 0.08, twoZ, -1.4);
onTable(makeDarkSodaCan(), 0.17, twoZ + 0.04, -1.8);

// ------------------------------------------------------------------ junked van behind the tire shop (old-van photo)
townCars.push(['oldvan', { name: 'old van', color: '#8a857a', roofColor: '#a9ad9f', dust: 0.7, rim: 'steel', plate: 'ELM 1977',
  bands: [[0, 0.66, '#4a3a33'], [0.93, 0.955, '#6b4a3a'], [0.985, 1.005, '#9a7e74']] }, 21.5, -26.5, 0.35 + H90]);

// ------------------------------------------------------------------ tree with a door (tree-door photos)
// In the gravel + leaf patch by the rental sign, door facing the sidewalk.
const doorTree = makeDoorTree();
doorTree.position.set(12.8, 0, 5.2);
doorTree.rotation.y = -Math.PI / 2;
add(doorTree);
circle(12.8, 5.2, 0.55);
add(makeLooseLeaves(11.4, 14.2, 4.0, 6.4, 50, 31));

// ------------------------------------------------------------------ alien formation (alien texture photos)
// Hidden in the dirt lot behind the blue construction fence.
const alien = makeAlienFormation();
alien.position.set(44.5, 0, -3);
alien.scale.setScalar(0.85);
add(alien);
for (const [x, z, cr] of alien.userData.colliders) circle(44.5 + x * 0.85, -3 + z * 0.85, cr * 0.85);

// ------------------------------------------------------------------ scooter + batteries (scooter photos)
// Parked on the sidewalk by the apartment building; press E to lift the seat.
const scooter = makeScooter();
scooter.position.set(50.4, 0, 5.3);
scooter.rotation.y = Math.PI * 0.85;
add(scooter);
circle(50.4, 5.3, 0.55);
interactables.push({ name: 'scooter seat', kind: 'door', setOpen: scooter.userData.setOpen, x: 50.4, z: 5.3, t: 0, target: 0, col: { active: false }, speed: 1.8 });
// Red-topped workbench in the tire-shop office with the old and new batteries.
{
  const bench = new THREE.Group();
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 0.6), new THREE.MeshStandardMaterial({ color: '#c7322b', roughness: 0.6 }));
  top.position.y = 0.9;
  bench.add(top);
  const steel = new THREE.MeshStandardMaterial({ color: '#8e9296', roughness: 0.5, metalness: 0.3 });
  for (const [x, z] of [[-0.65, -0.25], [0.65, -0.25], [-0.65, 0.25], [0.65, 0.25]]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.88, 0.04), steel);
    leg.position.set(x, 0.44, z);
    bench.add(leg);
  }
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.02, 0.56), steel);
  shelf.position.y = 0.2;
  bench.add(shelf);
  const b1 = makeBattery('old'); b1.position.set(-0.12, 0.925, 0); bench.add(b1);
  const b2 = makeBattery('new'); b2.position.set(0.06, 0.925, 0.02); b2.rotation.y = -0.1; bench.add(b2);
  bench.position.set(TS.x + 6.5, 0, TS.z - 3.0);
  add(bench);
  rect(TS.x + 5.8, TS.x + 7.2, TS.z - 3.3, TS.z - 2.7);
}

// ------------------------------------------------------------------ tire + alloy wheel display (car-tire-wheel photo)
// Outside the tire shop office: two wheels leaning on the front wall, one lying flat with a bare tire on it.
{
  const zf = TS.z + 3.75;
  const shadowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d'); const gr = x.createRadialGradient(32, 32, 2, 32, 32, 32);
    gr.addColorStop(0, 'rgba(0,0,0,0.75)'); gr.addColorStop(0.5, 'rgba(0,0,0,0.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  const contact = (x, z, sx, sz) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(sx, sz), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, 0.008, z); add(m);
  };
  contact(TS.x + 2.55, zf + 0.22, 0.75, 0.45); contact(TS.x + 4.45, zf + 0.22, 0.75, 0.45); contact(TS.x - 0.6, zf + 0.75, 1.0, 1.0);
  for (const [dx, ry] of [[2.55, 0.06], [4.45, -0.05]]) {
    const w = makeTireWheel();
    w.position.set(TS.x + dx, 0.364, zf + 0.15);
    w.rotation.set(-0.16, ry, dx * 0.7);
    add(w);
    rect(TS.x + dx - 0.4, TS.x + dx + 0.4, zf, zf + 0.35);
  }
  const flat = makeTireWheel();
  flat.rotation.x = -Math.PI / 2; flat.position.set(TS.x - 0.6, 0.118, zf + 0.75); add(flat);
  const bare = makeTireWheel({ withWheel: false });
  bare.rotation.x = -Math.PI / 2; bare.rotation.z = 0.5; bare.position.set(TS.x - 0.58, 0.118 + 0.236, zf + 0.74); add(bare);
  circle(TS.x - 0.6, zf + 0.75, 0.4);
  // gooseneck wall light over the display
  const arm = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.02, 6, 16, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#2c2e30', roughness: 0.5 }));
  arm.rotation.y = Math.PI / 2; arm.position.set(TS.x + 2.2, 2.85, zf + 0.02); add(arm);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.14, 16, 1, true), new THREE.MeshStandardMaterial({ color: '#2c2e30', roughness: 0.5, side: THREE.DoubleSide }));
  shade.position.set(TS.x + 2.2, 2.82, zf + 0.29); add(shade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.0, 1.6), toneMapped: false }));
  bulb.position.set(TS.x + 2.2, 2.76, zf + 0.29); add(bulb);
  const wl = new THREE.PointLight('#ffe7c4', 7, 7, 1.3); wl.position.set(TS.x + 2.2, 2.6, zf + 0.5); add(wl);
}

// ------------------------------------------------------------------ the creepy hoodie figure (character photos)
// Slowly paces the street-row sidewalk, turning at each end.
const creep = makeCreep();
add(creep);
const CREEP = { x0: 11.2, x1: 30.0, z: 11.55, speed: 0.75 };
creep.userData.update = (t) => {
  const len = CREEP.x1 - CREEP.x0, period = (2 * len) / CREEP.speed;
  const u = (t % period) / period;                 // 0..1 there and back
  const out = u < 0.5;
  const k = out ? u * 2 : 2 - u * 2;
  creep.position.set(CREEP.x0 + k * len, 0, CREEP.z);
  creep.rotation.y = out ? Math.PI / 2 : -Math.PI / 2;
  creep.userData.pose(t * CREEP.speed * 4.2);
};

// ------------------------------------------------------------------ police vehicles (police photos, made-up MCPD)
// Parked on the lot by the rental sign, lights flashing on the cart.
const cart = makePatrolCart();
cart.position.set(35.5, 0, -9.6);
cart.rotation.y = 0.2;
add(cart);
rect(34.7, 36.3, -10.9, -8.3);
const pScooters = [];
for (const [x, z] of [[32.6, -9.9], [33.6, -9.8]]) {
  const sc = makePatrolScooter();
  sc.position.set(x, 0, z);
  sc.rotation.y = 0.35;
  sc.rotation.z = 0.04;
  add(sc);
  pScooters.push(sc);
  circle(x, z, 0.5);
}

// ------------------------------------------------------------------ grocery store (store / dairy-cooler photos)
// North of the tire-shop lot, front facing the lot. local (x, z) -> world (GS.x + x, GS.z + z)
const GS = { x: 24, z: -41 };
const grocery = makeGrocery();
grocery.position.set(GS.x, 0, GS.z);
add(grocery);
add(plane(mats.lotConcrete, 12, 42, -35, -32, 0.003, 4));
const groceryCols = [];
for (const [x0, x1, z0, z1] of grocery.userData.colliders) {
  const c = { type: 'box', minX: GS.x + x0, maxX: GS.x + x1, minZ: GS.z + z0, maxZ: GS.z + z1 };
  colliders.push(c);
  groceryCols.push(c);
}
const groceryDoor = groceryCols[grocery.userData.colliders.indexOf(grocery.userData.doorCol)];

// ------------------------------------------------------------------ controls
// ------------------------------------------------------------------ roadside shrines (shrine photos)
// A small wooded grove east of the grocery lot: leaf-litter ground, trees behind, the two shrines
// side by side facing the lot (+z faces south toward the street).
{
  const lt = new THREE.TextureLoader().load('assets/textures/leaf_litter.png');
  lt.colorSpace = THREE.SRGBColorSpace; lt.wrapS = lt.wrapT = THREE.RepeatWrapping;
  const ln = new THREE.TextureLoader().load('assets/textures/leaf_litter_normal.png');
  ln.wrapS = ln.wrapT = THREE.RepeatWrapping;
  add(plane(new THREE.MeshStandardMaterial({ map: lt, normalMap: ln, color: '#a89c8c', roughness: 1 }), 50, 64.5, -46.5, -29, 0.006, 0.7));
  for (const [x, z] of [[53.6, -34.0], [60.2, -34.2]]) {   // soft light on each shrine (night)
    const l = new THREE.PointLight('#ffe2b8', 6, 9, 1.4); l.position.set(x, 3.4, z); add(l);
  }
  add(makeLooseLeaves(50, 64.5, -46, -29, 140, 61));
  const shrA = makeStatueShrine(); shrA.position.set(53.6, 0, -36.2); add(shrA);
  const shrB = makeStoneShrine(); shrB.position.set(60.2, 0, -36.4); shrB.rotation.y = -0.08; add(shrB);
  for (const [sh, rot] of [[shrA, 0], [shrB, -0.08]]) {
    for (const [x0, x1, z0, z1] of sh.userData.colliders) {
      // rotate the box corners (small angles: take the bounding box)
      const pts = [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].map(([x, z]) => [x * Math.cos(rot) + z * Math.sin(rot), -x * Math.sin(rot) + z * Math.cos(rot)]);
      rect(sh.position.x + Math.min(...pts.map((p) => p[0])), sh.position.x + Math.max(...pts.map((p) => p[0])),
        sh.position.z + Math.min(...pts.map((p) => p[1])), sh.position.z + Math.max(...pts.map((p) => p[1])));
    }
  }
  // trees behind and around the grove
  [[51.2, -42.5, makeSpruce, { seed: 31, height: 11 }], [56.8, -44.5, makeOak, { seed: 33 }], [62.6, -42.8, makeSpruce, { seed: 35, height: 12 }],
    [50.8, -32.0, makePaleTree, { seed: 37 }], [63.8, -31.5, makeOak, { seed: 39 }], [59.4, -45.6, makePaleTree, { seed: 41 }]].forEach(([x, z, make, o]) => {
    const t = make(o); t.position.set(x, 0, z); add(t); circle(x, z, 0.45);
  });
  add(makeRockBed(51, 53, -40.5, -39.0, { density: 60, seed: 43 }));
  add(makeGrassTufts([[52.2, -33.0], [57.0, -33.6], [62.8, -34.2], [55.2, -40.6], [58.2, -39.8], [63.4, -38.6]], 45));
}

// ------------------------------------------------------------------ house fronts (misc door photos)
// A little lane east of the grocery lot: four houses facing west along x = 46, two facing north
// along z = -44, dry-grass lawns (cat photo grass) and concrete walks to each door.
const houseLights = [];
{
  const gt = new THREE.TextureLoader().load('assets/textures/hs_grass.png');
  gt.colorSpace = THREE.SRGBColorSpace; gt.wrapS = gt.wrapT = THREE.RepeatWrapping;
  add(plane(new THREE.MeshStandardMaterial({ map: gt, roughness: 1 }), 34.5, 46, -47.5, -27.6, 0.004, 2.2));
  const walkMat = new THREE.MeshStandardMaterial({ color: '#b3b0a8', roughness: 0.95 });
  const placeHouse = (kind, w, gx, gz, rot) => {
    const h = makeHouse(kind, w);
    h.position.set(gx, 0, gz); h.rotation.y = rot; add(h);
    const c = Math.cos(rot), s = Math.sin(rot);
    for (const [x0, x1, z0, z1] of h.userData.colliders) {
      const pts = [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].map(([x, z]) => [gx + x * c + z * s, gz - x * s + z * c]);
      rect(Math.min(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[1])));
    }
    return h;
  };
  // east row, fronts at x = 46 facing -x (local z -> world -x)
  let z = -44.0;
  for (const [kind, w, dz] of [['brick', 4.0, -0.2], ['yellow', 4.0, 0], ['gray', 3.8, -0.25], ['porch', 4.6, 0]]) {
    placeHouse(kind, w, 46, z + w / 2, -Math.PI / 2);
    add(plane(walkMat, 41.5, 46 - (kind === 'porch' ? 2.9 : 1.3), z + w / 2 + dz - 0.45 + (kind === 'porch' ? -0.9 : 0), z + w / 2 + dz + 0.45 + (kind === 'porch' ? -0.9 : 0), 0.008, 1));
    z += w + 0.1;
  }
  // south row, fronts at z = -44 facing +z
  for (const [kind, x, dx] of [['stone', 37.6, -0.3], ['tan', 42.0, -0.4]]) {
    placeHouse(kind, 4.2, x, -44, 0);
    add(plane(walkMat, x + dx - 0.45, x + dx + 0.45, -42.7, -38.5, 0.008, 1));
  }
}

// ------------------------------------------------------------------ boarded blue house + cats (misc photos)
// West side of the house lane, facing east (+x).
const blueHouse = makeBlueHouse();
{
  const gx = 38.4, gz = -34.6, rot = Math.PI / 2;
  blueHouse.position.set(gx, 0, gz); blueHouse.rotation.y = rot; add(blueHouse);
  const c = Math.cos(rot), s = Math.sin(rot);
  for (const [x0, x1, z0, z1] of blueHouse.userData.colliders) {
    const pts = [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].map(([x, z]) => [gx + x * c + z * s, gz - x * s + z * c]);
    rect(Math.min(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[1])));
  }
}

// ------------------------------------------------------------------ dirt construction site (dump-truck + cairn photos)
// North of the house lane, behind a rusty pipe barrier with a gap to walk through.
{
  const dirtMat = mats.dirt;                // same dirt as the other lots
  add(plane(dirtMat, 33, 63, -64, -47.7, 0.006, 1.6));
  // tyre ruts
  const rut = new THREE.MeshStandardMaterial({ color: '#4a3a2c', roughness: 1, transparent: true, opacity: 0.45, depthWrite: false });
  for (const z of [-55.6, -58.4]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(26, 0.7), rut); m.rotation.x = -Math.PI / 2; m.rotation.z = 0.12; m.position.set(48, 0.009, z); add(m); }
  // dirt berms
  for (const [x, z, sx, sy, sz] of [[37.5, -60.5, 3.2, 1.3, 2.4], [58.5, -61.0, 3.8, 1.7, 2.2], [55.0, -50.8, 1.6, 0.6, 1.1]]) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), dirtMat);
    m.scale.set(sx, sy, sz); m.position.set(x, 0, z); m.receiveShadow = true; add(m);
    rect(x - sx * 0.8, x + sx * 0.8, z - sz * 0.8, z + sz * 0.8);
  }
  const truck = makeDumpTruck(); truck.position.set(47.5, 0, -57.2); truck.rotation.y = 0.25; add(truck);
  { const [x0, x1, z0, z1] = truck.userData.collider, c = Math.cos(0.25), s = Math.sin(0.25);
    const pts = [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].map(([x, z]) => [47.5 + x * c + z * s, -57.2 - x * s + z * c]);
    rect(Math.min(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[1]))); }
  for (const [x0, x1] of [[34.5, 44.5], [49.0, 61.5]]) {
    const b = makePipeBarrier(x1 - x0); b.position.set((x0 + x1) / 2, 0, -48.6); add(b);
    rect(x0, x1, -48.75, -48.45);
    const w = makeWeeds(Math.round((x1 - x0) * 1.2), x1 - x0, 0.9, Math.round(x0)); w.position.set((x0 + x1) / 2, 0, -48.3); add(w);
  }
  const sign = makeSiteSign(); sign.position.set(50.2, 0, -48.9); sign.rotation.y = -0.15; add(sign); rect(49.5, 50.9, -49.05, -48.75);
  // site floodlight
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 6, 10), new THREE.MeshStandardMaterial({ color: '#77797c', metalness: 0.5, roughness: 0.5 }));
  pole.position.set(39.0, 3, -57.5); add(pole); circle(39.0, -57.5, 0.2);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.2), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.1, 1.8), toneMapped: false }));
  head.position.set(39.25, 5.9, -57.4); head.rotation.x = 0.5; add(head);
  const fl = new THREE.PointLight('#fff2d8', 22, 22, 1.2); fl.position.set(40.0, 5.5, -57.0); add(fl);
}

// ------------------------------------------------------------------ small misc props (27e)
{
  // night pickup crosswalk in the grocery lot, lane running north-south
  const pz = makePickupZone(); const gx = 30.0, gz = -27.6, rot = Math.PI / 2;
  pz.position.set(gx, 0, gz); pz.rotation.y = rot; add(pz);
  for (const [x0, x1, z0, z1] of pz.userData.colliders) {
    const pts = [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].map(([x, z]) => [gx + z, gz - x]);
    rect(Math.min(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[1])));
  }
  // teal concrete wall with wheat-paste art on the west edge of the dirt site
  const pw = makePasteWall(7, 2.6); pw.position.set(34.25, 0, -54.5); pw.rotation.y = Math.PI / 2; add(pw);
  rect(33.95, 34.3, -58.0, -51.0);
  // plywood sheet leaning on the side of the boarded blue house
  const ply = makePlywoodSheet(); ply.position.set(36.6, 0, -31.42); ply.rotation.x = -0.14; add(ply);
  rect(35.95, 37.25, -31.75, -31.3);
  // broken car-window glass on the lot beside the old van
  const gl = makeGlassShards(1.4, 0.9, 420, 7); gl.position.set(23.3, 0, -25.6); add(gl);
}

// ------------------------------------------------------------------ city plaza (city photos, 28a)
// West of the restaurant: a paved square reached by a sidewalk strip along the restaurant's south wall.
{
  const PX0 = -44, PX1 = -9, PZ0 = -14, PZ1 = 11.8;
  const pt = makePaverTexture(); pt.repeat.set(1, 1);
  const pavMat = new THREE.MeshStandardMaterial({ map: pt, roughness: 0.85 });
  const placeRot = (o, gx, gz, rot) => {
    o.position.set(gx, 0, gz); o.rotation.y = rot; add(o);
    const c = Math.cos(rot), s = Math.sin(rot);
    const col = (r) => { const [x0, x1, z0, z1] = r; const pts = [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].map(([x, z]) => [gx + x * c + z * s, gz - x * s + z * c]);
      rect(Math.min(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[1]))); };
    if (o.userData.collider) col(o.userData.collider);
    return o;
  };
  add(plane(pavMat, PX0, PX1, PZ0, PZ1, 0.006, 2.4));
  add(plane(pavMat, PX1, 9.0, 5.3, 11.8, 0.006, 2.4));                    // connecting strip
  // grey paver bands crossing the square (photo)
  const bandMat = new THREE.MeshStandardMaterial({ map: makeGreyBandTexture(), roughness: 0.85 });
  add(plane(bandMat, PX0, PX1, 2.2, 3.4, 0.008, 1.2, 2.4));
  add(plane(bandMat, -27.6, -26.4, PZ0, PZ1, 0.009, 1.2, 2.4));
  // brick warehouse gable on the west side, facing the square
  placeRot(makeBrickGable(16, 12, 5.0, 4.0), PX0 + 0.2, -3.0, Math.PI / 2);
  const sp1 = makeSpiral(false); placeRot(sp1, PX0 + 3.0, -6.2, 0.4); circle(PX0 + 2.6, -6.0, 0.6);
  const sp2 = makeSpiral(true); placeRot(sp2, PX0 + 3.4, 1.4, -2.6); circle(PX0 + 3.5, 1.2, 0.6);
  // white oval-window building on the north side
  const ov = placeRot(makeOvalBuilding(24, 14, 11), -25.5, PZ0 + 0.2, 0);
  // pebble benches in front of it
  [[-35, -11.4, 0.1], [-32.8, -11.6, -0.2], [-30.6, -11.3, 0.3], [-19.6, -11.4, 0.2], [-17.2, -11.5, -0.1], [-15, -11.2, 0.4]].forEach(([x, z, r]) => {
    const b = makePebbleBench(); b.position.set(x, 0, z); b.rotation.y = r; add(b); circle(x, z, 0.4);
  });
  // ornate lamps (lit) round the square
  [[-38.5, -6.5], [-38.5, 8.5], [-30.2, -8.0], [-26.8, 8.5], [-14.0, -6.5], [-14.0, 8.5], [-2.0, 10.8]].forEach(([x, z]) => {
    const l = makeOrnateLamp(); l.position.set(x, 0, z); add(l); circle(x, z, 0.25);
    const pl = new THREE.PointLight('#ffd9a8', 7, 11, 1.5); pl.position.set(x, 3.4, z); add(pl);
  });
  // raised planters with small trees
  [[-33, 0, 3.2, 2.0, 2], [-20, 0, 3.6, 2.2, 5], [-22, 7.5, 2.6, 1.8, 8], [-34, 7.8, 2.2, 1.8, 11]].forEach(([x, z, w, d, sd]) => {
    const p = makePlanter(w, d, sd); p.position.set(x, 0, z); add(p); rect(x - w / 2, x + w / 2, z - d / 2, z + d / 2);
  });
}

// ------------------------------------------------------------------ old-town shopping street (city photos, 28b)
// Runs south from the plaza: granite-slab road with white lane markings, shops either side.
{
  const SX = -26.5, Z0 = 11.8, Z1 = 52;
  const st = new THREE.TextureLoader().load('assets/textures/ot_stone.png');
  st.colorSpace = THREE.SRGBColorSpace; st.wrapS = st.wrapT = THREE.RepeatWrapping;
  const stoneMat = new THREE.MeshStandardMaterial({ map: st, roughness: 0.85 });
  add(plane(stoneMat, SX - 7, SX + 7, Z0, Z1, 0.006, 1.2));
  const line = new THREE.MeshStandardMaterial({ color: '#e8e8e2', roughness: 0.8 });
  for (let z = Z0 + 2; z < Z1 - 1; z += 3.2) add(plane(line, SX - 0.08, SX + 0.08, z, z + 1.6, 0.01));
  for (const dx of [-4.6, 4.6]) add(plane(line, SX + dx - 0.07, SX + dx + 0.07, Z0, Z1, 0.01));
  const placeR = (o, gx, gz, rot) => {
    o.position.set(gx, 0, gz); o.rotation.y = rot; add(o);
    const c = o.userData.collider; if (!c) return o;
    const cs = Math.cos(rot), sn = Math.sin(rot);
    const pts = [[c[0], c[2]], [c[1], c[2]], [c[0], c[3]], [c[1], c[3]]].map(([x, z]) => [gx + x * cs + z * sn, gz - x * sn + z * cs]);
    rect(Math.min(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[1])));
    return o;
  };
  // shops: west side face +x, east side face -x
  const norens = ['#2a3a6a', '#7a1f24', '#2f5a3a', '#4a2a5a', '#8a5a1a'];
  let z = Z0 + 1.5, k = 0;
  for (const w of [6, 5.5, 7, 6, 5, 6.5]) { placeR(makeShopHouse({ w, d: 8, seed: k + 3, front: k % 3 === 2 ? 'lattice' : 'glass', sign: k, noren: norens[k % 5] }), SX - 7, z + w / 2, Math.PI / 2); z += w + 0.3; k++; }
  z = Z0 + 3.5;
  for (const w of [5.5, 6.5, 5, 7, 6]) { placeR(makeShopHouse({ w, d: 8, seed: k + 9, front: k % 3 === 1 ? 'lattice' : 'glass', sign: k, noren: norens[k % 5] }), SX + 7, z + w / 2, -Math.PI / 2); z += w + 0.3; k++; }
  // (the clock tower made way for the station gateway that now ends the street)
  // lamps (lit) + stone bollards + banners along both edges
  for (let zz = Z0 + 4; zz < Z1; zz += 7) for (const s of [-1, 1]) {
    const l = makeOldTownLamp(); l.position.set(SX + s * 6.0, 0, zz); l.rotation.y = s > 0 ? Math.PI : 0; add(l); circle(SX + s * 6.0, zz, 0.2);
    const pl = new THREE.PointLight('#ffd9a8', 6, 11, 1.5); pl.position.set(SX + s * 5.4, 3.3, zz); add(pl);
  }
  let bs = 1;
  for (let zz = Z0 + 2.5; zz < Z1; zz += 2.2) for (const s of [-1, 1]) { if ((zz | 0) % 7 === 0) continue; const b = makeBollard(bs++); b.position.set(SX + s * 5.1, 0, zz); add(b); circle(SX + s * 5.1, zz, 0.25); }
  [[SX - 6.3, Z0 + 9, '#2a4aa8'], [SX - 6.3, Z0 + 23, '#c8202a'], [SX + 6.3, Z0 + 15, '#2a4aa8'], [SX + 6.3, Z0 + 30, '#2a8a4a']].forEach(([x, zz, c], i) => { const b = makeBanner(c, i); b.position.set(x, 0, zz); b.rotation.y = x < SX ? 0 : Math.PI; add(b); });
  // stone monkey statues by a shop door, and the green sign pillar
  const m1 = makeMonkey(); m1.position.set(SX - 5.7, 0, Z0 + 5.5); m1.rotation.y = 0.2; add(m1); circle(SX - 5.7, Z0 + 5.5, 0.4);
  const m2 = makeMonkey(); m2.position.set(SX + 5.7, 0, Z0 + 19); m2.rotation.y = Math.PI - 0.3; add(m2); circle(SX + 5.7, Z0 + 19, 0.4);
  placeR(makeGreenPillar(), SX + 6.4, Z0 + 26, -Math.PI / 2);
}

// ------------------------------------------------------------------ shops off the restaurant strip (city photos, 28c)
// South of the strip that links the plaza to the restaurant, both facing north (-z).
const junkArea = {};
{
  const rotPI = (o, gx, gz, list) => {
    o.position.set(gx, 0, gz); o.rotation.y = Math.PI; add(o);
    for (const [x0, x1, z0, z1] of list) rect(gx - x1, gx - x0, gz - z1, gz - z0);
  };
  const shut = makeShutterShop(10); rotPI(shut, -6.4, 12.2, [shut.userData.collider]);
  const junk = makeJunkShop(9, 12); rotPI(junk, 3.5, 12.2, junk.userData.colliders);
  const a2 = junk.userData.area;
  Object.assign(junkArea, { minX: 3.5 - a2.x1, maxX: 3.5 - a2.x0, minZ: 12.2 - a2.z1, maxZ: 12.2 - a2.z0 });
  // 56 fabrics: a secondhand clothes rack + folded-stack table out on the sidewalk, west of the junk shop door
  const thrift = makeThriftCorner(); rotPI(thrift, 6.4, 10.9, [thrift.userData.collider]);
  const vm = makeVendingMachine(); vm.position.set(-0.85, 0, 11.7); vm.rotation.y = Math.PI; add(vm); rect(-1.25, -0.4, 11.65, 12.45);
}

// ------------------------------------------------------------------ street props (city photos, 28d)
// South edge of the plaza by the old-town street: a closed graffiti shop with a pallet, an arcade
// cabinet outside; two cargo trikes parked on the plaza and on the strip.
{
  const put = (o, gx, gz, rot) => {
    o.position.set(gx, 0, gz); o.rotation.y = rot; add(o);
    const c = o.userData.collider; if (!c) return;
    const cs = Math.cos(rot), sn = Math.sin(rot);
    const pts = [[c[0], c[2]], [c[1], c[2]], [c[0], c[3]], [c[1], c[3]]].map(([x, z]) => [gx + x * cs + z * sn, gz - x * sn + z * cs]);
    rect(Math.min(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[1])));
  };
  { const gf = makeGraffitiFront(4.4); put(gf, -15.5, 12.1, Math.PI); const c = gf.userData.collider2; rect(-15.5 - c[1], -15.5 - c[0], 12.1 - c[3], 12.1 - c[2]); }
  add(plane(new THREE.MeshStandardMaterial({ color: '#4a4c4e', roughness: 0.9 }), -18.4, -12.6, 12.1, 16, 2.0, 1));
  put(makeArcadeCabinet(), -12.2, 11.55, Math.PI);
  put(makeCargoTrike({ cab: false, seed: 2 }), -19.0, 8.6, 0.0);
  put(makeCargoTrike({ cab: true, seed: 5 }), 0.6, 7.6, Math.PI + 0.15);
}

// ------------------------------------------------------------------ station gateway, lotus pond, rock bar door (city photos, 28e)
{
  const put = (o, gx, gz, rot, list) => {
    o.position.set(gx, 0, gz); o.rotation.y = rot; add(o);
    const cs = Math.cos(rot), sn = Math.sin(rot);
    for (const c of list) {
      const pts = [[c[0], c[2]], [c[1], c[2]], [c[0], c[3]], [c[1], c[3]]].map(([x, z]) => [gx + x * cs + z * sn, gz - x * sn + z * cs]);
      rect(Math.min(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[1])));
    }
  };
  // station plaza paving (tan + grey squares like the photo) at the end of the old-town street
  const sp = new THREE.CanvasTexture((() => { const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d'); let s = 5; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { x.fillStyle = r() < 0.15 ? '#e8e2d4' : ['#a8a49c', '#b8b2a6', '#9a968e', '#c4bdb0'][Math.floor(r() * 4)]; x.fillRect(i * 64 + 2, j * 64 + 2, 60, 60); } return c; })());
  sp.colorSpace = THREE.SRGBColorSpace; sp.wrapS = sp.wrapT = THREE.RepeatWrapping;
  const spMat = new THREE.MeshStandardMaterial({ map: sp, roughness: 0.85 });
  add(plane(spMat, -44, -9, 51.8, 72, 0.007, 4));
  add(plane(spMat, -74, -44, 50.2, 54.2, 0.007, 4));
  const st = makeStationGate(); put(st, -26.5, 57.5, Math.PI, st.userData.colliders);
  const pd = makeLotusPond(26, 28); put(pd, -58.5, 50.2, 0, pd.userData.colliders); pd.position.y = 0.27;
  const rd = makeRockDoor(); put(rd, -38.5, 12.15, Math.PI, rd.userData.colliders);
}

// ------------------------------------------------------------------ underground mall (city photo, 28f)
// The hall lies under the empty block east of the station plaza (world x -5..9, z 23..51); its glass
// stair kiosk stands on a paved forecourt that joins the station plaza.
const MALL = { x: 2, z: 37 };
const mall = makeUndergroundMall();
mall.position.set(MALL.x, 0, MALL.z);
add(mall);
for (const [x0, x1, z0, z1, y0, y1] of mall.userData.colliders) colliders.push({ type: 'box', minX: MALL.x + x0, maxX: MALL.x + x1, minZ: MALL.z + z0, maxZ: MALL.z + z1, y0, y1 });
// ------------------------------------------------------------------ stair entrance to a Go club (city photo, 28g)
// On the forecourt's east edge, facing the mall kiosk; its stair runs east into the building.
const SE = { x: 14, z: 61, rot: -Math.PI / 2 };
const stairEnt = makeStairEntrance();
stairEnt.position.set(SE.x, 0, SE.z); stairEnt.rotation.y = SE.rot; add(stairEnt);
// local (x, z) -> world for this rotation: wx = SE.x - z, wz = SE.z + x
for (const [x0, x1, z0, z1] of stairEnt.userData.colliders) colliders.push({ type: 'box', minX: SE.x - z1, maxX: SE.x - z0, minZ: SE.z + x0, maxZ: SE.z + x1 });
const seArea = (() => { const a = stairEnt.userData.area; return { minX: SE.x - a.maxZ, maxX: SE.x - a.minZ, minZ: SE.z + a.minX, maxZ: SE.z + a.maxX }; })();
// ------------------------------------------------------------------ covered electronics market alley (city photo, 28h)
// Runs south from the forecourt (entrance at world z 49.4) above the underground mall; its colliders
// only apply at street level so they don't block the mall below.
const MA = { x: 9, z: 49.4 };
const alley = makeMarketAlley();
alley.position.set(MA.x, 0, MA.z); add(alley);
for (const [x0, x1, z0, z1] of alley.userData.colliders) colliders.push({ type: 'box', minX: MA.x + x0, maxX: MA.x + x1, minZ: MA.z + z0, maxZ: MA.z + z1, y0: -0.5, y1: 3 });
const maArea = (() => { const a = alley.userData.area; return { minX: MA.x + a.minX, maxX: MA.x + a.maxX, minZ: MA.z + a.minZ, maxZ: MA.z + a.maxZ, y0: -0.5, y1: 0.6 }; })();
// ------------------------------------------------------------------ bar alley (city photo, 28i)
// Opens off the forecourt's north edge (world z 72) and runs north; rotated half a turn, so
// local (x, z) -> world (BA.x - x, BA.z - z).
const BA = { x: -2, z: 72 };
const barAlley = makeBarAlley();
barAlley.position.set(BA.x, 0, BA.z); barAlley.rotation.y = Math.PI; add(barAlley);
for (const [x0, x1, z0, z1] of barAlley.userData.colliders) colliders.push({ type: 'box', minX: BA.x - x1, maxX: BA.x - x0, minZ: BA.z - z1, maxZ: BA.z - z0 });
const baArea = (() => { const a = barAlley.userData.area; return { minX: BA.x - a.maxX, maxX: BA.x - a.minX, minZ: BA.z - a.maxZ, maxZ: BA.z - a.minZ, y0: -0.5, y1: 0.6 }; })();
// the teahouse inside the bar alley (28j): its room + doorway
const teaAreas = barAlley.userData.areas.map((a) => ({ minX: BA.x - a.maxX, maxX: BA.x - a.minX, minZ: BA.z - a.maxZ, maxZ: BA.z - a.minZ, y0: -0.5, y1: 0.6 }));
// ------------------------------------------------------------------ noodle shop + food set 1 remainder (food photos, item 16)
// The shop faces the forecourt from its south-west corner; its bench table holds the rest of food set 1.
const NS = { x: -4.5, z: 49 };
const noodle = makeNoodleShop();
noodle.position.set(NS.x, 0, NS.z); add(noodle);
for (const [x0, x1, z0, z1] of noodle.userData.colliders) colliders.push({ type: 'box', minX: NS.x + x0, maxX: NS.x + x1, minZ: NS.z + z0, maxZ: NS.z + z1, y0: -0.5, y1: 3 });
{
  const t = noodle.userData.table, tx = NS.x + t.x, tz = NS.z + t.z;
  const put = (o, dx, dz, ry = 0) => { o.position.set(tx + dx, t.y, tz + dz); o.rotation.y = ry; add(o); };
  put(makeKatsuCurry(), -0.55, -0.08, 0.1);
  put(makeCornDog(), -0.1, 0.12, 1.35);
  put(makePorkBun(), 0.32, -0.1, -0.4);
  put(makeMelonBread('orange'), 0.62, 0.15, 0);
  put(makeMelonBread('green'), 0.66, -0.17, 0.5);
  put(makeYogurtDrink(), 0.42, 0.2, 0.3);
  put(makeKetchupBottle(), -0.32, -0.24, 0.4);
  put(makeTunaCan(), 0.78, -0.05, 2.2);
  { const t2 = makeTunaCan(); put(t2, 0.78, -0.05, 0.6); t2.position.y += 0.039; }
  put(makeEnergyCan(), 0.12, -0.2, 2.6);
  put(makeUmeSour(), -0.28, 0.22, 2.9);
  put(makeCocoCan(), -0.82, 0.18, 2.4);
  const cand = makeCandyPack(); put(cand, -0.75, -0.2, 0.3); cand.rotation.x = -Math.PI / 2; cand.position.y += 0.007;
  const ch = makeCheeseSticks(); put(ch, 0.05, -0.27, 0.1); ch.rotation.x = -Math.PI / 2 + 0.05; ch.position.y += 0.02; ch.position.z += 0.1;
  const pd = makePizzaDisplay(); pd.position.set(NS.x - 3.2, 0, NS.z + 1.1); pd.rotation.y = 0.15; add(pd);
  rect(NS.x - 3.85, NS.x - 2.55, NS.z + 0.7, NS.z + 1.5);
}
// ------------------------------------------------------------------ abandoned office (grime photos, item 29)
// A vacant unit on the forecourt's north edge, beside the bar alley; rotated half a turn so it faces the
// forecourt: local (x, z) -> world (AO.x - x, AO.z - z).
const AO = { x: 12.4, z: 73.6 };
const abOffice = makeAbandonedOffice();
abOffice.position.set(AO.x, 0, AO.z); abOffice.rotation.y = Math.PI; add(abOffice);
for (const [x0, x1, z0, z1] of abOffice.userData.colliders) colliders.push({ type: 'box', minX: AO.x - x1, maxX: AO.x - x0, minZ: AO.z - z1, maxZ: AO.z - z0 });
const aoAreas = abOffice.userData.areas.map((a) => ({ minX: AO.x - a.maxX, maxX: AO.x - a.minX, minZ: AO.z - a.maxZ, maxZ: AO.z - a.minZ, y0: -0.5, y1: 0.6 }));
aoAreas.push({ minX: 8.4, maxX: 15.9, minZ: 69, maxZ: 73.2, y0: -0.5, y1: 0.6 });     // the strip of forecourt in front of it
add(plane(new THREE.MeshStandardMaterial({ color: '#5a5650', roughness: 0.9 }), 8.2, 16.4, 72, 73.7, 0.006, 1));
// ------------------------------------------------------------------ the Knot Room bar (grime photos, item 30)
// On the forecourt's east edge between the Go-club building and the abandoned office, front facing west.
// rotation -90 deg: local (x, z) -> world (KR.x - z, KR.z + x)
const KR = { x: 14.4, z: 69.5 };
const knot = makeKnotRoom();
knot.position.set(KR.x, 0, KR.z); knot.rotation.y = -Math.PI / 2; add(knot);
for (const [x0, x1, z0, z1] of knot.userData.colliders) colliders.push({ type: 'box', minX: KR.x - z1, maxX: KR.x - z0, minZ: KR.z + x0, maxZ: KR.z + x1 });
const krAreas = knot.userData.areas.map((a) => ({ minX: KR.x - a.maxZ, maxX: KR.x - a.minZ, minZ: KR.z + a.minX, maxZ: KR.z + a.maxX, y0: -0.5, y1: 0.6 }));
// 36 Vehicles: the kei mini-truck on its recycling round, parked at the kerb of the west street
const KT = { x: -22.75, z: 44.5, rot: -Math.PI / 2 };
townCars.push(['keitruck', { name: 'kei truck', color: '#e4e4e0', rim: 'steel', metal: 0.1, plate: 'ELM 480' }, KT.x, KT.z, KT.rot + H90]);
// the outfitter's white work van, parked nose-to-tail behind the truck
const KV = { x: -22.8, z: 39.7, rot: -Math.PI / 2 };
townCars.push(['keivan', { name: 'work van', color: '#eeeeea', rim: 'steel', metal: 0.1, plate: 'ELM 3W1', bands: [[0.6, 0.7, '#e8742a']],
  decals: [{ w: 1.7, h: 0.26, y: 0.86, z: -0.35, draw: (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#1d2f6a'; fitText(x, 'Hataraku Shokai', w / 2, h * 0.42, w * 0.94, h * 0.5, F.heavy); x.fillStyle = '#3a3c40'; fitText(x, 'work clothes · work goods · 555-0148', w / 2, h * 0.84, w * 0.9, h * 0.2, F.label); } }] }, KV.x, KV.z, KV.rot + H90]);
// the silver kei hot hatch with its stripe livery, next in the row
const KH = { x: -22.8, z: 35.4, rot: -Math.PI / 2 };
townCars.push(['keisport', { name: 'kei hot hatch', color: '#b8bcc0', metal: 0.7, rim: 'alloy', lip: true, fog: true, roofSpoiler: true, plate: 'ELM K5T',
  bands: [[0.2, 0.27, '#2a2b2d'], [0.35, 0.38, '#e8742a'], [0.395, 0.425, '#1f9aa8'], [0.44, 0.47, '#1d2f6a']],
  decals: [{ w: 0.9, h: 0.22, y: 0.62, z: 0.25, draw: (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#1d2f6a'; fitText(x, 'Kestrel Sport', w / 2, h * 0.62, w * 0.95, h * 0.8, F.script || F.heavy); } }] }, KH.x, KH.z, KH.rot + H90]);
// the orange vintage scooter and the rusted-out one beside it, nosed in on the sidewalk past the truck
const vs = makeVintageScooter(); vs.position.set(-20.9, 0.12, 48.4); vs.rotation.y = Math.PI; add(vs);
const rs = makeRustedScooter(); rs.position.set(-20.95, 0.12, 49.35); rs.rotation.y = Math.PI + 0.12; add(rs);
rect(-21.95, -20.0, 47.9, 49.8);
// the commuter train waiting at a platform behind the station gate
const TP = { x: -28, z: 75.6 };
const platform = makeTrainPlatform(26); platform.position.set(TP.x, 0, TP.z); add(platform);
const train = makeCommuterTrain(); train.position.set(TP.x + 1.5, 0.31, TP.z + platform.userData.trackZ); add(train);
rect(TP.x - 13, TP.x + 13, TP.z + 0.05, TP.z + 4.6);                               // the track bed + train
const pSt = platform.userData.stairs;
rect(TP.x - 13, TP.x + pSt.x0 - 0.05, TP.z - 3.05, TP.z - 2.9); rect(TP.x + pSt.x1 + 0.05, TP.x + 13, TP.z - 3.05, TP.z - 2.9);   // platform back edge
rect(TP.x - 13.2, TP.x - 13, TP.z - 3, TP.z); rect(TP.x + 13, TP.x + 13.2, TP.z - 3, TP.z);
// 50 Bad-parker easter egg: a compact-spaces corner on the west side of the grocery lot, the red pickup
// crooked across two spaces under the NO TRUCKS sign (wall along x, facing east)
const BP = { x: 13.6, z: -29.6 };
const bpc = makeCompactCorner({ truck: false }); bpc.position.set(BP.x, 0, BP.z); bpc.rotation.y = Math.PI / 2; add(bpc);
{ const tp = bpc.userData.truckPose; townCars.push(['bigtruck', { name: 'big red pickup', color: '#8e1a1e', chromeGrille: true, plate: 'BIG-RIG 1', rim: 'alloy' }, BP.x + tp.z, BP.z - tp.x, tp.ry + Math.PI / 2 + H90]); }
for (const [x0, x1, z0, z1] of bpc.userData.colliders) colliders.push({ type: 'box', minX: BP.x + z0, maxX: BP.x + z1, minZ: BP.z - x1, maxZ: BP.z - x0 });
// 52 Listing flyers: a realty office window on the blank south face of the block between the old-town street
// and the forecourt, facing the station plaza; a paved strip in front so it can be reached
const RW = { x: -14.4, z: 47.75 };
{ const rw = makeRealtyWindow(); rw.position.set(RW.x, 0, RW.z); add(rw); rect(RW.x - 1.9, RW.x + 1.9, RW.z - 0.3, RW.z + 0.05);
  add(plane(mats.lotConcrete, -19.7, -9.2, 47.4, 51.9, 0.005, 4)); }
// 54 Cleaning robot: patrols the underground mall hall (a loop around the burl kiosk and down the pillar line)
const cleanBot = makeCleanBot(); cleanBot.position.y = -4.2; add(cleanBot);
const cleanBotUpdate = cleanBot.userData.patrol([[MALL.x + 1.2, MALL.z - 12], [MALL.x + 1.2, MALL.z + 10], [MALL.x - 4.5, MALL.z + 10], [MALL.x - 4.5, MALL.z - 12]]);
// 53 Robot vending machine, beside an ordinary blue and red machine, along the same wall west of the realty window
{ const rv = makeRobotVending(); rv.position.set(-17.85, 0, 48.05); add(rv); rect(-18.7, -17.1, 47.6, 48.7);
  const b = makePlainVending('#1d4aa8'); b.position.set(-16.55, 0, 47.85); add(b); rect(-17.05, -16.05, 47.45, 48.25);
  const r = makePlainVending('#b81a22'); r.position.set(-19.3, 0, 47.85); add(r); rect(-19.8, -18.8, 47.45, 48.25); }
// 51 Smashed cart: a cart corral in the grocery lot with the crushed cart jammed against it
{ const cc = makeCartCorral(); cc.position.set(12.6, 0, -22.4); add(cc); const c = cc.userData.collider; rect(12.6 + c[0], 12.6 + c[1], -22.4 + c[2], -22.4 + c[3]); }
// 49 Misc 2: the folding e-bike locked to a wave rack on the old-town sidewalk; the user's pour-painting grid
// and confetti watercolour hung on the pawn shop's north wall (art for sale)
{ const wr = makeWaveRack(); wr.position.set(-20.6, 0.12, 41.5); wr.rotation.y = Math.PI / 2; add(wr); rect(-20.75, -20.45, 40.4, 41.5);
  const eb = makeFoldingEbike(); eb.position.set(-20.95, 0.12, 41.05); eb.rotation.y = Math.PI / 2; add(eb); rect(-21.25, -20.65, 40.2, 41.9);
  const pg = makePourGrid(); pg.position.set(57.8, 1.75, -29.97); add(pg);
  const cf = makeCanvas('canvas_confetti.png', 0.62, 0.8); cf.position.set(59.3, 1.7, -29.97); add(cf); }
// 48 Misc: a dried rose in a bud vase on the restaurant's bar counter; the prop pistol on the pawn shop's
// till counter; the white blue-glow PC on the floor of the junk & retro shop beside the shelf
{ const rose = makeDriedRose(); rose.position.set(1.7 + 1.5, 1.07, Z0 + 0.3); add(rose);
  const pis = makePropPistol(); pis.position.set(55.2 + 8 - 1.5, 1.045, -25.5 + 2.85); pis.rotation.y = 0.6; pis.scale.setScalar(1.1); add(pis);
  const wpc = makeWhitePC(); wpc.position.set(3.5 - (9 / 2 - 0.4), 0, 12.2 + 3.3); wpc.rotation.y = Math.PI / 2; add(wpc); rect(-1.0, -0.5, 15.05, 15.55); }
// 46 Burl veneer: a luxury watch kiosk in the underground mall hall
const burlK = makeBurlKiosk(); burlK.position.set(MALL.x - 2.6, -4.2, MALL.z - 7); add(burlK);
{ const c = burlK.userData.collider; colliders.push({ type: 'box', minX: MALL.x - 2.6 + c[0], maxX: MALL.x - 2.6 + c[1], minZ: MALL.z - 7 + c[2], maxZ: MALL.z - 7 + c[3], y0: -4.6, y1: -1.6 }); }
// 45 Street graffiti: a sticker-bombed utility box and a mildewed no-parking sign at the plaza's south edge
const stBox = makeStickerBox(); stBox.position.set(-21.5, 0, 10.6); stBox.rotation.y = Math.PI; add(stBox);
rect(-22.2, -20.1, 10.3, 10.9);
const mSign = makeMoldySign(); mSign.position.set(-23.3, 0, 10.9); mSign.rotation.y = Math.PI; add(mSign);
rect(-23.4, -23.2, 10.85, 11.0);
// 44 Short school bus, at the west kerb of the old-town street behind the coach (nose north)
const SB = { x: -29.7, z: 23.5 };
const schoolBus = makeSchoolBus(); schoolBus.position.set(SB.x, 0, SB.z); schoolBus.rotation.y = Math.PI / 2; add(schoolBus);
rect(SB.x - 1.25, SB.x + 1.25, SB.z - 3.6, SB.z + 3.9);
// 42 Gig posters: a venue poster case on the restaurant's blank west wall, facing the plaza
const posterCase = makePosterCase(); posterCase.position.set(-8.3, 0, 0); posterCase.rotation.y = -Math.PI / 2; add(posterCase);
rect(-8.65, -8.0, -1.6, 1.6);
// 41 Pawn & sport shop, east of the grocery lot, door facing west onto the lot
const GSH = { x: 55.2, z: -25.5 };
const gunShop = makeGunShop(); gunShop.position.set(GSH.x, 0, GSH.z); add(gunShop);
for (const [x0, x1, z0, z1] of gunShop.userData.colliders) colliders.push({ type: 'box', minX: GSH.x + x0, maxX: GSH.x + x1, minZ: GSH.z + z0, maxZ: GSH.z + z1 });
const gshArea = (() => { const a = gunShop.userData.area; return { minX: GSH.x + a.minX - 0.4, maxX: GSH.x + a.maxX, minZ: GSH.z + a.minZ, maxZ: GSH.z + a.maxZ }; })();
// 40 Nature trail: a patch of hillside forest north-west of the city plaza
const TRL = { x: -44, z: -14 };
const trail = makeTrail(); trail.position.set(TRL.x, 0, TRL.z); add(trail);
for (const [x0, x1, z0, z1] of trail.userData.colliders) colliders.push({ type: 'box', minX: TRL.x + x0, maxX: TRL.x + x1, minZ: TRL.z + z0, maxZ: TRL.z + z1 });
// 55 Moss creature: its grass-mound nest in a clearing just off the trail; it roams the trail (local trail points),
// stops to look around, goes home to sit, and turns to watch the player when they come close
const MCM = { x: TRL.x - 17, z: TRL.z - 5.8 };
const mossMound = makeMossMound(2.2, 0.55); mossMound.position.set(MCM.x, 0, MCM.z); add(mossMound);
const moundY = (x, z) => mossMound.userData.height(x - MCM.x, z - MCM.z);
const mossCreature = makeMossCreature(); add(mossCreature);
const mossCreatureUpdate = mossCreature.userData.brain({
  nodes: [[-17.3, -6.0], [-11, -5.6], [-13.5, -8], [-15, -10.8], [-17.5, -12.6], [-21, -13.2], [-24, -15], [-26.5, -17.8]].map(([x, z]) => [TRL.x + x, TRL.z + z]),
  links: [[2, 3], [2], [0, 1, 3], [0, 2, 4], [3, 5], [4, 6], [5, 7], [6]],
  home: 0, ground: moundY,
  player: () => (mode === 'walk' ? walk.position : null),
});
const trlArea = (() => { const a = trail.userData.area; return { minX: TRL.x + a.minX, maxX: TRL.x + a.maxX, minZ: TRL.z + a.minZ, maxZ: TRL.z + a.maxZ }; })();
const platformY = (x, z) => {
  const lx = x - TP.x, lz = z - TP.z;
  if (lx >= -13 && lx <= 13 && lz >= -3 && lz <= 0) return PLAT_Y;
  if (lx >= pSt.x0 && lx <= pSt.x1 && lz >= pSt.z0 && lz < pSt.z1) return PLAT_Y * Math.ceil((lz - pSt.z0) / (pSt.z1 - pSt.z0) * 7) / 7;
  return null;
};
// the red coach, pulled in at the opposite kerb (nose north)
const CBP = { x: -29.7, z: 37, rot: Math.PI / 2 };
const coach = makeCoachBus(); coach.position.set(CBP.x, 0, CBP.z); coach.rotation.y = CBP.rot; add(coach);
rect(CBP.x - 1.3, CBP.x + 1.3, CBP.z - 6.1, CBP.z + 6.1);
// the dusty olive scout truck, left to rot in the dirt lot (front right tyre flat)
const ST = { x: 39.9, z: -0.6, rot: Math.PI / 2 + 0.04 };
townCars.push(['scout', { name: 'scout truck', color: '#4f5636', roofColor: '#a9aca4', dust: 0.5, rimColor: '#c8641e', rim: 'steel', roundLamps: true, brushGuard: true, flat: 0, plate: 'ELM 70S' }, ST.x, ST.z, ST.rot + H90]);
const mallAreas = mall.userData.areas.map((a) => ({ ...a, minX: a.minX + MALL.x, maxX: a.maxX + MALL.x, minZ: a.minZ + MALL.z, maxZ: a.maxZ + MALL.z }));
{
  // forecourt: rain-soaked concrete slabs with puddles (rainy-plaza photo, 28k), cut around the stair well
  const tl = new THREE.TextureLoader();
  const ld = (n, srgb) => { const t = tl.load('assets/textures/' + n); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t; };
  const slabC = ld('rp_slab.png', true), slabR = ld('rp_slab_r.png', false);
  const slabM = new THREE.MeshStandardMaterial({ map: slabC, roughnessMap: slabR, roughness: 1, metalness: 0.05 });
  for (const [a, b, c, d] of [[-9, 0.2, 49, 72], [3.8, 14, 49, 72], [0.2, 3.8, 49, 50.9], [0.2, 3.8, 58.7, 72]]) add(plane(slabM, a, b, c, d, 0.007, 3));
  // two paved walkways across it (sidewalk-tiles photo): dark pavers with light-grey edge bands, moss in the joints
  const pvD = ld('mp_paver.png', true), pvL = ld('mp_paver_light.png', true);
  const pvMats = new Map();
  const pv = (tex, a, b, c, d, y) => { if (!pvMats.has(tex)) pvMats.set(tex, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 })); add(plane(pvMats.get(tex), a, b, c, d, y, 0.9)); };
  // north-south to the bar alley mouth (x -4.2..0.2), east-west from the mall kiosk to the Go-club stairs
  pv(pvL, -4.4, -0.0, 59.4, 72, 0.009); pv(pvD, -3.5, -0.9, 59.4, 72, 0.010);
  pv(pvL, -4.4, 14, 59.4, 63.0, 0.0095); pv(pvD, -3.5, 14, 60.3, 62.1, 0.0105);
}

// delivery props elsewhere: drinks + bag outside an Elmwood unit door, a delivery tote by the scooter
{
  const c = makeCupCarrier(); c.position.set(-0.6, 1.4, -2.8); apt.add(c);
  const b = makePaperBag({ seed: 9 }); b.position.set(-0.6, 1.4, -3.65); b.rotation.y = 0.3; apt.add(b);
  const d = makeDeliveryBag(); d.position.set(49.6, 0, 6.0); d.rotation.y = -0.8; add(d);
}

console.log('T oldtown', Math.round(performance.now()));
// ------------------------------------------------------------------ city district (town expansion)
// A street grid east of the old town (Cedar Avenue at x 75, cross streets every 84 m), generated buildings in the
// wall photos, lit windows + made-up shopfronts, lamps and street trees; far towers and hills all round.
const district = makeDistrict(); add(district);
for (const [x, z] of district.userData.lampPosts) circle(x, z, 0.18);
for (const [x, z] of district.userData.treePosts) circle(x, z, 0.25);
// driving round 3: Elm Loop round the district + the Loop Jump Lot (ramps, boost pads)
const roads = makeRoads(); add(roads); colliders.push(...roads.userData.colliders);
// 92 street services along the district streets: traffic lights, bus stops, phone booths, mailboxes, benches, bins,
// news stands (instanced: see street92.js)
const svc = placeStreetServices({ grid: GRID, sidewalkY: district.userData.sidewalkY }); scene.add(svc.group); colliders.push(...svc.colliders);
console.log('street services:', JSON.stringify(svc.group.userData.counts));
console.log('T districtgrid', Math.round(performance.now()));
window.__texPhase = 'district';   // (tools/record_zones.js: textures first requested from here are district-only)
const DISTRICT_FROM = room.children.length;   // (streaming: everything added from here on is static district content)
// 57 Brightwater Dental: on its lot on Cedar Avenue (local +z = the storefront, facing the avenue, -x)
const DN = { x: 95, z: 39 };
const dentist = makeDentistOffice(); dentist.position.set(DN.x, 0.14, DN.z); dentist.rotation.y = -Math.PI / 2; add(dentist);
const dnW = ([x0, x1, z0, z1]) => [DN.x - z1, DN.x - z0, DN.z + x0, DN.z + x1];   // local rect -> world rect
// 58 treatment rooms behind the waiting room (same local frame)
const wing = makeTreatmentWing(); dentist.add(wing);
for (const c of wing.userData.colliders) rect(...dnW(c));
for (const c of dentist.userData.colliders) rect(...dnW(c));
// 59 utility + parking lot on Cedar Avenue (lot B): transformer, wall cabinets, telecom pedestal, sprinkler connection,
// accessible stall + signs, fallen leaves
const UL = { x: 93, z: -40 };
const ulot = makeUtilityLot(); ulot.position.set(UL.x, 0, UL.z); add(ulot);
for (const [x0, x1, z0, z1] of ulot.userData.colliders) rect(UL.x + x0, UL.x + x1, UL.z + z0, UL.z + z1);
const ulArea = (() => { const a = ulot.userData.area; return { minX: UL.x + a.minX, maxX: UL.x + a.maxX, minZ: UL.z + a.minZ, maxZ: UL.z + a.maxZ }; })();
// 61 sport coupe: parked nose-in in a regular stall of the utility lot; a crashed one nosed into the fence of the
// vacant lot downtown (lot D, its fence on the z = -7 side)
const COUPE61 = { type: 'coupe', L: 4.385, W: 1.745, H: 1.295, WB: 2.51, color: '#f2f2ee', roofColor: '#141416', kit: true, wing: true, bigExhaust: true, rim: 'alloy', plate: 'PTW 4417' };
townCars.push(['coupe', { ...COUPE61, name: 'white coupe' }, UL.x + 7.7, UL.z + 4.85, H90]);
// the crashed twin stays a wreck (not drivable): crumpled nose, a headlight gone, wing snapped, a wheel knocked in
const wreck = makeCar({ ...COUPE61, crash: true, plate: 'PTW 4471', name: 'wreck' }); wreck.position.set(229.5, 0.02, -5.0); wreck.rotation.y = -Math.PI / 2 + 0.12 + H90; add(wreck); rect(228.4, 230.6, -7.4, -2.8);
// 62 self storage on lot C: a row of orange roll-up doors facing the cross street (z = 84), two units open
const SS = { x: 176, z: 96 };
const storage = makeStorageRow(); storage.position.set(SS.x, 0.02, SS.z); add(storage);
for (const [x0, x1, z0, z1] of storage.userData.colliders) rect(SS.x + x0, SS.x + x1, SS.z + z0, SS.z + z1);
const stAreas = storage.userData.areas.map((a) => ({ minX: SS.x + a.minX, maxX: SS.x + a.maxX, minZ: SS.z + a.minZ, maxZ: SS.z + a.maxZ }));
stAreas.push({ minX: 176, maxX: 194, minZ: 90.5, maxZ: 92.2 });   // from the sidewalk onto the apron
// 64 street batch: corner store on the corner of 161st Ave + the main street, a police sedan at the curb outside it,
// the aircraft nose on its carport across the main street
const CS = { x: 176, z: -12 };
const cstore = makeCornerStore(); cstore.position.set(CS.x, 0.14, CS.z); add(cstore);
for (const [x0, x1, z0, z1] of cstore.userData.colliders) rect(CS.x + x0, CS.x + x1, CS.z + z0, CS.z + z1);
const csAreas = cstore.userData.areas.map((a) => ({ minX: CS.x + a.minX, maxX: CS.x + a.maxX, minZ: CS.z + a.minZ, maxZ: CS.z + a.maxZ }));
townCars.push(['sedan', { name: 'police car', color: '#f4f4f2', livery: LIVERIES.police, plate: 'ELM P07', rim: 'steel', bands: [[0.15, 0.55, '#16181c']] }, 181, -3.7, Math.PI + H90]);
const AC = { x: 259, z: 14 };
const acp = makeAircraftCarport(); acp.position.set(AC.x, 0.14, AC.z); acp.rotation.y = Math.PI; add(acp);
for (const [x0, x1, z0, z1] of acp.userData.colliders) rect(AC.x - x1, AC.x - x0, AC.z - z1, AC.z - z0);
// 65 signage: the comic & net cafe's street signs + a ramen ticket machine, on the sidewalk two doors down from the store
const CF = { x: 198, z: -6.2 };
const cafe = makeCafeFrontage(); cafe.position.set(CF.x, 0.14, CF.z); add(cafe);
for (const [x0, x1, z0, z1] of cafe.userData.colliders) rect(CF.x + x0, CF.x + x1, CF.z + z0, CF.z + z1);
// 67 canal walkway park on lot D (street side toward the main street at +z), the story sign on its path
const CP = { x: 223, z: -19 };
const canal = makeCanalPark(); canal.position.set(CP.x, 0.75, CP.z); add(canal);
for (const [x0, x1, z0, z1] of canal.userData.colliders) rect(CP.x + x0, CP.x + x1, CP.z + z0, CP.z + z1);
const cpArea = (() => { const a = canal.userData.area; return { minX: CP.x + a.minX, maxX: CP.x + a.maxX, minZ: CP.z + a.minZ, maxZ: CP.z + a.maxZ }; })();
// 68 the art gallery (the user's paintings) on its lot facing the main street
const AG = { x: 344, z: 13 };
const gallery = makeArtGallery(); gallery.position.set(AG.x, 0.14, AG.z); gallery.rotation.y = Math.PI; add(gallery);
for (const [x0, x1, z0, z1] of gallery.userData.colliders) rect(AG.x - x1, AG.x - x0, AG.z - z1, AG.z - z0);
const agAreas = gallery.userData.areas.map((a) => ({ minX: AG.x - a.maxX, maxX: AG.x - a.minX, minZ: AG.z - a.maxZ, maxZ: AG.z - a.minZ }));
// 69 Bulk Barn warehouse store, facing the street at z = 84
const WH = { x: 286, z: 108 };
const whs = makeWarehouseStore(); whs.position.set(WH.x, 0.14, WH.z); whs.rotation.y = Math.PI; add(whs);
for (const [x0, x1, z0, z1] of whs.userData.colliders) rect(WH.x - x1, WH.x - x0, WH.z - z1, WH.z - z0);
const whAreas = whs.userData.areas.map((a) => ({ minX: WH.x - a.maxX, maxX: WH.x - a.minX, minZ: WH.z - a.maxZ, maxZ: WH.z - a.minZ }));
// 70 a quiet street west of the main crossing: Kiln & Co. pottery, the old izakaya, the aqueduct ruins garden with a
// small station-style plaza and the rainbow mural, street props on the sidewalk (z -7..-5)
const i5Areas = [];
const placeL = (o, x, z, ry = 0, y = 0.14) => { o.position.set(x, y, z); o.rotation.y = ry; add(o); const c = o.userData.collider; if (c) { const q = Math.round(ry / (Math.PI / 2)) & 3; const [a0, b0, c0, c1] = c; let r; if (q === 0) r = [a0, b0, c0, c1]; else if (q === 2) r = [-b0, -a0, -c1, -c0]; else if (q === 1) r = [c0, c1, -b0, -a0]; else r = [-c1, -c0, a0, b0]; rect(x + r[0], x + r[1], z + r[2], z + r[3]); } return o; };
{ const pg = makePotteryGallery(); pg.position.set(105.5, 0.14, -11.0); add(pg); for (const [x0, x1, z0, z1] of pg.userData.colliders) rect(105.5 + x0, 105.5 + x1, -11 + z0, -11 + z1); for (const a of pg.userData.areas) i5Areas.push({ minX: 105.5 + a.minX, maxX: 105.5 + a.maxX, minZ: -11 + a.minZ, maxZ: -11 + a.maxZ }); }
placeL(makeIzakaya(), 116.5, -7.15);
{ const gd = makeAqueductGarden(); gd.position.set(132, 0, -13.5); add(gd); for (const [x0, x1, z0, z1] of gd.userData.colliders) rect(132 + x0, 132 + x1, -13.5 + z0, -13.5 + z1); i5Areas.push({ minX: 124.2, maxX: 139.8, minZ: -13.8, maxZ: -7.0 }); }
const pav = new THREE.Mesh(new THREE.PlaneGeometry(13, 14), new THREE.MeshStandardMaterial({ map: (() => { const t = new THREE.TextureLoader().load('assets/textures/i5_paving.png'); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4); return t; })(), roughness: 0.85 }));
pav.rotation.x = -Math.PI / 2; pav.position.set(147, 0.03, -14.5); pav.receiveShadow = true; add(pav); i5Areas.push({ minX: 140.6, maxX: 153.4, minZ: -21.2, maxZ: -7.0 });
placeL(makeRainbowMural(), 147, -21.3, 0, 0);
for (const [x, z] of [[143.5, -17.5], [150.5, -17.5], [143.5, -11.5]]) placeL(makeBarrelPlanter(Math.round(x)), x, z, 0, 0);
placeL(makeCurvedBench(), 147, -16.2, Math.PI, 0); placeL(makeCurvedBench(), 147, -12.0, 0, 0);
placeL(makeWeepingMaple(), 150.5, -11.0, 0, 0); placeL(makeWifiStand(), 152.4, -8.2, 0, 0);
placeL(makePizzaAFrame(), 101.2, -6.1, 0.3); placeL(makeComicVending(), 110.6, -6.5, 0); placeL(makeStickerPost(), 121.6, -5.6, 0);
// 71 Inspiration 6: the Bulk Barn staff corner (walk-in egg cooler, baler, bags of plastic, shelf strips, taped notices),
// a used-games shelf in its electronics corner, a shelf of clear bins + yakisoba; a pink bungalow with a bottle tree
// on the residential street at z = 84 (pink crown TV in the front room), a dark and a white sedan at the curb
const whPut = (o, lx, lz, ry = 0) => { o.position.set(lx, 0, lz); o.rotation.y = ry; whs.add(o); const cs = o.userData.colliders || (o.userData.collider ? [o.userData.collider] : []);
  const q = Math.round(ry / (Math.PI / 2)) & 3;
  for (const [a, b, c0, c1] of cs) { let r; if (q === 0) r = [a, b, c0, c1]; else if (q === 2) r = [-b, -a, -c1, -c0]; else if (q === 1) r = [c0, c1, -b, -a]; else r = [-c1, -c0, a, b];
    rect(WH.x - (lx + r[1]), WH.x - (lx + r[0]), WH.z - (lz + r[3]), WH.z - (lz + r[2])); } };
whPut(makeBackroomCorner(), 15.6, -10.9);
whPut(makeGameShelf(), -19.6, -6.5, Math.PI / 2);
whPut(makeBinShelf(), -6, -1.6);
const PH = { x: 175, z: 74.6 };
const pink = makePinkHouse(); pink.position.set(PH.x, 0.02, PH.z); add(pink);
for (const [x0, x1, z0, z1] of pink.userData.colliders) rect(PH.x + x0, PH.x + x1, PH.z + z0, PH.z + z1);
townCars.push(['sedan', { name: 'black sedan', color: '#26282c', plate: 'KTR 2210' }, 170.5, 80.4, H90], ['sedan', { name: 'white sedan', color: '#eef0f0', plate: 'BLV 4417', chromeGrille: true }, 179.0, 80.4, H90]);
// 72 Inspiration 7: the Pixel Den arcade (lounge + game room behind a black arch) with a shuttered yakitori stall and
// street props beside it on the z = 84 street; a temple front with lantern walls on the main street; the county
// fairgrounds (jet trainer, picnic shelter, parked ride trailers) on the z = 168 street; a cairn on the nature trail
const piMap = (X, Z, c) => [X - c[1], X - c[0], Z - c[3], Z - c[2]];   // local rect -> world for a group turned by pi
const AR = { x: 348, z: 101 };
const arcade = makeArcade(); arcade.position.set(AR.x, 0.14, AR.z); arcade.rotation.y = Math.PI; add(arcade);
for (const c of arcade.userData.colliders) rect(...piMap(AR.x, AR.z, c));
const arAreas = arcade.userData.areas.map((a) => { const [minX, maxX, minZ, maxZ] = piMap(AR.x, AR.z, [a.minX, a.maxX, a.minZ, a.maxZ]); return { minX, maxX, minZ, maxZ }; });
{ const sh = makeShutterStall(); sh.position.set(362.6, 0.14, 93.0); sh.rotation.y = Math.PI; add(sh); rect(...piMap(362.6, 93.0, sh.userData.collider));
  const dr = makeStreetDrum(); dr.position.set(366.4, 0.14, 91.9); dr.rotation.y = Math.PI; add(dr); rect(...piMap(366.4, 91.9, dr.userData.collider)); }
const TM = { x: 393, z: -7 };
const temple = makeTempleFront(); temple.position.set(TM.x, 0.02, TM.z); add(temple);
for (const [x0, x1, z0, z1] of temple.userData.colliders) rect(TM.x + x0, TM.x + x1, TM.z + z0, TM.z + z1);
const tmSt = temple.userData.stairs;
const FG = { x: 206, z: 144.5 };
const fair = makeFairground(); fair.position.set(FG.x, 0, FG.z); add(fair);
for (const [x0, x1, z0, z1] of fair.userData.colliders) rect(FG.x + x0, FG.x + x1, FG.z + z0, FG.z + z1);
{ const cx = TRL.x - 22.6, cz = TRL.z - 11.9; const cy = trail.userData.floorY(cx - TRL.x, cz - TRL.z) ?? 0; const cn = makeCairn(); cn.position.set(cx, cy, cz); add(cn); rect(cx - 0.45, cx + 0.45, cz - 0.4, cz + 0.4); }
// 73 batch 73: an old-town shop row on the north side of the z = -84 street (Coconut Raft, the Tsurukame izakaya, the
// junk-balcony shop + overgrown vending machine, Club Nova arcade, Denki Land with capsule machines) and a pocket park
// opposite (dome talisman burner, dome shed with the sickle, underground-parking stair kiosk)
const OT = { x: 253, z: -91 };
const otRow = makeOldTownRow(); otRow.position.set(OT.x, 0.14, OT.z); add(otRow);
for (const [x0, x1, z0, z1] of otRow.userData.colliders) rect(OT.x + x0, OT.x + x1, OT.z + z0, OT.z + z1);
const otAreas = otRow.userData.areas.map((a) => ({ minX: a.minX + OT.x, maxX: a.maxX + OT.x, minZ: a.minZ + OT.z, maxZ: a.maxZ + OT.z }));
const PP = { x: 288, z: -77 };
const ppark = makePocketPark(); ppark.position.set(PP.x, 0, PP.z); add(ppark);
for (const [x0, x1, z0, z1] of ppark.userData.colliders) rect(PP.x + x0, PP.x + x1, PP.z + z0, PP.z + z1);
// 74 batch 74: street details on the old-town row's curb (an ad panel on a post, a stickered pole, a stickered
// steel pillar) and a queue card + an energy can on the izakaya's standing table
{ const ap = makeAppAdPost(); ap.position.set(300.5, 0.14, -89.6); add(ap); rect(300.2, 300.8, -89.7, -89.45);
  const sp = makeStickerPole(); sp.position.set(296.0, 0.14, -89.5); add(sp); rect(295.88, 296.12, -89.62, -89.38);
  const pl = makeStickerPillar(); pl.position.set(303.8, 0.14, -89.7); add(pl); rect(303.59, 304.01, -89.91, -89.49);
  const tY = 0.14 + 1.02; const qc = makeQueueCard(2); qc.position.set(263.55, tY, -89.85); qc.rotation.y = 0.4; add(qc);
  const ec = makeEnergyCan74(); ec.position.set(262.97, tY, -90.1); add(ec); }
// 75 batch 75: the Nakamachi Arcade mall passage on the lot west of the pocket park, entrance on the z = -84 street
const NM = { x: 259, z: -77 };
const nmall = makeMallPassage(); nmall.position.set(NM.x, 0.14, NM.z); nmall.rotation.y = Math.PI; add(nmall);
for (const c of nmall.userData.colliders) rect(...piMap(NM.x, NM.z, c));
const nmAreas = nmall.userData.areas.map((a) => { const [minX, maxX, minZ, maxZ] = piMap(NM.x, NM.z, [a.minX, a.maxX, a.minZ, a.maxZ]); return { minX, maxX, minZ, maxZ }; });
// 76 batch 76: the dusty kei car in its own garage next to the pink house (with a camp-stove breakfast); the walk-in
// freezer + cardboard-patched coolers are inside Bulk Barn (inspo69); the PLEASE LAY FLAT painting is in the gallery
const KG = { x: 186.5, z: 77 };
const kgar = makeKeiGarage({ car: false }); kgar.position.set(KG.x, 0.02, KG.z); add(kgar);
townCars.push(['keiold', { name: 'dusty kei car', color: '#4a78b8', dust: 0.9, rim: 'steel', plate: 'ELM 360' }, KG.x + kgar.userData.carPose.x, KG.z + kgar.userData.carPose.z, 0]);
for (const [x0, x1, z0, z1] of kgar.userData.colliders) rect(KG.x + x0, KG.x + x1, KG.z + z0, KG.z + z1);
const kgAreas = kgar.userData.areas.map((a) => ({ minX: a.minX + KG.x, maxX: a.maxX + KG.x, minZ: a.minZ + KG.z, maxZ: a.maxZ + KG.z }));
// 77 batch 77: Hearth Market (dairy aisle under the blue scroll mural, deli corn dogs, online-pickup staging) on the
// north side of the z = 168 street; the one-eye painting is in the gallery
const HM = { x: 274, z: 161 };
const hmkt = makeHearthMarket(); hmkt.position.set(HM.x, 0.14, HM.z); add(hmkt);
for (const [x0, x1, z0, z1] of hmkt.userData.colliders) rect(HM.x + x0, HM.x + x1, HM.z + z0, HM.z + z1);
const hmAreas = hmkt.userData.areas.map((a) => ({ minX: a.minX + HM.x, maxX: a.maxX + HM.x, minZ: a.minZ + HM.z, maxZ: a.maxZ + HM.z }));
// 78 batch 78: the two pillar bricks: Hearth Market is now built of the tan one; the pocket park gets a white-brick
// gateway on its street side, and two tan pillars stand either side of Hearth Market's doors
{ const gw = makeParkGateway(); gw.position.set(PP.x, 0.14, PP.z - 0.3); add(gw); for (const [x0, x1, z0, z1] of gw.userData.colliders) rect(PP.x + x0, PP.x + x1, PP.z - 0.3 + z0, PP.z - 0.3 + z1);
  for (const dx of [-3.2, 3.2]) { const bp = makeBrickPillar('tan', 2.6, 0.55); bp.position.set(HM.x + dx, 0.14, HM.z + 0.9); add(bp); rect(HM.x + dx - 0.33, HM.x + dx + 0.33, HM.z + 0.57, HM.z + 1.23); } }
// 79 batch 79: a free-paper corner (red domed box, grey house box, slatted trash can, a vault lid) on the sidewalk
// just east of Hearth Market
{ const fp = makeFreePaperCorner(); fp.position.set(292.3, 0.14, 161.7); add(fp); for (const [x0, x1, z0, z1] of fp.userData.colliders) rect(292.3 + x0, 292.3 + x1, 161.7 + z0, 161.7 + z1); }
// 80 batch 80: the yellow free-paper box against Hearth Market's brick; a road-message trailer at the fairgrounds' street
// edge; the Calzone Kid takeout shop on the lot east of the free-paper corner
{ const yb = makeYellowFreeBox(); yb.position.set(270.15, 0.14, 161.95); yb.rotation.y = 0.1; add(yb); rect(269.94, 270.36, 161.77, 162.13);
  const mt = makeMessageTrailer(); mt.position.set(231.5, 0, 157.0); mt.rotation.y = 0.25; add(mt); rect(229.8, 233.3, 155.8, 159.3); }
const CK = { x: 306, z: 161 };
const ckShop = makeTakeoutShop(); ckShop.position.set(CK.x, 0.14, CK.z); add(ckShop);
for (const [x0, x1, z0, z1] of ckShop.userData.colliders) rect(CK.x + x0, CK.x + x1, CK.z + z0, CK.z + z1);
const ckAreas = ckShop.userData.areas.map((a) => ({ minX: a.minX + CK.x, maxX: a.maxX + CK.x, minZ: a.minZ + CK.z, maxZ: a.maxZ + CK.z }));
// 83 batch 83: a utility corner on Hearth Market's east wall (gas meter manifold, crushed-rock bed, junipers, grass, the
// beige telecom pedestal, a bollard and the two cans on the curb); the fine-gravel texture now surfaces the pocket
// park's paths and sandy dirt its open ground
{ const uc = makeUtilityCorner(); uc.position.set(288.12, 0.14, 150.0); uc.rotation.y = Math.PI / 2; add(uc);
  for (const [x0, x1, z0, z1] of uc.userData.colliders) rect(288.12 + z0, 288.12 + z1, 150.0 - x1, 150.0 - x0); }
// 84 batch 84: fire hydrants at three curbs, a grey steel access door with a wall-pack light over it on Hearth Market's
// east wall, worn bollards outside Calzone Kid (the cake table, stump + bark trees, tan brick are inside the modules)
{ for (const [x, z, ry] of [[294.6, 162.6, Math.PI], [296.5, -78.6, 0], [192.5, 78.4, Math.PI]]) { const h = makeDryHydrant(Math.round(x)); h.position.set(x, 0.14, z); h.rotation.y = ry; add(h); rect(x - 0.22, x + 0.22, z - 0.25, z + 0.25); }
  const sd = makeSteelDoor(); sd.position.set(288.22, 0.14, 154.6); sd.rotation.y = Math.PI / 2; add(sd);
  const wp = makeWallPack(); wp.position.set(288.22, 2.75, 154.6); wp.rotation.y = Math.PI / 2; add(wp);
  for (const x of [301.6, 310.4]) { const b = makeWornBollard(Math.round(x)); b.position.set(x, 0.14, 162.9); add(b); rect(x - 0.13, x + 0.13, 162.77, 163.03); } }
// 85 batch 85: a folded wet-floor sign and a fat concrete bollard on Hearth Market's sidewalk (the service-desk corner,
// laundry aisle, park trash cans, bench + ball, creek + culvert are placed in their modules)
{ const wf = makeWetFloorFolded(); wf.position.set(279.6, 0.142, 162.3); add(wf);
  const cb = makeConcreteBollard(); cb.position.set(281.0, 0.14, 162.7); add(cb); rect(280.75, 281.25, 162.45, 162.95); }
// 87 Elm Loop Community Garden: on the grass verge inside the Loop, west of the 2nd Street connector (gate faces it).
// Built only from textures already in the library (see garden87.js).
const CG = { x: 143.5, z: 197.5 };
const cgarden = makeCommunityGarden(); cgarden.position.set(CG.x, 0.006, CG.z); add(cgarden);
for (const [x0, x1, z0, z1] of cgarden.userData.colliders) rect(CG.x + x0, CG.x + x1, CG.z + z0, CG.z + z1);
const cgArea = { minX: CG.x + cgarden.userData.area.minX, maxX: CG.x + cgarden.userData.area.maxX + 1.2, minZ: CG.z + cgarden.userData.area.minZ, maxZ: CG.z + cgarden.userData.area.maxZ };
// 88 Nestwell Home: the furniture showroom (three furnished rooms) on the verge east of the 2nd Street connector,
// open front facing Elm Loop. Furniture set built from library textures (furniture88.js).
const NH = { x: 178.5, z: 196.4 };
const nest = makeFurnitureShowroom(); nest.position.set(NH.x, 0.006, NH.z); nest.rotation.y = Math.PI; add(nest);
for (const [x0, x1, z0, z1] of nest.userData.colliders) rect(NH.x - x1, NH.x - x0, NH.z - z1, NH.z - z0);
const nhAreas = [{ minX: NH.x - nest.userData.area.maxX, maxX: NH.x - nest.userData.area.minX, minZ: NH.z - nest.userData.area.maxZ, maxZ: NH.z - nest.userData.area.minZ },
  { minX: 167.0, maxX: NH.x + 9.3 + 25, minZ: NH.z + 4.5, maxZ: NH.z + 6.2 }];   // the apron along both showrooms' fronts, out to the connector
// 89 Nestwell Kitchen & Bath: the kitchen + bathroom set, in a second showroom beside the first (kitchen89.js)
const KB = { x: 194.2, z: 196.4 };
const kbath = makeKitchenBathShowroom(); kbath.position.set(KB.x, 0.006, KB.z); kbath.rotation.y = Math.PI; add(kbath);
for (const [x0, x1, z0, z1] of kbath.userData.colliders) rect(KB.x - x1, KB.x - x0, KB.z - z1, KB.z - z0);
nhAreas.push({ minX: KB.x - kbath.userData.area.maxX, maxX: KB.x - kbath.userData.area.minX, minZ: KB.z - kbath.userData.area.maxZ, maxZ: KB.z - kbath.userData.area.minZ });
// 90 Nestwell Office: the office set, in a third showroom (office90.js)
const NO = { x: 206.3, z: 196.4 };
const noffice = makeOfficeShowroom(); noffice.position.set(NO.x, 0.006, NO.z); noffice.rotation.y = Math.PI; add(noffice);
for (const [x0, x1, z0, z1] of noffice.userData.colliders) rect(NO.x - x1, NO.x - x0, NO.z - z1, NO.z - z0);
nhAreas.push({ minX: NO.x - noffice.userData.area.maxX, maxX: NO.x - noffice.userData.area.minX, minZ: NO.z - noffice.userData.area.maxZ, maxZ: NO.z - noffice.userData.area.minZ });
const dnAreas = [...dentist.userData.areas, ...wing.userData.areas].map((a) => { const [minX, maxX, minZ, maxZ] = dnW([a.minX, a.maxX, a.minZ, a.maxZ]); return { minX, maxX, minZ, maxZ }; });

console.log('T districtsites', Math.round(performance.now()));
window.__texPhase = 'core';
const qs0 = new URLSearchParams(location.search);
const walk = new WalkControls(camera, renderer.domElement, {
  bounds: null,
  areas: [
    { minX: X0 + 0.3, maxX: X1 - 0.3, minZ: Z0 + 0.3, maxZ: Z1 - 0.3 }, // restaurant
    { minX: X1 - 0.5, maxX: X1 + 0.6, minZ: DOOR_Z - 0.9, maxZ: DOOR_Z + 0.9 }, // doorway
    { minX: X1 + 0.3, maxX: 66, minZ: -47.5, maxZ: 11.7 }, // outside (incl. the grocery)
    { minX: GS.x + 0.3, maxX: GS.x + 8.7, minZ: GS.z - 13.7, maxZ: GS.z - 5.5 }, // grocery stockroom
    { minX: 34.0, maxX: 62.5, minZ: -63.5, maxZ: -47.0 }, // dirt site
    { minX: -43.6, maxX: -9.0, minZ: -13.6, maxZ: 11.7 }, // city plaza
    { minX: -33.3, maxX: -19.7, minZ: 11.0, maxZ: 51.8 }, // old-town street
    { minX: -43.8, maxX: -9.2, minZ: 51.0, maxZ: 70.0 }, // station plaza
    { minX: -73.6, maxX: -43.0, minZ: 50.6, maxZ: 54.0 }, // pond-side path
    { minX: -9.5, maxX: 9.0, minZ: 5.4, maxZ: 11.7 }, // strip along the restaurant's south wall
    junkArea, // junk shop interior
    { minX: -9.2, maxX: 13.7, minZ: 49.5, maxZ: 69.7, y0: -0.5, y1: 0.6 }, // underground-mall forecourt (street level)
    ...mallAreas, // the mall hall + its stair (below the street)
    seArea, // the Go-club stair
    maArea, // the market alley
    baArea, // the bar alley
    ...teaAreas, // the teahouse
    ...aoAreas, // the abandoned office
    ...krAreas, // the Knot Room
    trlArea, // the nature trail
    { minX: -19.6, maxX: -9.2, minZ: 48.0, maxZ: 52.0 }, // strip in front of the realty window
    gshArea, // the pawn & sport shop
    { minX: TP.x - 12.8, maxX: TP.x + 12.8, minZ: TP.z - 5.2, maxZ: TP.z - 0.3 }, // train platform + its stairs
    ...district.userData.areas, // the district's streets + sidewalks
    ...roads.userData.areas, // Elm Loop + the stunt lot
    cgArea, // the community garden
    ...nhAreas, // the furniture showroom
    ...dnAreas, // the dentist's waiting room + its door
    ulArea, // the utility + parking lot
    ...stAreas, // the storage row's apron + the two open units
    ...csAreas, // inside the corner store
    cpArea, // the canal walkway park
    ...agAreas, // the art gallery
    ...whAreas, // the warehouse store
    ...i5Areas, // the pottery gallery, the aqueduct garden + plaza
    ...arAreas, // the arcade
    ...otAreas, // inside Club Nova
    ...nmAreas, // the Nakamachi Arcade passage
    ...kgAreas, // the kei car garage
    ...hmAreas, // Hearth Market
    ...ckAreas, // Calzone Kid
    { minX: PP.x - 19.8, maxX: PP.x + 19.8, minZ: PP.z, maxZ: PP.z + 16.8 }, // the pocket park
    { minX: TM.x - 13, maxX: TM.x + 13, minZ: TM.z - 26.6, maxZ: TM.z + 0.3 }, // the temple plaza, stairs + platform top
    { minX: FG.x - 29.6, maxX: FG.x + 29.6, minZ: FG.z - 16.2, maxZ: FG.z + 16.8 }, // the fairgrounds
    { minX: 221.6, maxX: 224.4, minZ: -7.6, maxZ: -4.9 }, // its steps down to the sidewalk
  ],
  colliders,
});
// 94 Loop houses: a row of detached homes on the verge inside Elm Loop's south side (house94.js); each one is enterable
// (its record joins the district's building list, so interiors.js gives it a door + a flat inside)
const loopHouses = placeHouses({ grid: GRID }); scene.add(loopHouses.group); colliders.push(...loopHouses.colliders); walk.areas.push(...loopHouses.areas); district.userData.buildings.push(...loopHouses.records);
console.log('loop houses:', loopHouses.records.length);
// 95 Elm Works: the factory shed + yard on the north verge (factory95.js)
const EW = { x: 290, z: 196.9 };
{ const works = makeWorks(); works.position.set(EW.x, 0.006, EW.z); scene.add(works); for (const [x0, x1, z0, z1] of works.userData.colliders) colliders.push({ type: 'box', minX: EW.x + x0, maxX: EW.x + x1, minZ: EW.z + z0, maxZ: EW.z + z1 });
  const a = works.userData.area; walk.areas.push({ minX: EW.x + a.minX, maxX: EW.x + a.maxX, minZ: EW.z + a.minZ, maxZ: EW.z + a.maxZ + 3 }); }
// ---- driving: modelled, drivable cars parked on the district streets (third-person; see drive.js + vehicle/carbody.js)
const drive = makeDriver({ scene, camera, areas: walk.areas.slice(), colliders, pads: roads.userData.pads, ground: (x, z) => roads.userData.groundY(x, z) ?? district.userData.floorY(x, z) ?? 0 });
// polish: the same soft studio environment gives every metal + glossy surface in town something to reflect (chrome,
// steel, glass, glazed tile were near-black at night without it); kept low so the night mood stays
scene.environment = carEnv(renderer); scene.environmentIntensity = +(qs0.get('env') ?? 0.1);
// enterable district buildings: doors + interiors built on demand (see interiors.js). (Cars keep the area list from
// before this, so they can't drive into buildings.)
const interiors = makeInteriors({ scene, district, colliders, areas: walk.areas });
console.log('interiors:', JSON.stringify(interiors.stats()));
{ // cash machines in the wall beside the door of every fourth office building
  const at = interiors.list.filter((e) => e.type === 'office').filter((_, i) => i % 4 === 0).map((e) => { const [x, z] = e.W(e.doorX + 1.3, -0.045); return { x, y: district.userData.sidewalkY, z, ry: e.th + Math.PI }; });
  if (at.length) scene.add(instanceGroup(makeATM(), at)); }
for (const [type, opt, x, z, h] of [
  ['hatch', { color: '#b3242a', name: 'red hatch', plate: 'ELM 2K7' }, 71.4, 14.5, 0],
  ['kei', { color: '#a8d6c6', roofColor: '#f2f0ea', rim: 'steel', name: 'mint kei car', plate: 'ELM 55K', metal: 0.2 }, 71.4, 21.0, 0],
  ['coupe', { color: '#1b3a78', rim: 'black', name: 'blue coupe', plate: 'ELM 9C3' }, 71.4, 27.0, 0],
  ['sedan', { color: '#f0c41c', rim: 'steel', name: 'cab', plate: 'ELM T41', livery: LIVERIES.taxi, metal: 0.15 }, 92.0, 3.7, Math.PI / 2],
  ['pickup', { color: '#5e6e52', rim: 'alloy', name: 'pickup', plate: 'ELM 7P8', chromeGrille: true }, 104.0, -3.6, -Math.PI / 2],
  ...townCars,
]) { const c = makeCar({ type, ...opt }); c.position.set(x, 0, z); c.rotation.y = h; scene.add(c); drive.addCar(c, { name: opt.name }); }
walk.ground = (x, z, prevY) => {
  const my = mall.userData.floorY(x - MALL.x, z - MALL.z, prevY);
  if (my !== null) return my;
  const sy = stairEnt.userData.floorY(z - SE.z, SE.x - x);
  if (sy !== null) return sy;
  const py = platformY(x, z);
  if (py !== null) return py;
  const ty = trail.userData.floorY(x - TRL.x, z - TRL.z);
  if (ty !== null) return ty;
  const mh = moundY(x, z);
  if (mh > 0) return mh;
  if (x > 211 && x < 235 && z > -25.5 && z < -7.0) return 0.75;   // the raised canal park
  if (x > 221.5 && x < 224.5 && z >= -7.0 && z < -5.2) return 0.75 * (1 - (z + 7.0) / 1.8) + 0.14 * ((z + 7.0) / 1.8);   // its steps
  if (x > 337 && x < 351 && z > 7.9 && z < 18) return 0.14;   // the gallery floor
  if (x > 266 && x < 306 && z > 90 && z < 123) return 0.14;   // the warehouse floor + entrance apron
  if (x > 100.5 && x < 110.5 && z > -14.5 && z < -7) return 0.14;   // the pottery gallery floor
  if (x > 338 && x < 358 && z > 92 && z < 109.5) return 0.14;   // the arcade floor
  if (z > 137.3 && z < 139.7 && x > 175.8 && x < 183.8) { const dx = Math.abs(x - 179.8); return dx < 2.0 ? 0.66 : 0.66 * Math.max(0, 1 - (dx - 2.0) / 2.0); }   // the creek culvert deck + its ramps (item 85)
  if (x > 252 && x < 322 && z > -101 && z < -91) return 0.14;   // the old-town row (Club Nova floor)
  if (x > 268 && x < 308 && z > -77 && z < -60) return 0;   // the pocket park
  if (x > 252.5 && x < 265.5 && z > -77.4 && z < -61) return 0.14;
  if (x > 260 && x < 288 && z > 139 && z < 161.7) return 0.14;   // Hearth Market floor
  if (x > 301 && x < 311 && z > 152 && z < 161.7) return 0.14;   // Calzone Kid floor   // the Nakamachi Arcade floor
  if (x > TM.x + tmSt.x0 && x < TM.x + tmSt.x1 && z > TM.z + tmSt.front && z < TM.z + tmSt.z1) {   // the temple stairs + platform top
    const zz = z - TM.z; return 0.02 + (zz <= tmSt.zTop ? tmSt.top : tmSt.top * (tmSt.z1 - zz) / (tmSt.z1 - tmSt.zTop)); }
  if (x > TM.x - 13 && x < TM.x + 13 && z > TM.z - 18 && z < TM.z) return 0.06;   // the temple plaza
  if (x > NH.x - 9 && x < NO.x + 5.5 && z > NH.z - 4.5 && z < NH.z + 4.5) return 0.156;   // the three showrooms' floors
  const iy = interiors.floorY(x, z); if (iy !== null) return iy;   // inside a district building
  const ry = roads.userData.groundY(x, z);   // the stunt lot's ramps
  if (ry !== null) return ry;
  const dy = district.userData.floorY(x, z);
  if (dy !== null) return dy;
  if (x > 81.3 && x < 108 && z > 28 && z < 50) return 0.14;   // the dentist office floor
  const ay = apt.userData.floorY(z - AP.z, AP.x - x, prevY);
  return ay !== null ? ay : rampFloorY(x, z);
};
walk.position.set(6.6, 0, 0.2);
walk.yaw = 1.25;
walk.pitch = -0.1;

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableDamping = true;
orbit.maxPolarAngle = Math.PI * 0.49;
orbit.minDistance = 0.1;
orbit.maxDistance = 12;
orbit.enabled = false;

const VIEWS = {
  room: { pos: [6.8, 2.9, 4.4], target: [-1, 0.5, -0.8] },
  bar: { pos: [0.4, 1.6, -1.6], target: [-2.6, 0.7, -4.3] },
  booth: { pos: [-4.6, 1.5, -0.8], target: [-7.3, 0.7, 0.3] },
  tables: { pos: [3.8, 1.8, 3.2], target: [0.8, 0.5, 0.2] },
  neon: { pos: [5.8, 1.5, -2.6], target: [7.9, 1.4, -3.65] },
  entrance: { pos: [4.4, 1.7, 2.2], target: [7.6, 0.6, -1.0] },
  signs: { pos: [9.4, 1.8, 1.4], target: [13.2, 2.6, -0.8] },
  tireshop: { pos: [36, 2.6, -2], target: [24, 2.2, -14] },
  pole: { pos: [12.2, 1.6, -5.6], target: [10.4, 1.8, -7.2] },
  streetrow: { pos: [24, 3.2, -1], target: [26, 3.5, 12] },
  rocks: { pos: [12.6, 1.5, 1.2], target: [14.2, 0.1, 5.6] },
  rockclose: { pos: [13.6, 0.75, 3.3], target: [14.3, 0.05, 4.9] },
  curb: { pos: [20.5, 1.4, 6.8], target: [23.5, 0.1, 9.6] },
  pavers: { pos: [16.5, 1.7, 7.4], target: [19.5, 0, 10.4] },
  crosswalk: { pos: [33.5, 2.6, 10.8], target: [31, 0, 0] },
  cracks: { pos: [37, 1.8, 7.6], target: [39.5, 0, 10.6] },
  dirtlot: { pos: [39.0, 2.4, -6.5], target: [44.5, 0.4, -1] },
  sky: { pos: [20, 1.7, 2], target: [14.5, 6.6, -5.5] },
  walksignal: { pos: [33.6, 1.6, 7.2], target: [32.7, 1.9, 9.9] },
  spruce: { pos: [33.5, 2.2, -5.5], target: [39, 4, -12] },
  streettrees: { pos: [23.5, 1.9, 4.6], target: [19, 2.6, 10.4] },
  trunks: { pos: [37.3, 0.9, -8.4], target: [39.6, 0.9, -11.3] },
  ramp: { pos: [15, 3.0, -24.4], target: [15, -1.5, -15] },
  tealshop: { pos: [44, 1.8, -10.5], target: [45, 1.8, -16] },
  rabbit: { pos: [17.4, 1.5, 7.6], target: [16, 1.6, 10.3] },
  newsbox: { pos: [10.2, 1.3, -1.6], target: [8.55, 0.5, -3.1] },
  canvases: { pos: [-1, 1.7, 1.2], target: [-1, 1.8, 5] },
  mural: { pos: [5.2, 2.2, 10.2], target: [10, 3, 16.2] },
  apartment: { pos: [38.5, 3.5, 4.5], target: [52, 5, -1] },
  aptside: { pos: [62.5, 4.2, 12.5], target: [57, 4.0, 4.0] },
  aptback: { pos: [70.0, 4.5, -1.0], target: [62, 4.2, -1.0] },
  apthall: { pos: [52.6, 3.0, 0.2], target: [60.0, 2.4, -0.4] },
  aptgarden: { pos: [53.0, -0.1, 0.4], target: [60.0, -0.6, -0.6] },
  aptgardenunit: { pos: [55.2, -0.05, 2.4], target: [52.3, -0.45, 4.2] },
  apthall2: { pos: [61.2, 6.1, -0.4], target: [52.5, 5.6, -0.8] },
  aptunit: { pos: [59.1, 2.95, -3.9], target: [63.0, 2.2, -6.0] },
  aptunit2: { pos: [55.0, 6.0, 1.9], target: [56.5, 5.2, 5.6] },
  stoop: { pos: [47.6, 2.4, 3.4], target: [50.5, 1.0, -1] },
  alien: { pos: [40.4, 2.4, 1.6], target: [44.5, 1.4, -3] },
  doortree: { pos: [10.4, 1.3, 5.7], target: [12.8, 0.9, 5.2] },
  scooter: { pos: [48.9, 1.0, 4.0], target: [50.4, 0.55, 5.3] },
  scooterseat: { pos: [50.75, 1.75, 6.15], target: [50.45, 0.7, 5.5] },
  batteries: { pos: [32.5, 1.12, -19.6], target: [32.5, 0.96, -20.0] },
  creep: { pos: [21.6, 1.35, 9.4], target: [19.5, 1.05, 11.55] },
  creepface: { pos: [20.05, 1.72, 11.0], target: [19.5, 1.66, 11.55] },
  police: { pos: [34.0, 1.9, -5.4], target: [36.8, 0.8, -9.7] },
  policefront: { pos: [31.0, 1.3, -7.8], target: [33.1, 0.8, -9.8] },
  grocery: { pos: [24, 3.2, -26], target: [24, 2, -35] },
  dairy: { pos: [24.2, 1.6, -42.3], target: [25.2, 1.0, -46.5] },
  walkin: { pos: [21.0, 1.8, -42.6], target: [16.5, 0.9, -46] },
  eggs: { pos: [29.2, 1.7, -39.2], target: [32.5, 1.2, -41.0] },
  stockroom: { pos: [30.6, 1.7, -48.3], target: [27.0, 1.0, -53.5] },
  stockroom2: { pos: [31.6, 1.9, -53.2], target: [25.0, 0.9, -51.0] },
  shrines: { pos: [57.0, 2.2, -27.6], target: [57.0, 1.0, -37.0] },
  shrineA: { pos: [53.4, 1.4, -32.6], target: [53.6, 0.8, -37.4] },
  shrineB: { pos: [60.6, 1.4, -32.4], target: [60.1, 1.0, -37.4] },
  tirewheel: { pos: [29.6, 0.75, -11.75], target: [28.6, 0.4, -13.1] },
  tiredisplay: { pos: [27.6, 1.6, -10.4], target: [27.6, 0.4, -13.2] },
  livingroom: { pos: [56.6, 3.0, -2.2], target: [52.6, 2.4, -6.6] },
  bookshelves: { pos: [55.2, 2.6, -4.6], target: [52.4, 2.5, -6.9] },
  lamptable: { pos: [54.6, 2.7, -4.4], target: [54.6, 2.3, -7.6] },
  loophouses: { pos: [205, 5.5, -209], target: [196, 1.5, -198] },
  loophouse: { pos: [188, 1.7, -205.5], target: [186, 1.6, -198] },
  works: { pos: [283, 3.2, 212], target: [292, 2.2, 196] },
  worksin: { pos: [279, 1.7, 199.5], target: [286, 1.6, 194.5] },
  tanks: { pos: [304, 2.5, 206], target: [309.5, 3, 196] },
  houses: { pos: [38.5, 2.6, -33.0], target: [46.0, 1.6, -38.5] },
  housesouth: { pos: [40.0, 1.8, -36.5], target: [40.0, 1.4, -44.0] },
  porchhouse: { pos: [40.8, 1.9, -27.8], target: [46.0, 1.5, -31.2] },
  deliveries: { pos: [43.3, 1.4, -40.0], target: [45.6, 0.35, -40.0] },
  deliveries2: { pos: [42.4, 1.7, -31.6], target: [45.3, 0.55, -29.8] },
  bluehouse: { pos: [44.0, 2.0, -33.0], target: [38.4, 1.4, -34.8] },
  cats: { pos: [40.1, 0.55, -35.05], target: [39.2, 0.18, -35.4] },
  kitten: { pos: [39.7, 1.0, -32.3], target: [38.4, 0.8, -32.6] },
  dumpsite: { pos: [44.5, 2.6, -48.2], target: [48.0, 1.6, -57.0] },
  dumptruck: { pos: [54.6, 2.4, -53.0], target: [48.0, 1.8, -57.0] },
  pickupzone: { pos: [37.0, 2.4, -23.0], target: [30.0, 1.8, -28.4] },
  pastewall: { pos: [36.4, 1.6, -54.2], target: [34.25, 1.4, -54.4] },
  plywood: { pos: [37.4, 1.7, -28.9], target: [36.6, 1.25, -31.5] },
  glass: { pos: [23.6, 1.1, -24.4], target: [23.3, 0.0, -25.6] },
  plaza: { pos: [-12.0, 4.5, 10.5], target: [-28.0, 1.5, -2.0] },
  izakaya: { pos: [114.0, 1.7, -2.6], target: [116.8, 2.6, -7.2] },
  pottery: { pos: [107.5, 1.7, -8.3], target: [103, 1.0, -12.5] },
  aqueduct: { pos: [131.6, 1.6, -6.0], target: [130.8, 1.0, -15] },
  backroom: { pos: [275.5, 1.7, 112.0], target: [270.5, 1.2, 119.5] },
  gameshelf: { pos: [304.2, 1.9, 114.0], target: [305.6, 1.3, 114.5] },
  binshelf: { pos: [292.0, 1.5, 107.5], target: [292.0, 0.9, 109.6] },
  pinkhouse: { pos: [181.5, 1.7, 84.5], target: [175, 1.5, 74] },
  pinktv: { pos: [177.7, 1.5, 76.0], target: [177.9, 1.0, 73.2] },
  oldrow73: { pos: [268, 2.0, -80.5], target: [262, 2.8, -92] },
  izakaya73: { pos: [266.5, 1.6, -86.8], target: [268.2, 1.4, -91.5] },
  junkbal73: { pos: [282.5, 2.0, -84.5], target: [281, 3.6, -91] },
  vending73: { pos: [287.6, 1.3, -88.0], target: [286.4, 0.9, -91.5] },
  clubnova: { pos: [297.5, 2.0, -83], target: [295.5, 2.6, -92] },
  novain: { pos: [298, 1.6, -91.6], target: [299, 1.0, -96] },
  denki: { pos: [314, 2.6, -79.5], target: [310, 2.6, -91] },
  gyudon: { pos: [263.6, 1.45, -89.6], target: [263.25, 1.15, -90.0] },
  domeburner: { pos: [295.5, 1.7, -71.0], target: [297, 1.1, -64.6] },
  domeshed: { pos: [274.0, 1.5, -67.0], target: [273.5, 0.8, -63.5] },
  parkkiosk: { pos: [299, 1.7, -78.5], target: [303.5, 1.6, -72.8] },
  adpost: { pos: [300.4, 1.55, -88.2], target: [300.5, 1.5, -89.55] },
  stickerpole: { pos: [296.3, 1.6, -88.6], target: [296.0, 1.5, -89.5] },
  stickerpillar: { pos: [303.8, 2.0, -87.6], target: [303.8, 2.0, -89.5] },
  tabletop74: { pos: [263.4, 1.5, -89.35], target: [263.25, 1.16, -89.95] },
  nakamachi: { pos: [259, 2.2, -86.5], target: [259, 3.0, -77] },
  mallhall: { pos: [259, 1.7, -76.0], target: [259, 1.4, -66] },
  lakeshutter: { pos: [257.6, 1.8, -72.8], target: [261.1, 1.7, -72.8] },
  kaijushutter: { pos: [260.6, 1.8, -69.2], target: [256.9, 1.9, -69.2] },
  gamestall: { pos: [259.2, 1.6, -65.8], target: [259.2, 1.1, -62.3] },
  keicar: { pos: [187.4, 1.3, 78.6], target: [186.1, 0.75, 75.6] },
  breakfast: { pos: [186.9, 1.45, 76.9], target: [187.65, 0.75, 76.0] },
  freezer: { pos: [272.4, 1.7, 107.3], target: [267.0, 1.2, 107.3] },
  cardboardcooler: { pos: [271.8, 1.5, 101.7], target: [267.0, 1.1, 101.7] },
  padlock: { pos: [270.95, 1.3, 105.75], target: [270.4, 1.2, 105.72] },
  layflat: { pos: [345.0, 1.6, 13.9], target: [345.05, 1.6, 11.3] },
  hearth: { pos: [278, 2.4, 170.5], target: [274, 3.0, 161] },
  dairyaisle: { pos: [284.6, 1.7, 159.5], target: [286.5, 1.4, 146] },
  corndogs: { pos: [262.2, 1.25, 158.2], target: [262.5, 0.9, 158.8] },
  pickup: { pos: [266.0, 1.8, 144.0], target: [263.0, 1.0, 140.5] },
  handheld: { pos: [264.55, 2.55, 140.55], target: [264.5, 2.2, 140.2] },
  oneeye: { pos: [347.6, 1.6, 16.8], target: [350.95, 1.6, 16.8] },
  whitebrick: { pos: [285.0, 1.4, -79.0], target: [286.2, 1.3, -77.3] },
  tanbrick: { pos: [272.2, 1.5, 164.2], target: [270.8, 1.4, 161.9] },
  parkgate: { pos: [288, 1.9, -82.5], target: [288, 2.0, -77] },
  freepapers: { pos: [292.6, 1.45, 164.4], target: [292.2, 0.8, 161.8] },
  yellowbox: { pos: [269.4, 1.3, 163.9], target: [270.4, 0.9, 161.9] },
  msgtrailer: { pos: [229.8, 1.8, 162.6], target: [231.5, 2.1, 157] },
  calzonekid: { pos: [309, 2.0, 167.5], target: [306, 2.4, 161] },
  ckinside: { pos: [303.5, 1.65, 160.0], target: [307.5, 1.2, 155.6] },
  condiments: { pos: [308.6, 1.55, 158.7], target: [310.7, 1.1, 158.7] },
  drinkdisp: { pos: [308.8, 1.6, 157.0], target: [310.75, 1.3, 157.0] },
  doormat: { pos: [306.0, 1.6, 161.7], target: [306.0, 0.0, 160.0] },
  endcap: { pos: [281.5, 1.6, 152.6], target: [278.3, 1.3, 155.0] },
  cakemix: { pos: [276.8, 1.5, 153.2], target: [274.0, 1.1, 150.8] },
  discontinued: { pos: [275.7, 1.5, 151.8], target: [275.6, 1.22, 151.25] },
  spicewall: { pos: [278.5, 1.6, 145.0], target: [276.5, 1.0, 140.6] },
  ebike81: { pos: [284.5, 1.4, 164.4], target: [282.5, 0.6, 162.4] },
  fortune: { pos: [306.0, 1.42, 155.35], target: [306.1, 1.2, 154.95] },
  boxtrailer: { pos: [233.0, 2.6, 153.5], target: [220, 2.0, 153.5] },
  toolbox82: { pos: [186.4, 1.6, 73.6], target: [185.5, 0.9, 71.9] },
  screwdriver: { pos: [187.95, 1.15, 76.4], target: [187.9, 0.9, 76.25] },
  stickercase: { pos: [186.5, 0.85, 72.9], target: [186.25, 0.2, 71.65] },
  comics: { pos: [260.9, 1.1, -63.7], target: [260.82, 0.55, -62.3] },
  treadramp: { pos: [233.6, 1.6, 150.8], target: [230.6, 0.7, 153.5] },
  tower: { pos: [340.4, 1.6, 16.8], target: [337.05, 1.6, 16.8] },
  butterlight: { pos: [347.6, 1.6, 13.1], target: [350.95, 1.6, 13.1] },
  gasmeter: { pos: [291.6, 1.6, 150.6], target: [288.2, 1.0, 150.4] },
  telecom83: { pos: [290.3, 1.2, 146.9], target: [288.5, 0.55, 148.1] },
  cans83: { pos: [290.15, 0.45, 148.6], target: [289.72, 0.24, 149.0] },
  hydrant: { pos: [295.6, 0.9, 164.0], target: [294.6, 0.55, 162.6] },
  walllight: { pos: [291.6, 1.8, 154.6], target: [288.3, 1.9, 154.6] },
  wornbollard: { pos: [301.0, 1.0, 164.0], target: [301.6, 0.65, 162.9] },
  caketable: { pos: [267.9, 1.65, 159.2], target: [268.4, 0.9, 158.6] },
  stump: { pos: [282.2, 1.6, -70.0], target: [283.5, 0.1, -72.0] },
  barktree: { pos: [287.5, 1.7, -80.5], target: [294.0, 3.8, -72.4] },
  calzonebrick: { pos: [314.0, 1.8, 158.0], target: [311.2, 2.0, 155.0] },
  servicedesk: { pos: [280.0, 1.7, 160.2], target: [281.8, 1.0, 158.0] },
  cookietower: { pos: [281.7, 1.5, 160.3], target: [282.35, 1.0, 158.6] },
  bleachaisle: { pos: [277.5, 1.5, 148.6], target: [273.0, 1.0, 147.0] },
  wetfloor: { pos: [280.4, 1.3, 164.2], target: [280.0, 0.3, 162.5] },
  parkbin: { pos: [289.6, 1.4, -79.5], target: [291.2, 0.8, -75.4] },
  benchball: { pos: [284.4, 1.25, -70.2], target: [284.6, 0.55, -68.25] },
  culvert: { pos: [179.9, 1.4, 143.6], target: [179.8, 0.35, 139.9] },
  creek: { pos: [179.8, 2.2, 129.0], target: [179.8, 0.3, 138.0] },
  kidsslide: { pos: [272.5, 1.8, -71.0], target: [276.5, 0.8, -74.0] },
  restroom: { pos: [282.3, 1.6, 140.2], target: [284.2, 1.1, 139.2] },
  restroomtp: { pos: [283.1, 1.3, 140.3], target: [284.9, 0.9, 140.1] },
  restroomsink: { pos: [283.6, 1.55, 141.4], target: [282.3, 1.0, 141.1] },
  restroomdoor: { pos: [283.3, 1.5, 145.4], target: [283.3, 1.2, 142.6] },
  scrubber: { pos: [265.4, 1.7, 144.7], target: [262.3, 0.8, 144.2] },
  sackpallet: { pos: [266.4, 1.8, 144.4], target: [265.7, 0.6, 141.2] },
  stainless: { pos: [278.0, 1.6, 141.6], target: [280.85, 1.3, 141.0] },
  pixelden: { pos: [353, 2.2, 82.5], target: [348, 2.6, 93] },
  arcadein: { pos: [352.5, 1.7, 94.5], target: [347, 1.2, 99.5] },
  gameroom: { pos: [348, 1.7, 100.5], target: [348, 1.4, 108.6] },
  shutter: { pos: [362.4, 1.6, 87.8], target: [362.6, 1.5, 93] },
  temple: { pos: [391.5, 1.7, -8.0], target: [393, 3.6, -25] },
  jetpark: { pos: [201.5, 1.8, 160.5], target: [193, 2.0, 150.5] },
  rides: { pos: [228, 2.2, 145.5], target: [220, 2.5, 136.5] },
  newart: { pos: [344, 1.6, 8.7], target: [344, 1.5, 11.3] },
  cairn: { pos: [-69.2, 1.5, -29.6], target: [-66.6, 0.5, -25.9] },
  stationplaza: { pos: [146.0, 1.7, -6.2], target: [148, 1.2, -16] },
  brickwarehouse: { pos: [-33.0, 2.4, -1.0], target: [-44.0, 4.5, -3.0] },
  ovalbuilding: { pos: [-25.5, 2.4, 1.5], target: [-25.5, 4.5, -14.0] },
  oldtown: { pos: [-26.5, 2.0, 14.0], target: [-26.5, 2.4, 40.0] },
  oldtownshops: { pos: [-23.5, 1.7, 20.0], target: [-31.0, 1.8, 24.0] },
  monkey: { pos: [-29.8, 1.0, 19.0], target: [-32.2, 0.5, 17.3] },
  shutters: { pos: [-5.0, 1.8, 6.4], target: [-6.4, 1.7, 12.2] },
  vending: { pos: [-0.95, 1.45, 9.9], target: [-0.85, 1.0, 11.7] },
  vendingclose: { pos: [-0.75, 1.55, 10.85], target: [-0.85, 1.45, 11.7] },
  vendinglow: { pos: [-0.8, 0.95, 10.75], target: [-0.85, 0.7, 11.7] },
  junkshop: { pos: [6.8, 1.8, 13.2], target: [1.5, 1.0, 20.5] },
  dentist: { pos: [91.2, 1.75, 40.0], target: [84, 1.1, 31.5] },
  dentist2: { pos: [84.3, 1.8, 34.5], target: [93.5, 1.0, 38.6] },
  operatory: { pos: [97.25, 1.85, 30.1], target: [100.6, 0.95, 29.8] },
  operatory2: { pos: [99.6, 1.8, 28.6], target: [97.6, 0.9, 30.4] },
  warehouse: { pos: [286, 2.4, 78.5], target: [286, 4, 93] },
  warehouse2: { pos: [282, 1.8, 102.5], target: [293, 1.2, 112] },
  tvboxes: { pos: [302, 1.7, 104.5], target: [305.5, 0.9, 109] },
  breaktable: { pos: [274.4, 1.5, 100.4], target: [276, 0.8, 99] },
  gallery: { pos: [340.3, 1.75, 9.0], target: [346.5, 1.5, 16.5] },
  gallery2: { pos: [341.8, 1.55, 11.9], target: [339.4, 0.85, 10.0] },
  galleryfront: { pos: [344, 2.2, -3.0], target: [344, 2.6, 8] },
  canal: { pos: [214.2, 2.4, -15.6], target: [225, 0.4, -19.8] },
  storysign: { pos: [229.0, 2.3, -9.6], target: [229.4, 2.05, -11.5] },
  sushi: { pos: [181.0, 1.7, -11.6], target: [183.2, 0.95, -14.3] },
  cafesigns: { pos: [198.6, 1.6, -2.2], target: [198.2, 1.0, -6.4] },
  cornerstore: { pos: [163.5, 1.7, -1.5], target: [172, 2.2, -8] },
  policecar: { pos: [185.6, 1.4, -0.9], target: [181, 0.7, -3.7] },
  aircraft: { pos: [256, 1.7, 1.8], target: [259, 3.8, 14] },
  storage: { pos: [181, 1.7, 88.6], target: [186, 1.3, 96] },
  storageunit: { pos: [181.0, 1.65, 94.6], target: [181.0, 0.9, 98.8] },
  canwall: { pos: [189.0, 1.25, 96.6], target: [189.0, 0.9, 98.7] },
  coupe: { pos: [96.0, 1.5, -31.6], target: [100.6, 0.6, -35.2] },
  coupewreck: { pos: [234.3, 1.7, -0.8], target: [229.5, 0.6, -6.2] },
  parkinglot: { pos: [86.5, 2.4, -46.5], target: [102, 1.0, -40] },
  stall: { pos: [96.0, 1.75, -40.55], target: [100.5, 0.0, -40.55] },
  parksigns: { pos: [100.3, 1.7, -44.2], target: [104, 1.3, -44.4] },
  utility: { pos: [98.5, 1.7, -38.0], target: [103.6, 1.4, -35.4] },
  transformer: { pos: [87.6, 1.7, -42.4], target: [83.8, 0.9, -46.2] },
  dentistfront: { pos: [72, 2.2, 39], target: [83, 3.0, 39] },
  avenue: { pos: [71.5, 1.8, -12], target: [78, 4, 60] },
  downtown: { pos: [241, 1.8, -30], target: [247, 6, 60] },
  cityair: { pos: [30, 70, -110], target: [210, 0, 20] },
  thrift: { pos: [4.6, 1.7, 7.4], target: [6.6, 1.0, 10.9] },
  junkfront: { pos: [3.5, 2.2, 5.8], target: [3.5, 2.0, 12.2] },
  graffiti: { pos: [-15.2, 1.9, 7.0], target: [-15.5, 1.9, 12.1] },
  arcade: { pos: [-11.6, 1.6, 9.8], target: [-12.2, 1.3, 11.4] },
  trike: { pos: [-18.6, 1.5, 5.2], target: [-19.2, 0.7, 8.6] },
  trike2: { pos: [-2.6, 1.6, 6.2], target: [0.6, 1.0, 7.6] },
  station: { pos: [-26.5, 2.4, 42.0], target: [-26.5, 6.5, 58.0] },
  stationunder: { pos: [-24.5, 1.7, 53.2], target: [-26.5, 3.4, 62.0] },
  pond: { pos: [-56.0, 1.7, 52.6], target: [-58.0, 1.2, 30.0] },
  rockdoor: { pos: [-37.6, 1.8, 7.9], target: [-38.5, 2.3, 12.2] },
  mall: { pos: [-1.5, -2.6, 49.0], target: [2.5, -3.0, 38] },
  mallwest: { pos: [0.5, -2.5, 34], target: [-5, -2.6, 30] },
  mallpillars: { pos: [7.0, -2.8, 45.5], target: [4.0, -3.0, 34] },
  malleast: { pos: [3.0, -2.6, 36], target: [9, -2.8, 42] },
  mallstair: { pos: [2.0, 1.2, 60.5], target: [2.0, -3.2, 48] },
  noodleshop: { pos: [-3.2, 1.7, 55.5], target: [-4.8, 1.6, 49] },
  foodtable: { pos: [-5.0, 1.25, 51.6], target: [-5.65, 0.75, 50.62] },
  foodclose: { pos: [-5.45, 0.98, 51.0], target: [-5.75, 0.76, 50.6] },
  pizzadisplay: { pos: [-6.6, 1.5, 51.4], target: [-7.7, 0.85, 50.1] },
  drinkvending: { pos: [-1.6, 1.4, 51.2], target: [-1.15, 1.2, 49.4] },
  abfront: { pos: [12.4, 1.7, 66.5], target: [12.4, 1.8, 74] },
  abroom: { pos: [11.2, 1.6, 74.4], target: [13.7, 1.2, 79.4] },
  abceiling: { pos: [11.4, 1.4, 75.0], target: [12.8, 2.7, 77.6], lookUp: true },
  abwash: { pos: [11.3, 1.5, 77.9], target: [9.2, 1.0, 79.0] },
  knotfront: { pos: [8.6, 1.7, 68.4], target: [14.4, 2.0, 69.8] },
  knotroom: { pos: [15.2, 1.6, 67.6], target: [19.5, 1.4, 70.8] },
  knotbar: { pos: [16.5, 1.6, 69.6], target: [20.2, 1.4, 69.6] },
  keitruck: { pos: [-26.2, 1.9, 48.9], target: [-22.75, 0.9, 44.5] },
  coach: { pos: [-24.5, 2.4, 27.5], target: [-29.7, 1.6, 36] },
  cleanbot: { pos: [MALL.x - 1.6, -2.7, MALL.z + 12.5], target: [MALL.x - 1.6, -4.0, MALL.z - 2] },
  robotvend: { pos: [-17.6, 1.6, 51.4], target: [-17.9, 1.2, 48.0] },
  realty: { pos: [RW.x + 0.4, 1.7, RW.z + 3.6], target: [RW.x, 1.8, RW.z] },
  carts: { pos: [14.0, 1.7, -19.6], target: [14.0, 0.5, -22.3] },
  badparker: { pos: [BP.x + 9.0, 2.0, BP.z - 4.6], target: [BP.x + 3.0, 1.0, BP.z - 1.6] },
  ebike: { pos: [-20.15, 1.2, 42.9], target: [-20.95, 0.5, 41.05] },
  pawnart: { pos: [58.4, 1.6, -27.4], target: [58.4, 1.6, -30] },
  rose: { pos: [3.6, 1.4, Z0 + 1.1], target: [3.2, 1.25, Z0 + 0.3] },
  decor: { pos: [1.4, 1.6, 16.2], target: [-0.6, 1.1, 14.4] },
  pachinko: { pos: [5.6, 1.5, 16.0], target: [7.6, 1.15, 14.4] },
  burl: { pos: [MALL.x + 0.2, -2.6, MALL.z - 4.6], target: [MALL.x - 2.6, -3.3, MALL.z - 7.2], lookUp: true },
  stickerbox: { pos: [-22.0, 1.6, 7.6], target: [-22.2, 1.4, 10.7] },
  schoolbus: { pos: [-26.6, 1.9, 15.8], target: [-29.7, 1.4, 22.5] },
  snacks: { pos: [-74.5, 1.3, -36.0], target: [-75.8, 0.3, -37.4] },
  snackshelf: { pos: [20.6, 1.5, -38.2], target: [22.25, 1.2, -38.8] },
  posters: { pos: [-11.8, 1.6, 0.4], target: [-8.3, 1.45, 0] },
  pawnshop: { pos: [56.2, 1.6, -28.4], target: [59.0, 0.9, -25.0] },
  pawnfront: { pos: [49.5, 2.0, -24.0], target: [55.0, 2.2, -25.5] },
  trail: { pos: [-44.5, 1.7, -12.0], target: [-50, 1.4, -17] },
  mosscreature: { pos: [MCM.x + 4.2, 1.7, MCM.z - 3.4], target: [MCM.x, 0.9, MCM.z] },
  trail2: { pos: [-48.5, 1.8, -29.0], target: [-51, 0.8, -35.2] },
  keihatch: { pos: [-26.0, 1.6, 32.0], target: [-22.8, 0.8, 35.4] },
  scooters: { pos: [-23.6, 1.5, 50.4], target: [-20.9, 0.5, 48.8] },
  train: { pos: [-12.5, 2.6, 71.0], target: [-17.5, 2.0, 77.2] },
  workvan: { pos: [-26.0, 1.7, 36.2], target: [-22.8, 0.9, 39.9] },
  scout: { pos: [36.4, 1.7, -5.4], target: [39.9, 0.8, -0.6] },
  office90: { pos: [206.3, 3.0, 208.5], target: [206.3, 1.5, 197] },
  officedesks: { pos: [206.2, 1.8, 199.6], target: [208.6, 0.8, 195.2] },
  officewall: { pos: [206.0, 1.7, 196.8], target: [208.4, 1.2, 192.2] },
  officecorner: { pos: [205.6, 1.7, 199.8], target: [202.6, 0.8, 196.4] },
  kitchenbath: { pos: [194.2, 3.0, 209.0], target: [194.2, 1.6, 197] },
  kitchen89: { pos: [196.0, 1.75, 199.6], target: [197.6, 1.0, 192.6] },
  kitchenrun: { pos: [197.4, 1.6, 195.4], target: [197.6, 1.1, 192.4] },
  bathroom89: { pos: [193.6, 1.75, 199.4], target: [190.4, 0.9, 193.0] },
  bathfix: { pos: [191.8, 1.6, 195.6], target: [188.8, 0.8, 194.6] },
  showroom: { pos: [178.5, 3.2, 210.5], target: [178.5, 1.6, 197] },
  bedroom: { pos: [182.4, 1.8, 196.6], target: [184.6, 0.6, 193.2] },
  livingroom88: { pos: [180.4, 1.75, 200.2], target: [178.2, 0.7, 195.0] },
  study88: { pos: [171.6, 1.75, 199.8], target: [173.6, 0.9, 192.6] },
  bedsingle: { pos: [181.5, 1.5, 197.2], target: [182.6, 0.6, 199.3] },
  garden: { pos: [158.5, 4.2, 191.5], target: [144.5, 1.0, 197.5] },
  glasshouse: { pos: [146.2, 1.7, 197.4], target: [140.5, 1.2, 194.5] },
  glasshousein: { pos: [142.6, 1.6, 194.5], target: [138.0, 1.0, 194.3] },
  gardenshed: { pos: [147.6, 1.7, 196.6], target: [150.1, 1.2, 200.4] },
  gardenbeds: { pos: [143.5, 2.2, 196.8], target: [139.5, 0.4, 200.6] },
  busstop: { pos: [118.0, 2.4, 79.5], target: [118.0, 1.2, 90.5] },
  trafficlights: { pos: [150.0, 4.5, 96.0], target: [161.0, 3.5, 84.0] },
  streetcorner: { pos: [133.0, 2.2, 82.5], target: [140.0, 1.0, 77.0] },
  elmloop: { pos: [300, 20, 236], target: [345, 0, 208] },
  loopeast: { pos: [440, 10, -110], target: [462, 0, -70] },
  jumplot: { pos: [478, 18, -46], target: [520, 1, 0] },
  jumpramps: { pos: [496, 6, -16], target: [512, 1, 2] },
  knotsconce: { pos: [16.6, 1.7, 68.0], target: [18.6, 1.9, 66.3] },
  forecourt: { pos: [10, 2.0, 66], target: [-1, 0, 58] },
  puddles: { pos: [6.5, 1.6, 52.5], target: [3.5, 0, 56.5] },
  mallkiosk: { pos: [6.5, 1.8, 66], target: [2.0, 1.0, 57] },
  stairent: { pos: [7.6, 1.7, 63.2], target: [14, 2.3, 61] },
  stairsign: { pos: [10.9, 2.3, 60.1], target: [14, 2.5, 61.3] },
  stairdown: { pos: [21.4, 5.6, 61], target: [14.6, 0.6, 61] },
  alleyentrance: { pos: [9, 1.7, 56], target: [9, 2, 47] },
  alley: { pos: [9.6, 1.65, 50.6], target: [8.6, 1.5, 38] },
  alleysigns: { pos: [8.2, 1.7, 46.5], target: [11.6, 2.5, 43.5] },
  alleyleft: { pos: [9.8, 1.6, 44.4], target: [6.6, 0.8, 46.2] },
  alleyprops: { pos: [9.2, 1.5, 42.8], target: [11.6, 0.6, 39.8] },
  barentrance: { pos: [-2.3, 1.7, 64], target: [-2.2, 4, 74] },
  baralley: { pos: [-1.6, 1.65, 69.5], target: [-2.3, 3.0, 84] },
  barsigns: { pos: [-1.2, 2.2, 74.5], target: [-3.2, 5.0, 79] },
  barizakaya: { pos: [-0.8, 1.6, 74.2], target: [-5.0, 1.6, 77.8] },
  bartower: { pos: [-1.0, 2.0, 79.5], target: [-4.0, 3.6, 83.5] },
  barstair: { pos: [-2.0, 1.6, 82.0], target: [-4.2, 1.0, 84.5] },
  teafront: { pos: [-3.4, 1.7, 95.5], target: [0.3, 2.6, 92.0] },
  teaceiling: { pos: [4.6, 1.4, 96.0], target: [2.8, 5.6, 92.0], lookUp: true },
  tearoom: { pos: [2.6, 1.6, 97.2], target: [3.4, 2.2, 88.5] },
  teabar: { pos: [3.0, 1.6, 93.2], target: [3.3, 1.4, 87.7] },
  barend: { pos: [-2.2, 1.7, 86], target: [-2.4, 2.4, 98] },
  rockdoorside: { pos: [-36.4, 1.6, 10.6], target: [-38.5, 2.0, 12.0] },
  walkinshelf: { pos: [17.6, 1.6, -44.0], target: [21.4, 1.0, -45.6] },
  van: { pos: [25.5, 1.9, -22.4], target: [21.5, 0.9, -26.5] },
  vanside: { pos: [24.6, 1.3, -29.2], target: [21.5, 0.7, -26.3] },
  soup: { pos: [-2.85, 1.62, -4.0], target: [-3.1, 1.2, -4.7] },
  food1: { pos: [-3.1, 1.45, -0.9], target: [-3.42, 0.78, -1.45] },
  food2: { pos: [-0.35, 1.4, -0.95], target: [-0.62, 0.8, -1.4] },
  food3: { pos: [1.95, 1.4, -0.95], target: [2.2, 0.8, -1.4] },
  food4: { pos: [-3.1, 1.4, 1.95], target: [-3.4, 0.78, 1.4] },
  snacks1: { pos: [-4.2, 1.0, 4.28], target: [-4.2, 0.82, 4.65] },
  snacks2: { pos: [-1.95, 1.0, 4.28], target: [-1.97, 0.83, 4.65] },
  snacks3: { pos: [0.13, 0.95, 4.35], target: [0.13, 0.83, 4.65] },
  food6: { pos: [2.5, 1.4, 1.95], target: [2.2, 0.78, 1.4] },
  abandoned: { pos: [13.0, 2.0, 2.0], target: [19.5, 1.4, 0.2] },
};
let mode = 'walk';
const modeBtn = document.getElementById('mode');
function setMode(m, view = 'room') {
  mode = m;
  walk.enabled = m === 'walk';
  orbit.enabled = m === 'orbit';
  if (m !== 'drive' && drive.active) { const out = drive.exit(); if (out) { walk.position.set(out.x, 0, out.z); walk.yaw = out.yaw; walk.pitch = -0.05; } }
  if (m === 'orbit') {
    const v = VIEWS[view] || VIEWS.room;
    // indoor views that look up at a ceiling may orbit below the target; everywhere else stay above the ground
    orbit.maxPolarAngle = v.lookUp ? Math.PI * 0.97 : Math.PI * 0.49;
    camera.position.set(...v.pos);
    orbit.target.set(...v.target);
    // wide views (the city from above, long streets) need to zoom out further than the room views
    orbit.maxDistance = Math.max(12, camera.position.distanceTo(orbit.target) * 1.3);
    orbit.update();
  } else if (m === 'walk') {
    walk.apply();
  }
  modeBtn.textContent = m === 'walk' ? 'Inspect (orbit)' : m === 'drive' ? 'Get out' : 'Walk';
  document.body.dataset.mode = m;
}
modeBtn.addEventListener('click', () => setMode(mode === 'walk' ? 'orbit' : 'walk'));
function enterCar(c) { if (mode === 'orbit') setMode('walk'); drive.enter(c); setMode('drive'); }
document.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => setMode('orbit', b.dataset.view)));
const qs = new URLSearchParams(location.search);
setMode(qs.get('mode') === 'orbit' ? 'orbit' : 'walk', qs.get('view') || 'room');
if (qs.get('drive') !== null) enterCar(drive.cars[+qs.get('drive') || 0]);

// ------------------------------------------------------------------ post: neon glow
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2), 0.35, 0.45, 1.5); composer.addPass(bloomPass);
composer.addPass(new OutputPass());

// ------------------------------------------------------------------ GLB export
function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
async function exportGLB(object) {
  const clone = object.clone(true);
  clone.position.set(0, 0, 0);
  clone.rotation.set(0, 0, 0);
  const lights = [];
  clone.traverse((o) => { if (o.isLight) lights.push(o); });
  lights.forEach((l) => l.removeFromParent());
  const res = await new GLTFExporter().parseAsync(clone, { binary: true });
  return new Blob([res], { type: 'model/gltf-binary' });
}
const ASSETS = {
  yellow_bar_stool: () => stools[0],
  butcher_block_bar_counter: () => counters[0],
  pink_slat_chair: () => chairs[0],
  lime_booth: () => booths[0],
  terrazzo_table: () => tables[0],
  neon_open_sign_lightbox: () => neon,
  glass_double_door: () => door,
  liquor_pole_sign: () => liquor,
  rental_pole_sign: () => twoRivers,
  tire_shop: () => tireShop,
  rusty_pole: () => rustyPoles[0],
  ...Object.fromEntries(streetRow.map((b) => [b.name, () => b])),
  abandoned_storefront: () => abandoned,
  street_lamp: () => lamp,
  fire_hydrant: () => hydrant,
  napkin_dispenser: () => napkinProto,
  globe_pendant: () => pendantProto,
};
window.exportAssets = async () => {
  const out = {};
  for (const [name, get] of Object.entries(ASSETS)) out[name] = await exportGLB(get());
  return out;
};
document.getElementById('export')?.addEventListener('click', async () => {
  const files = await window.exportAssets();
  let i = 0;
  for (const [name, blob] of Object.entries(files)) setTimeout(() => download(blob, `${name}.glb`), 400 * i++);
});

// ------------------------------------------------------------------ light budget
// Phone GPUs garble colours (green/pink surfaces) when a shader has to handle
// too many lights. Only the MAX_LIGHTS point lights nearest the camera are on;
// the count never changes, so shaders compile once and stay small.
const IS_PHONE = matchMedia('(pointer: coarse)').matches;
let MAX_LIGHTS = IS_PHONE ? 4 : 8;
const pointLights = [];
scene.traverse((o) => { if (o.isPointLight) pointLights.push(o); });
const _lp = new THREE.Vector3();
let lightTimer = 0;
function lightLive(l) { for (let o = l.parent; o; o = o.parent) if (!o.visible) return false; return true; }
function updateLightBudget() {
  const cam = camera.position;
  pointLights.forEach((l) => { l.getWorldPosition(_lp); l.userData.d = lightLive(l) ? _lp.distanceToSquared(cam) : 1e12; });
  const sorted = [...pointLights].sort((a, b) => a.userData.d - b.userData.d);
  sorted.forEach((l, i) => { l.visible = i < MAX_LIGHTS; });
}
// polish: every colour map that has a normal map on file gets it (see normals.js)
if (!qs0.has('nofinish')) console.log('surface finishes:', JSON.stringify(applyFinishes(scene)));
console.log('auto normal maps:', autoNormals(scene));
// streaming step 1: hide what's too far away to matter (see stream.js); runs with the light budget
{ // step 1b: merge every static district set's meshes by material (see stream.js). Everything added after item 57 is
  // static (no doors or interactables), so each top-level set is merged on its own.
  const t0 = performance.now(); let before = 0, after = 0;
  for (const o of room.children.slice(DISTRICT_FROM)) { if (o.isLight || o.userData.update || o.userData.brain || (o.userData.tick && !o.userData.mergeSafe)) continue; const r = mergeStatic(o); before += r.before; after += r.after; }
  console.log('merge', Math.round(performance.now() - t0), 'ms:', before, '->', after, 'meshes');
}
// step 1c (polish): the old town too. Its sets have doors, lids and animated props, so first find everything that
// moves: run each animation at another time, open everything that opens, and compare every mesh's world matrix and
// visibility with a snapshot. Movers are left alone (userData.noMerge); the rest of each set merges by material.
if (!qs0.has('nomergeold')) {
  const t0 = performance.now(), olds = room.children.slice(0, DISTRICT_FROM);
  scene.updateMatrixWorld(true);
  const snap = new Map(); for (const o of olds) o.traverse((m) => { if (m.isMesh) snap.set(m, { e: m.matrixWorld.elements.slice(), v: m.visible }); });
  const anim = (t) => { try { sky.userData.update(camera, t); alien.userData.update(t); soupPots.forEach((p) => p.userData.update(t)); puffCup.userData.update(t); creep.userData.update(t); cleanBotUpdate(t); mossCreatureUpdate(t);
    (alley.userData.anim || []).forEach((a) => a.userData.update(t)); cart.userData.update(t); walkPoles.forEach((p, i) => p.userData.update(t, i * 0.3));
    scene.traverse((o) => { if (o.userData && typeof o.userData.tick === 'function') o.userData.tick(t, 0.05); }); } catch (e) { console.warn('anim probe', e); } };
  anim(3.7); for (const it of interactables) it.setOpen(1); door.userData.setOpen(1); grocery.userData.update(1.5, true); blueHouse.userData.update(0.7);
  scene.updateMatrixWorld(true);
  let movers = 0;
  for (const [m, s0] of snap) { const e = m.matrixWorld.elements; let moved = m.visible !== s0.v; for (let i = 0; i < 16 && !moved; i++) if (Math.abs(e[i] - s0.e[i]) > 1e-5) moved = true; if (moved) { m.userData.noMerge = true; movers++; } }
  for (const it of interactables) it.setOpen(it.t); door.userData.setOpen(0); anim(0); grocery.userData.update(5, false);
  for (const o of mall.userData.hideForCapture || []) o.traverse((m) => { m.userData.noMerge = true; });
  neon.traverse((m) => { m.userData.noMerge = true; });   // (its tubes' colours are animated per material)
  scene.updateMatrixWorld(true);
  let before = 0, after = 0; const loose = new THREE.Group(); loose.name = 'old_town_loose';
  for (const o of olds) {
    if (o.isLight || (o.userData.update && o !== grocery && o !== blueHouse) || o.userData.brain || (o.userData.tick && !o.userData.mergeSafe) || o.userData.noMerge) continue;   // (the grocery + blue house only move the parts found above)
    if (o.isMesh) { if (!o.isInstancedMesh && !Array.isArray(o.material)) loose.add(o); continue; }
    const r = mergeStatic(o); before += r.before; after += r.after;
  }
  room.add(loose); { const r = mergeStatic(loose); before += r.before; after += r.after; }
  console.log('merge old town', Math.round(performance.now() - t0), 'ms:', before, '->', after, 'meshes;', movers, 'moving meshes left alone');
}
// polish: a soft pool of light on the ground under every outdoor lamp, always there (the real lights are budgeted
// to the nearest few, so streets away from them went black). Outdoor = nothing overhead. One instanced draw.
afterStart(() => { const t0 = performance.now(), rc = new THREE.Raycaster(), up = new THREE.Vector3(0, 1, 0), wp = new THREE.Vector3(), solids = [];
  room.traverse((o) => { if (o.isMesh && !o.isInstancedMesh && o.visible) solids.push(o); });
  const spots = [];
  for (const l of pointLights) { l.getWorldPosition(wp); if (wp.y < 2.2 || wp.y > 9 || l.intensity < 2) continue;
    rc.set(wp.clone().add(up.clone().multiplyScalar(0.6)), up); rc.far = 40; if (rc.intersectObjects(solids, false).length) continue;
    const gy = walk.ground(wp.x, wp.z, 0); if (wp.y - gy < 2) continue; spots.push([wp.x, gy + 0.035, wp.z, Math.min(6, 1.2 + wp.y * 0.75), l.color]); }
  if (spots.length) { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,0.5)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.18)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
    const geo = new THREE.CircleGeometry(1, 28); geo.rotateX(-Math.PI / 2);
    const pools = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -4 }), spots.length);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), col = new THREE.Color();
    spots.forEach(([x0, y0, z0, r, lc], i) => { pools.setMatrixAt(i, m4.compose(new THREE.Vector3(x0, y0, z0), q, new THREE.Vector3(r, 1, r))); pools.setColorAt(i, col.copy(lc).multiplyScalar(0.55)); });
    pools.name = 'lamp_pools'; pools.frustumCulled = false; pools.renderOrder = 1; scene.add(pools); }
  console.log('lamp pools:', spots.length, Math.round(performance.now() - t0), 'ms'); });   // (after the world is on screen: the overhead checks take about a second on a slow machine)
const streamer = makeStreamer(scene, { phone: IS_PHONE });
console.log('T streamer', Math.round(performance.now()));
streamer.update(camera.position);
updateLightBudget();
shrinkCanvases(scene);

// The mall's chrome pillars, polished floor and steel need something to reflect: render the hall once
// into a cube map from its middle (pillars hidden) and hand it to those materials. Done again once
// every texture has loaded, so the reflection isn't of black, unloaded surfaces.
function captureMallEnv() {
  const saved = camera.position.clone();
  const probe = mall.userData.envProbe.clone().add(mall.position);
  camera.position.copy(probe); updateLightBudget();
  const rt = new THREE.WebGLCubeRenderTarget(256, { type: THREE.HalfFloatType });
  const cc = new THREE.CubeCamera(0.05, 60, rt); cc.position.copy(probe); scene.add(cc);
  mall.userData.hideForCapture.forEach((o) => { o.visible = false; });
  cc.update(renderer, scene);
  mall.userData.hideForCapture.forEach((o) => { o.visible = true; });
  const pm = new THREE.PMREMGenerator(renderer);
  const env = pm.fromCubemap(rt.texture).texture;
  const old = mall.userData.envMats[0].envMap;
  mall.userData.envMats.forEach((m) => { m.envMap = env; m.needsUpdate = true; });
  if (old) old.dispose();
  pm.dispose(); rt.dispose(); scene.remove(cc);
  camera.position.copy(saved); updateLightBudget();
}
// (captured once, right after the loading screen: its textures are in by then, and it stays off the loading path)
finishLoading(renderer, scene, camera).then(() => setTimeout(captureMallEnv, 3000));

// ------------------------------------------------------------------ loop
const clock = new THREE.Clock();
let t = 0;
let doorOpen = 0;
let nearest = null;
const useBtn = document.getElementById('use');
let nearCar = null;
const useNearest = () => { if (mode === 'drive') return setMode('walk'); if (nearCar) return enterCar(nearCar); if (nearest) nearest.target = nearest.target ? 0 : 1; };
useBtn.addEventListener('click', useNearest);
addEventListener('keydown', (e) => { if (e.code === 'KeyE') useNearest(); });
const amberMats = new Set();
neon.traverse((o) => { if (o.isMesh && o.material.isMeshBasicMaterial && o.material.color.r > 1.9 && o.material.color.b === 0) amberMats.add(o.material); });
// polish pass: anything with userData.tick(t, dt) animates (message boards, creek water, arcade screens...)
let tickers = null;
function frame() {
  if (window.__loadingHold) { clock.getDelta(); requestAnimationFrame(frame); return; }   // (loading screen up: see loading.js)
  const rawDt = clock.getDelta(), dt = Math.min(rawDt, 0.05);
  t += dt;
  if (!tickers) { tickers = []; scene.traverse((o) => { if (o.userData && typeof o.userData.tick === 'function') tickers.push(o); }); }
  for (const o of tickers) o.userData.tick(t, dt);
  if (mode === 'walk') walk.update(dt);
  else if (mode === 'drive') drive.update(dt);
  else if (!window.__lock) orbit.update();
  sky.userData.update(camera, t);
  alien.userData.update(t);
  soupPots.forEach((p) => p.userData.update(t));
  puffCup.userData.update(t);
  creep.userData.update(t);
  cleanBotUpdate(t);
  mossCreatureUpdate(t);
  (alley.userData.anim || []).forEach((a) => a.userData.update(t));
  cart.userData.update(t);
  {
    const near = mode === 'walk' && Math.abs(walk.position.x - GS.x) < 2.2 && Math.abs(walk.position.z - (GS.z + 6)) < 2.6;
    grocery.userData.update(dt, near);
    blueHouse.userData.update(dt);
    groceryDoor.active = !grocery.userData.doorsOpen();
  }
  if ((lightTimer += dt) > 0.3) { lightTimer = 0; streamer.update(camera.position); updateLightBudget(); }
  walkPoles.forEach((p, i) => p.userData.update(t, i * 0.3));
  // Doors swing open when you walk up to them (inside or out).
  const near = mode === 'walk' && Math.hypot(walk.position.x - X1, walk.position.z - DOOR_Z) < 2.3;
  doorOpen += ((near ? 1 : 0) - doorOpen) * Math.min(1, dt * 4);
  // Doors you open yourself (E key or the on-screen button).
  let best = null, bestD = 3.2;
  for (const it of interactables) {
    it.t += Math.sign(it.target - it.t) * Math.min(Math.abs(it.target - it.t), dt * it.speed);
    it.setOpen(it.t);
    it.col.active = it.t < 0.6;
    const dd = Math.hypot(walk.position.x - it.x, walk.position.z - it.z);
    const sameFloor = it.y === undefined || Math.abs(walk.gy - it.y) < 1.2;
    if (mode === 'walk' && sameFloor && dd < bestD) { best = it; bestD = dd; }
  }
  nearest = best;
  nearCar = mode === 'walk' ? drive.nearest(walk.position) : null;
  if (nearCar && best && bestD < 1.6) nearCar = null;   // a door right next to you wins
  useBtn.hidden = !best && !nearCar;
  if (nearCar) useBtn.textContent = `Drive the ${nearCar.userData.driveName} (E)`;
  else if (best) useBtn.textContent = `${best.target ? 'Close' : 'Open'} ${best.name} (E)`;
  if (mode === 'drive') useBtn.hidden = true;
  door.userData.setOpen(doorOpen);
  doorCollider.active = doorOpen < 0.7;
  const f = 0.94 + 0.06 * Math.sin(t * 31) * Math.sin(t * 7.3); // subtle neon buzz
  for (const m of amberMats) m.color.setRGB(2.0 * f, 0.42 * f, 0.0);
  interiors.update(mode === 'walk' ? walk.position : camera.position, dt, mode !== 'drive');
  // the diner's key light is the only shadow caster: its shadow map is redrawn only while you're near the diner
  renderer.shadowMap.needsUpdate = renderer.shadowMap.enabled && Math.abs(camera.position.x) < 45 && Math.abs(camera.position.z) < 40;
  composer.render();   // (with the glow off this is one scene pass + the output pass, same colours as with it on)
  quality.frame(rawDt, performance.now());
  requestAnimationFrame(frame);
}
renderer.shadowMap.autoUpdate = false;
// automatic quality (see quality.js)
const quality = makeQuality({ renderer, apply: (q) => {
  renderer.setPixelRatio(q.pixelRatio); composer.setPixelRatio(q.pixelRatio); bloomPass.enabled = q.bloom;
  const lights = IS_PHONE ? 4 : q.heavy ? 8 : 4; if (lights !== MAX_LIGHTS) { MAX_LIGHTS = lights; updateLightBudget(); }
  if (key.castShadow !== q.heavy) { key.castShadow = q.heavy; renderer.shadowMap.needsUpdate = true; }
  streamer.setScale(q.stream); streamer.update(camera.position);
} });
window.__quality = quality;
frame();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});
window.__scene = { interiors, refresh: () => { streamer.update(camera.position); updateLightBudget(); }, composer, drive, enterCar, scene, camera, walk, setMode, interactables, walkPoles, creep, renderer, streamer };
