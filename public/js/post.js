$(document).ready(function(){

    postID = $(".post-holder").attr("ID");

    $.get(`/API/postComments/${postID}`, function(data, textStatus, xhr){

        if(xhr.status == 200){
            $(".post-comments").html(data);
        }
        else if(xhr.status == 206){
            $(".post-comments").html("This post has no comments.");
        }
        else{
            console.log(xhr);
        }
    });


    // hover for react icons
    // holds the value of a react while the + is being shown
    var counterVal;
    $("body").on("mouseenter", ".reaction > .bi", function(){

        counter = $(this).siblings('.react-counter');
        counterVal = counter.text();
        
        if(!$(this).parent(".reaction").hasClass("added")){
            counter.text("+");
        }
        else{
            counter.text("-");
        }

    }).on("mouseleave", ".reaction > .bi", function(){

        counter = $(this).siblings('.react-counter');
        counter.text(counterVal);

    });

    // add a react when icon clicked
    $("body").on("click", ".reaction >.bi", function(){

        // add spinner
        $("#reacts-row").html('<div class="spinner-border text-danger" role="status"><span class="sr-only">Updating Reactions...</span></div>')

        // get reaction type & postID
        react = $(this).attr("id");
        console.log(react);
        postID = $(".post-holder").attr("id");

        // adding or removing 
        if(!$(this).parent(".reaction").hasClass("added")){
            url = `/API/addReact/${postID}/${react}`;
            newVal = parseInt(counterVal)+1;
        }
        else{
            url = `/API/removeReact/${postID}`;
            newVal = parseInt(counterVal)-1;
        }

        // hold icon before ajax trigger
        icon = $(this);

        // send request to server
        $.get(url, function(data, textStatus, xhr){

            //replace spinner with new reacts


            // error check
            if(xhr.status == 200){

                $(".post-reactions").html(data);
                reactsExpanded = false;

            }else{
                console.log("Something went wrong");
                // default to old value
                $(this).siblings('.react-counter').text(counterVal);
            }
            

        });
    });


    // bring up all reacts
    reactsExpanded = false;
    oldReacts = $("#reacts-row").html();
    $("body").on("click", ".react-btn", function(){


        if(reactsExpanded){
            $("#reacts-row").html(oldReacts);
            $(this).text("More Reactions");
            reactsExpanded = false;
        }
        else{
            reactsExpanded = true;
            oldReacts = $("#reacts-row").html();
            $(this).text("Cancel");
            $("#reacts-row").html(`
            <div class="col reaction">
                <i class="bi bi-emoji-smile-fill" id="happy"></i>
                <div class="react-counter">
                    +
                </div>
            </div>
            <div class="col reaction">
                <i class="bi bi-emoji-laughing-fill" id="laugh"></i>
                <div class="react-counter">
                    +
                </div>
            </div>
            <div class="col reaction">
                <i class="bi bi-emoji-heart-eyes-fill" id="love"></i>
                <div class="react-counter">
                    +
                </div>
            </div>
            <div class="col reaction">
                <i class="bi bi-emoji-frown-fill" id="sad"></i>
                <div class="react-counter">
                    +
                </div>
            </div>
            <div class="col reaction">
                <i class="bi bi-emoji-angry-fill" id="angry"></i>
                <div class="react-counter">
                    +
                </div>
            </div>
            `);
        }

    });

});