

const fs = require("fs")

const result = fs.readFileSync("C:\\Program Files\\ai\\sdweb\\webui\\extensions\\sd-dynamic-prompts\\wildcards\\customIL\\cn_antions.txt").toString()


const tags = result.split("\r\n").map(i => {
    return i.split(",").map(j => j.trim())
});

const resultTags = countTags(tags).sort((a, b) => b.indexes.length - a.indexes.length)

// fs.writeFileSync("C:\\Program Files\\ai\\sdweb\\webui\\extensions\\sd-dynamic-prompts\\wildcards\\customIL\\cn_antions.json", JSON.stringify(resultTags))

const repackedTags = {
    anal: collect(["anal"], []),
    voi: collect(["vaginal object insertion"], []),
    blowjob: collect(["fellatio"], []),
    girl: collect(["1girl", "2girls"], ["1boy"]),
}

Object.entries(repackedTags).forEach(element => {
    fs.writeFileSync("C:\\Program Files\\ai\\sdweb\\webui\\extensions\\sd-dynamic-prompts\\wildcards\\customIL\\cn_antions_" + element[0] + ".txt", 
        element[1].map(i => {
            return tags[i].join(",")
        }).join("\r\n")
    )
});

debugger;

/**
 * 
 * @param {Array} contains 
 * @param {Array} notContains 
 */
function collect(contains, notContains) {
    const containsIndex = [...new Set(...contains.reduce((array, value) => {
        const tagObject = resultTags.find(i => {
            return i.tag === value
        });

        if(!tagObject)
            return array;

        return [...array, tagObject.indexes]
    },[]))];

    return containsIndex.filter(i => {
        return !notContains.some(j => {
            return tags[i].indexOf(j) >= 0
        })
    });

     
}

debugger;


function countTags(tags) {
    const tagMap = {};

    tags.forEach((row, rowIndex) => {
        row.forEach(tag => {
            if (!tagMap[tag]) {
                tagMap[tag] = { tag, indexes: [] };
            }
            if (!tagMap[tag].indexes.includes(rowIndex)) {
                tagMap[tag].indexes.push(rowIndex);
            }
        });
    });

    return Object.values(tagMap);
}
