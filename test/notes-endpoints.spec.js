//for testing the notes endpoints
const knex = require('knex')
const app = require('../src/app')
const { makeNotes, makeMaliciousNote } = require('./notes.fixtures')
const { maliciousNote, expectedNote } = makeMaliciousNote()
const { makeFolders } = require('./folders.fixtures')

describe('Notes Endpoints', function() {

    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db.raw('TRUNCATE noteful_folders, noteful_notes RESTART IDENTITY CASCADE'))

    afterEach('cleanup', () => db.raw('TRUNCATE noteful_folders, noteful_notes RESTART IDENTITY CASCADE'))

    //describe 'GET /noteful-api/notes'
    describe('GET /noteful-api/notes', () => {
        context('Given no notes', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    //GET
                    .get('/noteful-api/notes')
                    .expect(200, [])
            })
        })//End context 'Given no notes'

        context('Given there are notes in the database', () => {
            const testFolders = makeFolders()
            const testNotes = makeNotes()

            beforeEach('insert folders before notes', () => {
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
                    .then(() => {
                        return db
                            .into('noteful_notes')
                            .insert(testNotes)
                    })
            })

            it('responds with 200 and all of the notes', () => {
                return supertest(app)
                    //GET
                    .get('/noteful-api/notes')
                    .expect(200, testNotes)
            })
        })//End context 'Given there are notes in the database'

        context('Given it includes an XSS attack folder', () => {
            const testFolders = makeFolders()

            beforeEach('insert malicious folder', () => {
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
                    .then(() => {
                        return db
                            .into('noteful_notes')
                            .insert(maliciousNote)
                    })
            })

            it('removes XSS attack content', () => {
                return supertest(app)
                    .get('/noteful-api/notes')
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].name).to.eql(expectedNote.name)
                        expect(res.body[0].content).to.eql(expectedNote.content)
                    })
            })
        })//End context 'Given it includes an XSS attack note'
    
    })//end describe 'GET /noteful-api/notes'

    //describe 'POST /noteful-api/notes'
    describe('POST /noteful-api/notes', () => {
        const testFolders = makeFolders()
        
        beforeEach('insert folders', () => {
            return db
                .into('noteful_folders')
                .insert(testFolders)
        })

        it('creates a note, responding with 201 and the new note', function() {
            const newNote = {
                name: "Test Note #1",
                folder_id: 1,
                content: "Here is some content."
            }
            return supertest(app)
                .post('/noteful-api/notes')
                .send(newNote)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id')
                    expect(res.body.name).to.eql(newNote.name)
                    const expected = new Date().toLocaleString()
                    const actual = new Date(res.body.modified).toLocaleString()
                    expect(actual).to.eql(expected)
                    expect(res.body.folder_id).to.eql(newNote.folder_id)
                    expect(res.body.content).to.eql(newNote.content)
                })
                .then(postRes => 
                    supertest(app)
                        .get(`/noteful-api/notes/${postRes.body.id}`)
                        .expect(postRes.body)
                )
        })


        const requiredFields = ['name', 'folder_id']

        requiredFields.forEach(field => {
            const newNote = {
                name: "Test new note",
                folder_id: 2
            }

            it(`responds with 400 and an error message when the ${field} is missing`, () => {
               delete newNote[field]

               return supertest(app)
                    .post('/noteful-api/notes')
                    .send(newNote)
                    .expect(400, {
                        error: {message: `Missing '${field}' in request body`}
                    })
            })
        })

        it('removes XSS attack content from response', () => {
            return supertest(app)
                .post('/noteful-api/notes')
                .send(maliciousNote)
                .expect(201)
                .expect(res => {
                    expect(res.body.name).to.eql(expectedNote.name)
                })
        })
    })//end describe 'POST /noteful-api/notes' 





})    