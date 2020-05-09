export function findMask(location, masks) {
    for (let i = 0; i < masks.length; i++) {
        if (masks[i][location[1]][location[0]] === 1){
            return i
        }
    }
    return -1
}