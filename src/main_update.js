const fs = require('fs')
const { createCanvas, loadImage } = require('canvas')
const console = require('console')
const { layersOrder, format, rarity } = require('./config.js')

const canvas = createCanvas(format.width, format.height)
const ctx = canvas.getContext('2d')

process.env.PWD = process.cwd()

const buildDir = `${process.env.PWD}/build`
const metDataFile = '_metadata.json'
const layersDir = `${process.env.PWD}/layers`

let metadata = []
let attributes = []
let hash = []
let decodedHash = []
const Exists = new Map()

const addRarity = (_str) => {
  let itemRarity

  rarity.forEach((r) => {
    if (_str.includes(r.key)) {
      itemRarity = r.val
    }
  })

  return itemRarity
}

const cleanName = (_str) => {
  let name = _str.slice(0, -4)
  rarity.forEach((r) => {
    name = name.replace(r.key, '')
  })
  return name
}

const getElements = (path) => {
  return fs
    .readdirSync(path)
    .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
    .map((i, index) => {
      return {
        id: index + 1,
        name: cleanName(i),
        fileName: i,
        rarity: addRarity(i),
      }
    })
}

const layersSetup = (layersOrder) => {
  const layers = layersOrder.map((layerObj, index) => ({
    id: index,
    name: layerObj.name,
    location: `${layersDir}/${layerObj.name}/`,
    elements: getElements(`${layersDir}/${layerObj.name}/`),
    position: { x: 0, y: 0 },
    size: { width: format.width, height: format.height },
    number: layerObj.number,
  }))

  return layers
}

const buildSetup = () => {
  if (fs.existsSync(buildDir)) {
    fs.rmdirSync(buildDir, { recursive: true })
  }
  fs.mkdirSync(buildDir)
}

const saveLayer = (_canvas, _edition) => {
  fs.writeFileSync(`${buildDir}/${_edition}.png`, _canvas.toBuffer('image/png'))
}

const addMetadata = (_edition) => {
  let tempMetadata = {
    name: `NoNo\'s Club #${_edition}`,
    description: 'One of 9999 beautiful NFTs',
    attributes: attributes,
  }
  metadata.push(tempMetadata)
  attributes = []
  hash = []
  decodedHash = []
}

const addAttributes = (_element, _layer) => {
  let tempAttr = {
    trait_type: _layer.name,
    value: _element.name,
  }
  attributes.push(tempAttr)
  hash.push(_layer.id)
  hash.push(_element.id)
  decodedHash.push({ [_layer.id]: _element.id })
}

const drawLayer = async (_layer, _edition, _id) => {
  let element = _layer.elements[_id] ? _layer.elements[_id] : null
  if (element) {
    addAttributes(element, _layer)
    const image = await loadImage(`${_layer.location}${element.fileName}`)

    ctx.drawImage(
      image,
      _layer.position.x,
      _layer.position.y,
      _layer.size.width,
      _layer.size.height
    )
    saveLayer(canvas, _edition)
  }
}

const createFiles = async () => {
  const layers = layersSetup(layersOrder)

  const ids = new Array(layers.length).fill(0)

  getNextCombination(layers, ids, 0)
}

const getNextCombination = async (_layers, _ids, _totIndex) => {
  await _layers.forEach(async (layer, index) => {
    await drawLayer(layer, _totIndex, _ids[index])
  })

  let key = hash.toString()
  Exists.set(key, _totIndex)
  addMetadata(_totIndex)

  console.log('Creating index', _totIndex)
  
  _ids[0]++

  if (_ids[0] === _layers[0].number) {
    let i = 0
    while (_ids[i] === _layers[i].number) {
      _ids[i] = 0
      _ids[++i]++

      if (i === _layers.length) {
        return
      }
    }
  }

  getNextCombination(_layers, _ids, _totIndex + 1)
}

const createMetaData = () => {
  fs.stat(`${buildDir}/${metDataFile}`, (err) => {
    if (err == null || err.code === 'ENOENT') {
      fs.writeFileSync(
        `${buildDir}/${metDataFile}`,
        JSON.stringify(metadata, null, 2)
      )
    } else {
      console.log('Oh no, error: ', err.code)
    }
  })
}

module.exports = { buildSetup, createFiles, createMetaData }
