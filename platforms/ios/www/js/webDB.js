var db;
var dbobj = {
    init: function () {
        db = openDatabase('mydb', '1.0', 'Test DB', 2 * 1024 * 1024);

        db.transaction(function (tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS claim (claimNo unique,claim_status,policyNo,policy_product,policy_channel,applicant,applicant_tel,currency,effective_date,maturity_date,insured_name,insured_crt_type,insured_crtNo,insured_birthday,insured_email,insured_tel_mobile,insured_tel_company,insured_tel_home,insured_address,insured_car_type,insured_car_license_plate,insured_car_engine,insured_car_manufacturing_date,insured_car_certificate_date,insured_car_series,insured_car_color,insured_car_displacement,insured_car_km,claim_department,claim_reason,claim_perilNo,accident_time,report_time,reported_time,register_time,accident_location_type,accident_highway,accident_highway_direction,accident_highway_km,accident_city,accident_township,accident_road,accident_description,reporter,report_method,accepter_name,claimant_name,claimant_crt_type,claimant_crtNo,claimant_identity,claimant_tel,driver_name,driver_relationship,driver_difference,driver_crt_type,driver_crtNo,driver_identity,driver_birthday,driver_occupation,driver_gander,driver_marital_status,responsibility_code,responsibility_proportion_self,responsibility_proportion_counterpart,responsibility_proportion_other,police_handle,police_branch,police_tel,police_name,tow_company,tow_tel,tow_driver,casualty_name,casualty_tel,casualty_vehicle,casualty_hospital,casualty_description,damagedCar_license,damagedCar_driver,damagedCar_driver_tel,damagedCar_repair,damagedCar_description,settlement_target,settlement_damage_target,settlement_pay_type,settlement_payee,settlement_payee_ID,settlement_pay_method,settlement_currency,settlement_amount,settlement_moneyCode,settlement_branch,settlement_account,settlement_check_address,apprv_result,apprv_reason)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS task (claimNo unique, source, step, claimant, startDate, endDate)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS event (ACTIVITYDATE, STARTTIME, ENDTIME, PLACE, SUBSTANCE, STATEMENT)');
        });
    },
    reset: function () {
        db.transaction(function (tx) {
            tx.executeSql('DROP TABLE claim;');
            tx.executeSql('DROP TABLE task;');
        });
        dbobj.init();
    },
    insert: function (tb, info, callback) {
        //insert a record into the specific table
        var kArr = [],
            parameters = [],
            questionMarkArr = [];

        $.each(info, function (k, v) {
            kArr[kArr.length] = k;
            parameters[parameters.length] = v;
            questionMarkArr[questionMarkArr.length] = "?";
        });

        var queryStr = "INSERT INTO " + tb + " (" + kArr.join() + ") VALUES (" + questionMarkArr.join() + ")";
        console.log(queryStr);
        console.log(JSON.stringify(parameters));
        this.qry(queryStr, parameters, callback);
    },
    insertSamples: function (tb, infos, callback) {
        //you can find samples to insert into the db in js/msg.js
        //especially you can update events in calendar.html
        //advice you to invoke dbobj.reset() to delele all existing events before you update eventSamples
        $.each(infos, function () {
            dbobj.insert(tb, this);
        });
    },
    select: function(queryStr, parameters, callback) {
        this.qry(queryStr, parameters, function (results) {
            var res = [];
            for (var i = 0; i < results.rows.length; i++) {
                res[i] = results.rows.item(i);
            }

            if (typeof (callback) == "function") {
                try {
                    callback(res);
                } catch (err) {
                    console.log(err.message);
                }
            }
        });
    },
    update: function (tb, info, id, callback) {
        console.log("update info to " + tb);
        console.log(info);
        var strArr = [];

        $.each(info, function (k, v) {
            strArr[strArr.length] = k + " = '" + v + "'";
        });

        var queryStr = "UPDATE " + tb + " SET " + strArr.join() + " WHERE " + id.key + " = '" + id.value + "'";

        console.log(queryStr);
        this.qry(queryStr, [], callback);
    },
    qryStr: {
        selectTable: function (table) {
            return "SELECT * FROM " + table;
        },
        selectTask: function (startDate, endDate) {
            //return "SELECT * FROM task WHERE startDate > '" + startDate + "' AND startDate < '" + endDate + "' AND endDate > '" + startDate + "' AND endDate < '" + endDate + "' ORDER BY startDate, endDate";
            return "SELECT * FROM task WHERE startDate < '" + endDate + "' AND endDate > '" + startDate + "' ORDER BY startDate, endDate";
        },
        selectClaimByID: "SELECT * FROM claim WHERE claimNo = ?"
    },
    qry: function (queryStr, parameters, callback) {
        db.transaction(function (tx) {
            tx.executeSql(queryStr, parameters, function (tx, results) {
                if (typeof (callback) == "function") {
                    try {
                        callback(results);
                    } catch (err) {
                        console.log(JSON.stringify(err));
                    }
                }
            }, function (r, e) { console.log(e.message); });
        });
    },
    qrytb: function (tb, callback) {
        dbobj.qry(dbobj.qryStr.selectTable(tb), [], function (results) {
            var res = [];
            for (var i = 0; i < results.rows.length; i++) {
                res[i] = results.rows.item(i);
            }

            if (typeof (callback) == "function") {
                try {
                    callback(res);
                } catch (err) {
                    console.log(JSON.stringify(err));
                }
            }
        });
    },
    qrytbByID: function (tb, id, callback) {
        dbobj.qry(dbobj.qryStr[tb].selectByID, [id], function (results) {
            var res = [];
            for (var i = 0; i < results.rows.length; i++) {
                res[i] = results.rows.item(i);
            }

            if (typeof (callback) == "function") {
                try {
                    callback(res);
                } catch (err) {
                    console.log(JSON.stringify(err));
                }
            }
        });
    }
}