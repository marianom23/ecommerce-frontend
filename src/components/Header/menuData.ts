import { Menu } from "@/types/Menu";

// menuData: ids únicos y títulos capitalizados
export const menuData: Menu[] = [
  { id: 101, title: "Destacados", newTab: false, path: "/#destacados" },
  { id: 2, title: "Productos", newTab: false, path: "/productos" },
  { id: 4, title: "Switch", newTab: false, path: "/productos?consoleId=1" },
  { id: 5, title: "Switch 2", newTab: false, path: "/productos?consoleId=2" },
  { id: 6, title: "Consolas Retro", newTab: false, path: "/productos?categoryId=6&page=1&sort=0" },
  { id: 7, title: "Preguntas frecuentes", newTab: false, path: "/faq" },
  { id: 3, title: "Cómo Funciona", newTab: false, path: "/como-funciona" },
  // {
  //   id: 6, title: "Páginas", newTab: false, path: "/",
  //   submenu: [
  //     { id: 61, title: "Tienda con Barra Lateral", newTab: false, path: "/productos" },
  //     { id: 62, title: "Tienda sin Barra Lateral", newTab: false, path: "/shop-without-sidebar" },
  //     { id: 64, title: "Finalizar Compra", newTab: false, path: "/checkout" },
  //     { id: 65, title: "Carrito", newTab: false, path: "/cart" },
  //     { id: 66, title: "Lista de Deseos", newTab: false, path: "/wishlist" },
  //     { id: 67, title: "Iniciar Sesión", newTab: false, path: "/signin" },
  //     { id: 68, title: "Registrarse", newTab: false, path: "/signup" },
  //     { id: 69, title: "Mi Cuenta", newTab: false, path: "/mi-cuenta" },
  //     { id: 70, title: "Contacto", newTab: false, path: "/contact" },
  //     { id: 71, title: "Error", newTab: false, path: "/error" },
  //     { id: 72, title: "Correo Enviado", newTab: false, path: "/mail-success" },
  //   ],
  // },
  // {
  //   id: 7, title: "Blogs", newTab: false, path: "/",
  //   submenu: [
  //     { id: 73, title: "Blog Grid with sidebar", newTab: false, path: "/blogs/blog-grid-with-sidebar" },
  //     { id: 74, title: "Blog Grid", newTab: false, path: "/blogs/blog-grid" },
  //     { id: 75, title: "Blog details with sidebar", newTab: false, path: "/blogs/blog-details-with-sidebar" },
  //     { id: 76, title: "Blog details", newTab: false, path: "/blogs/blog-details" },
  //   ],
  // },
];

