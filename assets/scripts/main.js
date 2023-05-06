$("#read-more").on("click", function() {
    let newHeight = $(".information .description > p").height();

    $("#collapse").fadeIn(150);
    $(this).fadeOut(150);

    $(".information .description").css("height", newHeight + "px")
})

$("#collapse").on("click", function() {
    $("#read-more").fadeIn(150);
    $(this).fadeOut(150);

    $(".information .description").css("height", "");
})

$(".hideoverlay .bind").html(Config.CustomBindText == "" ? String.fromCharCode(Config.HideoverlayKeybind).toUpperCase() : Config.CustomBindText)

$(document).on('mousemove', function(e) {
    $('#cursor').css({top: e.pageY + 'px', left: e.pageX + 'px'});
});

var overlay = true;
$(document).keydown(function(e) {
    if(e.which == Config.HideoverlayKeybind) {
        overlay = !overlay;
        if(!overlay) {
            $(".overlay").css("opacity", ".0")
        } else {
            $(".overlay").css("opacity", "")
        }
    }
})

var song;
function setup() {
    let currentDate = new Date();

    let year = currentDate.getFullYear();
    let month = (currentDate.getMonth() + 1) < 10 ? "0" + (currentDate.getMonth() + 1) : (currentDate.getMonth() + 1);
    let day = currentDate.getDate() < 10 ? "0" + currentDate.getDate() : currentDate.getDate();
    $("#date").text(year + "-" + month + "-" + day)

    // Online player count
    fetch("http://" + Config.ServerIP + "/info.json", { method: "GET", mode: "cors" }).then(res => {
        if (!res.ok) {
            throw new Error("Network response was not ok");
        }
        return res.json();
    }).then(info => {
        if (typeof info.vars !== "undefined" && typeof info.vars.sv_maxClients !== "undefined") {
            fetch("http://" + Config.ServerIP + "/players.json", { method: "GET", mode: "cors" }).then(res => {
                if (!res.ok) {
                    throw new Error("Network response was not ok");
                }
                return res.json();
            }).then(players => {
                if (Array.isArray(players)) {
                    $("#clients").text(players.length + "/" + info.vars.sv_maxClients);
                } else {
                    console.error("Invalid players data format");
                }
            }).catch(error => {
                console.error("There was a problem fetching players data: ", error);
            });
        } else {
            console.error("Invalid info data format");
        }
    }).catch(error => {
        console.error("There was a problem fetching server info: ", error);
    });
}

    // Music
    song = new Audio("assets/media/" + Config.Song);
    song.play()

    // Categories
    var currentCat = "";
    Config.Categories.forEach((cat, index) => {
        $(".categories .buttons").append(`<p data-category="${index}" class="${cat.default ? "active" : ""}">${cat.label}</p>`)
        if(cat.default) currentCat = index;

        $(".categories .carousel > *").css("transform", `translateX(-${currentCat * 100}%)`)
    });

    $(".categories .buttons p").on("click", function() {
        $(`.categories .buttons p[data-category="${currentCat}"]`).removeClass("active");
        currentCat = $(this).attr("data-category");
        $(`.categories .buttons p[data-category="${currentCat}"]`).addClass("active");

        $(".categories .carousel > *").css("transform", `translateX(-${currentCat * 100}%)`)
    });

    // Socials
    Config.Socials.forEach((social, index) => {
        $(".categories .socialmedia").append(`<div class="box" data-id="${social.name}" data-link="${social.link}"><img class="icon" src="${social.icon}"><div class="info"><p class="title">${social.label}</p><p class="description">${social.description}</p></div></div>`)
    });

    var copyTimeouts = {};
    $(".categories .socialmedia .box").on("click", function() {
        let id = $(this).data("id")
        let link = $(this).data("link")
        if(copyTimeouts[id]) clearTimeout(copyTimeouts[id]);

        window.open(link, '_blank', 'toolbar=0,location=0,menubar=0');
        //copyToClipboard(link)

        $(this).addClass("copied");
        copyTimeouts[id] = setTimeout(() => {
            $(this).removeClass("copied")
            copyTimeouts[id] = undefined;
        }, 1000);
    })

    // Carousel
    Config.Staff.forEach((member, index) => {
        $(".staff .innercards").append(`<div class="card" data-id="${index}" style="--color: ${member.color}">
            <p class="name">${member.name}</p>
            <p class="description">${member.description}</p>
            <img class="avatar" src="${member.image}">
        </div>`);
        if(index < Config.Staff.length - 1) {
            $(".staff .pages").append(`<div data-id="${index}"></div>`);
        }
        $(`.staff .pages > div[data-id="0"]`).addClass("active")

        if(Config.Staff.length < 3) {
            $(".staff .pages").hide();
            $(".staff .previous").hide();
            $(".staff .next").hide();
        }
    })

    var currentPage = 0;
    $(".staff .next").on("click", function() {
        if(currentPage < Config.Staff.length - 2) {
            $(`.staff .pages > div[data-id="${currentPage}"]`).removeClass("active")
            currentPage++
            $(`.staff .pages > div[data-id="${currentPage}"]`).addClass("active")
            $(".staff .innercards").css("transform", `translate3d(calc(-${currentPage * 50}% - ${(currentPage+1) * .5}vw), 0, 0)`)
        }
    });

    $(".staff .previous").on("click", function() {
        if(currentPage > 0) {
            $(`.staff .pages > div[data-id="${currentPage}"]`).removeClass("active")
            currentPage--
            $(`.staff .pages > div[data-id="${currentPage}"]`).addClass("active")
            $(".staff .innercards").css("transform", `translate3d(calc(-${currentPage * 50}% - ${(currentPage+1) * .5}vw), 0, 0)`)
        }
    });

function loadProgress(progress) {
    $(".loader .filled-logo").css("height", progress + "%");
    
    const progressText = document.createElement('span');
    progressText.textContent = progress + "%";
    $(".loader .progress").empty().append(progressText);
}

window.addEventListener('message', function(e) {
    if(e.data.eventName === 'loadProgress') {
        loadProgress(parseInt(e.data.loadFraction * 100));
    }
});

var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
var muted = false;
function onYouTubeIframeAPIReady() {
    player = new YT.Player("youtube-player", {
        events: {
            'onReady': onPlayerReady
        }
    });
}

let interval;
function onPlayerReady() {
    player.mute();

    $('#sounds').on("change", function(){
        muted = !muted;
        clearInterval(interval)
        if(muted) {
            let volume = 0.3;
            interval = setInterval(() => {
                if(volume > 0.00) {
                    volume -= 0.02
                    song.volume = volume;
                } else {
                    clearInterval(interval)
                    song.volume = .0;
                }
            }, 1);
        } else {
            let volume = 0.0;
            interval = setInterval(() => {
                if(volume < 1.00) {
                    volume += 0.02
                    song.volume = volume;
                } else {
                    clearInterval(interval)
                    song.volume = 0.3;
                }
            }, 1);
        }
    });
}

function copyToClipboard(text) {
    const body = document.querySelector('body');
    const area = document.createElement('textarea');
    body.appendChild(area);
  
    area.value = text;
    area.select();
    document.execCommand('copy');
  
    body.removeChild(area);
}

setup();
