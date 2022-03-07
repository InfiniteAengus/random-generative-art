const layersOrder = [
    { name: 'Armor-1', number: 1 },
    { name: 'Base-2', number: 2 },
    { name: 'Body-1', number: 1 },
    { name: 'Ear-2', number: 2 },
    { name: 'Eyes-2', number: 2 },
];
  
const format = {
    width: 3000,
    height: 3000
};

const rarity = [
    { key: "", val: "original" },
    { key: "_r", val: "rare" },
    { key: "_sr", val: "super rare" },
];

const defaultEdition = 8;

module.exports = { layersOrder, format, rarity, defaultEdition };