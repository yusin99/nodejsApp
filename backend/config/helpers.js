const Mysqli = require("mysqli");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

let conn = new Mysqli({
  host: "localhost",
  post: 3306,
  user: "root",
  passwd: "",
  db: "bateaupirate",
});

let db = conn.emit(false, "");

const secret = "1SBz93MsqTs7KgwARcB0I0ihpILIjk3w";

module.exports = {
  database: db,
  secret: secret,
  validJWTNeeded: (req, res, next) => {
    if (req.headers["authorization"]) {
      try {
        let authorization = req.headers["authorization"].split(" ");
        if (authorization[0] !== "Bearer") {
          return res.status(401).send();
        } else {
          req.jwt = jwt.verify(authorization[1], secret);
          return next();
        }
      } catch (err) {
        return res.status(403).send("Authentication failed");
      }
    } else {
      console.log(res);
      return res.status(401).send("No authorization header found.");
    }
  },
  hasAuthFields: (req, res, next) => {
    let errors = [];

    if (req.body) {
      if (!req.body.email) {
        errors.push("Missing email field");
      }
      if (!req.body.mdp && req.body.type !== "social") {
        errors.push("Missing password field");
      }

      if (errors.length) {
        return res.status(400).send({ errors: errors.join(",") });
      } else {
        return next();
      }
    } else {
      return res
        .status(400)
        .send({ errors: "Missing email and password fields" });
    }
  },
  isPasswordAndUserMatch: async (req, res, next) => {
    const myPlaintextPassword = req.body.mdp;
    const myEmail = req.body.email;

    const user = await db
      .table("clients")
      .filter({ $or: [{ email: myEmail }, { pseudo: myEmail }] }) // can login with username or password
      .get();

    if (user) {
      const match = await bcrypt.compare(myPlaintextPassword, user.mdp);
      console.log(myPlaintextPassword);
      console.log(user.mdp);
      console.log(match);
      if (match) {
        req.pseudo = user.pseudo;
        req.email = user.email;
        req.prenom = user.prenom;
        req.nom = user.nom;
        req.photoUrl = user.photoUrl;
        req.idClient = user.idClient;
        req.type = user.type;
        req.role = user.role;
        next();
      } else {
        res
          .status(401)
          .json({ message: "Username or password incorrecttt", status: false });
      }
    } else {
      res.status(401).json({
        message: "Username or password incorrectastdatstsatdt",
        status: false,
      });
    }
  },
};
