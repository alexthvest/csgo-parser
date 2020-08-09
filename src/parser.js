const { EventEmitter } = require("events")

module.exports = class Parser extends EventEmitter {

  /**
   *
   * @param {{ items_game }} items
   * @param {{ russian, english }} languages
   */
  constructor(items, languages) {
    super()

    this._items = items
    this._languages = languages
  }

  /**
   * Parses skin collection
   * @param name
   */
  parseCollection(name) {
    const collections = this._items["items_game"]["item_sets"]
    return Object.keys(collections).find(collectionId => {
      const { items } = collections[collectionId]

      const itemId = Object.keys(items).find(id => {
        const match = id.match(/\[(.*)](.*)/)
        return match !== null && match[1] === name
      })

      return itemId !== undefined
    })
  }

  /**
   * Parses skin rarity
   * @param name
   */
  parseRarity(name) {
    const rarity = this._items["items_game"]["paint_kits_rarity"][name]
    return this.fixRarity(name) || rarity
  }

  /**
   *
   * @param name
   * @param collectionId
   */
  fixRarity(name) {
    const collections = this._items["items_game"]["client_loot_lists"]

    if (name === "")

    for (const collectionId in collections) {
      const items = collections[collectionId]
      for (const item in items) {
        const match = item.match(/\[(.*)].*/)
        if (!match || match[1] !== name) continue

        if (collectionId === "removed_items")
          return

        return collectionId.split("_").pop()
      }
    }
  }

  /**
   * Parses skins
   */
  parse() {
    const paintKits = this._items["items_game"]["paint_kits"]
    const items = []

    delete paintKits["0"] // Remove "default" paint kit
    delete paintKits["9001"] // Remove "workshop_default" paint kit

    for (const paintKitId in paintKits) {
      let { name, description_tag } = paintKits[paintKitId]
      if (description_tag === undefined) continue

      description_tag = description_tag.replace("#", "").toLowerCase()

      const rarity = this.parseRarity(name)
      const collection = this.parseCollection(name)

      const item = {
        id: paintKitId,
        name,
        rarity,
        collection,
        translations: {
          name: {
            english: this._languages.english[description_tag],
            russian: this._languages.russian[description_tag] || this._languages.english[description_tag]
          },
          collection: {
            english: this._languages.english[`CSGO_${collection}`.toLowerCase()],
            russian: this._languages.russian[`CSGO_${collection}`.toLowerCase()]
          }
        }
      }

      this.emit("skin:parsed", item)
      items.push(item)
    }

    this.emit("done")
    return items
  }
}