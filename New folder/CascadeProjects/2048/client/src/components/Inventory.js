import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useOffline } from '../context/OfflineContext';

const Inventory = () => {
  const navigate = useNavigate();
  const { offlineData, syncData } = useOffline();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editQuantity, setEditQuantity] = useState(0);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/inventory');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setEditQuantity(product.stock);
    setEditDialog(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        // Save to offline storage first
        await syncData('inventory', { type: 'delete', productId });

        // Try to sync with server
        const response = await fetch(`/api/inventory/${productId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setProducts(products.filter(p => p._id !== productId));
        }
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const updateStock = async () => {
    if (!selectedProduct) return;

    try {
      const updatedProduct = { ...selectedProduct, stock: editQuantity };
      
      // Save to offline storage first
      await syncData('inventory', { type: 'update', product: updatedProduct });

      // Try to sync with server
      const response = await fetch(`/api/inventory/${selectedProduct._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct)
      });

      if (response.ok) {
        setProducts(products.map(p => 
          p._id === selectedProduct._id ? updatedProduct : p
        ));
        setEditDialog(false);
        setSelectedProduct(null);
      }
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/products/new')}
          sx={{ mb: 2 }}
        >
          Add Product
        </Button>
      </Box>

      <Grid container spacing={2}>
        {/* Search */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Search Products"
            value={searchTerm}
            onChange={handleSearch}
            variant="outlined"
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1 }} />
            }}
            sx={{ mb: 2 }}
          />
        </Grid>

        {/* Inventory Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Inventory Management
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product Name</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Stock</TableCell>
                    <TableCell align="right">Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products
                    .filter(product => 
                      product.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((product) => (
                      <TableRow key={product._id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell align="right">${product.price}</TableCell>
                        <TableCell align="right">{product.stock}</TableCell>
                        <TableCell align="right">
                          {product.stock <= lowStockThreshold ? (
                            <Alert severity="warning" sx={{ width: 'fit-content' }}>
                              Low Stock
                            </Alert>
                          ) : (
                            <Alert severity="success" sx={{ width: 'fit-content' }}>
                              In Stock
                            </Alert>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton onClick={() => handleEdit(product)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(product._id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Stock Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)}>
        <DialogTitle>Edit Stock</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {selectedProduct?.name}
            </Typography>
            <TextField
              fullWidth
              label="Current Stock"
              type="number"
              value={editQuantity}
              onChange={(e) => setEditQuantity(Number(e.target.value))}
              variant="outlined"
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button
            onClick={updateStock}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Inventory;
