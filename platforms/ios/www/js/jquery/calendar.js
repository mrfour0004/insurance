var cal = {
    today: Date.today(),
    currentDate: Date.today(),
    weekStr: {
        medium: ["週日", "週一", "週二", "週三", "週四", "週五", "週六"],
        mini: ["日", "一", "二", "三", "四", "五", "六"]
    },
    getCalendar: function (date) {
        date = (typeof (date) == "undefined") ? new Date.today() : date;
        var year = date.getFullYear(),
			month = date.getMonth(),
			firstDate = new Date(year, month, 1).getDay(),
			daysInMonth = Date.getDaysInMonth(year, month);

        var calendar = [];
        var flag = false;
        for (var i = 0, d = 1; !flag; i++) {
            calendar[i] = new Array();
            for (var j = 0; j <= 6; j++) {
                if (j < firstDate && i == 0) {
                    calendar[i][j] = new Date(year, month, 1).add(j - firstDate).days().getDate();
                } else {
                    calendar[i][j] = d;
                    if (d == daysInMonth) { flag = true; d = 0; }
                    d++;
                }
            }
        }
        return {
            targeDate: date,
            calendar: calendar
        };
    },
    getWeek: function (day) {
        var year = day.getFullYear(),
			month = day.getMonth(),
			date = day.getDate(),
			weekDay = day.getDay();

        var weekArray = [];
        for (var i = 0; i < 7; i++) {
            weekArray[i] = new Date(year, month, date).add(i - weekDay).days();
        }

        return weekArray;
    },
    toDateStr: function (date) {
        return date.toString("yyyyMMdd");
    },
    toPrev: function () { },
    toToday: function () {
    },
    miniMonth: {
        toDOM: function (arg) {
            var t = arg.targeDate,
                calendar = arg.calendar;

            var year = t.getFullYear(),
			    month = t.getMonth(),
			    firstDate = new Date(year, month, 1).getDay(),
			    daysInMonth = Date.getDaysInMonth(year, month);

            var m = $.map(calendar, function (week, i) {
                var w = $("<div>").attr("class", "table-row");
                $.each(week, function (k) {
                    var d = $("<div>").attr("class", "cal-d")
                                      .append($("<span>").html(this));
                    if ((i == 0 && this > 7) || (i == calendar.length - 1 && this < 7)) {
                        d.addClass("cal-d-gray");
                        if (this > 7) {
                            d.attr("date", cal.toDateStr(new Date(year, month - 1, this)));
                        } else if (this < 7) {
                            d.attr("date", cal.toDateStr(new Date(year, month + 1, this)));
                        }
                    } else {
                        d.attr("date", cal.toDateStr(new Date(year, month, this)))
                    }

                    if (d.attr("date") == new Date.today().toString("yyyyMMdd")) {
                        d.addClass("cal-d-today");
                    }
                    if (d.attr("date") == t.toString("yyyyMMdd")) {

                        d.addClass("cal-d-current");
                    }
                    w.append(d);
                })

                return w;
            })

            return m;
        },
        refresh: function (date, dom, callback) {
            date = (typeof (date) == "undefined") ? new Date.today() : (typeof (date) == "string") ? new Date.parseExact(date, "yyyyMMdd") : date;
            //console.log("refreshing calendar: " + date);
            dom = (typeof (dom) == "undefined") ? $(".cal-mini") : dom;
            var days = cal.getCalendar(date);
            //console.log(days);

            var obj_title = dom.children(".cal-title"),
                obj_days = dom.children(".cal-days").empty();

            obj_title.find("h4").html(date.getFullYear() + "年 " + (date.getMonth() + 1) + "月");
            obj_days.empty().append(cal.miniMonth.toDOM(days));

            if (typeof (callback) == "function") {
                try { callback(); }
                catch (e) { console.log(JSON.stringify(e)); }
            }
        }
    },
    month: {
        toDOM: function (arg) {
            var t = arg.targeDate,
                calendar = arg.calendar;

            var year = t.getFullYear(),
			    month = t.getMonth(),
			    firstDate = new Date(year, month, 1).getDay(),
			    daysInMonth = Date.getDaysInMonth(year, month);

            var m = $.map(calendar, function (week, i) {
                var w = $("<tr>");
                $.each(week, function (k) {
                    var d = $("<td>").attr("class", "cal-day")
                                     .append($("<span class='cal-date'>").html(this))
                                     .append($('<ul class="touchScroll fp">'));
                    if ((i == 0 && this > 7) || (i == calendar.length - 1 && this < 7)) {
                        d.addClass("cal-d-gray");
                        if (this > 7) {
                            d.attr("date", cal.toDateStr(new Date(year, month - 1, this)));
                        } else if (this < 7) {
                            d.attr("date", cal.toDateStr(new Date(year, month + 1, this)));
                        }
                    } else {
                        d.attr("date", cal.toDateStr(new Date(year, month, this)))
                    }

                    if (d.attr("date") == new Date.today().toString("yyyyMMdd")) {
                        d.addClass("cal-d-today");
                        w.addClass("cal-current-week");
                    }
                    w.append(d);
                })

                return w;
            })

            return m;
        },
        refresh: function (date, dom, callback) {
            cal.currentDate = date = (typeof (date) == "undefined") ? new Date.today() : (typeof (date) == "string") ? new Date.parseExact(date, "yyyyMMdd") : date;
            //console.log("refreshing calendar: " + date);

            dom = (typeof (date) == "undefined") ? $(".cal") : dom;
            var days = cal.getCalendar(date);
            //console.log(days);

            var obj_title = $("#cal-title"),
                obj_days = $(".cal-month.active .cal-days").empty();

            obj_title.html(date.getFullYear() + "年 " + (date.getMonth() + 1) + "月");
            obj_days.empty().append(cal.month.toDOM(days));

            dbobj.qrytb("event", function (r) {
                cal.events.reset();

                $.each(r, function (i) {
                    cal.events.insertEvent(this, i)
                });

                cal.month.printEvents();
            });

            if (typeof (callback) == "function") {
                try { callback(); }
                catch (e) { console.log(JSON.stringify(e)); }
            }
        },
        printEvents: function () {
            var array = cal.events.eveArr;
            var dialogCtnr = $(".event-dialogs");

            for (var i = 0; i < array.length; i++) {
                var eventGroupNum = array[i].events.length;
                for (var j = 0; j < array[i].events.length; j++) {
                    var duplicateNum = array[i].events[j].events.length;
                    for (var k = 0; k < array[i].events[j].events.length; k++) {
                        var e = array[i].events[j].events[k];
                        var td = $(".cal-day[date='" + e.detail.ACTIVITYDATE + "'] > ul");

                        dialogCtnr.append(cal.events.dialog.toDOM(e));
                        if (e.allDay == true) {
                            td.prepend(cal.month.toEventDOM(e));
                        } else {
                            td.append(cal.month.toEventDOM(e));
                        }
                    }
                }
            }
        },
        toEventDOM: function (e) {
            var eventDOM = $('<li class="event ellipsis" index="' + e.index + '" )>').html(e.detail.SUBSTANCE);

            if (e.allDay == true) eventDOM.addClass("allDay");
            return eventDOM;
        },
        toNext: function () {
            this.refresh(cal.currentDate.add(1).months());
        },
        toPrev: function () {
            this.refresh(cal.currentDate.add(-1).months());
        }
    },
    week: {
        refresh: function (date, dom, callback) {
            cal.currentDate = date = (typeof (date) == "undefined") ? new Date.today() : (typeof (date) == "string") ? new Date.parseExact(date, "yyyyMMdd") : date;

            //dom = (typeof (date) == "undefined") ? $(".cal") : dom;
            //to get dates of week that we want to display
            var days = cal.getWeek(date);

            var obj_title = $("#cal-title"),
                obj_cal_hd = $(".cal-hd .cal-day > span");

            $.each(obj_cal_hd, function (i) {
                $(this).html(days[i].getDate() + " " + cal.weekStr.medium[i]);
            });

            obj_title.html(date.getFullYear() + "年 " + (date.getMonth() + 1) + "月");

            dbobj.qrytb("event", function (r) {
                cal.events.reset();

                $.each(r, function (i) {
                    cal.events.insertEvent(this, i)
                });

                cal.week.printEvents();
            });

            if (typeof (callback) == "function") {
                try { callback(); }
                catch (e) { console.log(JSON.stringify(e)); }
            }
        },
        printEvents: function () {
            var array = cal.events.eveArr;

            var eventsCtnr = $("#events").empty(),
                dialogCtnr = $(".event-dialogs").empty();

            console.log(array);

            for (var i = 0; i < array.length; i++) {
                var eventGroupNum = array[i].events.length;
                for (var j = 0; j < array[i].events.length; j++) {
                    var duplicateNum = array[i].events[j].events.length;
                    for (var k = 0; k < array[i].events[j].events.length; k++) {
                        var e = array[i].events[j].events[k];

                        if (array[i].events[j].events[k].allDay == true) {
                            //cal.week.insertAllDayEvent(cal, array[i].events[j].events[k]);
                        } else {

                            eventsCtnr.append(cal.week.toEventDOM(e, eventGroupNum, j, duplicateNum, k));
                            dialogCtnr.append(cal.events.dialog.toDOM(e));
                        }
                    }
                }
            }

            $(".cal > .cal-events-ctnr .cal-events").scrollTop(480);
        },
        toEventDOM: function (eve, eventGroupNum, eventGroupIndex, duplicateNum, duplicateIndex) {
            var eventStr = "";
            console.log("convert event to html: ", eve);

            var hourHeight = $(".cal-hour-sep").outerHeight();
            dayPadding = $(".cal-time").outerWidth();

            var dayWidthArray = new Array();
            for (var i = 0; i <= 6; i++) {
                dayWidthArray[i] = $($(".allDay-events .cal-verticle-line")[i]).outerWidth();
            }

            var height = hourHeight * eve.period,
				top = hourHeight * eve.startHour,
				width = (dayWidthArray[eve.day.getDay()] - (eventGroupNum - 1) * 5) / duplicateNum,
		        left = dayPadding + (eventGroupIndex * 5) + (duplicateIndex * width),
				lineClamp = parseInt((height - 27) / 18);
            /*
                27 = event.padding(3*2) + event.border(1*2) + title.height(14) + title.margin-bottom(5), 18 = line-height of statement.
                and it's only work on webkit kernel browser, ex: (mobile) safari, chrome
            */

            console.log("height: " + height);
            console.log("top: " + top);
            console.log("left: " + left);
            console.log("width: " + width);
            console.log("lineClamp: " + lineClamp);

            if (height <= hourHeight / 2) height = hourHeight / 2;

            for (var i = 0; i < eve.day.getDay() ; i++) {
                left += dayWidthArray[i];
            }

            var detailStr = '<h4 class="ellipsis">' + eve.detail.SUBSTANCE + '</h4>';

            if (height <= hourHeight / 2) {
                height = hourHeight / 2;
            }
            if (height >= hourHeight) {
                detailStr += '<p class="ellipsis_mt" style="-webkit-line-clamp:' + lineClamp + ';">' + eve.detail.PLACE + '</p>';
            }


            //var d_top = parseInt(-30 + height / 3).toString();

            //to decide to show detail-dialogs on the right or left side
            var dialogClassStr = "";
            if (eve.day.getDay() >= 5) {
                dialogClassStr += "left";
            } else {
                dialogClassStr += "right";
            }

            //var dialogDOM = cal.events.dialog.toDOM(eve);

            var eventDOM = $('<div class="event" index="' + eve.index + '" )>').css({
                "height": height - 1,
                "top": top + 'px',
                "left": left + 'px',
                "width": width + 'px',
                "z-index": parseInt(eve.startHour * 10)
            }).html(detailStr);

            //console.log(eventDOM.html());
            return eventDOM;
        },
        toNext: function () {
            this.refresh(cal.currentDate.add(1).week());
        },
        toPrev: function () {
            this.refresh(cal.currentDate.add(-1).week());
        }
    },
    day: {
        refresh: function (date, dom, callback) {
            cal.currentDate = date = (typeof (date) == "undefined") ? new Date.today() : (typeof (date) == "string") ? new Date.parseExact(date, "yyyyMMdd") : date;

            cal.miniMonth.refresh(date);

            var obj_title = $("#cal-title");

            obj_title.html(date.getFullYear() + "年 " + (date.getMonth() + 1) + "月 " + date.getDate() + "日");

            dbobj.qrytb("event", function (r) {
                cal.events.reset();

                $.each(r, function (i) {
                    if (this.ACTIVITYDATE == date.toString("yyyyMMdd"))
                        cal.events.insertEvent(this, i)
                });

                cal.day.printEvents();
            });

            if (typeof (callback) == "function") {
                try { callback(); }
                catch (e) { console.log(JSON.stringify(e)); }
            }
        },
        printEvents: function () {
            var array = cal.events.eveArr;

            var allDayCtnr = $("").empty(),
                eventsCtnr = $("#events").empty(),
                dialogCtnr = $(".event-dialogs").empty();

            console.log(array);

            for (var i = 0; i < array.length; i++) {
                var eventGroupNum = array[i].events.length;
                for (var j = 0; j < array[i].events.length; j++) {
                    var duplicateNum = array[i].events[j].events.length;
                    for (var k = 0; k < array[i].events[j].events.length; k++) {
                        var e = array[i].events[j].events[k];

                        dialogCtnr.append(cal.events.dialog.toDOM(e));
                        if (array[i].events[j].events[k].allDay == true) {
                            //cal.week.insertAllDayEvent(cal, array[i].events[j].events[k]);
                        } else {
                            eventsCtnr.append(cal.day.toEventDOM(e, eventGroupNum, j, duplicateNum, k));
                        }
                    }
                }
            }

            $("#cal-day-ctnr > .cal-events-ctnr .cal-events").scrollTop(parseInt($("#events .event")[0].style.top.replace("px", "")) - 120);
        },
        toEventDOM: function (eve, eventGroupNum, eventGroupIndex, duplicateNum, duplicateIndex) {
            var eventStr = "";
            console.log("convert event to html: ", eve);

            var hourHeight = $(".cal-hour-sep").outerHeight();
            dayPadding = $(".cal-time").outerWidth();

            var dayWidth = $(".allDay-events .cal-verticle-line").outerWidth();


            var height = hourHeight * eve.period,
                top = hourHeight * eve.startHour,
                width = (dayWidth - (eventGroupNum - 1) * 5) / duplicateNum,
                left = dayPadding + (eventGroupIndex * 5) + (duplicateIndex * width),
                lineClamp = parseInt((height - 27) / 18);
            /*
                27 = event.padding(3*2) + event.border(1*2) + title.height(14) + title.margin-bottom(5), 18 = line-height of statement.
                and it's only work on webkit kernel browser, ex: (mobile) safari, chrome
            */

            console.log("height: " + height);
            console.log("top: " + top);
            console.log("left: " + left);
            console.log("width: " + width);
            console.log("lineClamp: " + lineClamp);

            if (height <= hourHeight / 2) height = hourHeight / 2;

            var detailStr = '<h4 class="ellipsis">' + eve.detail.SUBSTANCE + '</h4>';

            if (height <= hourHeight / 2) {
                height = hourHeight / 2;
            }
            if (height >= hourHeight) {
                detailStr += '<p class="ellipsis_mt" style="-webkit-line-clamp:' + lineClamp + ';">' + eve.detail.PLACE + '</p>';
            }


            //var d_top = parseInt(-30 + height / 3).toString();

            //to decide to show detail-dialogs on the right or left side
            var dialogClassStr = "";
            if (eve.day.getDay() >= 5) {
                dialogClassStr += "left";
            } else {
                dialogClassStr += "right";
            }

            //var dialogDOM = cal.events.dialog.toDOM(eve);

            var eventDOM = $('<div class="event" index="' + eve.index + '" )>').css({
                "height": height - 1,
                "top": top + 'px',
                "left": left + 'px',
                "width": width + 'px',
                "z-index": parseInt(eve.startHour * 10)
            }).html(detailStr);

            //console.log(eventDOM.html());
            return eventDOM;
        },
        toNext: function () {
            this.refresh(cal.currentDate.add(1).days());
        },
        toPrev: function () {
            this.refresh(cal.currentDate.add(-1).days());
        }
    },
    events: {
        eveArr: new Array(),
        reset: function () { this.eveArr = new Array(); },
        parseEvent: function (eve, identity) {
            var startHour = cal.events.toHourUnit(eve.STARTTIME.toString()),
				endHour = cal.events.toHourUnit(eve.ENDTIME.toString()),
				allDay = false,
				period = endHour - startHour,
				day = Date.parseExact(eve.ACTIVITYDATE.toString(), "yyyyMMdd"),
				duplicateNum = 1;

            if (period > 23) allDay = true;

            return {
                index: identity,
                startHour: startHour,
                endHour: endHour,
                period: period,
                allDay: allDay,
                day: day,
                duplicateNum: duplicateNum,
                detail: eve
            };
        },
        insertEvent: function (eve, identity) {
            var array = this.eveArr;
            //console.log(array);
            var eventTmp = this.parseEvent(eve, identity);

            //console.log("start to insert event: ", eventTmp);

            var isGrouped = false;

            //console.log("======start to check======");
            for (var j = 0; j < array.length && isGrouped == false; j++) {
                var eventGroupTmp = array[j];
                //console.log(eventGroupTmp);
                if ((eventTmp.day.toString("yyyyMMdd") == eventGroupTmp.day.toString("yyyyMMdd"))) {
                    console.log("I think I found a group is at the same date as this event: ")
                    console.log(eventGroupTmp);

                    if ((eventTmp.startHour >= eventGroupTmp.startHour && eventTmp.startHour < eventGroupTmp.endHour) || (eventTmp.endHour > eventGroupTmp.startHour && eventTmp.endHour < eventGroupTmp.endHour) || (eventTmp.startHour - eventGroupTmp.startHour < 0.5 && eventTmp.startHour - eventGroupTmp.startHour >= 0) || (eventGroupTmp.startHour - eventTmp.startHour < 0.5 && eventGroupTmp.startHour - eventTmp.startHour >= 0)) {
                        console.log("I think this event should be grouped into this group, now let's see what we can got in this group....");

                        var isGrouped2 = false;
                        for (var k = 0; k < array[j].events.length && isGrouped2 == false; k++) {
                            var eventGroupTmp2 = array[j].events[k];
                            if (eventTmp.startHour - eventGroupTmp2.startHour < 0.5 && eventTmp.startHour - eventGroupTmp2.startHour >= 0) {
                                console.log("Opps...It's seems that this event find its home !!!")
                                eventGroupTmp2.events[eventGroupTmp2.events.length] = eventTmp;
                                isGrouped = isGrouped2 = true;
                            } else if (eventGroupTmp2.startHour - eventTmp.startHour < 0.5 && eventGroupTmp2.startHour - eventTmp.startHour >= 0) {
                                eventGroupTmp2.startHour = eventTmp.startHour;
                                eventGroupTmp2.events[eventGroupTmp2.events.length] = eventTmp;
                                isGrouped = isGrouped2 = true;
                                var removedEvents = new Array();
                                for (var l = 0; l < eventGroupTmp2.events.length; l++) {
                                    if (eventGroupTmp2.events[l].startHour - eventGroupTmp2.startHour >= 0.5) {
                                        removedEvents[removedEvents.length] = eventGroupTmp2.events[l];
                                        eventGroupTmp2.events.splice(l, 1); l--;
                                    }
                                }
                                for (var m = 0; m < removedEvents.length; m++) {
                                    this.insertEvents(removedEvents[m]);
                                }
                            }
                        }
                        if (isGrouped2 == false) {
                            array[j].events[array[j].events.length] = {
                                startHour: eventTmp.startHour,
                                endHour: eventTmp.endHour,
                                events: [eventTmp]
                            };
                            isGrouped = isGrouped2 = true;
                        }
                        array[j].startHour = Math.min(array[j].startHour, eventTmp.startHour);
                        array[j].endHour = Math.max(array[j].endHour, eventTmp.endHour);
                    }
                }
            }
            if (isGrouped == false) {
                //console.log(array);
                array[array.length] = {
                    day: eventTmp.day,
                    startHour: eventTmp.startHour,
                    endHour: (eventTmp.period < 0.5) ? eventTmp.startHour + 0.5 : eventTmp.endHour,
                    events: [{
                        startHour: eventTmp.startHour,
                        endHour: eventTmp.endHour,
                        events: [eventTmp]
                    }]
                };
                isGrouped = true;
            };
            console.log(array);
        },
        toHourUnit: function (timeStr) {
            var hour = timeStr.substr(0, timeStr.length - 2),
                halfHour = timeStr.substr(timeStr.length - 2, timeStr.length);
            return parseFloat(hour) + parseFloat(parseInt(halfHour) / 60);
        },
        toTimeStr: function (timeStr) {
            if (timeStr.length == 3) {
                return timeStr.substr(0, 1) + ":" + timeStr.substr(1, 3);
            }
            else {
                return timeStr.substr(0, 2) + ":" + timeStr.substr(2, 4);
            }
        },
        dialog: {
            open: function (idx) {
                var eve = $(".event[index='" + idx + "']"),
				    dialog = $(".event-dialog[index='" + idx + "']");

                var eventCtnr = $(".cal");

                var caOffset = eventCtnr.offset(),
					caHeight = eventCtnr.outerHeight(),
					eveOffset = eve.offset(),
					eveHeight = eve.outerHeight(),
                    eveWidth = eve.outerWidth(),
					dayWidth = eventCtnr.outerWidth(),
					d_height = dialog.outerHeight(),
					d_width = dialog.outerWidth();

                var left = parseFloat(eveOffset.left - caOffset.left - d_width);
                if (left <= 0) {
                    left = parseFloat(eveOffset.left - caOffset.left + eveWidth - 10);
                }

                dialog.css({
                    "top": parseFloat(eveOffset.top - caOffset.top - 30) + "px",
                    "left": left + "px"
                })

                if (dialog.offset().top + d_height >= caOffset.top + caHeight)
                    dialog.css("top", parseFloat(caHeight - d_height) + "px");

                var arrow = dialog.find(".arrow"),
					arrow_height = arrow.outerHeight(),
					arrow_defaultTop = 15,
					arrow_defaultOffset = dialog.offset().top + arrow_defaultTop,
					arrow_top;

                arrow_top = parseFloat(eveOffset.top - dialog.offset().top - (arrow_height - eveHeight) / 2);

                console.log("arrow_top: " + arrow_top);

                if (arrow_top <= 1) arrow_top = 1;
                else if (arrow_top >= d_height - arrow_height - 1) arrow_top = d_height - arrow_height - 1;

                arrow.css("top", arrow_top + "px");

                eve.addClass("active");
                dialog.addClass("active dialog_bounceIn").one('webkitAnimationEnd oAnimationEnd', function () {
                    $(this).removeClass("dialog_bounceIn");
                });
            },
            close: function () {
                var d = $(".event-dialog.active"),
                    e = $(".event.active");

                var idx = d.attr("index");

                e.removeClass("active");
                d.addClass("dialog_fadeOut").one('webkitAnimationEnd oAnimationEnd', function () {
                    $(this).removeClass("dialog_fadeOut active");
                });
            },
            toDOM: function (eve) {
                var dateTimeStr;

                if (eve.allDay == true) {
                    dateTimeStr = '<p class="date">' + eve.day.getFullYear() + "月" + (eve.day.getMonth() + 1) + "月" + eve.day.getDate() + "日" + '</p>'
                } else {
                    dateTimeStr = '<p class="startTime">' + cal.events.toTimeStr(eve.detail.STARTTIME) + '</p>' +
                                  '<p class="endTime">' + cal.events.toTimeStr(eve.detail.ENDTIME) + '</p>';
                }

                var dialogDOM = $('<div class="event-dialog vCtrl" index="' + eve.index + '">')
                                .append($('<h3 class="substance">').html(eve.detail.SUBSTANCE))
                                .append($('<p class="place">' + eve.detail.PLACE + '</p>'))
                                .append($('<hr>'))
                                .append($(dateTimeStr))
                                .append($('<hr>'))
                                .append($('<p class="statement">' + eve.detail.STATEMENT + '</p>'))
                                .append($('<span class="arrow"></span>'))

                return dialogDOM;
            }
        }
    }
}

if (typeof jQuery != 'undefined') {
    function calInit() {
        $(".touchScroll").scroll(function () {
            cal.events.dialog.close();
        })
    };
    jQuery.fn.extend({
        cal: function (opt) {
            var targetDOM = this;
            var option = new Object();

            /*
            if (typeof (opt) == "obect")
                var option = {
                    clickOnActiveDate: (typeof (opt.clickOnActiveDate) == "undefined") ? function () { } : opt.clickOnActiveDate,
                    clickOnInactiveDate: (typeof (opt.clickOnInactiveDate) == "undefined") ? function () { } : opt.clickOnInactiveDate
                };
            */
            cal.miniMonth.refresh(new Date.today(), targetDOM);

            targetDOM.on("click", ".cal-days .cal-d", function () {
                var dStr = $(this).attr("date");
                var d = new Date.parseExact($(this).attr("date"), "yyyyMMdd");
                console.log("click on date: " + d);

                targetDOM.attr("date", dStr);

                if ($(this).hasClass("cal-d-gray")) {
                    cal.miniMonth.refresh(targetDOM, d);
                } else if (!$(this).hasClass("cal-d-current")) {
                    targetDOM.find(".cal-d-current").removeClass("cal-d-current");
                    $(this).addClass("cal-d-current");
                }
            })
            return this;
        },
        calMonth: function () {
            var targetDOM = this;

            cal.month.refresh(cal.currentDate, targetDOM);

            return this;
        },
        calWeek: function () {
            var targetDOM = this;
            var obj_hor_lines = this.find(".cal-horizontal-lines > .table").empty();

            for (var i = 0; i < 24; i++) {
                obj_hor_lines.append($('<div class="table-row"><div class="cal-time"><span class="cal-time-label">' + i + '</span></div><div class="cal-hour-sep"></div></div>'));
            }

            cal.week.refresh(cal.currentDate, targetDOM);
            return this;
        },
        calDay: function () {
            $(".cal-mini").cal();

            var obj_hor_lines = $(".cal-horizontal-lines > .table").empty();
            for (var i = 0; i < 24; i++) {
                obj_hor_lines.append($('<div class="table-row"><div class="cal-time"><span class="cal-time-label">' + i + '</span></div><div class="cal-hour-sep"></div></div>'));
            }
            $(".cal-mini").on("click", ".cal-d", function () {
                var dStr = $(this).attr("date");
                cal.day.refresh(dStr);
            });

            cal.day.refresh(cal.currentDate);
            return this;
        },
        refreshCal: function (date) {
            cal.miniMonth.refresh(this, date);
            return this;
        },
    })
}


