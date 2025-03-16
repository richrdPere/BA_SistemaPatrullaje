const admin = require("firebase-admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const authController = {
  // Register
  async registerUser(req, res) {
    //console.log(req.body);
    //res.status(200).send({msg: "ESTAS EN REGISTER..."});

    try {
      const { dni, firstName, lastName, email, password, role } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      // Validar datos
      if (!email) res.status(400).send({ msg: "El Email es obligatorio!" });
      if (!password)
        res.status(400).send({ msg: "El Password es obligatorio!" });

      // Crear documento User para DB
      const userRecord = await admin.auth().createUser({
        email,
        password,
      });

      await admin.firestore().collection("users").doc(userRecord.uid).set({
        dni,
        firstName,
        lastName,
        email: email.toLowerCase(),
        role,
        active: false,
        uid: userRecord.uid,
        password: hashedPassword,
      });

      res.status(201).json({
        message: "Usuario registrado exitosamente",
        uid: userRecord.uid,
      });
    } catch (error) {
      console.error("Error al guardar el usuario:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Login
  async loginUser(req, res) {

    // console.log(req.body);
    // res.status(200).send({msg: "ESTAS EN LOGIN..."});

    try {
      const { email, password } = req.body;

      // Reescribiendo email
      email = email.toLowerCase();

      console.log(email);
      console.log(password);

      // Encontrar usuario
      const userSnapshot = await admin
        .firestore()
        .collection("users")
        .where("email", "==", email)
        .get();

      // Validar al usuario encontrado
      if (userSnapshot.empty) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      // Validar email y password
      if (!email) res.status(400).send({ msg: "El email es obligatorio!" });
      if (!password)
        res.status(400).send({ msg: "El password es obligatorio!" });

      
      const userData = userSnapshot.docs[0].data();
      const isMatch = await bcrypt.compare(password, userData.password);

      if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign(
        { uid: userData.uid, role: userData.role },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      res.json({
        token,
        user: { uid: userData.uid, email: userData.email, role: userData.role },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async verifyToken(req, res) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.json({ valid: true, decoded });
    } catch (error) {
      res.status(401).json({ valid: false, error: "Invalid token" });
    }
  },
};

module.exports = authController;
