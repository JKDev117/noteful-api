//for testing the notes endpoints

const knex = require('knex')
const app = require('../src/app')

const { makeNotes } = require('./notes.fixtures')

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

    before('clean the table', () => db('noteful_notes').truncate())

    afterEach('cleanup', () => db('noteful_notes').truncate())


    describe('GET /noteful-api/notes', () => {
        context('Given no notes', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/noteful-api/notes')
                    .expect(200, [])
            })
        })
    })


})    