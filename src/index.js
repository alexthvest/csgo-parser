const vdf = require("simple-vdf")
const fs = require("fs-extra")
const path = require("path")

const logger = require("./logger")
const Parser = require("./parser")

const config = require("data-store")({
  path: path.join(__dirname, "..", "config.json")
})

const gamePath = config.get("gamePath", undefined)
const outputPath = config.get("outputPath", path.join(__dirname, "..", "dist", "skins.txt"))
const output = {}

const { items, languages } = require("./reader")(gamePath)
const parser = new Parser(items, languages)

const rarities = {
  common: 0,
  uncommon: 1,
  rare: 2,
  mythical: 3,
  legendary: 4,
  ancient: 5,
  immortal: 5
}

parser.on("skin:parsed", item => {
  const cases = config.get("cases", {})
  let collectionName = ""

  if (item.collection === undefined) {
    logger.error(`Collection for "${item.name}" not found`)

    item.collection = config.get("defaultSkinCollection", "set_italy")
    config.set(`collections.${item.name}`, item.collection)
  }

  if (item.collection in cases) {
    collectionName = cases[item.collection]
  } else {
    logger.error(`Custom collection name for "${item.collection}" not found`)

    collectionName = item.translations.collection.english || "If you see this message, then the Valve has been screwed up again"
    config.set(`cases.${item.collection}`, collectionName)
  }

  output[item.id] = {
    name: item.translations.name.english,
    case: collectionName,
    rus_name: item.translations.name.russian,
    rarity: rarities[item.rarity]
  }
})

parser.on("done", () => {
  logger.info("All skins successfully parsed")

  fs.outputFileSync(outputPath, vdf.stringify(output, true))
  config.save()
})

parser.parse()