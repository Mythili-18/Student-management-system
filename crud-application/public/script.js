
const form = document.getElementById("studentForm");
const table = document.getElementById("studentTable");
const message = document.getElementById("message");
const tableMessage = document.getElementById("tableMessage");

let students = [];
let editingId = null;

const pages = {
    dashboard: document.getElementById("dashboardPage"),
    students: document.getElementById("studentsPage"),
    add: document.getElementById("addPage")
};

function showPage(page) {
    Object.entries(pages).forEach(([name, element]) => {
        element.classList.toggle("hidden", name !== page);
    });

    document.querySelectorAll("[data-page]").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.page === page &&
            button.classList.contains("nav-btn")
        );
    });

    if (page === "students") renderStudents();
    if (page === "dashboard") updateDashboard();
}

document.querySelectorAll("[data-page]").forEach(button => {
    button.addEventListener("click", () => {
        showPage(button.dataset.page);
    });
});

async function loadStudents() {
    try {
        const response = await fetch("/api/students");

        if (!response.ok) {
            throw new Error("Unable to load student records.");
        }

        const data = await response.json();
        students = Array.isArray(data) ? data : data.students || [];

        renderStudents();
        updateDashboard();
    } catch (error) {
        table.innerHTML = `
            <tr>
                <td colspan="5">Unable to load records. Check your server.</td>
            </tr>`;
        tableMessage.textContent = error.message;
    }
}

function updateDashboard() {
    document.getElementById("totalStudents").textContent = students.length;

    const active = students.filter(student =>
        student.status
            ? student.status.toLowerCase() === "active"
            : true
    ).length;

    document.getElementById("activeStudents").textContent = active;
    document.getElementById("inactiveStudents").textContent =
        students.length - active;

    const departments = new Set(
        students.map(student => student.department).filter(Boolean)
    );

    document.getElementById("totalDepartments").textContent =
        departments.size;

    document.getElementById("registeredCount").textContent =
        `${students.length} Students Registered`;
}

function renderStudents() {
    const search = document.getElementById("searchInput").value
        .trim()
        .toLowerCase();

    const filtered = students.filter(student =>
        [student.name, student.email, student.department, student.phone]
            .some(value => String(value || "").toLowerCase().includes(search))
    );

    if (filtered.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="5">No student records found.</td>
            </tr>`;
        return;
    }

    table.innerHTML = filtered.map(student => `
        <tr>
            <td>${escapeHTML(student.name)}</td>
            <td>${escapeHTML(student.email)}</td>
            <td>${escapeHTML(student.department)}</td>
            <td>${escapeHTML(student.phone)}</td>
            <td>
                <button class="edit-btn"
                    data-edit="${escapeHTML(student._id)}">Edit</button>
                <button class="delete-btn"
                    data-delete="${escapeHTML(student._id)}">Delete</button>
            </td>
        </tr>
    `).join("");
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

document.getElementById("searchInput").addEventListener("input", renderStudents);

form.addEventListener("submit", async event => {
    event.preventDefault();

    const student = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        department: document.getElementById("department").value.trim(),
        phone: document.getElementById("phone").value.trim()
    };

    const url = editingId
        ? `/api/students/${encodeURIComponent(editingId)}`
        : "/api/students";

    try {
        const response = await fetch(url, {
            method: editingId ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(student)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to save student.");
        }

        message.textContent = editingId
            ? "Student updated successfully!"
            : "Student added successfully!";

        form.reset();
        editingId = null;
        document.getElementById("formTitle").textContent = "Add New Student";
        document.getElementById("submitBtn").textContent = "Add Student";
        document.getElementById("cancelEdit").classList.add("hidden");

        await loadStudents();
        showPage("students");
        message.textContent = "";
        tableMessage.textContent = "Student saved successfully!";
    } catch (error) {
        message.textContent = error.message;
    }
});

table.addEventListener("click", async event => {
    const editButton = event.target.closest("[data-edit]");
    const deleteButton = event.target.closest("[data-delete]");

    if (editButton) {
        const student = students.find(item =>
            item._id === editButton.dataset.edit
        );

        if (!student) return;

        editingId = student._id;
        document.getElementById("name").value = student.name || "";
        document.getElementById("email").value = student.email || "";
        document.getElementById("department").value = student.department || "";
        document.getElementById("phone").value = student.phone || "";

        document.getElementById("formTitle").textContent = "Edit Student";
        document.getElementById("submitBtn").textContent = "Update Student";
        document.getElementById("cancelEdit").classList.remove("hidden");

        showPage("add");
    }

    if (deleteButton) {
        const id = deleteButton.dataset.delete;

        if (!confirm("Are you sure you want to delete this student?")) return;

        try {
            const response = await fetch(
                `/api/students/${encodeURIComponent(id)}`,
                { method: "DELETE" }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Unable to delete student.");
            }

            tableMessage.textContent = "Student deleted successfully!";
            await loadStudents();
        } catch (error) {
            tableMessage.textContent = error.message;
        }
    }
});

document.getElementById("cancelEdit").addEventListener("click", () => {
    editingId = null;
    form.reset();
    message.textContent = "";
    document.getElementById("formTitle").textContent = "Add New Student";
    document.getElementById("submitBtn").textContent = "Add Student";
    document.getElementById("cancelEdit").classList.add("hidden");
    showPage("students");
});

loadStudents();
