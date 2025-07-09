import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useOffline } from '../context/OfflineContext';

const Sales = () => {
  const navigate = useNavigate();
  const { offlineData, syncData } = useOffline();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [receiptDialog, setReceiptDialog] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item._id === product._id);
    if (existingItem) {
      setCart(cart.map(item => 
        item._id === product._id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item._id !== productId));
  };

  const updateQuantity = (productId, action) => {
    setCart(cart.map(item => 
      item._id === productId 
        ? { ...item, quantity: action === 'add' ? item.quantity + 1 : item.quantity - 1 }
        : item
    ));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const completeSale = async () => {
    if (cart.length === 0) return;

    setLoading(true);
    try {
      const saleData = {
        items: cart,
        total: calculateTotal(),
        paymentMethod,
        customerName,
        date: new Date()
      };

      // Save to offline storage first
      await syncData('sales', saleData);

      // Try to sync with server
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
      });

      if (response.ok) {
        setCart([]);
        setReceiptDialog(true);
      }
    } catch (error) {
      console.error('Error completing sale:', error);
      // Sale will still be saved locally
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = () => {
    // Implement receipt printing logic
    window.print();
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => navigate('/products/new')}
          sx={{ mb: 2 }}
        >
          Add Product
        </Button>
      </Box>

      <Grid container spacing={2}>
        {/* Product Search */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Search Products"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />
        </Grid>

        {/* Products List */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Available Products
            </Typography>
            <List>
              {products
                .filter(product => 
                  product.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((product) => (
                  <ListItem key={product._id}>
                    <ListItemText
                      primary={product.name}
                      secondary={`$${product.price} - Stock: ${product.stock}`}
                    />
                    <IconButton
                      edge="end"
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                    >
                      <AddIcon />
                    </IconButton>
                  </ListItem>
                ))}
            </List>
          </Paper>
        </Grid>

        {/* Cart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Cart
            </Typography>
            <List>
              {cart.map((item) => (
                <React.Fragment key={item._id}>
                  <ListItem>
                    <ListItemText
                      primary={item.name}
                      secondary={`$${item.price} × ${item.quantity}`}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        onClick={() => updateQuantity(item._id, 'add')}
                      >
                        <AddIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => updateQuantity(item._id, 'remove')}
                        disabled={item.quantity === 1}
                      >
                        <RemoveIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => removeFromCart(item._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>

            {cart.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                <TextField
                  select
                  fullWidth
                  label="Payment Method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  variant="outlined"
                  sx={{ mb: 2 }}
                >
                  <option value="cash">Cash</option>
                  <option value="mobile_money">Mobile Money</option>
                </TextField>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Total: ${calculateTotal().toFixed(2)}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={completeSale}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? <CircularProgress size={24} /> : 'Complete Sale'}
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Receipt Dialog */}
      <Dialog open={receiptDialog} onClose={() => setReceiptDialog(false)}>
        <DialogTitle>Receipt</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Customer: {customerName}</Typography>
            <Typography variant="h6">Payment Method: {paymentMethod}</Typography>
            <Typography variant="h6">Date: {new Date().toLocaleString()}</Typography>
            <List>
              {cart.map((item) => (
                <ListItem key={item._id}>
                  <ListItemText
                    primary={item.name}
                    secondary={`$${item.price} × ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`}
                  />
                </ListItem>
              ))}
            </List>
            <Typography variant="h5" sx={{ mt: 2 }}>
              Total: ${calculateTotal().toFixed(2)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={printReceipt} startIcon={<PrintIcon />}>
            Print
          </Button>
          <Button onClick={() => setReceiptDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sales;
