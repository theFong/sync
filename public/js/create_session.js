function upload_file(){
    var x = document.getElementById("file");
    var txt = "";
    if ('files' in x) {
        if (x.files.length == 0) {
            txt = "Select a file.";
        } else {
            for (var i = 0; i < x.files.length; i++) {
                txt += "<br><strong>" + (i+1) + ". file</strong><br>";
                var file = x.files[i];
                if ('name' in file) {
                    txt += "name: " + file.name + "<br>";
                }
                if ('size' in file) {
                    txt += "size: " + file.size + " bytes <br>";
                }
                var form = ''
                form += '<label for="title">Audio Title:</label>'
                form += '<input class="form-control" id="title" name="title" type="text">'
                form += '<label for="artist">Audio Artist:</label>'
                form += '<input class="form-control" id="artist" name="artist" type="text">'
                document.getElementById("file").outerHTML = form;
            }
        }
    } 
    else {
        if (x.value == "") {
            txt += "Select a file.";
        } else {
            txt += "The files property is not supported by your browser!";
            txt  += "<br>The path of the selected file: " + x.value; // If the browser does not support the files property, it will return the path of the selected file instead. 
        }
    }
    document.getElementById("file_p").innerHTML = txt;
}