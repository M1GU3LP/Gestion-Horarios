const mongoose = require("mongoose");
const Docente = require("./Docente");

// Configuración de la base de datos de prueba
beforeAll(async () => {
  await mongoose.connect("mongodb://localhost:27017/horarios_test", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Limpiar la base de datos después de cada prueba
afterEach(async () => {
  await Docente.deleteMany();
});

// Cerrar la conexión después de todas las pruebas
afterAll(async () => {
  await mongoose.connection.close();
});

describe("Modelo Docente", () => {
  it("debería guardar y consultar un docente correctamente", async () => {
    const nuevoDocente = new Docente({
      nombre: "Juan Pérez",
      materias: ["Matemáticas", "Física"],
      disponibilidad: [1, 2, 3],
      dias: ["Lunes", "Martes"],
    });

    // Guardar el docente
    await nuevoDocente.save();

    // Consultar el docente
    const docenteGuardado = await Docente.findOne({ nombre: "Juan Pérez" });

    // Verificar los datos
    expect(docenteGuardado).toBeDefined();
    expect(docenteGuardado.nombre).toBe("Juan Pérez");
    expect(docenteGuardado.materias).toEqual(["Matemáticas", "Física"]);
    expect(docenteGuardado.disponibilidad).toEqual([1, 2, 3]);
    expect(docenteGuardado.dias).toEqual(["Lunes", "Martes"]);
  });
});