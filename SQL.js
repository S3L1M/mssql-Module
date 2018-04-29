/*
 *
 * Connecting to MSSQL database
 *
 */

const 
  sql = require("mssql"),
  request = require('request'),
  send = require('./app');


var dbConfig = {
    server: process.env.SQL_STATIC_IP,
    database: "FaceBook",
    user: "sa",
    password: process.env.SQL_PASSWORD,
    port: process.env.SQL_PORT
};

function connSQL(q_ry, senderID) {
    var conn = new sql.ConnectionPool(dbConfig);
    conn.connect().then(()=> {
        var req = new sql.Request(conn);
        console.log(">>> Connected successfully <<<");
        req.query(q_ry).then((recordst)=> {
            if (senderID) {
                var x = recordst.recordset[0];
                obj = JSON.parse(x['JSON_F52E2B61-18A1-11d1-B105-00805F49916B']);
                console.log(obj);
                if(obj)     send.Question(senderID, obj.QID, obj.QNo, obj.Question);
            } else {
                console.log("Inserted successfully 👌")
            }
            conn.close();
        }).catch((err)=> {
            console.log(err);
            send.Text(senderID, "Thanks for Answering this Questionnaire ;)");  
            conn.close();});
    }).catch((err)=> console.log(err));    
}

module.exports = {
    sendInfo: function(senderID, name, gender, locale, zone) {
        connSQL(`INSERT INTO QHeader (senderID, UserName, Gender, Locale, TimeZone) VALUES ('${senderID}',(N'${name}'),'${gender}','${locale}','${zone}'));
    },sendAnswer: function(Aid, QID, QNo, Adata) {
        connSQL(`INSERT INTO QAnswer (senderID,QID,QNo,Answer) VALUES ('${Aid}','${QID}','${QNo}',(N'${Adata}'))`);
    },startQuestionnaire: function(senderID, QID) {
        connSQL(`SELECT Question,QNo,QID FROM Ques_Test WHERE QNo=1 AND QID='${QID}' AND Activated=1 FOR JSON PATH, WITHOUT_ARRAY_WRAPPER`,senderID);
    },sendNext: function(senderID, QID, QNo) {
        connSQL(`SELECT Question,QNo,QID FROM Ques_Test WHERE QNo=${QNo} AND QID='${QID}' AND Activated=1 FOR JSON PATH, WITHOUT_ARRAY_WRAPPER`, senderID);
    }
}
