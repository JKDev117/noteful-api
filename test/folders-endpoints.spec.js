//for testing the folders endpoints
const knex = require('knex')
const app = require('../src/app')
const { makeFolders, makeMaliciousFolder } = require('./folders.fixtures')
const { maliciousFolder, expectedFolder } = makeMaliciousFolder()

describe('Folders Endpoints', function() {

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

    //describe 'GET /noteful-api/folders'
    describe('GET /noteful-api/folders', () => {
        context('Given no folders', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    //GET
                    .get('/noteful-api/folders')
                    .expect(200, [])
            })
        })//End context 'Given no folders'

        context('Given there are folders in the database', () => {
            const testFolders = makeFolders()

            beforeEach('insert folders', () => {
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
            })

            it('responds with 200 and all of the folders', () => {
                return supertest(app)
                    //GET
                    .get('/noteful-api/folders')
                    .expect(200, testFolders)
            })
        })//End context 'Given there are folders in the database'

        context('Given it includes an XSS attack folder', () => {
            const testFolders = makeFolders()

            beforeEach('insert malicious folder', () => {
                return db
                    .into('noteful_folders')
                    .insert([maliciousFolder])
            })

            it('removes XSS attack content', () => {
                return supertest(app)
                    .get('/noteful-api/folders')
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].name).to.eql(expectedFolder.name)
                    })
            })
        })//End context context 'Given it includes an XSS attack folder'
    
    })//end describe 'GET /noteful-api/folders'








})//end describe 'Folders Endpoints'