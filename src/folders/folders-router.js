const path = require('path')
const express = require('express')
const xss = require('xss')
const FoldersService = require('./folders-service')

const foldersRouter = express.Router()
const jsonParser = express.json()

const serializeFolder = folder => ({
    id: folder.id,
    name: xss(folder.name)
})


foldersRouter
    .route('/') //route('/') is '/noteful-api/folders/'
    //GET
    .get((req,res,next) => {
        const knexInstance = req.app.get('db')
        FoldersService.getAllFolders(knexInstance)
            .then(folders => {
                res.json(folders.map(serializeFolder))
            })
            .catch(next)
    })
    //POST
    .post(jsonParser, (req,res,next) => {
        const { name } = req.body
        const newFolder = { name }

        for(const [key, value] of Object.entries(newFolder)){
            if(value == null){
                return res
                    .status(400)
                    .json({error: {message: `Missing '${key}' in request body`}})
            }
        }

        newFolder.name = name

        FoldersService.addFolder(
            req.app.get('db'),
            newFolder
        )
            .then(folder => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${folder.id}`))
                    .json(serializeFolder(folder))
            })
            .catch(next)
    })

foldersRouter
    .route('/:folder_id') //route('/:folder_id') is '/noteful-api/folders/:folder_id'
    //ALL
    .all((req,res,next) => {
        FoldersService.getById(
            req.app.get('db'),
            req.params.folder_id
        )
        .then(folder => {
            if(!folder){
                return res.status(404).json({
                    error:{message: `Folder doesn't exist.`}
                })
            }
            res.folder = folder
            console.log(res.folder)
            next()
        })
        .catch(next)
    })
    //GET
    .get((req,res,next) => 
        res.json(serializeFolder(res.folder))
    )




module.exports = foldersRouter


/* Additional Note(s):


*/