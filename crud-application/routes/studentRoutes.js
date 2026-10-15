
const express = require("express");
const Student = require("../models/Student");

const router = express.Router();

// READ: Get all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch students" });
  }
});

// CREATE: Add a student
router.post("/", async (req, res) => {
  try {
    const { name, email, department, phone } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof department !== "string" ||
      typeof phone !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !department.trim() ||
      !phone.trim()
    ) {
      return res.status(400).json({
        message: "Please provide all student details"
      });
    }

    const student = await Student.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      department: department.trim(),
      phone: phone.trim()
    });

    res.status(201).json(student);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Invalid student details" });
    }
    res.status(500).json({ message: "Failed to add student" });
  }
});

// UPDATE: Edit a student
router.put("/:id", async (req, res) => {
  try {
    const { name, email, department, phone } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof department !== "string" ||
      typeof phone !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !department.trim() ||
      !phone.trim()
    ) {
      return res.status(400).json({
        message: "Please provide all student details"
      });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        department: department.trim(),
        phone: phone.trim()
      },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid student ID" });
    }
    res.status(500).json({ message: "Failed to update student" });
  }
});

// DELETE: Remove a student
router.delete("/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid student ID" });
    }
    res.status(500).json({ message: "Failed to delete student" });
  }
});

module.exports = router;
