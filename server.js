/*
        -SERVER
        @author Inari, Jukka, Ville, Mari
*/

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
var parser = bodyParser.urlencoded({ extended: true });
app.use(bodyParser.json());
var router = express.Router();
var reader = require('./js/fileReader')
const fs = require('fs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());

// Login pagen POST and on sucessfull login redirect to main page
app.post('/login', function (req, res) {
    console.log(req.body.username);
    res.cookie('username', req.body.username);
    res.redirect('/main.html');
})

//Logout from the main page and clearing the username cookie
app.post('/logout', function (req, res) {
    res.clearCookie('username');
    res.redirect('/');
});

//GET all the diary entries from the data.json on "kovalevyn nurkalla" :D
//and return the file content.
router.route('/diaryEntries')
    .get(function (req, res) {
        reader.readDiaryFile('./files/data.json', function (fileContent) {
            res.json(fileContent);
        });
    })

    /*POST a new diary entry to data.json.
        -Reads the data.json from HD and callback returns the file content.
        -A function adds the new diary entry to the content and writes the content to the data.json.
        -Res.json returns the new diary entry.
    */
    .post(function (req, res) {
        reader.readDiaryFile('./files/data.json', function (contentsOfJson) {
            var newDiaryEntry = reader.saveNewEntryToJsonFile(req.body, contentsOfJson);
            res.json(newDiaryEntry);
        })
    })

/* DELETE a diary entry.
    -Reads the data.json from HD and callback returns the file content.
    -A function deletes the diary entry and writes the content to the data.json.
*/
router.route('/diaryEntries/:username/:textId')
    .delete(function (req, res) {
        reader.readDiaryFile('./files/data.json', function (contentsOfJson) {
            var restEntries = reader.deleteEntry(req.params.textId, req.params.username, contentsOfJson);
            res.json(restEntries);
        })
    })

/*PUT to update a diary entry.
    -Reads the data.json from HD and callback returns the file content.
    -A function updates the diary entry in the content and writes the content to the data.json.
    -Res.json sends user's all entries.
*/
    .put(function (req, res) {
        reader.readDiaryFile('./files/data.json', function (contentsOfJson) {
            var usersEntries = reader.editEntry(req.params.textId, req.params.username, req.body, contentsOfJson);
            res.json(usersEntries);
        })
    })

/*GET to return user's diaryentries (an array).
    -If nothing was found sendsan empty json array.
    -Reads the data.json from the HD and callback returns the file content.
    -A function returns user's entries and res.json sends user's all entries.
*/
router.route('/diaryEntries/:username')
    .get(function (req, res) {
        reader.readDiaryFile('./files/data.json', function (fileContent) {
            var usersDiaryEntries = reader.readUsersEntries(fileContent, req.params.username);
            res.json(usersDiaryEntries);
        });
    })

app.use('/api', router);

let server = app.listen(3000, () => {
    console.log(`Server listening on ${server.address().port}`);
});