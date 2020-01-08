const phin = require("phin").defaults({
    parse: "json",
    timeout: 12000
})

const ASSET_IDS = [
    "2", // T-shirts
    "11", // Shirts
    "12" // Pants
]

const ASSET_API = (assetId, userId, cursor = "") => `https://www.roblox.com/users/inventory/list-json?assetTypeId=${assetId}&cursor=${cursor}&itemsPerPage=100&pageNumber=1&sortOrder=Desc&userId=${userId}`

const USER_API = (username) => `https://api.roblox.com/users/get-by-username?username=${username}`

class GroupInventory {
    constructor(groupId) {
        this.groupId = groupId
        this.owned = 0
        this.userId = null
    }

    async setIdFromUsername(username) {
        let data = await phin({url: USER_API(username)})
        data = data.body
        if (data.errorMessage)
            throw new Error(data.errorMessage)
        this.userId = data.Id
        return this.userId
    }

    async getOwnedOfAssetId(asset, cursor = "") {
        let data = await phin({url: ASSET_API(asset, this.userId, cursor)})
        data = data.body.Data

        let items = data.Items

        if (!items || !items.length) return

        items.forEach((item) => {
            if (item.Creator.Id === this.groupId) {
                this.owned++
            }
        })

        let pageCursor = data.nextPageCursor

        return pageCursor && this.getOwnedOfAssetId(asset, pageCursor)
    }

    async getOwned() {
        let requests = []

        for (let asset of ASSET_IDS)
            requests.push(this.getOwnedOfAssetId(asset))

        await Promise.all(requests)

        return this.owned
    }
}

module.exports = GroupInventory