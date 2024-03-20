const express = require("express");
const { engine } = require("express-handlebars");
const app = express();
const fileUpload = require("express-fileupload");
const mysql = require("mysql");

const PORT = 3000;

app.use(fileUpload());

app.use(express.static("upload"));

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

// connection pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "Seinosuke914",
  database: "image-uploader-yt",
});

app.get("/", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;

    console.log("mysqlと接続中…");

    // データ取得
    connection.query("SELECT * FROM image", (err, rows) => {
      connection.release();
      if (!err) {
        res.render("home", { rows });
      }
    });
  });
});

app.post("/", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    if (!req.files) {
      return res.status(400).send("何も画像がアップロードされていません");
    }

    let imageFile = req.files.imageFile;
    let uploadPath = __dirname + "/upload/" + imageFile.name;

    //サーバーに画像ファイルを置く場所の指定
    imageFile.mv(uploadPath, function (err) {
      if (err) return res.status(500).send(err);
      //   res.send("画像アップロードに成功しました");
    });

    //mysqlに画像ファイルを追加して保存
    connection.query(
      `INSERT INTO image values ("", "${imageFile.name}")`,
      (err, rows) => {
        connection.release();
        if (!err) {
          res.redirect("/");
        } else {
          console.log(err);
        }
      }
    );
  });
});

app.listen(PORT, () => console.log("hello node.js"));
