import { useState } from "react";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Categories from "./components/Categories.jsx";
import Products from "./components/Products.jsx";
import Steps from "./components/Steps.jsx";
import CallToAction from "./components/CallToAction.jsx";
import Contact from "./components/Contact.jsx";
import MapSection from "./components/MapSection.jsx";
import Footer from "./components/Footer.jsx";
import WhatsAppFloat from "./components/WhatsAppFloat.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import Admin from "./admin/Admin.jsx";
import { useCart } from "./useCart.js";
import { useProducts } from "./data/useProducts.js";

function Site() {
  const { products, loading } = useProducts();
  const cart = useCart(products);
  const [cartOpen, setCartOpen] = useState(false);
  // filter: { type: "all" | "category" | "group", value: string }
  const [filter, setFilter] = useState({ type: "all", value: "All products" });

  const addToCart = (id) => {
    cart.add(id);
    setCartOpen(true);
  };
  const pickCategory = (c) => {
    setFilter(c === "All products" ? { type: "all", value: c } : { type: "category", value: c });
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Header cartCount={cart.count} onOpenCart={() => setCartOpen(true)} onGroup={(g) => setFilter({ type: "group", value: g })} />
      <main id="top">
        <Hero />
        <Categories filter={filter} onPick={pickCategory} />
        <Products products={products} loading={loading} filter={filter} onAdd={addToCart} />
        <Steps />
        <CallToAction />
        <Contact />
        <MapSection />
      </main>
      <Footer />
      <WhatsAppFloat />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} />
    </>
  );
}

export default function App() {
  const isAdmin = window.location.pathname.replace(/\/+$/, "") === "/admin";
  return isAdmin ? <Admin /> : <Site />;
}
