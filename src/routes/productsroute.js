import express from "express";
import Product from "../productModel.js"; // Asegúrate de agregar la extensión ".js"

const router = express.Router();

router.get("/products", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    const result = await Product.paginate({}, options);

    // Renombrar "docs" a "payload"
    const response = {
      payload: result.docs, // Aquí renombramos "docs"
      totalDocs: result.totalDocs,
      limit: result.limit,
      totalPages: result.totalPages,
      page: result.page,
      pagingCounter: result.pagingCounter,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
    };

    res.json(response);
  } catch (error) {
    console.error("❌ Error en GET /products:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});


// POST - Agregar un nuevo producto a la base de datos
router.post("/products", async (req, res) => {
  try {
    const { title, description, code, price, stock } = req.body;

    // Validar que los campos requeridos no estén vacíos
    if (!title || !description || !code || !price || !stock) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // Crear el nuevo producto
    const newProduct = new Product({
      title,
      description,
      code,
      price,
      stock
    });

    // Guardar en la base de datos
    await newProduct.save();

    res.status(201).json({ message: "Producto agregado con éxito", product: newProduct });

  } catch (error) {
    console.error("❌ Error al agregar el producto:", error);
    res.status(500).json({ error: "Error al agregar el producto", details: error.message });
  }
});


// GET - Obtener un producto por su _id
router.get("/products/:pid", async (req, res) => {
  try {
    const { pid } = req.params; // Obtener el id de los parámetros
    const product = await Product.findById(pid); // Buscar el producto por _id

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(product); // Enviar el producto encontrado
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el producto" });
  }
});

// PUT - Actualizar un producto por su _id
router.put("/products/:pid", async (req, res) => {
  try {
    const { pid } = req.params; // Obtener el id de los parámetros
    const updates = req.body; // Obtener los datos a actualizar desde el body

    // Buscar y actualizar el producto
    const updatedProduct = await Product.findByIdAndUpdate(pid, updates, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({ message: "Producto actualizado", product: updatedProduct });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
});

// DELETE - Eliminar un producto por su _id
router.delete("/products/:pid", async (req, res) => {
  try {
    const { pid } = req.params; // Obtener el id de los parámetros

    // Buscar y eliminar el producto
    const deletedProduct = await Product.findByIdAndDelete(pid);

    if (!deletedProduct) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({ message: "Producto eliminado", product: deletedProduct });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
});



export default router;
