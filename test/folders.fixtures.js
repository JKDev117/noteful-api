function makeFolders() {
    return [
        {
            id: 1,
            name: "Test Folder 1",
        },
        {
            id: 2,
            name: "Test Folder 2"
        },
        {
            id: 3,
            name: "Test Folder 3"
        }
    ]
}

function makeMaliciousFolder() {
    const maliciousFolder = {
        id: 4,
        name: 'Bad title <script>alert("xss");</script>'
    }

    const expectedFolder = {
        ...maliciousFolder,
        name: 'Bad title &lt;script&gt;alert(\"xss\");&lt;/script&gt;'
    }

    return {
        maliciousFolder,
        expectedFolder
    }
}




module.exports = {
    makeFolders,
    makeMaliciousFolder
}



