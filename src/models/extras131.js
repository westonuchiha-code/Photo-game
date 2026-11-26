// Things that live outside src/models, wrapped so the model viewer can list them: every car body, the shop goods,
// the spray booth, the two wrong places, the room kinds, the photo-faced character, the first-person arm.
import * as THREE from 'three';
import { makeCar } from '../vehicle/carbody2.js';
import { makeGood } from '../shop/goods.js';
import { makeBooth } from '../shop/bodyshop.js';
import { makeWrongPlace } from '../mood/wrong.js';
import { makeInterior } from './interiors91.js';
import { makeCharacter, makePerson, CHARACTERS } from './people96.js';
import { ITEM } from '../npc/lines.js';

export function makeCarHatch() { return makeCar({ type: 'hatch' }); }
export function makeCarSedan() { return makeCar({ type: 'sedan' }); }
export function makeCarCoupe() { return makeCar({ type: 'coupe' }); }
export function makeCarKei() { return makeCar({ type: 'kei' }); }
export function makeCarWagon() { return makeCar({ type: 'wagon' }); }
export function makeCarPickup() { return makeCar({ type: 'pickup' }); }
export function makeCarVan() { return makeCar({ type: 'van' }); }
export function makeCarScout() { return makeCar({ type: 'scout' }); }
export function makeCarBigtruck() { return makeCar({ type: 'bigtruck' }); }
export function makeCarKeitruck() { return makeCar({ type: 'keitruck' }); }
export function makeCarKeivan() { return makeCar({ type: 'keivan' }); }
export function makeCarKeiold() { return makeCar({ type: 'keiold' }); }
export function makeCarKeisport() { return makeCar({ type: 'keisport' }); }
export function makeCarOldvan() { return makeCar({ type: 'oldvan' }); }
export function makeAllShopGoods() { const g = new THREE.Group(); let i = 0; for (const name of ITEM.keys()) { const o = makeGood(name); if (!o) continue; o.position.set((i % 9) * 0.34, 0, Math.floor(i / 9) * 0.4); g.add(o); i++; } return g; }
export function makeSprayBooth() { return makeBooth(); }
export function makeEndlessCorridor() { return makeWrongPlace('corridor').group; }
export function makeDarkHall() { return makeWrongPlace('hall').group; }
export function makeRoomShop() { return makeInterior({ U: 10, V: 9, doorX: 5, type: 'shop', seed: 3 }); }
export function makeRoomFlat() { return makeInterior({ U: 10, V: 9, doorX: 5, type: 'flat', seed: 3 }); }
export function makeRoomStudio() { return makeInterior({ U: 10, V: 9, doorX: 5, type: 'studio', seed: 3 }); }
export function makeRoomOffice() { return makeInterior({ U: 10, V: 9, doorX: 5, type: 'office', seed: 3 }); }
export function makeRoomClinic() { return makeInterior({ U: 10, V: 9, doorX: 5, type: 'clinic', seed: 3 }); }
export function makeRoomPolice() { return makeInterior({ U: 10, V: 9, doorX: 5, type: 'police', seed: 3 }); }
export function makeRoomSchool() { return makeInterior({ U: 10, V: 9, doorX: 5, type: 'school', seed: 3 }); }
export function makeHank() { return makeCharacter(CHARACTERS.hank); }
export function makePeopleLineUp() { const g = new THREE.Group(); for (let i = 0; i < 10; i++) { const p = makePerson(300 + i * 7); p.position.x = i * 0.8; g.add(p); } return g; }
