const path = require('path')
const express = require('express')
const xss = require('xss')
const NotesService = require('./notes-service')

const notesRouter = express.Router()
const jsonParser = express.json()

const serializeNote = note => ({
    id: note.id,
    name: xss(note.name),
    modified: note.modified,
    folder_id: note.folder_id,
    content: xss(note.content)
})

notesRouter
    .route('/') //route('/') is '/noteful-api/notes/'
    //GET
    .get((req,res,next) => {
        const knexInstance = req.app.get('db')
        NotesService.getAllNotes(knexInstance)
            .then(notes => {
                res.json(notes.map(serializeNote))
            })
            .catch(next)
    })
    //POST
    .post(jsonParser, (req,res,next) => {
        const { name, content, folder_id } = req.body
        const newNote = { name, folder_id }

        for(const [key, value] of Object.entries(newNote)){
            if(value == null){
                return res
                    .status(400)
                    .json({error: {message: `Missing '${key}' in request body`}})
            }
        }

        newNote.content = content

        NotesService.addNote(
            req.app.get('db'),
            newNote
        )
            .then(note => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${note.id}`))
                    .json(serializeNote(note))
            })
            .catch(next)
    })






notesRouter
    .route('/:note_id') //route('/:note_id') is '/noteful-api/notes/:note_id'
    //ALL
    .all((req,res,next) => {
        NotesService.getById(
            req.app.get('db'),
            req.params.note_id
        )
        .then(note => {
            if(!note){
                return res.status(404).json({
                    error:{message: `Note doesn't exist.`}
                })
            }
            res.note = note
            next()
        })
        .catch(next)
    })
    //GET
    .get((req,res,next) => 
        res.json(serializeNote(res.note))
    )
   //DELETE
   .delete((req,res,next) => {
        NotesService.deleteNote(
            req.app.get('db'),
            req.params.note_id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })






module.exports = notesRouter


/*
Example Post Body Req
    {
        "id": 1,
        "name": "Dogs",
        "modified": "2020-04-27T04:45:18.887Z",
        "folder_id": 1,
        "content": "Here is some content"
    }

*/