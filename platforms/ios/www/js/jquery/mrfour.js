var view = {
    init: function () {
        //initialize view components
        this.sideMenu.init();

        $("#pgs").on("click", ".aside-list.accordion", function () {
            if (!$(this).hasClass("active")) {
                var t = $(this);
                var a = $(this).parent().children(".aside-list.active");
                a.css("height", a.children("h4").outerHeight()).removeClass("active");
                t.css("height", t.children("h4").outerHeight() + t.children("ul").outerHeight()).addClass("active");
            }
        })

        $("#modal").on("click", ".btn-closeModal", function () {
            view.modal.close();
        });

        if (typeof (window.device) != "undefined")
            if (parseFloat(window.device.version) >= 7) {
                $("#appPort").addClass("ios7");
            }
    },
    sideMenu: {
        init: function () {
            $("#side-menu").load("html/sideMenu.html", function () {
                view.page.load($(".side-list-ctnr li.active").attr("link"));

                $("#side-menu .side-list-ctnr li").click(function () {
                    if ($(this).hasClass("active")) {

                    } else {
                        //$("#side-menu .side-list-ctnr li.active").removeClass("active");
                        //$(this).addClass("active");
                        view.page.load($(this).attr("link"));
                    }
                });
            });
        },
        open: function () {

        },
        close: function () {

        }
    },
    page: {
        load: function (link, callback) {
            $("#side-menu .side-list-ctnr li.active").removeClass("active");
            $("#side-menu .side-list-ctnr li[link='" + link + "']").addClass("active");

            $("#pgs > .pg-ctnr.pg-current").load("html/" + link + ".html", function () {
                view.page.init();
                if (typeof (callback) != "undefined") {
                    try { callback() }
                    catch (err) { console.log(err) }
                }
            });
            $("#pgs > .pg-ctnr:not(.pg-current)").remove();
        },
        init: function () {
            $(".aside-list.accordion").each(function () {
                var t = $(this),
                    th = t.children("h4").outerHeight(),
                    tu = t.children("ul").outerHeight();

                if (t.hasClass("active")) {
                    t.css("height", parseFloat(th + tu) + "px");
                } else {
                    t.css("height", parseFloat(th) + "px");
                }
            });
        },
        toNext: function (link, callback) {
            var curr = $("#pgs > .pg-ctnr.pg-current"),
                next = this.newPage();

            next.load("html/" + link + ".html", function () {
                $.each($("#pgs > .pg-ctnr"), function () {
                    $(this).attr("scaleLevel", parseInt($(this).attr("scaleLevel")) + 1)
                });
                next.addClass("active pg-current animation moveInRight").one("webkitAnimationEnd oAnimationEnd", function () {
                    $(this).removeClass("vCtrl active animation moveInRight");
                });

                curr.removeClass("pg-current");

                if (typeof (callback) == "function") {
                    try { callback(); }
                    catch (err) { }
                }
            });

        },
        toPrev: function () {
            var curr = $("#pgs > .pg-ctnr.pg-current"),
                prev = $($("#pgs > .pg-ctnr")[$("#pgs > .pg-ctnr.pg-current").index() - 1]);

            $.each($("#pgs > .pg-ctnr:not(.pg-current)"), function () {
                $(this).attr("scaleLevel", parseInt($(this).attr("scaleLevel")) - 1)
            });

            prev.addClass("pg-current");
            curr.addClass("animation moveOutRight").one("webkitAnimationEnd oAnimationEnd", function () {
                $(this).remove();
            });
        },
        newPage: function () {
            var pg = $('<div class="vCtrl pg-ctnr" scaleLevel="-1">');
            $("#pgs").append(pg);
            return pg;
        }
    },
    modal: {
        open: function (modal, callback) {
            var m = $("#modal");

            $("#mask").addClass("active");
            m.load("html/modal/" + modal + ".html", function () {
                if (typeof (callback) == "function") {
                    try {
                        callback()
                    } catch (err) { console.log(err); }
                }
                m.addClass("animation active slideUp").one("webkitAnimationEnd oAnimationEnd", function () {
                    $(this).removeClass("animation slideUp");                    
                });
            });

        },
        close: function (callback) {
            $("#mask").removeClass("active");
            $("#modal").addClass("animation slideDown").one("webkitAnimationEnd oAnimationEnd", function () {
                $(this).removeClass("active animation slideDown");
                $("#modal").empty();
                if (typeof (callback) == "function") {
                    try {
                        callback()
                    } catch (err) { console.log(err); }
                }
            });
        },
    },
    notify: {
        alert: function (title, msg, callback) {
            view.modal.open("md-alert", function () {
                $("#md-title").html(title);
                $("#md-msg").html(msg);
                $("#btn-md-confirm").click(function () {
                    view.modal.close(callback);                    
                });
            });
        }
    },
    vCtrl: {
        enable: function (target) {
            target.addClass("active");
        },
        disable: function (target) {
            target.removeClass("active");
        }
    }
}

var util = {
    date: {
        toDateString: function (str) {
            return Date.parseExact(str, "yyyyMMdd").toString("yyyy/MM/dd");
        }
    }
}