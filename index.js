import express from "express";
import bodyParser from "body-parser";
import pg from "pg";


const app = express();
const port = 3000;

app.set('view engine', 'ejs');

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "work",
    password: "postgre96",
    port: 5432,
});

db.connect();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

async function checkVisisted() {
    const result = await db.query("SELECT * FROM transazione");
    var countries = [];
    result.rows.forEach((tran) => {
      countries.push(tran);
    });
    return countries;
  }

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get("/aggiungi", (req, res) => {
    res.render("nuovo.ejs");
});

app.get("/aggiorna", async (req, res) => {
    res.render("aggiorna.ejs");
});

app.get("/elimina", async(req, res) => {
    res.render("elimina.ejs");
});

app.post("/elimina", async(req, res) => {
    const idMod = req.body.id;
    try {
        const result = await db.query("DELETE from transazione WHERE id = $1", [idMod]);
        if (result.rowCount === 0) {
            res.send("***** L'ID specificato non esiste nel database *****");
        } else {
            res.render("index.ejs");
        }
    } catch(err) {
        res.send("Errore durante il recupero dei dati");
    }
});

app.post("/aggiorna", async (req, res) => {
    if (req.body.fav_language === "Aggiorna importo") {
        res.render("aggiornaImporto.ejs");
    } else {
        res.render("aggiornaData.ejs");
    }
});

app.post("/importo", async (req, res) => {
    const nuovoImporto = req.body.importo;
    const idMod = req.body.id; 
    try {
        const result = await db.query("UPDATE transazione SET importo = $1 WHERE id = $2", [nuovoImporto, idMod]);
        if (result.rowCount === 0) {
            res.send("L'ID specificato non esiste nel database");
        } else {
            res.render("index.ejs");
        }   
    } catch(err) {
        res.send("Errore durante il recupero dei dati.");
    }
});

app.post("/data", async (req, res) => {
    const dataNuova = req.body.data;
    const idMod = req.body.id;
    try {
        const result = await db.query("UPDATE transazione SET data_transazione = $1 WHERE id = $2", [dataNuova, idMod]);
        if (result.rowCount === 0) {
            res.send("L'ID specificato non esiste nel database");
        } else {
            res.render("index.ejs");
        }
    } catch(err) {
        res.send("Errore durante il recupero dei dati.");
    }
});

app.get("/visualizza", async (req, res) => {
    try {
        const result = await db.query("SELECT id, importo, data_transazione, id_mese FROM transazione");
        
        if (result.rows.length > 0) {
            console.log(result.rows);
            res.render("visualizza.ejs", {data: result.rows});
        } else {
            res.redirect("/");
        }
    } catch(err) {
        res.status(500).render("errore.ejs", { error: "Errore durante il recupero dei dati." });
    }
});

app.post("/aggiungi", async (req, res) => {
    const importo = parseInt(req.body["aggiungi"]);
    const data = req.body["data_mese"];
    const mese = new Date(data).toLocaleString('default', { month: 'long' }); // Ottieni il nome del mese dalla data
    console.log(mese);
    console.log(data);
    //const data = new Date().toISOString();
    try {
        const result = await db.query("SELECT id FROM mese  WHERE LOWER(nome_mese) = LOWER($1)", [mese]);
        console.log(importo);
        console.log( result.rows[0].id);
        try {
            const id_mese = result.rows[0].id;    
            await db.query("INSERT INTO transazione (importo, data_transazione, id_mese) VALUES ($1, $2, $3)", [importo, data, id_mese]);
            res.render("index.ejs", {importo: importo, data: data, id_mese: id_mese});  
        } catch(err) {
            res.render("errore.ejs", {error: "Errore"});
        }
    } catch(err) {
        res.render("errore.ejs", {error: "Errore"});
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});