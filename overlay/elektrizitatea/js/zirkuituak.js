// Laborategiko adibide-zirkuituak.
// Sareko puntuak (x, y); osagai bakoitza bi puntu ondoren artean: "x,y,h" (eskuinera) edo "x,y,v" (behera).
// Pilak: + borna b-n (eskuinean edo behean); alderantziz: true → + borna a-n (ezkerrean edo goian).

const k = (x, y, d, mota, props = {}) => [`${x},${y},${d}`, mota, props];

// Kable zuzenak puntuz puntu: bidea([0,0],[4,0],[4,2])
function bidea(...pts) {
  const out = [];
  for (let i = 1; i < pts.length; i++) {
    let [x, y] = pts[i - 1];
    const [tx, ty] = pts[i];
    while (x !== tx || y !== ty) {
      if (x < tx) { out.push(k(x, y, 'h', 'kablea')); x++; }
      else if (x > tx) { x--; out.push(k(x, y, 'h', 'kablea')); }
      else if (y < ty) { out.push(k(x, y, 'v', 'kablea')); y++; }
      else { y--; out.push(k(x, y, 'v', 'kablea')); }
    }
  }
  return out;
}

export const ADIBIDEAK = {
  hutsa: { izena: 'Taula hutsa', nx: 9, ny: 6, osagaiak: [] },

  sinplea: {
    izena: 'Zirkuitu sinplea', nx: 5, ny: 3,
    osagaiak: [
      k(0, 0, 'v', 'kablea'), k(0, 1, 'v', 'pila', { balioa: 4.5, alderantziz: true, n: 1 }),
      k(0, 0, 'h', 'kablea'), k(1, 0, 'h', 'etengailua', { itxita: true, n: 1 }), ...bidea([2, 0], [4, 0]),
      k(4, 0, 'v', 'bonbilla', { bonbilla: '4V5', n: 1 }), k(4, 1, 'v', 'kablea'),
      ...bidea([0, 2], [4, 2])
    ]
  },

  ohm: {
    izena: 'Pila eta erresistentzia', nx: 5, ny: 3,
    osagaiak: [
      k(0, 0, 'v', 'kablea'), k(0, 1, 'v', 'pila', { balioa: 12, alderantziz: true, n: 1 }),
      k(0, 0, 'h', 'kablea'), k(1, 0, 'h', 'amperimetroa', { n: 1 }), ...bidea([2, 0], [4, 0]),
      k(4, 0, 'v', 'erresistentzia', { balioa: 100, n: 1 }), k(4, 1, 'v', 'kablea'),
      ...bidea([0, 2], [4, 2])
    ]
  },

  seriea: {
    izena: 'Bi bonbilla seriean', nx: 5, ny: 3,
    osagaiak: [
      k(0, 0, 'v', 'kablea'), k(0, 1, 'v', 'pila', { balioa: 6, alderantziz: true, n: 1 }),
      k(0, 0, 'h', 'kablea'), k(1, 0, 'h', 'bonbilla', { bonbilla: '6V3W', n: 1 }), k(2, 0, 'h', 'kablea'), k(3, 0, 'h', 'bonbilla', { bonbilla: '6V3W', n: 2 }),
      ...bidea([4, 0], [4, 2]),
      ...bidea([0, 2], [4, 2])
    ]
  },

  'seriea-r': {
    izena: 'Hiru erresistentzia seriean', nx: 5, ny: 3,
    osagaiak: [
      k(0, 0, 'v', 'kablea'), k(0, 1, 'v', 'pila', { balioa: 12, alderantziz: true, n: 1 }),
      k(0, 0, 'h', 'kablea'), k(1, 0, 'h', 'erresistentzia', { balioa: 10, n: 1 }), k(2, 0, 'h', 'kablea'), k(3, 0, 'h', 'erresistentzia', { balioa: 20, n: 2 }),
      k(4, 0, 'v', 'kablea'), k(4, 1, 'v', 'erresistentzia', { balioa: 30, n: 3 }),
      k(1, 2, 'h', 'amperimetroa', { n: 1 }), k(0, 2, 'h', 'kablea'), ...bidea([2, 2], [4, 2])
    ]
  },

  paraleloa: {
    izena: 'Bi bonbilla paraleloan', nx: 5, ny: 3,
    osagaiak: [
      k(0, 0, 'v', 'kablea'), k(0, 1, 'v', 'pila', { balioa: 6, alderantziz: true, n: 1 }),
      ...bidea([0, 0], [4, 0]),
      k(2, 0, 'v', 'bonbilla', { bonbilla: '6V3W', n: 1 }), k(2, 1, 'v', 'kablea'),
      k(4, 0, 'v', 'bonbilla', { bonbilla: '6V3W', n: 2 }), k(4, 1, 'v', 'kablea'),
      ...bidea([0, 2], [4, 2])
    ]
  },

  'paraleloa-r': {
    izena: 'Hiru adar paraleloan', nx: 6, ny: 3,
    osagaiak: [
      k(0, 0, 'v', 'kablea'), k(0, 1, 'v', 'pila', { balioa: 12, alderantziz: true, n: 1 }),
      k(0, 0, 'h', 'amperimetroa', { n: 1 }), ...bidea([1, 0], [5, 0]),
      k(1, 0, 'v', 'erresistentzia', { balioa: 20, n: 1 }), k(1, 1, 'v', 'kablea'),
      k(3, 0, 'v', 'erresistentzia', { balioa: 30, n: 2 }), k(3, 1, 'v', 'kablea'),
      k(5, 0, 'v', 'erresistentzia', { balioa: 60, n: 3 }), k(5, 1, 'v', 'kablea'),
      ...bidea([0, 2], [5, 2])
    ]
  },

  etxea: {
    izena: 'Etxeko argiak: etengailu bana', nx: 7, ny: 3,
    osagaiak: [
      k(0, 0, 'v', 'kablea'), k(0, 1, 'v', 'pila', { balioa: 12, alderantziz: true, n: 1 }),
      k(0, 0, 'h', 'fusiblea', { balioa: 2, n: 1 }), ...bidea([1, 0], [6, 0]),
      k(2, 0, 'v', 'etengailua', { itxita: true, n: 1 }), k(2, 1, 'v', 'bonbilla', { bonbilla: '12V6W', n: 1 }),
      k(4, 0, 'v', 'etengailua', { itxita: false, n: 2 }), k(4, 1, 'v', 'bonbilla', { bonbilla: '12V6W', n: 2 }),
      k(6, 0, 'v', 'etengailua', { itxita: true, n: 3 }), k(6, 1, 'v', 'bonbilla', { bonbilla: '12V6W', n: 3 }),
      ...bidea([0, 2], [6, 2])
    ]
  },

  mistoa: {
    izena: 'Zirkuitu mistoa', nx: 6, ny: 3,
    osagaiak: [
      k(0, 0, 'v', 'kablea'), k(0, 1, 'v', 'pila', { balioa: 12, alderantziz: true, n: 1 }),
      k(0, 0, 'h', 'kablea'), k(1, 0, 'h', 'erresistentzia', { balioa: 10, n: 1 }), ...bidea([2, 0], [5, 0]),
      k(3, 0, 'v', 'erresistentzia', { balioa: 30, n: 2 }), k(3, 1, 'v', 'kablea'),
      k(5, 0, 'v', 'erresistentzia', { balioa: 60, n: 3 }), k(5, 1, 'v', 'kablea'),
      ...bidea([0, 2], [5, 2])
    ]
  },

  neurketak: {
    izena: 'Amperimetroa eta voltimetroa', nx: 6, ny: 4,
    osagaiak: [
      k(0, 0, 'v', 'kablea'), k(0, 1, 'v', 'pila', { balioa: 9, alderantziz: true, n: 1 }), k(0, 2, 'v', 'kablea'),
      k(0, 0, 'h', 'kablea'), k(1, 0, 'h', 'amperimetroa', { n: 1 }), ...bidea([2, 0], [4, 0]),
      k(4, 0, 'v', 'erresistentzia', { balioa: 100, n: 1 }), ...bidea([4, 1], [4, 3]),
      k(4, 0, 'h', 'kablea'), k(5, 0, 'v', 'voltimetroa', { n: 1 }), k(4, 1, 'h', 'kablea'),
      ...bidea([0, 3], [4, 3])
    ]
  },

  zubia: {
    izena: 'Wheatstone-ren zubia', nx: 5, ny: 3,
    osagaiak: [
      k(0, 0, 'v', 'kablea'), k(0, 1, 'v', 'pila', { balioa: 12, alderantziz: true, n: 1 }),
      ...bidea([0, 0], [3, 0]), ...bidea([0, 2], [3, 2]),
      k(1, 0, 'v', 'erresistentzia', { balioa: 10, n: 1 }), k(1, 1, 'v', 'erresistentzia', { balioa: 30, n: 3 }),
      k(3, 0, 'v', 'erresistentzia', { balioa: 20, n: 2 }), k(3, 1, 'v', 'erresistentzia', { balioa: 40, n: 4 }),
      k(1, 1, 'h', 'amperimetroa', { n: 1 }), k(2, 1, 'h', 'erresistentzia', { balioa: 50, n: 5 })
    ]
  },

  kirchhoff: {
    izena: 'Bi pila, hiru adar', nx: 5, ny: 3,
    osagaiak: [
      k(0, 0, 'v', 'kablea'), k(0, 1, 'v', 'pila', { balioa: 12, alderantziz: true, n: 1 }),
      k(0, 0, 'h', 'kablea'), k(1, 0, 'h', 'erresistentzia', { balioa: 4, n: 1 }),
      k(2, 0, 'h', 'kablea'), k(3, 0, 'h', 'erresistentzia', { balioa: 3, n: 3 }),
      k(2, 0, 'v', 'erresistentzia', { balioa: 6, n: 2 }), k(2, 1, 'v', 'kablea'),
      k(4, 0, 'v', 'kablea'), k(4, 1, 'v', 'pila', { balioa: 6, alderantziz: true, n: 2 }),
      ...bidea([0, 2], [4, 2])
    ]
  }
};
