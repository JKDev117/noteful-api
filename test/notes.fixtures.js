function makeNotes() {
    return [
        {
            id: 1,
            name: "Test Note #1",
            modified: "2020-04-26T00:45:18.000Z",
            folder_id: 1,
            content: "Here is some content."
        },
        {
            id: 2,
            name: "Test Note #2",
            modified: "2020-04-27T00:45:18.000Z",
            folder_id: 2,
            content: "Here is some content."
        },
        {
            id: 3,
            name: "Test Note #3",
            modified: "2020-04-28T00:45:18.000Z",
            folder_id: 3,
            content: "Here is some content."
        }
    ]
}


function makeMaliciousNote() {
    const maliciousNote = {
        id: 4,
        name: `Bad Note <script>alert("xss");</script>`,
        modified: "2020-04-29 00:45:18",
        folder_id: 3,
        content: `Here is some <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);"> content.`
    }

    const expectedNote = {
        ...maliciousNote,
        name: `Bad Note &lt;script&gt;alert(\"xss\");&lt;/script&gt;`,
        content: `Here is some <img src="https://url.to.file.which/does-not.exist"> content.`
    }

    return {
        maliciousNote,
        expectedNote
    }
}

module.exports = {
    makeNotes,
    makeMaliciousNote
}

