import mongoose from "mongoose";
import express from "express";
import Product from "../productModel.js";
import Cart from "../cartModel.js"; // Importamos el modelo de carrito

const router = express.Router();

router.post("/carts", async (req, res) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "El array de productos no puede estar vacío" });
    }

    const updatedProducts = [];

    for (const item of products) {
      console.log("📩 ID recibido:", item.id);

      if (!item.id || !mongoose.Types.ObjectId.isValid(item.id)) {
        return res.status(400).json({ error: `El ID ${item.id} no es válido` });
      }

      const productId = new mongoose.Types.ObjectId(item.id);
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ error: `Producto con ID ${item.id} no encontrado` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Stock insuficiente para el producto ${product.title}` });
      }

      // Restar la cantidad del stock
      product.stock -= item.quantity;
      await product.save();

      updatedProducts.push({ id: product._id, quantity: item.quantity });
    }

    // Guardar el carrito en la base de datos
    const newCart = new Cart({ products: updatedProducts });
    await newCart.save();

    res.status(201).json({ message: "Carrito creado con éxito", cart: newCart });

  } catch (error) {
    console.error("❌ Error al crear el carrito:", error);
    res.status(500).json({ error: "Error al crear el carrito", details: error.message });
  }
});

// GET - Obtener un carrito por su _id
router.get("/carts/:cid", async (req, res) => {
  try {
    const { cid } = req.params; // Obtener el ID desde los parámetros

    if (!mongoose.Types.ObjectId.isValid(cid)) {
      return res.status(400).json({ error: "ID de carrito no válido" });
    }

    const cart = await Cart.findById(cid).populate("products.product"); // Popular productos

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    res.json(cart);
  } catch (error) {
    console.error("❌ Error al obtener el carrito:", error);
    res.status(500).json({ error: "Error al obtener el carrito", details: error.message });
  }
});

// POST - Agregar un producto a un carrito
// POST - Agregar un producto a un carrito

router.post("/carts/:cid/product/:pid", async (req, res) => {
  try {
      const { cid, pid } = req.params;
      const { quantity } = req.body;

      if (!quantity || isNaN(quantity) || quantity <= 0) {
          return res.status(400).json({ message: "La cantidad debe ser un número válido mayor a 0" });
      }

      // Buscar el carrito
      const cart = await Cart.findById(cid);
      if (!cart) {
          return res.status(404).json({ message: "Carrito no encontrado" });
      }

      // Buscar si el producto ya está en el carrito
      const existingProductIndex = cart.products.findIndex(p => p.product && p.product.toString() === pid);

      if (existingProductIndex !== -1) {
          // Si el producto ya existe, sumamos la cantidad
          cart.products[existingProductIndex].quantity += quantity;
      } else {
          // Si no existe, lo agregamos correctamente
          cart.products.push({ product: pid, quantity });
      }

      // Guardar cambios
      await cart.save();

      // ✅ Transformar la estructura antes de responder
      const formattedCart = {
        _id: cart._id,
        products: cart.products
            .filter(p => p.product) // Filtrar objetos sin `product`
            .map(p => ({
                id: p.product.toString(), // Convertir solo si `product` existe
                quantity: p.quantity
            }))
    };

      res.json({ message: "Producto agregado al carrito", cart: formattedCart });

  } catch (error) {
      console.error("❌ Error al agregar producto al carrito:", error);
      res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Ruta para eliminar un producto específico de un carrito
router.delete("/carts/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await Cart.findById(cid);

    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    // Filtrar los productos eliminando el que coincida con `pid`
    cart.products = cart.products.filter(
      (item) => item.product && item.product.toString() !== pid
    );

    await cart.save();
    res.json({ message: "Producto eliminado del carrito", cart });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar producto del carrito", error: error.message });
  }
});

// Ruta para actualizar los productos de un carrito
router.put("/carts/:cid", async (req, res) => {
  try {
      const { cid } = req.params;
      const { products } = req.body; // Debe ser un array de productos

      // Validar que el body contiene un array de productos
      if (!Array.isArray(products)) {
          return res.status(400).json({ message: "El body debe contener un array de productos" });
      }

      // Buscar el carrito en la base de datos
      const cart = await Cart.findById(cid);
      if (!cart) {
          return res.status(404).json({ message: "Carrito no encontrado" });
      }

      // Reemplazar los productos del carrito con los nuevos
      cart.products = products;
      
      // Guardar los cambios en la base de datos
      await cart.save();

      res.json({ message: "Carrito actualizado correctamente", cart });
  } catch (error) {
      res.status(500).json({ message: "Error al actualizar el carrito", error: error.message });
  }
});

router.put("/carts/:cid/product/:pid", async (req, res) => {
  try {
      const { cid, pid } = req.params;
      const { quantity } = req.body;

      // Validar que quantity es un número positivo
      if (!quantity || typeof quantity !== "number" || quantity <= 0) {
          return res.status(400).json({ message: "La cantidad debe ser un número positivo" });
      }

      // Buscar el carrito en la base de datos
      const cart = await Cart.findById(cid);
      if (!cart) {
          return res.status(404).json({ message: "Carrito no encontrado" });
      }

      // Buscar el producto dentro del carrito
      const productIndex = cart.products.findIndex(p => p.id.toString() === pid);

      if (productIndex === -1) {
          return res.status(404).json({ message: "Producto no encontrado en el carrito" });
      }

      // Actualizar solo la cantidad
      cart.products[productIndex].quantity = quantity;

      // Guardar los cambios en la base de datos
      await cart.save();

      res.json({ message: "Cantidad actualizada correctamente", cart });
  } catch (error) {
      res.status(500).json({ message: "Error al actualizar la cantidad del producto", error: error.message });
  }
});


router.delete("/carts/:cid", async (req, res) => {
  try {
      const { cid } = req.params;

      // Buscar el carrito en la base de datos
      const cart = await Cart.findById(cid);
      if (!cart) {
          return res.status(404).json({ message: "Carrito no encontrado" });
      }

      // Vaciar la lista de productos del carrito
      cart.products = [];

      // Guardar los cambios en la base de datos
      await cart.save();

      res.json({ message: "Todos los productos han sido eliminados del carrito", cart });
  } catch (error) {
      res.status(500).json({ message: "Error al eliminar los productos del carrito", error: error.message });
  }
});


export default router;
