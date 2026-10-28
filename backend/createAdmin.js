
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const db = require("./database");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question("Enter admin name: ", (name) => {
    rl.question("Enter admin email: ", async (email) => {
        rl.question("Enter admin ID: ", async (studentId) => {
            rl.question("Create admin password: ", async (password) => {
                try {
                    name = name.trim();
                    email = email.trim().toLowerCase();
                    studentId = studentId.trim();

                    if (!name || !email || !studentId || !password) {
                        console.log("All fields are required.");
                        return;
                    }

                    if (password.length < 6) {
                        console.log("Password must contain at least 6 characters.");
                        return;
                    }

                    const existing = db.prepare(
                        "SELECT id FROM users WHERE email = ? OR student_id = ?"
                    ).get(email, studentId);

                    if (existing) {
                        console.log("An account with this email or Student ID already exists.");
                        return;
                    }

                    const passwordHash = await bcrypt.hash(password, 10);

                    db.prepare(`
            INSERT INTO users
              (id, name, email, student_id, password_hash, role)
            VALUES (?, ?, ?, ?, ?, 'admin')
          `).run(
                        crypto.randomUUID(),
                        name,
                        email,
                        studentId,
                        passwordHash
                    );

                    console.log("Admin account created successfully!");
                } catch (error) {
                    console.error("Could not create admin:", error.message);
                } finally {
                    rl.close();
                    db.close();
                }
            });
        });
    });
});
