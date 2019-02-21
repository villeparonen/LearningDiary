
$(document).ready(function () {
    // Wait until dom is ready
    // Greet user with "hey username!" using cookie
    // Remove problem of making "%20" as a space character(s)
    // @author Ville
    const precookie = document.cookie.split("=");
    const find = "%20";
    var re = new RegExp(find, 'g');
    const cookie = precookie[1].replace(re, ' ');
    const span = $('#welcome');
    span.text(`${cookie}`);

     // Toggle between clicked - unclicked.
   let $clickedSortName = false;
   let $clickedSortDate = false;

   // Containers
   var $showTable = $("#container");
   var $usersEntries = $("#accordion");
   $usersEntries.addClass('hide');

    /* 
        - Prints All entries
        @author Mari
    */

   function printAllEntries(index, diaryText, date, subject, $entryList, writer ) {
                $entryList.append($("<div>").addClass("panel panel-default").append($("<div>")
                .addClass("panel-heading").attr("id", "allentryheading" +index).attr("role", "tab").append($("<h4>")
                .addClass("panel-title").append($("<div>")
                // Table is collapsing
                .addClass("collapsed").attr("role", "button")
                .attr("data-toggle", "collapse").attr("data-parent", "#allEntries").attr("href", "#allcollapse" +index)
                .attr("aria-expanded", "false").attr("aria-controls", "collapse"+index)
                .text(date + " " +writer + ":    " + subject)))));

                $entryList.append($("<div>").addClass("panel-collapse collapse")
                .attr("id", "allcollapse" +index).attr("role", "tabpanel")
                .attr("aria-labelledby", "heading" + index).append($("<div>").addClass("panel-body").attr("id", "allpaneltext"+index)));
                
                var $panelcontent = $("#allpaneltext" +index);

                $("<div>").attr("id", "allcontent"+index).appendTo($panelcontent);
                var $entrycontents = $("#allcontent"+index);
                $("<div>").addClass("textarea").attr("id", "area"+index).text(diaryText).appendTo($entrycontents);
                $("<div>").attr("id", "btns-container"+index).appendTo($entrycontents);

    };

    /*
        - Create list Sorted by name.
        @author Ville
    */

    function createNameSorted() {
        $.getJSON('/api/diaryEntries', function (jsondata) {
            //$usersEntries.empty();
            // Sort toggle between clicked: true and false
            $clickedSortName = !$clickedSortName;
            var journalItems = jsondata.sort(function (first, second) {
                if (first.name > second.name) {
                    return ($clickedSortName ? 1 : -1);
                } if (second.name > first.name) {
                    return ($clickedSortName ? -1 : 1);
                }
            })
            // WRITE
            var $entryList = $("#allEntries");
            $entryList.empty();
            for (var index in journalItems) {
                var writer = journalItems[index].name;
                var id = journalItems[index].id;
                var diaryEntries = journalItems[index].diaryItemList;
                for (var textindex in diaryEntries) {
                    
                    var diaryText = diaryEntries[textindex].diaryText;
                    var date = diaryEntries[textindex].date;
                    var subject = diaryEntries[textindex].subject;
                    
                    var i = ""+index+textindex;
                    printAllEntries(i, diaryText, date, subject, $entryList, writer);

                }
            }
        })
    };
    
    /*
        - Create list Sorted by date.
        @author Ville
    */

    $("#sortByDate").click(function() {
        $.getJSON('/api/diaryEntries', function (jsondata) {
        // Toggle between clicked - unclicked
            $clickedSortDate = !$clickedSortDate;
            var $entryList = $("#allEntries");
        // Empty previous list to create it again
            $entryList.empty();
           /* Structure of JSON:
[{"name":"Alice","diaryItemList":[{"date":"2019-01-01","subject":"GIT Day","diaryText":"Today I learned GIT","textID":253},{"date":"2019-01-16","subject":"Another Day in Paradise","diaryText":"Everything is going GREAT!!!! ","textID":793},{"date":"2019-02-03","subject":"Something new ","diaryText":"Always learning new things...","textID":679}]},{"name":"John","diaryItemList":[{"date":"2019-01-02","subject":"Wednesday","diaryText":"What a Day!! oh Boy!!","textID":844},{"date":"2019-01-03","subject":"Thursday","diaryText":"I'm learning.. sooo much. I can feel it!!","textID":979}]}
           */
            var journalItems = jsondata;
            let allEntriesWithAuthors = [];
            for (var index in journalItems) {
                var writer = journalItems[index].name;
                var id = journalItems[index].id;
                var diaryEntries = journalItems[index].diaryItemList;
                // diaryEntries contains all messages of one same writer (without writers)
                for(let i=0; i<diaryEntries.length; i++) {
                    diaryEntries[i].writer = writer;
                    console.log(diaryEntries[i])
                    allEntriesWithAuthors.push(diaryEntries[i]);
                    // allEntriesWithAuthors contains all messages with writers
                }
            }
                console.log(allEntriesWithAuthors);
                // Sort toggle between clicks
                allEntriesWithAuthors = allEntriesWithAuthors.sort(function (first, second) {
                    if (first.date > second.date) {
                        return ($clickedSortDate ? -1 : 1);
                    } if (second.date > first.date) {
                        return ($clickedSortDate ? 1 : -1);
                    }
                });
                console.log(allEntriesWithAuthors);
            // WRITE
                for (let i=0; i<allEntriesWithAuthors.length; i++) {
                    var diaryText = allEntriesWithAuthors[i].diaryText;
                    var date = allEntriesWithAuthors[i].date;
                    var subject = allEntriesWithAuthors[i].subject;
                    var writer = allEntriesWithAuthors[i].writer;
                    var $entryList = $("#allEntries");
                    printAllEntries(index, diaryText, date, subject, $entryList, writer);
                }
            });
        });

   /*
        - My Entries List
        -prints user entries
        @author Mari

    */

    function myEntriesList() {
        $.getJSON('/api/diaryEntries/' + cookie, function (jsondata) {
            var $MyEntryList = $("#accordion");
            $MyEntryList.toggleClass('hide', false);
            var $entryList = $("#allEntries");
            $entryList.empty();
            $MyEntryList.empty();
            $showTable.addClass('hide');
            var journalItems = jsondata;
            for (var index in journalItems) {
                var writer = cookie;
                var textId = journalItems[index].textID;
                var diaryText = journalItems[index].diaryText;
                var date = journalItems[index].date;
                var subject = journalItems[index].subject;
                
                //entry message preview
                $MyEntryList.append($("<div>").addClass("panel panel-default").append($("<div>")
                .addClass("panel-heading").attr("id", "heading" +index).attr("role", "tab").append($("<h4>")
                .addClass("panel-title").append($("<div>")
                .addClass("collapsed").attr("role", "button")
                .attr("data-toggle", "collapse").attr("data-parent", "#accordion").attr("href", "#collapse" +index)
                .attr("aria-expanded", "false").attr("aria-controls", "collapse"+index)
                .text(date + "      " + subject)))));

                $MyEntryList.append($("<div>").addClass("panel-collapse collapse")
                .attr("id", "collapse" +index).attr("role", "tabpanel")
                .attr("aria-labelledby", "heading" + index).append($("<div>").addClass("panel-body").attr("id", "paneltext"+index)));
                
                var $panelcontent = $("#paneltext" +index);

                $("<div>").attr("id", "subject"+index).text(subject).appendTo($panelcontent);

                $("<div>").attr("id", "date"+index).text(date).appendTo($panelcontent);
                $("<div>").attr("id", "content"+index).appendTo($panelcontent);
                var $entrycontents = $("#content"+index);
                $("<textarea>").attr("cols", "50").attr("rows", "7").attr("id", "area"+index).prop("readonly", true).text(diaryText).appendTo($entrycontents);
                $("<div>").attr("id", "btns-container"+index).appendTo($entrycontents);
                var $bcontainer = $("#btns-container"+index);
                $("<button>").addClass("btn-del").attr("id", "del"+index).attr("value", textId).text("delete Entry").appendTo($bcontainer);
                $("<button>").addClass("btn-edit").attr("id", "edit"+index).attr("value", textId).text("Edit Entry").appendTo($bcontainer);
                $("<button>").addClass("btn-save").attr("id", "save"+index).attr("style", "display: none").attr("value", textId).text("Save Entry").appendTo($bcontainer);
                
                $("#save"+index).css("display", "none");
            }
        })
    };


    /*
        - Add to list
        @author Ville, Mari
    */

    function addToList() {
         // If input fields are empty --> return function and do nothing!
        var $date = $("#date").val();
        var $entry = $("#learned").val();
        var $subject = $("#subject").val();
        if($date === "" || $entry === "" || $subject === "") {
            return;
        };
      
        var writer = cookie;
        var diaryEntry = { "name": writer, "diaryEntry": $entry, "date": $date, "subject": $subject };
       
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://localhost:3000/api/diaryEntries",
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Cache-Control": "no-cache"
            },
            "processData": false,
            "data": JSON.stringify(diaryEntry)
        };

        // Clear input fields:

        $("#date").val("");
        $("#learned").val("");
        $("#subject").val("");
         
        $.ajax(settings).done(function (response) { 
            console.log("postin vastaus", response);
        });
    };

    // CLICK HANDLERS:

    // Add entry
    $("#btn-add").click(function () {
        addToList();
    });

    // Show my entries
    $("#btn_my").click(function () {
        myEntriesList();
    });

    // Sort by name
    $("#sortByName").click(function() {
        createNameSorted();
    });

    // Show all entries
    $("#btn").click(function () {
        $showTable.toggleClass('hide');
        $usersEntries.toggleClass('hide', true);
        createNameSorted();
    });

    // Delete button: Deleting a message
    $(".panel-group").on('click','.btn-del', function(){

        var username = cookie;
        console.log("username", cookie);
        var textId = $(this).val();
        console.log("klikatun buttonin arvo ", textId);
        
        var params ="http://localhost:3000/api/diaryEntries/"+ username + "/" + textId;
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": params ,
            "method": "DELETE",
            "headers": {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Cache-Control": "no-cache"
            },
            "processData": false,
        }

        
        $.ajax(settings).done(function (response) { 
            console.log("postin vastaus", response);

        });
 
    });

    // Edit button: Editing a message
    $(".panel-group").on('click','.btn-edit', function(){

        var idd = this.id; // get pressed buttons id which is edit(+index number, edit1, edit2 etc..), we need id number
        var idnumber = idd.slice(4); //remove 4 chars from the beginning of the string, rest is the index
        var $saveButton = $("#save" +idnumber); //save buttons id

        $saveButton.css("display","inline"); //makes save button visible
        $("#area"+idnumber).prop("readonly", false);  // make textarea editable
        
        $(this).css("display", "none");   //hide edit button, we don't need it anymore
 
    });

    // Save button: Saving a message
    $(".panel-group").on('click','.btn-save', function(){

        //Vaatii tuloksen käsittelyn tauluun
        var username = cookie;
        console.log("username", cookie);
        var idd = this.id; //idd = savexxx, xxx is some number value depending on index
        var idnumber = idd.slice(4);// idnumber is xxx
        console.log("id", idnumber); 
        var $entry = $("#area"+idnumber).val();
        console.log("muokattu teksti", $entry);
        var textId = $(this).val();
        var $date = $("#date"+idnumber).text();
        var $subject = $("#subject"+idnumber).text();
        console.log("Entryn päivämäärä ", $date);
        var diaryEntry = { "name": username, "diaryEntry": $entry, "date": $date, "subject": $subject };
        console.log("klikatun buttonin arvo ", textId);
        
       var params ="http://localhost:3000/api/diaryEntries/"+ username + "/" + textId;
       
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": params,
            "method": "PUT",
            "headers": {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Cache-Control": "no-cache"
            },
            "processData": false,
            "data": JSON.stringify(diaryEntry)
        }

        $.ajax(settings).done(function (response) { //$.ajax(settings) lähettää post:ina
            console.log("postin vastaus", response);
        });
 
    });

  
});
