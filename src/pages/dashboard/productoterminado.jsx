import {
  Card,
  CardBody,
  Typography,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  IconButton,
  Select,
  Option,
} from "@material-tailwind/react";
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import axios from "../../utils/axiosConfig";
import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

export function ProductoTerminado() {
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [open, setOpen] = useState(false);
  const [productionOpen, setProductionOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
  });
  const [productionDetails, setProductionDetails] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productosPerPage] = useState(3);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/productos");
      setProductos(response.data);
      setFilteredProductos(response.data);
    } catch (error) {
      console.error("Error fetching productos:", error);
    }
  };

  useEffect(() => {
    filterProductos();
  }, [search, productos]);

  const filterProductos = () => {
    const filtered = productos.filter((producto) =>
      producto.nombre.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredProductos(filtered);
  };

  const handleOpen = () => setOpen(!open);
  const handleProductionOpen = () => setProductionOpen(!productionOpen);
  const handleDetailsOpen = () => setDetailsOpen(!detailsOpen);

  const handleEdit = (producto) => {
    setSelectedProducto(producto);
    setEditMode(true);
    handleOpen();
  };

  const handleCreate = () => {
    setSelectedProducto({
      nombre: "",
      descripcion: "",
      precio: "",
    });
    setEditMode(false);
    handleOpen();
  };

  const handleProductionCreate = () => {
    setProductionDetails([{ id_producto: "", cantidad: "" }]);
    handleProductionOpen();
  };

  const handleDelete = async (producto) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro de que deseas eliminar el producto ${producto.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/api/productos/${producto.id_producto}`);
        fetchProductos(); // Refrescar la lista de productos
        Toast.fire({
          icon: 'success',
          title: 'El producto ha sido eliminado correctamente.'
        });
      } catch (error) {
        console.error("Error deleting producto:", error);
        Toast.fire({
          icon: 'error',
          title: 'Hubo un problema al eliminar el producto.'
        });
      }
    }
  };

  const handleSave = async () => {
    const productoToSave = {
      ...selectedProducto,
    };

    try {
      if (editMode) {
        await axios.put(`http://localhost:3000/api/productos/${selectedProducto.id_producto}`, productoToSave);
        Toast.fire({
          icon: 'success',
          title: 'El producto ha sido actualizado correctamente.'
        });
      } else {
        await axios.post("http://localhost:3000/api/productos", productoToSave);
        Toast.fire({
          icon: 'success',
          title: 'El producto ha sido creado correctamente.'
        });
      }
      fetchProductos(); // Refrescar la lista de productos
      handleOpen();
    } catch (error) {
      console.error("Error saving producto:", error);
      Toast.fire({
        icon: 'error',
        title: 'Hubo un problema al guardar el producto.'
      });
    }
  };

  const handleProductionSave = async () => {
    try {
      const productionDetailsNumerics = productionDetails.map(detalle => ({
        ...detalle,
        cantidad: Number(detalle.cantidad)
      }));
      await axios.post("http://localhost:3000/api/productos/producir", { productosProduccion: productionDetailsNumerics });
      Toast.fire({
        icon: 'success',
        title: 'La producción ha sido realizada correctamente.'
      });
      fetchProductos(); // Refrescar la lista de productos
      handleProductionOpen();
    } catch (error) {
      console.error("Error saving producción:", error);
      Toast.fire({
        icon: 'error',
        title: 'Hubo un problema al realizar la producción.'
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedProducto({ ...selectedProducto, [name]: value });
  };

  const handleProductionChange = (index, e) => {
    const { name, value } = e.target;
    const detalles = [...productionDetails];
    detalles[index][name] = name === 'cantidad' ? Number(value) : value;
    setProductionDetails(detalles);
  };

  const handleAddProductionDetalle = () => {
    setProductionDetails([...productionDetails, { id_producto: "", cantidad: "" }]);
  };

  const handleRemoveProductionDetalle = (index) => {
    const detalles = [...productionDetails];
    detalles.splice(index, 1);
    setProductionDetails(detalles);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleViewDetails = (producto) => {
    setSelectedProducto(producto);
    handleDetailsOpen();
  };

  const indexOfLastProducto = currentPage * productosPerPage;
  const indexOfFirstProducto = indexOfLastProducto - productosPerPage;
  const currentProductos = filteredProductos.slice(indexOfFirstProducto, indexOfLastProducto);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredProductos.length / productosPerPage); i++) {
    pageNumbers.push(i);
  }

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <div className="relative mt-2 h-32 w-full overflow-hidden rounded-xl bg-[url('/img/background-image.png')] bg-cover bg-center">
        <div className="absolute inset-0 h-full w-full bg-gray-900/75" />
      </div>
      <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border border-blue-gray-100">
        <CardBody className="p-4">
          <Button onClick={handleCreate} className="btnagregar" size="sm" startIcon={<PlusIcon />}>
            Crear Producto Terminado
          </Button>
          <Button onClick={handleProductionCreate} className="btnagregar" size="sm" startIcon={<PlusIcon />}>
            Producción
          </Button>
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <div className="mb-12">
            <Typography variant="h6" color="blue-gray" className="mb-4">
              Productos terminados
            </Typography>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th scope="col" className="px-10 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Editar</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentProductos.map((producto) => (
                    <tr key={producto.id_producto}>
                      <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{producto.nombre}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">{producto.descripcion}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">{producto.precio}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">{producto.stock}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-1">
                        <IconButton className="btnedit" size="sm" color="blue" onClick={() => handleEdit(producto)}>
                          <PencilIcon className="h-4 w-4" />
                        </IconButton>
                        <IconButton className="cancelar" size="sm" color="red" onClick={() => handleDelete(producto)}>
                          <TrashIcon className="h-4 w-4" />
                        </IconButton>
                        <IconButton className="btnvisualizar" size="sm" onClick={() => handleViewDetails(producto)}>
                          <EyeIcon className="h-4 w-4" />
                        </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <ul className="flex justify-center items-center space-x-2">
                {pageNumbers.map((number) => (
                  <Button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`pagination ${number === currentPage ? 'active' : ''}`}               
                  size="sm"
                >
                  {number}
                </Button>
                ))}
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>
      
      {/* Dialog for Create/Edit Producto */}
      <Dialog open={open} handler={handleOpen} size="lg">
        <DialogHeader>{editMode ? "Editar Producto Terminado" : "Crear Producto Terminado"}</DialogHeader>
        <DialogBody>
          <div className="grid grid-cols-1 gap-4 mb-4">
            <Input
              name="nombre"
              label="Nombre"
              value={selectedProducto.nombre}
              onChange={handleChange}
            />
            <Input
              name="descripcion"
              label="Descripción"
              value={selectedProducto.descripcion}
              onChange={handleChange}
            />
            <Input
              name="precio"
              label="Precio"
              type="number"
              value={selectedProducto.precio}
              onChange={handleChange}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={handleOpen} className="mr-1">
            <span>Cancelar</span>
          </Button>
          <Button variant="gradient" color="green" onClick={handleSave}>
            <span>Guardar</span>
          </Button>
        </DialogFooter>
      </Dialog>
      
      {/* Dialog for Production */}
      <Dialog open={productionOpen} handler={handleProductionOpen} size="lg">
        <DialogHeader>Crear Producción</DialogHeader>
        <DialogBody>
          {productionDetails.map((detalle, index) => (
            <div key={index} className="grid grid-cols-3 gap-4 mb-4">
              <Select
                label="Producto"
                name="id_producto"
                value={detalle.id_producto}
                onChange={(e) => handleProductionChange(index, e)}
              >
                {productos.map((producto) => (
                  <Option key={producto.id_producto} value={producto.id_producto}>
                    {producto.nombre}
                  </Option>
                ))}
              </Select>
              <Input
                name="cantidad"
                label="Cantidad"
                type="number"
                value={detalle.cantidad}
                onChange={(e) => handleProductionChange(index, e)}
              />
              <IconButton color="red" size="sm" onClick={() => handleRemoveProductionDetalle(index)}>
                <TrashIcon className="h-5 w-5" />
              </IconButton>
            </div>
          ))}
          <Button onClick={handleAddProductionDetalle} className="btnagregar" size="sm" startIcon={<PlusIcon />}>
            Añadir Detalle
          </Button>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={handleProductionOpen} className="mr-1">
            <span>Cancelar</span>
          </Button>
          <Button variant="gradient" color="green" onClick={handleProductionSave}>
            <span>Guardar</span>
          </Button>
        </DialogFooter>
      </Dialog>
      {/* Dialog for View Details */}
      <Dialog open={detailsOpen} handler={handleDetailsOpen} size="lg">
        <DialogHeader>Detalles del Producto</DialogHeader>
        <DialogBody>
          <div className="grid grid-cols-1 gap-4 mb-4">
            <Typography variant="h6">Nombre</Typography>
            <Typography>{selectedProducto.nombre}</Typography>
            <Typography variant="h6">Descripción</Typography>
            <Typography>{selectedProducto.descripcion}</Typography>
            <Typography variant="h6">Precio</Typography>
            <Typography>${selectedProducto.precio}</Typography>
            <Typography variant="h6">Stock</Typography>
            <Typography>{selectedProducto.stock}</Typography>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="blue-gray" onClick={handleDetailsOpen} className="mr-1">
            <span>Cerrar</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

export default ProductoTerminado;
