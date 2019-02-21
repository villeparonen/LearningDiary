const fs = require('fs');

/*public filereader class*/
module.exports = {

    /*Reads all the diary entries from the data.json file
        - contents of the data.json file are given as a parameter to the callback function
        @author Mari
    */
    readDiaryFile: function (fileName, callback) {
        fs.readFile(fileName, function (err, data) {
            try {
                var diaryText = JSON.parse(data);
                callback(diaryText);
            }
            catch (err) {
                console.log("File is empty");
                var diaryText = JSON.parse("[]");
                callback(diaryText);
            }
        });
    },

    /*Reads users diary entries from data.json file
        - contents of the data.json file are given as a parameter 
        - username as a parameter
        - calls a private function findUsersEntries
        - retuns an array of users diary entries
        @author Mari
    */
    readUsersEntries: function (fileContent, username) {
        var usersEntries = findUsersEntries(fileContent, username);
        return usersEntries;
    },


       /*Deletes users diary entry from data.json file
        - contents of the data.json file are given as a parameter 
        - username as a parameter
        - diary entry ID,
        - calls a private function findUsersEntries to get all the users diary entries
        - retuns an array of users diary entries that are left
        @author Inari, Jukka, Mari, Ville
    */
    deleteEntry: function (textId, username, fileContent) {
        var usersEntries = findUsersEntries(fileContent, username);
        for (var index in usersEntries) { //goes through the list of users entries 
            if (usersEntries[index].textID == textId) { //searching for the correct entry 
                usersEntries.splice(index, 1); //deletes an entry from index,
                for (var i in fileContent) {
                    if (fileContent[i].name == username) { //correct user was found from data.json
                        fileContent[i].diaryItemList = usersEntries; //users diary entries are updated
                        writeToDiaryFile('./files/data.json', fileContent);
                        return usersEntries;
                    }
                }
            }
        }
    },

    /*
        - parameter body is { "name": username, "diaryEntry": $entry, "date": $date, "subject": $subject }
        @author Jukka, Inari, Ville
    */
    editEntry: function (textId, username, body, fileContent) {
        var editedText = body.diaryEntry;
        var usersEntries = findUsersEntries(fileContent, username); 
        for (var index in usersEntries) {
            if (usersEntries[index].textID == textId) { //edited diary entry found comparing textID 
                usersEntries[index].diaryText = editedText; //diary entry text is updated
                for (var index in fileContent) {
                    if (fileContent[index].name == username) { 
                        fileContent[index].diaryItemList = usersEntries;//users entire diary item list is updated with the version of updated diary entry
                        writeToDiaryFile('./files/data.json', fileContent);
                        return usersEntries;
                    }
                }
            }
        } 
    },

    /*Saves new diary entry to the data.json file
        - params is the req.body ( { "name": writer, "diaryEntry": $entry, "date": $date, "subject": $subject } )
        - jsonContents of the data.json file are given as a parameter to the callback function
        - returns the new diary entry object
        @author Mari, Ville
    */
    saveNewEntryToJsonFile: function (params, jsonContents) {
        var writer = params.name;
        var entry = params.diaryEntry; //new diary entry text
        var subject = params.subject;

        var d = new Date(); //current time
        var entryId = d.getTime(); //current time in milliseconds
        var entryDate = params.date;
        var writerFound = false;

        for (var indeksi in jsonContents) {

            if (jsonContents[indeksi].name == writer) { //if writer has already submitted diary entries
                writerFound = true; //writer was found and has diary entries
                var olderJournalEntries = jsonContents[indeksi].diaryItemList; //saves writers old entries to a variable
                jsonContents[indeksi].diaryItemList = makeDiaryItemList(olderJournalEntries, entry, entryDate, subject); //makes a new entry and saves it to diaryitemlist
                writeToDiaryFile('./files/data.json', jsonContents);
            }
        }

        if (!writerFound) { //if diary entry is writers first entry (new user)
            var newEntryText = [{ "date": entryDate, "subject": subject, "diaryText": entry, "textID": entryId }];
            var diaryEntryObject = { "name": writer, "diaryItemList": newEntryText }
            jsonContents.push(diaryEntryObject); //Adds new writers diary entry to jsonContents 
            writeToDiaryFile('./files/data.json', jsonContents);
        }

        return diaryEntryObject;
    },
}

/* Function adds a new diary entry to an old list of diary entries 
   - private function, access is possibe only from fileReader.js
   - journalEntries is an array of old diary entries
   - newEntry is a new diary entry
   - entryDate is date
   - returns an array of all the user diary entries, new diary entry is included
   @author Mari
*/
function makeDiaryItemList(journalEntries, newEntry, entryDate, subject) {
    
    var d = new Date(); //current time
    var entryId = d.getTime(); // current time in milliseconds
    console.log(entryId);
    var entryTexts = journalEntries;
    var subject = subject;

    var newEntryText = { "date": entryDate, "subject": subject, "diaryText": newEntry, "textID": entryId };
    entryTexts.push(newEntryText); //new entry is pushed to an array of old entries

    return entryTexts;
}


/* Writes data to data.json file. 
   - private function, access is possibe only from fileReader.js
   - diaryInput value must be in json format
   @author Mari
*/
function writeToDiaryFile(filename, diaryInput) {
    console.log("kirjoitusta");
    fs.writeFile(filename, JSON.stringify(diaryInput), function () {
        console.log("Saved to files");
    });
};

/* Finds users diary entrie. Reads them from data.json and returns them as an array
   - private function, access is possibe only from fileReader.js
   - jsonContents is the data from data.json
   - returns an array of users diary entries
   - if user was not found return an empty array
   @author Mari
*/
function findUsersEntries(jsonContents, user) {
    var writerFound = false;
    var emptyArray = [];

    for (var indeksi in jsonContents) {

        if (jsonContents[indeksi].name == user) { //if writer was found from data.json
            writerFound = true;
            var oldJournalEntries = jsonContents[indeksi].diaryItemList;
            return oldJournalEntries; //returns writers old diary entries as an array
        }
    }

    if (!writerFound) {
        return emptyArray;
    }
}